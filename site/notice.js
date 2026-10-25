/* Avviso a comparsa (pop-up). Per cambiarlo o spegnerlo modifica solo le righe qui sotto.
   Compare una volta per visita, solo nel periodo START–END (inclusi). */
(function () {
  var START = '2026-10-25', END = '2026-11-30', KEY = 'dvor-notice-nov26';
  var today = new Date(); var iso = today.getFullYear() + '-' + ('0' + (today.getMonth() + 1)).slice(-2) + '-' + ('0' + today.getDate()).slice(-2);
  if (iso < START || iso > END) return;
  try { if (sessionStorage.getItem(KEY)) return; } catch (e) {}
  var L = ['it', 'en', 'de', 'sl', 'nl'];
  var T = {
    h: ['Avviso: le domeniche di novembre', 'Notice: Sundays in November', 'Hinweis: Sonntage im November', 'Obvestilo: nedelje v novembru', 'Mededeling: zondagen in november'],
    p: ['Per tutto il mese di novembre, ogni domenica (1, 8, 15, 22 e 29) la cucina chiuderà alle 19:00.',
        'Throughout November, on every Sunday (1, 8, 15, 22 and 29) the kitchen will close at 7:00 pm.',
        'Im gesamten November schließt die Küche jeden Sonntag (1., 8., 15., 22. und 29.) um 19:00 Uhr.',
        'Ves november bo kuhinja vsako nedeljo (1., 8., 15., 22. in 29.) zaprta ob 19.00.',
        'De hele maand november sluit de keuken elke zondag (1, 8, 15, 22 en 29) om 19:00 uur.'],
    g: ['Per eventi e gruppi vi preghiamo di contattare il ristorante.',
        'For events and groups, please contact the restaurant.',
        'Für Veranstaltungen und Gruppen bitten wir Sie, das Restaurant zu kontaktieren.',
        'Za dogodke in skupine vas prosimo, da se obrnete na restavracijo.',
        'Neem voor evenementen en groepen contact op met het restaurant.'],
    b: ['Ho capito', 'Got it', 'Verstanden', 'Razumem', 'Begrepen']
  };
  function sp(k) { return L.map(function (l, i) { return '<span class="' + l + '" lang="' + l + '">' + T[k][i] + '</span>'; }).join(''); }
  function show() {
    if (document.getElementById('dvor-nt')) return;
    var o = document.createElement('div'); o.id = 'dvor-nt';
    o.style.cssText = 'position:fixed;inset:0;z-index:99990;background:rgba(20,12,6,.62);display:flex;align-items:center;justify-content:center;padding:1.25rem;opacity:0;transition:opacity .3s';
    o.innerHTML = '<div role="dialog" aria-modal="true" aria-labelledby="dvor-nt-h" style="max-width:30rem;width:100%;background:var(--bg,#F6EFE4);color:var(--ink,#2B1D14);border:1px solid var(--line,#D8C6AA);border-top:4px solid var(--gold,#9C5A10);box-shadow:0 20px 60px rgba(0,0,0,.45);padding:2rem 1.75rem 1.5rem;font:400 1rem/1.6 var(--sans,system-ui,sans-serif);position:relative">'
      + '<button type="button" id="dvor-nt-x" aria-label="Close" style="position:absolute;top:.5rem;right:.75rem;background:none;border:0;color:inherit;font-size:1.8rem;line-height:1;cursor:pointer;padding:.25rem .5rem">&times;</button>'
      + '<h2 id="dvor-nt-h" style="margin:0 0 .75rem;font:400 1.7rem/1.2 var(--serif,Georgia,serif)">' + sp('h') + '</h2>'
      + '<p style="margin:0 0 .75rem">' + sp('p') + '</p>'
      + '<p style="margin:0 0 1.25rem">' + sp('g') + ' <a href="tel:+390481090740" style="text-decoration:underline;white-space:nowrap">+39 0481 090740</a> · <a href="mailto:info@osteriadvor.com" style="text-decoration:underline">info@osteriadvor.com</a></p>'
      + '<button type="button" id="dvor-nt-b" style="cursor:pointer;background:var(--green,#7A2E22);color:var(--on-green,#FBF3E6);border:1px solid var(--green,#7A2E22);padding:.7rem 1.6rem;font:inherit;letter-spacing:.08em">' + sp('b') + '</button></div>';
    document.body.appendChild(o);
    var prev = document.activeElement;
    function close() { try { sessionStorage.setItem(KEY, '1'); } catch (e) {} document.removeEventListener('keydown', key); o.style.opacity = 0; setTimeout(function () { o.remove(); if (prev && prev.focus) prev.focus(); }, 300); }
    function key(e) { if (e.key === 'Escape') close(); }
    document.addEventListener('keydown', key);
    o.addEventListener('click', function (e) { if (e.target === o) close(); });
    o.querySelector('#dvor-nt-b').onclick = close; o.querySelector('#dvor-nt-x').onclick = close;
    requestAnimationFrame(function () { o.style.opacity = 1; o.querySelector('#dvor-nt-b').focus(); });
  }
  function init() { setTimeout(show, 900); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
