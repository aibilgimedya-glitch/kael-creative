/* KAEL Cookie Consent — minimal, GDPR/KVKK uyumlu */
(function() {
  'use strict';
  const KEY = 'kael-consent';
  const stored = localStorage.getItem(KEY);
  const consent = stored ? JSON.parse(stored) : null;

  // Plausible analytics — privacy-first, cookie-free, KVKK uyumlu
  function loadAnalytics() {
    if (document.querySelector('script[data-domain="kaelcreative.com"]')) return;
    window.plausible = window.plausible || function(){ (window.plausible.q = window.plausible.q || []).push(arguments) };
    const s = document.createElement('script');
    s.defer = true;
    s.dataset.domain = 'kaelcreative.com';
    s.src = 'https://plausible.io/js/script.js';
    document.head.appendChild(s);
  }

  if (consent && consent.analytics) loadAnalytics();
  if (consent) return; // banner gösterme — kullanıcı zaten karar verdi

  // Banner DOM
  const css = `
    .kc-consent{position:fixed;bottom:24px;left:24px;right:24px;max-width:520px;background:rgba(10,6,4,0.96);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(255,237,199,0.18);padding:20px 22px;font-family:'DM Mono',ui-monospace,monospace;color:#FFEDC7;font-size:12px;line-height:1.6;z-index:9999;box-shadow:0 20px 60px rgba(0,0,0,0.5);transform:translateY(40px);opacity:0;transition:transform .5s cubic-bezier(.16,.84,.3,1) .2s,opacity .4s ease .2s;}
    .kc-consent.show{transform:translateY(0);opacity:1;}
    .kc-consent p{margin:0 0 14px;color:rgba(255,237,199,0.85);}
    .kc-consent a{color:#dc5000;text-decoration:none;border-bottom:1px solid #dc5000;}
    .kc-consent a:hover{color:#FFEDC7;border-bottom-color:#FFEDC7;}
    .kc-consent .kc-row{display:flex;flex-wrap:wrap;gap:8px;}
    .kc-consent button{cursor:pointer;border:1px solid rgba(255,237,199,0.3);background:transparent;color:#FFEDC7;padding:8px 14px;font-family:inherit;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;transition:.3s;}
    .kc-consent button:hover{border-color:#dc5000;color:#dc5000;}
    .kc-consent button.kc-primary{background:#dc5000;border-color:#dc5000;color:#fff;}
    .kc-consent button.kc-primary:hover{background:#FFEDC7;color:#dc5000;border-color:#FFEDC7;}
    .kc-consent .kc-close{position:absolute;top:8px;right:10px;border:none;background:transparent;color:rgba(255,237,199,0.4);font-size:14px;padding:4px 6px;letter-spacing:0;}
    .kc-consent .kc-close:hover{color:#dc5000;border:none;}
    @media(max-width:540px){.kc-consent{left:12px;right:12px;bottom:12px;padding:16px 18px;}.kc-consent button{padding:7px 10px;}}
    @media(prefers-reduced-motion:reduce){.kc-consent{transition:none;}}
  `;
  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  const wrap = document.createElement('div');
  wrap.className = 'kc-consent';
  wrap.setAttribute('role','dialog');
  wrap.setAttribute('aria-label','Çerez tercihleri');
  wrap.innerHTML = `
    <button class="kc-close" aria-label="Kapat" type="button">×</button>
    <p>Sitemizde deneyimi iyileştirmek ve performans ölçmek için anonim analitik çerezleri kullanmak istiyoruz. Detay: <a href="cerez-politikasi.html">Çerez Politikası</a></p>
    <div class="kc-row">
      <button class="kc-primary" type="button" data-act="accept">Kabul Et</button>
      <button type="button" data-act="essential">Sadece Zorunlu</button>
      <button type="button" data-act="reject">Reddet</button>
    </div>
  `;
  document.body.appendChild(wrap);
  requestAnimationFrame(() => wrap.classList.add('show'));

  function decide(value) {
    localStorage.setItem(KEY, JSON.stringify(value));
    wrap.classList.remove('show');
    setTimeout(() => wrap.remove(), 500);
    if (value.analytics) loadAnalytics();
  }

  wrap.addEventListener('click', (e) => {
    const act = e.target.getAttribute('data-act');
    if (act === 'accept')    return decide({ essential: true, analytics: true,  marketing: false, ts: Date.now() });
    if (act === 'essential') return decide({ essential: true, analytics: false, marketing: false, ts: Date.now() });
    if (act === 'reject')    return decide({ essential: true, analytics: false, marketing: false, ts: Date.now() });
    if (e.target.classList.contains('kc-close')) return decide({ essential: true, analytics: false, marketing: false, ts: Date.now(), dismissed: true });
  });
})();
