/*
  Ekranlarda dönecek içerik listesi.
  Başkan onayından geçen her video buraya bir satır olarak eklenir; ekranlar listeyi 2 dakikada bir yeniden okur.

  tip    : "video", "gorsel" veya "kampanya" (5 Ek Bina kartı; ayarları veri/ayarlar.js içinde)
  dosya  : dosyanın yolu
  sure   : görsellerde ve kampanya kartında ekranda kalma süresi (saniye)
  ekran  : hangi ekranlarda görünsün ("mescit", "cay"). Yazılmazsa hepsinde görünür.
  bas/bit: gösterimin ilk ve son günü (YYYY-AA-GG). Yazılmazsa süresiz.
*/
window.FATIH_PLAYLIST = [
  { tip: "video", dosya: "medya/FATIH_20261122_EKRAN.mp4" },
  { tip: "kampanya", sure: 14 },
  { tip: "video", dosya: "medya/FATIH_BirSozVerdik_EKRAN.mp4" },
  { tip: "video", dosya: "medya/FATIH_GelecegiInsa_EKRAN.mp4" }
];
