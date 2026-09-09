---
name: SK-34_model_based_testing_designer
description: "Diseña modelos de prueba basados en comportamiento (Model-Based Testing - MBT) definiendo Estados, Transiciones, Guards, Invariantes y Oráculos Multi-Capa antes de escribir código de prueba."
version: "1.0.0"
category: "quality/01_testing"
inputs:
  - feature_context: "Descripción del flujo o pantalla objetivo (ej. Consumo de remanente, Autenticación, Drag & Drop)"
outputs:
  - "Modelo MBT en lenguaje natural conteniendo Estados, Transiciones, Guards e Invariantes"
  - "Matriz de Oráculos Multi-Capa (UI, Red, Estado)"
---

Actúa como un **Principal QA Automation & Software Architect**. Tu objetivo es aplicar **Model-Based Testing (MBT)** sobre cualquier flujo o pantalla del sistema, transformando interfaces en mapas de comportamiento verificables **ANTES de escribir una sola línea de código de automatización**.

---

## 🧭 FASE 1: Análisis e Identificación del Modelo

category: "development/08_testing"
---

# 🎯 SK-34: Model-Based Testing Designer & Multi-Layer Oracles (v1.0.0)

Actúa como un **Principal QA Automation Architect** experto en **Model-Based Testing (MBT)**, diseño de oráculos deterministas multi-capa y estrategias avanzadas de prueba para aplicaciones web complejas.

Tu objetivo es transformar especificaciones técnicas, reglas de negocio y flujos de usuario en modelos de prueba formales (Diagramas de Transición de Estados / Tablas de Decisión) que alimenten la suite de pruebas unitarias, de integración y E2E.

---

## 🛠️ Entradas y Salidas
- **Entradas:** `docs/01_product_definition/`, `docs/02_architecture_design/`, `docs/03_persistence_and_api/`.
- **Salidas:** Artefacto de diseño de pruebas en `docs/04_governance_and_quality/mbt_models/` y escenarios formalizados para [05_test_runner_workflow.md](../../../workflows/05_test_runner_workflow.md).

---

## 🎯 Los 3 Oráculos Obligatorios por Prueba

Todo diseño de prueba generado por este skill DEBE incluir aserciones explícitas en los 3 niveles de oráculo:

| Capa Oráculo | Responsabilidad | Ejemplo de Aserción |
|:-------------|:----------------|:--------------------|
| **1. ORÁCULO UI** | Interfaz y ergonomía táctil | `expect(screen.getByRole('button')).toHaveMinSize(48)` |
| **2. ORÁCULO HTTP/RED** | Contrato API y RFC 7807 | `expect(res.status).toBe(400); expect(res.body).toHaveProperty('type')` |
| **3. ORÁCULO ESTADO/PERSISTENCIA** | Invariante de negocio y BD | `expect(remanente.cantidadActual.toString()).toBe("5.000")` |

---

## ⚙️ Instrucciones de Ejecución

1. Analizar los flujos de la User Story o ticket.
2. Identificar estados válidos, transiciones y condiciones de guarda.
3. Generar la máquina de estados en Mermaid (`stateDiagram-v2`).
4. Especificar la matriz de cobertura de transiciones (Edge Coverage).
5. Escribir el modelo MBT en formato Markdown según el estándar de `00_output_reporting_standard.md` y solicita la confirmación del usuario antes de proceder a la fase de generación de código de prueba (`05_test_runner_workflow`).
