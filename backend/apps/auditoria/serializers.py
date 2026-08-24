from rest_framework import serializers

from apps.auditoria.models import Bitacora


class BitacoraSerializer(serializers.ModelSerializer):
   usuario = serializers.EmailField(source="usuario.email", allow_null=True, read_only=True)

   class Meta:
      model = Bitacora
      fields = ["id", "usuario", "accion", "entidad", "entidad_id", "detalle", "fecha"]
      read_only_fields = fields
