# [UNLOKD-019] Implementar Previsualización Difuminada en Frontend

## Tipo
- [x] Feature

## Épica
EPIC-4: Multimedia, Notificaciones y UX

## Sprint
Sprint 4

## Estimación
**Story Points**: 5

## Descripción
Implementar componentes React para mostrar mensajes bloqueados con estilos visuales atractivos, iconografía, blur en multimedia, indicadores de tipo de condición.

## Historia de Usuario Relacionada
- HU-012: Ver previsualización difuminada de mensaje bloqueado

## Caso de Uso Relacionado
- UC-012: Ver Previsualización Bloqueada

## Criterios de Aceptación
- [ ] Componente `<LockedMessagePreview />`
- [ ] Estilos visuales distintivos (gradiente, borde, icono 🔒)
- [ ] Blur CSS para multimedia (filter: blur(20px))
- [ ] Indicadores por tipo: TIME, PASSWORD, QUIZ
- [ ] Botón "Desbloquear" (habilitado/deshabilitado según condición)
- [ ] Animaciones sutiles
- [ ] Responsive y accesible

## Tareas Técnicas
- [ ] Crear componente `LockedMessagePreview`
- [ ] Estilos CSS con gradientes y blur
- [ ] Renderizado condicional por conditionType
- [ ] Integración con timeline de mensajes
- [ ] Tests de componentes (Jest + React Testing Library)

## Labels
`frontend`, `react`, `ui`, `ux`, `sprint-4`, `p1-high`

