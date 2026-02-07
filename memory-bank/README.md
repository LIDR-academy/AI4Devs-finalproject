# Memory Bank - Adresles

> **Contexto persistente del proyecto para sesiones de IA**  
> **Última actualización**: 2026-02-07

## 📖 Inicio Rápido

**¿Primera vez aquí?** Lee en orden:

1. **[Project Overview](./project-context/overview.md)** - Qué es Adresles (síntesis ejecutiva)
2. **[Tech Stack](./project-context/tech-stack.md)** - Tecnologías y versiones
3. **[Domain Glossary](./project-context/domain-glossary.md)** - Vocabulario del dominio

## 🏗️ Decisiones Arquitecturales (ADRs)

Decisiones clave que guían el desarrollo del proyecto:

| ID | Título | Estado | Fecha |
|----|--------|--------|-------|
| [001](./architecture/001-monolith-modular.md) | Monolito Modular vs Microservicios | ✅ Aceptada | 2026-01-30 |
| [002](./architecture/002-supabase-dynamodb.md) | Arquitectura DB Híbrida (Supabase + DynamoDB) | ✅ Aceptada | 2026-01-30 |
| [003](./architecture/003-nestjs-backend.md) | NestJS como Framework Backend | ✅ Aceptada | 2026-01-30 |
| [004](./architecture/004-openai-gpt4.md) | OpenAI GPT-4 para Conversaciones | ✅ Aceptada | 2026-01-30 |

## 🎨 Patrones y Convenciones

_Pendiente de documentar durante la fase de implementación_

Aquí se documentarán:
- Límites de agregados DDD
- Estrategia de manejo de errores
- Convenciones de API REST
- Estrategia de testing

## 📚 Referencias Externas

### Documentación Principal

- **[Adresles_Business.md](../Adresles_Business.md)** (2130 líneas)  
  Documento completo de diseño del sistema (Fases 1-4)

- **[Backend Standards](../openspec/specs/backend-standards.mdc)** (1230 líneas)  
  Estándares técnicos, DDD, SOLID, testing

- **[Data Model](../openspec/specs/data-model.md)**  
  Modelo de datos detallado

### Índices de Navegación

- **[Business Doc Map](./references/business-doc-map.md)**  
  Mapa navegable del documento de negocio por temas

### Archivos de Changes

- **[openspec/changes/archive/](../openspec/changes/archive/)**  
  Historial de cambios completados e implementados

## 📝 Sesiones Pasadas

_Se documentarán aprendizajes relevantes de sesiones futuras_

## 🔄 Flujo de Trabajo

### Durante una Sesión de Desarrollo

1. **Contexto inicial**: Lee `README.md` y `project-context/overview.md`
2. **Consulta decisiones**: Revisa ADRs relacionados con tu tarea
3. **Trabaja con OpenSpec**: Usa `/opsx:new` o `/opsx:continue` para cambios
4. **Aplica patrones**: Sigue convenciones documentadas en `patterns/`

### Después de una Sesión (Post-trabajo manual, 2-5 min)

**Solo si aplica**:
- ✅ Nueva decisión arquitectural → Crea ADR en `architecture/`
- ✅ Patrón emergente importante → Documenta en `patterns/`
- ✅ Aprendizaje significativo → Registra en `sessions/`

## 📊 Estructura de Carpetas

```
memory-bank/
├── README.md                   # Este archivo (índice maestro)
│
├── project-context/            # Contexto general del proyecto
│   ├── overview.md            # Síntesis ejecutiva de Adresles
│   ├── tech-stack.md          # Stack tecnológico
│   └── domain-glossary.md     # Glosario del dominio
│
├── architecture/               # Decisiones arquitecturales (ADRs)
│   ├── _template.md           # Plantilla para nuevos ADRs
│   ├── 001-monolith-modular.md
│   ├── 002-supabase-dynamodb.md
│   ├── 003-nestjs-backend.md
│   └── 004-openai-gpt4.md
│
├── patterns/                   # Patrones y convenciones
│   └── (pendiente durante implementación)
│
├── sessions/                   # Aprendizajes de sesiones pasadas
│   └── (se documenta conforme avanza el proyecto)
│
└── references/                 # Índices y mapas de navegación
    └── business-doc-map.md    # Navegación temática del Business.md
```

## 🎯 Propósito del Memory-Bank

Este memory-bank permite a la IA:

✅ **Mantener contexto entre sesiones cortas** sin re-explicar el proyecto  
✅ **Acceder rápidamente a decisiones clave** (ADRs de ~100 líneas vs doc de 2130)  
✅ **Entender el "por qué"** detrás de las decisiones técnicas  
✅ **Seguir patrones establecidos** consistentemente  
✅ **Referenciar documentación detallada** cuando sea necesario

## 📖 Documentación Complementaria

### Para Desarrollo con OpenSpec

- Workflow SDD: Ver skills en `.cursor/skills/openspec-*`
- Comandos disponibles: `/opsx:new`, `/opsx:continue`, `/opsx:apply`, `/opsx:archive`

### Para Estándares Técnicos

- Backend: `openspec/specs/backend-standards.mdc`
- Frontend: `openspec/specs/frontend-standards.mdc`
- Base: `openspec/specs/base-standards.mdc`

---

**Última revisión**: 2026-02-07  
**Mantenido por**: Sergio (desarrollo individual)  
**Evoluciona con**: Cada decisión arquitectural o patrón significativo
