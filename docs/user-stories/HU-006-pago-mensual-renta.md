# HU-006 — Pago mensual de renta

## Historia
Como inquilino,
quiero pagar la mensualidad de mi arriendo dentro de la plataforma mediante medios de pago electrónicos colombianos,
para cumplir con mi obligación de arrendamiento de forma digital, con trazabilidad y sin usar efectivo ni transferencias manuales fuera del sistema.

## Criterios de aceptación
- [ ] El inquilino puede ver en su panel el monto a pagar, la fecha límite de pago y el historial de pagos anteriores.
- [ ] El sistema habilita el cobro mensual únicamente para arrendamientos activos (contrato firmado exitosamente tras HU-005).
- [ ] El inquilino puede realizar el pago usando al menos un método de pago electrónico compatible con el ecosistema financiero colombiano (ej. tarjeta de crédito/débito, PSE).
- [ ] Al completarse el pago exitosamente, el sistema registra la transacción con fecha, monto y referencia de la pasarela de pagos.
- [ ] El propietario recibe una notificación cuando el pago mensual es procesado exitosamente.
- [ ] Si el pago falla, el inquilino recibe una notificación con el motivo del fallo y puede intentarlo nuevamente.
- [ ] El inquilino puede descargar o visualizar el comprobante de cada pago realizado.
- [ ] El sistema lleva un registro del historial completo de pagos del contrato (pagados, pendientes, fallidos).

## Notas técnicas
- Punto abierto del PRD: el proveedor de la pasarela de pagos no está definido. Candidatos mencionados: Wompi, PayU, Epayco. La selección impacta la experiencia del inquilino, los métodos de pago disponibles, las comisiones por transacción y los requisitos de integración.
- El modelo de ingresos de la plataforma no está definido (ver puntos abiertos del PRD). Si la plataforma cobra una comisión sobre el arriendo, el flujo de pagos debe contemplar la lógica de split de pagos o retención de comisión — esto aumenta significativamente la complejidad de esta HU y puede requerir revisión de la estimación.
- El ciclo de cobro mensual implica definir si el pago es iniciado por el inquilino (pull) o si el sistema intenta el cobro automáticamente (push/débito automático). Esta decisión tiene implicaciones regulatorias y de UX.
- Dependencia estricta con HU-005: el pago mensual solo aplica a contratos formalizados con contrato firmado digitalmente.

## Prioridad
Alta

## Estimación
08 — Muy Grande (17h)
