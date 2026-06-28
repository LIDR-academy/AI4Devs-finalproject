# ADR-002

## Titulo

Modo simulation-first para Entrega 2

## Fecha

2026-06-07

## Estado

Propuesta

---

## Contexto

RoboDock AI combina vision computacional, QR, backend, dashboard y control o simulacion del MaxArm. Los spikes existentes validan QR, deteccion de cubos, dashboard experimental y dry run del MaxArm, pero la Entrega 2 debe priorizar un MVP funcional demostrable.

El hardware real introduce riesgos de disponibilidad, calibracion, seguridad fisica y reproducibilidad. La gobernanza del proyecto recomienda no declarar control real si no existe evidencia funcional y usar `simulation` o `dryRun` por defecto.

---

## Alternativas evaluadas

### Opcion 1: Simulation-first como camino principal

Ventajas:

- Permite demostrar el flujo completo sin camara ni MaxArm.
- Reduce riesgo de demo.
- Facilita pruebas locales repetibles.
- Mantiene seguridad fisica al no mover hardware por defecto.

Desventajas:

- No prueba control fisico real.
- Requiere declarar claramente que la accion robot es simulada.

### Opcion 2: Hardware-first

Ventajas:

- Mayor cercania con la vision final del producto.
- Evidencia mas potente si funciona correctamente.

Desventajas:

- Alto riesgo de bloqueo por camara, puerto serial, calibracion o seguridad.
- Puede impedir entregar backend/frontend funcional.
- Dificulta reproducir la demo en otro entorno.

### Opcion 3: Solo documentar hardware sin simulacion ejecutable

Ventajas:

- Menor esfuerzo tecnico.
- Permite describir arquitectura objetivo.

Desventajas:

- No cumple el foco de Entrega 2 en desarrollo funcional.
- No demuestra flujo end-to-end.

---

## Decision

La Entrega 2 se validara con modo `simulation` como camino principal. El edge enviara eventos simulados al backend para crear sesion, registrar cubos y registrar acciones robot.

El modo hardware queda como opcional o evolucion futura. Si se usa durante la entrega, debe estar protegido por configuracion explicita y documentarse como evidencia adicional, no como requisito del MVP.

---

## Justificacion

Simulation-first permite entregar valor funcional y trazabilidad sin depender de condiciones fisicas del laboratorio. Tambien reduce el riesgo de claims incorrectos sobre robotica real.

La decision no descarta hardware: conserva una ruta natural para adaptar los spikes de QR, vision color y MaxArm dry run en etapas posteriores.

---

## Consecuencias

### Positivas

- Demo mas estable y reproducible.
- Menor riesgo operacional.
- Pruebas E2E posibles desde cualquier entorno local.
- Separacion clara entre implementado, simulado y futuro.

### Negativas

- La Entrega 2 no prueba descarga fisica real.
- Puede requerir esfuerzo documental para evitar claims exagerados.

### Riesgos

- Que se comunique como robotica real algo que solo esta simulado.
- Que la evolucion a hardware requiera ajustes adicionales de contratos.
- Que los datos simulados no cubran casos borde de deteccion real.
