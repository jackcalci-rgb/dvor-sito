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
    h: ['Pranzi e cene di Natale', 'Christmas lunches and dinners', 'Weihnachtsessen', 'Božična kosila in večerje', 'Kerstlunches en -diners'],
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
  var DEFS = '<defs><linearGradient id="dvg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8E6A24"/><stop offset=".35" stop-color="#F3DB8C"/><stop offset=".55" stop-color="#C9A24B"/><stop offset=".8" stop-color="#F7E6A8"/><stop offset="1" stop-color="#8E6A24"/></linearGradient><radialGradient id="dvr" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#E0554A"/><stop offset=".55" stop-color="#A42B20"/><stop offset="1" stop-color="#6B1810"/></radialGradient><radialGradient id="dvn" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#5E9A6A"/><stop offset=".6" stop-color="#2F6B3F"/><stop offset="1" stop-color="#1B4527"/></radialGradient></defs>';
  function bauble(cx, cy, r, f) { return '<rect x="' + (cx - r * .22) + '" y="' + (cy - r - r * .42) + '" width="' + r * .44 + '" height="' + r * .5 + '" rx="1" fill="#C9A24B"/><circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="url(#' + f + ')"/><path d="M' + (cx - r * .92) + ' ' + (cy - r * .1) + 'q' + r * .92 + ' ' + r * .5 + ' ' + r * 1.84 + ' 0" stroke="#F3DB8C" stroke-width="1.3" fill="none" opacity=".9"/><ellipse cx="' + (cx - r * .38) + '" cy="' + (cy - r * .42) + '" rx="' + r * .22 + '" ry="' + r * .13 + '" fill="#fff" opacity=".45" transform="rotate(-30 ' + (cx - r * .38) + ' ' + (cy - r * .42) + ')"/>'; }
  function spark(x, y, d, dl) { return '<path class="sp" style="animation-duration:' + d + 's;animation-delay:' + dl + 's;transform-origin:' + x + 'px ' + y + 'px" d="M' + x + ' ' + (y - 5) + 'l1.2 3.8 3.8 1.2-3.8 1.2-1.2 3.8-1.2-3.8-3.8-1.2 3.8-1.2z" fill="#FFF3C2"/>'; }
  function bow(cx, cy) { return '<g transform="translate(' + cx + ' ' + cy + ')"><path d="M0 0C-8-14-24-14-26-4-27 4-12 5 0 0zM0 0C8-14 24-14 26-4 27 4 12 5 0 0z" fill="url(#dvg)" stroke="#8E6A24" stroke-width=".7"/><path d="M0 0C-6 10-10 18-16 26l6-2 3 5C-3 20 0 10 0 0zM0 0C6 10 10 18 16 26l-6-2-3 5C3 20 0 10 0 0z" fill="url(#dvg)" stroke="#8E6A24" stroke-width=".7"/><circle r="4.5" fill="url(#dvr)" stroke="#6B1810" stroke-width=".6"/></g>'; }
  var TOPC = '<svg viewBox="0 0 90 90" width="100" height="100">' + DEFS + bow(30, 28) + '<path d="M62 0v26" stroke="#C9A24B" stroke-width="1"/>' + bauble(62, 36, 9, 'dvr') + '<path d="M14 62v6" stroke="#C9A24B" stroke-width="1"/>' + spark(52, 14, 2.6, 0) + spark(10, 20, 3.1, -1) + spark(74, 58, 2.2, -.6) + '</svg>';
  var BOTC = '<svg viewBox="0 0 90 90" width="100" height="100">' + DEFS + bow(30, 62) + bauble(64, 72, 9, 'dvr') + bauble(18, 24, 6, 'dvn') + spark(56, 52, 2.8, -.3) + spark(10, 40, 2.4, -1.2) + spark(74, 40, 3, -.8) + '</svg>';
  var TREE = '<svg viewBox="0 0 40 64" width="100%" height="100%"><path d="M20 3l1.7 3.9 4.2.4-3.2 2.8 1 4.1L20 12l-3.7 2.2 1-4.1-3.2-2.8 4.2-.4z" fill="#E3C26A"/><path d="M20 10L11 24h5L8 37h6L5 52h30L26 37h6L24 24h5z" fill="#2F6B3F"/><path d="M20 10L11 24h5L8 37h6L5 52h30" fill="none" stroke="#1B4527" stroke-width="1"/><rect x="17.5" y="52" width="5" height="8" fill="#6B4423"/><path d="M11 24h5M8 37h6M5 52h30" stroke="#F6EFE4" stroke-width="1.4" opacity=".55"/><circle cx="17" cy="30" r="2" fill="#A42B20"/><circle cx="24" cy="42" r="2.2" fill="#E3C26A"/><circle cx="14" cy="46" r="2" fill="#A42B20"/><circle cx="21" cy="19" r="1.6" fill="#E3C26A"/><path class="sp" style="animation-duration:2.9s;transform-origin:30px 34px" d="M30 29l1 3 3 1-3 1-1 3-1-3-3-1 3-1z" fill="#FFF3C2"/></svg>';
  var CSS = '#dvor-nt .nt-box{max-width:30rem;width:100%;max-height:calc(100vh - 2rem);overflow:auto;background:var(--bg,#F6EFE4);color:var(--ink,#2B1D14);box-shadow:0 20px 60px rgba(0,0,0,.5);position:relative;font:400 1rem/1.6 var(--sans,system-ui,sans-serif)}'
    + '#dvor-nt .nt-box::before{content:"";position:absolute;inset:0;border:11px solid transparent;border-image:repeating-linear-gradient(45deg,#8E6A24 0 3px,#F3DB8C 3px 6px,#C9A24B 6px 10px,#F7E6A8 10px 13px) 11;pointer-events:none;z-index:1}'
    + '#dvor-nt .nt-box::after{content:"";position:absolute;inset:14px;border:4px solid transparent;border-image:repeating-linear-gradient(45deg,#6B1810 0 4px,#A42B20 4px 8px,#D4584A 8px 10px) 4;pointer-events:none;z-index:1}'
    + '#dvor-nt .nt-in{margin:1.45rem;border:1px solid var(--line,#D8C6AA);padding:1.4rem 1.2rem 1.2rem;text-align:center;position:relative}'
    + '#dvor-nt .nt-sprig{display:block;margin:0 auto .5rem;width:120px;height:36px}'
    + '#dvor-nt .nt-kick{display:block;font:400 .8rem/1 var(--sans,system-ui,sans-serif);letter-spacing:.28em;text-transform:uppercase;color:var(--gold,#9C5A10);margin-bottom:.7rem}'
    + '#dvor-nt h2{margin:0 0 .7rem;font:400 1.9rem/1.15 var(--serif,Georgia,serif);color:var(--ink,#2B1D14)}'
    + '#dvor-nt h2::before,#dvor-nt h2::after{display:none!important;content:none!important}'
    + '#dvor-nt .nt-p{margin:0 0 .9rem}'
    + '#dvor-nt .nt-pk{margin:0 0 1.2rem;font:italic 400 1.15rem/1.5 var(--serif,Georgia,serif);color:var(--green,#7A2E22)}#dvor-nt .nt-pk span.x{display:block}'
    + '#dvor-nt .nt-cta{display:inline-block;cursor:pointer;background:var(--green,#7A2E22);color:var(--on-green,#FBF3E6);border:1px solid var(--green,#7A2E22);padding:.8rem 1.7rem;font:inherit;letter-spacing:.1em;text-transform:uppercase;font-size:.85rem;text-decoration:none}#dvor-nt .nt-cta:hover{filter:brightness(1.15)}'
    + '#dvor-nt .nt-later{display:block;margin:.75rem auto 0;background:none;border:0;color:inherit;opacity:.65;text-decoration:underline;cursor:pointer;font:inherit;font-size:.9rem}'
    + '#dvor-nt .nt-note{margin:1.1rem 0 0;padding-top:.8rem;border-top:1px solid var(--line,#D8C6AA);font-size:.84rem;line-height:1.5;opacity:.8}'
    + '#dvor-nt .nt-x{position:absolute;top:.15rem;right:.15rem;background:#F7E6A8;border-radius:50%;width:2rem;height:2rem;display:flex;align-items:center;justify-content:center;border:0;color:inherit;font-size:1.5rem;line-height:1;cursor:pointer;padding:0;z-index:3}'
    + '#dvor-nt .nt-c{position:absolute;z-index:2;pointer-events:none;line-height:0}#dvor-nt .nt-c svg{display:block;overflow:visible}#dvor-nt .nt-c{z-index:3}#dvor-nt .nt-c.tl{top:0;left:0}#dvor-nt .nt-c.tr{top:0;right:0;transform:scaleX(-1)}#dvor-nt .nt-c.bl{bottom:0;left:0}#dvor-nt .nt-c.br{bottom:0;right:0;transform:scaleX(-1)}'
    + '#dvor-nt .sp{animation:dvorsp ease-in-out infinite}@keyframes dvorsp{0%,100%{opacity:.15;transform:scale(.5)}50%{opacity:1;transform:scale(1.25)}}'
    + '#dvor-nt .nt-tr{position:absolute;top:50%;width:34px;pointer-events:none;line-height:0;transform:translateY(-50%)}#dvor-nt .nt-tr.l{left:.3rem}#dvor-nt .nt-tr.r{right:.3rem}#dvor-nt .nt-tr i{display:block;width:100%;height:54px;margin:.5rem 0}#dvor-nt .nt-tr i.s{width:74%;height:40px;margin-left:auto;margin-right:auto}'
    + '#dvor-nt .nt-in{padding-left:2.9rem;padding-right:2.9rem}#dvor-nt .nt-note{padding-left:0;padding-right:0}@media (prefers-reduced-motion:reduce){#dvor-nt .sp{animation:none;opacity:.8}}'
    + '@media (max-width:420px){#dvor-nt h2{font-size:1.6rem}#dvor-nt .nt-in{margin:1.2rem;padding:1.2rem 1.6rem 1rem}#dvor-nt .nt-tr{width:22px}#dvor-nt .nt-tr.l{left:.3rem}#dvor-nt .nt-tr.r{right:.3rem}#dvor-nt .nt-tr i{height:36px}#dvor-nt .nt-tr i.s{height:27px}}';
  function show() {
    if (document.getElementById('dvor-nt')) return;
    var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    var o = document.createElement('div'); o.id = 'dvor-nt';
    o.style.cssText = 'position:fixed;inset:0;z-index:99990;background:rgba(20,12,6,.66);display:flex;align-items:center;justify-content:center;padding:1rem;opacity:0;transition:opacity .3s';
    o.innerHTML = '<div class="nt-box" role="dialog" aria-modal="true" aria-labelledby="dvor-nt-h">'
      + '<span class="nt-c tl">' + TOPC + '</span><span class="nt-c tr">' + TOPC + '</span><span class="nt-c bl">' + BOTC + '</span><span class="nt-c br">' + BOTC + '</span>'
      + '<button type="button" class="nt-x" id="dvor-nt-x" aria-label="Close">&times;</button>'
      + '<div class="nt-in"><span class="nt-tr l" aria-hidden="true"><i>' + TREE + '</i><i class="s">' + TREE + '</i></span><span class="nt-tr r" aria-hidden="true"><i class="s">' + TREE + '</i><i>' + TREE + '</i></span><span class="nt-sprig">' + SPRIG + '</span>'
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
