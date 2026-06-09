# 6. Especificación de Funcionalidades del MVP

> [Volver al Índice PRD](../PRD.md) | [Anterior: Registro y Onboarding](05-registration-onboarding.md) | [Siguiente: Desglose de Trabajo](07-work-breakdown.md)

---

## 6.1 Panel de Gestión del Anfitrión (Host Management Panel)

### 6.1.1 Editor de Plantillas (Template Editor)

**Descripción:** Una herramienta visual para personalizar las plantillas de invitación. Los usuarios seleccionan entre 3 plantillas preestablecidas y personalizan los colores, la tipografía y las imágenes principales (hero images).

**Alcance (MVP):**
- 3 plantillas de boda preestablecidas
- Personalización: color primario, color secundario, familia de fuentes, subida de hero image
- Vista previa en tiempo real
- Autoguardado (debounce de 2 segundos)
- Sin drag-and-drop, sin HTML/CSS personalizado

**Historias de Usuario:**

| ID | Historia | Prioridad |
|----|-------|----------|
| US-T-01 | Como anfitrión, quiero seleccionar entre plantillas preestablecidas para poder empezar a diseñar rápidamente | Must |
| US-T-02 | Como anfitrión, quiero personalizar los colores para que la invitación combine con la temática de mi boda | Must |
| US-T-03 | Como anfitrión, quiero cambiar la fuente para que la invitación refleje mi estilo | Must |
| US-T-04 | Como anfitrión, quiero subir una hero image para que la invitación sea personal | Must |
| US-T-05 | Como anfitrión, quiero ver los cambios en tiempo real para saber cómo se verá la invitación | Must |

**Criterios de Aceptación:**

| # | Escenario | Dado que (Given) | Cuando (When) | Entonces (Then) |
|---|----------|-------|------|------|
| AC-T-01 | Seleccionar plantilla | El usuario está en el editor de plantillas | El usuario selecciona una de las 3 plantillas preestablecidas | La vista previa se actualiza inmediatamente; la plantilla se aplica al evento |
| AC-T-02 | Personalizar colores | El usuario tiene una plantilla seleccionada | El usuario cambia el color primario usando un selector de color | La vista previa se actualiza en tiempo real; el color se autoguarda |
| AC-T-03 | Personalizar tipografía | El usuario tiene una plantilla seleccionada | El usuario selecciona una familia de fuentes diferente en el menú desplegable | La vista previa se actualiza; la fuente se autoguarda |
| AC-T-04 | Subir hero image | El usuario tiene una plantilla seleccionada | El usuario sube un archivo de imagen (JPG/PNG, máx 5MB) | La imagen se sube, se recorta para ajustarse a la plantilla y se muestra en la vista previa |
| AC-T-05 | Autoguardado | El usuario hace cualquier personalización | El usuario espera 2 segundos sin hacer más cambios | Los cambios se guardan en la base de datos; la UI muestra un indicador de "Guardado" |

**Casos Extremos (Edge Cases):**
- Subida de imagen supera los 5MB -> mensaje de error con el límite de tamaño
- Formato de imagen no soportado (ej., .bmp) -> error con la lista de formatos soportados
- El selector de color devuelve un hex inválido -> se vuelve al último color válido
- Interrupción de red durante el autoguardado -> reintento con indicador offline
- El usuario navega a otra página antes de que se active el autoguardado -> se fuerza el guardado al navegar

---

### 6.1.2 Gestor de Invitados (Guest Manager)

**Descripción:** Importación masiva (CSV) y entrada manual de invitados con segmentación por categoría (familia, amigos, colegas, otros).

**Alcance (MVP):**
- Entrada manual de invitados: nombre, email, teléfono, categoría
- Importación CSV con validación y vista previa de errores
- Categorización de invitados (familia, amigos, colegas, otros)
- Lista de invitados con búsqueda, filtro y paginación
- Modo gratuito: máx 5 invitados (eventos en borrador)
- Modo publicado: invitados ilimitados

**Historias de Usuario:**

| ID | Historia | Prioridad |
|----|-------|----------|
| US-GM-01 | Como anfitrión, quiero añadir invitados manualmente para poder construir mi lista de invitados | Must |
| US-GM-02 | Como anfitrión, quiero importar invitados desde un archivo CSV para poder añadir muchos invitados a la vez | Must |
| US-GM-03 | Como anfitrión, quiero categorizar a los invitados para poder organizar mi lista | Must |
| US-GM-04 | Como anfitrión, quiero ver los errores de validación antes de importar para poder corregirlos | Must |
| US-GM-05 | Como anfitrión, quiero buscar y filtrar mi lista de invitados para poder encontrar a personas específicas | Should |
| US-GM-06 | Como anfitrión, quiero eliminar invitados para poder corregir errores | Must |

**Criterios de Aceptación:**

| # | Escenario | Dado que (Given) | Cuando (When) | Entonces (Then) |
|---|----------|-------|------|------|
| AC-GM-01 | Añadir invitado manualmente | El usuario está en la página del gestor de invitados | El usuario rellena nombre, email, teléfono, categoría y hace clic en "Añadir" | El invitado se añade a la lista; aparece en la tabla de invitados |
| AC-GM-02 | Importar CSV válido | El usuario tiene un CSV con columnas: nombre, email, teléfono, categoría | El usuario sube el CSV | El sistema valida todas las filas; muestra una vista previa con el total de invitados; el usuario confirma la importación; se añaden los invitados |
| AC-GM-03 | Importar CSV con errores | El usuario tiene un CSV con algunos correos inválidos y nombres faltantes | El usuario sube el CSV | El sistema resalta las filas con errores; muestra mensajes de error; el usuario puede corregir y volver a subir o ignorar las filas inválidas |
| AC-GM-04 | Límite del modo gratuito | El usuario está en el modo gratuito (no publicado) con 5 invitados | El usuario intenta añadir un sexto invitado | El sistema bloquea la acción; muestra una solicitud de actualización: "Publica tu evento para añadir invitados ilimitados" |
| AC-GM-05 | Categorizar invitados | El usuario tiene invitados en la lista | El usuario filtra por categoría (familia/amigos/trabajo) | Solo se muestran los invitados de esa categoría |
| AC-GM-06 | Eliminar invitado | El usuario tiene un invitado en la lista | El usuario hace clic en "Eliminar" y confirma | El invitado se elimina de forma lógica (soft-delete); desaparece de la lista |

**Casos Extremos (Edge Cases):**
- CSV con emails duplicados -> se deduplican, se muestra una advertencia
- CSV con columnas requeridas faltantes -> error con el formato esperado
- El email del invitado ya existe en el evento -> advertencia de duplicado, opción de omitir o actualizar
- Límite del modo gratuito alcanzado durante la importación CSV -> importación bloqueada con solicitud de actualización
- CSV grande (1000+ filas) -> indicador de progreso, procesamiento en background

---

### 6.1.3 Panel de Control (Control Dashboard)

**Descripción:** Seguimiento en tiempo real de RSVPs, ausencias, restricciones dietéticas, alérgenos y necesidades de transporte.

**Alcance (MVP):**
- Estadísticas de RSVP: total de invitados, confirmados, rechazados, pendientes, tal vez
- Lista de restricciones dietéticas (agregadas a partir de RSVPs)
- Recuento de necesidades de transporte
- Recuento de acompañantes (plus-one)
- Lista de invitados con el estado de RSVP
- Exportar lista de invitados como CSV

**Historias de Usuario:**

| ID | Historia | Prioridad |
|----|-------|----------|
| US-CD-01 | Como anfitrión, quiero ver estadísticas de RSVP en tiempo real para hacer un seguimiento de las respuestas | Must |
| US-CD-02 | Como anfitrión, quiero ver qué invitados tienen restricciones dietéticas para poder coordinar con el servicio de catering | Must |
| US-CD-03 | Como anfitrión, quiero ver quién necesita transporte para poder organizarlo | Must |
| US-CD-04 | Como anfitrión, quiero exportar mi lista de invitados para poder compartirla con los proveedores | Should |
| US-CD-05 | Como anfitrión, quiero ver quién no ha respondido para hacer un seguimiento | Must |

**Criterios de Aceptación:**

| # | Escenario | Dado que (Given) | Cuando (When) | Entonces (Then) |
|---|----------|-------|------|------|
| AC-CD-01 | Ver estadísticas de RSVP | El anfitrión está en el dashboard del evento | El anfitrión ve la sección de RSVP | El dashboard muestra: total invitados, confirmados, rechazados, pendientes, lista de restricciones dietéticas, recuento de necesidades de transporte |
| AC-CD-02 | Actualización en tiempo real | Un invitado envía un RSVP | El anfitrión está viendo el dashboard | Las estadísticas del dashboard se actualizan en menos de 5 segundos (sin recarga manual) |
| AC-CD-03 | Ver restricciones dietéticas | El anfitrión hace clic en "Restricciones Dietéticas" | El sistema muestra la lista | La lista muestra el nombre del invitado y sus restricciones dietéticas |
| AC-CD-04 | Exportar lista de invitados | El anfitrión hace clic en "Exportar CSV" | El sistema genera y descarga un archivo CSV | El CSV contiene: nombre, email, teléfono, categoría, estado de RSVP, restricciones dietéticas, necesidades de transporte |
| AC-CD-05 | Filtrar por estado RSVP | El anfitrión filtra por "Pendiente" | El sistema actualiza la lista de invitados | Solo se muestran los invitados que no han respondido |

**Casos Extremos (Edge Cases):**
- Aún no se han añadido invitados -> estado vacío con "Añade invitados para comenzar"
- Aún no se han recibido RSVPs -> las estadísticas muestran ceros con "Esperando respuestas"
- Un invitado actualiza su RSVP -> las estadísticas se actualizan, la respuesta anterior es reemplazada
- RSVP enviado después de la fecha del evento -> se acepta pero se marca como "tarde"

---

## 6.2 Micrositio de Invitados (Guest Microsite)

### 6.2.1 Sitio JAMstack Estático (Static JAMstack Site)

**Descripción:** Página de invitación ultrarrápida, optimizada para móviles y servida a través de CDN. No requiere descarga de app.

**Alcance (MVP):**
- HTML/CSS/JS estático generado por evento publicado
- Servido mediante CDN (Cloudflare)
- Diseño responsivo mobile-first
- Tiempo de carga < 2 segundos en móvil 3G
- Puntuación de rendimiento en Lighthouse > 90
- Detalles del evento: nombres de la pareja, fecha, lugar, horario
- Mapa del lugar integrado con Google Maps
- Enlace de RSVP (basado en token)
- Botones para añadir al calendario (Google Calendar, Apple Calendar)
- Enlaces para obtener indicaciones (deep links a Google Maps / Waze)

**Historias de Usuario:**

| ID | Historia | Prioridad |
|----|-------|----------|
| US-MS-01 | Como invitado, quiero ver la invitación en mi navegador móvil para no tener que descargar una app | Must |
| US-MS-02 | Como invitado, quiero que la página cargue rápidamente para poder ver los detalles inmediatamente | Must |
| US-MS-03 | Como invitado, quiero ver el lugar en un mapa para saber a dónde ir | Must |
| US-MS-04 | Como invitado, quiero obtener indicaciones con un solo toque para poder navegar fácilmente | Must |
| US-MS-05 | Como invitado, quiero añadir el evento a mi calendario para no olvidarlo | Should |

**Criterios de Aceptación:**

| # | Escenario | Dado que (Given) | Cuando (When) | Entonces (Then) |
|---|----------|-------|------|------|
| AC-MS-01 | Cargar micrositio | El evento está publicado | El invitado navega a `aura.planning/e/{slug}` | El sitio estático se carga con los detalles del evento, el mapa del lugar y el enlace de RSVP |
| AC-MS-02 | Responsividad móvil | El invitado accede al micrositio en un dispositivo móvil | El invitado ve la página | El sitio es completamente responsivo; todos los elementos son legibles y tocables |
| AC-MS-03 | Rendimiento | El invitado accede al micrositio en móvil 3G | La página carga | El tiempo total de carga es inferior a 2 segundos; puntuación en Lighthouse > 90 |
| AC-MS-04 | Mapa del lugar | El invitado ve el micrositio | El invitado hace scroll hasta la sección del lugar | El embed de Google Maps muestra la ubicación del lugar |
| AC-MS-05 | Enlace de indicaciones | El invitado hace clic en "Obtener Indicaciones" | El navegador se abre | La app de Google Maps o Waze se abre con el lugar como destino |
| AC-MS-06 | Sincronización de calendario | El invitado hace clic en "Añadir al Calendario" | El sistema genera la acción | Se descarga un archivo .ics o se abre el enlace de Google Calendar con los detalles del evento pre-rellenados |
| AC-MS-07 | Actualización tras editar | El anfitrión actualiza los detalles del evento después de publicarlo | El anfitrión guarda los cambios | El sitio estático se regenera; se invalida la caché de CDN; el nuevo contenido es visible en un plazo de 1 hora |

**Casos Extremos (Edge Cases):**
- El evento no está publicado -> Página 404 con "Este evento aún no está disponible"
- Evento eliminado -> Página 404 con "Este evento ya no está disponible"
- Slug inválido -> Página 404
- Miss de caché en CDN durante la regeneración -> fallback a la versión anterior o a un estado de carga
- Cuota de la API de Google Maps superada -> fallback a imagen estática del mapa

---

### 6.2.2 Formulario RSVP Inteligente (Smart RSVP Form)

**Descripción:** Formulario optimizado para móviles para que los invitados respondan a las invitaciones. No se requiere cuenta.

**Alcance (MVP):**
- Acceso basado en token (único por invitado)
- Asistencia: Sí / No / Tal vez
- Restricciones dietéticas (texto libre)
- Necesidades de transporte (checkbox)
- Acompañante / Plus-one (checkbox)
- Mensaje personal para los anfitriones (opcional, texto libre)
- Fecha límite para RSVP (7 días antes del evento)
- Página de confirmación tras el envío
- Posibilidad de actualizar el RSVP antes de la fecha límite

**Historias de Usuario:**

| ID | Historia | Prioridad |
|----|-------|----------|
| US-RSVP-01 | Como invitado, quiero hacer RSVP sin crear una cuenta para poder responder rápidamente | Must |
| US-RSVP-02 | Como invitado, quiero indicar mis restricciones dietéticas para que los anfitriones puedan acomodarme | Must |
| US-RSVP-03 | Como invitado, quiero indicar si necesito transporte para que los anfitriones puedan organizarlo | Must |
| US-RSVP-04 | Como invitado, quiero actualizar mi RSVP antes de la fecha límite por si cambian mis planes | Must |
| US-RSVP-05 | Como invitado, quiero ver una confirmación después de enviar para saber que mi respuesta fue recibida | Must |

**Criterios de Aceptación:**

| # | Escenario | Dado que (Given) | Cuando (When) | Entonces (Then) |
|---|----------|-------|------|------|
| AC-RSVP-01 | Acceder al RSVP | El invitado recibe un enlace de invitación | El invitado hace clic en el enlace | El sistema muestra los detalles del evento y el formulario RSVP con el nombre del invitado pre-rellenado |
| AC-RSVP-02 | Enviar RSVP (asistirá) | El invitado está en el formulario RSVP | El invitado selecciona "Sí, asistiré", rellena las restricciones dietéticas y envía | Se guarda el RSVP; el invitado ve un mensaje de confirmación; el dashboard del anfitrión se actualiza en tiempo real |
| AC-RSVP-03 | Enviar RSVP (no asistirá) | El invitado está en el formulario RSVP | El invitado selecciona "No, no podré asistir" y envía | Se guarda el RSVP; el invitado ve un mensaje de agradecimiento; el dashboard del anfitrión incrementa la cuenta de rechazados |
| AC-RSVP-04 | Actualizar RSVP | El invitado ya envió un RSVP | El invitado hace clic nuevamente en su enlace (más de 7 días antes del evento) | El invitado puede modificar su respuesta; los cambios se guardan |
| AC-RSVP-05 | Fecha límite superada | El invitado intenta actualizar el RSVP a menos de 7 días del evento | El invitado envía los cambios | El sistema rechaza la actualización; muestra el mensaje "La fecha límite de RSVP ha pasado" |
| AC-RSVP-06 | Token inválido | El invitado accede a un enlace inválido o expirado | El sistema valida el token | El sistema muestra "Este enlace de invitación no es válido" junto con un enlace de contacto |

**Casos Extremos (Edge Cases):**
- El invitado envía RSVP sin seleccionar si asiste o no -> error de validación
- El invitado envía RSVP pasada la fecha límite -> rechazado con mensaje
- El invitado comparte su enlace con alguien más -> el RSVP está vinculado al nombre del invitado original
- Interrupción de red durante el envío -> reintento con los datos guardados en el formulario
- Envío duplicado (doble clic) -> manejo idempotente, se registra un solo RSVP

---

## 6.3 Sistema de Comunicación (Communication System)

### 6.3.1 Invitaciones por Email y WhatsApp

**Descripción:** Envío de invitaciones multicanal a través de Gmail SMTP (email) y Meta WhatsApp Business API.

**Alcance (MVP):**
- Invitaciones por email: plantilla personalizada con enlace RSVP
- Invitaciones por WhatsApp: mensaje de plantilla con enlace RSVP
- Seguimiento del estado de entrega (enviado, entregado, abierto)
- Fallback: se usa email si el envío por WhatsApp falla tras 2 reintentos
- Gestión de rebotes/quejas en email (mediante webhooks SNS)

**Historias de Usuario:**

| ID | Historia | Prioridad |
|----|-------|----------|
| US-COM-01 | Como anfitrión, quiero enviar invitaciones por email para que todos los invitados las reciban | Must |
| US-COM-02 | Como anfitrión, quiero enviar invitaciones por WhatsApp para que los invitados las reciban en su canal preferido | Should |
| US-COM-03 | Como anfitrión, quiero ver qué invitaciones se han entregado para hacer seguimiento a quienes no las recibieron | Should |
| US-COM-04 | Como anfitrión, quiero que la invitación se envíe por email como respaldo si WhatsApp falla, para que ningún invitado se quede sin ella | Should |

**Criterios de Aceptación:**

| # | Escenario | Dado que (Given) | Cuando (When) | Entonces (Then) |
|---|----------|-------|------|------|
| AC-COM-01 | Enviar invitación email | El anfitrión tiene invitados con direcciones de email | El anfitrión hace clic en "Enviar Invitaciones por Email" | Los emails se envían vía Gmail SMTP; el estado se actualiza a "enviado" |
| AC-COM-02 | Enviar invitación WhatsApp | El anfitrión tiene invitados con números de teléfono | El anfitrión hace clic en "Enviar Invitaciones por WhatsApp" | Los mensajes se envían vía Meta API; el estado se actualiza |
| AC-COM-03 | Fallo en WhatsApp | Falla la entrega por WhatsApp | El sistema reintenta a los 5 min, luego a los 30 min | Tras 2 intentos fallidos, se envía la invitación por email como respaldo (fallback) |
| AC-COM-04 | Rebote de email | El email rebota (hard bounce) | Un webhook de SNS notifica al sistema | El estado de la invitación cambia a "fallido"; el invitado se marca; no hay más reintentos |
| AC-COM-05 | Queja de email | El destinatario marca el email como spam | Un webhook de SNS notifica al sistema | Se suspende la dirección de email; no se enviarán más correos a esa dirección |

**Casos Extremos (Edge Cases):**
- El invitado no tiene email ni teléfono -> la invitación se marca como "no se puede enviar"; se notifica al anfitrión
- La plantilla de WhatsApp no está aprobada por Meta -> solo funciona el envío por email
- Límite diario de Gmail SMTP (500/día) -> se monitoriza la cuota, plan para migrar a Mailgun/Brevo
- Se supera el límite de velocidad de la API (WhatsApp 1K/hr) -> los mensajes restantes se encolan para la próxima ventana

---

### 6.3.2 Recordatorios Automáticos (Automated Reminders)

**Descripción:** Recordatorios automáticos de RSVP para invitados que no han respondido.

**Alcance (MVP):**
- Horario de recordatorio configurable (por defecto: 7 días antes del límite de RSVP)
- Se envía por el mismo canal que la invitación original (email o WhatsApp)
- El anfitrión puede lanzar los recordatorios manualmente
- El recordatorio respeta las preferencias del invitado (no se envían si optó por no recibirlos)

**Historias de Usuario:**

| ID | Historia | Prioridad |
|----|-------|----------|
| US-REM-01 | Como anfitrión, quiero que se envíen recordatorios automáticos a quienes no han respondido para no tener que hacerlo manualmente | Should |
| US-REM-02 | Como anfitrión, quiero lanzar los recordatorios manualmente para enviarlos cuando yo prefiera | Should |

**Criterios de Aceptación:**

| # | Escenario | Dado que (Given) | Cuando (When) | Entonces (Then) |
|---|----------|-------|------|------|
| AC-REM-01 | Recordatorio automático | El evento tiene invitados sin RSVP | Se acerca el límite (días configurados) | Se envía recordatorio a quienes no han respondido usando su canal original |
| AC-REM-02 | Recordatorio manual | El anfitrión está en el gestor de invitados | El anfitrión selecciona invitados pendientes y clica en "Enviar Recordatorio" | El recordatorio se envía de inmediato a los seleccionados |
| AC-REM-03 | Invitado responde antes | El invitado envía el RSVP | El recordatorio estaba programado | Se cancela el recordatorio para ese invitado |

**Casos Extremos (Edge Cases):**
- El invitado ya respondió -> no se envía recordatorio
- El email del invitado rebotó -> no se envía recordatorio por email; se intenta WhatsApp si está disponible
- Se envió el recordatorio pero sigue sin responder -> segundo recordatorio (configurable)
- Se cambia la fecha del evento -> se recalcula el horario de los recordatorios

---

### 6.3.3 Tarjetas de Agradecimiento Post-Evento (Post-Event Thank You Cards)

**Descripción:** Tarjetas digitales automáticas enviadas a los asistentes después del evento.

**Alcance (MVP):**
- Se envían 1 día después de la fecha del evento
- Vía email o WhatsApp (mismo canal de la invitación)
- Personalizadas con el nombre del invitado y del evento
- Opcional: enlace a una galería de fotos externa (Drive, Pixieset)
- El anfitrión puede personalizar el mensaje de agradecimiento

**Historias de Usuario:**

| ID | Historia | Prioridad |
|----|-------|----------|
| US-TY-01 | Como anfitrión, quiero que se envíen tarjetas automáticas a los asistentes para agradecerles sin esfuerzo manual | Could |
| US-TY-02 | Como anfitrión, quiero incluir un enlace a mi galería de fotos para que los invitados puedan verlas | Could |

**Criterios de Aceptación:**

| # | Escenario | Dado que (Given) | Cuando (When) | Entonces (Then) |
|---|----------|-------|------|------|
| AC-TY-01 | Agradecimiento automático | Pasó la fecha del evento | 1 día después del evento | Se envían las tarjetas a los asistentes por su canal original |
| AC-TY-02 | Mensaje personalizado | El anfitrión personalizó el texto | Se envían las tarjetas | Se usa el mensaje personalizado en lugar del que viene por defecto |
| AC-TY-03 | Enlace a la galería | El anfitrión añadió la URL de la galería | Se envían las tarjetas | El enlace se incluye en el mensaje |

**Casos Extremos (Edge Cases):**
- El evento no tiene asistentes -> no se envían tarjetas
- El email rebotó -> no se envía por email; se intenta por WhatsApp si está disponible
- El anfitrión no incluyó la URL -> se envía la tarjeta sin el enlace

---

## 6.4 Live Guest Journey (Killer Feature)

### 6.4.1 Panel de Cómplice por Enlace Mágico (Accomplice Magic-Link Panel)

**Descripción:** Acceso seguro mediante magic link para una persona de confianza (padrino, dama de honor) para enviar actualizaciones del evento en vivo.

**Alcance (MVP):**
- El anfitrión otorga acceso por email
- El cómplice recibe un enlace mágico (sin contraseña)
- Panel del cómplice: interfaz simple orientada a móviles
- Plantillas de mensajes preconfiguradas (ej. "¡La novia está saliendo del hotel!")
- Gesto "swipe-to-send" para evitar envíos por error
- Seguimiento del estado de entrega
- El acceso expira el Día del Evento + 1
- Permisos: enviar mensajes, ver RSVPs (configurable)

**Historias de Usuario:**

| ID | Historia | Prioridad |
|----|-------|----------|
| US-LGJ-01 | Como anfitrión, quiero otorgar acceso a una persona de confianza para que envíe actualizaciones en vivo | Must |
| US-LGJ-02 | Como cómplice, quiero acceder a mi panel mediante enlace mágico para no necesitar contraseñas | Must |
| US-LGJ-03 | Como cómplice, quiero enviar mensajes preconfigurados usando un gesto (swipe) para no equivocarme | Must |
| US-LGJ-04 | Como cómplice, quiero ver qué mensajes han sido entregados para saber si los invitados están informados | Should |
| US-LGJ-05 | Como anfitrión, quiero configurar las plantillas para que el cómplice mande los mensajes adecuados | Must |

**Criterios de Aceptación:**

| # | Escenario | Dado que (Given) | Cuando (When) | Entonces (Then) |
|---|----------|-------|------|------|
| AC-LGJ-01 | Otorgar acceso | El anfitrión está en su panel | Introduce el email del cómplice y selecciona los permisos | El cómplice recibe el magic link; se concede el acceso |
| AC-LGJ-02 | Acceso del cómplice | El cómplice hace clic en el enlace | El sistema valida el token | Se abre el panel con los mensajes y el resumen de RSVPs |
| AC-LGJ-03 | Enviar mensaje | El cómplice está en el panel | El cómplice desliza un botón de mensaje | El mensaje se encola para enviarse por WhatsApp; el cómplice ve "Enviando..." |
| AC-LGJ-04 | Prevención de error | El cómplice está en el panel | Toca el botón en lugar de deslizarlo | El mensaje NO se envía; aparece una indicación "Desliza para enviar" |
| AC-LGJ-05 | Confirmación entrega | El mensaje fue enviado | WhatsApp entrega el mensaje | El panel muestra el estado "Entregado" |
| AC-LGJ-06 | Expiración | El cómplice intenta acceder un día después del evento | El sistema valida el token | Se muestra "El acceso ha expirado"; el panel ya no está disponible |

**Casos Extremos (Edge Cases):**
- El cómplice pierde el email -> el anfitrión puede reenviarlo desde su panel
- Token del cómplice comprometido -> el anfitrión puede revocar el acceso
- API de WhatsApp no disponible -> el mensaje se encola y se envía cuando esté disponible
- El cómplice envía muchos mensajes (rate limit) -> respuesta HTTP 429, mensaje de pausa
- Múltiples cómplices en el mismo evento -> está soportado; cada uno tiene acceso independiente
- El cómplice intenta enviar un mensaje antes de la fecha del evento -> está permitido (el anfitrión podría querer actualizaciones previas al evento)

---

### 6.4.2 Botones Pre-Configurados Deslizar-para-Enviar (Swipe-to-Send)

**Descripción:** Interfaz simplificada con botones narrativos preconfigurados que requieren un gesto de deslizamiento (swipe) para ser enviados.

**Alcance (MVP):**
- 5-8 plantillas de mensaje por defecto
- Etiquetas y textos personalizables por el anfitrión
- Gesto de deslizamiento (de izquierda a derecha) para confirmar
- Retroalimentación visual durante el swipe (indicador de progreso)
- Respuesta háptica en móviles (si está soportado)
- No se pueden enviar simplemente tocando la pantalla

**Plantillas por Defecto:**

| Etiqueta | Mensaje por Defecto | Icono |
|-------|----------------|------|
| Bride Leaving | "¡La novia está saliendo del hotel!" | Novia (Bride) |
| Ceremony Starting | "¡La ceremonia está a punto de empezar!" | Iglesia (Church) |
| They Said Yes | "¡Han dicho que SÍ!" | Anillo (Ring) |
| Cocktail Hour | "¡El cóctel está empezando!" | Champán (Champagne) |
| Dinner Time | "¡La cena está servida!" | Plato (Plate) |
| First Dance | "¡El primer baile va a comenzar!" | Baile (Dance) |
| Cake Cutting | "¡Hora de cortar la tarta!" | Tarta (Cake) |
| Party Time | "¡Que empiece la fiesta!" | Música (Music) |

**Criterios de Aceptación:**

| # | Escenario | Dado que (Given) | Cuando (When) | Entonces (Then) |
|---|----------|-------|------|------|
| AC-SS-01 | Deslizar para enviar | El cómplice está en el panel | Desliza el botón de izq. a der. | Se envía el mensaje; el botón confirma el "Enviado" |
| AC-SS-02 | Evitar toques | El cómplice está en el panel | Toca el botón en vez de deslizarlo | No ocurre nada; se muestra un tip "Desliza para enviar" |
| AC-SS-03 | Deslizamiento parcial | El cómplice empieza a deslizar | Suelta el dedo antes de completar el 80% | El botón vuelve a su posición; el mensaje no se envía |
| AC-SS-04 | Mensaje custom | El anfitrión editó una plantilla | El cómplice ve el panel | Se muestra el mensaje modificado en lugar del original |
| AC-SS-05 | Historial de envíos | El cómplice ha enviado mensajes | Hace scroll hacia abajo | Se muestran los mensajes enviados con fecha, hora y estado de entrega |

**Casos Extremos (Edge Cases):**
- El cómplice está en ordenador (sin touch) -> se habilita hacer clic y arrastrar (click-and-drag)
- Deslizamiento muy lento -> se registra igual si la dirección es correcta
- Deslizamiento por error al mover el móvil -> se evita gracias al límite del 80% y a la animación
- El anfitrión borra una plantilla mientras el cómplice ve el panel -> la plantilla desaparece y sale una notificación

---

> [Volver al Índice PRD](../PRD.md) | [Anterior: Registro y Onboarding](05-registration-onboarding.md) | [Siguiente: Desglose de Trabajo](07-work-breakdown.md)
