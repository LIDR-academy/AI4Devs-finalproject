from django.conf import settings
from django.db import models


class Bitacora(models.Model):
   """Append-only record of sensitive actions (documentacion-funcional.md
   §6.8, R-SEG-04). No view or serializer in this app exposes update or
   delete for this model — it is enforced by omission, not by a DB grant."""

   usuario = models.ForeignKey(
      settings.AUTH_USER_MODEL,
      on_delete=models.SET_NULL,
      null=True,
      related_name="acciones_auditadas",
   )
   accion = models.CharField(max_length=100)
   entidad = models.CharField(max_length=100, blank=True)
   entidad_id = models.CharField(max_length=100, blank=True, null=True)
   detalle = models.TextField(blank=True)
   ip = models.GenericIPAddressField(null=True, blank=True)
   fecha = models.DateTimeField(auto_now_add=True)

   class Meta:
      ordering = ["-fecha"]

   def __str__(self):
      return f"{self.fecha} {self.accion} ({self.usuario})"
