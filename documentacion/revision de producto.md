# Revisión de Producto — arteflujo

**Generado**: 2026-03-09
**Fuente PRD**: `documentacion/` — Documentación de Plataforma Cultural Digital, Diseño de Arquitectura, Modelo de datos, Especificación API

---

## 👥 User Personas

### Persona 1: El Curioso Cultural

- **Descripción**: Persona con interés amplio en las artes y la cultura. Busca descubrir cosas nuevas en sus ratos libres sin saber exactamente qué quiere encontrar.
- **Motivación principal**: Aprender y sorprenderse con contenido que no encontraría en plataformas comerciales.
- **Frustración actual**: El scroll infinito de Netflix/YouTube no le lleva a nada de calidad; tiene que saltar de app en app para encontrar algo que valga la pena.
- **Comportamiento clave**: Usa el filtro de tiempo (Dial de Tiempo), el botón "Sorpréndeme" y guarda obras en su Watchlist para verlas después.

---

### Persona 2: El Melómano y Amante del Arte

- **Descripción**: Usuario con conocimiento técnico en música o artes escénicas. Valora la interpretación y la calidad sobre la popularidad.
- **Motivación principal**: Encontrar fragmentos magistrales, versiones instrumentales únicas o la "pieza de oro" de un concierto sin tener que ver el evento completo.
- **Frustración actual**: Las plataformas comerciales no ofrecen curaduría especializada de música clásica, jazz, ópera o teatro. El contenido está disperso en YouTube sin criterio editorial.
- **Comportamiento clave**: Filtra por género y tipo de contenido (Sinfónico, Jazz, Ópera), usa el selector de "Solo Fragmentos" vs "Concierto Completo".

---

### Persona 3: El Cinéfilo (Cinephile)

- **Descripción**: Espectador apasionado del cine de autor, festivales y cine independiente. Rechaza activamente el cine comercial de Hollywood.
- **Motivación principal**: Acceder a películas de Cannes, Berlinale, cine independiente y experimental desde un solo lugar curado.
- **Frustración actual**: El cine de autor está fragmentado entre MUBI, plataformas de nicho y YouTube. No sabe fácilmente si necesita suscripción o si es gratuito.
- **Comportamiento clave**: Busca por "Hito" (ej. "Nominados Oscar 2024"), revisa la ficha técnica con foco en el director, usa el indicador de acceso (🟢🟡🔵) para decidir.

---

## 📋 Requisitos Funcionales

| ID | Requisito |
|----|-----------|
| RF-001 | El sistema DEBE agregar e indexar contenido de terceros (YouTube, Vimeo, MUBI, Netflix) sin alojar video propio |
| RF-002 | Cada obra DEBE mostrar su tipo de acceso: Abierto (🟢), Suscripción (🟡) o Premium/VOD (🔵) |
| RF-003 | El sistema DEBE permitir filtrar contenido por duración máxima (Dial de Tiempo) |
| RF-004 | El sistema DEBE permitir filtrar contenido por estado de ánimo (vibe_mood) |
| RF-005 | El sistema DEBE soportar reproducción embebida (Smart Embedding) cuando la plataforma lo permita |
| RF-006 | El sistema DEBE usar Deep Linking cuando la plataforma no permita iframe |
| RF-007 | El usuario DEBE poder guardar obras en una Watchlist personal (requiere autenticación) |
| RF-008 | El sistema DEBE mostrar información contextual sincronizada durante la reproducción (Modo Contexto) |
| RF-009 | El contenido DEBE estar organizado en tres ejes: The Short List, The Stage, The Cinema |
| RF-010 | Los enlaces de afiliación DEBEN ser inyectados dinámicamente en el backend |
| RF-011 | El sistema DEBE mostrar "Hitos" de calidad en cada obra (premios, festivales) |
| RF-012 | El contenido gratuito y embebible DEBE tener prioridad en los resultados de búsqueda |

---

## 📐 Requisitos No Funcionales

| ID | Requisito |
|----|-----------|
| RNF-001 | La plataforma DEBE escalar de forma independiente por microservicio durante picos de tráfico |
| RNF-002 | El tiempo de respuesta de búsqueda DEBE ser < 1 segundo para catálogos indexados |
| RNF-003 | El sistema DEBE ser resiliente ante fallos de APIs externas (Circuit Breaker) |
| RNF-004 | Toda comunicación DEBE usar TLS 1.3 (HTTPS) |
| RNF-005 | Las credenciales de APIs externas NUNCA deben estar en el código fuente |
| RNF-006 | La plataforma DEBE soportar auto-escalado ante eventos especiales (estrenos, premiaciones) |
| RNF-007 | Los metadatos de terceros DEBEN actualizarse con un máximo de 24 horas de antigüedad |

---

## 📊 Resumen

| Elemento | Total |
|----------|-------|
| User Personas | 3 |
| Requisitos Funcionales | 12 |
| Requisitos No Funcionales | 7 |

---

**Próximo paso**: `/speckit.userstories` — Generar 1 User Story por cada persona.
