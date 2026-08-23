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

    subgraph Frontend["Frontend — Microfrontends (Rspack + Module Federation 2.0)"]
        SHELL["shell — host\nRouter global · Layout por rol · Auth context"]
        BUSQAPP["busqueda-app — remote público\nBúsqueda · Filtros · Detalle inmueble"]
        INMAPP["inmuebles-app — remote privado\nPublicación · Edición · Mis inmuebles · Vinculación agente"]
        IDENTAPP["identidad-app — remote privado\nValidación de identidad del inquilino"]
        ARRAPP["arrendamiento-app — remote privado\nSolicitudes · Documentos · Aprobación · Firma contrato"]
        PAGAPP["pagos-app — remote privado\nPanel de pagos · Historial · Comprobantes"]
        AUTHPKG["@rentame/auth\nSingleton compartido vía MF2\nuseAuth · AuthGuard · AuthProvider"]

        SHELL -->|lazy load en runtime| BUSQAPP
        SHELL -->|lazy load en runtime| INMAPP
        SHELL -->|lazy load en runtime| IDENTAPP
        SHELL -->|lazy load en runtime| ARRAPP
        SHELL -->|lazy load en runtime| PAGAPP
        SHELL -.->|singleton MF2, compartido con todos los remotes| AUTHPKG
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
        IDENTE[API Identidad\nVerificación cédula colombiana]
        RIESGO[API Riesgo / Seguro\nEstudio de crédito o seguro]
        PAGOSEXT[Pasarela de Pagos\nPSE · Tarjeta — mercado CO]
        FIRMA[Proveedor Firma Electrónica\nLey 527 de 1999]
        EMAIL[Servidor de Email\nSMTP / SaaS — notificaciones]
    end

    PRP -->|HTTPS| SHELL
    AGT -->|HTTPS| SHELL
    INQ -->|HTTPS| SHELL

    BUSQAPP -->|REST / HTTPS — sin JWT| API
    INMAPP -->|REST / HTTPS + JWT| API
    IDENTAPP -->|REST / HTTPS + JWT| API
    ARRAPP -->|REST / HTTPS + JWT| API
    PAGAPP -->|REST / HTTPS + JWT| API

    API --> UC
    UC --> DOM
    DOM -->|interfaces / puertos| INFRA

    INFRA -->|SQLAlchemy ORM| PG
    INFRA -->|"boto3 (proxy por backend)"| S3
    INFRA -->|REST / HTTPS| IDENTE
    INFRA -->|REST / HTTPS| RIESGO
    INFRA -->|REST / HTTPS + webhooks| PAGOSEXT
    INFRA -->|REST / HTTPS| FIRMA
    INFRA -->|SMTP / API| EMAIL

    PAGOSEXT -->|Webhook HTTPS| API
```

**Descripción de componentes:**

| Componente | Responsabilidad |
|---|---|
| shell (host) | Aplicación contenedora que carga los remotes en runtime. Define el router global entre microfrontends, el layout (navbar y sidebar según rol) y provee el contexto de `@rentame/auth` a toda la aplicación. No contiene lógica de dominio. |
| busqueda-app (remote) | Microfrontend público (sin sesión obligatoria): búsqueda de inmuebles con filtros, listado de resultados y detalle público de inmueble. Es la puerta de entrada de inquilinos sin registro. Puede acceder a la API sin JWT. |
| inmuebles-app (remote) | Microfrontend privado para propietarios y agentes: publicar inmueble, editar, cambiar disponibilidad, panel "mis inmuebles" con gestión de estados y flujo de vinculación agente-propietario. Requiere sesión. |
| identidad-app (remote) | Microfrontend privado para el inquilino: carga y validación de cédula (frente + dorso), estado de la verificación y bloqueo de flujos subsiguientes si la identidad no está aprobada. |
| arrendamiento-app (remote) | Microfrontend privado: inquilino inicia solicitud y adjunta documentos; propietario/agente revisa, aprueba o rechaza; ambas partes firman el contrato electrónico. |
| pagos-app (remote) | Microfrontend privado para el inquilino: panel de pago mensual (monto, fecha límite, método PSE/tarjeta), historial de pagos y descarga de comprobantes. |
| @rentame/auth | Paquete compartido expuesto como singleton vía Module Federation 2.0. Provee `AuthProvider`, `useAuth` (user, token, login, logout) y `AuthGuard`. Se declara `singleton: true` en todos los remotes para garantizar una única instancia de React context en runtime. |
| @rentame/design-tokens | Paquete workspace de solo TypeScript/CSS fuente (sin build step), consumido directamente por `shell` e `inmuebles-app` vía Rspack. Define la paleta de marca (Navy/Petrol Blue/Champagne Gold/Background/Surface/Text/Border/Success/Error/Warning), `--radius-card`/`--radius-sm`/`--radius-lg`, tipografía (`--font-family-base`/`--font-family-display`, escala Display/H1/H2/H3/Body/Small), spacing (`--space-1`..`--space-10`, escala de 4px), sombras (`--shadow-sm`/`--shadow-md`), transiciones (`--transition-base`), z-index (`--z-header`/`--z-modal`) y breakpoints (`--breakpoint-sm/md/lg`), con reglas de contraste WCAG documentadas y validadas por tests (`resuelto en design-system-premium-real-estate`). |
| @rentame/ui | Paquete workspace nuevo (`design-system-premium-real-estate`), mismo patrón sin build step que `@rentame/auth`/`@rentame/design-tokens` — TypeScript fuente resuelto por Rspack vía symlink de workspace. Provee los componentes React reales del sistema de diseño: `Button` (variantes `primary`/`secondary`/`ghost`/`danger`/`premium`, tamaños `sm`/`md`, estados `loading`/`disabled`), `Badge` (6 variantes: `verified`/`featured`/`new`/`available`/`unavailable`/`premium`), `Input`/`Select`/`Textarea` (estado `error`, `disabled`, foco con `--color-primary`) y `PropertyCard` (foto, dirección/ubicación, características, precio, badge de disponibilidad, slot `acciones` opcional, favorito oculto por defecto). Consumido por `shell` e `inmuebles-app` como `"@rentame/ui": "*"`. Reemplaza los antiguos `styles/buttons.ts` locales de ambos microfrontends. |
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
        uuid agencia_id FK "nullable — solo aplica a rol=agente"
        boolean activo
        timestamp creado_en
        timestamp actualizado_en
    }

    AGENCIA {
        uuid id PK
        string razon_social
        string nit UK
        timestamp creado_en
    }

    SOLICITUD_INGRESO_AGENCIA {
        uuid id PK
        uuid agencia_id FK
        uuid agente_id FK
        string estado "pendiente | aprobada"
        timestamp creado_en
        timestamp resuelto_en
    }

    RELACION_AGENCIA_PROPIETARIO {
        uuid id PK
        uuid agencia_id FK
        uuid propietario_id FK
        uuid agente_responsable_id FK "nullable — trazabilidad, no autoriza"
        string estado "pendiente | activa | revocada"
        timestamp creado_en
        timestamp activado_en
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

    AGENCIA ||--o{ USUARIO : "empleador de (rol=agente)"
    AGENCIA ||--o{ SOLICITUD_INGRESO_AGENCIA : "recibe"
    USUARIO ||--o{ SOLICITUD_INGRESO_AGENCIA : "solicita ingreso"
    AGENCIA ||--o{ RELACION_AGENCIA_PROPIETARIO : "representa a"
    USUARIO ||--o{ RELACION_AGENCIA_PROPIETARIO : "propietario en"
    USUARIO ||--o{ RELACION_AGENCIA_PROPIETARIO : "agente responsable de"
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
    participant FE as inmuebles-app
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
    participant FE as busqueda-app
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
    FE->>FE: Detecta que no hay sesión activa (consulta @rentame/auth)
    FE-->>INQ: Redirige al shell → /registro o /login\n(solicitud se retoma tras autenticación)
```

### 3c. Validación de identidad del inquilino

```mermaid
sequenceDiagram
    actor INQ as Inquilino
    participant FE as identidad-app
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
    participant FE as arrendamiento-app
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
    participant FE as pagos-app
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
├── usuarios/                          # HU-008 — registro real por rol + login (antes: stub mínimo de HU-001)
│   ├── domain/
│   │   ├── usuario.py                 # Entidad Usuario — Usuario.crear() hashea con bcrypt,
│   │   │                              # verificar_password(); password_hash nunca se serializa
│   │   ├── ports.py                   # UsuarioRepositoryPort (guardar, obtener_por_email, obtener_por_id)
│   │   └── exceptions.py              # EmailYaRegistrado, CredencialesInvalidas (misma excepción
│   │                                  # para email inexistente y contraseña incorrecta, decisión 5)
│   ├── application/
│   │   ├── registrar_usuario.py       # UC: hashea password, rechaza email duplicado, rol fijo
│   │   └── autenticar_usuario.py      # UC: valida credenciales, misma excepción en ambos rechazos
│   └── infrastructure/
│       ├── api/
│       │   ├── router.py              # POST /usuarios/registro, POST /usuarios/login — emiten JWT
│       │   │                          # reutilizando shared/infrastructure/auth/jwt_handler.py sin modificarlo
│       │   └── schemas.py             # RegistroRequest, LoginRequest, AuthResponse, UsuarioResponse
│       └── persistence/
│           ├── models.py              # UsuarioORM: password_hash y nombre (nullable, HU-008),
│           │                          # agencia_id (nullable, agregado por HU-007)
│           └── repository.py          # UsuarioRepositoryPostgres implementa UsuarioRepositoryPort
│
├── inmuebles/
│   ├── domain/
│   │   ├── inmueble.py              # Entidad Inmueble, TipoInmueble enum, EstadoInmueble enum
│   │   ├── foto.py                  # ValueObject FotoInmueble
│   │   ├── ports.py                 # InmuebleRepositoryPort, StoragePort
│   │   └── exceptions.py            # InmuebleNoEncontrado, PropietarioInvalido
│   ├── application/
│   │   ├── publicar_inmueble.py     # UC: crea inmueble + sube fotos a storage (acepta agente_id opcional, HU-002)
│   │   ├── listar_inmuebles_publicos.py # UC (HU-003): todos los inmuebles estado=DISPONIBLE, sin filtros
│   │   ├── obtener_inmueble_publico.py  # UC (HU-003): detalle de un inmueble; None si no existe o no
│   │   │                            # está DISPONIBLE (nunca revela oculto/no_disponible → 404 en el router)
│   │   ├── editar_inmueble.py       # UC: actualizar datos o fotos
│   │   ├── cambiar_disponibilidad.py# UC: ocultar/publicar/marcar no disponible
│   │   └── listar_inmuebles_gestionados.py # UC (HU-002): inmuebles de una lista de propietario_id
│   │                                # ya resuelta por la API (nunca importa `agencias`)
│   └── infrastructure/
│       ├── api/
│       │   ├── router.py            # GET /inmuebles/publicos, GET /inmuebles/publicos/{id} (HU-003,
│       │   │                        # sin autenticación — declarados antes de PUT/PATCH /{inmueble_id}
│       │   │                        # para que el path literal "publicos" no sea capturado por el
│       │   │                        # path param), POST /inmuebles, PUT /{id}, PATCH /{id}/disponibilidad,
│       │   │                        # GET /inmuebles/mios, GET /inmuebles/gestionados (HU-002) — este
│       │   │                        # router es el único lugar de `inmuebles` que consulta los
│       │   │                        # repositorios de `agencias` para resolver autorización de agente
│       │   │                        # (ver design.md de hu-002)
│       │   └── schemas.py           # InmuebleCreateRequest, InmuebleResponse (incluye agente_id),
│       │                            # InmueblePublicoListItemResponse, InmueblePublicoResponse (HU-003 —
│       │                            # schemas de respuesta separados de los privados, ver decisiones)
│       ├── persistence/
│       │   ├── models.py            # InmuebleORM, FotoInmuebleORM
│       │   └── repository.py        # InmuebleRepositoryPostgres — incluye listar_disponibles() (HU-003,
│       │                            # sin paginación en v1), obtener_por_id() reutilizado para el detalle
│       └── external/
│           └── s3_storage_adapter.py# StoragePort → boto3 S3/MinIO, proxy por backend — construir_url()
│                                    # usa storage_public_url si está configurado (ver decisiones, HU-003)
│
├── agencias/                         # HU-007 — fundacional para HU-002
│   ├── domain/
│   │   ├── agencia.py                # Entidad Agencia (razón social, NIT)
│   │   ├── relacion_agencia_propietario.py # Entidad + EstadoRelacion enum
│   │   ├── solicitud_ingreso.py      # Entidad SolicitudIngreso + EstadoSolicitudIngreso enum
│   │   ├── ports.py                  # AgenciaRepositoryPort, RelacionRepositoryPort,
│   │   │                             # SolicitudIngresoRepositoryPort, UsuarioAgenciaRepositoryPort
│   │   └── exceptions.py             # AgenteYaTieneAgencia, UltimoAgenteConRelacionesActivas,
│   │                                 # AgenteNoEsMiembroDeAgencia, PropietarioInvalido, etc.
│   ├── application/
│   │   ├── crear_agencia.py          # UC: agente crea agencia, queda como primer miembro
│   │   ├── solicitar_ingreso.py      # UC: agente sin agencia solicita unirse a una existente
│   │   ├── aprobar_ingreso.py        # UC: un miembro aprueba el ingreso
│   │   ├── salir_de_agencia.py       # UC: salida voluntaria; bloquea al último miembro con relaciones activas
│   │   ├── iniciar_relacion.py       # UC: propietario inicia relación con una agencia
│   │   ├── confirmar_relacion.py     # UC: agente confirma; auto-revoca relación activa previa + cascada
│   │   ├── revocar_relacion.py       # UC: propietario revoca; dispara cascada
│   │   ├── reasignar_responsable.py  # UC: reasigna el puntero de agente responsable (solo trazabilidad)
│   │   └── _cascada_despublicacion.py# Helper: invoca inmuebles.cambiar_disponibilidad(propietario_id=None)
│   │                                 # para los inmuebles de la agencia revocada — sin modificar `inmuebles`
│   └── infrastructure/
│       ├── api/
│       │   ├── router.py             # POST /agencias, /agencias/{id}/solicitudes, /relaciones,
│       │   │                         # GET /agencias/buscar?q=... (HU-008 — endpoint público, sin
│       │   │                         # JWT, búsqueda case-insensitive por razón social/NIT, usado por
│       │   │                         # el paso de agencia del registro de agente), etc.
│       │   └── schemas.py            # AgenciaResponse, SolicitudIngresoResponse, RelacionResponse,
│       │                             # AgenciaBuscarResponse (solo campos públicos, HU-008)
│       └── persistence/
│           ├── models.py             # AgenciaORM, SolicitudIngresoAgenciaORM, RelacionAgenciaPropietarioORM
│           └── repository.py         # Repositorios Postgres para cada puerto
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

## 5. Estructura de carpetas — Frontend (Microfrontends)

```
frontend/
├── shell/                              # Host: portal contenedor
│   ├── src/
│   │   ├── main.tsx                    # Punto de entrada; monta App con AuthProvider
│   │   ├── App.tsx                     # Router global (ui-layout-navegacion): TODAS las rutas
│   │   │                              # ("/", "/login", "/registro/*", "/publicar" y el árbol de
│   │   │                              # `/mis-inmuebles`) cuelgan de una única
│   │   │                              # `<Route element={<AppLayout/>}>`; `PrivateLayout` se anida
│   │   │                              # dentro de `AppLayout` solo para las rutas protegidas
│   │   ├── pages/
│   │   │   ├── BusquedaPublicaShellPage.tsx # HU-003, simplificado en ui-layout-navegacion: ya no
│   │   │   │                          # tiene header propio (vive en `AppLayout`) — solo el
│   │   │   │                          # `Suspense`+lazy-load de `inmueblesApp/BusquedaPublicaRoutes`
│   │   │   ├── EntradaPage.tsx         # HU-008: pantalla de entrada, 3 opciones simétricas por rol;
│   │   │   │                          # reubicada a "/publicar" por HU-003, sin cambios internos
│   │   │   ├── LoginPage.tsx           # HU-008: login email+contraseña; error único sin distinguir dato
│   │   │   ├── RegistroPage.tsx        # HU-008: formulario parametrizado por rol (prop `rol`); para
│   │   │   │                          # rol=agente encadena el paso de agencia (crear vs. buscar y unirse)
│   │   │   └── MisInmueblesPage.tsx    # Placeholder — remote inmuebles-app se monta aquí (task 16+)
│   │   ├── services/
│   │   │   ├── usuarios.api.ts         # registrar(), login() → POST /usuarios/registro, /usuarios/login
│   │   │   └── agencias.api.ts         # crearAgencia(), buscarAgencias(), solicitarUnirse() — subset
│   │   │                              # mínimo deliberadamente duplicado del agencias.api de
│   │   │                              # inmuebles-app (ver comentario en el archivo, HU-008)
│   │   ├── layouts/
│   │   │   ├── AppLayout.tsx           # design-system-premium-real-estate: layout único que envuelve
│   │   │   │                          # TODAS las rutas vía `<Outlet/>` — navbar Navy (`--color-primary`
│   │   │   │                          # de fondo) con menú consciente de sesión (`useAuth()`: sin
│   │   │   │                          # sesión → Inicio/Publicar mi inmueble/Iniciar sesión; con
│   │   │   │                          # sesión → Inicio/Mis inmuebles/Cerrar sesión); el link de la
│   │   │   │                          # ruta activa (`useLocation()`) se resalta con
│   │   │   │                          # `border-bottom: 2px solid var(--color-accent)` (acento dorado,
│   │   │   │                          # nunca fill sólido — regla de contraste de `design-tokens`),
│   │   │   │                          # `Button`/ícono `lucide-react` (logout) de `@rentame/ui`, y
│   │   │   │                          # footer de marca. Centraliza la lógica que antes vivía
│   │   │   │                          # duplicada en `BusquedaPublicaShellPage`
│   │   │   └── PrivateLayout.tsx       # `AuthGuard` con fallback a "/"; se anida DENTRO de
│   │   │                              # `AppLayout` solo para el árbol de rutas protegidas
│   │   │                              # (`/mis-inmuebles`) — no reemplaza a `AppLayout`, lo complementa
│   │   └── remotes.d.ts                # Declaraciones de tipos para módulos remotos
│   ├── rspack.config.ts                # MF2 host config: remotes[], shared (react, @rentame/auth);
│   │                                  # output.publicPath: '/' (absoluto, no 'auto' — ver sección 6)
│   ├── package.json
│   └── tsconfig.json
│
├── busqueda-app/                       # Remote planteado originalmente para la búsqueda pública.
│   │                                    # NO se implementó en HU-003 v1: el listado/detalle público
│   │                                    # se construyó dentro de `inmuebles-app` en su lugar (ver
│   │                                    # decisiones y el árbol de `inmuebles-app` más abajo). Esta
│   │                                    # sección queda como diseño de referencia para una eventual
│   │                                    # extracción futura si el tráfico público lo justifica.
│   ├── src/
│   │   ├── components/
│   │   │   ├── PropertyCard.tsx        # Tarjeta en listado: foto, precio, habitaciones
│   │   │   ├── PropertyGallery.tsx     # Galería de fotos en detalle de inmueble
│   │   │   └── SearchFilters.tsx       # Panel de filtros: ciudad, barrio, precio, tipo
│   │   ├── pages/
│   │   │   ├── SearchPage.tsx          # Listado con filtros y resultados paginados
│   │   │   └── PropertyDetailPage.tsx  # Detalle público + CTA "Solicitar arrendamiento"
│   │   ├── services/
│   │   │   └── propertyService.ts      # searchProperties(), getPropertyDetail()
│   │   ├── model/
│   │   │   └── property.types.ts       # PropertySummary, PropertyDetail, SearchFilters
│   │   ├── SearchRoutes.tsx            # Expuesto via Module Federation (./SearchRoutes)
│   │   └── index.tsx
│   ├── rspack.config.ts                # exposes: { './SearchRoutes': './src/SearchRoutes' }
│   ├── package.json
│   └── tsconfig.json
│
├── inmuebles-app/                      # Remote: gestión de inmuebles (HU-001, HU-002) y, desde
│   │                                    # HU-003, también el listado/detalle público (ver decisiones —
│   │                                    # v1 no crea el remote `busqueda-app` planteado originalmente
│   │                                    # en este documento; todo el dominio Inmueble, público y
│   │                                    # privado, queda en `inmuebles-app`)
│   ├── src/
│   │   ├── components/
│   │   │   └── FotoDropzone.tsx        # ui-formulario-inmueble: dropzone reusable de fotos con
│   │   │                              # preview — envuelve un `<input type="file" multiple>` real
│   │   │                              # y siempre visible (nunca oculto), genera miniaturas vía
│   │   │                              # `URL.createObjectURL` (revocadas en cleanup de `useEffect`)
│   │   │                              # y expone `onFilesSelected(files)` tanto para `onChange`
│   │   │                              # como para `onDrop`; usado por `PublicarInmueblePage`;
│   │   │                              # migrado en design-system-premium-real-estate a íconos
│   │   │                              # `ImagePlus`/`Upload` de `lucide-react` (antes solo texto)
│   │   ├── pages/
│   │   │   ├── BusquedaPublicaPage.tsx     # HU-003, migrado en design-system-premium-real-estate:
│   │   │   │                              # listado público (sin sesión) — solo inmuebles
│   │   │   │                              # estado=disponible; usa `PropertyCard` de `@rentame/ui`
│   │   │   │                              # (antes `<li>` ad-hoc), título con tipografía serif;
│   │   │   │                              # sin filtros en v1
│   │   │   ├── InmuebleDetallePublicoPage.tsx # HU-003, migrado en design-system-premium-real-estate:
│   │   │   │                              # detalle público completo (todas las fotos, descripción,
│   │   │   │                              # datos del formulario); título serif, `Button` de
│   │   │   │                              # `@rentame/ui` para "Volver"; sin sesión
│   │   │   ├── PublicarInmueblePage.tsx    # Formulario de publicación; selector de propietario
│   │   │   │                              # condicional por rol (agente, HU-002); ui-formulario-inmueble:
│   │   │   │                              # tarjeta/secciones/grid vía `styles/forms.ts`, integra
│   │   │   │                              # `FotoDropzone`, preview de moneda, hint de campos faltantes;
│   │   │   │                              # migrado en design-system-premium-real-estate a
│   │   │   │                              # `Input`/`Select`/`Textarea`/`Button` de `@rentame/ui`
│   │   │   │                              # (reemplazan `inputStyle`/`selectStyle`/`textareaStyle`/
│   │   │   │                              # `styles/buttons.ts` locales), ícono `<Check />` de
│   │   │   │                              # `lucide-react` en la pantalla de éxito (antes "✓" en texto)
│   │   │   ├── EditarInmueblePage.tsx      # Edición — recibe el inmueble por prop, no por fetch;
│   │   │   │                              # mismo layout que Publicar (`styles/forms.ts`, secciones,
│   │   │   │                              # grid, preview de moneda) y misma migración a
│   │   │   │                              # `Input`/`Select`/`Textarea`/`Button`/`<Check />` de
│   │   │   │                              # `@rentame/ui`+`lucide-react`, sin dropzone de fotos
│   │   │   ├── MisInmueblesPage.tsx        # Panel del propietario: listado + estados + acciones;
│   │   │   │                              # migrado en design-system-premium-real-estate a
│   │   │   │                              # `PropertyCard` de `@rentame/ui` con slot `acciones`
│   │   │   │                              # (Despublicar/Republicar/Editar, íconos `lucide-react`)
│   │   │   │                              # y `Badge` de disponibilidad
│   │   │   └── InmueblesGestionadosPage.tsx# Panel del agente (HU-002): cartera de su agencia; misma
│   │   │                                  # migración a `PropertyCard`/`Badge`/íconos que MisInmueblesPage
│   │   ├── services/
│   │   │   ├── inmuebles.api.ts        # publicarInmueble(), editarInmueble(), cambiarDisponibilidad(),
│   │   │   │                          # listarMisInmuebles(), listarInmueblesGestionados(),
│   │   │   │                          # listarPublicos(), obtenerPublico(id) (HU-003 — sin token)
│   │   │   └── agencias.api.ts         # listarPropietariosVinculados() — GET /agencias/mia/propietarios
│   │   ├── styles/                     # `buttons.ts` fue retirado en `design-system-premium-real-estate`
│   │   │                              # (reemplazado por `Button` de `@rentame/ui`); `forms.ts`/
│   │   │                              # `forms.css` siguen vigentes — cubren layout de secciones/grid
│   │   │                              # sin equivalente en `@rentame/ui` (fuera de alcance de ese change)
│   │   │   ├── forms.ts                # ui-formulario-inmueble: estilos de layout compartidos de
│   │   │   │                          # `PublicarInmueblePage`/`EditarInmueblePage` con tokens de
│   │   │   │                          # `@rentame/design-tokens` (`cardStyle`, `sectionStyle`,
│   │   │   │                          # `sectionTitleStyle`, `gridRowStyle`); los estilos de `input`/
│   │   │   │                          # `select`/`textarea` que antes vivían aquí fueron reemplazados
│   │   │   │                          # por `Input`/`Select`/`Textarea` de `@rentame/ui`
│   │   │   └── forms.css               # Reglas de layout/foco residuales no cubiertas por
│   │   │                              # `@rentame/ui`, importado por `styles/forms.ts`
│   │   ├── BusquedaPublicaRoutes.tsx   # HU-003: expuesto vía Module Federation
│   │   │                              # (./BusquedaPublicaRoutes) — state machine local listado↔detalle,
│   │   │                              # consumido por shell/src/pages/BusquedaPublicaShellPage.tsx
│   │   ├── PropertyRoutes.tsx          # Expuesto vía Module Federation (./PropertyRoutes);
│   │   │                              # decide MisInmueblesPage vs InmueblesGestionadosPage por rol
│   │   └── main.tsx / bootstrap.tsx
│   ├── rspack.config.ts                # exposes: { './PropertyRoutes': ..., './BusquedaPublicaRoutes':
│   │                                  # './src/BusquedaPublicaRoutes' }
│   ├── package.json
│   └── tsconfig.json
│
├── identidad-app/                      # Remote: validación de identidad del inquilino (HU-004)
│   ├── src/
│   │   ├── components/
│   │   │   ├── IdentityStatusBadge.tsx # Badge: Verificado / Pendiente / Rechazado
│   │   │   └── DocumentUploader.tsx    # Input de imagen con preview (frente/dorso cédula)
│   │   ├── pages/
│   │   │   └── ValidateIdentityPage.tsx# Formulario de cédula + carga de fotos + resultado
│   │   ├── services/
│   │   │   └── identityService.ts      # validateIdentity(), getIdentityStatus()
│   │   ├── model/
│   │   │   └── identity.types.ts       # IdentityValidation, ValidationStatus
│   │   ├── IdentityRoutes.tsx          # Expuesto via Module Federation (./IdentityRoutes)
│   │   └── index.tsx
│   ├── rspack.config.ts                # exposes: { './IdentityRoutes': './src/IdentityRoutes' }
│   ├── package.json
│   └── tsconfig.json
│
├── arrendamiento-app/                  # Remote: solicitudes y contratos (HU-005)
│   ├── src/
│   │   ├── components/
│   │   │   ├── ApplicationTimeline.tsx # Timeline de estados de la solicitud
│   │   │   ├── DocumentList.tsx        # Lista de documentos adjuntados con estado
│   │   │   └── ContractSignFlow.tsx    # Instrucciones + link a proveedor de firma
│   │   ├── pages/
│   │   │   ├── StartApplicationPage.tsx    # Inquilino: resumen del inmueble + confirmación
│   │   │   ├── UploadDocumentsPage.tsx     # Inquilino: carga de desprendibles y certificados
│   │   │   ├── MyApplicationsPage.tsx      # Inquilino: panel con estado de solicitudes
│   │   │   ├── ReceivedApplicationsPage.tsx# Propietario/agente: solicitudes recibidas
│   │   │   ├── ApplicationDetailPage.tsx   # Vista completa con timeline y acciones
│   │   │   └── ContractSignPage.tsx        # Ambas partes: instrucciones de firma
│   │   ├── services/
│   │   │   └── rentalService.ts        # createApplication(), uploadDocuments(), approve(), reject()
│   │   ├── model/
│   │   │   └── rental.types.ts         # Application, Contract, ApplicationStatus, ActiveRental
│   │   ├── RentalRoutes.tsx            # Expuesto via Module Federation (./RentalRoutes)
│   │   └── index.tsx
│   ├── rspack.config.ts                # exposes: { './RentalRoutes': './src/RentalRoutes' }
│   ├── package.json
│   └── tsconfig.json
│
├── pagos-app/                          # Remote: pagos mensuales (HU-006)
│   ├── src/
│   │   ├── components/
│   │   │   ├── PaymentMethodSelector.tsx # Selector PSE / Tarjeta
│   │   │   ├── PaymentHistoryTable.tsx   # Tabla: período, monto, estado, comprobante
│   │   │   └── ReceiptLink.tsx           # Link de descarga del PDF de comprobante
│   │   ├── pages/
│   │   │   ├── PaymentDashboardPage.tsx  # Monto actual, fecha límite, botón "Pagar"
│   │   │   └── PaymentHistoryPage.tsx    # Historial paginado con descarga de comprobantes
│   │   ├── services/
│   │   │   └── paymentService.ts         # initiatePayment(), getPaymentHistory(), getReceipt()
│   │   ├── model/
│   │   │   └── payment.types.ts          # Payment, PaymentStatus, PaymentMethod, PaymentDashboard
│   │   ├── PaymentRoutes.tsx             # Expuesto via Module Federation (./PaymentRoutes)
│   │   └── index.tsx
│   ├── rspack.config.ts                  # exposes: { './PaymentRoutes': './src/PaymentRoutes' }
│   ├── package.json
│   └── tsconfig.json
│
└── packages/
    ├── auth/                             # @rentame/auth — singleton compartido vía MF2
    │   ├── src/
    │   │   ├── AuthProvider.tsx          # React context: provee estado de sesión a toda la app
    │   │   ├── useAuth.ts                # Hook: { user, token, isAuthenticated, login, logout }
    │   │   ├── AuthGuard.tsx             # HOC/wrapper: redirige a /login si no hay sesión activa
    │   │   └── auth.types.ts             # User, Token, Role (owner | agent | tenant), AuthState
    │   ├── package.json                  # name: "@rentame/auth"
    │   └── tsconfig.json
    │
    ├── design-tokens/                    # @rentame/design-tokens — paleta y tokens de estilo
    │   ├── src/
    │   │   ├── tokens.css                # Variables CSS: color, tipografía, spacing, radios,
    │   │   │                            # sombras, transiciones, z-index, breakpoints
    │   │   ├── tokens.ts                 # Export TS de los mismos valores (uso fuera de CSS)
    │   │   └── __tests__/
    │   │       ├── contrast.test.ts      # Reglas de contraste WCAG entre pares de colores
    │   │       └── tokens.test.ts        # Escala exacta de spacing (4/8/12/16/20/24/32/40/48/64), etc.
    │   ├── package.json                  # name: "@rentame/design-tokens"
    │   └── README.md                     # Tabla de cada token con su valor y regla de uso derivada
    │
    └── ui/                               # @rentame/ui (design-system-premium-real-estate) — sistema
        │                                # de componentes React compartido, mismo patrón sin build
        │                                # step que `auth`/`design-tokens`
        ├── src/
        │   ├── Button.tsx / button.css   # variantes primary/secondary/ghost/danger/premium,
        │   │                            # tamaños sm/md, estados loading/disabled, hover/focus-visible
        │   ├── Badge.tsx                 # 6 variantes: verified/featured/new/available/
        │   │                            # unavailable/premium (solo available/unavailable en producción)
        │   ├── Input.tsx / Select.tsx / Textarea.tsx / fieldStyles.ts / input.css
        │   │                            # estado error, disabled, foco con --color-primary
        │   ├── PropertyCard.tsx          # foto, dirección/ubicación, características, precio,
        │   │                            # badge de disponibilidad, slot `acciones?`, favorito oculto
        │   │                            # por defecto (`showFavorito?`)
        │   ├── __tests__/
        │   └── index.ts
        ├── package.json                  # name: "@rentame/ui"; deps: @rentame/design-tokens,
        │                                # lucide-react; peerDeps: react/react-dom
        └── README.md                     # documenta convención de props explícitas (sin className
                                          # libre) y las variantes de Badge reservadas sin uso todavía
```

**Convención Module Federation 2.0 — ejemplo de config de remote:**

```typescript
// rspack.config.ts (remote — ej. pagos-app)
import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';

export default {
  plugins: [
    new ModuleFederationPlugin({
      name: 'pagosApp',
      filename: 'remoteEntry.js',
      exposes: {
        './PaymentRoutes': './src/PaymentRoutes',
      },
      shared: {
        react:      { singleton: true, requiredVersion: false },
        'react-dom': { singleton: true, requiredVersion: false },
        '@rentame/auth': { singleton: true },
      },
    }),
  ],
};
```

---

## 6. Decisiones clave

| Decisión | Opción elegida | Justificación |
|---|---|---|
| Arquitectura frontend | Microfrontends con Rspack + Module Federation 2.0 (host/shell + 5 remotes + paquete `@rentame/auth`) | Cada dominio de negocio tiene su propio ciclo de desarrollo y despliegue independiente. El patrón MFE permite evolucionar `pagos-app` o `identidad-app` sin redeployar el resto. Para un proyecto de crecimiento iterativo, la separación por remote reduce el riesgo de regresiones cruzadas entre dominios. |
| Split `busqueda-app` vs `inmuebles-app` | Dos remotes distintos: `busqueda-app` (público, sin sesión) e `inmuebles-app` (privado, requiere autenticación de propietario/agente) | Perfiles de auth distintos: `busqueda-app` es la puerta de entrada de inquilinos anónimos y no necesita JWT; `inmuebles-app` requiere sesión con rol `owner` o `agent`. Perfiles de tráfico distintos: búsqueda concentra el mayor volumen de visitas (discoverable por SEO y usuarios sin registro); publicación es un flujo de baja frecuencia y alta intención. Separar los remotes permite escalar y optimizar cada uno de forma independiente. |
| Singleton de auth compartido | `@rentame/auth` expuesto vía MF2 con `singleton: true` para `react`, `react-dom` y el propio paquete | Garantiza una única instancia del contexto de sesión en runtime, independientemente de cuántos remotes estén montados simultáneamente. Evita el problema clásico de múltiples instancias de React (hooks que no funcionan porque ven contextos distintos). |
| Versionado de contratos entre remotes | Cualquier cambio en la interfaz pública de un remote (`exposes`, props de rutas, eventos) se trata como breaking change y requiere coordinación explícita antes de desplegar | En MFE, un remote actualizado puede romperse con un host que no fue actualizado, o viceversa. Con un equipo unipersonal el riesgo es menor, pero el principio protege contra deploys asíncronos accidentales. |
| Puerto de riesgo abstracto (`RiskAssessmentPort`) | Interfaz única con adaptadores intercambiables (`credito_adapter`, `seguro_adapter`) | El PRD no fija el proveedor de riesgo. Desacoplar el dominio permite cambiar o combinar proveedores sin tocar la capa de aplicación. Es la decisión de mayor impacto técnico del proyecto. |
| Puerto de identidad abstracto (`IdentityVerificationPort`) | Interfaz única — proveedor concreto pendiente | Mismo principio: el dominio no debe conocer el proveedor de verificación de cédula colombiana. Cuando se seleccione el proveedor, solo se implementa un nuevo adaptador. |
| Puerto de pagos abstracto (`PaymentGatewayPort`) | Interfaz única — pasarela concreta pendiente | Aisla el dominio de pagos de la pasarela colombiana específica (Wompi, ePayco, PayU). El flujo de webhooks queda en infraestructura. |
| Puerto de firma electrónica (`ElectronicSignaturePort`) | Interfaz única — proveedor concreto pendiente (Certicámara, DocuSign CO, etc.) | Garantiza cumplimiento Ley 527/1999 sin acoplar el dominio a un proveedor específico. |
| Base de datos relacional | PostgreSQL | Modelo de datos con relaciones claras (solicitud → contrato → arrendamiento → pagos). ACID requerido para transacciones de pago. PostgreSQL tiene soporte nativo de UUID, JSONB para respuestas de proveedores, y row-level security útil a futuro. |
| Object storage | S3-compatible (MinIO local / AWS S3 producción) | Las fotos de inmuebles y documentos del inquilino no son datos relacionales. boto3 como cliente abstrae la diferencia entre MinIO y S3 real. El adaptador `s3_storage_adapter.py` implementa `StoragePort`. |
| Mecanismo de subida de fotos | Proxy por backend (multipart), no presigned URLs | Resuelto en el change `hu-001` (ver `design.md`): el frontend envía los bytes en el mismo `multipart/form-data` que el resto del formulario de publicación, y el backend los sube a S3/MinIO. Se prefirió sobre presigned URLs por simplicidad para el primer dominio implementado (evita configurar CORS en el bucket y un endpoint adicional de generación de URLs firmadas). Corrige una inconsistencia de una versión anterior de este documento, donde la tabla de decisiones mencionaba presigned URLs pero el diagrama de secuencia de publicación siempre mostró el flujo de proxy por backend. |
| URL pública de fotos (`storage_public_url`) | `Settings.storage_public_url`, usado por `S3StorageAdapter.construir_url()` con fallback a `storage_endpoint_url`; `docker-compose.yml` setea `STORAGE_PUBLIC_URL=http://localhost:9000` para el backend | Corrige un bug de infraestructura preexistente desde `hu-001`, encontrado durante `hu-003`: `FotoInmueble.url_storage` se construía con el hostname interno de Docker (`http://minio:9000`), que el backend sí resuelve (red interna de compose) pero el navegador nunca puede resolver — las fotos no cargaban en el cliente. Al separar la URL "pública" (browser-reachable) de la URL "interna" (`storage_endpoint_url`, usada para las operaciones `boto3` del propio backend) se resuelve sin acoplar el dominio ni el resto de la infraestructura de storage. |
| Ubicación del listado/detalle público de `inmuebles` | Dentro de `inmuebles-app` (componente `BusquedaPublicaRoutes`), no en un remote `busqueda-app` separado | Resuelto en `hu-003`: se prefirió mantener todo el dominio `Inmueble` (público y privado) en un solo microfrontend en vez de crear el remote `busqueda-app` planteado originalmente en este documento (fila "Split `busqueda-app` vs `inmuebles-app`" más abajo, y sección 5). `shell` solo monta el header (`BusquedaPublicaShellPage`) con las dos acciones alrededor del componente lazy-cargado. Si el tráfico público justifica un ciclo de despliegue independiente, la extracción a `busqueda-app` queda como evolución futura sin cambios de dominio. |
| Autenticación | JWT de solo access token (sin refresh token) | Resuelto en `hu-008` — implementado en `backend/usuarios/` (registro, login) reutilizando `shared/infrastructure/auth/jwt_handler.py` sin modificarlo. La idea original de este documento (refresh token en cookie HttpOnly) fue descartada explícitamente como no-goal de esa HU: la sesión es solo access token y, al expirar, el usuario vuelve a loguearse — sin mecanismo de refresh. El singleton `@rentame/auth` gestiona el ciclo de vida de ese único token para todos los remotes. |
| `output.publicPath` del shell (Rspack) | Absoluto (`'/'`), no `'auto'` | nginx sirve `index.html` como fallback SPA para cualquier ruta (ej. navegación directa a `/registro/agente`). Con `'auto'`, el navegador resuelve la URL del script relativa a esa ruta (`/registro/main.js` → 404 → nginx devuelve `index.html` como si fuera JS → error `"Unexpected token '<'"` en runtime). Como el shell siempre se sirve desde la raíz del dominio, `'/'` es correcto en todo despliegue (ver `frontend/shell/rspack.config.ts`). |
| Plataforma objetivo | Web responsiva (no PWA nativa) | Cumple el requisito "web y mobile" del PRD con menor superficie de mantenimiento para un equipo unipersonal. |
| Canal de notificaciones | Email (canal inicial) | Cubre todos los eventos críticos del flujo. Push nativo requeriría Service Worker o app nativa — inviable para MVP unipersonal. El puerto de email permite agregar SMS/WhatsApp a futuro. |
| Slicing de código — backend | Por dominio/feature (`usuarios/`, `inmuebles/`, `identidad/`, `arrendamiento/`, `riesgo/`, `pagos/`) | Mejora cohesión: todo lo relacionado a `pagos/` vive junto. Facilita crecimiento independiente de cada dominio. Reduce acoplamiento accidental entre features. |
| Estado de servidor en frontend | React Query por remote | Cada remote gestiona su propio caché de servidor con React Query. El estado global de sesión (auth) queda centralizado en `@rentame/auth`. No se introduce Zustand adicional — el hook `useAuth` del singleton cubre el estado global necesario para el MVP. |
| Componentes UI compartidos entre `shell` e `inmuebles-app` | Paquete workspace `@rentame/ui` (`Button`, `Badge`, `Input`/`Select`/`Textarea`, `PropertyCard`), sin build step, mismo patrón que `@rentame/auth`/`@rentame/design-tokens` | Resuelto en `design-system-premium-real-estate`, revirtiendo la decisión previa de `ui-layout-navegacion` (duplicar `src/styles/buttons.ts` en cada microfrontend): al crecer el número de componentes reales (no solo constantes de estilo de botón) más allá de un par de archivos, el paquete compartido deja de ser sobre-ingeniería y evita divergencia visual entre `shell` e `inmuebles-app`. Props explícitas y tipadas, sin `className`/`style` libre desde el caller, para mantener el sistema consistente. `agencias.api.ts` sigue duplicado deliberadamente (no es UI) — ver fila de `agencias.api.ts` implícita en HU-008. |
| Íconos y tipografía compartidos | `lucide-react` (SVG tree-shakeable) + `@fontsource/inter`/`@fontsource/dm-serif-display` autohospedadas, importadas una vez desde `bootstrap.tsx` de cada microfrontend | Resuelto en `design-system-premium-real-estate`: reemplaza el uso de emoji/texto plano ("✓") por íconos reales; fuentes autohospedadas evitan una llamada de red externa a Google Fonts, consistente con el resto del proyecto. |

---

## 7. Riesgos

1. **Disponibilidad de APIs externas colombianas**: Los proveedores de identidad, riesgo y pagos en Colombia tienen latencias y SLAs variables. Un timeout o fallo debe ser manejado con reintentos y estados intermedios (`pendiente`) para no bloquear el flujo del usuario.

2. **Firma electrónica bajo Ley 527/1999**: La validez legal depende del proveedor seleccionado y del tipo de firma (simple, avanzada o calificada). Si el proveedor elegido no satisface los requisitos legales en disputas judiciales, los contratos firmados podrían no tener validez plena.

3. **Webhooks de pasarela de pagos sin entrega garantizada**: Si el webhook llega duplicado o con retraso, el estado del pago puede quedar inconsistente. Mitigación: idempotencia basada en `ref_transaccion_pasarela` y reconciliación periódica consultando el estado en la pasarela.

4. **Complejidad de setup MFE para equipo unipersonal**: La arquitectura de microfrontends introduce 6 proyectos Rspack independientes (shell + 5 remotes) más un paquete compartido (`@rentame/auth`). El overhead de configuración inicial, gestión de dependencias cruzadas y coordinación de deploys es significativamente mayor que una SPA única. Mitigación: implementar los remotes en orden de prioridad del MVP y no paralelizar el setup hasta que el contrato de auth y el shell estén estabilizados.

5. **Ruptura de contrato entre remotes en deploys asíncronos**: Si se despliega un remote con una interfaz de `exposes` nueva antes de actualizar el shell que lo consume (o viceversa), la aplicación puede fallar en runtime con errores difíciles de depurar. Mitigación: versionar los contratos explícitamente y mantener compatibilidad hacia atrás mientras el ciclo de actualización no esté completo.

6. **Desarrollo local con múltiples procesos concurrentes**: Cada remote requiere su propio servidor de desarrollo Rspack. Con 6 remotes + paquete compartido, el entorno local puede volverse difícil de orquestar. Mitigación: definir un `docker-compose` o script de arranque que levante todos los remotes en paralelo con puertos fijos documentados.

7. **Equipo unipersonal con alta superficie técnica**: La combinación de MFE + 5 integraciones externas + flujo multietapa en el backend es alta para un solo desarrollador. El riesgo principal es el tiempo de implementación y la dificultad para mantener los tests actualizados a medida que el sistema crece.

8. **Gestión de documentos sensibles**: Las fotos de cédulas y documentos financieros tienen requerimientos bajo Ley 1581/2012 (Habeas Data). El almacenamiento en S3 debe incluir cifrado en reposo y controles de acceso estrictos. El no cumplimiento genera riesgo legal.

9. **Consistencia entre estado del inmueble y solicitudes concurrentes**: Si dos inquilinos inician solicitudes simultáneas sobre el mismo inmueble, el sistema debe manejar la concurrencia correctamente para evitar arrendamientos dobles. Requiere locking a nivel de base de datos al momento de aprobación.

10. **Experiencia del inquilino en flujo multi-paso**: El flujo completo (registro → validación de identidad → solicitud → documentos → riesgo → firma → pago) es largo. Si el inquilino abandona a mitad de proceso, el sistema debe preservar el estado para reanudar sin repetir pasos ya completados.

---

## 8. Supuestos

1. **Versionado de contratos entre remotes**: Se asume que cualquier cambio en la interfaz pública de un remote (rutas expuestas, props, eventos) se tratará como breaking change y se coordinará explícitamente antes de desplegarse. En un equipo unipersonal esto es autoimpuesto, pero debe documentarse para el día que el equipo crezca.

2. **Despliegue independiente de remotes posible**: Se asume que el proveedor de hosting elegido permite servir cada `remoteEntry.js` desde una URL estática independiente (S3 + CloudFront, Vercel, Netlify, o equivalente), lo que es la condición necesaria para la independencia de despliegue de MFE.

3. **Puerto de riesgo intercambiable**: Se asume que existirá al menos un proveedor colombiano con API REST para estudio de crédito o seguro de arrendamiento. Si el proceso resulta ser manual o por email con el proveedor, el adaptador deberá emular el flujo síncrono con polling o proceso manual asistido.

4. **Identidad verificada una sola vez**: Se asume que la verificación de identidad del inquilino es válida indefinidamente en la plataforma. Si el proveedor requiere re-verificación periódica (por expiración de cédula u otros), el dominio deberá extenderse.

5. **Plataforma responsiva, no PWA nativa**: Se asume que los usuarios propietarios e inquilinos acceden predominantemente desde navegador (desktop y móvil). Si la demanda de app nativa surge, la API REST existente puede servir de base sin cambios en el backend.

6. **PostgreSQL como única base de datos**: Se asume que los volúmenes del MVP no requieren búsqueda full-text avanzada (Elasticsearch) ni caché distribuida (Redis). Si la búsqueda de inmuebles crece en complejidad (búsqueda geoespacial, texto libre), deberá evaluarse extensiones PostgreSQL (`pg_trgm`, `PostGIS`) antes de agregar nuevas tecnologías.

7. **Email como único canal de notificaciones**: Se asume que los usuarios consultarán el email para notificaciones críticas (solicitud aprobada, pago recibido). Si el engagement por email es bajo, deberá evaluarse WhatsApp Business API o SMS como canal complementario.

8. **Foco en Medellín para el MVP**: Se asume que las integraciones de identidad, riesgo y pagos son válidas para usuarios con cédula de ciudadanía colombiana y cuentas bancarias en Colombia. La expansión a otros países requeriría adaptadores adicionales en cada puerto.

9. **Un inmueble tiene un solo arrendamiento activo a la vez**: Se asume que los inmuebles son unidades habitacionales completas (no piezas en habitación compartida). El modelo de datos y el dominio no están diseñados para subarrendamiento o cohabitación estructurada.

10. **Los precios se expresan en COP (pesos colombianos)**: No se contempla manejo multimoneda en el MVP. El tipo de cambio y conversión quedan fuera del alcance.

---

## 9. Próximos pasos sugeridos

> Estado de avance de la implementación (en el repositorio de código [Rentame](https://github.com/juanma1000/Rentame)): los pasos 1, 2, 4 y 5 ya están completos; el 3 está parcialmente completo (ver nota).

1. ✅ **Configurar la infraestructura base**: Repositorio, entorno local con Docker Compose (PostgreSQL + MinIO), estructura de carpetas del backend y scaffolding de Alembic para migraciones.

2. ✅ **Implementar el dominio de `usuarios` en backend**: Registro, login y JWT ([HU-008](../user-stories/HU-008-registro-y-autenticacion.md)). El vínculo agente-propietario evolucionó al dominio `agencias` (ver paso 2b).

2b. ✅ **Implementar el dominio de `agencias` en backend**: Entidad agencia, ingreso de agentes y vínculo agencia-propietario ([HU-007](../user-stories/HU-007-gestion-de-agencias.md)). Fundacional para que la publicación por agente (HU-002) funcione correctamente.

3. 🔶 **Inicializar el monorepo frontend**: Crear la estructura `frontend/` con el shell y el paquete `packages/auth`. Configurar Rspack + Module Federation 2.0 en el shell con los remotes apuntando a puertos locales fijos. **Completado parcialmente**: el shell y el remote `inmuebles-app` ya existen; `identidad-app`, `arrendamiento-app` y `pagos-app` quedan pendientes de crear cuando se implementen esos dominios en backend. `busqueda-app` no se crea como remote separado — la búsqueda pública se resolvió dentro de `inmuebles-app` (ver decisiones clave).

4. ✅ **Implementar el dominio de `inmuebles` en backend**: Publicación, edición, búsqueda pública y gestión de fotos con S3 ([HU-001](../user-stories/HU-001-publicacion-inmueble-propietario.md), [HU-002](../user-stories/HU-002-publicacion-inmueble-agente.md), [HU-003](../user-stories/HU-003-busqueda-inmuebles-disponibles.md)).

5. ✅ **Implementar `inmuebles-app`**: Construido con el flujo público end-to-end (búsqueda sin sesión → detalle → CTA → login) y el flujo privado de publicación/edición.

6. **Implementar el dominio de `identidad` en backend y `identidad-app`**: Crear el `IdentityVerificationPort` y un adaptador stub/mock para desarrollar el flujo completo antes de integrar el proveedor real.

7. **Implementar el dominio de `arrendamiento` en backend y `arrendamiento-app`**: Solicitudes, carga de documentos y el flujo de aprobación del propietario. El `ElectronicSignaturePort` puede quedar con adaptador mock inicialmente.

8. **Implementar el dominio de `riesgo` en backend**: El `RiskAssessmentPort` con adaptador mock permite completar el flujo del inquilino. La integración real con el proveedor se enchufa sin tocar el caso de uso.

9. **Implementar el dominio de `pagos` en backend y `pagos-app`**: Flujo de cobro mensual con `PaymentGatewayPort` y manejo de webhooks. Es el dominio de mayor criticidad operativa y debe tener las pruebas más robustas.

10. **Seleccionar e integrar proveedores externos**: Identidad, riesgo/seguro, pasarela de pagos y firma electrónica. Cada integración reemplaza un adaptador mock por uno real sin cambiar la capa de aplicación ni el dominio.

11. **Configurar CI/CD**: Tests unitarios de dominio y casos de uso (sin base de datos), tests de integración con base de datos de prueba, y deploy automatizado de cada remote de forma independiente a entorno de staging.
