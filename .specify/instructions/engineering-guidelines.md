
# Engineering Guidelines – Naming, SOLID, Patrones

> **Ámbito**: Reglas de ingeniería estables para backend Java en arquitectura hexagonal. Estas normas complementan el `delivery-playbook-backend.md` y se aplican en `spec.md`, `plan.md` y `tasks.md` generados por Spec‑Kit.

---
## 1. Principios SOLID (aplicados al dominio y aplicación)
- **S**ingle Responsibility: cada clase tiene un motivo de cambio.
- **O**pen/Closed: abierto a extensión, cerrado a modificación (usa interfaces, composición, políticas).
- **L**iskov Substitution: puertos/implementaciones cumplen contratos sin sorpresas.
- **I**nterface Segregation: puertos pequeños y específicos (evitar God‑interfaces).
- **D**ependency Inversion: dominio depende de **abstracciones** (puertos), nunca de infraestructura.

**Reglas**
- Dominio: **sin** frameworks, anotaciones de Spring, ni dependencias técnicas.
- Casos de uso: orquestan **puertos** y entidades; cero lógica de persistencia o red.
- Adaptadores: contienen detalles concretos; **no** reglas de negocio.

---
## 2. Convenciones de naming (Java)
### 2.1. Paquetes y módulos
- `com.poc.hexagonal.<boundedContext>.<layer>`
  - `application`, `domain`, `infrastructure`, `shared`
  - Subpaquetes dentro de cada capa según el árbol acordado.
- Los **bounded contexts** (ej. `prescription`) agrupan verticalmente dominio+aplicación+infra.

### 2.2. Clases y tipos
- **Entidades**: `Prescription`, `MeditationSession`
- **Value Objects**: `PrescriptionId`, `MeditationText`
- **Servicios de dominio**: `<Nombre>DomainService` (si aporta reglas; evitar si es trivial)
- **Puertos**:
  - **in** (driven by outside, expuestos al exterior del dominio): `<UseCase>` o `<Capability>UseCase`
  - **out** (necesidades del dominio): `<Recurso>Port`, p.ej. `TextGenerationPort`
- **Casos de uso (aplicación)**: `<Accion><Recurso>UseCase`, p.ej. `ComposeMeditationUseCase`
  - **Implementación (si aplica)**: `<Accion><Recurso>Service` en `application.service`
- **DTOs (entrada/salida de controller)**: `<Recurso><Action>Request`, `<Recurso><Action>Response`
- **Mappers**: `<Origen>To<Destino>Mapper`
- **Controllers**: `<Recurso>Controller`
- **Adaptadores de infraestructura**:
  - **in**: `rest` / `kafka` → `<Recurso><Canal>Adapter` (p.ej. `PrescriptionRestAdapter`)
  - **out**: `mongodb` / `kafka` / `service` → `<Recurso><Tecnologia>Adapter`
- **Repositorios (infra)**: `<Aggregate>Repository`
- **Excepciones**: `<Causa>Exception` en `shared/errorhandler/exception`

### 2.3. Métodos y comandos
- Use cases: verbos imperativos y significado de negocio: `compose`, `previewMusic`, `previewImage`.
- Puertos **out**: capacidades, no tecnología: `generateText`, `storeAsset`, `publishEvent`.

### 2.4. Constantes y enums
- Enums en `domain/enums` o `shared/.../enums`. Nombres en singular: `MeditationType`.

---
## 3. Patrones recomendados
- **Arquitectura hexagonal** (puertos/adaptadores) con **DDD táctico** (Entidades, VOs, Agregados).
- **Aplicación** como capa de orquestación (comandos/queries, transacciones si aplica).
- **Mappers** para aislar DTOs de dominio.
- **Factory** para crear agregados con invariantes.
- **Policy**/Strategy para reglas variables (ej. selección de generador IA).
- **Decorator** para cross‑cutting en adaptadores (caching, observabilidad).
- **Circuit Breaker/Retry** (infra) para llamadas externas.

---
## 4. Testing
- **Dominio (unit)**: 1‑test‑por‑regla; sin mocks técnicos.
- **Aplicación (unit)**: mocks de puertos para orquestación.
- **Infra (integration)**: Testcontainers para persistencia/colas.
- **Contrato**: provider/consumer desde OpenAPI/mesasaje.
- **BDD/e2e**: ejecutar feature files reales.

---
## 5. Estilo de código
- Java 21. Formateo con perfil común.
- Evitar `static` stateful; favorecer inyección por constructor.
- Métodos pequeños; un nivel de abstracción por función.
- Null‑safety (Optional cuando aplique), validaciones en dominio.

---
## 6. Observabilidad y errores
- Logs estructurados (correlación, requestId).
- Métricas: latencia, errores, throughput por endpoint/caso de uso.
- Trazas: span por llamada externa.
- Errores: mapear checked/unchecked a `shared/errorhandler` con códigos consistentes.

---
## 7. Directrices para agentes (Spec‑Kit)
- Respetar **naming** aquí definido al generar `plan.md` y `tasks.md`.
- No introducir clases o paquetes fuera de la jerarquía aprobada.
- Validar que cada tarea mapea a una capacidad (puerto) o a un caso de uso concreto.
