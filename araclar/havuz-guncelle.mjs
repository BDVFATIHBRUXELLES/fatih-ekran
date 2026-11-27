// Bağış havuzu sayımı: Mollie'deki havuz linklerine ve serbest tutarlı bağış linkine yapılan ÖDENMİŞ bağışları toplar,
// başkanın bildirdiği banka havalesi toplamını (veri/havuz-banka.json) ekler ve
// veri/havuz.json dosyasına yalnızca toplam ve adet yazar (tek tek tutar ya da isim yazılmaz).
// Anahtar yalnızca MOLLIE_TOKEN ortam değişkeninden okunur, dosyaya ya da çıktıya yazılmaz.
// Mollie'den okunamazsa dosyaya dokunmaz ve hata ile çıkar; sayfada son doğru değer kalır.
import { readFile, writeFile } from "node:fs/promises";

const API = process.env.MOLLIE_API_BASE || "https://api.mollie.com/v2";
const TOKEN = process.env.MOLLIE_TOKEN;
const OUT = process.env.HAVUZ_DOSYA || new URL("../veri/havuz.json", import.meta.url);
const BANKA = process.env.HAVUZ_BANKA_DOSYA || new URL("../veri/havuz-banka.json", import.meta.url);

// Başlangıç: başkanın bildirdiği toplam. Bu tarihten sonra havuz linklerine gelen bağışlar üstüne eklenir.
const BASLANGIC = 2650000;
const BASLANGIC_TARIHI = "2026-11-24";
const HEDEF = 4000000;
const LINKLER = [
  "pl_z98rjNs5TpxG6phGmRCn2", // 10 €
  "pl_Rq8g7SDEZPqTZm3vNzVeU", // 20 €
  "pl_aQxGpk6pcjCZt9y649UKs", // 50 €
  "pl_7LXgodhzd9s4McAcYM5aJ", // 100 €
  "pl_KPEjMh69Gyf9sMvyJQUrQ"  // 1.000 €
];
// Serbest tutarlı bağış linki: bxlfatih.com/bagis-yap sayfasındaki QR kod ve havuz sayfasındaki
// "Farklı bir tutar" bağlantısı (başkanın isteğiyle 24.11.2026'da sayıma eklendi).
// Bu linkin eski bağışları başlangıç tutarının içindedir. Çift sayılmasın diye yalnızca
// BASLANGIC_ANI'ndan sonra ödenenler eklenir.
const BASLANGIC_ANI = "2026-11-24T17:25:00Z"; // 2.650.000 € rakamının havuza yazıldığı an (24.11.2026 18:25, Brüksel)
const ACIK_LINKLER = [
  "pl_NmX4fQidk8KBU9HdegFTH"
];

// Diğer Mollie ödeme linkleri (başkanın isteği 27.11.2026: "üyelikler ve eğitim dışındaki bütün Mollie ödemeleri de eklensin").
// Hesaptaki bütün ödeme linkleri listelenir; yukarıdakiler dışındaki her link için BASLANGIC_ANI'ndan sonra ödenenler
// eklenir, açıklamasında üyelik ya da eğitim sözcüğü geçen linkler hariç tutulur.
// DIGER_LINKLER: "say" = toplamı havuza ekle; "dokum" = yalnızca veri/havuz-dokum.json dosyasına yaz, toplama ekleme.
// Jeton yalnızca payment-links.read izinlidir: link olmadan yapılan ödemeler (ör. Odoo üzerinden kurs kaydı) okunamaz, sayılmaz.
const DIGER_LINKLER = "say";
// Link olmadan yapılan Mollie ödemeleri (ör. site üzerinden ya da kart cihazıyla): jetonda payments.read izni varsa okunur.
// LINKSIZ_ODEMELER: "dokum" = yalnızca döküme yaz (toplama ekleme); "say" = BASLANGIC_ANI'ndan sonra ödenenleri,
// açıklamasında üyelik ya da eğitim geçenler hariç, havuza ekle. İzin yoksa bu bölüm atlanır, döküme "izin yok" yazılır.
const LINKSIZ_ODEMELER = "dokum";
const DOKUM = process.env.HAVUZ_DOKUM_DOSYA || new URL("../veri/havuz-dokum.json", import.meta.url);
const duz = (t) => String(t ?? "").toLocaleLowerCase("tr")
  .replace(/[ğ]/g, "g").replace(/[üûù]/g, "u").replace(/[ş]/g, "s").replace(/[ıîï]/g, "i").replace(/[öô]/g, "o")
  .replace(/[ç]/g, "c").replace(/[âà]/g, "a").replace(/[éèêë]/g, "e").replace(/[’'`´]/g, "");
const HARIC = [
  ["üyelik", /(uyelik|\buye(ler)?\b|aidat|cotisation|membre|member|lidgeld|lidmaat)/],
  ["eğitim", /(egitim|kurs|kuran|quran|coran|cours|\bders|okul|ecole|school|education|educatie|inscription|kayit)/]
];
function haricMi(aciklama) { const d = duz(aciklama); for (const [ad, re] of HARIC) if (re.test(d)) return ad; return null; }
// Döküm herkese açık depoya yazılır: açıklamadan yalnızca aşağıdaki genel sözcükler ve kısa sayılar kalır,
// geri kalan her sözcük (kişi adı olabilir) ••• ile değiştirilir.
const ACIK_SOZCUK = new Set(("bagis bagisi bagislar havuz havuzu bina binasi ek cami camii fatih uyelik uyelikler uye aidat aidati egitim kurs kursu kuran "
  + "zekat fitre fidye kurban sadaka hayir yardim iftar genel serbest tutar diger don dons donation cotisation membre cours inscription kayit kaydi "
  + "eur euro yil yillik aylik bruxelles bruksel proje projesi kampanya kampanyasi icin ve").split(" "));
function maskele(aciklama) {
  return String(aciklama ?? "").split(/\s+/).filter(Boolean).map((w) => {
    const d = duz(w).replace(/[^a-z0-9€]/g, "");
    if (d === "" || d === "€") return w.replace(/[^€.,:\-–()\/]/g, "") || "•";
    if (/^[0-9]{1,4}$/.test(d)) return d;
    return ACIK_SOZCUK.has(d) ? w : "•••";
  }).join(" ");
}
async function tumLinkler() {
  let url = `${API}/payment-links?limit=250`, sayfa = 0; const hepsi = [];
  while (url) {
    if (++sayfa > 50) throw new Error("çok fazla link sayfası");
    const r = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
    if (!r.ok) throw new Error(`Mollie ${r.status} (link listesi)`);
    const j = await r.json();
    for (const l of j?._embedded?.payment_links ?? []) hepsi.push(l);
    url = j?._links?.next?.href || null;
  }
  return hepsi;
}

if (!TOKEN) { console.log("MOLLIE_TOKEN tanımlı değil, sayım atlandı."); process.exit(0); }

// Güvenlik: jetonun türü yalnızca ön ekinden anlaşılır (jetonun kendisi hiçbir yere yazılmaz).
// Test anahtarıyla Mollie hata vermez, boş (test) veri döndürür; bu yüzden sayım durdurulur ve havuz dosyasına dokunulmaz.
const jetonTuru = TOKEN.startsWith("test_") ? "test API anahtarı" : TOKEN.startsWith("live_") ? "canlı API anahtarı"
  : TOKEN.startsWith("access_") ? "erişim jetonu" : "bilinmiyor";
async function durdur(neden) {
  await writeFile(DOKUM, JSON.stringify({ hata: neden, jeton: jetonTuru }, null, 2) + "\n");
  console.error("Sayım durduruldu, havuz dosyası değişmedi: " + neden);
  process.exit(0);
}
if (jetonTuru === "test API anahtarı") await durdur("MOLLIE_TOKEN bir test anahtarı; canlı ödemeler okunamaz");

// Banka havaleleri Mollie'den okunamaz. Başkan her akşam yazılı bildirir; toplam veri/havuz-banka.json
// dosyasına elle işlenir ve buradan havuza eklenir. Dosya yoksa 0 sayılır; bozuksa sayım hata ile durur
// (yanlış bir toplam yayımlamaktansa son doğru değer kalsın diye).
async function bankaOku() {
  let j;
  try { j = JSON.parse(await readFile(BANKA, "utf8")); }
  catch (e) { if (e.code === "ENOENT") return { toplam: 0, adet: 0, tarih: null }; throw new Error("havuz-banka.json okunamadı: " + e.message); }
  // adet bilinmiyorsa null yazılır (başkan yalnızca tutarı bildirmiş olabilir); uydurulmaz
  const toplam = Number(j.toplam), adet = j.adet == null ? null : Number(j.adet);
  if (!Number.isFinite(toplam) || toplam < 0 || (adet !== null && (!Number.isInteger(adet) || adet < 0))) throw new Error("havuz-banka.json geçersiz");
  return { toplam: Math.round(toplam * 100) / 100, adet, tarih: typeof j.tarih === "string" ? j.tarih : null };
}

const sent = (v) => Math.round(parseFloat(v ?? "0") * 100);

// sonra verilirse yalnızca o andan sonra ödenen bağışlar sayılır
const linkOdemeleri = new Set(); // linkler üzerinden gelen bütün ödemelerin kimlikleri (linksiz ödemelerle çift sayılmasın diye)
async function linkToplami(id, sonra = null) {
  const esik = sonra ? Date.parse(sonra) : null;
  if (sonra && !Number.isFinite(esik)) throw new Error("başlangıç anı okunamadı: " + sonra);
  let url = `${API}/payment-links/${id}/payments?limit=250`;
  let kurus = 0, adet = 0, sayfa = 0;
  while (url) {
    if (++sayfa > 200) throw new Error("çok fazla sayfa: " + id);
    const r = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
    if (!r.ok) throw new Error(`Mollie ${r.status} (${id})`);
    const j = await r.json();
    for (const p of j?._embedded?.payments ?? []) {
      if (p.id) linkOdemeleri.add(p.id);
      if (p.status !== "paid" || p.mode === "test") continue;
      if (p.amount?.currency !== "EUR") continue;
      if (esik !== null && !(Date.parse(p.paidAt || p.createdAt || "") >= esik)) continue;
      const net = sent(p.amount.value) - sent(p.amountRefunded?.value) - sent(p.amountChargedBack?.value);
      if (net <= 0) continue;
      kurus += net; adet += 1;
    }
    url = j?._links?.next?.href || null;
  }
  return { kurus, adet };
}

let kurus = 0, adet = 0;
for (const id of LINKLER) { const t = await linkToplami(id); kurus += t.kurus; adet += t.adet; }
for (const id of ACIK_LINKLER) { const t = await linkToplami(id, BASLANGIC_ANI); kurus += t.kurus; adet += t.adet; }

// Diğer linkler: döküm her durumda çıkarılır; toplamaya yalnızca DIGER_LINKLER "say" ise girer.
let dokum = null;
try {
  const bilinen = new Set([...LINKLER, ...ACIK_LINKLER]);
  const satirlar = []; let dKurus = 0, dAdet = 0, haricLink = 0, dahilLink = 0, test = 0;
  for (const l of await tumLinkler()) {
    if (bilinen.has(l.id)) continue;
    if (l.mode === "test") { test += 1; continue; }
    const neden = haricMi(l.description);
    const sabit = l.amount?.value ? Number(l.amount.value) : null;
    if (neden) { haricLink += 1; await linkToplami(l.id, BASLANGIC_ANI); /* yalnızca kimlikler için */ satirlar.push({ ad: maskele(l.description), tutar: sabit, durum: "hariç", neden }); continue; }
    const t = await linkToplami(l.id, BASLANGIC_ANI);
    dahilLink += 1; dKurus += t.kurus; dAdet += t.adet;
    satirlar.push({ ad: maskele(l.description), tutar: sabit, durum: "dahil", adet: t.adet, toplam: t.kurus / 100 });
  }
  dokum = { kip: DIGER_LINKLER, jeton: jetonTuru, baslangicAni: BASLANGIC_ANI, dahil: { link: dahilLink, adet: dAdet, toplam: dKurus / 100 }, haric: { link: haricLink }, test, linkler: satirlar };
  if (DIGER_LINKLER === "say") { kurus += dKurus; adet += dAdet; }
} catch (e) {
  // "say" kipinde eksik bir toplam yayımlamaktansa dur; "dokum" kipinde yalnızca hatayı kaydet
  if (DIGER_LINKLER === "say") throw e;
  dokum = { kip: DIGER_LINKLER, hata: String(e.message || e) };
}
// Linksiz ödemeler: en yeniden eskiye sayfalanır, BASLANGIC_ANI'ndan eskiye gelince durulur.
if (dokum && !dokum.hata) {
  const o = { kip: LINKSIZ_ODEMELER };
  try {
    const esik = Date.parse(BASLANGIC_ANI);
    let url = `${API}/payments?limit=250`, sayfa = 0, bitti = false, lKurus = 0, lAdet = 0, haricAdet = 0;
    const grup = new Map();
    while (url && !bitti) {
      if (++sayfa > 40) throw new Error("çok fazla ödeme sayfası");
      const r = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
      if (r.status === 401 || r.status === 403) { o.durum = "izin yok"; o.http = r.status; break; }
      if (!r.ok) { let ayr = ""; try { ayr = String((await r.json())?.detail || "").slice(0, 200); } catch {} throw new Error(`Mollie ${r.status} (ödeme listesi) ${ayr}`); }
      const j = await r.json();
      const liste = j?._embedded?.payments ?? [];
      for (const p of liste) {
        const an = Date.parse(p.paidAt || p.createdAt || "");
        if (Date.parse(p.createdAt || "") < esik) { bitti = true; }
        if (p.status !== "paid" || p.mode === "test" || p.amount?.currency !== "EUR") continue;
        if (!(an >= esik) || linkOdemeleri.has(p.id)) continue;
        const net = sent(p.amount.value) - sent(p.amountRefunded?.value) - sent(p.amountChargedBack?.value);
        if (net <= 0) continue;
        const neden = haricMi(p.description);
        if (neden) { haricAdet += 1; continue; }
        lKurus += net; lAdet += 1;
        const anahtar = maskele(p.description) + " | " + (p.method || "?");
        const g = grup.get(anahtar) || { ad: maskele(p.description), yontem: p.method || null, adet: 0, toplam: 0 };
        g.adet += 1; g.toplam = Math.round((g.toplam + net / 100) * 100) / 100; grup.set(anahtar, g);
      }
      url = j?._links?.next?.href || null;
    }
    if (!o.durum) {
      o.durum = "tamam"; o.dahil = { adet: lAdet, toplam: lKurus / 100 }; o.haric = { adet: haricAdet }; o.gruplar = [...grup.values()];
      if (LINKSIZ_ODEMELER === "say") { kurus += lKurus; adet += lAdet; }
    }
  } catch (e) {
    if (LINKSIZ_ODEMELER === "say") throw e;
    o.durum = "hata"; o.ayrinti = String(e.message || e);
  }
  dokum.linksiz = o;
}
{
  let eskiDokum = null;
  try { eskiDokum = JSON.parse(await readFile(DOKUM, "utf8")); } catch {}
  const { guncelleme: _g, ...eskiOz } = eskiDokum ?? {};
  if (JSON.stringify(eskiOz) !== JSON.stringify(dokum)) {
    // Zaman damgası yazılmaz: aynı anda çalışan iki sayım aynı içeriği üretsin, gönderimde çakışma olmasın
    await writeFile(DOKUM, JSON.stringify(dokum, null, 2) + "\n");
    console.log("Döküm güncellendi: veri/havuz-dokum.json");
  }
}

const online = kurus / 100;
const banka = await bankaOku();
const toplam = Math.round((BASLANGIC + online + banka.toplam) * 100) / 100;
const yeni = { baslangic: BASLANGIC, baslangicTarihi: BASLANGIC_TARIHI, hedef: HEDEF, online: { toplam: online, adet }, banka, toplam };

let eski = null;
try { eski = JSON.parse(await readFile(OUT, "utf8")); } catch {}
// Güvenlik: çevrim içi toplam bir anda belirgin biçimde düşerse (yanlış jeton, yanlış hesap, Mollie'den eksik yanıt) yayımlama.
// Gerçek bir iade bu eşiği aşarsa eşik burada elle geçici olarak gevşetilir.
if (eski?.online && Number.isFinite(eski.online.toplam) && eski.online.toplam > 0
    && (adet < eski.online.adet - 2 || online < eski.online.toplam * 0.8)) {
  await durdur(`çevrim içi toplam beklenmedik biçimde düştü: ${eski.online.adet} bağış ${eski.online.toplam} € → ${adet} bağış ${online} €`);
}
const ayni = eski && ["baslangic", "baslangicTarihi", "hedef", "toplam"].every((k) => eski[k] === yeni[k]) && eski.online?.adet === adet
  && eski.banka?.toplam === banka.toplam && eski.banka?.adet === banka.adet && (eski.banka?.tarih ?? null) === banka.tarih;
if (ayni) { console.log(`Değişiklik yok: çevrim içi ${adet} bağış, ${online} €; banka ${banka.toplam} €`); process.exit(0); }

await writeFile(OUT, JSON.stringify({ ...yeni, guncelleme: new Date().toISOString() }, null, 2) + "\n");
console.log(`Güncellendi: çevrim içi ${adet} bağış, ${online} €; banka ${banka.toplam} €; toplam ${yeni.toplam} €`);
