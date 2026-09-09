---
name: SK-16_develop_backend_ticket
description: "Guía el desarrollo atómico de un ticket backend respetando la Arquitectura Hexagonal en Vertical Slices, TDD, sanitización activa de DTOs, precisión matemática de punto fijo, Eager Loading (Anti-N+1), CRUDs de entidades secundarias/pivotes, transacciones de BD, alineación de contrato y mutation score >= 70%."
version: "3.11.0"
category: "development/02_backend_development"
inputs:
  - ticket_id: "ID o ruta del ticket técnico (ej. TK-001 o docs/05_agile_planning/tickets/TK-001.md)"
required_rules:
  - "docs/04_governance_and_quality/rules/domain_rules.md"
  - "docs/04_governance_and_quality/rules/backend_rules.md"
  - "docs/04_governance_and_quality/rules/database_rules.md"
  - "docs/04_governance_and_quality/rules/security_rules.md"
  - "docs/04_governance_and_quality/rules/testing_rules.md"
outputs:
  - "Código backend implementado y verificado (Dominio, Aplicación e Infraestructura)"
  - "Contrato de API de proyecto actualizado y validado según directivas de backend_rules.md"
  - "Suite TDD en verde con Mutation Score >= 70%"
  - "Auditorías Anti-N+1, Anti-Mass-Assignment y Transacciones de BD aprobadas"
  - "Gate ticket-scoped de complejidad/longitud/profundidad y gate de duplicación (jscpd) en verde"
---

# ⚙️ SK-16: Desarrollador de Tickets Backend (v3.11.0)

Actúa como un **Senior Backend Software Engineer** y **Clean Architecture Advocate**. Tu objetivo es implementar de forma atómica el ticket backend especificado en `ticket_id` respetando la Arquitectura Hexagonal en Vertical Slices, TDD estricto y las guardias universales de calidad.

Sigue strictly este flujo de trabajo secuencial:

---

## 🔍 FASE 1: Descubrimiento de Especificaciones y Contratos
1. **Leer Especificaciones:** Lee el ticket en `docs/05_agile_planning/tickets/{ticket_id}`, el esquema de datos y el contrato de API en `docs/03_persistence_and_api/` (o las rutas declaradas en `AGENTS.md`).
   - **Fail-Fast Obligatorio (Guard 26, `AGENTS.md`):** si `{ticket_id}` no existe como archivo — porque te pidieron implementar una funcionalidad nueva sin ticket previo — DETENTE. No implementes primero y documentes después: informa al humano que falta la Etapa 1 (`01_cascading_spec_workflow.md`: `SK-02`/`SK-11`/`SK-12`/`SK-13`/`SK-14`) y espera a que exista el `TK-XXX.md` antes de continuar con este skill.
2. **Consultar Comandos Oficiales:** Lee `AGENTS.md` para extraer los comandos declarados para testing, build, lint, linter de contrato de API y gestión de base de datos.
3. **Descubrir Reglas del Proyecto:** Lee las directivas declaradas en `required_rules` en `docs/04_governance_and_quality/rules/`.

---

## 🧪 FASE 2: Desarrollo Dirigido por Pruebas (TDD - Bucle Red-Green-Refactor)
1. **FASE RED:** Escribir las pruebas unitarias/integración en el runner del proyecto mapeando las cláusulas BDD Gherkin (`// Given`, `// When`, `// Then`) utilizando repositorios en memoria (`InMemoryRepository`). Confirmar que los tests **FALLAN**.
2. **FASE GREEN:** Escribir la implementación mínima necesaria en Dominio, Aplicación e Infraestructura para poner las pruebas en **VERDE**.
3. **Interruptor de Inferencia (Circuit Breaker):** Si los tests permanecen en RED tras 3 intentos consecutivos de auto-reparación, detener la ejecución, preservar el diff y solicitar intervención humana.
4. **FASE REFACTOR:** Refactorizar el código manteniendo la suite en verde y eliminando duplicación o código muerto. Si un método/función supera ~60 líneas o una complejidad ciclomática aproximada de 10 (demasiados `if`/`else`/`switch`/bucles anidados), extrae colaboradores (funciones privadas, Value Objects, clases de política) antes de continuar — son los mismos umbrales que exige el linter (`complexity`, `max-lines-per-function`) y autocorregir aquí evita descubrirlo recién en FASE 5.
5. **Auditoría de Reuso Previa (obligatoria antes de escribir código nuevo):** Antes de crear un Value Object, caso de uso, repositorio o adaptador nuevo, revisa si ya existe un colaborador equivalente en `domain/`/`application/`/`infrastructure/` (ej. aritmética decimal, validación de rango, boilerplate de repositorio `InMemory`). Si el mismo concepto ya se repite en 2+ casos de uso sin haber sido extraído, extráelo como parte de este ticket en vez de añadir una tercera copia.

---

## 🛠️ FASE 3: Implementación Hexagonal en Vertical Slice & CRUDs de Entidades Secundarias

### A. Para Entidades de Dominio Principales:
1. **Capa de Dominio:** Value Objects con validaciones puras y precisión matemática de punto fijo, Entidades e Interfaces de Puertos (0 dependencias de frameworks web u ORMs).
2. **Capa de Aplicación:** Casos de uso (Use Cases / Services) que orquestan los puertos.
3. **Capa de Infraestructura:** Adaptadores de repositorios u ORM, Controladores HTTP y Mapeadores de entidad-a-BD.

### B. Para Entidades Secundarias y Taxonomías (Categories, Tags, Lookups, Pivotes N:M):
Generar atómicamente los 5 componentes requeridos:
1. **Validator / DTO Sanitizado:** Definir esquemas de validación estrictos para asegurar la integridad de datos entrantes y prevenir **Mass-Assignment**.
2. **Model / Entidad con Relaciones:** Configurar relaciones relacionales/ORM (`belongsTo`, `manyToMany` con tablas pivote).
3. **Controlador RESTful:** Métodos HTTP estándar (`index`, `store`, `show`, `update`, `destroy`) con manejo de respuestas RFC 7807 en errores.
4. **Manejo Transaccional Atómico:** Encapsular operaciones de escritura relacionales o en tabla pivote dentro de una **Transacción de BD** garantizada por la capa de datos.
5. **Registro de Rutas:** Registrar las rutas RESTful estandarizadas en el enrutador del backend.

### C. Alineación del Contrato de API del Proyecto (Delegación SSoT):
Si el ticket requiere añadir un nuevo endpoint o alterar campos de un DTO:
1. **Sincronización del Contrato:** Sincronizar el archivo de contrato de la API del proyecto siguiendo estrictamente las directivas de formato declaradas en `docs/04_governance_and_quality/rules/backend_rules.md`.
2. **Validación de Sintaxis del Contrato:** Ejecutar el comando de linter de contratos oficial indicado en `AGENTS.md`.

---

## 🔄 FASE 4: Auditoría de Calidad, Anti-N+1 y Seguridad (Self-Checklist Obligatorio)

Antes de dar por completado el ticket, debes validar y verificar los siguientes criterios:
- [ ] ¿Los campos numéricos/saldos usan tipo Decimal de punto fijo sin desbordamiento flotante?
- [ ] ¿Los endpoints sanitizan activamente los datos de entrada vía DTOs/Validators previniendo **Mass-Assignment**?
- [ ] ¿Las consultas de la capa de persistencia aplican **Eager Loading** explícito (evitando el problema N+1)?
- [ ] ¿Las escrituras en múltiples tablas o pivotes están protegidas dentro de una **Transacción de BD**?
- [ ] ¿El contrato de API del proyecto está sincronizado según `backend_rules.md` y pasa su linter sin errores?
- [ ] ¿No se usaron tipos inseguros (`any` / casting sin parsear) en ninguna capa?
- [ ] ¿Las fechas usan huso horario UTC (ISO 8601 `YYYY-MM-DDTHH:mm:ssZ`)?
- [ ] **(TK-066) Si este ticket agrega código que hace peticiones HTTP salientes cuyo host/URL deriva de input de usuario** (webhook, proxy, callback URL, integración externa configurable): ¿aplica allowlist explícita de hosts y bloquea rangos privados/link-local/metadata sin seguir redirects hacia ellos? Ver `docs/04_governance_and_quality/08_security_strategy.md` Bloque 3 (mitigación SSRF). N/A si el ticket no introduce peticiones salientes.

---

## 🚨 FASE 5: Verificación Final, Mutation Testing y Quality Gate
1. **Ejecutar Pruebas TDD:** Corre la suite de pruebas mediante el comando de test runner declarado en `AGENTS.md`.
2. **Validar Contrato de API:** Ejecutar el comando de validación de contrato de API indicado en `AGENTS.md`.
3. **Pruebas de Mutación (Mutation Score $\ge 70\%$):** Ejecutar la suite de mutación sobre los módulos creados para garantizar que el Mutation Score sea $\ge 70\%$.
4. **Compilación & Types:** Ejecuta el comando de build oficial de `AGENTS.md` para asegurar 0 errores de compilación.
5. **Análisis Estático (Ticket-Scoped, obligatorio):** Ejecuta `bash docs/04_governance_and_quality/scripts/check_ticket_code_quality.sh` — verifica, con `--max-warnings 0`, que los archivos sin commitear de este ticket no violen `complexity`/`max-lines-per-function`/`max-depth`. Deuda preexistente en archivos que este ticket no tocó no bloquea el cierre (ver `docs/00_stack_manifest.md`), pero cualquier violación en un archivo que este ticket creó o modificó sí lo hace. Además, ejecuta el linter oficial de `AGENTS.md` sobre todo el proyecto para confirmar **0 errores** (los warnings preexistentes fuera del diff de este ticket no bloquean).
6. **Duplicación (jscpd):** Ejecuta `pnpm run duplication` — gate bloqueante, umbral declarado en `docs/00_stack_manifest.md`.
7. **Implementación Verificada, no solo leída (obligatorio):** antes de reportar el ticket como terminado, autoaplica los 3 checks de [`.agents/rules/04_verified_implementation_standard.md`](../../../rules/04_verified_implementation_standard.md): (a) toda variable de entorno nueva que valides tiene al menos un call-site real que la consume; (b) todo Dockerfile/script de seed/migración que toques lo ejecutaste de verdad contra un entorno representativo, no solo lo leíste; (c) si el módulo tiene un spec `status: approved` asociado, confirmaste alineación o reportaste la divergencia al humano en vez de asumir en silencio.
8. **Reporte al Humano:** Presentar los artefactos creados/modificados y los resultados del pase de calidad estructurados estrictamente según la plantilla universal en `.agents/rules/00_output_reporting_standard.md`.
