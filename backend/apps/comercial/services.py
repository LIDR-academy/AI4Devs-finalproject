"""
AsignacionService: single write path for company<->client, company<->group,
company<->distributor, and group<->distributor relationships. Enforces
R-EST-01..08 from documentacion-funcional.md §6.4.
"""

from django.db import IntegrityError, transaction

from apps.clientes.models import Client
from apps.comercial.models import Assignment, Distributor, Group
from apps.empresas.models import Company
from apps.empresas.services import is_eligible_for_assignment


class TargetNotFoundError(Exception):
   pass


class CompanyNotEligibleError(Exception):
   pass


class DistributorInheritedFromGroupError(Exception):
   pass


class ConcurrentAssignmentError(Exception):
   pass


def current_assignment(origen_id: int, tipo: str) -> Assignment | None:
   return Assignment.objects.filter(origen_id=origen_id, tipo=tipo, fecha_fin__isnull=True).first()


def _company_or_raise(empresa_id: int) -> Company:
   try:
      return Company.objects.get(pk=empresa_id)
   except Company.DoesNotExist as exc:
      raise TargetNotFoundError("empresa") from exc


def _target_or_raise(model, destino_id: int, label: str):
   try:
      return model.objects.get(pk=destino_id)
   except model.DoesNotExist as exc:
      raise TargetNotFoundError(label) from exc


def _write_assignment(tipo: str, origen_id: int, destino_id: int, usuario) -> Assignment:
   with transaction.atomic():
      previous = current_assignment(origen_id, tipo)
      accion = Assignment.ACCION_REASIGNAR if previous else Assignment.ACCION_ASIGNAR
      if previous:
         previous.fecha_fin = _now()
         previous.save(update_fields=["fecha_fin"])

      try:
         return Assignment.objects.create(
            tipo=tipo,
            origen_id=origen_id,
            destino_id=destino_id,
            usuario=usuario,
            accion=accion,
         )
      except IntegrityError as exc:
         raise ConcurrentAssignmentError(tipo, origen_id) from exc


def _now():
   from django.utils import timezone

   return timezone.now()


def asignar_cliente(empresa_id: int, cliente_id: int, usuario) -> Assignment:
   company = _company_or_raise(empresa_id)
   if not is_eligible_for_assignment(company):
      raise CompanyNotEligibleError(empresa_id)
   _target_or_raise(Client, cliente_id, "cliente")

   return _write_assignment(Assignment.TIPO_EMPRESA_CLIENTE, empresa_id, cliente_id, usuario)


def asignar_grupo(empresa_id: int, grupo_id: int, usuario) -> Assignment:
   company = _company_or_raise(empresa_id)
   if not is_eligible_for_assignment(company):
      raise CompanyNotEligibleError(empresa_id)
   _target_or_raise(Group, grupo_id, "grupo")

   return _write_assignment(Assignment.TIPO_EMPRESA_GRUPO, empresa_id, grupo_id, usuario)


def asignar_distribuidor_directo(empresa_id: int, distribuidor_id: int, usuario) -> Assignment:
   company = _company_or_raise(empresa_id)
   if not is_eligible_for_assignment(company):
      raise CompanyNotEligibleError(empresa_id)
   _target_or_raise(Distributor, distribuidor_id, "distribuidor")

   if current_assignment(empresa_id, Assignment.TIPO_EMPRESA_GRUPO) is not None:
      raise DistributorInheritedFromGroupError(empresa_id)

   return _write_assignment(Assignment.TIPO_EMPRESA_DIST, empresa_id, distribuidor_id, usuario)


def asignar_distribuidor_a_grupo(grupo_id: int, distribuidor_id: int, usuario) -> Assignment:
   _target_or_raise(Group, grupo_id, "grupo")
   _target_or_raise(Distributor, distribuidor_id, "distribuidor")

   return _write_assignment(Assignment.TIPO_GRUPO_DIST, grupo_id, distribuidor_id, usuario)


def distribuidor_efectivo(empresa_id: int) -> Distributor | None:
   """Direct distributor if present, else the current group's distributor
   (R-EST-04 inheritance)."""
   direct = current_assignment(empresa_id, Assignment.TIPO_EMPRESA_DIST)
   if direct:
      return Distributor.objects.filter(pk=direct.destino_id).first()

   group_assignment = current_assignment(empresa_id, Assignment.TIPO_EMPRESA_GRUPO)
   if not group_assignment:
      return None

   group_distributor = current_assignment(group_assignment.destino_id, Assignment.TIPO_GRUPO_DIST)
   if not group_distributor:
      return None

   return Distributor.objects.filter(pk=group_distributor.destino_id).first()
