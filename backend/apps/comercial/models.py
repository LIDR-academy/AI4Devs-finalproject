from django.conf import settings
from django.db import models
from django.db.models import Q


class Group(models.Model):
   nombre = models.CharField(max_length=150, unique=True)

   class Meta:
      ordering = ["nombre"]

   def __str__(self):
      return self.nombre


class Distributor(models.Model):
   nombre = models.CharField(max_length=150, unique=True)

   class Meta:
      ordering = ["nombre"]

   def __str__(self):
      return self.nombre


class Assignment(models.Model):
   """Polymorphic, time-bounded relationship. origen_id/destino_id are
   plain identifiers (no FK) because the entity they point at depends on
   `tipo` — see documentacion-funcional.md §7.2/TK-04-01: integrity is
   enforced by AsignacionService, not by the database schema, for these two
   columns specifically. The current-assignment uniqueness guarantee (R-EST-07)
   IS enforced by the database, via the partial unique index below."""

   TIPO_EMPRESA_CLIENTE = "empresa-cliente"
   TIPO_EMPRESA_GRUPO = "empresa-grupo"
   TIPO_EMPRESA_DIST = "empresa-dist"
   TIPO_GRUPO_DIST = "grupo-dist"
   TIPO_CHOICES = [
      (TIPO_EMPRESA_CLIENTE, "Empresa-Cliente"),
      (TIPO_EMPRESA_GRUPO, "Empresa-Grupo"),
      (TIPO_EMPRESA_DIST, "Empresa-Distribuidor"),
      (TIPO_GRUPO_DIST, "Grupo-Distribuidor"),
   ]

   ACCION_ASIGNAR = "asignar"
   ACCION_REASIGNAR = "reasignar"
   ACCION_REMOVER = "remover"
   ACCION_CHOICES = [
      (ACCION_ASIGNAR, "Asignar"),
      (ACCION_REASIGNAR, "Reasignar"),
      (ACCION_REMOVER, "Remover"),
   ]

   tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)
   origen_id = models.PositiveIntegerField()
   destino_id = models.PositiveIntegerField()
   fecha_inicio = models.DateTimeField(auto_now_add=True)
   fecha_fin = models.DateTimeField(null=True, blank=True)
   usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
   accion = models.CharField(max_length=20, choices=ACCION_CHOICES)

   class Meta:
      constraints = [
         models.UniqueConstraint(
            fields=["origen_id", "tipo"],
            condition=Q(fecha_fin__isnull=True),
            name="asignacion_vigente_unica",
         ),
         models.CheckConstraint(
            condition=Q(fecha_fin__isnull=True) | Q(fecha_fin__gt=models.F("fecha_inicio")),
            name="asignacion_fecha_fin_posterior",
         ),
      ]
      indexes = [
         models.Index(fields=["origen_id", "tipo", "-fecha_inicio"]),
         models.Index(fields=["usuario"]),
      ]

   def __str__(self):
      return f"{self.tipo}:{self.origen_id}->{self.destino_id} ({self.fecha_inicio})"
