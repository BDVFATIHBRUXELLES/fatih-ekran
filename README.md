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
| `veri/vakitler.js` | Namaz vakitleri |
| `veri/surum.js` | Sayfanın sürümü; değişince ekranlar kendini yeniler |
| `veri/kampanya.js` | 5 Ek Bina oranı ve tutarları. Otomatik yazılır, elle değiştirilmez |
| `medya/` | Videolar, görseller, logo |

Ekranlar `playlist.js` dosyasını 2 dakikada, `vakitler.js` dosyasını saatte bir yeniden okur.

## Otomatik işler

- **Kampanya oranı:** `.github/workflows/kampanya.yml` saatte bir bxlfatih.com ana sayfasını okur. "%.. tamamlandı", toplanan tutar, hedef ve "itibarıyla" tarihi değiştiyse `veri/kampanya.js` güncellenir. Sitedeki rakamı değiştirmek yeterlidir.
- **Kalan gün:** Ekran her gün kendisi hesaplar.

## Bilinen eksikler

- `veri/vakitler.js` içindeki vakitler 17.12.2026'ya kadardır ve geçici kaynaktan alınmıştır. Diyanet'in resmî servisine bağlanınca her gün otomatik yenilenecek.
- Namaz modu süreleri varsayımdır, cemaat saatlerine göre düzeltilecek.

Bu depo herkese açıktır. Yalnızca yayın onayı verilmiş içerik eklenir; şifre ve kişisel bilgi konmaz.
