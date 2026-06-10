# Task Template — `<US-ID>-TASK-<NN>`

> Copia este bloque para cada tarea de la tabla.

---

### `<US-ID>-TASK-<NN>` — <título corto de la tarea>

- [ ] Implementado
- **Capa:** Backend | Frontend
- **Depende de:** <ID de tarea | —>
- **Criterio de aceptación cubierto:** <cita literal o referencia al criterio de la US>

**Descripción técnica**

<Qué se construye: endpoint/servicio/repositorio o componente/estado. Contrato concreto:
método, ruta, request/response o props/estados. Capas afectadas según arquitectura limpia.>

**Criterios de hecho**

- <condición observable 1>
- <condición observable 2>
- Cumple las reglas de seguridad aplicables de `CLAUDE.md`.

**Tests TDD (obligatorios)**

> Primero el test en rojo, luego el código mínimo, luego refactor en verde.

| Test | Tipo | Aserción |
|---|---|---|
| <nombre del test> | Supertest / Jest / RTL / Playwright | <qué verifica> |

- Test en rojo escrito antes del código de producción: sí / no (si no, justificar).
- Si TDD no es viable aquí: <motivo>.

**Verificación ejecutada**

```
<resumen de la salida de la suite tras la implementación — se rellena en las fases 2-4>
```
