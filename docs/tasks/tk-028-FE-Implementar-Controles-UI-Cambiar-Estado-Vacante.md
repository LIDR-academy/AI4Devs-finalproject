# Ticket: TK-028

## Título
FE: Implementar Controles de UI para Cambiar Estado de Vacante

## Descripción
Añadir botones o controles interactivos en la interfaz de usuario del frontend (ej. en la vista de detalle de vacante o en la lista) que permitan al Reclutador iniciar las acciones de cambio de estado (Publicar, Cerrar, Reabrir, Archivar). Los controles visibles deben depender del estado actual de la vacante.

## User Story Relacionada
US-007: Publicar y Despublicar una Vacante

## Criterios de Aceptación Técnicos (Verificables)
1.  En la vista de detalle de la vacante (y/o lista), se muestran botones de acción para cambiar el estado.
2.  Los botones visibles dependen del estado actual:
    * Si estado = 'BORRADOR', se muestra "Publicar".
    * Si estado = 'PUBLICADA', se muestra "Cerrar".
    * Si estado = 'CERRADA', se muestran "Reabrir" y "Archivar".
    * Si estado = 'ARCHIVADA', no se muestran acciones de cambio de estado (o una acción "Desarchivar" si se decide permitir).
3.  Los botones tienen textos claros que indican la acción.
4.  Al hacer clic en un botón, se invoca la lógica correspondiente (TK-029).

## Solución Técnica Propuesta (Opcional)
Usar botones estándar del framework UI. La lógica de visibilidad condicional se basará en el campo `estado` de la vacante cargada.

## Dependencias Técnicas (Directas)
* TK-029 (Lógica Frontend para llamar a API de estado)
* Lógica para obtener el estado actual de la vacante (parte de TK-025).
* Diseño de UI/Mockups.

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-007)

## Estimación Técnica Preliminar
[ 3 ] [horas] - [Añadir botones a UI existente, implementar lógica de visibilidad condicional]

## Asignación Inicial
Equipo Frontend

## Etiquetas
frontend, ui, vacancy, job, status, button, controls

## Comentarios
Asegurar que las acciones sean claras para el usuario.

## Enlaces o Referencias
[Link a Mockups/Diseño de UI]