---
name: testing-strategy
description: "Establece la directiva de pruebas TDD Test-First (Red-Green-Refactor) y la taxonomía de pruebas Unitarias, Integración y E2E."
version: "1.1.0"
category: "03_governance_and_quality"
inputs:
  - prd_doc
outputs:
  - "docs/03_governance_and_quality/08_testing_strategy.md"
---

Actúa como un Senior QA Engineer y me ayudes a configurar las instrucciones de testing de mi proyecto.

Escribe una directiva estricta que le ordene a la IA seguir un proceso riguroso de Test-Driven Development (TDD):
- El agente de IA NUNCA debe escribir código de producción sin tener un test que falle primero.
- El agente de IA NUNCA debe modificar o reescribir un archivo de test existente para hacer pasar una implementación errónea, a menos que el contrato de negocio haya cambiado por orden explícita del humano.
- Exige que los tests utilicen aserciones semánticas descriptivas y mocks mínimos.

Guarda el resultado en el archivo: [RUTA_DE_SALIDA_TESTING]
