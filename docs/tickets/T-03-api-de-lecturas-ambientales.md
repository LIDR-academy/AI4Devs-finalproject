# T-03 - API de lecturas ambientales

**Área:** Backend
**Historia relacionada:** [0.2](../user-stories/0.2-registrar-condiciones-de-cultivo.md)

## Descripción

Implementar el endpoint para registrar manualmente una lectura (humedad, temperatura, horas de luz, acidez del sustrato, riego) asociada a una planta.

## Alcance

* `POST /plants/{id}/care-records`: crea una lectura para la planta indicada, con `recordedAt` asignado automáticamente por el servidor.
* `GET /plants/{id}/care-records`: lista las lecturas de una planta ordenadas por fecha descendente.
* Validación de rangos razonables de entrada (p. ej. humedad y horas de luz no negativas, `soilPh` entre 0 y 14).

## Criterios de aceptación

* Se puede registrar una lectura para una planta existente y la fecha/hora se asigna automáticamente.
* Registrar una lectura para una planta inexistente devuelve un error controlado.
* El listado de lecturas de una planta se devuelve ordenado por fecha.
