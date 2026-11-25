# Havuz sayfalarının (TR, FR, NL) Odoo sürümünü üretir: odoo/havuz-tr.xml, havuz-fr.xml, havuz-nl.xml
#
# Odoo'da her sayfa, website.layout kullanmayan bağımsız bir QWeb görünümüdür. Görseller ve video Odoo'daki
# herkese açık eklerden (/web/content/<id>/...) gelir. Sayaç önce Odoo'daki veri ekini okur; o ek 20 dakikadan
# eskiyse ya da okunamazsa GitHub'daki veri/havuz.json yedek olarak okunur.
#
# Türkçe sayfa ya da havuz-dil.py değişince: önce `python3 araclar/havuz-dil.py`, sonra bu betik çalıştırılır,
# depoya gönderilir ve Odoo'daki üç görünüm yeniden yüklenir (bkz. claude/1-Euro-Havuzu-durum.md).
#
# Not: Odoo QWeb sabit metni kaçışsız basar (&lt; → <). Bu yüzden XML'e çevirirken script ve style içerikleri
# XML kaçışlı yazılır, Odoo bunları olduğu gibi tarayıcıya verir.
import os, sys, json
import html5lib
from lxml import etree

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = "https://www.bxlfatih.com"
GH_MEDYA = "https://bdvfatihbruxelles.github.io/fatih-ekran/havuz/media/"
GH_VERI = "https://bdvfatihbruxelles.github.io/fatih-ekran/veri/havuz.json"

# Odoo'daki ekler (ir.attachment, herkese açık). Kimlikler 25.11.2026'da oluşturuldu.
EK = {
    "drone.mp4": 3419, "drone-ekran.mp4": 3420, "kusbakisi.jpg": 3421, "logo-white.png": 3422,
    "paylasim.jpg": 3423, "paylasim-fr.jpg": 3424, "paylasim-nl.jpg": 3425,
    "qr-10.png": 3426, "qr-20.png": 3427, "qr-50.png": 3428, "qr-100.png": 3429, "qr-1000.png": 3430,
    "qr-sayfa.png": 3418,
}
VERI_EK = 3431  # havuz-veri.json


def url(ad, mutlak=False):
    u = "/web/content/%d/havuz-%s" % (EK[ad], ad)
    return SITE + u if mutlak else u


SAYFALAR = [("index.html", "tr", "havuz"), ("fr.html", "fr", "cagnotte"), ("nl.html", "nl", "donatiepot")]

QR_TABLO = "{" + ", ".join('%s: "%s"' % (a, url("qr-%s.png" % a)) for a in (10, 20, 50, 100, 1000)) + "}"

VERI_AL = """
/* Odoo sürümü: sayaç önce bxlfatih.com'daki veri ekini okur; ek 20 dakikadan eskiyse ya da okunamazsa
   GitHub'daki kopya yedek olarak okunur. */
function veriAl(u) {
  return fetch(u, { cache: "no-store" }).then(function (r) { return r.json(); }).then(function (d) {
    var t = d && d.odooYazim ? Date.parse(d.odooYazim) : 0;
    if (t && Math.abs(Date.now() - t) < 20 * 60 * 1000) return d;
    throw new Error("eski");
  }).catch(function () {
    return fetch(CONFIG.apiYedek + "?t=" + Date.now(), { cache: "no-store" }).then(function (r) { return r.json(); });
  });
}
function startLive() {"""


def degistir(s, eski, yeni, adet=1):
    n = s.count(eski)
    if n != adet:
        sys.exit("beklenen %d, bulunan %d: %s" % (adet, n, eski[:70]))
    return s.replace(eski, yeni)


def uret(dosya, dil, yol):
    s = open(os.path.join(KOK, "havuz", dosya), encoding="utf-8").read()
    # medya
    for ad in EK:
        s = s.replace(GH_MEDYA + ad, url(ad, mutlak=True))
    s = degistir(s, 'src="media/drone.mp4"', 'src="%s"' % url("drone.mp4"))
    s = degistir(s, 'poster="media/kusbakisi.jpg"', 'poster="%s"' % url("kusbakisi.jpg"))
    s = degistir(s, 'src="media/logo-white.png"', 'src="%s"' % url("logo-white.png"))
    s = degistir(s, 'src="media/qr-sayfa.png"', 'src="%s"' % url("qr-sayfa.png"))
    s = degistir(s, 'src="media/qr-10.png"', 'src="%s"' % url("qr-10.png"))
    s = degistir(s, '"media/drone-ekran.mp4"', '"%s"' % url("drone-ekran.mp4"))
    s = degistir(s, 'img.src = "media/qr-" + a + ".png";', "img.src = QR_URL[a];")
    if "media/" in s.replace("/web/content/", ""):
        sys.exit("çevrilmemiş medya adresi kaldı: " + dosya)
    # dil düğmeleri
    # Dil düğmeleri tam adresle yazılır; Odoo göreli adreslerin başına site dilini (/fr, /nl) ekliyor.
    s = degistir(s, 'href="./"', 'href="%s/havuz"' % SITE)
    s = degistir(s, 'href="fr.html"', 'href="%s/cagnotte"' % SITE)
    s = degistir(s, 'href="nl.html"', 'href="%s/donatiepot"' % SITE)
    # veri
    s = degistir(s, 'api: "../veri/havuz.json",', 'api: "/web/content/%d/havuz-veri.json",\n  apiYedek: "%s",' % (VERI_EK, GH_VERI))
    # Odoo, ziyaretçinin site dilini adresin başına ekleyip yönlendiriyor (/donatiepot → /fr/donatiepot).
    # Sayfa açılınca adres çubuğu kendi temiz adresine döndürülür (QR'lardaki, videolardaki adres).
    temiz = ('(function () { try { var p = "/%s"; if (location.pathname !== p) '
             'history.replaceState(null, "", p + location.search + location.hash); } catch (e) {} })();\n') % yol
    s = degistir(s, "<script>\n", "<script>\n%svar QR_URL = %s;\n" % (temiz, QR_TABLO))
    s = degistir(s, 'fetch(u, { cache: "no-store" }).then(function (r) { return r.json(); }).then(function (d) {',
                 "veriAl(u).then(function (d) {")
    s = degistir(s, "\nfunction startLive() {", VERI_AL)
    if "github.io" in s.replace(GH_VERI, ""):
        sys.exit("GitHub adresi kaldı: " + dosya)

    # HTML → iyi biçimli XML (QWeb)
    kok = html5lib.parse(s, treebuilder="lxml", namespaceHTMLElements=False)
    html = kok.getroot()
    govde = etree.tostring(html, encoding="unicode", method="xml")
    if "<t " in govde or "<t>" in govde or ' t-' in govde:
        sys.exit("QWeb ile çakışan öğe ya da öznitelik var: " + dosya)
    xml = '<t t-name="website.havuz_odoo_%s">&lt;!DOCTYPE html&gt;\n%s</t>\n' % (dil, govde)
    etree.fromstring(xml.encode("utf-8"))  # iyi biçimli mi
    os.makedirs(os.path.join(KOK, "odoo"), exist_ok=True)
    hedef = os.path.join(KOK, "odoo", "havuz-%s.xml" % dil)
    open(hedef, "w", encoding="utf-8").write(xml)
    print("yazıldı:", os.path.relpath(hedef, KOK), len(xml), "karakter")


for dosya, dil, yol in SAYFALAR:
    uret(dosya, dil, yol)
json.dump({"ekler": EK, "veri": VERI_EK}, open(os.path.join(KOK, "odoo", "ekler.json"), "w"), indent=1)
