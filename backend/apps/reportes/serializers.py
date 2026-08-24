from rest_framework import serializers


class ReportQuerySerializer(serializers.Serializer):
   medida = serializers.CharField()
   dimensiones = serializers.ListField(child=serializers.CharField(), allow_empty=False)
   filtros = serializers.DictField(required=False, default=dict)
   a_fecha = serializers.DateField(required=False, allow_null=True)
