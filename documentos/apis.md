# Especificación OpenAPI — Frapen Angels

Este documento describe una propuesta de API REST orientada al dominio establecido en [documentos/arquitectura.md](arquitectura.md) y a las funcionalidades del sistema definidas en [readme.md](../readme.md).

La API sigue un estilo REST y está agrupada por módulos funcionales: autenticación, socios, rutas, calendario, pagos y administración/avisos. Además incorpora el flujo de propuesta de rutas por parte de los socios y la revisión administrativa antes de la publicación.

---

```yaml
openapi: 3.0.3
info:
  title: Frapen Angels API
  version: 1.0.0
  description: |
    API para la gestión del club Frapen Angels.
    Permite llevar a cabo operaciones de autenticación, perfil de socios,
    consulta y administración de rutas, calendario, pagos y avisos.
servers:
  - url: https://api.frapen-angels.local/v1
    description: Entorno local o de desarrollo
  - url: https://api.frapen-angels.com/v1
    description: Entorno de producción
security:
  - bearerAuth: []
paths:
  /auth/login:
    post:
      tags: [Auth]
      summary: Iniciar sesión en la plataforma
      operationId: loginMember
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/LoginRequest'
            examples:
              loginSocio:
                summary: Inicio de sesión de socio
                value:
                  email: socio@frapenangels.com
                  password: P@ssw0rd123
      responses:
        '200':
          description: Login correcto
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthToken'
              examples:
                loginOk:
                  summary: Respuesta de login correcta
                  value:
                    token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzb2NpbyIsImV4cCI6MTcyNTk0OTQwMH0.abc123def456
                    expiresAt: 2026-08-11T12:30:00Z
                    member:
                      memberId: 11111111-1111-1111-1111-111111111111
                      roleId: 22222222-2222-2222-2222-222222222222
                      email: socio@frapenangels.com
                      firstName: Ana
                      lastName: García
                      membershipNumber: FRP-1001
                      status: ACTIVE
        '401':
          $ref: '#/components/responses/Unauthorized'

  /auth/register:
    post:
      tags: [Auth]
      summary: Registro inicial de un socio
      operationId: registerMember
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateMemberRequest'
            examples:
              registroSocio:
                summary: Registro de un nuevo socio
                value:
                  email: nueva.socia@frapenangels.com
                  password: P@ssw0rd123
                  firstName: Marta
                  lastName: Ruiz
                  dni: 12345678Z
                  phone: 600123456
                  address: Calle Mayor 10
                  city: Valencia
                  postalCode: 46001
      responses:
        '201':
          description: Socio creado correctamente
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Member'
              examples:
                memberCreated:
                  summary: Socio creado correctamente
                  value:
                    memberId: 33333333-3333-3333-3333-333333333333
                    roleId: 22222222-2222-2222-2222-222222222222
                    email: nueva.socia@frapenangels.com
                    firstName: Marta
                    lastName: Ruiz
                    dni: 12345678Z
                    membershipNumber: FRP-1002
                    status: ACTIVE
        '409':
          $ref: '#/components/responses/Conflict'

  /auth/logout:
    post:
      tags: [Auth]
      summary: Cerrar sesión
      operationId: logoutMember
      security:
        - bearerAuth: []
      responses:
        '204':
          description: Sesión cerrada correctamente
        '401':
          $ref: '#/components/responses/Unauthorized'

  /members/{memberId}:
    get:
      tags: [Members]
      summary: Obtener perfil del socio
      operationId: getMemberById
      security:
        - bearerAuth: []
      parameters:
        - $ref: '#/components/parameters/MemberId'
      responses:
        '200':
          description: Perfil del socio recuperado
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Member'
        '404':
          $ref: '#/components/responses/NotFound'
    put:
      tags: [Members]
      summary: Actualizar perfil del socio
      operationId: updateMember
      security:
        - bearerAuth: []
      parameters:
        - $ref: '#/components/parameters/MemberId'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UpdateMemberRequest'
      responses:
        '200':
          description: Perfil actualizado
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Member'

  /members/{memberId}/password:
    put:
      tags: [Members]
      summary: Cambiar contraseña del socio
      operationId: changePassword
      security:
        - bearerAuth: []
      parameters:
        - $ref: '#/components/parameters/MemberId'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ChangePasswordRequest'
      responses:
        '200':
          description: Contraseña cambiada correctamente
        '401':
          $ref: '#/components/responses/Unauthorized'
        '403':
          $ref: '#/components/responses/Forbidden'

  /routes:
    get:
      tags: [Routes]
      summary: Listar rutas públicas o de lectura
      operationId: listRoutes
      parameters:
        - name: status
          in: query
          description: Estado de las rutas
          required: false
          schema:
            type: string
            enum: [PROPOSAL, PENDING_REVIEW, PUBLISHED, REJECTED, COMPLETED, CANCELLED]
        - name: difficulty
          in: query
          description: Nivel de dificultad
          required: false
          schema:
            type: string
        - name: page
          in: query
          required: false
          schema:
            type: integer
            default: 1
      responses:
        '200':
          description: Listado de rutas
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/Route'
                  pagination:
                    $ref: '#/components/schemas/Pagination'
    post:
      tags: [Routes]
      summary: Crear una nueva ruta (administración)
      operationId: createRoute
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateRouteRequest'
            examples:
              crearRuta:
                summary: Creación de una ruta de fin de semana por administración
                value:
                  title: Ruta de la Sierra de Javalambre
                  description: Fin de semana con parada en restaurante y alojamiento.
                  difficulty: MEDIUM
                  distanceKm: 78.5
                  meetingPoint: Plaza del Ayuntamiento
                  status: PUBLISHED
                  departureDate: 2026-09-12
                  departureTime: 08:00:00
                  returnDate: 2026-09-14
                  hasLodging: true
                  hasRestaurant: true
                  basePrice: 120
                  lodgingPrice: 60
                  restaurantPrice: 35
      responses:
        '201':
          description: Ruta creada
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Route'
              examples:
                rutaCreada:
                  summary: Ruta creada correctamente
                  value:
                    routeId: 44444444-4444-4444-4444-444444444444
                    title: Ruta de la Sierra de Javalambre
                    description: Fin de semana con parada en restaurante y alojamiento.
                    difficulty: MEDIUM
                    distanceKm: 78.5
                    status: PUBLISHED
                    departureDate: 2026-09-12
                    departureTime: 08:00:00
                    totalPrice: 215
        '403':
          $ref: '#/components/responses/Forbidden'

  /members/{memberId}/route-proposals:
    post:
      tags: [Routes]
      summary: Proponer una ruta desde el perfil del socio
      operationId: createRouteProposal
      security:
        - bearerAuth: []
      parameters:
        - $ref: '#/components/parameters/MemberId'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/RouteProposalRequest'
            examples:
              propuestaRuta:
                summary: Propuesta de ruta enviada por un socio
                value:
                  title: Vuelta al Castillo de Cullera
                  description: Ruta de senderismo con parada para almuerzo en el pueblo.
                  difficulty: EASY
                  distanceKm: 32
                  meetingPoint: Aparcamiento del Mirador
                  departureDate: 2026-10-05
                  departureTime: 09:30:00
                  returnDate: 2026-10-05
                  hasLodging: false
                  hasRestaurant: true
                  basePrice: 25
                  lodgingPrice: 0
                  restaurantPrice: 18
      responses:
        '201':
          description: Ruta propuesta correctamente
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Route'
        '403':
          $ref: '#/components/responses/Forbidden'

  /routes/proposals:
    get:
      tags: [Routes]
      summary: Listar rutas pendientes de revisión administrativa
      operationId: listRouteProposals
      security:
        - bearerAuth: []
      parameters:
        - name: status
          in: query
          required: false
          schema:
            type: string
            enum: [PROPOSAL, PENDING_REVIEW, REJECTED]
      responses:
        '200':
          description: Propuestas de rutas pendientes de aprobación
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/Route'

  /routes/{routeId}/review:
    post:
      tags: [Routes]
      summary: Revisar y aprobar o rechazar una propuesta de ruta
      operationId: reviewRouteProposal
      security:
        - bearerAuth: []
      parameters:
        - $ref: '#/components/parameters/RouteId'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/RouteReviewRequest'
      responses:
        '200':
          description: Revisión aplicada
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Route'
        '403':
          $ref: '#/components/responses/Forbidden'

  /routes/{routeId}:
    get:
      tags: [Routes]
      summary: Obtener detalle de una ruta
      operationId: getRouteById
      parameters:
        - $ref: '#/components/parameters/RouteId'
      responses:
        '200':
          description: Ruta recuperada
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RouteDetail'
        '404':
          $ref: '#/components/responses/NotFound'
    put:
      tags: [Routes]
      summary: Actualizar ruta
      operationId: updateRoute
      security:
        - bearerAuth: []
      parameters:
        - $ref: '#/components/parameters/RouteId'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UpdateRouteRequest'
      responses:
        '200':
          description: Ruta actualizada
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Route'

  /routes/{routeId}/media:
    get:
      tags: [Routes]
      summary: Obtener galería multimedia de una ruta
      operationId: listRouteMedia
      parameters:
        - $ref: '#/components/parameters/RouteId'
      responses:
        '200':
          description: Galería de la ruta
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/RouteMedia'
    post:
      tags: [Routes]
      summary: Subir media de una ruta
      operationId: createRouteMedia
      security:
        - bearerAuth: []
      parameters:
        - $ref: '#/components/parameters/RouteId'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateRouteMediaRequest'
      responses:
        '201':
          description: Media creada
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RouteMedia'

  /calendar:
    get:
      tags: [Calendar]
      summary: Consultar calendario de actividades
      operationId: listCalendarEvents
      parameters:
        - name: start
          in: query
          required: false
          schema:
            type: string
            format: date-time
        - name: end
          in: query
          required: false
          schema:
            type: string
            format: date-time
      responses:
        '200':
          description: Eventos del calendario
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/CalendarEvent'

  /calendar/events:
    post:
      tags: [Calendar]
      summary: Crear evento del calendario
      operationId: createCalendarEvent
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateCalendarEventRequest'
      responses:
        '201':
          description: Evento creado
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CalendarEvent'

  /routes/{routeId}/registrations:
    post:
      tags: [Registrations]
      summary: Inscribirse a una ruta
      operationId: registerRoute
      security:
        - bearerAuth: []
      parameters:
        - $ref: '#/components/parameters/RouteId'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateRegistrationRequest'
      responses:
        '201':
          description: Inscripción creada
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RouteRegistration'
        '409':
          $ref: '#/components/responses/Conflict'

  /members/{memberId}/registrations:
    get:
      tags: [Registrations]
      summary: Listar rutas del socio
      operationId: listMemberRegistrations
      security:
        - bearerAuth: []
      parameters:
        - $ref: '#/components/parameters/MemberId'
      responses:
        '200':
          description: Inscripciones del socio
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/RouteRegistration'

  /registrations/{registrationId}:
    put:
      tags: [Registrations]
      summary: Cancelar inscripción a una ruta
      operationId: cancelRegistration
      security:
        - bearerAuth: []
      parameters:
        - $ref: '#/components/parameters/RegistrationId'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CancelRegistrationRequest'
      responses:
        '200':
          description: Inscripción cancelada
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RouteRegistration'
        '403':
          $ref: '#/components/responses/Forbidden'
        '404':
          $ref: '#/components/responses/NotFound'

  /payments:
    post:
      tags: [Payments]
      summary: Iniciar o confirmar un cobro asociado a una ruta
      operationId: createPayment
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreatePaymentRequest'
            examples:
              pagoRuta:
                summary: Pago para una ruta con alojamiento
                value:
                  memberId: 11111111-1111-1111-1111-111111111111
                  routeId: 44444444-4444-4444-4444-444444444444
                  registrationId: 55555555-5555-5555-5555-555555555555
                  provider: STRIPE
                  amount: 215
                  currency: EUR
      responses:
        '201':
          description: Pago registrado
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Payment'
              examples:
                pagoCreado:
                  summary: Pago aceptado correctamente
                  value:
                    paymentId: 66666666-6666-6666-6666-666666666666
                    memberId: 11111111-1111-1111-1111-111111111111
                    routeId: 44444444-4444-4444-4444-444444444444
                    registrationId: 55555555-5555-5555-5555-555555555555
                    provider: STRIPE
                    providerPaymentId: pi_1234567890
                    status: PAID
                    amount: 215
                    currency: EUR
        '402':
          $ref: '#/components/responses/PaymentRequired'

  /payments/{paymentId}:
    get:
      tags: [Payments]
      summary: Consultar estado de pago
      operationId: getPayment
      security:
        - bearerAuth: []
      parameters:
        - $ref: '#/components/parameters/PaymentId'
      responses:
        '200':
          description: Pago consultado
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Payment'

  /payments/{paymentId}/refund:
    post:
      tags: [Payments]
      summary: Procesar reembolso de un pago (solo admin)
      operationId: refundPayment
      security:
        - bearerAuth: []
      parameters:
        - $ref: '#/components/parameters/PaymentId'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/RefundPaymentRequest'
      responses:
        '200':
          description: Reembolso procesado correctamente
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Payment'
        '403':
          $ref: '#/components/responses/Forbidden'
        '404':
          $ref: '#/components/responses/NotFound'

  /notifications:
    get:
      tags: [Notifications]
      summary: Listar avisos del sistema
      operationId: listNotifications
      security:
        - bearerAuth: []
      responses:
        '200':
          description: Avisos
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/Notification'
    post:
      tags: [Notifications]
      summary: Crear aviso administrativo
      operationId: createNotification
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateNotificationRequest'
      responses:
        '201':
          description: Aviso creado
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Notification'

  /notifications/{notificationId}/send:
    post:
      tags: [Notifications]
      summary: Enviar aviso a destinatarios
      operationId: sendNotification
      security:
        - bearerAuth: []
      parameters:
        - $ref: '#/components/parameters/NotificationId'
      responses:
        '202':
          description: Envío encolado o aceptado
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Notification'

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  parameters:
    MemberId:
      name: memberId
      in: path
      required: true
      schema:
        type: string
        format: uuid
    RouteId:
      name: routeId
      in: path
      required: true
      schema:
        type: string
        format: uuid
    RegistrationId:
      name: registrationId
      in: path
      required: true
      schema:
        type: string
        format: uuid
    PaymentId:
      name: paymentId
      in: path
      required: true
      schema:
        type: string
        format: uuid
    NotificationId:
      name: notificationId
      in: path
      required: true
      schema:
        type: string
        format: uuid

  responses:
    Unauthorized:
      description: Credenciales inválidas o sesión no autorizada
    Forbidden:
      description: El usuario no tiene permisos para ejecutar la operación
    Conflict:
      description: El recurso ya existe o el estado no es válido
    NotFound:
      description: Recurso no encontrado
    PaymentRequired:
      description: El pago no se pudo aceptar o fue rechazado

  schemas:
    LoginRequest:
      type: object
      required: [email, password]
      properties:
        email:
          type: string
          format: email
        password:
          type: string
          format: password

    AuthToken:
      type: object
      properties:
        token:
          type: string
        expiresAt:
          type: string
          format: date-time
        member:
          $ref: '#/components/schemas/Member'

    CreateMemberRequest:
      type: object
      required: [email, password, firstName, lastName]
      properties:
        email:
          type: string
          format: email
        password:
          type: string
          format: password
        firstName:
          type: string
        lastName:
          type: string
        dni:
          type: string
        phone:
          type: string
        address:
          type: string
        city:
          type: string
        postalCode:
          type: string

    Member:
      type: object
      properties:
        memberId:
          type: string
          format: uuid
        roleId:
          type: string
          format: uuid
        email:
          type: string
          format: email
        firstName:
          type: string
        lastName:
          type: string
        dni:
          type: string
        membershipNumber:
          type: string
        status:
          type: string
          enum: [ACTIVE, INACTIVE, BLOCKED]
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time

    UpdateMemberRequest:
      type: object
      properties:
        firstName:
          type: string
        lastName:
          type: string
        phone:
          type: string
        address:
          type: string
        city:
          type: string
        postalCode:
          type: string
        status:
          type: string
          enum: [ACTIVE, INACTIVE, BLOCKED]
          description: Solo administradores pueden cambiar status

    ChangePasswordRequest:
      type: object
      required: [currentPassword, newPassword]
      properties:
        currentPassword:
          type: string
          format: password
          description: Contraseña actual para validación
        newPassword:
          type: string
          format: password
          description: Nueva contraseña (debe cumplir requisitos de seguridad)

    CreateRouteRequest:
      type: object
      required: [title, description, difficulty, departureDate]
      description: Crear una nueva ruta desde administración. Las rutas creadas por admin se publican inmediatamente (PUBLISHED). Solo socios pueden crear propuestas (PROPOSAL).
      properties:
        title:
          type: string
        description:
          type: string
        difficulty:
          type: string
          enum: [EASY, MEDIUM, HARD]
        distanceKm:
          type: number
          format: float
        meetingPoint:
          type: string
        departureDate:
          type: string
          format: date
        departureTime:
          type: string
          format: time
        returnDate:
          type: string
          format: date
        hasLodging:
          type: boolean
        hasRestaurant:
          type: boolean
        basePrice:
          type: number
          format: double
          description: Precio base (puede ser 0 para rutas gratuitas)
        lodgingPrice:
          type: number
          format: double
          description: Coste de alojamiento (puede ser 0 o omitirse)
        restaurantPrice:
          type: number
          format: double
          description: Coste del restaurante (puede ser 0 o omitirse)

    RouteProposalRequest:
      type: object
      required: [title, description, difficulty, departureDate]
      description: Proponer una nueva ruta desde un socio. La propuesta se guarda en estado PROPOSAL y requiere revisión administrativa antes de publicarse.
      properties:
        title:
          type: string
        description:
          type: string
        difficulty:
          type: string
          enum: [EASY, MEDIUM, HARD]
        distanceKm:
          type: number
          format: float
        meetingPoint:
          type: string
        departureDate:
          type: string
          format: date
        departureTime:
          type: string
          format: time
        returnDate:
          type: string
          format: date
        hasLodging:
          type: boolean
        hasRestaurant:
          type: boolean
        basePrice:
          type: number
          format: double
          description: Precio base (puede ser 0 para rutas gratuitas)
        lodgingPrice:
          type: number
          format: double
          description: Coste de alojamiento (puede ser 0 o omitirse)
        restaurantPrice:
          type: number
          format: double
          description: Coste del restaurante (puede ser 0 o omitirse)

    RouteReviewRequest:
      type: object
      required: [decision]
      properties:
        decision:
          type: string
          enum: [APPROVED, REJECTED]
        reviewNotes:
          type: string
        rejectionReason:
          type: string

    Route:
      type: object
      properties:
        routeId:
          type: string
          format: uuid
        createdByMember:
          type: string
          format: uuid
        createdByAdmin:
          type: string
          format: uuid
        createdByType:
          type: string
          enum: [MEMBER, ADMIN]
        reviewedBy:
          type: string
          format: uuid
        title:
          type: string
        description:
          type: string
        difficulty:
          type: string
        distanceKm:
          type: number
        status:
          type: string
          enum: [PROPOSAL, PENDING_REVIEW, PUBLISHED, REJECTED, COMPLETED, CANCELLED]
        departureDate:
          type: string
          format: date
        departureTime:
          type: string
          format: time
        totalPrice:
          type: number
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time

    UpdateRouteRequest:
      type: object
      properties:
        title:
          type: string
        description:
          type: string
        difficulty:
          type: string
        status:
          type: string
          enum: [PROPOSAL, PENDING_REVIEW, PUBLISHED, REJECTED, COMPLETED, CANCELLED]
        totalPrice:
          type: number

    RouteDetail:
      allOf:
        - $ref: '#/components/schemas/Route'
        - type: object
          properties:
            media:
              type: array
              items:
                $ref: '#/components/schemas/RouteMedia'

    RouteMedia:
      type: object
      properties:
        mediaId:
          type: string
          format: uuid
        routeId:
          type: string
          format: uuid
        mediaType:
          type: string
          enum: [IMAGE, VIDEO]
        fileUrl:
          type: string
          format: uri
        caption:
          type: string
        isCover:
          type: boolean
        createdAt:
          type: string
          format: date-time

    CreateRouteMediaRequest:
      type: object
      required: [mediaType, fileUrl]
      description: Subir un archivo multimedia para una ruta. El cloudKey se genera automáticamente en backend.
      properties:
        mediaType:
          type: string
          enum: [IMAGE, VIDEO]
        fileUrl:
          type: string
          format: uri
          description: URL del archivo (puede ser URL pública o privada)
        caption:
          type: string
          description: Leyenda o descripción de la imagen/video
        isCover:
          type: boolean
          description: Si es true, esta será la imagen de portada de la ruta

    CalendarEvent:
      type: object
      properties:
        eventId:
          type: string
          format: uuid
        routeId:
          type: string
          format: uuid
        title:
          type: string
        description:
          type: string
        startAt:
          type: string
          format: date-time
        endAt:
          type: string
          format: date-time
        location:
          type: string
        status:
          type: string
          enum: [SCHEDULED, DONE, CANCELLED]
        capacity:
          type: integer

    CreateCalendarEventRequest:
      type: object
      required: [title, startAt]
      properties:
        title:
          type: string
        description:
          type: string
        routeId:
          type: string
          format: uuid
        startAt:
          type: string
          format: date-time
        endAt:
          type: string
          format: date-time
        location:
          type: string
        status:
          type: string
          enum: [SCHEDULED, DONE, CANCELLED]
        capacity:
          type: integer

    CreateRegistrationRequest:
      type: object
      required: [routeId]
      properties:
        routeId:
          type: string
          format: uuid
        companions:
          type: integer
          minimum: 0

    RouteRegistration:
      type: object
      properties:
        registrationId:
          type: string
          format: uuid
        routeId:
          type: string
          format: uuid
        memberId:
          type: string
          format: uuid
        registrationStatus:
          type: string
          enum: [PENDING, CONFIRMED, CANCELLED, COMPLETED]
        companions:
          type: integer
        amountDue:
          type: number
        amountPaid:
          type: number
        createdAt:
          type: string
          format: date-time

    CreatePaymentRequest:
      type: object
      required: [memberId, routeId, amount]
      properties:
        memberId:
          type: string
          format: uuid
        routeId:
          type: string
          format: uuid
        registrationId:
          type: string
          format: uuid
        provider:
          type: string
          enum: [STRIPE, PAYPAL, MANUAL]
        amount:
          type: number
          format: double
        currency:
          type: string
          example: EUR

    Payment:
      type: object
      properties:
        paymentId:
          type: string
          format: uuid
        memberId:
          type: string
          format: uuid
        routeId:
          type: string
          format: uuid
        registrationId:
          type: string
          format: uuid
        provider:
          type: string
        providerPaymentId:
          type: string
        status:
          type: string
          enum: [PENDING, PAID, FAILED, REFUNDED]
        amount:
          type: number
        currency:
          type: string
        createdAt:
          type: string
          format: date-time
        paidAt:
          type: string
          format: date-time

    Notification:
      type: object
      properties:
        notificationId:
          type: string
          format: uuid
        routeId:
          type: string
          format: uuid
        title:
          type: string
        body:
          type: string
        type:
          type: string
          enum: [ROUTE, GENERAL, REMINDER]
        status:
          type: string
          enum: [DRAFT, SENT, FAILED]
        scheduledAt:
          type: string
          format: date-time
        sentAt:
          type: string
          format: date-time
        createdAt:
          type: string
          format: date-time

    CreateNotificationRequest:
      type: object
      required: [title, body, type]
      properties:
        routeId:
          type: string
          format: uuid
        title:
          type: string
        body:
          type: string
        type:
          type: string
          enum: [ROUTE, GENERAL, REMINDER]
        scheduledAt:
          type: string
          format: date-time

    Pagination:
      type: object
      properties:
        page:
          type: integer
        pageSize:
          type: integer
        total:
          type: integer
        totalPages:
          type: integer

    CancelRegistrationRequest:
      type: object
      required: [reason]
      properties:
        reason:
          type: string
          description: Motivo de la cancelación (opcional pero recomendado para auditoría)

    RefundPaymentRequest:
      type: object
      required: [reason]
      properties:
        reason:
          type: string
          description: Motivo del reembolso (obligatorio para auditoría)
```

---

## 2. Descripción de los endpoints principales

La API propuesta se concentra en los siguientes flujos funcionales:

1. Autenticación y registro de socio.
2. Consulta y gestión del perfil del socio.
3. Consulta y administración de rutas.
4. Galería de media asociada a rutas.
5. Calendario de actividades.
6. Inscripciones y pagos de ruta.
7. Envío y consultas de avisos.

### 2.1. Auth

- `POST /auth/login`: valida credenciales del socio o administrador y devuelve JWT y perfil.
- `POST /auth/register`: crea el registro inicial de un socio y su cuenta de acceso.
- `POST /auth/logout`: cierra sesión

### 2.2. Socios

- `GET /members/{memberId}`: devuelve el perfil de un socio por identificador.
- `PUT /members/{memberId}`: actualiza datos del perfil del socio.

### 2.3. Rutas

- `GET /routes`: obtiene rutas públicas o visibles.
- `POST /routes`: crea una nueva ruta, usado por administración.
- `POST /members/{memberId}/route-proposals`: permite a un socio proponer una nueva ruta para revisión.
- `GET /routes/proposals`: lista propuestas de rutas pendientes de revisión administrativa.
- `POST /routes/{routeId}/review`: aprueba o rechaza una propuesta de ruta.
- `GET /routes/{routeId}`: obtiene una ruta con detalle.
- `PUT /routes/{routeId}`: actualiza una ruta.
- `GET /routes/{routeId}/media`: devuelve medios asociados.
- `POST /routes/{routeId}/media`: carga una imagen o vídeo para una ruta.

### 2.4. Calendario

- `GET /calendar`: lista eventos o actividades programadas.
- `POST /calendar/events`: crea un evento en el calendario.

### 2.5. Inscripciones y pagos

- `POST /routes/{routeId}/registrations`: inscribe al socio en una ruta.
- `GET /members/{memberId}/registrations`: lista las inscripciones relacionadas con ese socio.
- `POST /payments`: genera o procesa un cobro asociado a una inscripción y una ruta.
- `GET /payments/{paymentId}`: consulta el estado del pago.

### 2.6. Avisos y correos

- `GET /notifications`: obtiene los avisos visibles al socio o administrador.
- `POST /notifications`: crea un aviso desde administración.
- `POST /notifications/{notificationId}/send`: lanza entrega/cola del aviso.

---

## 3. Principios de diseño de la API

La API se ha diseñado para satisfacer la arquitectura de monolito modular propuesta en arquitectura, con separación natural por módulos de negocio:

- `auth` y `members` para autenticación y perfil.
- `routes` para rutas y media.
- `calendar` para actividad del club.
- `registrations` y `payments` para gestión transaccional de cobros.
- `notifications` para correo y avisos.

---

## 4. Control de acceso por rol

La API implementa dos roles principales:

### **SOCIO**
Permisos:
- `POST /auth/login` - Iniciar sesión
- `POST /auth/register` - Registrarse
- `POST /auth/logout` - Cerrar sesión
- `GET /members/{memberId}` - Ver su propio perfil
- `PUT /members/{memberId}` - Actualizar su propio perfil (excepto status)
- `PUT /members/{memberId}/password` - Cambiar su propia contraseña
- `GET /routes` - Listar rutas publicadas
- `GET /routes/{routeId}` - Ver detalle de ruta
- `GET /routes/{routeId}/media` - Ver galería de ruta
- `POST /members/{memberId}/route-proposals` - Proponer una nueva ruta
- `GET /calendar` - Consultar calendario de actividades
- `POST /routes/{routeId}/registrations` - Inscribirse en una ruta
- `GET /members/{memberId}/registrations` - Ver sus inscripciones
- `PUT /registrations/{registrationId}` - Cancelar su propia inscripción
- `POST /payments` - Crear pago para su inscripción
- `GET /payments/{paymentId}` - Consultar estado de su pago
- `GET /notifications` - Ver avisos dirigidos a él

### **ADMIN**
Permisos (incluye todos los de SOCIO, más):
- `POST /routes` - Crear ruta directamente (se publica como PUBLISHED)
- `GET /routes` - Listar todas las rutas (incluyendo DRAFT, PENDING_REVIEW, etc.)
- `GET /routes/proposals` - Listar propuestas pendientes de revisión
- `POST /routes/{routeId}/review` - Revisar y aprobar/rechazar propuestas
- `PUT /routes/{routeId}` - Actualizar cualquier ruta
- `POST /routes/{routeId}/media` - Subir media para una ruta
- `POST /calendar/events` - Crear eventos en el calendario
- `POST /notifications` - Crear avisos
- `POST /notifications/{notificationId}/send` - Enviar avisos a socios
- `POST /payments/{paymentId}/refund` - Procesar reembolsos
- `PUT /members/{memberId}` - Actualizar perfil de cualquier socio (incluyendo status)

**Nota**: Los endpoints sin especificación explícita de seguridad están disponibles públicamente (ej: `GET /routes` para consultar rutas publicadas sin estar autenticado).
