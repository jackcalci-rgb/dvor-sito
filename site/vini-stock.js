/* Carta vini: mostra solo i vini disponibili in Odoo (via Mescita, vini-stock.php).
   Regola prudente: un vino sparisce SOLO se Odoo lo conosce e ha quantita' zero (o meno).
   Se il collegamento non risponde, la carta resta completa. */
(function () {
  var MAP = window.DVOR_WMAP; if (!MAP || !window.fetch) return;
  function norm(n) { return String(n || '').replace(/^\s*\[[^\]]*\]\s*/, '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); }
  function run() { fetch('vini-stock.php', { cache: 'no-cache' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
    if (!j || !j.ok || !j.items || !j.items.length) return;
    document.querySelectorAll('[data-off]').forEach(function (e) { e.hidden = false; e.style.display = ''; e.removeAttribute('data-off'); });
    document.querySelectorAll('.wg,section.course,#evidenza').forEach(function (e) { e.style.display = ''; });
    var q = {}; j.items.forEach(function (x) { var k = norm(x.name); q[k] = (q[k] || 0) + (+x.qty || 0); });
    var off = {}; Object.keys(MAP).forEach(function (w) { var k = norm(MAP[w]); if (k in q && q[k] <= 0) off[w] = 1; });
    var n = Object.keys(off).length;
    document.querySelectorAll('[data-w]').forEach(function (e) { if (off[e.getAttribute('data-w')]) { e.hidden = true; e.style.display = 'none'; e.setAttribute('data-off', '1'); } });
    function vis(e) { return !e.hasAttribute('data-off'); }
    document.querySelectorAll('.wg').forEach(function (g) { if (!Array.prototype.some.call(g.querySelectorAll('li.wine'), vis)) g.style.display = 'none'; });
    document.querySelectorAll('section.course').forEach(function (s) { var l = s.querySelectorAll('li.wine'); if (l.length && !Array.prototype.some.call(l, vis)) s.style.display = 'none'; });
    var f = document.querySelector('#evidenza'); if (f && !Array.prototype.some.call(f.querySelectorAll('.wx'), vis)) f.style.display = 'none';
    /* numeri: ricalcolati sui vini visibili */
    var lis = Array.prototype.filter.call(document.querySelectorAll('li.wine[data-w]'), vis), co = {}, ct = {}, ca = {};
    lis.forEach(function (e) { var o = e.getAttribute('data-o'), t = e.getAttribute('data-t'); if (o) co[o] = (co[o] || 0) + 1; if (t) ct[t] = (ct[t] || 0) + 1; ca[e.getAttribute('data-c')] = 1; });
    var b = document.querySelector('.dtot b[data-n=wines]'); if (b) b.textContent = lis.length;
    b = document.querySelector('.dtot b[data-n=cant]'); if (b) b.textContent = Object.keys(ca).length;
    var mx = 1; Object.keys(co).forEach(function (k) { mx = Math.max(mx, co[k]); });
    document.querySelectorAll('.dbars li[data-o]').forEach(function (e) { var c = co[e.getAttribute('data-o')] || 0; e.style.display = c ? '' : 'none'; var bb = e.querySelector('b'); if (bb) bb.textContent = c; var i = e.querySelector('.db i'); if (i) i.style.width = (c / mx * 100).toFixed(1) + '%'; });
    document.querySelectorAll('.dcats li[data-t]').forEach(function (e) { var bb = e.querySelector('b'); if (bb) bb.textContent = ct[e.getAttribute('data-t')] || 0; });
  }).catch(function () {}); }
  run(); setInterval(function () { if (!document.hidden) run(); }, 60000);
})();
