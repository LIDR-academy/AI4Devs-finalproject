# Git Conventions for Aura Planning

## Branch Naming

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feature/<ticket-id>-short-description` | `feature/PSRP-123-rsvp-form` |
| Bug Fix | `fix/<ticket-id>-short-description` | `fix/PSRP-456-magic-link-expiry` |
| Hotfix | `hotfix/<ticket-id>-short-description` | `hotfix/PSRP-789-production-login` |
| Chore | `chore/<short-description>` | `chore/update-dependencies` |
| Docs | `docs/<short-description>` | `docs/update-readme` |

## Commit Messages

### Format
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types
| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Code refactoring (no functional change) |
| `docs` | Documentation changes |
| `style` | Formatting, no code change |
| `test` | Adding/updating tests |
| `chore` | Build, tooling, dependencies |
| `perf` | Performance improvements |
| `ci` | CI/CD changes |

### Examples
```
feat(rsvp): add dietary restrictions field to form

fix(auth): handle expired magic link gracefully

docs(readme): update installation instructions

refactor(db): extract repository interfaces
```

### Rules
- Use imperative mood ("add" not "added")
- Keep subject line under 72 characters
- Reference ticket at end: `Refs: PSRP-123`
- Separate subject from body with blank line
- Body explains **what** and **why**, not how

## Pull Requests

### Title Format
```
<type>(<scope>): <description> [PSRP-###]
```

### PR Description Template
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

### Review Checklist
- [ ] Code follows style guidelines
- [ ] Tests written and passing
- [ ] No console.log/debugger left
- [ ] Variables named meaningfully
- [ ] Error handling implemented
- [ ] Comments added for complex logic

## Git Workflow

### Standard Flow
```
1. Create branch from main
2. Make commits with clear messages
3. Push branch to origin
4. Create PR on GitHub
5. Request review
6. Merge after approval
7. Delete branch
```

### Keeping Branch Updated
```bash
# While working on feature branch
git fetch origin
git rebase origin/main

# Or merge (if prefer)
git fetch origin
git merge origin/main
```

## Tagging Releases

```
v<major>.<minor>.<patch>
```

Example: `v1.0.0`

## Useful Aliases

Add to your `.gitconfig`:
```ini
[alias]
    lg = log --oneline --graph --decorate
    st = status
    co = checkout
    br = branch
    unstage = reset HEAD --
    last = log -1 HEAD
```