"""
AdeudoService: outstanding-balance calculation per company and aggregated
by client, group, distributor (R-PAG-04/08). See readme.md Ticket 1
(TK-08-02) for the documented interface and performance target.
"""

import datetime
from decimal import ROUND_HALF_UP, Decimal

from django.db.models import Q, Sum

from apps.comercial.models import Assignment
from apps.financiero.models import Pago

ZERO = Decimal("0.00")


def _round(value) -> Decimal:
   if value is None:
      return ZERO
   return Decimal(value).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def resolve_assignments_as_of(queryset, a_fecha: datetime.date | None):
   """Filters an Assignment queryset to the rows current as of a_fecha (or
   presently current when a_fecha is None). Public so other read-only
   aggregations (e.g. apps.reportes) can reuse the exact same "as of date"
   semantics instead of reimplementing it (R-REP-02)."""
   if a_fecha is None:
      return queryset.filter(fecha_fin__isnull=True)
   # fecha_inicio/fecha_fin are DateTimeFields; compare by date part only so
   # a same-day assignment (whose time-of-day is "now") still counts as
   # current "as of today".
   return queryset.filter(fecha_inicio__date__lte=a_fecha).filter(
      Q(fecha_fin__isnull=True) | Q(fecha_fin__date__gt=a_fecha)
   )


# Backward-compatible internal alias used within this module.
_current_or_as_of = resolve_assignments_as_of


def _company_ids_for(destino_id: int, tipo: str, a_fecha: datetime.date | None) -> set[int]:
   qs = _current_or_as_of(
      Assignment.objects.filter(destino_id=destino_id, tipo=tipo), a_fecha
   )
   return set(qs.values_list("origen_id", flat=True))


def adeudo_por_empresa(empresa_id: int, a_fecha: datetime.date | None = None) -> Decimal:
   total = Pago.objects.filter(empresa_id=empresa_id, estatus=Pago.ESTATUS_PENDIENTE).aggregate(
      total=Sum("total")
   )["total"]
   return _round(total)


def _adeudo_por_empresas(empresa_ids) -> Decimal:
   if not empresa_ids:
      return ZERO
   total = Pago.objects.filter(
      empresa_id__in=empresa_ids, estatus=Pago.ESTATUS_PENDIENTE
   ).aggregate(total=Sum("total"))["total"]
   return _round(total)


def adeudo_por_cliente(cliente_id: int, a_fecha: datetime.date | None = None) -> Decimal:
   empresa_ids = _company_ids_for(cliente_id, Assignment.TIPO_EMPRESA_CLIENTE, a_fecha)
   return _adeudo_por_empresas(empresa_ids)


def adeudo_por_grupo(grupo_id: int, a_fecha: datetime.date | None = None) -> Decimal:
   empresa_ids = _company_ids_for(grupo_id, Assignment.TIPO_EMPRESA_GRUPO, a_fecha)
   return _adeudo_por_empresas(empresa_ids)


def adeudo_por_distribuidor(distribuidor_id: int, a_fecha: datetime.date | None = None) -> Decimal:
   direct_ids = _company_ids_for(distribuidor_id, Assignment.TIPO_EMPRESA_DIST, a_fecha)

   group_ids = _company_ids_for(distribuidor_id, Assignment.TIPO_GRUPO_DIST, a_fecha)
   inherited_ids: set[int] = set()
   for group_id in group_ids:
      inherited_ids |= _company_ids_for(group_id, Assignment.TIPO_EMPRESA_GRUPO, a_fecha)

   return _adeudo_por_empresas(direct_ids | inherited_ids)
