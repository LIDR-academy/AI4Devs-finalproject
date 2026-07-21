/* blog.js — Catálogo de artículos + editor con WYSIWYG */
(function () {
  var M = window.MERCANTO;
  M.mountChrome('blog');

  var BLOG_HTML = "<p>Elegir las zapatillas adecuadas marca la diferencia entre disfrutar corriendo y arrastrar molestias. En esta guía repasamos los <strong>tres factores clave</strong> que debes valorar.</p><h2>1. Tu tipo de pisada</h2><p>Neutra, pronadora o supinadora: conocer tu pisada evita lesiones. Si no la conoces, te la analizamos gratis en tienda.</p><ul><li>Pisada neutra → amortiguación equilibrada</li><li>Pronadora → soporte en el arco interno</li></ul>";

  var posts = [
    { id: 'b1', title: 'Cómo elegir tus zapatillas de running', cat: 'Guías', status: 'Publicado', date: '12 jun 2026' },
    { id: 'b2', title: 'Rutina de 5 km para principiantes', cat: 'Entrenamiento', status: 'Borrador', date: '08 jun 2026' },
    { id: 'b3', title: 'Novedades colección verano 2026', cat: 'Novedades', status: 'Publicado', date: '01 jun 2026' },
    { id: 'b4', title: 'Mantenimiento de tu equipamiento', cat: 'Guías', status: 'Programado', date: '20 jun 2026' }
  ];

  var $list = document.querySelector('[data-screen="list"]');
  var $edit = document.querySelector('[data-screen="edit"]');
  var $rows = document.querySelector('[data-rows]');
  var $meta = document.querySelector('[data-meta]');
  var $new = document.querySelector('[data-new]');
  var $back = document.querySelector('[data-back]');
  var editor = document.querySelector('[data-editor]');
  $new.innerHTML = M.svg('plus', 16, 2.2) + 'Nuevo artículo';
  $back.innerHTML = M.svg('back', 17, 2) + 'Volver al blog';

  var current = null;

  // WYSIWYG
  var $toolbar = document.querySelector('[data-toolbar]');
  $toolbar.innerHTML = M.toolbarHTML();
  M.bindEditor($toolbar, editor, 'blog');

  function fmtDate() {
    var meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    var d = new Date();
    return d.getDate() + ' ' + meses[d.getMonth()] + ' ' + d.getFullYear();
  }

  function renderList() {
    $meta.textContent = posts.length + ' artículos';
    $rows.innerHTML = '';
    posts.forEach(function (b) {
      var row = M.el(
        '<div class="table__row b-grid table__row--click">' +
          '<div class="cell-strong">' + M.esc(b.title) + '</div>' +
          '<div style="font-size:13px;color:#6a6a75">' + M.esc(b.cat) + '</div>' +
          '<div><span class="' + M.badgeClass(b.status) + '">' + b.status + '</span></div>' +
          '<div class="cell-mono" style="color:var(--muted-2)">' + M.esc(b.date) + '</div>' +
          '<div class="row-actions">' +
            '<button class="icon-btn icon-btn--danger" data-del title="Eliminar">' + M.svg('trash', 16, 1.8) + '</button>' +
          '</div>' +
        '</div>'
      );
      row.addEventListener('click', function () { openEditor(b); });
      row.querySelector('[data-del]').addEventListener('click', function (e) {
        e.stopPropagation();
        posts = posts.filter(function (x) { return x.id !== b.id; });
        renderList(); M.toast('Artículo eliminado');
      });
      $rows.appendChild(row);
    });
  }

  function setField(f, v) { document.querySelector('[data-f="' + f + '"]').value = v; }
  function getField(f) { return document.querySelector('[data-f="' + f + '"]').value; }

  function openEditor(b) {
    current = b;
    if (b) {
      setField('title', b.title); setField('cat', b.cat); setField('status', b.status);
      editor.innerHTML = BLOG_HTML;
    } else {
      setField('title', ''); setField('cat', 'Guías'); setField('status', 'Borrador');
      editor.innerHTML = '';
    }
    $list.hidden = true; $edit.hidden = false;
    document.querySelector('#main').scrollTop = 0;
  }
  function closeEditor() { $edit.hidden = true; $list.hidden = false; }

  $new.addEventListener('click', function () { openEditor(null); });
  $back.addEventListener('click', closeEditor);
  document.querySelector('[data-cancel]').addEventListener('click', closeEditor);
  document.querySelector('[data-save]').addEventListener('click', function () {
    var rec = { title: getField('title') || 'Artículo sin título', cat: getField('cat'), status: getField('status') };
    if (current) { Object.assign(current, rec); }
    else { rec.id = M.uid('b'); rec.date = fmtDate(); posts.unshift(rec); }
    renderList(); closeEditor(); M.toast('Artículo guardado');
  });

  renderList();
})();
