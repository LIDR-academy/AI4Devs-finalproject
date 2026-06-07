# TSK-2.4: Módulo de Redondeo Individual y Propina Común

- **Historia de Usuario Relacionada:** [US-07: Redondeo Visual e Individual y Propina Común](US-07.md)
- **Épica:** Epic 2: Advanced Reparto, Rounding & Gamification Flow
- **Capa:** Frontend (State & UI)
- **Complejidad:** 2 SP
- **Dependencias:** TSK-1.6

## 1. Descripción de la Tarea
Implementar la posibilidad de redondear la cuenta de un comensal individual al euro más cercano (e.g., de 14.30€ a 15.00€) a petición suya, acumulando el remanente (0.70€) en una bolsa común de propina para el restaurante.

## 2. Detalles de Implementación
1. **Actualización de Schema y Estado:**
   * Crear la propiedad `isRounded: boolean` para los participantes en la base de datos local IndexedDB.
   * Modificar `useTicketState` para incluir una función `toggleParticipantRounding(id: string): Promise<void>`.
2. **Cálculo de Totales con Redondeo:**
   * El total final a pagar por cada comensal se calcula como `Math.ceil(baseAmount)` si la opción `isRounded` está activa.
   * La propina acumulada de la mesa se calcula sumando la diferencia de todos los participantes con redondeo activado: `totalTips = sum(Math.ceil(base) - base)`.

## 3. Criterios de Aceptación y Pruebas (DoD)
* Fichero de test `src/hooks/useTicketState.test.ts`:
  * Validar que si 3 participantes consumen 12.33€ cada uno y todos activan redondeo, el total a pagar individual sube a 13.00€ cada uno, y la propina acumulada total se calcula correctamente en 2.01€.
  * El desglose visual en la pantalla de resumen detalla qué porción del pago corresponde al consumo real y cuál a propina.
