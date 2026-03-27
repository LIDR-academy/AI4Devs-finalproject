# Especificación BDD — US-3: El Cinéfilo

**User Story**: US-3 — Búsqueda por Festival/Hito + Acceso Transparente
**Persona**: El Cinéfilo (Cinephile)
**Generado**: 2026-03-11

---

```gherkin
Feature: Búsqueda de cine de festivales con acceso transparente en The Cinema
  Como Cinéfilo
  Quiero buscar películas reconocidas por festivales y ver claramente cómo acceder a ellas
  Para decidir qué ver sin contratiempos de acceso

  Background:
    Given que el catálogo contiene obras del eje EJE_VERTICAL = "Cinema"
    And las obras tienen Hitos de festivales (Oscar, Cannes, Berlinale, etc.)
    And cada obra tiene un ESTADO_ACCESO y una PLATAFORMA_ORIGEN definidos

  # ─────────────────────────────────────────────
  # Escenario 1: Búsqueda por nombre de festival
  # ─────────────────────────────────────────────
  Scenario: Buscar películas por nombre de festival
    Given que estoy en la página "/cinema"
    When escribo "Oscar" en el campo de búsqueda
    Then el sistema retorna todas las películas que tienen un HITO cuyo nombre contiene "Oscar"
    And cada resultado muestra su ESTADO_ACCESO con el icono de color correspondiente (🟢🟡🔵)
    And el logo de la plataforma origen es visible en cada tarjeta
    And la URL refleja "?hito=Oscar"

  # ─────────────────────────────────────────────
  # Escenario 2: Búsqueda insensible a mayúsculas
  # ─────────────────────────────────────────────
  Scenario: La búsqueda por Hito es insensible a mayúsculas
    Given que estoy en la página "/cinema"
    When escribo "cannes" en minúsculas en el campo de búsqueda
    Then el sistema retorna las mismas obras que si hubiera escrito "Cannes" o "CANNES"

  # ─────────────────────────────────────────────
  # Escenario 3: Clic en chips de búsquedas sugeridas
  # ─────────────────────────────────────────────
  Scenario: Usar chip de búsqueda sugerida
    Given que estoy en la página "/cinema" sin ningún filtro activo
    When hago clic en el chip sugerido "Berlinale"
    Then el campo de búsqueda se rellena con "Berlinale"
    And el sistema muestra las películas con Hitos de Berlinale
    And la URL refleja "?hito=Berlinale"

  # ─────────────────────────────────────────────
  # Escenario 4: Sin resultados para el criterio buscado
  # ─────────────────────────────────────────────
  Scenario: Búsqueda sin resultados
    Given que estoy en la página "/cinema"
    When escribo "FestivalDesconocido" en el campo de búsqueda
    And no existen obras con ese Hito en el catálogo
    Then la galería está vacía
    And el sistema muestra "No encontramos películas con ese criterio"
    And sugiere alternativas: "Prueba con 'Cannes' o 'Berlinale'"

  # ─────────────────────────────────────────────
  # Escenario 5: Ver ficha técnica completa de una película
  # ─────────────────────────────────────────────
  Scenario: Ver ficha técnica completa de una película
    Given que veo los resultados en The Cinema
    When hago clic en la card de la película "Película XYZ"
    Then navego a la página "/obra/[id]"
    And la página muestra la ficha técnica completa:
      | Campo           | Ejemplo                              |
      | Título          | Película XYZ                         |
      | Director        | Jean-Luc Godard                      |
      | Región          | Francia                              |
      | Duración        | 97 minutos                           |
      | Valor cultural  | Obra maestra del cine de la Nouvelle Vague (máx. 280 caracteres) |
    And se muestran todos los Hitos con su año: "🏆 Palme d'Or Cannes 1963"
    And el ESTADO_ACCESO es visible con texto: "Disponible en MUBI (Suscripción 🟡)"

  # ─────────────────────────────────────────────
  # Escenario 6: Acceso vía Deep Linking con afiliación
  # ─────────────────────────────────────────────
  Scenario: Redirigir a MUBI con parámetros de afiliación
    Given que estoy en la ficha técnica de una película con ESTADO_ACCESO = "Suscripción"
    And la plataforma origen es MUBI con permite_iframe = false
    When hago clic en el botón "Ver en MUBI"
    Then el frontend llama a GET /obras/:id/play-url en el backend
    And el backend retorna la URL de MUBI con el parámetro de afiliación: "?ref=arteflujo&aff=ARF123"
    And el navegador abre esa URL en una nueva pestaña
    And los parámetros de afiliación NO fueron generados en el frontend

  # ─────────────────────────────────────────────
  # Escenario 7: Plataforma externa caída — Circuit Breaker activo
  # ─────────────────────────────────────────────
  Scenario: El contenido no está disponible por fallo de plataforma externa
    Given que la plataforma MUBI ha fallado 3 veces consecutivas
    And el Circuit Breaker está en estado "abierto" para MUBI
    When veo la card de una película alojada en MUBI
    Then la card muestra un badge "No disponible temporalmente"
    And el botón de acceso está deshabilitado
    When intento hacer clic en el botón deshabilitado
    Then no se realiza ninguna llamada a GET /obras/:id/play-url
    And no se muestra ningún error técnico ni stacktrace

  # ─────────────────────────────────────────────
  # Escenario 8: Circuit Breaker se recupera solo
  # ─────────────────────────────────────────────
  Scenario: La plataforma externa se recupera y el contenido vuelve a estar disponible
    Given que el Circuit Breaker estuvo abierto 30 minutos para MUBI
    When han pasado los 30 minutos y MUBI responde correctamente
    Then el estado del circuit breaker cambia a "cerrado"
    And las obras de MUBI vuelven a mostrar el botón de acceso activo
    And el badge "No disponible" desaparece de las cards afectadas
```
