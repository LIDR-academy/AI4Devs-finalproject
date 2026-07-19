# Issue-013: Artistas no aparecen en mapa ni en lista por ciudad

**Fecha:** 2026-07-18  
**Contexto:** Los artistas por ciudad ya no están apareciendo en la vista de mapa ni en modo lista. Posible regresión en el servicio de geolocalización o en la carga de datos.  
**Estado:** 🔧 En progreso

---

## Problema

- La vista de mapa no muestra marcadores de artistas
- La vista de lista por ciudad tampoco muestra resultados
- El problema puede ser una regresión reciente (cambio en API, seeder, o lógica de filtrado)

## Comportamiento esperado

- Los artistas deben aparecer en el mapa con marcadores en su ciudad/ubicación
- La vista de lista debe mostrar los artistas filtrados por ciudad correctamente
- La búsqueda por ciudad debe retornar resultados consistentes entre mapa y lista

## Posibles causas

- Las coordenadas de latitud/longitud de los artistas en la base de datos son nulas o incorrectas
- El endpoint de búsqueda por ciudad retorna una lista vacía o un error silencioso
- El seeder no está asignando ubicaciones geográficas a los artistas
- Cambio en la estructura del DTO que rompe el parsing en el frontend
- Error de CORS o autenticación en el endpoint de artistas por ciudad

## Solución

1. Verificar que los artistas en la base de datos tengan coordenadas válidas (`latitude`, `longitude`, `city`)
2. Probar el endpoint `/api/artists?city=...` directamente y revisar la respuesta
3. Revisar logs del backend para errores en el servicio de geolocalización
4. Validar que el componente de mapa recibe y procesa correctamente los datos
5. Si es regresión del seeder, re-seedear con datos de ubicación correctos

## Archivos a modificar

- `backend/Services/ArtistService.cs` — lógica de filtrado por ciudad
- `backend/Controllers/ArtistController.cs` — endpoint de búsqueda
- `backend/Seed/DatabaseSeeder.cs` — datos de ubicación de artistas
- `frontend/src/pages/ArtistMap.tsx` (o equivalente) — consumo del endpoint
- `frontend/src/components/ArtistList/` — renderizado de resultados

## Relacionado

- Issue-008 (seeder de datos)
- Posible regresión introducida en cambios recientes al seeder o a la API de artistas
