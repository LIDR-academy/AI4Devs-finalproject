# Issue-005: Foto de tatuaje en reseña no se persiste ni se muestra en perfil del artista

**Fecha:** 2026-07-15
**Contexto:** US0013 (calificar artista post-sesión) implementada mock-first: el upload de foto en el formulario de calificación hace preview local pero no sube el archivo al Object Storage ni guarda la URL en la reseña.
**Estado:** ⏸️ Pendiente

---

## Descripción del problema

En `ReviewFormComponent` (`frontend/src/app/features/booking/review-form/`), el campo de foto:

1. Muestra **preview local** (FileReader → base64) ✅
2. **No sube el archivo** a MinIO / S3 — el campo `tattooPhotoUrl` se envía siempre como `null`
3. La reseña se guarda con `tattoo_photo_url = null`
4. En el perfil del artista (`GET /api/artists/{slug}/reviews`), la foto nunca aparece

### Fragmento de código afectado

```typescript
// review-form.component.ts — submit()
this.reviewService.createReview(this.bookingId(), {
  ...
  tattooPhotoUrl: null   // ← siempre null; upload pendiente
});
```

---

## Causa raíz

El upload de foto requiere un flujo de **presigned URL** (igual al ya usado para imágenes de portafolio):

1. Frontend solicita `POST /api/uploads/presigned-url` con `{ filename, contentType }`
2. Backend genera URL temporal de MinIO/S3
3. Frontend hace `PUT` directo con el archivo binario
4. Frontend obtiene la URL pública y la incluye en `tattooPhotoUrl`

Este flujo **no está implementado** para reviews; solo existe para portfolio items.

---

## Impacto

| Componente | Impacto |
|---|---|
| `ReviewFormComponent` | Campo foto es decorativo — no persiste |
| `GET /api/artists/{slug}/reviews` | `tattooPhotoUrl` siempre `null` |
| Perfil del artista (US0006) | Fotos de healing nunca se muestran |
| CA5 de US0013 | ❌ No cumplida |

---

## Solución propuesta

1. **Backend**: reutilizar o extender el endpoint de presigned URL existente para aceptar `context=review`
2. **Frontend**: en `ReviewFormComponent.submit()`, si hay `photoFile`:
   - Solicitar presigned URL
   - Hacer PUT del archivo
   - Resolver URL pública → pasar como `tattooPhotoUrl`
3. **Frontend**: mostrar spinner/progreso durante el upload antes de enviar la review

---

## Notas

- MinIO ya corre en Docker (`inklink-storage`, puerto 9000). Las credenciales están en `docker-compose.yml`.
- El bucket `inklink-images` ya existe y acepta imágenes de portafolio.
- Hasta que se resuelva este issue, el campo foto del formulario debería ocultarse o mostrar un aviso "próximamente".
