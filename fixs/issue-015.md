# Issue-015: No se puede dejar reseña en reservas completadas

**Fecha:** 2026-07-18  
**Contexto:** En Mis Reservas, las reservas con estado completado no permiten dejar reseña. Se debe verificar la lógica de habilitación del botón de reseña y el flujo de navegación.  
**Estado:** 🔧 En progreso

---

## Problema

- Las reservas con estado `completado` no muestran el botón de reseña, o el botón está deshabilitado
- El usuario no puede calificar ni comentar sobre su experiencia con el artista
- No está claro si el problema es en la condición de renderizado del botón, en la ruta de navegación, o en el backend

## Comportamiento esperado

- Las reservas con estado `completado` deben mostrar un botón "Dejar reseña" habilitado
- Al hacer clic, el usuario debe poder ingresar una calificación (estrellas) y un comentario
- La reseña debe guardarse y asociarse al artista y a la reserva correspondiente
- Una vez enviada, el botón debe cambiar a "Ver mi reseña" o desaparecer si no se permiten ediciones

## Posibles causas

- La condición en el frontend que habilita el botón usa un valor de estado incorrecto (ej. `"completed"` vs `"completado"`)
- La ruta de navegación al formulario de reseña no existe o está mal configurada
- El endpoint de creación de reseña requiere autenticación o parámetros que no se están enviando
- La reserva no tiene el campo `canReview` en `true` desde el backend

## Solución

1. Revisar la condición en el componente de reserva que renderiza/habilita el botón de reseña
2. Verificar que el valor del estado de la reserva coincida exactamente con el esperado (`completado`, `completed`, etc.)
3. Confirmar que la ruta `/reservas/:id/resena` (o equivalente) existe y está protegida correctamente
4. Probar el endpoint `POST /api/reviews` con una reserva completada y verificar la respuesta
5. Asegurar que el flujo completo (botón → formulario → envío → confirmación) funciona end-to-end

## Archivos a modificar

- `frontend/src/pages/MyBookings.tsx` (o `Reservations.tsx`) — condición del botón de reseña
- `frontend/src/pages/ReviewForm.tsx` — formulario de reseña
- `backend/Controllers/ReviewController.cs` — endpoint de creación de reseña
- `backend/Services/ReviewService.cs` — lógica de validación de reseña

## Relacionado

- Flujo de reservas y estados de booking
- Issue-012 (pago con Flow) — las reservas completadas deben tener pago confirmado
