// Bağış havuzu sayımı: Mollie'deki havuz linklerine yapılan ÖDENMİŞ bağışları toplar,
// veri/havuz.json dosyasına yalnızca toplam ve adet yazar (tek tek tutar ya da isim yazılmaz).
// Anahtar yalnızca MOLLIE_TOKEN ortam değişkeninden okunur, dosyaya ya da çıktıya yazılmaz.
// Mollie'den okunamazsa dosyaya dokunmaz ve hata ile çıkar; sayfada son doğru değer kalır.
import { readFile, writeFile } from "node:fs/promises";

const API = process.env.MOLLIE_API_BASE || "https://api.mollie.com/v2";
const TOKEN = process.env.MOLLIE_TOKEN;
const OUT = process.env.HAVUZ_DOSYA || new URL("../veri/havuz.json", import.meta.url);

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

if (!TOKEN) { console.log("MOLLIE_TOKEN tanımlı değil, sayım atlandı."); process.exit(0); }

const sent = (v) => Math.round(parseFloat(v ?? "0") * 100);

async function linkToplami(id) {
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

const online = kurus / 100;
const yeni = { baslangic: BASLANGIC, baslangicTarihi: BASLANGIC_TARIHI, hedef: HEDEF, online: { toplam: online, adet }, toplam: BASLANGIC + online };

let eski = null;
try { eski = JSON.parse(await readFile(OUT, "utf8")); } catch {}
const ayni = eski && ["baslangic", "baslangicTarihi", "hedef", "toplam"].every((k) => eski[k] === yeni[k]) && eski.online?.adet === adet;
if (ayni) { console.log(`Değişiklik yok: ${adet} bağış, ${online} €`); process.exit(0); }

await writeFile(OUT, JSON.stringify({ ...yeni, guncelleme: new Date().toISOString() }, null, 2) + "\n");
console.log(`Güncellendi: ${adet} bağış, ${online} €, toplam ${yeni.toplam} €`);
