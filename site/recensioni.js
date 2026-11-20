/* Recensioni Google nella home: legge reviews.php, mostra il blocco solo se ci sono recensioni. */
(function () {
  var CSS = '#recensioni{padding:4.5rem 1.2rem;text-align:center}#recensioni .rv-in{max-width:1100px;margin:0 auto}#recensioni .rv-h{margin:0 0 .5rem}#recensioni .rv-sum{margin:0 0 2rem;opacity:.85}#recensioni .rv-sum b{font-size:1.4rem;color:#c8a24a}#recensioni .rv-tr{display:flex;gap:1rem;overflow-x:auto;scroll-snap-type:x mandatory;padding:.4rem .2rem 1rem;-webkit-overflow-scrolling:touch}#recensioni .rv-c{flex:0 0 min(82%,340px);scroll-snap-align:start;margin:0;padding:1.3rem 1.2rem;border:1px solid rgba(128,128,128,.35);border-radius:6px;text-align:left;display:flex;flex-direction:column;gap:.6rem}#recensioni .rv-st{color:#c8a24a;letter-spacing:.15em}#recensioni .rv-tx{margin:0;line-height:1.5;display:-webkit-box;-webkit-line-clamp:7;-webkit-box-orient:vertical;overflow:hidden}#recensioni .rv-by{margin-top:auto;font-size:.9rem;opacity:.85;display:flex;flex-direction:column}#recensioni .rv-by a{color:inherit}#recensioni .rv-by small{opacity:.7}#recensioni .rv-lk{margin:1.4rem 0 0}#recensioni .rv-lk a{color:inherit;text-decoration:underline;text-underline-offset:3px}';
  var sec = null;
  function mount() {
    if (sec && sec.isConnected) return sec;
    var anchor = document.getElementById('dove'); if (!anchor || !anchor.parentNode) return null;
    var st = document.createElement('style'); st.textContent = CSS; sec = document.createElement('section'); sec.id = 'recensioni';
    var inn = document.createElement('div'); inn.className = 'rv-in'; sec.appendChild(st); sec.appendChild(inn);
    anchor.parentNode.insertBefore(sec, anchor); return sec;
  }
  var T = {
    it: ['Dicono di noi', 'recensioni su Google', 'Leggi tutte le recensioni', 'Scrivi una recensione'],
    en: ['What guests say', 'reviews on Google', 'Read all reviews', 'Write a review'],
    de: ['Das sagen unsere Gäste', 'Bewertungen auf Google', 'Alle Bewertungen lesen', 'Bewertung schreiben'],
    sl: ['Kaj pravijo gostje', 'ocen na Googlu', 'Preberi vse ocene', 'Napiši oceno'],
    nl: ['Wat gasten zeggen', 'beoordelingen op Google', 'Lees alle beoordelingen', 'Schrijf een beoordeling']
  };
  function L() { var l = (document.documentElement.getAttribute('data-lang') || 'it').slice(0, 2); return T[l] || T.it; }
  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  function stars(n) { return '★★★★★'.slice(0, Math.max(0, Math.min(5, n))); }
  function go() { fetch('/reviews.php', { cache: 'no-cache' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
    if (!j || !j.ok || !j.reviews || !j.reviews.length) return;
    var t = L(), rev = j.reviews.slice().sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); }).slice(0, 8);
    if (!mount()) return; var box = sec.querySelector('.rv-in'); box.textContent = '';
    box.appendChild(el('h2', 'rv-h', t[0]));
    if (j.rating) {
      var s = el('p', 'rv-sum'); s.appendChild(el('b', '', String(j.rating).replace('.', ',') + ' ★'));
      s.appendChild(document.createTextNode(j.total ? '  ·  ' + j.total + ' ' + t[1] : '  ·  Google')); box.appendChild(s);
    }
    var tr = el('div', 'rv-tr');
    rev.forEach(function (r) {
      var c = el('figure', 'rv-c');
      c.appendChild(el('div', 'rv-st', stars(r.rating)));
      c.appendChild(el('blockquote', 'rv-tx', r.text));
      var cap = el('figcaption', 'rv-by');
      var nm = r.authorUrl && /^https:\/\//.test(r.authorUrl) ? el('a', '', r.author) : el('span', '', r.author);
      if (nm.tagName === 'A') { nm.href = r.authorUrl; nm.rel = 'noopener nofollow'; nm.target = '_blank'; }
      cap.appendChild(nm); if (r.when) cap.appendChild(el('small', '', r.when));
      c.appendChild(cap); tr.appendChild(c);
    });
    box.appendChild(tr);
    if (j.url && /^https:\/\//.test(j.url)) {
      var lk = el('p', 'rv-lk'), a1 = el('a', '', t[2]), a2 = el('a', '', t[3]);
      a1.href = j.url; a2.href = j.url; a1.target = a2.target = '_blank'; a1.rel = a2.rel = 'noopener';
      lk.appendChild(a1); lk.appendChild(document.createTextNode('   ·   ')); lk.appendChild(a2); box.appendChild(lk);
    }
  }).catch(function () {}); }
  if (document.readyState === 'complete') setTimeout(go, 800); else window.addEventListener('load', function () { setTimeout(go, 800); });
})();
