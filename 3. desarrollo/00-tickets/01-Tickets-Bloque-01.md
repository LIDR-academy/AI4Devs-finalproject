# 🎫 WORK TICKETS (JIRA) - BLOQUE 1 (Tickets 1-50)

**Proyecto:** RRFinances - Sistema Web Financiero Core  
**Fecha:** 17 de Diciembre de 2025  
**Bloque:** 1 de 9  
**Tickets:** 1 - 50

---

## 📋 US-001: Configuración y Administración Global del Sistema Multi-Tenant

### 🔧 Módulo: Configuración Inicial del Proyecto

---

#### **TICKET-001: Configurar proyecto NestJS con estructura base**

**Título:** Configurar proyecto NestJS con estructura base

**Descripción:**
Crear proyecto inicial de NestJS con estructura de carpetas modular, configuración de TypeScript, ESLint, Prettier y scripts básicos de desarrollo.

**Criterios de Aceptación:**
- ✅ Proyecto NestJS 10.x inicializado
- ✅ Estructura de carpetas modular creada (modules, common, config)
- ✅ TypeScript configurado con strict mode
- ✅ ESLint y Prettier configurados
- ✅ Scripts de desarrollo (dev, build, lint) funcionando
- ✅ README con instrucciones de instalación

**Prioridad:** Alta  
**Esfuerzo:** 2 horas  
**Etiquetas:** backend, setup, nestjs

---

#### **TICKET-002: Configurar PostgreSQL y conexión con TypeORM**

**Título:** Configurar PostgreSQL y conexión con TypeORM

**Descripción:**
Configurar base de datos PostgreSQL, instalar TypeORM, crear archivo de configuración de conexión y establecer migraciones iniciales.

**Criterios de Aceptación:**
- ✅ PostgreSQL 15.x instalado y funcionando
- ✅ TypeORM integrado en NestJS
- ✅ Configuración de conexión en módulo de configuración
- ✅ Variables de entorno para credenciales de BD
- ✅ Sistema de migraciones configurado
- ✅ Conexión exitosa verificada

**Prioridad:** Alta  
**Esfuerzo:** 2.5 horas  
**Etiquetas:** backend, database, typeorm, postgresql

---

#### **TICKET-003: Implementar módulo de configuración centralizado**

**Título:** Implementar módulo de configuración centralizado

**Descripción:**
Crear módulo de configuración centralizado usando @nestjs/config para gestionar variables de entorno y configuraciones del sistema.

**Criterios de Aceptación:**
- ✅ @nestjs/config instalado y configurado
- ✅ Archivo .env.example creado con todas las variables
- ✅ Validación de variables de entorno obligatorias
- ✅ Configuración tipada con interfaces TypeScript
- ✅ ConfigService disponible globalmente
- ✅ Diferentes perfiles (dev, prod, test)

**Prioridad:** Alta  
**Esfuerzo:** 2 horas  
**Etiquetas:** backend, config, environment

---

#### **TICKET-004: Configurar proyecto Angular con Fuse Template**

**Título:** Configurar proyecto Angular con Fuse Template

**Descripción:**
Inicializar proyecto Angular 17.x con Fuse Template, configurar estructura de módulos y establecer routing básico.

**Criterios de Aceptación:**
- ✅ Angular 17.x instalado
- ✅ Fuse Template integrado
- ✅ Estructura de carpetas modular (modules, shared, core)
- ✅ Routing básico configurado
- ✅ Tema personalizable configurado
- ✅ Aplicación ejecutándose en localhost

**Prioridad:** Alta  
**Esfuerzo:** 3 horas  
**Etiquetas:** frontend, angular, fuse, setup

---

#### **TICKET-005: Configurar comunicación HTTP entre Angular y NestJS**

**Título:** Configurar comunicación HTTP entre Angular y NestJS

**Descripción:**
Configurar HttpClient en Angular, crear servicio base para peticiones HTTP, establecer interceptores y configurar CORS en backend.

**Criterios de Aceptación:**
- ✅ HttpClient configurado en Angular
- ✅ Servicio base de HTTP creado
- ✅ Interceptor para manejo de errores
- ✅ CORS configurado en NestJS
- ✅ Prefijo de API configurado (/api/v1)
- ✅ Prueba de conexión exitosa

**Prioridad:** Alta  
**Esfuerzo:** 2 horas  
**Etiquetas:** frontend, backend, http, cors

---

### 🔐 Módulo: Autenticación y Seguridad

---

#### **TICKET-006: Diseñar esquema de base de datos para usuarios**

**Título:** Diseñar esquema de base de datos para usuarios

**Descripción:**
Crear diagrama ER y definir estructura de tablas para usuarios, roles, permisos y sesiones en PostgreSQL.

**Criterios de Aceptación:**
- ✅ Diagrama ER creado
- ✅ Tabla `users` definida con todos los campos
- ✅ Tabla `roles` definida
- ✅ Tabla `permissions` definida
- ✅ Tabla `user_roles` (relación muchos a muchos)
- ✅ Tabla `role_permissions` (relación muchos a muchos)
- ✅ Índices y constraints definidos

**Prioridad:** Crítica  
**Esfuerzo:** 2.5 horas  
**Etiquetas:** backend, database, design, auth

---

#### **TICKET-007: Crear migración para tabla users**

**Título:** Crear migración para tabla users

**Descripción:**
Implementar migración de TypeORM para crear tabla `users` con todos sus campos, índices y constraints.

**Criterios de Aceptación:**
- ✅ Migración creada con TypeORM CLI
- ✅ Tabla `users` con campos: id, username, password_hash, email, persona_id, estado, etc.
- ✅ Índices únicos en username y email
- ✅ Timestamps de auditoría incluidos
- ✅ Migración ejecuta correctamente
- ✅ Rollback funciona correctamente

**Prioridad:** Crítica  
**Esfuerzo:** 2 horas  
**Etiquetas:** backend, database, migration

---

#### **TICKET-008: Crear entidad User con TypeORM**

**Título:** Crear entidad User con TypeORM

**Descripción:**
Crear clase de entidad User con decoradores de TypeORM, relaciones y métodos auxiliares.

**Criterios de Aceptación:**
- ✅ Clase User con decoradores @Entity
- ✅ Todos los campos mapeados correctamente
- ✅ Relaciones con Persona, Roles, Cooperativa definidas
- ✅ Campo password_hash nunca se serializa en JSON
- ✅ Métodos para validar y hashear contraseña
- ✅ Timestamps automáticos

**Prioridad:** Crítica  
**Esfuerzo:** 2.5 horas  
**Etiquetas:** backend, entity, typeorm

---

#### **TICKET-009: Crear migración para tablas de roles y permisos**

**Título:** Crear migración para tablas de roles y permisos

**Descripción:**
Implementar migraciones para tablas roles, permissions, user_roles y role_permissions con datos semilla de roles predefinidos.

**Criterios de Aceptación:**
- ✅ Tabla `roles` creada
- ✅ Tabla `permissions` creada
- ✅ Tabla `user_roles` (join table) creada
- ✅ Tabla `role_permissions` (join table) creada
- ✅ Datos semilla: SuperAdmin, Admin, Operador, Consultor
- ✅ Relaciones y constraints correctos

**Prioridad:** Crítica  
**Esfuerzo:** 3 horas  
**Etiquetas:** backend, database, migration, roles

---

#### **TICKET-010: Crear entidades Role y Permission con TypeORM**

**Título:** Crear entidades Role y Permission con TypeORM

**Descripción:**
Crear clases de entidades Role y Permission con relaciones many-to-many entre sí y con User.

**Criterios de Aceptación:**
- ✅ Entidad Role con campos: id, nombre, descripcion, es_sistema
- ✅ Entidad Permission con campos: id, modulo, submodulo, accion, descripcion
- ✅ Relaciones many-to-many configuradas correctamente
- ✅ Cascade options apropiados
- ✅ Métodos auxiliares para validación

**Prioridad:** Crítica  
**Esfuerzo:** 2.5 horas  
**Etiquetas:** backend, entity, typeorm, roles

---

#### **TICKET-011: Instalar y configurar Passport.js con estrategia Local**

**Título:** Instalar y configurar Passport.js con estrategia Local

**Descripción:**
Instalar Passport.js, @nestjs/passport, passport-local y configurar estrategia de autenticación local con usuario/contraseña.

**Criterios de Aceptación:**
- ✅ Paquetes Passport instalados
- ✅ Estrategia Local configurada
- ✅ Validación de usuario y contraseña implementada
- ✅ Encriptación con bcrypt configurada (10 rounds)
- ✅ Módulo de autenticación creado
- ✅ Pruebas de login funcionales

**Prioridad:** Crítica  
**Esfuerzo:** 3 horas  
**Etiquetas:** backend, auth, passport, security

---

#### **TICKET-012: Implementar generación y validación de JWT**

**Título:** Implementar generación y validación de JWT

**Descripción:**
Instalar @nestjs/jwt, configurar estrategia JWT de Passport, implementar generación de access tokens y refresh tokens.

**Criterios de Aceptación:**
- ✅ @nestjs/jwt instalado y configurado
- ✅ Estrategia JWT de Passport implementada
- ✅ Access token con expiración de 1 hora
- ✅ Refresh token con expiración de 7 días
- ✅ Payload del JWT incluye: userId, username, roles, cooperativaId
- ✅ Método para refrescar tokens

**Prioridad:** Crítica  
**Esfuerzo:** 3 horas  
**Etiquetas:** backend, auth, jwt, security

---

#### **TICKET-013: Crear DTOs para login y registro**

**Título:** Crear DTOs para login y registro

**Descripción:**
Crear Data Transfer Objects con class-validator para login (LoginDto) y respuesta de autenticación (AuthResponseDto).

**Criterios de Aceptación:**
- ✅ LoginDto con validaciones (username, password obligatorios)
- ✅ AuthResponseDto (accessToken, refreshToken, user info)
- ✅ Validaciones con decoradores class-validator
- ✅ Mensajes de error personalizados
- ✅ Exportados desde index barrel

**Prioridad:** Alta  
**Esfuerzo:** 1.5 horas  
**Etiquetas:** backend, dto, validation

---

#### **TICKET-014: Implementar endpoint POST /auth/login**

**Título:** Implementar endpoint POST /auth/login

**Descripción:**
Crear controlador y servicio para endpoint de login que valide credenciales, genere tokens JWT y retorne información del usuario.

**Criterios de Aceptación:**
- ✅ Endpoint POST /api/v1/auth/login implementado
- ✅ Valida username/email y password
- ✅ Retorna access token y refresh token
- ✅ Retorna información básica del usuario (sin contraseña)
- ✅ Manejo de errores (credenciales inválidas)
- ✅ Status codes correctos (200, 401)

**Prioridad:** Crítica  
**Esfuerzo:** 2.5 horas  
**Etiquetas:** backend, auth, endpoint, login

---

#### **TICKET-015: Implementar endpoint POST /auth/refresh**

**Título:** Implementar endpoint POST /auth/refresh

**Descripción:**
Crear endpoint para refrescar access token usando refresh token válido.

**Criterios de Aceptación:**
- ✅ Endpoint POST /api/v1/auth/refresh implementado
- ✅ Valida refresh token
- ✅ Genera nuevo access token
- ✅ Opcionalmente rota refresh token
- ✅ Manejo de errores (token inválido/expirado)
- ✅ Status codes correctos

**Prioridad:** Alta  
**Esfuerzo:** 2 horas  
**Etiquetas:** backend, auth, endpoint, jwt

---

#### **TICKET-016: Implementar endpoint POST /auth/logout**

**Título:** Implementar endpoint POST /auth/logout

**Descripción:**
Crear endpoint para cerrar sesión, invalidar refresh token y registrar evento en auditoría.

**Criterios de Aceptación:**
- ✅ Endpoint POST /api/v1/auth/logout implementado
- ✅ Requiere autenticación (JWT válido)
- ✅ Invalida refresh token en BD o blacklist
- ✅ Registra evento en auditoría
- ✅ Retorna confirmación exitosa
- ✅ Status code 200

**Prioridad:** Alta  
**Esfuerzo:** 2 horas  
**Etiquetas:** backend, auth, endpoint, logout

---

#### **TICKET-017: Crear tabla para intentos de login fallidos**

**Título:** Crear tabla para intentos de login fallidos

**Descripción:**
Crear migración y entidad para registrar intentos de login (exitosos y fallidos) con información de IP, usuario y timestamp.

**Criterios de Aceptación:**
- ✅ Tabla `login_attempts` creada
- ✅ Campos: id, username, ip_address, success, fecha_hora, user_agent
- ✅ Entidad LoginAttempt creada
- ✅ Índices en username y fecha_hora
- ✅ Retención de datos: 90 días (política)

**Prioridad:** Alta  
**Esfuerzo:** 2 horas  
**Etiquetas:** backend, database, security, audit

---

#### **TICKET-018: Implementar lógica de bloqueo por intentos fallidos**

**Título:** Implementar lógica de bloqueo por intentos fallidos

**Descripción:**
Implementar lógica que bloquee cuenta tras N intentos fallidos consecutivos (configurable, default: 5).

**Criterios de Aceptación:**
- ✅ Contador de intentos fallidos por usuario
- ✅ Bloqueo automático tras 5 intentos fallidos
- ✅ Campo `cuenta_bloqueada` en tabla users
- ✅ Timestamp de bloqueo registrado
- ✅ Mensaje de error específico al bloquear
- ✅ Reseteo de contador tras login exitoso

**Prioridad:** Alta  
**Esfuerzo:** 3 horas  
**Etiquetas:** backend, security, auth, validation

---

#### **TICKET-019: Crear Guard de autenticación JWT**

**Título:** Crear Guard de autenticación JWT

**Descripción:**
Implementar JwtAuthGuard que valide token JWT en cada request protegido y extraiga información del usuario.

**Criterios de Aceptación:**
- ✅ JwtAuthGuard extendiendo AuthGuard('jwt')
- ✅ Validación automática de token en header Authorization
- ✅ Extracción de usuario del payload JWT
- ✅ Usuario disponible en request.user
- ✅ Manejo de errores (token inválido, expirado)
- ✅ Guard reutilizable con decorador

**Prioridad:** Crítica  
**Esfuerzo:** 2 horas  
**Etiquetas:** backend, auth, guard, security

---

#### **TICKET-020: Crear decorador @CurrentUser para obtener usuario autenticado**

**Título:** Crear decorador @CurrentUser para obtener usuario autenticado

**Descripción:**
Crear decorador personalizado que extraiga el usuario del request de forma limpia en los controladores.

**Criterios de Aceptación:**
- ✅ Decorador @CurrentUser() creado
- ✅ Extrae usuario de request.user
- ✅ Puede extraer campos específicos: @CurrentUser('id')
- ✅ TypeScript typing correcto
- ✅ Documentación de uso

**Prioridad:** Media  
**Esfuerzo:** 1 hora  
**Etiquetas:** backend, decorator, utility

---

#### **TICKET-021: Implementar servicio de recuperación de contraseña**

**Título:** Implementar servicio de recuperación de contraseña

**Descripción:**
Crear lógica para generar token de recuperación de contraseña, almacenarlo temporalmente y preparar envío de email.

**Criterios de Aceptación:**
- ✅ Tabla `password_reset_tokens` creada
- ✅ Generación de token único (UUID)
- ✅ Expiración: 1 hora
- ✅ Método para validar token
- ✅ Método para invalidar token tras uso
- ✅ Un solo token activo por usuario

**Prioridad:** Media  
**Esfuerzo:** 2.5 horas  
**Etiquetas:** backend, auth, password-recovery

---

#### **TICKET-022: Crear endpoint POST /auth/forgot-password**

**Título:** Crear endpoint POST /auth/forgot-password

**Descripción:**
Endpoint para solicitar recuperación de contraseña mediante email, genera token y prepara envío.

**Criterios de Aceptación:**
- ✅ Endpoint POST /api/v1/auth/forgot-password
- ✅ Recibe email del usuario
- ✅ Valida que usuario existe
- ✅ Genera token de recuperación
- ✅ Retorna mensaje genérico (seguridad)
- ✅ No revela si usuario existe o no

**Prioridad:** Media  
**Esfuerzo:** 2 horas  
**Etiquetas:** backend, auth, endpoint, password-recovery

---

#### **TICKET-023: Crear endpoint POST /auth/reset-password**

**Título:** Crear endpoint POST /auth/reset-password

**Descripción:**
Endpoint para establecer nueva contraseña usando token de recuperación válido.

**Criterios de Aceptación:**
- ✅ Endpoint POST /api/v1/auth/reset-password
- ✅ Recibe token y nueva contraseña
- ✅ Valida token (existencia, expiración)
- ✅ Valida política de contraseña
- ✅ Actualiza contraseña con hash bcrypt
- ✅ Invalida token tras uso
- ✅ Registra evento en auditoría

**Prioridad:** Media  
**Esfuerzo:** 2.5 horas  
**Etiquetas:** backend, auth, endpoint, password-recovery

---

#### **TICKET-024: Crear servicio de validación de política de contraseñas**

**Título:** Crear servicio de validación de política de contraseñas

**Descripción:**
Implementar servicio que valide política de contraseñas: mínimo 8 caracteres, mayúsculas, minúsculas, números y caracteres especiales.

**Criterios de Aceptación:**
- ✅ Validación de longitud mínima (8 caracteres)
- ✅ Al menos una mayúscula
- ✅ Al menos una minúscula
- ✅ Al menos un número
- ✅ Al menos un carácter especial
- ✅ Mensajes de error descriptivos
- ✅ Configuración parametrizable

**Prioridad:** Alta  
**Esfuerzo:** 2 horas  
**Etiquetas:** backend, security, validation

---

#### **TICKET-025: Implementar rate limiting en endpoints de autenticación**

**Título:** Implementar rate limiting en endpoints de autenticación

**Descripción:**
Implementar throttler de NestJS para limitar intentos de login y prevenir ataques de fuerza bruta.

**Criterios de Aceptación:**
- ✅ @nestjs/throttler instalado
- ✅ Rate limiting en /auth/login: 5 intentos por minuto
- ✅ Rate limiting en /auth/forgot-password: 3 intentos por hora
- ✅ Headers de rate limit en respuesta
- ✅ Error 429 cuando se excede límite
- ✅ Configurable por endpoint

**Prioridad:** Alta  
**Esfuerzo:** 2.5 horas  
**Etiquetas:** backend, security, rate-limiting

---

### 🏢 Módulo: Multi-tenancy (Cooperativas)

---

#### **TICKET-026: Diseñar esquema de base de datos para cooperativas**

**Título:** Diseñar esquema de base de datos para cooperativas

**Descripción:**
Diseñar tabla de cooperativas con todos los campos necesarios para soporte multi-tenant.

**Criterios de Aceptación:**
- ✅ Diagrama ER actualizado con tabla cooperativas
- ✅ Campos definidos: id, codigo, razon_social, nombre_comercial, ruc, logo_url, configuracion (JSONB)
- ✅ Índice único en codigo y ruc
- ✅ Relaciones con otras tablas identificadas
- ✅ Estrategia de filtrado por tenant definida

**Prioridad:** Crítica  
**Esfuerzo:** 2 horas  
**Etiquetas:** backend, database, design, multi-tenant

---

#### **TICKET-027: Crear migración para tabla cooperativas**

**Título:** Crear migración para tabla cooperativas

**Descripción:**
Implementar migración para crear tabla cooperativas con datos semilla de cooperativa demo.

**Criterios de Aceptación:**
- ✅ Tabla `cooperativas` creada
- ✅ Todos los campos implementados
- ✅ Índices únicos en codigo y ruc
- ✅ Timestamps de auditoría
- ✅ Datos semilla: 1 cooperativa demo
- ✅ Migración ejecuta y revierte correctamente

**Prioridad:** Crítica  
**Esfuerzo:** 2 horas  
**Etiquetas:** backend, database, migration, multi-tenant

---

#### **TICKET-028: Crear entidad Cooperativa con TypeORM**

**Título:** Crear entidad Cooperativa con TypeORM

**Descripción:**
Crear clase de entidad Cooperativa con todos sus campos y relaciones.

**Criterios de Aceptación:**
- ✅ Entidad Cooperativa con decoradores @Entity
- ✅ Todos los campos mapeados
- ✅ Campo configuracion como tipo JSON
- ✅ Relaciones con User, Cliente definidas
- ✅ Métodos auxiliares (isActive, etc.)
- ✅ Validaciones básicas

**Prioridad:** Crítica  
**Esfuerzo:** 2 horas  
**Etiquetas:** backend, entity, typeorm, multi-tenant

---

#### **TICKET-029: Agregar campo cooperativa_id a tablas principales**

**Título:** Agregar campo cooperativa_id a tablas principales

**Descripción:**
Crear migración para agregar campo cooperativa_id (FK) a todas las tablas de datos: users, personas, clientes, etc.

**Criterios de Aceptación:**
- ✅ Campo cooperativa_id agregado a: users, personas, clientes, catálogos (si aplica)
- ✅ Foreign key constraints correctos
- ✅ Índices compuestos (cooperativa_id, id) creados
- ✅ NOT NULL constraint aplicado
- ✅ Datos existentes actualizados con cooperativa demo

**Prioridad:** Crítica  
**Esfuerzo:** 3 horas  
**Etiquetas:** backend, database, migration, multi-tenant

---

#### **TICKET-030: Crear interceptor de tenant (TenantInterceptor)**

**Título:** Crear interceptor de tenant (TenantInterceptor)

**Descripción:**
Implementar interceptor que inyecte automáticamente cooperativa_id en todas las queries basado en el usuario autenticado.

**Criterios de Aceptación:**
- ✅ TenantInterceptor creado
- ✅ Extrae cooperativa_id del usuario autenticado
- ✅ Aplica filtro global a repositorios de TypeORM
- ✅ Funciona en queries de lectura y escritura
- ✅ Excluye tablas globales (cooperativas, etc.)
- ✅ Pruebas de aislamiento de datos

**Prioridad:** Crítica  
**Esfuerzo:** 3 horas  
**Etiquetas:** backend, interceptor, multi-tenant, security

---

#### **TICKET-031: Crear decorador @CurrentTenant**

**Título:** Crear decorador @CurrentTenant

**Descripción:**
Crear decorador que extraiga la cooperativa actual del usuario autenticado.

**Criterios de Aceptación:**
- ✅ Decorador @CurrentTenant() creado
- ✅ Extrae cooperativa del request.user
- ✅ Puede retornar ID o entidad completa
- ✅ TypeScript typing correcto
- ✅ Documentación de uso

**Prioridad:** Media  
**Esfuerzo:** 1 hora  
**Etiquetas:** backend, decorator, multi-tenant

---

#### **TICKET-032: Implementar CRUD de cooperativas (backend)**

**Título:** Implementar CRUD de cooperativas (backend)

**Descripción:**
Crear servicio y controlador para gestión de cooperativas: crear, listar, editar, desactivar.

**Criterios de Aceptación:**
- ✅ CooperativasService creado con métodos CRUD
- ✅ CooperativasController con endpoints REST
- ✅ GET /cooperativas - Listar todas (paginado)
- ✅ GET /cooperativas/:id - Obtener una
- ✅ POST /cooperativas - Crear nueva
- ✅ PUT /cooperativas/:id - Actualizar
- ✅ DELETE /cooperativas/:id - Desactivar (soft delete)
- ✅ Solo SuperAdmin puede acceder

**Prioridad:** Alta  
**Esfuerzo:** 3 horas  
**Etiquetas:** backend, crud, multi-tenant, cooperativas

---

#### **TICKET-033: Crear DTOs para cooperativas**

**Título:** Crear DTOs para cooperativas

**Descripción:**
Crear DTOs para crear, actualizar y respuesta de cooperativas con validaciones.

**Criterios de Aceptación:**
- ✅ CreateCooperativaDto con validaciones
- ✅ UpdateCooperativaDto (campos opcionales)
- ✅ CooperativaResponseDto para respuestas
- ✅ Validaciones de RUC ecuatoriano
- ✅ Validación de código único
- ✅ Validación de campos obligatorios

**Prioridad:** Alta  
**Esfuerzo:** 2 horas  
**Etiquetas:** backend, dto, validation, multi-tenant

---

### 👥 Módulo: Gestión de Roles y Permisos

---

#### **TICKET-034: Crear tabla de permisos con datos semilla**

**Título:** Crear tabla de permisos con datos semilla

**Descripción:**
Crear migración que inserte todos los permisos del sistema con estructura Módulo.Submódulo.Acción.

**Criterios de Aceptación:**
- ✅ Permisos de Autenticación insertados
- ✅ Permisos de Usuarios insertados (Gestión, Búsqueda, Parámetros)
- ✅ Permisos de Catálogos insertados
- ✅ Permisos de Clientes insertados
- ✅ Permisos de Auditoría insertados
- ✅ Nomenclatura estándar: Modulo.Submodulo.Accion
- ✅ ~50-80 permisos iniciales

**Prioridad:** Alta  
**Esfuerzo:** 3 horas  
**Etiquetas:** backend, database, migration, roles, permissions

---

#### **TICKET-035: Asignar permisos a roles predefinidos**

**Título:** Asignar permisos a roles predefinidos

**Descripción:**
Crear migración que asigne permisos apropiados a cada rol predefinido (SuperAdmin, Admin, Operador, Consultor).

**Criterios de Aceptación:**
- ✅ SuperAdmin: todos los permisos
- ✅ Admin: gestión completa excepto cooperativas
- ✅ Operador: CRUD de clientes, usuarios (limitado)
- ✅ Consultor: solo lectura
- ✅ Relaciones en tabla role_permissions insertadas
- ✅ Matriz de permisos documentada

**Prioridad:** Alta  
**Esfuerzo:** 2.5 horas  
**Etiquetas:** backend, database, migration, roles, permissions

---

#### **TICKET-036: Crear Guard de permisos (PermissionsGuard)**

**Título:** Crear Guard de permisos (PermissionsGuard)

**Descripción:**
Implementar guard que valide si usuario tiene permisos específicos para ejecutar una acción.

**Criterios de Aceptación:**
- ✅ PermissionsGuard creado
- ✅ Valida permisos del usuario autenticado
- ✅ Carga permisos desde BD (con cache)
- ✅ Permite especificar permisos requeridos
- ✅ Maneja operadores lógicos (AND, OR)
- ✅ Error 403 si no tiene permisos

**Prioridad:** Crítica  
**Esfuerzo:** 3 horas  
**Etiquetas:** backend, guard, security, permissions

---

#### **TICKET-037: Crear decorador @RequirePermissions**

**Título:** Crear decorador @RequirePermissions

**Descripción:**
Crear decorador que permita especificar permisos requeridos para un endpoint de forma declarativa.

**Criterios de Aceptación:**
- ✅ Decorador @RequirePermissions(...permisos) creado
- ✅ Acepta uno o múltiples permisos
- ✅ Soporta operador AND (todos requeridos)
- ✅ Soporta operador OR (al menos uno)
- ✅ Se usa junto con PermissionsGuard
- ✅ TypeScript typing correcto

**Prioridad:** Alta  
**Esfuerzo:** 1.5 horas  
**Etiquetas:** backend, decorator, permissions

---

#### **TICKET-038: Implementar caché de permisos con Redis (opcional)**

**Título:** Implementar caché de permisos con Redis

**Descripción:**
Configurar Redis y crear servicio de caché para almacenar permisos de usuarios y reducir consultas a BD.

**Criterios de Aceptación:**
- ✅ Redis instalado y configurado
- ✅ @nestjs/cache-manager integrado
- ✅ Permisos de usuario cacheados tras login
- ✅ TTL: 15 minutos
- ✅ Invalidación al cambiar roles/permisos
- ✅ Fallback a BD si Redis no disponible

**Prioridad:** Baja  
**Esfuerzo:** 3 horas  
**Etiquetas:** backend, cache, redis, performance, optional

---

#### **TICKET-039: Crear servicio RolesService para gestión de roles**

**Título:** Crear servicio RolesService para gestión de roles

**Descripción:**
Implementar servicio con lógica de negocio para CRUD de roles y asignación de permisos.

**Criterios de Aceptación:**
- ✅ Métodos: findAll, findOne, create, update, delete
- ✅ Método assignPermissions(roleId, permissionIds[])
- ✅ Método removePermissions(roleId, permissionIds[])
- ✅ Validación: roles de sistema no se pueden eliminar
- ✅ Validación: al menos un SuperAdmin siempre existe
- ✅ Métodos async con manejo de errores

**Prioridad:** Alta  
**Esfuerzo:** 3 horas  
**Etiquetas:** backend, service, roles

---

#### **TICKET-040: Crear endpoints REST para gestión de roles**

**Título:** Crear endpoints REST para gestión de roles

**Descripción:**
Crear controlador con endpoints para CRUD de roles.

**Criterios de Aceptación:**
- ✅ GET /roles - Listar roles (paginado)
- ✅ GET /roles/:id - Obtener un rol con permisos
- ✅ POST /roles - Crear rol nuevo
- ✅ PUT /roles/:id - Actualizar rol
- ✅ DELETE /roles/:id - Eliminar rol (validaciones)
- ✅ POST /roles/:id/permissions - Asignar permisos
- ✅ Requiere permisos de administrador

**Prioridad:** Alta  
**Esfuerzo:** 3 horas  
**Etiquetas:** backend, endpoint, roles

---

#### **TICKET-041: Crear DTOs para roles**

**Título:** Crear DTOs para roles

**Descripción:**
Crear DTOs para operaciones de roles con validaciones.

**Criterios de Aceptación:**
- ✅ CreateRoleDto con validaciones
- ✅ UpdateRoleDto (campos opcionales)
- ✅ RoleResponseDto con permisos incluidos
- ✅ AssignPermissionsDto con array de IDs
- ✅ Validaciones de campos obligatorios
- ✅ Transformaciones necesarias

**Prioridad:** Media  
**Esfuerzo:** 1.5 horas  
**Etiquetas:** backend, dto, validation, roles

---

#### **TICKET-042: Crear servicio PermissionsService**

**Título:** Crear servicio PermissionsService

**Descripción:**
Implementar servicio para consultar y gestionar permisos del sistema.

**Criterios de Aceptación:**
- ✅ Método findAll() - Listar todos los permisos
- ✅ Método findByModule(module) - Filtrar por módulo
- ✅ Método findByRole(roleId) - Permisos de un rol
- ✅ Método findByUser(userId) - Permisos de un usuario
- ✅ Método checkPermission(userId, permission) - Validar permiso
- ✅ Caché implementado (opcional)

**Prioridad:** Alta  
**Esfuerzo:** 2.5 horas  
**Etiquetas:** backend, service, permissions

---

#### **TICKET-043: Crear endpoints REST para consulta de permisos**

**Título:** Crear endpoints REST para consulta de permisos

**Descripción:**
Crear endpoints para que frontend pueda consultar permisos disponibles y asignados.

**Criterios de Aceptación:**
- ✅ GET /permissions - Listar todos (agrupados por módulo)
- ✅ GET /permissions/modules - Listar módulos disponibles
- ✅ GET /permissions/role/:roleId - Permisos de un rol
- ✅ GET /permissions/user/:userId - Permisos de un usuario
- ✅ GET /permissions/me - Permisos del usuario actual
- ✅ Respuestas en formato jerárquico

**Prioridad:** Media  
**Esfuerzo:** 2.5 horas  
**Etiquetas:** backend, endpoint, permissions

---

### 🗄️ Módulo: Auditoría Transversal

---

#### **TICKET-044: Diseñar esquema de tabla audit_logs**

**Título:** Diseñar esquema de tabla audit_logs

**Descripción:**
Diseñar tabla centralizada para almacenar todos los logs de auditoría del sistema.

**Criterios de Aceptación:**
- ✅ Tabla audit_logs diseñada
- ✅ Campos: id, modulo, accion, entidad, entidad_id, usuario_id, usuario_ip, datos_anteriores (JSONB), datos_nuevos (JSONB), metadata (JSONB), fecha_hora
- ✅ Índices en: modulo, accion, usuario_id, fecha_hora, entidad
- ✅ Particionamiento por fecha considerado (opcional)
- ✅ Política de retención definida

**Prioridad:** Alta  
**Esfuerzo:** 2 horas  
**Etiquetas:** backend, database, design, audit

---

#### **TICKET-045: Crear migración para tabla audit_logs**

**Título:** Crear migración para tabla audit_logs

**Descripción:**
Implementar migración para crear tabla de auditoría con índices optimizados.

**Criterios de Aceptación:**
- ✅ Tabla audit_logs creada
- ✅ Todos los campos implementados
- ✅ Índices creados en campos de búsqueda frecuente
- ✅ Campos JSONB para flexibilidad
- ✅ Sin foreign keys para no afectar performance
- ✅ Migración ejecuta correctamente

**Prioridad:** Alta  
**Esfuerzo:** 2 horas  
**Etiquetas:** backend, database, migration, audit

---

#### **TICKET-046: Crear entidad AuditLog con TypeORM**

**Título:** Crear entidad AuditLog con TypeORM

**Descripción:**
Crear entidad para logs de auditoría con campos JSONB para datos flexibles.

**Criterios de Aceptación:**
- ✅ Entidad AuditLog creada
- ✅ Campos JSONB mapeados correctamente
- ✅ Sin relaciones FK (por performance)
- ✅ Timestamps automáticos
- ✅ Métodos de creación estáticos
- ✅ Serialización correcta de JSONB

**Prioridad:** Alta  
**Esfuerzo:** 2 horas  
**Etiquetas:** backend, entity, typeorm, audit

---

#### **TICKET-047: Crear servicio AuditService para registro de eventos**

**Título:** Crear servicio AuditService para registro de eventos

**Descripción:**
Implementar servicio centralizado para registrar eventos de auditoría desde cualquier módulo.

**Criterios de Aceptación:**
- ✅ Método log(modulo, accion, entidad, entidadId, userId, datosAnteriores, datosNuevos, metadata)
- ✅ Captura automática de IP desde request
- ✅ Captura de user agent
- ✅ Método async (no bloquea operación principal)
- ✅ Manejo de errores robusto
- ✅ Injectable y disponible globalmente

**Prioridad:** Crítica  
**Esfuerzo:** 2.5 horas  
**Etiquetas:** backend, service, audit

---

#### **TICKET-048: Crear interceptor global de auditoría (AuditInterceptor)**

**Título:** Crear interceptor global de auditoría (AuditInterceptor)

**Descripción:**
Implementar interceptor que capture automáticamente operaciones críticas (POST, PUT, DELETE) y las registre en auditoría.

**Criterios de Aceptación:**
- ✅ AuditInterceptor creado
- ✅ Captura automática de POST, PUT, DELETE
- ✅ Excluye endpoints públicos (login, etc.)
- ✅ Captura body del request
- ✅ Captura response
- ✅ No bloquea operación en caso de error
- ✅ Configurable con decorador @NoAudit

**Prioridad:** Alta  
**Esfuerzo:** 3 horas  
**Etiquetas:** backend, interceptor, audit

---

#### **TICKET-049: Crear decorador @Audit para auditoría manual**

**Título:** Crear decorador @Audit para auditoría manual

**Descripción:**
Crear decorador que permita marcar métodos específicos para auditoría manual con metadata personalizada.

**Criterios de Aceptación:**
- ✅ Decorador @Audit(modulo, accion) creado
- ✅ Permite especificar módulo y acción custom
- ✅ Permite capturar parámetros específicos
- ✅ Funciona con AuditInterceptor
- ✅ TypeScript typing correcto
- ✅ Documentación de uso

**Prioridad:** Media  
**Esfuerzo:** 2 horas  
**Etiquetas:** backend, decorator, audit

---

#### **TICKET-050: Implementar endpoints de consulta de logs de auditoría**

**Título:** Implementar endpoints de consulta de logs de auditoría

**Descripción:**
Crear controlador con endpoints para consultar y filtrar logs de auditoría.

**Criterios de Aceptación:**
- ✅ GET /audit - Listar logs (paginado, filtros)
- ✅ GET /audit/:id - Obtener log específico
- ✅ Filtros: módulo, acción, usuario, fecha desde/hasta, entidad
- ✅ Ordenamiento por fecha descendente
- ✅ Paginación configurable
- ✅ Solo usuarios con permisos de auditoría
- ✅ Performance optimizado (índices)

**Prioridad:** Alta  
**Esfuerzo:** 3 horas  
**Etiquetas:** backend, endpoint, audit

---

## 📊 RESUMEN DEL BLOQUE 1

**Tickets Generados:** 50  
**Esfuerzo Total:** ~119 horas (~3 semanas)

### Distribución por Categoría:
- ⚙️ Configuración Inicial: 5 tickets (12 horas)
- 🔐 Autenticación y Seguridad: 20 tickets (51.5 horas)
- 🏢 Multi-tenancy: 8 tickets (20 horas)
- 👥 Roles y Permisos: 10 tickets (26 horas)
- 🗄️ Auditoría: 7 tickets (16.5 horas)

### Estado:
✅ **Bloque 1 completado** - Cubre la base fundamental del sistema (US-001 parcial)

---

## 🎯 Próximo Bloque

El **Bloque 2** continuará con:
- Finalización de US-001 (catálogos, frontend de autenticación)
- Inicio de US-002 (gestión de usuarios)

---

**Fecha de Generación:** 17 de Diciembre de 2025  
**Bloque:** 1 de 9
