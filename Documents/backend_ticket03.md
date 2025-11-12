BACKEND — Ticket 3

Título: Autenticación + Acciones de Biblioteca/Wishlist (hooks social login futuro)

Descripción:
Habilitar login/registro/logout con Django Auth y rutas POST seguras para agregar/quitar juegos a Biblioteca (owned) y Wishlist (wishlist). Preparar hooks para social login futuro (p. ej., configuración base de django-allauth sin habilitar proveedores). Registrar eventos added_to_wishlist / added_to_library.

Criterios de Aceptación:

Rutas de auth operativas (email/contraseña).

Acciones de biblioteca/wishlist con CSRF, validaciones y manejo de duplicados (mover entre estados con confirmación).

Si no hay sesión, redirigir a login y volver al origen.

EventLog registra altas/bajas en biblioteca/wishlist (con user_id).

Configuración documentada para habilitar social login (a futuro) sin romper el MVP.

Prioridad: Alta
Estimación: 5 puntos de historia
Asignado a: Equipo de Backend
Etiquetas: Backend, Auth, Seguridad, Analytics, Sprint 1
Comentarios: Considerar throttle básico para evitar abuso.
Enlaces: PRD, ADR-002 (hooks social login)
Historial de Cambios:

16/09/2025: Creado por [nombre]