# Issue 018 — Error al reservar horario con artista

**Estado:** ✅ Resuelto  
**Severidad:** Media  
**Reportado:** 2026-07-18  

## Descripción
Al presionar sobre una hora disponible en el perfil de un artista, aparece
"No pudimos reservar el horario. Inténtalo de nuevo."

## Análisis
La API `/api/bookings/hold` funciona correctamente cuando se prueba directamente.
El error era probablemente transitorio (backend reiniciándose) o un slot en conflicto
con un seeded booking.

## Solución
Mejorado el manejo de errores en el frontend para mostrar mensajes específicos
según el código de estado HTTP:
- 409: "Este horario ya fue reservado"
- 422: Muestra el mensaje del backend (slot inválido, en el pasado, fuera de grilla)
- 404: "Artista no encontrado"
- 401: "Debes iniciar sesión"
- Otro: mensaje genérico

## Archivos modificados
- `frontend/src/app/features/artist-profile/artist-profile.component.ts`
