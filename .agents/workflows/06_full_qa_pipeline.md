---
name: 06_full_qa_pipeline
description: "Pipeline QA completo SOTA v2.1: (0) Pre-Flight Check proactivo, (1) Análisis Anti-N+1, Mass-Assignment y contratos, (2) Diseño de tests Few-Shot RAG, (3) Auto-Loop TDD & Mutación Stryker >= 70% con veredicto en JSON Schema estricto."
version: "2.1.0"
category: "workflows/quality"
---

# 🧪 Full QA Pipeline SOTA (v2.1.0)

Este workflow ejecuta el pipeline de aseguramiento de calidad de forma interactiva, segura y determinista sobre el proyecto.

---

## ⚡ Paso 0 — Pre-Flight Proactive Health Check
1. Ejecutar la verificación de tipos y linters oficiales declarados en `AGENTS.md` antes de modificar cualquier archivo.
2. Si se detecta desincronización de tipos o compilación corrupta, invocar `SK-22_agent_troubleshooting` para corregir de forma preventiva antes de continuar.

---

## 🎯 Paso 1 — Análisis de Riesgo, Anti-N+1, Mass-Assignment & Contratos
1. Escanear los cambios en el código (`git diff` o archivo objetivo).
2. **Auditoría Anti-N+1:** Verificar que las consultas ORM utilicen Eager Loading (`.preload()`, `.include`, `joinedload()`, etc.).
3. **Auditoría Anti-Mass-Assignment:** Verificar que ninguna entidad ORM reciba entradas HTTP no sanitizadas.
4. Si existe un contrato OpenAPI/API spec y un validador de contratos (`SK-25`), ejecutar la auditoría de esquemas para detectar discrepancias de DTOs.
5. Entregar matriz de riesgos ordenada por severidad.
6. 🛑 **PAUSA OBLIGATORIA (Gate 1):** Esperar confirmación del usuario para avanzar al Paso 2.

---

## 🧪 Paso 2 — Diseño de Suite de Pruebas & Dynamic Few-Shot Retrieval (`SK-26`)
1. Invocar `SK-26_few_shot_retriever` para recuperar los 2 mejores patrones de tests/código existentes en la base de código actual.
2. Diseñar la suite de prueba determinista incluyendo:
   - Happy path.
   - Casos borde (Unicode, nulos, rangos extremales).
   - Errores estandarizados RFC 7807.
3. 🛑 **PAUSA OBLIGATORIA (Gate 2):** Esperar confirmación del usuario para avanzar al Paso 3.

---

## 🔄 Paso 3 — Bucle TDD & Auto-Loop de Pruebas de Mutación ($\ge 70\%$)
1. **RED:** Escribir primero las pruebas y asertar explícitamente el estado de fallo en consola.
2. **GREEN:** Implementar el código mínimo necesario para poner la suite en verde usando los comandos de `AGENTS.md`.
3. **MUTATION AUTO-LOOP:** Ejecutar el runner de Mutation Testing del proyecto (ej. Stryker, Mutmut, PITest, cargo-mutants). Si el **Mutation Score es < 70%**, el agente ejecutará iteraciones autónomas (hasta 3 ciclos) agregando casos borde adicionales hasta matar a todos los mutantes sintéticos.
4. **VEREDICTO ESTRUCTURADO (JSON SCHEMA ENFORCEMENT):** El Reviewer Adversarial emitirá su veredicto strictly bajo este formato JSON:

```json
{
  "verdict": "APPROVED",
  "mutation_score": 84.2,
  "required_mutation_score": 70.0,
  "preflight_status": "PASSED",
  "contract_compliance": "100%",
  "anti_n_plus_one_status": "PASSED",
  "mass_assignment_protection": "PASSED",
  "violations": []
}
```
