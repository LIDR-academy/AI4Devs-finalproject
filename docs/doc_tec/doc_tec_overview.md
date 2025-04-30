# Documentación Técnica - Proyecto TalentIA (Fase 1)

Este directorio contiene la documentación técnica detallada para el desarrollo de la Fase 1 (ATS MVP + Core AI) del proyecto TalentIA. Se divide en la documentación del backend y del frontend.

## 1. Documentación Técnica del Backend (ATS MVP)

**El fichero [Documentación Técnica del Backend del ATS MVP](doc_tec_ats_mvp-back.md)** detalla la implementación del backend del ATS MVP. Cubre aspectos como:

*   **Tecnologías Principales:** Python, FastAPI, PostgreSQL, SQLAlchemy, Celery, Redis.
*   **Arquitectura:** Descripción general de la arquitectura del backend, incluyendo la interacción con Core AI.
*   **Estructura del Proyecto:** Organización de directorios y módulos.
*   **Modelos de Datos:** Definición de los modelos SQLAlchemy y esquemas Pydantic.
*   **Endpoints de la API:** Especificación detallada de las rutas de la API RESTful.
*   **Lógica de Negocio:** Descripción de los procesos clave como la gestión de vacantes, candidaturas y la interacción con la IA.
*   **Tareas Asíncronas:** Uso de Celery y Redis para procesar tareas en segundo plano (evaluación IA).
*   **Autenticación y Autorización:** Implementación de la seguridad.
*   **Configuración y Despliegue:** Instrucciones para configurar y desplegar el backend.

## 2. Documentación Técnica del Frontend (ATS MVP)

**El fichero [Documentación Técnica del Frontend del ATS MVP](doc_tec_ats_mvp_front.md)** describe la implementación del frontend del ATS MVP. Incluye:

*   **Tecnologías Principales:** TypeScript, React, Next.js, Tailwind CSS, Headless UI.
*   **Arquitectura:** Descripción de la arquitectura frontend, incluyendo la gestión del estado y la comunicación con la API del backend.
*   **Estructura del Proyecto:** Organización de componentes, páginas y utilidades.
*   **Componentes Reutilizables:** Descripción de los componentes clave de la interfaz de usuario.
*   **Gestión del Estado:** Estrategia utilizada para manejar el estado de la aplicación.
*   **Enrutamiento:** Configuración de las rutas de la aplicación con Next.js.
*   **Interacción con la API:** Cómo el frontend consume los endpoints del backend.
*   **Estilos y UI:** Uso de Tailwind CSS y Headless UI para la interfaz.
*   **Formularios y Validaciones:** Implementación de formularios y validación de datos.
*   **Construcción y Despliegue:** Instrucciones para construir y desplegar el frontend. 


*Este resumen proporciona una visión general de la documentación técnica del proyecto TalentIA.*