# HU-007 — Gestión de Agencias

## Historia
Como agente de arrendamiento,
quiero pertenecer a una agencia y gestionar la cartera de propietarios vinculados a ella,
para poder atender y publicar en nombre de un propietario sin que ese vínculo dependa de mí como empleado individual y se pierda si dejo de atenderlo.

## Criterios de aceptación
- [x] Al registrarse, un agente puede crear una agencia nueva indicando nombre/razón social y NIT; al crearla, el agente queda automáticamente como su primer miembro.
- [x] Un agente puede solicitar unirse a una agencia ya existente; el ingreso queda en estado pendiente hasta que un agente que ya sea miembro de esa agencia lo apruebe.
- [x] Un agente no puede autoasignarse a una agencia existente sin aprobación de un miembro actual (gate de seguridad: conocer el nombre de la agencia no es suficiente para unirse).
- [x] La agencia es una entidad propia en el sistema (persona jurídica: nombre/razón social, NIT) y no un usuario que se autentica.
- [x] Dentro de una agencia no existe jerarquía de roles (no hay admin/gerente/dueño en este MVP): cualquier agente miembro tiene las mismas capacidades de gestión sobre los propietarios vinculados a la agencia.
- [x] El propietario es quien inicia la relación con una agencia (la solicita/contrata); la relación agencia↔propietario queda en estado `pendiente` hasta ser confirmada.
- [x] La relación agencia↔propietario tiene tres estados posibles: `pendiente`, `activa` y `revocada`.
- [x] El propietario puede revocar la relación con la agencia en cualquier momento, sin necesidad de aprobación de la agencia; al revocarla, la relación pasa a estado `revocada`.
- [x] Cada relación agencia↔propietario activa tiene un puntero de "agente responsable" (punto de contacto actual), que cualquier agente miembro de la agencia puede reasignar a otro miembro de la misma agencia.
- [x] Reasignar el agente responsable es un cambio de trazabilidad/gestión únicamente: no otorga ni retira permisos por sí mismo.
- [x] Cualquier agente miembro de una agencia puede gestionar a un propietario mientras la relación agencia↔propietario esté en estado `activa`, sin importar quién sea el agente responsable puntual en ese momento.
- [x] Si la relación agencia↔propietario no está en estado `activa` (está `pendiente` o `revocada`), ningún agente de esa agencia puede gestionar al propietario ni a sus inmuebles.
- [x] Un agente puede ver el listado de propietarios vinculados a su agencia junto con el estado de cada relación (`pendiente` / `activa` / `revocada`) y quién es el agente responsable actual.
- [x] Un agente pertenece a exactamente una agencia a la vez (no puede estar en dos agencias simultáneamente).
- [x] Un propietario tiene como máximo una agencia con relación `activa` a la vez; si contrata una agencia nueva mientras tiene otra activa, la relación anterior pasa automáticamente a `revocada`.
- [x] Al pasar una relación agencia↔propietario a `revocada` (por revocación explícita del propietario o por reemplazo de agencia), los inmuebles de ese propietario que estaban gestionados por esa agencia se despublican automáticamente (pasan a estado `oculto`); el propietario debe republicarlos él mismo o a través de una nueva agencia.
- [x] Un agente puede salir de su agencia voluntariamente, sin necesidad de aprobación de otro miembro (asimétrico respecto al ingreso, que sí requiere aprobación).
- [x] El sistema bloquea la salida del último agente de una agencia si esa agencia tiene relaciones `activa`s con propietarios; el agente debe transferirlas o esperar a que otro agente se una antes de poder salir.

## Notas técnicas
- **HU-002 (publicación de inmueble por agente) queda bloqueada por esta HU-007**: un agente no puede publicar ni gestionar inmuebles en nombre de un propietario sin que la relación AGENCIA↔propietario correspondiente esté en estado `activa`. El diseño técnico de HU-002 debe apoyarse en el modelo introducido aquí en lugar de un vínculo agente individual↔propietario.
- No hay jerarquía interna de agencia en este MVP (roles admin/gerente vs. empleado quedan descartados); esta decisión ya fue tomada y no debe reabrirse en diseño técnico.
- El modelo de datos introduce la entidad `Agencia` (persona jurídica: nombre/razón social, NIT) como entidad separada de `usuario`, más la relación `agencia_propietario` con sus tres estados (`pendiente`, `activa`, `revocada`) y el puntero de agente responsable como atributo de esa relación (no como mecanismo de autorización).
- El flujo de aprobación de ingreso de un agente a una agencia existente (quién puede aprobar, cómo se notifica) debe definirse en diseño técnico, pero el requisito funcional de que "un miembro existente debe aprobar" es innegociable.
- Esta HU es fundacional respecto al modelo organizacional: además de desbloquear HU-002, cualquier futura funcionalidad de reportes o gestión por agencia (fuera de alcance del MVP actual) dependerá de esta entidad.
- Cardinalidad agente↔agencia: 1:N desde la agencia (una agencia tiene muchos agentes), pero cada agente pertenece a una sola agencia — `usuario.agencia_id` como FK simple, no se necesita tabla intermedia N:N.
- La despublicación automática al revocar reutiliza la operación de dominio ya existente de HU-001 (`cambiar_disponibilidad` → `oculto`), disparada en cascada sobre todos los inmuebles del propietario que tenían esa agencia como gestora — no es una regla nueva de dominio, es un nuevo caller de la ya existente.
- "Salir de la agencia" y el bloqueo por último-agente-con-relaciones-activas son parte del alcance de esta HU (se agregaron durante exploración posterior a la primera redacción).
- **Hallazgo del testing manual (no bloqueante)**: al confirmar una relación agencia↔propietario, `agente_responsable_id` queda `null` — no se asigna automáticamente al agente que confirma. Hay que usar `PATCH /agencias/relaciones/{id}/responsable` explícitamente para fijarlo. Ningún criterio de aceptación exige la asignación automática, así que no se consideró un bug, pero queda como decisión de producto pendiente para una futura iteración de UX.

## Prioridad
Alta — es fundacional y bloqueante: HU-002 no puede completar su diseño técnico ni implementarse correctamente sin el modelo de agencia y la relación agencia↔propietario definidos aquí. Además resuelve un riesgo de integridad/seguridad (auto-asignación no autorizada a agencias ajenas) ya identificado en el PRD.

## Estimación
08 — Muy Grande (17h)

Justificación: no es un CRUD simple (como podría ser un catálogo), pero tampoco alcanza la complejidad de una funcionalidad transversal con integraciones externas como HU-004 o HU-005. Introduce una entidad nueva (Agencia), una relación con máquina de estados (agencia↔propietario: pendiente/activa/revocada) y un flujo de aprobación (unión de agente a agencia existente), más el puntero reasignable de agente responsable. Es comparable en complejidad a HU-002 (05) pero con más superficie: dos flujos de aprobación distintos (unión de agente, y activación de relación con propietario) en lugar de uno, por lo que se ubica un escalón Fibonacci por encima, en línea con HU-003/HU-006 (08).
