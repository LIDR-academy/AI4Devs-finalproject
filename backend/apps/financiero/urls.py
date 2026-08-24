from django.urls import path

from apps.financiero.views import (
    assign_plan_to_company,
    client_balance,
    company_balance,
    company_payments,
    company_plans,
    company_status,
    complementos,
    distributor_balance,
    group_balance,
    plan_catalog,
)

urlpatterns = [
    path("empresas/<int:empresa_id>/planes", company_plans, name="empresa-planes"),
    path(
        "empresas/<int:empresa_id>/planes/asignar",
        assign_plan_to_company,
        name="empresa-asignar-plan",
    ),
    path("empresas/<int:empresa_id>/pagos", company_payments, name="empresa-pagos"),
    path("empresas/<int:empresa_id>/estado", company_status, name="empresa-estado"),
    path("empresas/<int:empresa_id>/adeudo", company_balance, name="empresa-adeudo"),
    path("clientes/<int:cliente_id>/adeudo", client_balance, name="cliente-adeudo"),
    path("grupos/<int:grupo_id>/adeudo", group_balance, name="grupo-adeudo"),
    path(
        "distribuidores/<int:distribuidor_id>/adeudo",
        distributor_balance,
        name="distribuidor-adeudo",
    ),
    path("planes", plan_catalog, name="plan-catalog"),
    path("complementos", complementos, name="complemento-list"),
]
