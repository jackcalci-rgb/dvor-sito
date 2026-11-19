/* Animazioni del sito (GSAP + ScrollTrigger).
   Un solo stile per tutte le pagine: apertura morbida della testata,
   foto che si "aprono" quando entrano nello schermo, testi che salgono piano.
   Chi ha chiesto meno animazioni al telefono/computer (riduci movimento) vede il sito fermo. */
(function () {
  var root = document.documentElement;
  function done() { root.classList.remove('gw'); }
  if (!window.gsap || !window.ScrollTrigger) { done(); return; }
  gsap.registerPlugin(ScrollTrigger);
  var EASE = 'power3.out';
  var mm = gsap.matchMedia();

  mm.add('(prefers-reduced-motion: no-preference)', function () {
    /* 1. Testata: logo, sottotitolo, titolo, testo e pulsanti entrano in sequenza */
    var head = document.querySelector('.hero .wrap, .phero .wrap');
    if (head) {
      var items = [].slice.call(head.children);
      var btns = head.querySelector('.btns');
      if (btns) items.splice(items.indexOf(btns), 1, ...btns.children);
      gsap.timeline({ defaults: { ease: EASE } })
        .from(items, { autoAlpha: 0, y: 28, duration: 1.1, stagger: 0.12, clearProps: 'transform,opacity,visibility' }, 0.15);
      done();

      /* la foto di sfondo scorre più lenta del testo (profondità) */
      var hero = head.parentElement;
      gsap.to(hero, {
        backgroundPositionY: '85%', ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true }
      });
      gsap.to(head, {
        y: -60, autoAlpha: 0.2, ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true }
      });
    } else { done(); }

    /* 2. Righe foto + testo: la foto si apre dal centro, il testo sale */
    gsap.utils.toArray('.split').forEach(function (row) {
      var ph = row.querySelector('.ph'), img = ph && ph.querySelector('img');
      var text = row.querySelector('.ph') ? [].filter.call(row.children, function (c) { return c !== ph; }) : [row];
      var bits = [];
      text.forEach(function (t) { bits = bits.concat([].slice.call(t.children)); });
      var tl = gsap.timeline({ scrollTrigger: { trigger: row, start: 'top 78%', once: true } });
      if (ph) {
        tl.from(ph, { clipPath: 'inset(14% 10% 14% 10%)', duration: 1.4, ease: 'expo.out', clearProps: 'clipPath' }, 0);
        if (img) tl.from(img, { scale: 1.18, duration: 1.8, ease: 'expo.out' }, 0);
      }
      if (bits.length) tl.from(bits, { autoAlpha: 0, y: 26, duration: 0.9, stagger: 0.08, ease: EASE, clearProps: 'transform,opacity,visibility' }, 0.25);
    });

    /* 3. Titoli di sezione e testi introduttivi */
    gsap.utils.toArray('main h2, section:not(.hero):not(.phero) > .wrap > h2, .prose').forEach(function (el) {
      if (el.closest('.split')) return;
      gsap.from(el, {
        autoAlpha: 0, y: 24, duration: 1, ease: EASE, clearProps: 'transform,opacity,visibility',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true }
      });
    });

    /* 4. Gruppi di foto (es. i tre ambienti in home): entrano uno dopo l'altro */
    gsap.utils.toArray('.trio').forEach(function (g) {
      gsap.from(g.children, {
        autoAlpha: 0, y: 40, duration: 1, stagger: 0.14, ease: EASE, clearProps: 'transform,opacity,visibility',
        scrollTrigger: { trigger: g, start: 'top 80%', once: true }
      });
    });

    return function () { done(); };
  });

  mm.add('(prefers-reduced-motion: reduce)', done);

  /* ricalcola le posizioni quando le foto finiscono di caricarsi */
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
