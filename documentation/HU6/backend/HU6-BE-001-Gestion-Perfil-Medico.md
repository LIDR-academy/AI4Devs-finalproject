# HU6-BE-001: Endpoint de Gestión de Perfil Médico

## Info
- **ID**: HU6-BE-001  
- **Tipo**: Backend  
- **Prioridad**: Media  
- **Estimación**: 12h (2 sp)  
- **Dependencias**: HU2-DB-001 (DOCTORS), HU1-DB-001 (USERS)

## CA cubiertos
- Auth JWT, role doctor; 403 si no es doctor.
- GET `/doctors/me`: retorna perfil completo (user + doctor + especialidades + rating).
- PATCH `/doctors/me`: actualizar firstName, lastName, phone, bio, address, postalCode; geocodificar si cambia dirección/CP.
- Advertencia si geocoding falla, pero guardar igual.
- Invalidar cache de búsqueda de médicos y cache de perfil.
- Auditoría: acción `update_doctor_profile` con old/new values e IP.

## Pasos Técnicos
1) **DTO** `dto/doctors/update-profile.dto.ts`
   - Validar longitudes (bio <=1000, phone E.164, address/postalCode obligatorios si se envían).
2) **Servicio** `services/doctor-profile.service.ts`
   - `getMyProfile(userId)` -> join USERS + DOCTORS + SPECIALTIES + rating.
   - `updateMyProfile(userId, dto)`:
     - Verificar user.role=doctor.
     - Si address/postalCode cambian -> geocodingService.geocode; guardar coords si éxito; warning si falla.
     - Update USERS (firstName, lastName, phone) y DOCTORS (bio, address, postalCode, lat/lng).
     - Invalidar caches en Redis: búsqueda de médicos (keys by doctorId/specialty) y perfil.
     - Registrar audit_log con old/new values.
3) **Controlador** `controllers/doctors.controller.ts`
   - GET/PATCH `/api/v1/doctors/me`
   - Guards: JwtAuthGuard + RolesGuard('doctor').
4) **Cache**: usar CacheManager; keys `doctor:{id}`, `doctors:*`.

## Archivos a crear/modificar
- `backend/src/dto/doctors/update-profile.dto.ts`
- `backend/src/services/doctor-profile.service.ts`
- `backend/src/controllers/doctors.controller.ts` (añadir rutas me)
- `backend/src/services/geocoding.service.ts` (reusar HU2)
- `backend/src/entities/doctor.entity.ts` (asegurar campos bio/address/coords)

## Testing (HU6-TEST-001)
- GET devuelve perfil completo.
- PATCH actualiza datos y coords; warning si falla geocoding.
- Cache invalidado tras update.
- Auditoría creada.
