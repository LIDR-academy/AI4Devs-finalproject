## Índice

0. [Ficha del proyecto](#0-ficha-del-proyecto)
1. [Descripción general del producto](#1-descripción-general-del-producto)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Modelo de datos](#3-modelo-de-datos)
4. [Especificación de la API](#4-especificación-de-la-api)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Tickets de trabajo](#6-tickets-de-trabajo)
7. [Pull requests](#7-pull-requests)

---

## 0. Ficha del proyecto

### **0.1. Tu nombre completo:**

Daniel Miguel

### **0.2. Nombre del proyecto:**

Realista

### **0.3. Descripción breve del proyecto:**

Asistente educativo con IA para compradores primerizos de vivienda en España. Analiza anuncios inmobiliarios con LLM para destapar lenguaje manipulador y omisiones, cruza datos con el Catastro, calcula los gastos ocultos de compra (que ningún banco te explica), y simula estrategias de amortización vs inversión basadas en tu perfil personal. PWA mobile-first, sin consejo financiero — solo transparencia.

### **0.4. URL del proyecto:**

> TBD — Pendiente de despliegue

### 0.5. URL o archivo comprimido del repositorio

`https://github.com/dmiguelm/AI4Devs-finalproject-DMM` (rama `feature-entrega1-DMM` para Entrega 1, `finalproject-DMM` para Entrega final)

---

## 1. Descripción general del producto

### **1.1. Objetivo:**

Acompañar al comprador primerizo de vivienda en España con tres herramientas que cubren sus principales puntos ciegos:

1. **Listing Lens** — Analiza anuncios inmobiliarios con IA (OpenRouter) para detectar lo que el anuncio no te cuenta: lenguaje ambiguo, metros inflados, ubicación imprecisa, ausencia de certificado energético. Cruza la ubicación estimada con el Catastro para verificar los datos declarados.

2. **Mortgage Compass** — Calcula los gastos ocultos de compra (ITP/IVA, notaría, registro, gestoría, tasación) — ese 10-12% adicional que nadie te explica. Construye un perfil financiero personal y muestra estrategias de amortización voluntaria (sin amortizar, ligera, moderada, agresiva) comparadas con una alternativa de inversión a largo plazo. Todo con narrativa educativa, nunca prescriptiva.

3. **Dashboard** — Panel de seguimiento con historial de anuncios analizados, instantánea financiera y acceso rápido a todas las herramientas. Detección de cambios al re-analizar un anuncio (diff de snapshots).

**Público objetivo:** Compradores primerizos de vivienda en España que quieren entender lo que compran y lo que pagan, sin depender exclusivamente de lo que les cuentan inmobiliarias y bancos.

### **1.2. Características y funcionalidades principales:**

| Funcionalidad | Descripción | Prioridad |
|---------------|-------------|-----------|
| Listing Lens | Pegar URL de anuncio → análisis LLM + cruce catastral → puntuación + banderas rojas + **razonamiento por cada flag** (AI Reasoning Transparency) | 🥇 Must-Have |
| Mortgage Compass | Perfil financiero → gastos ocultos → simulador de amortización vs inversión → narrativa educativa + **gráfico visual** comparativo | 🥇 Must-Have |
| Dashboard | Historial de análisis, perfil financiero, **vista agregada en 1 llamada**, **diff de re-análisis**, acceso a herramientas | 🥇 Must-Have |
| **Negotiation Assistant** | Tras el análisis, genera **5-8 preguntas concretas** para hacer al inmobiliario, basadas en las red flags detectadas | 🔶 Should-Have |
| Cronograma interactivo | Línea temporal 60-90 días del proceso de compra (arras → escritura), filtrada por `currentStage` | 🔶 Should-Have |
| Checklist documental | Documentos por etapa, progreso, **sugerencia de avance de etapa** al completar | 🔶 Should-Have |

### **1.3. Diseño y experiencia de usuario:**

> Pendiente de implementación. Se incluirán capturas cuando el frontend esté desarrollado.

Principios UX: mobile-first (375px+), PWA instalable, navegación por pestañas, sin wizard forzado — cada herramienta accesible independientemente.

### **1.4. Instrucciones de instalación:**

> **Estado actual (Entrega 1 — documentación):** no hay código implementado todavía. La Entrega 1 es solo documentación técnica.
>
> Las instrucciones de setup (`npm install`, `npx prisma migrate dev`, `npm run dev`) se publicarán en la Entrega 2 (10 julio) cuando exista código ejecutable. El **stack planificado** está documentado en:
>
> - `specs/001-realista-mvp/plan.md` → contexto técnico y arquitectura
> - `specs/001-realista-mvp/tasks.md` → 139 tareas con criterios de aceptación
> - `specs/001-realista-mvp/quickstart.md` → guía de setup para cuando exista código
>
> Resumen del stack: SvelteKit (PWA) + Node.js/Express + TypeScript + PostgreSQL + Prisma + OpenRouter (LLM) + Nominatim (geocoding) + API Catastro + Vitest + Playwright.

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

```
┌─────────────────────────────────────────────────────────────┐
│                     DOMINIO (sin dependencias)               │
│                                                              │
│  Agregados: User, PurchaseProcess, AnalyzedListing,         │
│             Checklist                                        │
│                                                              │
│  Puertos: ListingAnalyzerPort, MortgageCalculatorPort,      │
│           CatastroPort, NotificationPort                     │
│                                                              │
│  Value Objects: TransparencyScore, FinancialProfile,        │
│                 RedFlags, BureaucraticMilestone              │
└─────────────────────────────────────────────────────────────┘
                             │
┌────────────────────────────┼────────────────────────────────┐
│                 INFRAESTRUCTURA (adaptadores)                │
│                                                              │
│  OpenRouterAdapter  → LLM gateway (detección de manipulación)│
│  AvenaScoreAdapter  → @avena/score (fallback numérico)      │
│  CheerioAdapter     → HTML parsing server-side               │
│  CatastroAdapter    → API Sede Electrónica del Catastro      │
│  MiraTuZonaAdapter  → Enlace contextual por barrio           │
└─────────────────────────────────────────────────────────────┘

┌──────────┐     ┌──────────────────┐     ┌──────────────────┐
│  Usuario  │────▶│  Realista PWA     │────▶│  Backend API      │
│  (móvil)  │     │  (SvelteKit+PWA)  │     │  (Node.js/Express)│
└──────────┘     └──────────────────┘     └────────┬─────────┘
                                                    │
                    ┌───────────────────────────────┼──────────┐
                    │                               │          │
              ┌─────▼─────┐  ┌──────────▼──────┐  ┌─▼────────┐
              │ PostgreSQL │  │ OpenRouter (LLM) │  │ Catastro  │
              │ (datos)    │  │ @avena/score     │  │ (oficial)  │
              └───────────┘  └─────────────────┘  └──────────┘
```

**Patrón:** Arquitectura Hexagonal (Puertos y Adaptadores) + DDD táctico.

**Justificación:** El dominio contiene cero dependencias de frameworks. Express, Prisma, SvelteKit viven en la capa de infraestructura. Esto permite testear la lógica de negocio de forma aislada, cambiar la base de datos o el framework frontend sin tocar el dominio, y mantener una separación clara entre lo que hace el sistema y cómo lo hace.

**Beneficios:** Testabilidad, mantenibilidad, independencia de frameworks, alineación con DDD para el vocabulario del dominio inmobiliario español.

**Sacrificios:** Más boilerplate inicial. Para un MVP con 3 features, la estructura hexagonal añade directorios pero garantiza que el proyecto escale sin reescrituras.

### **2.2. Descripción de componentes principales:**

| Componente | Tecnología | Función |
|------------|-----------|---------|
| Frontend | SvelteKit + Vite + @vite-pwa/sveltekit | SPA mobile-first instalable. Server-side loaders proxy al backend |
| Backend | Node.js + Express + TypeScript | API REST con arquitectura hexagonal. Dominio sin dependencias |
| Base de datos | PostgreSQL + Prisma ORM | Persistencia relacional. Migraciones gestionadas por Prisma |
| Análisis IA | OpenRouter (LLM gateway) | System prompt estructurado para detectar banderas rojas en anuncios |
| Fallback scoring | @avena/score (MIT) | Motor de scoring numérico cuando el LLM no está disponible |
| HTML parsing | Cheerio | Extracción server-side del texto del anuncio. Fallback a subdominio `.m.` |
| Catastro | API Sede Electrónica del Catastro | Cruce de m² declarados vs oficiales, año de construcción |
| Testing | Vitest + Playwright | Unitarios + integración + E2E del flujo principal |

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

```
backend/
├── src/
│   ├── domain/           # Lógica de dominio pura (sin dependencias externas)
│   │   ├── aggregates/   # User, PurchaseProcess, AnalyzedListing, Checklist
│   │   ├── value-objects/# TransparencyScore, FinancialProfile, RedFlags...
│   │   ├── ports/        # Interfaces (ListingAnalyzerPort, CatastroPort...)
│   │   └── services/     # Casos de uso (AnalyzeListingUseCase...)
│   ├── adapters/         # Implementaciones de puertos
│   │   ├── openrouter/   # OpenRouterAdapter (análisis LLM)
│   │   ├── avena-score/  # AvenaScoreAdapter (fallback)
│   │   ├── cheerio/      # CheerioAdapter (parseo HTML)
│   │   ├── catastro/     # CatastroAdapter (API catastral)
│   │   └── miratuzona/   # MiraTuZonaAdapter (enlace contextual)
│   ├── api/              # Express routes, controllers, middleware
│   ├── infrastructure/   # Prisma schema, config, constants
│   └── index.ts
└── tests/                # Unitarios + integración

frontend/
├── src/
│   ├── routes/           # SvelteKit file-based routing
│   │   ├── +page.svelte  # Dashboard
│   │   ├── listing-lens/ # Análisis de anuncios
│   │   ├── mortgage-compass/ # Simulador hipotecario
│   │   ├── timeline/     # Cronograma interactivo
│   │   ├── checklist/    # Checklist documental
│   │   └── +layout.svelte
│   ├── lib/              # Stores, API client, utils
│   └── app.css
└── tests/

e2e/                      # Playwright end-to-end tests
specs/                    # Documentación SDD (spec-kit)
.specify/                 # Configuración spec-kit
```

**Patrón:** Arquitectura Hexagonal + DDD táctico. Separación backend/frontend con E2E cross-stack.

### **2.4. Infraestructura y despliegue**

> Pendiente de implementación.

**Plan previsto:**
- Backend: Railway o Render (Node.js + PostgreSQL)
- Frontend: Vercel o Netlify (PWA estática)
- CI/CD: GitHub Actions — lint → typecheck → tests unitarios → tests integración → build → E2E → deploy

### **2.5. Seguridad**

- Sin autenticación en MVP. Sesiones anónimas identificadas por UUID v4 generado en servidor.
- Rate limiting: máximo 20 análisis/día por sesión.
- No se almacena contenido de terceros (HTML de anuncios, texto extraído). Solo resultados de análisis.
- User-Agent honesto: `Realista/1.0 (analizador educativo)`.
- Secrets gestionados vía variables de entorno, nunca en código.
- Sin datos personales ni PII almacenados.
- Campo `userId` nullable preparado para futura autenticación sin migración de datos.

### **2.6. Tests**

> Pendiente de implementación.

**Estrategia prevista:**
- Vitest para unitarios (dominio, value objects, adaptadores) + integración (API + DB)
- Playwright para E2E (flujo: Listing Lens → Mortgage Compass → Dashboard)
- Objetivo: 80%+ cobertura en capa de dominio
- Feature-slice TDD: tests escritos antes de la implementación

---

## 3. Modelo de Datos

### **3.1. Diagrama del modelo de datos:**

```mermaid
erDiagram
    User ||--o{ PurchaseProcess : has
    PurchaseProcess ||--o{ AnalyzedListing : contains
    PurchaseProcess ||--|| Checklist : has

    User {
        string id PK "UUID v4"
        datetime createdAt "auto"
    }

    PurchaseProcess {
        string id PK "UUID v4"
        string userId FK "nullable, future auth"
        string status "active|completed|archived"
        json financialProfile "income, savings, persona..."
        datetime createdAt "auto"
        datetime updatedAt "auto"
    }

    AnalyzedListing {
        string id PK "UUID v4"
        string processId FK
        string url
        int numericScore "0-100"
        json redFlags "Array<{flag, reasoning}> (FR-025)"
        float locationConfidence "0.0-1.0, nullable"
        string miraTuZonaLink "nullable"
        string cadastralRef "nullable"
        float cadastralM2 "nullable"
        float claimedM2 "nullable"
        int constructionYear "nullable"
        string snapshotHash "SHA-256"
        string previousHash "nullable, chain link"
        json diff "nullable, computed by backend"
        datetime createdAt "auto"
    }

    Checklist {
        string id PK "UUID v4"
        string processId FK "unique"
        json items "BureaucraticMilestone[]"
        datetime updatedAt "auto"
    }
```

### **3.2. Descripción de entidades principales:**

**User**
- `id`: UUID v4, clave primaria
- `createdAt`: DateTime, autogenerado
- Sin email, contraseña ni datos personales en MVP
- Relación 1:N con PurchaseProcess

**PurchaseProcess**
- `id`: UUID v4, clave primaria
- `userId`: FK a User, nullable para soportar sesiones anónimas ahora y auth después
- `status`: String, valores: `active`, `completed`, `archived`
- `financialProfile`: JSON (propertyPrice, savings, monthlyIncome, existingDebts, region, interestRate, persona)
- Relación 1:N con AnalyzedListing, 1:1 con Checklist

**AnalyzedListing**
- `id`: UUID v4, clave primaria
- `processId`: FK a PurchaseProcess
- `numericScore`: Int 0-100, puntuación de transparencia del anuncio
- `redFlags`: JSON array de `{flag, reasoning}` (FR-025 — el LLM devuelve la frase del anuncio que disparó cada flag + la inferencia)
- `cadastralM2` / `claimedM2`: comparativa de superficie declarada vs oficial
- `snapshotHash`: SHA-256 del contenido del análisis para detección de cambios
- `previousHash`: enlace al hash del snapshot anterior (cadena de trazabilidad)
- `diff`: JSON con deltas vs snapshot anterior, computado por el backend en re-análisis (FR-022)

**Checklist**
- `id`: UUID v4, clave primaria
- `processId`: FK única a PurchaseProcess
- `items`: JSON array de `BureaucraticMilestone` (stage, title, description, documentsNeeded, estimatedDays, completed)

---

## 4. Especificación de la API

### Endpoints principales

**POST /api/listings/analyze** — Analiza la URL de un anuncio inmobiliario.

```json
// Request
{ "url": "https://www.idealista.com/inmueble/12345678/" }

// Response 200
{
  "id": "uuid",
  "numericScore": 42,
  "redFlags": ["imprecise_location", "no_energy_certificate"],
  "locationConfidence": 0.78,
  "miraTuZonaLink": "https://miratuzona.com/zone/...",
  "cadastralRef": "9876543VK4797N",
  "cadastralM2": 78,
  "claimedM2": 85,
  "constructionYear": 1972,
  "snapshotHash": "sha256:...",
  "createdAt": "2026-06-04T12:00:00Z"
}
```

**POST /api/purchase-processes** — Crea un proceso de compra con perfil financiero.

```json
// Request
{
  "financialProfile": {
    "propertyPrice": 200000,
    "savings": 45000,
    "monthlyIncome": 3500,
    "existingDebts": 0,
    "region": "madrid",
    "persona": "moderate"
  }
}

// Response 201
{ "id": "uuid", "status": "active", "createdAt": "..." }
```

**GET /api/checklist/:processId** — Obtiene el checklist documental por etapa.

```json
// Response 200
{
  "id": "uuid",
  "items": [
    {
      "id": "item-uuid",
      "stage": "pre_arras",
      "title": "Nota simple del registro",
      "description": "Solicitar en el Registro de la Propiedad",
      "documentsNeeded": [],
      "estimatedDays": 3,
      "completed": false
    }
  ]
}
```

> Para la especificación completa, ver `specs/001-realista-mvp/contracts/api.md`

---

## 5. Historias de Usuario

**Historia de Usuario 1 — Listing Lens: Analizar un Anuncio Inmobiliario (P1)**

Como comprador primerizo, quiero pegar la URL de un anuncio y obtener un análisis de transparencia para saber qué me está ocultando el anuncio.

Criterios de aceptación:
1. Dada una URL de anuncio válida, cuando la envío, entonces veo una puntuación (0-100) y banderas rojas dentro del SLA de 15s (FR-018)
2. Dado un anuncio con pistas de ubicación, cuando el análisis termina, entonces se muestra una estimación de ubicación y enlace a MiraTuZona
3. Dado que hay datos catastrales, cuando el análisis termina, entonces se comparan m² declarados vs oficiales
4. Dada una URL inaccesible, cuando la envío, entonces se ofrece pegar el texto del anuncio manualmente

**Historia de Usuario 2 — Mortgage Compass: Comprender Costes Reales y Opciones (P1)**

Como comprador primerizo, quiero introducir mis datos financieros y entender cuánto me cuesta realmente comprar y qué estrategia de hipoteca me conviene.

Criterios de aceptación:
1. Dado precio 200.000€, ahorros 45.000€ e ingresos 3.500€/mes, cuando envío los datos, entonces se desglosan los gastos ocultos (~18.200€) con indicador de diferencia
2. Dado que he completado el perfil, cuando respondo preguntas de tolerancia al riesgo, entonces se sugiere una duración de hipoteca
3. Dada una hipoteca a 30 años al 3,5%, cuando cargo el simulador, entonces veo 4 escenarios de amortización con años acortados e intereses ahorrados
4. Dados todos los escenarios, cuando se muestra la alternativa de inversión, entonces veo el valor estimado de la cartera a 30 años

**Historia de Usuario 3 — Dashboard: Seguimiento del Proceso (P2)**

Como comprador primerizo, quiero ver un resumen de mis análisis y mi situación financiera en un solo sitio para no perderme.

Criterios de aceptación:
1. Dada una sesión sin proceso activo, cuando visito el dashboard, entonces se muestra el estado vacío con dos CTAs ("Analizar un anuncio" y "Configurar perfil manualmente")
2. Dado que he analizado 3 anuncios, cuando visito el dashboard, entonces los veo todos con puntuaciones y fechas
3. Dado un anuncio previamente analizado, cuando pulso "re-analizar", entonces se destacan las diferencias con la instantánea anterior (diff backend-computed)

---

**Historia de Usuario 4 — Negotiation Assistant: Preguntas Concretas para tu Visita (P2, Should-Have)**

Como comprador primerizo, tras analizar un anuncio, quiero ver preguntas concretas que hacer al inmobiliario para no llegar a la visita sin saber qué preguntar.

Criterios de aceptación:
1. Tras un análisis, cuando pulso "Generar puntos de negociación", entonces veo 5-8 preguntas específicas basadas en las red flags detectadas (no genéricas)
2. Cuando un análisis no tiene red flags, entonces veo 3-5 preguntas preventivas generales (cédula de habitabilidad, IBI, etc.)
3. Cuando un listing lleva >6 meses sin actualizar, entonces la pregunta "¿sigue disponible?" aparece en la lista
4. La razón de cada pregunta (qué red flag la disparó) se muestra al usuario, no se oculta

---

**Historia de Usuario 5 — Cronograma Interactivo: Saber Qué Viene Después (P3, Should-Have)**

Como comprador primerizo, quiero ver una línea temporal del proceso de compra para entender qué pasa en cada etapa y cuándo.

Criterios de aceptación:
1. Cuando abro la página del cronograma, entonces veo una línea temporal visual con hitos desde arras hasta escritura, con duraciones estimadas
2. Cuando pulso un hito, entonces veo información detallada (qué pasa, documentos necesarios, duración típica)

---

**Historia de Usuario 6 — Checklist Documental: Que No Se Te Escape Nada (P3, Should-Have)**

Como comprador primerizo, quiero hacer seguimiento de qué documentos tengo y qué me falta para cada etapa del proceso.

Criterios de aceptación:
1. Cuando abro el checklist, los ítems se agrupan por etapa con un porcentaje de progreso por etapa
2. Cuando marco un ítem como completado, el porcentaje se actualiza y el estado persiste entre sesiones
3. Cuando completo todos los ítems de una etapa, la UI sugiere avanzar a la siguiente etapa del proceso

---

## 6. Tickets de Trabajo

> Los 139 tickets detallados están en `specs/001-realista-mvp/tasks.md` (con IDs T001–T091b, fases, dependencias y criterios TDD). A continuación, los 3 más representativos: uno de backend, uno de frontend y uno de base de datos.

**Ticket 1 — Backend (T037): Implementar AnalyzeListingUseCase**

**Descripción:** Crear el caso de uso principal del Listing Lens que orquesta la cadena de adaptadores para analizar un anuncio. Recibe una URL, la pasa al CheerioAdapter para extraer el HTML limpio, luego al OpenRouterAdapter (LLM con system prompt estructurado) para análisis semántico, en paralelo al CatastroAdapter para cruce de m² declarados vs oficiales, y al MiraTuZonaAdapter para generar el enlace contextual. Devuelve un `TransparencyReport` con score, banderas rojas, confianza de ubicación y comparativa catastral.

**Historia de usuario:** US1 — Listing Lens: Analizar un Anuncio Inmobiliario (P1)

**Criterios de aceptación:**
- Dado un HTML limpio, cuando se invoca el caso de uso, entonces se llama al LLM y al Catastro en paralelo
- Dado que el LLM devuelve JSON, cuando se parsea, entonces se construye el `TransparencyReport` con score 0-100
- Si el Catastro falla, el caso de uso continúa y devuelve el análisis sin datos catastrales
- Si el LLM falla, se invoca automáticamente AvenaScoreAdapter como fallback

**Archivos:**
- `backend/src/domain/services/AnalyzeListingUseCase.ts` (creación)
- `backend/tests/unit/domain/services/AnalyzeListingUseCase.test.ts` (test unitario previo — TDD)
- `backend/tests/integration/api/listings.test.ts` (test integración previo — TDD)

**Estimación:** 4-6 horas

---

**Ticket 2 — Frontend (T061): Crear página Mortgage Compass con flujo de 3 pasos**

**Descripción:** Implementar la página SvelteKit `/mortgage-compass` con un formulario multi-paso: (1) entrada de datos financieros (precio, ahorros, ingresos, deudas), (2) revelación de gastos ocultos calculados (ITP/IVA por comunidad autónoma, notaría, registro, gestoría, tasación), (3) playground de estrategias con 4 escenarios de amortización (sin amortizar, ligera €100/mes, moderada €300/mes, agresiva €500/mes) comparados con una alternativa de inversión. Diseño mobile-first, sin wizard forzado — cada paso navegable independientemente.

**Historia de usuario:** US2 — Mortgage Compass: Comprender Costes Reales y Opciones (P1)

**Criterios de aceptación:**
- Cuando el usuario introduce precio + ahorros + ingresos, entonces se calculan y muestran los gastos ocultos con un desglose visual
- Cuando responde 2-3 preguntas de tolerancia al riesgo, entonces se asigna un perfil (conservador/moderado/crecimiento)
- Cuando se carga el playground, entonces se muestran los 4 escenarios de amortización con años acortados, intereses ahorrados y comparativa con cartera de inversión
- La narrativa educativa se genera desde plantillas hardcoded según perfil × escenario (nunca LLM, nunca consejo prescriptivo)

**Archivos:**
- `frontend/src/routes/mortgage-compass/+page.svelte` (creación)
- `frontend/src/routes/mortgage-compass/+page.server.ts` (loader server-side que proxy al backend)
- `frontend/src/lib/stores/financialProfile.ts` (store de Svelte para el perfil)

**Estimación:** 6-8 horas

---

**Ticket 3 — Base de datos (T010): Configurar schema Prisma con 4 modelos**

**Descripción:** Definir el schema de Prisma con los 4 agregados del dominio: `User` (sesión anónima con UUID), `PurchaseProcess` (proceso de compra con perfil financiero JSON), `AnalyzedListing` (resultado del Listing Lens con score, banderas rojas, hash de snapshot) y `Checklist` (checklist documental por etapa). Configurar relaciones 1:N (User → PurchaseProcess → AnalyzedListing) y 1:1 (PurchaseProcess → Checklist), índices y claves foráneas. Generar la migración inicial con `prisma migrate dev --name init`.

**Criterios de aceptación:**
- Los 4 modelos compilan sin errores y se generan los tipos TypeScript
- Las relaciones están bien definidas: `User.id` UUID PK, `PurchaseProcess.userId` nullable FK a User, etc.
- El campo `userId` es nullable en PurchaseProcess para soportar sesiones anónimas ahora y autenticación futura
- El campo `financialProfile` es JSON en PurchaseProcess (no tabla separada en MVP)
- La migración inicial se aplica correctamente a PostgreSQL

**Archivos:**
- `backend/src/infrastructure/prisma/schema.prisma` (creación)
- `backend/src/infrastructure/prisma/client.ts` (singleton del PrismaClient — T012)

**Estimación:** 2-3 horas

---

## 7. Pull Requests

> Documentación de las PRs realizadas durante el desarrollo. Los hashes de commit y mensajes corresponden a la rama `feature-entrega1-DMM` (con las iniciales DMM del autor, según la convención del cohort).

**Pull Request 1 — Plan de implementación + investigación + modelo de datos + contratos**

**Título:** `plan: implementation plan + research + data model + contracts + quickstart`

**Hash de commit:** `e6fe3c5`

**Descripción:** Esta PR añade todos los artefactos de la fase de planificación de Realista: el plan de implementación con la arquitectura hexagonal + DDD y stack SvelteKit/Express/Prisma; el documento de investigación con 7 decisiones técnicas justificadas (OpenRouter, Cadastro API, @avena/score, Cheerio, PWA, sesiones, etc.); el modelo de datos con el schema Prisma y value objects del dominio; los contratos de la API REST; y una guía de quickstart para setup y validación. Verifica el cumplimiento de los 6 principios de la constitución del proyecto.

**Relación con historias de usuario:** Soporta las 6 historias (US1–US6) sentando las bases arquitectónicas, de datos y de API.

**Impacto:** Solo se añaden archivos nuevos — no hay cambios en código de producción. La constitución de 6 principios se valida contra el diseño propuesto.

**Cambios:** 6 archivos creados (782 líneas)

---

**Pull Request 2 — Desglose de tareas: 139 tareas con TDD por historia de usuario**

**Título:** `tasks: 91 tasks across 8 phases, TDD per user story`

**Hash de commit:** `a8fd5d7` (versión original de 91 tareas, ampliada a 139 en commits posteriores con T023a-f, T030a-b, T032a-d → T032a-b (Vision eliminado), T037a-f, T042a, T050a-e, T057a, T058a, T066a-i (Negotiation Assistant), T033a (AI Reasoning), T062a-c (UX polish), T070a-f, T087a, T091a, T091b para cubrir críticos, importantes, menores del review y el nuevo US-04)

**Descripción:** Esta PR genera el desglose completo de tareas (`specs/001-realista-mvp/tasks.md`) con 139 tareas distribuidas en 9 fases: Setup, Foundational, US1 Listing Lens, US2 Mortgage Compass, US3 Dashboard, US4 Negotiation Assistant, US5 Timeline, US6 Checklist y Polish. Cada historia de usuario incluye sus tests primero (TDD, ~25 tareas de test tras las ampliaciones), seguidos de la implementación. Las tareas están etiquetadas con `[P]` para paralelización y `[US1]`–`[US6]` para trazabilidad con las historias.

**Relación con historias de usuario:** Trazabilidad directa — cada tarea está mapeada a una historia específica.

**Impacto:** Archivo único que sirve como roadmap ejecutable para la fase de implementación. Define claramente la dependencia entre fases y las oportunidades de paralelización.

**Cambios:** 1 archivo creado (328 líneas)

---

**Pull Request 3 — Documentación completa del cohort: LICENSE, NOTICE, ADRs, eventos de dominio, prompts**

**Título:** `docs: complete cohort documentation artifacts`

**Hash de commit:** `bd10778`

**Descripción:** Esta PR añade los artefactos de documentación requeridos por la plantilla del cohort: LICENSE MIT, NOTICE.md con atribución a @avena/score, 3 Architecture Decision Records (hexagonal + DDD, @avena/score como fallback, scraping educativo vs comercial), un catálogo de eventos de dominio identificados (20 actuales + 4 futuros post-MVP = 24 en total; ver `docs/domain-events.md`), y la documentación completa de `prompts.md` organizada en 8 secciones según el nuevo formato (Skills, Subagentes, Workflows, Tools, Procesos, Prompts clave, Comparativas, Ajustes humanos).

**Relación con historias de usuario:** No ligada a una historia específica — completa los entregables de documentación del proyecto.

**Impacto:** Cubre los requisitos de la Entrega 1 (Documentación técnica) más allá de la plantilla. Establece la base de gobernanza técnica para futuros colaboradores.

**Cambios:** 7 archivos creados o modificados (649 líneas, 14 eliminadas) en su versión original. Ampliada en commits posteriores (`f1b432c` + `42cc631` + `78de70c` + `b42fd93`) con la traducción completa al español, los 3 fixes críticos del E2E, los 9 fixes importantes+menores, y la corrección del code review (`f1b432c` con 3 critical + 8 important).
