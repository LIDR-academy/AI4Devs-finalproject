# Feature Specification: [FEATURE NAME]

**Feature Branch**: `[###-feature-name]`  
**Created**: [DATE]  
**Status**: Draft  
**Input**: User description: "$ARGUMENTS"

# Template specs/US<US-ID>/spec.md

# <US-ID> — <Título en lenguaje negocio>

**Objetivo del Feature**  
[Una sola frase que explique el resultado visible para el usuario]

**User Story**  
Como <rol del usuario>, quiero <acción> para <beneficio claro y medible para el usuario>.

> **Regla:** La User Story debe describir un único comportamiento observable (no un flujo completo ni múltiples funcionalidades).

---

**Descripción (negocio)**  
[Breve explicación del comportamiento desde la perspectiva del usuario, exclusivamente observable. No describir procesos internos.]

**Reglas**
- Describir solo comportamientos visibles para el usuario.
- Prohibido mencionar detalles técnicos (endpoints, HTTP, JSON, bases de datos, S3, microservicios, JWT, etc.).
- Evitar métricas técnicas o internas (latencia, throughput, colas, jobs, tablas, columnas, tipos de datos).

---

**Criterios de aceptación (BDD, lenguaje de negocio)**
```gherkin
textFeature: <Nombre funcional en lenguaje del dominio>

  Scenario: <Escenario principal 1>
    Given <estado inicial del usuario>
    When <acción del usuario>
    Then <resultado observable por el usuario>
    And <comportamiento adicional visible>

  Scenario: <Escenario principal 2>
    Given <estado inicial>
    When <acción>
    Then <resultado>

  # Agrega más escenarios según sea necesario dentro del mismo bloque textFeature
```

**Reglas de redacción Gherkin**
- Los pasos **Given/When/Then** se redactan desde la **perspectiva del usuario**, nunca del sistema.  
  - ❌ Incorrecto: “Then el sistema crea un registro”  
  - ✅ Correcto: “Then aparece la meditación en su lista”
- Mantener lenguaje natural y del dominio (sin términos técnicos).
- Usar **un único bloque `textFeature:`** por especificación.

---

**Reglas de negocio (inmutables)**
- [Comportamientos que siempre deben cumplirse, independientes del flujo]
- [Ej.: Una meditación debe tener siempre un estado visible para el usuario]

---

**Notas de negocio (no técnicas)**
- **Supuestos del negocio:**  
  [Supuestos que condicionan el comportamiento observable]
- **Mensajes visibles para el usuario:**  
  [Textos, confirmaciones, errores legibles]
- **Comportamientos en casos vacíos o especiales:**  
  [Listas vacías, límites, duplicados, estados inexistentes]
- **Restricciones de negocio visibles:**  
  [Límites de tamaño, número máximo, condiciones para habilitar acciones]
- **Variantes por rol o permisos:**  
  [Diferencias de comportamiento según rol: usuario, editor, admin, etc.]

---

**Fuera de alcance (Out of Scope)**
- [Explicar explícitamente lo que este feature NO cubre]

---

**Metadatos del Feature**
- **Feature Branch:** <US-ID>-<kebab-case-titulo>
- **Created:** <FECHA ACTUAL>
- **Status:** Draft
- **Bounded Context:** [Nombre del BC, ej.: Generation, Composition, Playback]
- **Business Trigger:** [Acción explícita del usuario | Evento automático | Regla de negocio]
- **Input (opcional):** User description: "$ARGUMENTS"

---

## REGLAS DE VALIDACIÓN (para el generador de IA — NO incluir en spec final)
- **Idioma:** Todo en español excepto `textFeature:`, `Scenario:`, `Given`, `When`, `Then`, `And`.
- **Solo observable:** NO mencionar HTTP, JSON, bases de datos, S3, Postgres, microservicios, JWT, endpoints, tablas, tipos de dato, logs, colas.
- **Formato estricto:**
  - Un solo bloque Gherkin `textFeature:`.
  - No usar “User Story 1/2”, no listas FR-xxx, no entidades técnicas, no “Success Criteria” técnicos.
- **Bounded Context:** Usar paths contextuales:
  - `/features/<bc>/`
  - `/openapi/<bc>/`
  - `<basePackage>.<bc>.domain`
- **Constitución:** Hexagonal (ports/adapters), API First, BDD First, Domain First, SDD.
- **Paths obligatorios:**
```
${projectRoot}/src/test/resources/features/${bc}/${userStoryId}.feature
${projectRoot}/src/main/resources/openapi/${bc}/${userStoryId}.yaml
${projectRoot}/src/main/java/${basePackage}/${bc}/domain/...
```

---

## PROHIBIDO
```
❌ Secciones: "User Scenarios & Testing", "Requirements", "Functional Requirements", "Key Entities", "Success Criteria"
❌ Listas numeradas tipo FR-001, SC-001
❌ Lenguaje técnico: endpoint, HTTP, JSON, S3, Postgres, JWT, microservicio, tabla, columna, latencia, throughput, logs
❌ Múltiples bloques Gherkin separados
❌ Perspectiva del sistema en los Then (usar siempre perspectiva del usuario)
```
