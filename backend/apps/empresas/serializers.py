from rest_framework import serializers

from apps.empresas.models import Company


class CompanySerializer(serializers.ModelSerializer):
   class Meta:
      model = Company
      fields = [
         "id",
         "proyecto",
         "id_externo",
         "app",
         "razon_social",
         "nombre_comercial",
         "estado",
         "ultima_sync",
      ]
      read_only_fields = fields


class CompanySearchResultSerializer(serializers.Serializer):
   proyecto = serializers.CharField()
   id_externo = serializers.CharField()
   app = serializers.CharField()
   razon_social = serializers.CharField()
   nombre_comercial = serializers.CharField()
   estado = serializers.CharField()


class CompanyRetrievalRequestSerializer(serializers.Serializer):
   proyecto = serializers.ChoiceField(choices=["ADMIN", "PEOPLE"])
   id_externo = serializers.CharField(max_length=100)
