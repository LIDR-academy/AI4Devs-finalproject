from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from apps.accounts.permissions import RequiresPermission
from apps.reportes.catalog import CATALOG
from apps.reportes.engine import ReportValidationError, run_report
from apps.reportes.serializers import ReportQuerySerializer


@api_view(["POST"])
@permission_classes([RequiresPermission("reportes.consultar")])
def consulta(request):
   payload = ReportQuerySerializer(data=request.data)
   payload.is_valid(raise_exception=True)

   try:
      result = run_report(
         medida=payload.validated_data["medida"],
         dimensiones=payload.validated_data["dimensiones"],
         filtros=payload.validated_data.get("filtros") or {},
         a_fecha=payload.validated_data.get("a_fecha"),
      )
   except ReportValidationError as exc:
      return Response({"detail": str(exc)}, status=400)

   return Response(result)


@api_view(["GET"])
@permission_classes([RequiresPermission("reportes.consultar")])
def catalogo(request):
   return Response(CATALOG)
