# HU9-FE-001: Creación de Reseña Después de la Cita

## Info
- **ID**: HU9-FE-001  
- **Prioridad**: Media  
- **Estimación**: 8h  
- **Dependencias**: HU9-BE-001, HU9-DB-001, HU4-DB-001

## CA cubiertos
- Auth patient y dueño de la cita completada.
- Formulario: rating 1-5 (estrellas), comentario 10-1000 chars, contador de caracteres.
- Validaciones en tiempo real; sanitizar texto antes de enviar.
- Mensajes: éxito “pendiente de moderación”; errores 403/404/400/409.
- i18n ES/EN.

## Pasos Técnicos
1) Página `app/appointments/[id]/review/page.tsx`
   - Obtener detalle de cita y revisar si ya tiene reseña (GET `/appointments/{id}/reviews`).
2) Componente `components/reviews/ReviewForm.tsx`
   - `react-hook-form` + Zod; estrellas como input controlado.
   - POST `/api/v1/appointments/{id}/reviews`.
3) Hook `hooks/useReview.ts`
   - React Query para obtener/crear reseña; invalidar cache al éxito.
4) UI
   - Mostrar estado “pending” tras envío.
   - Bloquear envío si ya existe reseña.

## Archivos clave
- `frontend/src/app/appointments/[id]/review/page.tsx`
- `frontend/src/components/reviews/ReviewForm.tsx`
- `frontend/src/hooks/useReview.ts`
- i18n es/en

## Testing (HU9-TEST-001)
- Validaciones de rating/comentario.
- Errores de backend mostrados.
- Flujo éxito marca pending.
