# TSK-1.8: Mesa de Asignación Interactiva y Asignador Unitario (Split Board View)

- **Historia de Usuario Relacionada:** [US-03: Asignación Unitaria Visual](US-03.md)
- **Épica:** Epic 1: Core Digitalization & Basic Assignment Flow
- **Capa:** Frontend (UI View)
- **Complejidad:** 5 SP
- **Dependencias:** TSK-1.1, TSK-1.6

## 1. Descripción de la Tarea
Implementar el tablero principal interactivo de asignación de platos. A la izquierda se mostrará la lista de platos pendientes de asignar (con cantidades), y a la derecha los avatares circulares de los participantes. El usuario podrá asignar platos mediante arrastre (drag-and-drop) o mediante un popup de selección simple al tocar el plato.

## 2. Detalles de Implementación
1. **Componente Tablero:**
   * Crear `src/views/SplitBoardView.tsx`.
   * Diseñar layout adaptativo móvil (en vertical: lista de platos arriba, carrusel horizontal de participantes abajo; en tablets/pantallas anchas: dos columnas).
2. **Mecánica de Asignación Drag-and-Drop:**
   * Utilizar API Touch nativa de HTML5 o una librería optimizada y ligera de drag-and-drop compatible con móviles (ej. `react-sortable-js` o implementación nativa con gestos CSS para evitar dependencias innecesarias y vulnerabilidades).
   * Al arrastrar un plato sobre el avatar de un participante, invocar `allocateItemToParticipant` de `useTicketState`.
3. **Mecánica Fallback por Clic (Accesibilidad):**
   * Al hacer clic en un plato, abrir un modal inferior (Bottom Sheet) con los nombres de los participantes y botones grandes de selección rápida para asignar.

## 3. Criterios de Aceptación y Pruebas (DoD)
* Fichero de test `src/views/SplitBoardView.test.tsx`:
  * Verificar que al arrastrar y soltar un plato sobre un participante, el total individual de este comensal se incrementa de forma correspondiente.
  * Probar que el modal de asignación por clic es accesible por teclado (se puede seleccionar un participante usando las flechas y pulsar Enter).
  * El rendimiento en dispositivos móviles debe mantenerse a 60 FPS durante la animación de arrastre (evitar renders innecesarios en la lista de ítems).
