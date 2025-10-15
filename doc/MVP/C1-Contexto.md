@startuml
title C1 – Contexto: bonÀreaGo

left to right direction
skinparam rectangle {
  BackgroundColor #EEF5FF
  BorderColor #6A88A6
  RoundCorner 12
}

actor "Empleado\n(Conductor/Pasajero)" as EMP
actor "RRHH / Sostenibilidad" as HR
actor "Facilities / Seguridad" as SEC

rectangle "bonÀreaGo\n(Dominio Empresa)" as SYS {
  rectangle "Front-end Web/Móvil (SPA)" as FE
  rectangle "Back-end API\n(Servicios de dominio)" as BE
  rectangle "Data Platform\n(Analytics/BI + DWH)" as DWH
}

cloud "SSO / IdP\n(OIDC/SAML)" as IDP
cloud "Email / Push\n(SES/FCM/APNs)" as MSG
cloud "Mapas / Geocoding\n(Google/OSM)" as MAPS
cloud "Calendario\n(365/Google)" as CAL
cloud "BI Corporativo" as BIC

EMP --> FE : Usa
HR --> BIC : Consume informes
SEC --> FE : Consola moderación

FE --> BE : REST/GraphQL
FE --> IDP : Login SSO
BE --> MAPS : Geocoding/ETA/Routing
BE --> CAL : Eventos (opcional)
BE --> MSG : Notificaciones
BE --> DWH : Eventos/ETL
DWH --> BIC : Dataset

@enduml
