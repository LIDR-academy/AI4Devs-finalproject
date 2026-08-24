from rest_framework import serializers

from apps.comercial.models import Distributor, Group


class GroupSerializer(serializers.ModelSerializer):
   class Meta:
      model = Group
      fields = ["id", "nombre"]


class DistributorSerializer(serializers.ModelSerializer):
   class Meta:
      model = Distributor
      fields = ["id", "nombre"]


class AssignClientSerializer(serializers.Serializer):
   cliente_id = serializers.IntegerField()


class AssignGroupSerializer(serializers.Serializer):
   grupo_id = serializers.IntegerField()


class AssignDistributorSerializer(serializers.Serializer):
   distribuidor_id = serializers.IntegerField()


class CompanyCommercialStatusSerializer(serializers.Serializer):
   empresa_id = serializers.IntegerField()
   cliente_id = serializers.IntegerField(allow_null=True)
   grupo_id = serializers.IntegerField(allow_null=True)
   distribuidor_efectivo_id = serializers.IntegerField(allow_null=True)
