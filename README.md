# Fatih Ekran

Bruxelles Fatih Camii'nin mescit ve çay ocağı ekranları: namaz vakitleri, geri sayım, duyurular ve onaylı videolar.

## Ekran adresleri

- Mescit: `mescit.html` (tam ekran, namaz modu açık)
- Çay ocağı: `cay.html` (tam ekran, namaz modu kapalı)
- Ön izleme: `index.html` (altta deneme düğmeleri var)

## Neyi nereden değiştiririm

| Dosya | İçerik |
|---|---|
| `veri/ayarlar.js` | Duyurular, renk, yazı karakteri, namaz modu süreleri |
| `veri/playlist.js` | Ekranda dönecek videolar ve görseller |
| `veri/vakitler.js` | Namaz vakitleri |
| `medya/` | Videolar, görseller, logo |

Ekranlar `playlist.js` dosyasını 5 dakikada, `vakitler.js` dosyasını saatte bir yeniden okur.

## Bilinen eksikler

- `veri/vakitler.js` içindeki vakitler 17.12.2026'ya kadardır ve geçici kaynaktan alınmıştır. Diyanet'in resmî servisine bağlanınca her gün otomatik yenilenecek.
- Ekranda şu an 22.11.2026 sabah namazı videosu dönüyor.
- Namaz modu süreleri varsayımdır, cemaat saatlerine göre düzeltilecek.

Bu depo herkese açıktır. Yalnızca yayın onayı verilmiş içerik eklenir; şifre ve kişisel bilgi konmaz.
