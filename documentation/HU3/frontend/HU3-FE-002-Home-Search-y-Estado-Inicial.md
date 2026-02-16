# HU3-FE-002: Home Search y Estado Inicial de /search

## Info
- **ID**: HU3-FE-002  
- **Tipo**: Frontend  
- **Prioridad**: Alta  
- **Estimación**: 6h  
- **Dependencias**: HU3-BE-002, HU3-FE-001

## CA cubiertos
- Formulario de búsqueda embebido en hero de home.
- Botón "Soy médico" preservado en banner principal.
- Navegación a `/search` con query params desde home.
- Validación de submit: requiere especialidad y al menos una fuente de ubicación (`lat/lng` o `postalCode`).
- Estado inicial de `/search` con últimos 5 médicos registrados si no hay búsqueda previa.
- Consistencia visual entre formulario de home y formulario de `/search`.

## Comportamientos implementados en esta rama
- Home reemplaza CTA de "Buscar especialistas" por formulario completo.
- Home solicita geolocalización al entrar y usa coordenadas si están disponibles.
- Home envía también `postalCode` cuando está informado para habilitar fallback backend.
- `/search` consume query params iniciales (`specialty`, `radius`, `lat`, `lng`, `postalCode`) y dispara búsqueda automática cuando aplica.
- `/search` muestra resultados de `latest` cuando no existe búsqueda previa y cambia a resultados filtrados al buscar.

## Decisiones de negocio
- Priorizar experiencia de búsqueda directa desde home para reducir fricción.
- Mantener visibilidad del CTA "Soy médico" como objetivo de captación.
- Permitir búsqueda solo con datos mínimos confiables de ubicación.
- Mostrar "últimos 5 médicos aprobados" como estado inicial informativo de discoverability.

## Limitaciones actuales
- Geolocalización depende de permisos del navegador y puede fallar por políticas del dispositivo.
- El estado inicial de `/search` usa criterio de fecha de registro, no ranking clínico/relevancia.
- La precisión por código postal depende de la calidad del dato guardado en perfiles médicos.

## Pasos técnicos
1) `frontend/app/components/home/HomeHeroActions.tsx`
   - Formulario embebido en hero.
   - Geolocalización automática y navegación con query params.
2) `frontend/app/components/search/DoctorSearch.tsx`
   - Estado inicial con últimos doctores.
   - Unificación visual con home.
   - Validación de submit y lectura de query params.
3) `frontend/app/[locale]/page.tsx`
   - Home mantiene integración con `HomeHeroActions`.
4) i18n `frontend/messages/es.json` y `frontend/messages/en.json`
   - Mensajes para estado inicial y resultados recientes.

## Testing (HU3-TEST-002)
- Validar navegación home -> `/search` con parámetros esperados.
- Validar que sin búsqueda previa se renderizan 5 últimos médicos.
- Validar bloqueo de submit sin ubicación ni código postal.
