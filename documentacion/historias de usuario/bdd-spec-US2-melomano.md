# Especificación BDD — US-2: El Melómano

**User Story**: US-2 — Exploración de Fragmentos Musicales + Reproducción
**Persona**: El Melómano y Amante del Arte
**Generado**: 2026-03-11

---

```gherkin
Feature: Exploración y reproducción de contenido musical curado en The Stage
  Como Melómano
  Quiero explorar fragmentos musicales por género y tipo de presentación
  Para encontrar la pieza de oro de un concierto sin verlo completo

  Background:
    Given que el catálogo contiene obras del eje EJE_VERTICAL = "Stage"
    And las obras tienen géneros musicales y tipo_contenido definidos
    And algunas obras tienen permite_iframe = true y otras permite_iframe = false

  # ─────────────────────────────────────────────
  # Escenario 1: Filtro por tipo fragmento y género
  # ─────────────────────────────────────────────
  Scenario: Filtrar solo fragmentos de Jazz en The Stage
    Given que estoy en la página "/stage"
    When selecciono el toggle "Solo Fragmentos"
    And selecciono el género "Jazz"
    Then el sistema muestra únicamente obras con tipo_contenido = "fragmento" y genero_musical = "Jazz"
    And cada resultado muestra el logo de la plataforma origen (YouTube, Vimeo, etc.)
    And la URL refleja "?tipo=fragmento&genero=Jazz"

  # ─────────────────────────────────────────────
  # Escenario 2: Ver todos (sin filtro de tipo)
  # ─────────────────────────────────────────────
  Scenario: Ver todo el catálogo de conciertos sin filtro de tipo
    Given que estoy en la página "/stage"
    When selecciono el toggle "Todos"
    Then el sistema muestra fragmentos y conciertos completos mezclados
    And el resultado incluye obras de todos los géneros disponibles

  # ─────────────────────────────────────────────
  # Escenario 3: Smart Embedding para plataformas compatibles
  # ─────────────────────────────────────────────
  Scenario: Reproducir un fragmento de YouTube mediante Smart Embedding
    Given que estoy en la página "/stage" con resultados visibles
    And la obra seleccionada tiene permite_iframe = true
    When hago clic en el botón "Reproducir" de esa obra
    Then se abre un modal con el video embebido (iframe)
    And el video proviene de la URL de embed de YouTube o Vimeo
    And puedo cerrar el modal con el botón X o presionando ESC
    And al cerrar el modal, la música deja de reproducirse

  # ─────────────────────────────────────────────
  # Escenario 4: Fallo de carga del iframe → fallback a Deep Linking
  # ─────────────────────────────────────────────
  Scenario: El iframe no puede cargarse y el sistema ofrece alternativa
    Given que la obra tiene permite_iframe = true
    When hago clic en "Reproducir" y el iframe genera un error de carga
    Then el modal muestra el mensaje "No pudimos cargar el video aquí"
    And aparece el botón "Ver en [plataforma]" como alternativa de Deep Linking
    And no se muestra ningún stacktrace ni error técnico al usuario

  # ─────────────────────────────────────────────
  # Escenario 5: Deep Linking para plataformas cerradas
  # ─────────────────────────────────────────────
  Scenario: Acceder a un concierto en plataforma cerrada mediante Deep Linking
    Given que la obra tiene permite_iframe = false
    When veo la card de esa obra en los resultados de The Stage
    Then en lugar del botón "Reproducir" se muestra "Ver en [nombre_plataforma]"
    And el logo de la plataforma es visible en el botón
    When hago clic en ese botón
    Then se abre una nueva pestaña con la URL de la plataforma externa
    And la URL incluye los parámetros de afiliación inyectados por el backend
    And la pestaña tiene rel="noopener noreferrer" por seguridad

  # ─────────────────────────────────────────────
  # Escenario 6: Sello de calidad (Hito) visible en la tarjeta
  # ─────────────────────────────────────────────
  Scenario: Obra con Hito muestra sello de calidad prominente
    Given que la obra "Concierto Sinfónico XYZ" tiene el Hito "Ganador Grammy 2023"
    When esa obra aparece en la galería de resultados de The Stage
    Then la card muestra el badge "🏆 Ganador Grammy 2023" de forma destacada
    And el badge tiene un estilo visual dorado/premium

  # ─────────────────────────────────────────────
  # Escenario 7: Obra con múltiples Hitos
  # ─────────────────────────────────────────────
  Scenario: Obra con varios Hitos muestra el primero y un contador
    Given que la obra tiene 3 Hitos registrados
    When esa obra aparece en la galería
    Then la card muestra el primer Hito como badge principal
    And muestra "+2 más" como indicador de los otros Hitos
    When el usuario hace hover sobre "+2 más"
    Then aparece un tooltip con los otros 2 Hitos listados
```
