/* =====================================================================
   common.js — Lógica compartida del Panel Admin Arospe
   Namespace global: window.MERCANTO
   Incluye: chrome (sidebar+topbar), toast, modal CRUD genérico,
   galería de medios (búsqueda + drag&drop + subida), editor WYSIWYG,
   generador de imágenes de ejemplo y utilidades comunes.
   ===================================================================== */
(function (w) {
  'use strict';

  /* ---------- Iconos SVG reutilizables ---------- */
  var ICON = {
    inicio: '<path d="M3 10.4 12 3.5l9 6.9"/><path d="M5 9.2V20h5v-6h4v6h5V9.2"/>',
    usuarios: '<circle cx="9" cy="8" r="3.2"/><path d="M3.5 19.5a5.5 5.5 0 0 1 11 0"/><path d="M16 5.6a3.2 3.2 0 0 1 0 5.6"/><path d="M17.5 14.6a5.5 5.5 0 0 1 3 4.9"/>',
    impuestos: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
    envios: '<path d="M2.5 6.5h10v9h-10z"/><path d="M12.5 9.5h4l3 3v3h-7z"/><circle cx="6" cy="17.5" r="1.7"/><circle cx="16.5" cy="17.5" r="1.7"/>',
    productos: '<path d="M12 3 4 7v10l8 4 8-4V7z"/><path d="M4 7l8 4 8-4M12 11v10"/>',
    blog: '<path d="M5 3h9l5 5v13H5z"/><path d="M14 3v5h5"/><path d="M8.5 13h7M8.5 16.5h7"/>',
    edit: '<path d="m14 5 5 5"/><path d="M4 20l1-4L16 5l3 3L8 19z"/>',
    trash: '<path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    back: '<path d="M14 6l-6 6 6 6"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/>',
    bell: '<path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6"/><path d="M10.5 19a1.8 1.8 0 0 0 3 0"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="2.5"/><circle cx="8.5" cy="9.5" r="1.7"/><path d="M3 16l5-4 5 4 3-2 5 4"/>',
    upload: '<path d="M12 16V4M7 9l5-5 5 5"/><path d="M5 20h14"/>',
    uploadCloud: '<path d="M12 16V5M7 10l5-5 5 5"/><path d="M5 19h14"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    swap: '<path d="M7 4 3 8l4 4"/><path d="M3 8h13a4 4 0 0 1 4 4"/><path d="m17 20 4-4-4-4"/><path d="M21 16H8a4 4 0 0 1-4-4"/>',
    chevL: '<path d="M14 6l-6 6 6 6"/>',
    chevR: '<path d="M10 6l6 6-6 6"/>',
    check: '<path d="M5 12l4.5 4.5L19 7"/>',
    link: '<path d="M10 13a4 4 0 0 0 5.6 0l2.4-2.4a4 4 0 0 0-5.6-5.6L11 6.4"/><path d="M14 11a4 4 0 0 0-5.6 0L6 13.4a4 4 0 0 0 5.6 5.6L13 17.6"/>',
    listUl: '<path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r="1.1" fill="currentColor"/><circle cx="4" cy="12" r="1.1" fill="currentColor"/><circle cx="4" cy="18" r="1.1" fill="currentColor"/>',
    listOl: '<path d="M9 6h11M9 12h11M9 18h11"/><path d="M3.5 5.5h1V9M3.2 14.5h1.6L3.2 17h1.8" stroke-width="1.3"/>'
  };
  function svg(name, size, sw) {
    size = size || 19; sw = sw || 1.7;
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + sw + '" stroke-linecap="round" stroke-linejoin="round">' + ICON[name] + '</svg>';
  }

  /* ---------- Utilidades ---------- */
  function el(html) { var t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function initials(name) { return name.split(' ').filter(Boolean).map(function (x) { return x[0]; }).slice(0, 2).join('').toUpperCase(); }
  function hueOf(str) { var h = 0; for (var i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 360; return h; }
  function avatarStyle(name) { var h = hueOf(name); return 'background:hsl(' + h + ' 42% 93%);color:hsl(' + h + ' 40% 40%)'; }
  function uid(p) { return (p || 'id') + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  /* Mapa estado -> clase de badge */
  var BADGE = {
    'Activo': 'green', 'Publicado': 'green',
    'Inactivo': 'gray', 'Borrador': 'amber',
    'Programado': 'violet', 'Suspendido': 'red', 'Agotado': 'red'
  };
  function badgeClass(status) { return 'badge badge--' + (BADGE[status] || 'gray'); }
  var ZONE_BADGE = {
    'Península': 'indigo', 'Baleares': 'teal', 'Canarias': 'amber',
    'Ceuta y Melilla': 'pink', 'Unión Europea': 'violet', 'Internacional': 'green'
  };
  function zoneClass(zone) { return 'badge badge--zone badge--' + (ZONE_BADGE[zone] || 'gray'); }

  /* ---------- Generador de imágenes de ejemplo (SVG -> data URI) ---------- */
  function gen(kind, c1, c2, c3) {
    var W = 480, H = 360, s = '';
    var grad = "<defs><linearGradient id='g' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='" + c1 + "'/><stop offset='1' stop-color='" + c2 + "'/></linearGradient></defs>";
    if (kind === 'product') {
      s = "<rect width='" + W + "' height='" + H + "' fill='url(#g)'/>"
        + "<ellipse cx='240' cy='270' rx='132' ry='26' fill='#000' opacity='0.10'/>"
        + "<rect x='150' y='94' width='180' height='150' rx='32' fill='" + c3 + "'/>"
        + "<circle cx='205' cy='148' r='30' fill='#fff' opacity='0.28'/>"
        + "<rect x='178' y='198' width='124' height='14' rx='7' fill='#fff' opacity='0.5'/>";
    } else if (kind === 'lifestyle') {
      s = "<rect width='" + W + "' height='" + H + "' fill='url(#g)'/>"
        + "<circle cx='374' cy='84' r='46' fill='#fff' opacity='0.42'/>"
        + "<path d='M0 248 Q120 214 240 246 T480 242 V360 H0 Z' fill='" + c3 + "' opacity='0.78'/>"
        + "<path d='M0 292 Q160 262 320 292 T480 286 V360 H0 Z' fill='" + c3 + "'/>"
        + "<circle cx='150' cy='232' r='15' fill='#fff' opacity='0.72'/>"
        + "<rect x='143' y='246' width='15' height='42' rx='7' fill='#fff' opacity='0.72'/>";
    } else if (kind === 'banner') {
      s = "<rect width='" + W + "' height='" + H + "' fill='" + c1 + "'/>"
        + "<polygon points='0,0 232,0 122,360 0,360' fill='" + c3 + "'/>"
        + "<polygon points='480,0 480,360 332,360 442,0' fill='" + c2 + "'/>"
        + "<rect x='150' y='150' width='180' height='62' rx='12' fill='#fff' opacity='0.9'/>"
        + "<rect x='172' y='170' width='136' height='10' rx='5' fill='" + c1 + "'/>"
        + "<rect x='196' y='188' width='88' height='7' rx='3' fill='" + c1 + "' opacity='0.55'/>";
    } else if (kind === 'macro') {
      s = "<rect width='" + W + "' height='" + H + "' fill='url(#g)'/>"
        + "<defs><pattern id='d' width='36' height='36' patternUnits='userSpaceOnUse' patternTransform='rotate(20)'><circle cx='11' cy='11' r='8' fill='" + c3 + "' opacity='0.5'/></pattern></defs>"
        + "<rect width='" + W + "' height='" + H + "' fill='url(#d)'/>";
    } else if (kind === 'brand') {
      s = "<rect width='" + W + "' height='" + H + "' fill='" + c1 + "'/>"
        + "<rect x='195' y='130' width='90' height='90' rx='26' fill='" + c3 + "'/>"
        + "<rect x='225' y='160' width='34' height='34' rx='11' fill='#fff'/>"
        + "<rect x='225' y='177' width='17' height='17' fill='" + c3 + "'/>";
    } else { /* ui */
      s = "<rect width='" + W + "' height='" + H + "' fill='url(#g)'/>"
        + "<rect x='176' y='52' width='128' height='256' rx='22' fill='#fff'/>"
        + "<rect x='176' y='52' width='128' height='46' rx='22' fill='" + c3 + "'/>"
        + "<rect x='190' y='112' width='100' height='42' rx='8' fill='" + c3 + "' opacity='0.16'/>"
        + "<rect x='190' y='164' width='100' height='12' rx='6' fill='" + c3 + "' opacity='0.3'/>"
        + "<rect x='190' y='184' width='68' height='12' rx='6' fill='" + c3 + "' opacity='0.18'/>";
    }
    var out = "<svg xmlns='http://www.w3.org/2000/svg' width='" + W + "' height='" + H + "' viewBox='0 0 " + W + " " + H + "'>" + grad + s + "</svg>";
    // encodeURIComponent NO escapa las comillas simples; las codificamos para no
    // romper el envoltorio url('...') / url("...") de CSS.
    return "data:image/svg+xml," + encodeURIComponent(out).replace(/'/g, "%27");
  }

  /* ---------- Datos de la galería (compartidos por productos y blog) ---------- */
  function M(id, title, desc, kind, c1, c2, c3, tag) { return { id: id, title: title, desc: desc, tag: tag, src: gen(kind, c1, c2, c3) }; }
  var MEDIA = [
    M('m1', 'Zapatilla lateral blanca', 'Foto producto · fondo claro', 'product', '#eef0ff', '#dde2ff', '#6b63e8', 'Producto'),
    M('m2', 'Detalle de la suela', 'Macro · textura goma', 'macro', '#e7edf3', '#d4dde7', '#7c93a8', 'Producto'),
    M('m3', 'Modelo corriendo parque', 'Lifestyle · exterior', 'lifestyle', '#d7ecff', '#eafaf0', '#57b894', 'Lifestyle'),
    M('m4', 'Packaging caja Arospe', 'Unboxing · cenital', 'product', '#fdf0dc', '#f8e3c4', '#d8923f', 'Marca'),
    M('m5', 'Detalle de los cordones', 'Macro · primer plano', 'macro', '#fbe6ee', '#f6d2e0', '#d96f97', 'Producto'),
    M('m6', 'Banner rebajas verano', 'Campaña · 1920×600', 'banner', '#4f46e5', '#f59e0b', '#6d5ef0', 'Campaña'),
    M('m7', 'Textura del tejido', 'Macro · malla', 'macro', '#dcefee', '#c7e4e2', '#5aa9a3', 'Producto'),
    M('m8', 'Equipo running en grupo', 'Lifestyle · comunidad', 'lifestyle', '#ffe5c8', '#fff3e0', '#e08a5b', 'Lifestyle'),
    M('m9', 'Logo Arospe', 'Marca · vector', 'brand', '#eef1ff', '#eef1ff', '#4f46e5', 'Marca'),
    M('m10', 'Mockup app móvil', 'UI · pantalla home', 'ui', '#e6e9fb', '#dadffb', '#4f46e5', 'Marca'),
    M('m11', 'Interior de la tienda', 'Lifestyle · retail', 'lifestyle', '#efe7da', '#f7f0e6', '#b89b78', 'Lifestyle'),
    M('m12', 'Flat lay accesorios', 'Producto · cenital', 'product', '#ffe9e2', '#ffd6c8', '#ec7a5a', 'Producto')
  ];

  /* ---------- Chrome: sidebar + topbar ---------- */
  var NAV = [
    { key: 'inicio', label: 'Inicio', href: 'index.html' },
    { key: 'usuarios', label: 'Usuarios', href: 'usuarios.html', badge: '6' },
    { group: 'TIENDA' },
    { key: 'impuestos', label: 'Impuestos', href: 'impuestos.html' },
    { key: 'envios', label: 'Envíos', href: 'envios.html' },
    { group: 'CONTENIDO' },
    { key: 'productos', label: 'Productos', href: 'productos.html' },
    { key: 'blog', label: 'Blog', href: 'blog.html' }
  ];

  function mountChrome(active) {
    var b = document.body;
    var title = b.getAttribute('data-title') || '';
    var sub = b.getAttribute('data-sub') || '';

    var navHTML = NAV.map(function (n) {
      if (n.group) return '<div class="nav__group">' + n.group + '</div>';
      var cls = 'nav__item' + (n.key === active ? ' is-active' : '');
      var badge = n.badge ? '<span class="nav__count" data-nav-count="' + n.key + '">' + n.badge + '</span>' : '';
      return '<a class="' + cls + '" href="' + n.href + '">' + svg(n.key) + '<span>' + n.label + '</span>' + badge + '</a>';
    }).join('');

    var shell = el(
      '<div class="app">' +
        '<aside class="sidebar">' +
          '<div class="brand"><div class="brand__mark"><i></i></div>' +
            '<div><div class="brand__name">Arospe</div><div class="brand__sub">PANEL ADMIN</div></div></div>' +
          '<nav class="nav">' + navHTML + '</nav>' +
          '<div class="sidebar__foot"><div class="userchip">' +
            '<div class="userchip__av">LG</div>' +
            '<div style="min-width:0"><div class="userchip__name">Laura Giménez</div><div class="userchip__role">Administradora</div></div>' +
          '</div></div>' +
        '</aside>' +
        '<div class="main-wrap">' +
          '<header class="topbar">' +
            '<div><h1 class="topbar__title">' + esc(title) + '</h1><div class="topbar__sub">' + esc(sub) + '</div></div>' +
            '<div class="topbar__right">' +
              '<div class="topbar__search">' + svg('search', 16, 1.9) + '<input placeholder="Buscar en el panel…"></div>' +
              '<button class="topbar__bell">' + svg('bell', 18) + '<i></i></button>' +
            '</div>' +
          '</header>' +
          '<main class="main" id="main"></main>' +
        '</div>' +
      '</div>'
    );

    // Mueve el contenido existente del <main data-view> dentro del shell
    var source = document.querySelector('[data-view]');
    var mainSlot = shell.querySelector('#main');
    if (source) { while (source.firstChild) mainSlot.appendChild(source.firstChild); source.remove(); }
    b.insertBefore(shell, b.firstChild);
    return shell;
  }

  function setNavCount(key, n) {
    var elc = document.querySelector('[data-nav-count="' + key + '"]');
    if (elc) elc.textContent = n;
  }

  /* ---------- Toast ---------- */
  var toastTimer;
  function toast(msg) {
    var old = document.querySelector('.toast'); if (old) old.remove();
    var t = el('<div class="toast"><span class="toast__check">' + svg('check', 12, 3.2) + '</span><span></span></div>');
    t.lastChild.textContent = msg;
    (document.querySelector('.app') || document.body).appendChild(t);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.remove(); }, 2200);
  }

  /* ---------- Modal CRUD genérico ----------
     openModal({ title, body (HTMLString), saveLabel, onSave(modalEl) })
     onSave devuelve true (o undefined) para cerrar; false para mantener abierto. */
  function openModal(opts) {
    closeModal();
    var overlay = el('<div class="overlay"><div class="modal" role="dialog"></div></div>');
    var modal = overlay.querySelector('.modal');
    modal.innerHTML =
      '<div class="modal__title">' + esc(opts.title) + '</div>' +
      '<div class="modal__body">' + (opts.body || '') + '</div>' +
      '<div class="modal__foot">' +
        '<button class="btn btn-ghost" data-cancel>Cancelar</button>' +
        '<button class="btn btn-primary" data-save>' + esc(opts.saveLabel || 'Guardar') + '</button>' +
      '</div>';
    overlay.addEventListener('mousedown', function (e) { if (e.target === overlay) closeModal(); });
    modal.querySelector('[data-cancel]').addEventListener('click', closeModal);
    modal.querySelector('[data-save]').addEventListener('click', function () {
      var keep = opts.onSave ? opts.onSave(modal) : true;
      if (keep !== false) closeModal();
    });
    (document.querySelector('.app') || document.body).appendChild(overlay);
    var first = modal.querySelector('input,select,textarea'); if (first) first.focus();
    return modal;
  }
  function closeModal() { var o = document.querySelector('.overlay:not(.overlay--gallery)'); if (o) o.remove(); }

  /* ---------- Galería de medios ----------
     openGallery({ mode:'editor'|'featured', multi:false, onSelect(item|items[]) })
     · multi=false (defecto): selección única, onSelect recibe un item.
     · multi=true: selección múltiple, onSelect recibe un array de items. */
  function openGallery(opts) {
    opts = opts || {};
    var multi = !!opts.multi;
    var selectedId = null;     // selección única
    var selectedIds = [];      // selección múltiple

    function isSel(id) { return multi ? selectedIds.indexOf(id) > -1 : selectedId === id; }
    function toggle(id) {
      if (multi) { var i = selectedIds.indexOf(id); if (i > -1) selectedIds.splice(i, 1); else selectedIds.push(id); }
      else { selectedId = id; }
    }
    function selCount() { return multi ? selectedIds.length : (selectedId ? 1 : 0); }
    var insertLabel = multi ? 'Añadir' : (opts.mode === 'featured' ? 'Usar como destacada' : 'Insertar imagen');

    var overlay = el('<div class="overlay overlay--gallery"></div>');
    var gallery = el(
      '<div class="gallery">' +
        '<div class="gallery__head">' +
          '<div><div class="gallery__title">Galería de imágenes</div><div class="gallery__count" data-count></div></div>' +
          '<button class="gallery__close">' + svg('close', 17, 2) + '</button>' +
        '</div>' +
        '<div class="gallery__bar">' +
          '<div class="gallery__search">' + svg('search', 16, 1.9) +
            '<input placeholder="Buscar por título o descripción…" data-search></div>' +
          '<label class="gallery__upload">' + svg('upload', 16, 2) + 'Subir' +
            '<input type="file" accept="image/*" multiple data-file></label>' +
        '</div>' +
        '<div class="gallery__body">' +
          '<div class="dropzone" data-drop>' + svg('uploadCloud', 22) +
            '<span data-drop-label>Arrastra imágenes aquí para subirlas</span></div>' +
          '<div data-results></div>' +
        '</div>' +
        '<div class="gallery__foot">' +
          '<div class="gallery__sel" data-sel>Ninguna imagen seleccionada</div>' +
          '<div style="display:flex;gap:10px">' +
            '<button class="btn btn-ghost" data-cancel>Cancelar</button>' +
            '<button class="btn btn-primary" data-insert disabled>' + insertLabel + '</button>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
    overlay.appendChild(gallery);

    var $search = gallery.querySelector('[data-search]');
    var $results = gallery.querySelector('[data-results]');
    var $count = gallery.querySelector('[data-count]');
    var $sel = gallery.querySelector('[data-sel]');
    var $insert = gallery.querySelector('[data-insert]');
    var $drop = gallery.querySelector('[data-drop]');
    var $dropLabel = gallery.querySelector('[data-drop-label]');
    var $file = gallery.querySelector('[data-file]');

    function render() {
      var q = $search.value.trim().toLowerCase();
      var list = q ? MEDIA.filter(function (m) { return (m.title + ' ' + m.desc + ' ' + m.tag).toLowerCase().indexOf(q) > -1; }) : MEDIA;
      $count.textContent = (q ? list.length + ' de ' + MEDIA.length : MEDIA.length + ' imágenes') + ' · ' + (multi ? 'selecciona las que quieras' : 'selecciona una para insertar');
      if (!list.length) {
        $results.innerHTML = '<div class="gallery__empty"><b>Sin resultados</b><div>No hay imágenes que coincidan con «' + esc($search.value) + '».</div></div>';
        return;
      }
      var grid = el('<div class="grid-tiles"></div>');
      list.forEach(function (m) {
        var on = isSel(m.id);
        var tile = el(
          '<button class="tile' + (on ? ' is-selected' : '') + '">' +
            '<div class="tile__img" style="background-image:url(\'' + m.src + '\')"></div>' +
            '<div class="tile__meta"><div class="tile__title">' + esc(m.title) + '</div><div class="tile__desc">' + esc(m.desc) + '</div></div>' +
            (on ? '<div class="tile__tick">' + svg('check', 14, 3) + '</div>' : '') +
          '</button>'
        );
        tile.addEventListener('click', function () { toggle(m.id); sync(); render(); });
        grid.appendChild(tile);
      });
      $results.innerHTML = ''; $results.appendChild(grid);
    }
    function sync() {
      var n = selCount();
      if (multi) {
        $sel.textContent = n ? (n + (n === 1 ? ' imagen seleccionada' : ' imágenes seleccionadas')) : 'Ninguna imagen seleccionada';
        $insert.textContent = n ? 'Añadir (' + n + ')' : 'Añadir';
      } else {
        var sel = MEDIA.find(function (m) { return m.id === selectedId; });
        $sel.textContent = sel ? 'Seleccionada: ' + sel.title : 'Ninguna imagen seleccionada';
      }
      $insert.disabled = !n;
    }
    function addFiles(fileList) {
      var files = Array.prototype.slice.call(fileList || []).filter(function (f) { return f.type.indexOf('image') === 0; });
      if (!files.length) return;
      var done = 0;
      files.forEach(function (file) {
        var reader = new FileReader();
        reader.onload = function (e) {
          var item = { id: uid('up'), title: file.name.replace(/\.[^.]+$/, ''), desc: 'Subida ahora · ' + Math.round(file.size / 1024) + ' KB', tag: 'Nueva', src: e.target.result };
          MEDIA.unshift(item);
          if (multi) { selectedIds.push(item.id); } else { selectedId = item.id; }
          sync(); render();
          done++; if (done === files.length) toast(files.length > 1 ? files.length + ' imágenes añadidas' : 'Imagen añadida a la galería');
        };
        reader.readAsDataURL(file);
      });
    }

    $search.addEventListener('input', render);
    $file.addEventListener('change', function (e) { addFiles(e.target.files); });
    $drop.addEventListener('dragover', function (e) { e.preventDefault(); $drop.classList.add('is-over'); $dropLabel.textContent = 'Suelta para subir'; });
    $drop.addEventListener('dragleave', function (e) { e.preventDefault(); $drop.classList.remove('is-over'); $dropLabel.textContent = 'Arrastra imágenes aquí para subirlas'; });
    $drop.addEventListener('drop', function (e) { e.preventDefault(); $drop.classList.remove('is-over'); $dropLabel.textContent = 'Arrastra imágenes aquí para subirlas'; addFiles(e.dataTransfer.files); });
    gallery.querySelector('.gallery__close').addEventListener('click', close);
    gallery.querySelector('[data-cancel]').addEventListener('click', close);
    overlay.addEventListener('mousedown', function (e) { if (e.target === overlay) close(); });
    $insert.addEventListener('click', function () {
      if (multi) {
        if (!selectedIds.length) return;
        var items = selectedIds.map(function (id) { return MEDIA.find(function (m) { return m.id === id; }); }).filter(Boolean);
        if (opts.onSelect) opts.onSelect(items);
      } else {
        var sel = MEDIA.find(function (m) { return m.id === selectedId; });
        if (!sel) return;
        if (opts.onSelect) opts.onSelect(sel);
      }
      close();
    });
    function close() { overlay.remove(); }

    (document.querySelector('.app') || document.body).appendChild(overlay);
    render(); sync(); $search.focus();
  }

  /* ---------- WYSIWYG ----------
     Toolbar declarativa: botones con [data-cmd], [data-block], [data-action="link"|"image"].
     bindEditor(toolbarEl, editorEl, target) */
  function exec(cmd, val) { document.execCommand(cmd, false, val || null); }
  function bindEditor(toolbar, editor, target) {
    toolbar.querySelectorAll('[data-cmd]').forEach(function (btn) {
      btn.addEventListener('mousedown', function (e) { e.preventDefault(); exec(btn.getAttribute('data-cmd')); });
    });
    toolbar.querySelectorAll('[data-block]').forEach(function (btn) {
      btn.addEventListener('mousedown', function (e) { e.preventDefault(); exec('formatBlock', '<' + btn.getAttribute('data-block') + '>'); });
    });
    var linkBtn = toolbar.querySelector('[data-action="link"]');
    if (linkBtn) linkBtn.addEventListener('mousedown', function (e) {
      e.preventDefault(); var u = w.prompt('Introduce la URL del enlace', 'https://'); if (u) exec('createLink', u);
    });
    var imgBtn = toolbar.querySelector('[data-action="image"]');
    if (imgBtn) imgBtn.addEventListener('click', function () {
      openGallery({
        mode: 'editor', onSelect: function (item) {
          editor.focus();
          var html = "<figure><img src='" + item.src + "' alt='" + esc(item.title) + "'><figcaption>" + esc(item.title) + "</figcaption></figure><p></p>";
          document.execCommand('insertHTML', false, html);
          toast('Imagen insertada en el editor');
        }
      });
    });
  }

  /* HTML de una barra de herramientas WYSIWYG estándar */
  function toolbarHTML() {
    return '' +
      '<button class="tb-btn tb-btn--b" data-cmd="bold" title="Negrita">B</button>' +
      '<button class="tb-btn tb-btn--i" data-cmd="italic" title="Cursiva">I</button>' +
      '<button class="tb-btn tb-btn--u" data-cmd="underline" title="Subrayado">U</button>' +
      '<span class="tb-sep"></span>' +
      '<button class="tb-btn tb-btn--h2" data-block="h2" title="Título">H2</button>' +
      '<button class="tb-btn" data-cmd="insertUnorderedList" title="Lista">' + svg('listUl', 17, 1.8) + '</button>' +
      '<button class="tb-btn" data-cmd="insertOrderedList" title="Lista numerada">' + svg('listOl', 17, 1.8) + '</button>' +
      '<button class="tb-btn" data-action="link" title="Enlace">' + svg('link', 17, 1.8) + '</button>' +
      '<span class="tb-sep"></span>' +
      '<button class="tb-img" data-action="image">' + svg('image', 15, 1.8) + 'Insertar imagen</button>';
  }

  /* ---------- API pública ---------- */
  w.MERCANTO = {
    ICON: ICON, svg: svg, el: el, esc: esc, uid: uid,
    initials: initials, avatarStyle: avatarStyle,
    badgeClass: badgeClass, zoneClass: zoneClass,
    gen: gen, MEDIA: MEDIA,
    mountChrome: mountChrome, setNavCount: setNavCount,
    toast: toast, openModal: openModal, closeModal: closeModal,
    openGallery: openGallery, bindEditor: bindEditor, toolbarHTML: toolbarHTML
  };
})(window);
