# Odoo otomasyon kuralı "Havuz sayacı (GitHub'dan)" — sunucu eylemi kodu (Python, Odoo'nun güvenli ortamında çalışır)
#
# Kural: model ir.attachment, tetikleyici "Webhook üzerinden", kayıt alıcısı: model.browse(3431)
# (3431 = havuz-veri.json eki; bxlfatih.com/havuz, /cagnotte, /donatiepot sayfaları bunu okur).
# GitHub'daki "Bağış havuzu sayımı" işi her 5 dakikada veri/havuz.json içeriğini bu webhook'a gönderir.
# Kod yalnızca sayısal alanları alır, kendi JSON'unu kurar ve yalnızca bu eki günceller.
# Webhook adresi gizli tutulur (GitHub'da ODOO_HAVUZ_WEBHOOK gizli değişkeni); bu dosyada adres yoktur.
p = payload or {}
on = p.get('online') or {}
bk = p.get('banka') or {}
vals = [p.get('baslangic'), p.get('hedef'), on.get('toplam'), on.get('adet'), bk.get('toplam'), p.get('toplam')]
if not all(isinstance(v, (int, float)) and not isinstance(v, bool) and 0 <= v < 100000000 for v in vals):
    raise UserError("Havuz sayacı: geçersiz veri")
if record.id != 3431:
    raise UserError("Havuz sayacı: yanlış kayıt")
g = ''.join(c for c in str(p.get('guncelleme') or '')[:30] if c in '0123456789-:TZ.')
simdi = datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')
metin = ('{"baslangic": %s, "hedef": %s, "online": {"toplam": %s, "adet": %s}, "banka": {"toplam": %s}, '
         '"toplam": %s, "guncelleme": "%s", "odooYazim": "%s"}') % (
    vals[0], vals[1], vals[2], int(vals[3]), vals[4], vals[5], g, simdi)
record.write({'raw': metin.encode()})
