## Índice

0. [Ficha del proyecto](#0-ficha-del-proyecto)
1. [Descripción general del producto](#1-descripción-general-del-producto)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Modelo de datos](#3-modelo-de-datos)
4. [Especificación de la API](#4-especificación-de-la-api)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Tickets de trabajo](#6-tickets-de-trabajo)
7. [Pull requests](#7-pull-requests)

---

## 0. Ficha del proyecto

### **0.1. Tu nombre completo:** Marcos Vinícius Correia da Silva

### **0.2. Nombre del proyecto:** Salary Tracker

### **0.3. Descripción breve del proyecto:** Manage how much you earn, spend, and save in an intuitive way

### **0.4. URL del proyecto:**

> Puede ser pública o privada, en cuyo caso deberás compartir los accesos de
> manera segura. Puedes enviarlos a [alvaro@lidr.co](mailto:alvaro@lidr.co)
> usando algún servicio como [onetimesecret](https://onetimesecret.com/).

### 0.5. URL o archivo comprimido del repositorio

> Puedes tenerlo alojado en público o en privado, en cuyo caso deberás compartir
> los accesos de manera segura. Puedes enviarlos a
> [alvaro@lidr.co](mailto:alvaro@lidr.co) usando algún servicio como
> [onetimesecret](https://onetimesecret.com/). También puedes compartir por
> correo un archivo zip con el contenido

---

## 1. Descripción general del producto

### **1.1. Objetivo:**

This product helps people take full control of their personal finances in a
simple, flexible way

### **1.2. Características y funcionalidades principales:**

# 🚀 Feature Highlights

- 📊 **Smart Money Tracking**  
  Log all transactions and store receipts in one place.  
  _Helps users understand where their money goes, making budgeting accurate and
  easy._

- 🔁 **Flexible Recurrence & Installments**  
  Automate repeatead transactions over time.  
  _Reduces manual work and avoids missed payments or surprises._

- 💸 **Budget Overview**  
  Visual dashboards and charts show spending, income, and budget usage in real
  time.  
  _Gives users clear insights to plan ahead and avoid overspending._

- 🎯 **Financial Goals & Simulations**  
  Set finance goals and simulate changes to plan smarter.  
  _Empowers users to stay motivated and prepare for future financial scenarios._

- 🔔 **Notifications & Reminders**  
  Get alerts for paydays, budget limits, and goal milestones, plus monthly
  recaps.  
  _Keeps users informed and helps them stick to their plan without surprises._

- 🔄 **Cross-Platform & Offline**  
  Use the product on any device, sync automatically, and log transactions even
  without internet.  
  _Ensures users have access anytime, anywhere with safe and up-to-date data._

- 🔐 **Robust Security**  
  Secure login, encryption for all data, and optional two-factor
  authentication.  
  _Protects sensitive financial information and builds trust with users._

### **1.3. Diseño y experiencia de usuario:**

![Main User Journey](./prompts/4-main-user-journey.png)

### **1.4. Instrucciones de instalación:**

> Documenta de manera precisa las instrucciones para instalar y poner en marcha
> el proyecto en local (librerías, backend, frontend, servidor, base de datos,
> migraciones y semillas de datos, etc.)

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

> Usa el formato que consideres más adecuado para representar los componentes
> principales de la aplicación y las tecnologías utilizadas. Explica si sigue
> algún patrón predefinido, justifica por qué se ha elegido esta arquitectura, y
> destaca los beneficios principales que aportan al proyecto y justifican su
> uso, así como sacrificios o déficits que implica.

### **2.2. Descripción de componentes principales:**

> Describe los componentes más importantes, incluyendo la tecnología utilizada

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

> Representa la estructura del proyecto y explica brevemente el propósito de las
> carpetas principales, así como si obedece a algún patrón o arquitectura
> específica.

### **2.4. Infraestructura y despliegue**

> Detalla la infraestructura del proyecto, incluyendo un diagrama en el formato
> que creas conveniente, y explica el proceso de despliegue que se sigue

### **2.5. Seguridad**

> Enumera y describe las prácticas de seguridad principales que se han
> implementado en el proyecto, añadiendo ejemplos si procede

### **2.6. Tests**

> Describe brevemente algunos de los tests realizados

#### Testing Strategy
Our project follows a comprehensive **TDD + BDD approach** with **vertical slicing** development:

- **E2E Tests**: Highest priority for happy flows, covering complete user workflows
- **Integration Tests**: For costly/unreliable scenarios and multi-activity user journeys
- **Unit Tests**: For individual component behavior and edge cases

#### Test Organization
Tests are organized by capability/feature/activity hierarchy:
```
test/tests/
├── capability-name/
│   ├── feature-name/
│   │   └── activity-name/
│   │       ├── 1-happy-flow.e2e.spec.ts
│   │       └── 2-error-scenarios.int.spec.ts
│   └── user-journeys/
│       └── complete-workflow.int.spec.ts
```

#### Bug Fix Testing
- **Regression Prevention**: Every bug fix includes a test that reproduces the bug
- **Test First**: Write failing test before implementing the fix
- **BUGS.md Update**: Mark bugs as resolved after tests pass
- **Test Verification**: Ensure test fails before fix and passes after

#### User Journey Testing
- **Multi-Activity Flows**: Test complete workflows spanning multiple activities
- **Integration Tests**: Use `.int.spec.ts` for complex user journeys
- **Real Database**: PostgreSQL in Docker containers for realistic testing
- **Business Logic**: Validate complex business rules across multiple features

#### Test Coverage
- **Backend**: > 80% coverage required
- **Frontend**: > 70% coverage required
- **Execution**: Integration tests < 30s, E2E tests < 2min

---

## 3. Modelo de Datos

### **3.1. Diagrama del modelo de datos:**

> Recomendamos usar mermaid para el modelo de datos, y utilizar todos los
> parámetros que permite la sintaxis para dar el máximo detalle, por ejemplo las
> claves primarias y foráneas.

### **3.2. Descripción de entidades principales:**

> Recuerda incluir el máximo detalle de cada entidad, como el nombre y tipo de
> cada atributo, descripción breve si procede, claves primarias y foráneas,
> relaciones y tipo de relación, restricciones (unique, not null…), etc.

---

## 4. Especificación de la API

> Si tu backend se comunica a través de API, describe los endpoints principales
> (máximo 3) en formato OpenAPI. Opcionalmente puedes añadir un ejemplo de
> petición y de respuesta para mayor claridad

---

## 5. Historias de Usuario

> Documenta 3 de las historias de usuario principales utilizadas durante el
> desarrollo, teniendo en cuenta las buenas prácticas de producto al respecto.

**Historia de Usuario 1**

**Historia de Usuario 2**

**Historia de Usuario 3**

---

## 6. Tickets de Trabajo

> Documenta 3 de los tickets de trabajo principales del desarrollo, uno de
> backend, uno de frontend, y uno de bases de datos. Da todo el detalle
> requerido para desarrollar la tarea de inicio a fin teniendo en cuenta las
> buenas prácticas al respecto.

**Ticket 1**

**Ticket 2**

**Ticket 3**

---

## 7. Pull Requests

> Documenta 3 de las Pull Requests realizadas durante la ejecución del proyecto

**Pull Request 1**

**Pull Request 2**

**Pull Request 3**
