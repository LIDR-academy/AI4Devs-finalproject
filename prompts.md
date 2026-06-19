> Detalla en esta sección los prompts principales utilizados durante la creación del proyecto, que justifiquen el uso de asistentes de código en todas las fases del ciclo de vida del desarrollo. Esperamos un máximo de 3 por sección, principalmente los de creación inicial o  los de corrección o adición de funcionalidades que consideres más relevantes.
Puedes añadir adicionalmente la conversación completa como link o archivo adjunto si así lo consideras


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

**Prompt 1:**

Actúa como senior product manager. Se quiere crear una aplicación web que sirva como integrador para la aplicación web principal (kiosko digital) y la aplicación de administración. Tenemos dos tipos de usuarios: 1) cortesía: estos pueden ser sin identificar o identificados (si la empresa que nos contrata nos pasa el ID); en cualquier caso, estos usuarios no nos proporcionan información confidencial como correo o contraseña. 2) usuarios corporativos: estos deben poder registrarse usando email y contraseña, y el acceso puede estar restringido por dominio de correo; asimismo, se tiene que poder dar acceso mediante Office 365 o similares. A futuro sería interesante que sirva como puente para que un usuario dado de alta en nuestro servicio pueda acceder a los medios dados de alta a través de nosotros sin necesidad de iniciar sesión manualmente en cada una de ellas. Ayúdame a definir y aterrizar la tarea. Hazme todas las preguntas que consideres necesarias.

**Prompt 2:**

He revisado tu documento hasta el punto 13. Comentarios importantes: 1) auth tiene responsabilidades mínimas; todo lo que tiene que ver con la gestión, dar de alta usuarios, tarifas, planes, etc. es responsabilidad de la aplicación de administración. Puedes añadir una nota en el documento, pero tiene que desaparecer cualquier tarea o mención fuera de esa nota. 2) el acceso por invitación por email desaparece, no lo vamos a implementar, no lo veo necesario. 3) esta aplicación debe integrarse con Cognito actual + backoffice admin y kiosko + BD. 4) Importante: no implementa el modelo de datos, pero sí habrá que hacer un análisis de cómo hay que modificar lo actual. Cómo afecta a la tabla user y customer. 5) La marca blanca permite manejar lo mínimo (logo, colores, claim en la landing, mensaje del end of service, URL a su intranet para integración.)

**Prompt 3:**

Por último, parte de la funcionalidad ya existe y está implementada. ¿Convendría usar agentes cloud dentro de los repositorios y sacar la documentación del funcionamiento actual como contexto para el PRD? Si es así, ¿cómo lo hago?

---

## 2. Arquitectura del Sistema

**Prompt 1:** Me gustaría trabajar en un documento independiente para definir la arquitectura. Para ello entiendo que necesito dos roles diferentes: el de AWS-architect y otro como senior full-stack (o backend y frontend). Me gustaría coordinar la opinión de los tres y participar en la conversación. ¿Cuál es la mejor estrategia?

**Prompt 2**: Tengo que cerrar Visual Studio para que puedas acceder a los roles. Si quisiera entrar en este modo de mesa redonda (para crear un nuevo documento/evolutivo o consulta), ¿qué tendría que hacer? ¿Cuál es la mejor estrategia?

> **Nota sobre el método de trabajo.** A raíz de estos prompts se montó un modo de **"mesa redonda"**: se crearon tres **subagentes** expertos (`aws-infra-architect`, `backend-architect`, `frontend-architect`) y un comando **`/mesa`** que los convoca en paralelo y de forma **independiente** (mismo encuadre, sin verse entre sí, para evitar pensamiento de grupo), sintetiza sus opiniones (acuerdos / conflictos / preguntas abiertas) y **facilita la decisión con la persona en el hilo**. Las decisiones se registran como `AD-` en `docs/03-Architecture.md` §9 y, si tocan producto, como `D-` en el PRD. (Existe además un comando `/po` para la perspectiva de Product Owner.) Cada subsección de abajo se trabajó así, eligiendo en cada caso solo los roles relevantes.

**Prompt 1:** Haz el diagrama *(diagrama de despliegue §2.1 en Mermaid: EC2 con nginx+Fastify + infraestructura AWS externa + frontera de confianza)*

**Prompt 2:** El diagrama 1.2 está roto *(corrección de sintaxis Mermaid del diagrama de contexto §1.2: etiquetas con `*`/`:` sin comillas y enlace punteado roto por los puntos de `.bepayper.com`)*

### **2.2. Descripción de componentes principales:**

**Prompt 1:** Quiero seguir con la parte del backend → transmíteles los cambios realizados *(desarrollo de §3 Backend transmitiendo a los subagentes las decisiones de la sesión)*

**Prompt 2:** ¿Qué opinan el resto de agentes? *(pase de mesa de aws-infra y frontend sobre §3, además del backend)*

**Prompt 3:** Vamos por el frontend; quiero algo ligero que el usuario no se tenga que descargar medio internet. Quiero saber las opciones, pros y contras *(elección del stack de §4 Frontend)*

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

**Prompt 1:** ¿Por qué la arquitectura hexagonal? ¿Qué otras opciones hay? *(justificación del patrón hexagonal frente a alternativas: en capas, vertical slice, vanilla)*

**Prompt 2:** Mantenemos la hexagonal *(decisión del patrón arquitectónico §1.4 y la estructura de carpetas §1.5)*

**Prompt 3:** Vamos por la visión general *(redacción de §1: objetivo/alcance, diagrama de contexto, patrón+trade-offs, estructura de repo, glosario)*

### **2.4. Infraestructura y despliegue**

**Prompt 1:** El equipo de developers está acostumbrado a trabajar en local, pero este proyecto es susceptible a desplegarse en local (para desarrollo) y 1) en ECS o 2) en API Gateway. ¿Cuál es la mejor opción? *(decisión de cómputo: contenedor en ECS vs serverless)*

**Prompt 2:** Vamos a continuar con el 7, pero pregunta a los expertos *(pase de mesa de los tres roles sobre §7 Despliegue: hosting, CI/CD, config/secretos)*

**Prompt 3:** 7.1 ¿dónde corre? En dev en una EC2; cuando pase a stg (fuera del MVP), ECS; y a considerar serverless *(progresión de cómputo `AD-08`: EC2 en dev → ECS en stg → serverless futuro; con el front también en la EC2)*

### **2.5. Seguridad**

**Prompt 1:** ¿Cómo puedo comprobar qué configuración de Cognito tengo y que tengo todo lo supuesto? *(verificación del contrato de integración §2.9 contra el `dev` real — gate V1–V5)*

**Prompt 2:** No lo hagas tú; dime los pasos para que los haga yo desde la web *(verificación manual en la consola AWS, sin que el asistente toque credenciales)*

**Prompt 3:** custom:customer_id en Cognito → No quiero hacerlo en este MVP; implicaría hacer una migración de los datos existentes en Cognito *(decisión `AD-07`/D-22: tenant desde la FK de BD, no desde un claim del token)*

### **2.6. Tests**

**Prompt 1:** ¿Necesito otro subagente para los tests? *(decisión de proceso: §8 con la mesa vs consolidación propia)*

**Prompt 2:** 8 con los dos agentes *(pase de mesa de backend + frontend sobre §8: pirámide, superficie crítica R-A-04, a11y, cobertura por directorio)*

---

### 3. Modelo de Datos

**Prompt 1:** Quiero trabajar en un nuevo documento de modelo de datos. Como este proyecto no es el encargado de gestionar las migraciones, quiero 3 secciones: el diagrama del modelo de datos acotado al MVP, descripción de entidades principales también acotada al MVP, y resumen de las tablas y columnas nuevas a crear y/o modificar *(crea `docs/04-Data-Model.md` con las 3 secciones, vía mesa del `backend-architect`; deja claro que Auth no aplica el DDL — D-09 — y solo documenta/pide el delta)*

**Prompt 2:** Pase de backend-architect *(elección de proceso: el modelo de datos es dominio del backend; valora además las decisiones de modelado abiertas del Artefacto B.4 antes de redactar)*

---

### 4. Especificación de la API

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

---

### 5. Historias de Usuario

**Prompt 1:** ¿Cuál sería una plantilla correcta para definir una historia de usuario siguiendo las buenas prácticas? *(plantilla de HU con INVEST + criterios de aceptación en Gherkin, aplicada a payper-auth vía `/po`)*

**Prompt 2:** Me gustaría un agente, skill o comando: 1. para crear las historias de usuario; 2. para crear y refinar las tareas de cada historia; 3. un orquestador. Además, quiero que estén las plantillas siempre disponibles… *(crea los comandos `/historia`, `/task`, `/backlog`, las plantillas en `docs/05-backlog/_templates/` y el README con organización y roles×fases)*

**Prompt 3:** Dale *(genera HU-01 registro, HU-02 login y HU-03 verificación de la Fase B vía `/backlog` → `/historia`)*

---

### 6. Tickets de Trabajo

**Prompt 1:** ¿Cuál sería la plantilla adecuada para las tareas siguiendo las buenas prácticas? *(plantilla de tarea: trazabilidad a HU, DoD verificable con el test incluido, dependencias visibles)*

**Prompt 2:** ¿Las tareas se definen por historia de usuario? *(relación 1-HU-a-N-tareas + trabajo habilitador sin HU en `_cross/`)*

**Prompt 3:** Dale *(desglosa HU-01/HU-02/HU-03 en tareas vía `/task`: endpoints, pantallas, email, y habilitadoras T-100/T-101/T-102)*

---

### 7. Pull Requests

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**