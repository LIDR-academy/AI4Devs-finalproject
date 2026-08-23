# HU-004 — Validación de identidad del inquilino

## Historia
Como inquilino,
quiero verificar mi identidad mediante mi cédula de ciudadanía colombiana a través de la plataforma,
para poder avanzar en el proceso de arrendamiento de forma completamente digital, sin presentarme físicamente ni enviar documentos por canales externos.

## Criterios de aceptación
- [ ] El inquilino puede iniciar el proceso de validación de identidad desde su perfil o desde el flujo de solicitud de arrendamiento.
- [ ] El proceso solicita como mínimo el número de cédula de ciudadanía colombiana y permite adjuntar o capturar la imagen del documento (frente y dorso).
- [ ] El sistema consume una API externa de validación de identidad y devuelve un resultado: aprobado o rechazado.
- [ ] Si la validación es aprobada, el perfil del inquilino queda marcado como "Identidad verificada" y puede continuar con el proceso de arrendamiento.
- [ ] Si la validación es rechazada, el inquilino recibe un mensaje explicativo y no puede avanzar en el proceso hasta resolverlo.
- [ ] Un inquilino no puede iniciar una solicitud de arrendamiento formal sin haber completado exitosamente la validación de identidad.
- [ ] La validación de identidad se realiza una sola vez por cuenta de usuario; no se repite para cada solicitud de arrendamiento posterior.
- [ ] El resultado de la validación queda registrado en el sistema con fecha y estado.

## Notas técnicas
- Punto abierto del PRD: el proveedor de la API de validación de identidad no está definido. Candidatos mencionados: Truora, Jumio, Onfido (con soporte para Colombia). La selección impacta el contrato de integración, el costo por validación y los requisitos regulatorios. Esta decisión debe tomarse antes del diseño técnico de esta HU.
- Esta HU es un prerrequisito funcional y de seguridad para HU-005 y HU-006. Bloquea el avance del flujo si no se completa.
- Según las restricciones del PRD, la integración debe ser compatible con el marco regulatorio colombiano.
- El manejo de documentos de identidad implica consideraciones de privacidad y protección de datos (Ley 1581 de 2012 en Colombia).

## Prioridad
Alta

## Estimación
08 — Muy Grande (17h)
