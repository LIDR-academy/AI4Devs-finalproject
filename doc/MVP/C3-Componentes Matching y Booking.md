@startuml
title C3 – Componentes: Matching & Booking

package "Matching Service" {
  component "Match API" as MATCH_API
  component "Scoring Engine\n(Haversine / ETA / reglas)" as SCORER
  component "Geo Index\n(Elastic Geo/Redis Geo)" as GEOIDX
}

package "Booking Service" {
  component "Booking API" as BOOK_API
  component "Orchestrator\n(Sagas / TX outbox)" as ORCH
  component "State Machine\n(Reserva)" as FSM
}

database "Trips/Users (PG)" as PG
queue "Event Bus" as BUS
component "Notification Worker" as NTF

MATCH_API --> SCORER
SCORER --> GEOIDX
SCORER --> PG
BOOK_API --> ORCH
ORCH --> FSM
ORCH --> PG
ORCH --> BUS : BookingCreated/Cancelled
BUS --> NTF
@enduml
