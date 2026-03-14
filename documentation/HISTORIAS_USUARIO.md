# Historias de Usuario - CitaYa MVP

Este documento contiene 12 historias de usuario propuestas para el MVP de CitaYa.

---

## Historia de Usuario 1: Registro de Paciente

**Como** paciente nuevo  
**Quiero** registrarme en la plataforma con mi email y contraseña  
**Para** poder acceder al sistema y buscar médicos cercanos

### Descripción
Un paciente nuevo debe poder crear una cuenta en la plataforma proporcionando información básica (email, contraseña, nombre, apellido) y completar el proceso de registro con protección anti-bot.

### Criterios de Aceptación

#### CA1: Formulario de Registro
- [ ] El formulario debe incluir los siguientes campos obligatorios:
  - Email (validación de formato)
  - Contraseña (mínimo 8 caracteres)
  - Nombre (firstName)
  - Apellido (lastName)
  - Rol: "patient" (pre-seleccionado, no editable)
- [ ] El formulario debe incluir campo opcional:
  - Teléfono (formato internacional)
- [ ] Todos los campos deben tener validación en tiempo real
- [ ] El formulario debe mostrar mensajes de error claros para cada campo inválido

#### CA2: Protección Anti-bot
- [ ] El formulario debe incluir reCAPTCHA v3 antes de enviar
- [ ] El score de reCAPTCHA debe validarse en el backend antes de procesar el registro
- [ ] Si el score es menor al threshold configurado, se debe rechazar el registro con mensaje apropiado

#### CA3: Validación de Email Único
- [ ] El sistema debe verificar que el email no esté ya registrado
- [ ] Si el email existe, debe retornar error 409 con mensaje: "Email ya está registrado"
- [ ] El mensaje debe mostrarse claramente en el frontend

#### CA4: Rate Limiting
- [ ] El endpoint debe limitar a 3 intentos de registro por IP cada hora
- [ ] Si se excede el límite, debe retornar error 429 con header `Retry-After`
- [ ] El mensaje debe indicar cuánto tiempo debe esperar el usuario

#### CA5: Creación de Usuario
- [ ] Al completar el registro exitosamente:
  - Se crea el usuario en la base de datos con role="patient"
  - La contraseña se hashea con bcrypt (salt rounds=12)
  - Se establece `emailVerified=false` por defecto
  - Se registra timestamp de creación
- [ ] Se genera un JWT access token (duración 15 minutos)
- [ ] Se genera un JWT refresh token (duración 7 días) almacenado en cookie httpOnly
- [ ] Se retorna respuesta 201 con información del usuario y tokens

#### CA6: Respuesta Exitosa
- [ ] La respuesta debe incluir:
  - Objeto `user` con: id, email, firstName, lastName, role, emailVerified
  - `accessToken` (string JWT)
  - `refreshToken` (string JWT, también en cookie)
- [ ] El usuario debe ser redirigido automáticamente al dashboard de paciente

#### CA7: Internacionalización
- [ ] Todos los mensajes del formulario y errores deben estar disponibles en español e inglés
- [ ] El idioma debe detectarse automáticamente según preferencias del navegador
- [ ] El usuario debe poder cambiar el idioma manualmente

#### CA8: Auditoría
- [ ] Se debe registrar en `audit_logs`:
  - Acción: "register"
  - Entity_type: "user"
  - Entity_id: ID del usuario creado
  - IP_address: IP del usuario
  - Timestamp: Fecha/hora del registro

---

## Historia de Usuario 2: Registro de Médico

**Como** médico nuevo  
**Quiero** registrarme en la plataforma con mi información profesional  
**Para** poder ofrecer mis servicios y gestionar mi agenda

### Descripción
Un médico nuevo debe poder crear una cuenta proporcionando información personal y profesional, incluyendo dirección y código postal para geolocalización.

### Criterios de Aceptación

#### CA1: Formulario de Registro Médico
- [ ] El formulario debe incluir los siguientes campos obligatorios:
  - Email (validación de formato)
  - Contraseña (mínimo 8 caracteres)
  - Nombre (firstName)
  - Apellido (lastName)
  - Rol: "doctor" (pre-seleccionado, no editable)
  - Dirección completa del consultorio/clínica
  - Código postal (obligatorio para geolocalización fallback)
- [ ] El formulario debe incluir campos opcionales:
  - Teléfono (formato internacional)
  - Bio (descripción profesional, máximo 1000 caracteres)
- [ ] Todos los campos deben tener validación en tiempo real

#### CA2: Geocodificación de Dirección
- [ ] Al ingresar dirección y código postal:
  - Se debe llamar a Google Maps Geocoding API para obtener coordenadas (latitude, longitude)
  - Si la geocodificación falla, se debe permitir el registro pero mostrar advertencia
  - Las coordenadas se almacenan en la tabla `DOCTORS`
- [ ] El código postal se almacena obligatoriamente para búsqueda fallback

#### CA3: Protección Anti-bot
- [ ] El formulario debe incluir reCAPTCHA v3 antes de enviar
- [ ] El score de reCAPTCHA debe validarse en el backend antes de procesar el registro

#### CA4: Validación de Email Único
- [ ] El sistema debe verificar que el email no esté ya registrado
- [ ] Si el email existe, debe retornar error 409 con mensaje apropiado

#### CA5: Rate Limiting
- [ ] El endpoint debe limitar a 3 intentos de registro por IP cada hora
- [ ] Si se excede el límite, debe retornar error 429 con header `Retry-After`

#### CA6: Creación de Usuario y Perfil Médico
- [ ] Al completar el registro exitosamente:
  - Se crea el usuario en la tabla `USERS` con role="doctor"
  - Se crea el registro correspondiente en la tabla `DOCTORS` con:
    - `verification_status='pending'` (por defecto)
    - Dirección y código postal
    - Coordenadas geográficas (si geocodificación exitosa)
    - Bio (si se proporcionó)
  - La contraseña se hashea con bcrypt (salt rounds=12)
  - Se establece `emailVerified=false` por defecto
- [ ] Se genera un JWT access token (duración 15 minutos)
- [ ] Se genera un JWT refresh token (duración 7 días) almacenado en cookie httpOnly

#### CA7: Estado de Verificación
- [ ] El médico debe ver un mensaje indicando que su cuenta está pendiente de verificación
- [ ] El médico debe poder acceder a su panel pero con funcionalidades limitadas hasta la verificación
- [ ] Se debe mostrar claramente el estado de verificación en el perfil

#### CA8: Respuesta Exitosa
- [ ] La respuesta debe incluir:
  - Objeto `user` con: id, email, firstName, lastName, role, emailVerified
  - `accessToken` (string JWT)
  - `refreshToken` (string JWT, también en cookie)
- [ ] El médico debe ser redirigido al panel de médico con instrucciones para completar verificación

#### CA9: Internacionalización
- [ ] Todos los mensajes del formulario y errores deben estar disponibles en español e inglés

#### CA10: Auditoría
- [ ] Se debe registrar en `audit_logs`:
  - Acción: "register"
  - Entity_type: "user" y "doctor"
  - Entity_id: IDs creados
  - IP_address: IP del usuario
  - Timestamp: Fecha/hora del registro

---

## Historia de Usuario 3: Búsqueda de Médicos por Especialidad y Proximidad

**Como** paciente autenticado  
**Quiero** buscar médicos por especialidad y proximidad geográfica  
**Para** encontrar médicos cercanos que atiendan mi necesidad médica

### Descripción
Un paciente autenticado debe poder buscar médicos filtrando por especialidad y usando su ubicación (o código postal) para encontrar médicos cercanos, con visualización en mapa.

### Criterios de Aceptación

#### CA1: Autenticación Requerida
- [ ] El endpoint requiere autenticación JWT (Bearer token)
- [ ] Si no hay token o es inválido, debe retornar error 401
- [ ] El token debe contener role="patient"

#### CA2: Filtros de Búsqueda
- [ ] El formulario de búsqueda debe incluir:
  - Selector de especialidad (dropdown con especialidades activas)
  - Opción para usar geolocalización del navegador (botón "Usar mi ubicación")
  - Campo opcional para código postal (fallback si no hay geolocalización)
  - Selector de radio de búsqueda (por defecto 5km, editable 1-50km)
  - Filtro opcional por fecha para ver disponibilidad

#### CA3: Geolocalización
- [ ] Si el usuario permite acceso a ubicación:
  - Se obtienen coordenadas (lat, lng) del navegador
  - Se muestran en el mapa con marcador del usuario
  - Se usa para calcular distancia a médicos
- [ ] Si el usuario deniega acceso a ubicación:
  - Se muestra campo de código postal como obligatorio
  - Se usa código postal para búsqueda fallback

#### CA4: Entrada desde Home y Navegación a Search
- [ ] En la home se muestra formulario de búsqueda embebido en el banner principal
- [ ] El botón "Soy médico" permanece visible en el banner
- [ ] Al enviar búsqueda desde home, se navega a `/search` con query params
- [ ] Si existe geolocalización, se envían `lat` y `lng`
- [ ] Si el usuario captura código postal, se envía `postalCode` como fallback

#### CA5: Estado Inicial de la Página Search
- [ ] Si `/search` carga sin búsqueda previa, se muestran los 5 últimos médicos registrados
- [ ] El listado inicial solo incluye médicos con `verification_status='approved'`
- [ ] Al ejecutar una búsqueda, el listado inicial se reemplaza por resultados filtrados

#### CA6: Búsqueda por Proximidad (con coordenadas)
- [ ] Si se proporcionan coordenadas (lat, lng):
  - Se calcula distancia usando fórmula Haversine en MySQL
  - Se filtran médicos dentro del radio especificado (por defecto 5km)
  - Se ordenan por distancia (más cercanos primero)
  - Se muestra distancia en kilómetros para cada médico
- [ ] Solo se muestran médicos con `verification_status='approved'`
- [ ] Solo se muestran médicos con `deleted_at IS NULL`

#### CA7: Búsqueda por Código Postal (fallback)
- [ ] Si no hay coordenadas pero hay código postal:
  - Se usa código postal para filtrar médicos
  - Se ordenan por especialidad y rating promedio
  - No se muestra distancia (no aplicable)
- [ ] Se debe mostrar mensaje indicando que se está usando búsqueda por código postal
- [ ] Si no hay resultados por geolocalización y se recibió `postalCode`, el backend debe reintentar automáticamente con `postalCode`

#### CA8: Filtro por Disponibilidad
- [ ] Si se proporciona fecha en el filtro:
  - Se muestran solo médicos con slots disponibles en esa fecha
  - Se verifica que los slots tengan `is_available=true`
  - Se verifica que los slots no estén bloqueados (`locked_until < NOW()` o `locked_until IS NULL`)

#### CA9: Resultados de Búsqueda
- [ ] Cada resultado debe mostrar:
  - Nombre completo del médico (firstName + lastName)
  - Especialidades (con nombre en idioma seleccionado)
  - Dirección
  - Distancia en km (si búsqueda por coordenadas)
  - Rating promedio (si tiene reseñas)
  - Total de reseñas
  - Estado de verificación (solo "approved" debe aparecer)
  - Botón "Ver perfil" y "Ver disponibilidad"

#### CA10: Visualización en Mapa
- [ ] Se debe mostrar mapa de Google Maps con:
  - Marcador del usuario (si hay geolocalización)
  - Marcadores de todos los médicos encontrados
  - InfoWindow al hacer clic en marcador con información básica del médico
  - Zoom automático para mostrar todos los marcadores
- [ ] El mapa debe ser interactivo y permitir hacer clic en marcadores

#### CA11: Paginación
- [ ] Los resultados deben estar paginados:
  - Por defecto: 20 resultados por página
  - Máximo: 50 resultados por página
  - Debe incluir información de paginación: página actual, total de páginas, total de resultados

#### CA12: Cache
- [ ] Los resultados deben cachearse en Redis:
  - Key: `doctors:{specialty}:{lat}:{lng}:{radius}:{date}`
  - TTL: 10 minutos
  - Si hay cache hit, se retornan resultados desde cache sin consultar BD

#### CA13: Validaciones de Disparo de Búsqueda
- [ ] Frontend debe bloquear submit si no existe especialidad
- [ ] Frontend debe bloquear submit si no existe ni geolocalización ni código postal
- [ ] El backend debe rechazar búsquedas sin ubicación ni código postal con error 400

#### CA14: Manejo de Errores
- [ ] Si no se encuentran médicos:
  - Se muestra mensaje: "No se encontraron médicos con los criterios especificados"
  - Se sugiere ampliar el radio de búsqueda o cambiar especialidad
- [ ] Si falla la geocodificación:
  - Se muestra mensaje de error pero se permite búsqueda por código postal

#### CA15: Internacionalización
- [ ] Todos los textos deben estar disponibles en español e inglés
- [ ] Los nombres de especialidades deben mostrarse en el idioma seleccionado

#### CA16: Performance
- [ ] La búsqueda debe completarse en menos de 500ms (P95)
- [ ] Se deben usar índices adecuados en BD para optimizar consultas geográficas

---

## Historia de Usuario 4: Reserva de Cita Médica

**Como** paciente autenticado  
**Quiero** reservar una cita con un médico seleccionando un slot disponible  
**Para** poder recibir atención médica en la fecha y hora que prefiero

### Descripción
Un paciente autenticado debe poder seleccionar un médico, ver sus slots disponibles, elegir uno y confirmar la reserva. El sistema debe prevenir doble booking usando transacciones ACID y soft locks.

### Criterios de Aceptación

#### CA1: Autenticación y Autorización
- [ ] El endpoint requiere autenticación JWT (Bearer token)
- [ ] Si no hay token o es inválido, debe retornar error 401
- [ ] El token debe contener role="patient"

#### CA2: Visualización de Slots Disponibles
- [ ] Al seleccionar un médico, se debe mostrar:
  - Calendario con fechas disponibles (solo fechas futuras)
  - Slots disponibles por día (horarios con duración estándar de 30 minutos)
  - Slots bloqueados o no disponibles deben mostrarse deshabilitados
- [ ] Los slots deben mostrarse en zona horaria de CDMX
- [ ] Solo se muestran slots con `is_available=true` y que no estén bloqueados

#### CA3: Selección de Slot
- [ ] El paciente puede hacer clic en un slot disponible
- [ ] Al seleccionar un slot:
  - Se muestra información del slot: fecha, hora de inicio, hora de fin
  - Se muestra información del médico: nombre, especialidad, dirección
  - Se habilita botón "Confirmar Cita"
  - Opcionalmente se puede agregar nota (máximo 500 caracteres)

#### CA4: Bloqueo Temporal de Slot (Soft Lock)
- [ ] Al iniciar el proceso de reserva:
  - El slot se bloquea temporalmente para el paciente (`locked_by=patientId`)
  - Se establece `locked_until=NOW() + 5 minutos`
  - El slot aparece como "reservando..." para otros usuarios
- [ ] Si el paciente no completa la reserva en 5 minutos:
  - El lock expira automáticamente
  - El slot vuelve a estar disponible
  - Se ejecuta cleanup job para liberar locks expirados

#### CA5: Validación de Restricciones de Negocio
- [ ] Antes de crear la cita, se debe validar:
  - El paciente no tiene otra cita activa (`status IN ('confirmed', 'pending')` y `appointment_date > NOW()`)
  - Si tiene cita activa, debe retornar error 400: "Ya tienes una cita activa. Cancela o reprograma la cita existente antes de crear una nueva"
  - El slot sigue disponible (`is_available=true` y no está bloqueado por otro usuario)
  - El slot pertenece al médico seleccionado

#### CA6: Creación de Cita (Transacción ACID)
- [ ] La creación de cita debe ejecutarse en una transacción ACID:
  1. Verificar y bloquear el slot (UPDATE con WHERE conditions)
  2. Verificar que paciente no tiene cita activa
  3. Crear registro en tabla `APPOINTMENTS` con:
     - `status='confirmed'`
     - `appointment_date` (fecha/hora del slot)
     - `reminder_sent=false`
     - `notes` (si se proporcionaron)
  4. Marcar slot como no disponible (`is_available=false`)
  5. Crear registro en `APPOINTMENT_HISTORY` con cambio de estado
- [ ] Si cualquier paso falla, se hace rollback completo de la transacción

#### CA7: Prevención de Doble Booking
- [ ] Si dos pacientes intentan reservar el mismo slot simultáneamente:
  - Solo uno debe tener éxito (el primero en adquirir el lock)
  - El segundo debe recibir error 409: "El slot ya fue reservado por otro paciente"
- [ ] Se debe usar SELECT FOR UPDATE o UPDATE con condiciones para garantizar atomicidad

#### CA8: Notificación de Confirmación
- [ ] Después de crear la cita exitosamente:
  - Se encola trabajo en Bull para enviar email de confirmación (SendGrid)
  - Se encola trabajo para enviar Web Push notification (si está habilitado)
  - El email debe incluir:
    - Fecha y hora de la cita
    - Nombre del médico
    - Dirección del consultorio
    - Instrucciones para reprogramar o cancelar
- [ ] Las notificaciones se envían de forma asíncrona (no bloquean la respuesta)

#### CA9: Respuesta Exitosa
- [ ] La respuesta debe incluir:
  - `id` de la cita creada
  - `appointmentDate` (formato ISO 8601 con timezone CDMX)
  - `status: "confirmed"`
  - Información del médico (nombre, especialidad)
  - Información del slot (startTime, endTime)
  - `createdAt` timestamp
- [ ] Se retorna código 201 Created

#### CA10: Manejo de Errores
- [ ] Si el slot no existe: error 404 "Slot no encontrado"
- [ ] Si el médico no existe: error 404 "Médico no encontrado"
- [ ] Si el slot no está disponible: error 400 "El slot seleccionado no está disponible"
- [ ] Si el paciente tiene cita activa: error 400 con código "ACTIVE_APPOINTMENT_EXISTS"
- [ ] Si hay conflicto de reserva: error 409 "El slot ya fue reservado por otro paciente"
- [ ] Todos los errores deben tener mensajes claros y códigos apropiados

#### CA11: Auditoría
- [ ] Se debe registrar en `audit_logs`:
  - Acción: "create_appointment"
  - Entity_type: "appointment"
  - Entity_id: ID de la cita creada
  - IP_address: IP del paciente
  - Timestamp: Fecha/hora de creación

#### CA12: Internacionalización
- [ ] Todos los mensajes deben estar disponibles en español e inglés

#### CA13: Performance
- [ ] La creación de cita debe completarse en menos de 1 segundo (P95)
- [ ] Las notificaciones no deben bloquear la respuesta del API

---

## Historia de Usuario 5: Reprogramación y Cancelación de Cita

**Como** paciente autenticado  
**Quiero** reprogramar o cancelar una cita existente  
**Para** ajustar mi agenda según mis necesidades

### Descripción
Un paciente autenticado debe poder reprogramar una cita seleccionando un nuevo slot disponible, o cancelar una cita sin penalizaciones ni límites de tiempo.

### Criterios de Aceptación

#### CA1: Autenticación y Autorización
- [ ] El endpoint requiere autenticación JWT (Bearer token)
- [ ] Solo el paciente dueño de la cita puede modificarla
- [ ] Si intenta modificar cita de otro paciente, debe retornar error 403

#### CA2: Visualización de Citas Activas
- [ ] El paciente debe poder ver todas sus citas con estado:
  - `confirmed`: Cita confirmada
  - `pending`: Cita pendiente
  - `completed`: Cita completada (solo lectura)
  - `cancelled`: Cita cancelada (solo lectura)
- [ ] Solo citas con estado `confirmed` o `pending` pueden ser modificadas
- [ ] Cada cita debe mostrar: fecha/hora, médico, especialidad, estado

#### CA3: Cancelación de Cita
- [ ] El paciente puede cancelar una cita con estado `confirmed` o `pending`
- [ ] Al cancelar:
  - Se debe solicitar motivo de cancelación (opcional, máximo 500 caracteres)
  - Se actualiza `status='cancelled'` en tabla `APPOINTMENTS`
  - Se libera el slot asociado (`is_available=true`, se limpia `locked_by`)
  - Se registra `cancellation_reason` (si se proporcionó)
  - Se crea registro en `APPOINTMENT_HISTORY` con cambio de estado
- [ ] No hay límite de tiempo para cancelar (sin penalizaciones)
- [ ] No hay límite de citas canceladas

#### CA4: Reprogramación de Cita
- [ ] El paciente puede reprogramar una cita con estado `confirmed` o `pending`
- [ ] Para reprogramar:
  - Se debe seleccionar un nuevo slot disponible del mismo médico
  - Se valida que el nuevo slot esté disponible (mismo proceso que reserva)
  - Se libera el slot anterior (`is_available=true`)
  - Se actualiza `slot_id` y `appointment_date` en la cita
  - Se bloquea el nuevo slot (`is_available=false`)
  - Se crea registro en `APPOINTMENT_HISTORY` con cambio de fecha/hora
- [ ] No hay límite de tiempo para reprogramar (sin penalizaciones)
- [ ] No hay límite de reprogramaciones

#### CA5: Validación de Estados
- [ ] No se puede modificar citas con estado:
  - `completed`: Error 400 "No se puede modificar una cita completada"
  - `cancelled`: Error 400 "No se puede modificar una cita cancelada"
- [ ] Los mensajes de error deben ser claros y específicos

#### CA6: Validación de Nuevo Slot (Reprogramación)
- [ ] Al reprogramar, se deben validar las mismas condiciones que en reserva:
  - El nuevo slot debe existir
  - El nuevo slot debe estar disponible
  - El nuevo slot debe pertenecer al mismo médico
  - El paciente no debe tener otra cita activa (excepto la que está reprogramando)

#### CA7: Notificaciones de Cambio
- [ ] Al cancelar o reprogramar:
  - Se encola email de notificación (SendGrid) al paciente
  - Se encola email de notificación al médico
  - Se encola Web Push notification (si está habilitado)
- [ ] Los emails deben incluir:
  - Acción realizada (cancelación o reprogramación)
  - Fecha/hora anterior (si es reprogramación)
  - Fecha/hora nueva (si es reprogramación)
  - Motivo de cancelación (si aplica)

#### CA8: Respuesta Exitosa
- [ ] La respuesta debe incluir:
  - `id` de la cita actualizada
  - `status` actualizado
  - `appointmentDate` actualizado (si se reprogramó)
  - `slotId` actualizado (si se reprogramó)
  - `cancellationReason` (si se canceló)
  - `updatedAt` timestamp
- [ ] Se retorna código 200 OK

#### CA9: Manejo de Errores
- [ ] Si la cita no existe: error 404 "Cita no encontrada"
- [ ] Si no es el dueño de la cita: error 403 "No tienes permiso para modificar esta cita"
- [ ] Si el estado no permite modificación: error 400 con código "INVALID_STATUS_CHANGE"
- [ ] Si el nuevo slot no está disponible: error 400 "El nuevo slot seleccionado no está disponible"
- [ ] Todos los errores deben tener mensajes claros

#### CA10: Historial de Cambios
- [ ] Todos los cambios se registran en `APPOINTMENT_HISTORY`:
  - `old_status` y `new_status`
  - `change_reason` (motivo del cambio)
  - `changed_by` (ID del paciente)
  - `changed_at` (timestamp)
  - `metadata` (JSON con información adicional: fechas anteriores, notas)

#### CA11: Auditoría
- [ ] Se debe registrar en `audit_logs`:
  - Acción: "update_appointment" o "cancel_appointment"
  - Entity_type: "appointment"
  - Entity_id: ID de la cita
  - IP_address: IP del paciente
  - Timestamp: Fecha/hora del cambio

#### CA12: Internacionalización
- [ ] Todos los mensajes deben estar disponibles en español e inglés

---

## Historia de Usuario 6: Gestión de Perfil Médico

**Como** médico autenticado  
**Quiero** actualizar mi información de perfil  
**Para** mantener mi información profesional actualizada y visible para los pacientes

### Descripción
Un médico autenticado debe poder ver y actualizar su información de perfil, incluyendo datos personales, información profesional, dirección y especialidades.

### Criterios de Aceptación

#### CA1: Autenticación y Autorización
- [ ] El endpoint requiere autenticación JWT (Bearer token)
- [ ] Solo el médico dueño del perfil puede modificarlo
- [ ] Si el usuario no tiene role="doctor", debe retornar error 403

#### CA2: Visualización de Perfil
- [ ] El médico debe poder ver su perfil completo con:
  - Información personal: email, nombre, apellido, teléfono
  - Información profesional: bio, dirección, código postal
  - Especialidades asignadas (con indicador de especialidad principal)
  - Coordenadas geográficas (latitud, longitud)
  - Estado de verificación (`verification_status`)
  - Rating promedio y total de reseñas (si tiene)
  - Fecha de última actualización

#### CA3: Actualización de Información Personal
- [ ] El médico puede actualizar:
  - `firstName` (nombre)
  - `lastName` (apellido)
  - `phone` (teléfono, formato internacional)
- [ ] El email NO se puede modificar (es inmutable)
- [ ] Todos los campos deben tener validación en tiempo real

#### CA4: Actualización de Información Profesional
- [ ] El médico puede actualizar:
  - `bio` (descripción profesional, máximo 1000 caracteres)
  - `address` (dirección completa del consultorio)
  - `postalCode` (código postal, obligatorio)
- [ ] Al actualizar dirección o código postal:
  - Se debe llamar a Google Maps Geocoding API para actualizar coordenadas
  - Si la geocodificación falla, se debe mostrar advertencia pero permitir guardar
  - Las coordenadas se actualizan en la tabla `DOCTORS`

#### CA5: Gestión de Especialidades
- [ ] El médico puede ver sus especialidades actuales
- [ ] Las especialidades se gestionan desde otro endpoint (no en este)
- [ ] Solo se muestran especialidades activas (`is_active=true`)

#### CA6: Validaciones
- [ ] `firstName` y `lastName` son obligatorios (mínimo 1 carácter)
- [ ] `address` es obligatorio si se actualiza
- [ ] `postalCode` es obligatorio si se actualiza dirección
- [ ] `bio` tiene máximo 1000 caracteres
- [ ] `phone` debe tener formato internacional válido (si se proporciona)

#### CA7: Actualización en Base de Datos
- [ ] Al actualizar el perfil:
  - Se actualizan campos en tabla `USERS` (firstName, lastName, phone)
  - Se actualizan campos en tabla `DOCTORS` (bio, address, postalCode, latitude, longitude)
  - Se actualiza `updated_at` en ambas tablas
  - Se mantiene integridad referencial (1:1 entre USERS y DOCTORS)

#### CA8: Respuesta Exitosa
- [ ] La respuesta debe incluir el perfil completo actualizado:
  - Información personal actualizada
  - Información profesional actualizada
  - Especialidades
  - Estado de verificación
  - Rating y reseñas
- [ ] Se retorna código 200 OK

#### CA9: Manejo de Errores
- [ ] Si el usuario no es médico: error 403 "Este endpoint solo está disponible para médicos"
- [ ] Si hay error de validación: error 400 con detalles de campos inválidos
- [ ] Si falla la geocodificación: se muestra advertencia pero se permite guardar
- [ ] Todos los errores deben tener mensajes claros

#### CA10: Cache Invalidation
- [ ] Al actualizar perfil:
  - Se debe invalidar cache de búsqueda de médicos en Redis
  - Se debe invalidar cache del perfil del médico
  - Los cambios deben reflejarse inmediatamente en búsquedas

#### CA11: Auditoría
- [ ] Se debe registrar en `audit_logs`:
  - Acción: "update_doctor_profile"
  - Entity_type: "doctor"
  - Entity_id: ID del médico
  - `old_values` y `new_values` (JSON con campos modificados)
  - IP_address: IP del médico
  - Timestamp: Fecha/hora de actualización

#### CA12: Internacionalización
- [ ] Todos los mensajes deben estar disponibles en español e inglés

---

## Historia de Usuario 7: Carga de Documentos de Verificación

**Como** médico autenticado  
**Quiero** subir mi cédula profesional para verificación  
**Para** que un administrador valide mis credenciales y apruebe mi cuenta

### Descripción
Un médico autenticado debe poder subir documentos de verificación (cédula profesional) en formato PDF o imagen. El documento se almacena encriptado y queda pendiente de revisión por un administrador.

### Criterios de Aceptación

#### CA1: Autenticación y Autorización
- [ ] El endpoint requiere autenticación JWT (Bearer token)
- [ ] Solo médicos pueden subir documentos de verificación
- [ ] Si el usuario no tiene role="doctor", debe retornar error 403

#### CA2: Formulario de Carga
- [ ] El formulario debe permitir:
  - Selección de archivo (input type="file")
  - Selección de tipo de documento (dropdown):
    - "cedula" (cédula profesional) - por defecto
    - "diploma"
    - "other"
  - Botón "Subir" para enviar

#### CA3: Validación de Tipo de Archivo
- [ ] Formatos permitidos:
  - PDF (application/pdf)
  - JPG/JPEG (image/jpeg)
  - PNG (image/png)
- [ ] Validación en frontend (antes de enviar):
  - Verificar extensión del archivo (.pdf, .jpg, .jpeg, .png)
  - Mostrar mensaje de error si formato no permitido
- [ ] Validación en backend (obligatoria):
  - Verificar tipo MIME real del archivo (no solo extensión)
  - Verificar extensión del archivo
  - Si no cumple, retornar error 400: "Tipo de archivo no permitido. Solo se permiten PDF, JPG, PNG, JPEG"

#### CA4: Validación de Tamaño
- [ ] Tamaño máximo: 10MB
- [ ] Validación en frontend (antes de enviar):
  - Verificar tamaño del archivo
  - Mostrar mensaje de error si excede 10MB
- [ ] Validación en backend (obligatoria):
  - Verificar tamaño del archivo en bytes
  - Si excede 10MB, retornar error 400: "El archivo excede el tamaño máximo de 10MB"

#### CA5: Escaneo de Malware
- [ ] Antes de almacenar:
  - Se debe escanear el archivo en busca de malware (usando ClamAV o servicio externo)
  - Si se detecta malware, retornar error 400: "El archivo contiene malware y no puede ser procesado"
  - El escaneo no debe bloquear la respuesta del API (procesamiento asíncrono si es necesario)

#### CA6: Almacenamiento Encriptado
- [ ] El archivo se almacena en:
  - Directorio: `/var/www/citaya/storage/uploads/` (con LUKS encriptado)
  - Nombre único generado: `{doctorId}_{timestamp}_{random}.{extension}`
  - Permisos: 700 (solo propietario puede leer/escribir)
- [ ] Se encripta el contenido antes de almacenar en base de datos (AES-256-CBC):
  - Solo se encripta la ruta/metadatos si es necesario
  - El archivo físico está en directorio LUKS encriptado
- [ ] Se crea registro en tabla `VERIFICATION_DOCUMENTS`:
  - `doctor_id`: ID del médico
  - `file_path`: Ruta al archivo almacenado
  - `original_filename`: Nombre original del archivo
  - `mime_type`: Tipo MIME del archivo
  - `file_size_bytes`: Tamaño en bytes
  - `document_type`: Tipo de documento (cedula, diploma, other)
  - `status`: "pending" (por defecto)
  - `created_at`: Timestamp de creación

#### CA7: Actualización de Estado de Verificación
- [ ] Al subir el primer documento:
  - Si el médico tiene `verification_status='pending'`, se mantiene
  - Si el médico no tiene estado, se establece `verification_status='pending'`
- [ ] El médico puede subir múltiples documentos
- [ ] Cada documento tiene su propio estado de revisión (`pending`, `approved`, `rejected`)

#### CA8: Respuesta Exitosa
- [ ] La respuesta debe incluir:
  - `id`: ID del documento subido
  - `doctorId`: ID del médico
  - `documentType`: Tipo de documento
  - `status`: "pending"
  - `originalFilename`: Nombre original del archivo
  - `createdAt`: Timestamp de creación
- [ ] Se retorna código 201 Created
- [ ] Se muestra mensaje: "Documento subido exitosamente. Está pendiente de revisión por un administrador"

#### CA9: Manejo de Errores
- [ ] Si el usuario no es médico: error 403 "Este endpoint solo está disponible para médicos"
- [ ] Si tipo de archivo inválido: error 400 con código "INVALID_FILE_TYPE"
- [ ] Si tamaño excedido: error 400 con código "FILE_TOO_LARGE"
- [ ] Si hay malware: error 400 con código "MALWARE_DETECTED"
- [ ] Si falla el almacenamiento: error 500 con mensaje genérico
- [ ] Todos los errores deben tener mensajes claros

#### CA10: URLs Firmadas para Acceso
- [ ] Los administradores acceden a documentos mediante URLs firmadas temporales:
  - Token JWT con expiración corta (15 minutos)
  - Validación de permisos (solo admin)
  - El archivo se sirve desde directorio encriptado

#### CA11: Auditoría
- [ ] Se debe registrar en `audit_logs`:
  - Acción: "upload_verification_document"
  - Entity_type: "verification_document"
  - Entity_id: ID del documento subido
  - IP_address: IP del médico
  - Timestamp: Fecha/hora de carga

#### CA12: Internacionalización
- [ ] Todos los mensajes deben estar disponibles en español e inglés

---

## Historia de Usuario 8: Gestión de Horarios de Trabajo

**Como** médico autenticado  
**Quiero** configurar mis horarios de trabajo por día de la semana  
**Para** que el sistema genere automáticamente slots disponibles para que los pacientes reserven citas

### Descripción
Un médico autenticado debe poder crear, actualizar y eliminar horarios de trabajo que definen cuándo está disponible. Estos horarios se usan para generar slots automáticamente.

### Criterios de Aceptación

#### CA1: Autenticación y Autorización
- [ ] El endpoint requiere autenticación JWT (Bearer token)
- [ ] Solo el médico dueño puede gestionar sus horarios
- [ ] Si el usuario no tiene role="doctor", debe retornar error 403

#### CA2: Visualización de Horarios
- [ ] El médico debe poder ver todos sus horarios activos:
  - Lista de horarios por día de la semana
  - Para cada horario: día, hora de inicio, hora de fin, duración de slot, pausas
  - Indicador de estado activo/inactivo
  - Botones para editar o eliminar

#### CA3: Creación de Horario
- [ ] El formulario debe incluir:
  - `dayOfWeek`: Selector de día (0=domingo, 1=lunes, ..., 6=sábado)
  - `startTime`: Hora de inicio (formato HH:MM:SS, ejemplo "09:00:00")
  - `endTime`: Hora de fin (formato HH:MM:SS, ejemplo "17:00:00")
  - `slotDurationMinutes`: Duración de cada slot (por defecto 30 minutos)
  - `breakDurationMinutes`: Duración de pausas entre slots (por defecto 0 minutos)
- [ ] Validaciones:
  - `endTime` debe ser posterior a `startTime`
  - `slotDurationMinutes` debe ser mayor a 0
  - `breakDurationMinutes` debe ser mayor o igual a 0
  - No puede haber solapamiento de horarios en el mismo día

#### CA4: Generación Automática de Slots
- [ ] Al crear/actualizar un horario activo:
  - Se generan slots automáticamente según la configuración
  - Los slots se crean para fechas futuras (próximas 4 semanas)
  - Cada slot tiene duración `slotDurationMinutes`
  - Entre slots hay pausa de `breakDurationMinutes`
  - Ejemplo: 09:00-17:00, slots de 30 min, pausas de 15 min → slots: 09:00-09:30, 09:45-10:15, 10:30-11:00, etc.
- [ ] Los slots se crean en la tabla `SLOTS`:
  - `doctor_id`: ID del médico
  - `schedule_id`: ID del horario que los generó
  - `start_time` y `end_time`: Fechas/horas calculadas
  - `is_available=true` por defecto

#### CA5: Actualización de Horario
- [ ] El médico puede actualizar:
  - `startTime` y `endTime`
  - `slotDurationMinutes`
  - `breakDurationMinutes`
  - `isActive` (activar/desactivar horario)
- [ ] Al actualizar un horario activo:
  - Se eliminan slots futuros generados por ese horario (soft delete)
  - Se generan nuevos slots según la nueva configuración
  - Los slots ya reservados no se eliminan

#### CA6: Eliminación de Horario (Soft Delete)
- [ ] El médico puede eliminar un horario:
  - Se marca `deleted_at` en tabla `DOCTOR_SCHEDULES`
  - Se eliminan slots futuros no reservados generados por ese horario
  - Los slots ya reservados se mantienen (no se eliminan)
- [ ] No se puede eliminar un horario si tiene citas futuras confirmadas (mostrar advertencia)

#### CA7: Validación de Solapamiento
- [ ] No se pueden crear horarios que se solapen en el mismo día:
  - Ejemplo: Si hay horario 09:00-12:00, no se puede crear 11:00-14:00
  - Si hay solapamiento, retornar error 400: "El horario se solapa con otro horario existente en el mismo día"

#### CA8: Zona Horaria
- [ ] Todos los horarios se manejan en zona horaria de CDMX (America/Mexico_City)
- [ ] Los slots generados tienen fechas/horas en CDMX
- [ ] Se muestra claramente la zona horaria en la interfaz

#### CA9: Respuesta Exitosa
- [ ] Al crear horario: código 201 con objeto `DoctorSchedule` completo
- [ ] Al actualizar horario: código 200 con objeto `DoctorSchedule` actualizado
- [ ] Al eliminar horario: código 200 con mensaje "Horario eliminado exitosamente"

#### CA10: Manejo de Errores
- [ ] Si el usuario no es médico: error 403 "Este endpoint solo está disponible para médicos"
- [ ] Si hay solapamiento: error 400 "El horario se solapa con otro horario existente"
- [ ] Si `endTime` <= `startTime`: error 400 "La hora de fin debe ser posterior a la hora de inicio"
- [ ] Si el horario no existe: error 404 "Horario no encontrado"
- [ ] Todos los errores deben tener mensajes claros

#### CA11: Auditoría
- [ ] Se debe registrar en `audit_logs`:
  - Acción: "create_schedule", "update_schedule", o "delete_schedule"
  - Entity_type: "doctor_schedule"
  - Entity_id: ID del horario
  - IP_address: IP del médico
  - Timestamp: Fecha/hora de la acción

#### CA12: Internacionalización
- [ ] Todos los mensajes deben estar disponibles en español e inglés
- [ ] Los nombres de días de la semana deben mostrarse en el idioma seleccionado

---

## Historia de Usuario 9: Creación de Reseña Después de la Cita

**Como** paciente autenticado  
**Quiero** calificar y escribir una reseña sobre mi experiencia con el médico después de una cita completada  
**Para** ayudar a otros pacientes a tomar decisiones informadas y reconocer el buen servicio

### Descripción
Un paciente autenticado debe poder crear una reseña y calificación (1-5 estrellas) para una cita que haya sido completada. La reseña queda pendiente de moderación antes de ser publicada.

### Criterios de Aceptación

#### CA1: Autenticación y Autorización
- [ ] El endpoint requiere autenticación JWT (Bearer token)
- [ ] Solo el paciente que tuvo la cita puede crear la reseña
- [ ] Si intenta crear reseña de cita de otro paciente, debe retornar error 403

#### CA2: Elegibilidad para Reseña
- [ ] Solo se pueden crear reseñas para citas con estado `completed`
- [ ] Solo se puede crear una reseña por cita (relación 1:1)
- [ ] Si la cita no está completada:
  - Error 400: "Solo se pueden crear reseñas para citas completadas"
- [ ] Si ya existe una reseña para la cita:
  - Error 409: "Ya existe una reseña para esta cita"

#### CA3: Formulario de Reseña
- [ ] El formulario debe incluir:
  - Calificación: Selector de estrellas (1 a 5, obligatorio)
  - Comentario: Campo de texto (mínimo 10 caracteres, máximo 1000 caracteres, obligatorio)
  - Botón "Enviar Reseña"
- [ ] Validaciones en tiempo real:
  - Mostrar contador de caracteres (ej: "150/1000")
  - Validar mínimo de caracteres antes de permitir enviar
  - Mostrar mensaje si calificación no está seleccionada

#### CA4: Validación de Calificación
- [ ] La calificación debe ser un número entero entre 1 y 5
- [ ] Validación en frontend (antes de enviar)
- [ ] Validación en backend (obligatoria):
  - Si está fuera del rango, error 400: "La calificación debe estar entre 1 y 5"

#### CA5: Validación de Comentario
- [ ] El comentario es obligatorio
- [ ] Mínimo 10 caracteres (sin espacios al inicio/fin)
- [ ] Máximo 1000 caracteres
- [ ] Validación en frontend y backend
- [ ] Si no cumple, error 400 con detalles del campo inválido

#### CA6: Creación de Reseña
- [ ] Al crear la reseña:
  - Se crea registro en tabla `REVIEWS`:
    - `appointment_id`: ID de la cita (UNIQUE constraint)
    - `patient_id`: ID del paciente
    - `doctor_id`: ID del médico
    - `rating`: Calificación (1-5)
    - `comment`: Texto de la reseña
    - `moderation_status`: "pending" (por defecto)
    - `created_at`: Timestamp de creación
  - Se valida constraint UNIQUE en `appointment_id` para prevenir duplicados

#### CA7: Estado de Moderación
- [ ] La reseña se crea con `moderation_status='pending'`
- [ ] No se muestra públicamente hasta que un administrador la apruebe
- [ ] El paciente ve mensaje: "Tu reseña ha sido enviada y está pendiente de moderación"
- [ ] El médico puede ver la reseña en su panel pero marcada como "pendiente"

#### CA8: Actualización de Rating del Médico (Después de Aprobación)
- [ ] Cuando un administrador aprueba la reseña (`moderation_status='approved'`):
  - Se actualiza `rating_average` en tabla `DOCTORS`:
    - Promedio de todas las reseñas aprobadas
    - Cálculo: SUM(rating) / COUNT(*) de reseñas aprobadas
  - Se actualiza `total_reviews` en tabla `DOCTORS`:
    - Contador de reseñas aprobadas
  - Estos campos se actualizan en batch o en tiempo real según configuración

#### CA9: Respuesta Exitosa
- [ ] La respuesta debe incluir:
  - `id`: ID de la reseña creada
  - `appointmentId`: ID de la cita
  - `doctorId`: ID del médico
  - `rating`: Calificación (1-5)
  - `comment`: Texto de la reseña
  - `moderationStatus`: "pending"
  - `createdAt`: Timestamp de creación
- [ ] Se retorna código 201 Created

#### CA10: Manejo de Errores
- [ ] Si la cita no existe: error 404 "Cita no encontrada"
- [ ] Si no es el paciente de la cita: error 403 "No tienes permiso para crear una reseña de esta cita"
- [ ] Si la cita no está completada: error 400 con código "APPOINTMENT_NOT_COMPLETED"
- [ ] Si ya existe reseña: error 409 con código "REVIEW_ALREADY_EXISTS"
- [ ] Si calificación inválida: error 400 "La calificación debe estar entre 1 y 5"
- [ ] Si comentario inválido: error 400 con detalles de validación
- [ ] Todos los errores deben tener mensajes claros

#### CA11: Sanitización de Comentario
- [ ] El comentario debe sanitizarse para prevenir XSS:
  - Escapar caracteres HTML especiales
  - Remover scripts potenciales
  - Permitir solo texto plano (sin HTML)
- [ ] El texto sanitizado se almacena en la base de datos

#### CA12: Notificación al Médico
- [ ] Cuando se crea una reseña:
  - Se encola email de notificación al médico (SendGrid)
  - Se encola Web Push notification (si está habilitado)
  - El email indica que tiene una nueva reseña pendiente de moderación

#### CA13: Auditoría
- [ ] Se debe registrar en `audit_logs`:
  - Acción: "create_review"
  - Entity_type: "review"
  - Entity_id: ID de la reseña creada
  - IP_address: IP del paciente
  - Timestamp: Fecha/hora de creación

#### CA14: Internacionalización
- [ ] Todos los mensajes deben estar disponibles en español e inglés

---

## Historia de Usuario 10: Dashboard Administrativo para Gestión de Médicos

**Como** administrador del sistema  
**Quiero** acceder a un dashboard con métricas y herramientas para gestionar médicos y moderar contenido  
**Para** mantener la calidad y confiabilidad de la plataforma

### Descripción
Un administrador autenticado debe poder acceder a un dashboard que muestre métricas clave del sistema, gestionar la verificación de médicos, moderar reseñas y visualizar reportes procesados en batch diario.

### Criterios de Aceptación

#### CA1: Autenticación y Autorización
- [ ] El endpoint requiere autenticación JWT (Bearer token)
- [ ] Solo usuarios con role="admin" pueden acceder al dashboard
- [ ] Si el usuario no es admin, debe retornar error 403

#### CA2: Panel Principal de Métricas
- [ ] El dashboard debe mostrar métricas clave (procesadas en batch diario):
  - Total de reservas del día/semana
  - Tasa de cancelación (%)
  - Calificación promedio general
  - Total de médicos activos
  - Total de pacientes activos
  - Total de citas completadas
- [ ] Las métricas se actualizan una vez al día (procesamiento batch a las 2:00 AM)
- [ ] Los datos se cachean en Redis por 24 horas

#### CA3: Visualización de Reservas
- [ ] Gráfico de línea de tiempo:
  - Reservas por día/semana (últimas 4 semanas)
  - Eje X: Fechas
  - Eje Y: Número de reservas
  - Permite filtrar por rango de fechas
- [ ] Tabla de reservas recientes:
  - Columnas: Fecha, Paciente, Médico, Especialidad, Estado
  - Paginación (20 por página)
  - Filtros por estado, fecha, médico

#### CA4: Visualización de Cancelaciones
- [ ] Gráfico de barras:
  - Cancelaciones por día (últimas 4 semanas)
  - Eje X: Fechas
  - Eje Y: Número de cancelaciones
- [ ] Tabla de cancelaciones:
  - Columnas: Fecha, Paciente, Médico, Motivo de cancelación
  - Filtros por motivo, fecha
  - Permite ver detalles de cada cancelación

#### CA5: Visualización de Calificaciones
- [ ] Gráfico de torta:
  - Calificaciones promedio por especialidad
  - Muestra distribución de ratings (1-5 estrellas)
- [ ] Tabla de médicos por calificación:
  - Top 10 médicos por número de citas
  - Top 10 médicos por calificación promedio
  - Columnas: Médico, Especialidad, Rating Promedio, Total Reseñas, Total Citas

#### CA6: Gestión de Verificación de Médicos
- [ ] Lista de médicos pendientes de verificación:
  - Columnas: Nombre, Email, Especialidad, Fecha de Registro, Estado
  - Filtros por estado (pending, approved, rejected)
  - Botones: "Ver Documentos", "Aprobar", "Rechazar"
- [ ] Al hacer clic en "Ver Documentos":
  - Se muestra lista de documentos subidos por el médico
  - Se puede descargar cada documento mediante URL firmada temporal
  - Se muestra información: tipo, fecha de subida, estado
- [ ] Al aprobar médico:
  - Se actualiza `verification_status='approved'` en tabla `DOCTORS`
  - Se registra `verified_by` (ID del admin) y `verified_at`
  - Se envía email de notificación al médico
  - Se crea registro en `audit_logs`
- [ ] Al rechazar médico:
  - Se actualiza `verification_status='rejected'` en tabla `DOCTORS`
  - Se puede agregar nota de rechazo (`verification_notes`)
  - Se envía email de notificación al médico con motivo
  - Se crea registro en `audit_logs`

#### CA7: Moderación de Reseñas
- [ ] Lista de reseñas pendientes de moderación:
  - Columnas: Paciente, Médico, Calificación, Comentario (preview), Fecha
  - Botones: "Ver Completa", "Aprobar", "Rechazar"
- [ ] Al hacer clic en "Ver Completa":
  - Se muestra reseña completa con información de la cita asociada
  - Se puede ver historial de moderación
- [ ] Al aprobar reseña:
  - Se actualiza `moderation_status='approved'` en tabla `REVIEWS`
  - Se registra `moderated_by` (ID del admin) y `moderated_at`
  - Se actualiza `rating_average` y `total_reviews` del médico
  - Se crea registro en `audit_logs`
- [ ] Al rechazar reseña:
  - Se actualiza `moderation_status='rejected'` en tabla `REVIEWS`
  - Se puede agregar nota de moderación (`moderation_notes`)
  - Se crea registro en `audit_logs`
  - La reseña no se muestra públicamente

#### CA8: Procesamiento Batch Diario
- [ ] El procesamiento batch se ejecuta diariamente a las 2:00 AM (hora CDMX):
  - Consulta métricas de reservas, cancelaciones, calificaciones
  - Calcula promedios y totales
  - Genera datos para gráficos y tablas
  - Almacena resultados en Redis con TTL de 24 horas
- [ ] Los datos procesados incluyen:
  - Reservas por día/semana (últimas 4 semanas)
  - Cancelaciones por día con motivos
  - Calificaciones promedio por especialidad
  - Top médicos por citas y rating
  - Especialidades más demandadas

#### CA9: Visualización de Datos
- [ ] Los gráficos se renderizan usando librería de visualización (Chart.js, D3.js, etc.)
- [ ] Los gráficos son interactivos (hover, zoom, filtros)
- [ ] Las tablas tienen paginación, ordenamiento y filtros
- [ ] Los datos se cargan desde cache (Redis) para mejor performance

#### CA10: Respuesta del API
- [ ] Endpoints del dashboard retornan:
  - Métricas agregadas (JSON)
  - Datos para gráficos (arrays de datos)
  - Listas paginadas para tablas
- [ ] Todos los endpoints requieren autenticación admin

#### CA11: Manejo de Errores
- [ ] Si el usuario no es admin: error 403 "Este endpoint solo está disponible para administradores"
- [ ] Si no hay datos disponibles: se muestra mensaje "No hay datos disponibles para el período seleccionado"
- [ ] Si falla el procesamiento batch: se muestra último conjunto de datos disponible (cache)

#### CA12: Auditoría Completa
- [ ] Todas las acciones administrativas se registran en `audit_logs`:
  - Aprobar/rechazar médico
  - Aprobar/rechazar reseña
  - Acceso a datos sensibles
  - Cambios en configuración del sistema
- [ ] Cada registro incluye: quién (admin), qué (acción), cuándo (timestamp), IP

#### CA13: Internacionalización
- [ ] Todos los textos del dashboard deben estar disponibles en español e inglés
- [ ] Los gráficos y tablas deben mostrar fechas y números formateados según idioma

#### CA14: Performance
- [ ] El dashboard debe cargar en menos de 2 segundos
- [ ] Los datos se sirven desde cache (Redis) para evitar consultas costosas
- [ ] Si el cache expira, se muestran datos del último procesamiento batch

---

## Historia de Usuario 11: Confirmación de Cita Pendiente por Médico

**Como** médico autenticado  
**Quiero** confirmar citas pendientes asignadas a mi perfil  
**Para** validar mi disponibilidad final y asegurar la atención al paciente

### Descripción
Un médico autenticado debe poder revisar sus citas con estado `pending` y confirmar cada una. La confirmación cambia el estado a `confirmed`, registra historial/auditoría y refleja el cambio inmediatamente en el panel del médico.

### Criterios de Aceptación

#### CA1: Autenticación y Autorización
- [ ] El endpoint requiere autenticación JWT (Bearer token)
- [ ] Solo usuarios con role="doctor" pueden confirmar citas pendientes
- [ ] Si el usuario no es doctor, debe retornar error 403

#### CA2: Ownership de la Cita
- [ ] El médico solo puede confirmar citas de su propio perfil (`appointment.doctor_id`)
- [ ] Si intenta confirmar una cita de otro médico, retorna 403 con mensaje claro

#### CA3: Estado Permitido
- [ ] Solo se permiten confirmaciones para citas con estado `pending`
- [ ] Si la cita está en estado `confirmed`, `completed`, `cancelled` o `no_show`, retorna 400

#### CA4: Actualización de Estado
- [ ] Al confirmar una cita pendiente:
  - Se actualiza `status='confirmed'` en `APPOINTMENTS`
  - Se limpia `cancellation_reason` en caso de estar presente
  - Se actualiza `updated_at`

#### CA5: Historial de Cambios
- [ ] Se crea registro en `APPOINTMENT_HISTORY` con:
  - `old_status='pending'`
  - `new_status='confirmed'`
  - `change_reason='Cita confirmada por médico'`
  - `changed_by` con el ID del usuario médico autenticado

#### CA6: Auditoría
- [ ] Se registra en `audit_logs`:
  - Acción: `confirm_appointment_by_doctor`
  - Entity_type: `appointment`
  - Entity_id: ID de la cita confirmada
  - User_id: ID del médico autenticado
  - IP de la solicitud

#### CA7: Respuesta Exitosa
- [ ] La respuesta debe incluir:
  - `id` de la cita
  - `status: "confirmed"`
  - `updatedAt`
  - Mensaje de éxito
- [ ] Se retorna código 200 OK

#### CA8: Manejo de Errores
- [ ] Si la cita no existe: 404 "Cita no encontrada"
- [ ] Si no pertenece al médico: 403 "No puedes confirmar una cita que no está asignada a tu perfil"
- [ ] Si el estado no es pending: 400 con código `INVALID_APPOINTMENT_STATUS`

#### CA9: UI en Perfil del Médico
- [ ] En el perfil del médico se muestran citas pendientes y confirmadas
- [ ] Cada cita pendiente muestra botón "Confirmar cita"
- [ ] Al confirmar:
  - Se muestra estado de carga
  - Se actualiza la lista de citas sin recargar manualmente
  - Se muestra mensaje de éxito/error

#### CA10: Internacionalización
- [ ] Los textos de la acción (botón, loading, éxito y error) deben estar en ES/EN

---

## Historia de Usuario 12: Cancelación de Cita por Médico

**Como** médico autenticado  
**Quiero** cancelar citas asignadas a mi perfil cuando no podré atenderlas  
**Para** liberar el horario y notificar correctamente el cambio al paciente

### Descripción
Un médico autenticado debe poder cancelar citas activas (`pending` o `confirmed`) de su agenda. La cancelación actualiza el estado, libera el slot, deja trazabilidad en historial y auditoría, y se refleja inmediatamente en el perfil del médico.

### Criterios de Aceptación

#### CA1: Autenticación y Autorización
- [ ] El endpoint requiere autenticación JWT (Bearer token)
- [ ] Solo usuarios con role="doctor" pueden cancelar citas de su agenda
- [ ] Si el usuario no es doctor y pretende cancelar como médico, retorna 403

#### CA2: Ownership de la Cita
- [ ] El médico solo puede cancelar citas de su perfil (`appointment.doctor_id`)
- [ ] Si intenta cancelar cita de otro médico, retorna 403 con mensaje claro

#### CA3: Estados Permitidos
- [ ] Solo se pueden cancelar citas en estado `pending` o `confirmed`
- [ ] Si está `completed`, `cancelled` o `no_show`, retorna 400 con código `INVALID_APPOINTMENT_STATUS`

#### CA4: Cancelación y Liberación de Slot
- [ ] Al cancelar:
  - Se actualiza `status='cancelled'` en `APPOINTMENTS`
  - Se guarda `cancellation_reason` (motivo opcional)
  - Se libera el slot asociado (`is_available=true`, sin locks)

#### CA5: Historial de Cambios
- [ ] Se crea registro en `APPOINTMENT_HISTORY` con:
  - `old_status` previo
  - `new_status='cancelled'`
  - `change_reason` con motivo o default "Cita cancelada por médico"
  - `changed_by` con ID del usuario médico autenticado

#### CA6: Auditoría
- [ ] Se registra en `audit_logs`:
  - Acción: `cancel_appointment_by_doctor`
  - Entity_type: `appointment`
  - Entity_id: ID de la cita cancelada
  - User_id: ID del médico autenticado
  - IP de la solicitud

#### CA7: Respuesta Exitosa
- [ ] La respuesta debe incluir:
  - `id`
  - `status: "cancelled"`
  - `cancellationReason`
  - `updatedAt`
  - Mensaje de éxito
- [ ] Se retorna código 200 OK

#### CA8: UI en Perfil del Médico
- [ ] En cada cita `pending` o `confirmed` del perfil del médico se muestra botón "Cancelar cita"
- [ ] Al cancelar:
  - Se solicita confirmación de la acción
  - Se muestra loading durante la petición
  - Se refresca la lista al éxito
  - Se muestra mensaje de éxito/error

#### CA9: Internacionalización
- [ ] Los textos de cancelación (confirmación, loading, éxito y error) están disponibles en ES/EN

## Resumen de Historias Propuestas

| # | Historia | Rol | Funcionalidad Crítica |
|---|----------|-----|----------------------|
| 1 | Registro de Paciente | Paciente | Autenticación/Registro |
| 2 | Registro de Médico | Médico | Autenticación/Registro |
| 3 | Búsqueda de Médicos | Paciente | Búsqueda de Doctor |
| 4 | Reserva de Cita | Paciente | Generación de Cita |
| 5 | Reprogramación/Cancelación | Paciente | Generación de Cita |
| 6 | Gestión de Perfil Médico | Médico | - |
| 7 | Carga de Documentos | Médico | Validación de Doctor |
| 8 | Gestión de Horarios | Médico | - |
| 9 | Creación de Reseña | Paciente | Review después de la cita |
| 10 | Dashboard Administrativo | Admin | Dashboards |
| 11 | Confirmación de Cita Pendiente | Médico | Confirmación operativa |
| 12 | Cancelación de Cita por Médico | Médico | Gestión operativa |

