from django.db import models


class Client(models.Model):
   ORIGEN_EXISTENTE = "existente"
   ORIGEN_CREADO = "creado"
   ORIGEN_CHOICES = [(ORIGEN_EXISTENTE, "Existente"), (ORIGEN_CREADO, "Creado")]

   ESTADO_SINCRONIZADO = "sincronizado"
   ESTADO_PENDIENTE = "pendiente"
   ESTADO_ERROR = "error"
   ESTADO_CHOICES = [
      (ESTADO_SINCRONIZADO, "Sincronizado"),
      (ESTADO_PENDIENTE, "Pendiente"),
      (ESTADO_ERROR, "Error"),
   ]

   rfc = models.CharField(max_length=20, unique=True)
   razon_social = models.CharField(max_length=255)
   id_admin_catalogo_clientes = models.CharField(max_length=100, null=True, blank=True)
   origen = models.CharField(max_length=20, choices=ORIGEN_CHOICES, null=True, blank=True)
   estado_sync = models.CharField(
      max_length=20, choices=ESTADO_CHOICES, default=ESTADO_PENDIENTE
   )

   class Meta:
      ordering = ["razon_social"]

   def __str__(self):
      return f"{self.razon_social} ({self.rfc})"
