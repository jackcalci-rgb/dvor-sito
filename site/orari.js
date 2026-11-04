/* Orari di apertura nel piè di pagina: letti dal gestionale di prenotazione (orari.php).
   Se non arrivano, resta il testo scritto nell'HTML. */
(function () {
  var els = document.querySelectorAll('[data-orari]'); if (!els.length || !window.fetch) return;
  var D = {
    it: { c: ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'], x: 'Chiuso' },
    en: { c: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], x: 'Closed' },
    de: { c: ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'], x: 'Geschlossen' },
    sl: { c: ['Ponedeljek', 'Torek', 'Sreda', 'Četrtek', 'Petek', 'Sobota', 'Nedelja'], x: 'Zaprto' },
    nl: { c: ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag'], x: 'Gesloten' }
  };
  var K = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  var st = document.createElement('style');
  st.textContent = '.oh{display:grid;grid-template-columns:max-content 1fr;column-gap:1.1rem;row-gap:.7rem;align-items:baseline;margin:0}.oh dt{margin:0}.oh dd{margin:0;font-variant-numeric:tabular-nums}.oh dd.cl{opacity:.6;font-style:italic}.oh dd span{display:block;white-space:nowrap}';
  document.head.appendChild(st);
  function html(w, l) {
    var L = D[l], h = '<dl class="oh">';
    K.forEach(function (k, i) {
      var r = w[k] || [], t = r.map(function (x) { var v = x[0] + '–' + x[1]; return '<span>' + (l === 'sl' ? v.replace(/:/g, '.') : v) + '</span>'; }).join('');
      h += '<dt>' + L.c[i] + '</dt><dd' + (r.length ? '' : ' class="cl"') + '>' + (r.length ? t : L.x) + '</dd>';
    });
    return h + '</dl>';
  }
  fetch('orari.php', { cache: 'no-cache' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
    if (!j || !j.ok || !j.windows) return;
    els.forEach(function (p) { p.innerHTML = Object.keys(D).map(function (l) { return '<span class="' + l + '" lang="' + l + '">' + html(j.windows, l) + '</span>'; }).join(''); });
  }).catch(function () {});
})();
