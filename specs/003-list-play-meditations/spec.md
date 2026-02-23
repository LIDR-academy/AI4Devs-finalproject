# US4 — Ver estado y reproducir meditaciones generadas

**Objetivo del Feature**  
El usuario puede consultar el listado de sus meditaciones generadas, ver su estado de procesamiento y reproducir aquellas que ya estén completadas.

**User Story**  
Como usuario autenticado, quiero ver el listado de mis meditaciones con su estado y reproducir las que ya están completadas, para poder hacer seguimiento y consumir el contenido generado.

> **Regla:** La User Story debe describir un único comportamiento observable (no un flujo completo ni múltiples funcionalidades).

---

**Descripción (negocio)**  
El usuario ve una lista de todas las meditaciones que ha creado. Para cada una, puede saber si ya está lista para disfrutar o si aún se está preparando, gracias a una etiqueta de estado visible. Cuando una meditación muestra el estado "Completada", puede reproducirla inmediatamente.

**Reglas**
- Solo se muestran las meditaciones que pertenecen exclusivamente al usuario que ha iniciado sesión.
- Se permite la reproducción únicamente de las meditaciones cuyo estado sea "Completada".
- El listado debe reflejar el estado más reciente de cada proceso de generación.

---

**Criterios de aceptación (BDD, lenguaje de negocio)**
```gherkin
textFeature: Listado y reproducción de meditaciones

  Scenario: Listar las meditaciones del usuario con su estado
    Given el usuario está autenticado
    When solicita ver el listado de sus meditaciones
    Then ve todas sus meditaciones
    And para cada una ve su estado actual

  Scenario: Reproducir una meditación completada
    Given el usuario está autenticado
    And existe una meditación con estado "Completada" en su lista
    When selecciona reproducir esa meditación
    Then comienza la reproducción del contenido
```

**Reglas de redacción Gherkin**
- Los pasos **Given/When/Then** se redactan desde la **perspectiva del usuario**, nunca del sistema.  
  - ❌ Incorrecto: "Then el sistema crea un registro"  
  - ✅ Correcto: "Then ve todas sus meditaciones"
- Mantener lenguaje natural y del dominio (sin términos técnicos).
- Usar **un único bloque `textFeature:`** por especificación.

---

**Reglas de negocio (inmutables)**
- Una meditación debe tener siempre un estado visible para el usuario: "En cola", "Generando", "Completada" o "Fallida".
- El sistema garantiza que un usuario solo pueda ver y reproducir su propio contenido.
- Solo las meditaciones en estado "Completada" pueden reproducirse.

---

**Notas de negocio (no técnicas)**
- **Supuestos del negocio:**  
  - La identidad del usuario está verificada antes de acceder al listado.
  - El contenido multimedia está disponible para reproducción una vez que la generación finaliza exitosamente.
- **Mensajes visibles para el usuario:**  
  - Estados: "En cola", "Generando", "Completada", "Fallida".
  - Mensaje para lista vacía: "Aún no tienes meditaciones. Empieza creando una nueva."
  - Mensaje cuando intenta reproducir una meditación no completada: "Esta meditación aún se está procesando. Por favor, espera a que esté lista."
- **Comportamientos en casos vacíos o especiales:**  
  - Si el usuario no tiene ninguna meditación, se muestra un mensaje de bienvenida en lugar de una lista vacía.
  - Si una meditación está en estado "Fallida", se muestra un mensaje informativo sobre el error.
- **Restricciones de negocio visibles:**  
  - No se permite la reproducción si el estado es distinto de "Completada".
  - No hay límite en el número de meditaciones que pueden aparecer en el listado (sin paginación en esta versión).

---

**Fuera de alcance (Out of Scope)**
- Paginación o carga infinita de la lista.
- Filtros por título, fecha o estado.
- Búsqueda de meditaciones.
- Opción de borrar o editar meditaciones desde el listado.
- Descarga de archivos de meditación.

---

**Metadatos del Feature**
- **Feature Branch:** 003-list-play-meditations
- **Created:** 2026-02-16
- **Status:** Draft
- **Bounded Context:** Playback
- **Business Trigger:** El usuario abre su biblioteca de meditaciones
- **Input (opcional):** User description: "US4 — Listar y reproducir meditaciones generadas"
