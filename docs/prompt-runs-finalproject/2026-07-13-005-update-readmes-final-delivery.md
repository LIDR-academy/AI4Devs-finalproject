# Prompt run 2026-07-13-005 - Update READMEs Final Delivery

## Metadata

- fecha: 2026-07-13
- secuencia: 005
- rama esperada: `finalproject-ASP`
- tipo de cambio: documentacion solamente

## Objetivo

Actualizar los README principales para reflejar el estado actual de la Entrega
Final del Proyecto Final RoboDock AI en la rama `finalproject-ASP`, evitando que
la Entrega 2 siga apareciendo como estado vigente.

## Problema detectado

Los README principales describian el proyecto como si el estado actual fuera la
Entrega 2, con frases como "Backend MVP para Entrega 2", "Dashboard operacional
para Entrega 2", "Estado de Entrega 2" y referencias al flujo funcional en
`simulation`.

Ese contenido era correcto como antecedente historico, pero ya no representaba
el alcance actual de la rama final: Backend REST/PostgreSQL, dashboard compacto,
Edge Vision API, camara/OpenCV, QR, deteccion de cubos, planificacion multi-cubo,
drop zones por color, MaxArm fisico, dry-run/hardware, confirmacion por vision,
reset operacional y feedback en vivo.

## Archivos README revisados

- `readme.md`
- `backend/README.md`
- `edge/README.md`
- `frontend/README.md`
- `docs/prompt-runs-finalproject/README.md`
- `docs/entrega-1/readme.md`
- `prompts/commands/update-readme.md`
- `docs/prompt-runs/2026-06-09-007-Update README for delivery 2 MVP.md`

## Cambios realizados

- Reescritura del README raiz para presentar el Proyecto Final / Entrega Final
  como estado actual.
- Separacion explicita de estado actual, ejecucion, configuracion local,
  simulacion vs hardware, limitaciones conocidas y antecedente Entrega 2.
- Actualizacion de `backend/README.md` para describir Backend REST,
  PostgreSQL, snapshots de vision, reset operacional y trazabilidad
  dry-run/hardware.
- Actualizacion de `frontend/README.md` para describir dashboard compacto,
  Edge Vision, planificacion, control fisico delegado a Edge, reset y feedback
  en vivo.
- Actualizacion de `edge/README.md` para describir Edge Vision API, camara,
  QR, deteccion OpenCV, plan multi-cubo, drop zones, MaxArm fisico, dry-run,
  hardware y confirmacion por vision.
- Mantenimiento de Entrega 2 como antecedente historico del MVP simulado
  inicial, no como estado actual.

## Aclaracion de alcance

Este prompt-run corresponde a documentacion solamente. No se modifico codigo
funcional, migraciones, dependencias ni archivos locales de configuracion fisica.

No se tocaron:

- `edge/config/edge.vision.local.json`
- `edge/config/single-cube-pick-drop.local.json`
- `edge/config/drop_zones.local.json`
- `frontend/.env.local`

## Validaciones realizadas

- Se confirmo la rama `finalproject-ASP`.
- Se revisaron los README relevantes encontrados con busqueda de archivos.
- Se ejecuto `git diff --stat`.
- Se verifico que los cambios correspondieran a Markdown/documentacion.
- No se ejecuto build porque el cambio fue exclusivamente documental.
