# Documento de Requisitos del Producto (PRD)
## RRFinances - Sistema Web Financiero Core

---

## 5.4 MÓDULO DE CLIENTES

### 5.4.1 Descripción
Módulo central para la gestión integral de clientes de la cooperativa. Permite registrar, actualizar y consultar información de socios y clientes, así como gestionar sus apoderados y poderes legales. Este módulo trabaja sobre el modelo base de **Personas** para evitar duplicidad de datos.

### 5.4.2 Submódulos
- **Gestión:** CRUD de clientes, mensajes, apoderados y poderes
- **Búsqueda:** Consultas de clientes y su información financiera

### 5.4.3 Requisitos Funcionales

#### Submódulo de Gestión

**RF-CLI-001: Creación de Clientes**

El sistema debe permitir registrar nuevos clientes con la siguiente información:

**Datos Personales (desde tabla `personas`):**
- Tipo de identificación (cédula, RUC, pasaporte)
- Número de identificación (con validación de cédula ecuatoriana)
- Nombres y apellidos
- Fecha de nacimiento
- Género
- Estado civil
- Nacionalidad
- Nivel de instrucción
- Profesión
- Email
- Teléfonos (convencional y celular)
- Dirección completa (provincia, cantón, parroquia, dirección domicilio, referencia)
- Código dactilar (opcional)
- Fotografía (opcional)

**Datos Específicos del Cliente:**
- Código de cliente (autogenerado o manual)
- Tipo de cliente (socio, cliente, otros según catálogo)
- Fecha de ingreso
- Oficina/sucursal de registro
- Oficial de crédito asignado
- Segmento de cliente
- Estado del cliente

**Validaciones:**
- Número de identificación único en el sistema
- Validación de cédula ecuatoriana según algoritmo
- Cliente debe ser mayor de edad (18 años) o tener representante legal
- Email válido y único
- Teléfono celular obligatorio
- Validación de jerarquía geográfica (provincia-cantón-parroquia)

**Funcionalidades Adicionales:**
- Si la persona ya existe en tabla `personas`, permitir crear cliente referenciando persona existente
- Captura de fotografía desde cámara web o carga de archivo
- Captura de huella dactilar (integración futura)
- Generación automática de código de cliente según configuración

**RF-CLI-002: Mensajes a Clientes**

El sistema debe permitir registrar mensajes/alertas asociadas a clientes específicos que se desplegarán automáticamente cuando un operador consulte al cliente.

**Características:**
- Tipo de mensaje (informativo, advertencia, crítico)
- Título del mensaje (máx. 100 caracteres)
- Descripción del mensaje (máx. 500 caracteres)
- Fecha de vigencia (desde - hasta)
- Usuario que registra el mensaje
- Estado del mensaje (activo/inactivo)
- Indicador de "mostrado" (para tracking)

**Comportamiento:**
- Al consultar un cliente, el sistema verifica mensajes activos vigentes
- Se despliega modal/alerta con todos los mensajes pendientes
- Se registra fecha/hora y usuario que visualizó el mensaje
- Mensajes críticos deben confirmarse antes de continuar
- Histórico de mensajes visible en perfil del cliente

**Casos de Uso:**
- Alertas de morosidad
- Restricciones operativas
- Información sobre situaciones especiales
- Recordatorios de documentación pendiente

**RF-CLI-003: Gestión de Apoderados**

El sistema debe permitir registrar personas que actuarán como apoderados de clientes.

**Datos del Apoderado:**
- Información personal completa (usa tabla `personas`)
- Tipo de apoderado (general, especial, judicial, según catálogo)
- Fecha de registro en el sistema
- Estado (activo/inactivo)
- Documentos de respaldo (escaneados)

**Validaciones:**
- Apoderado debe ser persona mayor de edad
- Número de identificación único
- No puede ser el mismo cliente
- Validación de cédula ecuatoriana

**Funcionalidades:**
- Búsqueda de persona existente para asignar como apoderado
- Registro de nueva persona como apoderado
- Historial de poderes del apoderado
- Vista de todos los clientes sobre los que tiene poder

**RF-CLI-004: Gestión de Poderes**

El sistema debe permitir registrar y gestionar los poderes legales que relacionan apoderados con clientes.

**Datos del Poder:**
- Cliente (FK)
- Apoderado (FK)
- Tipo de poder (general, especial, notarial, judicial, según catálogo)
- Número de escritura pública/documento legal
- Fecha de otorgamiento
- Fecha de inicio de vigencia
- Fecha de fin de vigencia
- Notaría (si aplica)
- Alcance del poder (descripción detallada)
- Documento PDF del poder (máx. 2MB)
- Estado (vigente, vencido, revocado)
- Usuario que registra
- Fecha de registro

**Validaciones:**
- Fecha inicio debe ser menor o igual a fecha fin
- Cliente y apoderado deben existir y estar activos
- No permitir poderes duplicados (mismo cliente-apoderado-tipo vigentes)
- Documento PDF obligatorio
- Tamaño de PDF no mayor a 2MB
- Fecha de inicio no puede ser futura (salvo configuración especial)

**Funcionalidades:**
- Carga de documento PDF mediante drag & drop o selector de archivo
- Visualización de documento PDF en línea
- Descarga de documento
- Vencimiento automático de poderes según fecha fin
- Alertas de poderes próximos a vencer (configurable)
- Revocación manual de poderes
- Historial de cambios de estado
- Validación de vigencia en operaciones

**Reglas de Negocio:**
- Un apoderado puede tener múltiples poderes sobre diferentes clientes
- Un cliente puede tener múltiples apoderados
- Solo pueden existir poderes vigentes del mismo tipo por cliente-apoderado
- Poderes vencidos se marcan automáticamente por proceso batch
- Operaciones sensibles requieren validar vigencia del poder

**RF-CLI-005: Editar Cliente**

El sistema debe permitir modificar información del cliente:
- Actualización de datos personales (tabla `personas`)
- Actualización de datos específicos del cliente
- Cambio de oficina/oficial asignado
- Cambio de segmento
- Actualización de fotografía
- No permitir cambiar número de identificación (campo inmutable)
- Mantener auditoría de todos los cambios

**RF-CLI-006: Cambio de Estado de Cliente**

El sistema debe permitir cambiar el estado del cliente:
- Activar cliente
- Inactivar cliente (con motivo obligatorio)
- Suspender cliente temporalmente
- Validar que no tenga operaciones activas antes de inactivar
- Registrar histórico de cambios de estado

#### Submódulo de Búsqueda

**RF-CLI-007: Consultar Clientes**

El sistema debe permitir buscar y visualizar información completa de clientes.

**Criterios de Búsqueda:**
- Por código de cliente
- Por número de identificación
- Por nombres y/o apellidos (búsqueda parcial)
- Por email
- Por teléfono
- Por código dactilar
- Búsqueda combinada con operadores lógicos

**Información a Mostrar:**
- Datos personales completos
- Datos específicos del cliente
- Mensajes activos asociados
- Apoderados y poderes vigentes
- Fotografía
- Resumen de relación con la cooperativa
- Histórico de cambios importantes

**Funcionalidades:**
- Vista en modo lectura con opción de editar (según permisos)
- Acceso rápido a módulos relacionados (cuentas, créditos - futura fase)
- Exportar información del cliente a PDF
- Impresión de ficha del cliente

**RF-CLI-008: Estado Económico del Cliente**

El sistema debe proporcionar una vista consolidada del estado económico del cliente.

**Nota:** Esta funcionalidad quedará parcialmente implementada en Fase 1 como estructura preparada, y se completará en fases futuras cuando estén disponibles los módulos financieros.

**Información a Mostrar (Fase 1 - Estructura):**
- Sección de cuentas de ahorro (placeholder)
- Sección de inversiones (placeholder)
- Sección de créditos (placeholder)
- Sección de garantías (placeholder)
- Resumen financiero (placeholder)

**Información a Mostrar (Fases Futuras):**
- Listado de cuentas de ahorro con saldos
- Listado de inversiones vigentes
- Listado de créditos activos con saldos
- Garantías registradas
- Resumen de activos y pasivos
- Indicadores financieros (capacidad de endeudamiento, morosidad, etc.)
- Gráficas de evolución

**RF-CLI-009: Clientes por Fechas**

El sistema debe permitir consultar listados de clientes con filtros configurables.

**Filtros Obligatorios:**
- Oficina/Sucursal (puede seleccionar "Todas")
- Tipo de Cliente (puede seleccionar "Todos")
- Fecha Desde (fecha de ingreso)
- Fecha Hasta (fecha de ingreso)

**Filtros Opcionales:**
- Estado del cliente
- Oficial de crédito
- Segmento
- Provincia/Cantón

**Campos Base del Reporte:**
- Código de cliente
- Número de identificación
- Nombres completos
- Tipo de cliente
- Fecha de ingreso
- Oficina
- Estado

**Campos Adicionales Seleccionables:**
- Email
- Código dactilar
- Teléfono celular
- Teléfono convencional
- Dirección de domicilio
- Provincia/Cantón/Parroquia
- Representante legal (en caso de menores de edad)
- Apoderado(s) vigente(s)
- Oficial de crédito
- Segmento
- Fecha de nacimiento
- Edad
- Género
- Estado civil
- Nivel de instrucción

**Funcionalidades:**
- Selección múltiple de campos adicionales mediante checkboxes
- Ordenamiento por cualquier columna
- Paginación de resultados
- Exportación a Excel con formato
- Exportación a PDF
- Guardado de configuración de reporte para uso frecuente
- Totalizadores en pie de reporte (cantidad de clientes)

**Consideraciones de Performance:**
- Implementar paginación del lado del servidor
- Consultas optimizadas con índices apropiados
- Límite de registros por exportación (configurable)
- Caché de catálogos para mejorar velocidad

### 5.4.4 Modelo de Datos - Tablas Específicas

**Tabla: `clientes`**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| persona_id | FK (UUID) | Referencia a tabla personas - PK |
| codigo_cliente | VARCHAR(20) | Código único de cliente |
| tipo_cliente_id | FK | Tipo de cliente (catálogo) |
| fecha_ingreso | DATE | Fecha de ingreso a la cooperativa |
| oficina_id | FK | Oficina/sucursal de registro |
| oficial_credito_id | FK | Usuario asignado como oficial |
| segmento_id | FK | Segmento del cliente (catálogo) |
| estado | VARCHAR(20) | ACTIVO, INACTIVO, SUSPENDIDO |
| motivo_estado | TEXT | Razón del estado actual |
| cooperativa_id | FK | ID de cooperativa (multi-tenancy) |
| fecha_creacion | TIMESTAMP | Timestamp de creación |
| usuario_creacion | FK | Usuario que creó |
| fecha_modificacion | TIMESTAMP | Última modificación |
| usuario_modificacion | FK | Usuario que modificó |
| fecha_eliminacion | TIMESTAMP | Soft delete |
| usuario_eliminacion | FK | Usuario que eliminó |

**Tabla: `clientes_mensajes`**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | PK |
| cliente_id | FK | Referencia a clientes |
| tipo_mensaje | VARCHAR(20) | INFORMATIVO, ADVERTENCIA, CRITICO |
| titulo | VARCHAR(100) | Título del mensaje |
| descripcion | TEXT | Descripción detallada |
| fecha_desde | DATE | Inicio de vigencia |
| fecha_hasta | DATE | Fin de vigencia |
| estado | CHAR(1) | A=Activo, I=Inactivo |
| requiere_confirmacion | BOOLEAN | Si requiere confirmación |
| cooperativa_id | FK | Multi-tenancy |
| fecha_creacion | TIMESTAMP | Timestamp de creación |
| usuario_creacion | FK | Usuario que creó |
| fecha_modificacion | TIMESTAMP | Última modificación |
| usuario_modificacion | FK | Usuario que modificó |

**Tabla: `clientes_mensajes_visualizaciones`**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | PK |
| mensaje_id | FK | Referencia a clientes_mensajes |
| usuario_id | FK | Usuario que visualizó |
| fecha_visualizacion | TIMESTAMP | Cuándo se visualizó |
| confirmado | BOOLEAN | Si confirmó lectura |
| cooperativa_id | FK | Multi-tenancy |

**Tabla: `apoderados`**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| persona_id | FK (UUID) | Referencia a personas - PK |
| tipo_apoderado_id | FK | Tipo de apoderado (catálogo) |
| fecha_registro | DATE | Fecha de registro |
| estado | CHAR(1) | A=Activo, I=Inactivo |
| cooperativa_id | FK | Multi-tenancy |
| fecha_creacion | TIMESTAMP | Timestamp de creación |
| usuario_creacion | FK | Usuario que creó |
| fecha_modificacion | TIMESTAMP | Última modificación |
| usuario_modificacion | FK | Usuario que modificó |
| fecha_eliminacion | TIMESTAMP | Soft delete |
| usuario_eliminacion | FK | Usuario que eliminó |

**Tabla: `poderes`**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | PK |
| cliente_id | FK | Referencia a clientes |
| apoderado_id | FK | Referencia a apoderados |
| tipo_poder_id | FK | Tipo de poder (catálogo) |
| numero_escritura | VARCHAR(50) | Número de documento legal |
| fecha_otorgamiento | DATE | Fecha de otorgamiento |
| fecha_inicio | DATE | Inicio de vigencia |
| fecha_fin | DATE | Fin de vigencia |
| notaria | VARCHAR(200) | Notaría que legalizó |
| alcance | TEXT | Descripción del alcance |
| documento_url | VARCHAR(500) | URL del PDF del documento |
| documento_nombre | VARCHAR(255) | Nombre original del archivo |
| documento_tamanio | INTEGER | Tamaño en bytes |
| estado | VARCHAR(20) | VIGENTE, VENCIDO, REVOCADO |
| motivo_revocacion | TEXT | Si fue revocado |
| cooperativa_id | FK | Multi-tenancy |
| fecha_creacion | TIMESTAMP | Timestamp de creación |
| usuario_creacion | FK | Usuario que creó |
| fecha_modificacion | TIMESTAMP | Última modificación |
| usuario_modificacion | FK | Usuario que modificó |
| fecha_eliminacion | TIMESTAMP | Soft delete |
| usuario_eliminacion | FK | Usuario que eliminó |

### 5.4.5 Requisitos No Funcionales

**RNF-CLI-001:** La búsqueda de clientes debe retornar resultados en menos de 1 segundo  
**RNF-CLI-002:** El sistema debe soportar al menos 100,000 clientes registrados  
**RNF-CLI-003:** La carga de fotografías debe completarse en menos de 3 segundos  
**RNF-CLI-004:** Los documentos PDF deben estar limitados a 2MB y validarse en cliente y servidor  
**RNF-CLI-005:** Todas las operaciones de clientes deben registrarse en auditoría  
**RNF-CLI-006:** El reporte de "Clientes por Fechas" debe generar hasta 10,000 registros en menos de 10 segundos  
**RNF-CLI-007:** Las imágenes de clientes deben almacenarse en formato optimizado (JPEG, máx. 500KB)  
**RNF-CLI-008:** El sistema debe validar vigencia de poderes en tiempo real (< 500ms)

### 5.4.6 Reglas de Negocio Adicionales

1. **Mayoría de Edad:**
   - Clientes menores de 18 años requieren representante legal
   - El representante debe ser registrado en tabla `personas` y vinculado

2. **Unicidad:**
   - Un número de identificación solo puede tener un registro activo de cliente
   - Si existe cliente inactivo con misma identificación, puede reactivarse

3. **Poderes:**
   - Validación automática de vigencia antes de operaciones
   - Notificación 30 días antes de vencimiento de poder
   - Proceso batch nocturno marca poderes vencidos

4. **Mensajes:**
   - Mensajes críticos bloquean operaciones hasta confirmar lectura
   - Mensajes vencidos se ocultan automáticamente pero quedan en histórico

5. **Fotografías:**
   - Resolución recomendada: 400x400 píxeles
   - Formatos aceptados: JPG, PNG
   - Almacenamiento en servicio de archivos (filesystem o S3)

6. **Documentos:**
   - Solo PDF para documentos de poderes
   - Validación de integridad con hash
   - Almacenamiento seguro con backup

---

## 1. INFORMACIÓN GENERAL

**Nombre del Producto:** RRFinances  
**Versión del Documento:** 1.0  
**Fecha:** Diciembre 2025  
**Project Manager:** [Por definir]  
**Stakeholders:** Cooperativas de Ahorro y Crédito de Ecuador

---

## 2. RESUMEN EJECUTIVO

RRFinances es un sistema web financiero core diseñado específicamente para cooperativas de ahorro y crédito en Ecuador. Este documento define los requisitos para la Fase 1 del proyecto, que incluye los módulos fundamentales de autenticación, gestión de usuarios y catálogos maestros.

### 2.1 Objetivos del Proyecto
- Desarrollar una plataforma web robusta y escalable para la gestión financiera de cooperativas
- Implementar módulos base que soporten operaciones futuras del core financiero
- Establecer una arquitectura modular multi-tenant que facilite el crecimiento incremental del sistema
- Garantizar seguridad, trazabilidad y auditoría completa en todas las operaciones
- Centralizar información de personas para evitar duplicidad de datos

---

## 3. ALCANCE

### 3.1 Alcance de la Fase 1

**Incluye:**
- Módulo de Autenticación y Login
- Módulo de Gestión de Usuarios
- Módulo de Catálogos Maestros
- Módulo de Clientes (con submódulos de Gestión y Búsqueda)
- Módulo de Auditoría Transversal
- Modelo base de Personas (compartido)
- Infraestructura base del sistema con soporte multi-tenant
- Implementación de soft delete
- Validación de cédula ecuatoriana

**No Incluye (Fases Futuras):**
- Módulos de operaciones financieras (captaciones, colocaciones)
- Módulos de contabilidad
- Reportería avanzada
- Integraciones con sistemas externos

### 3.2 Usuarios Objetivo
- Administradores del sistema
- Personal administrativo de cooperativas
- Usuarios operativos de cooperativas

---

## 4. STACK TECNOLÓGICO

| Componente | Tecnología | Versión Recomendada |
|------------|------------|---------------------|
| Backend | NestJS | 10.x o superior |
| Frontend | Angular + Fuse Template | 17.x o superior |
| Base de Datos | PostgreSQL | 15.x o superior |
| ORM | TypeORM / Prisma | Última estable |
| Autenticación | JWT | - |

---

## 5. MÓDULOS Y FUNCIONALIDADES

## 5.1 MÓDULO DE AUTENTICACIÓN Y LOGIN

### 5.1.1 Descripción
Sistema de autenticación seguro que gestiona el acceso de usuarios al sistema mediante credenciales y tokens JWT.

### 5.1.2 Submódulos
- **Operación:** Procesos de login, logout y recuperación de contraseña

### 5.1.3 Requisitos Funcionales

**RF-AUTH-001: Login de Usuario**
- El sistema debe permitir el inicio de sesión mediante usuario y contraseña
- Debe validar credenciales contra la base de datos
- Debe generar token JWT con expiración configurable
- Debe registrar cada intento de login (exitoso o fallido)
- Debe bloquear cuenta tras N intentos fallidos consecutivos

**RF-AUTH-002: Recuperación de Contraseña**
- El sistema debe permitir solicitar recuperación mediante correo electrónico
- Debe generar token temporal con tiempo de expiración
- Debe enviar enlace de recuperación al correo registrado
- Debe permitir establecer nueva contraseña mediante token válido

**RF-AUTH-003: Cierre de Sesión**
- El sistema debe permitir cerrar sesión de forma manual
- Debe invalidar el token JWT activo
- Debe registrar la fecha/hora de cierre de sesión

**RF-AUTH-004: Gestión de Sesiones**
- El sistema debe validar token en cada petición protegida
- Debe refrescar tokens próximos a expirar
- Debe cerrar sesión automáticamente tras periodo de inactividad

### 5.1.4 Requisitos No Funcionales

**RNF-AUTH-001:** El tiempo de respuesta del login no debe superar 2 segundos  
**RNF-AUTH-002:** Las contraseñas deben almacenarse con hash bcrypt (mínimo 10 rounds)  
**RNF-AUTH-003:** Los tokens JWT deben incluir información mínima (id usuario, roles)  
**RNF-AUTH-004:** Debe implementarse protección contra ataques de fuerza bruta

---

## 5.2 MÓDULO DE GESTIÓN DE USUARIOS

### 5.2.1 Descripción
Módulo encargado de administrar el ciclo de vida completo de los usuarios del sistema, incluyendo creación, edición, desactivación y gestión de permisos.

### 5.2.2 Submódulos
- **Gestión:** CRUD de usuarios
- **Búsqueda:** Consulta y filtrado de usuarios
- **Parámetros:** Configuración de roles y permisos

### 5.2.3 Requisitos Funcionales

#### Submódulo de Gestión

**RF-USR-001: Crear Usuario**
- El sistema debe permitir registrar nuevos usuarios con los siguientes datos:
  - Información básica: nombres, apellidos, identificación, email, teléfono
  - Credenciales: nombre de usuario, contraseña temporal
  - Asignación: roles, perfiles, sucursal/agencia
  - Estado: activo/inactivo
- Debe validar unicidad de usuario, email e identificación
- Debe enviar notificación al usuario creado con credenciales temporales
- Debe obligar cambio de contraseña en primer acceso

**RF-USR-002: Editar Usuario**
- El sistema debe permitir modificar datos del usuario
- No debe permitir cambiar el nombre de usuario (campo inmutable)
- Debe mantener historial de cambios realizados
- Debe validar permisos del usuario que realiza la modificación

**RF-USR-003: Desactivar/Activar Usuario**
- El sistema debe permitir cambiar el estado del usuario
- Debe registrar fecha, hora y usuario que realizó el cambio
- Usuario desactivado no debe poder iniciar sesión
- Debe mantener historial de estados

**RF-USR-004: Resetear Contraseña**
- El sistema debe permitir que administradores reseteen contraseñas
- Debe generar contraseña temporal
- Debe notificar al usuario afectado
- Debe obligar cambio en siguiente login

#### Submódulo de Búsqueda

**RF-USR-005: Buscar Usuarios**
- El sistema debe permitir búsqueda por:
  - Nombre de usuario
  - Nombres y apellidos
  - Identificación
  - Email
  - Estado (activo/inactivo)
  - Rol asignado
- Debe implementar paginación de resultados
- Debe mostrar información resumida en grilla
- Debe permitir exportar resultados a Excel/CSV

**RF-USR-006: Filtros Avanzados**
- El sistema debe permitir combinación de múltiples filtros
- Debe guardar filtros frecuentes del usuario
- Debe permitir ordenamiento por columnas

#### Submódulo de Parámetros

**RF-USR-007: Gestión de Roles**
- El sistema debe permitir crear, editar y eliminar roles
- Cada rol debe tener nombre, descripción y conjunto de permisos
- Debe implementar roles predefinidos: SuperAdmin, Administrador, Operador, Consultor
- Debe validar que al menos un usuario mantenga rol SuperAdmin

**RF-USR-008: Gestión de Permisos**
- El sistema debe mantener catálogo de permisos por módulo/acción
- Debe permitir asignar permisos a roles de forma granular
- Estructura de permisos: Módulo.Submódulo.Acción (ej: Usuarios.Gestión.Crear)

**RF-USR-009: Perfiles de Usuario**
- El sistema debe permitir crear perfiles con configuraciones predefinidas
- Perfiles deben incluir: roles, permisos adicionales, restricciones
- Debe permitir asignar perfiles a usuarios

### 5.2.4 Requisitos No Funcionales

**RNF-USR-001:** La búsqueda de usuarios debe retornar resultados en menos de 1 segundo  
**RNF-USR-002:** El sistema debe soportar al menos 1000 usuarios concurrentes  
**RNF-USR-003:** Toda operación crítica debe registrarse en auditoría  
**RNF-USR-004:** Las contraseñas deben cumplir política: mínimo 8 caracteres, mayúsculas, minúsculas, números y caracteres especiales

---

## 5.3 MÓDULO DE CATÁLOGOS MAESTROS

### 5.3.1 Descripción
Módulo que centraliza la gestión de todos los catálogos y datos maestros del sistema, proporcionando información de referencia para los demás módulos.

### 5.3.2 Catálogos Incluidos en Fase 1

**Catálogos Geográficos:**
- Provincias de Ecuador
- Cantones
- Parroquias

**Catálogos Demográficos:**
- Nivel de instrucción
- Estado civil
- Género
- Tipo de identificación

**Catálogos del Sistema:**
- Estados generales (activo, inactivo, suspendido, etc.)
- Tipos de usuario
- Tipos de transacción
- Monedas

### 5.3.3 Submódulos
- **Gestión:** CRUD de registros del catálogo
- **Búsqueda:** Consulta de catálogos
- **Parámetros:** Configuración de catálogos

### 5.3.4 Requisitos Funcionales

#### Submódulo de Gestión

**RF-CAT-001: Crear Registro de Catálogo**
- El sistema debe permitir agregar nuevos registros a cualquier catálogo
- Debe validar campos obligatorios según tipo de catálogo
- Para catálogos jerárquicos debe validar relación padre-hijo válida
- Debe asignar código único automático o permitir ingreso manual

**RF-CAT-002: Editar Registro de Catálogo**
- El sistema debe permitir modificar registros existentes
- Debe validar que el registro no esté en uso antes de ciertos cambios
- Debe mantener historial de modificaciones
- Código debe ser inmutable una vez creado

**RF-CAT-003: Eliminar/Desactivar Registro**
- El sistema debe validar que el registro no esté siendo utilizado
- Si está en uso, solo permitir desactivación, no eliminación física
- Debe registrar fecha y usuario que realizó la acción
- Debe permitir reactivación de registros desactivados

**RF-CAT-004: Catálogos Jerárquicos**
- El sistema debe soportar catálogos con estructura padre-hijo-nieto
- Ejemplo: Provincia → Cantón → Parroquia
- Debe validar consistencia jerárquica
- Al consultar, debe poder obtener toda la jerarquía

#### Submódulo de Búsqueda

**RF-CAT-005: Consultar Catálogos**
- El sistema debe listar todos los catálogos disponibles
- Debe permitir consultar registros de un catálogo específico
- Debe implementar búsqueda por código o descripción
- Debe permitir filtrar por estado (activo/inactivo)

**RF-CAT-006: API de Catálogos**
- El sistema debe exponer endpoints REST para consumo de catálogos
- Debe implementar caché para catálogos de consulta frecuente
- Debe retornar catálogos en formato JSON
- Debe soportar parámetros de filtro y ordenamiento

**RF-CAT-007: Exportación de Catálogos**
- El sistema debe permitir exportar catálogos a Excel/CSV
- Debe incluir todos los campos del catálogo
- Debe respetar filtros aplicados en la exportación

#### Submódulo de Parámetros

**RF-CAT-008: Configuración de Catálogos**
- El sistema debe permitir definir nuevos tipos de catálogos
- Debe configurar: nombre, descripción, campos requeridos, tipo (simple/jerárquico)
- Debe permitir activar/desactivar catálogos completos

**RF-CAT-009: Importación Masiva**
- El sistema debe permitir carga masiva desde Excel/CSV
- Debe validar formato y datos antes de importar
- Debe generar reporte de errores en importación
- Debe permitir reversión de importación en caso de error

**RF-CAT-010: Sincronización de Catálogos Oficiales**
- El sistema debe permitir actualización de catálogos oficiales (INEC)
- Debe validar cambios antes de aplicar
- Debe notificar sobre actualizaciones disponibles

### 5.3.5 Estructura de Datos de Catálogos

**Campos Comunes:**
- `id`: Identificador único
- `codigo`: Código del registro (único por catálogo)
- `descripcion`: Descripción o nombre
- `descripcion_corta`: Abreviatura o nombre corto (opcional)
- `orden`: Orden de presentación
- `estado`: Activo/Inactivo
- `padre_id`: Para catálogos jerárquicos (opcional)
- `metadata`: JSON con información adicional (opcional)
- `fecha_creacion`: Timestamp de creación
- `usuario_creacion`: Usuario que creó
- `fecha_modificacion`: Timestamp de última modificación
- `usuario_modificacion`: Usuario que modificó

### 5.3.6 Requisitos No Funcionales

**RNF-CAT-001:** Consultas a catálogos deben responder en menos de 500ms  
**RNF-CAT-002:** Catálogos frecuentes deben almacenarse en caché (Redis recomendado)  
**RNF-CAT-003:** El sistema debe soportar al menos 50 tipos de catálogos diferentes  
**RNF-CAT-004:** Importación masiva debe procesar al menos 10,000 registros en menos de 5 minutos  
**RNF-CAT-005:** Los catálogos deben estar disponibles 99.9% del tiempo

---

## 6. ARQUITECTURA DEL SISTEMA

### 6.1 Arquitectura General

```
┌─────────────────────────────────────────┐
│         FRONTEND (Angular + Fuse)       │
│  ┌─────────────────────────────────┐   │
│  │   Módulos de Presentación       │   │
│  │   - Login                       │   │
│  │   - Dashboard                   │   │
│  │   - Usuarios                    │   │
│  │   - Catálogos                   │   │
│  └─────────────────────────────────┘   │
└───────────────┬─────────────────────────┘
                │ HTTP/REST (JWT)
┌───────────────▼─────────────────────────┐
│         BACKEND (NestJS)                │
│  ┌─────────────────────────────────┐   │
│  │   Controllers & Services        │   │
│  │   - Auth Module                 │   │
│  │   - Users Module                │   │
│  │   - Catalogs Module             │   │
│  │   - Common Module               │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │   Guards & Middleware           │   │
│  │   - JWT Strategy                │   │
│  │   - Permissions Guard           │   │
│  │   - Audit Interceptor           │   │
│  └─────────────────────────────────┘   │
└───────────────┬─────────────────────────┘
                │ ORM
┌───────────────▼─────────────────────────┐
│         PostgreSQL Database             │
│  - Tablas de usuarios y roles          │
│  - Tablas de catálogos                 │
│  - Tablas de auditoría                 │
│  - Tablas de configuración             │
└─────────────────────────────────────────┘
```

### 6.2 Estructura de Base de Datos

**Esquemas Principales:**
- `auth`: Autenticación y seguridad
- `users`: Usuarios y permisos
- `catalogs`: Catálogos maestros
- `audit`: Auditoría y trazabilidad
- `config`: Configuraciones del sistema

### 6.3 Patrones de Diseño Recomendados

- **Backend:**
  - Repository Pattern para acceso a datos
  - Service Layer para lógica de negocio
  - DTO Pattern para transferencia de datos
  - Decorator Pattern para permisos y validaciones

- **Frontend:**
  - Component-based architecture
  - State Management (NgRx o Akita recomendado)
  - Lazy Loading para módulos
  - Shared Module para componentes comunes

---

## 7. SEGURIDAD

### 7.1 Autenticación y Autorización
- Implementación de JWT con refresh tokens
- Política de expiración: Access token 1 hora, Refresh token 7 días
- Validación de permisos en cada endpoint protegido
- Encriptación de contraseñas con bcrypt (cost factor: 10)

### 7.2 Protección de Datos
- Todas las comunicaciones deben ser HTTPS
- Datos sensibles encriptados en base de datos
- Implementar rate limiting en endpoints críticos
- Validación y sanitización de inputs (prevención de SQL Injection, XSS)

### 7.3 Auditoría
- Registro de todas las operaciones críticas:
  - Login/Logout
  - Creación/modificación/eliminación de usuarios
  - Cambios en catálogos
  - Cambios en permisos y roles
- Campos obligatorios en auditoría:
  - Acción realizada
  - Usuario que ejecuta
  - Fecha y hora
  - IP de origen
  - Datos antes/después (para modificaciones)

### 7.4 Compliance
- Cumplimiento de Ley Orgánica de Protección de Datos Personales de Ecuador
- Políticas de privacidad y términos de uso
- Consentimiento de usuario para tratamiento de datos

---

## 8. INTERFAZ DE USUARIO

### 8.1 Diseño General
- Uso de Angular Fuse como base de diseño
- Diseño responsive (mobile-first approach)
- Tema personalizable (claro/oscuro)
- Soporte para múltiples idiomas (inicialmente español)

### 8.2 Componentes Principales

**Sidebar Navigation:**
- Dashboard
- Gestión de Usuarios
  - Usuarios
  - Roles y Permisos
- Gestión de Clientes
  - Clientes
  - Apoderados
  - Poderes
  - Mensajes a Clientes
- Catálogos
  - Catálogos Geográficos
  - Catálogos Demográficos
  - Catálogos del Sistema
- Auditoría
  - Logs del Sistema
- Configuración
- Mi Perfil

**Componentes Comunes:**
- Tablas con paginación, ordenamiento y filtros
- Formularios con validación en tiempo real
- Modales para confirmaciones y formularios
- Notificaciones toast para feedback
- Breadcrumbs para navegación
- Loading indicators

### 8.3 Experiencia de Usuario
- Mensajes de error claros y accionables
- Confirmaciones para operaciones destructivas
- Feedback inmediato en operaciones
- Shortcuts de teclado para operaciones comunes
- Tooltips informativos

---

## 9. INTEGRACIONES

### 9.1 Fase 1
- No se requieren integraciones externas en Fase 1
- API REST interna entre frontend y backend

### 9.2 Fases Futuras (Consideraciones)
- Sistema de correo electrónico (SMTP)
- Servicios de SMS para notificaciones
- Integración con INEC para actualización de catálogos
- Integración con Registro Civil para validación de identificaciones
- Servicios de almacenamiento en la nube (AWS S3, Google Cloud Storage)

---

## 10. PRUEBAS

### 10.1 Estrategia de Pruebas

**Backend:**
- Unit Testing: Jest (mínimo 80% de cobertura)
- Integration Testing: Supertest
- E2E Testing: Para flujos críticos

**Frontend:**
- Unit Testing: Jasmine/Karma
- Component Testing: Angular Testing Library
- E2E Testing: Cypress o Playwright

### 10.2 Casos de Prueba Críticos
- Flujo completo de autenticación
- Creación y gestión de usuarios con diferentes roles
- CRUD de catálogos jerárquicos
- Creación de clientes con validación de cédula
- Gestión completa de apoderados y poderes
- Visualización de mensajes de clientes
- Consulta de clientes por fechas con múltiples filtros
- Validación de permisos por rol
- Recuperación de contraseña
- Importación masiva de catálogos
- Soft delete y recuperación de registros
- Filtrado multi-tenant de datos
- Carga de documentos PDF de poderes
- Vencimiento automático de poderes

### 10.3 Pruebas de Seguridad
- Penetration testing básico
- Validación de tokens JWT
- Pruebas de inyección SQL
- Pruebas de XSS
- Validación de rate limiting

### 10.4 Pruebas de Performance
- Carga de 100 usuarios concurrentes
- Tiempo de respuesta de endpoints < 2 segundos
- Consulta de catálogos con 10,000+ registros
- Importación masiva de 50,000 registros

---

## 11. DESPLIEGUE

### 11.1 Ambientes

**Desarrollo:**
- Para desarrollo activo del equipo
- Actualizaciones continuas

**QA/Testing:**
- Para pruebas funcionales y de integración
- Datos de prueba

**Staging:**
- Réplica del ambiente de producción
- Pruebas finales antes de producción

**Producción:**
- Ambiente productivo
- Datos reales

### 11.2 Infraestructura Recomendada

**Opción 1 - Cloud (Recomendado):**
- AWS, Google Cloud o Azure
- Contenedores Docker
- Kubernetes para orquestación (opcional para Fase 1)
- Base de datos PostgreSQL como servicio (RDS, Cloud SQL)

**Opción 2 - On-Premise:**
- Servidores dedicados o virtuales
- Docker Compose para orquestación
- PostgreSQL instalado

### 11.3 CI/CD
- Git como control de versiones (GitLab, GitHub, Bitbucket)
- Pipeline de CI/CD:
  - Lint y validación de código
  - Ejecución de pruebas
  - Build automático
  - Despliegue automático a desarrollo
  - Despliegue manual a producción

---

## 12. MANTENIMIENTO Y SOPORTE

### 12.1 Monitoreo
- Logs centralizados (ELK Stack o similar)
- Monitoreo de performance (New Relic, Datadog)
- Alertas de errores y excepciones
- Monitoreo de uptime

### 12.2 Backups
- Backup diario de base de datos
- Retención: 30 días backups diarios, 12 meses backups mensuales
- Pruebas de restauración trimestrales
- Backup de código en repositorio Git

### 12.3 Documentación
- Documentación técnica de APIs (Swagger/OpenAPI)
- Manual de usuario
- Manual de administrador
- Guías de troubleshooting
- Runbooks para operaciones comunes

---

## 13. CRONOGRAMA ESTIMADO - FASE 1 (ACTUALIZADO)

| Fase | Actividad | Duración Estimada |
|------|-----------|-------------------|
| 1 | Configuración de ambiente y proyecto | 1 semana |
| 2 | Diseño de base de datos (incluye modelo Personas) | 1.5 semanas |
| 3 | Desarrollo Backend - Auth | 2 semanas |
| 4 | Desarrollo Backend - Módulo Auditoría | 1 semana |
| 5 | Desarrollo Frontend - Login | 1 semana |
| 6 | Desarrollo Backend - Users | 3 semanas |
| 7 | Desarrollo Frontend - Users | 2 semanas |
| 8 | Desarrollo Backend - Catalogs | 2 semanas |
| 9 | Desarrollo Frontend - Catalogs | 2 semanas |
| 10 | Desarrollo Backend - Clientes | 4 semanas |
| 11 | Desarrollo Frontend - Clientes | 3 semanas |
| 12 | Integración Multi-tenancy | 1 semana |
| 13 | Implementación Soft Delete | 0.5 semanas |
| 14 | Validación Cédula Ecuatoriana | 0.5 semanas |
| 15 | Integración y pruebas completas | 3 semanas |
| 16 | Corrección de bugs y ajustes | 2 semanas |
| 17 | Documentación completa | 1.5 semanas |
| 18 | Despliegue a producción y estabilización | 1 semana |
| **TOTAL** | | **~32 semanas (8 meses)** |

*Nota: Los tiempos son estimados y pueden variar según el tamaño del equipo y experiencia. Se recomienda equipo de 3-4 desarrolladores (2 backend, 2 frontend).*

---

## 14. RIESGOS Y MITIGACIONES

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Cambios en requisitos durante desarrollo | Media | Alto | Implementar sprints cortos con revisiones frecuentes |
| Problemas de performance con catálogos grandes | Media | Medio | Implementar caché, índices apropiados, paginación |
| Complejidad del modelo de Personas compartido | Media | Medio | Diseño detallado previo, pruebas de integridad referencial |
| Vulnerabilidades de seguridad | Baja | Muy Alto | Code reviews, auditorías de seguridad, penetration testing |
| Retrasos en cronograma por alcance ampliado | Alta | Alto | Buffer de tiempo, priorización clara, entregables por sprint |
| Problemas de integración Frontend-Backend | Baja | Medio | Definir contratos de API temprano, mock services |
| Falta de adopción por usuarios | Media | Alto | Capacitación, documentación clara, soporte activo |
| Problemas con carga de archivos grandes | Media | Medio | Validaciones estrictas, compresión, límites claros |

---

## 15. MÉTRICAS DE ÉXITO

### 15.1 Métricas Técnicas
- Tiempo de respuesta promedio < 2 segundos
- Uptime > 99.5%
- Cobertura de pruebas > 80%
- Cero vulnerabilidades críticas de seguridad
- 100% de operaciones críticas auditadas
- Búsqueda de clientes < 1 segundo
- Validación de cédula < 100ms

### 15.2 Métricas de Negocio
- Tiempo de onboarding de usuarios < 30 minutos
- Tasa de errores de usuario < 5%
- Satisfacción de usuarios > 4/5
- Tiempo de resolución de incidentes < 24 horas

### 15.3 Métricas de Calidad
- Bugs críticos en producción: 0
- Bugs menores resueltos en < 1 semana
- Documentación actualizada al 100%

---

## 16. MODELO DE DATOS BASE - PERSONAS

### 16.1 Descripción
Para evitar duplicidad de información y promover la reutilización de datos, el sistema implementará un modelo base de **Persona** que será compartido por diferentes entidades como clientes, usuarios, apoderados, cónyuges, representantes legales, etc.

### 16.2 Estructura de la Tabla Base: `personas`

**Tabla:** `personas`

| Campo | Tipo | Descripción | Obligatorio |
|-------|------|-------------|-------------|
| id | UUID/BIGINT | Identificador único | Sí |
| tipo_identificacion_id | FK | Referencia a catálogo de tipos de identificación | Sí |
| numero_identificacion | VARCHAR(20) | Número de cédula/RUC/pasaporte | Sí |
| nombres | VARCHAR(100) | Nombres de la persona | Sí |
| apellidos | VARCHAR(100) | Apellidos de la persona | Sí |
| fecha_nacimiento | DATE | Fecha de nacimiento | Sí |
| genero_id | FK | Referencia a catálogo de género | Sí |
| estado_civil_id | FK | Referencia a catálogo de estado civil | Sí |
| nacionalidad_id | FK | Referencia a catálogo de países | Sí |
| nivel_instruccion_id | FK | Referencia a catálogo de nivel de instrucción | No |
| profesion | VARCHAR(100) | Profesión u ocupación | No |
| email | VARCHAR(100) | Correo electrónico | No |
| telefono_convencional | VARCHAR(20) | Teléfono fijo | No |
| telefono_celular | VARCHAR(20) | Teléfono móvil | Sí |
| provincia_id | FK | Referencia a catálogo de provincias | Sí |
| canton_id | FK | Referencia a catálogo de cantones | Sí |
| parroquia_id | FK | Referencia a catálogo de parroquias | No |
| direccion_domicilio | TEXT | Dirección completa del domicilio | Sí |
| referencia_domicilio | TEXT | Referencia de ubicación | No |
| codigo_dactilar | VARCHAR(50) | Código dactilar único | No |
| foto_url | VARCHAR(500) | URL de fotografía de la persona | No |
| estado | CHAR(1) | Estado del registro (A=Activo, I=Inactivo) | Sí |
| fecha_creacion | TIMESTAMP | Fecha de creación del registro | Sí |
| usuario_creacion | FK | Usuario que creó el registro | Sí |
| fecha_modificacion | TIMESTAMP | Fecha de última modificación | No |
| usuario_modificacion | FK | Usuario que modificó | No |
| fecha_eliminacion | TIMESTAMP | Fecha de eliminación lógica | No |
| usuario_eliminacion | FK | Usuario que eliminó | No |

### 16.3 Tablas Derivadas

Las siguientes tablas harán referencia a la tabla base `personas`:

**Tabla:** `clientes`
- `persona_id` (FK a personas) - PRIMARY KEY
- `codigo_cliente` (VARCHAR(20), UNIQUE)
- `tipo_cliente_id` (FK a catálogo)
- `fecha_ingreso` (DATE)
- `oficina_id` (FK a catálogo de oficinas)
- `oficial_credito_id` (FK a usuarios)
- `segmento_id` (FK a catálogo)
- Campos adicionales específicos de cliente

**Tabla:** `usuarios`
- `persona_id` (FK a personas) - UNIQUE
- `id` (PRIMARY KEY)
- `username` (VARCHAR(50), UNIQUE)
- `password_hash` (VARCHAR(255))
- `sucursal_id` (FK)
- Campos adicionales específicos de usuario

**Tabla:** `apoderados`
- `persona_id` (FK a personas) - PRIMARY KEY
- `tipo_apoderado_id` (FK a catálogo)
- `fecha_registro` (DATE)
- Campos adicionales específicos de apoderado

**Tabla:** `conyuges`
- `persona_id` (FK a personas) - PRIMARY KEY
- `cliente_id` (FK a clientes)
- `fecha_matrimonio` (DATE)
- Campos adicionales específicos

### 16.4 Ventajas del Modelo
- Elimina duplicidad de datos demográficos
- Facilita actualizaciones centralizadas
- Permite consultas más eficientes
- Mantiene integridad referencial
- Simplifica auditoría de cambios en datos personales

---

## 17. SUGERENCIAS Y RECOMENDACIONES

### 17.1 Arquitectura y Diseño
1. **Versionamiento de API**: Implementar versionamiento en los endpoints REST desde el inicio (ej: /api/v1/).

### 17.2 Módulo de Auditoría Transversal (IMPLEMENTADO)

**Descripción:**
Módulo independiente que centraliza todos los logs de auditoría del sistema, siendo consumido de forma transversal por todos los demás módulos.

**Características:**
- Tabla unificada `audit_logs` con campos estándar
- Interceptor global que captura automáticamente operaciones críticas
- Service de auditoría inyectable en cualquier módulo
- Interfaz de consulta de logs para administradores

**Estructura de Tabla `audit_logs`:**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Identificador único |
| modulo | VARCHAR(50) | Módulo que genera el log |
| accion | VARCHAR(100) | Acción realizada (CREATE, UPDATE, DELETE, LOGIN, etc.) |
| entidad | VARCHAR(100) | Entidad afectada (tabla/recurso) |
| entidad_id | VARCHAR(100) | ID del registro afectado |
| usuario_id | FK | Usuario que ejecuta la acción |
| usuario_ip | VARCHAR(45) | IP de origen |
| datos_anteriores | JSONB | Estado antes del cambio |
| datos_nuevos | JSONB | Estado después del cambio |
| metadata | JSONB | Información adicional contextual |
| fecha_hora | TIMESTAMP | Timestamp de la acción |

**Eventos Auditables:**
- Autenticación (login, logout, intentos fallidos)
- CRUD de usuarios, roles y permisos
- CRUD de clientes, apoderados y poderes
- CRUD de catálogos
- Cambios de estado
- Operaciones financieras (futuras fases)

### 17.3 Soft Delete (IMPLEMENTADO)

**Descripción:**
Implementación de borrado lógico en lugar de físico para mantener trazabilidad e integridad histórica.

**Implementación:**
Todas las tablas principales incluirán los campos:
- `fecha_eliminacion` (TIMESTAMP, nullable)
- `usuario_eliminacion` (FK a usuarios, nullable)
- `motivo_eliminacion` (TEXT, nullable)

**Comportamiento:**
- DELETE: Actualiza `fecha_eliminacion` y `usuario_eliminacion` en lugar de eliminar el registro
- SELECT: Consultas por defecto filtran registros donde `fecha_eliminacion IS NULL`
- Los registros eliminados permanecen en BD para auditoría e informes históricos
- Se puede implementar purga física programada para registros muy antiguos (ej: después de 7 años)

**Ventajas:**
- Recuperación de datos ante errores
- Auditoría completa
- Cumplimiento regulatorio
- Informes históricos precisos

### 17.4 Multi-tenancy (IMPLEMENTADO)

**Descripción:**
Arquitectura preparada para soportar múltiples cooperativas desde el diseño inicial, facilitando escalamiento futuro.

**Modelo Propuesto:** Row-Level Multi-tenancy (Single Database, Shared Schema)

**Implementación:**

Tabla: `cooperativas`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Identificador único |
| codigo | VARCHAR(20) | Código único de cooperativa |
| razon_social | VARCHAR(200) | Nombre legal |
| nombre_comercial | VARCHAR(200) | Nombre comercial |
| ruc | VARCHAR(13) | RUC de la cooperativa |
| logo_url | VARCHAR(500) | URL del logo |
| configuracion | JSONB | Configuraciones específicas |
| estado | CHAR(1) | Estado (A/I) |
| fecha_creacion | TIMESTAMP | Fecha de registro |

**Modificación de Tablas Principales:**
Todas las tablas de datos agregarán:
- `cooperativa_id` (FK a cooperativas, NOT NULL)
- Índice compuesto en (cooperativa_id, id)

**Filtrado por Tenant:**
- Middleware/Guard que inyecta automáticamente `cooperativa_id` en queries
- El usuario autenticado lleva asociada su cooperativa
- Todas las consultas se filtran automáticamente por `cooperativa_id`

**Ventajas:**
- Single codebase para múltiples cooperativas
- Despliegue y mantenimiento centralizado
- Costos de infraestructura optimizados
- Escalabilidad horizontal

**Consideraciones:**
- Separación estricta de datos por cooperativa
- Backups por cooperativa
- Customización visual por cooperativa (logo, colores)

### 17.5 Validación de Cédula Ecuatoriana (IMPLEMENTADO)

**Descripción:**
Implementación del algoritmo de validación del dígito verificador de cédulas ecuatorianas.

**Algoritmo de Validación:**

```typescript
// Pseudocódigo del algoritmo
function validarCedulaEcuatoriana(cedula: string): boolean {
  // 1. Validar longitud (10 dígitos)
  if (cedula.length !== 10) return false;
  
  // 2. Validar que sean solo números
  if (!/^\d+$/.test(cedula)) return false;
  
  // 3. Validar código de provincia (2 primeros dígitos entre 01 y 24)
  const provincia = parseInt(cedula.substring(0, 2));
  if (provincia < 1 || provincia > 24) return false;
  
  // 4. Validar tercer dígito (debe ser menor a 6 para personas naturales)
  const tercerDigito = parseInt(cedula.charAt(2));
  if (tercerDigito >= 6) return false;
  
  // 5. Algoritmo de validación del dígito verificador
  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let suma = 0;
  
  for (let i = 0; i < 9; i++) {
    let valor = parseInt(cedula.charAt(i)) * coeficientes[i];
    if (valor >= 10) valor -= 9;
    suma += valor;
  }
  
  const residuo = suma % 10;
  const digitoVerificador = residuo === 0 ? 0 : 10 - residuo;
  
  // 6. Comparar con el último dígito de la cédula
  return digitoVerificador === parseInt(cedula.charAt(9));
}
```

**Implementación en el Sistema:**
- Validator personalizado en NestJS (backend)
- Directiva de validación en Angular (frontend)
- Validación en tiempo real al ingresar cédula
- Mensaje de error específico y claro para usuario

**Mensajes de Error:**
- "La cédula ingresada no es válida"
- "El formato de cédula debe tener 10 dígitos"
- "La provincia especificada en la cédula no es válida"

**Casos Especiales:**
- RUC de personas naturales: primeros 10 dígitos son la cédula + "001"
- RUC de sociedades: validación diferente
- Pasaportes y documentos extranjeros: validaciones específicas según tipo

### 17.6 Funcionalidades Adicionales Recomendadas

1. **Dashboard Inicial**: Agregar un dashboard simple con:
   - Estadísticas básicas de usuarios y clientes
   - Actividad reciente
   - Accesos rápidos a funciones comunes
   - Alertas y notificaciones pendientes

2. **Gestión de Perfiles de Usuario**: Permitir que usuarios gestionen su propia información y preferencias.

3. **Logs de Auditoría Visibles**: Interfaz para que administradores consulten logs de auditoría con filtros avanzados.

4. **Importación de Datos Iniciales**: Scripts o herramienta para importar catálogos oficiales de Ecuador (provincias, cantones, parroquias del INEC).

5. **Notificaciones del Sistema**: Sistema básico de notificaciones in-app para alertas importantes.

### 17.7 Seguridad

1. **2FA (Two-Factor Authentication)**: Considerar implementar autenticación de dos factores para usuarios administradores.

2. **Password Policy**: Implementar políticas de contraseña configurables:
   - Expiración de contraseñas
   - Historial de contraseñas
   - Complejidad mínima

3. **Session Management**: Control de sesiones simultáneas por usuario.

### 17.8 Desarrollo

1. **Atomic Design**: Utilizar metodología Atomic Design para componentes de UI.

2. **Design System**: Crear un design system básico con componentes reutilizables desde Fase 1.

3. **Git Flow**: Implementar Git Flow o estrategia similar para gestión de ramas.

4. **Code Reviews**: Obligatorio code review antes de merge a rama principal.

5. **Conventional Commits**: Usar conventional commits para mensajes de commit claros.

### 17.9 Datos y Catálogos

1. **Catálogos Pre-cargados**: Incluir en el setup inicial:
   - División política de Ecuador (INEC)
   - Códigos telefónicos de operadoras
   - Tipos de identificación oficiales

2. **Búsqueda Inteligente**: Implementar búsqueda con tolerancia a errores tipográficos en catálogos.

### 16.6 UX/UI

1. **Tema Corporativo**: Permitir configuración de colores/logo para personalización por cooperativa.

2. **Accesibilidad**: Cumplir con estándares WCAG 2.1 nivel AA.

3. **Onboarding**: Wizard de configuración inicial para primera vez que se accede al sistema.

4. **Help Center**: Tooltips contextuales y ayuda en línea.

### 16.7 Testing

1. **Test Data Builder**: Crear builders para generar datos de prueba fácilmente.

2. **Visual Regression Testing**: Herramientas como Percy o Chromatic para detectar cambios visuales no intencionados.

### 16.8 Performance

1. **Lazy Loading**: Implementar lazy loading agresivo en frontend.

2. **Optimistic UI Updates**: Para mejorar perceived performance.

3. **Database Indexing**: Crear índices apropiados en campos de búsqueda frecuente.

4. **Query Optimization**: Revisar y optimizar queries N+1.

### 16.9 Documentación

1. **ADR (Architecture Decision Records)**: Documentar decisiones arquitectónicas importantes.

2. **API Documentation**: Mantener Swagger/OpenAPI actualizado automáticamente.

3. **Changelog**: Mantener changelog semántico de versiones.

---

## 17. DEFINICIONES Y GLOSARIO

- **Core Financiero**: Sistema central que maneja las operaciones financieras principales de una institución.
- **Cooperativa**: Asociación autónoma de personas unidas voluntariamente para satisfacer necesidades económicas, sociales y culturales.
- **JWT**: JSON Web Token, estándar para transmitir información segura entre par