# HU-003 — Búsqueda de inmuebles disponibles

## Historia
Como inquilino,
quiero buscar y filtrar inmuebles disponibles con información actualizada en tiempo real,
para encontrar opciones reales de arrendamiento sin perder tiempo visitando o contactando inmuebles que ya fueron arrendados.

## Criterios de aceptación
- [ ] El inquilino puede buscar inmuebles sin necesidad de estar registrado en la plataforma.
- [ ] Los resultados muestran únicamente inmuebles con estado "Disponible".
- [ ] El inquilino puede filtrar resultados por al menos: ciudad/barrio, valor máximo mensual, número mínimo de habitaciones y tipo de inmueble.
- [ ] Cada resultado muestra como mínimo: foto principal, dirección general (barrio/sector), valor mensual, número de habitaciones y número de baños.
- [ ] Al completarse un arrendamiento, el inmueble desaparece de los resultados de búsqueda de forma automática, sin intervención manual del propietario o agente.
- [ ] El inquilino puede acceder al detalle completo de un inmueble (todas las fotos, descripción, datos del formulario de publicación).
- [ ] Desde el detalle del inmueble, el inquilino puede iniciar el proceso de solicitud de arrendamiento (acción que requiere registro/login).

## Notas técnicas
- La disponibilidad en tiempo real depende del evento de cambio de estado que se dispara en el flujo de arrendamiento (coordinación con HU-001 / HU-005). Si el sistema usa consistencia eventual, debe quedar claro el SLA de actualización.
- El mecanismo de búsqueda y filtrado debe definirse en diseño técnico (búsqueda full-text, índices, o motor de búsqueda dedicado).
- El acceso sin registro es intencional para reducir la fricción de descubrimiento; el registro se solicita solo al momento de iniciar una solicitud.

## Prioridad
Alta

## Estimación
08 — Muy Grande (17h)
