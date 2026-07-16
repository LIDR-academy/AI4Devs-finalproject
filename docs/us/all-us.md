# Backlog de Historias de Usuario — INK·LINK MVP

> 13 historias de usuario · 80 Story Points · 9 Must-Have (52 SP) + 4 Should-Have (28 SP)
> Flujo 100% centrado en el cliente. El artista es solo datos seed en esta versión.

## Índice

| # | Historia | MoSCoW | CU | SP |
|---|----------|--------|----|----|
| US0001 | Inicio de sesión de usuarios | Must-Have | Transversal | 3 |
| US0003 | Ver vitrina principal de tatuajes | Must-Have | CU-04 | 8 |
| US0004 | Filtrar artistas por estilo, precio, rating | Must-Have | CU-04 | 8 |
| US0005 | Buscar artistas por texto | Must-Have | CU-04 | 3 |
| US0006 | Ver perfil de artista completo | Must-Have | CU-08 | 5 |
| US0007 | Badge de certificación sanitaria | Must-Have | CU-08 | 2 |
| US0008 | Seleccionar slot y ver resumen | Must-Have | CU-01 | 5 |
| US0009 | Pagar depósito vía Flow | Must-Have | CU-01 | 13 |
| US0010 | Ver historial + confirmar asistencia | Must-Have | Transversal | 5 |
| US0011 | Cotizar con chatbot conversacional | Should-Have | CU-06 | 13 |
| US0012 | Explorar artistas en mapa | Should-Have | CU-05 | 8 |
| US0013 | Calificar artista post-sesión | Should-Have | CU-03 | 5 |
| US0014 | Mostrar auspicios de marcas | Should-Have | CU-08 | 2 |

## Orden de Implementación

```
Capa 0 — Auth:           US0001
Capa 1 — Vitrina:        US0003, US0004, US0005, US0007
Capa 2 — Detalle:        US0006
Capa 3 — Reserva:        US0008, US0009
Capa 4 — Post-venta:     US0010, US0013
Capa 5 — Extras:         US0011, US0012, US0014
```

---

# US0001 — Inicio de sesión de usuarios

## Descripción
**Como** usuario registrado (seed) con rol cliente
**Quiero** iniciar sesión en la plataforma con mis credenciales
**Para** acceder a funcionalidades que requieren autenticación (reservar, confirmar asistencia, calificar)

## Criterios de Aceptación

- [ ] CA1: El usuario puede iniciar sesión con email y contraseña válidos (datos seed)
- [ ] CA2: Al autenticarse exitosamente, recibe un JWT válido con el rol correspondiente (client o artist)
- [ ] CA3: Si las credenciales son inválidas, se muestra mensaje de error genérico ("Credenciales inválidas") sin revelar si el email existe
- [ ] CA4: El token JWT expira en 24 horas y contiene: user_id, email, role, first_name
- [ ] CA5: Si el usuario tiene rol "artist", el JWT incluye además artist_profile_id
- [ ] CA6: El usuario puede cerrar sesión (invalidar token en frontend)
- [ ] CA7: Las rutas protegidas redirigen a login si no hay sesión activa

## Notas Técnicas
- No hay flujo de registro — todos los usuarios vienen precargados (seed)
- Backend: endpoint POST /api/auth/login que valida credenciales y retorna JWT
- Frontend: formulario de login, guard de rutas, interceptor para adjuntar token
- Contraseñas almacenadas como hash bcrypt en la BD
- No implementar "Olvidé mi contraseña" en esta versión
- En el MVP solo el rol "client" tiene UI funcional; el login de artista existe a nivel de endpoint pero no tiene vistas exclusivas (preparado para futuro)

## Prioridad MoSCoW
Must-Have

## Caso de Uso
Transversal

## Estimación
- Complejidad: Baja
- Story Points: 3

## Dependencias
- Seed de datos con usuarios precargados (roles client y artist)

---

# US0003 — Ver vitrina principal de tatuajes sin login

## Descripción
**Como** visitante (sin cuenta ni login)
**Quiero** ver una vitrina visual de tatuajes y artistas al abrir INK·LINK
**Para** descubrir artistas cercanos y trabajos destacados sin barreras de entrada

## Criterios de Aceptación

- [ ] CA1: Al abrir la página principal, se muestran trabajos de portafolio organizados en secciones: "Cerca de ti", "Mejor calificados", "Estilos populares", "Artistas premiados"
- [ ] CA2: Cada card de trabajo muestra: imagen del tatuaje, nombre del artista, rating promedio, estilo y comuna
- [ ] CA3: La sección "Cerca de ti" solicita permiso de geolocalización al navegador; si se rechaza, muestra artistas de toda la ciudad
- [ ] CA4: La vitrina carga en menos de 3 segundos en conexión 4G
- [ ] CA5: Las imágenes usan lazy loading y thumbnails para optimizar carga
- [ ] CA6: Al hacer click en un card, navega al perfil público del artista (US0006)
- [ ] CA7: La vitrina es completamente responsive (mobile-first)
- [ ] CA8: No se requiere login para ver la vitrina

## Notas Técnicas
- Backend: endpoint GET /api/showcase que retorna artistas agrupados por sección
- La sección "Cerca de ti" usa coordenadas del navegador + PostGIS para ordenar por distancia
- Si no hay geolocalización, retorna todos ordenados por rating
- Paginación con infinite scroll o "Ver más" por sección
- Las imágenes se sirven desde Object Storage (thumbnails 400x400)

## Prioridad MoSCoW
Must-Have

## Caso de Uso
CU-04

## Estimación
- Complejidad: Alta
- Story Points: 8

## Dependencias
- Seed de datos con artistas publicados, portafolios con imágenes y coordenadas

---

# US0004 — Filtrar artistas por estilo, precio, rating y certificación

## Descripción
**Como** visitante o cliente
**Quiero** aplicar filtros combinados sobre los artistas de la vitrina
**Para** encontrar rápidamente un artista que se ajuste a mis preferencias de estilo, presupuesto y calidad

## Criterios de Aceptación

- [ ] CA1: Existe un panel de filtros accesible desde la vitrina (sidebar en desktop, bottom sheet en mobile)
- [ ] CA2: Filtro por estilo: checkbox múltiple con los estilos del catálogo (realismo, tradicional, blackwork, fine-line, japonés, lettering, neotradicional, acuarela, geométrico, minimalista, dotwork, tribal)
- [ ] CA3: Filtro por rango de precio: slider doble (min-max) basado en min_session_price de los artistas
- [ ] CA4: Filtro por calificación mínima: selector de 1-5 estrellas
- [ ] CA5: Filtro por certificación sanitaria: toggle "Solo artistas certificados"
- [ ] CA6: Filtro por disponibilidad: toggle "Con disponibilidad esta semana"
- [ ] CA7: Filtro por tipo: radio button "Todos / Estudio / Independiente"
- [ ] CA8: Los filtros se combinan con AND lógico
- [ ] CA9: Los resultados se actualizan en tiempo real al cambiar filtros (sin botón "Aplicar")
- [ ] CA10: Se muestra contador de resultados: "X artistas encontrados"
- [ ] CA11: Si no hay resultados, se muestra mensaje con sugerencia de ampliar criterios

## Notas Técnicas
- Backend: endpoint GET /api/artists con query params para cada filtro
- Filtro de disponibilidad requiere join con tabla Availability + BlockedDate para verificar slots esta semana
- Filtro de precio usa min_session_price del ArtistProfile
- Índices en PostgreSQL para: commune, artist_type, is_published, rating_avg
- Considerar debounce en el slider de precio (300ms)

## Prioridad MoSCoW
Must-Have

## Caso de Uso
CU-04

## Estimación
- Complejidad: Alta
- Story Points: 8

## Dependencias
- US0003 (vitrina donde se aplican los filtros)
- Seed con variedad de artistas (diferentes estilos, precios, ratings, certificaciones)

---

# US0005 — Buscar artistas por texto

## Descripción
**Como** visitante o cliente
**Quiero** buscar artistas escribiendo texto libre (nombre, estilo, comuna)
**Para** encontrar directamente un artista específico o artistas en una zona

## Criterios de Aceptación

- [ ] CA1: Existe una barra de búsqueda prominente en la parte superior de la vitrina
- [ ] CA2: La búsqueda busca coincidencias en: nombre del artista (first_name + last_name), estilos asociados, comuna y bio
- [ ] CA3: Los resultados aparecen a partir de 2 caracteres con debounce de 300ms
- [ ] CA4: Se muestran sugerencias autocompletadas mientras se escribe (estilos y comunas)
- [ ] CA5: La búsqueda por texto se combina con los filtros activos (US0004)
- [ ] CA6: Sin resultados: mensaje "No encontramos artistas para '[búsqueda]'" con CTA "Limpiar filtros"

## Notas Técnicas
- Backend: agregar parámetro "search" al endpoint GET /api/artists
- Usar búsqueda full-text de PostgreSQL (ts_vector) o ILIKE para MVP
- Indexar campos buscables para performance
- Frontend: componente de búsqueda con debounce y autocompletado

## Prioridad MoSCoW
Must-Have

## Caso de Uso
CU-04

## Estimación
- Complejidad: Baja
- Story Points: 3

## Dependencias
- US0003 (vitrina)
- US0004 (integración con filtros)

---

# US0006 — Ver perfil de artista con portafolio, tarifas y certificaciones

## Descripción
**Como** visitante o cliente
**Quiero** ver el perfil completo de un artista con su portafolio, tarifas, certificaciones y premios
**Para** evaluar su trabajo, precio y credenciales antes de decidir cotizar o reservar

## Criterios de Aceptación

- [ ] CA1: El perfil es accesible por URL pública (ej: /artista/[slug]) sin requerir login
- [ ] CA2: Muestra información del artista: nombre, foto, bio, años de experiencia, tipo (estudio/independiente), comuna
- [ ] CA3: Muestra portafolio completo en grid de imágenes con lightbox para ver en grande
- [ ] CA4: Muestra tarifas publicadas: precio mínimo por sesión y precio por hora (en CLP)
- [ ] CA5: Muestra estilos que maneja como tags/badges
- [ ] CA6: Muestra certificaciones sanitarias con badge "Certificado Sanitario" si tiene vigente
- [ ] CA7: Muestra premios/reconocimientos con badge y descripción (ej: "Mejor Realismo — Expo Tattoo 2025")
- [ ] CA8: Muestra rating promedio y total de reseñas con desglose por dimensión
- [ ] CA9: Muestra calendario de disponibilidad embebido (vista semanal, slots disponibles)
- [ ] CA10: Incluye CTAs visibles: "Cotizar" y "Reservar"
- [ ] CA11: Muestra ubicación en mini-mapa con marcador

## Notas Técnicas
- Backend: endpoint GET /api/artists/:slug que retorna perfil completo con relaciones
- Incluir: portfolioItems, styles, certifications, awards, sponsorships, availability
- Las reseñas se cargan con paginación separada (GET /api/artists/:slug/reviews)
- Imágenes del portafolio con lazy loading
- El calendario de disponibilidad muestra slots libres de la semana actual y siguiente

## Prioridad MoSCoW
Must-Have

## Caso de Uso
CU-08

## Estimación
- Complejidad: Media
- Story Points: 5

## Dependencias
- US0003 (navegación desde vitrina)
- Seed completo: artistas con portafolio, certificaciones, premios, disponibilidad

---

# US0007 — Badge de certificación sanitaria

## Descripción
**Como** visitante o cliente
**Quiero** ver un badge visual claro que identifique a los artistas con certificación sanitaria vigente
**Para** identificar rápidamente artistas que cumplen estándares de bioseguridad verificados

## Criterios de Aceptación

- [ ] CA1: Los artistas con al menos una certificación activa (is_active = true) muestran badge "Certificado" en su card de la vitrina
- [ ] CA2: El badge aparece consistentemente en: cards de vitrina, resultados de búsqueda y perfil del artista
- [ ] CA3: El badge es un componente reutilizable con diseño reconocible (ícono + texto)
- [ ] CA4: Si el artista no tiene certificación activa, no se muestra badge (sin espacio vacío)

## Notas Técnicas
- El toggle de filtrado por certificación se implementa en US0004.CA5 — esta US solo cubre el componente visual
- Backend: el campo `isCertified` ya viene en la respuesta de GET /api/artists
- Frontend: componente `CertificationBadge` reutilizable, usado en ArtistCard y ArtistProfile
- En el MVP las certificaciones son datos seed — no hay flujo de carga

## Prioridad MoSCoW
Must-Have

## Caso de Uso
CU-08

## Estimación
- Complejidad: Baja
- Story Points: 2

## Dependencias
- US0003 (vitrina donde se muestran las cards)
- US0006 (perfil donde también aparece el badge)
- Seed con artistas que tengan certificaciones (y otros que no, para contrastar)

---

# US0008 — Seleccionar slot disponible y ver resumen de reserva

## Descripción
**Como** cliente autenticado
**Quiero** seleccionar un horario disponible del artista y ver el resumen completo de la reserva
**Para** confirmar los detalles antes de proceder al pago del depósito

## Criterios de Aceptación

- [ ] CA1: Desde el perfil del artista, el cliente ve el calendario con slots disponibles
- [ ] CA2: El calendario muestra vista semanal con navegación a semanas siguientes
- [ ] CA3: Los slots disponibles se muestran como botones seleccionables; los ocupados/bloqueados aparecen deshabilitados
- [ ] CA4: Al seleccionar un slot, se muestra el resumen de reserva con: nombre del artista, fecha, hora, duración estimada, rango de precio estimado, monto del depósito (calculado: precio_min x deposit_percentage)
- [ ] CA5: Si el cliente no está autenticado al seleccionar slot, se redirige a login (US0001) y retorna al resumen
- [ ] CA6: El resumen incluye botón "Pagar depósito" que lleva a US0009
- [ ] CA7: El slot queda reservado temporalmente (5 minutos) mientras el cliente revisa y paga
- [ ] CA8: Si expira el tiempo sin pagar, el slot se libera automáticamente

## Notas Técnicas
- Backend: GET /api/artists/:id/availability?week=YYYY-MM-DD retorna slots disponibles de la semana
- El cálculo de slots disponibles debe excluir: bookings confirmados, blocked_dates, y horarios fuera de Availability
- POST /api/bookings/hold para reservar temporalmente el slot (TTL 5 min con campo expires_at)
- Frontend: componente de calendario semanal interactivo
- El rango de precio en el resumen viene de las tarifas base del artista (min_session_price, deposit_percentage)

## Prioridad MoSCoW
Must-Have

## Caso de Uso
CU-01

## Estimación
- Complejidad: Media
- Story Points: 5

## Dependencias
- US0001 (autenticación requerida para reservar)
- US0006 (perfil del artista con calendario)
- Seed con artistas que tengan agenda configurada y slots disponibles

---

# US0009 — Pagar depósito vía Flow y confirmar reserva

## Descripción
**Como** cliente autenticado con un slot seleccionado
**Quiero** pagar el depósito de reserva a través de Flow (pasarela de pagos chilena)
**Para** confirmar mi cita con el artista y asegurar el horario

## Criterios de Aceptación

- [ ] CA1: Al presionar "Pagar depósito" se redirige al checkout de Flow con el monto del depósito precalculado
- [ ] CA2: El monto del depósito se calcula como: estimated_price_min x (deposit_percentage / 100)
- [ ] CA3: Al completar el pago exitosamente en Flow, se crea el booking con status "confirmed"
- [ ] CA4: Se muestra pantalla de confirmación con: número de reserva, artista, fecha, hora, monto pagado
- [ ] CA5: Si el pago es rechazado, se muestra error con opción de reintentar
- [ ] CA6: Si el pago se abandona (vuelve sin completar), el slot se libera tras el TTL
- [ ] CA7: Se registra el Payment con flow_transaction_id, amount, platform_fee y artist_amount
- [ ] CA8: La comisión de plataforma se calcula automáticamente (5-10% configurable)
- [ ] CA9: No se requiere aprobación del artista — si el slot está abierto y se paga, la reserva es firme

## Notas Técnicas
- Integración con Flow API Chile (https://www.flow.cl/docs/api.html)
- Backend: POST /api/payments/create genera orden Flow y retorna URL de pago
- Callback: POST /api/payments/confirm (webhook de Flow) actualiza Payment y Booking status
- Return URL: GET /api/payments/return redirige al frontend con estado
- Manejar idempotencia: si el webhook llega múltiple veces, no duplicar
- Considerar ambiente sandbox de Flow para desarrollo
- El slot temporal (hold) se convierte en booking confirmado al recibir pago OK

## Prioridad MoSCoW
Must-Have

## Caso de Uso
CU-01

## Estimación
- Complejidad: Alta
- Story Points: 13

## Dependencias
- US0008 (slot seleccionado y resumen)
- Cuenta de comercio en Flow (sandbox para dev, producción para release)

---

# US0010 — Ver historial de reservas del cliente

## Descripción
**Como** cliente autenticado
**Quiero** ver mi historial de reservas (pasadas y futuras)
**Para** revisar mis citas programadas, su estado y los detalles de cada reserva

## Criterios de Aceptación

- [ ] CA1: Existe una sección "Mis Reservas" accesible desde el menú de usuario autenticado
- [ ] CA2: Las reservas se muestran ordenadas por fecha (próximas primero, luego históricas)
- [ ] CA3: Cada reserva muestra: nombre del artista, fecha, hora, estado (confirmada/completada/cancelada), monto pagado
- [ ] CA4: Los estados se muestran con indicadores visuales (colores/iconos): confirmada=azul, completada=verde, cancelada=rojo
- [ ] CA5: Al hacer click en una reserva, se ve el detalle completo: artista, fecha, hora, estilo, zona corporal, precio estimado, depósito pagado, notas
- [ ] CA6: Las reservas con status "completed" muestran CTA "Calificar" si no tienen reseña asociada (US0013)
- [ ] CA7: Se muestra estado vacío ("No tienes reservas aún") si el cliente no tiene bookings
- [ ] CA8: Las reservas con status "confirmed" cuya fecha ya pasó muestran botón "Confirmar asistencia"
- [ ] CA9: Al presionar "Confirmar asistencia", el booking pasa a status "completed" y aparece el CTA "Calificar"
- [ ] CA10: Las reservas con status "confirmed" cuya fecha aún no llega muestran botón "Cancelar reserva" con diálogo de confirmación que recuerda la política de cancelación del artista (24h/48h/72h)
- [ ] CA11: Al confirmar la cancelación, el booking pasa a status "cancelled" (se registra cancelled_at) y el slot vuelve a estar disponible. En el MVP no hay reembolso automático del depósito (la protección anti no-show es Won't-Have)

## Notas Técnicas
- Backend: GET /api/bookings/me (autenticado, filtra por client_id del JWT)
- Backend: POST /api/bookings/{id}/complete (solo si booking pertenece al cliente y fecha < ahora y status = confirmed)
- Backend: POST /api/bookings/{id}/cancel (solo si booking pertenece al cliente, status = confirmed y fecha futura)
- Incluir datos del artista (nombre, avatar, slug) para navegación
- Incluir flag has_review para saber si mostrar CTA de calificación
- Paginación si el historial es largo (page + limit)

## Prioridad MoSCoW
Must-Have

## Caso de Uso
Transversal

## Estimación
- Complejidad: Media
- Story Points: 5

## Dependencias
- US0001 (autenticación)
- US0009 (booking confirmado previamente)

---

# US0011 — Cotizar tatuaje con chatbot conversacional

## Descripción
**Como** visitante o cliente
**Quiero** interactuar con un chatbot que me guíe paso a paso para estimar el precio de un tatuaje
**Para** obtener un rango de precio inmediato sin esperar respuesta del artista por DM

## Criterios de Aceptación

- [ ] CA1: Desde el perfil del artista, existe botón "Cotizar" que abre el chatbot
- [ ] CA2: El chatbot realiza 5 preguntas en secuencia conversacional:
  - Paso 1: "¿En qué zona del cuerpo?" — silueta interactiva o selector
  - Paso 2: "¿Qué tamaño aproximado?" — opciones visuales (moneda/palma/mano/brazo)
  - Paso 3: "¿Qué estilo te interesa?" — galería con estilos del artista
  - Paso 4: "¿Tienes imágenes de referencia?" — upload 1-3 fotos (opcional)
  - Paso 5: "¿Color o B&N? ¿Es cover-up?" — toggles
- [ ] CA3: Al completar las 5 preguntas, el chatbot muestra rango de precio estimado (ej: "$80.000 - $150.000 CLP")
- [ ] CA4: El cálculo usa las tarifas del artista (min_session_price, hourly_rate) + factores de complejidad (tamaño, estilo, color, cover-up)
- [ ] CA5: Después del precio, el chatbot ofrece CTA "¿Quieres reservar?" que lleva directamente a selección de slot (US0008)
- [ ] CA6: El cliente puede volver atrás en cualquier paso para ajustar respuestas
- [ ] CA7: Si el cliente no quiere reservar ahora, la cotización queda guardada (si está autenticado)
- [ ] CA8: Los datos del chatbot (zona, tamaño, estilo, color, cover-up, referencias) se pasan al booking si reserva
- [ ] CA9: Si la reserva se origina en una cotización, el booking hereda el rango estimado y el depósito se calcula como deposit_percentage × máx(mínimo cotizado, min_session_price); sin cotización, fallback 30% × min_session_price (decisión `fixs/issue-007.md`)

## Notas Técnicas
- Frontend: componente de chat con pasos guiados (no IA generativa — flujo determinístico)
- Backend: POST /api/quotes/calculate con body {artist_id, body_zone, size, style_id, is_color, is_coverup}
- Fórmula de pricing: base = max(min_session_price, hourly_rate x estimated_hours); rango = base x [0.8, 1.3] ajustado por factores
- Factores de complejidad: cover-up +30%, color +20%, zona difícil +15%
- Las imágenes de referencia se suben a Object Storage y se asocian al booking si se concreta
- El chatbot no usa IA generativa — es un wizard conversacional con UI de chat

## Prioridad MoSCoW
Should-Have

## Caso de Uso
CU-06

## Estimación
- Complejidad: Alta
- Story Points: 13

## Dependencias
- US0006 (perfil del artista con tarifas)
- US0008 (flujo de reserva al que conecta)

---

# US0012 — Explorar artistas en mapa interactivo

## Descripción
**Como** visitante o cliente
**Quiero** ver artistas y estudios ubicados en un mapa interactivo con mi posición
**Para** descubrir opciones cercanas geográficamente y evaluar conveniencia de ubicación

## Criterios de Aceptación

- [ ] CA1: Existe una vista "Mapa" accesible desde la navegación principal (alternativa a la vitrina)
- [ ] CA2: Al acceder, se solicita permiso de geolocalización; si se acepta, el mapa se centra en la ubicación del cliente
- [ ] CA3: Si se rechaza geolocalización, el mapa se centra en Santiago con selector de comuna
- [ ] CA4: Los artistas/estudios se muestran como marcadores en el mapa con clustering automático en zonas densas
- [ ] CA5: El radio de búsqueda es configurable: 1km, 5km, 10km, toda la ciudad
- [ ] CA6: Al tocar un marcador, se muestra preview card con: foto del portafolio, nombre, rating, estilo principal y comuna
- [ ] CA7: El preview card incluye CTAs: "Ver perfil" y "Cotizar"
- [ ] CA8: Existe toggle para cambiar entre vista mapa y vista lista
- [ ] CA9: Los filtros de US0004 se aplican también sobre la vista de mapa

## Notas Técnicas
- Frontend: Leaflet + OpenStreetMap (no Google Maps — sin costo)
- Backend: GET /api/artists/geo?lat=X&lng=Y&radius=Z retorna artistas dentro del radio con PostGIS (ST_DWithin)
- Clustering: usar Leaflet.markercluster para agrupar marcadores cercanos
- Los marcadores usan la foto destacada del artista como ícono
- Considerar límite de marcadores visibles (max 100) para performance

## Prioridad MoSCoW
Should-Have

## Caso de Uso
CU-05

## Estimación
- Complejidad: Alta
- Story Points: 8

## Dependencias
- US0003 (como vista alternativa a la vitrina)
- US0004 (filtros compartidos)
- Seed con artistas que tengan coordenadas reales de Santiago

---

# US0013 — Calificar artista post-sesión

## Descripción
**Como** cliente autenticado con un booking completado
**Quiero** dejar una calificación multidimensional y reseña opcional del artista
**Para** ayudar a otros clientes a tomar decisiones informadas y premiar al artista por buen servicio

## Criterios de Aceptación

- [ ] CA1: En "Mis Reservas", las reservas con estado "completed" muestran botón "Calificar" si no tienen reseña asociada
- [ ] CA2: El formulario de calificación incluye 4 dimensiones con estrellas 1-5:
  - Higiene y limpieza del espacio
  - Manejo del dolor / confort
  - Trato y profesionalismo
  - Resultado del tatuaje
- [ ] CA3: El rating general es el promedio de las 4 dimensiones
- [ ] CA4: Opcionalmente, el cliente puede escribir un comentario de texto (máx 500 chars)
- [ ] CA5: Opcionalmente, puede subir 1 foto del tatuaje fresco (la foto de healing se descarta del MVP)
- [ ] CA6: La calificación se envía y se recalcula el rating promedio del artista
- [ ] CA7: Las calificaciones se muestran en el perfil del artista (US0006) ordenadas por fecha
- [ ] CA8: No se puede editar ni eliminar una calificación una vez enviada
- [ ] CA9: Solo se puede calificar un booking una vez

## Notas Técnicas
- Backend: POST /api/reviews con body {booking_id, hygiene, pain, treatment, result, comment?, photo?}
- Validar que el booking pertenece al usuario y está en status "completed"
- Validar que no exista ya una review para ese booking
- Recalcular artist.rating_avg como promedio ponderado de todas las reviews
- La foto se sube al Object Storage, thumbnail generado para la vitrina
- Índice único en reviews(booking_id) para prevenir duplicados

## Prioridad MoSCoW
Should-Have

## Caso de Uso
CU-03

## Estimación
- Complejidad: Media
- Story Points: 5

## Dependencias
- US0010 (historial donde aparece CTA + confirmar asistencia que habilita status completed)
- US0006 (perfil donde se muestran reviews)

---

# US0014 — Mostrar auspicios de marcas en perfil de artista

## Descripción
**Como** visitante o cliente
**Quiero** ver qué marcas de insumos auspician a un artista
**Para** evaluar la calidad de materiales que utiliza y generar confianza en su trabajo

## Criterios de Aceptación

- [ ] CA1: En el perfil del artista (US0006), existe sección "Auspiciado por" si el artista tiene marcas asociadas
- [ ] CA2: Cada marca se muestra con: logo (imagen), nombre y tipo de relación (embajador/auspiciado/certificado)
- [ ] CA3: Los badges de marca aparecen también como indicadores en las tarjetas de la vitrina (US0003)
- [ ] CA4: Si el artista no tiene marcas asociadas, la sección no se muestra
- [ ] CA5: Los datos de auspicios provienen del seed (no hay CRUD en el MVP)

## Notas Técnicas
- Backend: Los datos se obtienen junto con GET /api/artists/{slug} (relación artist_sponsors incluida)
- Modelo: tabla artist_sponsors con (artist_id, brand_name, brand_logo_url, relationship_type)
- relationship_type: enum ['ambassador', 'sponsored', 'certified']
- Las imágenes de logos de marca se incluyen en el seed como URLs en Object Storage
- Es un feature de lectura pura — no requiere formularios ni CRUD

## Prioridad MoSCoW
Should-Have

## Caso de Uso
CU-08

## Estimación
- Complejidad: Baja
- Story Points: 2

## Dependencias
- US0006 (perfil del artista donde se muestra)
- Seed con datos de marcas y relaciones
