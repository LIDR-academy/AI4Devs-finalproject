"""
Flexible reporting engine: measure x dimensions x filters x a_fecha
(documentacion-funcional.md §6.7). Scoped for this delivery to the
`adeudo` and `pagado` measures — see openspec/specs/reporting for the
documented rationale on the deferred measures.
"""

import datetime
from decimal import Decimal

from django.db.models import Sum

from apps.clientes.models import Client
from apps.comercial.models import Assignment, Distributor, Group
from apps.empresas.models import Company
from apps.financiero.adeudo_service import (
   adeudo_por_cliente,
   adeudo_por_distribuidor,
   adeudo_por_empresa,
   adeudo_por_grupo,
   resolve_assignments_as_of,
)
from apps.financiero.models import Pago

# (model, id field, human-readable field) per dimension, used to attach a
# "<dimension>_nombre" alongside the raw id in every result row so the UI
# never has to show a bare numeric id.
NAME_LOOKUP = {
   "empresa": (Company, "razon_social"),
   "cliente": (Client, "razon_social"),
   "grupo": (Group, "nombre"),
   "distribuidor": (Distributor, "nombre"),
}


class ReportValidationError(Exception):
   pass


ENTITY_DIMENSIONS = {"cliente", "grupo", "distribuidor"}
ASSIGNMENT_TIPO_BY_DIMENSION = {
   "cliente": Assignment.TIPO_EMPRESA_CLIENTE,
   "grupo": Assignment.TIPO_EMPRESA_GRUPO,
   "distribuidor": Assignment.TIPO_EMPRESA_DIST,
}
ADEUDO_BY_DIMENSION = {
   "cliente": adeudo_por_cliente,
   "grupo": adeudo_por_grupo,
   "distribuidor": adeudo_por_distribuidor,
   "empresa": adeudo_por_empresa,
}


def _filtered_company_ids(filtros: dict) -> set[int] | None:
   """None means "no proyecto/app filter applied" (all companies)."""
   proyecto = filtros.get("proyecto")
   app = filtros.get("app")
   if not proyecto and not app:
      return None

   qs = Company.objects.all()
   if proyecto:
      qs = qs.filter(proyecto=proyecto)
   if app:
      qs = qs.filter(app=app)
   return set(qs.values_list("pk", flat=True))


def _entity_ids_with_assignments(dimension: str, a_fecha: datetime.date | None) -> list[int]:
   tipo = ASSIGNMENT_TIPO_BY_DIMENSION[dimension]
   qs = resolve_assignments_as_of(Assignment.objects.filter(tipo=tipo), a_fecha)
   return sorted(set(qs.values_list("destino_id", flat=True)))


def _adeudo_single_dimension(dimension: str, filtros: dict, a_fecha) -> list[dict]:
   adeudo_min = filtros.get("adeudo_min")

   if dimension == "empresa":
      company_ids = _filtered_company_ids(filtros)
      qs = (
         Company.objects.all()
         if company_ids is None
         else Company.objects.filter(pk__in=company_ids)
      )
      rows = [
         {"empresa": company.pk, "adeudo": str(adeudo_por_empresa(company.pk, a_fecha))}
         for company in qs
      ]
   else:
      ids = _entity_ids_with_assignments(dimension, a_fecha)
      fn = ADEUDO_BY_DIMENSION[dimension]
      rows = [{dimension: entity_id, "adeudo": str(fn(entity_id, a_fecha))} for entity_id in ids]

   if adeudo_min is not None:
      rows = [r for r in rows if Decimal(r["adeudo"]) >= adeudo_min]
   return rows


def _adeudo_entity_plus_empresa(entity_dimension: str, filtros: dict, a_fecha) -> list[dict]:
   """dimensiones=[cliente|grupo|distribuidor, empresa]: one row per company
   under each entity of that type."""
   allowed_company_ids = _filtered_company_ids(filtros)
   adeudo_min = filtros.get("adeudo_min")

   entity_ids = _entity_ids_with_assignments(entity_dimension, a_fecha)
   rows = []
   for entity_id in entity_ids:
      if entity_dimension == "distribuidor":
         company_ids = _distributor_company_ids(entity_id, a_fecha)
      else:
         tipo = ASSIGNMENT_TIPO_BY_DIMENSION[entity_dimension]
         qs = resolve_assignments_as_of(
            Assignment.objects.filter(destino_id=entity_id, tipo=tipo), a_fecha
         )
         company_ids = set(qs.values_list("origen_id", flat=True))

      if allowed_company_ids is not None:
         company_ids &= allowed_company_ids

      for company_id in sorted(company_ids):
         value = adeudo_por_empresa(company_id, a_fecha)
         if adeudo_min is not None and value < adeudo_min:
            continue
         rows.append({entity_dimension: entity_id, "empresa": company_id, "adeudo": str(value)})

   return rows


def _distributor_company_ids(distribuidor_id: int, a_fecha) -> set[int]:
   direct = resolve_assignments_as_of(
      Assignment.objects.filter(destino_id=distribuidor_id, tipo=Assignment.TIPO_EMPRESA_DIST),
      a_fecha,
   )
   direct_ids = set(direct.values_list("origen_id", flat=True))

   group_links = resolve_assignments_as_of(
      Assignment.objects.filter(destino_id=distribuidor_id, tipo=Assignment.TIPO_GRUPO_DIST),
      a_fecha,
   )
   group_ids = set(group_links.values_list("origen_id", flat=True))

   inherited_ids: set[int] = set()
   for group_id in group_ids:
      group_companies = resolve_assignments_as_of(
         Assignment.objects.filter(destino_id=group_id, tipo=Assignment.TIPO_EMPRESA_GRUPO),
         a_fecha,
      )
      inherited_ids |= set(group_companies.values_list("origen_id", flat=True))

   return direct_ids | inherited_ids


def _measure_adeudo(dimensiones: list[str], filtros: dict, a_fecha) -> list[dict]:
   if len(dimensiones) == 1:
      return _adeudo_single_dimension(dimensiones[0], filtros, a_fecha)

   if len(dimensiones) == 2 and dimensiones[1] == "empresa" and dimensiones[0] in ENTITY_DIMENSIONS:
      return _adeudo_entity_plus_empresa(dimensiones[0], filtros, a_fecha)

   raise ReportValidationError(
      f"medida 'adeudo' no soporta la combinacion de dimensiones {dimensiones}"
   )


def _measure_pagado(dimensiones: list[str], filtros: dict, a_fecha) -> list[dict]:
   if dimensiones != ["empresa"]:
      raise ReportValidationError("medida 'pagado' solo soporta dimension 'empresa'")

   qs = Pago.objects.filter(estatus=Pago.ESTATUS_PAGADO)
   proyecto = filtros.get("proyecto")
   app = filtros.get("app")
   if proyecto:
      qs = qs.filter(empresa__proyecto=proyecto)
   if app:
      qs = qs.filter(empresa__app=app)

   aggregated = qs.values("empresa_id").annotate(total=Sum("total"))
   return [
      {"empresa": row["empresa_id"], "pagado": str(_quantize(row["total"]))} for row in aggregated
   ]


def _quantize(value) -> Decimal:
   return Decimal(value).quantize(Decimal("0.01"))


MEASURES = {
   "adeudo": {
      "dimensiones_soportadas": ENTITY_DIMENSIONS | {"empresa"},
      "ejecutar": _measure_adeudo,
   },
   "pagado": {
      "dimensiones_soportadas": {"empresa"},
      "ejecutar": _measure_pagado,
   },
}


def _parse_filtros(filtros: dict) -> dict:
   parsed = dict(filtros or {})
   if "adeudo_min" in parsed and parsed["adeudo_min"] is not None:
      try:
         parsed["adeudo_min"] = Decimal(str(parsed["adeudo_min"]))
      except Exception as exc:
         raise ReportValidationError("filtro 'adeudo_min' invalido") from exc
   return parsed


def _attach_names(rows: list[dict], dimensiones: list[str]) -> list[dict]:
   """Batch-resolves each dimension's id to a human-readable name and adds
   it as "<dimension>_nombre", so callers never have to show a bare id."""
   names_by_dimension: dict[str, dict[int, str]] = {}
   for dimension in dimensiones:
      lookup = NAME_LOOKUP.get(dimension)
      if lookup is None:
         continue
      model, name_field = lookup
      ids = {row[dimension] for row in rows if dimension in row}
      if not ids:
         continue
      names_by_dimension[dimension] = dict(
         model.objects.filter(pk__in=ids).values_list("pk", name_field)
      )

   for row in rows:
      for dimension, names in names_by_dimension.items():
         if dimension in row:
            row[f"{dimension}_nombre"] = names.get(row[dimension], f"#{row[dimension]}")

   return rows


def run_report(medida: str, dimensiones: list[str], filtros: dict, a_fecha=None) -> dict:
   if medida not in MEASURES:
      raise ReportValidationError(f"medida desconocida: {medida}")

   spec = MEASURES[medida]
   for dimension in dimensiones:
      if dimension not in spec["dimensiones_soportadas"]:
         raise ReportValidationError(f"la medida '{medida}' no soporta la dimension '{dimension}'")

   parsed_filtros = _parse_filtros(filtros)
   rows = spec["ejecutar"](dimensiones, parsed_filtros, a_fecha)
   rows = _attach_names(rows, dimensiones)
   value_key = medida
   total = sum((Decimal(row[value_key]) for row in rows), Decimal("0.00"))

   return {"medida": medida, "filas": rows, "total": str(total)}
