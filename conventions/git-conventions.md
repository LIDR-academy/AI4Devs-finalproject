# Convenciones de Git para Aura Planning

## Nomenclatura de Ramas

| Tipo | Patrón | Ejemplo |
|------|---------|---------|
| Feature | `feature/<ticket-id>-short-description` | `feature/PSRP-123-rsvp-form` |
| Bug Fix | `fix/<ticket-id>-short-description` | `fix/PSRP-456-magic-link-expiry` |
| Hotfix | `hotfix/<ticket-id>-short-description` | `hotfix/PSRP-789-production-login` |
| Chore | `chore/<short-description>` | `chore/update-dependencies` |
| Docs | `docs/<short-description>` | `docs/update-readme` |

## Mensajes de Commit

### Formato
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Tipos
| Tipo | Descripción |
|------|-------------|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de bug |
| `refactor` | Refactorización de código (sin cambio funcional) |
| `docs` | Cambios en documentación |
| `style` | Formato, sin cambio de código |
| `test` | Añadir/actualizar tests |
| `chore` | Build, tooling, dependencias |
| `perf` | Mejoras de rendimiento |
| `ci` | Cambios en CI/CD |

### Ejemplos
```
feat(rsvp): add dietary restrictions field to form

fix(auth): handle expired magic link gracefully

docs(readme): update installation instructions

refactor(db): extract repository interfaces
```

### Reglas
- Usar imperativo ("add" no "added")
- Mantener línea de asunto bajo 72 caracteres
- Referenciar ticket al final: `Refs: PSRP-123`
- Separar asunto de cuerpo con línea en blanco
- Cuerpo explica **qué** y **por qué**, no cómo

## Pull Requests

### Formato de Título
```
<type>(<scope>): <description> [PSRP-###]
```

### Template de Descripción de PR
```markdown
## Summary
Brief description of changes.

## Type of Change
- [ ] Feature
- [ ] Bug Fix
- [ ] Refactor
- [ ] Documentation

## Related Tickets
Closes #PSRP-123

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots (if UI changes)
```

### Checklist de Revisión
- [ ] Código sigue guidelines de estilo
- [ ] Tests escritos y pasando
- [ ] No console.log/debugger dejado
- [ ] Variables nombradas significativamente
- [ ] Manejo de errores implementado
- [ ] Comentarios añadidos para lógica compleja

### AI Agents (GitHub CLI)
**Regla Estricta para Agentes AI:** Al crear Pull Requests vía la CLI de GitHub (`gh pr create`), el agente siempre debe apuntar explícitamente al fork del usuario (`pedrosrp/AI4Devs-finalproject`) en lugar del repositorio upstream padre (`LIDR-academy/AI4Devs-finalproject`).
Para hacer esto, se debe usar la bandera `--repo pedrosrp/AI4Devs-finalproject`.
Ejemplo: `gh pr create --repo pedrosrp/AI4Devs-finalproject --title "..." --body "..."`

## Flujo de Git

### Flujo Estándar
```
1. Crear rama desde main
2. Hacer commits con mensajes claros
3. Push rama a origin
4. Crear PR en GitHub
5. Solicitar review
6. Merge después de aprobación
7. Borrar rama
```

### Mantener Rama Actualizada
```bash
# Mientras trabajas en rama de feature
git fetch origin
git rebase origin/main

# O merge (si se prefiere)
git fetch origin
git merge origin/main
```

## Tagging de Releases

```
v<major>.<minor>.<patch>
```

Ejemplo: `v1.0.0`

## Alias Útiles

Añadir a tu `.gitconfig`:
```ini
[alias]
    lg = log --oneline --graph --decorate
    st = status
    co = checkout
    br = branch
    unstage = reset HEAD --
    last = log -1 HEAD
```