from rest_framework import mixins, viewsets

from apps.accounts.permissions import RequiresPermission
from apps.auditoria.models import Bitacora
from apps.auditoria.serializers import BitacoraSerializer


class BitacoraViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
   """Read-only by design: no create/update/destroy actions are wired,
   enforcing the append-only requirement at the API surface."""

   queryset = Bitacora.objects.select_related("usuario").all()
   serializer_class = BitacoraSerializer
   permission_classes = [RequiresPermission("auditoria.consultar")]
