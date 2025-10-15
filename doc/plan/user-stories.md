# User Stories (MVP)

## US1: Login corporativo por SSO (OIDC)
Como empleado, quiero iniciar sesión con mi cuenta corporativa para acceder a la plataforma de forma segura.

Criterios de aceptación:
- Redirige a IdP (Keycloak) y vuelve con sesión iniciada.
- Tokens válidos y roles básicos.

## US2: Completar perfil mínimo
Como empleado, quiero completar mi perfil con zona aproximada, sede y rol para que el sistema pueda sugerirme viajes.

Criterios de aceptación:
- Zona aproximada (barrio/CP), sede y rol (conductor/pasajero).
- Privacidad: no se guarda dirección exacta.

## US3: Publicar trayecto (conductor)
Como conductor, quiero publicar un trayecto con fecha/hora, origen aprox., destino (sede) y plazas para ofrecer plazas a compañeros.

Criterios de aceptación:
- Formulario con campos mínimos; crear/editar/cancelar.

## US4: Buscar y reservar (pasajero)
Como pasajero, quiero buscar trayectos por sede y franja horaria y reservar una plaza para coordinar mi viaje.

Criterios de aceptación:
- Filtros sencillos; reserva inmediata si hay plaza; confirmación.

## US5: Ver viajes confirmados
Como usuario, quiero ver mis viajes confirmados para conocer detalles y participantes.

Criterios de aceptación:
- Lista de próximos viajes con rol del usuario.

## US6: Gestionar suscripción a notificaciones push
Como usuario, quiero activar/desactivar notificaciones push para recibir avisos de confirmaciones y recordatorios.

Criterios de aceptación:
- Alta/baja de suscripción (navigator.serviceWorker + pushManager).
- Envío de suscripción al backend y almacenamiento por usuario.
- Permisos del navegador gestionados con mensajes claros.

## US7: Recibir notificación en confirmación de reserva (email + push)
Como conductor/pasajero, quiero recibir una notificación inmediata cuando una reserva se confirma.

Criterios de aceptación:
- Email y push enviados en BookingConfirmed.
- Contenido con datos esenciales: fecha/hora, punto de encuentro, participantes.
- Reintentos básicos si falla el envío push/email.

## US8: Buscar viajes con coincidencias (Matching básico)
Como pasajero, quiero buscar viajes por sede/franja y ver coincidencias con un score simple para seleccionar la mejor opción.

Criterios de aceptación:
- Filtros por sede y franja horaria.
- Listado con score y ordenación por mejor coincidencia.
- Acceso a reservar desde el resultado.
