# Master PRD — Lexio

| Campo | Valor |
|-------|-------|
| **Producto** | Lexio |
| **Versión del documento** | 1.0 |
| **Autor** | Jesús Fredy Vizcarra García |
| **Estado** | Aprobado para MVP académico |
| **Proyecto** | AI4Devs — Final Project |
| **Última actualización** | Junio 2026 |

**Documentos relacionados**

| Documento | Contenido |
|-----------|-----------|
| [2-arquitectura-del-sistema.md](./2-arquitectura-del-sistema.md) | Arquitectura BFF, despliegue, seguridad |
| [3-modelo-de-datos.md](./3-modelo-de-datos.md) | Entidades, Firestore, restricciones |
| [4-especificaciones-de-la-api.md](./4-especificaciones-de-la-api.md) | OpenAPI, endpoints, ejemplos |

---

## 1. Resumen ejecutivo

**Lexio** es una aplicación móvil de vocabulario personalizado que ayuda a cualquier persona interesada en mejorar su inglés a **recordar de verdad** las palabras que encuentra en películas, libros, videos o el día a día — no solo consultarlas y olvidarlas.

El producto captura palabras manualmente, las enriquece con definición (IA), imagen (Unsplash) y las convierte en práctica diaria mediante ejercicios generados con IA y un sistema de rachas.

**One-liner:** *Tu diccionario personal inteligente: contexto real + IA + hábito diario.*

**Propuesta de valor única (UVP):** Frente a Google Translate (consulta puntual sin retención), Lexio persiste el vocabulario del usuario, lo visualiza y lo convierte en aprendizaje activo con gamificación mínima (racha).

---

## 2. Visión y misión

### Visión (aspiracional, 2–3 años)

Ser la capa de memoria de vocabulario personal para quienes consumen inglés en contenido real: capturar en el momento, practicar con contexto propio y demostrar retención a largo plazo.

### Misión del MVP

Demostrar un flujo E2E completo y usable en entorno académico:

**Captura manual → Tarjeta enriquecida → Sesión diaria (10 ejercicios) → Marcar aprendidas → Racha**

### Objetivo de producto

Que el usuario **realmente aprenda** las palabras, no solo busque el significado en un navegador y lo olvide en semanas.

---

## 3. Problema y oportunidad

### Problem statement

Las personas que mejoran su inglés encuentran palabras nuevas constantemente. Hoy suelen:

1. **Buscarlas** en Google Translate u otro traductor.
2. **Entenderlas** en el momento.
3. **Olvidarlas** en cuestión de semanas.

Además, les cuesta **retener y organizar** lo aprendido fuera de ese instante de consulta.

### Competencia de referencia

| Alternativa | Qué resuelve | Qué no resuelve |
|-------------|--------------|-----------------|
| **Google Translate** | Significado instantáneo | Retención, práctica, historial estructurado, hábito |
| Anki / Quizlet | Repaso y flashcards | Captura contextual automática, IA personalizada sobre *su* vocabulario real |

### Oportunidad

Combinar **contexto personal**, **enriquecimiento con IA** y **hábito diario medible** (racha) en una experiencia móvil simple, orientada a autodidactas que ya consumen contenido en inglés.

---

## 4. Usuarios y personas

### Usuario primario (MVP)

**Cualquier persona interesada en mejorar su vocabulario en inglés**, sin restricción de edad ni CEFR. El usuario elige las palabras que le importan.

### Persona principal — «María, consumidora de contenido»

| Atributo | Detalle |
|----------|---------|
| Perfil | 28 años, profesional, ve series y lee artículos en inglés |
| Nivel | Intermedio–avanzado (B1–C1 variable) |
| Comportamiento actual | Google Translate en el móvil; anota en Notas y no repasa |
| Dolor | Olvida palabras útiles; no tiene sistema de repaso |
| Objetivo | Recordar vocabulario relevante para *su* vida, no listas genéricas |
| Éxito | Completa práctica diaria y siente que retiene palabras de la semana |

### Jobs to be done

| Cuando… | Quiero… | Para… |
|---------|---------|-------|
| Encuentro una palabra desconocida | Guardarla con significado e imagen | Repasarla después |
| Tengo vocabulario acumulado | Practicar de forma rápida y personalizada | Fijarlo en memoria |
| Mantengo el hábito | Ver mi racha | No abandonar |

---

## 5. Objetivos, métricas y criterios de éxito

### North star metric

**Racha media** — días consecutivos completando la sesión diaria.

### Métricas secundarias (MVP académico)

| Métrica | Descripción |
|---------|-------------|
| Palabras capturadas por usuario | Adopción del core loop de captura |
| Sesiones diarias completadas | Correlación con north star |
| Palabras marcadas como «aprendidas» | Percepción de progreso (validación manual) |
| Tasa de finalización de sesión | Calidad del flujo (10 ejercicios) |

### Definición de éxito del MVP

El MVP es exitoso si un usuario puede, sin ayuda externa:

1. Registrarse e iniciar sesión.
2. Capturar ≥ 4 palabras con tarjeta completa.
3. Completar una sesión de 10 ejercicios.
4. Ver su racha actualizada.
5. Marcar al menos una palabra como aprendida.

### Validación de aprendizaje (MVP)

**Autodeclarada:** el usuario marca manualmente una palabra como «aprendida». No hay evaluación objetiva automatizada de dominio en MVP.

---

## 6. Alcance del producto

### Flujo E2E prioritario (P0)

```
Login → Captura palabra/frase → Editar definición + elegir imagen → Guardar tarjeta
     → (≥ 4 palabras) → Sesión diaria 10 ejercicios → Completar → Racha +1
     → (opcional) Marcar palabra como aprendida
```

### In scope — MVP

| # | Feature | Descripción |
|---|---------|-------------|
| F1 | **Auth** | Registro e inicio con email y contraseña (Firebase) |
| F2 | **Captura manual** | Entrada obligatoria de palabra o frase en inglés |
| F3 | **Definición IA** | Sugerida por Claude; editable; idioma ES o EN a elección del usuario |
| F4 | **Tarjeta visual** | Imágenes sugeridas vía Unsplash; usuario elige una |
| F5 | **Diccionario personal** | Una tarjeta por palabra normalizada; colección en la nube |
| F6 | **Práctica diaria** | 10 ejercicios/día; palabras aleatorias del banco |
| F7 | **Tipos de ejercicio** | Imagen→palabra + quiz opción múltiple (IA) |
| F8 | **Bloqueo de práctica** | No practicar hasta tener **más de 3 palabras** (mín. 4) |
| F9 | **Racha** | Completar sesión diaria = 1 día; perder un día reinicia |
| F10 | **Marcar aprendida** | Estado manual en tarjeta |
| F11 | **UI bilingüe** | Interfaz en español e inglés |
| F12 | **Online-only** | Requiere conexión en todo momento |

### Out of scope — MVP

- Compartir desde otras apps, OCR, integraciones con reproductores
- Recordatorios / push notifications
- XP, badges, niveles
- Monetización / suscripción
- Límites de API por coste
- Reporte/regeneración por errores de IA
- Moderación de contenido
- Repetición espaciada (SRS) automática
- SSO (Google, Apple) / modo guest
- Modo offline
- Múltiples tarjetas por misma palabra en distintos contextos

### Pre-requisitos y reglas de negocio clave

| Regla | Detalle |
|-------|---------|
| Unicidad | Una tarjeta por `(usuario, término normalizado)` |
| Sesión diaria | Exactamente 10 ejercicios; mezcla aleatoria del banco |
| Racha | Completar los 10 ejercicios cuenta como 1 día válido |
| Reinicio racha | Sin sesión completada un día calendario → racha = 0 (al completar al día siguiente = 1) |
| Palabras aprendidas | Siguen en pool aleatorio de ejercicios en MVP |
| Timezone racha | Medianoche local del dispositivo (acordado para implementación) |

---

## 7. Requisitos funcionales

### 7.1 Autenticación (F1)

| ID | Requisito | Prioridad |
|----|-----------|-----------|
| RF-A01 | Registro con email y contraseña | P0 |
| RF-A02 | Inicio de sesión con email y contraseña | P0 |
| RF-A03 | Cierre de sesión | P0 |
| RF-A04 | Diccionario privado por usuario autenticado | P0 |

### 7.2 Captura y tarjetas (F2–F5)

| ID | Requisito | Prioridad |
|----|-----------|-----------|
| RF-W01 | Campo obligatorio: palabra o frase en inglés | P0 |
| RF-W02 | IA sugiere definición; usuario puede editar antes/después de guardar | P0 |
| RF-W03 | Usuario elige idioma de definición: `es` o `en` | P0 |
| RF-W04 | Sugerir imágenes Unsplash; usuario selecciona imagen final | P0 |
| RF-W05 | Una sola tarjeta por término normalizado (trim + lowercase) | P0 |
| RF-W06 | Si término duplicado → mensaje claro + opción editar existente | P1 |
| RF-W07 | Listar todas las tarjetas del usuario | P0 |
| RF-W08 | Editar definición e imagen de tarjeta existente | P0 |
| RF-W09 | Marcar tarjeta como «aprendida» manualmente | P0 |
| RF-W10 | Eliminar tarjeta | P2 |

### 7.3 Práctica diaria (F6–F8)

| ID | Requisito | Prioridad |
|----|-----------|-----------|
| RF-P01 | Bloquear práctica si palabras totales ≤ 3 | P0 |
| RF-P02 | Generar sesión de exactamente 10 ejercicios | P0 |
| RF-P03 | Selección aleatoria de palabras del banco del usuario | P0 |
| RF-P04 | Ejercicio tipo A: imagen de tarjeta → elegir palabra correcta | P0 |
| RF-P05 | Ejercicio tipo B: MCQ generado por IA sobre la tarjeta | P0 |
| RF-P06 | Una sesión completada por día calendario | P0 |
| RF-P07 | No permitir segunda sesión completada el mismo día | P0 |
| RF-P08 | Mostrar resultado de aciertos al cerrar sesión | P1 |

### 7.4 Rachas (F9)

| ID | Requisito | Prioridad |
|----|-----------|-----------|
| RF-S01 | Completar sesión incrementa racha si hubo sesión ayer | P0 |
| RF-S02 | Primer día completado → racha = 1 | P0 |
| RF-S03 | Día sin sesión → racha reinicia | P0 |
| RF-S04 | Mostrar racha actual en pantalla principal | P0 |

### 7.5 Internacionalización (F11)

| ID | Requisito | Prioridad |
|----|-----------|-----------|
| RF-I01 | UI disponible en español e inglés | P0 |
| RF-I02 | Selector de idioma de interfaz | P0 |
| RF-I03 | Idioma de definición independiente del idioma de UI | P0 |

### 7.6 Conectividad (F12)

| ID | Requisito | Prioridad |
|----|-----------|-----------|
| RF-C01 | Todas las operaciones requieren conexión | P0 |
| RF-C02 | Mensaje claro cuando no hay red | P1 |

---

## 8. Requisitos no funcionales

| Área | Requisito |
|------|-----------|
| **Plataforma** | React Native + Expo (iOS y Android) |
| **Backend** | Node.js + Express (BFF) |
| **Auth y DB** | Firebase Authentication + Cloud Firestore |
| **IA** | Anthropic Claude API |
| **Imágenes** | Unsplash API |
| **Rendimiento UX** | Sesión de 10 ejercicios percibida como rápida (~< 2 min) |
| **Seguridad** | ID Token Firebase en API; secretos solo en servidor |
| **Privacidad** | Vocabulario privado por usuario; proyecto académico |
| **Escalabilidad MVP** | Suficiente para demo y evaluación académica |
| **Coste APIs** | Sin límites impuestos en MVP de muestra |

---

## 9. Experiencia de usuario

### Principios UX

1. **Rapidez** — La práctica diaria debe sentirse ligera (10 ejercicios, pocos taps).
2. **Claridad** — Sin ambigüedad en bloqueos (ej. «Te faltan X palabras»).
3. **Propiedad** — El usuario controla definición, idioma e imagen; la IA sugiere, no impone.
4. **Hábito visible** — La racha es el único elemento gamificado; debe ser prominente.

### Pantallas principales (MVP)

| Pantalla | Propósito |
|----------|-----------|
| Login / Registro | Acceso email/password |
| Home | Racha, CTA practicar, acceso diccionario |
| Diccionario | Lista de tarjetas; filtro activas/aprendidas (opcional P1) |
| Añadir palabra | Input término → preview definición IA → elegir imagen |
| Detalle tarjeta | Ver/editar; marcar aprendida |
| Práctica | Flujo secuencial 10 ejercicios |
| Resumen sesión | Aciertos + racha actualizada |
| Ajustes | Idioma UI (ES/EN) |

### Flujos de usuario

#### Flujo 1 — Primera experiencia

1. Registro → pantalla vacía de diccionario.
2. Añadir palabras (mínimo 4) con flujo captura completo.
3. Desbloqueo de «Practicar hoy».
4. Primera sesión → racha = 1.

#### Flujo 2 — Usuario recurrente

1. Login → ver racha.
2. Practicar 10 ejercicios si no completó hoy.
3. Consultar o ampliar diccionario.

#### Flujo 3 — Consolidación

1. Revisar tarjeta en diccionario.
2. Marcar como aprendida cuando se sienta seguro.

---

## 10. Epics y historias de usuario (MVP)

### Epic 1 — Identidad y acceso

| Historia | Criterio de aceptación |
|----------|------------------------|
| Como usuario, quiero registrarme con email y contraseña | Puedo crear cuenta y acceder al diccionario vacío |
| Como usuario, quiero iniciar sesión | Recupero mi vocabulario en la nube |

### Epic 2 — Captura de vocabulario

| Historia | Criterio de aceptación |
|----------|------------------------|
| Como usuario, quiero añadir una palabra o frase manualmente | Se crea borrador con definición sugerida por IA |
| Como usuario, quiero elegir el idioma de la definición (ES/EN) | La definición se genera/muestra en el idioma elegido |
| Como usuario, quiero editar la definición sugerida | Los cambios persisten en la tarjeta |
| Como usuario, quiero elegir una imagen de Unsplash | La tarjeta muestra la imagen seleccionada |
| Como usuario, no quiero duplicar la misma palabra | Recibo aviso si el término ya existe |

### Epic 3 — Práctica diaria

| Historia | Criterio de aceptación |
|----------|------------------------|
| Como usuario, quiero 10 ejercicios diarios basados en mi vocabulario | La sesión mezcla image_match y MCQ con mis palabras |
| Como usuario, no quiero practicar sin suficientes palabras | Con ≤ 3 palabras veo mensaje de bloqueo |
| Como usuario, quiero completar la sesión y ver mis aciertos | Al terminar los 10, veo resumen |

### Epic 4 — Hábito y progreso

| Historia | Criterio de aceptación |
|----------|------------------------|
| Como usuario, quiero ver mi racha | Número visible en home; se actualiza al completar sesión |
| Como usuario, quiero marcar palabras como aprendidas | Cambio de estado persiste en diccionario |

### Epic 5 — Internacionalización

| Historia | Criterio de aceptación |
|----------|------------------------|
| Como usuario, quiero usar la app en español o inglés | Cambio de idioma UI afecta labels y mensajes |

---

## 11. Criterios de aceptación globales del MVP

- [ ] Usuario registrado puede añadir palabras y ver diccionario.
- [ ] Cada tarjeta tiene término, definición editable, idioma de definición e imagen Unsplash.
- [ ] Con ≤ 3 palabras, práctica bloqueada con mensaje explicativo.
- [ ] Con ≥ 4 palabras, sesión de 10 ejercicios (mix imagen + MCQ).
- [ ] Completar sesión actualiza racha según reglas.
- [ ] Usuario puede marcar palabra como aprendida.
- [ ] UI bilingüe ES/EN funcional.
- [ ] App requiere conexión; auth email/password operativo.
- [ ] Flujo E2E demostrable en entorno académico.

---

## 12. Restricciones técnicas y dependencias

### Stack acordado

| Capa | Tecnología |
|------|------------|
| Mobile | React Native + Expo |
| Backend | Node.js + Express |
| Auth | Firebase Authentication |
| DB | Cloud Firestore |
| LLM | Claude API (Anthropic) |
| Imágenes | Unsplash API |

### Arquitectura (resumen)

Patrón **Cliente–Servidor + BFF + monolito en capas**. El móvil autentica con Firebase SDK; el backend valida tokens, orquesta IA/Unsplash y persiste en Firestore. Detalle en [2-arquitectura-del-sistema.md](./2-arquitectura-del-sistema.md).

### Dependencias externas

- Firebase (Auth + Firestore)
- Anthropic Claude API
- Unsplash API
- Hosting backend (Railway / Render / Fly.io — demo)
- Expo EAS (build opcional demo)

### Equipo

Un desarrollador **full-stack** (proyecto académico individual).

---

## 13. Modelo de datos (resumen)

Entidades principales: `User`, `WordCard`, `DailySession`, `Exercise` (embebido), `Streak`.

Restricciones críticas:

- `(userId, normalizedTerm)` único en tarjetas.
- `(userId, sessionDate)` único en sesiones.
- Racha 1:1 con usuario.

Detalle completo en [3-modelo-de-datos.md](./3-modelo-de-datos.md).

---

## 14. API (resumen)

Tres endpoints principales del flujo E2E:

| Método | Ruta | Propósito |
|--------|------|-----------|
| `POST` | `/words` | Captura + IA + Unsplash |
| `POST` | `/sessions/daily` | Sesión 10 ejercicios |
| `POST` | `/sessions/{id}/complete` | Cierre + racha |

Detalle OpenAPI en [4-especificaciones-de-la-api.md](./4-especificaciones-de-la-api.md).

---

## 15. Roadmap

### MVP (actual — entrega académica)

Flujo E2E: captura → práctica → racha → marcar aprendida.

### v1.1 — Retención

- Excluir o reducir frecuencia de palabras «aprendidas» en ejercicios.
- Repetición espaciada simple (SRS básico).

### v1.2 — Captura en contexto

- Compartir texto desde otras apps.
- Campo explícito de frase de contexto origen.

### v1.3 — Hábito

- Recordatorios push configurables.
- Ventana flexible de racha (freeze 1 día).

### v2.0 — Confianza y calidad IA

- Regenerar definición/ejercicio.
- Reportar error en contenido generado.

### v2.x — Producto comercial (fuera de alcance académico)

- Monetización freemium.
- Límites de API y analytics.
- Moderación de contenido.
- Publicación en App Store / Play Store con pulido de producción.

---

## 16. Riesgos y mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Latencia en captura (IA + Unsplash) | Alta | Medio | Loading states; cache por tarjeta |
| MCQ de baja calidad | Media | Alto | Prompts estructurados; fallback a solo image_match |
| Scope creep (full-stack solo) | Alta | Alto | Priorizar E2E; posponer P2 |
| Racha estricta desmotiva | Media | Bajo | Aceptable en MVP; documentado |
| Validación manual débil | Alta | Bajo | North star es racha, no dominio objetivo |
| Vendor lock-in Firebase | Media | Medio | Repository pattern en backend |
| Tensión «captura en momento» vs manual | Media | Medio | Visión futura explícita en roadmap |
| Online-only limita demo | Baja | Bajo | Mensaje UX claro sin red |

---

## 17. Supuestos y decisiones cerradas

| Tema | Decisión |
|------|----------|
| Captura MVP | Solo entrada manual palabra/frase |
| Definición | IA sugiere; usuario edita; idioma ES o EN |
| Imágenes | Unsplash API |
| Unicidad | Una tarjeta por palabra normalizada |
| Ejercicios/día | 10; selección aleatoria |
| Racha | Completar sesión de 10 = 1 día |
| Recordatorios | No en MVP |
| Gamificación | Solo racha |
| Monetización | No |
| Límites API | No en demo académica |
| Aprendizaje validado | Marca manual del usuario |
| Palabras aprendidas en pool | Sí, siguen en ejercicios (MVP) |
| Timezone racha | Medianoche local del dispositivo |
| Competidor referencia | Google Translate |
| UVP | Contexto real + IA + hábito diario |

---

## 18. Glosario

| Término | Definición |
|---------|------------|
| **Tarjeta (WordCard)** | Unidad de vocabulario: término + definición + imagen + estado |
| **Sesión diaria** | Conjunto fijo de 10 ejercicios en un día calendario |
| **Racha (Streak)** | Días consecutivos con sesión completada |
| **MCQ** | Multiple Choice Question — quiz de opción múltiple |
| **image_match** | Ejercicio de relacionar imagen con palabra correcta |
| **BFF** | Backend for Frontend — API que orquesta servicios para el móvil |
| **Término normalizado** | `trim()` + `toLowerCase()` del término para unicidad |
| **North star** | Métrica principal: racha media |

---

## 19. Aprobaciones

| Rol | Nombre | Fecha | Estado |
|-----|--------|-------|--------|
| Product Owner | Jesús Fredy Vizcarra García | Jun 2026 | ✅ Definido |
| Tech (full-stack) | Jesús Fredy Vizcarra García | Jun 2026 | ✅ Alineado con arquitectura |

---

## 20. Changelog del PRD

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0 | Jun 2026 | Versión inicial Master PRD — MVP académico Lexio |
