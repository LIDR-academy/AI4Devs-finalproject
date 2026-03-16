## Sysmtem context
@startuml
!includeurl https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Context.puml
LAYOUT_WITH_LEGEND()

Person(visitor, "Visitante", "Explora el catálogo y reglas básicas")
Person(user, "Usuario Registrado", "Gestiona biblioteca y wishlist; accede a contenido premium")
Person(admin, "Administrador", "Curación de contenido y gestión de solicitudes")

System(gamy, "Gamy", "Plataforma web para descubrir y gestionar juegos de mesa (MVP)")

Rel(visitor, gamy, "Busca/consulta", "HTTPS")
Rel(user, gamy, "Login, biblioteca, wishlist, contenido premium", "HTTPS")
Rel(admin, gamy, "Alta/baja/edición de juegos y revisión de solicitudes", "HTTPS")

SHOW_LEGEND()
@enduml

## Container Diagram
@startuml
!includeurl https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Container.puml
LAYOUT_WITH_LEGEND()

Person(visitor, "Visitante")
Person(user, "Usuario Registrado")
Person(admin, "Administrador")

System_Boundary(gamy, "Gamy") {
  Container(web, "Frontend Web", "Django Templates + HTMX", "UI responsive, búsqueda y detalle de juegos")
  Container(api, "Django Backend", "Python / Django", "Views, lógica de negocio, validaciones, seguridad")
  ContainerDb(db, "PostgreSQL", "RDBMS", "Catálogo de juegos, usuarios, biblioteca, solicitudes")
  Container(static, "Static Files", "Nginx/Storage", "CSS/JS/Imágenes")
  Container(job, "Data Migration Tools", "Django mgmt cmds", "Carga inicial/ETL de juegos")
  Container(adminpanel, "Admin Panel", "Django Admin", "Gestión de juegos y solicitudes")
}

Rel(visitor, web, "Navega y consulta", "HTTPS")
Rel(user, web, "Gestiona biblioteca / wishlist", "HTTPS")
Rel(admin, adminpanel, "Gestiona contenido", "HTTPS")

Rel(web, api, "Petición de vistas/acciones", "WSGI/HTTP interno")
Rel(adminpanel, api, "Operaciones administrativas", "WSGI/HTTP interno")
Rel(api, db, "CRUD", "SQL")
Rel(web, static, "Sirve recursos", "HTTP(S)")
Rel(job, db, "Carga/actualización de datos", "SQL")

SHOW_LEGEND()
@enduml

## Component Diagram (dentro del “Django Backend”)
@startuml
!includeurl https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Component.puml
LAYOUT_WITH_LEGEND()

Container(api, "Django Backend", "Python/Django", "Lógica del dominio y endpoints")

Component(authc, "Auth & Profiles", "Django Auth", "Registro/login, perfiles básicos")
Component(catalog, "Games Catalog", "Views/Services", "Listado, detalle, reglas básicas/detalladas")
Component(search, "Search & Filters", "Services", "Búsqueda/filtros por jugadores, tiempo, edad, categoría")
Component(library, "User Library & Wishlist", "Views/Services", "Alta/baja en biblioteca y lista de deseos")
Component(requests, "Game Requests", "Views/Services", "Solicitud de nuevos juegos y flujo de aprobación")
Component(adminapi, "Admin Ops", "Django Admin Custom", "Gestión de juegos y solicitudes")
Component(data, "ORM Models", "Django ORM", "Users, Games, UserGameLibrary, GameRequests")

Rel(authc, data, "Lee/Escribe")
Rel(catalog, data, "Lee/Escribe")
Rel(search, data, "Lee")
Rel(library, data, "Lee/Escribe")
Rel(requests, data, "Lee/Escribe")
Rel(adminapi, data, "Lee/Escribe")

Rel(catalog, search, "Usa")
Rel(library, authc, "Verifica usuario")
Rel(requests, authc, "Verifica permisos")
SHOW_LEGEND()
@enduml

## Code (modelo de datos clave del MVP)
@startuml
' Diagrama de datos para Gamy (ajustado y compatible con PlantUML)

skinparam classAttributeIconSize 0

' ===== Entidades base (resumen) =====
class User {
  +id: ID
  +email: string
  +password: string
  +first_name: string
  +last_name: string
  +date_joined: datetime
  +is_active: bool
}

class Game {
  +id: ID
  +name: string
  +description_basic: text
  +description_detailed: text
  +min_players: int
  +max_players: int
  +play_time: int
  +min_age: int
  +category: string
  +rules_basic: text
  +rules_detailed: text
  +image_url: string
  +created_at: datetime
}

enum LibraryStatus {
  owned
  wishlist
}

class UserGameLibrary {
  +id: ID
  +user_id: FK(User.id)
  +game_id: FK(Game.id)
  +date_added: datetime
  +status: LibraryStatus
}

class GameRequest {
  +id: ID
  +user_id: FK(User.id)
  +game_name: string
  +publisher: string
  +category: string
  +description: text
  +status: string
  +created_at: datetime
}

User "1" -- "0..*" UserGameLibrary : posee
Game "1" -- "0..*" UserGameLibrary : referencia
User "1" -- "0..*" GameRequest : solicita


' ===== Nuevas entidades para reglas y videos =====
enum RuleLevel {
  basic
  detailed
  quickstart
  advanced
}

enum VideoPlatform {
  YouTube
  Vimeo
  Other
}

class RuleSet {
  +id: ID
  +game_id: FK(Game.id)
  +level: RuleLevel
  +language: string      ' ISO-639-1, ej. "es", "fr", "en"
  +version: string
  +source: string        ' oficial / curado / comunidad
  +content_markdown: text
  +created_at: datetime
  +updated_at: datetime
}

class RuleVariant {
  +id: ID
  +ruleset_id: FK(RuleSet.id)
  +name: string
  +description_markdown: text
  +is_official: bool
  +tags: string          ' lista separada por comas
  +min_players_delta: int?
  +max_players_delta: int?
  +play_time_delta: int?
  +min_age_delta: int?
  +created_at: datetime
  +updated_at: datetime
}

class TrainingVideo {
  +id: ID
  +game_id: FK(Game.id)
  +ruleset_id: FK(RuleSet.id)?
  +title: string
  +url: text
  +platform: VideoPlatform
  +language: string
  +duration_seconds: int?
  +is_official: bool
  +quality_rating: int?  ' 1..5
  +created_at: datetime
}

Game "1" -- "0..*" RuleSet : tiene
RuleSet "1" -- "0..*" RuleVariant : define
Game "1" -- "0..*" TrainingVideo : referencia
RuleSet "0..1" -- "0..*" TrainingVideo : contextualiza

@enduml
