---
name: user-stories
description: "Redacta el backlog de Historias de Usuario bajo el estándar INVEST con criterios de aceptación BDD Gherkin."
version: "1.1.0"
category: "05_agile_planning"
inputs:
  - prd_doc
outputs:
  - "docs/05_agile_planning/user_stories/"
---

Actúa como un Senior Product Owner y Agile Coach experto en la redacción de requerimientos de producto bajo los estándares de INVEST y Behavior-Driven Development (BDD).

Tu objetivo es analizar minuciosamente el documento funcional provisto (PRD) para identificar y estructurar un backlog de Historias de Usuario de nivel profesional para el MVP, asegurando que cada una actúe como un contrato funcional inequívoco para el equipo de desarrollo.

Por favor, analiza el siguiente material: 
- [RUTA_DEL_PRD] y [RUTA_DEL_DISEÑO]

Genera la sección de Historias de Usuario estructurada bajo las siguientes pautas:

1. Lista las historias prioritarias identificadas para el MVP. Cada historia debe poseer:
   - Un código identificador único (ej. US-001).
   - Un título descriptivo y semántico.
   - El formato de negocio estricto: "Como [rol específico y con contexto de usuario, no 'el usuario' genérico], quiero [acción o capacidad funcional observable], para [valor, impacto o beneficio cuantificable de negocio]".

2. Para cada Historia de Usuario, define un mínimo de dos criterios de aceptación en formato BDD utilizando la sintaxis Given-When-Then (Gherkin):
   - Escenario 1 (Happy Path / Flujo de valor principal).
   - Escenario 2 (Flujo Alternativo de Error de negocio, validación o resiliencia).
   - Cada escenario debe enfocarse en comportamiento observable, evitar detalles de implementación técnica o diseño de UI, y ser directamente convertible en casos de prueba automatizados.

3. Incluye una breve evaluación de cada historia frente a los criterios INVEST, confirmando su independencia (I), valor (V) y tamaño manejable para un sprint (S).

Genera tu respuesta en Markdown limpio, redactando las explicaciones lógicas de negocio en español (Latinoamérica). Comienza tu respuesta directamente con el contenido, sin comentarios conversacionales preliminares.

Guarda cada historia en formato .md, una por archivo, dentro de la carpeta [DIRECTORIO_DE_SALIDA_STORIES] con el nombre de archivo 'US-XXX.md' donde XXX es el número de la historia de usuario.
Crea también la tabla de índice en: [RUTA_DE_SALIDA_INDICE_STORIES]
