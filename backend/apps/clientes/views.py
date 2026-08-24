from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.accounts.audit import emit_audit_event
from apps.accounts.permissions import RequiresPermission
from apps.clientes.models import Client
from apps.clientes.serializers import ClientRegistrationSerializer, ClientSerializer
from apps.clientes.services import (
   DuplicateRfcError,
   ErpRejectedClientError,
   register_client,
   retry_sync,
)


class ClientViewSet(
   mixins.ListModelMixin,
   mixins.RetrieveModelMixin,
   viewsets.GenericViewSet,
):
   queryset = Client.objects.all()
   serializer_class = ClientSerializer

   def get_permissions(self):
      if self.action in ("create", "retry"):
         return [RequiresPermission("cliente.crear")()]
      return [RequiresPermission("cliente.consultar")()]

   def create(self, request, *args, **kwargs):
      payload = ClientRegistrationSerializer(data=request.data)
      payload.is_valid(raise_exception=True)

      try:
         client = register_client(**payload.validated_data)
      except DuplicateRfcError:
         return Response(
            {"detail": "RFC ya registrado en EyeMaster."}, status=status.HTTP_409_CONFLICT
         )
      except ErpRejectedClientError as exc:
         return Response({"detail": exc.message}, status=status.HTTP_400_BAD_REQUEST)

      response_status = (
         status.HTTP_201_CREATED
         if client.estado_sync == Client.ESTADO_SINCRONIZADO
         else status.HTTP_202_ACCEPTED
      )
      if client.estado_sync == Client.ESTADO_SINCRONIZADO:
         emit_audit_event(
            request.user, "cliente.crear", entidad="Cliente", target_id=client.pk, rfc=client.rfc
         )

      return Response(ClientSerializer(client).data, status=response_status)

   @action(detail=True, methods=["post"])
   def retry(self, request, pk=None):
      client = self.get_object()

      try:
         client = retry_sync(client)
      except ErpRejectedClientError as exc:
         return Response({"detail": exc.message}, status=status.HTTP_400_BAD_REQUEST)

      if client.estado_sync == Client.ESTADO_SINCRONIZADO:
         emit_audit_event(
            request.user, "cliente.retry", entidad="Cliente", target_id=client.pk, rfc=client.rfc
         )

      return Response(ClientSerializer(client).data, status=status.HTTP_200_OK)
