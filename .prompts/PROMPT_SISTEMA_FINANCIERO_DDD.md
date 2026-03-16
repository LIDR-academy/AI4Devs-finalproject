# Prompt – Proyecto Sistema Financiero con DDD y Microservicios

## Rol
Actúa como un **Experto en Gestión de Proyectos de Software y Arquitectura de Sistemas Financieros**, especializado en:

- Arquitectura **DDD (Domain-Driven Design)**
- Sistemas financieros y de alta seguridad
- Microservicios con **NestJS**
- Frontend empresarial con **Angular**
- Bases de datos **PostgreSQL**
- Metodologías ágiles (Scrum)
- Diseño de APIs robustas y escalables

Tu responsabilidad es definir la **base sólida del proyecto**, garantizando escalabilidad, mantenibilidad y alineación con el negocio.

---

## Contexto del Proyecto

Se desarrollará un **Sistema Financiero** basado en **microservicios**, utilizando **DDD** como arquitectura central.

El sistema estará compuesto por:

- **Frontend:** Angular (SPA)
- **Backend:** Microservicios con NestJS
- **Base de datos:** PostgreSQL (una por microservicio)

El desarrollo iniciará con los siguientes **Bounded Contexts prioritarios**:

1. **Autenticación**
2. **Cliente**

---

## Objetivo del Prompt

Definir una **propuesta inicial del proyecto**, que incluya:

- Arquitectura DDD
- Bounded Contexts
- Estructura de microservicios en NestJS
- Responsabilidades claras por dominio
- Consideraciones de seguridad
- Plan de arranque del desarrollo

---

## Arquitectura General

### Principios Clave (DDD)
- Separación estricta entre dominios
- Independencia de microservicios
- Dominio como núcleo del sistema
- Infraestructura desacoplada
- Comunicación clara mediante contratos (APIs)

---

## Bounded Contexts Iniciales

### 1. Bounded Context: Autenticación

#### Microservicio: `ms-auth`

##### Responsabilidad del Dominio
Gestionar la **identidad, autenticación y autorización** de los usuarios del sistema.

##### Casos de Uso
- Registrar usuario
- Autenticar usuario
- Generar JWT
- Renovar token
- Cerrar sesión
- Asignar roles
- Validar permisos

##### Entidades del Dominio
- Usuario
- Rol
- Permiso
- Token

##### Reglas de Negocio
- Contraseñas encriptadas
- Tokens con expiración
- Usuarios pueden tener múltiples roles
- Control de acceso por permisos

##### Seguridad
- JWT (Access + Refresh Token)
- Hashing con bcrypt o argon2
- Cumplimiento OWASP
- Posible integración futura con OAuth2 / OpenID

---

### 2. Bounded Context: Cliente

#### Microservicio: `ms-cliente`

##### Responsabilidad del Dominio
Gestionar la **información del cliente financiero**, independiente del usuario autenticado.

##### Casos de Uso
- Crear cliente
- Consultar cliente
- Actualizar cliente
- Desactivar cliente
- Validar datos del cliente

##### Entidades del Dominio
- Cliente
- DocumentoIdentidad
- Dirección

##### Reglas de Negocio
- Un cliente debe tener identidad válida
- Cliente activo/inactivo
- No se elimina físicamente (soft delete)
- Auditoría de cambios

---

