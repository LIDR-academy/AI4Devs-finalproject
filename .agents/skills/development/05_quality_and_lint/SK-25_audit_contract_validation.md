---
name: SK-25_audit_contract_validation
description: "Ejecuta una auditoría diferencial adversarial entre el Contrato de API (ej. OpenAPI, AsyncAPI, GraphQL) y los validadores de runtime DTO/Schema, clasificando y ordenando las discrepancias por nivel de gravedad (CRÍTICA, ALTA, MEDIA, BAJA)."
version: "1.3.0"
category: "development/05_quality_and_lint"
inputs:
  - api_spec_path: "Ruta de la especificación de API (ej. docs/03_persistence_and_api/openapi.yaml)"
  - validator_files_path: "Ruta de los validadores/esquemas DTO (ej. Zod, Pydantic, Joi)"
outputs:
  - "Reporte de auditoría diferencial (AUDIT-CONTRACT-DISCREPANCIES.md) ordenado por gravedad"
  - "Corrección automática de validadores para alineación al 100% con la especificación de API"
---

Actúa como un Senior Security Auditor & API Architect especializado en el patrón de **Auditoría Diferencial de Contratos de API**. Tu objetivo es comparar la especificación del contrato de la API (ej. OpenAPI / AsyncAPI) contra los validadores de runtime y reportar descalces ordenados por severidad.

Sigue estrictamente este flujo de 4 fases:

---

## 🔍 FASE 1: Comparación Diferencial (Diff Audit)
1. Leer `api_spec_path` (o la especificación en `docs/03_persistence_and_api/`) y extraer la matriz de endpoints, payloads DTO, tipos de datos, formatos (`email`, `uuid`, `iso8601`), expresiones regulares y enums.
2. Validar sintaxis del contrato ejecutando el linter de contratos declarado en `AGENTS.md` (ej. `@stoplight/spectral-cli` para OpenAPI).
3. Leer todos los validadores/esquemas DTO de runtime (ej. `*.validator.ts`, `schemas.py`).
4. Comparar campo por campo identificando ausencias, inconsistencias de tipos y omisiones de validación.

---

## 🚨 FASE 2: Clasificación por Severidad / Gravedad
Clasifica cada descalce en una de las 4 categorías:

1. **🔴 CRÍTICA:** Omisión de sanitización DTO o aceptación de `any`/campos libres que permitan Mass Assignment, Inyección o bypass de seguridad.
2. **🟠 ALTA:** Inconsistencia en tipos de datos (ej. el contrato exige `string` UUID y el validador acepta `number`, o descalce de fechas ISO 8601 UTC).
3. **🟡 MEDIA:** Omisión de restricciones secundarias (rangos min/max, patrones regex, o enums no enforzados en el validador).
4. **🔵 BAJA:** Discrepancias de documentación (titulares, descripciones o códigos de error HTTP).

---

## 📋 FASE 3: Generación del Reporte Audit
Genera el informe `docs/audits/AUDIT-CONTRACT-DISCREPANCIES.md` tabulado con las discrepancias ordenadas de mayor a menor gravedad.

---

## 🛠️ FASE 4: Alineación Automática
Actualiza los archivos de validación DTO corrigiendo primero los hallazgos **CRÍTICOS** y **ALTOS** para lograr un 100% de coincidencia con el contrato de la API. Validar finalmente con los comandos de build y lint oficiales de `AGENTS.md`.



