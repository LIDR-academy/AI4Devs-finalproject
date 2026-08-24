from rest_framework import serializers

from apps.clientes.models import Client


class ClientSerializer(serializers.ModelSerializer):
   class Meta:
      model = Client
      fields = [
         "id",
         "rfc",
         "razon_social",
         "id_admin_catalogo_clientes",
         "origen",
         "estado_sync",
      ]
      read_only_fields = ["id", "id_admin_catalogo_clientes", "origen", "estado_sync"]


class ClientRegistrationSerializer(serializers.Serializer):
   rfc = serializers.CharField(max_length=20)
   razon_social = serializers.CharField(max_length=255)
