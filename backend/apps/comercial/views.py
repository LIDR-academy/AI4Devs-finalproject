from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from apps.accounts.audit import emit_audit_event
from apps.accounts.permissions import RequiresPermission
from apps.comercial.models import Assignment, Distributor, Group
from apps.comercial.serializers import (
    AssignClientSerializer,
    AssignDistributorSerializer,
    AssignGroupSerializer,
    CompanyCommercialStatusSerializer,
    DistributorSerializer,
    GroupSerializer,
)
from apps.comercial.services import (
    CompanyNotEligibleError,
    ConcurrentAssignmentError,
    DistributorInheritedFromGroupError,
    TargetNotFoundError,
    asignar_cliente,
    asignar_distribuidor_a_grupo,
    asignar_distribuidor_directo,
    asignar_grupo,
    current_assignment,
    distribuidor_efectivo,
)


class GroupViewSet(viewsets.ModelViewSet):
   queryset = Group.objects.all()
   serializer_class = GroupSerializer
   permission_classes = [RequiresPermission("empresa.asignar_grupo")]


class DistributorViewSet(viewsets.ModelViewSet):
   queryset = Distributor.objects.all()
   serializer_class = DistributorSerializer
   permission_classes = [RequiresPermission("empresa.asignar_grupo")]


def _handle_assignment(assign_fn, empresa_id, target_id, usuario, accion_label, entidad_id):
   try:
      assignment = assign_fn(empresa_id, target_id, usuario)
   except TargetNotFoundError:
      return Response({"detail": "Entidad no encontrada."}, status=status.HTTP_404_NOT_FOUND)
   except CompanyNotEligibleError:
      return Response(
         {"detail": "La empresa no es elegible para asignaciones (baja en ERP)."},
         status=status.HTTP_409_CONFLICT,
      )
   except DistributorInheritedFromGroupError:
      return Response(
         {"detail": "El distribuidor es heredado del grupo."},
         status=status.HTTP_409_CONFLICT,
      )
   except ConcurrentAssignmentError:
      return Response(
         {"detail": "Ya existe una asignacion vigente concurrente."},
         status=status.HTTP_409_CONFLICT,
      )

   emit_audit_event(
      usuario, accion_label, entidad="Empresa", target_id=entidad_id, destino_id=target_id
   )
   return Response(status=status.HTTP_200_OK, data={"assignment_id": assignment.pk})


@api_view(["PUT"])
@permission_classes([RequiresPermission("empresa.asignar_cliente")])
def assign_client(request, empresa_id):
   payload = AssignClientSerializer(data=request.data)
   payload.is_valid(raise_exception=True)
   return _handle_assignment(
      asignar_cliente,
      empresa_id,
      payload.validated_data["cliente_id"],
      request.user,
      "empresa.asignar_cliente",
      empresa_id,
   )


@api_view(["PUT"])
@permission_classes([RequiresPermission("empresa.asignar_grupo")])
def assign_group(request, empresa_id):
   payload = AssignGroupSerializer(data=request.data)
   payload.is_valid(raise_exception=True)
   return _handle_assignment(
      asignar_grupo,
      empresa_id,
      payload.validated_data["grupo_id"],
      request.user,
      "empresa.asignar_grupo",
      empresa_id,
   )


@api_view(["PUT"])
@permission_classes([RequiresPermission("empresa.asignar_grupo")])
def assign_distributor(request, empresa_id):
   payload = AssignDistributorSerializer(data=request.data)
   payload.is_valid(raise_exception=True)
   return _handle_assignment(
      asignar_distribuidor_directo,
      empresa_id,
      payload.validated_data["distribuidor_id"],
      request.user,
      "empresa.asignar_distribuidor",
      empresa_id,
   )


@api_view(["GET", "PUT"])
@permission_classes([RequiresPermission("empresa.asignar_grupo")])
def group_distributor(request, grupo_id):
   if request.method == "PUT":
      payload = AssignDistributorSerializer(data=request.data)
      payload.is_valid(raise_exception=True)
      return _handle_assignment(
         asignar_distribuidor_a_grupo,
         grupo_id,
         payload.validated_data["distribuidor_id"],
         request.user,
         "grupo.asignar_distribuidor",
         grupo_id,
      )

   assignment = current_assignment(grupo_id, Assignment.TIPO_GRUPO_DIST)
   return Response(
      {"grupo_id": grupo_id, "distribuidor_id": assignment.destino_id if assignment else None}
   )


@api_view(["GET"])
@permission_classes([RequiresPermission("empresa.asignar_grupo")])
def commercial_status(request, empresa_id):
   cliente = current_assignment(empresa_id, Assignment.TIPO_EMPRESA_CLIENTE)
   grupo = current_assignment(empresa_id, Assignment.TIPO_EMPRESA_GRUPO)
   distribuidor = distribuidor_efectivo(empresa_id)

   data = CompanyCommercialStatusSerializer(
      {
         "empresa_id": empresa_id,
         "cliente_id": cliente.destino_id if cliente else None,
         "grupo_id": grupo.destino_id if grupo else None,
         "distribuidor_efectivo_id": distribuidor.pk if distribuidor else None,
      }
   ).data
   return Response(data)
