---
document: glossary_and_business_rules
version: 1.0.0
status: approved
inputs:
  - docs/01_product_definition/01_product_discovery.md
---

# 📖 Glosario de Dominio e Invariantes de Negocio — RestoStock

Este documento centraliza los conceptos clave del dominio gastronómico de **RestoStock**, sus acrónimos y las reglas de negocio e invariantes innegociables que deben ser respetadas por la arquitectura, la base de datos y la implementación de código.

---

## 🔤 1. Glosario de Términos y Acrónimos

*   **FEFO (First Expired, First Out):** Algoritmo de rotación de inventarios que prioriza la salida y consumo de los insumos o remanentes con la fecha de vencimiento más próxima, minimizando la merma por caducidad.
*   **TRR (Tiempo de Retención Remanente):** Periodo de vida útil acelerada (hasta 72 horas / 3 días) que se asigna a un insumo una vez que su envase original es abierto o retirado del depósito central para su uso en la línea de cocina.
*   **Remanente Activo:** Insumo abierto y en uso que conserva stock disponible mayor a cero y cuyo TRR no ha expirado.
*   **Merma:** Pérdida física de inventario registrada debido a expiración del TRR, contaminación, daño físico o descarte operational en cocina.
*   **Conciliación de Fin de Turno:** Proceso guiado en el que el personal de cocina valida el stock físico real contra el saldo lógico del sistema y procesa el descarte masivo automático de remanentes vencidos.
*   **PIN de Operario:** Código numérico de 4 dígitos asignado a cada cocinero para autenticación rápida en la terminal táctil de cocina.
*   **Almacén Central / Bodega:** Depósito principal donde los insumos se conservan en envases cerrados bajo su vida útil comercial de fabricante.
*   **Costo Unitario (`unitCost`):** Valor monetario opcional asignado a un insumo, expresado por unidad de compra (ej. costo de 1 kg completo, no por gramo). Permite valorizar en `$` el reporte de mermas (`US-019`); nulo por defecto para insumos preexistentes.
*   **TRR Efectivo (Rotation Metric):** A diferencia del TRR (ventana de vencimiento acelerado, ver arriba), el TRR Efectivo es el tiempo **real** transcurrido entre la apertura de un remanente y su estado terminal (consumido o descartado), promediado sobre un rango de fechas (`US-020`). Es la métrica que valida en la práctica si el objetivo de las 72h se cumple.
*   **Advertencia de Apertura Duplicada:** Aviso visual no bloqueante ("Soft Limit", mismo patrón que la saturación de almacenes secundarios) mostrado al operario cuando intenta extraer un insumo sellado de bodega mientras ya existe un remanente activo del mismo insumo en cualquier ubicación de cocina (`US-021`).

---

## 🛡️ 2. Invariantes de Negocio (Reglas Innegociables)

### Invariante 1: Prohibición de Saldos Negativos
> *Bajo ninguna circunstancia el saldo o cantidad disponible de un insumo, lote o remanente activo puede ser menor a cero.* Si una transacción intenta consumir una cantidad superior a la disponible, la operación debe ser rechazada atómicamente retornando un error HTTP 422 Unprocessable Entity.

### Invariante 2: Precisión Aritmética Interna vs. Formateo Limpio en Interfaz (UI)
> 1. **Backend & DB (Precisión Absoluta):** Los montos numéricos de insumos y cantidades físicas se gestionan internamente con `decimal.js` y se almacenan como `Decimal(12,4)`. En las APIs JSON se serializan estrictamente como cadenas de texto (`string`, ej: `"4.6000"`).
> 2. **Frontend & UX (Formateo Limpio de Pantalla):** Para evitar la fatiga y ruido visual en la terminal táctil de cocina:
>    - **Gramos (`g`) y Mililitros (`ml`):** Se muestran siempre como **números enteros (0 decimales)** con separador de miles (ej: `4,600 g`, `750 ml`).
>    - **Kilogramos (`kg`), Litros (`L`) y Unidades (`u`):** Se muestran con **máximo 2 decimales significativos**, suprimiendo ceros no representativos a la derecha (ej: `4.6 kg`, `1.25 L`, `0.5 L`).

### Invariante 3: Inmutabilidad de Remanentes Agotados o Descartados
> Un remanente cuyo estado haya cambiado a `CONSUMED` (agotado) o `DISCARDED` (descartado) no puede recibir consumos parciales ni modificaciones posteriores. Su registro es inmutable para preservar la auditoría.

### Invariante 4: Descuento en Cascada FEFO
> Al registrar el consumo de una receta o ingrediente, el motor debe ordenar los remanentes activos por su fecha de expiración acelerada ascendente (`expirationDate ASC`) e ir debitando el saldo en cascada desde el más próximo a vencer hasta completar la cantidad requerida.

### Invariante 5: Inocuidad Alimentaria & Bloqueo por Expiración Acelerada (HACCP)
> 1. **Caducidad Acelerada (TRR):** Al abrir un insumo en envase cerrado, el sistema asigna de forma obligatoria una fecha de expiración acelerada `Fecha Expiración = Min(Fecha Vencimiento Lote Cerrado, Fecha Apertura + Vida Útil Abierto)`.
> 2. **Bloqueo Automático e Inocuidad:** Un remanente que alcance o supere su fecha de expiración acelerada cambia inmediatamente su estado a `EXPIRED` / `BLOCKED`. El backend rechazará atómicamente cualquier intento de usar un insumo expirado en una receta, garantizando que **ningún alimento potencialmente nocivo sea servido al cliente**.

---

## 🌐 3. Reglas de Resiliencia y Modo Offline

1. **Persistencia Local Temporal:** Si la terminal táctil de cocina pierde la conectividad de red con la API central, los consumos parciales y descartes se encolan localmente en IndexedDB.
2. **Sincronización Transaccional:** Al restablecerse la conexión, la cola local se sincroniza en orden cronológico determinista enviando la marca de tiempo original del evento (`clientTimestamp`).
