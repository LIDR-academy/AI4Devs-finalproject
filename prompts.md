Prompts testing E2E:

1.
Eres senior QA, requiero comenzar a desarrollar test E2E para este proyecto, requiero que crees el contrato open api para expenses.

Debes inspeccionar la ui real y el codigo existente del proyecto.


2.
Ahora como senior QA crea un json schema llamado case-bundle.schema.json para validar un bundle.
- Require completos
debes guardar el schela en /schema/

3.
Genera un archivo json llamado 2026-03-16-expenses.json que cumpla exactamente el @schema/case-bundle.schema.json .

Incluye al menos 5 casos, para cada caso rellena expected.network/status, expected.ui (toast o errorFields) y expected.state.

guarda el json en data/026-03-16-expenses.json

4.
Escribe un script Node ESM validate-cases.msj que:
- reciba por cli <bundlePath> <schemaPath>
- Use AJV para validar el bundle contra el schema
- imprima Valid y exit code si todo ok
- su hay errores liste cada uno con: instancePath, keyword, message: exit code 1.
- No agregues dependencias innecesarias
-Muestra tambien cuantos casos fueron validados.

guarda el archivo en la carpeta tools