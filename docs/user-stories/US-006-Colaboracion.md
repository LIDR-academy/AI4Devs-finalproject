# US-006: Colaboración Contextual (Pines y Comentarios)

**Como** Usuario (Cliente o Arquitecto)  
**Quiero** colocar un pin en un punto específico del plano y escribir un comentario  
**Para** indicar una corrección o duda exacta en ese lugar.

## Detalles
- **Titulo breve:** Pines y Comentarios
- **Prioridad:** Alta (P1)
- **Estimación:** 8 Puntos
- **Dependencias:** US-004
- **Orden de ejecución:** 6
- **Estado:** Pending

## Diseño de Pantallas y UI

### 1. Marcador de Pin (Pin Marker)
- **Visual:** Icono circular (ej. Gota invertida o punto coloreado).
- **Estados:**
  - *Activo/Seleccionado:* Color resaltado (Amarillo/Negro), quizás más grande o con halo.
  - *No leído:* Color llamativo (Rojo/Naranja).
  - *Resuelto:* Color grisáceo o transparente, iconografía de "Check".
- **Tooltips:** Al pasar el mouse, mostrar preview del primer mensaje.

### 2. Panel Lateral de Comentarios (Thread Drawer)
- **Ubicación:** Se desliza desde la derecha al hacer clic en un Pin.
- **Header:** "Comentario #3" y botón cerrar (X).
- **Lista de Mensajes:** Burbujas tipo chat (Izquierda/Derecha o lista plana).
- **Input Area:** Caja de texto + botón enviar + botón adjuntar imagen.
- **Acciones Admin:** Botón/Check "Marcar como Resuelto".

## Criterios de Aceptación (Gherkin)

### Escenario 1: Crear un Pin
**Dado** que estoy viendo un plano
**Cuando** hago clic en una zona (coordenada X,Y)
**Entonces** aparece un marcador visual (Pin) en ese punto
**Y** se abre un panel lateral o modal para escribir texto

### Escenario 2: Hilo de discusión
**Dado** un pin existente con comentarios previos
**Cuando** hago clic en el pin
**Entonces** se despliega el historial de la conversación ordenado cronológicamente
**Y** puedo añadir una respuesta nueva

### Escenario 3: Resolver comentario (Solo Arquitecto)
**Dado** un comentario pendiente que ya ha sido atendido en el diseño
**Cuando** el Arquitecto marca el hilo como "Resuelto"
**Entonces** el pin cambia de estado visualmente (se atenúa o cambia de color)
**Y** se considera cerrado

## Tickets de Trabajo

### [DB-005] Esquema Base de Datos: Colaboración
- **Tipo:** Database
- **Propósito:** Persistencia de elementos interactivos (Pines y Comentarios).
- **Especificaciones Técnicas:**
  - Modelo `Pin`: `id`, `plan_id` (FK), `x_coord`, `y_coord`, `status` (OPEN/RESOLVED).
  - Modelo `Comment`: `id`, `pin_id` (FK), `author_id` (FK), `content`, `created_at`.
- **Criterios de Aceptación:**
  - Estructura soporta coordinadas (float/decimal).
  - Relación 1:N entre Pin y Comment.
- **Equipo Asignado:** Backend/DBA
- **Esfuerzo:** 3 pts

### [BACK-005] API Endpoints: Pines y Comentarios
- **Tipo:** Backend Feature
- **Propósito:** Persistencia de coordenadas y mensajes.
- **Especificaciones Técnicas:**
  - `POST /layers/:id/pins`: { x, y, content }.
  - `POST /pins/:id/comments`: { content }.
  - Schema `Pin` (layer_id, x, y, status) y `Comment` (pin_id, content, user_id).
- **Criterios de Aceptación:**
  - Pines se guardan ligados a un plano (Layer).
  - Comentarios anidados al pin.
- **Equipo Asignado:** Backend
- **Esfuerzo:** 5 pts

### [FRONT-006] UI Pines y Drawer de Comentarios
- **Tipo:** Frontend Feature
- **Propósito:** Interacción visual para comentar.
- **Especificaciones Técnicas:**
  - Capturar evento click en `PlanViewer` -> Obtener % X/Y relativo.
  - Renderizar lista de `PinComponents` absolutos sobre el plano.
  - `CommentsDrawer.vue`: Lista de chat.
- **Criterios de Aceptación:**
  - Pin aparece donde se hizo click (responsive).
  - Al hacer click en pin se abre el cajón.
- **Equipo Asignado:** Frontend
- **Esfuerzo:** 8 pts

