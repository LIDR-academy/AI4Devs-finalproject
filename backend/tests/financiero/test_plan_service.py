from decimal import Decimal

import pytest

from apps.empresas.models import Company
from apps.financiero.models import Complemento, EmpresaPlan, Plan, PlanComplemento
from apps.financiero.plan_service import (
    TargetNotFoundError,
    asignar_plan_a_empresa,
    crear_complemento,
    crear_plan,
)


@pytest.mark.django_db
def test_crear_complemento():
   complemento = crear_complemento("COMP-X", "Recurso X")
   assert Complemento.objects.filter(clave="COMP-X").exists()
   assert complemento.nombre == "Recurso X"


@pytest.mark.django_db
def test_crear_plan_with_complementos():
   complemento = Complemento.objects.create(clave="COMP-A", nombre="Recurso A")

   plan = crear_plan(
      "Plan Enterprise",
      Decimal("999.00"),
      [{"complemento_id": complemento.pk, "limite": Decimal("500.00")}],
   )

   assert plan.origen == Plan.ORIGEN_EYEMASTER
   assert plan.precio_base == Decimal("999.00")
   assert plan.proyecto is None
   assert plan.id_externo is None

   pc = PlanComplemento.objects.get(plan=plan, complemento=complemento)
   assert pc.limite == Decimal("500.00")


@pytest.mark.django_db
def test_crear_plan_unknown_complemento_raises():
   with pytest.raises(TargetNotFoundError):
      crear_plan("Plan X", Decimal("10.00"), [{"complemento_id": 999999, "limite": "1"}])


@pytest.mark.django_db
def test_multiple_local_plans_do_not_collide_on_null_identity():
   """Local plans have proyecto=id_externo=None; the unique constraint on
   (proyecto, id_externo) must not treat two NULLs as a duplicate."""
   crear_plan("Plan A", Decimal("10.00"), [])
   crear_plan("Plan B", Decimal("20.00"), [])
   assert Plan.objects.filter(origen=Plan.ORIGEN_EYEMASTER).count() == 2


@pytest.mark.django_db
def test_asignar_plan_a_empresa_creates_subscription():
   company = Company.objects.create(proyecto="ADMIN", id_externo="p1", razon_social="E1")
   plan = crear_plan("Plan Local", Decimal("500.00"), [])

   subscription = asignar_plan_a_empresa(
      company.pk,
      plan.pk,
      fecha_inicio="2026-01-01",
      fecha_final="2026-02-01",
      tipo_contrato=EmpresaPlan.TIPO_CONTRATO_PAGADO,
      precio_unitario=Decimal("500.00"),
   )

   assert subscription.origen == Plan.ORIGEN_EYEMASTER
   assert subscription.id_externo is None
   assert subscription.estatus == EmpresaPlan.ESTATUS_VIGENTE
   assert EmpresaPlan.objects.filter(empresa=company, plan=plan).count() == 1


@pytest.mark.django_db
def test_asignar_plan_unknown_company_raises():
   plan = crear_plan("Plan Local", Decimal("500.00"), [])
   with pytest.raises(TargetNotFoundError):
      asignar_plan_a_empresa(
         999999,
         plan.pk,
         fecha_inicio="2026-01-01",
         fecha_final="2026-02-01",
         tipo_contrato=EmpresaPlan.TIPO_CONTRATO_PAGADO,
         precio_unitario=Decimal("500.00"),
      )


@pytest.mark.django_db
def test_asignar_plan_unknown_plan_raises():
   company = Company.objects.create(proyecto="ADMIN", id_externo="p2", razon_social="E2")
   with pytest.raises(TargetNotFoundError):
      asignar_plan_a_empresa(
         company.pk,
         999999,
         fecha_inicio="2026-01-01",
         fecha_final="2026-02-01",
         tipo_contrato=EmpresaPlan.TIPO_CONTRATO_PAGADO,
         precio_unitario=Decimal("500.00"),
      )


@pytest.mark.django_db
def test_company_can_have_both_erp_synced_and_local_subscriptions():
   """A company retrieved via ERP sync can also get a locally-created plan;
   both coexist since id_externo is nullable and origen distinguishes them."""
   company = Company.objects.create(proyecto="ADMIN", id_externo="1001", razon_social="E1")
   erp_plan = Plan.objects.create(proyecto="ADMIN", id_externo="5001", nombre="Plan ERP")
   EmpresaPlan.objects.create(
      empresa=company,
      id_externo="5001",
      plan=erp_plan,
      tipo_contrato=EmpresaPlan.TIPO_CONTRATO_PAGADO,
      estatus=EmpresaPlan.ESTATUS_VIGENTE,
      fecha_inicio="2026-01-01",
      fecha_final="2026-02-01",
      precio_unitario="499.00",
   )

   local_plan = crear_plan("Plan Local", Decimal("100.00"), [])
   asignar_plan_a_empresa(
      company.pk,
      local_plan.pk,
      fecha_inicio="2026-01-01",
      fecha_final="2026-02-01",
      tipo_contrato=EmpresaPlan.TIPO_CONTRATO_PAGADO,
      precio_unitario=Decimal("100.00"),
   )

   assert EmpresaPlan.objects.filter(empresa=company).count() == 2
   assert EmpresaPlan.objects.filter(empresa=company, origen=Plan.ORIGEN_ERP).count() == 1
   assert EmpresaPlan.objects.filter(empresa=company, origen=Plan.ORIGEN_EYEMASTER).count() == 1
