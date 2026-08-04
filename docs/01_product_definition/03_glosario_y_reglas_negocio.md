# 📖 Glosario de Dominio e Invariantes de Negocio — RestoStock

Este documento centraliza los conceptos clave del dominio gastronómico de **RestoStock**, sus acrónimos y las reglas de negocio e invariantes innegociables que deben ser respetadas por la arquitectura, la base de datos y la implementación de código.

---

## 🔤 1. Glosario de Términos y Acrónimos

*   **FEFO (First Expired, First Out):** Algoritmo de rotación de inventarios que prioriza la salida y consumo de los insumos o remanentes con la fecha de vencimiento más próxima, minimizando la merma por caducidad.
*   **TRR (Tiempo de Retención Remanente):** Periodo de vida útil acelerada (típicamente 24 horas) que se asigna a un insumo una vez que su envase original es abierto o retirado del depósito central para su uso en la línea de cocina.
*   **Remanente Activo:** Insumo abierto y en uso que conserva stock disponible mayor a cero y cuyo TRR no ha expirado.
*   **Merma:** Pérdida física de inventario registrada debido a expiración del TRR, contaminación, daño físico o descarte operacional en cocina.
*   **Conciliación de Fin de Turno:** Proceso guiado en el que el personal de cocina valida el stock físico real contra el saldo lógico del sistema y procesa el descarte masivo automático de remanentes vencidos.
*   **PIN de Operario:** Código numérico de 4 dígitos asignado a cada cocinero para autenticación rápida en la terminal táctil de cocina.
*   **Almacén Central / Bodega:** Depósito principal donde los insumos se conservan en envases cerrados bajo su vida útil comercial de fabricante.

---

## 🛡️ 2. Invariantes de Negocio (Reglas Innegociables)

### Invariante 1: Prohibición de Saldos Negativos
> *Bajo ninguna circunstancia el saldo o cantidad disponible de un insumo, lote o remanente activo puede ser menor a cero.* Si una transacción intenta consumir una cantidad superior a la disponible, la operación debe ser rechazada atómicamente retornando un error HTTP 422 Unprocessable Entity.

### Invariante 2: Serialización Precisa de Cantidades Físicas (Decimal as String)
> *Los montos de dinero y cantidades de insumos numéricas (ej. kilogramos, litros, unidades) no deben manejarse como tipos de coma flotante (`float`/`double`).* En la base de datos se almacenan como tipo `Decimal(12,4)` y en los contratos API REST / JSON se serializan estrictamente como cadenas de texto (`string`, ej: `"2.5000"`).

### Invariante 3: Inmutabilidad de Remanentes Agotados o Descartados
> Un remanente cuyo estado haya cambiado a `CONSUMED` (agotado) o `DISCARDED` (descartado) no puede recibir consumos parciales ni modificaciones posteriores. Su registro es inmutable para preservar la auditoría.

### Invariante 4: Descuento en Cascada FEFO
> Al registrar el consumo de una receta o ingrediente, el motor debe ordenar los remanentes activos por su fecha de expiración acelerada ascendente (`expirationDate ASC`) e ir debitando el saldo en cascada desde el más próximo a vencer hasta completar la cantidad requerida.

---

## 🌐 3. Reglas de Resiliencia y Modo Offline

1. **Persistencia Local Temporal:** Si la terminal táctil de cocina pierde la conectividad de red con la API central, los consumos parciales y descartes se encolan localmente en IndexedDB.
2. **Sincronización Transaccional:** Al restablecerse la conexión, la cola local se sincroniza en orden cronológico determinista enviando la marca de tiempo original del evento (`clientTimestamp`).
