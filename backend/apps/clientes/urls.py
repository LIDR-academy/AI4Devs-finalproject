from rest_framework.routers import DefaultRouter

from apps.clientes.views import ClientViewSet

router = DefaultRouter()
router.register("clientes", ClientViewSet, basename="cliente")

urlpatterns = router.urls
