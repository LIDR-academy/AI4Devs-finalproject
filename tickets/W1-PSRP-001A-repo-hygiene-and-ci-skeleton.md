## PSRP-001A: chore(infra): repo-hygiene-and-ci-skeleton

**Type:** chore
**Priority:** P0 (Must)
**Estimated Effort:** XS (0.5d)
**Sprint Week:** W1
**Dependencies:** None

## Resumen de Funcionalidad

Crear archivos de configuración del repositorio (.gitignore, .editorconfig) y el esqueleto inicial del pipeline CI de GitHub Actions. Esta es la base — cada fase posterior añade un paso de validación al CI, manteniendo main siempre verde.

## Requisitos

- [ ] Crear `.gitignore` en la raíz del repositorio cubriendo: .NET 10 (bin/, obj/), Node.js/Angular (node_modules/, dist/), Docker, Kubernetes, IDE (VS Code, Visual Studio, Rider), y patrones de SO
- [ ] Crear `.editorconfig` en la raíz con reglas C# 14 (file-scoped namespaces, nullable enabled, indent 4 espacios) y TypeScript strict (indent 2 espacios, no implicit any)
- [ ] Crear `.github/workflows/ci.yml` con triggers en push a main y pull_request
- [ ] Añadir job `validate` que se ejecuta en ubuntu-latest y confirma que el pipeline funciona
- [ ] Verificar que CI pasa en un push de prueba

## Notas Técnicas

- **CI:** El workflow empieza como esqueleto — solo un paso `echo` que pasa. Cada fase posterior (B, C, D, E) añade jobs al mismo archivo.
- **.gitignore:** Incluir patrones para todas las capas aunque no existan aún — mejor prevenir commits accidentales.
- **.editorconfig:** Basado en `conventions/technical-conventions.md`. UTF-8, trim trailing whitespace, final newline.

## Criterios de Aceptación

- [ ] AC1: Dado el repositorio clonado, cuando se ejecuta `git status`, entonces no hay archivos generados (bin/, obj/, node_modules/) listados como untracked
- [ ] AC2: Dado un archivo .cs abierto en un IDE compatible con editorconfig, entonces se aplican reglas C# 14 (file-scoped namespaces, nullable, 4-space indent)
- [ ] AC3: Dado un archivo .ts abierto en un IDE compatible con editorconfig, entonces se aplican reglas TypeScript (strict, 2-space indent)
- [ ] AC4: Dado un push a main o un PR, cuando el workflow CI corre, entonces el job `validate` completa con éxito

## Elementos Relacionados

- **Architecture:** 03-project-structure.md, 04-infrastructure-deployment.md
- **Conventions:** technical-conventions.md

## Bloqueadores

Ninguno

## Branch Name

`feature/PSRP-001A-repo-hygiene`
