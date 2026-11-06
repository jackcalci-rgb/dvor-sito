/* Scheda "Carta Mescita" nella carta vini: bottiglie aperte adesso e calici serviti (mescita-live.php), aggiornata ogni 20 secondi. */
(function () {
  var nav = document.querySelector('nav.cats'), main = document.querySelector('main');
  if (!nav || !main || !window.fetch) return;
  var L = ['it', 'en', 'de', 'sl', 'nl'];
  function T(o) { return L.map(function (l) { return '<span class="' + l + '" lang="' + l + '">' + (o[l] || o.en) + '</span>'; }).join(''); }
  var X = {
    tab1: { it: 'Carta dei vini', en: 'Wine list', de: 'Weinkarte', sl: 'Vinska karta', nl: 'Wijnkaart' },
    tab2: { it: 'Carta Mescita', en: 'By the glass', de: 'Offene Weine', sl: 'Odprta vina', nl: 'Wijn per glas' },
    h: { it: 'Carta Mescita', en: 'By the glass', de: 'Offene Weine', sl: 'Odprta vina', nl: 'Wijn per glas' },
    sub: { it: 'Le bottiglie aperte in questo momento e quanti calici sono stati serviti. Si aggiorna in tempo reale.',
      en: 'The bottles open right now and how many glasses have been served. Updated in real time.',
      de: 'Die gerade geöffneten Flaschen und wie viele Gläser bereits ausgeschenkt wurden. In Echtzeit aktualisiert.',
      sl: 'Trenutno odprte steklenice in koliko kozarcev je že natočenih. Posodobljeno v živo.',
      nl: 'De flessen die nu open zijn en hoeveel glazen er al zijn geschonken. Live bijgewerkt.' },
    empty: { it: 'In questo momento non ci sono bottiglie aperte: chiedi al nostro staff cosa stiamo per aprire.',
      en: 'No bottles are open at the moment: ask our staff what we are about to open.',
      de: 'Zurzeit sind keine Flaschen geöffnet: Fragen Sie unser Team, was wir als Nächstes öffnen.',
      sl: 'Trenutno ni odprtih steklenic: vprašajte osebje, kaj bomo odprli.',
      nl: 'Er zijn nu geen flessen open: vraag ons team wat we gaan openen.' },
    err: { it: 'Dati non disponibili al momento. Riprova tra poco.', en: 'Data not available right now. Please try again shortly.', de: 'Daten derzeit nicht verfügbar. Bitte versuchen Sie es gleich erneut.', sl: 'Podatki trenutno niso na voljo. Poskusite znova.', nl: 'Gegevens momenteel niet beschikbaar. Probeer het zo opnieuw.' },
    poured: { it: ['calice versato', 'calici versati'], en: ['glass poured', 'glasses poured'], de: ['Glas ausgeschenkt', 'Gläser ausgeschenkt'], sl: ['kozarec natočen', 'kozarcev natočenih'], nl: ['glas geschonken', 'glazen geschonken'] },
    left: { it: ['calice rimasto', 'calici rimasti'], en: ['glass left', 'glasses left'], de: ['Glas übrig', 'Gläser übrig'], sl: ['kozarec ostaja', 'kozarcev ostaja'], nl: ['glas over', 'glazen over'] },
    last: { it: 'Ultimo calice', en: 'Last glass', de: 'Letztes Glas', sl: 'Zadnji kozarec', nl: 'Laatste glas' },
    upd: { it: 'Aggiornato alle', en: 'Updated at', de: 'Aktualisiert um', sl: 'Posodobljeno ob', nl: 'Bijgewerkt om' }
  };
  var GR = [
    { k: ['spumante'], t: { it: 'Bollicine', en: 'Sparkling', de: 'Schaumweine', sl: 'Penine', nl: 'Bubbels' } },
    { k: ['bianco_leggero', 'bianco_corposo'], t: { it: 'Bianchi e rosati', en: 'Whites and rosé', de: 'Weiß- und Roséweine', sl: 'Bela in rosé vina', nl: 'Witte wijnen en rosé' } },
    { k: ['rosso_leggero', 'rosso_corposo'], t: { it: 'Rossi', en: 'Reds', de: 'Rotweine', sl: 'Rdeča vina', nl: 'Rode wijnen' } },
    { k: ['dolce'], t: { it: 'Dolci e passiti', en: 'Sweet wines', de: 'Süßweine', sl: 'Sladka vina', nl: 'Zoete wijnen' } }
  ];
  var css = '.vtabs{background:var(--bg);border-bottom:1px solid var(--line);position:relative;z-index:5}.vtabs .wrap{display:flex;justify-content:center;gap:.4rem;padding:.9rem 1rem}' +
    '.vtabs button{font:500 .72rem var(--sans);letter-spacing:.18em;text-transform:uppercase;color:var(--muted);background:transparent;border:1px solid var(--line);padding:.65rem 1.4rem;cursor:pointer;transition:.2s}' +
    '.vtabs button[aria-selected=true]{background:var(--green);color:var(--on-green);border-color:var(--green)}.vtabs button:hover{border-color:var(--gold);color:var(--ink)}.vtabs button[aria-selected=true]:hover{color:var(--on-green)}' +
    '#mescita-live{padding:2.4rem 0 4rem;background:var(--bg)}#mescita-live .wrap{max-width:900px;margin:0 auto;padding:0 1.2rem}#mescita-live h2{font:400 2.4rem var(--serif);color:var(--green);text-align:center;margin:0 0 .4rem}' +
    '#mescita-live .msub{text-align:center;color:var(--muted);margin:0 auto 1.6rem;max-width:56ch;line-height:1.6}#mescita-live h3{font:500 .78rem var(--sans);letter-spacing:.22em;text-transform:uppercase;color:var(--gold);margin:2rem 0 .3rem;padding-bottom:.5rem;border-bottom:1px solid var(--line)}' +
    '.mt{display:flex;align-items:center;gap:1rem;min-width:0}.mimg{height:120px;width:96px;object-fit:contain;flex:0 0 96px;filter:drop-shadow(0 5px 7px rgba(0,0,0,.2))}.mb{display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:1rem 0;border-bottom:1px solid var(--line)}.mb .mn{font:500 1.35rem var(--serif);color:var(--ink);line-height:1.2}.mb .mi{font-size:.85rem;color:var(--muted);margin-top:.25rem}' +
    '.mb .mi b{color:var(--ink);font-weight:500}.mg{display:flex;gap:.18rem;flex-shrink:0}.mg svg{width:22px;height:34px}.mg .on .bowl{fill:var(--green);stroke:var(--green)}.mg .off .bowl{fill:none;stroke:var(--line)}.mg svg .st{stroke:var(--muted);fill:none;stroke-width:1.5}.mg .off .st{stroke:var(--line)}' +
    '.mlast{display:inline-block;margin-left:.5rem;padding:.05rem .5rem;border:1px solid var(--gold);color:var(--gold);font-size:.6rem;letter-spacing:.16em;text-transform:uppercase;vertical-align:.1em}.mupd{text-align:center;color:var(--muted);font-size:.78rem;margin-top:1.8rem}.mmsg{text-align:center;color:var(--muted);padding:2.5rem 0}' +
    '@media(max-width:560px){.mb{flex-direction:column;align-items:flex-start}#mescita-live h2{font-size:2rem}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  var tabs = document.createElement('div'); tabs.className = 'vtabs';
  tabs.innerHTML = '<div class="wrap" role="tablist"><button type="button" role="tab" id="vt-carta" aria-selected="true">' + T(X.tab1) + '</button><button type="button" role="tab" id="vt-mescita" aria-selected="false">' + T(X.tab2) + '</button></div>';
  nav.parentNode.insertBefore(tabs, nav);
  var panel = document.createElement('section'); panel.id = 'mescita-live'; panel.hidden = true; panel.setAttribute('aria-label', 'Mescita');
  panel.innerHTML = '<div class="wrap"><h2>' + T(X.h) + '</h2><p class="msub">' + T(X.sub) + '</p><div id="ml-body"></div><p class="mupd" id="ml-upd"></p></div>';
  main.parentNode.insertBefore(panel, main);
  var timer = null;
  function glass(on) { return '<svg viewBox="0 0 22 34" class="' + (on ? 'on' : 'off') + '" aria-hidden="true"><path class="bowl" d="M4 2h14c.6 8-.6 15-7 15S3.400 10 4 2z" stroke-width="1.5"/><path class="st" d="M11 17v12M6 31h10"/></svg>'; }
  function norm(n) { return String(n || '').replace(/^\s*\[[^\]]*\]\s*/, '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); }
  var IMG = null, SEC = { bol: 0, bia: 1, mac: 1, ros: 2 };
  function info(name) {
    if (!IMG) {
      IMG = {}; var M = window.DVOR_WMAP || {};
      Object.keys(M).forEach(function (k) {
        var li = document.querySelector('li.wine[data-w="' + k + '"]'); if (!li) return;
        var im = li.querySelector('img.wph'), sc = li.closest('section.course');
        IMG[norm(M[k])] = { img: im ? im.getAttribute('src') : '', g: sc && SEC[sc.id] !== undefined ? SEC[sc.id] : -1 };
      });
    }
    return IMG[norm(name)] || { img: '', g: -1 };
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function plural(o, n) { return L.reduce(function (a, l) { a[l] = o[l][n === 1 ? 0 : 1]; return a; }, {}); }
  function render(j) {
    var body = document.getElementById('ml-body'), up = document.getElementById('ml-upd');
    if (!j || !j.ok) { body.innerHTML = '<p class="mmsg">' + T(X.err) + '</p>'; up.textContent = ''; return; }
    var per = j.per || 7, h = '';
    /* il gruppo segue la carta vini (se il vino c'e'), altrimenti la categoria scelta in Mescita; le bottiglie finite non si mostrano */
    var all = j.bottles.filter(function (b) { return Math.min(per, b.calici) < per; }).map(function (b) {
      var f = info(b.name), gi = f.g;
      if (gi < 0) GR.forEach(function (g, i) { if (g.k.indexOf(b.cat) >= 0) gi = i; });
      return { name: b.name, calici: b.calici, img: f.img || (b.pid ? 'mescita-img.php?id=' + b.pid : ''), gi: gi };
    });
    GR.forEach(function (g, gi) {
      var bs = all.filter(function (b) { return b.gi === gi; });
      if (!bs.length) return;
      h += '<h3>' + T(g.t) + '</h3>';
      bs.forEach(function (b) {
        var p = Math.min(per, b.calici), r = per - p, gl = '';
        for (var i = 0; i < per; i++) gl += glass(i >= p);
        var im = b.img;
        h += '<div class="mb"><div class="mt">' + (im ? '<img class="mimg" src="' + esc(im) + '" alt="" loading="lazy" onerror="this.style.visibility=\'hidden\'">' : '<span class="mimg"></span>') + '<div><div class="mn">' + esc(b.name) + (r === 1 ? '<span class="mlast">' + T(X.last) + '</span>' : '') + '</div><div class="mi"><b>' + p + '</b> ' +
          T(plural(X.poured, p)) + ' · <b>' + r + '</b> ' + T(plural(X.left, r)) + '</div></div></div><div class="mg" role="img" aria-label="' + p + '/' + per + '">' + gl + '</div></div>';
      });
    });
    body.innerHTML = h || '<p class="mmsg">' + T(X.empty) + '</p>';
    var d = j.at ? new Date(j.at) : new Date();
    up.innerHTML = T(X.upd) + ' ' + ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
  }
  function load() { fetch('mescita-live.php', { cache: 'no-cache' }).then(function (r) { return r.ok ? r.json() : null; }).then(render).catch(function () { render(null); }); }
  function show(m) {
    panel.hidden = !m; main.hidden = m; nav.hidden = m;
    document.getElementById('vt-carta').setAttribute('aria-selected', String(!m));
    document.getElementById('vt-mescita').setAttribute('aria-selected', String(m));
    clearInterval(timer);
    if (m) { load(); timer = setInterval(function () { if (!document.hidden) load(); }, 20000); }
    try { history.replaceState(null, '', m ? '#mescita' : location.pathname + location.search); } catch (e) {}
    if (m) window.scrollTo({ top: tabs.getBoundingClientRect().top + window.scrollY - 70, behavior: 'smooth' });
  }
  document.getElementById('vt-carta').onclick = function () { show(false); };
  document.getElementById('vt-mescita').onclick = function () { show(true); };
  if (location.hash === '#mescita') show(true);
})();
