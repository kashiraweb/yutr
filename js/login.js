(function () {
  'use strict';

  var form = document.getElementById('loginForm');
  if (!form || form.dataset.ready) return;
  form.dataset.ready = '1';

  var ENDPOINT = '../backend/auth/login.php';
  var HINT = location.protocol === 'file:' ? ' Abre el sitio desde http://localhost/CODEXA/ y no desde el archivo.' : '';
  var statusBox = document.getElementById('formStatus');
  var submitBtn = document.getElementById('submitBtn');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Fondo galáctico compartido con la bienvenida
  try { window.CodexaGalaxy.init(document.getElementById('galaxy'), function () { return reduce.matches; }).start(); }
  catch (err) { console.error('Galaxia:', err); }

  function setStatus(msg, kind) {
    statusBox.textContent = msg || '';
    statusBox.className = 'status' + (msg ? (kind === 'ok' ? ' is-ok' : ' is-error') : '');
  }
  function mark(name, bad) {
    var input = form.elements[name];
    input.setAttribute('aria-invalid', bad ? 'true' : 'false');
    input.closest('.field').classList.toggle('has-error', !!bad);
  }

  form.querySelectorAll('.toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var input = document.getElementById(btn.dataset.target), show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      btn.setAttribute('aria-pressed', String(show));
      btn.setAttribute('aria-label', show ? 'Ocultar contraseña' : 'Mostrar contraseña');
    });
  });
  ['username', 'password'].forEach(function (n) {
    form.elements[n].addEventListener('input', function () { mark(n, false); setStatus(''); });
  });

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    setStatus('');
    var user = form.elements.username.value.trim(), pass = form.elements.password.value;
    mark('username', !user); mark('password', !pass);
    if (!user || !pass) {
      setStatus(!user && !pass ? 'Completa los dos campos para continuar.' : !user ? 'Escribe tu nombre de usuario.' : 'Escribe tu contraseña.', 'error');
      (!user ? form.elements.username : form.elements.password).focus();
      return;
    }

    submitBtn.disabled = true;
    // La autenticación real ocurre en el servidor; aquí solo se envían las credenciales.
    fetch(ENDPOINT, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' }, credentials: 'same-origin' })
      .then(function (res) { return res.json().catch(function () { return null; }).then(function (d) { return { res: res, d: d }; }); })
      .then(function (r) {
        if (r.res.ok && r.d && r.d.ok === true) {
          form.elements.password.value = '';
          setStatus(r.d.message || 'Sesión iniciada correctamente.', 'ok');
          // Punto de enlace para la siguiente fase (página principal), aún no implementada:
          document.dispatchEvent(new CustomEvent('codexa:login', { detail: { username: user } }));
          // Tras un inicio de sesión real, pasar a la página principal.
          setTimeout(function () {
            document.body.classList.add('leaving');
            setTimeout(function () { window.location.href = 'home.html'; }, reduce.matches ? 0 : 350);
          }, 900);
          return;
        }
        mark('password', true);
        setStatus(((r.d && r.d.message) || 'No se pudo completar la operación. Inténtalo de nuevo.') + (r.d && r.d.debug ? ' (' + r.d.debug + ')' : '') + (r.d ? '' : HINT), 'error');
      })
      .catch(function () { setStatus('No se pudo completar la operación. Inténtalo de nuevo.' + HINT, 'error'); })
      .then(function () { submitBtn.disabled = false; });
  });

  // Transición suave entre pantallas
  var leaving = false;
  document.querySelectorAll('a[data-nav]').forEach(function (a) {
    a.addEventListener('click', function (ev) {
      if (ev.metaKey || ev.ctrlKey || ev.shiftKey || leaving) return;
      ev.preventDefault(); leaving = true;
      document.body.classList.add('leaving');
      setTimeout(function () { window.location.href = a.href; }, reduce.matches ? 0 : 350);
    });
  });
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) { leaving = false; document.body.classList.remove('leaving'); }
  });
})();
