flowchart LR
    %% Definición de Actores
    Guest["👤 Usuario No Registrado"]
    User["👤 Participante (Registrado)"]
    Admin["👤 Creador del Viaje"]

    %% Sistema
    subgraph System [TravelSplit System]
        direction TB
        UC1([Registrarse / Login])
        UC2([Crear Viaje])
        UC3([Unirse a Viaje - Código])
        UC4([Registrar Gasto])
        UC5([Editar/Eliminar Gasto])
        UC6([Ver Saldos y Equilibrar])
        UC7([Invitar Usuarios])
    end

    %% Relaciones
    Guest --> UC1
    User --> UC1
    User --> UC3
    User --> UC4
    User --> UC6

    Admin --> UC2
    Admin --> UC7
    Admin --> UC5
    
    Admin -.-> User