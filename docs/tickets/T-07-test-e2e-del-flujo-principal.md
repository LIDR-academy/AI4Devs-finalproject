# T-07 - Test E2E del flujo principal

**Área:** Testing
**Historias relacionadas:** todas las historias en alcance (0.1 a 0.6)

## Descripción

Automatizar un test end-to-end que recorra el flujo completo: registrar especie → registrar planta → registrar lectura → generar recomendación de IA → consultar historial.

## Alcance

* Test E2E (backend, o backend+frontend si el tiempo lo permite) que:
  1. Crea una especie con rangos conocidos.
  2. Crea una planta de esa especie.
  3. Registra una lectura fuera de rango (p. ej. humedad muy baja).
  4. Solicita la recomendación de IA y comprueba que el nivel de riesgo no es "bajo".
  5. Consulta el historial y comprueba que la lectura y la recomendación aparecen.

## Criterios de aceptación

* El test pasa de forma reproducible (usando un mock o fixture de la respuesta de IA si es necesario, para no depender de la disponibilidad real del proveedor en CI).
* El test falla claramente si se rompe cualquier paso del flujo E2E.
