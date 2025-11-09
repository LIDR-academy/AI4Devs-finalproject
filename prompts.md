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
Actúa como product architect en una sesión de BrainStorming para planificar el desarrollo de esta aplicación y definir el stack tecnológico. En base a las especificaciones del fichero ["Aplicación_comparador plantillas SEPE.md"](docs/Aplicación_comparador%20plantillas%20SEPE.md) define el stack tecnológico y la metodología asistida por IA para comenzar el desarrollo de la aplicación "comparación plantillas SEPE"

Salida del prompt: [Resumen y Objetivos del Proyecto.md](docs/Resumen%20y%20Objetivos%20del%20Proyecto.md)

**_Este brainstorming inicial se realizó en ChatGPT 5 y Gemini 2.5, los resultados en Gemini 2.5 fueron mejores (no lo esperaba)_**

**Prompt 2:**
**_Previo a la ejecución del prompt se instaló la estructura de [agent-os](https://buildermethods.com/agent-os)_**
/plan-product based on the high level specifications described in @Resumen y Objetivos del Proyecto.md and @.agent-os/

**Prompt 3:**
Actúa como un CTO Senior que revisa una arquitectura de microservicios moderna. Mi objetivo es asegurar la escalabilidad, el código limpio y la correcta separación de responsabilidades antes de empezar a implementar la lógica de Análisis de PDF y IA (Fase 2 del Roadmap).

Realiza un análisis detallado del proyecto en ficheros separados (crealos en la carpeta techdesign. Para cada fichero, explica el propósito y su relación con el resto del stack.

Quiero un informe bien estructurado con las siguientes secciones:

## 1. Arquitectura de Datos y Persistencia

- Analiza la doble estrategia de inicialización:
  - La carpeta 'database/init' (archivos SQL) vs. la carpeta 'alembic' (migrations Python).
  - ¿Cómo interactúan el Dockerfile y Alembic para asegurar la consistencia del esquema?

## 2. Configuración y Entorno (DevOps)

- Analiza 'alembic.ini', 'env.py', y 'config.py'. ¿Cómo se gestionan las variables de entorno de Azure/PostgreSQL/Redis para los contenedores (backend, worker) y para la ejecución local?
- Analiza los 'requirements.txt' y 'requirements-dev.txt' y confirma si todas las dependencias se justifican para un proyecto de IA/FastAPI.

## 3. Capas de Servicio (Backend y Worker)

- Analiza la separación entre los servicios 'backend' (FastAPI, API REST) y 'worker' (Celery). ¿Es correcta la segregación para las tareas pesadas de procesamiento de PDF (Fase 2)?
- ¿Cómo se establece la conexión a Redis para el _caching_ y la cola de tareas?

## 4. Frontend y Contenedores

- Revisa la configuración de 'frontend' en docker-compose (vols y environment) y cómo interactúa con el 'backend' para las llamadas a la API.

Concluye el análisis con una **Recomendación de Alto Nivel** sobre el estado del _stack_ y si facilita o dificulta la implementación de la Fase 2 (Inteligencia/Automatización).

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

### **2.2. Descripción de componentes principales:**

**Prompt 1:**

**Prompt 2:**

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

### 3. Modelo de Datos

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

---

### 4. Especificación de la API

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

---

### 5. Historias de Usuario

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

---

### 6. Tickets de Trabajo

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

---

### 7. Pull Requests

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**
