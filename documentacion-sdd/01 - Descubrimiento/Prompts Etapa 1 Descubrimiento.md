# Resumen de Prompts — Etapa 1: Descubrimiento (SDD)

## Propósito del documento

Este documento resume de forma estructurada **todos los prompts realizados por el usuario** que permitieron construir y cerrar correctamente la **Etapa 1: Descubrimiento** del proceso Spec-Driven Development (SDD).

El objetivo es dejar trazabilidad clara de **cómo se llegó al resultado final**, qué decisiones se tomaron y cómo se fue refinando el entendimiento del problema.

---

## 1. Inicio: comprensión metodológica

### Prompt

Solicitud de explicación de **qué es SDD**, sus etapas y las tareas asociadas, con la intención de aplicar el enfoque a un proyecto basado en entrevistas.

### Resultado

* Alineamiento metodológico inicial.
* Definición de un enfoque incremental y guiado por el problema.
* Confirmación de que el proyecto sería abordado **etapa por etapa**.

---

## 2. Definición del modo de trabajo

### Prompt

Solicitud explícita de avanzar **por etapas**, indicando el interés de utilizar **spec-kit** en fases posteriores.

### Resultado

* Acuerdo de no adelantar diseño ni soluciones.
* Definición de spec-kit como herramienta futura, no inmediata.

---

## 3. Entrega de insumos de investigación

### Prompt

Entrega de **transcripciones de entrevistas** en archivos Word y consulta sobre la conveniencia de investigar soluciones similares del mercado.

### Resultado

* Inicio formal de la Etapa 1 (Descubrimiento).
* Decisión metodológica de **posponer el benchmark de mercado** para evitar sesgos tempranos.

---

## 4. Definición del stack actual y sistemas legacy

### Prompt

Aclaración de que las plataformas actuales a reemplazar son:

* Whaticket
* Znuny (OTRS)
* SIHR (sistema legacy propio)

Entrega adicional de documentación técnica de SIHR en formato Markdown.

### Resultado

* Cierre del contexto tecnológico actual.
* Identificación explícita de SIHR como sistema legacy crítico.

---

## 5. Cierre del alcance técnico

### Prompt

Confirmación explícita de que la intención es **reemplazar completamente** las tres plataformas.

### Resultado

* Eliminación de ambigüedades de alcance.
* Definición del proyecto como **reemplazo total**, no integración parcial.

---

## 6. Ampliación del alcance organizacional

### Prompt

Aclaración de que el sistema no es exclusivo del área DII, sino que también debe servir a:

* Soporte TI
* Área de Procesos

### Resultado

* Replanteamiento del problema como **transversal a la organización**.
* Identificación de necesidades y tensiones entre áreas.

---

## 7. Definición del tipo de usuarios

### Prompt

Aclaración de que el sistema será utilizado **solo por usuarios internos** de la empresa.

### Resultado

* Eliminación de escenarios de atención a usuarios externos.
* Simplificación del contexto operativo y de seguridad.

---

## 8. Solicitud de síntesis de entrevistas

### Prompt

Pregunta directa sobre si los documentos de entrevistas fueron leídos y solicitud de un **resumen corto de cada uno**.

### Resultado

* Validación del análisis completo de los insumos.
* Obtención de una síntesis clara por documento:

  * Soporte TI
  * Desarrollo Informático (DII)
  * Área de Procesos

---

## 9. Discusión sobre Jobs To Be Done (JTBD)

### Prompt

Consulta sobre la utilidad de transformar los hallazgos en **Jobs To Be Done** y si correspondía hacerlo en esta etapa.

### Resultado

* Definición de JTBD como **puente entre Etapa 1 y Etapa 2**.
* Decisión de utilizar JTBD de alto nivel en el cierre del Descubrimiento.

---

## 10. Solicitud de propuesta de JTBD

### Prompt

Solicitud explícita de generar los **Jobs To Be Done** del proyecto.

### Resultado

* Definición de JTBD transversales y específicos por área.
* Base conceptual estable para iniciar la Spec.

---

## 11. Validación del cambio de etapa

### Prompt

Consulta directa sobre si ya era momento de iniciar la **Etapa 2**.

### Resultado

* Identificación de una fase de transición consciente.
* Confirmación de que la Etapa 1 estaba cerrada a nivel de problema.

---

## 12. Detalle del proceso actual (As-Is)

### Prompt

Descripción detallada del flujo operativo real actual:

* Entrada por Soporte
* Derivación por áreas
* Uso paralelo de OTRS y SIHR
* Creación de proyectos fuera del flujo de soporte
* Uso forzado de SIHR por Procesos
* Falta de imputación horaria en Soporte TI

### Resultado

* Documentación completa del proceso actual.
* Identificación clara de quiebres, excepciones y usos forzados.

---

## 13. Solicitud de salida formal de la Etapa 1

### Prompt

Solicitud de generar en formato Markdown la **salida completa de la Etapa 1 (Descubrimiento)**.

### Resultado

* Creación del documento consolidado de cierre de la Etapa 1.
* Confirmación formal de preparación para iniciar la Etapa 2.

---

## 14. Resultado final

Gracias a la secuencia de prompts:

* El problema quedó claramente definido.
* El alcance fue cerrado sin ambigüedades.
* Los actores y flujos reales fueron documentados.
* Se establecieron JTBD claros y reutilizables.

La Etapa 1 de SDD se considera **completa y correctamente ejecutada**.
