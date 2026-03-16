# Plan de Trabajo MVP – Tickets Consolidados

Este documento lista el conjunto MINIMO de tickets necesarios para entregar el MVP descrito en el Product Roadmap y la arquitectura definida. Se prioriza reducir la cantidad de tickets manteniendo claridad, orden de ejecución y criterios de aceptación verificables.

Numeración: T01..T05 (mantener). Cada ticket incluye: Objetivo, Alcance IN/OUT, Dependencias, Entregables, Criterios de Aceptación (CA), Definición de Hecho (DoD), Riesgos/Mitigación y Métricas de Éxito.

---
## T01 – Pipeline CI/CD + Infraestructura Local y Staging
**Tipo:** DevOps / Fundacional  
**Objetivo:** Contar desde el inicio con un pipeline automatizado que asegure build, test, análisis estático, creación de imagen Docker, migraciones, despliegue a `staging` y promoción manual a `production`.  
**Motivación:** Habilitar entregas incrementales y validación temprana en entorno remoto (criterio #2 del requerimiento).  

### Alcance IN
- Workflow CI (GitHub Actions u otro) con stages: checkout, cache, build backend (Gradle), build frontend (Next.js), lint, tests, análisis estático (ej. Sonar o detekt/ktlint + eslint), build imagen multi-stage Docker.
- Publicación imagen en container registry (tag: `semver` + `commit-sha`).
- Infra local: `docker-compose.yml` (backend, postgres, mailhog, frontend, migraciones Flyway en startup).
- Despliegue automatizado a `staging` tras merge a `main` (aplica migraciones). Gate manual para `production`.
- Variables/secrets gestionadas de forma segura (no en repo). Ej: `DB_URL`, `GCAL_CLIENT_ID`, etc.
- README sección "Ejecutar local" básica (comandos). 
- Job programado (scheduler) habilitado solo en `staging/production` (flag env). 

### Alcance OUT
- Autoscaling / Terraform (futuro).  
- Observabilidad avanzada (solo logging básico).  

### Dependencias
Ninguna (primero en ejecutar).  

### Entregables
- `.github/workflows/ci.yml`
- `Dockerfile` multi-stage (backend + frontend static export si aplica) / o 2 imágenes si se decide separar.
- `docker-compose.yml`
- Documentación en README: comandos locales y explicación breve pipeline.

### Criterios de Aceptación (CA)
1. Commit a PR dispara pipeline y muestra resultado en <10 min en condiciones normales.
2. Merge a `main` publica imagen etiquetada y despliega a `staging` automáticamente.
3. Paso de migraciones falla el despliegue si hay error.
4. Manual approval promueve a `production`.
5. Ejecutar `docker compose up` levanta todos los servicios y backend arranca aplicando migraciones.
6. Logs muestran versión (commit SHA) al iniciar backend.

### DoD
- Todos los CA verificados.
- Sin secretos hardcodeados.
- Badge de estado CI agregado al README.

### Riesgos y Mitigación
| Riesgo | Mitigación |
|--------|------------|
| Tiempos largos de build | Cache dependencias Gradle y node_modules. |
| Divergencia config local vs staging | Usar `.env.example` + variables centralizadas. |
| Migraciones destructivas inadvertidas | Revisiones obligatorias en PR + estrategia "fail-fast" Flyway. |

### Métricas
- Éxito >=95% tasa de pipelines verdes tras primera semana.
- Tiempo medio pipeline < 10 min.

---
## T02 – Esquema de Base de Datos y Migraciones Iniciales
**Tipo:** Base de Datos  
**Objetivo:** Implementar el modelo relacional (tablas, constraints, índices y enums) alineado al documento de modelo de datos.  

### Alcance IN
- Migraciones Flyway: `V1__schema_inicial.sql` con tablas: `servicio`, `slot`, `reserva`, `usuario_admin`, `calendar_sync_log`.
- Índices y constraint parcial para reserva aprobada única por slot.
- Semillas mínimas opcionales (1 `usuario_admin` con password hash placeholder documentado) en `R__seed_basica.sql` (script repeatable).
- Validación de integridad: llaves foráneas, checks de duración y precio.
- Script utilitario (doc) para generar hash de password seguro.

### Alcance OUT
- Particionamiento / archivado (futuro).
- Tablas de auditoría adicionales.

### Dependencias
- T01 (pipeline listo para ejecutar migraciones).

### Entregables
- Carpeta `backend/src/main/resources/db/migration/` con migraciones.
- Documento breve `docs/db-notes.md` (opcional) con racional de índices.

### CA
1. Arranque backend aplica migraciones sin errores en local y staging.
2. Constraints impiden inserciones inválidas (tests negativos).
3. Índice parcial creado y visible al consultar catálogo `pg_indexes`.
4. Password seed no aparece en repositorio en texto plano (solo hash).

### DoD
- Tests de integración (al menos 1) verifican constraints clave.
- Revisión por par aprobada.

### Riesgos
| Riesgo | Mitigación |
|--------|------------|
| Error en índice parcial en otros entornos | Validar versión PostgreSQL y feature compatible. |
| Crecimiento rápido `calendar_sync_log` | Nota de retención agregada y plan futuro documentado. |

### Métricas
- 0 fallos de migración tras 5 despliegues.

---
## T03 – Backend Core Dominio + API Pública/Admin (Servicios, Slots, Reservas, Auth)
**Tipo:** Backend  
**Objetivo:** Implementar capas `domain`, `application`, `infrastructure` para CRUD servicios, creación slots, reservas (pendientes), consulta por `booking_code`, login admin y endpoints admin de listado/aprobación/rechazo.  

### Alcance IN
- Entidades dominio Kotlin puras + invariantes.
- Repositorios (interfaces) + impl JPA.
- Servicios de aplicación / casos de uso (`CreateServiceUseCase`, `CreateSlotUseCase`, `CreateBookingUseCase`, `ApproveBookingUseCase`, etc.).
- Controladores REST (público y admin) + DTOs + manejo de errores uniforme.
- Seguridad: Login admin (JWT corto) + guard para endpoints `/admin/**`.
- Generación segura de `booking_code` (base62, longitud 8–10) + rate limiting simple (in-memory) para endpoint consulta (si es trivial) o anotado TODO documentado.
- Tests: unit (dominio) + integración (repos + controllers básicos).
- OpenAPI actualizado (`openapi.yaml`).

### Alcance OUT
- Sincronización con Calendar (va en T04).
- Emails (T04).

### Dependencias
- T02.

### Entregables
- Código fuente backend organizado en las carpetas definidas.
- Tests con cobertura mínima >60% domain/application.
- Documentación breve de endpoints añadida a README sección API (si falta).

### CA
1. Crear servicio vía endpoint admin retorna 201 y persiste datos válidos.
2. Crear slot calcula `fin` correctamente y evita duplicados por constraint.
3. Crear reserva genera estado `PENDIENTE` y produce `booking_code` único.
4. Consultar `/v1/bookings/{code}` devuelve 404 si no existe, 200 si existe.
5. Aprobar reserva cambia estado a `APROBADA` y slot a `CERRADO`; rechazar marca `RECHAZADA` sin cambiar slot.
6. Endpoint catálogo lista solo servicios `activos` y slots futuros `ABIERTO`.
7. Login invalida credenciales incorrectas (401) y genera JWT válido (exp corta, e.g. 30m) con refresh por re-login simple (no refresh token flow MVP).
8. Linter/format sin errores.

### DoD
- Todos los CA cubiertos por tests automatizados (al menos 1 test por caso principal).
- Build verde en CI.
- Sin TODO críticos sin ticket de seguimiento registrado.

### Riesgos
| Riesgo | Mitigación |
|--------|------------|
| Fuga lógica de infraestructura en dominio | Code review enforce reglas de dependencia. |
| Race al aprobar reservas simultáneas | Transacción + constraint parcial garantizan unicidad. |

### Métricas
- P99 de creación de reserva < 300ms en staging (medido manualmente / logs temporales).

---
## T04 – Integraciones: Google Calendar, Scheduler Polling, Email Transaccional
**Tipo:** Backend Integraciones  
**Objetivo:** Completar ciclo de negocio evitando doble-booking y notificando al cliente.  

### Alcance IN
- Cliente Google Calendar (OAuth2 offline) + almacenamiento cifrado refresh token.
- Servicio comprobación conflictos al aprobar (antes de cerrar slot) + rollback si conflicto.
- Creación de evento en Calendar al aprobar reserva (resiliente: si falla log y marca `calendar_sync_failed`).
- Scheduler (cada 5–10 min) que trae eventos próximos X días y marca slots overlapeados como `BLOQUEADO_EXTERNAMENTE`.
- Email sender (adapter SMTP/Mailhog) para: (1) recepción reserva, (2) aprobación, (3) rechazo.
- `CalendarSyncLog` escritura en cada operación (OK / ERROR).
- Tests integración: mock Calendar + correo (verificar payload básico).

### Alcance OUT
- Eliminación automática de bloqueo al eliminar evento externo (nota futura).
- Reintentos sofisticados (solo intento único + log).  

### Dependencias
- T03.

### Entregables
- Código adapters calendar/email.
- Config segura (env vars) documentada.
- Ejemplos de logs (doc). 

### CA
1. Aprobar reserva crea evento calendar (simulado vía mock en test) y guarda `google_event_id`.
2. Si Calendar falla, reserva sigue APROBADA y `calendar_sync_failed=true` + log ERROR.
3. Polling marca slots future overlapeados como `BLOQUEADO_EXTERNAMENTE` sin alterar otros.
4. Emails se generan con campos: asunto, destinatario, resumen del servicio/slot.
5. Desactivar integración (sin token) no rompe aprobación (solo omite evento con log informativo).

### DoD
- Tests verdes.
- Documentación de variables requeridas y scopes OAuth.

### Riesgos
| Riesgo | Mitigación |
|--------|------------|
| Rate limit API Calendar | Limitar ventana y cache breve de resultados. |
| Emails marcados spam | Usar Mailhog local y advertir configuración DKIM/SPF futuro. |

### Métricas
- Ratio errores Calendar <5% en pruebas.

---
## T05 – Frontend (Público + Backoffice Admin)
**Tipo:** Frontend  
**Objetivo:** Implementar interfaz unificada en Next.js para experiencia pública y panel admin.  

### Alcance IN
- Páginas públicas: `/` (catálogo), `/servicio/[id]`, `/reserva/[booking_code]`.
- Formulario reserva (nombre, email) + POST a backend + página confirmación (muestra `booking_code`).
- Páginas admin protegidas: `/admin/login`, `/admin/servicios` (CRUD), `/admin/servicios/[id]/slots` (gestión de slots), `/admin/reservas` (pendientes con acciones aprobar/rechazar).
- Manejo de sesión (storage segura + expiración). Logout.
- Feedback UI estados: loading, éxito, error.
- Estilos coherentes (tailwind o CSS modules simple) + diseño responsive básico.
- Validaciones cliente mínimas + sanitización simple.
- Llamadas API centralizadas (client util). 

### Alcance OUT
- Personalización avanzada visual (logo simple permitido si ya disponible).
- Internacionalización (solo ES).  

### Dependencias
- T03 (API), T04 parcial (para reflejar estados post-aprobación aunque UI base puede ir antes). 

### Entregables
- Código Next.js.
- Scripts `dev/build` funcionando en CI.
- Documentación breve de estructura de componentes.

### CA
1. Catálogo muestra servicios activos (futuros slots >0 en detalle).
2. Reserva exitosa redirige a confirmación con código visible.
3. Página estado actualiza automáticamente (al recargar) el estado real.
4. Login inválido muestra error; válido redirige a dashboard.
5. Aprobar/Rechazar en UI refleja cambios sin recargar (optimistic o refetch).
6. Acceso directo a rutas admin sin sesión redirige a login.
7. Lighthouse performance >= 75 en páginas públicas (modo local build prod). 

### DoD
- Linter sin errores.
- Build producción pasa en CI.
- Errores capturados (boundary global). 

### Riesgos
| Riesgo | Mitigación |
|--------|------------|
| Fuga de token en logs | No loggear headers auth. |
| Estados inconsistentes tras acción | Refetch controlado post mutación. |

### Métricas
- Tasa errores consola <1% en pruebas manuales (sample).  

---
## Dependencias Resumidas
T01 → (T02, T03) → T04 → T05 (aunque T05 puede paralelizar parcialmente tras T03).

## Roadmap de Ejecución (Orden)
1. T01
2. T02 y T03 en paralelo limitada (T02 debe finalizar antes del merge de T03).
3. T04
4. T05 (iteraciones visuales continuas)

## Notas Generales
- Cada ticket genera una PR independiente, pequeña y revisada.
- Errores o limitaciones diferidas deben abrir "Chore" o "Tech Debt" issues para no ocultar riesgos.
- Métricas iniciales recolectadas manualmente (logs / tiempos). Instrumentación formal futura.
