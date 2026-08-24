import os

from django.core.management.base import BaseCommand, CommandError

from apps.accounts.models import Role, User


class Command(BaseCommand):
   help = (
      "Creates the initial administrator user from ADMIN_BOOTSTRAP_EMAIL / "
      "ADMIN_BOOTSTRAP_PASSWORD environment variables. Idempotent: does "
      "nothing if a user with that email already exists."
   )

   def handle(self, *args, **options):
      email = os.environ.get("ADMIN_BOOTSTRAP_EMAIL")
      password = os.environ.get("ADMIN_BOOTSTRAP_PASSWORD")

      if not email or not password:
         raise CommandError(
            "Set ADMIN_BOOTSTRAP_EMAIL and ADMIN_BOOTSTRAP_PASSWORD to bootstrap an admin."
         )

      if User.objects.filter(email=email).exists():
         self.stdout.write(self.style.WARNING(f"User {email} already exists, skipping."))
         return

      try:
         admin_role = Role.objects.get(nombre="administrador")
      except Role.DoesNotExist as exc:
         raise CommandError(
            "Role 'administrador' not found. Run migrations first."
         ) from exc

      User.objects.create_superuser(
         email=email,
         password=password,
         nombre="Administrador",
         rol=admin_role,
      )
      self.stdout.write(self.style.SUCCESS(f"Bootstrap administrator created: {email}"))
