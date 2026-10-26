/* ===== NOEMIX: animación y comportamiento reutilizable =====
   El modelo visual está en noemix-model.js. Uso en cualquier pantalla:
     <div data-noemix></div>                 aparece y se anima al cargar
     <div data-noemix="calm"></div>          movimientos discretos (registro / login)
     <div data-noemix data-noemix-defer></div>   espera a Noemix.get(el).start()
   API: Noemix.mount(el, {calm}), Noemix.get(el) -> { start, stop, speak(on), svg }
   Para futuras expresiones: añade estados en render() y un método en el objeto devuelto. */
(function (g) {
  'use strict';
  var doc = document;
  var ss = function (a, b, x) { x = Math.min(1, Math.max(0, (x - a) / (b - a))); return x * x * (3 - 2 * x); };
  var backOut = function (x) { var c = 1.9; x = Math.min(1, Math.max(0, x)); return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
  var rnd = function (a, b) { return a + Math.random() * (b - a); };
  var reduce = g.matchMedia('(prefers-reduced-motion: reduce)');

  function mount(container, opts) {
    if (container.__noemix) return container.__noemix;
    if (!g.NOEMIX_SVG) throw new Error('Falta cargar noemix-model.js');
    opts = opts || {};
    container.innerHTML = g.NOEMIX_SVG;
    container.classList.add('noemix-mount');

    var svg = container.querySelector('svg');
    var q = function (id) { return svg.querySelector('#' + id); };
    var el = { root: q('root'), face: q('face'), eyeL: q('eyeL'), eyeR: q('eyeR'), mouth: q('mouth'), mouthOpen: q('mouthOpen'),
      earL: q('earL'), earR: q('earR'), gloss: q('gloss'), halo: q('halo'), cap: q('cap') };

    var base = opts.calm ? .4 : 1;      // intensidad del movimiento
    var t0 = 0, raf = 0, running = false, started = false, speaking = false;
    var blinkAt = rnd(2.5, 4.5), blinkT = -1, hopAt = rnd(6, 9), hopT = -1, gazeAt = 3.2;
    var gaze = { x: 0, y: 0 }, gTarget = { x: 0, y: 0 }, grin = 0, grinT = 0;

    function render(t, amp) {
      /* entrada (una sola vez): aparición -> saludo -> asentamiento */
      var a = Math.min(1, t / 1.0);
      var sc = .15 + .85 * backOut(a), op = ss(0, .35, t), iy = (1 - ss(0, .9, t)) * 50;
      var greet = Math.sin(Math.PI * ss(1.0, 2.3, t));
      var gTilt = -Math.sin(ss(1.0, 2.3, t) * Math.PI * 2) * 9;
      var gHop = -Math.abs(Math.sin(ss(1.0, 2.0, t) * Math.PI)) * 14;
      var ambient = ss(1.8, 3.2, t) * amp;
      /* movimiento ambiental con ritmos distintos */
      var y = Math.sin(t * 1.1) * 9 + Math.sin(t * .47 + 1) * 4;
      var r = Math.sin(t * .7) * 3.5 + Math.sin(t * .31 + 2) * 2;
      var yaw = Math.sin(t * .43) * .55 + gaze.x * .5;
      var near = 1 + Math.sin(t * .6 + .5) * .014;
      var sx = 1, sy = 1, hop = 0;
      if (hopT >= 0) {
        var p = (t - hopT) / .75;
        if (p >= 1) hopT = -1; else { hop = -Math.sin(Math.PI * p) * 15; var qq = Math.sin(2 * Math.PI * p) * .025; sx = 1 - qq; sy = 1 + qq; }
      }
      y = y * ambient + hop * amp + iy + (t < 2.3 ? gHop * amp * greet : 0);
      r = r * ambient + gTilt * (t < 2.3 ? 1 : 0) * amp;
      el.root.setAttribute('transform', 'translate(300 ' + (305 + y) + ') rotate(' + r + ') scale(' + (sc * near * sx) + ' ' + (sc * near * sy) + ') translate(-300 -305)');
      el.root.style.opacity = op;
      /* giro del rostro simulando perspectiva */
      var yv = yaw * ambient + (t < 2.3 ? Math.sin(ss(1.0, 2.3, t) * Math.PI * 2) * .25 * amp : 0);
      var fx = yv * 20;
      el.face.setAttribute('transform', 'translate(' + fx + ' ' + (gaze.y * 4 * ambient) + ') translate(300 318) scale(' + (1 - Math.abs(yv) * .05) + ' 1) translate(-300 -318)');
      el.cap.setAttribute('transform', 'translate(' + (yv * 10) + ' 0)');
      var eL = 1 - yv * .16, eR = 1 + yv * .16;
      el.earL.setAttribute('transform', 'translate(' + (yv * 8) + ' 0) translate(72 318) scale(' + eL + ' 1) translate(-72 -318)');
      el.earR.setAttribute('transform', 'translate(' + (yv * 8) + ' 0) translate(528 318) scale(' + eR + ' 1) translate(-528 -318)');
      /* ojos: parpadeo y mirada */
      var bl = 1;
      if (blinkT >= 0) { var pb = (t - blinkT) / .18; if (pb >= 1) blinkT = -1; else bl = 1 - Math.sin(Math.PI * pb) * .88; }
      var gx = gaze.x * 9 * ambient, gy = gaze.y * 5 * ambient;
      var happy = 1 + greet * .12 + grin * .1;
      el.eyeL.setAttribute('transform', 'translate(' + (222 + gx) + ' ' + (322 + gy) + ') scale(' + happy + ' ' + (bl * happy) + ')');
      el.eyeR.setAttribute('transform', 'translate(' + (378 + gx) + ' ' + (322 + gy) + ') scale(' + happy + ' ' + (bl * happy) + ')');
      /* sonrisa (y boca abierta cuando habla) */
      var m = 1 + greet * .35 + grin * .3 + Math.sin(t * .9) * .03 * ambient;
      el.mouth.setAttribute('transform', 'translate(' + (300 + gx * .6) + ' ' + (385 + gy * .6) + ') scale(' + m + ' ' + m + ')');
      if (el.mouthOpen) el.mouthOpen.style.opacity = speaking ? (.3 + .7 * Math.pow(Math.sin(t * 9), 2)) * .9 : 0;
      /* luz */
      el.gloss.style.opacity = .55 + Math.sin(t * .8) * .2 * ambient;
      el.halo.style.opacity = .8 + Math.sin(t * .65 + 1) * .2 * ambient;
    }

    function loop(now) {
      if (!running) return;
      var t = (now - t0) / 1000;
      if (t > 3) {
        if (t > blinkAt) { blinkT = t; blinkAt = t + rnd(2.6, 5.5); if (Math.random() < .25) blinkAt = t + .35; } // a veces doble parpadeo
        if (t > hopAt) { if (!opts.calm) hopT = t; hopAt = t + rnd(6, 11); grinT = t; }
        if (t > gazeAt) { gTarget = { x: rnd(-1, 1), y: rnd(-.7, .7) }; if (Math.random() < .3) gTarget = { x: 0, y: 0 }; gazeAt = t + rnd(2, 4.5); }
      }
      gaze.x += (gTarget.x - gaze.x) * .035; gaze.y += (gTarget.y - gaze.y) * .035;
      grin = grinT ? Math.max(0, Math.sin(Math.PI * Math.min(1, (t - grinT) / 1.4))) : 0;
      render(t, base);
      raf = g.requestAnimationFrame(loop);
    }

    render(0, base); // estado inicial: invisible hasta start()

    var api = {
      svg: svg,
      start: function () {
        if (started) return; started = true;
        if (reduce.matches) { render(10, 0); return; }   // movimiento reducido: pose final, sin animación
        running = true; t0 = g.performance.now(); raf = g.requestAnimationFrame(loop);
      },
      stop: function () { running = false; g.cancelAnimationFrame(raf); },
      speak: function (on) { speaking = !!on; }
    };
    container.__noemix = api;
    return api;
  }

  function auto() {
    doc.querySelectorAll('[data-noemix]').forEach(function (c) {
      try {
        var n = mount(c, { calm: c.getAttribute('data-noemix') === 'calm' });
        if (!c.hasAttribute('data-noemix-defer')) n.start();
      } catch (err) { console.error('Noemix:', err); }
    });
  }

  g.Noemix = { mount: mount, get: function (c) { return c && c.__noemix || null; } };
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', auto); else auto();
})(window);
