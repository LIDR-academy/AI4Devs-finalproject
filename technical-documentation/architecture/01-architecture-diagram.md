# 2.1. Diagrama de Arquitectura

## Arquitectura de Alto Nivel (C4 - Contexto)

Aura Planning sigue una arquitectura **cloud-native sobre Kubernetes** con separación clara entre el panel de gestión (SPA dinámico), los micrositios de invitados (estáticos servidos por CDN desde MinIO), y servicios de fondo distribuidos.

```mermaid
graph TB
    subgraph External_Actors
        Host["👤 Host (Pareja/Planner)"]
        Guest["👤 Invitado"]
        Accomplice["🤵 Accomplice (Padrino/Dama)"]
    end

    subgraph Aura_Platform["Aura Planning Platform"]
        subgraph Frontend_Tier
            Dashboard["Host Dashboard<br/>Angular 22 SPA"]
            Microsite["Guest Microsite<br/>Static HTML/JS"]
            AccomplicePanel["Accomplice Panel<br/>Angular 22 SPA"]
        end

        subgraph CDN_Tier["CDN Layer"]
            Cloudflare["Cloudflare CDN"]
        end

        subgraph K8s_Cluster["Kubernetes Cluster"]
            subgraph Ingress_Layer
                Ingress["Ingress Controller<br/>(nginx/traefik)"]
                CertMgr["Cert-Manager<br/>(TLS)"]
            end

            subgraph API_Tier
                API1["API Pod 1<br/>.NET 10"]
                API2["API Pod 2<br/>.NET 10"]
            end

            subgraph Worker_Tier
                EmailW["Email Dispatcher<br/>Deployment"]
                WAW["WhatsApp Dispatcher<br/>Deployment"]
                SSGW["Static Site Generator<br/>Deployment"]
                RetCron["Data Retention<br/>CronJob"]
                RemCron["Reminder Scheduler<br/>CronJob"]
            end

            subgraph Data_Tier
                PG[("PostgreSQL<br/>StatefulSet")]
                DF[("Dragonfly<br/>StatefulSet")]
                MinIO[("MinIO<br/>Object Storage")]
            end
        end
    end

    subgraph External_Services
        Gmail["Gmail SMTP"]
        MetaWA["Meta WhatsApp<br/>Cloud API"]
        Stripe["Stripe Connect"]
        GMaps["Google Maps API"]
    end

    Host --> Ingress
    Accomplice --> Ingress
    Guest --> Cloudflare
    Cloudflare --> Microsite

    Ingress --> API1
    Ingress --> API2

    API1 --> PG
    API1 --> DF
    API1 --> MinIO
    API2 --> PG
    API2 --> DF
    API2 --> MinIO

    API1 --> EmailW
    API1 --> WAW
    API1 --> SSGW

    EmailW --> Gmail
    WAW --> MetaWA
    API1 --> Stripe
    API1 --> GMaps

    RetCron --> PG
    RemCron --> DF
```

## Diagrama de Contenedores (C4 Model)

```mermaid
graph LR
    subgraph Browser
        A[Host Dashboard SPA]
        B[Guest Microsite]
        C[Accomplice Panel]
    end

    subgraph CDN
        D[Cloudflare Distribution]
    end

    subgraph K8s_Ingress["Ingress Controller"]
        E[nginx/traefik]
    end

    subgraph API_Pods["API Pods (.NET 10)"]
        F[Auth Controller]
        G[Events Controller]
        H[RSVP Controller]
        I[Accomplice Controller]
        J[Live Messages Controller]
        K[Payments Controller]
        L[Webhook Handlers]
    end

    subgraph Workers["Worker Deployments"]
        M[Email Dispatcher]
        N[WhatsApp Dispatcher]
        O[Static Site Generator]
        P[Data Retention CronJob]
        Q[Reminder Scheduler CronJob]
    end

    subgraph Storage["StatefulSets"]
        R[(PostgreSQL)]
        S[(Dragonfly)]
        T[(MinIO)]
    end

    subgraph External
        U[Gmail SMTP]
        V[Meta WhatsApp API]
        W[Stripe]
        X[Google Maps]
    end

    A --> E
    C --> E
    D --> B
    B --> H

    E --> F
    E --> G
    E --> K

    F --> R
    G --> R
    G --> O
    H --> R
    I --> R
    J --> R
    K --> R
    L --> R

    O --> T
    T --> D

    G --> M
    M --> U
    J --> N
    N --> V
    K --> W
    G --> X

    P --> R
    Q --> M
    Q --> N
```

## Flujo del Micrositio de Invitados (JAMstack + MinIO)

```mermaid
sequenceDiagram
    autonumber
    participant Guest
    participant Cloudflare
    participant MinIO
    participant API
    participant PG

    Note over Guest,Cloudflare: Fase 1: Carga del Sitio Estático
    Guest->>Cloudflare: GET /e/{event-slug}
    Cloudflare->>Cloudflare: Verificar caché
    alt Caché Hit
        Cloudflare-->>Guest: 200 OK (HTML/JS/CSS)
    else Caché Miss
        Cloudflare->>MinIO: GET /{event-slug}/index.html
        MinIO-->>Cloudflare: Static assets
        Cloudflare->>Cloudflare: Caché por 1 hora
        Cloudflare-->>Guest: 200 OK
    end

    Note over Guest,PG: Fase 2: Envío de RSVP
    Guest->>API: GET /api/rsvp/{token}
    API->>PG: Validar token, obtener guest+evento
    PG-->>API: Datos Guest + Evento
    API-->>Guest: 200 OK (JSON)

    Guest->>API: POST /api/rsvp/{token}<br/>{attendance, dietary, plusOne}
    API->>PG: INSERT RSVP, UPDATE Invitation
    PG-->>API: Éxito
    API-->>Guest: 200 OK {confirmationId}
```

## Flujo Live Guest Journey (Accomplice → WhatsApp)

```mermaid
sequenceDiagram
    autonumber
    participant Accomplice
    participant Ingress
    participant API
    participant PG
    participant Dragonfly
    participant WhatsApp
    participant Guests

    Note over Accomplice,Guests: Pre-Evento - Configuración
    API->>PG: Crear registro Accomplice
    PG-->>API: {accompliceToken, permissions}
    API->>Accomplice: Magic link vía email

    Accomplice->>Ingress: GET /api/accomplices/verify?token={token}
    Ingress->>API: Route to API pod
    API->>PG: Validar token, verificar expiración
    PG-->>API: Perfil Accomplice + evento
    API-->>Accomplice: 200 OK {sessionJWT, messageTemplates}

    Note over Accomplice,Guests: Evento en Vivo - Envío de Mensajes
    Accomplice->>Ingress: POST /api/live/{accompliceToken}/send
    Ingress->>API: Route to API pod
    API->>PG: Validar token accomplice + permisos
    PG-->>API: Accomplice válido
    API->>PG: INSERT LiveMessage (status=pending)
    API->>Dragonfly: LPUSH whatsapp:queue {messagePayload}
    API-->>Accomplice: 202 Accepted {messageId}

    WhatsApp->>Dragonfly: BRPOP whatsapp:queue
    Dragonfly-->>WhatsApp: {messagePayload}
    WhatsApp->>WhatsApp: POST /messages (template + variables)
    WhatsApp-->>WhatsApp: 200 OK {wamid}
    WhatsApp->>PG: UPDATE LiveMessage (status=sent, wamid)

    WhatsApp->>Guests: Entregar mensaje WhatsApp

    Note over Accomplice,Guests: Receipt de Entrega (Webhook)
    WhatsApp->>Ingress: POST /api/webhooks/whatsapp
    Ingress->>API: Route to webhook handler
    API->>PG: UPDATE LiveMessage (deliveryStatus)
    API-->>WhatsApp: 200 OK
```

## Justificación de la Arquitectura

### Patrón Arquitectónico: Cloud-Native Kubernetes + Clean Architecture

Aura Planning combina dos patrones arquitectónicos:

1. **Cloud-Native Kubernetes**: Microservicios containerizados con orquestación K8s, escalado automático (HPA), service discovery nativo, y gestión de estado mediante StatefulSets (PostgreSQL, Dragonfly, MinIO).

2. **Clean Architecture (Onion)** para el backend: separación en capas (Api → Core → Infrastructure) que permite independencia de frameworks, testabilidad y mantenibilidad.

### Beneficios

| Beneficio | Descripción |
|-----------|-------------|
| **Escalabilidad automática** | HPA escala pods de API según CPU/memoria; Dragonfly maneja miles de ops/sec |
| **Portabilidad** | K8s abstracta el proveedor; funciona en GKE, EKS, DOKS, on-premise, Rancher Desktop |
| **Resiliencia** | Liveness/readiness probes, auto-restart de pods, réplicas múltiples |
| **Costo** | Dragonfly usa 25x menos memoria que Redis; MinIO reemplaza S3; Gmail SMTP gratuito |
| **Observabilidad nativa** | Prometheus + Grafana + Loki integrados en el cluster |
| **GitOps-ready** | Kustomize overlays para entornos; CI/CD con GHCR + kubectl |

### Sacrificios y Déficits

| Sacrificio | Impacto | Mitigación |
|------------|---------|------------|
| **Complejidad operativa de K8s** | Mayor curva de aprendizaje que PaaS | Rancher Desktop para local; Kustomize simplifica despliegue |
| **Gmail SMTP limitado** | 500 emails/día, sin bounce webhooks | Adecuado para MVP; IEmailService permite swap a Mailgun/Brevo |
| **PostgreSQL vs SQLite** | Mayor overhead de infraestructura | Necesario para multi-pod; Helm chart simplifica instalación |
| **Sin HA multi-región** | Single cluster para MVP | K8s facilita migración a multi-cluster futuro |
| **Dragonfly madurez** | Proyecto relativamente nuevo vs Redis | API-compatible con Redis; mismo cliente StackExchange.Redis |

---

[← Volver a readme.md](../../readme.md) | [Siguiente: Componentes Principales →](./02-components.md)
