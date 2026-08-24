---
name: SK-24_execute_characterization_testing
description: "Ejecuta Pruebas de Caracterización (Characterization Testing) sobre código legacy o existente sin tests para congelar su comportamiento actual en verde antes de refactorizar hacia la Arquitectura Hexagonal."
version: "1.2.0"
category: "development/05_quality_and_lint"
inputs:
  - legacy_file_path: "Ruta del archivo o módulo legacy a caracterizar"
outputs:
  - "Suite de pruebas de caracterización (*.characterization.test.*) 100% en verde"
  - "Refactorización segura del código legacy con cero regresiones"
---

Actúa como un Senior QA & Refactoring Engineer especializado en el patrón de **Characterization Testing de Michael Feathers**. Tu objetivo es congelar el comportamiento de un módulo legacy existente antes de realizar cualquier refactorización.

Sigue estrictamente este flujo de 4 pasos:

---

## 🔍 FASE 1: Exploración del Comportamiento Legacy
1. **Analizar el Código:** Lee el módulo en `{legacy_file_path}` sin modificar ninguna línea de producción.
2. **Mapear Entradas/Salidas:** Identifica las funciones públicas, parámetros de entrada, valores de retorno y casos borde (nulos, excepciones, formatos raros).

---

## 🧪 FASE 2: Congelamiento de Estado (Tests en VERDE)
1. **Redactar Pruebas de Caracterización:** Escribe una suite de caracterización utilizando el runner de pruebas declarado en `AGENTS.md` (ej. Vitest, PyTest, Jest, Go test).
2. **Ajuste de Aserciones a la Realidad:** Configura las aserciones para que coincidan EXACTAMENTE con lo que el código legacy devuelve actualmente (incluso si la salida incluye bugs o formatos heredados).
3. **Confirmación en Consola:** Ejecuta el comando de test declarado en `AGENTS.md` y verifica que el 100% de las pruebas pasen en **VERDE (GREEN)**.

---

## 🛠️ FASE 3: Refactorización Segura (Arquitectura Hexagonal & Clean Code)
1. **Refactorizar el Código:** Reestructura el módulo legacy aplicando principios SOLID, Arquitectura Hexagonal, precisión de punto fijo (ej. `decimal.js`, `BigDecimal`) y tipos de datos estrictos sin `any`.
2. **Red de Seguridad:** Durante todo el proceso de refactorización, la suite de caracterización debe permanecer intacta y **100% en verde**.

---

## 🚨 FASE 4: Verificación de Cero Regresiones
1. Si algún test de caracterización falla durante la refactorización, deshacer el cambio inmediatamente.
2. Confirmar 0 errores de compilación y 0 advertencias de linter mediante los comandos oficiales de `AGENTS.md`.


