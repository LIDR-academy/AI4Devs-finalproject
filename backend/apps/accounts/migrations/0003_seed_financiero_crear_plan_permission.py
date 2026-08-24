from django.db import migrations

NEW_PERMISSION = ("financiero.crear_plan", "Crear planes y suscripciones en EyeMaster")

ROLES_GRANTED = ["administrador", "operador"]


def seed(apps, schema_editor):
   Permission = apps.get_model("accounts", "Permission")
   Role = apps.get_model("accounts", "Role")

   codigo, descripcion = NEW_PERMISSION
   permission, _ = Permission.objects.get_or_create(codigo=codigo, defaults={"descripcion": descripcion})

   for nombre in ROLES_GRANTED:
      role = Role.objects.filter(nombre=nombre).first()
      if role:
         role.permissions.add(permission)


def unseed(apps, schema_editor):
   Permission = apps.get_model("accounts", "Permission")
   Permission.objects.filter(codigo=NEW_PERMISSION[0]).delete()


class Migration(migrations.Migration):
   dependencies = [
      ("accounts", "0002_seed_roles_and_permissions"),
   ]

   operations = [
      migrations.RunPython(seed, unseed),
   ]
