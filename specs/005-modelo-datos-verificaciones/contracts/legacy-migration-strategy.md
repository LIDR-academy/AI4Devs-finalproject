# Contract: Estrategia de migración MySQL → SQL Server

**Feature**: `005-modelo-datos-verificaciones` | **Date**: 2026-07-30

Contrato del **documento** de estrategia (US2 / FR-008 / SC-006). No exige script ETL en esta feature.

## Entregable

Documento versionado (markdown en el repositorio) que un revisor puede validar sin ejecutar carga.

## Contenido mínimo obligatorio

| Sección | Requisito |
|---|---|
| Origen | Tablas MySQL `certificados` y `certificados_verificacion` (estructura confirmada) |
| Destino | Lift-and-shift 1:1 hacia `dbo.certificados` y `dbo.certificados_verificacion` ([data-model.md](../data-model.md)) |
| Alcance temporal | Histórico completo (códigos y registros, **incluidos anulados/vencidos**) |
| Orden de carga | Primero `certificados`, luego `certificados_verificacion` (respetar FK) |
| Duplicados de `cod_verificacion` | Omitir fila conflictiva + registrar en log; prevalece la primera ocurrencia |
| Huérfanos | Omitir `certificados_verificacion` sin código destino + log; **prohibido** crear códigos placeholder |
| Idempotencia | Definir cómo una re-ejecución no duplica filas |
| Criterios del ticket ETL | Lista de aceptación verificable (conteos, 0 duplicados, 0 huérfanos, log) |
| Fuera de alcance | ETL ejecutable; `ta_trazabilidad_*` / SPs `SCISP_*` (deprecados, no migrar ni alterar) |

## No forma parte de este contrato

- Scripts SQL/ETL ejecutables.
- Ejecución contra MySQL o SQL Server de producción/QAS.
- Remapeo a un modelo normalizado distinto del legacy.

## Criterio de aceptación (SC-006)

Un revisor confirma que el documento cubre todas las filas de la tabla anterior sin contradicciones con [spec.md](../spec.md) y [data-model.md](../data-model.md).
