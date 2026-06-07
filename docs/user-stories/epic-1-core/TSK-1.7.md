# TSK-1.7: Pantalla de Edición y Corrección Manual de Tickets (Ticket Editor View)

- **Historia de Usuario Relacionada:** [US-02: Edición Manual y OCR Fallback](US-02.md)
- **Épica:** Epic 1: Core Digitalization & Basic Assignment Flow
- **Capa:** Frontend (UI View)
- **Complejidad:** 3 SP
- **Dependencias:** TSK-1.1, TSK-1.6

## 1. Descripción de la Tarea
Crear la vista de formulario para corregir los posibles errores de lectura del OCR. Permite añadir, editar el precio, cantidad o nombre, y eliminar líneas de productos del ticket de manera fluida y adaptada a móviles.

## 2. Detalles de Implementación
1. **Diseño Visual de Tabla Editable:**
   * Crear `src/views/TicketEditorView.tsx`.
   * Estructurar como lista vertical dinámica. Cada fila contiene:
     * Input numérico para cantidad (cantidad mínima = 0.01 para permitir porciones).
     * Input de texto para nombre del plato (con autocompletado si ya existe en catálogo local).
     * Input numérico para precio unitario (con formato de moneda y límites no negativos).
     * Botón de eliminación en rojo con icono de basura.
2. **Cálculo de Totales Locales:**
   * Mostrar en el pie de página el total acumulado recalculándose en tiempo real a medida que el usuario edita valores.
   * Botón de confirmación destacado ("Ir al Reparto") que solo se habilita si el total es superior a 0€ y no hay errores de validación.

## 3. Criterios de Aceptación y Pruebas (DoD)
* Fichero de test `src/views/TicketEditorView.test.tsx`:
  * Modificar el precio de una hamburguesa de 12.00 a 10.00 actualiza el total final en pantalla.
  * Intentar ingresar un precio negativo muestra un mensaje de validación de campo ("El precio no puede ser negativo") y bloquea la navegación.
  * La tecla `Tab` navega de forma lógica horizontal entre los campos de una misma fila y baja a la siguiente de manera natural.
