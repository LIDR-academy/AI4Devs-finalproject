# PRD — Plataforma de Arrendamiento Residencial de Larga Estadía

## Problema

El proceso de arrendamiento residencial en Colombia (foco inicial: Medellín) está fragmentado y es mayoritariamente manual. Los portales inmobiliarios muestran información desactualizada porque las agencias gestionan los negocios en oficina física y actualizan el sistema con retraso. La documentación del inquilino (cédula, referencias, desprendibles de pago) se envía por correo o WhatsApp a un agente que realiza el estudio de crédito usando plataformas externas. El resultado es un proceso lento, opaco y presencial, donde el inquilino puede esperar horas o días para saber si un inmueble ya fue arrendado.

**A quién le duele más:** al inquilino — debe recopilar y enviar documentación de forma manual, en algunos casos ir físicamente a firmar en una oficina, y enfrentarse a inmuebles ya ocupados que siguen apareciendo disponibles.

## Objetivo

Digitalizar el ciclo completo de arrendamiento residencial de larga estadía (mínimo 6 meses), permitiendo que propietarios publiquen, inquilinos arrienden y paguen mensualmente, y el sistema gestione la validación de identidad y el análisis de riesgo — todo dentro de la plataforma, sin presencialidad, sin firma física, sin intermediación manual.

## Usuarios

| Rol | Necesidad principal |
|-----|-------------------|
| Propietario | Publicar su inmueble, recibir solicitudes de arrendamiento, aprobar inquilinos y cobrar la renta mensual desde la plataforma |
| Agente de arrendamiento | Publicar y gestionar inmuebles en nombre del propietario cuando este no lo hace directamente |
| Inquilino | Buscar inmuebles disponibles y reales, validar su identidad, adjuntar documentación, pasar por el proceso de riesgo, firmar el contrato y pagar mensualmente — todo de forma digital |

## Funcionalidades clave (MVP)

1. **Publicación de inmuebles** — Propietarios o agentes publican la propiedad con información, fotos y disponibilidad real. El sistema refleja el estado actualizado; cuando se arrienda, el inmueble se marca como no disponible automáticamente.

2. **Búsqueda de inmuebles** — Inquilinos pueden buscar y filtrar inmuebles disponibles. La disponibilidad es en tiempo real (sin depender de actualizaciones manuales de la agencia).

3. **Validación de identidad del inquilino** — Integración con API externa para verificar la identidad del inquilino (cédula de ciudadanía colombiana). Es una condición previa al proceso de arrendamiento.

4. **Análisis de riesgo o contratación de seguro de arrendamiento** — Integración con API externa para realizar estudio de crédito al inquilino O para contratar un seguro de arrendamiento que cubra al propietario ante impago. (*Ver punto abierto más abajo — esta decisión impacta el modelo de negocio.*)

5. **Pago mensual de renta** — El inquilino paga la mensualidad dentro de la plataforma mediante integración con pasarela de pagos colombiana. El flujo de cobro queda registrado en el sistema.

## Fuera de alcance

Todo lo que no está en la lista de funcionalidades clave del MVP queda excluido de la primera versión y se irá incorporando iterativamente. Algunos ejemplos implícitos: gestión de mantenimiento del inmueble, chat entre partes, sistema de disputas o reclamaciones, facturación electrónica, dashboards avanzados para propietarios con múltiples inmuebles, módulos de reportes, y refinamientos de UX post-lanzamiento.

## Métricas de éxito

No se han definido métricas cuantitativas todavía — marcado como pendiente para una etapa posterior.

Criterio cualitativo acordado: un inquilino debe poder completar el ciclo completo (encontrar inmueble, validar identidad, pasar análisis de riesgo, firmar contrato y pagar mensualidad) de forma 100% digital, sin visitas presenciales ni firmas físicas.

## Restricciones

- **Plataforma:** Web y mobile (si nativo o responsive web queda a definir en diseño técnico).
- **Mercado:** Colombia, con foco inicial en Medellín. Las integraciones de identidad, riesgo y pagos deben ser compatibles con el marco regulatorio y los proveedores del ecosistema financiero colombiano.
- **Firma electrónica:** El ciclo end-to-end requiere firma de contrato digital válida legalmente en Colombia (Ley 527 de 1999 y normativa vigente) — implica integración con proveedor de firma electrónica certificada.
- **Equipo:** Proyecto unipersonal — el usuario es el único tomador de decisiones de producto.
- **Plazo:** Sin fecha límite definida actualmente.

## Supuestos

- El propietario es responsable de mantener actualizada la información de su inmueble; el sistema refleja automáticamente el estado de disponibilidad tras un arrendamiento exitoso.
- Las APIs externas de validación de identidad, análisis de riesgo/seguro y pasarela de pagos son disponibles, documentadas y accesibles para el mercado colombiano — pero los proveedores concretos aún no han sido seleccionados.
- El ciclo de arrendamiento incluye firma de contrato digital. Se asume que existe un proveedor de firma electrónica con validez legal en Colombia disponible para integrar.
- El modelo de ingresos de la plataforma no está definido todavía (comisión, suscripción, porcentaje del arriendo, etc.).

## Puntos abiertos (requieren decisión antes de diseño técnico)

1. **Estudio de crédito vs. seguro de arrendamiento:** Son dos mecanismos distintos con implicaciones diferentes. El estudio de crédito filtra inquilinos antes de arrendar; el seguro de arrendamiento cubre al propietario si el inquilino aprobado deja de pagar. Pueden complementarse o excluirse mutuamente según el modelo de negocio. Esta decisión define qué API integrar y quién asume el costo (¿lo paga el inquilino? ¿el propietario? ¿la plataforma?).

2. **Proveedores de APIs:** Identidad (ej. Truora, Jumio, Onfido con soporte Colombia), riesgo/crédito (ej. Datacrédito/TransUnion, Cifin), seguros de arrendamiento (ej. Suramericana, Bolívar Inmobiliaria), pasarela de pagos (ej. Wompi, PayU, Epayco), y firma electrónica (ej. Docusign, Viafirma, Zoho Sign con validez colombiana).

3. **Modelo de ingresos:** No definido. Impacta las decisiones de qué es gratuito, qué es pago y quién absorbe el costo de las integraciones.

4. **Web + mobile:** ¿Aplicación mobile nativa (iOS/Android), PWA, o app web responsive? Impacta el stack técnico y el esfuerzo de desarrollo.

## Riesgos

| Riesgo | Impacto | Probabilidad |
|--------|---------|--------------|
| Las APIs de riesgo/identidad en Colombia tienen acceso restringido, costos elevados o contratos corporativos difíciles de conseguir para un producto nuevo | Alto — puede bloquear una funcionalidad MVP | Media |
| Baja adopción inicial por falta de confianza en una plataforma nueva (propietarios no publican, inquilinos no la usan) | Alto — sin inventario no hay demanda, y sin demanda no hay inventario | Alta |
| La decisión entre estudio de crédito vs. seguro de arrendamiento no se toma antes del diseño, generando retrabajo | Medio — afecta la arquitectura de integraciones | Media |
| Validez legal de la firma electrónica en contratos de arrendamiento en Colombia no está suficientemente validada antes de construir | Alto — podría invalidar contratos firmados en la plataforma | Baja-media |
| Scope creep al no tener métricas ni priorización explícita desde el inicio | Medio — puede dilatar el MVP indefinidamente | Media |

## Próximos pasos sugeridos

1. **Decidir el mecanismo de riesgo:** Estudio de crédito, seguro de arrendamiento, o ambos. Definir quién paga y cómo se integra en el flujo del inquilino.
2. **Validar acceso a APIs colombianas:** Hacer contacto temprano con proveedores de identidad (Truora u otros) y riesgo (Datacrédito/Cifin) para entender requisitos de acceso y costos antes de comprometerse al diseño técnico.
3. **Definir plataforma mobile:** Decidir entre nativo, PWA o responsive web — tiene impacto directo en el stack y el esfuerzo estimado.
4. **Definir modelo de ingresos inicial:** Aunque sea provisional, permite tomar decisiones de diseño informadas.
5. **Generar historias de usuario por rol:** Descomponer las 5 funcionalidades del MVP en historias concretas por cada rol (propietario, agente, inquilino) para estimar esfuerzo y planificar fases.
6. **Diseño técnico (backend y frontend):** Una vez resueltos los puntos abiertos anteriores, iniciar el plan de arquitectura con el backend-expert y frontend-expert.
