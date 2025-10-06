## Diagrama de Casos de Uso y Secuencias - MVP Plataforma de Reservas

## Sección 1: Casos de Uso (Mermaid Flowchart aproximando UML)
 Nota: Mermaid no soporta notación UML de casos de uso nativa; esto es una representación funcional.

```mermaid
flowchart LR
  %% Actores
  Admin((Administrador))
  Cliente((Cliente))
  GCal((Google Calendar))
  Mail((Servicio Email))

  subgraph Plataforma[Plataforma de Reservas MVP]
    UC1([Autenticarse])
    UC2([Gestionar Servicios])
    UC3([Gestionar Slots])
    UC4([Ver Catálogo])
    UC5([Ver Detalle Servicio])
    UC6([Solicitar Reserva])
    UC7([Consultar Estado])
    UC8([Listar Reservas Pendientes])
    UC9([Aprobar Reserva])
    UC10([Rechazar Reserva])
    UC11([Sincronizar Calendario])
    UC12([Notificaciones Email])
  end

  %% Relaciones Actores -> Casos
  Admin --> UC1
  Admin --> UC2
  Admin --> UC3
  Admin --> UC8
  Admin --> UC9
  Admin --> UC10
  Admin --> UC11

  Cliente --> UC4
  Cliente --> UC5
  Cliente --> UC6
  Cliente --> UC7

  GCal --> UC11
  UC11 --> GCal

  %% Inclusiones / dependencias
  UC6 --> UC12
  UC9 --> UC12
  UC10 --> UC12
  UC3 --> UC11
  UC9 --> UC11

  UC12 --> Mail
```

---
## Sección 2: Secuencia - Solicitar Reserva

```mermaid
sequenceDiagram
  autonumber
  participant C as Cliente
  participant Web as Frontend Web
  participant API as API Backend
  participant DB as Base de Datos
  participant Mail as Servicio Email

  C->>Web: Navega a detalle servicio
  Web->>API: GET /servicios/{id}/slots
  API->>DB: Consulta slots abiertos futuros
  DB-->>API: Lista slots
  API-->>Web: Slots disponibles
  C->>Web: Selecciona slot y completa formulario
  Web->>API: POST /reservas {slot_id, nombre, email}
  API->>DB: Inserta reserva (estado=PENDIENTE, booking_code)
  DB-->>API: Reserva creada
  API-->>Mail: Enviar email "Solicitud recibida"
  Mail-->>API: ACK
  API-->>Web: 201 {booking_code, estado=PENDIENTE}
  Web-->>C: Muestra código de reserva
```

---
## Sección 3: Secuencia - Aprobar Reserva

```mermaid
sequenceDiagram
  autonumber
  participant A as Admin
  participant Web as Frontend Backoffice
  participant API as API Backend
  participant DB as Base de Datos
  participant GCal as Google Calendar
  participant Mail as Servicio Email

  A->>Web: Abre panel reservas pendientes
  Web->>API: GET /reservas?estado=PENDIENTE
  API->>DB: Query reservas pendientes
  DB-->>API: Lista reservas
  API-->>Web: Datos reservas
  A->>Web: Clic "Aprobar"
  Web->>API: POST /reservas/{id}/aprobar
  API->>DB: Actualiza reserva (APROBADA)
  API->>DB: Actualiza slot (CERRADO)
  API->>GCal: Crear evento {titulo, inicio, fin, cliente}
  GCal-->>API: Evento creado (event_id)
  API->>Mail: Enviar email "Reserva aprobada"
  Mail-->>API: ACK
  API-->>Web: 200 {estado=APROBADA}
  Web-->>A: Refresca estado
```

---
Notas:
-  Los includes de notificaciones se modelan como pasos explícitos a Mail.
- La sincronización inversa (eventos externos) puede implementarse con un job que marque slots como no disponibles (fuera de estas secuencias).
