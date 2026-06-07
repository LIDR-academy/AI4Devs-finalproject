# TSK-2.3: Barra de Estado de Cuadre y Alertas de Platos Huérfanos

- **Historia de Usuario Relacionada:** [US-06: Alertas de Platos Huérfanos y Descuadres](US-06.md)
- **Épica:** Epic 2: Advanced Reparto, Rounding & Gamification Flow
- **Capa:** Frontend (UI Component)
- **Complejidad:** 2 SP
- **Dependencias:** TSK-1.6, TSK-2.1

## 1. Descripción de la Tarea
Crear el componente visual superior que audite constantemente la cuenta y avise si quedan platos sin dueño, o si la suma de los desgloses no cuadra con el total real del ticket. Bloqueará el avance a la vista de dictado si hay incoherencias críticas.

## 2. Detalles de Implementación
1. **Componente Indicador:**
   * Crear `src/components/split/SplitStatusBar.tsx`.
   * Debe recibir por props: el total del ticket original, la suma de las partes asignadas y el número de ítems con cantidad remanente > 0 sin asignar.
2. **Estados Visuales:**
   * **Verde (Cuadrado):** Si items no asignados = 0 y diferencia = 0. Texto: *"¡Todo asignado y cuadrado!"*.
   * **Amarillo (Pendiente):** Si quedan items sin asignar pero la suma coincide con los asignados parcialmente. Texto: *"Quedan X platos por repartir"*.
   * **Rojo (Incoherencia):** Si la diferencia es distinta de 0. Mostrar botón de "Auto-Ajustar céntimos" que asigne la diferencia flotante al comensal con mayor consumo actual.

## 3. Criterios de Aceptación y Pruebas (DoD)
* Fichero de test `src/components/split/SplitStatusBar.test.tsx` que valide:
  * El botón de avanzar al pago se deshabilita si el estado es Rojo o si hay platos huérfanos.
  * El componente emite un evento de accesibilidad `aria-live="polite"` cuando cambia el estado para que sea locutado por el lector de pantalla.
