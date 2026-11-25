#!/usr/bin/env python3
"""Bağış havuzu sayfasının Fransızca ve Flemenkçe sürümlerini üretir.

Kaynak: havuz/index.html (Türkçe). Çıktı: havuz/fr.html ve havuz/nl.html.
Sayfada bir şey değiştiğinde önce index.html düzenlenir, sonra bu betik çalıştırılır:
    python3 araclar/havuz-dil.py
Her Türkçe parça kaynakta beklenen sayıda bulunmazsa betik durur; böylece çevrilmeden kalan metin yayına çıkmaz.
Sayı biçimi, yüzde, "… önce" gibi betik içi metinler index.html'deki TXT tablosundadır.
"""
from pathlib import Path

KOK = Path(__file__).resolve().parent.parent
KAYNAK = KOK / "havuz" / "index.html"

# (Türkçe, Fransızca, Flemenkçe, beklenen adet)
PARCALAR = [
    # --- baş ---
    ('<html lang="tr">', '<html lang="fr">', '<html lang="nl">', 1),
    ('<title>5 Ek Bina Bağış Havuzu · Brüksel Fatih Camii</title>',
     '<title>Cagnotte du projet 5 bâtiments · Mosquée Fatih de Bruxelles</title>',
     '<title>Donatiepot project 5 gebouwen · Fatih Moskee Brussel</title>', 1),
    ('<link rel="canonical" href="https://www.bxlfatih.com/havuz">',
     '<link rel="canonical" href="https://www.bxlfatih.com/cagnotte">',
     '<link rel="canonical" href="https://www.bxlfatih.com/donatiepot">', 1),
    ('<meta name="description" content="Brüksel Fatih Camii 5 Ek Bina kampanyası. Sen de at, havuz dolsun. Toplam herkesin gözü önünde birikiyor.">',
     '<meta name="description" content="Projet 5 bâtiments de la Mosquée Fatih de Bruxelles. Versez votre part, remplissons la cagnotte. Le total grandit sous les yeux de tous.">',
     '<meta name="description" content="Project 5 gebouwen van de Fatih Moskee Brussel. Doe ook mee, samen vullen we de pot. Het totaal groeit zichtbaar voor iedereen.">', 1),
    ('<meta property="og:title" content="5 Ek Bina Bağış Havuzu · Brüksel Fatih Camii">',
     '<meta property="og:title" content="Cagnotte du projet 5 bâtiments · Mosquée Fatih de Bruxelles">',
     '<meta property="og:title" content="Donatiepot project 5 gebouwen · Fatih Moskee Brussel">', 1),
    ('<meta property="og:description" content="Sen de at, havuz dolsun. Tek başına küçük, hep birlikte beş bina.">',
     '<meta property="og:description" content="Versez votre part, remplissons la cagnotte. Seul, c\'est peu. Ensemble, ce sont cinq bâtiments.">',
     '<meta property="og:description" content="Doe ook mee, samen vullen we de pot. Alleen is het weinig, samen worden het vijf gebouwen.">', 1),
    ('<meta property="og:url" content="https://www.bxlfatih.com/havuz">',
     '<meta property="og:url" content="https://www.bxlfatih.com/cagnotte">',
     '<meta property="og:url" content="https://www.bxlfatih.com/donatiepot">', 1),
    ('<meta property="og:type" content="website">',
     '<meta property="og:type" content="website">\n<meta property="og:locale" content="fr_BE">',
     '<meta property="og:type" content="website">\n<meta property="og:locale" content="nl_BE">', 1),
    # --- dil seçici ---
    ('<a href="./" hreflang="tr" lang="tr" aria-current="page">TR</a><a href="fr.html" hreflang="fr" lang="fr">FR</a><a href="nl.html" hreflang="nl" lang="nl">NL</a>',
     '<a href="./" hreflang="tr" lang="tr">TR</a><a href="fr.html" hreflang="fr" lang="fr" aria-current="page">FR</a><a href="nl.html" hreflang="nl" lang="nl">NL</a>',
     '<a href="./" hreflang="tr" lang="tr">TR</a><a href="fr.html" hreflang="fr" lang="fr">FR</a><a href="nl.html" hreflang="nl" lang="nl" aria-current="page">NL</a>', 1),
    # --- üst şerit ---
    ('alt="Brüksel Fatih Camii logosu"', 'alt="Logo de la Mosquée Fatih de Bruxelles"', 'alt="Logo van de Fatih Moskee Brussel"', 1),
    ('<b>Brüksel Fatih Camii<span>5 Ek Bina Kampanyası</span></b>',
     '<b>Mosquée Fatih de Bruxelles<span>Projet 5 bâtiments</span></b>',
     '<b>Fatih Moskee Brussel<span>Project 5 gebouwen</span></b>', 1),
    ('<div class="days" aria-label="Kampanyanın bitmesine kalan gün"><b id="days">37</b> gün kaldı</div>',
     '<div class="days" aria-label="Jours restants avant la fin de la campagne"><b id="days">37</b> jours restants</div>',
     '<div class="days" aria-label="Dagen tot het einde van de campagne">nog <b id="days">37</b> dagen</div>', 1),
    # --- sahne ---
    ('<p class="eyebrow">5 Ek Bina Bağış Havuzu</p>', '<p class="eyebrow">Cagnotte du projet 5 bâtiments</p>', '<p class="eyebrow">Donatiepot project 5 gebouwen</p>', 1),
    ('<h1>Sen de at, <em>havuz dolsun.</em></h1>', '<h1>Versez votre part, <em>remplissons la cagnotte.</em></h1>', '<h1>Doe ook mee, <em>samen vullen we de pot.</em></h1>', 1),
    ('<p class="lead">Tek başına küçük, <b>hep birlikte beş bina.</b><span class="uzun"> Atılan her euro bu havuza düşüyor ve herkesin gözü önünde birikiyor.</span></p>',
     '<p class="lead">Seul, c\'est peu. <b>Ensemble, ce sont cinq bâtiments.</b><span class="uzun"> Chaque euro versé tombe dans cette cagnotte et grandit sous les yeux de tous.</span></p>',
     '<p class="lead">Alleen is het weinig, <b>samen worden het vijf gebouwen.</b><span class="uzun"> Elke gegeven euro valt in deze pot en groeit zichtbaar voor iedereen.</span></p>', 1),
    ('<span class="live"><i></i>Canlı</span>', '<span class="live"><i></i>En direct</span>', '<span class="live"><i></i>Live</span>', 1),
    ('<span class="cap">havuzda birikti</span>', '<span class="cap">dans la cagnotte</span>', '<span class="cap">in de pot</span>', 1),
    ('<div><dt>Hedef</dt><dd id="goal">', '<div><dt>Objectif</dt><dd id="goal">', '<div><dt>Doel</dt><dd id="goal">', 1),
    ('<div><dt>Tamamlanan</dt><dd id="pct">', '<div><dt>Atteint</dt><dd id="pct">', '<div><dt>Bereikt</dt><dd id="pct">', 1),
    ('Başlangıç: 24 Kasım 2026 itibarıyla 2.650.000 €. Sonrasında çevrim içi bağış linklerimizden gelen bağışlar yaklaşık 5 dakikada bir eklenir. Banka havaleleri ve elden verilen bağışlar günde bir kez eklenir.',
     'Point de départ : 2.650.000 € au 24 novembre 2026. Ensuite, les dons faits via nos liens en ligne sont ajoutés environ toutes les 5 minutes ; les virements bancaires et les dons remis en main propre, une fois par jour.',
     'Vertrekpunt: 2.650.000 € op 24 november 2026. Daarna worden giften via onze onlinelinks ongeveer om de 5 minuten toegevoegd; overschrijvingen en contante giften één keer per dag.', 1),
    # --- cami ekranı kutuları (bu sayfalar ekranda kullanılmaz, yine de çevrildi) ---
    ('<div class="kutu"><span>Hedef</span>', '<div class="kutu"><span>Objectif</span>', '<div class="kutu"><span>Doel</span>', 1),
    ('<div class="kutu"><span>Tamamlanan</span>', '<div class="kutu"><span>Atteint</span>', '<div class="kutu"><span>Bereikt</span>', 1),
    ('<span>Hedefe kalan</span>', '<span>Reste à collecter</span>', '<span>Nog te verzamelen</span>', 1),
    ('<b>Telefonunla okut, <br class="tk">sen de at</b><span>bxlfatih.com/havuz</span>',
     '<b>Scannez avec votre téléphone, <br class="tk">versez votre part</b><span>bxlfatih.com/cagnotte</span>',
     '<b>Scan met uw telefoon <br class="tk">en doe mee</b><span>bxlfatih.com/donatiepot</span>', 1),
    # --- çağrı ---
    ('<p class="proof">Hedefe <b id="left">1.350.000 €</b> kaldı. Sıra sende.</p>',
     '<p class="proof">Encore <b id="left">1.350.000 €</b> pour atteindre l\'objectif. À vous de jouer.</p>',
     '<p class="proof">Nog <b id="left">1.350.000 €</b> tot het doel. Nu is het aan u.</p>', 1),
    ('<span class="coin coinb">€</span>10 euro at</a>', '<span class="coin coinb">€</span>Verser 10 euros</a>', '<span class="coin coinb">€</span>Geef 10 euro</a>', 2),
    ('<p class="more-label">Gönlünden daha fazlası geçiyorsa</p>', '<p class="more-label">Si votre cœur vous dit de donner plus</p>', '<p class="more-label">Wilt u graag meer geven?</p>', 1),
    ('<p class="fine">Bancontact ile banka uygulamandan onaylarsın, yaklaşık 10 saniye sürer. <a id="other" href="#">Farklı bir tutar bağışla</a></p>',
     '<p class="fine">Vous confirmez avec Bancontact dans votre application bancaire, cela prend environ 10 secondes. <a id="other" href="#">Donner un autre montant</a></p>',
     '<p class="fine">U bevestigt met Bancontact in uw bankapp, dat duurt ongeveer 10 seconden. <a id="other" href="#">Een ander bedrag geven</a></p>', 1),
    # --- kartlar ---
    ('<h2>Nasıl çalışır</h2>', '<h2>Comment ça marche</h2>', '<h2>Hoe werkt het</h2>', 1),
    ('<li>Butona dokun</li>', '<li>Touchez le bouton</li>', '<li>Tik op de knop</li>', 1),
    ('<li>Banka uygulamanda onayla</li>', '<li>Confirmez dans votre application bancaire</li>', '<li>Bevestig in uw bankapp</li>', 1),
    ('<li>Bağışın havuza düşsün, sayaç herkes için artsın</li>', '<li>Votre don tombe dans la cagnotte et le compteur monte pour tous</li>', '<li>Uw gift valt in de pot en de teller stijgt voor iedereen</li>', 1),
    ('<h2>Banka uygulamasıyla QR</h2>', '<h2>QR code pour votre banque</h2>', '<h2>QR-code voor uw bankapp</h2>', 1),
    ('alt="10 euro havale için QR kod"', 'alt="QR code pour un virement de 10 €"', 'alt="QR-code voor een overschrijving van 10 €"', 1),
    ('aria-label="QR tutarını seç"', 'aria-label="Choisir le montant du QR code"', 'aria-label="Kies het bedrag van de QR-code"', 1),
    ('<p class="qrhelp">Banka uygulamanı aç ve QR ile havale bölümünden okut. Hesap, tutar ve açıklama hazır gelir. Telefonun kamerasıyla değil, banka uygulamasıyla okutulur.</p>',
     '<p class="qrhelp">Ouvrez votre application bancaire et scannez ce code avec la fonction de virement par QR code. Le compte, le montant et la communication sont déjà remplis. Scannez-le avec l\'application bancaire, pas avec l\'appareil photo du téléphone.</p>',
     '<p class="qrhelp">Open uw bankapp en scan deze code met de functie om over te schrijven via QR-code. Rekening, bedrag en mededeling worden vooraf ingevuld. Scan met de bankapp, niet met de camera van uw telefoon.</p>', 1),
    ('<div><dt>Hesap sahibi</dt>', '<div><dt>Titulaire</dt>', '<div><dt>Begunstigde</dt>', 1),
    ('<div><dt>Açıklama</dt>', '<div><dt>Communication</dt>', '<div><dt>Mededeling</dt>', 1),
    ('>IBAN\'ı kopyala</button>', '>Copier l\'IBAN</button>', '>IBAN kopiëren</button>', 1),
    ('<h2>Son damlalar</h2>', '<h2>Derniers dons</h2>', '<h2>Laatste giften</h2>', 1),
    ('<h2>Havuzu büyüt</h2>', '<h2>Faites grandir la cagnotte</h2>', '<h2>Laat de pot groeien</h2>', 1),
    ('<p>Ben attım, sıra sende. Üç kişiye gönder, havuz üç kat hızlı dolsun.</p>',
     '<p>Envoyez cette page à trois personnes : la cagnotte se remplira trois fois plus vite.</p>',
     '<p>Stuur deze pagina naar drie mensen, dan vult de pot zich drie keer sneller.</p>', 1),
    ('type="button" hidden>Paylaş</button>', 'type="button" hidden>Partager</button>', 'type="button" hidden>Delen</button>', 2),
    ('type="button">Linki kopyala</button>', 'type="button">Copier le lien</button>', 'type="button">Link kopiëren</button>', 2),
    ('<p class="ekranalt" aria-hidden="true">Tek başına küçük, <b>hep birlikte beş bina.</b></p>',
     '<p class="ekranalt" aria-hidden="true">Seul, c\'est peu. <b>Ensemble, ce sont cinq bâtiments.</b></p>',
     '<p class="ekranalt" aria-hidden="true">Alleen is het weinig, <b>samen worden het vijf gebouwen.</b></p>', 1),
    # --- alt bilgi ---
    ('<p><b>Brüksel Fatih Camii</b> · 5 Ek Bina Kampanyası · Son gün 31 Aralık 2026</p>',
     '<p><b>Mosquée Fatih de Bruxelles</b> · Projet 5 bâtiments · Échéance : 31 décembre 2026</p>',
     '<p><b>Fatih Moskee Brussel</b> · Project 5 gebouwen · Streefdatum: 31 december 2026</p>', 1),
    ('<p>Ödeme Mollie\'nin güvenli ödeme sayfasında yapılır. Bu sayfada bağışçı adı ya da kişisel bilgi gösterilmez, yalnızca tutar ve zaman görünür. Bağışlar <a href="https://www.bxlfatih.com/terms">Şartlar</a> ve <a href="https://www.bxlfatih.com/privacy">Gizlilik Politikası</a> çerçevesinde alınır.</p>',
     '<p>Le paiement s\'effectue sur la page de paiement sécurisée de Mollie. Cette page n\'affiche ni le nom des donateurs ni aucune donnée personnelle, seulement le montant et l\'heure. Les dons sont reçus conformément à nos <a href="https://www.bxlfatih.com/fr/terms">Conditions</a> et à notre <a href="https://www.bxlfatih.com/fr/privacy">Politique de confidentialité</a>.</p>',
     '<p>De betaling gebeurt op de beveiligde betaalpagina van Mollie. Deze pagina toont geen namen van schenkers of persoonsgegevens, alleen het bedrag en het tijdstip. Giften worden ontvangen volgens onze <a href="https://www.bxlfatih.com/nl/terms">Voorwaarden</a> en ons <a href="https://www.bxlfatih.com/nl/privacy">Privacybeleid</a>.</p>', 1),
    ('Chaussée de Haecht 88, 1030 Schaerbeek, Belçika<br>İşletme no 0414.002.928 · RPM Bruxelles<br>',
     'Chaussée de Haecht 88, 1030 Schaerbeek, Belgique<br>N° d\'entreprise 0414.002.928 · RPM Bruxelles<br>',
     'Haachtsesteenweg 88, 1030 Schaarbeek, België<br>Ondernemingsnr. 0414.002.928 · RPR Brussel<br>', 1),
    ('<a href="https://www.bxlfatih.com/cookie-policy">Çerez Politikası</a>',
     '<a href="https://www.bxlfatih.com/fr/cookie-policy">Politique de cookies</a>',
     '<a href="https://www.bxlfatih.com/nl/cookie-policy">Cookiebeleid</a>', 1),
    # --- teşekkür ekranı ---
    ('<h2 id="th-t">Allah razı olsun.</h2>', '<h2 id="th-t">Qu\'Allah vous en récompense.</h2>', '<h2 id="th-t">Moge Allah u belonen.</h2>', 1),
    ('<p>Bağışın birkaç dakika içinde havuza eklenir. Şimdi üç kişiye gönder, havuz üç kat hızlı dolsun.</p>',
     '<p>Votre don sera ajouté à la cagnotte d\'ici quelques minutes. Envoyez maintenant cette page à trois personnes : la cagnotte se remplira trois fois plus vite.</p>',
     '<p>Uw gift wordt binnen enkele minuten aan de pot toegevoegd. Stuur deze pagina nu naar drie mensen, dan vult de pot zich drie keer sneller.</p>', 1),
    ('<p class="note" id="th-demo">Önizleme: yayında bu ekran ödeme onayından sonra açılır</p>',
     '<p class="note" id="th-demo">Aperçu : en ligne, cet écran s\'ouvre après la confirmation du paiement</p>',
     '<p class="note" id="th-demo">Voorbeeld: online opent dit scherm na bevestiging van de betaling</p>', 1),
    ('id="th-close" type="button">Havuza dön</button>', 'id="th-close" type="button">Retour à la cagnotte</button>', 'id="th-close" type="button">Terug naar de pot</button>', 1),
    # --- betik ---
    ('var DIL = "tr";', 'var DIL = "fr";', 'var DIL = "nl";', 1),
    ('pageUrl: "https://www.bxlfatih.com/havuz",', 'pageUrl: "https://www.bxlfatih.com/cagnotte",', 'pageUrl: "https://www.bxlfatih.com/donatiepot",', 1),
]


def uret():
    kaynak = KAYNAK.read_text(encoding="utf-8")
    for i, dil in ((1, "fr"), (2, "nl")):
        s = kaynak
        for p in PARCALAR:
            tr, hedef, adet = p[0], p[i], p[3]
            if dil == "fr":
                hedef = hedef.replace(" :", "&nbsp;:")  # Fransızcada iki noktadan önce bölünmeyen boşluk
            bulunan = s.count(tr)
            if bulunan != adet:
                raise SystemExit(f"[{dil}] beklenen {adet}, bulunan {bulunan}: {tr[:90]}")
            s = s.replace(tr, hedef)
        cikti = KAYNAK.with_name(f"{dil}.html")
        cikti.write_text(s, encoding="utf-8")
        print(f"yazıldı: {cikti.relative_to(KOK)} ({len(PARCALAR)} parça)")


if __name__ == "__main__":
    uret()
