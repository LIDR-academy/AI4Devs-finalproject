# TSK-2.6: Vista de Dictado al Camarero

- **Historia de Usuario Relacionada:** [US-09: Pantalla de Dictado al Camarero e Historial de Sesión Local](US-09.md)
- **Épica:** Epic 2: Advanced Reparto, Rounding & Gamification Flow
- **Capa:** Frontend (UI View)
- **Complejidad:** 2 SP
- **Dependencias:** TSK-1.1, TSK-1.6

## 1. Descripción de la Tarea
Crear una pantalla limpia y con diseño de alta accesibilidad (modo de alto contraste para exteriores) que liste los totales consolidados a cobrar a cada persona o familia, facilitando dictarle las cantidades una a una al camarero.

## 2. Detalles de Implementación
1. **Diseño Adaptivo para Mesa:**
   * Crear `src/views/WaiterDictationView.tsx`.
   * Mostrar tarjetas verticales de gran tamaño. Cada tarjeta contendrá:
     * Nombre del comensal / Subgrupo Familiar.
     * Importe final a pagar en tamaño de fuente grande (e.g. `2.5rem`), incluyendo el redondeo si lo tuviera.
     * Checkbox táctil gigante para marcar como "Pagado". Al marcarlo, la tarjeta se atenúa al 50% de opacidad para no confundirse.
2. **Totales del Restaurante:**
   * Mostrar el total neto del ticket original a cobrar y el total acumulado cobrado hasta el momento para control del organizador.

## 3. Criterios de Aceptación y Pruebas (DoD)
* Validar por test unitario y manual que el contraste cumple con WCAG AAA en exteriores (contraste superior a 7:1 en textos principales de pago).
* Los botones táctiles de "Marcar Pagado" responden en menos de 50ms (sin retardo de clic móvil de 300ms de navegadores antiguos).
