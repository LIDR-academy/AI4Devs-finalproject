/* impuestos.js — Panel de Impuestos por país (CRUD) */
(function () {
  var M = window.MERCANTO;
  M.mountChrome('impuestos');

  var taxes = [
    { id: 't1', country: 'España', code: 'ES', ttype: 'IVA general', rate: '21' },
    { id: 't2', country: 'España (reducido)', code: 'ES', ttype: 'IVA reducido — alimentación, libros', rate: '10' },
    { id: 't3', country: 'Portugal', code: 'PT', ttype: 'IVA general', rate: '23' },
    { id: 't4', country: 'Francia', code: 'FR', ttype: 'TVA standard', rate: '20' },
    { id: 't5', country: 'Alemania', code: 'DE', ttype: 'Umsatzsteuer', rate: '19' },
    { id: 't6', country: 'Italia', code: 'IT', ttype: 'IVA ordinaria', rate: '22' }
  ];

  var $rows = document.querySelector('[data-rows]');
  var $add = document.querySelector('[data-add]');
  $add.innerHTML = M.svg('plus', 16, 2.2) + 'Añadir tasa';

  function render() {
    $rows.innerHTML = '';
    taxes.forEach(function (t) {
      var row = M.el(
        '<div class="table__row t-grid">' +
          '<div class="idcell"><span class="t-code">' + M.esc(t.code) + '</span>' +
            '<span class="cell-strong">' + M.esc(t.country) + '</span></div>' +
          '<div style="font-size:13.5px;color:#6a6a75">' + M.esc(t.ttype) + '</div>' +
          '<div class="t-rate">' + M.esc(t.rate) + ' %</div>' +
          '<div class="row-actions">' +
            '<button class="icon-btn" data-edit title="Editar">' + M.svg('edit', 16, 1.8) + '</button>' +
            '<button class="icon-btn icon-btn--danger" data-del title="Eliminar">' + M.svg('trash', 16, 1.8) + '</button>' +
          '</div>' +
        '</div>'
      );
      row.querySelector('[data-edit]').addEventListener('click', function () { openForm(t); });
      row.querySelector('[data-del]').addEventListener('click', function () {
        taxes = taxes.filter(function (x) { return x.id !== t.id; });
        render(); M.toast('Tasa eliminada');
      });
      $rows.appendChild(row);
    });
  }

  function openForm(tax) {
    var d = tax || { country: '', code: '', ttype: 'IVA general', rate: '' };
    var body =
      '<div class="field-grid" style="grid-template-columns:1fr 110px">' +
        '<div><label class="label">País / Región</label><input class="input" data-f="country" value="' + M.esc(d.country) + '" placeholder="España"></div>' +
        '<div><label class="label">Código</label><input class="input" data-f="code" value="' + M.esc(d.code) + '" placeholder="ES"></div>' +
      '</div>' +
      '<div class="field"><label class="label">Descripción</label><input class="input" data-f="ttype" value="' + M.esc(d.ttype) + '" placeholder="IVA general"></div>' +
      '<div class="field"><label class="label">Tasa (%)</label><input class="input" data-f="rate" value="' + M.esc(d.rate) + '" placeholder="21"></div>';
    M.openModal({
      title: tax ? 'Editar tasa' : 'Nueva tasa impositiva',
      saveLabel: tax ? 'Guardar cambios' : 'Crear',
      body: body,
      onSave: function (modal) {
        var get = function (f) { return modal.querySelector('[data-f="' + f + '"]').value; };
        var rec = { country: get('country'), code: get('code'), ttype: get('ttype'), rate: get('rate') };
        if (tax) { Object.assign(tax, rec); M.toast('Cambios guardados'); }
        else { rec.id = M.uid('t'); taxes.unshift(rec); M.toast('Tasa creada'); }
        render();
      }
    });
  }

  $add.addEventListener('click', function () { openForm(null); });
  render();
})();
