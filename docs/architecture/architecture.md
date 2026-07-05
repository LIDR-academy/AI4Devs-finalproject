# Arquitectura — Plataforma de Arrendamiento Residencial de Larga Estadía

---

## 1. Diagrama de sistemas

```mermaid
graph TD
    subgraph Actores
        PRP[Propietario]
        AGT[Agente de Arrendamiento]
        INQ[Inquilino]
    end

    subgraph Frontend["Frontend — React (SPA Responsive)"]
        FE[React App\nVite · React Router · Axios]
    end

    subgraph Backend["Backend — FastAPI (Arquitectura Hexagonal)"]
        API[API Layer\nRouters FastAPI]
        UC[Casos de Uso\nApplication Layer]
        DOM[Dominio\nEntidades · Puertos · Reglas]
        INFRA[Infraestructura\nAdaptadores de Salida]
    end

    subgraph Persistencia["Persistencia"]
        PG[(PostgreSQL\nDatos relacionales)]
        S3[(Object Storage\nS3 / MinIO — Fotos · Documentos)]
    end

    subgraph Externos["Servicios Externos"]
        IDENT[API Identidad\nVerificación cédula colombiana]
        RIESGO[API Riesgo / Seguro\nEstudio de crédito o seguro]
        PAGOS[Pasarela de Pagos\nPSE · Tarjeta — mercado CO]
        FIRMA[Proveedor Firma Electrónica\nLey 527 de 1999]
        EMAIL[Servidor de Email\nSMTP / SaaS — notificaciones]
    end

    PRP -->|HTTPS| FE
    AGT -->|HTTPS| FE
    INQ -->|HTTPS| FE

    FE -->|REST / HTTPS + JWT| API
    API --> UC
    UC --> DOM
    DOM --> |interfaces / puertos| INFRA

    INFRA -->|SQLAlchemy ORM| PG
    INFRA -->|boto3 / presigned URLs| S3
    INFRA -->|REST / HTTPS| IDENT
    INFRA -->|REST / HTTPS| RIESGO
    INFRA -->|REST / HTTPS + webhooks| PAGOS
    INFRA -->|REST / HTTPS| FIRMA
    INFRA -->|SMTP / API| EMAIL

    PAGOS -->|Webhook HTTPS| API
```

**Descripción de componentes:**

| Componente | Responsabilidad |
|---|---|
| React App | SPA responsiva que consume la API REST del backend. Slicing por feature/dominio. Maneja estado local y caché de peticiones con React Query. |
| API Layer (FastAPI) | Adaptadores de entrada HTTP. Validan esquemas Pydantic, extraen JWT, delegan al caso de uso correspondiente. No contienen lógica de negocio. |
| Application Layer | Casos de uso que orquestan el dominio. Coordinan puertos de salida sin depender de implementaciones concretas. |
| Dominio | Entidades, objetos de valor, agregados y puertos (interfaces). Contiene las reglas de negocio puras. Sin dependencia de frameworks. |
| Infraestructura | Adaptadores de salida: repositorios SQLAlchemy, clientes HTTP para APIs externas, cliente S3, cliente email. Implementan los puertos del dominio. |
| PostgreSQL | Base de datos relacional principal para todos los datos transaccionales y de estado. |
| Object Storage (S3/MinIO) | Almacenamiento de fotos de inmuebles y documentos del inquilino (cédula, desprendibles, contratos firmados). |
| API Identidad | Servicio externo colombiano para verificación de cédula de ciudadanía con imagen del documento. |
| API Riesgo / Seguro | Servicio externo para estudio de crédito o contratación de seguro de arrendamiento. Adaptador intercambiable. |
| Pasarela de Pagos | Procesador de pagos con soporte PSE y tarjeta crédito/débito en Colombia. Notifica via webhooks. |
| Proveedor Firma Electrónica | Servicio con validez legal bajo Ley 527 de 1999. Genera y almacena contratos firmados digitalmente. |
| Servidor de Email | Canal inicial de notificaciones (nuevas solicitudes, pagos, aprobaciones de riesgo). |

---

## 2. Diagrama de base de datos

```mermaid
erDiagram
    USUARIO {
        uuid id PK
        string email UK
        string password_hash
        string nombre
        string apellido
        string telefono
        string rol "propietario | agente | inquilino"
        boolean activo
        timestamp creado_en
        timestamp actualizado_en
    }

    RELACION_AGENTE_PROPIETARIO {
        uuid id PK
        uuid agente_id FK
        uuid propietario_id FK
        string estado "pendiente | activa | revocada"
        string codigo_invitacion UK
        timestamp creado_en
        timestamp aceptado_en
    }

    INMUEBLE {
        uuid id PK
        uuid propietario_id FK
        uuid agente_id FK "nullable"
        string direccion
        string barrio
        string ciudad
        string tipo "apartamento | casa | habitacion | otro"
        decimal area_m2
        int habitaciones
        int banos
        decimal valor_mensual
        string descripcion
        string estado "disponible | no_disponible | oculto"
        timestamp creado_en
        timestamp actualizado_en
    }

    FOTO_INMUEBLE {
        uuid id PK
        uuid inmueble_id FK
        string url_storage
        string storage_key
        int orden
        boolean es_principal
        timestamp creado_en
    }

    VALIDACION_IDENTIDAD {
        uuid id PK
        uuid usuario_id FK, UK
        string numero_cedula
        string estado "pendiente | aprobado | rechazado"
        string proveedor_respuesta "JSON del proveedor"
        string doc_frente_key "storage key"
        string doc_dorso_key "storage key"
        timestamp creado_en
        timestamp resuelto_en
    }

    SOLICITUD_ARRENDAMIENTO {
        uuid id PK
        uuid inquilino_id FK
        uuid inmueble_id FK
        string estado "borrador | enviada | en_revision | aprobada | rechazada | cancelada"
        timestamp creado_en
        timestamp actualizado_en
    }

    DOCUMENTO_SOLICITUD {
        uuid id PK
        uuid solicitud_id FK
        string tipo "desprendible | certificado_laboral | otro"
        string storage_key
        string nombre_archivo
        timestamp subido_en
    }

    ANALISIS_RIESGO {
        uuid id PK
        uuid solicitud_id FK, UK
        string tipo "credito | seguro"
        string estado "pendiente | aprobado | rechazado"
        string proveedor_respuesta "JSON del proveedor"
        timestamp creado_en
        timestamp resuelto_en
    }

    CONTRATO {
        uuid id PK
        uuid solicitud_id FK, UK
        string estado "borrador | pendiente_firma_inquilino | pendiente_firma_propietario | firmado | cancelado"
        string storage_key "contrato firmado PDF"
        string ref_proveedor_firma "ID externo del proveedor"
        decimal valor_mensual_acordado
        date fecha_inicio
        date fecha_fin
        timestamp creado_en
        timestamp firmado_en
    }

    ARRENDAMIENTO_ACTIVO {
        uuid id PK
        uuid contrato_id FK, UK
        uuid inquilino_id FK
        uuid inmueble_id FK
        date fecha_inicio
        date fecha_fin
        int dia_cobro "día del mes para cobro"
        boolean activo
        timestamp creado_en
    }

    PAGO {
        uuid id PK
        uuid arrendamiento_id FK
        decimal monto
        date periodo_mes "primer día del mes que cubre"
        date fecha_limite
        string estado "pendiente | procesando | completado | fallido | reembolsado"
        string metodo "pse | tarjeta"
        string ref_transaccion_pasarela UK
        string comprobante_storage_key "nullable"
        timestamp creado_en
        timestamp pagado_en
    }

    USUARIO ||--o{ RELACION_AGENTE_PROPIETARIO : "agente en"
    USUARIO ||--o{ RELACION_AGENTE_PROPIETARIO : "propietario en"
    USUARIO ||--o{ INMUEBLE : "propietario de"
    USUARIO ||--o{ INMUEBLE : "agente de"
    USUARIO ||--|| VALIDACION_IDENTIDAD : "tiene"
    USUARIO ||--o{ SOLICITUD_ARRENDAMIENTO : "inquilino en"

    INMUEBLE ||--o{ FOTO_INMUEBLE : "tiene"
    INMUEBLE ||--o{ SOLICITUD_ARRENDAMIENTO : "objeto de"
    INMUEBLE ||--o{ ARRENDAMIENTO_ACTIVO : "arrendado como"

    SOLICITUD_ARRENDAMIENTO ||--o{ DOCUMENTO_SOLICITUD : "adjunta"
    SOLICITUD_ARRENDAMIENTO ||--o| ANALISIS_RIESGO : "tiene"
    SOLICITUD_ARRENDAMIENTO ||--o| CONTRATO : "genera"

    CONTRATO ||--o| ARRENDAMIENTO_ACTIVO : "activa"

    ARRENDAMIENTO_ACTIVO ||--o{ PAGO : "genera"
```

**Descripción del modelo de datos:**

El modelo central es `SOLICITUD_ARRENDAMIENTO`, que une al inquilino con el inmueble y progresa a través de estados hasta generar un `CONTRATO` y eventualmente un `ARRENDAMIENTO_ACTIVO`. La `VALIDACION_IDENTIDAD` es prerequisito del inquilino y se almacena por separado del proceso de solicitud. Los `PAGO`s son generados por el arrendamiento activo mes a mes.

---

## 3. Diagramas de secuencia

### 3a. Publicación de inmueble

```mermaid
sequenceDiagram
    actor PRP as Propietario
    participant FE as Frontend React
    participant API as API Layer (FastAPI)
    participant UC as PublicarInmuebleUseCase
    participant REPO as InmuebleRepository
    participant S3A as StorageAdapter
    participant PG as PostgreSQL
    participant S3 as Object Storage

    PRP->>FE: Completa formulario con datos e imágenes
    FE->>FE: Valida formulario localmente (campos requeridos)
    FE->>API: POST /inmuebles/\n{ datos del inmueble }
    API->>API: Valida token JWT → extrae propietario_id
    API->>API: Valida esquema Pydantic (InmuebleCreateRequest)
    API->>UC: publicar_inmueble(cmd: PublicarInmuebleCommand)

    UC->>UC: Crea entidad Inmueble con estado=DISPONIBLE
    UC->>UC: Valida reglas de dominio (valor > 0, habitaciones > 0)
    UC->>REPO: guardar(inmueble)
    REPO->>PG: INSERT INTO inmueble ...
    PG-->>REPO: inmueble_id generado

    loop Por cada foto
        UC->>S3A: subir_foto(inmueble_id, bytes, orden)
        S3A->>S3: PUT object → storage_key
        S3-->>S3A: confirmación
        S3A->>REPO: registrar_foto(inmueble_id, storage_key, orden)
        REPO->>PG: INSERT INTO foto_inmueble ...
    end

    UC-->>API: InmuebleCreado(id, estado, fotos)
    API-->>FE: 201 Created { id, estado: "disponible", ... }
    FE-->>PRP: Inmueble publicado — muestra detalle

    Note over PRP, PG: Variante Agente: idéntico flujo pero\nel JWT identifica rol=agente,\nel UC valida relación agente-propietario\nantes de crear el inmueble con ambos IDs.
```

### 3b. Búsqueda de inmuebles disponibles

```mermaid
sequenceDiagram
    actor INQ as Inquilino (sin sesión)
    participant FE as Frontend React
    participant API as API Layer (FastAPI)
    participant UC as BuscarInmueblesUseCase
    participant REPO as InmuebleRepository
    participant PG as PostgreSQL
    participant S3 as Object Storage

    INQ->>FE: Ingresa filtros (ciudad, barrio, precio máx, habitaciones, tipo)
    FE->>API: GET /inmuebles?ciudad=Medellin&precio_max=2000000&habitaciones=2
    Note over API: Endpoint público — no requiere JWT
    API->>API: Valida y parsea query params (FiltrosInmuebleQuery)
    API->>UC: buscar(filtros: FiltrosInmueble)

    UC->>REPO: buscar_disponibles(filtros)
    REPO->>PG: SELECT inmueble + foto_principal\nWHERE estado='disponible'\nAND ciudad = ?\nAND valor_mensual <= ?\nAND habitaciones >= ?
    PG-->>REPO: Lista de inmuebles con foto principal
    REPO-->>UC: List[InmuebleResumen]
    UC-->>API: List[InmuebleResumen]
    API-->>FE: 200 OK [ { id, direccion_general, valor, habitaciones, foto_url, ... } ]
    FE-->>INQ: Muestra listado con foto, precio y datos generales

    INQ->>FE: Hace clic en un inmueble
    FE->>API: GET /inmuebles/{id}
    Note over API: Endpoint público — no requiere JWT
    API->>UC: obtener_detalle(inmueble_id)
    UC->>REPO: obtener_por_id(id)
    REPO->>PG: SELECT inmueble + todas las fotos
    PG-->>REPO: Inmueble completo
    REPO-->>UC: InmuebleDetalle
    UC-->>API: InmuebleDetalle
    API-->>FE: 200 OK { todas las fotos, descripcion, area, baños, barrio, ... }
    FE-->>INQ: Muestra detalle completo

    INQ->>FE: Hace clic en "Solicitar arrendamiento"
    FE->>FE: Detecta que no hay sesión activa
    FE-->>INQ: Redirige a /registro o /login\n(solicitud se retoma tras autenticación)
```

### 3c. Validación de identidad del inquilino

```mermaid
sequenceDiagram
    actor INQ as Inquilino
    participant FE as Frontend React
    participant API as API Layer (FastAPI)
    participant UC as ValidarIdentidadUseCase
    participant REPO as ValidacionRepository
    participant S3A as StorageAdapter
    participant IDPORT as IdentityVerificationPort
    participant IDEXT as API Externa de Identidad
    participant PG as PostgreSQL
    participant S3 as Object Storage

    INQ->>FE: Inicia validación de identidad\n(desde perfil o flujo de solicitud)
    FE->>FE: Verifica que no exista validación previa aprobada
    FE->>INQ: Muestra formulario: número cédula + foto frente + foto dorso

    INQ->>FE: Ingresa cédula y adjunta imágenes
    FE->>API: POST /identidad/validar\n{ numero_cedula, img_frente, img_dorso }
    API->>API: Valida JWT → usuario_id, rol=inquilino
    API->>API: Valida esquema Pydantic

    API->>UC: validar_identidad(cmd: ValidarIdentidadCommand)
    UC->>REPO: existe_validacion_aprobada(usuario_id)
    REPO->>PG: SELECT estado FROM validacion_identidad WHERE usuario_id = ?
    PG-->>REPO: null (no existe previa)

    UC->>S3A: subir_documento(usuario_id, img_frente, "frente")
    S3A->>S3: PUT object
    S3-->>S3A: frente_key

    UC->>S3A: subir_documento(usuario_id, img_dorso, "dorso")
    S3A->>S3: PUT object
    S3-->>S3A: dorso_key

    UC->>REPO: crear_validacion_pendiente(usuario_id, cedula, frente_key, dorso_key)
    REPO->>PG: INSERT INTO validacion_identidad estado='pendiente'
    PG-->>REPO: validacion_id

    UC->>IDPORT: verificar(numero_cedula, img_frente_bytes, img_dorso_bytes)
    IDPORT->>IDEXT: POST /verificar { cedula, img_frente, img_dorso }
    IDEXT-->>IDPORT: { resultado: "aprobado" | "rechazado", detalle: {...} }

    alt Identidad aprobada
        IDPORT-->>UC: VerificacionAprobada(detalle)
        UC->>REPO: actualizar_estado(validacion_id, APROBADO, respuesta_proveedor)
        REPO->>PG: UPDATE validacion_identidad SET estado='aprobado'
        UC-->>API: ValidacionAprobada
        API-->>FE: 200 OK { estado: "aprobado" }
        FE-->>INQ: "Identidad verificada correctamente"
    else Identidad rechazada
        IDPORT-->>UC: VerificacionRechazada(detalle)
        UC->>REPO: actualizar_estado(validacion_id, RECHAZADO, respuesta_proveedor)
        REPO->>PG: UPDATE validacion_identidad SET estado='rechazado'
        UC-->>API: ValidacionRechazada
        API-->>FE: 200 OK { estado: "rechazado", motivo: "..." }
        FE-->>INQ: "No pudimos verificar tu identidad — revisá los documentos"
    end
```

### 3d. Análisis de riesgo/seguro + firma de contrato

```mermaid
sequenceDiagram
    actor INQ as Inquilino
    actor PRP as Propietario
    participant FE as Frontend React
    participant API as API Layer (FastAPI)
    participant UC_RIESGO as AnalizarRiesgoUseCase
    participant UC_CONTRATO as GenerarContratoUseCase
    participant REPO_SOL as SolicitudRepository
    participant REPO_RIESGO as RiesgoRepository
    participant REPO_CONT as ContratoRepository
    participant S3A as StorageAdapter
    participant RPORT as RiskAssessmentPort
    participant REXT as API Externa Riesgo/Seguro
    participant SIGPORT as ElectronicSignaturePort
    participant SIGEXT as Proveedor Firma Electrónica
    participant EMAIL as EmailAdapter
    participant PG as PostgreSQL
    participant S3 as Object Storage

    INQ->>FE: Adjunta documentación\n(desprendibles, cert. laboral)
    FE->>API: POST /solicitudes/{id}/documentos\n{ archivos }
    API->>API: Valida JWT → inquilino_id, valida identidad aprobada
    API->>UC_RIESGO: adjuntar_y_analizar(cmd)

    UC_RIESGO->>REPO_SOL: obtener_solicitud(id)
    REPO_SOL->>PG: SELECT solicitud WHERE id=? AND estado != rechazada
    PG-->>REPO_SOL: SolicitudArrendamiento

    loop Por cada documento
        UC_RIESGO->>S3A: subir_documento(solicitud_id, archivo)
        S3A->>S3: PUT object
        S3-->>S3A: storage_key
        UC_RIESGO->>REPO_SOL: registrar_documento(solicitud_id, tipo, key)
        REPO_SOL->>PG: INSERT INTO documento_solicitud
    end

    UC_RIESGO->>REPO_RIESGO: crear_analisis_pendiente(solicitud_id)
    REPO_RIESGO->>PG: INSERT INTO analisis_riesgo estado='pendiente'

    UC_RIESGO->>RPORT: analizar(datos_inquilino, documentos)
    RPORT->>REXT: POST /analizar { cedula, documentos }
    REXT-->>RPORT: { resultado: "aprobado" | "rechazado", score: ... }

    alt Riesgo aprobado
        RPORT-->>UC_RIESGO: RiesgoAprobado(detalle)
        UC_RIESGO->>REPO_RIESGO: actualizar_estado(APROBADO, respuesta)
        REPO_RIESGO->>PG: UPDATE analisis_riesgo SET estado='aprobado'
        UC_RIESGO->>REPO_SOL: actualizar_estado(solicitud, EN_REVISION)
        UC_RIESGO->>EMAIL: notificar_propietario(solicitud_id, "nueva solicitud aprobada en riesgo")

        Note over UC_CONTRATO: El propietario revisa la solicitud y la aprueba

        PRP->>FE: Aprueba la solicitud
        FE->>API: POST /solicitudes/{id}/aprobar
        API->>UC_CONTRATO: aprobar_y_generar_contrato(solicitud_id, propietario_id)
        UC_CONTRATO->>REPO_SOL: verificar_propietario_y_estado(solicitud_id)
        UC_CONTRATO->>SIGPORT: generar_contrato(datos_inmueble, datos_inquilino, datos_propietario)
        SIGPORT->>SIGEXT: POST /contratos { partes, inmueble, condiciones }
        SIGEXT-->>SIGPORT: { contrato_id_externo, url_firma_inquilino, url_firma_propietario }
        UC_CONTRATO->>REPO_CONT: crear_contrato(solicitud_id, ref_proveedor, estado=pendiente_firma_inquilino)
        REPO_CONT->>PG: INSERT INTO contrato
        UC_CONTRATO->>EMAIL: notificar_inquilino(url_firma_inquilino)

        INQ->>SIGEXT: Firma electrónica desde link en email
        PRP->>SIGEXT: Firma electrónica desde link en email
        SIGEXT->>API: Webhook POST /contratos/webhook { evento: "firmado", contrato_id, pdf_url }
        API->>UC_CONTRATO: procesar_firma_completada(contrato_id_externo, pdf_url)
        UC_CONTRATO->>S3A: descargar_y_almacenar_pdf(pdf_url)
        S3A->>S3: PUT contrato_firmado.pdf
        UC_CONTRATO->>REPO_CONT: marcar_firmado(contrato_id, storage_key)
        REPO_CONT->>PG: UPDATE contrato SET estado='firmado'
        UC_CONTRATO->>REPO_SOL: crear_arrendamiento_activo(contrato)
        UC_CONTRATO->>EMAIL: notificar_ambas_partes("Contrato firmado — arrendamiento activo")
    else Riesgo rechazado
        UC_RIESGO->>REPO_RIESGO: actualizar_estado(RECHAZADO, respuesta)
        UC_RIESGO->>REPO_SOL: actualizar_estado(solicitud, RECHAZADA)
        UC_RIESGO->>EMAIL: notificar_inquilino("Análisis de riesgo no aprobado")
        UC_RIESGO-->>API: RiesgoRechazado
        API-->>FE: 200 OK { estado: "rechazado" }
    end
```

### 3e. Pago mensual de renta

```mermaid
sequenceDiagram
    actor INQ as Inquilino
    actor PRP as Propietario
    participant FE as Frontend React
    participant API as API Layer (FastAPI)
    participant UC_PAGO as ProcesarPagoUseCase
    participant REPO_ARR as ArrendamientoRepository
    participant REPO_PAGO as PagoRepository
    participant PGPORT as PaymentGatewayPort
    participant PGEXT as Pasarela de Pagos
    participant S3A as StorageAdapter
    participant EMAIL as EmailAdapter
    participant PG as PostgreSQL
    participant S3 as Object Storage

    INQ->>FE: Accede al panel de pagos
    FE->>API: GET /arrendamientos/activo/pagos
    API->>API: Valida JWT → inquilino_id
    API->>UC_PAGO: obtener_panel_pagos(inquilino_id)
    UC_PAGO->>REPO_ARR: obtener_arrendamiento_activo(inquilino_id)
    REPO_ARR->>PG: SELECT arrendamiento + pagos recientes
    PG-->>REPO_ARR: Arrendamiento + historial de pagos
    UC_PAGO-->>API: PanelPagos(monto, fecha_limite, historial)
    API-->>FE: 200 OK { monto, fecha_limite, pagos: [...] }
    FE-->>INQ: Muestra panel: monto, fecha y botón "Pagar"

    INQ->>FE: Selecciona método (PSE o Tarjeta) y confirma pago
    FE->>API: POST /pagos/iniciar\n{ arrendamiento_id, metodo: "pse" | "tarjeta" }
    API->>API: Valida JWT → inquilino_id, valida arrendamiento activo pertenece al inquilino
    API->>UC_PAGO: iniciar_pago(cmd: IniciarPagoCommand)

    UC_PAGO->>REPO_ARR: obtener_arrendamiento_activo(arrendamiento_id)
    REPO_ARR->>PG: SELECT + validar contrato firmado y activo
    PG-->>REPO_ARR: Arrendamiento válido

    UC_PAGO->>REPO_PAGO: crear_pago_pendiente(arrendamiento_id, monto, periodo)
    REPO_PAGO->>PG: INSERT INTO pago estado='pendiente'
    PG-->>REPO_PAGO: pago_id

    UC_PAGO->>PGPORT: crear_sesion_pago(monto, pago_id, metodo, urls_retorno)
    PGPORT->>PGEXT: POST /sesiones { monto, referencia: pago_id, metodo }
    PGEXT-->>PGPORT: { sesion_id, url_redireccion }
    UC_PAGO->>REPO_PAGO: actualizar_ref_pasarela(pago_id, sesion_id)
    REPO_PAGO->>PG: UPDATE pago SET ref_transaccion_pasarela=?, estado='procesando'
    UC_PAGO-->>API: SesionPagoCreada(url_redireccion)
    API-->>FE: 200 OK { url_redireccion }
    FE-->>INQ: Redirige al flujo de pago de la pasarela

    INQ->>PGEXT: Completa el pago en la pasarela (PSE/tarjeta)

    alt Pago exitoso
        PGEXT->>API: Webhook POST /pagos/webhook\n{ evento: "pago_completado", sesion_id, ref_transaccion }
        API->>UC_PAGO: confirmar_pago(sesion_id, ref_transaccion)
        UC_PAGO->>REPO_PAGO: obtener_por_ref(sesion_id)
        REPO_PAGO->>PG: SELECT pago WHERE ref_transaccion_pasarela=?
        UC_PAGO->>REPO_PAGO: marcar_completado(pago_id, ref_transaccion)
        REPO_PAGO->>PG: UPDATE pago SET estado='completado', pagado_en=NOW()
        UC_PAGO->>S3A: generar_y_guardar_comprobante(pago_id)
        S3A->>S3: PUT comprobante_{pago_id}.pdf
        UC_PAGO->>REPO_PAGO: registrar_comprobante(pago_id, storage_key)
        UC_PAGO->>EMAIL: notificar_pago_recibido(propietario, inquilino, monto, periodo)
        API-->>PGEXT: 200 OK (ACK webhook)
        FE-->>INQ: "Pago realizado — comprobante disponible"
    else Pago fallido
        PGEXT->>API: Webhook POST /pagos/webhook\n{ evento: "pago_fallido", sesion_id, motivo }
        API->>UC_PAGO: registrar_fallo(sesion_id, motivo)
        UC_PAGO->>REPO_PAGO: marcar_fallido(pago_id, motivo)
        REPO_PAGO->>PG: UPDATE pago SET estado='fallido'
        UC_PAGO->>EMAIL: notificar_fallo_pago(inquilino, motivo, url_reintentar)
        API-->>PGEXT: 200 OK (ACK webhook)
        FE-->>INQ: "El pago falló — podés reintentarlo desde tu panel"
    end
```

---

## 4. Estructura de carpetas — Backend (FastAPI)

```
backend/
├── main.py                          # Punto de entrada FastAPI; registra routers; configura middleware
├── requirements.txt
├── pyproject.toml
├── alembic/                         # Migraciones de base de datos
│   ├── env.py
│   └── versions/
│       └── 0001_initial_schema.py
│
├── shared/                          # Código transversal a todos los dominios
│   ├── domain/
│   │   ├── value_objects.py         # UUID tipado, Email, Dinero, etc.
│   │   └── exceptions.py            # DomainException base y subclases
│   ├── application/
│   │   └── base_use_case.py         # Clase base / protocolo de caso de uso
│   └── infrastructure/
│       ├── database.py              # Engine SQLAlchemy, SessionFactory
│       ├── settings.py              # Pydantic Settings (env vars)
│       ├── auth/
│       │   ├── jwt_handler.py       # Generación y validación de JWT
│       │   └── dependencies.py      # Dependencias FastAPI: get_current_user, require_rol
│       └── email/
│           └── smtp_adapter.py      # Implementación EmailPort vía SMTP/SaaS
│
├── usuarios/
│   ├── domain/
│   │   ├── usuario.py               # Entidad Usuario, Rol enum
│   │   ├── ports.py                 # UsuarioRepositoryPort (interface)
│   │   └── exceptions.py            # UsuarioNoEncontrado, EmailDuplicado
│   ├── application/
│   │   ├── registrar_usuario.py     # Caso de uso: registro con hash de password
│   │   ├── autenticar_usuario.py    # Caso de uso: login → JWT + refresh token
│   │   └── vincular_agente.py       # Caso de uso: crear/aceptar RelacionAgentePropietario
│   └── infrastructure/
│       ├── api/
│       │   ├── router.py            # POST /auth/registro, POST /auth/login, POST /agentes/vincular
│       │   └── schemas.py           # RegistroRequest, LoginRequest, TokenResponse (Pydantic)
│       └── persistence/
│           ├── models.py            # UsuarioORM, RelacionAgenteORM (SQLAlchemy)
│           └── repository.py        # UsuarioRepositoryPostgres implementa UsuarioRepositoryPort
│
├── inmuebles/
│   ├── domain/
│   │   ├── inmueble.py              # Entidad Inmueble, TipoInmueble enum, EstadoInmueble enum
│   │   ├── foto.py                  # ValueObject FotoInmueble
│   │   ├── ports.py                 # InmuebleRepositoryPort, StoragePort
│   │   └── exceptions.py            # InmuebleNoEncontrado, PropietarioInvalido
│   ├── application/
│   │   ├── publicar_inmueble.py     # UC: crea inmueble + sube fotos a storage
│   │   ├── buscar_inmuebles.py      # UC: búsqueda con filtros, solo estado=DISPONIBLE
│   │   ├── obtener_detalle.py       # UC: detalle público de un inmueble
│   │   ├── editar_inmueble.py       # UC: actualizar datos o fotos
│   │   └── cambiar_disponibilidad.py# UC: ocultar/publicar/marcar no disponible
│   └── infrastructure/
│       ├── api/
│       │   ├── router.py            # GET /inmuebles, GET /inmuebles/{id}, POST /inmuebles, PUT, PATCH
│       │   └── schemas.py           # InmuebleCreateRequest, InmuebleResponse, FiltrosQuery
│       ├── persistence/
│       │   ├── models.py            # InmuebleORM, FotoInmuebleORM
│       │   └── repository.py        # InmuebleRepositoryPostgres
│       └── external/
│           └── s3_storage_adapter.py# StoragePort → boto3 S3/MinIO con presigned URLs
│
├── identidad/
│   ├── domain/
│   │   ├── validacion_identidad.py  # Entidad ValidacionIdentidad, EstadoValidacion enum
│   │   ├── ports.py                 # ValidacionRepositoryPort, IdentityVerificationPort
│   │   └── exceptions.py            # IdentidadYaVerificada, ValidacionRechazada
│   ├── application/
│   │   └── validar_identidad.py     # UC: verifica idempotencia, sube docs, llama puerto externo
│   └── infrastructure/
│       ├── api/
│       │   ├── router.py            # POST /identidad/validar, GET /identidad/estado
│       │   └── schemas.py           # ValidarIdentidadRequest, ValidacionResponse
│       ├── persistence/
│       │   ├── models.py            # ValidacionIdentidadORM
│       │   └── repository.py        # ValidacionRepositoryPostgres
│       └── external/
│           └── proveedor_identidad_adapter.py # IdentityVerificationPort → HTTP proveedor CO
│
├── arrendamiento/
│   ├── domain/
│   │   ├── solicitud.py             # Entidad SolicitudArrendamiento, EstadoSolicitud enum
│   │   ├── contrato.py              # Entidad Contrato, EstadoContrato enum
│   │   ├── arrendamiento_activo.py  # Entidad ArrendamientoActivo
│   │   ├── ports.py                 # SolicitudRepositoryPort, ContratoRepositoryPort,
│   │   │                            # ElectronicSignaturePort, ArrendamientoRepositoryPort
│   │   └── exceptions.py            # SolicitudNoValida, IdentidadNoVerificada, ContratoNoFirmado
│   ├── application/
│   │   ├── crear_solicitud.py       # UC: inquilino inicia solicitud sobre un inmueble disponible
│   │   ├── adjuntar_documentos.py   # UC: sube docs + dispara análisis de riesgo (orquesta riesgo/)
│   │   ├── aprobar_solicitud.py     # UC: propietario aprueba → genera contrato
│   │   ├── rechazar_solicitud.py    # UC: propietario rechaza solicitud
│   │   ├── generar_contrato.py      # UC: llama ElectronicSignaturePort, persiste contrato
│   │   └── procesar_firma_webhook.py# UC: webhook de firma → marca firmado → crea ArrendamientoActivo
│   └── infrastructure/
│       ├── api/
│       │   ├── router.py            # POST /solicitudes, POST /solicitudes/{id}/documentos,
│       │   │                        # POST /solicitudes/{id}/aprobar, POST /contratos/webhook
│       │   └── schemas.py           # SolicitudCreateRequest, DocumentoUpload, ContratoResponse
│       ├── persistence/
│       │   ├── models.py            # SolicitudORM, DocumentoORM, ContratoORM, ArrendamientoORM
│       │   └── repository.py        # Repositorios Postgres para cada entidad
│       └── external/
│           └── firma_electronica_adapter.py # ElectronicSignaturePort → HTTP proveedor firma
│
├── riesgo/
│   ├── domain/
│   │   ├── analisis_riesgo.py       # Entidad AnalisisRiesgo, TipoAnalisis enum, EstadoAnalisis enum
│   │   ├── ports.py                 # RiesgoRepositoryPort, RiskAssessmentPort
│   │   └── exceptions.py            # AnalisisYaExiste, ProveedorRiesgoError
│   ├── application/
│   │   └── analizar_riesgo.py       # UC: llama RiskAssessmentPort, persiste resultado
│   └── infrastructure/
│       ├── persistence/
│       │   ├── models.py            # AnalisisRiesgoORM
│       │   └── repository.py        # RiesgoRepositoryPostgres
│       └── external/
│           ├── credito_adapter.py   # RiskAssessmentPort → API de estudio de crédito
│           └── seguro_adapter.py    # RiskAssessmentPort → API de seguro de arrendamiento
│
└── pagos/
    ├── domain/
    │   ├── pago.py                  # Entidad Pago, EstadoPago enum, MetodoPago enum
    │   ├── ports.py                 # PagoRepositoryPort, PaymentGatewayPort
    │   └── exceptions.py            # PagoNoEncontrado, ArrendamientoNoActivo, PagoYaCompletado
    ├── application/
    │   ├── iniciar_pago.py          # UC: valida arrendamiento activo, crea sesión en pasarela
    │   ├── confirmar_pago.py        # UC: procesa webhook exitoso → marca completado + comprobante
    │   ├── registrar_fallo.py       # UC: procesa webhook fallido → notifica inquilino
    │   └── obtener_historial.py     # UC: devuelve historial de pagos del arrendamiento
    └── infrastructure/
        ├── api/
        │   ├── router.py            # POST /pagos/iniciar, POST /pagos/webhook,
        │   │                        # GET /arrendamientos/activo/pagos
        │   └── schemas.py           # IniciarPagoRequest, WebhookPagoEvent, PagoResponse
        ├── persistence/
        │   ├── models.py            # PagoORM
        │   └── repository.py        # PagoRepositoryPostgres
        └── external/
            └── pasarela_pagos_adapter.py # PaymentGatewayPort → HTTP pasarela colombiana
```

---

## 5. Estructura de carpetas — Frontend (React)

```
frontend/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
│
├── src/
│   ├── main.tsx                     # Punto de entrada: monta App con providers
│   │
│   ├── app/                         # Configuración global de la aplicación
│   │   ├── App.tsx                  # Árbol de rutas principal (React Router v6)
│   │   ├── routes.tsx               # Definición de rutas y guards de autenticación
│   │   ├── providers.tsx            # QueryClientProvider, AuthProvider, ToastProvider
│   │   └── layouts/
│   │       ├── PublicLayout.tsx     # Layout para rutas sin sesión (navbar mínimo)
│   │       └── PrivateLayout.tsx    # Layout con nav completo y sidebar según rol
│   │
│   ├── shared/                      # Código transversal a todas las features
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Badge.tsx            # Para estados (Disponible, Verificado, etc.)
│   │   │   ├── FileUpload.tsx       # Input de archivos con preview
│   │   │   ├── Spinner.tsx
│   │   │   └── EmptyState.tsx
│   │   ├── api/
│   │   │   ├── axios.ts             # Instancia Axios con interceptores JWT
│   │   │   └── api-error.ts         # Manejo centralizado de errores de API
│   │   ├── hooks/
│   │   │   ├── useToast.ts
│   │   │   └── useDebounce.ts
│   │   └── utils/
│   │       ├── currency.ts          # Formateo COP ($ 2.000.000)
│   │       └── date.ts              # Formateo de fechas en español
│   │
│   ├── auth/                        # Feature: autenticación y sesión
│   │   ├── ui/
│   │   │   ├── LoginPage.tsx        # Formulario login con manejo de errores
│   │   │   ├── RegisterPage.tsx     # Registro con selector de rol
│   │   │   └── AuthGuard.tsx        # HOC/wrapper que redirige si no hay sesión
│   │   ├── model/
│   │   │   ├── auth.types.ts        # Usuario, Token, Rol, AuthState
│   │   │   └── auth.store.ts        # Zustand store: user, token, login(), logout()
│   │   └── api/
│   │       └── auth.api.ts          # login(), register(), refreshToken()
│   │
│   ├── inmuebles/                   # Feature: publicación y búsqueda de inmuebles
│   │   ├── ui/
│   │   │   ├── BusquedaPage.tsx     # Página pública con filtros y listado
│   │   │   ├── DetalleInmueblePage.tsx # Detalle con galería y CTA "Solicitar"
│   │   │   ├── PublicarInmueblePage.tsx # Formulario de publicación (propietario/agente)
│   │   │   ├── MisInmueblesPage.tsx # Panel del propietario con listado y estados
│   │   │   ├── InmuebleCard.tsx     # Tarjeta de resultado en búsqueda
│   │   │   ├── FotoGaleria.tsx      # Galería de fotos del inmueble
│   │   │   └── FiltrosInmueble.tsx  # Panel de filtros lateral/top
│   │   ├── model/
│   │   │   └── inmueble.types.ts    # Inmueble, FiltrosInmueble, EstadoInmueble
│   │   └── api/
│   │       └── inmuebles.api.ts     # buscar(), obtenerDetalle(), publicar(), editar()
│   │
│   ├── identidad/                   # Feature: validación de identidad del inquilino
│   │   ├── ui/
│   │   │   ├── ValidarIdentidadPage.tsx # Flujo: formulario cédula + carga de fotos
│   │   │   ├── EstadoBadge.tsx      # Badge "Verificado" / "Pendiente" / "Rechazado"
│   │   │   └── IdentidadGuard.tsx   # HOC: bloquea avance si identidad no verificada
│   │   ├── model/
│   │   │   └── identidad.types.ts   # ValidacionIdentidad, EstadoValidacion
│   │   └── api/
│   │       └── identidad.api.ts     # validarIdentidad(), obtenerEstado()
│   │
│   ├── arrendamiento/               # Feature: solicitudes y contratos
│   │   ├── ui/
│   │   │   ├── IniciarSolicitudPage.tsx # Resumen del inmueble + confirmación
│   │   │   ├── AdjuntarDocumentosPage.tsx # Carga de desprendibles y certificados
│   │   │   ├── MisSolicitudesPage.tsx # Panel del inquilino con estado de solicitudes
│   │   │   ├── SolicitudesRecibidas.tsx # Panel del propietario/agente
│   │   │   ├── DetalleSolicitudPage.tsx # Vista completa con timeline de estado
│   │   │   └── FirmaContratoPage.tsx # Instrucciones y link a firma electrónica
│   │   ├── model/
│   │   │   └── arrendamiento.types.ts # Solicitud, Contrato, EstadoSolicitud, ArrendamientoActivo
│   │   └── api/
│   │       └── arrendamiento.api.ts # crearSolicitud(), adjuntarDocs(), aprobar(), rechazar()
│   │
│   ├── riesgo/                      # Feature: análisis de riesgo (estado del proceso)
│   │   ├── ui/
│   │   │   └── EstadoRiesgoBanner.tsx # Banner informativo dentro de DetalleSolicitud
│   │   ├── model/
│   │   │   └── riesgo.types.ts      # AnalisisRiesgo, EstadoAnalisis, TipoAnalisis
│   │   └── api/
│   │       └── riesgo.api.ts        # obtenerEstadoRiesgo(solicitudId)
│   │
│   └── pagos/                       # Feature: pagos mensuales
│       ├── ui/
│       │   ├── PanelPagosPage.tsx   # Monto, fecha límite y botón "Pagar"
│       │   ├── HistorialPagosPage.tsx # Tabla con historial y descarga de comprobantes
│       │   ├── IniciarPagoModal.tsx # Selección de método PSE/Tarjeta
│       │   └── ComprobanteLink.tsx  # Link de descarga del PDF
│       ├── model/
│       │   └── pago.types.ts        # Pago, EstadoPago, MetodoPago, PanelPagos
│       └── api/
│           └── pagos.api.ts         # iniciarPago(), obtenerHistorial(), descargarComprobante()
```

---

## 6. Decisiones clave

| Decisión | Opción elegida | Justificación |
|---|---|---|
| Puerto de riesgo abstracto (`RiskAssessmentPort`) | Interfaz única con adaptadores intercambiables (`credito_adapter`, `seguro_adapter`) | El PRD no fija el proveedor de riesgo. Desacoplar el dominio permite cambiar o combinar proveedores sin tocar la capa de aplicación. Es la decisión de mayor impacto técnico del proyecto. |
| Puerto de identidad abstracto (`IdentityVerificationPort`) | Interfaz única — proveedor concreto pendiente | Mismo principio: el dominio no debe conocer el proveedor de verificación de cédula colombiana. Cuando se seleccione el proveedor, solo se implementa un nuevo adaptador. |
| Puerto de pagos abstracto (`PaymentGatewayPort`) | Interfaz única — pasarela concreta pendiente | Aisla el dominio de pagos de la pasarela colombiana específica (Wompi, ePayco, PayU). El flujo de webhooks queda en infraestructura. |
| Puerto de firma electrónica (`ElectronicSignaturePort`) | Interfaz única — proveedor concreto pendiente (Certicámara, DocuSign CO, etc.) | Garantiza cumplimiento Ley 527/1999 sin acoplar el dominio a un proveedor específico. |
| Base de datos relacional | PostgreSQL | Modelo de datos con relaciones claras (solicitud → contrato → arrendamiento → pagos). ACID requerido para transacciones de pago. PostgreSQL tiene soporte nativo de UUID, JSONB para respuestas de proveedores, y row-level security útil a futuro. |
| Object storage | S3-compatible (MinIO local / AWS S3 producción) | Las fotos de inmuebles y documentos del inquilino no son datos relacionales. boto3 como cliente abstrae la diferencia entre MinIO y S3 real. El adaptador `s3_storage_adapter.py` implementa `StoragePort`. |
| Autenticación | JWT con refresh tokens | Stateless, compatible con SPA React. El refresh token permite sesiones largas sin re-login frecuente. Se almacena en cookie HttpOnly. |
| Plataforma objetivo | Web responsiva (no PWA nativa) | Cumple el requisito "web y mobile" del PRD con menor superficie de mantenimiento para un equipo unipersonal. |
| Canal de notificaciones | Email (canal inicial) | Cubre todos los eventos críticos del flujo. Push nativo requeriría Service Worker o app nativa — inviable para MVP unipersonal. El puerto de email permite agregar SMS/WhatsApp a futuro. |
| Slicing de código | Por dominio/feature (no por tipo técnico) | Mejora cohesión: todo lo relacionado a `pagos/` vive junto. Facilita crecimiento independiente de cada dominio. Reduce acoplamiento accidental entre features. |
| Frontend state management | Zustand (estado global) + React Query (estado servidor) | Zustand para auth y UI state; React Query para fetching, caching e invalidación. Evita Redux boilerplate innecesario para un proyecto de esta escala. |

---

## 7. Riesgos

1. **Disponibilidad de APIs externas colombianas**: Los proveedores de identidad, riesgo y pagos en Colombia tienen latencias y SLAs variables. Un timeout o fallo debe ser manejado con reintentos y estados intermedios (`pendiente`) para no bloquear el flujo del usuario.

2. **Firma electrónica bajo Ley 527/1999**: La validez legal depende del proveedor seleccionado y del tipo de firma (simple, avanzada o calificada). Si el proveedor elegido no satisface los requisitos legales en disputas judiciales, los contratos firmados podrían no tener validez plena.

3. **Webhooks de pasarela de pagos sin entrega garantizada**: Si el webhook llega duplicado o con retraso, el estado del pago puede quedar inconsistente. Mitigación: idempotencia basada en `ref_transaccion_pasarela` y reconciliación periódica consultando el estado en la pasarela.

4. **Equipo unipersonal**: La complejidad del sistema (5 integraciones externas, flujo multietapa) es alta para un solo desarrollador. El riesgo principal es el tiempo de implementación, especialmente en la integración y certificación de cada proveedor externo.

5. **Gestión de documentos sensibles**: Las fotos de cédulas y documentos financieros tienen requerimientos bajo Ley 1581/2012 (Habeas Data). El almacenamiento en S3 debe incluir cifrado en reposo y controles de acceso estrictos. El no cumplimiento genera riesgo legal.

6. **Consistencia entre estado del inmueble y solicitudes concurrentes**: Si dos inquilinos inician solicitudes simultáneas sobre el mismo inmueble, el sistema debe manejar la concurrencia correctamente para evitar arrendamientos dobles. Requiere locking a nivel de base de datos al momento de aprobación.

7. **Experiencia del inquilino en flujo multi-paso**: El flujo completo (registro → validación de identidad → solicitud → documentos → riesgo → firma → pago) es largo. Si el inquilino abandona a mitad de proceso, el sistema debe preservar el estado para reanudar sin repetir pasos ya completados.

---

## 8. Supuestos

1. **Puerto de riesgo intercambiable**: Se asume que existirá al menos un proveedor colombiano con API REST para estudio de crédito o seguro de arrendamiento. Si el proceso resulta ser manual o por email con el proveedor, el adaptador deberá emular el flujo síncrono con polling o proceso manual asistido.

2. **Identidad verificada una sola vez**: Se asume que la verificación de identidad del inquilino es válida indefinidamente en la plataforma. Si el proveedor requiere re-verificación periódica (por expiración de cédula u otros), el dominio deberá extenderse.

3. **Plataforma responsiva, no PWA nativa**: Se asume que los usuarios propietarios e inquilinos acceden predominantemente desde navegador (desktop y móvil). Si la demanda de app nativa surge, la API REST existente puede servir de base sin cambios en el backend.

4. **PostgreSQL como única base de datos**: Se asume que los volúmenes del MVP no requieren búsqueda full-text avanzada (Elasticsearch) ni caché distribuida (Redis). Si la búsqueda de inmuebles crece en complejidad (búsqueda geoespacial, texto libre), deberá evaluarse extensiones PostgreSQL (`pg_trgm`, `PostGIS`) antes de agregar nuevas tecnologías.

5. **Email como único canal de notificaciones**: Se asume que los usuarios consultarán el email para notificaciones críticas (solicitud aprobada, pago recibido). Si el engagement por email es bajo, deberá evaluarse WhatsApp Business API o SMS como canal complementario.

6. **Foco en Medellín para el MVP**: Se asume que las integraciones de identidad, riesgo y pagos son válidas para usuarios con cédula de ciudadanía colombiana y cuentas bancarias en Colombia. La expansión a otros países requeriría adaptadores adicionales en cada puerto.

7. **Un inmueble tiene un solo arrendamiento activo a la vez**: Se asume que los inmuebles son unidades habitacionales completas (no piezas en habitación compartida). El modelo de datos y el dominio no están diseñados para subarrendamiento o cohabitación estructurada.

8. **Los precios se expresan en COP (pesos colombianos)**: No se contempla manejo multimoneda en el MVP. El tipo de cambio y conversión quedan fuera del alcance.

---

## 9. Próximos pasos sugeridos

1. **Configurar la infraestructura base**: Repositorio, entorno local con Docker Compose (PostgreSQL + MinIO), estructura de carpetas del backend y scaffolding de Alembic para migraciones.

2. **Implementar el dominio de `usuarios`**: Registro, login, JWT y el mecanismo de vinculación agente-propietario. Es la base transversal que todos los demás dominios requieren.

3. **Implementar el dominio de `inmuebles`**: Publicación, edición, búsqueda pública y gestión de fotos con S3. Permite validar el flujo completo de adaptadores (API → UC → dominio → repositorio + storage) con un caso concreto.

4. **Implementar el dominio de `identidad`**: Crear el `IdentityVerificationPort` y un adaptador stub/mock para desarrollar el flujo completo antes de integrar el proveedor real.

5. **Implementar el dominio de `arrendamiento`**: Solicitudes, carga de documentos y el flujo de aprobación del propietario. El `ElectronicSignaturePort` puede quedar con adaptador mock inicialmente.

6. **Implementar el dominio de `riesgo`**: El `RiskAssessmentPort` con adaptador mock permite completar el flujo del inquilino. La integración real con el proveedor se enchufa sin tocar el caso de uso.

7. **Implementar el dominio de `pagos`**: Flujo de cobro mensual con `PaymentGatewayPort` y manejo de webhooks. Es el dominio de mayor criticidad operativa y debe tener las pruebas más robustas.

8. **Seleccionar e integrar proveedores externos**: Identidad, riesgo/seguro, pasarela de pagos y firma electrónica. Cada integración reemplaza un adaptador mock por uno real sin cambiar la capa de aplicación ni el dominio.

9. **Implementar el frontend**: Comenzar por `auth/` y `inmuebles/` para validar el flujo público end-to-end. Continuar con `identidad/`, `arrendamiento/`, `riesgo/` y `pagos/` en ese orden.

10. **Configurar CI/CD**: Tests unitarios de dominio y casos de uso (sin base de datos), tests de integración con base de datos de prueba, y deploy automatizado a entorno de staging.
