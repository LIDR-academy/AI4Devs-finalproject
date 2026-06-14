> Detalla en esta sección los prompts principales utilizados durante la creación del proyecto, que justifiquen el uso de asistentes de código en todas las fases del ciclo de vida del desarrollo. Esperamos un máximo de 3 por sección, principalmente los de creación inicial o los de corrección o adición de funcionalidades que consideres más relevantes.
> Puedes añadir adicionalmente la conversación completa como link o archivo adjunto si así lo consideras.

## Agentes utilizados

Durante el desarrollo de **Planificacion 2.0** se utilizaron dos asistentes de IA integrados en el IDE:

| Agente | Uso principal | Periodo aproximado |
|--------|---------------|-------------------|
| **GitHub Copilot** | Arranque del producto: README, casos de uso, entidades, diagramas C4 y primeras decisiones de arquitectura | 10–11 jun 2026 |
| **Cursor** | Continuidad del diseño: stack tecnológico, modelo ER, políticas transversales, backlog, tickets, PRs y documentación de tests | 12–14 jun 2026 |

Cada prompt incluye el texto literal del usuario, la respuesta literal del agente (sin resúmenes), el fichero de origen y el timestamp del intercambio.

Conversaciones completas exportadas en [`prompts/`](prompts/).

---

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

**Prompt 1** — *Agente: **Copilot***

- **Origen:** [`prompts/prompts 2026-06-10 16.50 GitHub Copilot.md`](prompts/prompts%202026-06-10%2016.50%20GitHub%20Copilot.md) — Intercambio 1
- **Timestamp:** 2026-06-10 05:47 UTC

**serpegon11710-byte dice:**

> Bienvenido al proyecto de Planificacion 2.0. Esto es una evoluión del proyecto Planificacion, que se ha quedado un poco obsoleto por haber estado diseñado con VibeCoding.
>
>
>
> En esta ocasión quiero hacer un proyecto en mejores condiciones, por lo que vamos a empezar por realizar las especificaciones mínimas:
>
>
>
> El proyecto Planificacion 2.0 está pensando para gestionar Planificaciones de proyectos. Los componentes mínimos son:
>
>
>
> * Proyecto, identificado por un nombre 
>
> * Un proyecto se subdivide en Items
>
> * Un Item tiene Planificaciones
>
> ** Las planificaciones pueden estar completadaas o pendientes. En caso de estar pendientes, podráin expirar si la fecha/hora ya ha pasado
>
> **Las planificaciones se diferncia unas de otas por tener unas observaciones y una definicion de fecha hora
>
> ** Las definiciones de fecha hora pueden ser:
>
> *** Puntuales - Unicamente tienen fecha y hora
>
> *** Periodicas - Se caracterizan por tener fecha inicio y fecha fin. 
>
> ***Hay diferentes periodos, que pueden ser:
>
> **** Diarias -- Se repiten "Todos los dias" o bien "De Lunes a Viernes" o "En fin de semana" a una hora especifica
>
> **** Semanales -- Se repiten Todas las semanas el mismo día a una hora especifica
>
> **** Mensuales -- Se repiten Todos los meses el mismo día a la misma hora
>
> **** No Planificado - Se utiliza para identificar que la planiicacion existe, aunque no tiene un fecha especificada
>
>
>
> CASOS DE USO PRINCIPALES:
>
> * El usuario crea un proyecto, un item y una planificacion
>
> * El usuario visualiza el calendario de planificaciones
>
> * El usuario obtiene un listado de planificaciones etiquetadas como "Sin planificar"
>
>
>
> TAREAS: 
>
> * Generame un fichero README con la definicion principal del proyecto "Planificacion 2.0"
>
>
>
> * Crea una carpeta docs para registrar los casos de Uso
>
>
>
> * Genera los Casos de Uso con sus correspondiente diagrama mermaid
>
>
>
> * Genera un diagrama entidad relacion

**Copilot dice:**

> Entiendo perfectamente. Voy a ayudarte a crear un plan completo para documentar las especificaciones del proyecto Planificacion 2.0. Primero déjame explorar el workspace actual para ver qué tenemos. Perfecto, es un proyecto nuevo. Ahora voy a crear un plan detallado para la documentación del proyecto Planificacion
---

**Prompt 2** — *Agente: **Copilot***

- **Origen:** [`prompts/prompts 2026-06-10 16.50 GitHub Copilot.md`](prompts/prompts%202026-06-10%2016.50%20GitHub%20Copilot.md) — Intercambio 4
- **Timestamp:** 2026-06-10 06:04 UTC

**serpegon11710-byte dice:**

> No me gusta ese README.md
>
>
>
> Quiero un README.md funcional, de uso de la aplicación, con caracteristicas sobre las entidades que intervienen.
>
>
>
> La definicion de aspectos sobre la implementacion, arquitectura y diseño irán en la carpeta docs.

**Copilot dice:**

> Entendido, necesitas un README más orientado al usuario y las funcionalidades, no técnico. Aquí tienes una versión funcional:
>
> ```markdown
> # Planificacion 2.0
>
> Sistema de gestión y seguimiento de planificaciones para proyectos con soporte para tareas puntuales, periódicas y sin planificar.
>
> ## ¿Qué es Planificacion 2.0?
>
> Planificacion 2.0 te permite organizar y dar seguimiento a las tareas de tus proyectos mediante un sistema flexible de planificación temporal. Puedes crear proyectos, dividirlos en items y asignar planificaciones que pueden ejecutarse una sola vez, repetirse periódicamente, o mantenerse sin fecha definida hasta que decidas cuándo realizarlas.
>
> ## Componentes del Sistema
>
> ### 🗂️ Proyecto
>
> Un **Proyecto** es el contenedor principal que agrupa todas las tareas relacionadas con una iniciativa, objetivo o área de trabajo.
>
> **Características:**
> - Se identifica por un nombre único
> - Contiene múltiples items
> - Permite organizar el trabajo por contexto o alcance
>
> **Ejemplo:** "Desarrollo Web 2026", "Marketing Q2", "Infraestructura IT"
>
> ---
>
> ### 📦 Item
>
> Un **Item** representa una tarea, componente o área específica dentro de un proyecto.
>
> **Características:**
> - Pertenece a un único proyecto
> - Puede tener múltiples planificaciones asociadas
> - Agrupa planificaciones relacionadas bajo un mismo concepto
>
> **Ejemplo:** 
> - Proyecto: "Desarrollo Web 2026"
>   - Item: "Diseño de interfaz"
>   - Item: "Implementación backend"
>   - Item: "Testing y QA"
>
> ---
>
> ### 📅 Planificación
>
> Una **Planificación** define cuándo y cómo se debe ejecutar una tarea asociada a un item.
>
> **Características:**
> - **Observaciones**: Descripción detallada de qué debe hacerse
> - **Estado**: Indica si está pendiente, completada o ha expirado
> - **Definición Temporal**: Especifica cuándo debe realizarse
>
> **Estados posibles:**
> - ✅ **Completada**: La tarea ha sido finalizada
> - ⏳ **Pendiente**: Aún no se ha completado pero está dentro de plazo
> - ⏰ **Expirada**: La fecha/hora ya pasó y no se completó
>
> ---
>
> ## Tipos de Planificación
>
> ### 📍 Puntual
>
> Planificación que ocurre una sola vez en una fecha y hora específica.
>
> **Cuándo usarla:**
> - Reuniones únicas
> - Entregas con fecha límite específica
> - Eventos que no se repiten
>
> **Ejemplo:**
> - "Presentación de resultados Q1 - 15/06/2026 15:00"
> - "Entrega final del proyecto - 30/12/2026 18:00"
>
> ---
>
> ### 🔄 Periódica
>
> Planificación que se repite automáticamente según un patrón temporal definido.
>
> **Características:**
> - Fecha de inicio: Cuándo comienza la repetición
> - Fecha de fin: Cuándo termina la repetición
> - Hora específica: A qué hora ocurre cada repetición
>
> #### Tipos de Periodicidad
>
> ##### 📆 Diaria
> La planificación se repite cada día según el patrón elegido:
>
> - **Todos los días**: Se repite 7 días a la semana
>   - Ejemplo: "Backup diario de base de datos - 02:00"
>   
> - **De Lunes a Viernes**: Se repite solo en días laborables
>   - Ejemplo: "Daily standup meeting - 09:00"
>   
> - **Fin de semana**: Se repite solo sábados y domingos
>   - Ejemplo: "Revisión de métricas semanales - 10:00"
>
> ##### 📅 Semanal
> La planificación se repite el mismo día de cada semana.
>
> **Ejemplo:**
> - "Sprint planning - Todos los lunes a las 10:00"
> - "Retrospectiva de equipo - Todos los viernes a las 16:00"
>
> ##### 📊 Mensual
> La planificación se repite el mismo día de cada mes.
>
> **Ejemplo:**
> - "Cierre contable - Día 1 de cada mes a las 08:00"
> - "Revisión de objetivos - Día 15 de cada mes a las 14:00"
>
> ---
>
> ### ❓ No Planificado
>
> Planificación sin fecha ni hora asignada. Útil para gestionar un backlog de tareas pendientes de programar.
>
> **Cuándo usarla:**
> - Tareas en backlog
> - Ideas o mejoras futuras sin fecha definida
> - Tareas que dependen de otros eventos
>
> **Ejemplo:**
> - "Investigar nueva herramienta de testing"
> - "Optimización de rendimiento (cuando sea necesario)"
> - "Documentar API interna"
>
> ---
>
> ## Flujos de Trabajo
>
> ### Crear un nuevo proyecto con planificaciones
>
> 1. Crea un **Proyecto** con un nombre descriptivo
> 2. Añade **Items** para organizar las tareas del proyecto
> 3. Para cada item, crea **Planificaciones** con su definición temporal:
>    - Puntual para tareas únicas con fecha específica
>    - Periódica para tareas recurrentes
>    - No
---

**Prompt 3** — *Agente: **Copilot***

- **Origen:** [`prompts/prompts 2026-06-10 16.50 GitHub Copilot.md`](prompts/prompts%202026-06-10%2016.50%20GitHub%20Copilot.md) — Intercambio 5
- **Timestamp:** 2026-06-10 06:34 UTC

**serpegon11710-byte dice:**

> Genial Fase 1 completada. 
>
>
>
> Comenzamos la Fase 2
>
>
>
> Generame un README.md en los casos de uso con el ídice de los mismos. Generame los ficheros asociados de los casos de Uso, pero sin definir todavía. Puedes poner como contenido lo mismo que pone en el plan. Por ejemplo, para el caso de uso #1 "Caso de uso #1 con diagrama de secuencia"

**Copilot dice:**

> Perfecto, vamos a completar la Fase 2 creando la estructura de casos de uso. Creo los archivos: Excelente, he creado la estructura de la Fase 2:
>
> **Archivos creados:**
>
> ✅  - Índice completo con tabla de casos de uso, prioridades y descripciones generales
>
> ✅  - Placeholder con "Caso de uso #1 con diagrama de secuencia"
>
> ✅  - Placeholder con "Caso de uso #2 con diagrama de flujo"
>
> ✅  - Placeholder con "Caso de uso #3 con diagrama de flujo"
>
> La estructura está lista. Ahora puedes decidir si quieres:
> 1. Desarrollar el contenido completo de cada caso de uso (con actores, precondiciones, flujos, diagramas Mermaid)
> 2. Pasar a la Fase 3 (Modelo Entidad-Relación)
> 3. Cualquier otro ajuste
>
> ¿Qué prefieres hacer a continuación?
---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

**Prompt 1** — *Agente: **Copilot***

- **Origen:** [`prompts/prompts  2026-06-10 22.49 GitHub Copilot.md`](prompts/prompts%20%202026-06-10%2022.49%20GitHub%20Copilot.md) — Intercambio 1
- **Timestamp:** 2026-06-10 17:17 UTC

**serpegon11710-byte dice:**

> Me gustaría empezar con Diagramas C4. No sé si antes debería de diseñar la arquitectura de la aplicación o si se necesita el modelo ER. ¿POr donde me sugieres que continue?

**Copilot dice:**

> Voy a responderte con una ruta práctica para arrancar con C4 y aclarar en qué momento conviene definir la arquitectura y el modelo ER, para que puedas avanzar sin bloquearte.
>
> Buena pregunta. La respuesta corta: empieza por arquitectura a nivel alto, no por el modelo ER.
>
> Te sugiero este orden:
>
> 1. Define alcance y casos de uso clave  
> 2. Haz C4 Nivel 1 (System Context)  
> 3. Haz C4 Nivel 2 (Containers)  
> 4. Luego define datos y modelo de dominio  
> 5. Después aterriza el modelo ER  
> 6. Finalmente C4 Nivel 3 (Components) para partes complejas
>
> Por qué este orden:
> - C4 describe estructura y responsabilidades del sistema.
> - El ER describe persistencia de datos.
> - Si haces ER demasiado pronto, puedes “forzar” decisiones técnicas antes de tener clara la separación de responsabilidades.
>
> Ruta concreta para tu proyecto:
> 1. Usa tus casos de uso como base en  y los UC-01, UC-02, UC-03 para identificar actores y límites.
> 2. Dibuja C4-1:
>    - Actores: planificador, administrador, etc.
>    - Sistema: Planificación 2.0
>    - Sistemas externos (si existen).
> 3. Dibuja C4-2:
>    - Frontend web
>    - API / backend
>    - Base de datos
>    - Módulos principales: proyectos, ítems, planificaciones, ocurrencias.
> 4. Recién ahí haz modelo de datos conceptual (entidades/relaciones) apoyándote en  y .
> 5. Convierte ese modelo conceptual en ER lógico/físico (tablas, claves, restricciones).
> 6. Si un contenedor backend es complejo, crea C4-3 para sus componentes internos.
>
> Regla práctica:
> - Si dudas entre C4 y ER, elige C4 primero.
> - ER entra cuando ya sabes qué contenedor persiste qué información y por qué.
>
> Si quieres, en el siguiente paso te puedo proponer un primer borrador de C4 Nivel 1 y Nivel 2 para Planificación 2.0, listo para pasarlo a diagrama.
---

**Prompt 2** — *Agente: **Copilot***

- **Origen:** [`prompts/prompts  2026-06-10 22.49 GitHub Copilot.md`](prompts/prompts%20%202026-06-10%2022.49%20GitHub%20Copilot.md) — Intercambio 3
- **Timestamp:** 2026-06-10 17:20 UTC

**serpegon11710-byte dice:**

> OK, entonces en la carpeta docs crea una carpeta "diagramas-c4" y dentro genera el C4 de Nivel 1 y el C4 de Nivel 2.

**Copilot dice:**

> preparo también una matriz breve UC -> Contenedores para anexarla junto a estos dos documentos.
---

**Prompt 3** — *Agente: **Cursor***

- **Origen:** [`prompts/prompts 2026-06-14 19.13 Cursor.md`](prompts/prompts%202026-06-14%2019.13%20Cursor.md) — Intercambio 8
- **Timestamp:** 2026-06-14 14:16 UTC

**serpegon11710-byte dice:**

> De acuerdo, me he traido la rama con los diagramas C4.
>
> Asegurarte que todo lo que se mencione sobre los diagramas C4 sea coherente con los propios modelos.
>
> No referencies a los diagramas C4 en la aruitectura. Ajusta la docukmentacion en su propia carpeta

**Cursor dice:**

> Revisando los diagramas C4 y toda la documentación que los menciona para alinearla y mover las referencias a su carpeta.
>
> Listo. Resumen de cambios:
>
> ## Nueva documentación en `docs/diagramas-c4/`
>
> Creado **`docs/diagramas-c4/README.md`** como índice propio, alineado con los tres `.mmd`:
>
> | Nivel | Contenido documentado según el modelo |
> |-------|--------------------------------------|
> | **N1** | Usuario + sistema Planificacion 2.0 (UC-01, UC-02, UC-03) |
> | **N2** | Front-End, Back-End, Capa de Persistencia, BBDD y flujos HTTPS/JSON/SQL |
> | **N3** | API REST, 4 agregados, Puerto de Persistencia, adaptadores, motor BBDD externo (PostgreSQL/MySQL) |
> | **N4** | Pendiente |
>
> Incluye trazabilidad UC ↔ niveles C4 y nota de visualización Mermaid C4.
>
> ## Retirado de `docs/arquitectura/`
>
> - Eliminadas las menciones a C4 del README de arquitectura.
> - La carpeta `docs/arquitectura/` ya no referencia diagramas C4.
>
> ## Planificación actualizada (`planificacion-inicial.md`)
>
> - **Step 2:** subcarpeta `docs/diagramas-c4/`
> - **Step 7:** apunta a `docs/diagramas-c4/README.md` y a los tres `.mmd` (ya no a arquitectura)
> - **Step 9:** depende de "step 7 — C4 N1-N3"
> - **Tabla de archivos:** filas C4 propias; arquitectura sin "estado C4"
> - **Verificación** e **historial** actualizados
>
> ## Otros
>
> - `docs/revision-principios-solid.md`: C4 en alcance de `docs/diagramas-c4/`; deuda N4 reubicada al Step 7.
>
> Los ficheros `.mmd` no se han modificado: la documentación describe lo que contienen tal cual.
---

### **2.2. Descripción de componentes principales:**

**Prompt 1** — *Agente: **Copilot***

- **Origen:** [`prompts/prompts  2026-06-10 22.49 GitHub Copilot.md`](prompts/prompts%20%202026-06-10%2022.49%20GitHub%20Copilot.md) — Intercambio 7
- **Timestamp:** 2026-06-10 20:15 UTC

**serpegon11710-byte dice:**

> Ok. Va a ser una aplicacion WEB, por lo que quiero 3 capas: 
>
> * Front-End
>
> * Back-End
>
> * BBDD

**Copilot dice:**

> Voy a ajustar el C4 Nivel 2 para reflejar explícitamente la arquitectura web en 3 capas y luego validarlo para que quede listo.Haré una edición puntual del diagrama para separar Front-End, Back-End y BBDD sin cambiar el alcance funcional acordado del MVP.Ahora valido la sintaxis Mermaid del archivo actualizado y te confirmo resultado.Perfecto, ya quedó actualizado a arquitectura web de 3 capas en el C4 Nivel 2:
>
> 1. Front-End
> 2. Back-End
> 3. BBDD
>
> Archivo actualizado:
>
>
> Además, validé la sintaxis Mermaid y está correcta.
>
> Si quieres, en el siguiente paso puedo ajustar también el Nivel 1 para que su descripción mencione explícitamente que la solución se implementa como aplicación web en 3 capas, manteniendo el mismo alcance funcional del MVP.
---

**Prompt 2** — *Agente: **Copilot***

- **Origen:** [`prompts/prompts  2026-06-10 22.49 GitHub Copilot.md`](prompts/prompts%20%202026-06-10%2022.49%20GitHub%20Copilot.md) — Intercambio 11
- **Timestamp:** 2026-06-10 21:13 UTC

**serpegon11710-byte dice:**

> Un Modulo pPor entidad...
>
>
>
> Modulo Proyectos. Este Modulo es independiente
>
>
>
> Modulo Items --> Proyecto consume items
>
>
>
> Modulo Planificaciones --> Item consume planificaciones
>
>
>
> Modulo Ocurrencias --> Planificacion consume Ocurrencias
>
>
>
> ¿No Planificado? Esto no es ningun Modulo, es un tipo de planificacion. No vamos a generar un modulo por ada tipo de Planificacion, ¿verdad?

**Copilot dice:**

> Exacto. Tienes toda la razón. "No Planificado" es simplemente un **tipo de planificación**, no un módulo. UC-03 es un filtro/consulta sobre el módulo Planificaciones donde `tipo = 'No Planificado'`.
>
> Estructura correcta:
> - **Módulo Proyectos** → independiente
> - **Módulo Items** → consume Proyectos
> - **Módulo Planificaciones** → consume Items (incluye servicio de consulta para "No Planificado")
> - **Módulo Ocurrencias** → consume Planificaciones
>
> UC-03 no es un módulo, es un **caso de uso de consulta** dentro de Planificaciones.
>
> Actualizo el Nivel 3 con esta jerarquía correcta y relaciones de dependencia reales.
---

**Prompt 3** — *Agente: **Cursor***

- **Origen:** [`prompts/prompts 2026-06-14 19.13 Cursor.md`](prompts/prompts%202026-06-14%2019.13%20Cursor.md) — Intercambio 22
- **Timestamp:** 2026-06-14 14:16 UTC

**serpegon11710-byte dice:**

> Adelante, genera los diagramas en pseudocódigo (como canónicos) y documenta que posteriormente habrá que hacer un N4-implementacion vinculado al stack

**Cursor dice:**

> Generando los N4 canónicos en pseudocódigo y documentando la política de N4-implementación. Revisando entidades, zonas críticas y arquitectura existente.
>
> Creando la estructura N4 canónica y los seis documentos de pseudocódigo.
>
> He generado el N4 canónico en pseudocódigo y documentado la política de implementación. Resumen:
>
> ## Estructura creada
>
> ```
> docs/diagramas-c4/
> ├── n4-pseudocodigo/          ← canónico (cerrado)
> │   ├── README.md
> │   ├── zc-1-consulta-ocurrencias.md
> │   ├── zc-2-materializacion-ocurrencias.md
> │   ├── zc-3-planificacion-temporal.md
> │   ├── zc-4-orquestacion-aplicacion.md
> │   ├── zc-5-persistencia.md
> │   └── zc-6-presentacion.md
> └── n4-implementacion/        ← pendiente (stack)
>     └── README.md
> ```
>
> ## Contenido por zona
>
> Cada documento incluye:
> - **Estructura lógica** (diagrama Mermaid + tabla de subcomponentes)
> - **Pseudocódigo** de los flujos principales
> - **Contratos de puerto** donde aplica (ZC-1, ZC-2, ZC-5)
> - Enlace a `n4-implementacion/` para la proyección futura al stack
>
> ## Documentación actualizada
>
> - **`zonas-criticas-n4.md`**: sección "Política N4" (canónico vs implementación) y enlace al pseudocódigo de cada ZC
> - **`README.md`**: N4 marcado como cerrado en pseudocódigo; `n4-implementacion/` pendiente del stack; eliminada la sección de dependencias externas por rama
>
> ## Modelo acordado
>
> | Capa | Cuándo cambia |
> |------|----------------|
> | `n4-pseudocodigo/` | Solo si cambia la lógica de negocio |
> | `n4-implementacion/{stack}/` | Al elegir o cambiar el stack; deriva del canónico |
>
> Cuando tengáis el Step 8c, la carpeta `n4-implementacion/{stack}/` traducirá nombres lógicos a clases, SQL, componentes UI, etc., sin redefinir las zonas críticas.
---

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

**Prompt 1** — *Agente: **Copilot***

- **Origen:** [`prompts/prompts  2026-06-10 22.49 GitHub Copilot.md`](prompts/prompts%20%202026-06-10%2022.49%20GitHub%20Copilot.md) — Intercambio 18
- **Timestamp:** 2026-06-10 22:41 UTC

**serpegon11710-byte dice:**

> Quiero ver esa propuesta concreta de estructura de carpetas y contratos mínimos (interfaces y clases base) para esa opción híbrida.

**Copilot dice:**

> Perfecto. Esta es una propuesta concreta para la opcion hibrida: Clean por capas + puerto de persistencia desacoplado.
>
> Estructura de carpetas sugerida (Backend)
>
>     backend/
>       src/
>         api/
>           controllers/
>             proyectos.controller.ts
>             items.controller.ts
>             planificaciones.controller.ts
>             ocurrencias.controller.ts
>           dto/
>           mappers/
>         application/
>           services/
>             proyectos.service.ts
>             items.service.ts
>             planificaciones.service.ts
>             ocurrencias.service.ts
>           ports/
>             persistence.port.ts
>             db-connection.port.ts
>         domain/
>           entities/
>             proyecto.entity.ts
>             item.entity.ts
>             planificacion.entity.ts
>             ocurrencia.entity.ts
>           value-objects/
>           rules/
>         infrastructure/
>           persistence/
>             adapters/
>               persistence.adapter.ts
>               postgres-db.adapter.ts
>             repositories/
>               proyectos.repository.ts
>               items.repository.ts
>               planificaciones.repository.ts
>               ocurrencias.repository.ts
>             orm/
>       test/
>
> Reglas de dependencia (clave)
>
> 1. api depende de application.
> 2. application depende de domain y de puertos.
> 3. domain no depende de nada externo.
> 4. infrastructure implementa puertos de application.
> 5. infrastructure puede depender de ORM y driver SQL.
> 6. El motor SQL queda fuera del backend (externo).
>
> Contratos minimos (interfaces)
>
> 1. Puerto de persistencia para negocio
>
>     export interface PersistencePort {
>       proyectos: ProyectosRepositoryPort;
>       items: ItemsRepositoryPort;
>       planificaciones: PlanificacionesRepositoryPort;
>       ocurrencias: OcurrenciasRepositoryPort;
>       beginTransaction?(): Promise<void>;
>       commit?(): Promise<void>;
>       rollback?(): Promise<void>;
>     }
>
> 2. Puerto de conexion a BBDD
>
>     export interface DbConnectionPort {
>       query<T>(sql: string, params?: unknown[]): Promise<T[]>;
>       execute(sql: string, params?: unknown[]): Promise<number>;
>       beginTransaction(): Promise<void>;
>       commit(): Promise<void>;
>       rollback(): Promise<void>;
>       close(): Promise<void>;
>     }
>
> 3. Repositorios por entidad
>
>     export interface ProyectosRepositoryPort {
>       create(proyecto: Proyecto): Promise<Proyecto>;
>       update(proyecto: Proyecto): Promise<Proyecto>;
>       delete(proyectoId: string): Promise<void>;
>       findById(proyectoId: string): Promise<Proyecto | null>;
>       list(): Promise<Proyecto[]>;
>     }
>
>     export interface ItemsRepositoryPort {
>       create(item: Item): Promise<Item>;
>       update(item: Item): Promise<Item>;
>       delete(itemId: string): Promise<void>;
>       findById(itemId: string): Promise<Item | null>;
>       listByProyecto(proyectoId: string): Promise<Item[]>;
>     }
>
>     export interface PlanificacionesRepositoryPort {
>       create(planificacion: Planificacion): Promise<Planificacion>;
>       update(planificacion: Planificacion): Promise<Planificacion>;
>       delete(planificacionId: string): Promise<void>;
>       findById(planificacionId: string): Promise<Planificacion | null>;
>       listByItem(itemId: string): Promise<Planificacion[]>;
>       listNoPlanificado(): Promise<Planificacion[]>;
>     }
>
>     export interface OcurrenciasRepositoryPort {
>       create(ocurrencia: Ocurrencia): Promise<Ocurrencia>;
>       update(ocurrencia: Ocurrencia): Promise<Ocurrencia>;
>       delete(ocurrenciaId: string): Promise<void>;
>       findById(ocurrenciaId: string): Promise<Ocurrencia | null>;
>       listByPlanificacion(planificacionId: string): Promise<Ocurrencia[]>;
>     }
>
> Clases base minimas (application)
>
> 1. Servicios de aplicacion por entidad
>
>     export class ProyectosService {
>       constructor(private readonly persistence: PersistencePort) {}
>       async crearProyecto(input: CrearProyectoInput): Promise<Proyecto> { ... }
>       async actualizarProyecto(input: ActualizarProyectoInput): Promise<Proyecto> { ... }
>     }
>
>     export class ItemsService {
>       constructor(private readonly persistence: PersistencePort) {}
>       async crearItem(input: CrearItemInput): Promise<Item> { ... }
>     }
>
> 2. Servicio de planificaciones incluye UC-03
>
>     export class PlanificacionesService {
>       constructor(private readonly persistence: PersistencePort) {}
>       async crearPlanificacion(input: CrearPlanificacionInput): Promise<Planificacion> { ... }
>       async listarNoPlanificado(): Promise<Planificacion[]> { ... }
>     }
>
> 3. Servicio de ocurrencias
>
>     export class OcurrenciasService {
>       constructor(private readonly persistence: PersistencePort) {}
>       async crearOcurrencia(input: CrearOcurrenciaInput): Promise<Ocurrencia> { ... }
>       async listarPorPlanificacion(planificacionId: string): Promise<Ocurrencia[]> { ... }
>     }
>
> Entidades base (domain)
>
> 1. Proyecto contiene relacion con items.
> 2. Item pertenece a un proyecto.
> 3. Planificacion pertenece a un item y tiene tipo.
> 4. Ocurrencia pertenece a una planificacion.
> 5. No Planificado es valor del tipo de Planificacion, no modulo.
>
> Composicion en runtime
>
> 1. API recibe request y llama al service correspondiente.
> 2. Service aplica reglas de negocio y usa PersistencePort.
> 3. PersistenceAdapter implementa PersistencePort.
> 4. Repositorios usan DbConnectionPort.
> 5. PostgresDbAdapter implementa DbConnectionPort y conecta con motor SQL externo.
>
> Recomendacion MVP
>
> 1. Implementa primero solo un adaptador SQL (por ejemplo Postgres).
> 2. Mantiene DbConnectionPort desde el dia 1 para no acoplarte al driver.
> 3. Deja transacciones en PersistencePort para UC que toquen Proyecto + Item + Planificacion en cascada.
>
> Si quieres, en el siguiente paso te doy una plantilla inicial de 8 archivos reales (interfaces + servicios base + un adaptador SQL) lista para pegar en tu proyecto.
---

**Prompt 2** — *Agente: **Cursor***

- **Origen:** [`prompts/prompts 2026-06-14 19.13 Cursor.md`](prompts/prompts%202026-06-14%2019.13%20Cursor.md) — Intercambio 4
- **Timestamp:** 2026-06-14 14:16 UTC

**serpegon11710-byte dice:**

> ¿HJas documentado la Internacionalizacion en la arquitectura por alguna razón en especial? Los principios SOLID deben revisarse a nivel global, no solo en la arquitectura

**Cursor dice:**

> Tienes razón: i18n es transversal y SOLID debe auditar toda la documentación. Reviso referencias y reubico/amplió esos documentos.
>
> Reubicando i18n y la revisión SOLID a nivel global de `docs/` y ampliando la auditoría a toda la documentación.
>
> Tienes razón en ambos puntos. Te explico y lo que he corregido:
>
> ## ¿Por qué estaba i18n en arquitectura?
>
> Lo puse ahí porque surgió ligado a la decisión de errores por `codigo` (Negocio sin literales, Presentación resuelve el texto). Pero **i18n no es una decisión estructural de arquitectura**: es una política transversal de implementación que afecta a casos de uso, UI y mensajes, y no debería vivir dentro de `docs/arquitectura/`.
>
> Lo coloqué en arquitectura por conveniencia del hilo de trabajo, no porque perteneciera estructuralmente a esa carpeta.
>
> ## ¿Por qué SOLID solo en arquitectura?
>
> Fue un acotamiento incorrecto. SOLID aplica al diseño global del proyecto: casos de uso, entidades, README y arquitectura. La revisión anterior era incompleta.
>
> ## Cambios aplicados
>
> **Reubicación:**
> - `docs/internacionalizacion.md` — política global (con sección explícita de por qué no está en arquitectura)
> - `docs/revision-principios-solid.md` — auditoría global
> - Eliminados los duplicados en `docs/arquitectura/`
>
> **Revisión SOLID ampliada** a:
> - `README.md`
> - `planificacion-inicial.md`
> - Todos los casos de uso (UC-01.*, UC-02.*, UC-03)
> - Entidades (`planificaciones.md`, `ocurrencias.md`)
> - Arquitectura completa
>
> **Planificación:** nuevo Step 9b "Verificación transversal pre-stack", separado de la Fase 4 de arquitectura.
>
> **README de arquitectura:** ya no marca SOLID/i18n como decisiones de arquitectura; solo enlaza a los documentos globales en "Referencias transversales".
>
> ## Resultado de la revisión global
>
> Cumple SOLID de forma coherente en todas las áreas. Deuda menor detectada (no bloqueante):
> - RN-5.3 y RN-5.5 duplicadas en UC-01.5
> - Mensajes en español embebidos en flujos alternativos de UCs (referencia UX; en código irán como claves i18n)
>
> ¿Quieres que unifique la regla duplicada en UC-01.5 antes de pasar al stack?
---

**Prompt 3** — *Agente: **Cursor***

- **Origen:** [`prompts/prompts 2026-06-14 19.13 Cursor.md`](prompts/prompts%202026-06-14%2019.13%20Cursor.md) — Intercambio 75
- **Timestamp:** 2026-06-14 14:16 UTC

**serpegon11710-byte dice:**

> Porque has usado en varios componentes el nombre de tecnologias mixtas "nestjs-react-postgresql"? POrque aparece el nombre de la tecnologia de BBDD cuando los componentes deben esyat desacoplados del motor de la BBDD? En serio esos componenetes se van a diseñar con tecnologoias mixtas? Quiero el nombre exacfto de la tecnologoa en la que se va a diseñar ese componente, no el pack global de todas las tecnologias del stack

**Cursor dice:**

> Tienes razón: usar un pack global mezclaba tecnologías y acoplaba componentes al motor de BBDD. Renombrando cada carpeta al nombre exacto de su tecnología.
>
> Tienes razón en la crítica. Usé `nestjs-react-postgresql` porque en la documentación del Step 11/12 aparece como **nombre del stack global** (FAQ-007), y lo apliqué mal a cada componente. Eso mezcla tecnologías y, peor aún, mete PostgreSQL donde no corresponde: la capa de persistencia debe implementar **puertos**, no llevar el nombre del motor en su carpeta de diseño.
>
> Ya está corregido. Cada componente usa **solo la tecnología con la que se implementa**:
>
> ```
> implementacion/
> ├── front-end/react-typescript/      ← React 18 + TypeScript + Vite
> ├── back-end/nestjs-typescript/      ← NestJS 10 + TypeScript
> ├── persistencia/typescript/         ← adaptadores y repos (TS; motor vía puerto)
> ├── shared/typescript/               ← DTOs, errores, tipos compartidos
> └── bbdd/postgresql/                   ← único sitio donde vive el motor (migraciones, seeds)
> ```
>
> | Componente | Antes (incorrecto) | Ahora |
> |------------|------------------|-------|
> | Front-End | `nestjs-react-postgresql` | `react-typescript` |
> | Back-End | `nestjs-react-postgresql` | `nestjs-typescript` |
> | Persistencia | `nestjs-react-postgresql` | `typescript` |
> | Shared | `nestjs-react-postgresql` | `typescript` |
> | BBDD | `postgresql` | `postgresql` (sin cambio) |
>
> La estructura interna (`src/`, módulos de dominio, repos, etc.) se mantiene; solo cambian los nombres de las carpetas de stack.
>
> Perdón por la confusión inicial. Si prefieres otro criterio de nombre (p. ej. `react` en lugar de `react-typescript`, o `nestjs` en lugar de `nestjs-typescript`), dímelo y lo ajustamos.
---

### **2.4. Infraestructura y despliegue**

**Prompt 1** — *Agente: **Cursor***

- **Origen:** [`prompts/prompts 2026-06-14 19.13 Cursor.md`](prompts/prompts%202026-06-14%2019.13%20Cursor.md) — Intercambio 188
- **Timestamp:** 2026-06-14 14:16 UTC

**serpegon11710-byte dice:**

> No quiero una regla para cursor. No me fio de nadie. Quiero una regla que vaya a ejecutarse en cualquier agente que interactue con el repoo

**Cursor dice:**

> Tu desconfianza encaja con cómo funcionan las cosas: **una regla de Cursor solo influye en el prompt**; no se ejecuta sola. Para que **algo corra** con independencia del agente (Cursor, Copilot, otro CLI, tú en terminal), el punto de control tiene que estar en el **repo + git + scripts**, no en el IDE.
>
> ## Qué sí se ejecuta “solo” (sin fiarse del agente)
>
> | Capa | Quién la ejecuta | Cuándo |
> |------|------------------|--------|
> | **Script en el repo** | Shell / hook / CI | Al llamarlo o al engancharlo |
> | **Git hook** (`pre-commit`) | Git al hacer `git commit` | Siempre que alguien commitee |
> | **CI** (GitHub Actions, etc.) | El servidor | En push / PR |
>
> Cualquier agente que **modifique ficheros y haga commit** pasa por el hook. No necesita leer reglas de Cursor.
>
> **Límite honesto:** entre el `edit` y el `commit`, el agente aún puede escribir mal en disco; el hook **bloquea el commit** (o corrige) si la fecha “de hoy” no cuadra con el SO. Eso es lo más cercano a “garantía” sin confiar en el modelo.
>
> ## Diseño acotado a tu matiz
>
> Solo vigilar fechas que significan **“momento actual del sistema”**, no toda fecha histórica.
>
> ### 1. Script canónico (fuente única)
>
> Por ejemplo `scripts/fecha-sistema.ps1` (Windows) y/o `.sh`:
>
> ```powershell
> Get-Date -Format "yyyy-MM-dd"
> ```
>
> Documentado en el README o en **`AGENTS.md` en la raíz del repo** (convención que leen muchos agentes, no solo Cursor). El script no es confianza: **es la implementación** que usarán hook y humanos.
>
> ### 2. Hook `pre-commit` (lo que realmente “obliga”)
>
> En `.githooks/pre-commit` (y `git config core.hooksPath .githooks` en el setup del repo):
>
> 1. Obtener `HOY=$(scripts/fecha-sistema.ps1)`.
> 2. Mirar el **diff staged** en `docs/**/*.md`, `backlog/**/*.md`.
> 3. Solo en líneas **nuevas o modificadas** que encajen con patrones de “fecha actual”, por ejemplo:
>    - `**Última actualización:**`
>    - `FAQ cerrada (` / `cerrada (`
>    - columnas **Cierre** en `historial-tickets.md`
>    - `(reabierto YYYY-MM-DD)` / `(re-validado YYYY-MM-DD)` cuando sea fecha de la operación
> 4. Extraer el `YYYY-MM-DD` de esa línea y **exigir que sea igual a `HOY`**.
> 5. Si no → **commit rechazado** con mensaje claro: *«Fecha distinta del sistema; ejecuta scripts/fecha-sistema.ps1»*.
>
> Así da igual si el agente usó `user_info` congelado: **no entra el commit**.
>
> Patrones estrechos evitan romper actas con `2026-06-12` histórico (esas líneas no cambian o no matchean “hoy”).
>
> ### 3. CI (refuerzo)
>
> Misma lógica en un job de PR: falla si en el diff hay fechas “de hoy” que no coinciden con la fecha del runner (o con la del merge). Cubre quien haga `--no-verify` en local.
>
> ## Qué no es “ejecución” (aunque esté en el repo)
>
> - **`AGENTS.md`**, `CONTRIBUTING.md`, protocolos en `docs/planificacion/` → instrucciones; útiles, pero **no ejecutan**.
> - **`.cursor/rules`** → solo Cursor; tú ya descartas esto.
>
> `AGENTS.md` puede decir *«antes de commitear docs con fecha de hoy, el hook comprobará X»* — es documentación del **mecanismo**, no la garantía.
>
> ## Flujo para cualquier agente
>
> 1. Agente edita markdown (puede equivocarse).
> 2. Agente hace `git commit`.
> 3. **Hook corre** → compara fechas “de hoy” en el diff con `Get-Date`.
> 4. Falla o pasa; el agente debe corregir y reintentar.
>
> No hace falta que tú pidas «registra la fecha»; hace falta que **el proyecto no acepte commits incoherentes**.
>
> ## Resumen
>
> - **No quieres reglas de Cursor** → correcto para tu objetivo.
> - **Quieres algo que se ejecute con cualquier agente** → **`scripts/fecha-sistema` + `pre-commit` (+ CI)**.
> - **Solo fechas “del sistema / hoy”**, no cualquier fecha → el hook debe usar **patrones acotados**, no validar todo `YYYY-MM-DD`.
>
> En Ask mode no puedo crear esos ficheros; en **Agent mode** se puede montar `.githooks/pre-commit`, el script y una línea en el README de setup (`core.hooksPath`). Si quieres, en el siguiente mensaje en Agent mode lo implementamos con patrones alineados a vuestros protocolos (`historial-tickets`, cabeceras FAQ, etc.).
---

**Prompt 2** — *Agente: **Cursor***

- **Origen:** [`prompts/prompts 2026-06-14 19.13 Cursor.md`](prompts/prompts%202026-06-14%2019.13%20Cursor.md) — Intercambio 78
- **Timestamp:** 2026-06-14 14:16 UTC

**serpegon11710-byte dice:**

> Prepara :
>
> * docs\politicas-transversales\desambiguacion-implementacion.mdexplicando el matiz de colición de nombres
> * docs\implementacion\{componente}\README.md explicando el contenido que se espera encontrar en esa carpeta
> * implementacion\READ.me explicando la estrucctura de carpetas por tecnología de cada componente
> * docs\diagramas-c4\...\implementacion\README.md veo que ya exsite 
>
> Asegurate que todos los README.md que crees en las carpetas de implementacion hagan referencia al fichero de desambiguacion-implementacion.md

**Cursor dice:**

> Creando la documentación de desambiguación y los README, y limpiando carpetas duplicadas del renombrado anterior.
---

**Prompt 3** — *Agente: **Cursor***

- **Origen:** [`prompts/prompts 2026-06-14 19.13 Cursor.md`](prompts/prompts%202026-06-14%2019.13%20Cursor.md) — Intercambio 84
- **Timestamp:** 2026-06-14 14:16 UTC

**serpegon11710-byte dice:**

> ¿Qué significa Bootstrap monorepo?

**Cursor dice:**

> En vuestro plan, **«bootstrap monorepo»** (Step 14, opción C) significa **arrancar el proyecto de código por primera vez**: crear la estructura mínima para que compile, se instale y se ejecute, **sin implementar aún la lógica de negocio** (UC, ZC, reglas de dominio).
>
> ## «Bootstrap»
>
> Poner en marcha el esqueleto técnico:
>
> - `package.json` / `pnpm-workspace.yaml`
> - Proyecto **NestJS** en `implementacion/back-end/nestjs-typescript/`
> - Proyecto **React + Vite** en `implementacion/front-end/react-typescript/`
> - Paquete **shared** en `implementacion/shared/typescript/`
> - Módulo de **persistencia** enlazado al back-end
> - **Migraciones** iniciales en `implementacion/bbdd/postgresql/` (esquema ER vacío o base)
> - Scripts básicos: `install`, `dev`, `build`, `test`, lint
> - Configuración: TypeScript, ESLint, variables de entorno de ejemplo
>
> Es decir: de carpetas con `.gitkeep` → **repositorio ejecutable**, aunque la app aún no haga nada útil.
>
> ## «Monorepo»
>
> **Un solo repositorio Git** con **varios paquetes/proyectos** relacionados, en lugar de repos separados para front, back y shared.
>
> En vuestro stack se recomienda **pnpm workspaces**, algo así:
>
> ```
> Planificacion_2.0/
> ├── pnpm-workspace.yaml
> ├── package.json
> ├── implementacion/
> │   ├── front-end/react-typescript/    → paquete @planificacion/web
> │   ├── back-end/nestjs-typescript/    → paquete @planificacion/api
> │   ├── shared/typescript/             → paquete @planificacion/shared
> │   └── persistencia/typescript/       → paquete @planificacion/persistence
> └── docs/
> ```
>
> Ventaja principal para Planificacion 2.0: **compartir tipos y DTOs** (`shared`) entre API y SPA con una sola fuente de verdad, alineado con `contratos-minimos.md`.
>
> ## Qué no es (en Step 14)
>
> - No es el Step **12** (documentar N4 por stack).
> - No es el Step **12b** (redactar prácticas en `docs/implementacion/`).
> - No es implementar calendario, wizard, ocurrencias, etc.
>
> ## Orden en vuestro plan
>
> Solo **después** del Step 13 (validar documentación), para no codificar sobre un diseño aún inconsistente.
>
> En una frase: **bootstrap monorepo = crear el andamiaje del código (varios paquetes en un repo) listo para empezar a desarrollar.**
---

### **2.5. Seguridad**

**Prompt 1** — *Agente: **Copilot***

- **Origen:** [`prompts/prompts  2026-06-10 22.49 GitHub Copilot.md`](prompts/prompts%20%202026-06-10%2022.49%20GitHub%20Copilot.md) — Intercambio 5
- **Timestamp:** 2026-06-10 20:10 UTC

**serpegon11710-byte dice:**

> ¿En qué momento hemos hablado sobre usuarios y configuracion? Para este MVP tendremos una aplicación monousuario sin loguin. ¿Afecta es a los nivels C4.1 y C4.2?

**Copilot dice:**

> Sí, afecta, y bastante.
>
> No lo habíamos definido explícitamente antes: yo lo inferí al crear los diagramas por el lenguaje de los casos de uso (gestión, mantenimiento, etc.) y por un patrón típico de arquitectura. Esa suposición quedó reflejada en:
> - 
> - 
>
> Con tu definición real del MVP (monousuario, sin login), los ajustes correctos son:
>
> 1. C4.1 (Contexto)
> - Dejar un único actor: Usuario.
> - Quitar Proveedor de Identidad y relación de autenticación.
> - Mantener solo sistemas externos realmente necesarios (por ejemplo correo, si de verdad se usa en MVP).
>
> 2. C4.2 (Contenedores)
> - Quitar integración con identidad/autenticación externa.
> - Mantener flujo simple: App → API → BD.
> - Si “configuración” existe, modelarla como capacidad del mismo usuario, no como actor separado.
>
> Conclusión: sí, cambia tanto C4.1 como C4.2, simplificándolos.
>
> Si quieres, te los actualizo ahora mismo en esos dos archivos para que queden alineados al MVP.
---

**Prompt 2** — *Agente: **Copilot***

- **Origen:** [`prompts/prompts  2026-06-10 22.49 GitHub Copilot.md`](prompts/prompts%20%202026-06-10%2022.49%20GitHub%20Copilot.md) — Intercambio 6
- **Timestamp:** 2026-06-10 20:12 UTC

**serpegon11710-byte dice:**

> No infieras nada que no hayamos hablado. En base a los 3 Casos de Uso principales, diseñame los diagramas de Nivel 1 y Nivel 2. No hay nnguna capa de configuracion en este MVP

**Copilot dice:**

> Voy a rehacer ambos diagramas tomando únicamente lo que está en UC-01, UC-02 y UC-03, sin suposiciones ni capas adicionales, y después los valido para dejarlos consistentes con el MVP.Ya extraje los hechos explícitos de los 3 UC: el actor es solo Usuario y las capacidades centrales son mantenimiento, gestión de ocurrencias y listado de no planificado. Ahora actualizo C4.1 y C4.2 en esa línea y sin configuración adicional.
---

### **2.6. Tests**

**Prompt 1** — *Agente: **Cursor***

- **Origen:** [`prompts/prompts 2026-06-14 19.13 Cursor.md`](prompts/prompts%202026-06-14%2019.13%20Cursor.md) — Intercambio 213
- **Timestamp:** 2026-06-14 14:16 UTC

**serpegon11710-byte dice:**

> ¿Qué documentacion tenemos sobre los test?

**Cursor dice:**

> No hay un documento único tipo «estrategia de testing». La documentación sobre tests está **repartida por capas, stack y backlog**. Resumen:
>
> ## 1. Guías por componente (fuente principal)
>
> En [`docs/implementacion/`](docs/implementacion/) cada README tiene la sección **«Convenciones de tests y errores»** con tipos de test, alcance y qué **no** testear en esa capa:
>
> | Componente | Documento | Tipos documentados |
> |------------|-----------|-------------------|
> | Back-End | [`docs/implementacion/back-end/README.md`](docs/implementacion/back-end/README.md) | Unitario dominio (ZC-1–3), unitario aplicación (ZC-4), integración API (supertest), contrato DTO↔JSON |
> | Front-End | [`docs/implementacion/front-end/README.md`](docs/implementacion/front-end/README.md) | Componentes, integración con API mock (MSW), i18n, UTC |
> | Persistencia | [`docs/implementacion/persistencia/README.md`](docs/implementacion/persistencia/README.md) | Integración con BBDD (Testcontainers), mappers, transacciones, RE-4/FAQ-311 |
> | BBDD | [`docs/implementacion/bbdd/README.md`](docs/implementacion/bbdd/README.md) | Migraciones, constraints, seeds, UTC |
> | Shared | [`docs/implementacion/shared/README.md`](docs/implementacion/shared/README.md) | Compilación estricta, contrato DTO, catálogo de códigos |
>
> Índice general: [`docs/implementacion/README.md`](docs/implementacion/README.md) (Step 12b, T-000).
>
> ---
>
> ## 2. N4 — detalle por zona crítica
>
> Algunos ficheros N4 con sección **«Tests»** concretan casos:
>
> - [`docs/diagramas-c4/c4-nivel-4/implementacion/back-end/nestjs-typescript/zc-1-consulta-ocurrencias.md`](docs/diagramas-c4/c4-nivel-4/implementacion/back-end/nestjs-typescript/zc-1-consulta-ocurrencias.md) — unitarios con mocks; casos RO-3, RO-7, RO-10  
> - [`docs/diagramas-c4/c4-nivel-4/implementacion/front-end/react-typescript/zc-6-presentacion.md`](docs/diagramas-c4/c4-nivel-4/implementacion/front-end/react-typescript/zc-6-presentacion.md) — React Testing Library, snapshots i18n  
> - [`docs/diagramas-c4/c4-nivel-4/implementacion/persistencia/typescript/zc-5-persistencia.md`](docs/diagramas-c4/c4-nivel-4/implementacion/persistencia/typescript/zc-5-persistencia.md) — Testcontainers, fixtures de seeds  
>
> ---
>
> ## 3. Stack y herramientas
>
> [`docs/stack-tecnologico/analisis-inicial.md`](docs/stack-tecnologico/analisis-inicial.md):
>
> - §7.3 — batería de tests para fechas (RO-*, RC-3)  
> - §8 — **Testcontainers** (PostgreSQL), ESLint/Prettier, CI futuro (`lint + test + migrate check`)  
> - Comparativa de stacks — Jest/Vitest, Testcontainers, etc.
>
> Referencia en bootstrap: [`backlog/001-bootstrap/README.md`](backlog/001-bootstrap/README.md) §3 (Testcontainers como herramienta complementaria).
>
> ---
>
> ## 4. Backlog — tests planificados (aún sin código)
>
> No hay tests implementados; el backlog los reparte por ticket:
>
> | Ticket | Tests planificados |
> |--------|-------------------|
> | **T-001** | `T-001-12` — smoke test bootstrap; script `pnpm test` |
> | **T-002** | Dominio Proyecto/Item + integración API |
> | **T-003** | Reglas RT/RC críticas |
> | **T-004** | Orquestador wizard + E2E flujo feliz |
> | **T-005** | RO-3 / RO-7 en consulta |
> | **T-006** | Integración UC-02.2 |
> | **T-007** | RO-3, RO-5, materialización |
> | **T-008** | FAQ-311 (un `planificacion_id` por TX) |
>
> Validación documental Step 13 ([`backlog/000-planificacion-inicial/validacion-documental-step13.md`](backlog/000-planificacion-inicial/validacion-documental-step13.md)): tests de integración automatizados marcados como **post-bootstrap**.
>
> ---
>
> ## 5. Políticas transversales
>
> - [`docs/politicas-transversales/desacoplamiento-componentes-contratos.md`](docs/politicas-transversales/desacoplamiento-componentes-contratos.md) — contract tests en fronteras al cambiar tecnología  
> - [`docs/politicas-transversales/revision-principios-solid.md`](docs/politicas-transversales/revision-principios-solid.md) — contract tests sobre puertos; UC-01.5 testeable de forma independiente  
> - [`docs/politicas-transversales/desambiguacion-implementacion.md`](docs/politicas-transversales/desambiguacion-implementacion.md) — menciona testing como práctica de `docs/implementacion/`
>
> ---
>
> ## 6. Protocolo de commits
>
> [`docs/planificacion/protocolo-commits.md`](docs/planificacion/protocolo-commits.md) — tipo **`test`** para commits que solo añaden/modifican pruebas.
>
> ---
>
> ## Lo que **no** existe (todavía)
>
> - Documento central «estrategia de testing» o «test plan» del proyecto  
> - Código de tests en `implementacion/` (bootstrap pendiente)  
> - Configuración Jest/Vitest/CI documentada más allá de recomendaciones en `analisis-inicial.md` §8  
>
> **Conclusión:** la política de tests está definida **por capa** en las guías 12b y **por ticket** en el backlog; las herramientas (Jest/Vitest, Testcontainers, MSW, supertest) están indicadas pero la implementación empieza con **T-001-12** (smoke test). Si quieres un índice único, habría que crearlo; hoy no está en el repo.
---

**Prompt 2** — *Agente: **Cursor***

- **Origen:** [`prompts/prompts 2026-06-14 19.13 Cursor.md`](prompts/prompts%202026-06-14%2019.13%20Cursor.md) — Intercambio 214
- **Timestamp:** 2026-06-14 14:16 UTC

**serpegon11710-byte dice:**

> Con la documentacion actual, ¿donde ubicarias los tests?

**Cursor dice:**

> La documentación **no fija rutas concretas** (`__tests__/`, `tests/`, etc.), pero sí delimita **capas, paquetes y tipos de test**. Con eso, la ubicación coherente sería:
>
> ## Principio rector
>
> Tests **dentro de cada paquete del monorepo**, siguiendo el árbol de [`implementacion/README.md`](implementacion/README.md), no en un `tests/` suelto en la raíz del repo (salvo orquestación).
>
> ```
> implementacion/
> ├── front-end/react-typescript/     ← tests UI
> ├── back-end/nestjs-typescript/     ← tests dominio, API
> ├── persistencia/typescript/        ← tests repos + BBDD real
> ├── shared/typescript/              ← tests contrato/tipos
> └── bbdd/postgresql/                ← tests migraciones/constraints
> ```
>
> El script `pnpm test` del bootstrap ([`backlog/001-bootstrap/README.md`](backlog/001-bootstrap/README.md)) ejecutaría los tests de **cada workspace**, no un único directorio central.
>
> ---
>
> ## Por capa (alineado con las guías 12b)
>
> ### Back-End — `implementacion/back-end/nestjs-typescript/`
>
> | Tipo doc | Dónde |
> |----------|--------|
> | Unitario dominio (ZC-1–3, RT-*) | Junto al código en `src/domain/**` — p. ej. `occurrence-query.service.spec.ts` |
> | Unitario aplicación (ZC-4) | Junto a `src/application/orchestrators/*.spec.ts` |
> | Integración API (supertest) | Carpeta aparte: `test/` o `test/integration/` (convención Nest) — controllers + pipes, persistencia **fake/mockeada** |
> | Contrato DTO↔JSON | `test/contract/` o snapshots que referencien tipos de `shared/` |
>
> La guía dice explícitamente: mocks de puertos, sin SQL ni UI. Los puertos viven en `src/domain/ports/`; los tests de dominio **no** importan `persistencia/`.
>
> ### Front-End — `implementacion/front-end/react-typescript/`
>
> | Tipo doc | Dónde |
> |----------|--------|
> | Componentes | Colocado: `src/components/**/*.test.tsx`, `src/features/**/*.test.tsx` |
> | Integración (MSW) | `src/test/` o `test/setup.ts` + mocks en `src/test/msw/` |
> | i18n / UTC | Tests junto a `src/i18n/` o `src/test/i18n/` |
>
> N4 ZC-6 apunta a React Testing Library en esos artefactos (`features/`, `components/`).
>
> ### Persistencia — `implementacion/persistencia/typescript/`
>
> | Tipo doc | Dónde |
> |----------|--------|
> | Integración repos (Testcontainers) | `test/integration/repositories/` — **aquí**, no en back-end |
> | Mappers / transacciones | `src/mappers/*.spec.ts`, `test/integration/transaction/` |
>
> N4 ZC-5: fixtures alineados a [`implementacion/bbdd/postgresql/seeds/`](implementacion/bbdd/postgresql/seeds/).
>
> ### Shared — `implementacion/shared/typescript/`
>
> | Tipo doc | Dónde |
> |----------|--------|
> | Tipos / compilación | El propio `tsc` del paquete |
> | Contrato DTO / códigos | `src/dto/*.spec.ts`, `src/errors/*.spec.ts` o `test/contract/` |
>
> Capa hoja: sin imports hacia back-end, persistencia ni front-end.
>
> ### BBDD — `implementacion/bbdd/postgresql/`
>
> | Tipo doc | Dónde |
> |----------|--------|
> | Migraciones up/down | `test/migrations/` o scripts en `scripts/` invocados desde el paquete bbdd |
> | Constraints / seeds | Tests que levanten PostgreSQL (Testcontainers) contra `migrations/` + `seeds/` |
>
> La guía BBDD dice: migraciones, constraints, seeds — **no** reglas RT ni API.
>
> ---
>
> ## Tests que cruzan capas
>
> | Escenario | Ubicación razonable |
> |-----------|---------------------|
> | **Smoke bootstrap** (T-001-12) | `test/smoke/` en back-end **o** script en raíz del monorepo que llame health + migraciones; el ticket no fija carpeta |
> | **E2E wizard** (T-004-04) | Lo natural en FE: `front-end/react-typescript/e2e/` (Playwright/Cypress) con API real o mock |
> | **Contract tests en frontera** | En el **consumidor** del contrato o en `shared/test/contract/` si validan DTOs compartidos ([`desacoplamiento-componentes-contratos.md`](docs/politicas-transversales/desacoplamiento-componentes-contratos.md)) |
>
> Evitar un paquete `implementacion/tests/` que mezcle capas: rompe el desacoplamiento documentado.
>
> ---
>
> ## Árbol propuesto (resumen)
>
> ```
> implementacion/
> ├── back-end/nestjs-typescript/
> │   ├── src/domain/.../*.spec.ts
> │   ├── src/application/.../*.spec.ts
> │   └── test/
> │       ├── integration/          # supertest + mocks
> │       └── contract/             # JSON ↔ shared DTOs
> ├── front-end/react-typescript/
> │   ├── src/features/**/**/*.test.tsx
> │   ├── src/test/                 # MSW, helpers
> │   └── e2e/                      # opcional, T-004
> ├── persistencia/typescript/
> │   ├── src/**/*.spec.ts          # mappers unitarios
> │   └── test/integration/         # Testcontainers + seeds
> ├── shared/typescript/
> │   └── src/**/*.spec.ts
> └── bbdd/postgresql/
>     └── test/                     # migraciones, constraints
> ```
>
> ---
>
> ## Lo que falta documentar
>
> No hay convención explícita de nombre (`*.spec.ts` vs `*.test.ts`) ni carpeta `test/` vs colocation. Eso lo fijará **T-001** al crear `package.json`, Jest/Vitest y el script `pnpm test`. Lo coherente con el stack elegido:
>
> - **NestJS / dominio TS** → `*.spec.ts` + carpeta `test/` para integración  
> - **Vite/React** → `*.test.tsx` + Vitest  
>
> Si quieres dejar esto escrito en el repo, encajaría una subsección «Estructura de tests» en [`implementacion/README.md`](implementacion/README.md) o en cada guía 12b — hoy no está.
---

**Prompt 3** — *Agente: **Cursor***

- **Origen:** [`prompts/prompts 2026-06-14 19.13 Cursor.md`](prompts/prompts%202026-06-14%2019.13%20Cursor.md) — Intercambio 113
- **Timestamp:** 2026-06-14 14:16 UTC

**serpegon11710-byte dice:**

> ¿Qué me puedes decir de los hallazgos encontrados en la validacion del STEP 13?

**Cursor dice:**

> Los hallazgos del Step 13 están en la sección 6 del informe [`validacion-documental-step13.md`](docs/planificacion/validacion-documental-step13.md). Son cuatro; ninguno bloquea el avance.
>
> ## Resumen general
>
> La validación **no encontró contradicciones** entre ER, entidades funcionales, pseudocódigo ZC y guías 12b. Los hallazgos son **deuda esperada** (lo que falta por hacer) o **observaciones menores** sin acción inmediata.
>
> ---
>
> ### H-1 — Código ejecutable aún no bootstrap (Esperado)
>
> Todavía no existe el andamiaje real: monorepo pnpm, NestJS, Vite/React, migraciones PostgreSQL ni DTOs en TypeScript bajo `implementacion/shared/typescript/`.
>
> Eso está documentado (contratos, árbol de carpetas, stack), pero **no compilado ni ejecutable**. Es el objetivo explícito del **Step 14**.
>
> ---
>
> ### H-2 — Tests de integración (Esperado)
>
> No hay tests automatizados de integración porque aún no hay código que probar. Las guías 12b definen convenciones de tests por componente, pero la implementación vendrá **después del bootstrap** y al abordar casos de uso concretos.
>
> ---
>
> ### H-3 — IDs FAQ legacy en el historial (Menor)
>
> En [`dudas-y-resoluciones.md`](docs/planificacion/dudas-y-resoluciones.md) el historial conserva referencias antiguas (p. ej. FAQ-103…116) de antes de la renumeración por grupos (FAQ-000…311).
>
> No es un error: es **trazabilidad histórica**. Los IDs activos están en los grupos FAQ-Gnn; no hace falta limpiar el historial.
>
> ---
>
> ### H-4 — `shared/` sin N4 documental (Menor)
>
> Front-end, back-end, persistencia y BBDD tienen N4 en Step 12a; **`shared/` no tiene carpeta N4 propia** en `docs/diagramas-c4/c4-nivel-4/implementacion/`.
>
> Es coherente con la decisión del proyecto: el contrato compartido vive en [`contratos-minimos.md`](docs/arquitectura/contratos-minimos.md) y la materialización en código será en Step 14 (`implementacion/shared/typescript/`), no en un diagrama N4 separado.
>
> ---
>
> ## Qué implica en la práctica
>
> | Hallazgo | ¿Bloquea Step 14? | Cuándo se resuelve |
> |----------|-------------------|-------------------|
> | H-1 | No — es el siguiente paso | Step 14 |
> | H-2 | No | Tras bootstrap + UC |
> | H-3 | No | Ninguna acción |
> | H-4 | No | Step 14 (código shared) |
>
> En conjunto, el informe concluye que la documentación está **aprobada para iniciar el bootstrap técnico** sin implementar reglas de negocio todavía.
>
> Si quieres profundizar en alguno (p. ej. qué incluiría exactamente el bootstrap de H-1 o cómo encaja `shared` en H-4), dímelo.
---

## 3. Modelo de datos

**Prompt 1** — *Agente: **Cursor***

- **Origen:** [`prompts/prompts 2026-06-14 19.13 Cursor.md`](prompts/prompts%202026-06-14%2019.13%20Cursor.md) — Intercambio 43
- **Timestamp:** 2026-06-14 14:16 UTC

**serpegon11710-byte dice:**

> General el Modelo ER como mermaid dentro de la carpeta entidades

**Cursor dice:**

> Revisando las entidades y los FAQs para generar el diagrama ER en Mermaid.
>
> Creando el modelo ER en `docs/entidades/` y actualizando referencias del Step 10.
>
> El **Step 10** quedó cerrado. Resumen:
>
> ## Entregable principal
>
> **`docs/entidades/modelo-entidad-relacion.md`** — diagrama Mermaid `erDiagram` con:
>
> | Tabla | Rol |
> |-------|-----|
> | `Proyectos` | Raíz del agregado |
> | `Items` | Pertenece a un proyecto |
> | `TipoPlanificacion` | Catálogo (`periodica` nullable = Sin planificar) |
> | `PlanificacionesPuntuales` | Puntual / Sin planificar (`sin_planificar`) |
> | `PlanificacionesPeriodicas` | Diario, semanal, mensual |
> | `PlanificacionesPeriodicasDiasSemana` | Días de la semana (semanal) |
> | `OcurrenciasMaterializadas` | Excepciones por fecha (`fecha_original`) |
>
> Incluye restricciones (UNIQUE, CHECK, FK) y la herencia de estado FAQ-004.
>
> ## Referencias actualizadas
>
> - `planificaciones.md`, `proyectos.md`, `items.md`, `ocurrencias.md` → enlace al ER
> - `planificacion-inicial.md` → Step 10 marcado como completado; ruta corregida a `docs/entidades/`
> - `internacionalizacion.md` → nota UTC alineada al ER
> - `dudas-y-resoluciones.md` → entregables Step 10 marcados como completados
>
> ## Próximo paso según el plan
>
> **Step 11** — definir stack tecnológico (FAQ-101, FAQ-102, FAQ-007).
>
> Si quieres, puedo generar también un `.mmd` separado solo con el diagrama, o avanzar con el Step 11.
---

**Prompt 2** — *Agente: **Cursor***

- **Origen:** [`prompts/prompts 2026-06-14 19.13 Cursor.md`](prompts/prompts%202026-06-14%2019.13%20Cursor.md) — Intercambio 55
- **Timestamp:** 2026-06-14 14:16 UTC

**serpegon11710-byte dice:**

> No me gusta el modelo de datos. Lo veo un tano rebuscado y no es facilmente escalable, al tener que duplicar los campos comunes en cada nueva espoecializacion. Vamos a simplificar un poco las cosas:
>
> * Lo que define a una planificación es:
>
> ** Pertenecer a un item especifico
> ** Tener una fecha de inicio y una fecha de fin
> ** Tener una hora
> ** Poder tener unas observaciones
> ** Poder estar completada
>
> Esta es la parte comun y se puede definir en la entidad Planificaciones. No obstante, esta entidad es abstracta y se debe especializar. Las especializaciones actuales son :
>
> * Planificacion sin_planificar: se caracteriza porque fecha inicio y fecha fin están vacías. Por lo tanto las observaciones son obligatorias. El estado completado siempre será vacío.
>
> * Planificacion puntual: se caracteriza porque fecha_inicio = fecha_fin. El estado completado será obligatorio. Solo tendrá una ocurrencia, que siempre será dinámica y reflejará los datos de la planificación.
>
> * Planificacion periodica: se caracteriza porque feha fin > fehca_inicio. El estado completado será obligatorio. También será una clase abstracta y tendrá una segunda especializacion por subtipo. Podrá tener una o varias ocurrencias, que podrán ser dinámicas o materializadas. Cada especialización por subtipo tendrá su propio algoritmo para generar las ocurrencias naturales.
>
> #####
>
> En cuanto al modelo de datos, puede haber una tabla especifica para los datos comunes de l aplanificacion. Las planificaciones Puntuales y Sin_planificar se pueden registrar en esta tabla. Para las periodocias, habrá una segunda tabla con la definicion dde PlanificacionPeriodo (relacion 1:1, pudiendo estar vacía en el lado del periodo)
>
> No se necesitan flags especificos, ya que se considera:
> *  sin_planificar sin las fehcas están a NULL 
> * puntual si fecha_inicio tiene valor y el id del periodo está vacío.
> * periodica el id del periodo tiene valor. El tipo usable de la planificacion vendrá definido en el priodo
>
> #####
>
> En cuanto a las ocurrencias:
>
> * Las planificaciones sin plannificar devolverán una lista vacia
> * Las planificaciones puntuales devolverán una lista dinámuica de un solo elemento, que reflejará los datos de la planificacion
> * Las planificaciones periodicas devolverán un listado de una o varias ocurrencias, que podrán ser dinámicas o estar materializadas (teniendo en cuenta que se pueden materializar los borrados de ocurrencias dinamicas)
> ** Restriciones periodicas:
> *** La definicion del periodo debe garantizar que se genere al menos una ocurrencia dinamica
> *** No se podrá modificar la fecha de una ocurrenia si ésta queda fuera de las fechas de la planiicacion
> *** Si se modifican las fechas de la planificacion, podrán existir ocurrencias materializadas fuera de fecha, pero no serán visibles ni recuperables. Habrá que garantizar que exista al menos una ocurrencia (dinaica o materializada, teniendo en cuenta las que se registran como borradas)
> *** Si una ocurrencia modificada tiene su fecha_origen fuera de rango, pero la efectiva en rango, se considera ocurrencia válida y visible
>
> En el modelo de datos: 
>
> * item se relacionará 1:n con planificaciones
> * planificaciones tiene un agregado 1:1 con PlanificacionPeriodo (opcional en el lado del periodo)
> * PlanificacionPeriodo se relacionará 1:n con ocurrenciasMaterializadas (opcional en el ldo de las ocurrencias)

**Cursor dice:**

> Refactorizando el modelo de datos según tu propuesta: revisaré la documentación actual y la actualizaré de forma coherente.
>
> He refactorizado la documentación según tu modelo simplificado. Resumen:
>
> ## Nuevo modelo
>
> **Una tabla `Planificaciones`** con lo común:
> - `item_id`, `fecha_inicio`, `fecha_fin`, `hora`, `observaciones`, `estado`
>
> **Naturaleza inferida** (sin flags):
>
> | Naturaleza | Criterio |
> |------------|----------|
> | Sin planificar | `fecha_inicio` y `fecha_fin` NULL; `estado` NULL; observaciones obligatorias |
> | Puntual | Fechas con valor, `fecha_inicio = fecha_fin`, sin fila en periodo |
> | Periódica | Existe `PlanificacionPeriodo`, `fecha_fin > fecha_inicio` |
>
> **`PlanificacionPeriodo`** (1:1, solo periódicas): subtipo (`Diario`/`Semanal`/`Mensual`) y campos de patrón (`dias_semana` LMXJVSD, etc.). `TipoPlanificacion` queda solo para subtipos periódicos.
>
> **Ocurrencias:**
> - Sin planificar → lista vacía
> - Puntual → una dinámica (UC-02.2 muta `Planificaciones`)
> - Periódica → dinámicas + `OcurrenciasMaterializadas` (FK `planificacion_periodo_id`)
>
> Incluidas las restricciones RO-8 a RO-10 (rango, visibilidad tras cambio de fechas, `fecha_original` fuera / `fecha_efectiva` dentro).
>
> ## Eliminado
>
> - `PlanificacionesPuntuales` / `PlanificacionesPeriodicas`
> - `V_Planificacion`
> - Flag `sin_planificar`
> - Duplicación de campos comunes por especialización
>
> ## Archivos actualizados
>
> - `modelo-entidad-relacion.md` + `.mmd`
> - `planificaciones.md`, `ocurrencias.md`
> - `dudas-y-resoluciones.md` → **FAQ-110** (FAQ-105 y FAQ-109 marcadas como superseded)
> - Pseudocódigo ZC-1, ZC-2, ZC-3, ZC-5
> - UC-03, UC-01.4, `items.md`, `proyectos.md`, `planificacion-inicial.md`
>
> Los cambios de naturaleza (RT-*) ahora son **UPDATE** en la misma fila + crear/eliminar `PlanificacionPeriodo`, sin cambiar de tabla.
>
> Si quieres afinar algo (por ejemplo renombrar `estado` a `completada` booleano, o recuperar `anulada` para historial de transiciones), lo vemos en una siguiente pasada.
---

**Prompt 3** — *Agente: **Copilot***

- **Origen:** [`prompts/prompts 2026-06-10 16.50 GitHub Copilot.md`](prompts/prompts%202026-06-10%2016.50%20GitHub%20Copilot.md) — Intercambio 32
- **Timestamp:** 2026-06-10 11:38 UTC

**serpegon11710-byte dice:**

> Casos puntuales:
>
>
>
> Las planificaciones puntuales tienen una unica ocurrencia, que coincide con la planificación. Es decir, modificar la ocurrencia significa modificar la planificación directamente.
>
>
>
> Las planificaciones de tipo "No planificado" no tienen ocurrencias

**Copilot dice:**

> Perfecto, voy a incorporar esos dos casos como reglas explícitas en la entidad de ocurrencias y revisar si hace falta alinear también la entidad de planificaciones para mantener consistencia.Voy a incorporar estos casos como reglas explícitas en entidades/ocurrencias y ajustar entidades/planificaciones para evitar contradicción con RC-3.Cambios aplicados. Voy a validar rápidamente que no haya inconsistencias y que los dos nuevos casos puntuales queden claros en el documento de ocurrencias.Perfecto, ya quedaron incorporados esos casos.
>
> Cambios aplicados:
>
> 1. Regla para planificaciones puntuales
> - En  añadí en “Casos por Tipo de Planificación”:
>   - La puntual tiene una única ocurrencia.
>   - Esa ocurrencia coincide con la planificación base.
>   - Modificar la ocurrencia implica modificar la planificación directamente.
>
> 2. Regla para “No planificado”
> - En :
>   - Las planificaciones “No planificado” no generan ocurrencias.
>
> 3. Ajuste de consistencia en RC-3
> - En :
>   - RC-3 ahora aclara que “al menos una ocurrencia” aplica a tipos que sí generan ocurrencias (Puntual y Periódica), evitando contradicción con “No planificado”.
>
> Validación:
> - Sin errores en ambos documentos.
---

## 4. Especificación de la API

**Prompt 1** — *Agente: **Cursor***

- **Origen:** [`prompts/prompts 2026-06-14 19.13 Cursor.md`](prompts/prompts%202026-06-14%2019.13%20Cursor.md) — Intercambio 116
- **Timestamp:** 2026-06-14 14:16 UTC

**serpegon11710-byte dice:**

> Quiero un plan con las siguientes tareas:
>
> 1 - Corregir FAQ legacy: Reescribir el historial post-renumeración: cada fila con ID vigente + enlace al ancla (FAQ-300, etc.).
>
> 2 - Crear N4 minimo para el componente shared: Mapear DTOs/códigos desde contratos-minimos (sin pseudocódigo ZC). Alinea shared con el patrón de los otros componentes.
>
> 3 - Volver a ejecutar el STEP 13

**Cursor dice:**

> Revisando el historial FAQ, el patrón N4 existente y `contratos-minimos` para elaborar un plan preciso.
>
> Teniendo el mapa de migración FAQ y el patrón N4, elaboro el plan con tres commits según el protocolo del proyecto.
---

**Prompt 2** — *Agente: **Cursor***

- **Origen:** [`prompts/prompts 2026-06-14 19.13 Cursor.md`](prompts/prompts%202026-06-14%2019.13%20Cursor.md) — Intercambio 117
- **Timestamp:** 2026-06-14 14:16 UTC

**serpegon11710-byte dice:**

> Antes de ejecutar el plan, hay que desmarcar el STEP como completado. Pues no lo está. (No realices commit tras esta acción)
>
> A continuación, ejecutra el plan@c:\Users\serpe\.cursor\plans\step_13_post-correcciones_999c4e09.plan.md

**Cursor dice:**

> Desmarcando el Step 13 como completado y, a continuación, ejecutando el plan completo.
>
> Desmarcando el Step 13 en todos los documentos de planificación; después ejecuto el plan.
>
> Implementando la Tarea 1: reescribir el historial FAQ.
>
> Actualizando el informe de validación y cerrando de nuevo el Step 13.
>
> Plan ejecutado. Resumen:
>
> ## Pre-acción (sin commit)
>
> Step 13 desmarcado temporalmente en plan, FAQ, arquitectura, stack, informe y vista-general.
>
> ## Tarea 1 — FAQ legacy
>
> - Mapa legacy → vigente antes del historial en [`dudas-y-resoluciones.md`](docs/planificacion/dudas-y-resoluciones.md)
> - Historial reescrito con IDs vigentes y enlaces ancla
> - Corregidos FAQ-005→FAQ-004 (Step 7b) y FAQ-007→FAQ-100/101/102 (Step 11)
> - **Commit:** `b7cf1eb`
>
> ## Tarea 2 — N4 shared
>
> - Nuevo [`shared/typescript/README.md`](docs/diagramas-c4/c4-nivel-4/implementacion/shared/typescript/README.md)
> - Nuevo [`contratos-api-dtos.md`](docs/diagramas-c4/c4-nivel-4/implementacion/shared/typescript/contratos-api-dtos.md) (DTOs, códigos, payload RE-5)
> - Índices actualizados: N4 README, `docs/implementacion/`, guía shared, FAQ-102, desambiguación
> - **Commit:** `6a6c784`
>
> ## Tarea 3 — Re-validación Step 13
>
> - Informe actualizado: H-3 y H-4 resueltos; matriz y cobertura N4 incluyen shared
> - Step 13 cerrado de nuevo en plan, FAQ, vista-general y stack
> - **Commit:** `c18708e`
>
> ## Estado final
>
> | Hallazgo | Estado |
> |----------|--------|
> | H-3 FAQ legacy | Resuelto |
> | H-4 N4 shared | Resuelto |
> | H-1 bootstrap | Pendiente → Step 14 |
> | H-2 tests | Pendiente → post-bootstrap |
>
> **Steps cerrados:** 1–13. **Pendiente:** Step 14.
>
> Rama `docs/implementacion`: 15 commits por delante de origin (sin push). ¿Procedo con el Step 14?
---

**Prompt 3** — *Agente: **Cursor***

- **Origen:** [`prompts/prompts 2026-06-14 19.13 Cursor.md`](prompts/prompts%202026-06-14%2019.13%20Cursor.md) — Intercambio 2
- **Timestamp:** 2026-06-14 14:16 UTC

**serpegon11710-byte dice:**

> Siguiente paso: Definir politicas de errores y validaciones por capa. @docs/arquitectura/README.md @docs

**Cursor dice:**

> Revisando la arquitectura existente y la documentación del dominio para definir políticas de errores y validaciones por capa de forma coherente.
>
> Creando el documento de políticas de errores y validaciones, alineado con los contratos y las reglas del dominio.
>
> Listo. Quedó definido el paso de **políticas de errores y validaciones por capa**.
>
> ## Nuevo documento
>
> `docs/arquitectura/errores-validaciones-capas.md` — incluye:
>
> 1. **Modelo de error estándar** — `codigo`, `mensaje`, `campo` opcional; alineado con los contratos mínimos (sin detalle técnico hacia fuera).
>
> 2. **Taxonomía** — validación de formato, entrada, negocio, integridad, no encontrado, conflicto de estado, cancelación e infraestructura.
>
> 3. **Responsabilidades por capa**:
>    - **Presentación** — UC-01.5, formularios, feedback inmediato.
>    - **API** — validación de DTOs e inputs.
>    - **Aplicación** — orquestación, traducción de errores, `ERROR_INTERNO`.
>    - **Negocio** — reglas RN-*, RC-*, RT-*, RO-* como autoridad final.
>    - **Persistencia** — solo constraints técnicos, mapeados hacia arriba.
>
> 4. **Catálogo de códigos** — 15 códigos trazables a reglas existentes (duplicados de nombre, último item/planificación, cambios de tipo, rango temporal, etc.).
>
> 5. **Flujo de propagación** — diagrama Mermaid y regla de duplicidad aceptada (Presentación mejora UX; Negocio decide).
>
> ## Actualizaciones
>
> - `docs/arquitectura/README.md` — paso marcado como completado; enlace al nuevo fichero.
> - `docs/planificacion/planificacion-inicial.md` — fichero añadido a la tabla y al Step 9; entrada en historial.
> - Fase 4 sigue **sin cerrarse** (queda pendiente el stack tecnológico).
>
> ## Estado de arquitectura
>
> | Paso | Estado |
> |------|--------|
> | Contratos mínimos | ✓ |
> | Granularidad de módulos | ✓ |
> | Transacciones y consistencia | ✓ |
> | Errores y validaciones por capa | ✓ |
> | Criterios de stack | Pendiente (cierre de Fase 4) |
>
> ¿Avanzamos con el último paso: **criterios para selección de stack tecnológico**?
---

## 5. Historias de usuario

**Prompt 1** — *Agente: **Copilot***

- **Origen:** [`prompts/prompts 2026-06-10 16.50 GitHub Copilot.md`](prompts/prompts%202026-06-10%2016.50%20GitHub%20Copilot.md) — Intercambio 16
- **Timestamp:** 2026-06-10 08:43 UTC

**serpegon11710-byte dice:**

> A ver. neceito que la documentacion quede bien definida:
>
>
>
> UC1.1 --> Es un Wizard que solicita todos los datos: Proyectyo, Item y Planificacion para generarlo todo con la informacion facilitada por el usuario. Comparto flujo con UC1.4 por una razón muy sencilla: si se cambia algo en la especificacion deol flujo de la planificacion, se queda automaticamente reflejado en UC1.1
>
>
>
> UC1.2 --> Sólo solicita los datos del proyecto. Al crear, genera item y planificacion autoamtica (pero no pasa por dichos flujos)
>
>
>
> UC1.3 --> Sólo solicita los datos del item. Al crear, genera planificacion autoamtica (pero no pasa por dicho flujo)
>
>
>
> UC1.4 --> Este flujo es tan complejo que requiere ser reutilizado. Por eso se referencia desde UC1.1

**Copilot dice:**

> Entiendo perfectamente. Necesito corregir la documentación para que quede claro:
>
> - **UC-1.1**: Incluye UC-1.4 (pasa por el flujo completo de planificación)
> - **UC-1.2**: NO incluye UC-1.3 (crea item+planificación automáticamente sin pasar por flujos)
> - **UC-1.3**: NO incluye UC-1.4 (crea planificación automáticamente sin pasar por flujo)
> - **UC-1.4**: Es reutilizable desde UC-1.1
>
> Voy a corregir los archivos:
---

**Prompt 2** — *Agente: **Copilot***

- **Origen:** [`prompts/prompts 2026-06-10 16.50 GitHub Copilot.md`](prompts/prompts%202026-06-10%2016.50%20GitHub%20Copilot.md) — Intercambio 36
- **Timestamp:** 2026-06-10 12:30 UTC

**serpegon11710-byte dice:**

> Genial! Ahora vamos a comenzar a definir UC-02.
>
>
>
> Lo primero es un cambio de especificacion: "Gestión de ocurrencias" Asegurate que el nombre del documento sea coherente y que se actualice allá donde se referencie.
>
>
>
> La gestion de ocurrencias tiene 3 cuscasos principales:
>
>
>
> UC-02.1 --> "Visualización de ocurrencias" (esto hace referencia a la funcionalidad de "Visualizar calendario"): El usuario selecciona un rango de fechas y se devuelven todas las ocurrencias que existen en ese rango.
>
>
>
> UC-02-2 --> "Gestion individual de ocurrencias". Esto es para modificar una ocurrencia. Si es una ocurrencia dinámica, se guardará físcamenbte en la BBDD
>
>
>
> UC-02.3 --> "Gestión ocurrencias por planificación" Permite visualizar las ocurrencias físicas registradas para una planificación, distinguiendo entre las modificadas (se pueden volver a modificar o anular) y eliminadas (permite unicamente restaurar la ocurrencia a su valor por defecto, es decir recuperar la ocurrencia dinámica para esa fecha)
>
>
>
> Define los cuatro UC-02* con su Diagrama de Casos UML en UC-02 y algun diagrama mermaid en los otros UC

**Copilot dice:**

> Voy a crear/ajustar la familia UC-02 completa (documento principal + 3 subcasos) y renombrar “Visualizar calendario” a “Gestión de ocurrencias”, actualizando todas las referencias que existan.
---

**Prompt 3** — *Agente: **Copilot***

- **Origen:** [`prompts/prompts 2026-06-10 16.50 GitHub Copilot.md`](prompts/prompts%202026-06-10%2016.50%20GitHub%20Copilot.md) — Intercambio 17
- **Timestamp:** 2026-06-10 08:52 UTC

**serpegon11710-byte dice:**

> El flujo en UC1.1 no es correcto. El Wizard no debe crear nada hasta el final. Esto permite que el usuario pueda cancelar la operacion sin crear nada. O se crea todo o no se crea nada.
>
>
>
> En el paso 14 del flujo de UC1.1, el sistema no pregunta, directamente redirige al flujpo de UC1.4
>
>
>
> En el paso 15 se crea los 3 elementos
>
>
>
> En el flujo de UC1.4 se necesita una variación:
>
> * Si el proyecto existe, se crea la planificación
>
> * Si el proyecto no está definido,. se devuelve el flujo al invocador con los datos de la planificacion

**Copilot dice:**

> Entiendo perfectamente. El wizard debe ser **atómico**: o se crea todo al final o no se crea nada. Voy a corregir los flujos:
---

## 6. Tickets de trabajo

**Prompt 1** — *Agente: **Cursor***

- **Origen:** [`prompts/prompts 2026-06-14 19.13 Cursor.md`](prompts/prompts%202026-06-14%2019.13%20Cursor.md) — Intercambio 118
- **Timestamp:** 2026-06-14 14:16 UTC

**serpegon11710-byte dice:**

> Antes de proceder con el bootstrap necesito documentar los primeros tickets de trabajo. ¿Qué me sugieres? ¿Dónde los documento?

**Cursor dice:**

> Revisando cómo está organizada la planificación y si ya existe convención para tickets o trabajo pendiente.
>
> Hoy **no hay convención de tickets** en el repo: existe plan por fases (`docs/planificacion/`), FAQ de diseño, casos de uso y guías de implementación, pero no carpeta de backlog ni plantilla de tareas. Tiene sentido crearla **antes** del Step 14.
>
> ## Dónde documentarlos
>
> **Recomendación:** `docs/planificacion/backlog/`
>
> Encaja con lo que ya tienes:
>
> | Documento | Rol |
> |-----------|-----|
> | [`planificacion-inicial.md`](docs/planificacion/planificacion-inicial.md) | Fases y steps (14 = bootstrap) |
> | [`vista-general.md`](docs/planificacion/vista-general.md) §5 | Alcance del bootstrap |
> | [`dudas-y-resoluciones.md`](docs/planificacion/dudas-y-resoluciones.md) | Decisiones de diseño (no tareas) |
> | **`docs/planificacion/backlog/`** | **Tickets ejecutables** (nuevo) |
>
> Estructura sugerida:
>
> ```
> docs/planificacion/backlog/
> ├── README.md              # Índice, estados, convención de IDs
> ├── epica-014-bootstrap.md # Epica Step 14 (opcional, 1 fichero)
> └── T-014-01-monorepo-pnpm.md
> └── T-014-02-shared-package.md
> └── ...
> ```
>
> **Por qué ahí y no en otro sitio:**
>
> - **`docs/implementacion/`** → convenciones agnósticas, no gestión de trabajo.
> - **FAQ** → decisiones, no “hacer migraciones”.
> - **Issues de GitHub** → útiles para asignación y CI, pero tu documentación vive en `docs/`; lo ideal es **docs como fuente de verdad** y, si quieres, issues que enlacen al markdown.
>
> Enlaza el backlog desde [`planificacion-inicial.md`](docs/planificacion/planificacion-inicial.md) (Step 14) y desde [`implementacion/README.md`](implementacion/README.md).
>
> ---
>
> ## Convención de IDs
>
> Propongo algo alineado con steps y componentes:
>
> | Prefijo | Significado | Ejemplo |
> |---------|-------------|---------|
> | `T-014-xx` | Ticket del Step 14 (bootstrap) | `T-014-03` |
> | `T-015-xx` | Post-bootstrap / primer UC | `T-015-01` (UC-01.2) |
>
> Estados: `pendiente` | `en curso` | `hecho` | `bloqueado`.
>
> Cada ticket debería tener:
>
> 1. **Objetivo** (1 frase)
> 2. **Componente** (shared, bbdd, persistencia, back-end, front-end, raíz)
> 3. **Alcance incluido / excluido** (crítico para no mezclar bootstrap con negocio)
> 4. **Criterios de aceptación** (comprobables)
> 5. **Referencias** (N4 12a, guía 12b, ER, contratos)
> 6. **Dependencias** (otros tickets)
>
> El [`protocolo_TODOs.md`](docs/planificacion/protocolo_TODOs.md) puede seguir aplicando **un commit por ticket** cuando lo ejecutes.
>
> ---
>
> ## Qué tickets sugiero para el bootstrap (Step 14)
>
> Basado en [`vista-general.md`](docs/planificacion/vista-general.md) §5 y el árbol de [`implementacion/README.md`](implementacion/README.md):
>
> ### Ola 1 — Infraestructura transversal
>
> | ID | Ticket | Criterio mínimo de cierre |
> |----|--------|---------------------------|
> | **T-014-01** | Monorepo pnpm | `pnpm install` en raíz; workspaces apuntando a FE/BE/shared/persistencia |
> | **T-014-02** | Paquete `shared` compilable | `dto/`, `errors/error-codes.ts` según N4 [`contratos-api-dtos.md`](docs/diagramas-c4/c4-nivel-4/implementacion/shared/typescript/contratos-api-dtos.md); **sin lógica de negocio** |
> | **T-014-03** | BBDD: migraciones ER v1 | DDL alineado a [`modelo-entidad-relacion.md`](docs/entidades/modelo-entidad-relacion.md); script migrate up/down |
> | **T-014-04** | BBDD: seed `TipoPeriodo` | Catálogo mínimo según ER / [`planificaciones.md`](docs/entidades/planificaciones.md) |
>
> ### Ola 2 — Capas backend
>
> | ID | Ticket | Criterio mínimo de cierre |
> |----|--------|---------------------------|
> | **T-014-05** | Persistencia: conexión + puerto | `DatabaseConnectionPort` + adaptador `pg`; health de conexión |
> | **T-014-06** | Persistencia: repos stub | Implementaciones vacías o CRUD mínimo sin reglas RT/RO |
> | **T-014-07** | Back-end Nest bootstrap | App arranca; `GET /health` (o similar); Swagger opcional |
> | **T-014-08** | Wiring DI Nest | Puertos registrados; módulos vacíos según N4 BE (Proyecto, Item, …) |
>
> ### Ola 3 — Front y cierre bootstrap
>
> | ID | Ticket | Criterio mínimo de cierre |
> |----|--------|---------------------------|
> | **T-014-09** | Front-end Vite bootstrap | App arranca; routing shell; proxy API dev |
> | **T-014-10** | i18n skeleton FE | `error.<CODIGO>` alineado a shared; sin pantallas de negocio |
> | **T-014-11** | Scripts dev integrados | `pnpm dev` levanta BE + FE + DB (docker-compose si aplica) |
> | **T-014-12** | Smoke test bootstrap | Checklist: clonar → install → migrate → dev → health OK |
>
> **Explícitamente fuera** de T-014-xx (tickets posteriores, p. ej. `T-015-xx`):
>
> - Wizard UC-01.1, calendario UC-02.1, reglas RT/RO, materialización ZC-2, etc.
>
> ---
>
> ## Orden de dependencias (resumen)
>
> ```mermaid
> flowchart TD
>   T01[T-014-01 Monorepo]
>   T02[T-014-02 Shared]
>   T03[T-014-03 Migraciones]
>   T04[T-014-04 Seeds]
>   T05[T-014-05 Persistencia conexion]
>   T06[T-014-06 Repos stub]
>   T07[T-014-07 Nest bootstrap]
>   T08[T-014-08 DI wiring]
>   T09[T-014-09 Vite bootstrap]
>   T10[T-014-10 i18n skeleton]
>   T11[T-014-11 Scripts dev]
>   T12[T-014-12 Smoke test]
>
>   T01 --> T02
>   T01 --> T03
>   T03 --> T04
>   T01 --> T05
>   T03 --> T05
>   T02 --> T06
>   T05 --> T06
>   T01 --> T07
>   T02 --> T07
>   T06 --> T08
>   T07 --> T08
>   T01 --> T09
>   T02 --> T09
>   T08 --> T11
>   T09 --> T11
>   T04 --> T11
>   T11 --> T12
> ```
>
> ---
>
> ## Próxima ola (no bootstrap, pero conviene nombrarla)
>
> En el mismo `README.md` del backlog, una sección **«Fase post-bootstrap (T-015+)»** sin detallar aún:
>
> - UC-01.2 Proyecto → ZC-4, ZC-5  
> - UC-01.3 Item  
> - UC-02.1 Calendario → ZC-1, ZC-6  
> - …
>
> Así el equipo ve el horizonte sin mezclarlo con el Step 14.
>
> ---
>
> ## Resumen práctico
>
> 1. **Dónde:** `docs/planificacion/backlog/` + `README.md` índice.  
> 2. **Cuántos primeros tickets:** 12 para bootstrap (T-014-01 … T-014-12).  
> 3. **Regla de oro:** cada ticket debe decir qué **no** implementa (negocio).  
> 4. **Trazabilidad:** enlazar siempre a N4/guía/ER del componente.  
> 5. **Ejecución:** un ticket ≈ un commit (como en `protocolo_TODOs.md`).
>
> Si quieres que cree la carpeta, la plantilla y los 12 tickets en markdown, cambia a **Agent mode** y lo implemento.
---

**Prompt 2** — *Agente: **Cursor***

- **Origen:** [`prompts/prompts 2026-06-14 19.13 Cursor.md`](prompts/prompts%202026-06-14%2019.13%20Cursor.md) — Intercambio 119
- **Timestamp:** 2026-06-14 14:16 UTC

**serpegon11710-byte dice:**

> Lo correcto sería crear la carpeta backlog en la raiz.
> Dentro de backlog moveriamos la carpeta planificion como Ticket 000 - planificacion-inicial
> Habría que crear un README.md dentro de backlog con los tickets
>
> vista-general.md y dudas-y-resoluciones, ¿tendría sentido dejarlos en la raiz de backlog, como algo comun?

**Cursor dice:**

> Revisando qué referencia hoy `docs/planificacion/` para valorar tu propuesta con criterio.
>
> Tu intuición encaja con separar **gestión del trabajo** (`backlog/`) de **documentación de producto** (`docs/`). Solo conviene afinar qué va en la raíz del backlog y qué va dentro del ticket 000.
>
> ## Estructura que propongo (alineada a tu idea)
>
> ```
> backlog/
> ├── README.md                      # Índice de tickets, estados, convención T-xxx
> ├── vista-general.md               # Transversal — sí, en raíz
> ├── dudas-y-resoluciones.md        # Transversal — sí, en raíz
> ├── protocolo_TODOs.md             # Transversal — también en raíz (común a todos los tickets)
> │
> ├── 000-planificacion-inicial/     # Épica cerrada (ex docs/planificacion “ejecutable”)
> │   ├── README.md                  # Resumen épica: steps 1–13, entregables, estado
> │   ├── planificacion-inicial.md
> │   └── validacion-documental-step13.md
> │
> └── 014-bootstrap/                 # Épica Step 14 (próxima)
>     ├── README.md
>     ├── T-014-01-monorepo-pnpm.md
>     └── ...
> ```
>
> Usar **`000-planificacion-inicial`** (sin espacios, prefijo numérico) facilita ordenación y enlaces.
>
> ---
>
> ## ¿Tiene sentido `vista-general` y FAQ en la raíz del backlog?
>
> **Sí, con un matiz importante:** no son tickets, son **referencia transversal de ejecución**.
>
> | Fichero | Rol | ¿Raíz de `backlog/`? |
> |---------|-----|----------------------|
> | `vista-general.md` | Capas, contratos, bootstrap, checklist | **Sí** — lo consultan todos los tickets |
> | `dudas-y-resoluciones.md` | Decisiones de diseño (FAQ) | **Sí** — afecta implementación y tickets |
> | `protocolo_TODOs.md` | Reglas de commits por ticket | **Sí** — común al flujo de trabajo |
> | `planificacion-inicial.md` | Plan por fases (histórico/epic 000) | **No** — va dentro de `000-planificacion-inicial/` |
> | `validacion-documental-step13.md` | Entregable del step 13 | **No** — va dentro de `000-planificacion-inicial/` |
>
> En el `README.md` de `backlog/` conviene una sección explícita:
>
> - **Referencia común** (leer antes de cualquier ticket): vista-general, FAQ, protocolo.
> - **Épicas / tickets**: carpetas numeradas.
>
> Así evitas que alguien interprete la FAQ como “ticket 001”.
>
> ---
>
> ## Por qué `backlog/` en la raíz (y no bajo `docs/`)
>
> Tiene sentido si defines:
>
> | Carpeta | Contenido |
> |---------|-----------|
> | `docs/` | Dominio, arquitectura, C4, entidades, casos de uso — **qué es el producto** |
> | `backlog/` | Plan de trabajo, tickets, decisiones de ejecución — **cómo avanzamos** |
> | `implementacion/` | Código |
>
> Es coherente con el paso que das: la fase documental (000) cierra y entras en fase de **tickets ejecutables** (014+).
>
> **Coste:** hay muchas referencias a `docs/planificacion/` en el repo (README raíz, entidades, arquitectura, guías, etc.). Al mover, habrá que actualizar enlaces o dejar un `docs/planificacion/README.md` mínimo con redirección durante la transición.
>
> ---
>
> ## Qué meter en `backlog/README.md`
>
> 1. **Referencia común** (enlaces a vista-general, FAQ, protocolo).
> 2. **Tabla de épicas:**
>
>    | ID | Carpeta | Estado | Descripción |
>    |----|---------|--------|-------------|
>    | 000 | `000-planificacion-inicial/` | Cerrada | Documentación steps 1–13 |
>    | 014 | `014-bootstrap/` | Pendiente | Andamiaje monorepo |
>    | 015+ | (futuro) | — | UC / negocio |
>
> 3. **Convención de IDs:** `T-014-xx`, estados, criterios de cierre.
> 4. **Relación con steps** del plan original (000 = steps 1–13, 014 = step 14).
>
> ---
>
> ## Alternativa si el nombre `backlog/` te resulta estrecho
>
> Si más adelante metes documentación que no sea “trabajo pendiente”, la raíz podría llamarse `gestion/` o `proyecto/` y dentro `backlog/` solo tickets. Con tu enfoque actual (pocos ficheros comunes), **`backlog/` en raíz con vista-general + FAQ arriba es válido**.
>
> ---
>
> ## Resumen
>
> - **Carpeta `backlog/` en raíz:** sí, coherente con el siguiente paso.
> - **`000-planificacion-inicial/`:** sí, para plan + validación step 13.
> - **`vista-general.md` y `dudas-y-resoluciones.md` en raíz de backlog:** **sí**, como referencia común (no como tickets).
> - **`protocolo_TODOs.md`:** también en raíz.
> - **`docs/planificacion/`:** desaparece o queda solo como índice de redirección.
>
> Si quieres que haga el movimiento, actualice enlaces y cree `backlog/README.md` + estructura 014, cambia a **Agent mode**.
---

**Prompt 3** — *Agente: **Cursor***

- **Origen:** [`prompts/prompts 2026-06-14 19.13 Cursor.md`](prompts/prompts%202026-06-14%2019.13%20Cursor.md) — Intercambio 120
- **Timestamp:** 2026-06-14 14:16 UTC

**serpegon11710-byte dice:**

> Faltaría documentar un protocolo de trabajo por tickets antes de implementar nada. ¿Dónde podríamos ubicar esa informacion?

**Cursor dice:**

> Encaja en la misma capa que ya estás definiendo: **`backlog/` como “cómo trabajamos”**, separado de **`docs/` como “qué construimos”**.
>
> ## Ubicación recomendada
>
> ```
> backlog/
> ├── README.md                    # Índice de épicas/tickets (no el protocolo completo)
> ├── protocolo-trabajo-tickets.md # ← AQUÍ (documento principal)
> ├── protocolo_TODOs.md           # Reglas de commits (sub-protocolo)
> ├── vista-general.md
> ├── dudas-y-resoluciones.md
> ├── 000-planificacion-inicial/
> └── 014-bootstrap/
> ```
>
> **Por qué ahí:**
>
> | Ubicación | Veredicto |
> |-----------|-----------|
> | **`backlog/protocolo-trabajo-tickets.md`** | Mejor opción: protocolo operativo junto a tickets y épicas |
> | Solo en `backlog/README.md` | Se vuelve largo y mezcla índice con normas |
> | `docs/planificacion/` | Ya no encaja si `backlog/` es la gestión del trabajo |
> | Dentro de cada ticket | Duplicación; cada ticket solo enlaza al protocolo |
>
> ---
>
> ## Relación con lo que ya tienes
>
> Hoy existe [`protocolo_TODOs.md`](docs/planificacion/protocolo_TODOs.md), que cubre **solo commits** (un commit por TODO/ticket). No sustituye un protocolo de tickets completo.
>
> Propuesta de roles:
>
> | Documento | Alcance |
> |-----------|---------|
> | **`protocolo-trabajo-tickets.md`** | Ciclo de vida del ticket: crear, priorizar, ejecutar, cerrar, trazabilidad |
> | **`protocolo_TODOs.md`** | Regla de commits al ejecutar un ticket (sección 6 o anexo del protocolo principal) |
> | **`README.md`** | Índice + enlace “Leer primero: protocolo-trabajo-tickets.md” |
> | **`vista-general.md`** | Contexto técnico (capas, contratos, bootstrap) |
> | **`dudas-y-resoluciones.md`** | Decisiones de diseño (cuándo abrir FAQ vs cerrar ticket) |
>
> En la práctica: **`protocolo-trabajo-tickets.md` es el marco; `protocolo_TODOs.md` es una regla concreta dentro de él.**
>
> ---
>
> ## Qué debería contener el protocolo (antes de implementar)
>
> 1. **Cuándo crear un ticket** (épica vs ticket hijo; bootstrap vs UC).
> 2. **Convención de IDs** (`000`, `014`, `T-014-01`, estados).
> 3. **Plantilla mínima** de ticket (objetivo, alcance in/out, criterios de aceptación, refs N4/UC/ER, dependencias).
> 4. **Flujo de trabajo:** elegir ticket → rama (si aplica) → implementar → commit según `protocolo_TODOs` → marcar hecho → actualizar README de épica.
> 5. **Qué actualizar al cerrar:** ticket, README épica, FAQ solo si hay decisión nueva.
> 6. **Qué no va en un ticket:** reglas de negocio no acordadas, cambios de ER sin FAQ.
> 7. **Orden de lectura obligatoria** antes del primer ticket de código: vista-general §6, guía 12b del componente, N4 12a.
>
> ---
>
> ## Punto de entrada en el repo
>
> En el [`README.md`](README.md) raíz del proyecto, algo como:
>
> - Documentación de producto → `docs/`
> - Trabajo y tickets → `backlog/` → empezar por `protocolo-trabajo-tickets.md`
>
> Así un integrante nuevo sabe: **producto en `docs/`, proceso en `backlog/`.**
>
> ---
>
> ## Resumen
>
> Ubica el protocolo en **`backlog/protocolo-trabajo-tickets.md`**, con **`protocolo_TODOs.md` como anexo de commits** y **`README.md` del backlog como índice** que lo enlaza en primer lugar. Es coherente con mover planificación a `000-planificacion-inicial/` y dejar vista-general + FAQ como referencia común en la raíz de `backlog/`.
>
> Si quieres que redacte el protocolo y reorganice la carpeta, activa **Agent mode**.
---

## 7. Pull requests

**Prompt 1** — *Agente: **Cursor***

- **Origen:** [`prompts/prompts 2026-06-14 19.13 Cursor.md`](prompts/prompts%202026-06-14%2019.13%20Cursor.md) — Intercambio 203
- **Timestamp:** 2026-06-14 14:16 UTC

**serpegon11710-byte dice:**

> Interesante eso del PR... ¿deberia cerrar la rama del backlog, con su PR, cuando se dio por validado el STEP 13? Y, ¿crear un nueva rama de tipo chore para hacer ajustes en el repositorio? Con respecto a la regla de los agentes, es un bug de cursor, ¿debería comitearlo como fix o como chore?

**Cursor dice:**

> Buenas preguntas; encajan con cómo habéis organizado T-000 y el protocolo de commits.
>
> ## ¿Cerrar `docs/backlog` con PR al validar Step 13?
>
> **Sí, es lo coherente** con vuestro modelo:
>
> - Esa rama es trabajo del **T-000 / Step 13** (reorganización FAQ, protocolos, cierre documental).
> - **T-000 cerrado** + **T-001 desbloqueado** marcan un hito natural de merge.
> - El PR resume una unidad revisable: «planificación documental validada», no mezcla mantenimiento del repo.
>
> **Flujo razonable:**
>
> 1. **PR `docs/backlog` → `main`** (o la rama base que uses): todo T1–T10 + fix reglas agentes (`42e91e7`) si ya está en la rama.
> 2. Tras merge, **nueva rama** desde la base actualizada, p. ej. `chore/eol-utf8` o `chore/repo-encoding`:
>    - `.gitattributes`, `.editorconfig`, `.vscode/settings.json`
>    - opcional: segundo commit `git add --renormalize .`
>
> Así el PR del backlog no se infla con cientos de líneas solo por LF/CRLF, y el bootstrap (**T-001**) puede arrancar en `001-bootstrap/…` desde `main` limpio.
>
> **Alternativa válida** pero peor para revisión: seguir en `docs/backlog` hasta commitear encoding y mergear todo junto. Funciona si el equipo es solo tú y no te importa un PR grande.
>
> ---
>
> ## ¿Rama `chore` aparte para ajustes de repo?
>
> **Sí, recomendable** para:
>
> - Config encoding/EOL (no es producto ni T-000).
> - Renormalización masiva (diff ruidoso, commit aparte).
> - Cualquier `.gitignore`, hooks, scripts de repo, etc.
>
> No es obligatorio el nombre `chore/…`; lo importante es **separar hito documental (T-000) de mantenimiento de repo**.
>
> ---
>
> ## ¿Reglas de agentes: `fix` o `chore`?
>
> Según vuestro `protocolo-commits.md`:
>
> | Tipo | Cuándo |
> |------|--------|
> | **`fix`** | Corrección de **bug** o incoherencia respecto a docs/contratos acordados |
> | **`chore`** | Mantenimiento de repo (mover, config, scripts); **sin** cambiar semántica de producto |
> | **`docs`** | Solo documentación en `backlog/` / `docs/` |
>
> **Reglas agentes (AGENTS + reglas-agentes):**
>
> - El defecto está en **Cursor** (`Today's date` congelada), no en el código del producto.
> - Lo que añadís es **governance documental** + mitigación de proceso.
> - **`fix(planificacion)`** — defendible: corriges un fallo de flujo que producía fechas incorrectas en documentación (incoherecia operativa). Es lo que ya usaste en `42e91e7`.
> - **`docs(planificacion)`** — también defendible: son solo ficheros markdown nuevos, sin “arreglar” un fichero concreto ya publicado.
> - **`chore(planificacion)`** — más débil aquí: no es solo “config de repo”; documentáis un bug externo y una regla obligatoria.
>
> **Recomendación:** **`fix(planificacion)`** o **`docs(planificacion)`**; yo mantendría **`fix`** si enfatizas la mitigación del bug de Cursor. **`chore`** reservarlo para `.gitattributes` / `.editorconfig` / renormalize.
>
> **Encoding/EOL:**
>
> - Claramente **`chore(planificacion)`** o **`chore`**: mantenimiento de repo, ámbito `(planificacion)` si solo tocáis transversales + config raíz.
>
> ---
>
> ## Resumen práctico
>
> | Cambio | Rama sugerida | Tipo commit |
> |--------|---------------|-------------|
> | T-000 / Step 13 / FAQ / protocolos | `docs/backlog` → PR y merge | `docs(T-000)` … (ya hecho) |
> | AGENTS / reglas-agentes | misma rama backlog (ya mergeable) | `fix(planificacion)` ✓ (o `docs`) |
> | `.gitattributes`, editorconfig, vscode | **nueva** `chore/…` tras merge | `chore(planificacion)` |
> | `git add --renormalize .` | misma chore, **commit 2** | `chore: renormalizar LF` |
>
> No hace falta reescribir el commit `42e91e7` salvo que te obsesione la pureza del tipo; lo importante es **separar el PR del backlog del PR chore de encoding**.
>
> Si quieres que ejecute los dos commits de encoding en Agent mode, dilo y lo hacemos en la rama que elijas.
---

**Prompt 2** — *Agente: **Cursor***

- **Origen:** [`prompts/prompts 2026-06-14 19.13 Cursor.md`](prompts/prompts%202026-06-14%2019.13%20Cursor.md) — Intercambio 226
- **Timestamp:** 2026-06-14 15:56 UTC

**serpegon11710-byte dice:**

> Si, haz push y abre el PR docs/tests → main

**Cursor dice:**

> Push hecho y PR abierto:
>
> **https://github.com/serpegon11710-byte/Planificacion_2.0/pull/11**
>
> Rama `docs/tests` → `main`, 4 commits:
>
> 1. Registrar Step 12c y reapertura T-000  
> 2. Reglas agentes (consenso previo, planes sin opcionales)  
> 3. Convenciones tests + FAQ-103 (documento central, pseudocódigo, N4, guías 12b)  
> 4. Revalidación Step 13 y cierre T-000  
>
> El PR incluye checklist de revisión documental. ¿Quieres que revise algo concreto antes del merge?
---

**Prompt 3** — *Agente: **Cursor***

- **Origen:** [`prompts/prompts 2026-06-14 19.13 Cursor.md`](prompts/prompts%202026-06-14%2019.13%20Cursor.md) — Intercambio 243
- **Timestamp:** 2026-06-14 19:02 UTC

**serpegon11710-byte dice:**

> No me vale, las rutas de los enlaces en los PR apuntan a pull, por lo que vamos a ajustar su definición:
>
> [{file_name}](../blob/{rama_pull}/{ruta_file}/[🇲🇳](../blob/{rama_main}/{ruta_file}).
>
> Por ejemplo, para :
>
> {ruta_file}='docs/stack-tecnologico/cambio-tecnologia-componente.md'
> {file_name}='cambio-tecnologia-componente.md'
> {rama_main}='main'
> {rama_pull}='docs/test'
>
> sería
>
> [cambio-tecnologia-componente.md](../blob/docs/tests/docs/stack-tecnologico/cambio-tecnologia-componente.md)/[🇲🇳](../blob/main/docs/stack-tecnologico/cambio-tecnologia-componente.md). 
>
> Ajustame la descripción del PR11  para que vea que funciona

**Cursor dice:**

> Actualizando la regla en `AGENTS.md` y la descripción del PR #11 con el formato de enlaces blob (rama del PR + main).
>
> Actualizando la regla en `AGENTS.md` y la descripción del PR #11 con el formato blob dual (rama del PR + main).
---

## Historial completo de conversaciones

Todas las sesiones exportadas (GitHub Copilot y Cursor), incluyendo intercambios completos «usuario / agente», están disponibles en:

**[prompts/](prompts/)**

| Fichero | Agente | Contenido |
|---------|--------|----------|
| [`prompts/prompts 2026-06-10 16.50 GitHub Copilot.md`](prompts/prompts%202026-06-10%2016.50%20GitHub%20Copilot.md) | Copilot | Especificaciones iniciales, README, casos de uso UC-01/02/03 |
| [`prompts/prompts  2026-06-10 22.49 GitHub Copilot.md`](prompts/prompts%20%202026-06-10%2022.49%20GitHub%20Copilot.md) | Copilot | Diagramas C4, arquitectura híbrida, contratos |
| [`prompts/prompts 2026-06-11 21.33 GitHub Copilot.md`](prompts/prompts%202026-06-11%2021.33%20GitHub%20Copilot.md) | Copilot | Actualización planificación y arquitectura |
| [`prompts/prompts 2026-06-12 21.22 Cursor.md`](prompts/prompts%202026-06-12%2021.22%20Cursor.md) | Cursor | Análisis y elección de stack tecnológico |
| [`prompts/prompts 2026-06-13 12.57 Cursor.md`](prompts/prompts%202026-06-13%2012.57%20Cursor.md) | Cursor | Resúmenes de commits (modelo de datos, desacoplamiento) |
| [`prompts/prompts 2026-06-13 17.24 Cursor.md`](prompts/prompts%202026-06-13%2017.24%20Cursor.md) | Cursor | Aclaración nomenclatura Step 12b en planificación |
| [`prompts/prompts 2026-06-14 19.13 Cursor.md`](prompts/prompts%202026-06-14%2019.13%20Cursor.md) | Cursor | Modelo ER, backlog, tickets, PRs, tests, FAQ (245 intercambios) |

Subcarpetas por sesión: [`prompts/GitHub Copilot/`](prompts/GitHub%20Copilot/) y [`prompts/Cursor/`](prompts/Cursor/).
