(function (global) {
  'use strict';

  var doc = document, L = global.CodexaLanguages;
  if (global.__codexaHomeStarted) return;
  global.__codexaHomeStarted = true;

  var reduce = global.matchMedia('(prefers-reduced-motion: reduce)');
  try { global.CodexaGalaxy.init(doc.getElementById('galaxy'), function () { return reduce.matches; }).start(); }
  catch (err) { console.error('Galaxia:', err); }

  // xp: total de experiencia (por ahora siempre 0; lo alimentarán las prácticas futuras).
  var state = { xp: 0, avatar: null };
  var xpBox = doc.getElementById('xp'), xpValue = doc.getElementById('xpValue');
  var avatarImg = doc.getElementById('avatarImg'), symbol = doc.getElementById('langSymbol');

  function setXP(n) {
    n = Math.floor(Number(n));
    if (!isFinite(n) || n < 0) return;
    state.xp = n;
    xpValue.textContent = new Intl.NumberFormat('es').format(n);
    xpBox.setAttribute('aria-label', 'Puntos de experiencia: ' + n);
  }
  function setAvatar(url) {
    state.avatar = url || null;
    if (url) { avatarImg.src = url; avatarImg.hidden = false; } else { avatarImg.removeAttribute('src'); avatarImg.hidden = true; }
  }

  // Botón derecho: símbolo del lenguaje elegido en «Lenguajes informáticos» (se conserva al recargar).
  function renderSymbol() { L.renderSymbol(symbol); }
  renderSymbol();
  L.onChange(renderSymbol);
  global.addEventListener('pageshow', function (e) { if (e.persisted) renderSymbol(); });

  // Botón central: ya estamos en la página principal.
  doc.getElementById('homeBtn').addEventListener('click', function () {
    global.scrollTo({ top: 0, behavior: reduce.matches ? 'auto' : 'smooth' });
  });

  // Tres accesos: reciben clics, sin función todavía.
  ['access1', 'access2', 'access3'].forEach(function (id) {
    doc.getElementById(id).addEventListener('click', function () {
      doc.dispatchEvent(new CustomEvent('codexa:access', { detail: { id: id } }));
    });
  });

  // Botón izquierdo: transición suave hacia «Lenguajes informáticos».
  var leaving = false;
  doc.querySelectorAll('a[data-nav]').forEach(function (a) {
    a.addEventListener('click', function (ev) {
      if (ev.metaKey || ev.ctrlKey || ev.shiftKey || leaving) return;
      ev.preventDefault(); leaving = true; doc.body.classList.add('leaving');
      setTimeout(function () { global.location.href = a.href; }, reduce.matches ? 0 : 350);
    });
  });
  global.addEventListener('pageshow', function (e) {
    if (e.persisted) { leaving = false; doc.body.classList.remove('leaving'); }
  });

  setXP(state.xp);

  // API para las fases siguientes (avatar, XP real)
  global.CodexaHome = {
    getState: function () { return { xp: state.xp, language: L.get(), avatar: state.avatar }; },
    setXP: setXP, setAvatar: setAvatar, selectLanguage: L.set, languages: L.list
  };
})(window);
