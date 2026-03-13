## 1. Descripción general del producto

**Prompt 1:**

Actúa como un arquitecto de software senior y tech lead experto en:

- Backend en C# (ASP.NET Core / .NET 8)
- Frontend en React con Tailwind CSS
- Arquitecturas basadas en metadatos / low-code
- Diseño de BBDD relacionales
- Diseño de sistemas robustos con alta mantenibilidad

Quiero que me ayudes a DISEÑAR y PLANEAR un proyecto para un curso, que consiste en construir un sistema web tipo “SuiteCRM / low-code platform”, con estas características:

--------------------------------------------------
OBJETIVO GENERAL DEL SISTEMA
--------------------------------------------------
Un portal administrativo basado en metadatos que permita:

1. Definir entidades de negocio dinámicamente, SIN necesidad de mapear explícitamente cada entidad en el backend (evitar un ORM clásico con POCOs por cada tabla).
2. Construir pantallas (formularios y vistas de listado) de manera configurable desde un módulo administrador:
   - Definición de campos (tipo, longitud, validaciones, obligatorio/opcional).
   - Definición de relaciones (1-1, 1-n, n-n) entre entidades.
   - Configuración de vistas de lista (columnas, filtros, ordenamientos).
   - Configuración de vistas de detalle/edición.
3. Implementar CRUD genéricos basados en metadatos para todas las entidades configuradas.
4. Manejar entidades anidadas / relaciones en la base de datos (por ejemplo, entidad principal con subentidades relacionadas).
5. Permitir “rollbacks” rápidos:
   - Posibilidad de revertir cambios recientes de datos sin tumbar el sistema.
   - Propón estrategias posibles (por ejemplo: event sourcing light, soft deletes con versiones, temporal tables, etc.) y elige una recomendada.
6. Consultar reportes:
   - Errores de la aplicación.
   - Estadísticas de uso (número de registros por entidad, modificaciones recientes, etc.).
   - Métricas generales de consumo del sistema (ej: número de requests, latencias aproximadas, etc. aunque sea de forma simplificada).
7. Bitácoras de inserción/actualización/borrado por usuario:
   - Quién hizo qué cambio, cuándo y sobre qué entidad/registro.
8. Autenticación y autorización:
   - Login utilizando Keycloak.
   - Manejo de roles y permisos para:
     - Acceso a entidades.
     - Acceso a operaciones (crear, leer, actualizar, eliminar).
     - Acceso al módulo administrador.
9. Pruebas:
   - Tests unitarios (mínimo para servicios clave y lógica de metadatos).
   - Tests de integración básicos (por ejemplo, flujo de CRUD basado en metadatos).
10. Otros aspectos importantes que quiero que consideres y propongas:
   - Manejo de errores y logging.
   - Validaciones en backend y frontend.
   - Organización de la solución por capas y proyectos.
   - Posible estrategia mínima de CI/CD o al menos cómo estructurar el repo.
   - Extensibilidad futura (por ejemplo poder agregar triggers/reglas de negocio simples sobre los metadatos).
   - Seguridad básica (evitar inyección, sanitización mínima, buenas prácticas).

--------------------------------------------------
STACK TECNOLÓGICO
--------------------------------------------------
Backend:
- C#, .NET (idealmente ASP.NET Core Web API / minimal APIs si tiene sentido).
- Sin uso de un ORM clásico donde tenga que definir una clase por cada entidad de negocio.
- Se puede usar acceso a datos más dinámico (por ejemplo Dapper, SQL crudo, tablas genéricas, tablas de metadatos, etc.) siempre que esté bien justificado.

Frontend:
- React.
- Tailwind CSS.
- Idealmente una estructura limpia de componentes y hooks.

Base de datos:
- Base relacional (PostgreSQL).

Autenticación:
- Keycloak para login y roles (proponer a alto nivel cómo integrarlo).

--------------------------------------------------
LO QUE QUIERO QUE ME ENTREGUES
--------------------------------------------------
1) Validación y resumen del problema
   - Reescribe (de forma corta y clara) tu entendimiento del sistema.
   - Explica brevemente la idea de arquitectura basada en metadatos que propones.

2) Propuesta de ARQUITECTURA GENERAL
   - Tipo de arquitectura (capas, puertos y adaptadores/hexagonal, etc.) y por qué.
   - Módulos principales:
     - Módulo de metadatos (definición de entidades, campos, relaciones, vistas).
     - Módulo de ejecución de CRUD genérico basado en metadatos.
     - Módulo de logging y auditoría.
     - Módulo de reportes y métricas.
     - Integración con Keycloak.
   - Estrategia para evitar mapeo explícito de entidades vía ORM:
     - Cómo modelar las tablas de metadatos.
     - Cómo modelar el almacenamiento de datos de entidades dinámicas.
   - Estrategia propuesta para rollbacks:
     - Cómo guardar versiones / eventos / historial.
     - Cómo ejecutar un rollback a nivel de registro o conjunto pequeño de cambios.
   - Cómo se comunican frontend y backend (API REST, endpoints genéricos por entidad, etc.).

3) DIAGRAMAS A GRAN ESCALA
   Incluye diagramas (en texto, por ejemplo usando Mermaid) para:
   - Diagrama de contexto / arquitectura de alto nivel (usuario, frontend, backend, BBDD, Keycloak).
   - Diagrama de componentes principales en el backend.
   - Diagrama de componentes principales en el frontend (módulo admin de metadatos, módulo de CRUD genérico, módulo de reportes).

   Ejemplo (para que se entienda el formato, ajusta lo que consideres):
   ```mermaid
   C4Context
   …

4) DIAGRAMAS ESPECÍFICOS / DE FLUJO
Incluye diagramas de secuencia o flujo (también en Mermaid) para casos de uso clave:

“Administrador define una nueva entidad con sus campos y relaciones”.

“Usuario final crea un nuevo registro de una entidad dinámica desde una pantalla generada por metadatos”.

“Proceso de rollback de un cambio reciente en un registro”.

“Flujo de autenticación con Keycloak y acceso a una pantalla protegida”.

5) DISEÑO DE BASE DE DATOS (LÓGICO)

Propuesta de tablas de metadatos (ejemplo: Entities, Fields, Relations, Views, etc.).

Propuesta de cómo almacenar datos de entidades dinámicas:

Tablas genéricas (tipo EAV), tablas por entidad creadas dinámicamente, o alguna combinación; justifica la decisión.

Tablas para:

Auditoría / bitácora.

Historial/versions para soporte de rollback.

Logs de errores (si aplica a nivel de BBDD).

6) DISEÑO DE API BACKEND

Lista de endpoints REST principales:

Para gestión de metadatos (crear/editar entidades, campos, relaciones).

Para CRUD dinámico de entidades (crear/leer/actualizar/eliminar registros).

Para reportes y métricas.

Para auditoría (consultar bitácoras por usuario).

Describe a alto nivel el contrato (inputs/outputs JSON genéricos basados en metadatos).

7) DISEÑO DE FRONTEND (REACT + TAILWIND)

Propuesta de estructura de carpetas.

Componentes principales:

Builder de entidades y formularios (pantallas admin).

Componentes genéricos de tabla/listado.

Componentes genéricos de formularios dinamicos.

Pantalla de reportes y métricas.

Cómo consumir los metadatos desde el frontend para construir dinámicamente:

Formularios.

Listados.

Cómo integrar el flujo de login con Keycloak a nivel de frontend.

8) PLAN DE IMPLEMENTACIÓN POR FASES
Propón un roadmap pragmático (pensando en un proyecto de curso, no en un producto empresarial completo), por ejemplo:

Fase 1: Setup del proyecto (backend y frontend), integración básica con Keycloak.

Fase 2: Modelo y API de metadatos (crear entidades y campos).

Fase 3: CRUD genérico backend basado en metadatos.

Fase 4: Frontend para administración de metadatos (UI builder básica).

Fase 5: Frontend para CRUD genérico de entidades.

Fase 6: Auditoría, bitácoras y reportes básicos.

Fase 7: Mecanismo de rollback simplificado.

Fase 8: Pruebas unitarias e integrales mínimas.

Fase 9: Mejoras de calidad de código, documentación y demo final.

Para cada fase:

Objetivo.

Tareas clave.

Entregables.

Dependencias relevantes.

9) ESTRATEGIA DE PRUEBAS

Qué probar con tests unitarios (ej: motor de metadatos, motor de CRUD genérico, validaciones).

Qué probar con tests de integración (ej: llamadas reales a la API para un flujo CRUD completo).

Cómo estructurar los proyectos de tests en C#.

10) OUTPUT

Responde TODO en ESPAÑOL.

Usa secciones y subtítulos claros.

Usa diagramas en formato Mermaid donde sea posible.

Sé concreto y pragmático, priorizando algo alcanzable para un proyecto de curso, pero con diseño “profesional”.

Espero recibir un archivo que hable sobre lo que hará el sistema llamado "Basic.md" y crea los archivos que consideres necesarios donde coloques toda la información requerida de este proyecto. 