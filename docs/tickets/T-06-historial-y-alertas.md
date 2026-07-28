# T-06 - Historial y alertas

**Área:** Frontend
**Historia relacionada:** [0.5](../user-stories/0.5-consultar-historial-de-cuidados.md)

## Descripción

Construir la vista de historial de una planta, mostrando sus lecturas y recomendaciones de IA ordenadas por fecha, y resaltando visualmente las lecturas con nivel de riesgo alto o moderado (alerta).

## Alcance

* Vista de historial accesible desde la ficha de cada planta.
* Listado de lecturas + recomendación asociada, ordenado por fecha descendente.
* Resaltado visual (badge/color) según `riskLevel`.

## Criterios de aceptación

* Desde la ficha de una planta se accede a su historial completo.
* Las entradas con riesgo alto son visualmente distinguibles de las de riesgo bajo.
* El historial se actualiza tras registrar una nueva lectura sin recargar toda la página.
