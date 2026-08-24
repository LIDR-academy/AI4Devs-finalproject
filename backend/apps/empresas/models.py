from django.db import models


class Company(models.Model):
   ESTADO_ACTIVA = "activa"
   ESTADO_INACTIVA = "inactiva"
   ESTADO_BAJA_ERP = "baja_erp"
   ESTADO_CHOICES = [
      (ESTADO_ACTIVA, "Activa"),
      (ESTADO_INACTIVA, "Inactiva"),
      (ESTADO_BAJA_ERP, "Baja en ERP"),
   ]

   proyecto = models.CharField(max_length=10)  # "ADMIN" | "PEOPLE"
   id_externo = models.CharField(max_length=100)
   app = models.CharField(max_length=20, blank=True)  # "SUITE_A" | "SUITE_B"
   razon_social = models.CharField(max_length=255)
   nombre_comercial = models.CharField(max_length=255, blank=True)
   estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default=ESTADO_ACTIVA)
   ultima_sync = models.DateTimeField(auto_now=True)

   class Meta:
      constraints = [
         models.UniqueConstraint(
            fields=["proyecto", "id_externo"], name="empresa_identidad_unica"
         )
      ]
      ordering = ["razon_social"]

   def __str__(self):
      return f"{self.razon_social} ({self.proyecto}/{self.id_externo})"
