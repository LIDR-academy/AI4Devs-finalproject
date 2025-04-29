# Ticket: TK-145

## Título
FE-UI: Añadir Indicador Notificaciones (Campana+Badge) a Layout Principal

## Descripción
Modificar el layout principal/barra de navegación del frontend ATS MVP para incluir un icono (ej. campana) que sirva como indicador de notificaciones. Debe mostrar un badge/contador con el número de notificaciones no leídas (obtenido de TK-147).

## User Story Relacionada
US-041: Recibir Notificaciones Internas sobre Eventos Clave

## Criterios de Aceptación Técnicos (Verificables)
1.  En el layout principal (header/navbar), se muestra un icono de campana.
2.  Junto al icono (o sobre él), se muestra un badge numérico si el contador de notificaciones no leídas (estado de TK-147) es > 0.
3.  Si el contador es 0, el badge no se muestra o muestra '0'.
4.  El icono es clickeable para abrir/cerrar el panel de notificaciones (TK-146).

## Solución Técnica Propuesta (Opcional)
Usar icono de librería UI. Usar componente Badge. El estado del contador vendrá del store/servicio de notificaciones (TK-147).

## Dependencias Técnicas (Directas)
* Layout Principal/Navbar existente.
* TK-146 (Panel que se abre al hacer clic)
* TK-147 (Lógica que proporciona el contador)

## Prioridad (Heredada/Ajustada)
Could Have (Heredada de US-041)

## Estimación Técnica Preliminar
[ 2 ] [horas] - [Añadir icono y badge a UI, conectar con estado del contador]

## Asignación Inicial
Equipo Frontend

## Etiquetas
frontend, ui, layout, notification, indicator, badge, icon

## Comentarios
Elemento visual clave para alertar al usuario.

## Enlaces o Referencias
[Documentación librería UI/iconos]