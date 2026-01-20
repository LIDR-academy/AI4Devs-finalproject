
# 🚚 Delivery Playbook – Backend (Spec‑Kit Ready + BDD/API‑First Pipeline Refinado)

> **Propósito**  
> Establecer un **estándar obligatorio** y **repetible** para todas las User Stories (US) del backend, basado en **BDD → API First → Dominio → Aplicación → Infra → Controllers → Contratos → E2E**.  
> Compatible con arquitectura **hexagonal**, **DDD**, **TDD**, **API First** y ejecución con **Spec‑Kit**.

---


## ⚙️ Baseline técnico (obligatorio para todos los microservicios)

- **Lenguaje**: Java **21** (LTS)
- **Framework**: **Spring Boot** (microservicios, controllers sin lógica de negocio)
- **Arquitectura**: Hexagonal (DDD + TDD + API First)
- **Transporte**: HTTP/REST (OpenAPI como contrato)
- **Build**: Maven o Gradle (definido por convenciones del repo)
- **Testing**: JUnit 5 + Cucumber (BDD), Contract Tests (OpenAPI)
- **CI/CD**: Gates de BDD → API → Unit → Infra → Contract → E2E

> Los agentes **DEBEN** usar Java 21 y Spring Boot para **todas** las US del backend, salvo que la **Historia + BDD** indiquen explícitamente un protocolo diferente (p. ej., gRPC) y esté aprobado.

## 🎯 Resumen ejecutivo
**Principios clave del sistema:**

1. Cada historia atraviesa el sistema **verticalmente** y entrega **valor observable**.
2. **BDD** define el **QUÉ** (comportamiento esperado por negocio).
3. **DDD + TDD** definen el **corazón del sistema** (reglas estables, evolutivas y testeables).
4. **API First mínima**, derivada exclusivamente de BDD, expone solo el comportamiento necesario.
5. **Infraestructura obedece al dominio**, nunca lo condiciona.
6. **Controllers** traducen protocolos; no toman decisiones.
7. **Tests BDD/e2e** validan que el sistema cumple exactamente lo prometido.
8. El **pipeline CI/CD** garantiza calidad, no velocidad.

---

## 🧭 Prioridad de fuentes (ORDEN ABSOLUTO)
En caso de conflicto, los agentes deben obedecer:

1. **Historia de Usuario + escenarios BDD**
2. **Este Delivery Playbook**
3. Convenciones del repositorio
4. Preferencias del framework o herramientas

❗ **Nunca introducir comportamiento, endpoints o reglas no justificadas por BDD o criterios de aceptación.**

---

# 🔥 SECCIÓN NORMATIVA: Pipeline obligatorio por historia (orden estricto)

Esta sección es **vinculante** para TODAS las US. El orden no puede alterarse.

## 🟦 1) BDD FIRST (obligatorio, siempre lo primero)

**Entregables mínimos:**
- Archivo `.feature` en **Gherkin** con escenarios **Given–When–Then** en lenguaje de negocio.
- **Step Definitions de Cucumber** en estado *Pending/Skipped* (sin implementación).
- Ejecución de **Cucumber** debe **correr** y **fallar en rojo** inicialmente.

**Reglas:**
- ❌ No escribir endpoints, dominio, casos de uso ni controllers antes del `.feature`.
- ❌ No incluir detalles técnicos (HTTP, JSON, DB, IA) en BDD.
- ✔ BDD es la **fuente de verdad superior** del comportamiento.

**Esqueleto de ejemplo:**
```gherkin
Feature: Componer contenido de meditación (US2)
  As usuario autenticado
  I want definir texto, música e imagen, manualmente o generados por IA
  So that personalizo el contenido antes de crear el vídeo final

  Scenario: Definir texto manualmente
    Given un usuario autenticado en el Meditation Builder
    When ingresa un texto de meditación
    Then el texto queda disponible para la sesión actual
```

---

## 🟪 2) API FIRST mínima (derivada directamente de BDD)

**Entregables mínimos:**
- Fichero **OpenAPI YAML** (versionado en `src/main/resources/openapi/`).
- Validación con linters (p. ej., **Spectral** / **Redocly CLI**).
- **Tests provider/consumer** basados en ese YAML.

**Reglas:**
- ❌ No escribir dominio/aplicación/controllers sin YAML **validado**.
- ❌ No añadir rutas/campos no justificados por BDD.
- ✔ Cada endpoint debe corresponder a comportamientos del BDD (interacciones del *When*).

---

## 🟧 3) Dominio (DDD + TDD)

**Incluye:**
- Entidades, **Value Objects**, Servicios de dominio, Invariantes.
- **Puertos** (interfaces) definidos como **capacidades del negocio**.
- **TDD obligatorio**: tests de dominio **antes** del código.

**Reglas:**
- ❌ Dominio no conoce HTTP, JSON, OpenAPI, frameworks ni IA.
- ✔ Dominio expresa **reglas puras** y **capacidades estables**.

---

## 🟨 4) Aplicación (Use Cases)

**Incluye:**
- Casos de uso que **orquestan** el dominio.
- Comandos/queries/DTOs **internos**.
- Dependencia de **puertos** del dominio.

**Reglas:**
- ❌ No contiene reglas de negocio.
- ❌ No conoce detalles de infraestructura ni protocolos.
- ✔ Tests unitarios rápidos y deterministas.

---

## 🟫 5) Infraestructura (Adaptadores de salida)

**Incluye:**
- Implementaciones concretas de **puertos**: IA, storage/assets, streaming, colas, etc.
- Tests de **integración** con mocks locales o **Testcontainers**.

**Reglas:**
- ❌ No definir reglas de negocio.
- ✔ Adaptadores **intercambiables** y **probados**.

---

## 🔴 6) Controllers / Adaptadores de entrada)

**Incluye:**
- Traducción de **protocolo ↔ comandos** del caso de uso.
- Validación **superficial** (required, formato).
- **Cumplimiento estricto** del YAML OpenAPI.

**Reglas:**
- ❌ Sin lógica de negocio.
- ❌ Sin decisiones ni rutas no definidas por API First.

---

## 🟣 7) Contratos (Provider/Consumer)

**Incluye:**
- Validación de que la implementación **respeta el YAML**.
- Tests de contrato obligatorios en CI.

**Reglas:**
- Cualquier cambio comienza en **BDD**, luego **API**, y solo después **código**.

---

## 🟢 8) E2E BDD (artefacto real)

**Incluye:**
- Ejecución de **Cucumber** contra la aplicación **desplegada** (artefacto real).
- Todos los escenarios deben pasar **en verde**.

**Reglas:**
- Forma parte del **Definition of Done**.

---

## 📚 Glosario del proyecto (IA‑friendly)

- **Dominio** → Entidades, Value Objects, reglas, invariantes, puertos.
- **Aplicación** → Casos de uso que orquestan el dominio.
- **Infraestructura** → Adaptadores concretos de puertos: DB, HTTP, colas, IA, storage.
- **Controller** → Adaptador de entrada (HTTP/gRPC/etc.) que traduce protocolo ↔ comandos.
- **Feature files (BDD)** → Escenarios Given–When–Then como documentación viva.

---

## 🧩 Reglas normativas (DEBE / NO DEBE)

### 🔵 BDD / Historias
- **DEBE** redactarse en lenguaje de negocio.
- **DEBE** incluir criterios verificables y escenarios claros.
- **DEBE** surgir tras una sesión *Three‑Amigos*.
- **NO DEBE** contener detalles técnicos (HTTP, JSON, DB, frameworks, colas).
- **CRÍTICO**: Si un comportamiento NO está en BDD, **NO debe implementarse**.

### 🟣 API First (mínimo necesario)
- **DEBE** definirse solo el contrato REST requerido para cubrir BDD.
- **DEBE** versionarse OpenAPI.
- **DEBE** incluir tests provider/consumer.
- **NO DEBE** anticipar endpoints innecesarios.

### 🟠 Dominio (DDD + TDD)
- **DEBE** contener **toda** la lógica de negocio.
- **DEBE** construirse con TDD (tests rápidos y deterministas).
- **DEBE** definir puertos como capacidades del negocio.
- **NO DEBE** depender de frameworks, transporte o infraestructura.

### 🟡 Aplicación (Use Cases)
- **DEBE** orquestar el dominio.
- **DEBE** trabajar con comandos/queries/DTOs.
- **NO DEBE** contener reglas de negocio.
- **NO DEBE** conocer detalles de infraestructura.

### 🟤 Infraestructura (Adaptadores de salida)
- **DEBE** implementar puertos, y nada más.
- **DEBE** probar mapeos dominio ↔ persistencia/transporte.
- **DEBE** usar Testcontainers cuando aplique.
- **NO DEBE** definir reglas de negocio.

### 🔴 Controllers
- **DEBE** traducir protocolo ↔ comandos del caso de uso.
- **DEBE** validar campos superficiales (formato, required).
- **NO DEBE** contener lógica de negocio.
- **NO DEBE** añadir decisiones ni rutas no definidas por API First.

### 🧪 Tests BDD / e2e
- **DEBE** ejecutar los escenarios exactos definidos en BDD.
- **DEBE** validar dominio, aplicación, infra y wiring completo.
- **NO DEBE** usar servicios cloud reales (siempre contenedores o mocks).

---

## 🏁 Criterio de Done (Done = Deployable)

Una historia está **DONE** solo si:

- **BDD**: escenarios en verde (automatizados).
- **API First**: contrato OpenAPI válido y versionado.
- **Dominio** cubierto por TDD unitario.
- **Aplicación** con tests de orquestación.
- **Infra** validada con integración.
- **Controllers** sin lógica y conformes al contrato.
- **Contratos** provider/consumer pasan.
- **E2E BDD** sobre artefacto real en verde.
- **Observabilidad mínima** (logs, métricas, trazas).
- **Checks no funcionales** (timeouts, retries) implementados.

---

## 🔧 Pipeline CI/CD (Orden de confianza)

El pipeline **DEBE** ejecutarse así (orden estricto):

1. **bdd** → Cucumber corre (puede estar rojo al inicio).
2. **api** → Validación del YAML (lint + schema).
3. **unit** → Tests de **dominio** y **aplicación**.
4. **infra** → Tests de adaptadores (mocks/containers).
5. **contract** → Provider/consumer contra el YAML.
6. **e2e** → BDD/e2e sobre artefacto real.

✔ **Build once, deploy many**  
✔ Artefacto inmutable, firmado  
❌ *No se permite merge con fallos*

**Gates de existencia (ejemplos):**
```bash
test -f "specs/<us>/bdd/features/*.feature" || (echo "Falta .feature BDD" && exit 1)
test -f "src/main/resources/openapi/<us>-openapi.yaml" || (echo "Falta OpenAPI YAML" && exit 1)
```

---

## 🛠️ Flujo por historia (paso a paso)

0. Historia candidata pequeña y vertical
1. **BDD First (Cucumber rojo)**
2. **API First mínima (YAML validado)**
3. Dominio (TDD + puertos)
4. Aplicación (use cases)
5. Infraestructura (adaptadores + tests)
6. Controllers
7. Contratos (provider/consumer)
8. E2E BDD
9. Done (checklist)
10. Pipeline CI/CD

---

## 🚫 Antipatrones (NO generar)

- Tareas técnicas sin valor observable.
- Tareas que mezclen varias capas a la vez.
- Refactors sin motivación de negocio.
- Endpoints o campos no presentes en BDD.
- “Preparar para futuro” (sobrediseño).
- Lógica de negocio en controllers o adaptadores.
- Tests que dependan de servicios cloud reales.

---

## ☑️ Checklist previo a Done

Antes de cerrar:

- ¿Todos los escenarios BDD tienen e2e asociado?
- ¿Toda regla está en el dominio?
- ¿La API es mínima y está validada?
- ¿El contrato está verificado?
- ¿Infra tiene integración?
- ¿Pipeline completo en verde?

---

## 🤖 Formato para agentes (Spec‑Kit)

Los agentes **DEBEN**:
- Aplicar estas reglas en `spec.md`, `plan.md`, `tasks.md`.
- Priorizar: **BDD → Playbook → Repo → Framework**.
- Seguir estrictamente el orden del pipeline:  
  **BDD → YAML → Dominio → Aplicación → Infra → Controllers → Contratos → E2E**.
- Rechazar cualquier salida que viole capas o no esté en BDD.

---

## Artefactos por historia (obligatorios)
- BDD: `tests/bdd/<feature>.feature` (Cucumber rojo al inicio).
- API First: `src/main/resources/openapi/<us>-openapi.yaml` (lint Redocly OK).
- Código por capas: según `hexagonal-architecture-guide.md`.
- Contratos: provider/consumer basados en el YAML.
- CI: gates `bdd → api → unit → infra → contract → e2e` (no merge con fallos).


## 🎯 Principio transversal

**Cada historia debe dejar el diseño más claro, más protegido y más fácil de evolucionar que antes.**
