/* productos.js — Catálogo + editor con WYSIWYG e imagen destacada */
(function () {
  var M = window.MERCANTO;
  M.mountChrome('productos');

  var PROD_HTML = "<p>Las <strong>Runner Pro</strong> están diseñadas para corredores que buscan ligereza sin renunciar a la amortiguación. Su mediasuela de espuma reactiva devuelve energía en cada zancada.</p><h2>Características</h2><ul><li>Amortiguación reactiva de doble densidad</li><li>Upper de malla transpirable y sin costuras</li><li>Peso: 248 g (talla 42)</li><li>Drop de 8 mm, ideal para asfalto</li></ul><p>Disponibles en cuatro colores. Consulta nuestra <a href='#'>guía de tallas</a> antes de comprar.</p>";

  var products = [
    { id: 'p1', name: 'Zapatillas Runner Pro', sku: 'RNR-001', price: '119,95 €', stock: 42, status: 'Activo', img: M.gen('product', '#eef0ff', '#dde2ff', '#6b63e8') },
    { id: 'p2', name: 'Camiseta DryFit', sku: 'TSH-204', price: '29,95 €', stock: 120, status: 'Activo', img: M.gen('product', '#e2f4ec', '#d0eede', '#4fb78f') },
    { id: 'p3', name: 'Sudadera Trail', sku: 'SWT-088', price: '59,00 €', stock: 8, status: 'Activo', img: M.gen('product', '#fdeede', '#f8e0c6', '#d8923f') },
    { id: 'p4', name: 'Calcetines Pack x3', sku: 'SCK-330', price: '14,90 €', stock: 0, status: 'Agotado', img: M.gen('product', '#fbe6ee', '#f6d2e0', '#d96f97') },
    { id: 'p5', name: 'Mochila Urban 20L', sku: 'BAG-012', price: '74,50 €', stock: 15, status: 'Borrador', img: M.gen('product', '#e4ecfb', '#d4e0f7', '#5b7fd6') },
    { id: 'p6', name: 'Gorra Tech', sku: 'CAP-076', price: '19,95 €', stock: 60, status: 'Activo', img: M.gen('product', '#f2eed9', '#e9e2c2', '#a99a52') }
  ];

  var $list = document.querySelector('[data-screen="list"]');
  var $edit = document.querySelector('[data-screen="edit"]');
  var $rows = document.querySelector('[data-rows]');
  var $meta = document.querySelector('[data-meta]');
  var $new = document.querySelector('[data-new]');
  var $back = document.querySelector('[data-back]');
  var $featured = document.querySelector('[data-featured]');
  var $carousel = document.querySelector('[data-carousel]');
  var $galleryCount = document.querySelector('[data-gallery-count]');
  var $addImages = document.querySelector('[data-add-images]');
  var editor = document.querySelector('[data-editor]');
  $addImages.innerHTML = M.svg('plus', 15, 2.2) + 'Añadir imágenes';
  $new.innerHTML = M.svg('plus', 16, 2.2) + 'Nuevo producto';
  $back.innerHTML = M.svg('back', 17, 2) + 'Volver a productos';

  // Estado del editor
  var current = null;          // producto en edición (o null si nuevo)
  var featured = null;         // imagen destacada seleccionada
  var images = [];             // galería de múltiples imágenes (minicarrusel)

  // WYSIWYG: primero inyecto la barra, luego la enlazo
  var $toolbar = document.querySelector('[data-toolbar]');
  $toolbar.innerHTML = M.toolbarHTML();
  M.bindEditor($toolbar, editor, 'prod');

  function stockClass(n) { return n === 0 ? 'stock-out' : (n < 10 ? 'stock-low' : 'stock-ok'); }

  function renderList() {
    $meta.textContent = products.length + ' productos en el catálogo';
    $rows.innerHTML = '';
    products.forEach(function (p) {
      var row = M.el(
        '<div class="table__row p-grid table__row--click">' +
          '<div class="idcell"><div class="thumb" style="background-image:url(\'' + p.img + '\')"></div>' +
            '<div class="idcell__main"><div class="idcell__title">' + M.esc(p.name) + '</div>' +
            '<div class="idcell__sub idcell__sub--mono">' + M.esc(p.sku) + '</div></div></div>' +
          '<div class="cell-price">' + M.esc(p.price) + '</div>' +
          '<div class="' + stockClass(p.stock) + '" style="font-size:13.5px">' + p.stock + '</div>' +
          '<div><span class="' + M.badgeClass(p.status) + '">' + p.status + '</span></div>' +
          '<div class="row-actions">' +
            '<button class="icon-btn icon-btn--danger" data-del title="Eliminar">' + M.svg('trash', 16, 1.8) + '</button>' +
          '</div>' +
        '</div>'
      );
      row.addEventListener('click', function () { openEditor(p); });
      row.querySelector('[data-del]').addEventListener('click', function (e) {
        e.stopPropagation();
        products = products.filter(function (x) { return x.id !== p.id; });
        renderList(); M.toast('Producto eliminado');
      });
      $rows.appendChild(row);
    });
  }

  function renderFeatured() {
    $featured.innerHTML = '';
    if (featured) {
      var box = M.el(
        '<div>' +
          '<div class="featured" style="background-image:url(\'' + featured.src + '\')">' +
            '<button class="featured__change" data-change title="Cambiar imagen">' + M.svg('swap', 14, 1.9) + '</button>' +
            '<button class="featured__clear" data-clear title="Quitar">' + M.svg('close', 14, 2.2) + '</button>' +
          '</div>' +
          '<div class="featured__caption">' + M.esc(featured.title) + '</div>' +
          '<button class="btn btn-ghost btn--sm featured__cta" data-change-2>' + M.svg('swap', 14, 1.9) + 'Cambiar imagen</button>' +
        '</div>'
      );
      var change = function () {
        M.openGallery({ mode: 'featured', onSelect: function (item) { featured = item; renderFeatured(); M.toast('Imagen destacada actualizada'); } });
      };
      box.querySelector('[data-change]').addEventListener('click', change);
      box.querySelector('[data-change-2]').addEventListener('click', change);
      box.querySelector('[data-clear]').addEventListener('click', function () { featured = null; renderFeatured(); });
      $featured.appendChild(box);
    } else {
      var pick = M.el(
        '<button class="featured-pick">' + M.svg('image', 26, 1.6) + '<span>Elegir de la galería</span></button>'
      );
      pick.addEventListener('click', function () {
        M.openGallery({ mode: 'featured', onSelect: function (item) { featured = item; renderFeatured(); M.toast('Imagen destacada actualizada'); } });
      });
      $featured.appendChild(pick);
    }
  }

  // ----- Minicarrusel de múltiples imágenes -----
  function addImages() {
    M.openGallery({
      multi: true, mode: 'editor', onSelect: function (items) {
        var added = 0;
        items.forEach(function (it) { if (!images.some(function (x) { return x.id === it.id; })) { images.push(it); added++; } });
        renderCarousel();
        if (added) M.toast(added > 1 ? added + ' imágenes añadidas a la galería' : 'Imagen añadida a la galería');
        else M.toast('Esas imágenes ya estaban en la galería');
      }
    });
  }
  function changeImageAt(idx) {
    M.openGallery({
      mode: 'editor', onSelect: function (item) { images[idx] = item; renderCarousel(); M.toast('Imagen actualizada'); }
    });
  }
  function renderCarousel() {
    $galleryCount.textContent = images.length
      ? images.length + (images.length === 1 ? ' imagen' : ' imágenes')
      : 'Aún no hay imágenes';
    $carousel.innerHTML = '';
    if (!images.length) {
      var empty = M.el(
        '<button class="gallery-empty">' + M.svg('image', 26, 1.6) +
          '<b>Sin imágenes en la galería</b><span>Añade varias imágenes del producto a la vez</span></button>'
      );
      empty.addEventListener('click', addImages);
      $carousel.appendChild(empty);
      return;
    }
    var track = M.el('<div class="carousel"></div>');
    images.forEach(function (img, idx) {
      var item = M.el(
        '<div class="carousel__item">' +
          '<div class="carousel__img" style="background-image:url(\'' + img.src + '\')"></div>' +
          '<div class="carousel__bar">' +
            '<button class="carousel__btn" data-change title="Cambiar imagen">' + M.svg('swap', 14, 1.9) + '</button>' +
            '<button class="carousel__btn" data-remove title="Quitar">' + M.svg('close', 14, 2.2) + '</button>' +
          '</div>' +
          '<div class="carousel__cap">' + M.esc(img.title) + '</div>' +
        '</div>'
      );
      item.querySelector('[data-change]').addEventListener('click', function () { changeImageAt(idx); });
      item.querySelector('[data-remove]').addEventListener('click', function () { images.splice(idx, 1); renderCarousel(); M.toast('Imagen quitada de la galería'); });
      track.appendChild(item);
    });
    var add = M.el('<button class="carousel__add">' + M.svg('plus', 20, 2) + 'Añadir</button>');
    add.addEventListener('click', addImages);
    track.appendChild(add);

    // Navegación con flechas ‹ ›
    var wrap = M.el('<div class="carousel-wrap"></div>');
    var prev = M.el('<button class="carousel-nav carousel-nav--prev" title="Anterior">' + M.svg('chevL', 18, 2) + '</button>');
    var next = M.el('<button class="carousel-nav carousel-nav--next" title="Siguiente">' + M.svg('chevR', 18, 2) + '</button>');
    function updateNav() {
      var max = track.scrollWidth - track.clientWidth - 1;
      prev.disabled = track.scrollLeft <= 0;
      next.disabled = track.scrollLeft >= max;
    }
    prev.addEventListener('click', function () { track.scrollBy({ left: -track.clientWidth * 0.8, behavior: 'smooth' }); });
    next.addEventListener('click', function () { track.scrollBy({ left: track.clientWidth * 0.8, behavior: 'smooth' }); });
    track.addEventListener('scroll', updateNav);
    wrap.appendChild(prev); wrap.appendChild(track); wrap.appendChild(next);
    $carousel.appendChild(wrap);
    // estado inicial de las flechas (tras el layout)
    requestAnimationFrame(updateNav);
    setTimeout(updateNav, 60);
  }

  function setField(f, v) { document.querySelector('[data-f="' + f + '"]').value = v; }
  function getField(f) { return document.querySelector('[data-f="' + f + '"]').value; }

  function openEditor(p) {
    current = p;
    if (p) {
      setField('title', p.name); setField('sku', p.sku); setField('cat', 'Calzado');
      setField('status', p.status); setField('price', p.price.replace(' €', '')); setField('stock', String(p.stock));
      editor.innerHTML = PROD_HTML;
      featured = M.MEDIA[0];
      images = (p.images && p.images.slice()) || [M.MEDIA[1], M.MEDIA[6], M.MEDIA[4]];
    } else {
      setField('title', ''); setField('sku', ''); setField('cat', 'Calzado');
      setField('status', 'Borrador'); setField('price', ''); setField('stock', '');
      editor.innerHTML = '';
      featured = null;
      images = [];
    }
    renderFeatured();
    renderCarousel();
    $list.hidden = true; $edit.hidden = false;
    document.querySelector('#main').scrollTop = 0;
  }

  function closeEditor() { $edit.hidden = true; $list.hidden = false; }

  $new.addEventListener('click', function () { openEditor(null); });
  $back.addEventListener('click', closeEditor);
  $addImages.addEventListener('click', addImages);
  document.querySelector('[data-save]').addEventListener('click', function () {
    var name = getField('title') || 'Producto sin título';
    var rec = {
      name: name, sku: getField('sku') || '—',
      price: (getField('price') || '0,00') + ' €',
      stock: parseInt(getField('stock'), 10) || 0,
      status: getField('status'),
      img: featured ? featured.src : M.gen('product', '#eef0ff', '#dde2ff', '#6b63e8'),
      images: images.slice()
    };
    if (current) { Object.assign(current, rec); }
    else { rec.id = M.uid('p'); products.unshift(rec); }
    renderList(); closeEditor(); M.toast('Producto guardado');
  });

  renderList();
})();
