(function (global) {
  'use strict';

  // Hook para la siguiente fase: CODEXA.onStart(function () { /* abrir la siguiente pantalla */ });
  global.CODEXA = { onStart: function (fn) { document.addEventListener('codexa:start', fn); } };

  // Etapas (ms desde la carga): universo, título, zona de Noemix, textos, botón. Total ≈ 5,5 s.
  var STAGES = [[0, 's0'], [900, 's1'], [2300, 's2'], [3100, 's3'], [4600, 's4']];

  function init() {
    if (global.__codexaStarted) return;
    global.__codexaStarted = true;

    var reduce = global.matchMedia('(prefers-reduced-motion: reduce)');
    var galaxy = null;
    try {
      galaxy = global.CodexaGalaxy.init(document.getElementById('galaxy'), function () { return reduce.matches; });
      galaxy.start();
    } catch (err) { console.error('Galaxia:', err); }

    STAGES.forEach(function (s) {
      setTimeout(function () {
        document.body.classList.add(s[1]);
        // Noemix aparece y saluda cuando llega la etapa de su espacio reservado.
        if (s[1] === 's2') {
          var n = global.Noemix && global.Noemix.get(document.getElementById('noemix-slot'));
          if (n) n.start();
        }
      }, s[0]);
    });

    var btn = document.getElementById('startBtn');
    btn.addEventListener('click', function () {
      btn.classList.remove('press'); void btn.offsetWidth; btn.classList.add('press');
      document.dispatchEvent(new CustomEvent('codexa:start'));
    });
    btn.addEventListener('animationend', function (e) { if (e.animationName === 'press') btn.classList.remove('press'); });

    // Navegación: el botón de bienvenida conduce a la pantalla de inicio de sesión.
    var LOGIN_URL = 'pages/login.html';
    var leaving = false;
    global.CODEXA.onStart(function () {
      if (leaving) return;
      leaving = true;
      document.body.classList.add('leaving');
      setTimeout(function () { global.location.href = LOGIN_URL; }, reduce.matches ? 0 : 600);
    });
    // Si el usuario vuelve atrás desde el registro, restaurar la bienvenida.
    global.addEventListener('pageshow', function (e) {
      if (e.persisted) { leaving = false; document.body.classList.remove('leaving'); }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})(window);
