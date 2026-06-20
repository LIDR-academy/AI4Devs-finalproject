# 5. Historias de Usuario — Lexio

Las tres historias seleccionadas representan el **flujo E2E prioritario** del MVP: captura de vocabulario → práctica diaria → validación y hábito. Son las que mayor valor aportan al usuario y las que deben estar funcionando para considerar el producto demostrable.

> Tickets en Jira: [fredyvizcarrag.atlassian.net/browse/LEX](https://fredyvizcarrag.atlassian.net/browse/LEX)

---

## Historia de Usuario 1 — Captura de vocabulario con IA

**Identificador:** `LEX-7` (US-03)  
**Epic:** Epic 2 — Vocabulary Capture (`LEX-2`)  
**Prioridad:** P0  
**PRD:** RF-W01, RF-W02, RF-W05

### Enunciado

> **Como** estudiante de inglés,  
> **quiero** escribir manualmente una palabra o frase en inglés para que la app genere automáticamente una definición con IA y me sugiera imágenes representativas,  
> **para** guardar esa palabra con contexto visual y significado personalizado en mi diccionario, y poder recordarla realmente en lugar de olvidarla como haría en Google Translate.

### Por qué es la más importante

Es la **puerta de entrada al producto**. Sin captura, no hay vocabulario, sin vocabulario no hay práctica, sin práctica no hay racha. Es el primer valor que percibe el usuario y lo que diferencia a Lexio de un simple traductor: la palabra queda guardada, enriquecida y lista para repasarse.

### Criterios de Aceptación (BDD)

**Escenario 1: Captura exitosa con definición de IA**
```
Dado que estoy en la pantalla "Añadir Palabra"
Cuando escribo "serendipity" en el campo de término y pulso "Generate"
Entonces la app llama al backend (POST /words)
Y veo la definición sugerida por Claude para "serendipity"
Y veo al menos 3 imágenes sugeridas de Unsplash para elegir
```

**Escenario 2: Campo de término vacío bloqueado**
```
Dado que estoy en la pantalla "Añadir Palabra"
Cuando dejo el campo vacío y pulso "Generate"
Entonces veo el mensaje: "Please enter a word or phrase"
Y no se realiza ninguna llamada al backend
```

**Escenario 3: Frases de varias palabras aceptadas**
```
Dado que estoy en la pantalla "Añadir Palabra"
Cuando escribo "hit the nail on the head" y pulso "Generate"
Entonces la frase se trata como una unidad léxica completa
Y se genera una definición e imágenes sugeridas para esa expresión
```

**Escenario 4: Detección de término duplicado**
```
Dado que "serendipity" ya existe en mi diccionario
Cuando intento añadir "Serendipity" (diferente capitalización)
Entonces la app normaliza el término (trim + lowercase)
Y muestra: "You already have a card for 'serendipity'"
Y ofrece un enlace para editar la tarjeta existente
```

**Escenario 5: Error de API durante la generación**
```
Dado que ocurre un error de red al llamar al backend
Cuando pulso "Generate"
Entonces veo: "Something went wrong. Please try again."
Y el término que había escrito se conserva en el campo
```

### Flujo en pantalla

```
[Pantalla Añadir Palabra]
  → Input: término (obligatorio)
  → Selector: idioma de definición (ES / EN)
  → Botón "Generate"
      → Loading state (llamada a Claude + Unsplash)
      → Preview de definición (editable)
      → Grid de imágenes sugeridas (≥3)
  → Usuario edita definición (opcional)
  → Usuario selecciona imagen
  → Botón "Save Card"
      → Tarjeta guardada en Firestore
      → Navegación al Diccionario
```

### Notas técnicas

- `POST /words { term, definitionLanguage }` → devuelve `wordCard` + `suggestedImages[]`
- Normalización: `term.trim().toLowerCase()` antes de comprobar unicidad en Firestore
- Si la IA falla → mostrar error claro; no guardar tarjeta incompleta

---

## Historia de Usuario 2 — Sesión diaria de práctica

**Identificador:** `LEX-12` (US-08)  
**Epic:** Epic 3 — Daily Practice (`LEX-3`)  
**Prioridad:** P0  
**PRD:** RF-P01, RF-P02, RF-P03, RF-P06, RF-P07

### Enunciado

> **Como** estudiante de inglés,  
> **quiero** iniciar una sesión diaria de exactamente 10 ejercicios generados a partir de mi propio vocabulario,  
> **para** practicar las palabras que yo mismo capturé en contextos reales y reforzar su retención de forma activa, no solo consultarlas y olvidarlas.

### Por qué es la más importante

Es el **núcleo de la propuesta de valor de Lexio**. Sin la sesión diaria no hay diferencia con una app de notas. La práctica es lo que convierte el diccionario pasivo en aprendizaje activo. Además, es la acción que dispara la actualización de la racha (la north star metric del producto).

### Criterios de Aceptación (BDD)

**Escenario 1: Sesión creada con vocabulario suficiente**
```
Dado que tengo 6 tarjetas de vocabulario guardadas
Cuando pulso "Practice Today" en la pantalla principal
Entonces el backend llama a POST /sessions/daily
Y recibo una sesión con exactamente 10 ejercicios
Y los ejercicios usan palabras seleccionadas aleatoriamente de mi diccionario
```

**Escenario 2: Práctica bloqueada con 3 o menos palabras**
```
Dado que solo tengo 3 tarjetas de vocabulario
Cuando navego a la pantalla principal
Entonces el botón "Practice Today" está desactivado u oculto
Y veo: "Add at least 1 more word to start practicing"
```

**Escenario 3: Práctica bloqueada con 0 palabras**
```
Dado que no tengo ninguna tarjeta guardada
Cuando navego a la pantalla principal
Entonces veo: "Add your first 4 words to unlock daily practice"
```

**Escenario 4: No se puede iniciar una segunda sesión el mismo día**
```
Dado que ya completé la sesión de hoy
Cuando intento iniciar una nueva sesión
Entonces el backend devuelve 409
Y veo: "You've already completed today's practice. Come back tomorrow!"
```

**Escenario 5: Ejercicios distribuidos aleatoriamente**
```
Dado que tengo más de 10 tarjetas guardadas
Cuando inicio una sesión nueva en dos días diferentes
Entonces el conjunto de 10 palabras es diferente cada vez
```

### Tipos de ejercicio incluidos en la sesión

| Tipo | Descripción | Campo clave |
|------|-------------|-------------|
| `image_match` | Se muestra la imagen de la tarjeta → elegir la palabra correcta entre 4 opciones | `imageUrl` de la WordCard |
| `mcq` | Pregunta de opción múltiple generada por Claude sobre la definición/contexto | `question` + `options[4]` generados por IA |

La sesión mezcla ambos tipos de forma aleatoria en los 10 ejercicios.

### Flujo en pantalla

```
[Home]
  → Racha actual visible
  → Botón "Practice Today" (activo si ≥4 palabras y no completó hoy)
      → [Pantalla de Práctica]
          → Ejercicio 1/10 (image_match o mcq)
          → Respuesta del usuario → feedback (verde/rojo)
          → Progresión automática → Ejercicio 2/10
          → ...
          → Ejercicio 10/10 completado
              → Navegación a pantalla de Resultados
```

### Notas técnicas

- `POST /sessions/daily { sessionDate, timezone }` → devuelve `DailySession` con `exercises[10]`
- Bloqueo: si `count(wordCards donde userId = X) <= 3` → responder `403` con `INSUFFICIENT_VOCABULARY`
- Unicidad: si ya existe `dailySessions` con `(userId, sessionDate)` → responder `409`
- Selección aleatoria: obtener IDs del usuario y muestrear 10 en el backend (Firestore no soporta `ORDER BY RANDOM()` nativo)

---

## Historia de Usuario 3 — Resultados de sesión y actualización de racha

**Identificador:** `LEX-15` (US-11)  
**Epic:** Epic 3 — Daily Practice (`LEX-3`) / Epic 4 — Habit & Progress (`LEX-4`)  
**Prioridad:** P1  
**PRD:** RF-P08, RF-S01, RF-S02, RF-S03, RF-S04

### Enunciado

> **Como** estudiante de inglés,  
> **quiero** ver una pantalla de resumen al terminar mis 10 ejercicios con mis aciertos y mi racha actualizada,  
> **para** sentir recompensa por el esfuerzo diario, conocer mi progreso real y mantener el hábito de estudio gracias a la visibilidad de mi racha.

### Por qué es la más importante

Es el **cierre del bucle de hábito**: captura → práctica → recompensa. Sin este paso, el usuario completa ejercicios pero no recibe retroalimentación ni actualización de racha. Es el momento de mayor satisfacción en la sesión y el que conecta con la north star metric (racha media). También garantiza que la sesión se marca como completada y previene repeticiones el mismo día.

### Criterios de Aceptación (BDD)

**Escenario 1: Pantalla de resultados tras el ejercicio 10**
```
Dado que he respondido los 10 ejercicios de la sesión
Cuando se completa el último ejercicio
Entonces se me muestra la pantalla de resumen de sesión
Y veo mi puntuación (ej. "8/10 correct")
Y veo mi racha actualizada
```

**Escenario 2: Racha incrementada en el primer día**
```
Dado que es el primer día que completo una sesión (racha = 0)
Cuando termino los 10 ejercicios
Entonces mi racha pasa a 1
Y el resumen muestra "🔥 Streak: 1 day"
```

**Escenario 3: Racha incrementada en día consecutivo**
```
Dado que completé una sesión ayer (racha = 5)
Cuando termino la sesión de hoy
Entonces mi racha pasa a 6
Y el resumen muestra la racha actualizada
```

**Escenario 4: Sesión marcada como completada — no hay segundo intento hoy**
```
Dado que he visto la pantalla de resultados
Cuando regreso a la pantalla principal
Entonces el botón muestra "Completed ✓"
Y no puedo iniciar otra sesión hasta el día siguiente
```

**Escenario 5: Racha reiniciada tras día sin sesión**
```
Dado que mi racha era 7 ayer
Y no completé ninguna sesión ayer
Cuando abro la app hoy
Entonces veo racha = 0
Y al completar la sesión de hoy, la racha pasa a 1
```

### Reglas de negocio de la racha

| Situación | Resultado |
|-----------|-----------|
| Primera sesión completada (streak = 0) | `currentStreak = 1` |
| Sesión completada al día siguiente consecutivo | `currentStreak += 1` |
| Sesión completada tras saltarse ≥1 día | `currentStreak = 1` (reinicio) |
| Intentar completar segunda sesión el mismo día | `409 SESSION_ALREADY_COMPLETED` |

### Flujo en pantalla

```
[Ejercicio 10/10 completado]
    ↓
[Pantalla de Resultados]
  → Puntuación: "8 / 10 correct"
  → Racha actualizada: "🔥 Streak: 6 days"
  → CTA "Go to Dictionary" o "Back to Home"

[Home — después del resultado]
  → Racha visible y actualizada
  → Botón "Completed ✓" (desactivado hasta mañana)
```

### Notas técnicas

- `POST /sessions/:id/complete { answers[10] }` → evalúa respuestas, actualiza `DailySession.completed = true` y llama a `StreakService`
- `StreakService`: compara `lastCompletedDate` con ayer (timezone del dispositivo/servidor); si es consecutivo suma 1, si no reinicia a 1
- La respuesta incluye `{ session: { correctAnswers, completed }, streak: { currentStreak } }`
- El `longestStreak` se actualiza si `currentStreak > longestStreak`

---

## Resumen de las tres historias

| Historia | Ticket | Epic | Por qué es clave |
|----------|--------|------|------------------|
| Captura de vocabulario con IA | LEX-7 | Vocabulary Capture | Puerta de entrada; sin ella no hay producto |
| Sesión diaria de práctica | LEX-12 | Daily Practice | Núcleo del valor diferencial; activa la retención activa |
| Resultados y racha | LEX-15 | Daily Practice / Habit | Cierra el bucle de hábito; dispara la north star metric |

Estas tres historias cubren el **flujo E2E prioritario completo**:

```
Captura (LEX-7) → Práctica (LEX-12) → Resultado + Racha (LEX-15)
```

Todas las demás historias del MVP (auth, imágenes, MCQ, diccionario, marcar aprendida) dan soporte o enriquecen este flujo central.
