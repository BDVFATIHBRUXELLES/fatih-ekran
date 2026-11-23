// 5 Ek Bina kampanyasının oranını, tutarlarını ve "itibarıyla" tarihini bxlfatih.com ana sayfasından okur
// ve veri/kampanya.js dosyasına yazar. Ekranlar bu dosyayı 10 dakikada bir yeniden okur.
// Sayfadan güvenilir bir oran okunamazsa dosyaya dokunmaz ve hata ile çıkar; ekranda eski değer kalır.
import { readFileSync, writeFileSync } from "node:fs";

const ADRESLER = ["https://www.bxlfatih.com/", "https://www.bxlfatih.com/ana-sayfa"];
const DOSYA = new URL("../veri/kampanya.js", import.meta.url);

export function ayikla(html) {
  const metin = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ");
  const y = /%\s*(\d{1,3})\s*tamamland/i.exec(metin);
  if (!y) return null;
  const yuzde = Number(y[1]);
  if (!(yuzde >= 0 && yuzde <= 100)) return null;
  const toplanan = /Toplanan ba[ğg][ıi][şs]\s*(≈?\s*[\d.,]+\s*€)/i.exec(metin);
  const hedef = /Hedef\s*([\d.,]+\s*€)/i.exec(metin);
  const tarih = /(\d{1,2}\s+[A-Za-zÇĞİÖŞÜçğıöşü]+\s+\d{4})\s+itibar/i.exec(metin);
  const duz = (m) => (m ? m[1].replace(/\s+/g, " ").trim() : "");
  return { yuzde, toplanan: duz(toplanan), hedef: duz(hedef), tarih: duz(tarih) };
}

async function sayfayiOku(adres) {
  const yanit = await fetch(adres, {
    redirect: "follow",
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; FatihEkran/1.0; +https://github.com/BDVFATIHBRUXELLES/fatih-ekran)",
      "Accept-Language": "tr-TR,tr;q=0.9",
    },
  });
  if (!yanit.ok) throw new Error(`${adres} → HTTP ${yanit.status}`);
  return await yanit.text();
}

async function calistir() {
  let veri = null;
  const hatalar = [];
  for (const adres of ADRESLER) {
    try {
      veri = ayikla(await sayfayiOku(adres));
      if (veri) break;
      hatalar.push(`${adres}: sayfada "%.. tamamlandı" bulunamadı`);
    } catch (e) {
      hatalar.push(String(e.message || e));
    }
  }
  if (!veri) {
    console.error("Kampanya verisi okunamadı:\n- " + hatalar.join("\n- "));
    process.exit(1);
  }
  const icerik =
    "/* Bu dosya otomatik yazılır (kaynak: bxlfatih.com ana sayfası). Elle değiştirmeyin. */\n" +
    "window.FATIH_KAMPANYA = " + JSON.stringify(veri) + ";\n";
  let eski = "";
  try { eski = readFileSync(DOSYA, "utf8"); } catch {}
  if (eski === icerik) {
    console.log("Değişiklik yok:", JSON.stringify(veri));
    return;
  }
  writeFileSync(DOSYA, icerik);
  console.log("Güncellendi:", JSON.stringify(veri));
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split("/").pop())) await calistir();
