BACKEND — Ticket 1

Título: Modelado de datos base + i18n + métricas mínimas

Descripción:
Implementar modelos y migraciones núcleo del MVP en Django ORM: User (extensible), Game, UserGameLibrary, GameRequest. Añadir esqueleto i18n para contenidos textuales (soporte es/en/fr a nivel de UI; dejar preparado almacenamiento de textos traducibles) y un esquema mínimo de telemetría (EventLog) para registrar búsquedas y acciones de biblioteca/wishlist.

Criterios de Aceptación:

Modelos y migraciones ejecutan sin errores.

UserGameLibrary: unicidad por (user_id, game_id) + estado; permite mover entre owned y wishlist.

Índices: Game(name), Game(category), GameRequest(status, created_at).

Tabla EventLog (tipo, payload, user_id opcional, timestamp) para registrar: search_performed, added_to_wishlist, added_to_library.

Django Admin operativo para las 4 entidades + EventLog.

Esquema i18n listo (p. ej., campos traducibles o integración pendiente con lib como django-modeltranslation documentada; UI servirá en es inicialmente, con etiquetas preparadas para en/fr).

Prioridad: Alta
Estimación: 8 puntos de historia
Asignado a: Equipo de Backend
Etiquetas: Backend, Base de Datos, i18n, Analytics, Sprint 1
Comentarios: Documentar decisión i18n (campos por idioma vs. tabla de traducciones) para escalar a en/fr.
Enlaces: PRD, guía de modelos, decisión i18n (ADR-001)
Historial de Cambios:

16/09/2025: Creado por [nombre]