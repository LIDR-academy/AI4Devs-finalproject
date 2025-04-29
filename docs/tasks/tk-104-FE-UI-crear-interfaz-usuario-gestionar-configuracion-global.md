# Ticket: TK-104

## Título
FE-UI: Crear Interfaz Usuario para Gestionar Configuración Global (Checkbox Automatización)

## Descripción
Desarrollar una sección en la interfaz de administración del frontend del ATS MVP donde un Admin pueda ver y modificar la configuración global `enable_auto_stage_move` (ej. mediante un checkbox).

## User Story Relacionada
US-032: Automatizar (Opcionalmente) Movimiento Inicial a Etapa Sugerida

## Criterios de Aceptación Técnicos (Verificables)
1.  En la sección de Administración, existe un apartado "Configuración General" o similar.
2.  Dentro de esta sección, se muestra un checkbox etiquetado "Habilitar movimiento automático a etapa sugerida por IA".
3.  El estado inicial del checkbox refleja el valor actual obtenido de la API (TK-102/TK-105).
4.  Al cambiar el estado del checkbox, se habilita un botón "Guardar Cambios".
5.  Al hacer clic en "Guardar Cambios", se invoca la lógica frontend (TK-105) para enviar la actualización a la API.

## Solución Técnica Propuesta (Opcional)
Añadir una nueva sub-ruta/componente a la sección de administración existente. Usar componentes UI estándar (checkbox, botón).

## Dependencias Técnicas (Directas)
* Sección de Administración existente (si la hay) o crearla.
* TK-105 (Lógica Frontend API Configuración)
* Diseño de UI/Mockups.

## Prioridad (Heredada/Ajustada)
Could Have (Heredada de US-032)

## Estimación Técnica Preliminar
[ 3 ] [horas] - [Desarrollo componente UI, integración checkbox/botón]

## Asignación Inicial
Equipo Frontend

## Etiquetas
frontend, ui, configuration, settings, admin, checkbox

## Comentarios
Interfaz simple para una única configuración por ahora.

## Enlaces o Referencias
[Link a Mockups/Diseño de UI]