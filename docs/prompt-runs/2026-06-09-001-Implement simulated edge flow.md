Usa AGENTS.md como guía principal del proyecto.

Actúa como:

* prompts/agents/edge.md

Usa subagentes:

* prompts/subagents/edge-vision.md
* prompts/subagents/edge-maxarm.md

Usa skills:

* prompts/skills/opencv.md
* prompts/skills/maxarm.md
* prompts/skills/documentation.md

Usa commands:

* prompts/commands/implement-feature.md

Lee como contexto:

* docs/delivery/roadmap-entregas.md
* docs/delivery/01-alcance-entrega2.md
* docs/delivery/02-plan-delivery-entrega2.md
* docs/architecture/architecture-entrega2.md
* docs/delivery/04-backend-implementation-plan.md
* docs/evidence/backend-api-test-results.md
* backend/README.md
* docs/api-design.md

Objetivo:
Implementar el módulo Edge en modo simulation para la Entrega 2 de RoboDock AI.

Alcance:

* Crear o actualizar la carpeta edge/.
* Implementar un runner de Edge simulado.
* Simular lectura de QR de camión.
* Simular detección de cubos por color.
* Simular acción de robot pick/drop.
* Enviar los datos al backend usando los endpoints reales ya implementados.
* Consultar el dashboard operacional al final del flujo.
* Documentar cómo ejecutar el Edge simulado.

Flujo esperado:

1. Leer configuración del backend.
2. Simular QR con truckCode = TRUCK-001.
3. Crear sesión usando POST /sessions.
4. Simular cubos detectados.
5. Registrar cubos usando POST /sessions/:id/cubes.
6. Simular acción robot usando POST /robot/actions.
7. Consultar GET /dashboard/operational.
8. Mostrar resumen en consola.

Estructura sugerida:

* edge/README.md
* edge/requirements.txt
* edge/.env.example
* edge/config/edge.config.example.json
* edge/src/api_client.py
* edge/src/simulation/qr_simulator.py
* edge/src/simulation/vision_simulator.py
* edge/src/simulation/robot_simulator.py
* edge/src/edge_runner.py

Reglas importantes:

* La Entrega 2 funciona en modo simulation.
* No declares hardware real como implementado.
* No intentes conectarte a cámara real.
* No intentes mover MaxArm real.
* No modifiques backend/.
* No modifiques frontend/.
* No cambies los endpoints existentes.
* No hagas commit ni push.
* Mantén el diseño simple y demostrable.
* El modo simulation debe respetar los contratos reales del backend.

Antes de modificar archivos:

1. Resume brevemente el plan.
2. Lista los archivos que crearás o modificarás.

Luego implementa.

Al finalizar:

1. Resume archivos creados o modificados.
2. Indica cómo instalar dependencias Python.
3. Indica cómo configurar el backend URL.
4. Indica cómo ejecutar el Edge simulado.
5. Indica cómo verificar que el backend recibió los datos.
6. Indica riesgos o pendientes para Entrega 3 con hardware real.
