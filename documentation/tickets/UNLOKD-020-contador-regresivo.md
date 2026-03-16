# [UNLOKD-020] Implementar Contador Regresivo Visual para Mensajes Temporizados

## Tipo
- [x] Feature

## Épica
EPIC-4: Multimedia, Notificaciones y UX

## Sprint
Sprint 4

## Estimación
**Story Points**: 3

## Descripción
Implementar componente React de contador regresivo que se actualiza cada segundo para mensajes con condición TIME. Incluye formato legible, animaciones y cambio de estado al llegar a 0.

## Historia de Usuario Relacionada
- HU-013: Ver contador regresivo para mensaje temporizado

## Caso de Uso Relacionado
- Parte de UC-007 (Enviar Mensaje Temporal) y UC-012 (Ver Previsualización)

## Criterios de Aceptación
- [ ] Componente `<Countdown availableFrom={date} />`
- [ ] Actualización cada segundo con useEffect
- [ ] Formato legible: "2d 3h", "3h 15m", "30s"
- [ ] Icono de reloj animado
- [ ] Al llegar a 0: cambio visual a "Ya puedes desbloquear!" (verde)
- [ ] Animación de atención al desbloquearse
- [ ] Optimización: pausar si tab no visible (Page Visibility API)
- [ ] Accesible (aria-live)

## Tareas Técnicas
- [ ] Crear componente `Countdown`
- [ ] Implementar lógica de cálculo de tiempo restante
- [ ] Función de formateo de duración
- [ ] useEffect con setInterval para actualización
- [ ] Estilos CSS y animaciones
- [ ] Detectar cuando llega a 0 y cambiar UI
- [ ] Optimizar con Page Visibility API
- [ ] Tests de componente

## Labels
`frontend`, `react`, `ui`, `countdown`, `sprint-4`, `p1-medium`

