> Este archivo documenta los prompts estratégicos estructurados bajo la metodología de Spec-Driven Development (SDD) y Verified Spec-Driven Development (VSDD) para guiar a los asistentes de código (Gemini con IDE Antigravity) de manera determinista y profesional.


## Índice

1. [Descripción general del producto](#1-descripción-general-del-producto)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Modelo de datos](#3-modelo-de-datos)
4. [Especificación de la API](#4-especificación-de-la-api)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Tickets de trabajo](#6-tickets-de-trabajo)
7. [Pull requests](#7-pull-requests)

---

## 1. Descripción general del producto

**Prompt 1 Descubrimiento del Problema e Idea de Producto:**
```md
Usando el skill de Descubrimiento de Producto en `.prompts/skills/SK-01_product_discovery.md`, analiza la siguiente idea de producto:

"Hay cierta incertidumbre en el uso de los insumos almacenados en el área de depósito de un restaurante, no se sabe a ciencia cierta quien accede a estos y cual es su finalidad.

Para resolver esta situación, se propone desarrollar una aplicación web que permita controlar el movimiento de los insumos del almacén, registrando que empleado realiza cada movimiento, la cantidad, fecha y el destino del producto.

En cada movimiento, se deberá registrar la fecha, el empleado, tipo de movimiento, almacén involucrado, detalle del movimiento.

Adicionalmente, en caso de ser usado un insumo se debe registrar la fecha, empleado operario, detalles del insumo, la cantidad usada, una descripción de su uso.

Poder rastrear el uso parcial de un producto y saber dónde queda almacenado.

La aplicación permitirá registrar empleados, tipos de movimientos, productos, marcas, áreas del restaurante, almacenes, tipos de almacenes, así como los detalles de cada movimiento y el stock de productos por almacén, uso y el destino del remanente."

---

Genera el documento con un tono directo, sumamente riguroso y en formato Markdown limpio. Comienza directamente en el análisis de la Fase 1 sin preámbulos conversacionales.

Guarda el archivo como "docs/01_idea_inicial.md"

```

### Respuesta del Agente de IA:
El documento completo con el análisis de la concepción del producto se encuentra en:
* [docs/01_idea_inicial.md](file:///home/lacruzjd/Documentos/programacion/iadevs/proyecto-final/AI4Devs-finalproject/docs/01_idea_inicial.md)

### Nota de control humano: 
Se hicieron algunos cambios al archivo generado por el agente adoptando un rol de un operario autorizado para las traslaciones y descartes, ya que el agente sugirió que cualquier operario podría realizar traslaciones y descartes, lo cual no es correcto, solo el operario autorizado puede realizar traslaciones y descartes.

**Prompt 2 Generación del PRD (Product Requirements Document):**

```md
Usando el skill de Generación del PRD en `.prompts/skills/SK-02_prd_generation.md`, analiza el documento de concepción de producto `docs/01_idea_inicial.md` para generar el PRD de RestoStock.

```

### Respuesta del Agente de IA:
El documento completo de requisitos de producto (PRD) se encuentra en:
* [docs/02_restostock_prd.md](docs/02_restostock_prd.md)

### Nota de control humano:
El PRD fue revisado y aprobado para comenzar con el desarrollo. Se unificó la meta de la Tasa de Rotación de Remanentes (TRR) a 24 horas para mantener consistencia con el documento de framing.


**Prompt 3 Especificación Técnica de Arquitectura y Persistencia:**

```md
Usando el skill de Diseño Técnico en `.prompts/skills/SK-03_architecture_design.md`, analiza el PRD `docs/02_restostock_prd.md` para generar la especificación técnica en `docs/03_restostock_design.md`.

### Respuesta del agente de IA:
El documento completo de diseño de arquitectura y persistencia se encuentra en:
* [docs/03_restostock_design.md](docs/03_restostock_design.md)

### Nota de control humano:
La revision del archivo docs/03_restostock_design.md fue completada y aprobada para continuar con las especificaciones tecnicas, para continuar a mas detalla con la seccion de Arquitectura del Sistema a continuacion.

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

**Prompt 1:**
Generación de Diagramas Mermaid Integrados
``` md 
Usando el skill de Diagramación en `.prompts/skills/SK-04_mermaid_diagram.md`, analiza los archivos `docs/02_restostock_prd.md` y `docs/03_restostock_design.md` para generar el diagrama C4 de la arquitectura física y lógica en Mermaid en `docs/04_restostock_architecture_diagram.md`.
```

#### Respuesta del agente de IA:
El diagrama completo de arquitectura física y lógica se encuentra en:
* [docs/04_restostock_architecture_diagram.md](docs/04_restostock_architecture_diagram.md)

--- 

### **2.2. Descripción de componentes principales:**

**Prompt 1:**
Definición de Capas en Arquitectura Hexagonal
```md 
Usando el skill de Arquitectura Hexagonal en `.prompts/skills/SK-05_hexagonal_layers.md`, analiza `docs/02_restostock_prd.md` y `docs/03_restostock_design.md` para estructurar la sección "2.2. Descripción de componentes principales" en `docs/05_restostock_components_description.md`.

```

#### Respuesta del agente de IA:

#### Nota de control humano:

---

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

**Prompt 1:**
```md
Usando el skill de Estructuración de Directorios en `.prompts/skills/SK-06_folder_structure.md`, analiza los archivos de diseño y arquitectura en `./docs/` para generar la jerarquía exacta de ficheros combinando Vertical Slices y Arquitectura Hexagonal en `docs/06_restostock_folder_structure.md`.

```

#### Respuesta del agente de IA:
La estructura completa del directorio del proyecto (monorepo con Frontend Next.js y Backend Express) se encuentra en:
* [docs/06_restostock_folder_structure.md](docs/06_restostock_folder_structure.md)


#### Nota de control humano:


### **2.4. Infraestructura y despliegue**

**Prompt 1:**

Pipeline de CI/CD Seguro y Despliegue

```md
Usando el skill de Automatización DevOps en `.prompts/skills/SK-07_cicd_pipeline.md`, genera el pipeline de GitHub Actions en `.github/workflows/ci.yml`.
```

#### Respuesta del agente de IA:
La configuración detallada y limpia del pipeline de GitHub Actions se encuentra en:
* [.github/workflows/ci.yml](.github/workflows/ci.yml)

#### Nota de control humano:

---

### **2.5. Seguridad**

**Prompt 1:**
```md
Usando el skill de Ciberseguridad en `.prompts/skills/SK-08_security_strategy.md`, analiza el PRD y el modelo de datos para generar la estrategia de seguridad y mitigación de vulnerabilidades en `docs/07_restostock_security_strategy.md`.
```

### Respuesta del agente de IA:
La estrategia de seguridad detallada y alineada con OWASP se encuentra en:
* [docs/07_restostock_security_strategy.md](docs/07_restostock_security_strategy.md)

### Nota de control humano:

---   

### **2.6. Tests**

**Prompt 1:**
```md
Usando el skill de Control de Calidad en `.prompts/skills/SK-09_testing_strategy.md`, configura la directiva de pruebas y testing de TDD en `docs/08_restostock_testing_strategy.md`.
```

### Respuesta del agente de IA:
La directiva y estrategia de testing detallada (TDD y mocks mínimos) se encuentra en:
* [docs/08_restostock_testing_strategy.md](docs/08_restostock_testing_strategy.md)

### Nota de control humano:

---   

### 3. Modelo de Datos

**Prompt 1:**
```md
Usando el skill de Base de Datos en `.prompts/skills/SK-10_prisma_schema.md`, genera el esquema declarativo de base de datos para Prisma en `docs/09_restostock_database_schema.md` a partir de `docs/02_restostock_prd.md` y `docs/03_restostock_design.md`.
```

### Respuesta del agente de IA:
El esquema declarativo de base de datos para Prisma (`schema.prisma`) y su justificación técnica se encuentra en:
* [docs/09_restostock_database_schema.md](docs/09_restostock_database_schema.md)

### Nota de control humano:
Se validó que el archivo destinado a `schema.prisma` sea un archivo ejecutable con sintaxis pura de Prisma, sin bloques Markdown explicativos embebidos, y que cualquier justificación adicional de índices se mantenga en el artefacto de documentación separado.

---

### 4. Especificación de la API

**Prompt 1:**
```md
Usando el skill de Arquitectura de API en `.prompts/skills/SK-11_api_specification.md`, diseña los contratos de endpoints REST en `docs/10_restostock_api_specification.md` basándote en el PRD y el esquema físico.
```

### Respuesta del agente de IA:
La especificación de la API detallada y alineada con OWASP se encuentra en:
* [docs/10_restostock_api_specification.md](docs/10_restostock_api_specification.md)

### Nota de control humano:
Se garantizó que todas las cantidades y representaciones de tipo Decimal en payloads JSON se serialicen de forma consistente y determinista exclusivamente como strings (cadenas de texto numéricas, ej: `"2.0000"`), indicando su precisión y escala.

---

### 5. Historias de Usuario

**Prompt 1:**
```md
Usando el skill de Product Owner en `.prompts/skills/SK-12_user_stories.md`, genera el backlog de Historias de Usuario bajo INVEST y BDD Gherkin en el directorio `docs/user_stories/` y su respectivo `docs/user_stories/indice_user_stories.md`.

```
### Respuesta del agente de IA:
Las historias de usuario detalladas (en formato INVEST y BDD Gherkin) y su correspondiente índice se encuentran en:
* [docs/user_stories/indice_user_stories.md](docs/user_stories/indice_user_stories.md)

### Nota de control humano:
Se revisó que los escenarios de negocio prohíban saldos negativos en remanentes, y que cualquier descarte sobre un remanente ya CONSUMED o DISCARDED sea explícitamente rechazado sin mutar la base de datos.

---

### 6. Tickets de Trabajo

**Prompt 1:**
```md
Usando el skill de Scrum Master en `.prompts/skills/SK-13_backlog_tickets.md`, desglosa las historias en tareas atómicas estimadas en `docs/tickets/` y su correspondiente `docs/tickets/indice_tickets.md`.

```

### Respuesta del agente de IA:
La matriz de trazabilidad y las fichas técnicas detalladas de los tickets de trabajo del backlog se encuentran en:
* [docs/tickets/indice_tickets.md](docs/tickets/indice_tickets.md)

### Nota de control humano:
Se corroboró que el manejo de caídas de red en el frontend (TK-007) se mitigue mediante capturas explícitas de promesas asíncronas y actualización de estados de error de data-fetching locales, en lugar de Error Boundaries de React.

---

### 7. Pull Requests

**Prompt 1:**

```md
Usando el skill de Release Manager en `.prompts/skills/SK-14_pull_requests.md`, documenta las Pull Requests iniciales reales e integraciones del proyecto e infúndelas en la sección correspondiente de `readme.md`.

```

### Respuesta del agente de IA:
La documentación detallada de las Pull Requests reales se ha integrado en la sección "7. Pull Requests" de [readme.md](readme.md).

### Nota de control humano:
Se auditó la documentación de Pull Requests para asegurar que solo contenga información verídica y verificable del repositorio (evitando la invención de PRs ficticios o pipelines de CI falsos), admitiendo documentar menos de tres PRs cuando no existan más en el historial de Git.