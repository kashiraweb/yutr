(function (global) {
  'use strict';
  var TAU = Math.PI * 2;
  var R = function (a, b) { return a + Math.random() * (b - a); };
  var COL = ['234,246,255', '234,246,255', '170,215,255', '66,217,255', '139,92,246'];

  function glow(rgb) {
    var c = document.createElement('canvas'); c.width = c.height = 64;
    var g = c.getContext('2d'), r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    r.addColorStop(0, 'rgba(' + rgb + ',1)'); r.addColorStop(.25, 'rgba(' + rgb + ',.4)'); r.addColorStop(1, 'rgba(' + rgb + ',0)');
    g.fillStyle = r; g.fillRect(0, 0, 64, 64); return c;
  }

  function init(canvas, isReduced) {
    var ctx = canvas.getContext('2d');
    var w = 0, h = 0, run = false, raf = 0, last = 0, clock = 0, time = 0;
    var stars = [], parts = [], sparks = [], ripples = [];
    var G = [glow('66,217,255'), glow('139,92,246')];
    var P = { tx: 0, ty: 0, x: 0, y: 0 };
    var PAR = [4, 10, 22];

    function mkStar(l) {
      var v = [2, 6, 12][l];
      return { l: l, x: R(0, w), y: R(0, h), vx: -R(.6, 1) * v, vy: R(.1, .3) * v,
        r: [R(.4, .8), R(.7, 1.2), R(1, 1.8)][l], a: R(.3, .9), tw: R(.6, 2.2), ph: R(0, TAU),
        c: COL[(Math.random() * COL.length) | 0], ap: R(0, 3.2) };
    }
    function mkPart() {
      var v = R(6, 20), d = R(0, TAU);
      return { x: R(0, w), y: R(0, h), vx: Math.cos(d) * v, vy: Math.sin(d) * v * .6 + 3, r: R(.8, 2.2),
        a: R(.35, .9), tw: R(.5, 1.8), ph: R(0, TAU), g: Math.random() < .6 ? 0 : 1, ap: R(.5, 3.5) };
    }
    function mkSpark() { return { x: R(0, w), y: R(0, h), vx: -R(2, 5), vy: R(.2, 1), r: R(7, 15), tw: R(.5, 1.2), ph: R(0, TAU), ap: R(1, 3.8) }; }

    function fit() {
      var sn = Math.max(140, Math.min(420, Math.round(w * h / 5000)));
      var pn = Math.max(20, Math.min(60, Math.round(w * h / 30000)));
      while (stars.length < sn) stars.push(mkStar(stars.length % 10 < 6 ? 0 : stars.length % 10 < 9 ? 1 : 2));
      stars.length = Math.min(stars.length, sn);
      while (parts.length < pn) parts.push(mkPart());
      parts.length = Math.min(parts.length, pn);
      while (sparks.length < 8) sparks.push(mkSpark());
    }
    function resize() {
      var ow = w, oh = h, dpr = Math.min(global.devicePixelRatio || 1, 2);
      w = global.innerWidth; h = global.innerHeight;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (ow && oh) [stars, parts, sparks].forEach(function (a) { a.forEach(function (p) { p.x *= w / ow; p.y *= h / oh; }); });
      fit();
    }
    function wrap(p, m) {
      if (p.x < -m) p.x += w + 2 * m; else if (p.x > w + m) p.x -= w + 2 * m;
      if (p.y < -m) p.y += h + 2 * m; else if (p.y > h + m) p.y -= h + 2 * m;
    }
    var fade = function (ap) { return Math.min(1, Math.max(0, (clock - ap) / 1.2)); };

    function frame(ts) {
      if (!run) return;
      var dt = last ? Math.min((ts - last) / 1000, .05) : 0; last = ts;
      var red = isReduced(), sdt = dt * (red ? .25 : 1), par = red ? 0 : 1;
      clock += dt; time += sdt;
      var k = Math.min(1, dt * 2.5); P.x += (P.tx - P.x) * k; P.y += (P.ty - P.y) * k;

      ctx.clearRect(0, 0, w, h);
      stars.forEach(function (s) {
        s.x += s.vx * sdt; s.y += s.vy * sdt; wrap(s, 20);
        ctx.globalAlpha = s.a * (.6 + .4 * Math.sin(time * s.tw + s.ph)) * fade(s.ap);
        ctx.fillStyle = 'rgb(' + s.c + ')';
        ctx.beginPath(); ctx.arc(s.x - P.x * PAR[s.l] * par, s.y - P.y * PAR[s.l] * par, s.r, 0, TAU); ctx.fill();
      });

      ctx.globalCompositeOperation = 'lighter';
      parts.forEach(function (p) {
        p.x += (p.vx + Math.sin(time * .7 + p.ph) * 8) * sdt; p.y += p.vy * sdt; wrap(p, 20);
        ctx.globalAlpha = p.a * (.6 + .4 * Math.sin(time * p.tw + p.ph)) * fade(p.ap);
        var s = p.r * 9;
        ctx.drawImage(G[p.g], p.x - P.x * 16 * par - s / 2, p.y - P.y * 16 * par - s / 2, s, s);
      });

      // Estrellas brillantes con destello en cruz
      ctx.strokeStyle = '#EAF6FF'; ctx.lineWidth = 1;
      sparks.forEach(function (s) {
        s.x += s.vx * sdt; s.y += s.vy * sdt; wrap(s, 40);
        var x = s.x - P.x * 24 * par, y = s.y - P.y * 24 * par;
        var f = .55 + .45 * Math.sin(time * s.tw + s.ph), a = fade(s.ap), l = s.r * f;
        ctx.globalAlpha = .7 * f * a; ctx.drawImage(G[0], x - s.r, y - s.r, s.r * 2, s.r * 2);
        ctx.globalAlpha = .85 * f * a; ctx.beginPath();
        ctx.moveTo(x - l * 1.6, y); ctx.lineTo(x + l * 1.6, y); ctx.moveTo(x, y - l * 2.2); ctx.lineTo(x, y + l * 2.2); ctx.stroke();
      });

      for (var i = ripples.length - 1; i >= 0; i--) {
        var rp = ripples[i]; rp.age += dt;
        if (rp.age > 1.6) { ripples.splice(i, 1); continue; }
        var e = 1 - Math.pow(1 - rp.age / 1.6, 3), al = 1 - rp.age / 1.6;
        ctx.lineWidth = 1.5; ctx.globalAlpha = al * .6; ctx.strokeStyle = '#42D9FF';
        ctx.beginPath(); ctx.arc(rp.x, rp.y, e * 240, 0, TAU); ctx.stroke();
        ctx.globalAlpha = al * .4; ctx.strokeStyle = '#8B5CF6';
        ctx.beginPath(); ctx.arc(rp.x, rp.y, e * 150, 0, TAU); ctx.stroke();
        ctx.strokeStyle = '#EAF6FF';
      }
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      raf = global.requestAnimationFrame(frame);
    }

    function start() { if (run) return; run = true; last = 0; raf = global.requestAnimationFrame(frame); }
    function stop() { run = false; global.cancelAnimationFrame(raf); }
    function onMove(e) { P.tx = (e.clientX / w) * 2 - 1; P.ty = (e.clientY / h) * 2 - 1; }
    function onDown(e) {
      if (e.target.closest && e.target.closest('button, a, input, .panel')) return;
      ripples.push({ x: e.clientX, y: e.clientY, age: 0 });
    }
    function onVis() { document.hidden ? stop() : start(); }

    resize();
    global.addEventListener('resize', resize);
    global.addEventListener('pointermove', onMove, { passive: true });
    global.addEventListener('pointerdown', onDown, { passive: true });
    document.addEventListener('visibilitychange', onVis);
    return { start: function () { if (!document.hidden) start(); }, stop: stop };
  }

  global.CodexaGalaxy = { init: init };
})(window);
