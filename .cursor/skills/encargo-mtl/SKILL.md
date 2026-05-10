# Encargo MTL (plantilla de prompt)

Plantilla para acotar tareas al agente: **objetivo**, **alcance**, **documento que manda**, **definición de hecho** y **modo**.

## Cómo usar (pasos)

1. **Abre el chat del Agent** (o el modo donde Cursor liste *skills* / comandos con `/`).
2. **Inserta la plantilla en el mensaje**, de una de estas formas (la que veas en tu versión):
   - Escribe **`/`** y elige **`encargo-mtl`** (o el nombre que Cursor muestre para este skill), **o**
   - Escribe **`@`** y busca **`encargo-mtl`**, **`SKILL`**, o el fichero **`.cursor/skills/encargo-mtl/SKILL.md`** para adjuntarlo al contexto, **o**
   - Abre este fichero en el editor, **copia** desde `## Objetivo` hasta el final y **pega** en el chat.
3. **Antes de pulsar Enviar**, en el propio cuadro de texto del mensaje:
   - Sustituye todo lo que esté entre **`[corchetes]`** por texto real (o borra líneas que no apliquen).
   - Opcional: añade **`@`** a ficheros concretos (p. ej. `@services/api-gateway/...`) para dar contexto extra.
4. **Envía** el mensaje ya rellenado.

Si envías la plantilla **sin rellenar**, el agente no tiene una tarea ejecutable: solo verá instrucciones genéricas.

---

## Objetivo

[Una frase: qué debe quedar hecho al cerrar la tarea.]

## Alcance

- **Incluye:** […]
- **Excluye / no tocar:** [archivos, módulos, `docs/`, etc.]
- **Paths o módulos Maven:** [p. ej. solo `services/api-gateway/`]

## Documentación de referencia (fuente de verdad si hay duda)

- Contrato HTTP: [p. ej. `docs/api/openapi.yaml`]
- JWT / gateway: [p. ej. `docs/security/jwt-gateway-strategy.md`]
- Tests / Maven: [p. ej. `docs/engineering/testing-java.md`]
- [Solo enlaces que apliquen a esta tarea.]

## Definición de hecho

- Comandos: [p. ej. `mvn -pl … verify` o `mvn test` desde `services/`]
- Documentación: [actualizar / no actualizar; qué ficheros como máximo]

## Modo

[Elegir uno: **Implementar** | **Solo diseño / plan** | **Solo revisión** sin cambiar código]
