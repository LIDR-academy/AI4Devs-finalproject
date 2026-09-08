/* usuarios.js — Gestión de Usuarios (CRUD) */
(function () {
  var M = window.MERCANTO;
  M.mountChrome('usuarios');

  var ROLES = ['Administrador', 'Editor', 'Gestor de productos', 'Soporte'];
  var STATES = ['Activo', 'Inactivo', 'Suspendido'];

  var users = [
    { id: 'u1', name: 'Laura Giménez', email: 'laura.gimenez@arospe.es', role: 'Administrador', status: 'Activo' },
    { id: 'u2', name: 'Diego Ferrer', email: 'diego.ferrer@arospe.es', role: 'Editor', status: 'Activo' },
    { id: 'u3', name: 'Marta Ruiz', email: 'marta.ruiz@arospe.es', role: 'Gestor de productos', status: 'Activo' },
    { id: 'u4', name: 'Pablo Navarro', email: 'pablo.navarro@arospe.es', role: 'Editor', status: 'Inactivo' },
    { id: 'u5', name: 'Carmen Ortega', email: 'carmen.ortega@arospe.es', role: 'Soporte', status: 'Activo' },
    { id: 'u6', name: 'Javier Soler', email: 'javier.soler@arospe.es', role: 'Soporte', status: 'Suspendido' }
  ];

  var $rows = document.querySelector('[data-rows]');
  var $meta = document.querySelector('[data-meta]');
  var $add = document.querySelector('[data-add]');
  $add.innerHTML = M.svg('plus', 16, 2.2) + 'Nuevo usuario';

  function render() {
    var active = users.filter(function (u) { return u.status === 'Activo'; }).length;
    $meta.textContent = users.length + ' usuarios · ' + active + ' activos';
    M.setNavCount('usuarios', users.length);
    $rows.innerHTML = '';
    users.forEach(function (u) {
      var row = M.el(
        '<div class="table__row u-grid">' +
          '<div class="idcell">' +
            '<div class="avatar" style="' + M.avatarStyle(u.name) + '">' + M.initials(u.name) + '</div>' +
            '<div class="idcell__main"><div class="idcell__title">' + M.esc(u.name) + '</div>' +
            '<div class="idcell__sub">' + M.esc(u.email) + '</div></div>' +
          '</div>' +
          '<div class="cell-mono" style="font-family:var(--sans);color:var(--text-2);font-size:13.5px">' + M.esc(u.role) + '</div>' +
          '<div><span class="' + M.badgeClass(u.status) + '">' + u.status + '</span></div>' +
          '<div class="row-actions">' +
            '<button class="icon-btn" data-edit title="Editar">' + M.svg('edit', 16, 1.8) + '</button>' +
            '<button class="icon-btn icon-btn--danger" data-del title="Eliminar">' + M.svg('trash', 16, 1.8) + '</button>' +
          '</div>' +
        '</div>'
      );
      row.querySelector('[data-edit]').addEventListener('click', function () { openForm(u); });
      row.querySelector('[data-del]').addEventListener('click', function () {
        users = users.filter(function (x) { return x.id !== u.id; });
        render(); M.toast('Usuario eliminado');
      });
      $rows.appendChild(row);
    });
  }

  function options(list, sel) {
    return list.map(function (o) { return '<option' + (o === sel ? ' selected' : '') + '>' + o + '</option>'; }).join('');
  }

  function openForm(user) {
    var d = user || { name: '', email: '', role: 'Editor', status: 'Activo' };
    var body =
      '<div class="field"><label class="label">Nombre completo</label><input class="input" data-f="name" value="' + M.esc(d.name) + '" placeholder="Nombre y apellidos"></div>' +
      '<div class="field"><label class="label">Correo electrónico</label><input class="input" data-f="email" value="' + M.esc(d.email) + '" placeholder="nombre@arospe.es"></div>' +
      '<div class="field-grid cols-2">' +
        '<div><label class="label">Rol</label><select class="input" data-f="role">' + options(ROLES, d.role) + '</select></div>' +
        '<div><label class="label">Estado</label><select class="input" data-f="status">' + options(STATES, d.status) + '</select></div>' +
      '</div>';
    M.openModal({
      title: user ? 'Editar usuario' : 'Nuevo usuario',
      saveLabel: user ? 'Guardar cambios' : 'Crear',
      body: body,
      onSave: function (modal) {
        var get = function (f) { return modal.querySelector('[data-f="' + f + '"]').value; };
        var rec = { name: get('name'), email: get('email'), role: get('role'), status: get('status') };
        if (user) { Object.assign(user, rec); M.toast('Cambios guardados'); }
        else { rec.id = M.uid('u'); users.unshift(rec); M.toast('Usuario creado'); }
        render();
      }
    });
  }

  $add.addEventListener('click', function () { openForm(null); });
  render();
})();
