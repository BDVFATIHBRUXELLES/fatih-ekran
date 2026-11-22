/* Fatih Ekran ayarları. Metinleri ve süreleri buradan değiştirin; sayfaya dokunmaya gerek yok. */
window.FATIH_AYARLAR = {
  camiAdi: "Bruxelles Fatih Camii",
  site: "bxlfatih.com",
  saatDilimi: "Europe/Brussels",

  /* Renk: "acik" = açık mavi, "canli" = canlı mavi, "zumrut" = zümrüt yeşili */
  tema: "acik",
  /* Yazı karakteri: "modern", "zarif" veya "yumusak" */
  yazi: "modern",

  /* Her mekânın ekranı ayrı davranır. */
  ekranlar: {
    mescit: { ad: "Mescit", sesli: false, namazModu: true },
    cay:    { ad: "Çay ocağı", sesli: false, namazModu: false }
  },

  /*
    Namaz modu: video durur, ekranda yalnızca sade vakit tablosu kalır.
    bas  = vakit girdikten kaç dakika sonra başlasın
    sure = kaç dakika sürsün
    null = o vakitte namaz modu yok
    BU SÜRELER VARSAYIMDIR — caminin cemaat saatlerine göre düzeltilecek.
  */
  namazModu: {
    imsak:  null,
    ogle:   { bas: 0, sure: 25 },
    ikindi: { bas: 0, sure: 20 },
    aksam:  { bas: 0, sure: 20 },
    yatsi:  { bas: 0, sure: 25 }
  },

  /* Alt bantta sırayla dönen duyurular. */
  duyuruSuresi: 12,
  duyurular: [
    "Camimiz her gün sabah 05.30'dan itibaren açıktır.",
    "Sabah namazından önce vaaz ve sohbet, namazdan sonra çay ocağında buluşuyoruz.",
    "Çay ocağımız gece 23.00'e kadar açıktır."
  ]
};
