from django.db import migrations

PERMISSIONS = [
   ("usuario.crear", "Crear usuarios"),
   ("usuario.editar", "Editar usuarios"),
   ("rol.editar", "Editar roles y permisos"),
   ("cliente.crear", "Registrar clientes"),
   ("cliente.consultar", "Consultar clientes"),
   ("empresa.recuperar", "Recuperar empresas desde el ERP"),
   ("empresa.asignar_cliente", "Asignar cliente a una empresa"),
   ("empresa.asignar_grupo", "Asignar grupo/distribuidor a una empresa"),
   ("financiero.consultar", "Consultar planes, pagos y adeudo"),
   ("reportes.consultar", "Consultar el motor de reportes"),
   ("auditoria.consultar", "Consultar la bitacora de auditoria"),
]

ROLES = {
   "administrador": [codigo for codigo, _ in PERMISSIONS],
   "operador": [
      "cliente.crear",
      "cliente.consultar",
      "empresa.recuperar",
      "empresa.asignar_cliente",
      "empresa.asignar_grupo",
      "financiero.consultar",
   ],
   "ejecutivo": [
      "cliente.consultar",
      "financiero.consultar",
      "reportes.consultar",
   ],
}


def seed(apps, schema_editor):
   Permission = apps.get_model("accounts", "Permission")
   Role = apps.get_model("accounts", "Role")

   codigo_to_permission = {}
   for codigo, descripcion in PERMISSIONS:
      permission, _ = Permission.objects.get_or_create(
         codigo=codigo, defaults={"descripcion": descripcion}
      )
      codigo_to_permission[codigo] = permission

   for nombre, codigos in ROLES.items():
      role, _ = Role.objects.get_or_create(nombre=nombre)
      role.permissions.set(codigo_to_permission[c] for c in codigos)


def unseed(apps, schema_editor):
   Role = apps.get_model("accounts", "Role")
   Permission = apps.get_model("accounts", "Permission")
   Role.objects.filter(nombre__in=ROLES.keys()).delete()
   Permission.objects.filter(codigo__in=[c for c, _ in PERMISSIONS]).delete()


class Migration(migrations.Migration):
   dependencies = [
      ("accounts", "0001_initial"),
   ]

   operations = [
      migrations.RunPython(seed, unseed),
   ]
