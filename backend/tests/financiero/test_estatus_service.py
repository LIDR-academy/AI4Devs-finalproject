import datetime

import pytest

from apps.empresas.models import Company
from apps.financiero.estatus_service import BLOQUEADO, VENCIDO, VIGENTE, estado_derivado
from apps.financiero.models import EmpresaPlan, Plan


@pytest.fixture
def company(db):
   return Company.objects.create(proyecto="ADMIN", id_externo="e1", razon_social="Empresa Test")


@pytest.fixture
def plan_with_grace(db):
   return Plan.objects.create(proyecto="ADMIN", id_externo="p1", nombre="Plan", prorroga=3)


def _empresa_plan(company, plan, estatus, fecha_final, prorroga=0):
   return EmpresaPlan(
      empresa=company,
      id_externo="ep1",
      plan=plan,
      tipo_contrato=EmpresaPlan.TIPO_CONTRATO_PAGADO,
      estatus=estatus,
      fecha_inicio=fecha_final - datetime.timedelta(days=30),
      fecha_final=fecha_final,
      prorroga=prorroga,
      precio_unitario="100.00",
   )


def test_vigente_within_grace_period(company, plan_with_grace):
   ep = _empresa_plan(
      company, plan_with_grace, EmpresaPlan.ESTATUS_VIGENTE, fecha_final=datetime.date(2026, 2, 1)
   )
   # plan.prorroga=3 + empresa_plan.prorroga=0 => limite 2026-02-04
   assert estado_derivado(ep, today=datetime.date(2026, 2, 4)) == VIGENTE


def test_expired_by_status_flag(company, plan_with_grace):
   ep = _empresa_plan(
      company, plan_with_grace, EmpresaPlan.ESTATUS_EXPIRADO, fecha_final=datetime.date(2026, 2, 1)
   )
   assert estado_derivado(ep, today=datetime.date(2020, 1, 1)) == VENCIDO


def test_expired_by_date_past_grace(company, plan_with_grace):
   ep = _empresa_plan(
      company, plan_with_grace, EmpresaPlan.ESTATUS_VIGENTE, fecha_final=datetime.date(2026, 2, 1)
   )
   # limite = 2026-02-04 (3 days grace), today after that => vencido
   assert estado_derivado(ep, today=datetime.date(2026, 2, 10)) == VENCIDO


def test_blocked(company, plan_with_grace):
   ep = _empresa_plan(
      company, plan_with_grace, EmpresaPlan.ESTATUS_BLOQUEADO, fecha_final=datetime.date(2026, 2, 1)
   )
   assert estado_derivado(ep, today=datetime.date(2020, 1, 1)) == BLOQUEADO


def test_grace_periods_sum_plan_and_subscription(company, plan_with_grace):
   ep = _empresa_plan(
      company,
      plan_with_grace,
      EmpresaPlan.ESTATUS_VIGENTE,
      fecha_final=datetime.date(2026, 2, 1),
      prorroga=5,
   )
   # limite = 2026-02-01 + 3 (plan) + 5 (subscription) = 2026-02-09
   assert estado_derivado(ep, today=datetime.date(2026, 2, 9)) == VIGENTE
   assert estado_derivado(ep, today=datetime.date(2026, 2, 10)) == VENCIDO
