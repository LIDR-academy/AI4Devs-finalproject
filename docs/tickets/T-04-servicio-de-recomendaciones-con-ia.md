# T-04 - Servicio de recomendaciones con IA

**Área:** Backend
**Historia relacionada:** [0.4](../user-stories/0.4-obtener-analisis-de-ia.md)

## Descripción

Implementar el servicio que, dada una lectura (`CareRecord`), construye un prompt estructurado con la especie, la lectura, el último riego y las desviaciones respecto a los rangos recomendados, lo envía a la API de OpenAI, y persiste la recomendación (`AIRecommendation`) devuelta.

## Alcance

* `GET /plants/{id}/care-records/{careRecordId}/recommendation`: genera (si no existe ya) y devuelve la recomendación de IA para esa lectura.
* Construcción del prompt: especie, última lectura, último riego registrado, rangos recomendados de la especie y desviaciones detectadas.
* Parseo de la respuesta de la IA a los campos `riskLevel`, `recommendationText`.
* Manejo de errores si el proveedor de IA no responde (timeout, error de API): la petición no debe romper el resto del flujo, se debe devolver un error controlado.

## Criterios de aceptación

* Dada una lectura con valores fuera de rango, la recomendación generada indica un nivel de riesgo distinto de "bajo".
* La recomendación queda persistida y asociada a la lectura de origen.
* El prompt utilizado queda documentado (ver `prompts.md`, pendiente de crear).
