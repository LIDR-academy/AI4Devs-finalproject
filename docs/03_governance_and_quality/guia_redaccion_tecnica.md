# ✍️ Guía de Estilo y Redacción Técnica para IA

Este documento establece las directrices de gobernanza y convenciones de redacción técnica que deben seguir los asistentes de Inteligencia Artificial (Gemini, Cursor, Copilot) al crear o actualizar la documentación de **RestoStock**.

---

## 🎨 1. Convenciones de Nomenclatura

| Entorno / Capa | Convención de Formato | Ejemplo |
| :--- | :--- | :--- |
| **Base de Datos (PostgreSQL / Prisma)** | `snake_case` para tablas y columnas físicas en BD | `active_remanents`, `stock_movement_id` |
| **Código TypeScript / Modelos App** | `camelCase` para variables, propiedades y dto | `activeRemanentId`, `expirationDate` |
| **Tipos y Clases TypeScript** | `PascalCase` para entidades, interfaces y DTOs | `ActiveRemanentEntity`, `CreateExtractionDto` |
| **Contratos API REST / JSON** | `camelCase` para llaves de payloads JSON | `{"remanentId": "abc", "usedQuantity": "1.5000"}` |
| **Valores Numéricos Físicos** | `string` serializados con precisión fija | `"12.5000"`, `"0.2500"` |

---

## 📊 2. Estándares para Diagramas Mermaid

Al generar diagramas visuales con Mermaid en documentos Markdown:
1. **Encapsulamiento de etiquetas:** Toda etiqueta de nodo con espacios, paréntesis o guiones debe envolverse en comillas dobles (`["Texto (Detalle)"]`).
2. **Evitar HTML crudo:** No incluir etiquetas HTML como `<br>` dentro de los nodos si pueden ser reemplazadas por texto estándar o notas.
3. **Temas claros:** Usar definiciones de clases (`classDef`) neutras con buen contraste cromático para legibilidad en temas oscuros y claros.

---

## 🧪 3. Formato para Historias de Usuario e Integración BDD Gherkin

Toda Historia de Usuario (`US-XXX.md`) debe redactarse bajo la estructura INVEST y contener al menos 2 escenarios BDD en sintaxis Gherkin estándar:

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

Al actualizar o refactorizar cualquier documento existente:
* **Edición Localizada:** Realizar únicamente cambios quirúrgicos en las secciones afectadas sin borrar explicaciones o contextos previos.
* **Trazabilidad:** Registrar cualquier modificación relevante en `CHANGELOG.md` e informar la justificación técnica de la actualización.
