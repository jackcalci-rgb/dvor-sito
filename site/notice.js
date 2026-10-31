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
    k: ['Natale 2026', 'Christmas 2026', 'Weihnachten 2026', 'Božič 2026', 'Kerst 2026'],
    h: ['Pranzi e cene aziendali di Natale', 'Christmas lunches and dinners for companies', 'Weihnachtsessen für Firmen und Teams', 'Božična kosila in večerje za podjetja', 'Kerstlunches en -diners voor bedrijven'],
    p: ['Per i vostri pranzi e le vostre cene di Natale è online il calcolatore: scegliete il menù, i piatti e gli ospiti e scaricate subito il preventivo in PDF.',
        'Our new calculator is online for your Christmas lunches and dinners: choose the menu, the dishes and the guests, and download your quote as a PDF right away.',
        'Für Ihre Weihnachtsessen gibt es jetzt unseren Rechner: Menü, Gerichte und Gäste wählen und das Angebot sofort als PDF herunterladen.',
        'Za vaša božična kosila in večerje je na voljo naš kalkulator: izberite meni, jedi in goste ter takoj prenesite ponudbo v PDF.',
        'Voor uw kerstlunches en -diners staat onze calculator online: kies het menu, de gerechten en de gasten en download meteen uw offerte als pdf.'],
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
  var SPRIG = '<svg viewBox="0 0 120 36" width="120" height="36" fill="none" aria-hidden="true"><path d="M8 18h104" stroke="#9C7A3C" stroke-width="1"/><g fill="#3F6B45"><path d="M60 18c-6-10-14-11-20-8 4 7 12 10 20 8zM60 18c6-10 14-11 20-8-4 7-12 10-20 8zM60 18c-6 10-14 11-20 8 4-7 12-10 20-8zM60 18c6 10 14 11 20 8-4-7-12-10-20-8z"/></g><g fill="#7A2E22"><circle cx="60" cy="18" r="3.2"/><circle cx="54.5" cy="20.5" r="2.4"/><circle cx="65.5" cy="20.5" r="2.4"/></g></svg>';
  var CSS = '#dvor-nt .nt-box{max-width:30rem;width:100%;max-height:calc(100vh - 2rem);overflow:auto;background:var(--bg,#F6EFE4);color:var(--ink,#2B1D14);box-shadow:0 20px 60px rgba(0,0,0,.5);position:relative;font:400 1rem/1.6 var(--sans,system-ui,sans-serif);border-top:4px solid var(--gold,#9C5A10)}'
    + '#dvor-nt .nt-in{margin:.65rem;border:1px solid var(--line,#D8C6AA);outline:1px solid var(--line,#D8C6AA);outline-offset:3px;padding:1.6rem 1.6rem 1.3rem;text-align:center;position:relative}'
    + '#dvor-nt .nt-sprig{display:block;margin:0 auto .5rem;width:120px;height:36px}'
    + '#dvor-nt .nt-kick{display:block;font:400 .8rem/1 var(--sans,system-ui,sans-serif);letter-spacing:.28em;text-transform:uppercase;color:var(--gold,#9C5A10);margin-bottom:.7rem}'
    + '#dvor-nt h2{margin:0 0 .7rem;font:400 1.9rem/1.15 var(--serif,Georgia,serif);color:var(--ink,#2B1D14)}'
    + '#dvor-nt h2::before,#dvor-nt h2::after{display:none!important;content:none!important}'
    + '#dvor-nt .nt-p{margin:0 0 .9rem}'
    + '#dvor-nt .nt-pk{margin:0 0 1.2rem;font:italic 400 1.15rem/1.5 var(--serif,Georgia,serif);color:var(--green,#7A2E22)}#dvor-nt .nt-pk span.x{display:block}'
    + '#dvor-nt .nt-cta{display:inline-block;cursor:pointer;background:var(--green,#7A2E22);color:var(--on-green,#FBF3E6);border:1px solid var(--green,#7A2E22);padding:.8rem 1.7rem;font:inherit;letter-spacing:.1em;text-transform:uppercase;font-size:.85rem;text-decoration:none}#dvor-nt .nt-cta:hover{filter:brightness(1.15)}'
    + '#dvor-nt .nt-later{display:block;margin:.75rem auto 0;background:none;border:0;color:inherit;opacity:.65;text-decoration:underline;cursor:pointer;font:inherit;font-size:.9rem}'
    + '#dvor-nt .nt-note{margin:1.1rem 0 0;padding-top:.8rem;border-top:1px solid var(--line,#D8C6AA);font-size:.84rem;line-height:1.5;opacity:.8}'
    + '#dvor-nt .nt-x{position:absolute;top:.35rem;right:.5rem;background:none;border:0;color:inherit;font-size:1.8rem;line-height:1;cursor:pointer;padding:.25rem .5rem;z-index:3}'
    + '@media (max-width:420px){#dvor-nt h2{font-size:1.6rem}#dvor-nt .nt-in{padding:1.3rem 1rem 1.1rem}}';
  function show() {
    if (document.getElementById('dvor-nt')) return;
    var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    var o = document.createElement('div'); o.id = 'dvor-nt';
    o.style.cssText = 'position:fixed;inset:0;z-index:99990;background:rgba(20,12,6,.66);display:flex;align-items:center;justify-content:center;padding:1rem;opacity:0;transition:opacity .3s';
    o.innerHTML = '<div class="nt-box" role="dialog" aria-modal="true" aria-labelledby="dvor-nt-h">'
      + '<button type="button" class="nt-x" id="dvor-nt-x" aria-label="Close">&times;</button>'
      + '<div class="nt-in"><span class="nt-sprig">' + SPRIG + '</span>'
      + '<span class="nt-kick">' + sp('k') + '</span>'
      + '<h2 id="dvor-nt-h">' + sp('h') + '</h2>'
      + '<p class="nt-p">' + sp('p') + '</p>'
      + '<p class="nt-pk"><span class="x">' + sp('e') + '</span><span class="x">' + sp('r') + '</span></p>'
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
