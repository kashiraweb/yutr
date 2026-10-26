(function (global) {
  'use strict';

  // Módulo compartido por la página principal y «Lenguajes informáticos».
  // Solo se guarda el id del lenguaje elegido; nunca credenciales.
  var KEY = 'codexa.language';
  var memory = null; // respaldo si el navegador bloquea localStorage

  var T = ' text-anchor="middle" font-weight="700" fill="#EAF6FF" font-family="Lexend,Arial,sans-serif"';
  function svg(inner) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + inner + '</svg>'; }
  function shield(top, big) {
    return svg('<path d="M4 2.5h16l-1.5 17L12 22l-6.5-2.5z" fill="url(#langg)"/>' +
      '<text x="12" y="9.4" font-size="4.6"' + T + '>' + top + '</text><text x="12" y="18" font-size="9.5"' + T + '>' + big + '</text>');
  }
  var STROKE = '<g fill="none" stroke="url(#langg)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">';

  // Lista ampliable: cada tecnología tiene id, nombre e icono SVG.
  var LIST = [
    { id: 'html', name: 'HTML', icon: shield('HTML', '5') },
    { id: 'css', name: 'CSS', icon: shield('CSS', '3') },
    { id: 'javascript', name: 'JavaScript', icon: svg('<rect x="3" y="3" width="18" height="18" rx="4" fill="url(#langg)"/><text x="12" y="16.2" font-size="9"' + T + '>JS</text>') },
    { id: 'python', name: 'Python', icon: svg('<rect x="3.5" y="2.5" width="11.5" height="10" rx="3.8" fill="url(#langg)"/><rect x="9" y="11.5" width="11.5" height="10" rx="3.8" fill="url(#langg)" opacity=".75"/><circle cx="7" cy="6" r="1.1" fill="#EAF6FF"/><circle cx="17" cy="18" r="1.1" fill="#EAF6FF"/>') },
    { id: 'cpp', name: 'C++', icon: svg('<path d="M12 2.3 20.4 7.1v9.8L12 21.7 3.6 16.9V7.1z" fill="url(#langg)"/><text x="12" y="14.7" font-size="7.2"' + T + '>C++</text>') },
    { id: 'java', name: 'Java', icon: svg(STROKE + '<path d="M5 11h11v4a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4z" fill="url(#langg)" fill-opacity=".35"/><path d="M16 12h1.3a2.2 2.2 0 0 1 0 4.4H15.5"/><path d="M8 3.5c1.6 1.4-1 2.4.5 4.2M12 3.5c1.6 1.4-1 2.4.5 4.2"/><path d="M4 21.2h13"/></g>') },
    { id: 'mysql', name: 'MySQL', icon: svg(STROKE + '<ellipse cx="12" cy="6" rx="7.5" ry="3" fill="url(#langg)" fill-opacity=".35"/><path d="M4.5 6v12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3V6"/><path d="M4.5 12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3"/></g>') }
  ];
  var NEUTRAL = svg('<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="2.5 3"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/>');

  function find(id) { return LIST.filter(function (l) { return l.id === id; })[0] || null; }
  function get() {
    var v = null;
    try { v = global.localStorage.getItem(KEY); } catch (e) { v = memory; }
    return find(v) ? v : null;
  }
  function set(id) {
    if (!find(id)) return false;
    memory = id;
    try { global.localStorage.setItem(KEY, id); } catch (e) { /* se conserva en memoria */ }
    document.dispatchEvent(new CustomEvent('codexa:language', { detail: { language: id } }));
    return true;
  }
  function onChange(fn) {
    document.addEventListener('codexa:language', function () { fn(get()); });
    global.addEventListener('storage', function (e) { if (e.key === KEY) fn(get()); }); // otras pestañas
  }
  // Dibuja el símbolo del lenguaje activo (o el marcador neutro) dentro de un elemento.
  function renderSymbol(el) {
    var l = find(get());
    el.innerHTML = l ? l.icon : NEUTRAL;
    el.classList.toggle('has-lang', !!l);
    el.setAttribute('aria-label', l ? 'Lenguaje seleccionado: ' + l.name : 'Ningún lenguaje seleccionado');
    el.dataset.lang = l ? l.id : '';
  }

  // Degradado compartido por los iconos (si la página no lo trae).
  if (!document.getElementById('langg')) {
    var d = document.createElement('div');
    d.innerHTML = '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><linearGradient id="langg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#42D9FF"/><stop offset="1" stop-color="#8B5CF6"/></linearGradient></defs></svg>';
    document.body.insertBefore(d.firstChild, document.body.firstChild);
  }

  global.CodexaLanguages = { list: LIST, neutral: NEUTRAL, find: find, get: get, set: set, onChange: onChange, renderSymbol: renderSymbol };
})(window);
