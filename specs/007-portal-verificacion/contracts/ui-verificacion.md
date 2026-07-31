# Contract: UI — Pantalla de verificación

**Feature**: `007-portal-verificacion` | **Date**: 2026-07-30

Contrato de interfaz de usuario alineado a [IMAGEN_CORPORATIVA_PORTAL_VERIFICACION.md](../../../docs/IMAGEN_CORPORATIVA_PORTAL_VERIFICACION.md) y a los escenarios de [spec.md](../spec.md).

## Shell (todas las rutas)

| Elemento | Requisito |
|---|---|
| Logo CCB | Visible; `alt` descriptivo |
| Texto “Servicio Virtual” | Visible en desktop; puede ocultarse &lt; md según guía |
| Barra servicio | Fondo `#033864` / token; título “Certificados Electrónicos” |
| Menú off-canvas | Enlaces institucionales + T&C + legal; operable por teclado |
| Auth chrome | MUST NOT mostrar login, logout ni badges de sesión |

## Formulario de verificación

| Control | Contrato |
|---|---|
| Migas | `Solicitudes › Verificación de Certificados` (patrón legacy) |
| Título | `h3.rotulo` (o equivalente con acento institucional) |
| Alerta vigencia | `alert-info` — texto de 60 días calendario / consultas ilimitadas |
| Instrucciones | Lista `.lista` |
| Input código | Label asociado; ayuda “14 caracteres”; editable durante loading |
| Checkbox T&C | Obligatorio; enlace al PDF institucional `https://recursos.ccb.org.co/ccb/servicios_linea/tyc/Terminos_Y_condiciones_verificacion_Certificados_Electronicos.pdf` |
| CTA Verificar | Disabled si `!terminos` **o** `loading`; muestra estado de carga cuando `loading` |
| Error formato | Inline; sin llamada HTTP |
| Mensajes resultado | Diferenciados: vigente / expirado / no existe / documento no disponible / rate limit / error temporal |

## Visor PDF

| Elemento | Contrato |
|---|---|
| Contenedor | `.pdf-viewer-frame` (marco punteado) |
| Visibilidad | Solo con documento Base64 usable tras éxito |
| Descarga | Control `.btn` “Descargar” entrega el mismo PDF |
| Lazy load | Módulo/`pdfjs-dist` no bloquea first paint del formulario |

## Estados del CTA

| Condición | CTA |
|---|---|
| T&C no aceptados | Disabled |
| T&C OK, idle | Enabled |
| Verificación en curso | Disabled + busy/loading |
| Tras limpiar resultado (misma visita) | T&C sigue marcado; CTA según código/T&C |

## Accesibilidad (flujo principal)

- Contraste y foco visibles (WCAG 2.1 AA).
- Errores perceptibles por lector de pantalla (`aria-live` / `role="alert"`).
- Iconos decorativos con `aria-hidden="true"`.
- Sin depender solo del color para distinguir vigente vs error.

## Anti-patrones (MUST NOT)

- Material Design, Inter/Roboto como fuente principal, pills redondeados, degradados púrpura.
- Cards genéricas que sustituyan el layout corporativo plano.
- Mensajes de fallo de auditoría al usuario.
- Mostrar PDF en expirado / inexistente / formato inválido.
