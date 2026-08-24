from rest_framework.routers import DefaultRouter

from apps.auditoria.views import BitacoraViewSet

router = DefaultRouter()
router.register("auditoria", BitacoraViewSet, basename="auditoria")

urlpatterns = router.urls
