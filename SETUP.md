# KAEL Landing — Deploy Öncesi Setup

3 entegrasyon noktası var. Hepsi opsiyonel, ama hepsi yapılırsa form çalışır + analytics gelir.

---

## 1. ⚡ Web3Forms — İletişim Formu (KRİTİK)

Şu an form **mailto fallback** modunda — kullanıcı butona basınca e-posta uygulaması açılıyor. Web3Forms key'i yapıştırılırsa **sessiz arka plan POST** + yeşil "Brifi aldık" başarı mesajı çalışır.

### Adımlar

1. **Kayıt:** https://web3forms.com → "Get Started Free" → ai.bilgimedya@gmail.com ile aktive et
2. **Access Key al:** Dashboard → "Create Access Key" → kopyala (UUID formatında, örn: `a1b2c3d4-...`)
3. **index.html içine yapıştır:** Tek satır değiştirilecek:

```html
<input type="hidden" name="access_key" value="REPLACE_WITH_WEB3FORMS_ACCESS_KEY">
```
↓
```html
<input type="hidden" name="access_key" value="a1b2c3d4-xxxx-xxxx-xxxx-xxxxxxxxxxxx">
```

4. **Test et:** Local'de form doldur, gönder. ai.bilgimedya@gmail.com'a mail düşmeli.

### Free Tier Limitleri
- 250 submission/ay (yeterli — günlük ~8 lead)
- Spam koruma: dahili
- Webhook + Slack + Discord + Telegram entegrasyonu (paid)

### Honeypot Aktif Mi?
Evet — `<input name="botcheck">` formda gizli. Bot doldurursa Web3Forms otomatik reddeder.

---

## 2. 📊 Analytics — 2 Seçenek

### Seçenek A: Plausible (Önerilen — KVKK uyumlu, cookieless)

1. **Kayıt:** https://plausible.io → 30 gün ücretsiz deneme, sonra $9/ay
2. **Site ekle:** Domain: `kaelcreative.com`
3. **`_consent.js` aç:** `loadAnalytics()` fonksiyonunda yorum satırını kaldır:

```javascript
function loadAnalytics() {
  window.plausible = window.plausible || function(){(window.plausible.q=window.plausible.q||[]).push(arguments)};
  const s = document.createElement('script');
  s.defer = true; s.dataset.domain = 'kaelcreative.com';
  s.src = 'https://plausible.io/js/script.js';
  document.head.appendChild(s);
}
```

**Neden Plausible?**
- KVKK + GDPR uyumlu (cookie YOK, IP anonim)
- Cookie banner tetiklemez (sadece kabul ettiyse yüklenir — biz yine de banner'da gating yapıyoruz)
- Hafif (~1KB), Lighthouse'a etki yok

### Seçenek B: Google Analytics 4 (Ücretsiz)

1. **GA4 hesabı:** https://analytics.google.com → Property: `KAEL Creative`
2. **Measurement ID al:** `G-XXXXXXXXXX` formatında
3. **`_consent.js` içinde GA4 yükleme kodu ekle:**

```javascript
function loadAnalytics() {
  const GA_ID = 'G-XXXXXXXXXX'; // ← Kendi ID'ni yaz
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function(){dataLayer.push(arguments);};
  gtag('js', new Date());
  gtag('config', GA_ID, { anonymize_ip: true });
}
```

**Not:** GA4 cookie kullanır — KVKK için **kullanıcı kabul etmeden yüklenmez** (consent banner zaten gating yapıyor ✓).

---

## 3. 🚀 Vercel Deploy

### İlk Deploy
```bash
cd /Users/yigit/Desktop/CreativeStudio/kael_studio/marka_varliklari/landing
vercel --prod
```

### Domain Bağlama
1. Vercel dashboard → Project Settings → Domains
2. `kaelcreative.com` ekle
3. DNS provider'da A record / CNAME işle (Vercel rehberlik eder)
4. SSL otomatik (Let's Encrypt)

### vercel.json İçindeki Hazır Ayarlar
- ✅ HSTS (2 yıl, includeSubDomains, preload)
- ✅ CSP (Web3Forms + Plausible + GA4 izinli)
- ✅ X-Frame-Options, X-Content-Type-Options, Referrer, Permissions
- ✅ Cache: static asset 1 yıl immutable, HTML revalidate
- ✅ Redirects: /kvkk, /privacy, /cookies, /terms (kısa URL'ler)

### Deploy Sonrası Doğrulama
```bash
# Audit gerçek HTTPS ile
python3 tools/site_audit.py https://kaelcreative.com -o _audit_prod.md
```

Beklenen skor: **85-95+** (Lighthouse devreye girince).

---

## 4. 📋 Pre-Launch Checklist

- [ ] Web3Forms access_key index.html'e yapıştırıldı
- [ ] Form local'de test edildi (mail düştü mü?)
- [ ] Plausible veya GA4 ID `_consent.js`'ye eklendi
- [ ] Cookie banner test edildi (kabul/red/sadece zorunlu — 3 buton)
- [ ] KVKK checkbox formda zorunlu
- [ ] Mobile (375px) form kullanılabilir
- [ ] vercel.json hazır → `vercel --prod`
- [ ] Domain DNS yapıldı, SSL aktif
- [ ] Google Search Console'a site eklendi + sitemap.xml submit
- [ ] Plausible/GA4'te ilk pageview göründü
- [ ] Sosyal medya linkleri schema.org sameAs'a eklendi (LinkedIn, X, IG)

---

## 5. 🧪 Form Test Senaryoları

### Senaryo 1: Boş gönderim
- Hiçbir şey doldurma → "BRİFİ GÖNDER" → "Ad-soyad gerekli." mesajı

### Senaryo 2: KVKK kabul yok
- Tüm alanları doldur, KVKK işaretleme → "KVKK onayı gerekli."

### Senaryo 3: Geçerli submit (Web3Forms aktifse)
- Tümünü doldur → submit → button "GÖNDERİLİYOR..." → ~1 sn → form kaybolur, "✓ BRİFİ ALDIK" görünür → mail kutuna düşer

### Senaryo 4: Web3Forms key yoksa veya hata verirse
- Submit → mailto açılır (kullanıcı uygulaması) → 800 ms sonra success ekranı

### Senaryo 5: Spam bot (honeypot)
- Bot `botcheck` checkbox'ı doldurursa → Web3Forms otomatik reddeder, mail düşmez

---

## 6. 🔮 İleri Sprint (Opsiyonel)

- **Email auto-reply:** Web3Forms paid plan ($10/ay) ile teşekkür e-postası
- **Slack webhook:** Form geldiğinde Slack #leads kanalına ping
- **Telegram bot:** ai.bilgimedya@gmail.com yerine direkt telefonuna bildirim
- **CRM entegrasyonu:** Notion DB'ye otomatik kayıt (Make/n8n ile)
- **Form analytics:** Hangi alan boş bırakılıyor, hangi cihaz, hangi saat
