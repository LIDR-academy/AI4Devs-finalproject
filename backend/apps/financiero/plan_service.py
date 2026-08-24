"""
Local plan catalog and subscription creation. Unlike ERPFinanceService
(read-only mirror of ERP data), this is EyeMaster acting as the source of
truth: plans created here have no ERP counterpart (origen=eyemaster) and
are never pushed back to ADMIN/PEOPLE.
"""

from decimal import Decimal

from django.db import transaction

from apps.empresas.models import Company
from apps.financiero.models import Complemento, EmpresaPlan, Plan, PlanComplemento


class TargetNotFoundError(Exception):
   pass


@transaction.atomic
def crear_plan(nombre: str, precio_base: Decimal, complementos: list[dict]) -> Plan:
   """complementos: [{"complemento_id": int, "limite": Decimal}, ...]"""
   plan = Plan.objects.create(
      nombre=nombre,
      precio_base=precio_base,
      origen=Plan.ORIGEN_EYEMASTER,
   )

   for item in complementos:
      try:
         complemento = Complemento.objects.get(pk=item["complemento_id"])
      except Complemento.DoesNotExist as exc:
         raise TargetNotFoundError("complemento") from exc

      PlanComplemento.objects.create(
         plan=plan, complemento=complemento, limite=Decimal(str(item["limite"]))
      )

   return plan


def crear_complemento(clave: str, nombre: str) -> Complemento:
   return Complemento.objects.create(clave=clave, nombre=nombre)


def asignar_plan_a_empresa(
   empresa_id: int,
   plan_id: int,
   *,
   fecha_inicio,
   fecha_final,
   tipo_contrato: int,
   precio_unitario: Decimal,
   estatus: int = EmpresaPlan.ESTATUS_VIGENTE,
) -> EmpresaPlan:
   try:
      company = Company.objects.get(pk=empresa_id)
   except Company.DoesNotExist as exc:
      raise TargetNotFoundError("empresa") from exc

   try:
      plan = Plan.objects.get(pk=plan_id)
   except Plan.DoesNotExist as exc:
      raise TargetNotFoundError("plan") from exc

   return EmpresaPlan.objects.create(
      empresa=company,
      id_externo=None,
      origen=Plan.ORIGEN_EYEMASTER,
      plan=plan,
      tipo_contrato=tipo_contrato,
      estatus=estatus,
      fecha_inicio=fecha_inicio,
      fecha_final=fecha_final,
      precio_unitario=Decimal(str(precio_unitario)),
   )
