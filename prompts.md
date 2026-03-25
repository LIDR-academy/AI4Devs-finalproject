# Prompts Reales (Traducidos) - Proyecto Xambi
> Esta sección contiene los prompts reales utilizados durante el desarrollo de Xambi, todos traducidos al español para reflejar el lenguaje de trabajo del proyecto. Estos prompts demuestran cómo se guiaron las distintas fases del desarrollo.

---
## 0. Fase Inicial y Especificaciones
- **Fase Inicial:** El proyecto se armó inicialmente en esta sesión de ChatGPT: [Master Final Project](https://chatgpt.com/g/g-p-694b1bbf832c8191bba6ebae7d281f5a-masterfinal/project)
- **Especificaciones Originales:** Las especificaciones iniciales obtenidas del prompt de ChatGPT se encuentran en el repositorio [MarketService](https://github.com/xaman1990/MarketService) en la ruta `/MarketService/openspec/specs`.

---

## 1. Descripción general del producto
**Prompt 1 (Visión del MVP):**
> "Xambi es un Marketplace de Servicios diseñado para conectar clientes con proveedores verificados. El objetivo del MVP es digitalizar un mercado tradicional informal, proporcionando trazabilidad y control institucional a través de la gestión de solicitudes, propuestas, contratos, chats y verificaciones."

**Prompt 2 (Estructura de Usuarios):**
> "Define un sistema multi-rol para Clientes y Proveedores (professional), donde el Cliente crea solicitudes (service_request) y los Proveedores envían propuestas (proposal). Incluye soporte para multi-país mediante country_code."
---
## 2. Arquitectura del Sistema
### **2.1. Diagrama de arquitectura:**
**Prompt 1 (Generación de Diagramas C4):**
> "Genera los diagramas finales del sistema Xambi incluyendo el flujo funcional en Mermaid y diagramas C4 (Contexto, Contenedor, Componente). Define la relación entre la App Flutter, el Admin Web y el Backend único en Supabase."
### **2.2. Descripción de componentes principales:**
**Prompt 1 (Arquitectura Limpia - Clean Architecture):**
> "Implementa la aplicación móvil siguiendo Clean Architecture. Divide el código en capas de Presentación (BLoC), Dominio y Datos, utilizando get_it para inyección de dependencias."

**Prompt 2 (Backend Centralizado):**
> "Configura el backend en Supabase utilizando PostgREST + RPC. Establece PostgreSQL como la única fuente de verdad y define el uso de eliminación lógica (is_deleted) y auditoría obligatoria en todas las tablas core."
### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**
**Prompt 1 (Configuración del Monorepo):**
> "Organiza el proyecto como un Monorepo con las carpetas: apps/mobile, apps/admin, packages/shared, y supabase/migrations. Establece las convenciones de nomenclatura en snake_case para la base de datos."
### **2.4. Infraestructura y despliegue**
**Prompt 1 (Configuración de CI/CD):**
> "Configura GitHub Actions para ejecutar pruebas E2E automáticas con Cypress en cada Pull Request a la rama main. El despliegue del Admin Panel debe hacerse en Cloudflare Pages."
### **2.5. Seguridad**
**Prompt 1 (Implementación de RLS):**
> "Define políticas de seguridad RLS obligatorias. Los usuarios solo pueden acceder a sus propios perfiles y contratos. Ningún frontend puede implementar lógica de negocio crítica; esta debe residir en RPC o Triggers del backend."
### **2.6. Tests**
**Prompt 1 (Flujo de Pruebas E2E):**
> "Crea pruebas E2E automatizadas con Cypress para validar el flujo completo de una solicitud de servicio en las versiones web de Admin y App. Asegúrate de cubrir todos los flujos críticos de negocio."
---
### 3. Modelo de Datos
**Prompt 1 (Diagrama ER):**
> "Genera el diagrama del modelo de datos unificado en Mermaid. Incluye el dominio core (solicitudes, propuestas, contratos), extensiones operativas (verificaciones, disputas) y el sistema de facturación y notificaciones para profesionales."
---
### 4. Especificación de la API
**Prompt 1 (Refinamiento de OpenAPI):**
> "Genera la especificación OpenAPI de la función RPC `get_public_professional_profile`. Asegúrate de que este endpoint NUNCA exponga datos sensibles como número de teléfono, DNI (identity_number) o URL de documentos de identidad."
---
### 5. Historias de Usuario
**Prompt 1 (Historia de Usuario: Chat y Propuesta):**
> "Como Cliente y Proveedor, quiero comunicarme por chat sobre una propuesta para poder discutir detalles antes de aceptar. Funcionalidades: Chat en tiempo real (texto, fotos) vinculado al contexto de la propuesta."

**Prompt 2 (Historia de Usuario: Notificaciones Profesionales):**
> "Como profesional, quiero recibir notificaciones push y en la aplicación persistentes tanto para solicitudes de servicio públicas como directas, de modo que no me pierda ninguna oportunidad de trabajo."
---
### 6. Tickets de Trabajo
**Prompt 1 (Desglose Técnico - Notificaciones):**
> "Desglosa la implementación de las notificaciones profesionales: 1) Actualizar triggers para peticiones directas, 2) Habilitar Database Webhooks, 3) Estandarizar la campana de notificaciones con badge en la UI móvil."
---
### 7. Pull Requests
**Prompt 1 (Refactorización del Centralizador de Notificaciones):**
> "Refactoriza el centralizador de notificaciones. Todas las notificaciones push deben ser disparadas por un único Supabase Database Webhook en la tabla public.notifications. Elimina las llamadas directas a funciones desde la aplicación móvil."

**Prompt 2 (Corrección de Marcadores del Mapa):**
> "Rediseña los marcadores del mapa. Pasa de un icono simple a un Widget complejo renderizado como Bitmap que incluya el avatar del profesional y su nombre, manejando colisiones cuando hay múltiples proveedores en la misma coordenada."
