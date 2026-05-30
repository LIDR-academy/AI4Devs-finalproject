# Git, ramas y pull requests (estrategia sencilla)

Guía operativa para trabajar con ramas en este repositorio, abrir pull requests en GitHub y usar las plantillas en `.github/`.

## Ramas habituales

- **main**: código integrado y desplegable (o habitualmente estable).
- **Ramas de trabajo**: una rama corta por tarea, issue o pull request.

## Nombrado

Prefijo + descripción en minúsculas y guiones:

- `feature/descripcion`: nueva capacidad.
- `fix/descripcion`: corrección de defecto.
- `chore/descripcion`: refactor, tooling, dependencias, documentación u otro trabajo sin cambio funcional claro para el usuario.

Opcional si usáis issues de GitHub: `feature/123-descripcion` o `fix/45-descripcion`.

Norma ampliada (nomenclatura en código y docs): [naming-conventions.md](../engineering/naming-conventions.md) §10.

## Crear la rama en local

Actualizar `main` y ramificar:

```bash
git checkout main
git pull origin main
git checkout -b feature/mi-tarea
```

## Subir al remoto

Primera subida y enlazar upstream (la rama se crea en `origin` si no existe):

```bash
git push -u origin feature/mi-tarea
```

Subidas siguientes en la misma rama:

```bash
git push
```

## Flujo resumido

1. Crear la rama desde `main` y hacer **commits claros y acotados**.
2. Hacer `push` y **abrir un PR hacia `main`** (ver sección siguiente).
3. Tras el merge, opcional: borrar la rama en GitHub y en local. En local, solo si ya está mergeada: `git branch -d feature/mi-tarea`.

Con este modelo se evita GitFlow completo y se mantiene nomenclatura y tracking coherentes sin reglas extra.

---

## Pull requests

### Estrategia

- **Base siempre `main`** (salvo que el equipo acuerde otra cosa explícitamente).
- **Un PR = un tema revisable**: una HU, un fix, un refactor acotado o un bloque de documentación coherente. Evita mezclar en el mismo PR capacidad nueva + fixes no relacionados + renombres masivos.
- **Commits** con mensaje que explique el *por qué*; el cuerpo del PR resume el conjunto para el revisor.
- Si trabajas en una **rama larga de revisión** (p. ej. entrega), puedes seguir haciendo commits en esa rama y un **único PR** hacia `main`, pero conviene describir bien el alcance y el plan de pruebas.

### Abrir el PR en GitHub (interfaz web)

1. Tras `git push -u origin <rama>`, GitHub suele ofrecer **“Compare & pull request”**.
2. Comprueba: **base** = `main`, **compare** = tu rama.
3. El **cuerpo del PR** se rellena solo con la plantilla del repositorio (ver [Plantillas en `.github`](#plantillas-en-github)).
4. Completa las secciones, marca el **alcance** (frontend, backend, …) y el **plan de pruebas** con lo que hayas ejecutado de verdad.
5. En **Notas para review**, indica archivos delicados, decisiones abiertas o enlaces a HU (`docs/backlog/HU-*`).

### Abrir el PR con GitHub CLI (`gh`)

Con [GitHub CLI](https://cli.github.com/) instalada y autenticada:

```bash
gh pr create --base main --title "fix: descripcion corta" --body-file .github/pull_request_template.md
```

Edita el fichero temporal o el body en el editor que abra `gh` antes de confirmar. Para actualizar el cuerpo después:

```bash
gh pr edit <numero> --body-file ruta/al-cuerpo-rellenado.md
```

### Plan de pruebas habitual (monorepo)

Marca en el PR solo lo que hayas ejecutado:

| Ámbito | Comando orientativo |
|--------|---------------------|
| **Frontend** | `cd frontend` → `npm run build`, `npm run test` |
| **Backend (reactor)** | `cd services` → `mvn verify` |
| **Un solo servicio** | `cd services` → `mvn -pl catalog-service verify` (sustituye el módulo) |
| **Manual local** | Stack según [services/README.md](../../services/README.md) e [infra/compose/README.md](../../infra/compose/README.md) |

Detalle por capa: [testing-java.md](../engineering/testing-java.md), [testing-frontend.md](../engineering/testing-frontend.md).

**Frontend:** checklist adicional en [vue-development-guide.md](vue-development-guide.md) §16.

Si el PR toca **contrato HTTP**, OpenAPI o eventos Kafka, revisa [openapi.yaml](../api/openapi.yaml) y los ADR/enlaces del [mapa canónico](../engineering/canonical-sources.md).

### Tras el merge

- Borra la rama remota en GitHub si ya no la necesitas.
- En local: `git checkout main`, `git pull`, y `git branch -d <rama>` si está mergeada.

---

## Plantillas en `.github`

GitHub usa por defecto el fichero [`.github/pull_request_template.md`](../../.github/pull_request_template.md) como **cuerpo inicial** al crear un PR en este repositorio. No hace falta copiarlo a mano: sustituye los comentarios `<!-- ... -->`, rellena listas y marca checkboxes.

### Plantilla principal (`pull_request_template.md`)

Secciones que debes completar:

| Sección | Qué poner |
|---------|-----------|
| **Resumen** | Problema que resuelve y valor del cambio |
| **Alcance** | Marca frontend / backend / infra / docs |
| **Cambios realizados** | Lista breve y accionable |
| **Evidencias** | Capturas si hay UI (opcional) |
| **Plan de pruebas** | Comandos ejecutados (`mvn verify`, `npm test`, manual, …) |
| **Checklist de calidad** | Revisa impacto, tests, contrato, seguridad según aplique |
| **Riesgos / impacto** | Efectos laterales conocidos |
| **Notas para review** | Dónde quieres feedback |

### Plantilla ER (`pull_request_er_doc_template.md`)

Fichero [`.github/pull_request_er_doc_template.md`](../../.github/pull_request_er_doc_template.md): checklist para **diagramas ER en `readme.md`** (§4.2, Mermaid, PK/FK, tipos, leyenda).

**No** sustituye la plantilla principal. Úsala cuando el PR modifique sobre todo diagramas ER del readme: copia su contenido al final del cuerpo del PR o añade una subsección «Checklist ER».

### Ejemplos de PRs ya integrados

El [readme.md del proyecto](../../readme.md) (§8 Pull requests) incluye **tres ejemplos históricos** (HU-004, HU-008, …) con el estilo de resumen y pruebas que se espera en la entrega. Son referencia de tono y detalle, no sustituyen esta guía de procedimiento.

---

## Referencias

- [docs/README.md](../README.md) — índice de documentación
- [AGENTS.md](../../AGENTS.md) — mapa del monorepo
- [canonical-sources.md](../engineering/canonical-sources.md) — fuente canónica por tema
