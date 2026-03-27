# **Diagramas de secuencia principales**

Aquí están los diagramas de secuencia detallados para las tres operaciones críticas de **arteflujo**. Estos diagramas ilustran la interacción entre los microservicios, la validación de seguridad y la integración con fuentes de contenido externas.

### ---

**1\. Búsqueda Curada (El Dial de Tiempo)**

Este flujo muestra cómo el sistema filtra contenido basado en la duración y el estado de ánimo, priorizando la velocidad de respuesta mediante el uso de la base de datos de metadatos indexados.

Fragmento de código

```mermaid
sequenceDiagram
autonumber
actor Usuario
participant FE as Frontend (Next.js)
participant AGW as API Gateway
participant CS as Servicio de Curaduría
participant DB as PostgreSQL (Metadata)

Usuario->>FE: Ajusta Dial de Tiempo (ej. 15 min) y Mood
FE->>AGW: GET /obras?duracion_max=15&mood=Melancolico
AGW->>CS: Consultar catálogo filtrado
CS->>DB: SELECT * FROM OBRA WHERE duracion_min <= 15 AND vibe_mood = 'Melancolico'
DB-->>CS: Lista de Obras + Hitos
CS-->>AGW: JSON (Lista de Obras con Estatus de Acceso 🟢🟡🔵)
AGW-->>FE: Renderizar Cards de resultados
FE-->>Usuario: Muestra galería de contenidos filtrados
```

### ---

**2\. Reproducción Inteligente y Modo Contexto**

Este es el flujo más complejo, donde el sistema decide la técnica de visualización y prepara la capa de información educativa sincronizada.

Fragmento de código

```mermaid
sequenceDiagram
    autonumber
    actor Usuario
    participant FE as Frontend (Next.js)
    participant AGW as API Gateway
    participant CS as Servicio de Curaduría
    participant DB as PostgreSQL (Metadata)
    participant EXT as APIs Externas (YouTube/Vimeo)

    Usuario->>FE: Selecciona Obra para reproducir
      
    par Obtener Metadatos de Reproducción
        FE->>AGW: GET /obras/{id}
        AGW->>CS: Validar permisos y plataforma
        CS->>DB: Consultar permite_iframe y url_origen
        DB-->>CS: Datos de plataforma
        CS-->>FE: metadata (permite_iframe: true/false)
    and Obtener Datos de Contexto
        FE->>AGW: GET /obras/{id}/contexto
        AGW->>CS: Solicitar hitos y curiosidades
        CS->>DB: SELECT * FROM DATO_CONTEXTO WHERE id_obra = {id}
        DB-->>CS: Lista de marcas de tiempo y textos
        CS-->>FE: JSON (Array de Pop-ups sincronizados)
    end

    alt permite_iframe == true
        FE->>EXT: Cargar video en Smart Embedding (Iframe)
    else permite_iframe == false
        FE->>Usuario: Mostrar botón "Ver en plataforma origen" (Deep Linking)
    end
    FE->>Usuario: Inicia reproducción + Pop-ups de Modo Contexto en T+n
```

### ---

**3\. Persistencia en Watchlist**

Este flujo valida la seguridad del sistema mediante la verificación de tokens antes de realizar operaciones de escritura en el perfil del usuario.

Fragmento de código

```mermaid
sequenceDiagram
    autonumber
    actor Usuario
    participant FE as Frontend (Next.js)
    participant AGW as API Gateway
    participant AS as Servicio de Autenticación (JWT)
    participant US as Servicio de Usuario
    participant DB as PostgreSQL (Watchlist)

    Usuario->>FE: Haz clic en "Guardar en mi lista"
    FE->>AGW: POST /watchlist {id_obra} (Auth: Bearer Token)
      
    Note over AGW,AS: Validación de Identidad
    AGW->>AS: Validar JWT
    alt Token Inválido
        AS-->>AGW: 401 Unauthorized
        AGW-->>FE: Redirigir a Login
    else Token Válido
        AS-->>AGW: OK (user_id: 123)
        AGW->>US: saveToWatchlist(user_id=123, id_obra=456)
        US->>DB: INSERT INTO LISTA_DESEOS (user_id, id_obra)
        DB-->>US: Success
        US-->>AGW: 201 Created
        AGW-->>FE: Confirmación visual de guardado
    end
    FE-->>Usuario: Icono de "Guardado" actualizado
```

### ---

**Puntos de Decisión Críticos en los Diagramas:**

* **En el Diagrama 2 (Reproducción):** Se utiliza una ejecución en paralelo (par) para cargar los metadatos de acceso y los datos del **Modo Contexto** simultáneamente, reduciendo el tiempo de carga percibido por el usuario.  
* **En el Diagrama 3 (Watchlist):** El **API Gateway** actúa como primer filtro de seguridad, delegando la validación del token al servicio de identidad antes de permitir cualquier cambio en la base de datos de usuarios.

