# Domain Events — Realista

Eventos de dominio identificados durante el diseño del MVP.

> **Formato**: `Evento (agregado emisor) → descripción`

---

## Listing Lens

| Evento | Emisor | Descripción |
|--------|--------|-------------|
| `ListingAnalyzed` | AnalyzedListing | Un anuncio ha sido analizado exitosamente. Contiene score, banderas rojas, hash de snapshot |
| `ListingAnalysisFailed` | AnalyzedListing | El análisis ha fallado (LLM caído, URL inaccesible). Dispara la cadena de fallback |
| `CadastralCrossReferenced` | AnalyzedListing | Se ha completado el cruce catastral. Contiene comparativa de m² y año de construcción |
| `CadastralUnavailable` | AnalyzedListing | La API del Catastro no respondió. El análisis continúa sin datos catastrales |
| `SnapshotCreated` | AnalyzedListing | Se ha generado un hash SHA-256 del análisis para trazabilidad futura |
| `ListingReAnalyzed` | AnalyzedListing | Un anuncio previamente analizado ha sido re-analizado. Contiene diff con snapshot anterior |

## Mortgage Compass

| Evento | Emisor | Descripción |
|--------|--------|-------------|
| `FinancialProfileCreated` | PurchaseProcess | El usuario ha completado su perfil financiero (precio, ahorros, ingresos, deudas) |
| `FinancialProfileUpdated` | PurchaseProcess | El perfil financiero ha sido modificado |
| `HiddenCostsCalculated` | PurchaseProcess | Se han calculado los gastos ocultos de compra para el perfil actual |
| `PersonaAssigned` | PurchaseProcess | El usuario ha respondido las preguntas de tolerancia al riesgo y se ha asignado un perfil (conservador/moderado/crecimiento) |
| `AmortizationScenariosGenerated` | PurchaseProcess | Se han calculado los 4 escenarios de amortización para el perfil financiero actual |
| `InvestmentAlternativeGenerated` | PurchaseProcess | Se ha calculado la alternativa de inversión (cartera estimada a 30 años) |
| `NarrativeGenerated` | PurchaseProcess | Se ha generado la narrativa educativa basada en el perfil y escenario elegido |

## Dashboard & Process

| Evento | Emisor | Descripción |
|--------|--------|-------------|
| `PurchaseProcessStarted` | PurchaseProcess | Se ha creado un nuevo proceso de compra |
| `PurchaseProcessCompleted` | PurchaseProcess | El proceso de compra ha sido marcado como completado |
| `PurchaseProcessArchived` | PurchaseProcess | El proceso ha sido archivado |
| `SessionCreated` | User | Se ha creado una nueva sesión anónima (UUID generado) |

## Checklist & Timeline

| Evento | Emisor | Descripción |
|--------|--------|-------------|
| `ChecklistItemToggled` | Checklist | Un ítem del checklist ha cambiado de estado (pending ↔ completed) |
| `ChecklistStageCompleted` | Checklist | Todos los ítems de una etapa han sido completados |
| `TimelineMilestoneViewed` | — | El usuario ha consultado el detalle de un hito del cronograma (evento de UI, no de dominio) |

---

## Eventos futuros (post-MVP)

| Evento | Descripción |
|--------|-------------|
| `UserRegistered` | Cuando se implemente autenticación |
| `NotificationSent` | Cuando se implementen alertas de hitos |
| `CommunityReportSubmitted` | Cuando se implementen reportes comunitarios |
| `MerkleRootPublished` | Si se implementa trazabilidad criptográfica |

---

## Notas

- Los eventos de dominio **no se persisten como tabla de eventos** en el MVP (sin event sourcing). Se usan como guía de diseño para:
  - Nombrado de métodos en agregados y servicios de dominio
  - Puntos de logging y observabilidad
  - Futuros casos de uso (notificaciones, analytics, auditoría)
- Los eventos marcados como "UI" no son eventos de dominio, se incluyen como referencia de interacción
