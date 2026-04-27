# Uso de IA en el proyecto — ProjectScope AI

> Los prompts fueron iterados y refinados manualmente para ajustar el alcance del MVP y mejorar la calidad de las respuestas generadas por IA.

---

## Índice

1. Descripción general del producto
2. Arquitectura del sistema
3. Modelo de datos
4. Especificación de la API
5. Historias de usuario
6. Tickets de trabajo
7. Pull requests

---

## 1. Descripción general del producto

> Estos prompts se utilizaron para definir el problema, la solución y el alcance del MVP.

---

**Prompt 1:**

Actúa como un Product Manager senior.

Ayudame a definir un producto que permita estimar proyectos de software considerando:

- esfuerzo humano
- uso de inteligencia artificial
- consumo de tokens
- costos asociados

El producto debe:

- tener un MVP realizable en 30 horas
- incluir un flujo E2E claro
- evitar complejidad innecesaria

Devuelve:

- problema
- solución
- propuesta de valor
- flujo principal

Ajuste humano: se priorizó un único flujo E2E para evitar scope creep.

---

**Prompt 2:**

Refiná la idea del producto para que incluya:

- generación de roadmap con fases y entregables
- estimación por fase
- propuesta de equipo de trabajo

El sistema debe estar enfocado en uso real en empresas.

Ajuste humano: se incorporó el concepto de roadmap para mejorar la estimación por fases.

---

**Prompt 3:**

Reducí el alcance del producto a un MVP con:

- máximo 5 funcionalidades principales
- un solo flujo E2E
- sin integraciones externas complejas

Explicá qué queda fuera del MVP.

Ajuste humano: se eliminaron integraciones como Jira o GitHub para simplificar la implementación.

---

## 2. Arquitectura del sistema

### 2.1 Diagrama de arquitectura

> Estos prompts se utilizaron para definir una arquitectura simple y alineada al MVP.

---

**Prompt 1:**

Actúa como un Software Architect.

Diseñá un diagrama de arquitectura para un sistema que:

- recibe proyectos con casos de uso
- genera roadmap con IA
- estima esfuerzo y tokens

Usá un diagrama Mermaid.

Ajuste humano: se validó que el diagrama represente correctamente el flujo E2E.

---

**Prompt 2:**

Refiná el diagrama para que sea simple y alineado a un MVP:

- frontend
- backend
- base de datos
- integración con Azure OpenAI

Ajuste humano: se eliminaron componentes innecesarios.

---

**Prompt 3:**

Simplificá la arquitectura eliminando componentes innecesarios como microservicios o colas.

Ajuste humano: se decidió mantener arquitectura cliente-servidor.

---

### 2.2 Componentes principales

> Estos prompts ayudaron a definir responsabilidades claras.

---

**Prompt 1:**

Describí los componentes principales de una arquitectura cliente-servidor simple.

Ajuste humano: se adaptó el lenguaje a documentación técnica.

---

**Prompt 2:**

Explicá responsabilidades de:

- frontend
- backend
- base de datos
- servicio de IA

Ajuste humano: se alineó con el flujo real del sistema.

---

**Prompt 3:**

Refiná la descripción para que sea clara y profesional.

Ajuste humano: se mejoró la legibilidad.

---

### 2.3 Estructura del proyecto

> Definición de organización del código.

---

**Prompt 1:**

Proponé una estructura de carpetas para:

- frontend React
- backend Node.js con Express

Ajuste humano: se priorizó simplicidad.

---

**Prompt 2:**

Simplificá la estructura para un MVP sin sobreingeniería.

Ajuste humano: se eliminaron capas innecesarias.

---

**Prompt 3:**

Asegurate de que la estructura sea fácil de entender y mantener.

Ajuste humano: se validó claridad para nuevos desarrolladores.

---

### 2.4 Infraestructura y despliegue

> Definición de estrategia de despliegue.

---

**Prompt 1:**

Proponé una estrategia de deploy usando Vercel y Render.

Ajuste humano: se eligieron servicios con CI/CD automático.

---

**Prompt 2:**

Agregá buenas prácticas de variables de entorno.

Ajuste humano: se incorporó gestión de secretos.

---

**Prompt 3:**

Simplificá la infraestructura para un MVP.

Ajuste humano: se evitó complejidad innecesaria.

---

### 2.5 Seguridad

> Medidas básicas para el sistema.

---

**Prompt 1:**

Listá medidas básicas de seguridad para una API REST.

Ajuste humano: se filtraron medidas no necesarias.

---

**Prompt 2:**

Adaptá a un MVP sin autenticación compleja.

Ajuste humano: se evitó sobreingeniería.

---

**Prompt 3:**

Refiná para que sea claro y realista.

Ajuste humano: se simplificó lenguaje técnico.

---

### 2.6 Tests

> Estrategia de testing.

---

**Prompt 1:**

Definí estrategia de testing fullstack.

Ajuste humano: se priorizó flujo principal.

---

**Prompt 2:**

Adaptá a:

- unit tests
- integration tests
- E2E

Ajuste humano: se eligieron herramientas concretas.

---

**Prompt 3:**

Simplificá priorizando el flujo E2E.

Ajuste humano: se evitó sobretestear.

---

## 3. Modelo de datos

> Definición del esquema del sistema.

---

**Prompt 1:**

Definí un modelo de datos para:

- proyectos
- casos de uso
- estimaciones
- fases
- roles
- tokens

Ajuste humano: se validaron entidades necesarias.

---

**Prompt 2:**

Convertí a esquema relacional.

Ajuste humano: se eligió PostgreSQL.

---

**Prompt 3:**

Simplificá para MVP.

Ajuste humano: se redujo complejidad.

---

## 4. Especificación de la API

> Definición de endpoints.

---

**Prompt 1:**

Diseñá endpoints REST para flujo principal.

Ajuste humano: se alineó con flujo E2E.

---

**Prompt 2:**

Simplificá la API.

Ajuste humano: se eliminaron endpoints innecesarios.

---

**Prompt 3:**

Convertí a formato tabla.

Ajuste humano: se mejoró claridad.

---

## 5. Historias de usuario

> Definición funcional.

---

**Prompt 1:**

Generá historias de usuario.

Ajuste humano: se validó coherencia.

---

**Prompt 2:**

Agregá criterios de aceptación.

Ajuste humano: se hicieron testeables.

---

**Prompt 3:**

Limitá cantidad.

Ajuste humano: se respetó alcance MVP.

---

## 6. Tickets de trabajo

> Planificación técnica.

---

**Prompt 1:**

Convertí historias en tickets.

Ajuste humano: se alinearon a tareas reales.

---

**Prompt 2:**

Refiná tickets.

Ajuste humano: se hicieron accionables.

---

**Prompt 3:**

Asegurá trazabilidad.

Ajuste humano: se verificó consistencia.

---

## 7. Pull requests

> Estrategia de entregas.

---

**Prompt 1:**

Definí estrategia de PRs.

Ajuste humano: se alineó al curso.

---

**Prompt 2:**

Generá nombres de ramas.

Ajuste humano: se adaptó naming.

---

**Prompt 3:**

Redactá descripciones de PR.

Ajuste humano: se mejoró claridad.

```

```
