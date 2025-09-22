# 5. Historias de Usuario

Las siguientes historias de usuario corresponden al flujo principal del sistema: carga de inventario inicial, movimientos entre sedes y ventas.

---

## Historia de Usuario 1: Registrar productos (saldos iniciales / compras)

**Como** Administrador  
**Quiero** registrar productos en el sistema como saldos iniciales o mediante compras  
**Para** tener disponible el inventario en la bodega principal y asignarlo a las sedes.

### Criterios de aceptación

- Se debe poder ingresar: código único, nombre, descripción, costo unitario, precio de venta y cantidad inicial.
- El sistema calculará automáticamente el `AverageCost` (costo promedio) en base a los ingresos.
- La cantidad ingresada se reflejará en la bodega principal (o en la sede seleccionada).
- El registro debe quedar guardado como un **movimiento de tipo "Inbound"**.

---

## Historia de Usuario 2: Registrar movimiento de inventario entre sedes

**Como** Administrador  
**Quiero** registrar transferencias de productos entre bodega principal y sedes (o entre sedes)  
**Para** mantener actualizado el stock en tiempo real en cada ubicación.

### Criterios de aceptación

- Debo poder seleccionar: producto, sede origen, sede destino y cantidad a transferir.
- El sistema debe validar que la sede origen tenga suficiente stock.
- El movimiento debe actualizar inventarios en ambas sedes.
- El registro debe quedar guardado como un **movimiento de tipo "Transfer"**.
- Se debe guardar la trazabilidad con el usuario que ejecutó la acción y la fecha.

---

## Historia de Usuario 3: Registrar venta de productos

**Como** Vendedor  
**Quiero** registrar ventas en el sistema seleccionando productos y medios de pago  
**Para** actualizar inventario automáticamente y generar reportes diarios de ventas.

### Criterios de aceptación

- Debo poder registrar múltiples productos en una sola venta.
- Se debe seleccionar el medio de pago: **Cash, Card, BankTransfer o Deposit**.
- El sistema debe descontar automáticamente el stock en la sede.
- El total de la venta debe calcularse automáticamente.
- El registro debe quedar guardado como una **Venta con DetalleVenta**.
- El sistema debe permitir consultar la venta en los reportes diarios/semanales/mensuales.

---
