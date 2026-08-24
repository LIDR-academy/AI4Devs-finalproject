from django.urls import path
from rest_framework.routers import DefaultRouter

from apps.comercial.views import (
    DistributorViewSet,
    GroupViewSet,
    assign_client,
    assign_distributor,
    assign_group,
    commercial_status,
    group_distributor,
)

router = DefaultRouter()
router.register("grupos", GroupViewSet, basename="grupo")
router.register("distribuidores", DistributorViewSet, basename="distribuidor")

urlpatterns = [
    path("empresas/<int:empresa_id>/cliente", assign_client, name="empresa-asignar-cliente"),
    path("empresas/<int:empresa_id>/grupo", assign_group, name="empresa-asignar-grupo"),
    path(
        "empresas/<int:empresa_id>/distribuidor",
        assign_distributor,
        name="empresa-asignar-distribuidor",
    ),
    path(
        "empresas/<int:empresa_id>/comercial",
        commercial_status,
        name="empresa-comercial-status",
    ),
    path(
        "grupos/<int:grupo_id>/distribuidor",
        group_distributor,
        name="grupo-distribuidor",
    ),
] + router.urls
