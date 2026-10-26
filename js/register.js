(function () {
  'use strict';

  var form = document.getElementById('registerForm');
  if (!form || form.dataset.ready) return;
  form.dataset.ready = '1';

  var ENDPOINT = '../backend/auth/register.php';
  var HINT = location.protocol === 'file:' ? ' Abre el sitio desde http://localhost/CODEXA/ y no desde el archivo.' : '';
  var USER = /^[A-Za-z0-9_]{3,20}$/;
  var statusBox = document.getElementById('formStatus');
  var submitBtn = document.getElementById('submitBtn');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  try { window.CodexaGalaxy.init(document.getElementById('galaxy'), function () { return reduce.matches; }).start(); }
  catch (err) { console.error('Galaxia:', err); }

  function setStatus(msg, kind) {
    statusBox.textContent = msg || '';
    statusBox.className = 'status' + (msg ? (kind === 'ok' ? ' is-ok' : ' is-error') : '');
  }
  function setError(name, msg) {
    var input = form.elements[name];
    document.getElementById(name + 'Error').textContent = msg || '';
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    input.closest('.field').classList.toggle('has-error', !!msg);
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
    form.elements[n].addEventListener('input', function () { setError(n, ''); setStatus(''); });
  });

  // Comodidad en el navegador: el servidor valida de nuevo con las mismas reglas.
  function validate(user, pass) {
    var e = {};
    if (!user) e.username = 'Elige un nombre de usuario.';
    else if (!USER.test(user)) e.username = 'Usa de 3 a 20 caracteres: letras, números o guion bajo.';
    var bytes = new TextEncoder().encode(pass).length;
    if (!pass) e.password = 'Crea una contraseña.';
    else if (pass.length < 8) e.password = 'La contraseña debe tener al menos 8 caracteres.';
    else if (bytes > 72) e.password = 'La contraseña es demasiado larga.';
    return e;
  }
  function showErrors(errors) {
    var first = null;
    ['username', 'password'].forEach(function (n) { setError(n, errors[n]); if (errors[n] && !first) first = n; });
    if (first) form.elements[first].focus();
  }

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    setStatus('');
    var user = form.elements.username.value.trim(), pass = form.elements.password.value;
    if (!user && !pass) { setStatus('Completa los dos campos para continuar.', 'error'); showErrors({ username: ' ', password: ' ' }); return; }
    var errors = validate(user, pass);
    if (Object.keys(errors).length) { showErrors(errors); return; }

    submitBtn.disabled = true;
    fetch(ENDPOINT, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' }, credentials: 'same-origin' })
      .then(function (res) { return res.json().catch(function () { return null; }).then(function (d) { return { res: res, d: d }; }); })
      .then(function (r) {
        // Solo se confirma el registro si el servidor lo confirma de verdad.
        if (r.res.ok && r.d && r.d.ok === true) {
          form.reset();
          setStatus(r.d.message || 'La cuenta se ha creado correctamente.', 'ok');
          document.dispatchEvent(new CustomEvent('codexa:registered'));
          return;
        }
        if (r.d && r.d.errors) showErrors(r.d.errors);
        setStatus(((r.d && r.d.message) || 'No se pudo completar la operación. Inténtalo de nuevo.') + (r.d && r.d.debug ? ' (' + r.d.debug + ')' : '') + (r.d ? '' : HINT), 'error');
      })
      .catch(function () { setStatus('No se pudo completar la operación. Inténtalo de nuevo.' + HINT, 'error'); })
      .then(function () { submitBtn.disabled = false; });
  });

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
