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

if (!TOKEN) { console.log("MOLLIE_TOKEN tanımlı değil, sayım atlandı."); process.exit(0); }

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

const online = kurus / 100;
const banka = await bankaOku();
const toplam = Math.round((BASLANGIC + online + banka.toplam) * 100) / 100;
const yeni = { baslangic: BASLANGIC, baslangicTarihi: BASLANGIC_TARIHI, hedef: HEDEF, online: { toplam: online, adet }, banka, toplam };

let eski = null;
try { eski = JSON.parse(await readFile(OUT, "utf8")); } catch {}
const ayni = eski && ["baslangic", "baslangicTarihi", "hedef", "toplam"].every((k) => eski[k] === yeni[k]) && eski.online?.adet === adet
  && eski.banka?.toplam === banka.toplam && eski.banka?.adet === banka.adet && (eski.banka?.tarih ?? null) === banka.tarih;
if (ayni) { console.log(`Değişiklik yok: çevrim içi ${adet} bağış, ${online} €; banka ${banka.toplam} €`); process.exit(0); }

await writeFile(OUT, JSON.stringify({ ...yeni, guncelleme: new Date().toISOString() }, null, 2) + "\n");
console.log(`Güncellendi: çevrim içi ${adet} bağış, ${online} €; banka ${banka.toplam} €; toplam ${yeni.toplam} €`);
