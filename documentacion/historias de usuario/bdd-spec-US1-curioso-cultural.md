# Especificación BDD — US-1: El Curioso Cultural

**User Story**: US-1 — Descubrimiento por Tiempo y Mood + Watchlist
**Persona**: El Curioso Cultural
**Generado**: 2026-03-11

---

```gherkin
Feature: Filtrado de obras por Dial de Tiempo y Mood
  Como Curioso Cultural
  Quiero filtrar contenido por duración y estado de ánimo
  Para descubrir obras de calidad que se ajusten a mi tiempo disponible

  Background:
    Given que el catálogo contiene obras con distintas duraciones y moods
    And las obras tienen su ESTADO_ACCESO asignado (Abierto, Suscripción, VOD)

  # ─────────────────────────────────────────────
  # Escenario 1: Filtro combinado exitoso
  # ─────────────────────────────────────────────
  Scenario: Filtrar obras por duración máxima y mood
    Given que estoy en la página principal de arteflujo
    When ajusto el Dial de Tiempo a "15 minutos"
    And selecciono el mood "Melancólico"
    Then el sistema muestra solo obras con duracion_min <= 15 y vibe_mood = "Melancólico"
    And cada resultado muestra el indicador de acceso (🟢, 🟡 o 🔵)
    And el contenido gratuito (🟢) aparece primero en la lista
    And la URL refleja los parámetros "?duracion_max=15&mood=Melancolico"

  # ─────────────────────────────────────────────
  # Escenario 2: Sin resultados con los filtros aplicados
  # ─────────────────────────────────────────────
  Scenario: No hay obras para los filtros seleccionados
    Given que estoy en la página principal de arteflujo
    When ajusto el Dial de Tiempo a "5 minutos"
    And selecciono el mood "Épico"
    And no existen obras en el catálogo con esos parámetros
    Then la galería de resultados está vacía
    And el sistema muestra el mensaje "No encontramos obras con esos filtros"
    And se muestra un botón "Ampliar búsqueda" que limpia los filtros

  # ─────────────────────────────────────────────
  # Escenario 3: Botón Sorpréndeme
  # ─────────────────────────────────────────────
  Scenario: Descubrir obra aleatoria con los filtros activos
    Given que estoy en la página principal con filtro de 30 minutos y mood "Inspirador"
    And el sistema ha retornado 8 obras para esos filtros
    When hago clic en el botón "Sorpréndeme"
    Then el sistema selecciona una obra aleatoria del conjunto de 8 resultados
    And la presenta en pantalla como obra destacada
    And cada clic subsiguiente puede mostrar una obra diferente del mismo conjunto

  # ─────────────────────────────────────────────
  # Escenario 4: Guardar obra en Watchlist (usuario autenticado)
  # ─────────────────────────────────────────────
  Scenario: Usuario autenticado guarda una obra en su Watchlist
    Given que estoy autenticado con un token JWT válido
    And veo los resultados filtrados en la página principal
    When hago clic en el ícono "Guardar" de una obra
    Then el ícono cambia visualmente a "Guardado" de forma inmediata (optimistic update)
    And el sistema envía POST /watchlist con el id_obra al backend
    And la obra aparece en mi Watchlist personal

  # ─────────────────────────────────────────────
  # Escenario 5: Guardar obra sin autenticación
  # ─────────────────────────────────────────────
  Scenario: Usuario no autenticado intenta guardar una obra
    Given que NO estoy autenticado en arteflujo
    And veo los resultados filtrados en la página principal
    When hago clic en el ícono "Guardar" de una obra
    Then el sistema muestra un modal de login sin abandonar la página
    And no se realiza ninguna llamada a POST /watchlist

  # ─────────────────────────────────────────────
  # Escenario 6: Guardar obra duplicada (idempotencia)
  # ─────────────────────────────────────────────
  Scenario: Usuario guarda una obra que ya está en su Watchlist
    Given que estoy autenticado
    And la obra con id_obra=42 ya está en mi Watchlist
    When hago clic en el ícono "Guardar" de esa misma obra
    Then el sistema no crea un registro duplicado en LISTA_DESEOS
    And el ícono permanece en estado "Guardado"
    And no se muestra ningún error al usuario

  # ─────────────────────────────────────────────
  # Escenario 7: Fallo de red al guardar en Watchlist
  # ─────────────────────────────────────────────
  Scenario: El backend falla al guardar en la Watchlist
    Given que estoy autenticado
    When hago clic en "Guardar" y el servidor retorna un error 500
    Then el ícono revierte al estado "No guardado"
    And se muestra un mensaje toast "No pudimos guardar. Inténtalo de nuevo."
    And no se pierde ningún dato del usuario
```
