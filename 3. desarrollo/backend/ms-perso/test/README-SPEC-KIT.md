# Starter de Spec-Driven Development (NestJS + Angular + PostgreSQL)

Este paquete agrega:
- Carpeta `spec/` con plantillas
- Workflows de GitHub Actions (CI Node, CodeQL, Dependency Review, Pages)
- Plantilla de Issue para features

## Cómo integrarlo
1. Copia todo el contenido en la **raíz del repo** (monorepo o microservicio).
2. Crea una rama `spec-kit-bootstrap` y haz commit.
3. Ajusta `spec/00-constitution.md` a tus políticas internas (SEPS, seguridad, observabilidad).
4. Abre un Issue con la plantilla **Feature Spec** y desarrolla desde la spec.
5. Activa **GitHub Pages** en Settings → Pages (branch `gh-pages` si se crea automáticamente).

## Recomendaciones
- Exige que cada PR referencie la Feature Spec y marque los criterios de aceptación.
- Mantén actualizadas las Specs cuando cambie el alcance.
