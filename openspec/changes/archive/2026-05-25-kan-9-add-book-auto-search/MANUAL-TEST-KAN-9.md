# Manual test checklist — KAN-9 / UC-01

## Prerequisites

- PostgreSQL running; `backend/.env` with `DATABASE_URL`, `JWT_SECRET`, optional `GOOGLE_BOOKS_API_KEY`
- `TYPEORM_SYNCHRONIZE=true` or run `npm run migration:run` in `backend/`
- Backend: `cd backend && npm run start:dev`
- Frontend: `cd frontend && npm run dev` with `VITE_API_URL=http://localhost:3000/v1`

## Escenario 1 — Abrir modal de búsqueda

- [ ] Ir a Book Tracker (tras login dev)
- [ ] Pulsar «Añadir libro»
- [ ] Se abre modal con buscador por título o autora

## Escenario 2 — Selección de edición

- [ ] Buscar un título con varias ediciones (p. ej. «Harry Potter»)
- [ ] Aparecen varias filas con metadatos
- [ ] Se puede seleccionar una edición (resaltada)

## Escenario 3 — Libro guardado correctamente

- [ ] Confirmar con «Guardar»
- [ ] El libro aparece en la tabla con portada, autora, páginas y género (si la API los devolvió)
- [ ] Estado inicial `pendiente`

## UC-01 — Fallback

- [ ] Buscar un título que Open Library no devuelva pero Google Books sí (verificar en red o logs que se usa fallback cuando OL vacío)

## Errores

- [ ] Duplicar el mismo libro → mensaje de duplicado (409)
- [ ] Sin resultados → mensaje «No se encontraron libros»

---

## Selección de portada (kan-9-edition-cover-picker)

- [ ] Tras elegir una edición (p. ej. «Harry Potter» o «1984»), aparece el paso «Elige portada»
- [ ] Si hay varias portadas, se muestran en grid y se puede seleccionar una distinta
- [ ] Al guardar, la tabla del Book Tracker muestra la portada elegida (no otra aleatoria)
- [ ] «Volver a resultados» mantiene la búsqueda anterior
- [ ] Si falla la carga de portadas, «Reintentar» funciona sin perder la edición
- [ ] Sin portadas disponibles: se puede guardar con placeholder / continuar sin portada
