/*
  Ekranlarda dönecek içerik listesi. Ekranlar listeyi 2 dakikada bir yeniden okur.

  tip    : "video"    video dosyası
           "gorsel"   tam alan görsel
           "pano"     başlıklı görsel (baslik, aciklama)
           "kampanya" 5 Ek Bina kartı (ayarları veri/ayarlar.js içinde)
           "site"     web sitesi kartı (ayarları veri/ayarlar.js içinde)
  dosya  : dosyanın yolu
  sure   : video dışındaki içeriklerde ekranda kalma süresi (saniye)
  ekran  : hangi ekranlarda görünsün ("mescit", "cay"). Yazılmazsa hepsinde görünür.
  bas/bit: gösterimin ilk ve son günü (YYYY-AA-GG). Yazılmazsa süresiz.

  Videolar içerik yarısını tam doldursun diye 960×1080 hazırlanır: dikey video ortada,
  iki yanı aynı videonun bulanık hâliyle doludur.
*/
window.FATIH_PLAYLIST = [
  { tip: "kampanya", sure: 20 },
  { tip: "video", dosya: "medya/FATIH_Kulliye5EkBina_GENIS.mp4", bit: "2026-12-31" },
  { tip: "site", sure: 15 },
  { tip: "video", dosya: "medya/FATIH_5Bina3D_GENIS.mp4", bit: "2026-12-31" },
  { tip: "pano", sure: 15, dosya: "medya/5ekbina-plan.jpg", baslik: "Camimize bitişik 5 ek bina", aciklama: "Mavi bugünümüz, sarı geleceğimiz.", bit: "2026-12-31" }
];
