from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import PermissionsMixin
from django.db import models


class Permission(models.Model):
   """A permission identified by a stable code, e.g. 'cliente.crear'.

   Deliberately independent from Django's built-in Permission model: codes
   are free strings any app can declare without a migration coupling to
   accounts, and role assignment is managed entirely from product screens
   (see documentacion-funcional.md R-SEG-02).
   """

   codigo = models.CharField(max_length=100, unique=True)
   descripcion = models.CharField(max_length=255, blank=True)

   class Meta:
      ordering = ["codigo"]

   def __str__(self):
      return self.codigo


class Role(models.Model):
   nombre = models.CharField(max_length=50, unique=True)
   descripcion = models.CharField(max_length=255, blank=True)
   permissions = models.ManyToManyField(Permission, related_name="roles", blank=True)

   class Meta:
      ordering = ["nombre"]

   def __str__(self):
      return self.nombre

   def has_permission(self, codigo: str) -> bool:
      return self.permissions.filter(codigo=codigo).exists()


class UserManager(BaseUserManager):
   use_in_migrations = True

   def _create_user(self, email, password, **extra_fields):
      if not email:
         raise ValueError("El email es obligatorio")
      email = self.normalize_email(email)
      user = self.model(email=email, **extra_fields)
      user.set_password(password)
      user.save(using=self._db)
      return user

   def create_user(self, email, password=None, **extra_fields):
      extra_fields.setdefault("is_staff", False)
      extra_fields.setdefault("is_superuser", False)
      return self._create_user(email, password, **extra_fields)

   def create_superuser(self, email, password=None, **extra_fields):
      extra_fields.setdefault("is_staff", True)
      extra_fields.setdefault("is_superuser", True)
      return self._create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
   """EyeMaster's own user model. Login is by email — there is no username,
   per the documented access-and-security module (readme.md §2.5,
   documentacion-funcional.md §6.1)."""

   email = models.EmailField(unique=True)
   nombre = models.CharField(max_length=150)
   rol = models.ForeignKey(Role, on_delete=models.PROTECT, related_name="usuarios", null=True)
   activo = models.BooleanField(default=True)
   is_staff = models.BooleanField(default=False)
   date_joined = models.DateTimeField(auto_now_add=True)

   objects = UserManager()

   USERNAME_FIELD = "email"
   REQUIRED_FIELDS = ["nombre"]

   class Meta:
      ordering = ["email"]

   def __str__(self):
      return self.email

   @property
   def is_active(self):
      return self.activo

   @is_active.setter
   def is_active(self, value):
      self.activo = value

   def has_permission(self, codigo: str) -> bool:
      if self.is_superuser:
         return True
      if not self.activo or self.rol_id is None:
         return False
      return self.rol.has_permission(codigo)

   def permission_codes(self) -> list[str]:
      if self.rol_id is None:
         return []
      return list(self.rol.permissions.values_list("codigo", flat=True))
