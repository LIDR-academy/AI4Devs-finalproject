@startuml
title MVP bonÀreaGo - Diagrama de Casos de Uso

skinparam shadowing false
skinparam usecase {
  BorderColor #555
  BackgroundColor #EEF5FF
}
skinparam actorStyle awesome

' ==== Actores (con jerarquía) ====
actor "Empleado" as Empleado <<actor>>
actor "Conductor" as Conductor <<actor>>
actor "Pasajero" as Pasajero <<actor>>

Empleado <|-- Conductor
Empleado <|-- Pasajero

' ==== Sistemas externos ====
actor "SSO / IdP Corporativo" as IdP <<external>>
actor "Servicio de Notificaciones\n(Email/Push)" as Notif <<external>>

' ==== Límite del Sistema ====
rectangle "bonÀreaGo (MVP)" as Sistema {

  ' --- Autenticación y Perfil ---
  usecase "UC1 - Autenticarse\n(SSO corporativo)" as UC1
  usecase "UC2 - Completar perfil\nsimplificado" as UC2

  ' --- Publicación y Búsqueda ---
  usecase "UC3 - Publicar trayecto\n(como conductor)" as UC3
  usecase "UC4 - Buscar trayecto\n(como pasajero)" as UC4

  ' --- Reserva y Gestión básica ---
  usecase "UC5 - Reservar plaza" as UC5
  usecase "UC6 - Ver viajes confirmados" as UC6

  ' --- Notificaciones básicas ---
  usecase "UC7 - Enviar notificaciones\nbásicas (confirmación/recordatorio)" as UC7
}

' ==== Relaciones Actor ↔︎ Casos de Uso ====
Empleado --> UC1
Empleado --> UC2

Conductor --> UC3
Pasajero --> UC4

Pasajero --> UC5
Conductor --> UC6
Pasajero --> UC6

' ==== Relaciones entre casos de uso ====
' Autenticación previa como precondición funcional
UC2 .u.> UC1 : <<precondición>>
UC3 .u.> UC1 : <<precondición>>
UC4 .u.> UC1 : <<precondición>>
UC5 .u.> UC1 : <<precondición>>
UC6 .u.> UC1 : <<precondición>>

' Notificaciones como servicio interno reusable
UC5 --> UC7 : <<dispara>>
UC6 --> UC7 : <<opcional>>

' ==== Integraciones externas ====
IdP --> UC1 : SSO/OIDC/SAML
UC7 --> Notif : SMTP / Push API

' ==== Notas de buenas prácticas ====
note right of UC1
[Propósito] Verificar identidad corporativa.
[Alcance MVP] SSO/OIDC o código de empleado.
[Post] Sesión iniciada; consentimiento RGPD aceptado.
end note

note right of UC2
[Datos mínimos] Nombre, sede, rol preferido
(conductor/pasajero), zona de origen (barrio/CP).
[Privacidad] No se guarda dirección exacta.
end note

note top of UC3
[Campos] Fecha/hora, origen aprox., destino (sede),
plazas disponibles.
[Simple] Sin chat ni reglas complejas en MVP.
end note

note top of UC4
[Filtro básico] Sede + franja horaria.
[Ordenación] Cercanía/desvío simple.
end note

note left of UC5
[Flujo] Reserva inmediata si hay plaza.
[Conf.] Email/Push con detalles del viaje.
[Sin] Lista de espera ni pagos en MVP.
end note

note left of UC6
[Vista] Próximos viajes con rol del usuario.
[Objetivo] Revisión rápida y gestión mínima.
end note

note bottom of Sistema
Scope MVP: autenticación, perfil mínimo,
publicar, buscar, reservar, ver confirmados,
notificaciones básicas.
Quedan fuera: chat, check-in/out, matching avanzado,
incentivos, métricas CO₂ y pagos.
end note

@enduml
