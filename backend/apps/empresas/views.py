import dataclasses

from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.accounts.permissions import RequiresPermission
from apps.empresas.models import Company
from apps.empresas.serializers import (
    CompanyRetrievalRequestSerializer,
    CompanySearchResultSerializer,
    CompanySerializer,
)
from apps.empresas.services import CompanyNotFoundError, retrieve_company, search_companies


class CompanyViewSet(
   mixins.ListModelMixin,
   mixins.RetrieveModelMixin,
   viewsets.GenericViewSet,
):
   queryset = Company.objects.all()
   serializer_class = CompanySerializer
   permission_classes = [RequiresPermission("empresa.recuperar")]

   @action(detail=False, methods=["get"], url_path="buscar")
   def buscar(self, request):
      proyecto = request.query_params.get("proyecto", "")
      query = request.query_params.get("query", "")
      results = search_companies(proyecto, query)
      data = CompanySearchResultSerializer([dataclasses.asdict(r) for r in results], many=True).data
      return Response(data)

   @action(detail=False, methods=["post"], url_path="recuperar")
   def recuperar(self, request):
      payload = CompanyRetrievalRequestSerializer(data=request.data)
      payload.is_valid(raise_exception=True)

      try:
         company = retrieve_company(**payload.validated_data)
      except CompanyNotFoundError:
         return Response(
            {"detail": "Empresa no encontrada en el ERP."}, status=status.HTTP_404_NOT_FOUND
         )

      return Response(CompanySerializer(company).data, status=status.HTTP_200_OK)
