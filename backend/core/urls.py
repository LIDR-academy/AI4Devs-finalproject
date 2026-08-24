from django.contrib import admin
from django.urls import include, path

from core.health import health

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health", health, name="health"),
    path("api/", include("apps.accounts.urls")),
    path("api/", include("apps.auditoria.urls")),
    path("api/", include("apps.clientes.urls")),
    path("api/", include("apps.empresas.urls")),
    path("api/", include("apps.comercial.urls")),
    path("api/", include("apps.financiero.urls")),
    path("api/", include("apps.reportes.urls")),
]
