# Documentación de Arquitectura - Proyecto TalentIA (Fase 1)

Este directorio contiene la documentación relativa a la arquitectura de software para la Fase 1 (ATS MVP + Core AI) del proyecto TalentIA.

## 1. Arquitectura del ATS MVP

**El fichero de [Arquitectura del ATS MVP](ats_mvp_arq.md)** proporciona una visión detallada de la arquitectura diseñada para el Applicant Tracking System (ATS) Minimum Viable Product (MVP) y su integración con el componente Core AI. Los puntos clave cubiertos incluyen:

*   **Visión General:** Objetivos y alcance de la arquitectura para la Fase 1.
*   **Contexto del Sistema:** Diagrama de contexto C4 identificando sistemas externos e interacciones.
*   **Principios Arquitectónicos:** Guías y restricciones que rigen el diseño (modularidad, escalabilidad, seguridad, etc.).
*   **Vista Lógica (C2 - Contenedores):** Descripción de los principales bloques de construcción (Frontend Web App, Backend API, Base de Datos, Cola de Mensajes, Worker Asíncrono, Core AI Service) y sus responsabilidades e interacciones.
*   **Vista de Despliegue:** Cómo se desplegarán los contenedores (ej. usando Docker Compose para desarrollo/pruebas iniciales, planes futuros para Kubernetes).
*   **Vista de Desarrollo:** Tecnologías clave seleccionadas para cada componente (FastAPI, React/Next.js, PostgreSQL, Redis/Celery, etc.) y justificación.
*   **Vista de Datos:** Modelo de datos conceptual, tecnologías de persistencia (PostgreSQL, almacenamiento de archivos para CVs).
*   **Decisiones Arquitectónicas Clave (ADRs):** Registro de decisiones importantes y sus fundamentos (ej. elección de FastAPI, uso de Celery, enfoque de Core AI como servicio separado).
*   **Flujos de Datos Principales:** Cómo fluye la información a través del sistema para casos de uso críticos (ej. creación de vacante, aplicación de candidato, evaluación IA).
*   **Integración con Core AI:** Detalles sobre la interfaz (API REST) y el contrato entre el ATS Backend y el Core AI Service.
*   **Aspectos Transversales:** Consideraciones sobre seguridad, monitorización, logging y configuración.
*   **Escalabilidad y Rendimiento:** Estrategias iniciales y futuras para asegurar el rendimiento.
*   **Consideraciones Futuras:** Posibles evoluciones de la arquitectura más allá del MVP. 


*Este resumen proporciona una visión general de la arquitectura del proyecto TalentIA.*