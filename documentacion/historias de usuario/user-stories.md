# User Stories — arteflujo

**Generado**: 2026-03-09
**Total**: 3 User Stories | **Personas cubiertas**: Curioso Cultural, Melómano, Cinéfilo

---

## User Story 1 — Descubrimiento por Tiempo y Mood + Watchlist
**Persona**: El Curioso Cultural
**Prioridad**: ⭐ Must-Have (P1)

**Historia**:
Como **Curioso Cultural**, quiero filtrar contenido por duración y estado de ánimo para descubrir cortos, conciertos o películas de calidad que se ajusten al tiempo libre que tengo en este momento.

**Criterios de Aceptación**:
1. **Dado** que estoy en la pantalla principal, **Cuando** ajusto el Dial de Tiempo a 15 minutos y selecciono el mood "Melancólico", **Entonces** el sistema muestra solo obras con `duracion_min ≤ 15` y `vibe_mood = "Melancólico"`, con su indicador de acceso (🟢🟡🔵) visible.
2. **Dado** que veo los resultados, **Cuando** hago clic en "Sorpréndeme", **Entonces** el sistema selecciona una obra aleatoria del catálogo filtrado y la presenta en pantalla.
3. **Dado** que encuentro una obra de interés, **Cuando** hago clic en "Guardar en mi lista", **Entonces** la obra queda agregada a mi Watchlist personal y veo confirmación visual inmediata.
4. **Dado** que el sistema no encuentra obras con los filtros aplicados, **Cuando** los resultados están vacíos, **Entonces** el sistema muestra un mensaje amigable y sugiere ampliar los filtros.

**Requisitos cubiertos**: RF-003, RF-004, RF-007, RF-009, RF-012
**Fuera de scope**: Reproducción del video, Modo Contexto, gestión de perfil de usuario.

---

## User Story 2 — Exploración de Fragmentos Musicales + Reproducción
**Persona**: El Melómano y Amante del Arte
**Prioridad**: 🔶 Should-Have (P2)

**Historia**:
Como **Melómano**, quiero explorar fragmentos musicales curados por género y tipo de presentación para encontrar la "pieza de oro" de un concierto sin tener que ver el evento completo.

**Criterios de Aceptación**:
1. **Dado** que estoy en la sección "The Stage", **Cuando** selecciono el filtro "Solo Fragmentos" y el género "Jazz", **Entonces** el sistema muestra únicamente fragmentos de conciertos de Jazz con su indicador de plataforma origen (logo de YouTube, Vimeo, etc.).
2. **Dado** que selecciono una pieza musical con `permite_iframe = true`, **Cuando** hago clic en "Reproducir", **Entonces** el video se abre en un modal embebido (Smart Embedding) sin abandonar la plataforma.
3. **Dado** que selecciono una pieza musical con `permite_iframe = false`, **Cuando** hago clic en "Reproducir", **Entonces** el sistema muestra el botón "Ver en [plataforma origen]" que abre la app o web externa directamente.
4. **Dado** que una obra tiene un Hito registrado, **Cuando** veo la card, **Entonces** el sello de calidad es visible de forma prominente en la miniatura.

**Requisitos cubiertos**: RF-001, RF-002, RF-005, RF-006, RF-009, RF-011
**Fuera de scope**: Watchlist, Modo Contexto, filtrado por duración en esta historia.

---

## User Story 3 — Búsqueda por Festival/Hito + Acceso Transparente
**Persona**: El Cinéfilo (Cinephile)
**Prioridad**: 🔷 Should-Have (P2)

**Historia**:
Como **Cinéfilo**, quiero buscar películas de festivales reconocidos y ver claramente si necesito suscripción o si son gratuitas, para decidir qué ver sin contratiempos de acceso.

**Criterios de Aceptación**:
1. **Dado** que estoy en la sección "The Cinema", **Cuando** busco por Hito "Nominados Oscar 2024", **Entonces** el sistema retorna todas las obras que tienen ese `HITO` registrado, con su `ESTADO_ACCESO` visible (🟢🟡🔵) y el logo de la plataforma origen.
2. **Dado** que hago clic en una película, **Cuando** veo el detalle de la obra, **Entonces** puedo ver la ficha técnica completa: director, región, duración, valor cultural (máx. 280 caracteres) y todos sus Hitos.
3. **Dado** que la obra es de acceso Suscripción (🟡), **Cuando** hago clic en "Ver en MUBI", **Entonces** el sistema me redirige mediante Deep Linking con parámetros de afiliación inyectados por el backend.
4. **Dado** que el servicio externo no está disponible, **Cuando** intento acceder, **Entonces** el sistema muestra "Contenido no disponible temporalmente" sin errores técnicos.

**Requisitos cubiertos**: RF-001, RF-002, RF-006, RF-010, RF-011, RNF-003
**Fuera de scope**: Watchlist, Smart Embedding, Modo Contexto.

---

## Resumen

| # | Persona | User Story | Prioridad |
|---|---------|-----------|-----------|
| US-1 | Curioso Cultural | Descubrimiento por Tiempo y Mood + Watchlist | Must-Have P1 |
| US-2 | Melómano | Exploración de Fragmentos Musicales + Reproducción | Should-Have P2 |
| US-3 | Cinéfilo | Búsqueda por Festival/Hito + Acceso Transparente | Should-Have P2 |

---

**Próximo paso**: `/speckit.worktickets` — Generar Work Tickets para US-1 (P1).
