---
name: SK-26_retrieve_few_shot_context
description: "Realiza una búsqueda semántica de patrones de código reales en el repositorio actual para inyectar ejemplos Few-Shot dinámicos antes de la fase de codificación."
version: "1.2.0"
category: "development/05_quality_and_lint"
inputs:
  - ticket_domain: "Dominio o módulo objetivo del ticket"
outputs:
  - "Ejemplos dinámicos Few-Shot extraídos directamente de la base de código"
---

# 🔍 SK-26: Recuperador Dinámico de Patrones Few-Shot (v1.2.0)

Actúa como un **Codebase Pattern Specialist**. Tu objetivo es auditar la base de código existente antes de iniciar un nuevo ticket para recuperar los patrones de implementación más representativos y garantizar cero desviación estilística o arquitectónica.

---

## 🔄 Pipeline de Recuperación en 3 Pasos

### Paso 1: Búsqueda de Módulos Similares (Pattern Discovery)
1. Buscar en el repositorio archivos de dominio, repositorios, controladores o componentes UI que pertenezcan a slices verticales ya aprobados.
2. Extraer ejemplos de:
   - Manejo de tipos de alta precisión (Fixed-point Decimal, ej. `decimal.js`, `BigDecimal`).
   - Esquemas de sanitización activa DTO sin `any` (ej. Zod, Pydantic, Joi).
   - Firma de constructores para Inversión de Dependencias (DIP).
   - Mappers de persistencia e interfaces de repositorio en memoria (`InMemoryRepository`).

### Paso 2: Filtrado Anti-Antipatrones
1. Descartar cualquier archivo que contenga tipos `any`, casting sin parsear/validar o lógica acoplada a frameworks en la capa de dominio.
2. Seleccionar los 2 mejores snippets de código del proyecto que cumplan al 100% las reglas de `docs/04_governance_and_quality/rules/`.

### Paso 3: Inyección de Contexto
1. Proveer los snippets recuperados en el contexto del desarrollador como la plantilla de referencia **Few-Shot Obligatoria** para la tarea actual.


