# Desglose HU MTL (historia -> tickets de trabajo)

Skill para descomponer una historia de usuario en tickets ejecutables (`TASK-HU-<id>-<nn>`) con orden y dependencias, usando formato canónico de `docs/backlog/HU-005-ticket-breakdown.md`.

## Cómo usar (pasos)

1. Abre el chat del Agent.
2. Inserta esta skill:
   - con `/` y seleccionando `hu-breakdown-mtl`, o
   - con `@` adjuntando `.cursor/skills/hu-breakdown-mtl/SKILL.md`.
3. Añade en el mensaje **solo** la HU objetivo (`HU-XXX`).

### Fuentes por defecto (automáticas)

- `readme.md`
- `docs/backlog/backlog.md`
- `docs/backlog/HU-XXX-*.md` (historia refinada de la HU objetivo, si existe)
- `docs/backlog/README.md` (convenciones de breakdown)

No hace falta indicarlas en cada invocación salvo que quieras usar una variante.

---

## Prompt operativo (usar tal cual)

Actúa como Product Owner técnico + Tech Lead full-stack y define el desglose de trabajo de la **[HU-XXX]** para MVP.

### Entradas obligatorias

- [HU objetivo: HU-XXX]

### Fuentes base (siempre)

- `readme.md`
- `docs/backlog/backlog.md`
- `docs/backlog/HU-XXX-*.md` (si existe)
- `docs/backlog/README.md`

### Objetivo

- Obtener una lista de tickets implementables de extremo a extremo.
- Cubrir todos los aspectos necesarios: frontend, backend, tests, documentación y ajustes de contrato/configuración cuando apliquen.
- Definir orden y dependencias razonables para un equipo pequeño (1 ingeniero/a full-stack).

### Reglas

- No inventes requisitos no respaldados por fuentes.
- Si faltan datos, explicítalo como hueco o supuesto mínimo.
- Mantén trazabilidad directa con la HU objetivo.
- Los tickets deben tener IDs estables: `TASK-HU-<id>-<nn>` (dos dígitos).
- No mezclar funcionalidades fuera del alcance de la HU; si detectas desbordamiento, proponlo como “fuera de corte”.
- La propuesta debe ser pragmática para MVP, evitando sobreingeniería.
- Si ya existe un `HU-XXX-ticket-breakdown.md`, actualizarlo de forma coherente en lugar de crear formatos alternativos.
- Incluir siempre en el breakdown una sección breve de **“Reglas aplicables por capa (referencia rápida)”** con enlaces a reglas frontend/backend/API/testing que correspondan a la HU.
- Incluir siempre una sección breve de **“Checks mínimos para cerrar tickets”** con comandos/validaciones básicas por capa.

### Regla de formato canónico (obligatoria)

La salida debe seguir **exactamente** la estructura y estilo de:
`docs/backlog/HU-005-ticket-breakdown.md`.

Esto implica incluir, como mínimo:

- Título `# HU-XXX — Desglose en tickets de trabajo (...)`
- Tabla inicial de metadatos (`Historia`, `Refinamiento`, `Épica`, `Título HU`)
- Convención de IDs de ticket
- Contexto de equipo
- Objetivo del desglose
- Sección `## Orden sugerido (dependencias)` con diagrama mermaid simple
- Sección `## Tickets` agrupada por bloques funcionales
- Tabla por bloque con columnas: `ID | Título | Descripción breve | Estado`
- Sección de “Qué puede quedar para después”
- Sección de “Dependencias externas a esta HU”
- Sección de “Cierre sugerido (definición de hecho del corte)”

No omitir secciones obligatorias; si una sección no aplica, indicar:
`Pendiente de definición en refinamiento`.

### Cobertura mínima esperada de tickets

Incluye explícitamente tickets para:

1. Backend (dominio, API, persistencia, seguridad/roles si aplica).
2. Frontend (rutas, vistas, integración API, estados UX mínimos).
3. Tests (unitarios/integración según impacto).
4. Documentación (OpenAPI/README/docs afectados).
5. Operativa técnica mínima (migraciones, eventos, config) cuando la HU lo requiera.

### Salida final obligatoria

Genera un único documento markdown y guárdalo en:
`docs/backlog/HU-<id>-ticket-breakdown.md`

Además:

- Actualiza el índice de `docs/backlog/README.md` si la HU aún no está listada.
- Mantén `docs/backlog/backlog.md` como fuente de HUs (sin insertar tickets ahí).

---

## Restricciones de repositorio (MTL)

- Separación de niveles obligatoria:
  - `docs/backlog/backlog.md`: definición de HUs.
  - `docs/backlog/HU-<id>-ticket-breakdown.md`: tickets de trabajo.
- No crear documentos alternativos para el desglose.
- Mantener idioma y tono profesional en español.
