# PRD — Plataforma web de gestión de historial médico hospitalario

**Versión:** 1.0 (final)  
**Estado:** Aprobado para derivar épicas e historias de usuario  
**Alcance:** MVP — un único hospital  

---

## 1. Resumen ejecutivo

Plataforma web para un **único hospital** que permita al personal autorizado gestionar, consultar y cargar el historial médico de pacientes de forma simple, segura y organizada. El MVP prioriza un flujo operativo claro: el personal clínico da de alta perfiles médicos, carga documentación en PDF y, cuando corresponde, un médico o administrador **libera** al paciente creando su acceso al portal y notificándolo por correo.

Los pacientes, una vez liberados, pueden iniciar sesión y consultar **únicamente** su propio perfil e historial; no pueden modificar información. El sistema implementa control de acceso por rol, auditoría de accesos y prácticas de seguridad alineadas con la **LFPDPPP** (México), dado el manejo de datos sensibles de salud.

El producto se desarrollará como **monorepo** con frontend (Next.js) y backend (Django REST Framework), priorizando funcionalidad usable sobre características avanzadas innecesarias para la primera versión.

---

## 2. Problema a resolver

### Situación actual

Los pacientes necesitan acceder a su historial médico desde celular o navegador de forma simple y confiable. El hospital necesita que administradores, médicos y enfermería puedan cargar y consultar información médica de manera controlada, evitando accesos indebidos y garantizando que solo personal autorizado pueda habilitar el acceso del paciente a su información.

### Impacto

Sin una plataforma centralizada y segura, el acceso del paciente a su historial es difícil de gestionar, la trazabilidad es limitada y existe riesgo de exposición indebida de datos clínicos sensibles.

---

## 3. Objetivos del producto

| Objetivo | Descripción |
|---|---|
| **O1 — Acceso controlado del paciente** | Permitir que el paciente consulte su historial solo después de ser liberado por médico o administrador. |
| **O2 — Gestión clínica operativa** | Facilitar la creación de perfiles, carga de archivos PDF y consulta por personal autorizado. |
| **O3 — Seguridad y trazabilidad** | Garantizar permisos por rol, protección de archivos médicos y auditoría de accesos. |
| **O4 — MVP funcional** | Entregar una primera versión usable, evitando funcionalidades fuera de alcance. |
| **O5 — Base evolutiva** | Sentar reglas de negocio claras para escalar a épicas, historias y desarrollo asistido por IA. |

---

## 4. Usuarios objetivo y stakeholders

### Usuarios primarios

| Rol | Necesidad principal |
|---|---|
| **Paciente** | Consultar su historial médico de forma segura desde web o móvil. |
| **Médico** | Gestionar perfiles, subir documentos, liberar pacientes y crear usuarios paciente. |
| **Enfermera / enfermero** | Consultar perfiles y subir archivos médicos; sin permisos de liberación ni creación de usuarios. |
| **Administrador** | Operación completa del sistema: perfiles, archivos, usuarios, liberación y consulta de staff. |

### Stakeholders secundarios

- Dirección del hospital (visibilidad operativa y cumplimiento de buenas prácticas).
- Equipo de TI / operaciones (despliegue, mantenimiento, respaldo).
- Pacientes como titulares de datos personales bajo LFPDPPP.

---

## 5. Alcance del producto

### Dentro del alcance (MVP)

- Autenticación con JWT para todos los roles.
- Gestión de perfiles médicos con datos básicos obligatorios y estructura clínica opcional.
- Carga, consulta y descarga de archivos médicos en **PDF** (máx. 50 MB por archivo, sin límite de cantidad).
- Flujo de alta: perfil médico → liberación → creación de usuario paciente + notificación por correo.
- Dos listados separados: **pacientes** y **staff interno** (administradores, médicos, enfermería).
- Permisos diferenciados por rol.
- Auditoría de accesos a perfiles y archivos.
- Entorno local con Docker Compose (PostgreSQL + servicios de aplicación).
- Documentación de API (OpenAPI/Swagger vía drf-spectacular).

### Fuera del alcance

Ver sección 15 (Non-goals).

### Modelo de acceso a pacientes (decisión confirmada)

**Todo el personal clínico** (médicos y enfermería) puede consultar **todos los pacientes** del hospital. No existe asignación de pacientes por usuario en el MVP.

---

## 6. Funcionalidades principales

### 6.1 Autenticación y sesión

- Inicio de sesión para todos los roles.
- Acceso restringido según rol y estado del perfil (paciente bloqueado hasta liberación).

### 6.2 Gestión de perfiles médicos

- Alta de perfil con datos básicos obligatorios.
- Captura opcional de estructura clínica resumida.
- Perfil editable **solo mientras no esté liberado** (datos, estructura clínica y archivos).
- Tras la liberación, el perfil queda **solo lectura** para todo el sistema.

### 6.3 Gestión de archivos médicos

- Subida de PDFs asociados al perfil (médicos, enfermería, administradores).
- Consulta y descarga por roles autorizados.
- Validación de tipo (PDF) y tamaño (≤ 50 MB).

### 6.4 Liberación de paciente

- Acción exclusiva de **médico** y **administrador**.
- Al liberar: creación del usuario con rol **paciente**, generación/envío de credenciales por correo y cambio de estado a **liberado** (irreversible).
- El paciente puede iniciar sesión únicamente después de la liberación.

### 6.5 Gestión de usuarios

- **Médico y administrador:** creación de usuarios con rol paciente (vinculados al perfil en el flujo de liberación).
- **Administrador:** gestión ampliada según permisos del rol.
- **Listado de pacientes:** todos los perfiles/usuarios paciente del hospital.
- **Listado de staff interno:** administradores, médicos y enfermería (sin incluir pacientes).

### 6.6 Notificaciones

- Correo al paciente al liberar su perfil, incluyendo usuario y contraseña de acceso.

### 6.7 Auditoría

- Registro de accesos relevantes: quién consultó qué perfil o archivo y cuándo.

---

## 7. Roles, permisos y reglas de negocio

### 7.1 Matriz de permisos

| Acción | Paciente | Enfermería | Médico | Administrador |
|---|:---:|:---:|:---:|:---:|
| Iniciar sesión | ✓ | ✓ | ✓ | ✓ |
| Consultar propio perfil | ✓ (solo si liberado) | — | — | — |
| Consultar perfiles de pacientes | — | ✓ (todos) | ✓ (todos) | ✓ (todos) |
| Subir archivos PDF | — | ✓ | ✓ | ✓ |
| Consultar/descargar archivos | ✓ (propios) | ✓ | ✓ | ✓ |
| Crear/editar perfil médico (pre-liberación) | — | ✓* | ✓ | ✓ |
| Liberar perfil de paciente | — | — | ✓ | ✓ |
| Crear usuario paciente (en liberación) | — | — | ✓ | ✓ |
| Crear usuarios (otros roles) | — | — | — | ✓** |
| Listado de pacientes | — | ✓ | ✓ | ✓ |
| Listado de staff interno | — | — | ✓ | ✓ |
| Editar perfil/archivos post-liberación | — | — | — | — |

\* Enfermería puede subir archivos; la creación del perfil y edición de datos corresponde a médico/administrador según flujo operativo (ver reglas).  
\*\* Solo administrador puede crear usuarios de staff; médico solo crea pacientes (en liberación).

### 7.2 Reglas de negocio

**RB-01 — Visibilidad de pacientes**  
Todo el personal clínico autorizado ve todos los pacientes del hospital. No hay asignación individual.

**RB-02 — Perfil sin acceso**  
Un perfil médico puede existir sin usuario de acceso hasta ser liberado.

**RB-03 — Orden del flujo de alta**

1. Médico o administrador crea el perfil médico (datos básicos + archivos opcionales + estructura clínica opcional).
2. Personal autorizado puede consultar y enfermería/médico/administrador pueden subir PDFs mientras el perfil no esté liberado.
3. Médico o administrador ejecuta la **liberación**.
4. El sistema crea el usuario rol **paciente**, asocia credenciales y envía correo con usuario y contraseña.
5. El paciente accede al portal.

**RB-04 — Liberación irreversible**  
Una vez liberado, el perfil no puede revertirse ni bloquearse de nuevo en el MVP.

**RB-05 — Inmutabilidad post-liberación**  
Perfiles liberados no son editables (datos, estructura clínica ni archivos) por ningún rol.

**RB-06 — Edición pre-liberación**  
Perfiles no liberados sí pueden editarse, incluida la subida y gestión de archivos PDF.

**RB-07 — Restricción del paciente**  
El paciente solo consulta su propio perfil y archivos; no crea, edita, sube, elimina ni libera información.

**RB-08 — Creación de usuarios por médico**  
El médico solo puede crear usuarios con rol **paciente**, y únicamente en el contexto de la liberación.

**RB-09 — Listados separados**

- Listado general de **pacientes**.
- Listado de **staff interno** (administrador, médico, enfermería). Los pacientes no aparecen en el listado de staff.

**RB-10 — Archivos médicos**  
Solo PDF; máximo 50 MB por archivo; sin límite de cantidad por paciente.

**RB-11 — Instancia única**  
El MVP opera para un único hospital; no hay multi-tenant ni múltiples instituciones.

**RB-12 — Notificación obligatoria**  
Al liberar, el sistema debe enviar correo al paciente con credenciales de acceso.

---

## 8. User stories resumidas

### Paciente

- Como **paciente**, quiero **iniciar sesión con las credenciales recibidas por correo**, para **acceder a mi historial médico de forma segura**.
- Como **paciente**, quiero **consultar mi perfil y archivos médicos**, para **conocer mi información clínica disponible**.
- Como **paciente**, quiero **que nadie más vea mi información**, para **proteger mi privacidad**.

### Enfermería

- Como **enfermera/enfermero**, quiero **consultar todos los perfiles de pacientes**, para **atender mis actividades clínicas**.
- Como **enfermera/enfermero**, quiero **subir archivos PDF al perfil del paciente**, para **registrar documentación médica**.
- Como **enfermera/enfermero**, quiero **no poder liberar perfiles ni crear usuarios**, para **mantener controles de acceso adecuados**.

### Médico

- Como **médico**, quiero **crear perfiles médicos de pacientes**, para **iniciar su expediente digital**.
- Como **médico**, quiero **editar perfiles no liberados y subir PDFs**, para **mantener el historial actualizado antes del acceso del paciente**.
- Como **médico**, quiero **liberar el perfil del paciente**, para **habilitar su acceso al portal y notificarle por correo**.
- Como **médico**, quiero **consultar listados de pacientes y staff interno**, para **tener visibilidad operativa del hospital**.

### Administrador

- Como **administrador**, quiero **realizar todas las operaciones del sistema**, para **administrar la plataforma de forma integral**.
- Como **administrador**, quiero **consultar staff interno y pacientes por separado**, para **gestionar usuarios sin mezclar roles**.
- Como **administrador**, quiero **auditar accesos a perfiles y archivos**, para **garantizar trazabilidad y cumplimiento**.

---

## 9. Requisitos funcionales

### RF-01 Autenticación

- RF-01.1: El sistema debe autenticar usuarios con credenciales (usuario/contraseña) y emitir JWT.
- RF-01.2: El paciente no autenticado o no liberado no debe acceder a su perfil.
- RF-01.3: Cada petición autenticada debe validar rol y permisos.

### RF-02 Perfil médico

- RF-02.1: Médico y administrador pueden crear perfiles con campos obligatorios: **nombre**, **identificador hospitalario**, **email**, **fecha de nacimiento**.
- RF-02.2: El perfil puede incluir estructura clínica opcional (antecedentes, diagnósticos, notas clínicas, alergias u otros campos clínicos comunes a nivel resumido).
- RF-02.3: Perfiles no liberados son editables por roles autorizados.
- RF-02.4: Perfiles liberados son de solo lectura para todos los roles.

### RF-03 Archivos médicos

- RF-03.1: Subida de archivos PDF asociados al perfil (médico, enfermería, administrador).
- RF-03.2: Rechazar archivos que no sean PDF o superen 50 MB.
- RF-03.3: Consulta y descarga según permisos de rol.
- RF-03.4: No eliminar ni reemplazar archivos en perfiles liberados.

### RF-04 Liberación

- RF-04.1: Solo médico y administrador pueden liberar un perfil.
- RF-04.2: La liberación crea usuario rol paciente vinculado al perfil.
- RF-04.3: La liberación envía correo con usuario y contraseña.
- RF-04.4: La liberación es irreversible; el estado del perfil cambia permanentemente.
- RF-04.5: Enfermería no puede ejecutar liberación.

### RF-05 Usuarios y listados

- RF-05.1: Médico crea usuarios paciente únicamente al liberar.
- RF-05.2: Administrador gestiona usuarios según permisos completos del rol.
- RF-05.3: Listado de pacientes independiente del listado de staff.
- RF-05.4: Listado de staff incluye administradores, médicos y enfermería; excluye pacientes.
- RF-05.5: Médico y administrador pueden consultar el listado de staff interno.

### RF-06 Auditoría

- RF-06.1: Registrar accesos a consulta de perfiles (usuario, paciente/perfil, timestamp).
- RF-06.2: Registrar accesos a consulta/descarga de archivos (usuario, archivo, timestamp).
- RF-06.3: Administrador (y roles definidos) pueden consultar registros de auditoría.

### RF-07 Notificaciones

- RF-07.1: Envío automático de correo al liberar perfil con credenciales de acceso.

---

## 10. Requisitos técnicos generales

Basados en el stack definido; no sustituir tecnologías salvo necesidad justificada posterior.

### Repositorio

- Monorepo con carpetas separadas `frontend/` y `backend/`.
- `docker-compose.yml` en raíz.
- `.env.example` con variables documentadas.
- `README.md` con instrucciones de instalación y ejecución.

### Frontend

- Next.js, React, TypeScript, Tailwind CSS.
- React Hook Form + Zod para formularios y validación.
- `fetch` como cliente HTTP.
- TanStack Query para datos del backend, caché, loading, errores e invalidación.
- Zustand para estado global simple; Redux Toolkit solo si se requiere estado complejo.

### Backend

- Python, Django, Django REST Framework.
- Django CORS Headers.
- Autenticación JWT; sesiones solo si el caso lo requiere.
- Documentación API con drf-spectacular (OpenAPI/Swagger).

### Base de datos y entorno local

- PostgreSQL vía Docker Compose con volúmenes persistentes.
- Variables de entorno para credenciales y configuración.
- pgAdmin o Adminer opcional para administración visual de BD.

### Integraciones MVP

- Servicio de correo electrónico para notificaciones de liberación (proveedor por definir en implementación).
- Almacenamiento de archivos PDF con protección de acceso autenticado.

---

## 11. Requisitos de seguridad y privacidad

### Marco de referencia

- Aplicar **buenas prácticas de seguridad y privacidad**, tomando como referencia la **LFPDPPP (México)** por el tratamiento de datos sensibles de salud.
- **NOM-024**: referencia general únicamente; **no** es cumplimiento obligatorio en esta versión.

### Controles mínimos

| Área | Requisito |
|---|---|
| **Autenticación** | JWT seguro; contraseñas hasheadas; bloqueo de acceso pre-liberación para pacientes. |
| **Autorización** | RBAC estricto según matriz de permisos; validación en backend en cada operación. |
| **Datos sensibles** | Minimización de exposición; paciente solo accede a su propio perfil. |
| **Archivos médicos** | Almacenamiento protegido; acceso solo vía API autenticada y autorizada; validación PDF y tamaño. |
| **Auditoría** | Registro de consultas a perfiles y archivos; retención según política definida. |
| **Transporte** | HTTPS en entornos no locales / producción. |
| **CORS** | Configuración restrictiva acorde al frontend autorizado. |
| **Privacidad** | Tratamiento de datos personales y sensibles conforme a principios LFPDPPP (limitación de finalidad, responsabilidad, seguridad). |

---

## 12. Métricas de éxito

| Métrica | Descripción | Objetivo MVP |
|---|---|---|
| **M1 — Flujo de liberación completo** | % de liberaciones que crean usuario, envían correo y habilitan acceso | 100% en flujo feliz |
| **M2 — Control de acceso** | Intentos de acceso no autorizado denegados correctamente | 100% según RBAC |
| **M3 — Trazabilidad** | Accesos a perfiles/archivos registrados en auditoría | 100% de consultas auditables |
| **M4 — Integridad post-liberación** | Perfiles liberados sin modificaciones no autorizadas | 0 ediciones exitosas post-liberación |
| **M5 — Usabilidad operativa** | Personal clínico completa alta + carga PDF + consulta sin fricción crítica | Validación cualitativa en pruebas |
| **M6 — Disponibilidad local** | Proyecto levantable con Docker Compose siguiendo README | Instalación reproducible |

---

## 13. Riesgos potenciales

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Exposición indebida de datos clínicos | Alto | RBAC estricto, validación backend, auditoría. |
| Credenciales enviadas por correo en texto plano | Medio-Alto | Política de contraseña temporal + cambio obligatorio (si se confirma en implementación). |
| Perfiles bloqueados permanentemente por liberación irreversible | Medio | Validación previa en UI; confirmación explícita antes de liberar. |
| Archivos PDF maliciosos | Medio | Validación de tipo MIME/extensión; escaneo antivirus fuera de alcance MVP (evaluar). |
| Fallo en envío de correo | Medio | Manejo de errores; reintento o consulta de estado de liberación. |
| Ambigüedad en edición de perfiles por enfermería | Bajo-Medio | Definir en implementación si enfermería edita datos o solo sube archivos (ver preguntas abiertas). |
| Cumplimiento LFPDPPP incompleto en MVP académico | Medio | Documentar controles implementados; plan de hardening posterior. |
| Sin límite de archivos → crecimiento de almacenamiento | Bajo | Monitoreo; política de almacenamiento en despliegue. |

---

## 14. Criterios de aceptación generales

1. **Roles y permisos:** Cada rol ejecuta únicamente las acciones permitidas en la matriz de permisos.
2. **Flujo de paciente:** Perfil creado → documentos cargados → liberación → correo con credenciales → acceso del paciente a su historial.
3. **Pre/post liberación:** Edición permitida antes; solo lectura después; liberación irreversible.
4. **Listados:** Pacientes y staff en vistas separadas; pacientes excluidos del listado de staff.
5. **Archivos:** Solo PDF, máx. 50 MB, sin límite de cantidad; acceso controlado por rol.
6. **Auditoría:** Toda consulta relevante a perfil o archivo queda registrada.
7. **Visibilidad:** Todo el personal clínico ve todos los pacientes.
8. **Stack y despliegue local:** Monorepo, Docker Compose, README funcional, API documentada.
9. **Seguridad:** Autenticación JWT, protección de endpoints, alineación con controles LFPDPPP definidos.
10. **Alcance institucional:** Operación para un único hospital.

---

## 15. Non-goals / fuera de alcance

- Multi-hospital o multi-tenant.
- Asignación de pacientes a médicos o enfermería por usuario.
- Revocación o bloqueo de perfiles liberados.
- Edición de perfiles, estructura clínica o archivos después de la liberación.
- Tipos de archivo distintos a PDF.
- Cumplimiento obligatorio de NOM-024.
- Portal de autogestión del paciente (registro, recuperación de contraseña autónoma) — salvo lo definido explícitamente.
- Integración con HIS/EMR externos, laboratorios o sistemas de facturación.
- Telemedicina, citas, recetas electrónicas o módulos clínicos avanzados.
- Firma electrónica, cifrado end-to-end avanzado o certificación regulatoria formal.
- Aplicación móvil nativa (la experiencia es web responsive).
- Escaneo antivirus automatizado de PDFs (evaluable post-MVP).

---

## 16. Supuestos realizados

| ID | Supuesto |
|---|---|
| **S-01** | Un único hospital opera la plataforma; no se requiere separación por institución. |
| **S-02** | Todo el personal clínico autorizado accede a la totalidad de pacientes. |
| **S-03** | El email del perfil es el destino de credenciales y debe ser válido antes de liberar. |
| **S-04** | La estructura clínica opcional incluye campos comunes resumidos (antecedentes, diagnósticos, notas, alergias); el detalle fino se define en diseño de datos. |
| **S-05** | La contraseña inicial se genera automáticamente por el sistema al liberar (no confirmado explícitamente por el usuario). |
| **S-06** | Médico y administrador son responsables de crear el perfil médico inicial; enfermería participa principalmente en carga de archivos. |
| **S-07** | El listado de pacientes puede incluir perfiles aún no liberados (sin acceso activo). |
| **S-08** | La auditoría es consultable por administrador como mínimo. |
| **S-09** | El MVP académico prioriza controles LFPDPPP razonables sin certificación legal formal. |
| **S-10** | No se requiere eliminación lógica/física de usuarios staff en el MVP salvo decisión futura. |

---

## 17. Preguntas abiertas

Puntos no resueltos explícitamente; deben cerrarse antes o durante la fase de historias de usuario.

| ID | Pregunta |
|---|---|
| **P-01** | ¿Cómo se genera la contraseña al liberar (automática aleatoria, temporal, forzando cambio en primer login)? |
| **P-02** | ¿La enfermería puede editar **datos del perfil** (no solo subir archivos) en perfiles no liberados, o solo médico/administrador? |
| **P-03** | ¿Se pueden **eliminar** archivos PDF de perfiles **no liberados**? |
| **P-04** | ¿Los usuarios de **staff** (admin, médico, enfermería) pueden editarse, desactivarse o eliminarse después de crearse? |
| **P-05** | ¿Cómo se crea el **primer administrador** del sistema (semilla, comando, instalación)? |
| **P-06** | ¿Qué proveedor de correo se usará en desarrollo y producción (SMTP, servicio transaccional)? |
| **P-07** | ¿Quién puede **consultar** los registros de auditoría además del administrador (médico, compliance)? |
| **P-08** | ¿Retención y exportación de logs de auditoría (plazo, formato)? |
| **P-09** | ¿El paciente puede **descargar** sus PDFs o solo visualizarlos en el navegador? |
| **P-10** | ¿Campos exactos de la estructura clínica opcional (lista cerrada vs. campos libres)? |

---

## Anexo A — Campos del perfil médico (referencia MVP)

### Obligatorios

- Nombre completo
- Identificador hospitalario
- Email
- Fecha de nacimiento

### Estructura clínica (opcional, resumida)

- Antecedentes personales / familiares
- Alergias
- Diagnósticos principales
- Notas clínicas generales
- Medicación actual (si aplica)

### Archivos adjuntos

- Documentos PDF asociados al perfil (sin límite de cantidad; máx. 50 MB c/u)

---

## Anexo B — Flujo principal del MVP

```
[Médico/Admin crea perfil médico]
           ↓
[Personal autorizado consulta / carga PDFs]
           ↓
     ¿Perfil liberado?
      /           \
    No             Sí
     ↓              ↓
[Editable]    [Solo lectura]
     ↓
[Médico/Admin libera]
     ↓
[Sistema crea usuario paciente + envía correo]
     ↓
[Paciente inicia sesión y consulta su historial]
```

---

Este PRD está listo para derivar **épicas**, **historias de usuario** y **tareas técnicas** en pasos posteriores.
