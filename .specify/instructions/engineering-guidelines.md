
# 🛠️ Engineering Guidelines — Meditation Builder
**Versión:** 2.0.0 (Unificado Backend + Frontend)

---

## 0. Propósito
Normas de ingeniería **estables** para mantener coherencia de diseño, naming, estilo y patrones en **backend** (Java 21 + Spring Boot) y **frontend** (React + TS).

---

## 1. SOLID y principios transversales
- **SRP**: una clase/archivo = un motivo de cambio.
- **OCP**: extensible por composición/estrategia; evita modificar invariantes.
- **LSP**: implementaciones cumplen contratos (puertos) sin sorpresas.
- **ISP**: interfaces pequeñas y específicas (evitar God‑interfaces).
- **DIP**: dominio depende de **abstracciones** (puertos), no de infra.
- **YAGNI / KISS**: no anticipar.
- **Clean Code**: funciones pequeñas, nombres semánticos, side‑effects controlados.

---

## 2. Naming (Backend Java)
- Paquetes: `com.hexagonal.<boundedContext>.<layer>`.
- Entidades: `MeditationSession`, VOs: `MeditationText`.
- Puertos **out**: `<Recurso>Port` (p.ej., `TextGenerationPort`).
- Use cases: `<Accion><Recurso>UseCase` (p.ej., `GenerateMeditationTextUseCase`).
- Adaptadores IA (out): `<Recurso>AiAdapter`.
- Controllers: `<Recurso>Controller` (p.ej., `MeditationBuilderController`).
- DTOs entrada/salida: `<Recurso><Accion>{Request|Response}`.
- Mappers: `<Origen>To<Destino>Mapper`.

---

## 3. Naming (Frontend TS/React)
- Componentes: `PascalCase`.
- Hooks: `useCamelCase`.
- Stores Zustand: `use<Nombre>Store`.
- Tests: `*.spec.ts(x)` y `*.e2e.ts`.
- API wrappers: `src/api/client.ts` o `src/api/adapters.ts`.

---

## 4. Estilo de código
### Backend
- Java 21; inyección por constructor; evitar `static` con estado.
- Dominio **sin** Spring ni tipos de infraestructura.
- Métodos pequeños; una abstracción por función.
- Null‑safety: `Optional` donde aplique; validaciones en dominio.
- **Ver `java21-best-practices.md`** para patrones obligatorios:
  - Records para Value Objects y Entities
  - UUID para identificadores (no String)
  - Clock injection para timestamps (no Instant.now())
  - API inmutable con métodos `withX()`
  - Optional accessors para campos nullable

### Frontend
- React 18 + TS estricto (`strict: true`).
- Componentes puros; usar `useMemo/useCallback` con mesura.
- `eslint` + `prettier` comunes.
- Evitar `any`; tipos derivados del cliente OpenAPI.

---

## 5. Patrones recomendados
- **Hexagonal (Ports & Adapters)**.
- **DDD táctico**: Entidades, VOs, Agregados, Políticas.
- **Factory** para creación con invariantes.
- **Strategy/Policy** para reglas variables (selección de proveedor IA).
- **Mapper** para aislar DTOs de dominio y persistencia.
- **Decorator** para cross‑cutting (caching/metrics) en adaptadores.

---

## 6. Observabilidad y errores
- Logs estructurados con correlación (`requestId`).
- Métricas clave por endpoint y caso de uso: latencia, errores, throughput.
- Trazas distribuidas (OpenTelemetry).
- Taxonomía IA → HTTP: `AiTimeout/AiUnavailable → 503`, `AiRateLimited → 429`.
- **No** loguear prompts ni respuestas IA.

---

## 7. Seguridad
- Autenticación/autorización coherente por contexto.
- Secretos fuera del código (env/Secret Manager).
- Validaciones superficiales en controllers; invariantes en dominio.

---

## 8. Reglas de dependencia
- `domain` no depende de nadie.
- `application` depende de `domain` y **de interfaces** de `domain`.
- `infrastructure` depende de `application` y **de puertos** de `domain`.
- `shared` es transversal pero **estable**.

---

## 9. Revisión de PR y calidad
- Lint + tests locales antes del PR.
- CI obliga gates; ningún fallo permite merge.
- Evitar PR gigantes; preferir historias y tareas pequeñas.

---

## 10. Anti‑patrones
- Lógica de negocio en controllers/adapters.
- Entidades anémicas sin invariantes.
- Añadir endpoints/DTOs no respaldados por BDD.
- Tests que dependen de servicios cloud reales.
- Mezclar capas en la misma tarea.

**Mantra final**: el diseño hoy debe facilitar el cambio de mañana.
