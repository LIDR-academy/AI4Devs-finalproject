/* envios.js — Configuración de Envíos: transportistas + tarifas agrupadas */
(function () {
  var M = window.MERCANTO;
  M.mountChrome('envios');

  var ZONES = ['Península', 'Baleares', 'Canarias', 'Ceuta y Melilla', 'Unión Europea', 'Internacional'];

  var carriers = [
    { id: 'c1', name: 'SEUR', tag: 'SEUR', desc: '24h · Península y Baleares', enabled: true, hue: 8 },
    { id: 'c2', name: 'Correos', tag: 'CRRS', desc: 'Nacional · puntos de recogida', enabled: true, hue: 210 },
    { id: 'c3', name: 'MRW', tag: 'MRW', desc: 'Urgente · 10-14h', enabled: false, hue: 155 },
    { id: 'c4', name: 'DHL Express', tag: 'DHL', desc: 'Internacional · aduanas', enabled: true, hue: 45 }
  ];
  var rules = [
    { id: 'r1', name: 'Estándar', carrier: 'SEUR', zone: 'Península', wmin: '0', wmax: '2', price: '4,95', days: '24–48h' },
    { id: 'r2', name: 'Estándar', carrier: 'SEUR', zone: 'Península', wmin: '2', wmax: '5', price: '6,95', days: '24–48h' },
    { id: 'r3', name: 'Express', carrier: 'MRW', zone: 'Península', wmin: '0', wmax: '2', price: '9,90', days: '24h' },
    { id: 'r4', name: 'Estándar', carrier: 'Correos', zone: 'Baleares', wmin: '0', wmax: '2', price: '8,50', days: '48–72h' },
    { id: 'r5', name: 'Estándar', carrier: 'Correos', zone: 'Canarias', wmin: '0', wmax: '2', price: '12,00', days: '3–5 días' },
    { id: 'r6', name: 'Internacional', carrier: 'DHL Express', zone: 'Unión Europea', wmin: '0', wmax: '2', price: '14,90', days: '3–6 días' }
  ];

  var $carriers = document.querySelector('[data-carriers]');
  var $rows = document.querySelector('[data-rows]');
  var $add = document.querySelector('[data-add]');
  $add.innerHTML = M.svg('plus', 16, 2.2) + 'Nueva tarifa';

  function carrierHue(name) { var c = carriers.find(function (x) { return x.name === name; }); return c ? c.hue : 230; }

  function renderCarriers() {
    $carriers.innerHTML = '';
    carriers.forEach(function (c) {
      var card = M.el(
        '<div class="carrier">' +
          '<div class="carrier__top">' +
            '<div class="carrier__logo" style="background:hsl(' + c.hue + ' 55% 94%);color:hsl(' + c.hue + ' 50% 38%)">' + c.tag + '</div>' +
            '<button class="switch' + (c.enabled ? ' is-on' : '') + '" data-toggle><i></i></button>' +
          '</div>' +
          '<div><div class="carrier__name">' + M.esc(c.name) + '</div><div class="carrier__desc">' + M.esc(c.desc) + '</div></div>' +
          '<div class="carrier__state ' + (c.enabled ? 'is-on' : 'is-off') + '">' + (c.enabled ? '● ACTIVO' : '○ INACTIVO') + '</div>' +
        '</div>'
      );
      card.querySelector('[data-toggle]').addEventListener('click', function () {
        c.enabled = !c.enabled; renderCarriers(); renderRules();
        M.toast(c.name + (c.enabled ? ' activado' : ' desactivado'));
      });
      $carriers.appendChild(card);
    });
  }

  function renderRules() {
    $rows.innerHTML = '';
    // Transportistas: activos primero, inactivos al final
    var sorted = carriers.slice().sort(function (a, b) { return (a.enabled === b.enabled) ? 0 : (a.enabled ? -1 : 1); });
    sorted.forEach(function (c) {
      var rs = rules.filter(function (r) { return r.carrier === c.name; });
      if (!rs.length) return;
      var group = M.el('<div class="group' + (c.enabled ? '' : ' group--off') + '"></div>');
      group.appendChild(M.el(
        '<div class="group__band">' +
          '<span class="group__dot" style="background:' + (c.enabled ? 'hsl(' + c.hue + ' 62% 47%)' : '#b8b8c0') + '"></span>' +
          '<span class="group__name">' + M.esc(c.name) + '</span>' +
          '<span class="group__badge ' + (c.enabled ? 'is-on' : 'is-off') + '">' + (c.enabled ? 'ACTIVO' : 'INACTIVO') + '</span>' +
          '<span class="group__count">' + rs.length + (rs.length === 1 ? ' tarifa' : ' tarifas') + '</span>' +
        '</div>'
      ));
      rs.forEach(function (r) {
        var row = M.el(
          '<div class="table__row r-grid">' +
            '<div class="cell-strong">' + M.esc(r.name) + '</div>' +
            '<div><span class="' + M.zoneClass(r.zone) + '">' + M.esc(r.zone) + '</span></div>' +
            '<div class="cell-mono">' + M.esc(r.wmin || '0') + '–' + M.esc(r.wmax || '0') + ' kg</div>' +
            '<div class="cell-price">' + M.esc(r.price) + ' €</div>' +
            '<div class="cell-mono">' + M.esc(r.days) + '</div>' +
            '<div class="row-actions">' +
              '<button class="icon-btn" data-edit title="Editar">' + M.svg('edit', 16, 1.8) + '</button>' +
              '<button class="icon-btn icon-btn--danger" data-del title="Eliminar">' + M.svg('trash', 16, 1.8) + '</button>' +
            '</div>' +
          '</div>'
        );
        row.querySelector('[data-edit]').addEventListener('click', function () { openForm(r); });
        row.querySelector('[data-del]').addEventListener('click', function () {
          rules = rules.filter(function (x) { return x.id !== r.id; });
          renderRules(); M.toast('Tarifa eliminada');
        });
        group.appendChild(row);
      });
      $rows.appendChild(group);
    });
  }

  function options(list, sel) { return list.map(function (o) { return '<option' + (o === sel ? ' selected' : '') + '>' + o + '</option>'; }).join(''); }

  function openForm(rule) {
    var d = rule || { name: '', carrier: 'SEUR', zone: 'Península', wmin: '', wmax: '', price: '', days: '' };
    var carrierNames = carriers.map(function (c) { return c.name; });
    var body =
      '<div class="field"><label class="label">Nombre de la tarifa</label><input class="input" data-f="name" value="' + M.esc(d.name) + '" placeholder="Estándar Península"></div>' +
      '<div class="field-grid cols-2">' +
        '<div><label class="label">Transportista</label><select class="input" data-f="carrier">' + options(carrierNames, d.carrier) + '</select></div>' +
        '<div><label class="label">Zona geográfica</label><select class="input" data-f="zone">' + options(ZONES, d.zone) + '</select></div>' +
      '</div>' +
      '<div class="field-grid cols-2">' +
        '<div><label class="label">Peso mínimo (kg)</label><input class="input" data-f="wmin" value="' + M.esc(d.wmin) + '" placeholder="0"></div>' +
        '<div><label class="label">Peso máximo (kg)</label><input class="input" data-f="wmax" value="' + M.esc(d.wmax) + '" placeholder="2"></div>' +
      '</div>' +
      '<div class="field-grid cols-2">' +
        '<div><label class="label">Precio (€)</label><input class="input" data-f="price" value="' + M.esc(d.price) + '" placeholder="4,95"></div>' +
        '<div><label class="label">Plazo de entrega</label><input class="input" data-f="days" value="' + M.esc(d.days) + '" placeholder="24–48h"></div>' +
      '</div>';
    M.openModal({
      title: rule ? 'Editar tarifa' : 'Nueva tarifa de envío',
      saveLabel: rule ? 'Guardar cambios' : 'Crear',
      body: body,
      onSave: function (modal) {
        var get = function (f) { return modal.querySelector('[data-f="' + f + '"]').value; };
        var rec = { name: get('name'), carrier: get('carrier'), zone: get('zone'), wmin: get('wmin'), wmax: get('wmax'), price: get('price'), days: get('days') };
        if (rule) { Object.assign(rule, rec); M.toast('Cambios guardados'); }
        else { rec.id = M.uid('r'); rules.unshift(rec); M.toast('Tarifa creada'); }
        renderRules();
      }
    });
  }

  $add.addEventListener('click', function () { openForm(null); });
  renderCarriers();
  renderRules();
})();
