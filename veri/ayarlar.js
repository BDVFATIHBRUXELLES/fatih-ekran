/* Fatih Ekran ayarları. Metinleri ve süreleri buradan değiştirin; sayfaya dokunmaya gerek yok. */
window.FATIH_AYARLAR = {
  camiAdi: "Bruxelles Fatih Camii",
  site: "bxlfatih.com",
  saatDilimi: "Europe/Brussels",

  /* Renk: "acik" = açık mavi, "canli" = canlı mavi, "zumrut" = zümrüt yeşili */
  tema: "acik",
  /* Yazı karakteri: "modern", "zarif" veya "yumusak" */
  yazi: "modern",
  /* Yerleşim: "yari" = ekran ikiye bölünür, "ucte-bir" = içerik dar, bilgi alanı geniş */
  yerlesim: "yari",

  /*
    Sabit yan sayfa (başkanın isteği 24.11.2026): tanımlıysa namaz vakitleri üstte tek şerit olur,
    ekranın sağ yarısında bu sayfa (bağış havuzu) hep durur, sol yarıda içerik döner.
    bit = son gün; geçince ekran kendiliğinden eski yarı yarıya düzene (vakitler sağda) döner.
    Bu satır silinirse de eski düzen geri gelir.
  */
  yanSayfa: { dosya: "havuz/ekran.html?duzen=yan&v=1", bit: "2026-12-31" },

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
    Süre başkanın isteğiyle her vakitte 10 dakika (10 dakikayı geçmesin).
    Başlangıç (bas) hâlâ varsayım: ekran vakit girer girmez açılıyor; cemaat saatleri gelince düzeltilecek.
  */
  namazModu: {
    imsak:  null,
    ogle:   { bas: 0, sure: 10 },
    ikindi: { bas: 0, sure: 10 },
    aksam:  { bas: 0, sure: 10 },
    yatsi:  { bas: 0, sure: 10 }
  },

  /*
    Sabah namazı cemaatle, güneşin doğuşundan şu kadar dakika önce kılınır (başkanın verdiği bilgi).
    Ekranda vakit listesinde ayrı satırda görünür ve geri sayıma girer.
    sure = bu saatte namaz modunun kaç dakika süreceği (başkanın isteği: 10 dakikayı geçmesin).
  */
  sabahNamazi: { gunestenOnce: 45, sure: 10 },

  /*
    5 Ek Bina kampanyası. Kalan gün her gün kendiliğinden hesaplanır.
    Oran ve tutarlar bağış havuzundan gelir (veri/havuz.json, gerçek sayım; başkanın isteği 24.11.2026).
    Havuz okunamazsa bxlfatih.com ana sayfasından saatte bir okunan değerler (veri/kampanya.js),
    o da yoksa buradaki yuzde kullanılır.
    Son gün geçince kampanya kartı ve duyurusu kendiliğinden kalkar.
  */
  kampanya: {
    baslik: "5 Ek Bina",
    altBaslik: "5 bina, 5 güzel umut",
    sonGun: "2026-12-31",
    yuzde: 65,
    cagri: "Bir tuğla da sen koy",
    adres: "bxlfatih.com/bagis-yap",
    qr: "medya/qr-bagis.png"
  },

  /*
    Köşe QR kodu: alt bandın sağ ucunda her zaman durur (namaz modu dışında). Bağış havuzu sayfasına götürür.
    Tam ekran kartlarda (kampanya, bağış havuzu) kartın kendi QR kodu görünür.
    bit = son gün; geçince kendiliğinden kalkar. ekran: ["mescit"] ya da ["cay"] yazılırsa yalnızca o ekranda görünür.
  */
  koseQr: { gorsel: "medya/qr-havuz.png", ust: "Bağış", alt: "için okutun", bit: "2026-12-31" },

  /* Tam ekran videonun altındaki canlı bantta (playlist: tam: true, bant: true) QR kodu ve yanındaki yazı.
     Kalan gün, havuzda biriken ve hedefe kalan tutar kendiliğinden gelir. */
  videoBant: { qr: "medya/qr-havuz.png", cagri: "Bağış için\nokutun", adres: "bxlfatih.com/havuz" },

  /* Web sitesi kartı */
  siteKarti: {
    ust: "Camimiz internette",
    adres: "bxlfatih.com",
    metin: "Haberler, faaliyetler, eğitim ve 5 Bina Projesi",
    qr: "medya/qr-site.png",
    qrYazi: "Telefonunuzun kamerasıyla okutun",
    sosyal: [
      { ad: "Instagram", hesap: "bruksel.fatih.camii" },
      { ad: "YouTube", hesap: "@bxlfatihcamii" },
      { ad: "TikTok", hesap: "@fatihcamii_bxl" }
    ]
  },

  /*
    Bilgi kartları: bir kurumu ya da hizmeti maddelerle tanıtır.
    Belçika Diyanet Vakfı bilgilerinin kaynağı: diyanet.be (23.11.2026).
  */
  bilgiKartlari: {
    bdv: {
      logo: "medya/logo-beyaz.png",
      ust: "1982'den bu yana",
      baslik: "Belçika Diyanet Vakfı",
      maddeler: [
        "73 cami ve yüzden fazla dernek",
        "Cenaze Nakil Fonu: 38.000 kayıtlı aile",
        "Hac ve umre organizasyonları",
        "Eğitim: yaklaşık 5.000 öğrenci",
        "Hukuk danışmanlığı ve sosyal hizmetler"
      ],
      adres: "diyanet.be",
      not: "+32 2 218 57 55\ninfo@diyanet.be",
      qr: "medya/qr-bdv.png"
    }
  },

  /*
    Alt bantta sırayla dönen duyurular. {gun} ve {yuzde} kampanyadan kendiliğinden dolar.
    Bir duyuru düz yazı olabilir ya da { metin, bas, bit, ekran } biçiminde yazılabilir:
    bas/bit = ilk ve son gün (YYYY-AA-GG), ekran = ["mescit"] ya da ["cay"].
    Bilgilerin kaynağı: bxlfatih.com (23.11.2026) ve başkanın verdiği saatler.
  */
  duyuruSuresi: 12,
  duyurular: [
    "5 Ek Bina kampanyası: tamamlanan %{yuzde}, kalan süre {gun} gün.",
    "Camimiz her gün sabah 05.30'dan itibaren açıktır.",
    "Sabah namazı, güneşin doğuşundan 45 dakika önce cemaatle kılınır.",
    { metin: "Bir tuğla da sen koy. Bağış için: bxlfatih.com/bagis-yap", bit: "2026-12-31" },
    "Sabah namazından önce vaaz ve sohbet, namazdan sonra çay ocağında buluşuyoruz.",
    { metin: "Bağış hesabı: BE54 0689 5841 5597. Açıklama: Fatih Camii Ek Bina", bit: "2026-12-31" },
    "2026–2027 üyelik: 18 yaş ve üzeri için kişi başı yıllık 30 €. Üye olmak için bxlfatih.com",
    "Çay ocağımız gece 23.00'e kadar açıktır.",
    { metin: "5 Ek Bina ile eğitim ve etüt sınıfları, çok amaçlı salon ve kütüphane kazanıyoruz.", bit: "2026-12-31" },
    "Hafta sonu eğitimimiz 19 Eylül'de 200'den fazla öğrenciyle başladı.",
    "Hanımlar Kolu ve Gençlik Kolu buluşma günleri için WhatsApp: +32 494 12 06 14",
    { metin: "Dedelerimiz bu camiyi tuğla tuğla kurdu. Bir tuğla da sen koy.", bit: "2026-12-31" },
    "2026–2027 eğitim kayıtları tamamlandı. Yeni kayıt dönemi sitemizden duyurulacak.",
    "Bizi takip edin: Instagram bruksel.fatih.camii, YouTube @bxlfatihcamii, TikTok @fatihcamii_bxl",
    "Camimiz 1978'den bu yana Schaerbeek'te hizmet veriyor.",
    "Bir yetkiliyle görüşmek için ziyaretinizden önce arayın: +32 494 12 06 14",
    "Haberler ve faaliyetler için: bxlfatih.com",
    "Belçika Diyanet Vakfı: hac ve umre, cenaze nakil fonu, eğitim ve sosyal hizmetler. diyanet.be",
    "Belçika Diyanet Vakfı bilgi hattı: +32 2 218 57 55, hafta içi 09.30–12.30 ve 14.00–16.00"
  ]
};
