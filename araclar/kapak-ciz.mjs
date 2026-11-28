// Bağlantı kapağı (og:image): havuzdaki güncel toplamı üç dilde 1200×630 görsel olarak çizer.
//
// WhatsApp, Facebook vb. bir bağlantının ön izlemesinde sayfanın og:image görselini gösterir. Bu betik
// veri/havuz.json'daki toplamı araclar/kapak/kapak.html şablonuna verir, sayfanın ekran görüntüsünü alır ve
// havuz/media/paylasim.jpg (TR), paylasim-fr.jpg (FR), paylasim-nl.jpg (NL) dosyalarına yazar.
// Yalnızca toplam, hedef ve tarih çizilir; bağışçı adı ya da tek tek tutar yoktur.
//
// Ne zaman çizer: toplam ya da Brüksel günü değiştiyse ve son çizimden en az KAPAK_ARALIK_DK (60) dakika geçtiyse.
// Durum veri/kapak.json dosyasında tutulur ({ toplam, tarih, cizim }).
//
//   node araclar/kapak-ciz.mjs --denetle   çizim gerekli mi? gerekliyse 0, değilse 10 ile çıkar; hiçbir şey yazmaz
//   node araclar/kapak-ciz.mjs             gerekliyse çizer
//   node araclar/kapak-ciz.mjs --zorla     her durumda çizer
//
// Çizim için playwright-core paketi ve makinede kurulu bir Chrome gerekir (GitHub'ın Ubuntu makinelerinde vardır).
// Başka bir tarayıcı için: KAPAK_CHROME=/yol/chrome. Üç görsel de başarıyla çizilmeden hiçbir dosya değişmez.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const KOK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SABLON = path.join(KOK, "araclar/kapak/kapak.html");
const DURUM = path.join(KOK, "veri/kapak.json");
const CIKTI = { tr: "havuz/media/paylasim.jpg", fr: "havuz/media/paylasim-fr.jpg", nl: "havuz/media/paylasim-nl.jpg" };
const ARALIK_DK = Number(process.env.KAPAK_ARALIK_DK ?? 60);
const KALITE = 86;
const secenek = new Set(process.argv.slice(2));

const veri = JSON.parse(readFileSync(path.join(KOK, "veri/havuz.json"), "utf8"));
const toplam = Math.round(Number(veri.toplam));
const hedef = Math.round(Number(veri.hedef)) > 0 ? Math.round(Number(veri.hedef)) : 4000000;
if (!Number.isFinite(toplam) || toplam <= 0) {
  console.error("Kapak: veri/havuz.json içinde geçerli bir toplam yok; çizilmedi.");
  process.exit(1);
}

const simdi = new Date();
// Brüksel takvim günü, YYYY-AA-GG
const gun = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Brussels", year: "numeric", month: "2-digit", day: "2-digit" }).format(simdi);
let durum = {};
try { if (existsSync(DURUM)) durum = JSON.parse(readFileSync(DURUM, "utf8")) || {}; } catch { durum = {}; }

function neden() {
  if (secenek.has("--zorla")) return "zorla";
  for (const d of Object.values(CIKTI)) if (!existsSync(path.join(KOK, d))) return "görsel eksik";
  if (durum.toplam === toplam && durum.tarih === gun) return "";
  const son = Date.parse(durum.cizim || "");
  const gecen = (simdi.getTime() - son) / 60000;
  if (Number.isFinite(son) && gecen >= 0 && gecen < ARALIK_DK) {
    console.log(`Kapak: değişiklik var (${durum.toplam} → ${toplam} €) ama son çizimden ${Math.floor(gecen)} dk geçti, en az ${ARALIK_DK} dk beklenir.`);
    process.exit(secenek.has("--denetle") ? 10 : 0);
  }
  return durum.toplam !== toplam ? "toplam değişti" : "gün değişti";
}

const sebep = neden();
if (!sebep) { console.log(`Kapak güncel (${durum.toplam ?? "?"} €, ${durum.tarih ?? "?"}).`); process.exit(secenek.has("--denetle") ? 10 : 0); }
console.log(`Kapak çizilecek: ${sebep} (${durum.toplam ?? "yok"} → ${toplam} €, ${gun}).`);
if (secenek.has("--denetle")) process.exit(0);

const { chromium } = await import("playwright-core");
async function tarayiciAc() {
  const adaylar = [];
  if (process.env.KAPAK_CHROME) adaylar.push({ executablePath: process.env.KAPAK_CHROME });
  adaylar.push({ channel: "chrome" });
  for (const yol of ["/usr/bin/google-chrome", "/usr/bin/chromium-browser", "/usr/bin/chromium"]) if (existsSync(yol)) adaylar.push({ executablePath: yol });
  let hata;
  for (const a of adaylar) {
    try { const t = await chromium.launch({ ...a, headless: true }); console.log("Tarayıcı:", a.executablePath || a.channel, t.version()); return t; }
    catch (e) { hata = e; }
  }
  throw hata || new Error("tarayıcı bulunamadı");
}

const tarayici = await tarayiciAc();
const hazir = [];
try {
  const sayfa = await tarayici.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  for (const dil of Object.keys(CIKTI)) {
    const adres = `${pathToFileURL(SABLON).href}?dil=${dil}&toplam=${toplam}&hedef=${hedef}&tarih=${gun}`;
    await sayfa.goto(adres, { waitUntil: "load", timeout: 30000 });
    await sayfa.waitForFunction("window.hazir === true", null, { timeout: 30000 });
    const k = await sayfa.evaluate("window.KAPAK");
    // şablon doğru rakamı, doğru dili gösteriyor mu; yazı tipleri ve görseller yüklendi mi
    if (!k || !k.gecerli || !k.kaynak || k.dil !== dil || k.rakam !== String(toplam)) throw new Error(`şablon denetimi geçmedi (${dil}): ${JSON.stringify(k)}`);
    const jpg = await sayfa.screenshot({ type: "jpeg", quality: KALITE, clip: { x: 0, y: 0, width: 1200, height: 630 } });
    // WhatsApp büyük görselleri ön izlemede göstermez; çok küçük dosya da boş sayfa demektir
    if (jpg.length < 40000 || jpg.length > 450000) throw new Error(`beklenmeyen dosya boyutu (${dil}): ${jpg.length} bayt`);
    hazir.push([dil, jpg]);
  }
} finally {
  await tarayici.close();
}
for (const [dil, jpg] of hazir) { writeFileSync(path.join(KOK, CIKTI[dil]), jpg); console.log(`${CIKTI[dil]}: ${jpg.length} bayt`); }
writeFileSync(DURUM, JSON.stringify({ toplam, tarih: gun, cizim: simdi.toISOString() }, null, 2) + "\n");
console.log(`Kapak çizildi: ${toplam} €, ${gun}.`);
