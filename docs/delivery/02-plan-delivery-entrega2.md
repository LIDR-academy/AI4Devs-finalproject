# Plan Delivery Entrega 2 - RoboDock AI

## 1. Backlog tecnico priorizado

| Prioridad | Item | Agente sugerido | Entregable |
|---|---|---|---|
| P0 | Validar arquitectura MVP y contratos principales | Architect | Documento breve con componentes, modelo reducido y contratos API/edge/dashboard |
| P0 | Crear backend minimo ejecutable | Backend | API Express + TypeScript con healthcheck y estructura base |
| P0 | Definir modelo Prisma minimo | Backend | `Truck`, `UnloadSession`, `Cube` o `DetectedCube`, `RobotAction` |
| P0 | Implementar endpoints del flujo principal | Backend | Crear sesion, registrar detecciones, registrar accion robot, consultar estado operacional |
| P0 | Agregar seed o datos de prueba | Backend | Datos demo para ejecutar el flujo local |
| P1 | Crear edge en modo simulado | Edge | Script Python que simula QR, cubos y accion robot contra backend |
| P1 | Adaptar salida util de spikes | Edge | Payload compatible con backend usando QR/cubos ya validados en `spikes/` |
| P1 | Crear dashboard operacional minimo | Frontend | Vista React/Vite que consume estado desde backend |
| P1 | Documentar ejecucion local | Documenter | Instrucciones de backend, frontend, edge y variables de entorno |
| P1 | Probar flujo E2E simulado | QA | Checklist de prueba manual y resultado esperado |
| P2 | Capturar evidencias | QA / Documenter | Capturas, JSON de ejemplo y notas de ejecucion |
| P2 | Revisar seguridad y claims | Governance | Validacion de `.env`, modo simulado y alcance declarado |

## 2. Orden recomendado de implementacion

1. **Architect Agent**
   - Confirmar arquitectura reducida de Entrega 2.
   - Definir contratos minimos entre backend, edge y frontend.
   - Mantener maximo foco en MVP: sesion, cubos, acciones robot y dashboard.

2. **Backend Agent**
   - Crear proyecto backend ejecutable.
   - Definir Prisma schema minimo.
   - Implementar endpoints necesarios para el flujo.
   - Agregar `.env.example`, seed y comandos de prueba.

3. **Edge Agent**
   - Crear script de simulacion en `edge/`.
   - Enviar al backend: camion, detecciones de cubos y accion simulada.
   - Reutilizar conocimiento de `spikes/` sin mover todo el experimento al MVP.

4. **Frontend Agent**
   - Crear dashboard operacional simple.
   - Consumir endpoint de estado operacional.
   - Mostrar camion, sesion, conteos y ultimas acciones.

5. **QA Agent**
   - Ejecutar flujo local simulado.
   - Verificar criterios de aceptacion de las historias Must.
   - Registrar fallas y evidencia minima.

6. **Governance Agent**
   - Revisar que no existan secretos ni `.env` versionado.
   - Confirmar que los claims del README/docs coincidan con lo implementado.
   - Validar separacion entre modo simulado y evolucion futura.

7. **Documenter Agent**
   - Actualizar documentacion final de Entrega 2.
   - Incorporar instrucciones, evidencias, prompts y estado de alcance.

## 3. Dependencias entre agentes

| Agente | Depende de | Entrega habilita |
|---|---|---|
| Architect | PO y Delivery Manager | Contratos para Backend, Edge y Frontend |
| Backend | Architect | API y persistencia para Edge y Frontend |
| Edge | Backend | Datos reales/simulados registrados en backend |
| Frontend | Backend | Dashboard consumiendo API |
| QA | Backend, Edge y Frontend | Validacion E2E del flujo principal |
| Governance | QA parcial y documentacion inicial | Revision de seguridad, trazabilidad y claims |
| Documenter | Todos los anteriores | Documentacion final y evidencias |

Regla de coordinacion: no comenzar Frontend ni Edge con contratos definitivos hasta que Backend tenga al menos endpoints o mocks documentados. Si el Backend se retrasa, Architect debe dejar contratos JSON para desbloquear trabajo paralelo controlado.

## 4. Riesgos y mitigaciones

| Riesgo | Impacto | Mitigacion |
|---|---|---|
| Backend queda sobredisenado | Alto | Limitar modelos a las entidades necesarias para las historias Must. |
| Prisma/PostgreSQL bloquea avance local | Alto | Mantener seed minimo y documentar comandos claros; evitar migraciones complejas. |
| Edge intenta integrar hardware real demasiado pronto | Alto | Usar modo simulado como flujo principal y dejar hardware real como evidencia opcional. |
| Spikes se copian sin adaptacion | Medio | Extraer payloads y funciones utiles, no replicar carpetas experimentales completas. |
| Dashboard se vuelve demasiado visual o analitico | Medio | Una vista operacional basta para Entrega 2. |
| Falta de pruebas demostrables | Medio | QA debe probar con comandos HTTP y script edge simulado. |
| Documentacion no refleja lo implementado | Medio | Governance y Documenter deben separar "implementado", "simulado" y "futuro". |
| Muchos commits mezclan responsabilidades | Medio | Usar commits por agente/componente para trazabilidad. |

## 5. Definition of Done de Entrega 2

La Entrega 2 se considera terminada cuando:

- El backend se ejecuta localmente.
- La base de datos y Prisma tienen modelo minimo funcional.
- Existe `.env.example` para backend, frontend y edge cuando aplique.
- Se puede crear o reutilizar un camion por `truckCode`.
- Se puede crear una sesion de descarga.
- Se pueden registrar cubos detectados por color.
- Se puede registrar una accion simulada del robot.
- Existe un endpoint o consulta para estado operacional.
- El edge tiene un modo simulado que ejecuta el flujo principal contra el backend.
- El frontend muestra dashboard operacional consumiendo datos del backend.
- Hay instrucciones de prueba local.
- Hay evidencia minima del flujo: payloads, capturas o salida de consola.
- Los prompts relevantes quedan registrados o referenciados.
- No se versiona `.env` ni secretos.
- El alcance documentado coincide con lo realmente implementado.

## 6. Plan de commits sugerido

1. `docs: define alcance y plan de entrega 2`
   - Incluye diagnostico, alcance y plan delivery.

2. `docs: define arquitectura mvp entrega 2`
   - Contratos, componentes y decisiones del Architect Agent.

3. `feat(backend): scaffold api and prisma mvp`
   - Proyecto backend, Prisma, `.env.example` y healthcheck.

4. `feat(backend): implement unload session flow`
   - Sesiones, camiones, detecciones, acciones robot y estado operacional.

5. `feat(edge): add simulated unload flow`
   - Script edge que envia QR/cubos/robot al backend.

6. `feat(frontend): add operational dashboard`
   - Dashboard React consumiendo API.

7. `test: validate simulated delivery 2 flow`
   - Pruebas manuales, scripts o checklist QA.

8. `docs: add delivery 2 runbook and evidence`
   - Instrucciones finales, evidencias y prompts.

9. `chore: final delivery 2 governance review`
   - Ajustes de seguridad, claims y limpieza menor.

## 7. Agente que debe ejecutarse despues

El siguiente agente recomendado es el **Architect Agent**.

Prompt sugerido:

```text
Usa AGENTS.md como guia principal del proyecto.

Actua como el agente definido en:
- prompts/agents/architect.md

Usa como proceso:
- prompts/playbooks/delivery-2.md

Lee:
- docs/delivery/00-diagnostico-inicial.md
- docs/delivery/01-alcance-entrega2.md
- docs/delivery/02-plan-delivery-entrega2.md

Objetivo:
Definir la arquitectura MVP de Entrega 2, contratos principales y modelo de datos minimo para que Backend, Edge y Frontend puedan implementar sin sobreingenieria.

Debes crear o actualizar:
- docs/delivery/03-arquitectura-mvp-entrega2.md

Restricciones:
- No implementes codigo.
- No modifiques backend, frontend ni edge.
- No modifiques otros archivos.
- Mantén foco en MVP funcional demostrable.
```
