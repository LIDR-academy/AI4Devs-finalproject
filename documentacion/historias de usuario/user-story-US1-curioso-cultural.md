# User Story 1 — Descubrimiento por Tiempo y Mood + Watchlist

**Persona**: El Curioso Cultural
**Prioridad**: ⭐ Must-Have (P1)
**Generado**: 2026-03-09

---

## Historia

> Como **Curioso Cultural**, quiero filtrar contenido por duración y estado de ánimo para descubrir cortos, conciertos o películas de calidad que se ajusten al tiempo libre que tengo en este momento.

---

## Criterios de Aceptación

1. **Dado** que estoy en la pantalla principal, **Cuando** ajusto el Dial de Tiempo a 15 minutos y selecciono el mood "Melancólico", **Entonces** el sistema muestra solo obras con `duracion_min ≤ 15` y `vibe_mood = "Melancólico"`, con su indicador de acceso (🟢🟡🔵) visible.

2. **Dado** que veo los resultados, **Cuando** hago clic en "Sorpréndeme", **Entonces** el sistema selecciona una obra aleatoria del catálogo filtrado y la presenta en pantalla.

3. **Dado** que encuentro una obra de interés, **Cuando** hago clic en "Guardar en mi lista", **Entonces** la obra queda agregada a mi Watchlist personal y veo confirmación visual inmediata.

4. **Dado** que el sistema no encuentra obras con los filtros aplicados, **Cuando** los resultados están vacíos, **Entonces** el sistema muestra un mensaje amigable y sugiere ampliar los filtros.

---

## Requisitos cubiertos

| ID | Requisito |
|----|-----------|
| RF-003 | Filtrar contenido por duración máxima (Dial de Tiempo) |
| RF-004 | Filtrar contenido por estado de ánimo (vibe_mood) |
| RF-007 | Guardar obras en Watchlist personal (requiere autenticación) |
| RF-009 | Contenido organizado en tres ejes: The Short List, The Stage, The Cinema |
| RF-012 | Contenido gratuito y embebible con prioridad en resultados |

---

## Fuera de scope

- Reproducción del video (Smart Embedding / Deep Linking)
- Modo Contexto (pop-ups informativos durante la reproducción)
- Gestión del perfil de usuario

---

## Tickets asociados

| ID | Tipo | Descripción | Horas |
|----|------|-------------|-------|
| ARF-001 | BD | Migración tabla OBRA | 2h |
| ARF-002 | BD | Seed datos de prueba | 1h |
| ARF-003 | Backend | GET /obras con filtros | 3h |
| ARF-004 | Backend | POST /watchlist autenticado | 2h |
| ARF-005 | Backend | Auth register/login JWT | 3h |
| ARF-006 | Frontend | Componente DialDeTiempo | 2h |
| ARF-007 | Frontend | Componente MoodSelector | 1.5h |
| ARF-008 | Frontend | Componente ObraCard | 2h |
| ARF-009 | Frontend | Hook useWatchlist | 2h |
| ARF-010 | Frontend | Página principal | 2.5h |
| ARF-011 | Seguridad | Variables de entorno | 1h |
| **Total** | | | **22h** |

Ver detalle completo en: `work-tickets-US1-curioso-cultural.md`
