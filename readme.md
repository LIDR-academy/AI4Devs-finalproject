# 🚀 Genesis – Framework Empresarial de Desarrollo Fullstack

## 📘 Ficha del Proyecto

### 🧭 Descripción General
**Genesis** es un proyecto base de arquitectura empresarial diseñado para el **desarrollo ágil de aplicaciones fullstack modernas** con integración de **inteligencia artificial**.  
Su objetivo es unificar la forma en que se crean, despliegan y mantienen las soluciones tecnológicas de la compañía, permitiendo iniciar cualquier nuevo desarrollo **desde el módulo de negocio** sin reconstruir la infraestructura técnica.

Genesis sirve como un **punto de partida estructural, técnico y metodológico**, garantizando estándares de **calidad, seguridad, interoperabilidad y escalabilidad** en todos los productos desarrollados bajo su marco.

---

### 🎯 Objetivos del Proyecto

#### Objetivo General
Construir una **plataforma base (framework interno)** que permita el desarrollo modular, rápido y seguro de aplicaciones empresariales, integradas con el ecosistema de datos y servicios de la organización.

#### Objetivos Específicos
- Estandarizar la arquitectura técnica y de desarrollo en todos los proyectos.  
- Reducir tiempos de inicio de nuevos desarrollos mediante módulos clonables.  
- Integrar de forma nativa nuevos productos de negocio mediante IA.  
- Centralizar la seguridad, autenticación y despliegue CI/CD.  
- Promover la reutilización de componentes y la colaboración entre equipos.  
- Facilitar la documentación y trazabilidad de todos los módulos de negocio.

---

### 🏗️ Alcance

Genesis cubre:

- Backend completo (**API REST Node.js + Express**).  
- Frontend modular (**React + Vite + TailwindCSS**).  
- Integración de **IA** (`ai-integration` con metaprompts y servicios por módulo).  
- Conexión estándar a las APIs de la organización.  
- **Pipelines CI/CD** listos para DevOps.  
- **Documentación técnica centralizada**.

---

### 🧩 Componentes Principales

| Componente | Descripción |
|-------------|-------------|
| **Backend** | API REST Node.js con autenticación JWT, estructura modular y middlewares centralizados. |
| **Frontend** | Aplicación SPA React + Vite con layout base, rutas y componentes reutilizables. |
| **AI Integration** | Carpeta de prompts, metaprompts y scripts de análisis que sirven como base para integración de nuevos productos. |
| **CI/CD** | Pipelines YAML para build, test, deploy y versionado automatizado. |
| **Infraestructura** | Contenedores Docker. |
| **Documentación** | Estructura Markdown en `/docs/` con manual técnico, seguridad y guías de despliegue. |

---

### 🧠 Beneficios Esperados
- Disminución del tiempo de arranque de nuevos proyectos hasta en un **70%**.  
- Homogeneización de la arquitectura de software de toda la organización.  
- Mayor trazabilidad, control y gobernanza de los desarrollos.  
- Integración directa con herramientas de **IA** y analítica.  
- Seguridad centralizada usuarios roles aplicativos
- Despliegues más rápidos y confiables con **CI/CD**.  
- Cultura de desarrollo basada en **reutilización y automatización**.

---

### 👥 Equipo del Proyecto

| Rol | Responsable | Funciones |
|-----|--------------|-----------|
| **Product Owner** | Dirección de Tecnología | Define lineamientos, requerimientos y alcance del framework. |
| **Arquitecto de Software** | — | Diseña la arquitectura base, modularidad y patrones. |
| **DevOps Engineer** | Equipo Infraestructura | Configura pipelines, despliegues y entornos. |
| **Desarrollador Fullstack** | Equipo Desarrollo | Implementa módulos base y verifica extensibilidad. |
| **Ingeniero de Prompts** | Equipo IA / Datos | Diseña y estructura los metaprompts y su integración. |
| **QA / Auditor de Calidad** | — | Valida estándares, pruebas y seguridad. |

---

## ⚙️ 2. Arquitectura del Sistema

### 2.1 Visión General
El proyecto **Genesis** implementa una arquitectura **modular, escalable y desacoplada**, basada en servicios y componentes reutilizables.  
Su propósito es estandarizar la estructura de todos los desarrollos empresariales, garantizando interoperabilidad con los sistemas existentes.

El enfoque arquitectónico sigue el principio de **“construir una sola vez, reutilizar siempre”**, permitiendo que nuevos módulos de negocio se creen directamente sobre la base de Genesis mediante un proceso automatizado de clonación y configuración inicial.

---

### 2.2 Diagrama de Arquitectura General

                   ┌────────────────────────────┐
                   │        FRONTEND SPA         │
                   │   (React + Vite + Tailwind) │
                   └────────────┬────────────────┘
                                │
                     API REST HTTPS / JWT
                                │
             ┌──────────────────┴──────────────────┐
             │                                     │
     ┌──────────────┐                    ┌────────────────┐
     │  Backend API │                    │ AI Integration  │
     │ (Node.js /   │                    │ (OpenAI / GPT / │
     │  Express)    │                    │ Metaprompts)    │
     └───────┬──────┘                    └───────┬─────────┘
             │                                    │
             │ SQL / HTTP                         │
             ▼                                    ▼
   ┌───────────────────────┐        ┌────────────────────────┐
   │ Data Warehouse (DWH) │◄──────►│   Analytical Services   │
   │ SQL Server / Synapse │        │                         │
   └─────────┬────────────┘        └────────────────────────┘
             │
             │
             ▼
   ┌────────────────────────┐
   │ Azure DevOps / CI-CD   │
   │ (Pipelines / IaC)      │
   └────────────────────────┘