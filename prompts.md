> Detalla en esta sección los prompts principales utilizados durante la creación del proyecto, que justifiquen el uso de asistentes de código en todas las fases del ciclo de vida del desarrollo. Esperamos un máximo de 3 por sección, principalmente los de creación inicial o los de corrección o adición de funcionalidades que consideres más relevantes.

> 📎 Registro completo de prompts con metadatos: [prompts/00-all-prompts.md](prompts/00-all-prompts.md)

## Índice

- [Índice](#índice)
- [1. Descripción general del producto](#1-descripción-general-del-producto)
- [2. Arquitectura del Sistema](#2-arquitectura-del-sistema)
  - [**2.1. Diagrama de arquitectura:**](#21-diagrama-de-arquitectura)
  - [**2.2. Descripción de componentes principales:**](#22-descripción-de-componentes-principales)
  - [**2.3. Descripción de alto nivel del proyecto y estructura de ficheros**](#23-descripción-de-alto-nivel-del-proyecto-y-estructura-de-ficheros)
  - [**2.4. Infraestructura y despliegue**](#24-infraestructura-y-despliegue)
  - [**2.5. Seguridad**](#25-seguridad)
  - [**2.6. Tests**](#26-tests)
  - [3. Modelo de Datos](#3-modelo-de-datos)
  - [4. Especificación de la API](#4-especificación-de-la-api)
  - [5. Historias de Usuario](#5-historias-de-usuario)
  - [6. Tickets de Trabajo](#6-tickets-de-trabajo)
  - [7. Pull Requests](#7-pull-requests)

---

## 1. Descripción general del producto

**Prompt 1** — Generación del meta-prompt para documentación técnica:
```
Genera un prompt especializado para IA (meta prompt) en base al archivo initial.md y guarda este
prompt en un archivo llamado master-prompt-docs.md dentro de la carpeta prompts de la raiz del proyecto
```
> 📋 2026-06-09 · VS Code · Claude Opus 4.6 · rodri
> Resultado: prompts/master-prompt-docs.md — meta-prompt con rol, contexto, misión y restricciones

**Prompt 2** — Ejecución del plan de documentación completa:
```
ejecuta el plan de master-prompt-docs-plan.md
```
> 📋 2026-06-10T07:08:35Z · VS Code · Claude Opus 4.6 · High · rodri
> Resultado: docs/documentacion.md completo (descripción, Lean Canvas, 8 CU, modelo ER, arquitectura, C4)

**Prompt 3** — Análisis de coherencia del proyecto:
```
Analiza readme.md y verifica que el proyecto tiene coherencia, en especial con los archivos de
documentación como documentacion.md, data-model.md y si no tiene coherencia indica por qué y un
plan para corregir. Me interesa también que el modelo de datos soporte todas las funcionalidades
principales y que la documentación sea coherente
```
> 📋 2026-06-10T07:57:23Z · VS Code · Claude Opus 4.6 · High · rodri
> Resultado: 7 inconsistencias detectadas y corregidas (fixs/issue-001.md)

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

**Prompt 1** — Generación de diagramas C4 y arquitectura:
```
ejecuta el plan de master-prompt-docs-plan.md
```
> 📋 2026-06-10T07:08:35Z · VS Code · Claude Opus 4.6 · High · rodri
> Resultado: Diagramas C4 (Contexto, Contenedores, Componentes) en Mermaid dentro de docs/documentacion.md

**Prompt 2** — Corrección de errores en diagramas Mermaid:
```
Revisa y corrige el archivo documentacion.md generado recién, tiene algunos errores como este:
**Unable to render rich display**
Parse error on line 24:...de reserva S-->>Note over S: Notific---^
```
> 📋 2026-06-10T07:14:46Z · VS Code · Claude Opus 4.6 · High · rodri
> Resultado: Sintaxis Mermaid corregida en todos los diagramas de secuencia

### **2.2. Descripción de componentes principales:**

**Prompt 1** — Mismo prompt de ejecución del plan (sección 4 del plan incluía arquitectura):
```
ejecuta el plan de master-prompt-docs-plan.md
```
> Generó la sección "Diseño del Sistema a Alto Nivel" con capas, servicios de dominio e integraciones externas

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

**Prompt 1** — Cambio de stack tecnológico:
```
Modifica los archivos ai-specs/agents/backend-developer.md, ai-specs/agents/frontend-developer.md,
docs/backend-standards.md, docs/frontend-standards.md para que adopten el stack tecnológico de este
proyecto, que es: netcore 10 C#, base de datos PostgreSQL, Angular 20.
```
> 📋 2026-06-09 · VS Code · rodri
> Resultado: 4 archivos de estándares actualizados al stack definitivo (.NET Core 10 / Angular 20 / PostgreSQL)

### **2.4. Infraestructura y despliegue**

<!-- PENDIENTE: No se han generado prompts de infraestructura/despliegue aún -->

### **2.5. Seguridad**

<!-- PENDIENTE: No se han generado prompts específicos de seguridad aún -->

### **2.6. Tests**

<!-- PENDIENTE: No se han generado prompts de testing aún -->

---

### 3. Modelo de Datos

**Prompt 1** — Creación del modelo de datos completo:
```
Analiza data-model-sample.md y usalo para crear data-model.md con la misma estructura pero basado
en el proyecto de INK-LINK con la documentación sobre el proyecto
```
> 📋 2026-06-10T07:42:48Z · VS Code · Claude Opus 4.6 · High · rodri
> Resultado: docs/data-model.md con 13 entidades, campos, validaciones, relaciones y diagrama ER Mermaid

**Prompt 2** — Corrección de inconsistencias en el modelo:
```
Ejecutalo
```
> 📋 2026-06-10T08:10:01Z · VS Code · Claude Opus 4.6 · High · rodri
> Resultado: Campo cancelled_at agregado a Booking, eliminada entidad Notification, alineación con Won't-Have

---

### 4. Especificación de la API

<!-- PENDIENTE: La especificación API (docs/api-spec.yml) fue vaciada intencionalmente durante la corrección de coherencia. Queda pendiente generarla a partir de las historias de usuario implementadas -->

---

### 5. Historias de Usuario

**Prompt 1** — Creación del backlog completo:
```
Crea las historias de usuario del proyecto
```
> 📋 2026-06-10T08:18:56Z · VS Code · Claude Opus 4.6 · High · rodri
> Resultado: Plan de 20 US propuesto, refinado iterativamente a 14 US (10 Must-Have + 4 Should-Have)

**Prompt 2** — Refinamiento de scope (eliminación de panel artista):
```
**CU-02: Configurar perfil** seran datos seed.
US0014 solo el cliente vera la agenda del arista, no "entraremos" con el artista a la web por el momento, ese es un wont have por ahora
US0018 sera wont have, no la implementaremos. De hecho eliminalo de todo el proyecto
US0019 sera wont have, no se implementara en esta version
```
> 📋 2026-06-10T08:25:29Z · VS Code · Claude Opus 4.6 · High · rodri
> Resultado: Backlog reducido de 20 a 14 US, Won't-Have definidos (foto curación, notificaciones, respuestas a reseñas)

**Prompt 3** — Verificación de coherencia CU ↔ US:
```
Los casos de uso que agregaste tienen coherencia con los diagramas de casos de uso?
```
> 📋 2026-06-10T17:18:29Z · VS Code · Claude Opus 4.6 · High · rodri
> Resultado: 12/14 coherentes, 2 correcciones aplicadas (US0010 → Transversal, US0014 → CU-08)

---

### 6. Tickets de Trabajo

<!-- PENDIENTE: Las tareas de implementación (tasks) se generarán usando el agente @tech-lead a partir de cada historia de usuario -->

---

### 7. Pull Requests

<!-- PENDIENTE: Se documentarán durante la fase de implementación -->
