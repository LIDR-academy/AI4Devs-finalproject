erDiagram
    USER {
        int id PK
        string nombre
        string email
        string departamento
        string zona_residencia
        string preferencias_viaje
        string rol
        string foto
        bool activo
    }
    TRAYECTO {
        int id PK
        int conductor_id FK
        string origen
        float origen_latitud
        float origen_longitud
        string destino
        float destino_latitud
        float destino_longitud
        datetime fecha_hora
        int plazas_disponibles
        string estado
        string tipo_trayecto
        string puntos_encuentro
        string notas
    }
    RESERVA {
        int id PK
        int trayecto_id FK
        int pasajero_id FK
        string estado
        datetime fecha_reserva
        bool confirmada
    }
    VALORACION {
        int id PK
        int reserva_id FK
        int evaluador_id FK
        int evaluado_id FK
        int puntuacion
        string comentario
        datetime fecha_valoracion
        string etiquetas
    }
    NOTIFICACION {
        int id PK
        int user_id FK
        string mensaje
        datetime fecha_envio
        bool leida
        string tipo
    }
    CHAT {
        int id PK
        int trayecto_id FK
        int user_id FK
        string mensaje
        datetime fecha_envio
    }
    HISTORIAL {
        int id PK
        int user_id FK
        int trayecto_id FK
        datetime fecha
        string rol
    }
    INCENTIVO {
        int id PK
        int user_id FK
        int puntos
        string tipo
        datetime fecha
        string descripcion
    }
    EVENTO {
        int id PK
        string nombre
        string descripcion
        datetime fecha
        string ubicacion
    }
    TRAYECTO ||--o{ RESERVA : tiene
    USER ||--o{ TRAYECTO : conduce
    USER ||--o{ RESERVA : realiza
    RESERVA ||--o{ VALORACION : genera
    USER ||--o{ VALORACION : evalua
    USER ||--o{ NOTIFICACION : recibe
    TRAYECTO ||--o{ CHAT : tiene
    USER ||--o{ CHAT : escribe
    USER ||--o{ HISTORIAL : registra
    TRAYECTO ||--o{ HISTORIAL : registra
    USER ||--o{ INCENTIVO : obtiene
    EVENTO ||--o{ TRAYECTO : asocia