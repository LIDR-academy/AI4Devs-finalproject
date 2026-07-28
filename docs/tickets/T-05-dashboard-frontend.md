# T-05 - Dashboard frontend

**Área:** Frontend
**Historias relacionadas:** [0.3](../user-stories/0.3-consultar-recomendaciones-por-especie.md), [0.4](../user-stories/0.4-obtener-analisis-de-ia.md)

## Descripción

Construir la pantalla principal (Nuxt 3 / Vue 3 / Pinia) donde el usuario ve el inventario de plantas, puede darlas de alta, seleccionar su especie, ver los rangos recomendados y lanzar la generación de una recomendación de IA.

## Alcance

* Listado de plantas con su especie y ubicación.
* Formulario de alta de planta con selector de especie (mostrando sus rangos recomendados al seleccionarla).
* Formulario de registro de lectura ambiental.
* Vista de la recomendación de IA generada para una lectura (nivel de riesgo, explicación, acción, prioridad).

## Criterios de aceptación

* El usuario puede completar el flujo alta de planta → registrar lectura → ver recomendación sin recargar la página manualmente.
* Los rangos recomendados de la especie se muestran antes de guardar la lectura, para dar contexto al usuario.
* Estados de carga y error de la llamada a la IA están contemplados en la interfaz (no se queda "colgada" sin feedback).
