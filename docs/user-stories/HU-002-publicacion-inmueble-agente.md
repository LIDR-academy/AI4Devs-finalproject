# HU-002 — Publicación de inmueble por agente de arrendamiento

## Historia
Como agente de arrendamiento,
quiero publicar y gestionar inmuebles en nombre de un propietario registrado en la plataforma,
para ofrecer el servicio de gestión inmobiliaria de forma digital sin requerir presencia física del propietario en cada paso.

## Criterios de aceptación
- [ ] El agente puede crear una publicación de inmueble con los mismos campos que el propietario (HU-001), pero asociando explícitamente la propiedad a un propietario registrado en la plataforma.
- [ ] El agente debe seleccionar al propietario representado antes de poder publicar un inmueble en su nombre (el propietario debe existir en el sistema).
- [ ] El inmueble publicado por el agente aparece vinculado al propietario representado, visible para ambos en sus respectivos paneles.
- [ ] El agente puede editar los datos de los inmuebles que gestiona.
- [ ] El propietario puede ver, en su panel, los inmuebles que un agente ha publicado en su nombre.
- [ ] El agente no puede publicar inmuebles sin estar asociado a al menos un propietario representado.
- [ ] El estado del inmueble cambia automáticamente a "No disponible" al completarse un arrendamiento, igual que en el flujo del propietario directo.

## Notas técnicas
- Requiere un mecanismo de asociación entre agente y propietario (invitación, código, o flujo de vinculación a definir en diseño técnico).
- Esta HU tiene dependencia funcional con HU-001: comparte el formulario de publicación; la diferencia es la capa de representación/propiedad del inmueble.
- El modelo de permisos debe distinguir el rol Agente del rol Propietario a nivel de acceso y visibilidad.

## Prioridad
Media

## Estimación
05 — Grande (11h)
