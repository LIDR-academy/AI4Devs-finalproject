@startuml
title C2 – Contenedores principales

skinparam rectangle {
  BackgroundColor #F8FBFF
  BorderColor #7A94AE
  RoundCorner 12
}
left to right direction

node "Cliente" {
  rectangle "SPA Web/PWA\n(React/TS)" as SPA
  rectangle "App Mobile (Opc.)\nCapacitor/React Native" as MOB
}

cloud "API Gateway\n(ingress + WAF + OIDC)" as GW

package "Servicios de Dominio" as SVC {
  rectangle "Users & Profiles\n(REST)" as USERS
  rectangle "Trips Service\n(REST)" as TRIPS
  rectangle "Matching Service\n(REST/Async)" as MATCH
  rectangle "Booking Service\n(REST)" as BOOK
  rectangle "Notifications\n(Workers)" as NOTIF
  rectangle "Admin Console\n(RRHH/Seguridad)" as ADMIN
}

package "Data & Infra" as DATA {
  database "PostgreSQL\n(OLTP + PostGIS)" as PG
  rectangle "Redis\n(Cache/Sessions)" as REDIS
  rectangle "Search\n(Elastic/OpenSearch)" as ES
  queue "Event Bus\n(Kafka/RabbitMQ)" as BUS
  database "DWH/Lake\n(dbx/BigQuery/Snowflake)" as DWH
}

cloud "SSO/IdP" as IDP
cloud "Email/Push" as MSG
cloud "Mapas/Geocoding" as GEO
cloud "Calendario" as CAL

SPA --> GW
MOB --> GW
GW --> USERS
GW --> TRIPS
GW --> MATCH
GW --> BOOK
GW --> ADMIN

USERS --> PG
TRIPS --> PG
BOOK --> PG
MATCH --> PG
MATCH --> ES
USERS --> REDIS
MATCH --> REDIS

NOTIF --> MSG
TRIPS --> GEO
BOOK --> CAL : opcional

' eventos
TRIPS --> BUS : TripCreated / TripUpdated
BOOK --> BUS : BookingCreated / BookingCancelled
MATCH --> BUS : MatchComputed
NOTIF --> BUS : NotificationSent
BUS --> DWH

' auth
SPA --> IDP
GW --> IDP

@enduml
