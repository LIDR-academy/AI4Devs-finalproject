BACKEND — Ticket 2

Título: Endpoints/Views Catálogo + Búsqueda (móvil-first, filtros, paginación)

Descripción:
Crear endpoints/vistas para listado de juegos con filtros y paginación optimizada para móvil, y detalle del juego. Entregar vistas HTML + fragmentos HTMX. Registrar evento search_performed en EventLog.

Criterios de Aceptación:

Listado con filtros: jugadores (obligatorio), tiempo/edad/categoría (opcionales) y texto.

Paginación con tamaño por defecto orientado a móvil (p. ej., 12 ítems; ajustable por PAGE_SIZE), orden por relevancia/nombre.

Vista de detalle con atributos clave e imagen.

Validación de parámetros y estado “sin resultados”.

HTMX: endpoints entregan fragmentos parciales para swaps rápidos.

Performance (dev orientativo): ≤ 300 ms en listado con dataset semilla; consultas optimizadas con select_related/prefetch_related.

Registro en EventLog de búsquedas (término + filtros).

Prioridad: Alta
Estimación: 5 puntos de historia
Asignado a: Equipo de Backend
Etiquetas: Backend, Búsqueda, Performance, HTMX, Sprint 1
Comentarios: Dejar “gancho” para recomendaciones futuras.
Enlaces: Contrato de plantilla/fragmentos, PRD
Historial de Cambios:

16/09/2025: Creado por [nombre]