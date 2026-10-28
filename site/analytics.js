/* Umami (statistiche senza cookie, non serve il consenso). Per attivarlo basta incollare qui sotto il
   "Website ID" che si trova nel pannello di Umami. Se vuoto, non succede nulla. */
(function () {
  var UMAMI_ID = 'a3f8ca53-e0de-486f-90b3-46fd79783321', UMAMI_SRC = 'https://cloud.umami.is/script.js';
  if (!UMAMI_ID) return;
  var s = document.createElement('script'); s.defer = true; s.src = UMAMI_SRC; s.setAttribute('data-website-id', UMAMI_ID);
  document.head.appendChild(s);
  // eventi: clic su Prenota / Odoo, telefono, WhatsApp, email, scarico PDF
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]'); if (!a || !window.umami) return;
    var h = a.getAttribute('href') || '', n = '';
    if (h.indexOf('prenota.osteriadvor.com') >= 0 || h.indexOf('dvor.odoo.com') >= 0 || /(^|\/)prenota\.html/.test(h)) n = 'prenota';
    else if (h.indexOf('tel:') === 0) n = 'telefono';
    else if (h.indexOf('wa.me') >= 0) n = 'whatsapp';
    else if (h.indexOf('mailto:') === 0) n = 'email';
    else if (/\.pdf($|\?)/i.test(h)) n = 'pdf';
    else if (/(^|\/)preventivo\.html/.test(h)) n = 'preventivo';
    if (n) window.umami.track(n, { link: h.slice(0, 80) });
  }, true);
})();

/* Google Analytics 4 con consenso (GDPR): il tag si carica SOLO se l'ospite accetta.
   Per cambiare ID basta modificare la riga GA_ID. Se vuoto, nessun banner e nessun tracciamento. */
(function () {
  var GA_ID = 'G-YPB97TQ2E8', KEY = 'dvor-consent';
  if (!GA_ID) return;
  function get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function set(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  function load() {
    if (window.__dvorGA) return; window.__dvorGA = 1;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { dataLayer.push(arguments); };
    gtag('js', new Date());
    gtag('config', GA_ID, { anonymize_ip: true });
    var s = document.createElement('script'); s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID; document.head.appendChild(s);
  }
  function drop() {
    // se in precedenza era stato accettato, cancella i cookie di Google Analytics
    document.cookie.split(';').forEach(function (c) {
      var n = c.split('=')[0].trim();
      if (n === '_ga' || n.indexOf('_ga_') === 0) {
        ['', '.' + location.hostname, '.' + location.hostname.replace(/^www\./, '')].forEach(function (d) {
          document.cookie = n + '=; Max-Age=0; path=/' + (d ? '; domain=' + d : '');
        });
      }
    });
  }
  var T = {
    t: ['Usiamo Google Analytics per capire come viene usato il sito e migliorarlo, solo se acconsenti.',
        'We use Google Analytics to understand how the site is used and improve it, only if you agree.',
        'Wir verwenden Google Analytics, um die Nutzung der Website zu verstehen und sie zu verbessern, nur mit deiner Einwilligung.',
        'Uporabljamo Google Analytics, da razumemo uporabo spletnega mesta in ga izboljšamo, le z vašim soglasjem.',
        'We gebruiken Google Analytics om te begrijpen hoe de site wordt gebruikt en om hem te verbeteren, alleen met je toestemming.'],
    p: ['Privacy policy', 'Privacy policy', 'Datenschutz', 'Zasebnost', 'Privacy'],
    a: ['Accetta', 'Accept', 'Akzeptieren', 'Sprejmem', 'Accepteren'],
    r: ['Rifiuta', 'Decline', 'Ablehnen', 'Zavrnem', 'Weigeren']
  };
  var L = ['it', 'en', 'de', 'sl', 'nl'];
  function spans(k) { return L.map(function (l, i) { return '<span class="' + l + '" lang="' + l + '">' + T[k][i] + '</span>'; }).join(''); }
  function banner() {
    if (document.getElementById('dvor-cc')) return;
    var d = document.createElement('div'); d.id = 'dvor-cc'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-label', 'Cookie');
    d.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:99999;background:var(--bg,#F6EFE4);color:var(--ink,#2B1D14);border-top:1px solid var(--line,#D8C6AA);box-shadow:0 -6px 24px rgba(0,0,0,.18);padding:1rem 1.25rem calc(1rem + env(safe-area-inset-bottom,0px));font:400 .95rem/1.5 var(--sans,system-ui,sans-serif)';
    d.innerHTML = '<div style="max-width:1180px;margin:0 auto;display:flex;flex-wrap:wrap;gap:.75rem 1.5rem;align-items:center;justify-content:space-between"><p style="margin:0;flex:1 1 360px">' + spans('t') + ' <a href="privacy.html" style="text-decoration:underline">' + spans('p') + '</a></p><div style="display:flex;gap:.6rem"><button type="button" id="dvor-cc-n" style="cursor:pointer;background:transparent;color:inherit;border:1px solid currentColor;padding:.6rem 1.2rem;font:inherit;letter-spacing:.08em">' + spans('r') + '</button><button type="button" id="dvor-cc-y" style="cursor:pointer;background:var(--green,#7A2E22);color:var(--on-green,#FBF3E6);border:1px solid var(--green,#7A2E22);padding:.6rem 1.2rem;font:inherit;letter-spacing:.08em">' + spans('a') + '</button></div></div>';
    document.body.appendChild(d);
    d.querySelector('#dvor-cc-y').onclick = function () { set('granted'); d.remove(); load(); };
    d.querySelector('#dvor-cc-n').onclick = function () { set('denied'); d.remove(); drop(); };
  }
  window.dvorCookies = function () { var b = document.getElementById('dvor-cc'); if (b) b.remove(); banner(); };
  function link() {
    var lg = document.querySelector('.legal'); if (!lg || document.getElementById('dvor-cc-l')) return;
    var sp = document.createElement('span'); sp.id = 'dvor-cc-l';
    var N = ['Preferenze cookie', 'Cookie preferences', 'Cookie-Einstellungen', 'Nastavitve piškotkov', 'Cookievoorkeuren'];
    sp.innerHTML = '<a href="#" onclick="dvorCookies();return false">' + L.map(function (l, i) { return '<span class="' + l + '" lang="' + l + '">' + N[i] + '</span>'; }).join('') + '</a>';
    lg.appendChild(sp);
  }
  function init() { link(); var c = get(); if (c === 'granted') load(); else if (c === 'denied') drop(); else banner(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
