from django.urls import path

from apps.reportes.views import catalogo, consulta

urlpatterns = [
    path("reportes/consulta", consulta, name="reportes-consulta"),
    path("reportes/catalogo", catalogo, name="reportes-catalogo"),
]
