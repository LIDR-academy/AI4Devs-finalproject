/* index.js — Inicio */
(function () {
  var M = window.MERCANTO;
  M.mountChrome('inicio');
  // Iconos de las tarjetas de acceso rápido (22px)
  document.querySelectorAll('[data-ico]').forEach(function (el) {
    el.innerHTML = M.svg(el.getAttribute('data-ico'), 22);
  });
})();
