# ✍️ Guía de Estilo y Redacción Técnica para Documentación (Specs)

Este documento establece las directrices de gobernanza y convenciones de redacción técnica que deben seguir los asistentes de Inteligencia Artificial al crear o actualizar la documentación técnica del proyecto en `docs/`.

---

## 🎨 1. Convenciones de Nomenclatura de Ficheros Técnicos

| Artefacto Documental | Convención de Nombre de Archivo | Ejemplo de Ruta |
| :--- | :--- | :--- |
| **Historias de Usuario** | `US-NNN.md` (INVEST) | `docs/05_agile_planning/user_stories/{modulo}/US-001.md` |
| **Tickets Técnicos** | `TK-NNN.md` (Backend / Frontend) | `docs/05_agile_planning/tickets/{modulo}/{backend|frontend}/TK-001.md` |
| **Arquitectura ADR** | `ADR-NNN-nombre.md` | `docs/02_architecture_design/adr/ADR-001-hexagonal.md` |
| **Especificaciones Core** | `NN_nombre_documento.md` | `docs/01_product_definition/02_restostock_prd.md` |

---

## 📊 2. Estándares para Diagramas Mermaid

Al generar diagramas visuales con Mermaid en documentos Markdown:
1. **Encapsulamiento de etiquetas:** Toda etiqueta de nodo con espacios, paréntesis o guiones debe envolverse en comillas dobles (`["Texto (Detalle)"]`).
2. **Evitar HTML crudo:** No incluir etiquetas HTML como `<br>` dentro de los nodos si pueden ser reemplazadas por texto estándar o notas.
3. **Temas claros y legibilidad:** Usar sintaxis estándar `flowchart TD` o `C4Context` neutra para garantizar legibilidad en visores Markdown en temas oscuros y claros.

---

## 🧪 3. Formato para Historias de Usuario e Integración BDD Gherkin

Toda Historia de Usuario (`US-NNN.md`) debe redactarse bajo la estructura INVEST y contener al menos 2 escenarios BDD en sintaxis Gherkin estándar:

```gherkin
Feature: Nombre de la Funcionalidad

  Scenario: [Happy Path] Descripción clara del flujo exitoso
    Given que el operario autenticado tiene sesión activa
    When solicita el registro de consumo de "1.5000" kg de "Queso Mozzarella"
    Then el sistema debita la cantidad del remanente más próximo a vencer (FEFO)
    And retorna una respuesta 200 OK con el saldo actualizado.

  Scenario: [Edge Case] Intento de consumo superior al saldo disponible
    Given que el remanente activo posee un saldo disponible de "0.5000" kg
    When el operario intenta consumir "1.0000" kg
    Then el sistema rechaza la transacción con código 422 Unprocessable Entity
    And no se muta el saldo en la base de datos.
```

---

## 🛡️ 4. Regla de Ediciones No Destructivas (Preservación de Contexto)

Al actualizar o refactorizar cualquier documento existente en `docs/`:
* **Edición Localizada:** Realizar únicamente cambios quirúrgicos en las secciones afectadas sin borrar explicaciones o contextos previos.
* **Trazabilidad:** Registrar cualquier modificación relevante en el changelog o historial e informar la justificación técnica de la actualización.
