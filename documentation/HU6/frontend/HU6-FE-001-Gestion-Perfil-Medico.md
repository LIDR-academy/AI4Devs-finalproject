# HU6-FE-001: Gestión de Perfil Médico

## Info
- **ID**: HU6-FE-001  
- **Tipo**: Frontend  
- **Prioridad**: Media  
- **Estimación**: 10h (1.5 sp)  
- **Dependencias**: HU6-BE-001, HU2-DB-001

## CA cubiertos
- Ver perfil completo (datos personales, profesionales, especialidades, coordenadas, verificación, rating).
- Editar firstName, lastName, phone, bio, address, postalCode.
- Geocodificar dirección/código postal; mostrar advertencia si falla.
- Validaciones: first/lastName obligatorios; bio <=1000; address/postalCode obligatorios si se actualiza.
- i18n ES/EN; invalidar caches de búsqueda al guardar.

## Pasos Técnicos
1) **Página Perfil** `app/doctor/profile/page.tsx`
   - Obtener perfil con GET `/api/v1/doctors/me`.
   - Mostrar secciones: personales, profesionales, especialidades (solo lectura), verificación.
2) **Formulario** `components/doctor/ProfileForm.tsx`
   - `react-hook-form` + Zod para validaciones.
   - Botón “Guardar cambios”; deshabilitar mientras guarda.
3) **Geocoding (frontend opcional)** `useGeocode(address, postalCode)`
   - Llama a Google Maps; si falla, set warning, permitir guardar.
4) **Hook API** `hooks/useDoctorProfile.ts`
   - `useQuery` para perfil; `useMutation` PATCH `/api/v1/doctors/me`.
   - Invalida cache de perfil y, opcional, cache de búsqueda.
5) **UI/UX**
   - Mostrar estado de verificación.
   - Mensajes de éxito/error; mostrar advertencia geocoding.

## Archivos clave
- `frontend/src/app/doctor/profile/page.tsx`
- `frontend/src/components/doctor/ProfileForm.tsx`
- `frontend/src/hooks/useDoctorProfile.ts`
- `frontend/src/messages/es.json` / `en.json` (nuevos textos)

## Testing (HU6-TEST-001)
- Validaciones de formulario.
- Manejo de advertencia de geocoding.
- Actualización y refresco de datos.
