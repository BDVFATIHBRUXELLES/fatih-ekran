// Diyanet İşleri Başkanlığı'nın herkese açık sayfalarından iki şeyi okur:
//  1) Brüksel namaz vakitleri ve hicri tarihler  → veri/vakitler.js
//  2) Günün ayeti, hadisi ve duası               → veri/gunun-sozu.js
// Güvenilir biçimde okunamayan dosyaya dokunulmaz; ekranda son doğru veri kalır.
import { readFileSync, writeFileSync } from "node:fs";

const VAKIT_ADRESI = "https://namazvakitleri.diyanet.gov.tr/tr-TR/11915/bruksel-namaz-vakitleri";
const SOZ_ADRESI = "https://www.diyanet.gov.tr/proxy/home/daily-content?lang=tr-TR";
const VAKIT_DOSYASI = new URL("../veri/vakitler.js", import.meta.url);
const SOZ_DOSYASI = new URL("../veri/gunun-sozu.js", import.meta.url);
const AYLAR = ["ocak", "şubat", "mart", "nisan", "mayıs", "haziran", "temmuz", "ağustos", "eylül", "ekim", "kasım", "aralık"];
const BASLIKLAR = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
  "Accept-Language": "tr-TR,tr;q=0.9",
};

const iki = (n) => String(n).padStart(2, "0");
const duz = (s) => s.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&#39;|&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();

function brukselBugun() {
  const p = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Brussels", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  return p; // YYYY-MM-DD
}

export function vakitleriAyikla(html) {
  const vakitler = {}, hicri = {};
  for (const satir of html.match(/<tr[\s\S]*?<\/tr>/gi) || []) {
    const h = (satir.match(/<td[\s\S]*?<\/td>/gi) || []).map(duz);
    if (h.length < 8) continue;
    const t = /^(\d{1,2})\s+(\S+)\s+(\d{4})/.exec(h[0]);
    if (!t) continue;
    const ay = AYLAR.indexOf(t[2].toLocaleLowerCase("tr-TR"));
    if (ay < 0) continue;
    const saatler = h.slice(2, 8);
    if (!saatler.every((s) => /^([01]\d|2[0-3]):[0-5]\d$/.test(s))) continue;
    if (saatler.slice().sort().join() !== saatler.join()) continue; // imsak < güneş < ... < yatsı olmalı
    const anahtar = `${t[3]}-${iki(ay + 1)}-${iki(+t[1])}`;
    vakitler[anahtar] = saatler;
    if (h[1]) hicri[anahtar] = h[1];
  }
  return { vakitler, hicri };
}

export function sozuAyikla(json) {
  const temiz = (s) => String(s || "").replace(/\s+/g, " ").trim().replace(/^[“”"'‘’\s]+/, "").replace(/[“”"'‘’\s]+$/, "");
  const bul = (kod) => (json.items || []).find((x) => x && x.contentTypeCode === kod);
  const cikti = {};
  for (const kod of ["ayet", "hadis", "dua"]) {
    const o = bul(kod);
    if (!o) continue;
    const metin = temiz(o.title);
    if (metin.length < 10 || metin.length > 900) continue;
    cikti[kod] = { metin, kaynak: String(o.source || "").replace(/\s+/g, " ").trim().replace(/^\(\s*/, "").replace(/\s*\)$/, "") };
  }
  return cikti.ayet || cikti.hadis ? cikti : null;
}

async function oku(adres) {
  const y = await fetch(adres, { redirect: "follow", headers: BASLIKLAR });
  if (!y.ok) throw new Error(`${adres} → HTTP ${y.status}`);
  return await y.text();
}

function yaz(dosya, icerik) {
  let eski = "";
  try { eski = readFileSync(dosya, "utf8"); } catch {}
  if (eski === icerik) return false;
  writeFileSync(dosya, icerik);
  return true;
}

async function calistir() {
  const bugun = brukselBugun();
  let basarili = 0;

  try {
    const { vakitler, hicri } = vakitleriAyikla(await oku(VAKIT_ADRESI));
    const dun = new Date(Date.parse(bugun + "T00:00:00Z") - 86400000).toISOString().slice(0, 10);
    const yarin = new Date(Date.parse(bugun + "T00:00:00Z") + 86400000).toISOString().slice(0, 10);
    const gunler = Object.keys(vakitler).filter((g) => g >= dun).sort();
    if (!vakitler[bugun] || !vakitler[yarin] || gunler.length < 7) throw new Error(`vakit tablosu eksik (bugün: ${!!vakitler[bugun]}, yarın: ${!!vakitler[yarin]}, gün sayısı: ${gunler.length})`);
    const satirlar = gunler.map((g) => `  ${JSON.stringify(g)}: ${JSON.stringify(vakitler[g])}`);
    const hSatirlar = gunler.filter((g) => hicri[g]).map((g) => `  ${JSON.stringify(g)}: ${JSON.stringify(hicri[g])}`);
    const icerik =
      "/*\n  Brüksel namaz vakitleri. Bu dosya otomatik yazılır, elle değiştirmeyin.\n" +
      "  Kaynak: Diyanet İşleri Başkanlığı, namazvakitleri.diyanet.gov.tr (Brüksel)\n" +
      "  Sıra: İmsak, Güneş, Öğle, İkindi, Akşam, Yatsı\n*/\n" +
      "window.FATIH_VAKITLER = {\n" + satirlar.join(",\n") + "\n};\n" +
      "window.FATIH_HICRI = {\n" + hSatirlar.join(",\n") + "\n};\n";
    console.log(`Vakitler: ${gunler.length} gün (${gunler[0]} → ${gunler[gunler.length - 1]}), bugün ${JSON.stringify(vakitler[bugun])}`, yaz(VAKIT_DOSYASI, icerik) ? "→ güncellendi" : "→ değişiklik yok");
    basarili++;
  } catch (e) {
    console.error("UYARI: namaz vakitleri okunamadı:", e.message || e);
  }

  try {
    const soz = sozuAyikla(JSON.parse(await oku(SOZ_ADRESI)));
    if (!soz) throw new Error("günün ayeti ve hadisi yanıtta yok");
    const icerik =
      "/* Günün ayeti, hadisi ve duası. Bu dosya otomatik yazılır, elle değiştirmeyin.\n" +
      "   Kaynak: Diyanet İşleri Başkanlığı, diyanet.gov.tr */\n" +
      "window.FATIH_GUNUN_SOZU = " + JSON.stringify({ tarih: bugun, ...soz }, null, 1) + ";\n";
    console.log(`Günün sözü (${bugun}): ${Object.keys(soz).join(", ")}`, yaz(SOZ_DOSYASI, icerik) ? "→ güncellendi" : "→ değişiklik yok");
    basarili++;
  } catch (e) {
    console.error("UYARI: günün ayeti ve hadisi okunamadı:", e.message || e);
  }

  if (!basarili) process.exit(1);
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split("/").pop())) await calistir();
