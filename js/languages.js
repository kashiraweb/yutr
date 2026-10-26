(function (global) {
  'use strict';

  var doc = document, L = global.CodexaLanguages;
  if (global.__codexaLangsStarted || !L) return;
  global.__codexaLangsStarted = true;

  var reduce = global.matchMedia('(prefers-reduced-motion: reduce)');
  try { global.CodexaGalaxy.init(doc.getElementById('galaxy'), function () { return reduce.matches; }).start(); }
  catch (err) { console.error('Galaxia:', err); }

  // Contenido del apartado: seis categorías, siete tecnologías.
  var CATEGORIES = [
    { name: 'DISEÑO Y ESTRUCTURA WEB', items: [
      { id: 'html', desc: 'Lenguaje de marcado para crear la estructura, los textos y el contenido.' },
      { id: 'css', desc: 'Lenguaje de estilos para dar diseño, color y apariencia visual.' } ] },
    { name: 'DESARROLLO WEB INTERACTIVO', items: [
      { id: 'javascript', desc: 'Lenguaje de programación para darle animación, interacción y dinamismo a las páginas.' } ] },
    { name: 'LÓGICA E INTELIGENCIA ARTIFICIAL', items: [
      { id: 'python', desc: 'Lenguaje de programación ideal para aprender la lógica básica, Inteligencia Artificial y automatizar tareas.' } ] },
    { name: 'CREACIÓN DE JUEGOS Y PROGRAMAS', items: [
      { id: 'cpp', desc: 'Lenguaje de programación enfocado en videojuegos, gráficos y software de alto rendimiento.' } ] },
    { name: 'SISTEMAS Y APLICACIONES', items: [
      { id: 'java', desc: 'Lenguaje de programación para aplicaciones de Android y grandes sistemas empresariales.' } ] },
    { name: 'GESTIÓN DE DATOS E INFORMACIÓN', items: [
      { id: 'mysql', desc: 'Sistema de base de datos para guardar, organizar y consultar registros e información.' } ] }
  ];

  var root = doc.getElementById('cats'), statusBox = doc.getElementById('selStatus'), symbol = doc.getElementById('langSymbol');

  function el(tag, cls, text) {
    var n = doc.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  }

  CATEGORIES.forEach(function (cat, i) {
    var sec = el('section', 'cat'), h = el('h3', 'cat__name', cat.name), list = el('div', 'tech-list');
    h.id = 'cat-' + (i + 1); sec.setAttribute('aria-labelledby', h.id);
    sec.appendChild(h); sec.appendChild(list);
    cat.items.forEach(function (it) {
      var lang = L.find(it.id);
      var art = el('article', 'tech'); art.dataset.lang = it.id;
      var ico = el('div', 'tech__icon'); ico.innerHTML = lang.icon;
      var btn = el('button', 'tech__btn', 'SELECCIONAR'); btn.type = 'button';
      btn.setAttribute('aria-pressed', 'false'); btn.setAttribute('aria-label', 'Seleccionar ' + lang.name);
      btn.addEventListener('click', function () {
        L.set(it.id);
        statusBox.textContent = 'Lenguaje seleccionado: ' + lang.name;
      });
      art.appendChild(ico); art.appendChild(el('h4', 'tech__name', lang.name));
      art.appendChild(el('p', 'tech__desc', it.desc)); art.appendChild(btn);
      list.appendChild(art);
    });
    root.appendChild(sec);
  });

  // Resalta la tarjeta activa y actualiza el símbolo del botón derecho.
  function refresh() {
    var active = L.get();
    root.querySelectorAll('.tech').forEach(function (a) {
      var on = a.dataset.lang === active, b = a.querySelector('.tech__btn');
      a.classList.toggle('is-selected', on);
      b.setAttribute('aria-pressed', String(on));
      b.textContent = on ? 'SELECCIONADO' : 'SELECCIONAR';
    });
    L.renderSymbol(symbol);
  }
  refresh();
  L.onChange(refresh);
  global.addEventListener('pageshow', function (e) { if (e.persisted) refresh(); });

  // Transición suave al volver a la página principal
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
})(window);
