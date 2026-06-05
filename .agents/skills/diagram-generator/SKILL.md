---
name: diagram-generator
description: "Diagrama, Diagram, Mermaid, Casos De Uso, Secuencia, Clases, Flujo, Er, Arquitectura, C4, Mindmap, Gitgraph. Genera diagramas Mermaid detallados a partir de documentación del proyecto o contexto proporcionado."
license: Apache-2.0
metadata:
  author: bytelovers
  version: "1.1"
---
[ACTIVATION]

Esta skill se activa cuando la tarea o el contexto del usuario requiere realizar acciones sobre diagram-generator o incluye las siguientes palabras clave/desencadenadores:
**Triggers:** diagrama, diagram, mermaid, casos de uso, secuencia, clases, flujo, ER, arquitectura, C4, mindmap, gitGraph

---

[RULES]

1. **Syntax Validation:** Prohibido incluir etiquetas HTML o caracteres especiales sin escapar dentro de los diagramas Mermaid.
2. **Single-responsibility diagrams:** Cada diagrama debe representar una vista única y clara de la arquitectura.

---

[GATES]

| Condición | Acción | Destino / Fase |
| :--- | :--- | :--- |
| Error de sintaxis Mermaid detectado | Corregir inmediatamente usando la guía de sintaxis | Corrección Automática |
| Se solicita diagrama de arquitectura | Generar diagrama C4 o flujo de secuencia | Salida |


---

[HARNESS]

1. **Validación Sintáctica Estricta:** Todo bloque de código Mermaid generado debe ser sintácticamente válido y no debe contener errores de sintaxis conocidos.
2. **Escapado de Caracteres:** Queda estrictamente prohibido usar caracteres especiales como paréntesis, comillas o corchetes dentro de etiquetas de nodos sin escaparlos con comillas dobles (ej. `id["Label (Extra Info)"]`).
3. **No HTML en Nodos:** No incluir etiquetas HTML (ej. `<br>`, `<b>`) dentro de las etiquetas de nodos de Mermaid para evitar roturas del parser.
4. **Leyenda Obligatoria:** Todo diagrama de arquitectura C4 o de flujo complejo debe incluir una leyenda explicativa de formas y colores.
5. **Nombres de Nodos Únicos:** Cada nodo en un diagrama de flujo o diagrama de clases debe poseer un identificador alfanumérico único.
6. **Direccionalidad Clara:** Los diagramas de flujo (`graph`) deben definir explícitamente su dirección de lectura (`TB`, `LR`, etc.) al inicio del bloque.
7. **Consistencia de Entidades:** Los nombres de las entidades en diagramas ER deben coincidir de forma exacta con los nombres de tablas definidos por `db-architect`.
8. **Sin Cruces de Líneas Excesivos:** Organizar los nodos y relaciones para evitar la sobresaturación y cruce de líneas, priorizando la legibilidad.
9. **Acoplamiento Visual:** Los subgrafos (`subgraph`) deben agrupar componentes lógicos de manera coherente (ej. frontend, backend, base de datos).
10. **Límites de Nodos:** Ningún diagrama individual debe contener más de 25 nodos para evitar la sobrecarga cognitiva.
11. **Flujo de Secuencia Lineal:** En los diagramas de secuencia, la interacción de llamadas debe ser secuencial de izquierda a derecha en los participantes primarios.
12. **Tipografía Consistente:** Evitar el uso de directivas `style` que alteren el tipo de letra global o usen fuentes no estándar.
13. **Procedimiento de Autoverificación - Parser:** Validar sintácticamente el código Mermaid (simular parseo o validación estática de palabras clave).
14. **Procedimiento de Autoverificación - Escapado:** Revisar que todos los textos con caracteres como `(`, `)`, `[`, `]` estén rodeados por comillas.
15. **Procedimiento de Autoverificación - Leyendas:** Asegurar que todo diagrama de arquitectura contiene una sección de leyenda o glosario.
16. **Procedimiento de Autoverificación - Consistencia Código:** Validar que los nombres de los servicios/modelos coincidan exactamente con la base de código.
17. **Procedimiento de Autoverificación - Modularidad:** Confirmar que se crearon múltiples diagramas específicos en lugar de un único diagrama masivo.
18. **Procedimiento de Autoverificación - Archivos:** Comprobar que los diagramas se guarden en formato Markdown (`.md`) con el tag `mermaid` correspondiente.
19. **Procedimiento de Autoverificación - Trazabilidad:** Verificar que cada diagrama incluye un enlace o referencia al requerimiento del PRD que visualiza.
20. **Límite de Seguridad:** Máximo 3 intentos de autoverificación y auto-corrección. Si tras 3 intentos no se cumplen las condiciones, detener la ejecución y escalar la alerta.

---

[STEPS]

### Solo Mode (Interactivo / Usuario)
1. Leer los requisitos del usuario o el PRD en `docs/prd/PRD.md`.
2. Identificar el tipo de diagrama más adecuado para la solicitud (Secuencia, ER, Flujo, C4).
3. Generar el bloque de código Mermaid siguiendo estrictamente las reglas de sintaxis de referencias.
4. Guardar los diagramas generados en `docs/design/diagrams/` y reportar éxito.

### Orchestrated Mode (Coordinado / SDD Pipeline)
1. Leer las especificaciones técnicas del diseño.
2. Generar los diagramas embebidos necesarios para el documento `docs/design/DESIGN.md`.
3. Actualizar el contrato de estado.

---

[OUTPUT]

Al completar su ejecución, la skill debe:
1. Generar los artefactos y archivos resultantes especificados en su modo de ejecución.
2. Escribir/Actualizar un contrato de estado en el archivo de estado de la skill (especificado por la configuración de la tarea o en Engram). El formato del contrato debe cumplir con el esquema definido en:
   - [contract.d.ts](references/contract.d.ts)

---

[REFERENCES]

- [contract.d.ts](references/contract.d.ts) — Interfaz TypeScript del contrato de datos de la skill.
- [mermaid-rules.md](references/mermaid-rules.md) — Estándares y formatos válidos de sintaxis Mermaid.
