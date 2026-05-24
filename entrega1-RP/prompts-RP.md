> Detalla en esta sección los prompts principales utilizados durante la creación del proyecto, que justifiquen el uso de asistentes de código en todas las fases del ciclo de vida del desarrollo. Esperamos un máximo de 3 por sección, principalmente los de creación inicial o los de corrección o adición de funcionalidades que consideres más relevantes.
> Puedes añadir adicionalmente la conversación completa como link o archivo adjunto si así lo consideras


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

**Prompt 1:**

```
As a Software Engineer you want to create a Full-Stack project to implement a tester workflow 
orchestrator for the STLC (inspired in the command-based solution called spec-kit but dedicated 
to the Software Testing Lifecycle). The solution has to be based in CLI-based commands flow that 
supports a friendly UI for the testers that can go through all the stages of a software testing 
lifecycle. You have to provide a fancy/inspiring/friendly name for the UI APP.

Functionally talking is expected to cover the different stages from the software testing lifecycle 
such as:
- test-brainstorm for sharing a Jira ticket (that will be tested), natural language User Story, 
  and any other written input (f.e. the location of a folder with the functional documentation). 
  Also technical documentation (Github repo) might be input for this. This stage has to evaluate 
  the functional and technical impact and is the best time to interact with the tester for 
  clarification of the scope
- test-plan for collecting the main ideas regarding the strategy, approach for the testing of the 
  requirement, also functional scope, testing types, testing pre-requisites, testing limitations, 
  testing resources, testing data, etc.
- test-scenarios that generate the Gherkins scenarios in .feature files regarding the requirements
- test-cases that generate the test cases (optional) with the most relevant test attributes such as 
  ID, Title, Preconditions, Postconditions, Steps to Reproduce, Expected Results, Test Data, Priority
- test-automate that generate the automated tests in Playwright
- test-change that get new input of scope change in case functionally or technically is requested. 
  The output is the update of the SDLC deliverables according to the scope change. If needed it 
  might also imply some interaction for clarification with the tester
- test-run that run the tests and bring a quick summary of the results. It might be just manual 
  tests (if the project session does not have automated tests) or automated in case there are 
  automated tests in the session
- test-report that generate a complete MD file report in screen and downloadable with screenshots, 
  results of the tests including the proper findings from functional, technical security, 
  performance, and UX perspective

All the deliverables has to be available for download in the UI or has to be generated in the 
project for CLI-based solutions. Most of the stages has to have the tester in the loop for proper 
validation without assumption but letting the tester make decisions through interaction so maybe a 
friendly chat for it would be good. Try to prevent a mechanical testing process without tester 
approval/interaction. The UI has to guide the tester to run the stages stage by stage on its proper 
order and dependency.

In addition:
- It's expected to have a vectorial database for all the configurations in the STLC and get 
  feedback from the daily usage
- It's expected to have an Observability section on each web page to see the token usage 
  (amount of tokens and USD money involved on it)

Technically talking is expected to have an architecture based in Javascript, Vectorial DB, good 
practices regarding software engineering with special focus in the KISS pattern, and Quality 
(it has to consider TDD approach for Unit, Integration and E2E tests).

What is expected is:
1) Create a README.md file below the entrega1-RP folder that follows the template in the readme.md 
   file containing all the basis for the project we'll build
2) Create a prompts-RP.md file below the entrega1-RP folder that summarizes all the prompts from 
   this Claude session
```

**Prompt 2:**
```
Add the following changes:
- The prompts-RP.md file has to be adapted to and follow the template called prompts.md
- The README.md file has to be revisited according to the skills recently added on this project
```

**Prompt 3:**
```
Add the following change, update the README.md file:
- The README.md should consider a User Management feature where each tester should be able to 
  sign up, login and recover its password. This Users will be used for the proper audit of the 
  sessions. In addition add a Reporting sessions to be able to recover metrics about the test 
  sessions during specific time period (f.e. a month, or week, or Q) and see testing metrics 
  such as % test passed, tests taking longer, most tests failing, % bugs/finding per tests 
  executed, %false positive according the feedback, etc.
- Remember to update the prompts-RP.md file from our interaction
```

**Prompt 4:**
```
Add the following change, update the README.md file -->
Enable integration with other tools such as Jira/Xray for test creation and the tracking of the test execution  or Github for pushing a branch and create a PR in a repository when we run the test-automate command
```

**Prompt 5:**
```
Could we use MCP for the integration with the tools I asked for?
```

**Prompt 6:**
```
THe interaction with Jira/Xray or Github has to be pre-approved by the tester
```

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

### **2.2. Descripción de componentes principales:**

**Prompt 1:**
```
Add the following change, update the README.md file:
Enable integration with other tools such as Jira/Xray for test creation and the tracking of 
the test execution or Github for pushing a branch and create a PR in a repository when we run 
the test-automate command
```

**Prompt 2:**
```
The interaction with Jira/Xray or Github has to be pre-approved by the tester
```

**Prompt 3:**

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

### **2.4. Infraestructura y despliegue**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

### **2.5. Seguridad**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

### **2.6. Tests**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

---

## 3. Modelo de Datos

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

---

## 4. Especificación de la API

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

---

## 5. Historias de Usuario

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

---

## 6. Tickets de Trabajo

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

---

## 7. Pull Requests

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**
