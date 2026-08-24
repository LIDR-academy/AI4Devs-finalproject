"""
EstatusPlanService: derives a subscription's operational status from the
cached ERP data, per R-PLN-03/04/05 (reglas_cobranza.md rule #2c). Never
mutates the cached estatus — always computed on read.
"""

import datetime

from apps.financiero.models import EmpresaPlan

VIGENTE = "vigente"
VENCIDO = "vencido"
BLOQUEADO = "bloqueado"


def estado_derivado(empresa_plan: EmpresaPlan, today: datetime.date | None = None) -> str:
   today = today or datetime.date.today()

   if empresa_plan.estatus == EmpresaPlan.ESTATUS_BLOQUEADO:
      return BLOQUEADO

   if empresa_plan.estatus == EmpresaPlan.ESTATUS_EXPIRADO:
      return VENCIDO

   # ESTATUS_VIGENTE: current only while within the grace period
   plan_prorroga = getattr(empresa_plan.plan, "prorroga", 0) or 0
   limite = empresa_plan.fecha_final + datetime.timedelta(
      days=plan_prorroga + (empresa_plan.prorroga or 0)
   )
   return VIGENTE if limite >= today else VENCIDO
