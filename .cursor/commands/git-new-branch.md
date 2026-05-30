# Nueva rama de trabajo

Crea una rama nueva desde **`main` actualizado**, dejando la rama anterior intacta para su PR. Norma del repo: [github-branching.md](../../docs/onboarding/github-branching.md).

---

## Validación del flujo (respecto a la guía)

| Paso que planteabas | ¿Alineado con `github-branching.md`? | Qué hacer en este comando |
|---------------------|--------------------------------------|---------------------------|
| 1. Commit de cambios pendientes en la rama actual (con confirmación) | **Sí** (recomendable; alternativa: `git stash`) | Preguntar si hay cambios; ofrecer commit vía [git-commit.md](git-commit.md) o stash |
| 2. Actualizar `main` desde remoto (`git pull`) | **Sí** — es el § «Crear la rama en local» | Tras `checkout main`, `git pull origin main` |
| 3. Merge de la rama actual **→** `main` local | **No** en el flujo habitual | **No hacerlo** salvo petición explícita: integrar en `main` local sin PR ensucia la línea base. El merge a `main` va por **PR en GitHub** |
| 4. Crear la nueva rama | **Sí** — `git checkout -b prefijo/nombre` desde `main` | Pedir prefijo (`feature`/`fix`/`chore`) y nombre |

**Flujo canónico del proyecto** (rama nueva desde `main` limpio y al día):

1. Cerrar o guardar trabajo en la rama actual (commit confirmado o stash).
2. `git checkout main`
3. `git pull origin main`
4. `git checkout -b feature/mi-tarea` (o `fix/…`, `chore/…`)
5. La rama anterior sigue existiendo para `push` + PR; no hace falta mergearla a `main` local antes.

**Opcional** (solo si el usuario lo pide al cerrar la rama anterior): en la rama vieja, `git merge main` para traer `main` **a la feature** (no al revés). Útil si seguirá trabajando en esa rama; no es necesario para crear la rama nueva.

---

## Uso en Cursor

Invoca `/git-new-branch` o `@.cursor/commands/git-new-branch.md`.

### Datos a pedir al usuario

1. **Nombre** de la rama (sin prefijo): p. ej. `control-acceso-fotografias`.
2. **Prefijo:** `feature` | `fix` | `chore` (según [github-branching.md](../../docs/onboarding/github-branching.md)).
3. Si hay **cambios sin commitear**: ¿commit (recomendado), stash, o abortar?

### Pasos que debe ejecutar el agente (en orden)

1. `git status` y `git branch --show-current`. Si hay cambios:
   - Mostrar resumen (`git diff --stat`).
   - **Preguntar confirmación** antes de commitear.
   - Si confirma commit: seguir [git-commit.md](git-commit.md) (mensaje con diff real).
   - Si prefiere stash: `git stash push -m "WIP antes de nueva rama"` (avisar cómo recuperar: `git stash pop`).
   - Si aborta: parar.

2. `git checkout main`  
   Si falla por cambios restantes, volver al paso 1.

3. `git pull origin main`  
   Si hay conflicto, parar y pedir al usuario resolver.

4. **No** ejecutar `git merge <rama-anterior>` en `main` salvo que el usuario diga explícitamente que quiere integrar esa rama en local (explicar que lo normal es PR).

5. `git checkout -b <prefijo>/<nombre>` (minúsculas, guiones).

6. Mostrar: rama creada, rama anterior que quedó en remoto/local, y recordatorio:
   - Primera subida: `git push -u origin HEAD`
   - PR hacia `main` cuando corresponda ([github-branching.md](../../docs/onboarding/github-branching.md) § Pull requests).

**No** hacer `push` de la rama nueva salvo petición explícita.

---

## Manual rápido (PowerShell)

Sustituye variables al inicio; ejecuta bloque a bloque.

```powershell
$prefijo = "fix"          # feature | fix | chore
$nombre  = "mi-tarea"     # minúsculas y guiones

git status
git branch --show-current
```

Si hay cambios pendientes → commit o stash antes de seguir (ver [git-commit.md](git-commit.md)).

```powershell
git checkout main
git pull origin main
git checkout -b "${prefijo}/${nombre}"
git branch --show-current
```

Primera subida de la rama nueva:

```powershell
git push -u origin HEAD
```

---

## Errores frecuentes

| Situación | Acción |
|-----------|--------|
| «Cannot checkout: uncommitted changes» | Commit o `git stash` |
| Estás en `main` sin cambios | Saltar paso 1; pull + `checkout -b` |
| Quieres seguir en la rama vieja más tarde | No borrarla; abre PR o `git checkout <rama-vieja>` |
| Creaste la rama desde `main` desactualizado | `git checkout main`, `git pull`, borrar rama local errónea si no tiene commits importantes, volver a crear |

---

## Referencias

- [github-branching.md](../../docs/onboarding/github-branching.md)
- [git-commit.md](git-commit.md)
