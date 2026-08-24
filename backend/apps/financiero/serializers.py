from rest_framework import serializers

from apps.financiero.models import Complemento, EmpresaPlan, Pago, Plan, PlanComplemento


class EmpresaPlanSerializer(serializers.ModelSerializer):
   plan_nombre = serializers.CharField(source="plan.nombre", read_only=True)

   class Meta:
      model = EmpresaPlan
      fields = [
         "id",
         "plan_nombre",
         "origen",
         "tipo_contrato",
         "estatus",
         "fecha_inicio",
         "fecha_final",
         "prorroga",
         "precio_unitario",
         "ultima_sync",
      ]


class PagoSerializer(serializers.ModelSerializer):
   class Meta:
      model = Pago
      fields = [
         "id",
         "estatus",
         "subtotal",
         "importe_descuento",
         "impuesto",
         "total",
         "fecha",
         "ultima_sync",
      ]


class ComplementoSerializer(serializers.ModelSerializer):
   class Meta:
      model = Complemento
      fields = ["id", "clave", "nombre"]


class ComplementoCreateSerializer(serializers.Serializer):
   clave = serializers.CharField(max_length=50)
   nombre = serializers.CharField(max_length=150)


class PlanComplementoSerializer(serializers.ModelSerializer):
   complemento_id = serializers.IntegerField(source="complemento.id", read_only=True)
   complemento_nombre = serializers.CharField(source="complemento.nombre", read_only=True)

   class Meta:
      model = PlanComplemento
      fields = ["complemento_id", "complemento_nombre", "limite"]


class PlanSerializer(serializers.ModelSerializer):
   complementos = PlanComplementoSerializer(source="complementos_plan", many=True, read_only=True)

   class Meta:
      model = Plan
      fields = ["id", "nombre", "precio_base", "origen", "complementos"]
      read_only_fields = fields


class PlanComplementoInputSerializer(serializers.Serializer):
   complemento_id = serializers.IntegerField()
   limite = serializers.DecimalField(max_digits=12, decimal_places=2)


class PlanCreateSerializer(serializers.Serializer):
   nombre = serializers.CharField(max_length=150)
   precio_base = serializers.DecimalField(max_digits=12, decimal_places=2)
   complementos = serializers.ListField(
      child=PlanComplementoInputSerializer(), required=False, default=list
   )


class AssignPlanSerializer(serializers.Serializer):
   plan_id = serializers.IntegerField()
   fecha_inicio = serializers.DateField()
   fecha_final = serializers.DateField()
   tipo_contrato = serializers.ChoiceField(choices=EmpresaPlan.TIPO_CONTRATO_CHOICES)
   precio_unitario = serializers.DecimalField(max_digits=12, decimal_places=2)
   estatus = serializers.ChoiceField(
      choices=EmpresaPlan.ESTATUS_CHOICES, default=EmpresaPlan.ESTATUS_VIGENTE
   )
