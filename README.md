# Fatih Ekran

Bruxelles Fatih Camii'nin mescit ve çay ocağı ekranları: namaz vakitleri, geri sayım, duyurular ve onaylı videolar.

## Ekran adresleri

- Mescit: `mescit.html` (tam ekran, namaz modu açık)
- Çay ocağı: `cay.html` (tam ekran, namaz modu kapalı)
- Ön izleme: `index.html` (altta deneme düğmeleri var)

## Neyi nereden değiştiririm

| Dosya | İçerik |
|---|---|
| `veri/ayarlar.js` | Duyurular, renk, yazı karakteri, namaz modu süreleri, 5 Ek Bina kampanyası (son gün, toplanan oran) |
| `veri/playlist.js` | Ekranda dönecek videolar ve görseller |
| `veri/vakitler.js` | Namaz vakitleri ve hicri tarihler. Otomatik yazılır |
| `veri/gunun-sozu.js` | Günün ayeti, hadisi ve duası. Otomatik yazılır |
| `veri/surum.js` | Sayfanın sürümü; değişince ekranlar kendini yeniler |
| `veri/kampanya.js` | 5 Ek Bina oranı ve tutarları. Otomatik yazılır, elle değiştirilmez |
| `medya/` | Videolar, görseller, logo |

Ekranlar `playlist.js` dosyasını 2 dakikada, `vakitler.js` dosyasını saatte bir yeniden okur.

## Otomatik işler

- **Kampanya oranı:** `.github/workflows/kampanya.yml` saatte bir bxlfatih.com ana sayfasını okur. "%.. tamamlandı", toplanan tutar, hedef ve "itibarıyla" tarihi değiştiyse `veri/kampanya.js` güncellenir. Sitedeki rakamı değiştirmek yeterlidir.
- **Namaz vakitleri, hicri tarih, günün ayeti ve hadisi:** `.github/workflows/diyanet.yml` günde dört kez Diyanet İşleri Başkanlığı'nın sayfalarını okur (`namazvakitleri.diyanet.gov.tr` Brüksel tablosu ve `diyanet.gov.tr` günlük içerik). `veri/vakitler.js` ve `veri/gunun-sozu.js` dosyalarını yazar.
- **Kalan gün:** Ekran her gün kendisi hesaplar.

## Bilinen eksikler

- Namaz modu süreleri varsayımdır, cemaat saatlerine göre düzeltilecek.

Bu depo herkese açıktır. Yalnızca yayın onayı verilmiş içerik eklenir; şifre ve kişisel bilgi konmaz.
