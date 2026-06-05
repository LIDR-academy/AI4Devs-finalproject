# Mermaid Diagram Types — Quick Syntax Reference

## Use Case (`usecase`)
```mermaid
graph TD
    Actor1((Usuario)) --> UC1[Iniciar sesión]
    Actor1 --> UC2[Ver perfil]
    UC1 ..> UC3[Validar credenciales] : <<include>>
    UC2 ..> UC4[Editar datos] : <<extend>>
```

## Sequence (`sequenceDiagram`)
```mermaid
sequenceDiagram
    participant U as Usuario
    participant S as Sistema
    participant DB as Base de datos
    U->>S: POST /login {email, password}
    S->>DB: SELECT user WHERE email=?
    DB-->>S: user_record
    S-->>U: 200 OK {token}
```

## Class (`classDiagram`)
```mermaid
classDiagram
    class Animal {
        +String name
        +int age
        +makeSound() void
    }
    class Dog {
        +fetch() void
    }
    Animal <|-- Dog : inherits
```

## Flowchart (`flowchart`)
```mermaid
flowchart TD
    A[Inicio] --> B{¿Usuario autenticado?}
    B -->|Sí| C[Dashboard]
    B -->|No| D[Login]
    D --> E[Validar credenciales]
    E --> B
    subgraph Proceso de auth
        D --> E
    end
```

## Entity-Relationship (`erDiagram`)
```mermaid
erDiagram
    USER ||--o{ ORDER : places
    USER {
        int id PK
        string email
        string name
    }
    ORDER {
        int id PK
        date created_at
        float total
    }
    ORDER ||--|{ ITEM : contains
```

## State Diagram (`stateDiagram-v2`)
```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Processing : submit
    Processing --> Success : ok
    Processing --> Error : fail
    Error --> Idle : retry
    Success --> [*]
```

## Gantt (`gantt`)
```mermaid
gantt
    title Project Timeline
    dateFormat  YYYY-MM-DD
    section Phase 1
    Discovery      :done,    p1, 2024-01-01, 2024-01-15
    Design         :active,  p2, 2024-01-15, 2024-02-01
    section Phase 2
    Development    :         p3, after p2, 30d
    Testing        :         p4, after p3, 15d
```

## Mindmap (`mindmap`)
```mermaid
mindmap
  root((Sistema))
    Usuarios
      Registro
      Autenticación
    Productos
      Catálogo
      Búsqueda
    Pedidos
      Carrito
      Pago
```

## Git Graph (`gitGraph`)
```mermaid
gitGraph
    commit id: "initial"
    branch feature/auth
    checkout feature/auth
    commit id: "add login"
    commit id: "add JWT"
    checkout main
    merge feature/auth
    commit id: "release v1.0" tag: "v1.0"
```

## C4 Context (`C4Context`)
```mermaid
C4Context
    title System Context Diagram
    Person(user, "User", "A registered user")
    System(app, "Application", "Main system")
    System_Ext(email, "Email System", "External SMTP")
    Rel(user, app, "Uses")
    Rel(app, email, "Sends emails via")
```

## C4 Container (`C4Container`)
```mermaid
C4Container
    title Container Diagram
    Person(user, "User")
    Container(spa, "SPA", "React", "Web UI")
    Container(api, "API", "Node.js", "REST API")
    ContainerDb(db, "Database", "PostgreSQL")
    Rel(user, spa, "Uses", "HTTPS")
    Rel(spa, api, "Calls", "REST/HTTPS")
    Rel(api, db, "Reads/Writes", "SQL")
```

## C4 Component (`C4Component`)
```mermaid
C4Component
    title Component Diagram for API
    Container(api, "API", "Node.js")
    Component(auth, "Auth Module", "JWT validation")
    Component(ctrl, "Controllers", "Route handlers")
    Component(repo, "Repositories", "Data access")
    Rel(ctrl, auth, "Validates token")
    Rel(ctrl, repo, "Queries")
```

## Timeline (`timeline`)
```mermaid
timeline
    title Product Roadmap
    2024 Q1 : Discovery : MVP Design
    2024 Q2 : Beta Launch : User Testing
    2024 Q3 : GA Release : Marketing Campaign
    2024 Q4 : Feature Expansion
```

## Quadrant Chart (`quadrantChart`)
```mermaid
quadrantChart
    title Feature Priority Matrix
    x-axis Low Effort --> High Effort
    y-axis Low Impact --> High Impact
    quadrant-1 Quick Wins
    quadrant-2 Major Projects
    quadrant-3 Fill-ins
    quadrant-4 Thankless Tasks
    Feature A: [0.2, 0.8]
    Feature B: [0.7, 0.7]
```

## XY Chart (`xychart-beta`)
```mermaid
xychart-beta
    title "Monthly Revenue"
    x-axis [Jan, Feb, Mar, Apr, May]
    y-axis "Revenue (K)" 0 --> 100
    bar [30, 45, 60, 55, 80]
    line [30, 45, 60, 55, 80]
```

## Block Diagram (`block-beta`)
```mermaid
block-beta
    columns 3
    A["Client"] B["API Gateway"] C["Database"]
    A --> B
    B --> C
```
