import datetime

from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from apps.accounts.audit import emit_audit_event
from apps.accounts.permissions import RequiresPermission
from apps.empresas.models import Company
from apps.financiero.adeudo_service import (
   adeudo_por_cliente,
   adeudo_por_distribuidor,
   adeudo_por_empresa,
   adeudo_por_grupo,
)
from apps.financiero.estatus_service import estado_derivado
from apps.financiero.models import Complemento, EmpresaPlan, Pago, Plan
from apps.financiero.plan_service import (
   TargetNotFoundError,
   asignar_plan_a_empresa,
   crear_complemento,
   crear_plan,
)
from apps.financiero.serializers import (
   AssignPlanSerializer,
   ComplementoCreateSerializer,
   ComplementoSerializer,
   EmpresaPlanSerializer,
   PagoSerializer,
   PlanCreateSerializer,
   PlanSerializer,
)
from apps.financiero.services import sync_company


@api_view(["GET"])
@permission_classes([RequiresPermission("financiero.consultar")])
def company_plans(request, empresa_id):
   company = get_object_or_404(Company, pk=empresa_id)
   sync_company(company)
   planes = EmpresaPlan.objects.filter(empresa=company)
   return Response(EmpresaPlanSerializer(planes, many=True).data)


@api_view(["GET"])
@permission_classes([RequiresPermission("financiero.consultar")])
def company_payments(request, empresa_id):
   company = get_object_or_404(Company, pk=empresa_id)
   sync_company(company)
   pagos = Pago.objects.filter(empresa=company)
   return Response(PagoSerializer(pagos, many=True).data)


def _parse_a_fecha(request) -> datetime.date | None:
   raw = request.query_params.get("a_fecha")
   if not raw:
      return None
   return datetime.date.fromisoformat(raw)


@api_view(["GET"])
@permission_classes([RequiresPermission("financiero.consultar")])
def company_status(request, empresa_id):
   company = get_object_or_404(Company, pk=empresa_id)
   sync_company(company)
   current = (
      EmpresaPlan.objects.filter(empresa=company)
      .select_related("plan")
      .order_by("-fecha_inicio")
      .first()
   )
   if current is None:
      return Response({"estado_derivado": None})
   return Response({"estado_derivado": estado_derivado(current)})


@api_view(["GET"])
@permission_classes([RequiresPermission("financiero.consultar")])
def company_balance(request, empresa_id):
   a_fecha = _parse_a_fecha(request)
   return Response({"adeudo": str(adeudo_por_empresa(empresa_id, a_fecha))})


@api_view(["GET"])
@permission_classes([RequiresPermission("financiero.consultar")])
def client_balance(request, cliente_id):
   a_fecha = _parse_a_fecha(request)
   return Response({"adeudo": str(adeudo_por_cliente(cliente_id, a_fecha))})


@api_view(["GET"])
@permission_classes([RequiresPermission("financiero.consultar")])
def group_balance(request, grupo_id):
   a_fecha = _parse_a_fecha(request)
   return Response({"adeudo": str(adeudo_por_grupo(grupo_id, a_fecha))})


@api_view(["GET"])
@permission_classes([RequiresPermission("financiero.consultar")])
def distributor_balance(request, distribuidor_id):
   a_fecha = _parse_a_fecha(request)
   return Response({"adeudo": str(adeudo_por_distribuidor(distribuidor_id, a_fecha))})


@api_view(["GET", "POST"])
@permission_classes([RequiresPermission("financiero.consultar")])
def complementos(request):
   if request.method == "POST":
      if not request.user.has_permission("financiero.crear_plan"):
         return Response(status=status.HTTP_403_FORBIDDEN)
      payload = ComplementoCreateSerializer(data=request.data)
      payload.is_valid(raise_exception=True)
      created = crear_complemento(**payload.validated_data)
      emit_audit_event(
         request.user, "financiero.crear_complemento", entidad="Complemento", target_id=created.pk
      )
      return Response(ComplementoSerializer(created).data, status=status.HTTP_201_CREATED)

   return Response(ComplementoSerializer(Complemento.objects.all(), many=True).data)


@api_view(["GET", "POST"])
@permission_classes([RequiresPermission("financiero.consultar")])
def plan_catalog(request):
   if request.method == "POST":
      if not request.user.has_permission("financiero.crear_plan"):
         return Response(status=status.HTTP_403_FORBIDDEN)
      payload = PlanCreateSerializer(data=request.data)
      payload.is_valid(raise_exception=True)
      try:
         plan = crear_plan(**payload.validated_data)
      except TargetNotFoundError:
         return Response({"detail": "Complemento no encontrado."}, status=status.HTTP_404_NOT_FOUND)

      emit_audit_event(
         request.user,
         "financiero.crear_plan",
         entidad="Plan",
         target_id=plan.pk,
         nombre=plan.nombre,
      )
      return Response(PlanSerializer(plan).data, status=status.HTTP_201_CREATED)

   return Response(
      PlanSerializer(Plan.objects.prefetch_related("complementos_plan"), many=True).data
   )


@api_view(["POST"])
@permission_classes([RequiresPermission("financiero.crear_plan")])
def assign_plan_to_company(request, empresa_id):
   payload = AssignPlanSerializer(data=request.data)
   payload.is_valid(raise_exception=True)

   try:
      empresa_plan = asignar_plan_a_empresa(empresa_id, **payload.validated_data)
   except TargetNotFoundError as exc:
      return Response({"detail": f"{exc.args[0]} no encontrado."}, status=status.HTTP_404_NOT_FOUND)

   emit_audit_event(
      request.user,
      "financiero.asignar_plan",
      entidad="Empresa",
      target_id=empresa_id,
      plan_id=payload.validated_data["plan_id"],
   )
   return Response(EmpresaPlanSerializer(empresa_plan).data, status=status.HTTP_201_CREATED)
