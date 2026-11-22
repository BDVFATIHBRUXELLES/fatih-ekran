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
  { tip: "kampanya", sure: 60 }
];
