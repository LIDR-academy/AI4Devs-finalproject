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

### **0.1. Tu nombre completo:**
Roger Muñoz Bernaus

### **0.2. Nombre del proyecto:**
Fichar y firmar

### **0.3. Descripción breve del proyecto:** 
FicharFirm es un sistema integral de control de jornada laboral diseñado específicamente para cumplir con la normativa española y los estándares de seguridad ISO 27001. El sistema permite a las empresas gestionar de manera eficiente y segura los registros de entrada/salida de sus empleados, así como la gestión de ausencias y la generación de informes oficiales.

### Características Principales

#### 1. Registro de Fichajes
- Sistema de fichaje con validación de certificado digital
- Control de ubicación mediante geolocalización
- Registro de dispositivo y validación de IP
- Sistema de notificaciones automáticas

#### 2. Gestión de Ausencias
- Solicitud y aprobación de ausencias
- Cálculo automático de saldos
- Gestión documental segura
- Sistema de aprobaciones con flujo de trabajo

#### 3. Informes y Documentación
- Generación de informes de jornada
- Exportación en múltiples formatos (PDF, Excel)
- Sistema de firma digital para documentos oficiales
- Detección automática de anomalías

### Aspectos Técnicos Destacados
- Desarrollo en Symfony 6.x
- Cumplimiento ISO 27001
- Validación de certificados digitales
- Sistema de caché y colas para alto rendimiento
- Interfaz moderna y responsive

### Beneficios Clave
1. **Cumplimiento Legal**: Total adaptación a la normativa española
2. **Seguridad**: Implementación de estándares ISO 27001
3. **Eficiencia**: Automatización de procesos administrativos
4. **Trazabilidad**: Registro completo de todas las operaciones
5. **Flexibilidad**: Adaptable a diferentes modelos de trabajo

### Tecnologías Principales
- Backend: Symfony 6.x
- Base de Datos: MariaDB
- Frontend: Symfony Twig
- Seguridad: JWT + Certificados Digitales
- Documentación: OpenAPI/Swagger


### **0.4. URL del proyecto:**

> Puede ser pública o privada, en cuyo caso deberás compartir los accesos de manera segura. Puedes enviarlos a [alvaro@lidr.co](mailto:alvaro@lidr.co) usando algún servicio como [onetimesecret](https://onetimesecret.com/).

Pendiente de generación del proyecto.

### 0.5. URL o archivo comprimido del repositorio

> Puedes tenerlo alojado en público o en privado, en cuyo caso deberás compartir los accesos de manera segura. Puedes enviarlos a [alvaro@lidr.co](mailto:alvaro@lidr.co) usando algún servicio como [onetimesecret](https://onetimesecret.com/). También puedes compartir por correo un archivo zip con el contenido

Estará publicado en privado en: https://github.com/rogergithub3/ficharfirm

---

## 1. Descripción general del producto

### **1.1. Objetivo:**

Desarrollar un sistema de control de jornada laboral que cumpla con la normativa española y los estándares de seguridad ISO 27001, facilitando la gestión eficiente y segura de los registros de trabajo de los empleados.

## Valor Aportado

### Para la Empresa
- **Cumplimiento Legal**: Solución completa que garantiza el cumplimiento del Real Decreto-ley 8/2019
- **Reducción de Riesgos**: Minimización de sanciones por incumplimiento normativo
- **Eficiencia Operativa**: Automatización de procesos administrativos de RRHH
- **Control Total**: Gestión centralizada y segura de todos los registros laborales
- **Ahorro de Costes**: Reducción de tiempo y recursos en gestión manual

### Para los Empleados
- **Transparencia**: Acceso claro a sus registros de jornada
- **Facilidad de Uso**: Sistema intuitivo para fichar y gestionar ausencias
- **Flexibilidad**: Acceso desde cualquier dispositivo autorizado
- **Seguridad**: Protección de sus datos personales y laborales
- **Autogestión**: Control sobre sus solicitudes de ausencias

### Para el Departamento de RRHH
- **Automatización**: Reducción de tareas manuales en gestión de jornada
- **Precisión**: Eliminación de errores en cálculos de horas
- **Trazabilidad**: Registro completo de todas las operaciones
- **Reporting**: Generación automática de informes oficiales
- **Gestión Eficiente**: Proceso simplificado de aprobación de ausencias

## Problemas que Soluciona

### Problemas Legales
- Cumplimiento obligatorio de registro de jornada
- Gestión de documentación legal
- Protección de datos según LOPDGDD
- Cumplimiento de estándares ISO 27001

### Problemas Operativos
- Gestión manual de fichajes
- Errores en cálculo de horas
- Procesos lentos de aprobación
- Documentación dispersa

### Problemas de Seguridad
- Vulnerabilidad en registros manuales
- Riesgo de manipulación de datos
- Falta de trazabilidad
- Protección insuficiente de datos sensibles

## Público Objetivo

### Primario
- Empresas españolas de todos los tamaños
- Departamentos de RRHH
- Empleados que necesitan fichar
- Gerentes y responsables de equipo

### Secundario
- Consultores de RRHH
- Auditores laborales
- Asesores legales
- Administradores de sistemas

## Diferenciadores Clave
1. **Enfoque Legal**: Diseñado específicamente para normativa española
2. **Seguridad**: Cumplimiento ISO 27001 desde el diseño
3. **Usabilidad**: Interfaz intuitiva y responsive
4. **Integración**: Compatible con sistemas existentes
5. **Soporte**: Asistencia especializada en normativa laboral

### **1.2. Características y funcionalidades principales:**

## 1. Sistema de Fichaje

### Registro de Jornada
- **Fichaje Digital**: 
  - Registro de entrada/salida con certificado digital
  - Validación de ubicación mediante geolocalización
  - Control de IP y dispositivo
  - Registro de pausas y descansos

### Validación y Seguridad
- **Autenticación**:
  - Certificados digitales
  - Autenticación de dos factores (2FA)
  - Control de sesiones
  - Registro de intentos de acceso

- **Geolocalización**:
  - Validación de ubicación en tiempo real
  - Definición de zonas permitidas
  - Registro de coordenadas GPS
  - Historial de ubicaciones

## 2. Gestión de Ausencias

### Solicitudes y Aprobaciones
- **Tipos de Ausencia**:
  - Vacaciones
  - Enfermedad
  - Asuntos personales
  - Formación
  - Teletrabajo

- **Flujo de Aprobación**:
  - Solicitud digital
  - Aprobación multinivel
  - Notificaciones automáticas
  - Historial de cambios

### Documentación
- **Gestión Documental**:
  - Subida de justificantes
  - Validación de documentos
  - Almacenamiento seguro
  - Versión de documentos

## 3. Informes y Reportes

### Generación de Informes
- **Tipos de Informes**:
  - Registro de jornada diario
  - Resumen mensual
  - Informes de ausencias
  - Análisis de horas extra
  - Detección de anomalías

### Exportación
- **Formatos**:
  - PDF firmado digitalmente
  - Excel
  - CSV
  - Integración con sistemas de RRHH

## 4. Panel de Administración

### Gestión de Usuarios
- **Funcionalidades**:
  - Creación y gestión de usuarios
  - Asignación de roles y permisos
  - Gestión de departamentos
  - Configuración de horarios

### Configuración
- **Opciones**:
  - Definición de horarios
  - Configuración de zonas
  - Gestión de notificaciones
  - Personalización de informes

## 5. Notificaciones y Alertas

### Sistema de Notificaciones
- **Tipos**:
  - Email
  - Notificaciones en sistema
  - Alertas de incidencias
  - Recordatorios automáticos

### Alertas
- **Eventos**:
  - Fichajes fuera de horario
  - Ausencias no justificadas
  - Horas extra
  - Anomalías detectadas

## 6. Integración y API

### Conectividad
- **Integraciones**:
  - Sistemas de RRHH
  - Software de nóminas
  - Sistemas de firma digital
  - Herramientas de reporting

### API REST
- **Endpoints**:
  - Gestión de fichajes
  - Consulta de ausencias
  - Generación de informes
  - Administración de usuarios

## 7. Seguridad y Cumplimiento

### Protección de Datos
- **Características**:
  - Cifrado de datos sensibles
  - Registro de auditoría
  - Cumplimiento LOPDGDD
  - Certificación ISO 27001

### Trazabilidad
- **Registros**:
  - Log de accesos
  - Historial de cambios
  - Registro de operaciones
  - Exportación de logs

## 8. Interfaz de Usuario

### Diseño Responsive
- **Características**:
  - Adaptable a todos los dispositivos
  - Interfaz intuitiva
  - Accesibilidad WCAG 2.1
  - Temas personalizables

### Dashboard
- **Funcionalidades**:
  - Vista general de jornada
  - Resumen de ausencias
  - Alertas pendientes
  - Accesos rápidos


### **1.3. Diseño y experiencia de usuario:**

> Proporciona imágenes y/o videotutorial mostrando la experiencia del usuario desde que aterriza en la aplicación, pasando por todas las funcionalidades principales.

Pendiente

### **1.4. Instrucciones de instalación:**
> Documenta de manera precisa las instrucciones para instalar y poner en marcha el proyecto en local (librerías, backend, frontend, servidor, base de datos, migraciones y semillas de datos, etc.)

Pendiente
---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

Esta sección está en este [fichero](docs/architecture.md).


### **2.2. Descripción de componentes principales:**

Esta sección está en este [fichero](docs/project-structure.md).

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

Esta sección está en este [fichero](docs/project-structure.md).

### **2.4. Infraestructura y despliegue**

Esta sección está en este [fichero](docs/infrastructure.md).


### **2.5. Seguridad**

Esta sección está en este [fichero](docs/security.md).

### **2.6. Tests**

> Describe brevemente algunos de los tests realizados

Pendiente
---

## 3. Modelo de Datos

### **3.1. Diagrama del modelo de datos:**

Esta sección está en este [fichero](docs/data-model.md).

### **3.2. Descripción de entidades principales:**

Esta sección está en este [fichero](docs/data-model.md).


---

## 4. Especificación de la API

Esta sección está en este [fichero](docs/api-controllers.md).

---

## 5. Historias de Usuario

Esta sección está en este [fichero](docs/user-stories.md).

---

## 6. Tickets de Trabajo

Esta sección está en este [fichero](docs/work-tickets.md).

---

## 7. Pull Requests

> Documenta 3 de las Pull Requests realizadas durante la ejecución del proyecto

Pendiente 

**Pull Request 1**

**Pull Request 2**

**Pull Request 3**
