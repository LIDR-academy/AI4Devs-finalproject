> Detalla en esta seccion los prompts principales utilizados durante la creacion del proyecto, que justifiquen el uso de asistentes de codigo en todas las fases del ciclo de vida del desarrollo. Se incluyen prompts representativos y reproducibles, orientados a obtener los artefactos tecnicos de la Entrega 1.

## Indice

1. [Descripcion general del producto](#1-descripcion-general-del-producto)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Modelo de datos](#3-modelo-de-datos)
4. [Especificacion de la API](#4-especificacion-de-la-api)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Tickets de trabajo](#6-tickets-de-trabajo)
7. [Pull requests](#7-pull-requests)

---

## 1. Descripcion general del producto

**Prompt 1:**

```text
Actua como product manager senior y ayudame a convertir esta idea en un PRD para el proyecto final de AI4Devs.

Idea: una aplicacion web llamada Habla para practicar ingles conversacional con IA. El usuario realiza sesiones cortas de voz con un profesor IA, la sesion se transcribe, se analizan errores de gramatica, vocabulario, fluidez y pronunciacion, y el sistema genera un plan adaptativo para la siguiente sesion.

Entrega un documento en espanol con:
- objetivo del producto;
- usuario principal;
- propuesta de valor;
- flujo E2E del MVP;
- funcionalidades must-have y should-have;
- requisitos funcionales y no funcionales;
- KPIs;
- non-goals;
- supuestos.

Hazlo accionable para que un agente de coding pueda implementar el MVP en la siguiente entrega.
```

**Prompt 2:**

```text
Revisa el PRD anterior como evaluador de AI4Devs. Identifica ambiguedades, riesgos de scope creep y partes que no sean verificables. Reescribe la propuesta para que el MVP quede acotado a registro, onboarding, preparacion de sesion, conversacion oral, transcripcion, reporte y plan siguiente.
```

---

## 2. Arquitectura del sistema

### **2.1. Diagrama de arquitectura:**

**Prompt 1:**

```text
Disena la arquitectura tecnica de Habla para un MVP web desplegable.

Contexto:
- Frontend: Next.js, React y TypeScript.
- Backend: FastAPI en Python.
- Base de datos y autenticacion: Supabase.
- Dominio previsto: habla.tuklon.ai.
- Voz de baja latencia: comparar OpenAI Realtime y Gemini Live.
- El producto debe mantener abierta la opcion de investigar PersonaPlex como motor full-duplex, pero no debe depender de el para el MVP.

Entrega:
- diagrama Mermaid de componentes;
- responsabilidades de frontend, backend, Supabase y proveedores IA;
- flujo tecnico de una sesion;
- estados de sesion;
- seguridad;
- observabilidad;
- despliegue.
```

**Prompt 2:**

```text
Revisa la arquitectura anterior buscando acoplamientos peligrosos a proveedores de IA. Propón una capa `VoiceProviderGateway` para encapsular OpenAI Realtime, Gemini Live o futuros motores de voz. Explica como esta decision reduce lock-in y permite comparar latencia, coste, calidad de turn-taking y transcripcion util.
```

### **2.2. Descripcion de componentes principales:**

**Prompt 1:**

```text
Genera una tabla de componentes principales para Habla. Para cada componente incluye tecnologia, responsabilidad, datos que lee/escribe y riesgos relevantes. Los componentes minimos son: Web App, API Backend, Supabase Auth, Supabase Postgres, Supabase Storage, Voice Gateway, Analysis Pipeline, Curriculum Planner y Observabilidad.
```

### **2.3. Descripcion de alto nivel del proyecto y estructura de ficheros**

**Prompt 1:**

```text
Propón una estructura de repositorio para la Entrega 2 de Habla usando frontend Next.js, backend FastAPI, paquetes compartidos y Supabase migrations. La estructura debe ser simple, escalable y facil de navegar por agentes de coding. Explica brevemente el proposito de cada carpeta.
```

### **2.4. Infraestructura y despliegue**

**Prompt 1:**

```text
Define la infraestructura de despliegue para Habla con Vercel para frontend, Railway o Fly.io para backend, Supabase para DB/Auth/Storage y GitHub Actions para CI. Incluye pipeline de pull request, previews, secrets, despliegue a main y riesgos asociados a WebSocket/WebRTC.
```

### **2.5. Seguridad**

**Prompt 1:**

```text
Haz una revision de seguridad para una app educativa que guarda audio, transcripciones y reportes de aprendizaje. Lista controles minimos para MVP: autenticacion, RLS, aislamiento por user_id, manejo de secrets, minimizacion de logs, privacidad de audio, prompts anonimizados y proteccion contra acceso cruzado entre usuarios.
```

### **2.6. Tests**

**Prompt 1:**

```text
Define una estrategia de testing para el MVP de Habla. Incluye unit tests de backend, integration tests con base de datos, unit tests de frontend y un E2E del flujo principal. Considera que los proveedores de voz pueden tener coste y latencia, asi que propone mocks controlados para CI y pruebas manuales de latencia para el spike de voz.
```

---

## 3. Modelo de datos

**Prompt 1:**

```text
Disena el modelo de datos de Habla en Supabase Postgres para capturar el loop completo de aprendizaje:
- perfil del alumno;
- sesiones;
- transcripcion palabra a palabra;
- errores detectados;
- vocabulario aprendido;
- snapshots de progreso;
- planes curriculares;
- reportes de sesion.

Entrega un diagrama ER en Mermaid con claves primarias y foraneas, y despues un esquema SQL inicial con restricciones, checks, indices recomendados y notas de RLS.
```

**Prompt 2:**

```text
Revisa el modelo de datos anterior pensando en personalizacion longitudinal. Verifica que sea posible responder estas preguntas:
- que errores se repiten por usuario;
- que vocabulario esta dominado o necesita practica;
- que plan esta activo para la siguiente sesion;
- que reporte corresponde a cada sesion;
- como evitar que un usuario lea datos de otro.

Propón ajustes si falta alguna entidad, relacion, indice o regla de dominio.
```

---

## 4. Especificacion de la API

**Prompt 1:**

```text
Selecciona los 3 endpoints mas importantes del MVP de Habla y documentalos en formato OpenAPI 3.0. Deben cubrir:
1. preparar una sesion oral;
2. finalizar una sesion y disparar analisis;
3. consultar progreso longitudinal.

Incluye security scheme con bearer JWT, parametros, request bodies, responses, tipos principales y codigos HTTP esperados.
```

**Prompt 2:**

```text
Revisa la especificacion OpenAPI como si fueras el desarrollador backend que la va a implementar. Comprueba si faltan campos necesarios para conectar con el modelo de datos: session_id, status, focus, level, prompt_version, audio_url, latest_scores y recurring_errors. Devuelve una version corregida y consistente.
```

---

## 5. Historias de usuario

**Prompt 1:**

```text
Escribe las historias de usuario principales para el MVP de Habla usando el formato "Como [usuario], quiero [accion], para [beneficio]". Prioriza solo las historias que cierran el flujo E2E:
- iniciar una sesion de practica;
- terminar sesion y obtener reporte;
- ver progreso;
- enfocar la siguiente sesion en huecos detectados;
- registrarse y entrar.

Para cada historia incluye criterios de aceptacion verificables.
```

**Prompt 2:**

```text
Reduce las historias anteriores a las 3 mas importantes para la entrega formal de AI4Devs. Deben representar claramente el valor diferencial: sesion oral, reporte post-sesion y plan adaptativo. Mantén criterios de aceptacion medibles y conectados con arquitectura y modelo de datos.
```

---

## 6. Tickets de trabajo

**Prompt 1:**

```text
Convierte las historias Must-have de Habla en un backlog de tickets implementables. Para cada ticket incluye ID, titulo, area, descripcion, criterios de aceptacion y estimacion. Ordena el backlog para llegar primero a un flujo E2E demostrable.
```

**Prompt 2:**

```text
Selecciona 3 tickets representativos para la entrega de AI4Devs: uno backend, uno frontend y uno de base de datos. Cada ticket debe tener suficiente detalle para que un agente de coding pueda implementarlo de inicio a fin sin inventar requisitos. Incluye dependencias y criterios de aceptacion.
```

---

## 7. Pull requests

**Prompt 1:**

```text
Prepara la descripcion de la Pull Request de Entrega 1 para Habla. La PR contiene documentacion tecnica, no implementacion. Resume los cambios incluidos, el alcance, lo que queda fuera, las decisiones pendientes y como esta documentacion servira para implementar la Entrega 2.
```

**Prompt 2:**

```text
Revisa la PR de Entrega 1 como code reviewer. Comprueba que el diff muestre la creacion completa de la documentacion tecnica desde main, que no incluya archivos que deben estar en el repo de LIDR, y que la rama tenga un unico commit claro con el mensaje "Add entrega 1 technical documentation".
```
