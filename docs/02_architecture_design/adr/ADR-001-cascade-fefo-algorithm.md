# ADR-001: Algoritmo de Descuento en Cascada FEFO y Prevención de Deadlocks

- **ID:** ADR-001
- **Título:** Algoritmo de Descuento en Cascada FEFO y Prevención de Deadlocks
- **Estado:** Approved
- **Fecha:** 2026-08-05
- **Autor:** Antigravity (AI Pair Programmer)

---

## 1. Contexto (Context)

En el sistema RestoStock, la preparación de platos en la cocina consume ingredientes que están abiertos en forma de `Remanente` activo. Para facilitar el registro de estos consumos, se introduce la funcionalidad de "Descuento por Receta" (`POST /api/kitchen/recipes/:id/consume`), el cual descuenta automáticamente múltiples ingredientes y cantidades según lo especificado en una receta maestra.

Para cumplir con la política de reducción de desperdicio alimentario, el sistema debe debitar existencias aplicando el método **FEFO** (First Expired, First Out), es decir, consumiendo primero de los remanentes cuya fecha de expiración calculada (`calculatedExpirationDate`) sea más próxima.

Esta operación plantea tres desafíos técnicos críticos:
1. **Consistencia y Concurrencia:** Evitar que operaciones concurrentes sobre-consuman un remanente activo o dejen el stock en valores negativos.
2. **Prevención de Bloqueos Mutuos (Deadlocks):** Al actualizar múltiples filas de la tabla `remanentes` dentro de una transacción, si la Transacción 1 bloquea la fila A y luego intenta bloquear la fila B, mientras la Transacción 2 bloquea la fila B e intenta bloquear la fila A, PostgreSQL detectará un **deadlock** y abortará una de las transacciones.
3. **Atomicidad (All-or-Nothing):** Si uno de los ingredientes requeridos para la receta no cuenta con suficiente stock acumulado en cocina, la operación no debe ejecutarse parcialmente; debe fallar por completo y revertirse (rollback).

---

## 2. Decisión (Decision)

Para solucionar estos desafíos de forma robusta, se decide implementar el siguiente diseño:

1. **Uso de Transacciones Acotadas con Bloqueo Pesimista:**
   Toda la operación de consulta, validación y actualización se ejecutará dentro de una transacción interactiva de Prisma (`$transaction`).

2. **Orden Estricto de Bloqueo para Evitar Deadlocks:**
   Para prevenir deadlocks de manera absoluta, antes de modificar cualquier fila, la transacción adquirirá un bloqueo pesimista en modo de escritura (`FOR UPDATE`) sobre todas las filas de `remanentes` activas asociadas a los insumos requeridos. 
   La consulta SQL de bloqueo **se ordenará explícitamente por `id` de forma ascendente (`ORDER BY id ASC`)**:
   ```sql
   SELECT id FROM remanentes 
   WHERE insumo_id IN (list_of_insumo_ids) AND status = 'ACTIVE' 
   ORDER BY id ASC 
   FOR UPDATE;
   ```
   Al ordenar los recursos por su identificador único universal antes de solicitar el bloqueo, garantizamos que cualquier transacción concurrente que requiera los mismos recursos los solicitará en el mismo orden físico, eliminando la posibilidad de dependencia circular (deadlock).

3. **Ejecución del Algoritmo en Memoria (Orden FEFO):**
   Una vez bloqueadas las filas de forma segura, el caso de uso recuperará los objetos de dominio `Remanente` completos y los ordenará en memoria por su fecha de expiración acelerada (`calculatedExpirationDate` ASC). A partir de ahí, se aplicará el descuento en cascada:
   - Se consume de forma secuencial de cada remanente hasta agotar la cantidad requerida.
   - Si un remanente se agota por completo (cantidad = 0), su estado cambia a `CONSUMED`.
   - Se genera una entidad `StockMovement` de tipo `CONSUMPTION` para documentar la auditoría física de cada flujo.

4. **Rollback en Caso de Stock Insuficiente:**
   Si al finalizar la cascada de un ingrediente la cantidad restante requerida es mayor que cero, se lanzará una excepción de dominio `InsufficientStockError`. Esto provocará que Prisma aborte la transacción, liberando los bloqueos y dejando la base de datos sin cambios parciales.

5. **Precisión Aritmética:**
   Toda la lógica de descuento en cascada utilizará la clase `Decimal` de `decimal.js` para evitar errores de redondeo de punto flotante en JavaScript.

---

## 3. Consecuencias (Consequences)

- **Pros (Beneficios):**
  - **Seguridad Concurrente Absoluta:** No hay peligro de sobre-consumos ni inconsistencias de stock gracias al aislamiento pesimista.
  - **Cero Deadlocks:** Garantizado matemáticamente al ordenar la adquisición de locks de filas por su clave primaria física.
  - **Integridad de Datos:** La atomicidad transaccional evita estados parciales o registros de movimientos huérfanos.
  
- **Contras (Compromisos):**
  - **Rendimiento:** Las transacciones concurrentes que toquen los mismos ingredientes se encolarán en base de datos. Sin embargo, dado que el volumen por minuto en una cocina táctil es bajo y las operaciones duran milisegundos, el impacto es despreciable.
