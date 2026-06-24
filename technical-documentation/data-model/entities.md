# Especificaciones de Entidades

Especificaciones detalladas a nivel de columna, reglas de negocio, estados del ciclo de vida y manejo GDPR para cada entidad en el modelo de datos de Aura Planning.

---

## Users

Cuentas de hosts — los usuarios principales que crean y gestionan eventos.

### Columnas

| Columna | Tipo | Nullable | Por Defecto | Restricciones | Regla de Negocio |
|--------|------|----------|---------|-------------|---------------|
| Id | uuid | No | gen_random_uuid() | PK | Formato compatible ULID para seguridad en URL |
| Email | varchar(320) | No | — | UNIQUE, comparación case-insensitive | Validado per RFC 5322; normalizado a minúsculas antes de almacenamiento |
| Name | varchar(200) | No | — | Min 2 chars, max 200 | Establecido durante configuración de perfil en primer login |
| HashedMagicLinkToken | varchar(256) | Yes | NULL | — | Hash SHA-256 del token en texto plano; limpiado después de uso |
| TokenExpiresAt | timestamptz | Yes | NULL | — | 15 minutos desde generación del token |
| CreatedAt | timestamptz | No | NOW() | — | Establecido en creación de cuenta |
| LastLoginAt | timestamptz | Yes | NULL | — | Actualizado en cada login exitoso |
| Status | varchar(20) | No | 'pending' | CHECK IN ('pending','active','suspended','anonymized') | 'pending' hasta primer login, 'active' después de configuración de perfil |
| Timezone | varchar(64) | No | 'Europe/Madrid' | Timezone IANA válido | Auto-detectado del navegador, editable en perfil |
| Locale | varchar(10) | No | 'es-ES' | Formato BCP 47 | Determina formato de fecha/hora, idioma |
| IsAnonymized | boolean | No | false | — | Establecido a true en borrado GDPR |
| AnonymizedAt | timestamptz | Yes | NULL | — | Timestamp de anonimización |

### Estados del Ciclo de Vida

```
pending → active → (suspended) → anonymized
```

| Estado | Disparador | Efecto |
|-------|---------|--------|
| `pending` | Usuario solicita magic link | No puede crear eventos; debe verificar email |
| `active` | Usuario completa configuración de perfil en primer login | Acceso completo a todas las funcionalidades |
| `suspended` | Acción de admin o detección de abuso | Login bloqueado; eventos aún accesibles para invitados |
| `anonymized` | Solicitud de borrado GDPR procesada | PII eliminada; datos de auditoría retenidos |

### Reglas de Negocio

1. La unicidad de email es case-insensitive (`LOWER(Email)` comparison)
2. El token magic link es de un solo uso — limpiado después de verificación exitosa
3. Rate limit: 3 solicitudes de magic link por email por hora (rastreado en Dragonfly)
4. Misma respuesta para usuarios nuevos y existentes (anti-enumeración)
5. Tokens antiguos invalidados cuando se solicita nuevo magic link
6. Sesión única activa por usuario — nuevo login invalida JWT anterior

### Manejo GDPR

| Campo | En Solicitud de Borrado |
|-------|-------------------|
| Email | Reemplazado con `deleted-{uuid}@anonymous.invalid` |
| Name | Reemplazado con `[Deleted User]` |
| HashedMagicLinkToken | Establecido a NULL |
| TokenExpiresAt | Establecido a NULL |
| Status | Cambiado a `anonymized` |
| IsAnonymized | Establecido a `true` |
| AnonymizedAt | Establecido a `NOW()` |
| CreatedAt, LastLoginAt, Timezone, Locale | Retenidos (sin PII) |

---

## UserConsents

Rastreo del consentimiento del usuario para términos de servicio, marketing y procesamiento de datos. Requerido para cumplimiento GDPR.

### Columnas

| Columna | Tipo | Nullable | Por Defecto | Restricciones | Regla de Negocio |
|--------|------|----------|---------|-------------|---------------|
| Id | uuid | No | gen_random_uuid() | PK | — |
| UserId | uuid | No | — | FK → Users(Id), indexed | Referencia al usuario que consiente |
| ConsentType | varchar(50) | No | — | CHECK IN ('terms','marketing','data_processing') | Tipo de consentimiento dado |
| TermsVersion | varchar(20) | No | — | Versionado semántico (ej. '1.0.0') | Rastrea qué versión fue aceptada |
| IsAccepted | boolean | No | false | — | True si el consentimiento fue dado |
| AcceptedAt | timestamptz | No | NOW() | — | Timestamp del consentimiento |
| WithdrawnAt | timestamptz | Yes | NULL | — | Establecido cuando el consentimiento es retirado |

### Reglas de Negocio

1. Usuarios deben aceptar `terms` y `data_processing` antes de crear eventos
2. Consentimiento `marketing` es opcional (opt-in)
3. Cuando los términos son actualizados, usuarios deben re-aceptar antes de continuar
4. Retirar consentimiento `data_processing`_trigger account anonymization
5. Registros de consentimiento nunca se borran — solo `WithdrawnAt` se establece

### Manejo GDPR

- Los registros de consentimiento **nunca se borran** — sirven como prueba legal de consentimiento
- Cuando el consentimiento es retirado, `WithdrawnAt` se establece a `NOW()`
- `IsAccepted` NO se cambia a false — la precisión histórica debe preservarse

---

## Events

Detalles de boda/evento — la entidad central a la que se relacionan todos los demás datos.

### Columnas

| Columna | Tipo | Nullable | Por Defecto | Restricciones | Regla de Negocio |
|--------|------|----------|---------|-------------|---------------|
| Id | uuid | No | gen_random_uuid() | PK | — |
| UserId | uuid | No | — | FK → Users(Id), indexed | Owner del evento |
| Name | varchar(200) | No | — | Min 2 chars, max 200 | Nombre de visualización del evento |
| Slug | varchar(200) | No | — | UNIQUE, caracteres URL-safe | Auto-generado desde Name + date; ej. `maria-y-juan-2026` |
| TemplateId | uuid | Yes | NULL | FK → Templates(Id) | Plantilla de invitación seleccionada |
| PrimaryColor | varchar(7) | No | '#4F46E5' | Formato hex color | Color primario del tema |
| SecondaryColor | varchar(7) | No | '#7C3AED' | Formato hex color | Color secundario del tema |
| FontFamily | varchar(100) | No | 'Inter' | De lista de fuentes permitidas | Familia de fuente de encabezados |
| HeroImageUrl | varchar(500) | Yes | NULL | URL válida o path MinIO | Imagen de portada para la invitación |
| CoupleNames | varchar(200) | No | — | Min 2 chars, max 200 | Nombres mostrados en la invitación |
| EventDate | timestamptz | No | — | Debe estar en el futuro al crear | Fecha y hora del evento |
| VenueName | varchar(200) | No | — | Min 2 chars, max 200 | Nombre de visualización del venue |
| VenueAddress | varchar(500) | No | — | Min 5 chars, max 500 | Dirección completa del venue |
| VenueLat | decimal(9,6) | Yes | NULL | Rango: -90 a 90 | Latitud desde geocodificación de Google Maps |
| VenueLng | decimal(9,6) | Yes | NULL | Rango: -180 a 180 | Longitud desde geocodificación de Google Maps |
| Status | varchar(20) | No | 'draft' | CHECK IN ('draft','published','completed','archived') | Estado del ciclo de vida del evento |
| PublishedAt | timestamptz | Yes | NULL | — | Establecido cuando el pago succeed |
| CreatedAt | timestamptz | No | NOW() | — | Timestamp de creación del evento |
| UpdatedAt | timestamptz | No | NOW() | — | Actualizado en cada cambio |
| EventEndDate | timestamptz | No | EventDate + 1 day | Columna generada | Usado para cálculo de retención a 30 días |

### Estados del Ciclo de Vida

```
draft → published → completed → archived
```

| Estado | Disparador | Efecto |
|-------|---------|--------|
| `draft` | Evento creado | Modo gratis: máximo 5 invitados; sin micrositio público |
| `published` | Pago succeed vía Stripe | Invitados ilimitados; micrositio generado y publicado en CDN |
| `completed` | EventDate ha pasado | Solo lectura; tarjetas de agradecimiento enviadas; acceso accomplice expirado |
| `archived` | 30 días después de EventEndDate | Programado para borrado hard por DataRetentionJob |

### Reglas de Negocio

1. **Generación de slug**: Minúsculas, reemplazar espacios con guiones, remover caracteres especiales, añadir año. Si duplicado, añadir `-2`, `-3`, etc.
2. **Límite de modo gratis**: Eventos en draft pueden tener máximo 5 invitados (enforced a nivel de API)
3. **Publicación requiere pago**: Transiciones de status a `published` solo después de Stripe `payment_intent.succeeded`
4. **Geocodificación de venue**: Dirección enviada a Google Maps Geocoding API; lat/lng almacenados si exitoso
5. **Auto-guardado**: Cambios de plantilla auto-guardan con debounce de 2 segundos
6. **Regeneración de sitio estático**: En actualización de evento después de publicar, SSG regenera e invalida caché de CDN
7. **EventEndDate**: Computado como `EventDate + 1 day`; drive retention schedule

### Manejo GDPR

| Campo | En Solicitud de Borrado |
|-------|-------------------|
| Name | Reemplazado con `[Deleted Event]` |
| CoupleNames | Reemplazado con `[Redacted]` |
| VenueName | Reemplazado con `[Redacted]` |
| VenueAddress | Reemplazado con `[Redacted]` |
| HeroImageUrl | Establecido a NULL |
| Slug | Retenido (estabilidad de URL para invitados) |
| Todos los demás campos | Retenidos (sin PII) |

---

## Templates

Plantillas de invitación pre-diseñadas disponibles para que los hosts seleccionen y personalicen.

### Columnas

| Columna | Tipo | Nullable | Por Defecto | Restricciones | Regla de Negocio |
|--------|------|----------|---------|-------------|---------------|
| Id | uuid | No | gen_random_uuid() | PK | — |
| Name | varchar(100) | No | — | Min 2 chars, max 100 | Nombre de visualización de la plantilla |
| Description | text | Yes | NULL | Max 500 chars | Descripción de la plantilla |
| PreviewUrl | varchar(500) | No | — | URL válida o path MinIO | Path de imagen de preview |
| Category | varchar(50) | No | 'wedding' | indexed | Categoría de la plantilla |
| IsPremium | boolean | No | false | — | Requiere nivel premium |
| LayoutJson | jsonb | No | '{}' | JSON válido | Configuración del layout de la plantilla |
| CreatedAt | timestamptz | No | NOW() | — | Timestamp de creación de la plantilla |

### Reglas de Negocio

1. MVP shipping con 3 plantillas de boda preestablecidas (datos seedeados)
2. `LayoutJson` define secciones, colores por defecto, pares de fuentes y referencias de assets
3. Plantillas son gestionadas por el sistema — usuarios no pueden crear plantillas custom en MVP
4. Plantillas `IsPremium` solo disponibles para nivel de Publicación Premium (V2+)

### LayoutJson Schema

```json
{
  "sections": ["hero", "details", "venue", "rsvp"],
  "colors": {
    "primary": "#4F46E5",
    "secondary": "#7C3AED"
  },
  "fonts": {
    "heading": "Playfair Display",
    "body": "Inter"
  },
  "assets": {
    "background": "/templates/classic/bg.png",
    "divider": "/templates/classic/divider.svg"
  }
}
```

### Manejo GDPR

- No se almacena PII — plantillas son contenido del sistema
- No se necesita anonimización

---

## Guests

Asistentes al evento — importados vía CSV o añadidos manualmente por el host.

### Columnas

| Columna | Tipo | Nullable | Por Defecto | Restricciones | Regla de Negocio |
|--------|------|----------|---------|-------------|---------------|
| Id | uuid | No | gen_random_uuid() | PK | — |
| EventId | uuid | No | — | FK → Events(Id), indexed | Evento padre |
| Name | varchar(200) | No | — | Min 1 char, max 200 | Nombre de visualización del invitado |
| Email | varchar(320) | Yes | NULL | Formato email válido | Normalizado a minúsculas |
| Phone | varchar(30) | Yes | NULL | Formato E.164 preferido | Para invitaciones WhatsApp |
| Category | varchar(30) | No | 'other' | CHECK IN ('family','friends','colleagues','other') | Segmentación de invitados |
| InviteStatus | varchar(20) | No | 'pending' | CHECK IN ('pending','sent','delivered','opened','failed','bounced') | Estado de entrega de invitación |
| IsDeleted | boolean | No | false | — | Flag de soft delete |
| DeletedAt | timestamptz | Yes | NULL | — | Timestamp de soft delete |
| IsAnonymized | boolean | No | false | — | Flag de anonimización GDPR |
| AnonymizedAt | timestamptz | Yes | NULL | — | Timestamp de anonimización |
| CreatedAt | timestamptz | No | NOW() | — | Timestamp de creación del invitado |

### Reglas de Negocio

1. **Detección de duplicados**: Email único por evento — `WHERE EventId = @eventId AND Email = @email AND IsDeleted = false`
2. **Validación de importación CSV**: Nombre requerido; email/teléfono opcional pero al menos un método de contacto requerido
3. **Categoría por defecto**: Por defecto 'other' si no se especifica en CSV
4. **Límite de modo gratis**: Máximo 5 invitados para eventos en draft (enforced a nivel de servicio)
5. **Cascada de soft delete**: Cuando un invitado es soft-deleted, sus invitaciones también se soft-deletean
6. **Normalización de email**: Todos los emails almacenados en minúsculas para lookups consistentes
7. **Formato de teléfono**: Almacenado en formato E.164 (+34612345678) para compatibilidad con API de WhatsApp

### Manejo GDPR

| Campo | En Solicitud de Borrado |
|-------|-------------------|
| Name | Reemplazado con `[Deleted Guest]` |
| Email | Reemplazado con `deleted-{uuid}@anonymous.invalid` |
| Phone | Establecido a NULL |
| IsAnonymized | Establecido a `true` |
| AnonymizedAt | Establecido a `NOW()` |
| Category, InviteStatus, CreatedAt | Retenidos (sin PII) |

---

## Invitations

Registros de invitación por invitado — rastrea estado de entrega y proporciona acceso RSVP vía token.

### Columnas

| Columna | Tipo | Nullable | Por Defecto | Restricciones | Regla de Negocio |
|--------|------|----------|---------|-------------|---------------|
| Id | uuid | No | gen_random_uuid() | PK | — |
| GuestId | uuid | No | — | FK → Guests(Id), indexed | Invitado objetivo |
| EventId | uuid | No | — | FK → Events(Id), indexed | Evento padre (denormalizado para rendimiento de queries) |
| TokenHash | varchar(256) | No | — | UNIQUE, indexed | Hash SHA-256 del token de invitación |
| SentVia | varchar(20) | Yes | NULL | CHECK IN ('email','whatsapp','both') | Canal usado para enviar |
| SentAt | timestamptz | Yes | NULL | — | Timestamp del primer envío |
| DeliveryStatus | varchar(20) | No | 'pending' | CHECK IN ('pending','sent','delivered','failed','bounced') | Estado de entrega actual |
| RetryCount | int | No | 0 | DEFAULT 0, max 2 | Número de intentos de reintento |
| IsDeleted | boolean | No | false | — | Flag de soft delete |
| DeletedAt | timestamptz | Yes | NULL | — | Timestamp de soft delete |
| CreatedAt | timestamptz | No | NOW() | — | Timestamp de creación de la invitación |

### Reglas de Negocio

1. **Generación de token**: String aleatorio de 256-bit, hasheado con SHA-256 antes de almacenamiento
2. **Una invitación por invitado**: Enforced a nivel de servicio; invitado solo puede tener una invitación activa
3. **Seguimiento de entrega**: Status actualizado vía webhooks (WhatsApp) o pixels de tracking (email)
4. **Lógica de reintento**: Máximo 2 reintentos para fallos de WhatsApp antes de fallback a email
5. **Manejo de bounce**: Bounces hard establecen status a 'bounced' y marcan email del invitado como suspendido
6. **Expiración de token**: Tokens de invitación expiran en deadline de RSVP (7 días antes de EventDate)
7. **EventId denormalizado**: Almacenado para queries eficientes sin joins a través de Guests

### Manejo GDPR

| Campo | En Solicitud de Borrado |
|-------|-------------------|
| TokenHash | Re-hasheado con salt aleatorio (invalida el enlace) |
| SentVia, SentAt, DeliveryStatus, RetryCount | Retenidos (datos de auditoría) |
| IsDeleted, DeletedAt | Retenidos (datos de referencia) |

---

## RSVPs

Respuestas de invitados a invitaciones — asistencia, necesidades dietéticas, transporte y mensajes personales.

### Columnas

| Columna | Tipo | Nullable | Por Defecto | Restricciones | Regla de Negocio |
|--------|------|----------|---------|-------------|---------------|
| Id | uuid | No | gen_random_uuid() | PK | — |
| InvitationId | uuid | No | — | FK → Invitations(Id), UNIQUE | Un RSVP por invitación |
| GuestId | uuid | No | — | FK → Guests(Id), indexed | Invitado que responde |
| EventId | uuid | No | — | FK → Events(Id), indexed | Evento padre (denormalizado) |
| Attendance | varchar(10) | No | — | CHECK IN ('yes','no','maybe') | Decisión de asistencia del invitado |
| DietaryRestrictions | text | Yes | NULL | Max 500 chars | Info dietética en texto libre |
| NeedsTransport | boolean | No | false | — | Flag de necesidad de transporte |
| PlusOne | boolean | No | false | — | Flag de asistencia con acompañante |
| Message | text | Yes | NULL | Max 1000 chars | Mensaje personal a los hosts |
| SubmittedAt | timestamptz | No | NOW() | — | Timestamp del primer envío |
| UpdatedAt | timestamptz | No | NOW() | — | Timestamp de última actualización |

### Reglas de Negocio

1. **Un RSVP por invitación**: Restricción UNIQUE en InvitationId
2. **Deadline de RSVP**: No se puede enviar o actualizar RSVP menos de 7 días antes de EventDate
3. **Actualización permitida**: Invitados pueden modificar su RSVP antes del deadline
4. **Envío idempotente**: Doble-click o reintento de red resulta en un solo RSVP
5. **Dashboard en tiempo real**: Dashboard del host se actualiza dentro de 5 segundos del envío de RSVP (vía polling o WebSocket)
6. **GuestId y EventId denormalizados**: Almacenados para queries eficientes de dashboard sin joins

### Manejo GDPR

| Campo | En Solicitud de Borrado |
|-------|-------------------|
| DietaryRestrictions | Reemplazado con `[Redacted]` |
| Message | Reemplazado con `[Redacted]` |
| Attendance, NeedsTransport, PlusOne | Retenidos (datos de auditoría — necesarios para planificación del host) |
| SubmittedAt, UpdatedAt | Retenidos (timestamps de auditoría) |

---

## Accomplices

Personas de confianza con acceso vía magic link para enviar actualizaciones de evento en vivo.

### Columnas

| Columna | Tipo | Nullable | Por Defecto | Restricciones | Regla de Negocio |
|--------|------|----------|---------|-------------|---------------|
| Id | uuid | No | gen_random_uuid() | PK | — |
| EventId | uuid | No | — | FK → Events(Id), indexed | Evento asociado |
| Email | varchar(320) | No | — | Formato email válido | Email de contacto del accomplice |
| TokenHash | varchar(256) | No | — | UNIQUE, indexed | Hash SHA-256 del token magic link |
| Permissions | jsonb | No | '["send_messages","view_rsvps"]' | Array JSON válido | Permisos scoped |
| GrantedAt | timestamptz | No | NOW() | — | Timestamp de otorgamiento de acceso |
| ExpiresAt | timestamptz | No | — | Por defecto: EventDate + 1 day | Expiración de acceso |
| LastAccessedAt | timestamptz | Yes | NULL | — | Último acceso al panel |
| IsRevoked | boolean | No | false | — | Flag de revocación |
| IsAnonymized | boolean | No | false | — | Flag de anonimización GDPR |
| AnonymizedAt | timestamptz | Yes | NULL | — | Timestamp de anonimización |

### Reglas de Negocio

1. **Acceso vía magic link**: Sin contraseña requerida — token de un solo uso para acceso inicial, luego sesión JWT
2. **Permisos**: Array JSON de acciones permitidas (`send_messages`, `view_rsvps`)
3. **Expiración automática**: Acceso expira EventDate + 1 día (configurable por host)
4. **Revocación**: Host puede revocar acceso desde dashboard en cualquier momento
5. **Reenvío**: Host puede reenviar magic link si accomplice pierde el email (genera nuevo token, invalida anterior)
6. **Múltiples accomplices**: Soportado — cada uno tiene acceso y token independiente
7. **Sin cuenta requerida**: Accomplices acceden al panel directamente vía magic link (decisión MVP)

### Permissions Schema

```json
["send_messages", "view_rsvps"]
```

| Permiso | Descripción |
|------------|-------------|
| `send_messages` | Puede enviar notificaciones en vivo vía swipe-to-send |
| `view_rsvps` | Puede ver resumen de RSVP en el panel |

### Manejo GDPR

| Campo | En Solicitud de Borrado |
|-------|-------------------|
| Email | Reemplazado con `deleted-{uuid}@anonymous.invalid` |
| TokenHash | Re-hasheado con salt aleatorio |
| IsAnonymized | Establecido a `true` |
| AnonymizedAt | Establecido a `NOW()` |
| Permissions, GrantedAt, ExpiresAt, LastAccessedAt | Retenidos (datos de auditoría) |

---

## MessageTemplates

Plantillas de mensaje pre-configuradas para el panel de accomplice.

### Columnas

| Columna | Tipo | Nullable | Por Defecto | Restricciones | Regla de Negocio |
|--------|------|----------|---------|-------------|---------------|
| Id | uuid | No | gen_random_uuid() | PK | — |
| EventId | uuid | No | — | FK → Events(Id), indexed | Evento asociado |
| Label | varchar(100) | No | — | Min 1 char, max 100 | Label del botón de visualización |
| DefaultMessage | text | No | — | Min 1 char, max 500 | Texto del mensaje enviado a invitados |
| Icon | varchar(50) | No | — | De conjunto de iconos permitidos | Identificador de icono del botón |
| RequiresSwipe | boolean | No | true | — | Si se requiere gesto de swipe |
| IsDeleted | boolean | No | false | — | Flag de soft delete |

### Plantillas Por Defecto (MVP)

| Label | DefaultMessage | Icon |
|-------|---------------|------|
| Bride Leaving | "The bride is leaving the hotel!" | Bride |
| Ceremony Starting | "The ceremony is about to begin!" | Church |
| They Said Yes | "They said YES!" | Ring |
| Cocktail Hour | "Cocktail hour is starting!" | Champagne |
| Dinner Time | "Dinner is served!" | Plate |
| First Dance | "The first dance is starting!" | Dance |
| Cake Cutting | "Time for the cake!" | Cake |
| Party Time | "Let the dancing begin!" | Music |

### Reglas de Negocio

1. **Personalización por host**: Host puede editar labels y mensajes antes del evento
2. **Soft delete**: Hosts pueden remover plantillas; LiveMessages enviadas retienen referencia
3. **Conjunto de iconos**: Limitado a conjunto predefinido (sin uploads custom en MVP)
4. **Conjunto por defecto**: 8 plantillas creadas automáticamente cuando el evento se publica

### Manejo GDPR

| Campo | En Solicitud de Borrado |
|-------|-------------------|
| DefaultMessage | Reemplazado con `[Redacted]` |
| Label, Icon, RequiresSwipe | Retenidos (sin PII) |

---

## LiveMessages

Notificaciones en vivo enviadas — rastrea entrega de mensajes de accomplice a invitados.

### Columnas

| Columna | Tipo | Nullable | Por Defecto | Restricciones | Regla de Negocio |
|--------|------|----------|---------|-------------|---------------|
| Id | uuid | No | gen_random_uuid() | PK | — |
| EventId | uuid | No | — | FK → Events(Id), indexed | Evento asociado |
| AccompliceId | uuid | No | — | FK → Accomplices(Id), indexed | Accomplice remitente |
| MessageTemplateId | uuid | No | — | FK → MessageTemplates(Id) | Plantilla origen |
| CustomMessage | text | Yes | NULL | Max 500 chars | Texto de mensaje personalizado |
| SentVia | varchar(20) | No | 'whatsapp' | CHECK IN ('email','whatsapp','both') | Canal de entrega |
| SentAt | timestamptz | No | NOW() | — | Timestamp de envío del mensaje |
| DeliveryStatus | varchar(20) | No | 'pending' | CHECK IN ('pending','queued','sent','delivered','failed') | Estado de entrega actual |
| RetryCount | int | No | 0 | DEFAULT 0, max 2 | Número de intentos de reintento |

### Reglas de Negocio

1. **Swipe-to-send**: Mensajes requieren gesto de swipe (threshold 80%) para prevenir envíos accidentales
2. **Basado en cola**: Mensajes encolados en Dragonfly para procesamiento async por WhatsApp Dispatcher
3. **Rate limiting**: Máximo mensajes por accomplice por hora (prevenir spam)
4. **Seguimiento de entrega**: Status actualizado vía callbacks de webhook de WhatsApp
5. **Mensajes custom**: Accomplice puede personalizar mensaje de plantilla antes de enviar (V2+)

### Manejo GDPR

| Campo | En Solicitud de Borrado |
|-------|-------------------|
| CustomMessage | Reemplazado con `[Redacted]` |
| SentVia, SentAt, DeliveryStatus, RetryCount | Retenidos (datos de auditoría) |

---

## Payments

Registros de pago de Stripe para publicación de eventos.

### Columnas

| Columna | Tipo | Nullable | Por Defecto | Restricciones | Regla de Negocio |
|--------|------|----------|---------|-------------|---------------|
| Id | uuid | No | gen_random_uuid() | PK | — |
| EventId | uuid | No | — | FK → Events(Id), UNIQUE | Un pago por evento |
| StripePaymentIntentId | varchar(255) | Yes | NULL | UNIQUE | ID de Payment Intent de Stripe |
| StripeCustomerId | varchar(255) | Yes | NULL | — | ID de Customer de Stripe |
| Amount | decimal(10,2) | No | — | CHECK > 0 | Monto del pago en EUR |
| Currency | varchar(3) | No | 'EUR' | ISO 4217 | Siempre EUR para MVP |
| Status | varchar(20) | No | 'pending' | CHECK IN ('pending','succeeded','failed','refunded') | Estado del pago |
| Tier | varchar(20) | No | — | CHECK IN ('standard','premium') | Nivel de publicación |
| CreatedAt | timestamptz | No | NOW() | — | Timestamp de inicio del pago |
| CompletedAt | timestamptz | Yes | NULL | — | Timestamp de completación del pago |

### Reglas de Negocio

1. **Un pago por evento**: Restricción UNIQUE en EventId
2. **Precios por nivel**: Standard = EUR 19, Premium = EUR 29 (configurable)
3. **Drive por webhook**: Status actualizado vía Stripe `payment_intent.succeeded` / `payment_intent.failed` webhooks
4. **Webhook idempotente**: Mismo evento de webhook procesado múltiples veces produce el mismo resultado
5. **Sin datos de tarjeta**: Cumplimiento PCI — sin números de tarjeta almacenados (Stripe Elements maneja entrada de tarjeta)
6. **Trigger de publicación**: Status del evento cambia a `published` solo después de que el pago succeed

### Manejo GDPR

- No se almacena PII — Stripe IDs son referencias opacas, no datos personales
- Registros de pago retenidos indefinidamente para auditoría financiera y cumplimiento fiscal
- No se necesita anonimización

---

## DataRetentionJobs

Trabajos de eliminación de datos programados — trigger borrado hard 30 días después de EventEndDate.

### Columnas

| Columna | Tipo | Nullable | Por Defecto | Restricciones | Regla de Negocio |
|--------|------|----------|---------|-------------|---------------|
| Id | uuid | No | gen_random_uuid() | PK | — |
| EventId | uuid | No | — | FK → Events(Id), UNIQUE | Evento asociado |
| ScheduledDeleteAt | timestamptz | No | — | — | EventEndDate + 30 días |
| Status | varchar(20) | No | 'scheduled' | CHECK IN ('scheduled','running','completed','failed') | Estado del trabajo |
| ExecutedAt | timestamptz | Yes | NULL | — | Timestamp de ejecución real |
| FailureReason | text | Yes | NULL | Max 1000 chars | Mensaje de error si falló |
| CreatedAt | timestamptz | No | NOW() | — | Timestamp de creación del trabajo |

### Reglas de Negocio

1. **Auto-creado**: Trabajo creado cuando el evento es creado, con `ScheduledDeleteAt = EventDate + 30 días`
2. **Ejecución diaria**: CronJob runs at 02:00 UTC, queries `WHERE ScheduledDeleteAt <= NOW() AND Status = 'scheduled'`
3. **Eliminación atómica**: Todo o nada por evento dentro de una transacción
4. **Orden FK-safe**: Elimina en orden de dependencia (RSVPs → LiveMessages → ... → Events)
5. **Reintento en fallo**: Trabajos fallidos reintentados al día siguiente; max 3 reintentos antes de alertar
6. **Concurrencia**: Ejecución de pod único (`concurrencyPolicy: Forbid`)

### Orden de Eliminación

```
1. RSVPs
2. LiveMessages
3. MessageTemplates
4. Accomplices
5. Invitations
6. Guests
7. Events
8. DataRetentionJobs (self)
```

**No eliminados**: Payments, DeliveryLogs (sin PII, retenidos para auditoría)

### Manejo GDPR

- No se almacena PII — todos los campos son referencia/auditoría
- No se necesita anonimización

---

## DeliveryLogs

Trail de auditoría para todas las entregas de mensajes (email, WhatsApp, magic links, recordatorios, tarjetas de agradecimiento).

### Columnas

| Columna | Tipo | Nullable | Por Defecto | Restricciones | Regla de Negocio |
|--------|------|----------|---------|-------------|---------------|
| Id | uuid | No | gen_random_uuid() | PK | — |
| EventId | uuid | No | — | FK → Events(Id), indexed | Evento asociado |
| EntityType | varchar(30) | No | — | CHECK IN ('invitation','live_message','reminder','thank_you','magic_link') | Tipo de entidad siendo entregada |
| EntityId | uuid | No | — | — | ID de la entidad |
| Channel | varchar(20) | No | — | CHECK IN ('email','whatsapp') | Canal de entrega |
| MessageType | varchar(50) | No | — | — | Tipo específico de mensaje |
| DeliveryStatus | varchar(20) | No | 'pending' | CHECK IN ('pending','sent','delivered','opened','failed','bounced') | Estado de entrega actual |
| ProviderMessageId | varchar(255) | Yes | NULL | — | ID de mensaje de WhatsApp o email |
| SentAt | timestamptz | Yes | NULL | — | Timestamp de envío del mensaje |
| DeliveredAt | timestamptz | Yes | NULL | — | Timestamp de entrega del mensaje |
| FailedAt | timestamptz | Yes | NULL | — | Timestamp de fallo del mensaje |
| RetryCount | int | No | 0 | DEFAULT 0 | Número de reintentos |
| FailureReason | text | Yes | NULL | Max 500 chars | Descripción del error |

### Reglas de Negocio

1. **Creado para cada envío**: Cada email, mensaje WhatsApp, magic link, recordatorio y tarjeta de agradecimiento crea un DeliveryLog
2. **Transiciones de estado**: `pending → sent → delivered` o `pending → sent → failed`
3. **Actualizaciones por webhook**: Webhooks de WhatsApp actualizan `DeliveryStatus` y `DeliveredAt`/`FailedAt`
4. **Sin PII**: DeliveryLogs referencian entidades solo por ID — sin datos personales almacenados
5. **Retención**: Nunca eliminados — sirve como trail de auditoría operacional
6. **Fuente de métricas**: Tasas de entrega del dashboard, rendimiento de canal y análisis de fallos consultan esta tabla

### Tipos de Mensaje

| EntityType | Valores de MessageType |
|------------|-------------------|
| `invitation` | `invitation_email`, `invitation_whatsapp` |
| `live_message` | `live_update` |
| `reminder` | `rsvp_reminder_email`, `rsvp_reminder_whatsapp` |
| `thank_you` | `thank_you_email`, `thank_you_whatsapp` |
| `magic_link` | `login_magic_link`, `accomplice_magic_link` |

### Manejo GDPR

- No se almacena PII — todos los campos son referencia/auditoría
- No se necesita anonimización
- Retenido indefinidamente para auditoría operacional