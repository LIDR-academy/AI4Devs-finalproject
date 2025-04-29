# Ticket: TK-146

## Título
FE-UI: Crear Componente Panel/Lista de Notificaciones

## Descripción
Desarrollar un componente UI (ej. un dropdown, popover, panel lateral) que se muestre al hacer clic en el indicador de notificaciones (TK-145). Debe listar las notificaciones recientes del usuario (obtenidas de TK-147), mostrando el mensaje, la fecha y un enlace si aplica. Debe permitir marcar como leídas.

## User Story Relacionada
US-041: Recibir Notificaciones Internas sobre Eventos Clave

## Criterios de Aceptación Técnicos (Verificables)
1.  Existe un componente (ej. `NotificationPanel`) que recibe la lista de notificaciones como prop.
2.  El componente se muestra/oculta al interactuar con TK-145.
3.  Renderiza una lista de las notificaciones recibidas.
4.  Cada item muestra: `mensaje`, `fecha_creacion` (formateada), y si `link_url` existe, el item es un enlace a esa URL.
5.  Los items no leídos tienen un estilo visual diferente (ej. fondo, punto).
6.  (Opcional) Existe un botón/enlace "Marcar todas como leídas" que invoca la lógica en TK-147.
7.  (Opcional) Al hacer clic en un item (o en un botón específico), se marca esa notificación como leída (invocando TK-147) y se navega al `link_url` si existe.

## Solución Técnica Propuesta (Opcional)
Usar componentes Dropdown/Popover/List del framework UI.

## Dependencias Técnicas (Directas)
* TK-145 (Elemento UI que abre/cierra este panel)
* TK-147 (Lógica que proporciona la lista y maneja acciones)
* Diseño de UI/Mockups.

## Prioridad (Heredada/Ajustada)
Could Have (Heredada de US-041)

## Estimación Técnica Preliminar
[ 4 ] [horas] - [Desarrollo componente UI, renderizado lista, formato datos, interacción marcar leída]

## Asignación Inicial
Equipo Frontend

## Etiquetas
frontend, ui, component, notification, list, panel, dropdown

## Comentarios
Define cómo se visualizan las notificaciones.

## Enlaces o Referencias
[Link a Mockups/Diseño de UI]