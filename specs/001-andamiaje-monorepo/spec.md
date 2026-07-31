# Feature Specification: Andamiaje Base del Monorepo

**Feature Branch**: `001-andamiaje-monorepo`

**Created**: 2026-07-27

**Status**: Draft

**Input**: User description: "Establecer el andamiaje base del monorepo del sistema de Certificados Electrónicos CCB, de modo que el equipo de desarrollo tenga un esqueleto de proyecto consistente, compilable y listo para empezar a implementar features de negocio."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Esqueleto backend compilable de extremo a extremo (Priority: P1) 🎯 MVP

Como desarrollador del equipo, quiero un esqueleto de monorepo que contenga los tres microservicios (solicitudes, descargas, verificacion) —cada uno dividido en sus capas— junto con los módulos compartidos, y que **compile completo con un único comando desde la raíz**, para poder empezar a añadir lógica de negocio sin tener que crear ni reconfigurar la estructura.

**Why this priority**: Sin un esqueleto compilable no puede empezar ninguna feature de negocio. Es el habilitador raíz del que dependen las demás features del sistema; entrega valor inmediato al desbloquear el desarrollo.

**Independent Test**: Ejecutar la compilación del proyecto desde la raíz y verificar que todos los módulos backend declarados (solicitudes con 4 módulos, descargas con 3, verificacion con 3, y 3 módulos compartidos) compilan sin errores en una sola invocación.

**Acceptance Scenarios**:

1. **Given** un clon limpio del repositorio, **When** el desarrollador ejecuta la compilación desde la raíz, **Then** todos los módulos backend compilan exitosamente sin intervención manual adicional.
2. **Given** la estructura del monorepo, **When** se inspeccionan los tres microservicios, **Then** solicitudes presenta sus cuatro capas (domain, application, infrastructure, api), descargas y verificacion presentan tres capas cada uno (application, infrastructure, api), y los módulos compartidos (shared-kernel, shared-auth, shared-contracts) están presentes.
3. **Given** la capa domain de solicitudes (y las capas application de todos los servicios), **When** se revisan sus dependencias, **Then** no dependen de ningún framework (permanecen en Java puro).

---

### User Story 2 - Arranque independiente de cada microservicio (Priority: P2)

Como desarrollador, quiero poder **arrancar cada microservicio de forma independiente** en su puerto asignado y comprobar que responde a un chequeo de salud, para validar que el esqueleto de ejecución de cada servicio está correctamente cableado antes de implementar casos de uso.

**Why this priority**: Confirma que el esqueleto no solo compila, sino que constituye una aplicación ejecutable por servicio. Es prerequisito para desarrollar y probar endpoints de negocio, pero depende del esqueleto compilable (US1).

**Independent Test**: Arrancar cada microservicio por separado y verificar que queda disponible en su puerto (solicitudes 8081, descargas 8082, verificacion 8083) y que su chequeo de salud responde correctamente.

**Acceptance Scenarios**:

1. **Given** el esqueleto compilado, **When** el desarrollador arranca el microservicio de solicitudes, **Then** el servicio queda disponible en el puerto 8081 y su chequeo de salud responde de forma satisfactoria.
2. **Given** el esqueleto compilado, **When** el desarrollador arranca los microservicios de descargas y verificacion, **Then** cada uno queda disponible en su puerto (8082 y 8083 respectivamente) de forma independiente del resto.
3. **Given** la configuración de un servicio, **When** se revisan sus valores sensibles, **Then** ninguno está en texto claro y todos se resuelven por variables de entorno parametrizables por ambiente.

---

### User Story 3 - Frontends y artefactos de despliegue en su lugar (Priority: P3)

Como desarrollador, quiero que las dos aplicaciones frontend (portal-certificados y portal-verificacion) existan como proyectos independientes que compilan, y que exista una ubicación dedicada para los artefactos de despliegue, para que el monorepo refleje la arquitectura completa del sistema y las siguientes features tengan dónde construir.

**Why this priority**: Completa la estructura del monorepo end-to-end (backend + frontend + despliegue). Aporta valor de organización y previsibilidad, pero no bloquea el arranque del desarrollo backend, por eso tiene menor prioridad.

**Independent Test**: Compilar cada aplicación frontend por separado y verificar que la compilación es exitosa; verificar que existe la carpeta de despliegue con su estructura base.

**Acceptance Scenarios**:

1. **Given** el monorepo, **When** el desarrollador compila la aplicación portal-certificados, **Then** la compilación es exitosa.
2. **Given** el monorepo, **When** el desarrollador compila la aplicación portal-verificacion, **Then** la compilación es exitosa e independiente de la anterior.
3. **Given** la estructura del repositorio, **When** se inspecciona la raíz, **Then** existe una carpeta dedicada a los artefactos de despliegue.

---

### Edge Cases

- ¿Qué ocurre si un desarrollador no tiene instalados los prerequisitos (runtime del backend, runtime del frontend)? → El proyecto debe fallar con un mensaje claro y el README debe documentar los prerequisitos y versiones requeridas.
- ¿Qué ocurre si se intenta que la capa domain dependa de un framework? → La verificación de reglas de arquitectura debe detectarlo y romper la compilación.
- ¿Qué ocurre al añadir un nuevo módulo o servicio? → Debe integrarse a la compilación raíz declarándolo en un único punto, sin duplicar configuración de construcción.
- ¿Qué ocurre si dos módulos declaran versiones distintas de la misma dependencia? → La gestión centralizada de versiones debe evitar divergencias (una sola fuente de verdad).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El monorepo MUST alojar tres microservicios backend independientes: solicitudes con cuatro módulos de capa (domain, application, infrastructure, api); descargas y verificacion con tres módulos de capa cada uno (application, infrastructure, api). La lógica de dominio de descargas y verificacion reside en su capa application y/o en shared-kernel, sin un módulo domain separado.
- **FR-002**: El monorepo MUST incluir un conjunto de módulos compartidos: shared-kernel (tipos base como Result y DomainException y base de entidades), shared-auth (configuración de seguridad) y shared-contracts (DTOs e interfaces comunes).
- **FR-003**: El monorepo MUST incluir dos aplicaciones frontend independientes: portal-certificados y portal-verificacion.
- **FR-004**: El monorepo MUST incluir una ubicación dedicada para los artefactos de despliegue.
- **FR-005**: El sistema MUST permitir compilar todos los módulos backend con un único comando ejecutado desde la raíz del monorepo.
- **FR-006**: Cada microservicio MUST poder arrancar de forma independiente en su puerto asignado (solicitudes 8081, descargas 8082, verificacion 8083) y exponer un chequeo de salud.
- **FR-007**: Todos los módulos backend MUST usar el paquete raíz `co.org.ccb.certificados`.
- **FR-008**: Las capas domain (solicitudes) y application (todos los servicios) MUST NOT depender de ningún framework (Java puro) y esta regla MUST ser verificable automáticamente en la compilación.
- **FR-009**: La gestión de versiones de dependencias MUST estar centralizada en una única fuente de verdad, evitando divergencias entre módulos.
- **FR-010**: La configuración de construcción común MUST ser reutilizable entre módulos para evitar duplicación (convenciones compartidas).
- **FR-011**: Cada módulo backend MUST incluir la estructura preparada para pruebas automatizadas (ubicación de tests lista para el enfoque TDD del proyecto).
- **FR-012**: Ningún valor sensible (secreto) MUST estar en archivos de configuración en texto claro; todos se resuelven vía variables de entorno parametrizables por ambiente.
- **FR-013**: El andamiaje MUST NOT incluir lógica de negocio, integraciones externas, esquema de base de datos ni endpoints funcionales; se limita a la estructura, la configuración de construcción y los esqueletos ejecutables.
- **FR-014**: El repositorio MUST incluir documentación mínima (README) con prerequisitos, versiones requeridas y los comandos para compilar y arrancar.

### Key Entities

No aplica: esta feature es de infraestructura estructural y no introduce entidades de datos de negocio.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un desarrollador compila la totalidad de los módulos backend con un único comando desde la raíz y obtiene un resultado exitoso.
- **SC-002**: Los tres microservicios arrancan de forma independiente y sus chequeos de salud responden satisfactoriamente en el 100% de los casos.
- **SC-003**: Un desarrollador nuevo clona el repositorio y obtiene una compilación exitosa en menos de 15 minutos, sin pasos manuales adicionales más allá de instalar los prerequisitos documentados.
- **SC-004**: Cambiar o añadir la versión de una dependencia se realiza en un único lugar central y aplica a todos los módulos que la consumen.
- **SC-005**: El 100% de los módulos declarados en la arquitectura (solicitudes: 4, descargas: 3, verificacion: 3, shared: 3 = 13 módulos backend + 2 frontends) existen y compilan.
- **SC-006**: La separación de capas es verificable automáticamente: cualquier intento de que domain o application dependan de un framework hace fallar la compilación.
- **SC-007**: Las dos aplicaciones frontend compilan de forma independiente con resultado exitoso.

## Assumptions

- El stack tecnológico está fijado por la constitución del proyecto (Principio I). Las versiones y herramientas concretas (runtime del backend, herramienta de construcción, framework frontend, verificador de arquitectura) se detallan en la fase de planificación (`/speckit.plan`), no en esta especificación.
- Los prerequisitos de entorno (runtimes y herramientas de construcción) los instala cada desarrollador en su máquina; el README documenta las versiones exactas requeridas.
- Cada microservicio incluye una aplicación mínima ejecutable con chequeo de salud, suficiente para probar el arranque, pero sin lógica de negocio.
- La carpeta de despliegue se crea con su estructura base; el contenido concreto de los artefactos de despliegue (imágenes, manifiestos) se define en features posteriores.
- Esta feature no depende de sistemas externos (PUP, TiendaWS, SHD, Cognito, S3, base de datos); su alcance es puramente estructural.
- El repositorio ya está inicializado localmente con la rama por defecto `DEV`.
