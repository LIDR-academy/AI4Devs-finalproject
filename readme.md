# Documentación de Proyecto Final: BPMN Modeler

## 0. Ficha del proyecto

### **0.1. Tu nombre completo:**
Óscar Hidalgo Puertas

### **0.2. Nombre del proyecto:**
BPMN Modeler

### **0.3. Descripción breve del proyecto:**
Aplicación web SaaS de modelado BPMN 2.0 con generación de código por IA, control de versiones (ramas, merge y diff), colaboración en tiempo real mediante WebSockets y sincronización nativa con repositorios de GitHub.

### **0.4. URL del proyecto:**
[sdd-ia.com](https://sdd-ia.com)

### **0.5. URL o archivo comprimido del repositorio:**
Repositorio privado (Accesos compartidos con el equipo / SDD-IA LLC).

---

## 1. Descripción general del producto

### **1.1. Propuesta de valor y público objetivo:**
BPMN Modeler es un SaaS diseñado para analistas de negocio, ingenieros de software y arquitectos de procesos que necesitan cerrar la brecha entre el diseño conceptual de procesos y la implementación de código. Permite automatizar la creación de diagramas mediante lenguaje natural, colaborar de manera asíncrona o síncrona mediante un sistema de versiones inspirado en Git, y exportar automáticamente la lógica del negocio a múltiples lenguajes de programación estructurados.

### **1.2. Características principales (MVP):**
* **Editor Visual Avanzado:** Basado en `bpmn-js`, con paneles de propiedades extendidos y comentarios sobre nodos.
* **Generación Guiada por IA:** Traducción de descripciones textuales a diagramas BPMN y generación de código funcional (SudoLang, Python, Node.js, Java, C#, Go) utilizando modelos avanzados (DeepSeek, OpenAI, Claude) vía LiteLLM.
* **Control de Versiones Semántico:** Ramas de diagramas, cómputo de diferencias (diff) y fusión (merge) de cambios XML.
* **Colaboración en Tiempo Real:** Canales WebSocket activos para visualización de cursores concurrentes y bloqueo temporal de elementos para evitar colisiones.
* **Sincronización con GitHub:** Integración bidireccional para almacenar los diagramas `.bpmn` directamente en repositorios de código.

### **1.3. Modelo de negocio (Monetización):**
Modelo freemium estructurado a través de Stripe:
* **Plan Free:** Límites en el plan gratuito para proyectos y créditos de IA.
* **Plan Pro (19€/mes):** Proyectos ilimitados, generación de código avanzada, historial completo de versiones.
* **Plan Team (49€/mes):** Espacios de trabajo compartidos, colaboración en tiempo real activa y sincronización empresarial con GitHub.

---

## 2. Arquitectura del sistema

### **2.1. Diagrama de componentes (Mermaid):**

```mermaid
graph TD
    %% Clientes y Frontend
    subgraph Frontend [Capa de Presentación - Cliente]
        ReactApp[React 19 SPA / Tailwind]
        BPMNEditor[bpmn-js Visual Modeler]
        WSClient[WebSocket Client - Presencia]
    end

    %% Servidores y Backend
    subgraph Backend [Capa de Aplicación - Backend API]
        FastAPI[FastAPI Server / Python 3.11]
        AuthJWT[Módulo Auth JWT]
        AIEngine[AI Pipeline via liteLLM]
        GitEngine[Version Control / XML Diff Engine]
        WSServer[WebSocket Manager]
    end

    %% Pasarelas Externas
    subgraph Servicios Externos
        LiteLLM[liteLLM Gateway - OpenAI / DeepSeek / Claude]
        GitHubAPI[GitHub API OAuth / Webhooks]
        StripeAPI[Stripe Gateway - Suscripciones]
    end

    %% Bases de Datos
    subgraph Almacenamiento [Capa de Persistencia]
        MongoDB[(MongoDB - Base de Datos Async)]
        Redis[(Redis - Caché & Estados de Sesión)]
    end

    %% Conexiones
    ReactApp -->|HTTP REST / JSON| FastAPI
    BPMNEditor --> ReactApp
    WSClient <-->|WebSockets Duplex| WSServer
    
    FastAPI --> AuthJWT
    FastAPI --> AIEngine
    FastAPI --> GitEngine
    
    AIEngine --> LiteLLM
    FastAPI --> GitHubAPI
    FastAPI --> StripeAPI
    
    FastAPI -->|Motor Async| MongoDB
    WSServer -->|Pub-Sub & Cache| Redis