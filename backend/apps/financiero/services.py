"""
ERPFinanceService: syncs a company's plans, payments, and billing cycles
from the ERP Gateway into the local cache. Read-only toward the ERP
(R-PLN-08); serves the existing cache if the ERP is unavailable.
"""

from decimal import Decimal

from django.db import transaction

from apps.empresas.models import Company
from apps.financiero.models import Complemento, CortePlan, EmpresaPlan, Pago, Plan
from services.erp.errors import ERPUnavailableError
from services.erp.gateway import get_erp_gateway


def _get_or_create_plan(proyecto: str, id_externo: str, nombre: str) -> Plan:
   plan, _ = Plan.objects.get_or_create(
      proyecto=proyecto, id_externo=id_externo, defaults={"nombre": nombre}
   )
   if plan.nombre != nombre:
      plan.nombre = nombre
      plan.save(update_fields=["nombre"])
   return plan


def _get_or_create_complemento(clave: str) -> Complemento:
   complemento, _ = Complemento.objects.get_or_create(clave=clave, defaults={"nombre": clave})
   return complemento


@transaction.atomic
def sync_company(company: Company) -> None:
   gateway = get_erp_gateway()

   try:
      planes = gateway.get_plans(company.proyecto, company.id_externo)
      pagos = gateway.get_payments(company.proyecto, company.id_externo)
      cortes = gateway.get_billing_cycles(company.proyecto, company.id_externo)
   except ERPUnavailableError:
      return

   empresa_plan_by_external_id: dict[str, EmpresaPlan] = {}
   for dto in planes:
      plan = _get_or_create_plan(company.proyecto, dto.id_externo, dto.plan_nombre)
      empresa_plan, _ = EmpresaPlan.objects.update_or_create(
         empresa=company,
         id_externo=dto.id_externo,
         defaults={
            "plan": plan,
            "tipo_contrato": dto.tipo_contrato,
            "estatus": dto.estatus,
            "fecha_inicio": dto.fecha_inicio,
            "fecha_final": dto.fecha_final,
            "prorroga": dto.prorroga,
            "precio_unitario": Decimal(str(dto.precio_unitario)),
         },
      )
      empresa_plan_by_external_id[dto.id_externo] = empresa_plan

   for dto in pagos:
      empresa_plan = empresa_plan_by_external_id.get(dto.empresa_plan_id_externo)
      if empresa_plan is None:
         empresa_plan = EmpresaPlan.objects.filter(
            empresa=company, id_externo=dto.empresa_plan_id_externo
         ).first()

      Pago.objects.update_or_create(
         empresa=company,
         id_externo=dto.id_externo,
         defaults={
            "empresa_plan": empresa_plan,
            "estatus": dto.estatus,
            "subtotal": Decimal(str(dto.subtotal)),
            "importe_descuento": Decimal(str(dto.importe_descuento)),
            "impuesto": Decimal(str(dto.impuesto)),
            "total": Decimal(str(dto.total)),
            "fecha": dto.fecha,
         },
      )

   for dto in cortes:
      empresa_plan = empresa_plan_by_external_id.get(dto.empresa_plan_id_externo)
      if empresa_plan is None:
         continue  # billing cycle for a subscription we didn't just sync; skip

      complemento = _get_or_create_complemento(dto.complemento_clave)
      CortePlan.objects.update_or_create(
         empresa_plan=empresa_plan,
         id_externo=dto.id_externo,
         defaults={
            "complemento": complemento,
            "cantidad": Decimal(str(dto.cantidad)),
            "excedente": Decimal(str(dto.excedente)),
            "periodo_inicio": dto.periodo_inicio,
            "periodo_final": dto.periodo_final,
         },
      )
