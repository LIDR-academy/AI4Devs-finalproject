# HU-005 — Análisis de riesgo o contratación de seguro de arrendamiento

## Historia
Como inquilino,
quiero completar el análisis de riesgo crediticio o la contratación de un seguro de arrendamiento dentro de la plataforma,
para obtener la aprobación necesaria para formalizar el contrato de arrendamiento de forma digital, sin tramitar documentos físicos ni visitar oficinas.

## Criterios de aceptación
- [ ] El inquilino puede iniciar el proceso de análisis de riesgo / seguro solo si su identidad fue previamente verificada (HU-004).
- [ ] El sistema presenta al inquilino el mecanismo habilitado por la plataforma (estudio de crédito, seguro de arrendamiento, o ambos según lo que se decida — ver notas técnicas).
- [ ] El inquilino puede adjuntar la documentación requerida por el proceso (ej. desprendibles de pago, certificado laboral) directamente en la plataforma, sin enviarla por canales externos.
- [ ] El sistema consume la API externa correspondiente (riesgo crediticio o seguro) y devuelve un resultado: aprobado o rechazado.
- [ ] Si el resultado es aprobado, el sistema habilita al inquilino para proceder a la firma del contrato de arrendamiento.
- [ ] Si el resultado es rechazado, el inquilino recibe una notificación con el motivo (en la medida en que la API lo permita) y el proceso se detiene.
- [ ] El propietario o agente recibe una notificación cuando el análisis de riesgo / seguro del inquilino es aprobado para su inmueble.
- [ ] El resultado del análisis queda registrado en el sistema con fecha, estado y el inmueble al que aplica.
- [ ] Tras la aprobación, el sistema genera o facilita la firma del contrato de arrendamiento digital con validez legal en Colombia.

## Notas técnicas
- PUNTO ABIERTO CRITICO (bloquea el diseño técnico): El PRD no ha definido si el mecanismo es estudio de crédito, seguro de arrendamiento, o ambos. Son flujos, costos e integraciones distintos. El estudio de crédito filtra antes de arrendar (APIs candidatas: Datacrédito/TransUnion, Cifin); el seguro cubre al propietario ante impago posterior (candidatos: Suramericana, Bolívar Inmobiliaria). Esta decisión también define quién paga el costo del proceso (¿inquilino, propietario, plataforma?). Esta HU no puede entrar a diseño técnico hasta que ese punto esté resuelto.
- La firma del contrato digital requiere integración con un proveedor de firma electrónica con validez legal bajo la Ley 527 de 1999 (candidatos: Docusign, Viafirma, Zoho Sign). Aunque no está listada como funcionalidad independiente en el PRD, es parte del ciclo completo y se activa en este paso. Se recomienda evaluar si debe separarse como HU propia.
- Esta HU tiene dependencia estricta con HU-004 (identidad verificada) y es prerequisito para HU-006 (pago mensual).

## Prioridad
Alta

## Estimación
13 — Gigante (26h)
