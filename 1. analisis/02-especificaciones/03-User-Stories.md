# 📝 USER STORIES - RRFinances Sistema Web Financiero Core

**Proyecto:** RRFinances - Sistema Web Financiero Core  
**Fase:** 1  
**Fecha de Generación:** 17 de Diciembre de 2025  
**Total de User Stories:** 5

---

## 📊 RESUMEN EJECUTIVO

| ID | Título | User Persona | Prioridad | Esfuerzo |
|----|--------|-------------|-----------|----------|
| **US-001** | Configuración y Administración Global del Sistema Multi-Tenant | Super Administrador | CRÍTICA | 8 semanas |
| **US-002** | Gestión de Usuarios, Roles y Permisos de la Cooperativa | Administrador Cooperativa | ALTA | 6 semanas |
| **US-003** | Registro y Gestión Completa de Clientes con Apoderados y Poderes | Oficial de Crédito | CRÍTICA | 10 semanas |
| **US-004** | Consulta Rápida de Clientes y Visualización de Alertas | Personal Atención Cliente | ALTA | 3 semanas |
| **US-005** | Auditoría y Supervisión de Operaciones del Sistema | Auditor/Supervisor | MEDIA | 5 semanas |

**Esfuerzo Total Estimado:** 32 semanas (~8 meses)

---

## 👥 USER PERSONAS IDENTIFICADOS

1. **Super Administrador del Sistema** - Responsable de la configuración global del sistema
2. **Administrador de Cooperativa** - Administrador de una cooperativa específica
3. **Oficial de Crédito** - Personal operativo que gestiona la relación con los clientes
4. **Personal de Atención al Cliente** - Personal de ventanilla que consulta información
5. **Auditor/Supervisor** - Responsable de supervisión y auditoría de operaciones

---

# 🎯 DETALLE DE USER STORIES

## **US-001: Configuración y Administración Global del Sistema Multi-Tenant**

### 👤 User Persona
**Super Administrador del Sistema**

### 📖 Descripción
Como **Super Administrador del Sistema**, quiero poder configurar y administrar globalmente el sistema multi-tenant, gestionar cooperativas, usuarios administradores, catálogos maestros y monitorear la seguridad del sistema, para garantizar un funcionamiento óptimo y seguro de la plataforma RRFinances para todas las cooperativas.

### 🎯 Criterios de Aceptación

#### 1. Autenticación Segura
- ✅ El sistema permite login con usuario y contraseña
- ✅ Genera tokens JWT con expiración configurable
- ✅ Registra todos los intentos de login (exitosos y fallidos)
- ✅ Bloquea cuentas tras N intentos fallidos consecutivos
- ✅ Permite recuperación de contraseña mediante email

#### 2. Gestión de Cooperativas (Multi-tenant)
- ✅ Puede crear, editar y desactivar cooperativas
- ✅ Cada cooperativa tiene código único, razón social, RUC y logo
- ✅ Configuración JSON personalizada por cooperativa
- ✅ Separación estricta de datos entre cooperativas

#### 3. Gestión de Roles y Permisos Globales
- ✅ Puede crear y gestionar roles predefinidos (SuperAdmin, Admin, Operador, Consultor)
- ✅ Asignar permisos granulares por módulo/submódulo/acción
- ✅ Validar que siempre exista al menos un SuperAdmin activo
- ✅ Visualizar matriz de permisos por rol

#### 4. Catálogos Maestros Oficiales
- ✅ Puede sincronizar catálogos oficiales del INEC (provincias, cantones, parroquias)
- ✅ Configurar nuevos tipos de catálogos
- ✅ Importación masiva desde Excel/CSV con validación
- ✅ Exportación de catálogos con filtros aplicados

#### 5. Auditoría y Monitoreo
- ✅ Acceso completo a logs de auditoría de todas las cooperativas
- ✅ Visualizar eventos críticos del sistema
- ✅ Generar reportes de actividad por cooperativa
- ✅ Monitorear intentos de acceso no autorizado

### 📋 Requisitos Funcionales Asociados
- RF-AUTH-001: Login de Usuario
- RF-AUTH-002: Recuperación de Contraseña
- RF-AUTH-003: Cierre de Sesión
- RF-AUTH-004: Gestión de Sesiones
- RF-USR-007: Gestión de Roles
- RF-USR-008: Gestión de Permisos
- RF-USR-009: Perfiles de Usuario
- RF-CAT-008: Configuración de Catálogos
- RF-CAT-009: Importación Masiva
- RF-CAT-010: Sincronización de Catálogos Oficiales
- Multi-tenancy
- Auditoría Transversal

### 🎨 Prioridad
**CRÍTICA** - Base fundamental del sistema

### ⏱️ Esfuerzo Estimado
**8 semanas**
- Backend: 5 semanas
- Frontend: 3 semanas

### 📦 Módulos Involucrados
- Autenticación
- Usuarios (Roles y Permisos)
- Catálogos Maestros
- Auditoría
- Multi-tenancy

---

## **US-002: Gestión de Usuarios, Roles y Permisos de la Cooperativa**

### 👤 User Persona
**Administrador de Cooperativa**

### 📖 Descripción
Como **Administrador de Cooperativa**, quiero gestionar los usuarios de mi cooperativa, asignarles roles y permisos apropiados, y personalizar catálogos según nuestras necesidades, para controlar el acceso al sistema y mantener la información actualizada de mi organización.

### 🎯 Criterios de Aceptación

#### 1. Creación de Usuarios
- ✅ Puede registrar nuevos usuarios con datos completos (nombres, identificación, email, teléfono)
- ✅ Asignar roles, perfiles y sucursal/agencia
- ✅ Genera contraseña temporal y notifica al usuario
- ✅ Valida unicidad de usuario, email e identificación dentro de la cooperativa
- ✅ Obliga cambio de contraseña en primer acceso

#### 2. Edición y Gestión de Usuarios
- ✅ Puede modificar datos de usuarios existentes
- ✅ El nombre de usuario es inmutable
- ✅ Mantiene historial de cambios con auditoría
- ✅ Puede desactivar/activar usuarios con motivo registrado
- ✅ Puede resetear contraseñas de usuarios

#### 3. Búsqueda y Filtrado de Usuarios
- ✅ Búsqueda por nombre de usuario, nombres, identificación, email, estado, rol
- ✅ Filtros avanzados combinables
- ✅ Paginación de resultados
- ✅ Exportación a Excel/CSV
- ✅ Guardado de filtros frecuentes

#### 4. Gestión de Roles y Permisos Locales
- ✅ Visualizar roles disponibles y sus permisos
- ✅ Asignar/remover roles a usuarios
- ✅ No puede modificar roles predefinidos del sistema
- ✅ Puede crear perfiles personalizados con configuraciones

#### 5. Gestión de Catálogos Personalizados
- ✅ Crear, editar y desactivar registros en catálogos
- ✅ Gestión de catálogos jerárquicos (Provincia→Cantón→Parroquia)
- ✅ Validación de uso antes de eliminar registros
- ✅ Soft delete para registros en uso
- ✅ Búsqueda por código o descripción
- ✅ Exportación de catálogos a Excel/CSV

### 📋 Requisitos Funcionales Asociados
- RF-USR-001: Crear Usuario
- RF-USR-002: Editar Usuario
- RF-USR-003: Desactivar/Activar Usuario
- RF-USR-004: Resetear Contraseña
- RF-USR-005: Buscar Usuarios
- RF-USR-006: Filtros Avanzados
- RF-USR-007: Gestión de Roles
- RF-USR-009: Perfiles de Usuario
- RF-CAT-001: Crear Registro de Catálogo
- RF-CAT-002: Editar Registro de Catálogo
- RF-CAT-003: Eliminar/Desactivar Registro
- RF-CAT-004: Catálogos Jerárquicos
- RF-CAT-005: Consultar Catálogos
- RF-CAT-006: API de Catálogos
- RF-CAT-007: Exportación de Catálogos

### 🎨 Prioridad
**ALTA** - Necesario para operación de cooperativa

### ⏱️ Esfuerzo Estimado
**6 semanas**
- Backend: 4 semanas
- Frontend: 2 semanas

### 📦 Módulos Involucrados
- Usuarios (Gestión)
- Usuarios (Búsqueda)
- Usuarios (Roles y Permisos)
- Catálogos Maestros

---

## **US-003: Registro y Gestión Completa de Clientes con Apoderados y Poderes**

### 👤 User Persona
**Oficial de Crédito**

### 📖 Descripción
Como **Oficial de Crédito**, quiero registrar y gestionar información completa de clientes, sus apoderados y poderes legales, incluyendo validación de cédulas ecuatorianas y carga de documentos, para mantener actualizada la base de socios y cumplir con requisitos legales de representación.

### 🎯 Criterios de Aceptación

#### 1. Creación de Clientes
- ✅ Puede registrar nuevos clientes con datos personales completos (desde tabla Personas)
- ✅ Validación automática de cédula ecuatoriana (algoritmo específico)
- ✅ Validación de mayoría de edad (18 años) o asignación de representante legal
- ✅ Si la persona existe, puede referenciarla sin duplicar datos
- ✅ Asignar código de cliente (autogenerado o manual)
- ✅ Definir tipo de cliente, oficina, oficial asignado, segmento
- ✅ Captura/carga de fotografía (máx. 500KB, formato JPEG/PNG)
- ✅ Número de identificación único en el sistema

#### 2. Edición de Clientes
- ✅ Puede actualizar datos personales y específicos del cliente
- ✅ Cambiar oficina, oficial asignado, segmento
- ✅ Actualizar fotografía
- ✅ Número de identificación es inmutable
- ✅ Mantiene auditoría completa de cambios

#### 3. Cambio de Estado de Cliente
- ✅ Puede activar, inactivar o suspender clientes
- ✅ Motivo obligatorio para inactivación
- ✅ Validación de operaciones activas antes de inactivar
- ✅ Registro de histórico de estados

#### 4. Gestión de Mensajes a Clientes
- ✅ Registrar mensajes/alertas asociados a clientes
- ✅ Tipos: informativo, advertencia, crítico
- ✅ Definir fecha de vigencia (desde-hasta)
- ✅ Mensajes críticos requieren confirmación
- ✅ Despliegue automático al consultar cliente
- ✅ Registro de visualizaciones

#### 5. Gestión de Apoderados
- ✅ Registrar personas como apoderados (usa tabla Personas)
- ✅ Búsqueda de persona existente o registro de nueva
- ✅ Validación de mayoría de edad
- ✅ No puede ser el mismo cliente
- ✅ Tipos de apoderado según catálogo
- ✅ Carga de documentos de respaldo

#### 6. Gestión de Poderes
- ✅ Registrar poderes legales entre cliente y apoderado
- ✅ Tipos de poder según catálogo
- ✅ Datos completos: escritura, fechas, notaría, alcance
- ✅ Carga de documento PDF (máx. 2MB) mediante drag & drop
- ✅ Validación de vigencia (fecha inicio ≤ fecha fin)
- ✅ Estados: vigente, vencido, revocado
- ✅ Vencimiento automático según fecha fin
- ✅ Alertas 30 días antes de vencimiento
- ✅ Visualización y descarga de PDF
- ✅ No permitir poderes duplicados vigentes

### 📋 Requisitos Funcionales Asociados
- RF-CLI-001: Creación de Clientes
- RF-CLI-002: Mensajes a Clientes
- RF-CLI-003: Gestión de Apoderados
- RF-CLI-004: Gestión de Poderes
- RF-CLI-005: Editar Cliente
- RF-CLI-006: Cambio de Estado de Cliente
- Modelo de Personas (tabla base compartida)
- Validación de Cédula Ecuatoriana
- Soft Delete

### 🎨 Prioridad
**CRÍTICA** - Funcionalidad core del negocio

### ⏱️ Esfuerzo Estimado
**10 semanas**
- Backend: 6 semanas
- Frontend: 4 semanas

### 📦 Módulos Involucrados
- Clientes (Gestión)
- Apoderados
- Poderes
- Mensajes a Clientes
- Modelo Base de Personas

### 🔧 Consideraciones Técnicas
- Implementar algoritmo de validación de cédula ecuatoriana
- Almacenamiento de archivos (fotografías y PDFs)
- Proceso batch para vencimiento automático de poderes
- Sistema de alertas para poderes próximos a vencer

---

## **US-004: Consulta Rápida de Clientes y Visualización de Alertas**

### 👤 User Persona
**Personal de Atención al Cliente**

### 📖 Descripción
Como **Personal de Atención al Cliente**, quiero consultar rápidamente información de clientes, visualizar mensajes y alertas importantes, y acceder a su estado financiero básico, para brindar atención eficiente y estar informado sobre situaciones especiales de cada socio.

### 🎯 Criterios de Aceptación

#### 1. Búsqueda Rápida de Clientes
- ✅ Búsqueda por código de cliente, identificación, nombres, apellidos, email, teléfono
- ✅ Búsqueda parcial en nombres y apellidos
- ✅ Búsqueda combinada con operadores lógicos
- ✅ Resultados en menos de 1 segundo
- ✅ Paginación de resultados

#### 2. Visualización de Información Completa
- ✅ Vista de datos personales completos
- ✅ Vista de datos específicos del cliente
- ✅ Fotografía del cliente
- ✅ Apoderados y poderes vigentes
- ✅ Resumen de relación con la cooperativa
- ✅ Modo lectura con opción de editar (según permisos)

#### 3. Mensajes y Alertas Automáticas
- ✅ Al consultar cliente, sistema verifica mensajes activos vigentes
- ✅ Despliegue automático en modal/alerta
- ✅ Visualización de todos los mensajes pendientes
- ✅ Mensajes críticos deben confirmarse antes de continuar
- ✅ Registro de visualización (fecha/hora/usuario)
- ✅ Histórico de mensajes visible en perfil

#### 4. Estado Económico del Cliente (Estructura Fase 1)
- ✅ Vista con secciones placeholder para:
  - Cuentas de ahorro
  - Inversiones
  - Créditos
  - Garantías
  - Resumen financiero
- ✅ Mensaje indicando disponibilidad en fases futuras

#### 5. Exportación e Impresión
- ✅ Exportar información del cliente a PDF
- ✅ Impresión de ficha del cliente
- ✅ Formato profesional con logo de cooperativa

### 📋 Requisitos Funcionales Asociados
- RF-CLI-007: Consultar Clientes
- RF-CLI-008: Estado Económico del Cliente
- RF-CLI-002: Visualización de Mensajes a Clientes

### 🎨 Prioridad
**ALTA** - Operación diaria esencial

### ⏱️ Esfuerzo Estimado
**3 semanas**
- Backend: 1 semana
- Frontend: 2 semanas

### 📦 Módulos Involucrados
- Clientes (Búsqueda)
- Mensajes a Clientes
- Estado Económico (estructura básica)

### 🔧 Consideraciones Técnicas
- Optimización de consultas para respuesta < 1 segundo
- Sistema de alertas modal para mensajes críticos
- Índices en campos de búsqueda frecuente

---

## **US-005: Auditoría y Supervisión de Operaciones del Sistema**

### 👤 User Persona
**Auditor/Supervisor**

### 📖 Descripción
Como **Auditor/Supervisor**, quiero acceder a logs completos de auditoría del sistema, generar reportes de actividad de usuarios y operaciones, y consultar históricos de cambios, para supervisar el correcto funcionamiento del sistema y detectar irregularidades.

### 🎯 Criterios de Aceptación

#### 1. Acceso a Logs de Auditoría
- ✅ Visualización de todos los eventos auditados:
  - Login/Logout/Intentos fallidos
  - CRUD de usuarios, roles y permisos
  - CRUD de clientes, apoderados y poderes
  - CRUD de catálogos
  - Cambios de estado
- ✅ Información detallada: módulo, acción, entidad, usuario, IP, fecha/hora
- ✅ Datos antes/después para modificaciones (JSONB)

#### 2. Filtrado y Búsqueda Avanzada
- ✅ Filtrar por módulo, acción, usuario, rango de fechas, entidad
- ✅ Búsqueda por ID de registro afectado
- ✅ Filtrado por IP de origen
- ✅ Combinación de múltiples filtros
- ✅ Paginación de resultados

#### 3. Reportes de Clientes por Fechas
- ✅ Filtros obligatorios: oficina, tipo de cliente, rango de fechas de ingreso
- ✅ Filtros opcionales: estado, oficial, segmento, provincia/cantón
- ✅ Campos base del reporte: código, identificación, nombres, tipo, fecha ingreso, oficina, estado
- ✅ Selección múltiple de campos adicionales (email, teléfonos, dirección, apoderados, etc.)
- ✅ Ordenamiento por cualquier columna
- ✅ Exportación a Excel con formato
- ✅ Exportación a PDF
- ✅ Totalizadores (cantidad de clientes)
- ✅ Guardado de configuración de reporte

#### 4. Consulta de Históricos
- ✅ Ver histórico completo de cambios en clientes
- ✅ Ver histórico de estados de usuarios
- ✅ Ver histórico de cambios en catálogos
- ✅ Trazabilidad completa con usuario y fecha

#### 5. Monitoreo de Seguridad
- ✅ Visualizar intentos de acceso fallidos
- ✅ Cuentas bloqueadas
- ✅ Actividad sospechosa
- ✅ Accesos fuera de horario

### 📋 Requisitos Funcionales Asociados
- Módulo de Auditoría Transversal (completo)
- RF-CLI-009: Clientes por Fechas
- Todos los registros de auditoría generados por otros módulos

### 🎨 Prioridad
**MEDIA** - Importante para control y supervisión

### ⏱️ Esfuerzo Estimado
**5 semanas**
- Backend: 3 semanas
- Frontend: 2 semanas

### 📦 Módulos Involucrados
- Auditoría (módulo transversal)
- Reportes
- Logs del Sistema

### 🔧 Consideraciones Técnicas
- Tabla `audit_logs` con campos JSONB para flexibilidad
- Índices en campos de filtrado frecuente
- Paginación del lado del servidor para grandes volúmenes
- Optimización de consultas de reportes complejos

---

## 📈 DISTRIBUCIÓN DE ESFUERZO

### Por Prioridad
- **CRÍTICA:** 18 semanas (56%)
  - US-001: 8 semanas
  - US-003: 10 semanas
- **ALTA:** 9 semanas (28%)
  - US-002: 6 semanas
  - US-004: 3 semanas
- **MEDIA:** 5 semanas (16%)
  - US-005: 5 semanas

### Por Área de Desarrollo
- **Backend:** ~19 semanas
- **Frontend:** ~13 semanas

### Por Módulo Principal
- **Clientes:** 13 semanas (US-003 + US-004)
- **Usuarios y Autenticación:** 14 semanas (US-001 + US-002)
- **Auditoría:** 5 semanas (US-005)

---

## 🎯 ORDEN DE DESARROLLO RECOMENDADO

### Sprint 1-4 (8 semanas)
**US-001: Configuración y Administración Global del Sistema Multi-Tenant**
- Base fundamental del sistema
- Multi-tenancy
- Autenticación y seguridad

### Sprint 5-9 (6 semanas)
**US-002: Gestión de Usuarios, Roles y Permisos de la Cooperativa**
- Gestión de usuarios
- Catálogos maestros

### Sprint 10-19 (10 semanas)
**US-003: Registro y Gestión Completa de Clientes con Apoderados y Poderes**
- Funcionalidad core del negocio
- Modelo de Personas
- Validación de cédula

### Sprint 20-22 (3 semanas)
**US-004: Consulta Rápida de Clientes y Visualización de Alertas**
- Complementa funcionalidad de clientes
- Búsqueda optimizada

### Sprint 23-27 (5 semanas)
**US-005: Auditoría y Supervisión de Operaciones del Sistema**
- Reportes y auditoría
- Supervisión

---

## 📋 DEPENDENCIAS ENTRE USER STORIES

```
US-001 (Base del Sistema)
  ↓
  ├─→ US-002 (Usuarios y Catálogos)
  │     ↓
  │     └─→ US-003 (Clientes)
  │           ↓
  │           └─→ US-004 (Búsqueda y Consultas)
  │
  └─→ US-005 (Auditoría) ← (Se ejecuta en paralelo desde el inicio)
```

**Notas sobre Dependencias:**
- **US-001** es prerequisito para todas las demás
- **US-002** debe completarse antes de **US-003** (necesita catálogos)
- **US-004** depende de **US-003** (necesita datos de clientes)
- **US-005** puede desarrollarse en paralelo una vez exista US-001

---

## 📊 MÉTRICAS DE ÉXITO

### Por User Story

**US-001:**
- ✅ 100% de operaciones críticas con JWT válido
- ✅ Uptime > 99.5%
- ✅ Login < 2 segundos

**US-002:**
- ✅ Búsqueda de usuarios < 1 segundo
- ✅ 100% de operaciones auditadas
- ✅ Exportación de 10,000 registros < 10 segundos

**US-003:**
- ✅ Validación de cédula < 100ms
- ✅ Carga de fotografía < 3 segundos
- ✅ 100% validación de poderes vigentes

**US-004:**
- ✅ Búsqueda de clientes < 1 segundo
- ✅ 100% de mensajes críticos confirmados
- ✅ Exportación PDF < 5 segundos

**US-005:**
- ✅ Consulta de logs < 2 segundos
- ✅ Reportes de 10,000 registros < 10 segundos
- ✅ 100% trazabilidad de cambios

---

## 🔄 PRÓXIMOS PASOS

1. **Validación de User Stories** con stakeholders
2. **Generación de Work Tickets (Jira)** - Desglose técnico detallado
3. **Definición de Sprints** - Planificación temporal
4. **Configuración de Ambiente de Desarrollo**
5. **Inicio de Desarrollo** por orden de prioridad

---

## 📝 NOTAS ADICIONALES

- Todas las User Stories incluyen **soft delete** para trazabilidad
- **Multi-tenancy** implementado desde US-001
- **Modelo de Personas** compartido reduce duplicidad
- **Auditoría transversal** registra todas las operaciones críticas
- **Validación de cédula ecuatoriana** específica para el mercado objetivo

---

**Documento Generado:** 17 de Diciembre de 2025  
**Versión:** 1.0  
**Estado:** Aprobado para generación de Work Tickets
