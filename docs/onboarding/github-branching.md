# Ramas Git y GitHub (estrategia sencilla)

Guía corta para trabajar con ramas en este repositorio y publicarlas en GitHub.

## Ramas habituales

- **main**: código integrado y desplegable (o habitualmente estable).
- **Ramas de trabajo**: una rama corta por tarea, issue o pull request.

## Nombrado

Prefijo + descripción en minúsculas y guiones:

- `feature/descripcion`: nueva capacidad.
- `fix/descripcion`: corrección de defecto.
- `chore/descripcion`: refactor, tooling, dependencias u otro trabajo sin cambio funcional claro para el usuario.

Opcional si usáis issues de GitHub: `feature/123-descripcion` o `fix/45-descripcion`.

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

1. Crear la rama desde `main` y hacer commits claros y acotados.
2. Hacer `push` y abrir un PR hacia `main`.
3. Tras el merge, opcional: borrar la rama en GitHub y en local. En local, solo si ya está mergeada: `git branch -d feature/mi-tarea`.

Con este modelo se evita GitFlow completo y se mantiene nomenclatura y tracking coherentes sin reglas extra.
