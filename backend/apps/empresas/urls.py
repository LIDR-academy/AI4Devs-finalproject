from rest_framework.routers import DefaultRouter

from apps.empresas.views import CompanyViewSet

router = DefaultRouter()
router.register("empresas", CompanyViewSet, basename="empresa")

urlpatterns = router.urls
