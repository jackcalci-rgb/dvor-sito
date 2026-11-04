/* Orari di apertura nel piè di pagina: letti dal gestionale di prenotazione (orari.php).
   Se non arrivano, resta il testo scritto nell'HTML. */
(function () {
  var els = document.querySelectorAll('[data-orari]'); if (!els.length || !window.fetch) return;
  var D = {
    it: { s: ['Lun', 'mar', 'mer', 'gio', 'ven', 'sab', 'dom'], c: ['lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato', 'domenica'], and: ' e ', f: function (n) { return 'Chiuso ' + n; } },
    en: { s: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], c: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], and: ' and ', f: function (n) { return 'Closed ' + n; } },
    de: { s: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'], c: ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'], and: ' und ', f: function (n) { return n + ' geschlossen'; } },
    sl: { s: ['pon', 'tor', 'sre', 'čet', 'pet', 'sob', 'ned'], c: ['ponedeljek', 'torek', 'sredo', 'četrtek', 'petek', 'soboto', 'nedeljo'], and: ' in ', f: function (n) { return 'V ' + n + ' zaprto'; } },
    nl: { s: ['Ma', 'di', 'wo', 'do', 'vr', 'za', 'zo'], c: ['maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag', 'zondag'], and: ' en ', f: function (n) { return n + ' gesloten'; } }
  };
  var K = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  function days(idx, L) {
    var out = [], i = 0;
    while (i < idx.length) { var j = i; while (j + 1 < idx.length && idx[j + 1] === idx[j] + 1) j++; out.push(j - i >= 2 ? L.s[idx[i]] + '–' + L.s[idx[j]] : idx.slice(i, j + 1).map(function (k) { return L.s[k]; }).join(', ')); i = j + 1; }
    return out.join(', ');
  }
  function html(w, l) {
    var L = D[l], g = {}, order = [], closed = [];
    K.forEach(function (k, i) {
      var r = w[k] || []; if (!r.length) { closed.push(i); return; }
      var key = r.map(function (x) { return x[0] + '–' + x[1]; }).join(' · '); if (!g[key]) { g[key] = []; order.push(key); } g[key].push(i);
    });
    var lines = order.map(function (key) { var t = l === 'sl' ? key.replace(/:/g, '.') : key; return days(g[key], L) + '<br>' + t; });
    if (closed.length) lines.push(L.f(closed.map(function (i) { return L.c[i]; }).join(L.and)));
    return lines.join('<br>');
  }
  fetch('orari.php', { cache: 'no-cache' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
    if (!j || !j.ok || !j.windows) return;
    els.forEach(function (p) { p.innerHTML = Object.keys(D).map(function (l) { return '<span class="' + l + '" lang="' + l + '">' + html(j.windows, l) + '</span>'; }).join(''); });
  }).catch(function () {});
})();
