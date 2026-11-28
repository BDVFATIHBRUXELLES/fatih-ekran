/*
  Ekranlarda dönecek içerik listesi. Ekranlar listeyi 2 dakikada bir yeniden okur.

  tip    : "video"    video dosyası
           "gorsel"   tam alan görsel
           "pano"     başlıklı görsel (baslik, aciklama)
           "kampanya" 5 Ek Bina kartı (ayarları veri/ayarlar.js içinde)
           "site"     web sitesi kartı (ayarları veri/ayarlar.js içinde)
           "bilgi"    tanıtım kartı (kart: "bdv"; metinleri veri/ayarlar.js içinde)
           "soz"      günün ayeti ya da hadisi (tur: "ayet", "hadis" ya da "dua"); Diyanet'ten her gün otomatik gelir
           "sayfa"    canlı sayfa (dosya: sayfanın adresi; ör. bağış havuzu). Sayfa kendi verisini kendisi yeniler
  dosya  : dosyanın yolu
  sure   : video dışındaki içeriklerde ekranda kalma süresi (saniye)
  tam    : "kampanya" ve "sayfa" için; true ise sırası gelince bütün ekranı kaplar (saat ve geri sayım köşede kalır).
           Tam ekran sayfa 1920×1080 çizilmelidir (canlı bağış panosu: havuz/ekran.html?duzen=tam; yarım alan için ?duzen=yan)
           Sayfanın kendisi değişince adresin sonundaki v= sayısı artırılır; açık ekranlar sayfayı o zaman yeniden yükler
           "video" için de geçerlidir: video bütün ekranı kaplar. Yatay hazırlanır.
  bant   : tam ekran "video" için; true ise videonun altında 200 px'lik canlı bant durur (kalan gün, havuzda biriken,
           hedefe kalan, QR kodu, saat). O zaman video üstteki 1920×880 alanı doldurur: 1920×880 hazırlanırsa hiç kırpılmaz,
           1920×1080 gelirse üstten ve alttan 100'er px kırpılır.
           "yan" ise (dikey videolar için) video ortada tam yükseklikte durur, iki yanında aynı bilgiler ve oran büyük yazılır;
           video 608×1080 hazırlanır.
  ekran  : hangi ekranlarda görünsün ("mescit", "cay"). Yazılmazsa hepsinde görünür.
  bas/bit: gösterimin ilk ve son günü (YYYY-AA-GG). Yazılmazsa süresiz.

  Videolar içerik yarısını tam doldursun diye 960×1080 hazırlanır: dikey video ortada,
  iki yanı aynı videonun bulanık hâliyle doludur.
*/
window.FATIH_PLAYLIST = [
  { tip: "sayfa", dosya: "havuz/ekran.html?duzen=tam&v=1", sure: 120, tam: true, bit: "2026-12-31" },
  { tip: "video", dosya: "medya/FATIH_TrenPeronda_EKRAN.mp4", tam: true, bant: "yan", bit: "2026-12-31" },
  { tip: "kampanya", sure: 20 },
  { tip: "video", dosya: "medya/FATIH_Kulliye5EkBina_GENIS.mp4", bit: "2026-12-31" },
  { tip: "soz", tur: "ayet", sure: 22 },
  { tip: "site", sure: 15 },
  { tip: "video", dosya: "medya/FATIH_5Bina3D_GENIS.mp4", bit: "2026-12-31" },
  { tip: "soz", tur: "hadis", sure: 30 },
  { tip: "bilgi", kart: "bdv", sure: 20 },
  { tip: "soz", tur: "dua", sure: 22 },
  { tip: "pano", sure: 15, dosya: "medya/5ekbina-plan.jpg", baslik: "Camimize bitişik 5 ek bina", aciklama: "Mavi bugünümüz, sarı geleceğimiz.", bit: "2026-12-31" },
  { tip: "gorsel", dosya: "medya/anma-panosu-yatay.jpg", sure: 30 }
];
