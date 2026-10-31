/* Avviso a comparsa (pop-up): calcolatore pranzi e cene aziendali di Natale.
   Per cambiarlo o spegnerlo modifica solo le righe qui sotto.
   Compare una volta per visita, solo nel periodo START-END (inclusi). Non compare sulla pagina del calcolatore. */
(function () {
  var START = '2026-10-31', END = '2026-12-23', KEY = 'dvor-notice-natale26', HREF = 'cene-aziendali.html#natale-calc';
  var today = new Date(); var iso = today.getFullYear() + '-' + ('0' + (today.getMonth() + 1)).slice(-2) + '-' + ('0' + today.getDate()).slice(-2);
  if (iso < START || iso > END) return;
  if (/cene-aziendali/.test(location.pathname)) return;
  try { if (sessionStorage.getItem(KEY)) return; } catch (e) {}
  var L = ['it', 'en', 'de', 'sl', 'nl'];
  var T = {
    k: ['Novità · Natale 2026', 'New · Christmas 2026', 'Neu · Weihnachten 2026', 'Novo · Božič 2026', 'Nieuw · Kerst 2026'],
    h: ['Pranzi e cene aziendali di Natale', 'Christmas lunches and dinners for companies', 'Weihnachtsessen für Firmen und Teams', 'Božična kosila in večerje za podjetja', 'Kerstlunches en -diners voor bedrijven'],
    p: ['Calcola il tuo preventivo in pochi minuti: scegli il pacchetto, i piatti e gli ospiti e scarica subito il PDF.',
        'Calculate your quote in a few minutes: choose the package, the dishes and the guests, and download the PDF right away.',
        'Berechnen Sie Ihr Angebot in wenigen Minuten: Paket, Gerichte und Gäste wählen und das PDF sofort herunterladen.',
        'Izračunajte ponudbo v nekaj minutah: izberite paket, jedi in goste ter takoj prenesite PDF.',
        'Bereken je offerte in een paar minuten: kies het pakket, de gerechten en de gasten en download meteen de pdf.'],
    e: ['Essential da 45 € a persona', 'Essential from € 45 per person', 'Essential ab 45 € pro Person', 'Essential od 45 € na osebo', 'Essential vanaf € 45 per persoon'],
    r: ['Premium da 65 € a persona', 'Premium from € 65 per person', 'Premium ab 65 € pro Person', 'Premium od 65 € na osebo', 'Premium vanaf € 65 per persoon'],
    n: ['Nota: a novembre, ogni domenica (1, 8, 15, 22 e 29) la cucina chiude alle 19:00. Per eventi e gruppi contattaci.',
        'Note: in November, every Sunday (1, 8, 15, 22 and 29) the kitchen closes at 7:00 pm. For events and groups, contact us.',
        'Hinweis: Im November schließt die Küche jeden Sonntag (1., 8., 15., 22. und 29.) um 19:00 Uhr. Für Veranstaltungen und Gruppen kontaktieren Sie uns.',
        'Opomba: novembra kuhinja vsako nedeljo (1., 8., 15., 22. in 29.) zapre ob 19.00. Za dogodke in skupine nas kontaktirajte.',
        'Let op: in november sluit de keuken elke zondag (1, 8, 15, 22 en 29) om 19:00 uur. Neem voor evenementen en groepen contact op.'],
    b: ['Calcola il preventivo', 'Calculate the quote', 'Angebot berechnen', 'Izračunaj ponudbo', 'Offerte berekenen'],
    c: ['Più tardi', 'Later', 'Später', 'Pozneje', 'Later']
  };
  function sp(k) { return L.map(function (l, i) { return '<span class="' + l + '" lang="' + l + '">' + T[k][i] + '</span>'; }).join(''); }
  var FLAKE = '<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M12 2v20M3.3 7l17.4 10M3.3 17L20.7 7M9 3.6l3 2.4 3-2.4M9 20.4l3-2.4 3 2.4M3 9.6l3.6.9-.5 3.5M21 14.4l-3.6-.9.5-3.5M3.6 15l3 -2M20.4 9l-3 2"/></svg>';
  var BAUBLE = '<svg viewBox="0 0 40 52" width="100%" height="100%"><rect x="17" y="0" width="6" height="9" rx="1" fill="#C9A24B"/><circle cx="20" cy="31" r="19" fill="#A42B20"/><path d="M6 24q14 8 28 0M5 33q15 9 30 0" stroke="#E3C26A" stroke-width="2" fill="none"/><circle cx="13" cy="23" r="4" fill="#fff" opacity=".28"/></svg>';
  var TREE = '<svg viewBox="0 0 48 60" width="100%" height="100%"><path d="M24 4l-4 8h3l-8 12h5l-10 14h8L9 52h30L27 38h8L25 24h5L22 12h3z" fill="#2F6B3F"/><rect x="21" y="52" width="6" height="7" fill="#6B4423"/><path d="M24 0l1.6 3.6 3.9.4-2.9 2.6.8 3.8L24 8.4 20.6 10.4l.8-3.8-2.9-2.6 3.9-.4z" fill="#E3C26A"/><circle cx="19" cy="30" r="2" fill="#A42B20"/><circle cx="28" cy="40" r="2" fill="#E3C26A"/><circle cx="21" cy="46" r="2" fill="#A42B20"/></svg>';
  var CSS = '#dvor-nt .nt-box{max-width:31rem;width:100%;max-height:calc(100vh - 2rem);overflow:auto;background:var(--bg,#F6EFE4);color:var(--ink,#2B1D14);box-shadow:0 20px 60px rgba(0,0,0,.5);position:relative;font:400 1rem/1.6 var(--sans,system-ui,sans-serif);border-radius:2px}'
    + '#dvor-nt .nt-top{height:9px;background:repeating-linear-gradient(135deg,#A42B20 0 14px,#F6EFE4 14px 22px,#2F6B3F 22px 36px,#F6EFE4 36px 44px)}'
    + '#dvor-nt .nt-in{padding:1.6rem 1.75rem 1.4rem;text-align:center;position:relative}'
    + '#dvor-nt .nt-garland{display:flex;justify-content:center;gap:1.1rem;margin:-.2rem 0 .6rem}#dvor-nt .nt-garland i{display:block;width:26px;height:34px}#dvor-nt .nt-garland i:nth-child(2n){transform:translateY(5px) scale(.85)}'
    + '#dvor-nt .nt-kick{display:inline-block;background:#A42B20;color:#fff;font:600 .72rem/1 var(--sans,system-ui,sans-serif);letter-spacing:.16em;text-transform:uppercase;padding:.45rem .8rem;margin-bottom:.8rem}'
    + '#dvor-nt h2{margin:0 0 .6rem;font:400 1.85rem/1.15 var(--serif,Georgia,serif);color:var(--green,#7A2E22)}'
    + '#dvor-nt h2::before,#dvor-nt h2::after{display:none!important;content:none!important}'
    + '#dvor-nt .nt-p{margin:0 0 1rem}'
    + '#dvor-nt .nt-pk{display:flex;gap:.6rem;justify-content:center;flex-wrap:wrap;margin:0 0 1.15rem}#dvor-nt .nt-pk span.x{display:inline-block;border:1px solid #2F6B3F;color:#2F6B3F;padding:.4rem .8rem;font-weight:600;font-size:.92rem;background:rgba(47,107,63,.07)}'
    + '#dvor-nt .nt-pk span.x:last-child{border-color:#A42B20;color:#A42B20;background:rgba(164,43,32,.06)}'
    + '#dvor-nt .nt-cta{display:inline-block;cursor:pointer;background:#A42B20;color:#fff;border:1px solid #A42B20;padding:.85rem 1.8rem;font:600 1rem var(--sans,system-ui,sans-serif);letter-spacing:.06em;text-decoration:none;box-shadow:0 4px 14px rgba(164,43,32,.35)}#dvor-nt .nt-cta:hover{background:#8a2218}'
    + '#dvor-nt .nt-later{display:block;margin:.8rem auto 0;background:none;border:0;color:inherit;opacity:.7;text-decoration:underline;cursor:pointer;font:inherit;font-size:.92rem}'
    + '#dvor-nt .nt-note{margin:1.1rem 0 0;padding-top:.9rem;border-top:1px dashed var(--line,#D8C6AA);font-size:.85rem;line-height:1.5;opacity:.8}'
    + '#dvor-nt .nt-x{position:absolute;top:.55rem;right:.7rem;background:none;border:0;color:inherit;font-size:1.8rem;line-height:1;cursor:pointer;padding:.25rem .5rem;z-index:3}'
    + '#dvor-nt .nt-snow{position:absolute;inset:0;overflow:hidden;pointer-events:none;color:#9bb7c9}#dvor-nt .nt-snow b{position:absolute;top:-24px;display:block;opacity:.55;animation:dvorsnow linear infinite}'
    + '@keyframes dvorsnow{to{transform:translateY(560px) rotate(180deg)}}'
    + '@media (prefers-reduced-motion:reduce){#dvor-nt .nt-snow b{animation:none;top:12%}}'
    + '@media (max-width:420px){#dvor-nt h2{font-size:1.55rem}#dvor-nt .nt-in{padding:1.4rem 1.2rem 1.2rem}}';
  function snow() {
    var s = '', sizes = [14, 10, 18, 12, 16, 9, 13, 15];
    for (var i = 0; i < 8; i++) s += '<b style="left:' + (6 + i * 12) + '%;width:' + sizes[i] + 'px;height:' + sizes[i] + 'px;animation-duration:' + (7 + (i * 5) % 6) + 's;animation-delay:-' + (i * 1.3) + 's">' + FLAKE + '</b>';
    return '<div class="nt-snow" aria-hidden="true">' + s + '</div>';
  }
  function show() {
    if (document.getElementById('dvor-nt')) return;
    var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    var o = document.createElement('div'); o.id = 'dvor-nt';
    o.style.cssText = 'position:fixed;inset:0;z-index:99990;background:rgba(20,12,6,.66);display:flex;align-items:center;justify-content:center;padding:1rem;opacity:0;transition:opacity .3s';
    o.innerHTML = '<div class="nt-box" role="dialog" aria-modal="true" aria-labelledby="dvor-nt-h"><div class="nt-top"></div>' + snow()
      + '<button type="button" class="nt-x" id="dvor-nt-x" aria-label="Close">&times;</button>'
      + '<div class="nt-in"><div class="nt-garland" aria-hidden="true"><i>' + BAUBLE + '</i><i>' + TREE + '</i><i>' + BAUBLE + '</i></div>'
      + '<span class="nt-kick">' + sp('k') + '</span>'
      + '<h2 id="dvor-nt-h">' + sp('h') + '</h2>'
      + '<p class="nt-p">' + sp('p') + '</p>'
      + '<div class="nt-pk"><span class="x">' + sp('e') + '</span><span class="x">' + sp('r') + '</span></div>'
      + '<a class="nt-cta" id="dvor-nt-b" href="' + HREF + '">' + sp('b') + '</a>'
      + '<button type="button" class="nt-later" id="dvor-nt-l">' + sp('c') + '</button>'
      + '<p class="nt-note">' + sp('n') + ' <a href="tel:+390481090740" style="text-decoration:underline;white-space:nowrap">+39 0481 090740</a> · <a href="mailto:info@osteriadvor.com" style="text-decoration:underline">info@osteriadvor.com</a></p></div></div>';
    document.body.appendChild(o);
    var prev = document.activeElement;
    function close() { try { sessionStorage.setItem(KEY, '1'); } catch (e) {} document.removeEventListener('keydown', key); o.style.opacity = 0; setTimeout(function () { o.remove(); if (prev && prev.focus) prev.focus(); }, 300); }
    function key(e) { if (e.key === 'Escape') close(); }
    document.addEventListener('keydown', key);
    o.addEventListener('click', function (e) { if (e.target === o) close(); });
    o.querySelector('#dvor-nt-l').onclick = close; o.querySelector('#dvor-nt-x').onclick = close;
    o.querySelector('#dvor-nt-b').addEventListener('click', function () { try { sessionStorage.setItem(KEY, '1'); } catch (e) {} });
    requestAnimationFrame(function () { o.style.opacity = 1; o.querySelector('#dvor-nt-b').focus(); });
  }
  function init() { setTimeout(show, 900); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
