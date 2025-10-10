# Arquitectura (C4 Nivel 1 y 2 Simplificado)

## Nivel 1: Contexto del Sistema

```mermaid
flowchart LR
  subgraph UsuarioFinal[Cliente]
    C[Cliente]
  end

  subgraph Admin[Administrador]
    A[Admin]
  end

  subgraph Sistema[Plataforma Reservas]
    FE[Frontend Web - Next.js]
    API[API Backend - Spring Boot Kotlin]
    DB[(PostgreSQL)]
  end

  GCal[(Google Calendar API)]
  Email[(Proveedor Email)]

  C --> FE
  A --> FE
  FE --> API
  API --> DB
  API <-- GCal
  API --> GCal
  API --> Email
```

## Nivel 2: Contenedores (Detalle Backend)

```mermaid
flowchart TB
  subgraph Frontend[Frontend Next.js]
    UI[React Pages / Components]
  end

  subgraph Backend[Spring Boot Monolith]
    API[Controllers REST]
    APP[Servicios Aplicación]
    DOM[Dominio / Modelos]
    INFRA[(Infra: Repos, Adaptadores)]
    INTEG[Integraciones GoogleCalendarClient  EmailSender]
    JOBS[Scheduler / Jobs]
  end

  DB[(PostgreSQL)]
  GCAL[(Google Calendar API)]
  EMAIL[(Email Provider)]

  UI --> API
  API --> APP
  APP --> DOM
  APP --> INFRA
  INFRA --> DB
  APP --> INTEG
  JOBS --> INTEG
  INTEG --> GCAL
  INTEG --> EMAIL
```

## Notas
- App Services orquestan reglas y coordinan dominio + infra.
- Controllers solo validan entrada/salida (DTO mapping).
- Jobs disparan sincronizaciones periódicas.
