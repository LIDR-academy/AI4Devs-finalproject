# Git commit (con resumen de cambios)

Prepara y ejecuta un commit que **describe los cambios reales** del working tree. Ramas y PR: [github-branching.md](../../docs/onboarding/github-branching.md).

---

## Uso en Cursor

Invoca este comando (p. ej. `/git-commit`) o menciona `@.cursor/commands/git-commit.md` y pide: **«prepara el commit»** o **«haz el commit»**.

### Si el usuario pide preparar el commit

1. Ejecutar en la raíz del repo: `git status`, `git diff --stat`, y `git diff` (o `git diff --cached` si hay staged) solo de lo relevante.
2. Proponer mensaje con el formato de abajo (no inventar cambios no presentes en el diff).
3. Mostrar la propuesta al usuario y **esperar confirmación** antes de `git add` / `git commit`.

### Si el usuario pide hacer el commit

1. Mismo análisis que arriba.
2. `git add` solo de archivos del cambio (evitar `.env`, secretos, artefactos).
3. `git commit` con el mensaje acordado (PowerShell: varias `-m` o `-F` fichero).
4. `git status` final. **No** hacer `push` salvo petición explícita.

---

## Formato del mensaje

```
tipo(ámbito opcional): resumen en una línea (máx. ~72 caracteres)

- Bullet con cambio concreto 1
- Bullet con cambio concreto 2
```

| `tipo` | Cuándo |
|--------|--------|
| `fix` | Corrección de bug o seguridad |
| `feat` | Nueva funcionalidad |
| `chore` | Docs, refactor, tooling, deps |
| `test` | Solo tests |

Ejemplos de ámbito: `media`, `catalog`, `frontend`, `docs`, `api`.

---

## Manual rápido (PowerShell, desde la raíz del repo)

### 1. Ver qué vas a commitear

```powershell
git status
git diff --stat
```

### 2. Generar borrador del mensaje (incluye lista de ficheros)

Sustituye `fix(media)` y el resumen; completa los bullets en el Bloc de notas.

```powershell
$tipo = "fix"
$scope = "media"
$resumen = "describe aquí el porqué en una frase"
$stat = (git diff --stat 2>$null) -join "`n"
if (-not $stat) { $stat = (git diff --cached --stat 2>$null) -join "`n" }

@"
${tipo}(${scope}): $resumen

Cambios (diff --stat):
$stat

- 
- 
"@ | Set-Content -Encoding utf8 commit-msg.txt

notepad commit-msg.txt
```

### 3. Commit con ese texto

```powershell
git add -A
git status
git commit -F commit-msg.txt
```

Opcional: borrar el borrador tras el commit: `Remove-Item commit-msg.txt`

### Atajo mínimo (mensaje en una línea)

Cuando el cambio es pequeño y ya lo tienes claro:

```powershell
git add -A
git status
git commit -m "fix(media): resumen" -m "- detalle 1`n- detalle 2"
```

---

## Comprobaciones antes del commit

- [ ] El mensaje refleja el **diff**, no trabajo no incluido en el commit.
- [ ] No se añaden `.env`, credenciales ni `target/`, `node_modules/`, etc.
- [ ] Si tocaste lógica: tests del módulo afectado (`mvn -pl … test`, `npm test` en `frontend/`).

---

## Después del commit

```powershell
git log -1 --stat
git push
```

Primera subida de rama: `git push -u origin HEAD`
