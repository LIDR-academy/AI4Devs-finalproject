## Índice

0. [Ficha del proyecto](#0-ficha-del-proyecto)
1. [Descripción general del producto](#1-descripción-general-del-producto)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Modelo de datos](#3-modelo-de-datos)
4. [Especificación de la API](#4-especificación-de-la-api)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Tickets de trabajo](#6-tickets-de-trabajo)
7. [Solicitudes de cambio](#7-pull-requests)

---

> **Documentación de referencia — Entrega 1 / diseño inicial**
>
> Las secciones siguientes conservan el diseño histórico de la Entrega 1. No describen necesariamente la API ni el modelo ejecutable de la Entrega 2.

## 0. Ficha del proyecto

### **0.1. Tu nombre completo:**
Manuel Gutiérrez Borrás

### **0.2. Nombre del proyecto:**
AI Business Presence Builder

### **0.3. Descripción breve del proyecto:**
Permitir que pequeños negocios creen una presencia digital inicial de calidad profesional mediante un proceso guiado de descubrimiento empresarial y generación de activos digitales impulsada por inteligencia artificial.

### **0.4. URL del proyecto:**

> NO DISPONIBLE AUN

### 0.5. URL o archivo comprimido del repositorio

https://github.com/mgutbor/AI4Devs-finalproject


---

## 1. Descripción general del producto

### **1.1. Objetivo:**

AI Business Presence Builder es una plataforma diseñada para ayudar a pequeñas empresas a construir una presencia digital profesional y coherente de manera rápida y accesible. Utiliza un proceso guiado de descubrimiento de negocio para capturar la identidad, la oferta y el público objetivo, y transforma esa información en activos digitales generados por IA.

### **1.2. Características y funcionalidades principales:**

- Flujo de descubrimiento guiado que recopila datos estructurados sobre la empresa, servicios, público y propuesta de valor.
- Normalización del perfil comercial para convertir respuestas en datos canónicos reutilizables.
- Generación automática de activos digitales: texto para sitio web, descripciones para directorios, biografías sociales y metadatos SEO.
- Motor de consistencia que valida la coherencia entre el perfil y los contenidos generados.
- Capacidad de revisión y edición con previsualización de activos en contextos reales.

### **1.3. Diseño y experiencia de usuario:**

La experiencia está pensada para usuarios no técnicos: un proceso de incorporación paso a paso que evita el uso de prompts libres y guía al dueño del negocio mediante preguntas claras y adaptativas. El producto muestra los resultados en una vista previa contextual, lo que facilita la revisión y la toma de decisiones antes de exportar los activos.

### **1.4. Instrucciones de instalación:**

1. Clona el repositorio en tu máquina local.
2. Instala las dependencias de `backend/` y `frontend/` según la tecnología utilizada.
3. Configura las variables de entorno necesarias para la base de datos y la integración con los servicios de IA.
4. Ejecuta las migraciones de la base de datos y, si existe, carga los datos iniciales.
5. Inicia los servicios de `backend/` y `frontend/` y accede a la aplicación desde el navegador.

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

La arquitectura propuesta sigue un enfoque modular con capas bien definidas: Experiencia, Aplicación, Datos y AI. El flujo principal es el siguiente:

- La interfaz de usuario guía al dueño del negocio en el proceso de descubrimiento.
- El servicio de orquestación de descubrimiento captura respuestas estructuradas.
- El servicio de normalización transforma estas respuestas en un perfil comercial canónico y en el grafo de identidad de negocio.
- El servicio de generación de activos utiliza el perfil normalizado y plantillas para invocar la capa de IA y producir contenidos coherentes.
- El servicio de calidad valida consistencia y prepara los activos para vista previa y exportación.

```mermaid
flowchart LR
  subgraph ExperienceLayer["Capa de Experiencia"]
    UI["GUI de descubrimiento"]
    Editor["Editor de perfil"]
    Preview["Previsualización de activos"]
  end

  subgraph ApplicationLayer["Capa de Aplicación"]
    Discovery["Discovery Orchestration"]
    Normalization["Profile Normalization"]
    Identity["Business Identity Graph"]
    Generation["Asset Generation"]
    Quality["Quality & Consistency"]
  end

  subgraph DataLayer["Capa de Datos"]
    ProfileStore["Perfil canónico"]
    AssetStore["Activos generados"]
    TemplateStore["Plantillas / KB"]
  end

  subgraph AILayer["Capa AI"]
    Model["AI Model Orchestrator"]
  end

  UI --> Discovery
  Editor --> Discovery
  Discovery --> Normalization
  Normalization --> Identity
  Identity --> ProfileStore
  ProfileStore --> Generation
  TemplateStore --> Generation
  Generation --> Quality
  Quality --> Preview
  Generation --> AssetStore
  Model --> Generation
  ProfileStore --> Model
  Identity --> Model
  TemplateStore --> Model
  Preview -->|Feedback / Edits| Discovery
```

Este patrón centraliza la lógica de negocio y separa claramente la gestión de datos de la generación de contenido, lo que facilita la escalabilidad y la evolución futura del sistema.

### **2.2. Descripción de componentes principales:**

- **Interfaz de usuario (GUI):** componente frontend que ofrece el flujo guiado de descubrimiento, el editor de perfil y la previsualización de activos. Está enfocado en usuarios no técnicos y en minimizar la entrada libre de texto.
- **Discovery Orchestration:** servicio que gestiona el flujo de incorporación, las preguntas adaptativas y el almacenamiento inicial de las respuestas del negocio.
- **Perfil canónico / normalización:** servicio que valida, normaliza y enriquece los datos de la empresa. Transforma los insumos en atributos canónicos y categorías estándar.
- **Business Identity Graph:** componente de dominio que modela relaciones entre servicios, audiencias, valores y tono de marca. Proporciona contexto estructurado para la generación de contenidos.
- **Asset Generation:** motor que consume el perfil normalizado y las plantillas para generar contenido mediante IA. Crea textos para el sitio web, descripciones de directorios, biografías para redes sociales y metadatos SEO.
- **Quality & Consistency:** servicio que revisa los activos generados en busca de incoherencias, tono inconsistente o contenido genérico, y sugiere correcciones.
- **Almacenamiento de datos:** incluye el repositorio de perfiles canónicos, el historico de sesiones de descubrimiento y los activos generados.
- **Capa AI:** orquesta llamadas a modelos, gestiona contextos y plantillas, y produce explicaciones o justificaciones de las recomendaciones.

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

AI Business Presence Builder está concebido como una solución modular y orientada a dominios, donde cada capa del sistema tiene responsabilidades claras. El proyecto se organiza en tres áreas principales:

- **Frontend / Experiencia de usuario:** gestiona la navegación guiada, la captura de datos del negocio y la visualización de resultados. Este bloque incluye componentes de incorporación, edición de perfil y vista previa de activos, y está diseñado para usuarios no técnicos.
- **Backend / Lógica de negocio:** incorpora servicios de descubrimiento, normalización de perfil, generación de contenido y validación de calidad. Estas piezas se comunican a través de interfaces internas para mantener un flujo coherente entre la captura de datos y la producción de activos.
- **Datos / Persistencia:** almacena el perfil comercial canónico, el historial de sesiones, los activos generados y las configuraciones de plantillas. El modelo de datos se construye para soportar la regeneración de activos y la consistencia entre los distintos canales digitales.

Ejemplo de organización de carpetas:

- `backend/` o `src/`: implementación de APIs, servicios y lógica de negocio.
- `frontend/` o `ui/`: interfaz de usuario y experiencia guiada.
- `models/` o `data/`: esquemas, entidades y migraciones de bases de datos.
- `docs/`: documentación técnica, diagramas y guías de arquitectura.
- `config/`: archivos de configuración y variables de entorno para conectar servicios de IA y bases de datos.

Este enfoque refuerza el principio de separación de responsabilidades, facilita el trabajo en equipo y permite escalar el producto con mayor facilidad. Además, apoya futuras extensiones como la incorporación de nuevas integraciones de directorios, conectores CMS y módulos de inteligencia artificial mejorados.

### **2.4. Infraestructura y despliegue**

> Detalla la infraestructura del proyecto, incluyendo un diagrama en el formato que creas conveniente, y explica el proceso de despliegue que se sigue

### **2.5. Seguridad**

> Enumera y describe las prácticas de seguridad principales que se han implementado en el proyecto, añadiendo ejemplos si procede

### **2.6. Pruebas**

> Describe brevemente algunas de las pruebas realizadas

---

## 3. Modelo de Datos

### **3.1. Diagrama del modelo de datos:**

El modelo de datos centraliza el perfil de negocio, los datos capturados durante el descubrimiento y los activos generados por IA. Una estructura relacional permite mantener la consistencia y soportar regeneraciones posteriores.

```mermaid
erDiagram
    BUSINESS_PROFILE {
        string id PK "Identificador único"
        string business_name "Nombre del negocio"
        string category "Categoría principal"
        string industry "Sector"
        string location "Ubicación principal"
        string contact_info "Datos de contacto"
        string status "Estado del perfil"
        datetime created_at "Fecha de creación"
        datetime updated_at "Fecha de actualización"
    }

    DISCOVERY_SESSION {
        string id PK "ID de sesión"
        string profile_id FK "Referencia a BUSINESS_PROFILE"
        string user_id "Usuario propietario"
        string current_step "Paso actual"
        string intent "Intención principal"
        string raw_responses "Respuestas crudas"
        datetime started_at "Inicio"
        datetime completed_at "Finalización"
    }

    PROFILE_FIELD {
        string id PK "ID del campo"
        string profile_id FK "Referencia a BUSINESS_PROFILE"
        string field_name "Nombre del campo"
        string field_value "Valor del campo"
        string field_type "Tipo de dato"
        boolean required "Requerido"
        boolean validated "Validado"
    }

    CUSTOMER_PERSONA {
        string id PK "ID de la persona"
        string profile_id FK "Referencia a BUSINESS_PROFILE"
        string persona_name "Nombre del segmento"
        string description "Descripción"
        string pain_points "Puntos de dolor"
        string preferred_tone "Tono preferido"
    }

    BRAND_VOICE {
        string id PK "ID de voz"
        string profile_id FK "Referencia a BUSINESS_PROFILE"
        string tone "Tono de marca"
        string style "Estilo de comunicación"
        string values "Valores asociados"
        string messaging_guidelines "Guías de mensaje"
    }

    BUSINESS_IDENTITY_GRAPH {
        string id PK "ID de nodo"
        string profile_id FK "Referencia a BUSINESS_PROFILE"
        string node_type "Tipo de nodo"
        string node_value "Valor del nodo"
        string relationship "Relación"
        string related_node_id FK "Nodo relacionado"
    }

    GENERATED_ASSET {
        string id PK "ID del activo"
        string profile_id FK "Referencia a BUSINESS_PROFILE"
        string asset_type "Tipo de activo"
        string title "Título"
        string content "Contenido generado"
        string status "Estado"
        datetime generated_at "Fecha de generación"
    }

    ASSET_VARIATION {
        string id PK "ID de variación"
        string asset_id FK "Referencia a GENERATED_ASSET"
        string variation_label "Etiqueta"
        string content "Contenido de la variación"
        boolean selected "Seleccionada"
    }

    QUALITY_CHECK {
        string id PK "ID del chequeo"
        string asset_id FK "Referencia a GENERATED_ASSET"
        string issue_type "Tipo de incidencia"
        string issue_description "Descripción"
        string severity "Severidad"
        boolean resolved "Resuelto"
    }

    BUSINESS_PROFILE ||--o{ DISCOVERY_SESSION : "crea"
    BUSINESS_PROFILE ||--o{ PROFILE_FIELD : "contiene"
    BUSINESS_PROFILE ||--o{ CUSTOMER_PERSONA : "define"
    BUSINESS_PROFILE ||--o{ BRAND_VOICE : "establece"
    BUSINESS_PROFILE ||--o{ BUSINESS_IDENTITY_GRAPH : "mapea"
    BUSINESS_PROFILE ||--o{ GENERATED_ASSET : "produce"
    GENERATED_ASSET ||--o{ ASSET_VARIATION : "incluye"
    GENERATED_ASSET ||--o{ QUALITY_CHECK : "valida"
    BUSINESS_IDENTITY_GRAPH ||--o{ BUSINESS_IDENTITY_GRAPH : "relaciona"
```

### **3.2. Descripción de entidades principales:**

A continuación se describen las entidades principales del modelo y su papel en el sistema.

```mermaid
flowchart TD
  BP["BUSINESS_PROFILE"] --> DS["DISCOVERY_SESSION"]
  BP --> PF["PROFILE_FIELD"]
  BP --> CP["CUSTOMER_PERSONA"]
  BP --> BV["BRAND_VOICE"]
  BP --> BIG["BUSINESS_IDENTITY_GRAPH"]
  BP --> GA["GENERATED_ASSET"]
  GA --> AV["ASSET_VARIATION"]
  GA --> QC["QUALITY_CHECK"]
```

- **BUSINESS_PROFILE:** entidad central que representa el perfil canónico del negocio. Incluye nombre, categoría, ubicación y estado. Es la fuente de verdad para la generación de activos.
- **DISCOVERY_SESSION:** almacena el proceso de descubrimiento guiado en curso o completado. Registra el usuario, el paso actual, las respuestas crudas y el estado temporal de la sesión.
- **PROFILE_FIELD:** componente de datos que guarda cada campo del perfil como pares nombre/valor con metadatos de validación. Facilita la normalización y la reutilización de información.
- **CUSTOMER_PERSONA:** representa segmentos de cliente objetivo y sus características clave, como puntos de dolor y tono preferido. Ancla la comunicación al público correcto.
- **BRAND_VOICE:** define el tono, estilo y valores de marca que deben aplicarse en los contenidos generados. Esta entidad sirve para mantener coherencia verbal.
- **BUSINESS_IDENTITY_GRAPH:** almacena la red de relaciones entre servicios, públicos, valores y mensajes. Ayuda a la IA a generar contenido consistente y alineado con la identidad del negocio.
- **GENERATED_ASSET:** guarda los activos digitales creados por la IA, como descripciones para sitio web, directorios o redes sociales. Incluye tipo, título y contenido.
- **ASSET_VARIATION:** contiene versiones alternativas de un activo generado, permitiendo al usuario elegir la opción más adecuada.
- **QUALITY_CHECK:** registra incidencias y comprobaciones de calidad para cada activo generado, con tipo de problema, severidad y estado de resolución.

Este modelo equilibra la captura estructurada de datos de negocio con la gestión de resultados generados, asegurando trazabilidad y capacidad de actualización a lo largo del tiempo.

---

## 4. Especificación de la API

A continuación se describen los tres endpoints principales del backend para soportar el flujo de descubrimiento, la gestión del perfil normalizado y la generación de activos.

```yaml
openapi: 3.0.3
info:
  title: AI Business Presence Builder API
  version: 1.0.0
  description: API para gestionar el descubrimiento empresarial, el perfil canónico y la generación de activos digitales.
servers:
  - url: https://api.ai-business-presence-builder.example.com
    description: Servidor de producción
paths:
  /api/discovery/sessions:
    post:
      summary: Iniciar o actualizar una sesión de descubrimiento
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                user_id:
                  type: string
                  description: Identificador del usuario propietario
                profile_id:
                  type: string
                  description: Identificador del perfil existente (opcional)
                current_step:
                  type: string
                  description: Paso actual del flujo de onboarding
                intent:
                  type: string
                  description: Intención principal del negocio
                responses:
                  type: object
                  description: Respuestas estructuradas del descubrimiento
              required:
                - user_id
                - responses
      responses:
        '200':
          description: Sesión de descubrimiento creada o actualizada
          content:
            application/json:
              schema:
                type: object
                properties:
                  session_id:
                    type: string
                  profile_id:
                    type: string
                  status:
                    type: string
                  next_step:
                    type: string
        '400':
          description: Petición inválida
          content:
            application/json:
              schema:
                type: object
                properties:
                  code:
                    type: string
                  message:
                    type: string
        '401':
          description: Autenticación requerida o inválida
          content:
            application/json:
              schema:
                type: object
                properties:
                  code:
                    type: string
                  message:
                    type: string
        '500':
          description: Error interno del servidor
          content:
            application/json:
              schema:
                type: object
                properties:
                  code:
                    type: string
                  message:
                    type: string
      examples:
        request:
          value:
            user_id: user_123
            current_step: business_identity
            intent: "Aumentar visibilidad local"
            responses:
              business_name: "Panadería El Buen Horno"
              category: "Panadería"
              location: "Madrid"
              contact_info: "+34 600 123 456"
        response:
          value:
            session_id: session_abc
            profile_id: profile_xyz
            status: active
            next_step: persona_target

  /api/profiles/{profileId}:
    get:
      summary: Obtener el perfil normalizado de negocio
      parameters:
        - name: profileId
          in: path
          required: true
          schema:
            type: string
          description: Identificador del perfil del negocio
      responses:
        '200':
          description: Perfil normalizado devuelto correctamente
          content:
            application/json:
              schema:
                type: object
                properties:
                  profile_id:
                    type: string
                  business_name:
                    type: string
                  category:
                    type: string
                  location:
                    type: string
                  contact_info:
                    type: string
                  brand_voice:
                    type: object
                    properties:
                      tone:
                        type: string
                      style:
                        type: string
                  customer_personas:
                    type: array
                    items:
                      type: object
                      properties:
                        persona_name:
                          type: string
                        pain_points:
                          type: string
        '400':
          description: Petición inválida
          content:
            application/json:
              schema:
                type: object
                properties:
                  code:
                    type: string
                  message:
                    type: string
        '401':
          description: Autenticación requerida o inválida
          content:
            application/json:
              schema:
                type: object
                properties:
                  code:
                    type: string
                  message:
                    type: string
        '404':
          description: Perfil no encontrado
          content:
            application/json:
              schema:
                type: object
                properties:
                  code:
                    type: string
                  message:
                    type: string
        '500':
          description: Error interno del servidor
          content:
            application/json:
              schema:
                type: object
                properties:
                  code:
                    type: string
                  message:
                    type: string
      examples:
        response:
          value:
            profile_id: profile_xyz
            business_name: "Panadería El Buen Horno"
            category: "Panadería"
            location: "Madrid"
            contact_info: "+34 600 123 456"
            brand_voice:
              tone: "Cálido y cercano"
              style: "Directo, con foco en confianza"
            customer_personas:
              - persona_name: "Familias locales"
                pain_points: "Productos frescos y atención rápida"

  /api/assets/generate:
    post:
      summary: Generar activos digitales a partir del perfil normalizado
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                profile_id:
                  type: string
                  description: Identificador del perfil normalizado
                outcomes:
                  type: array
                  items:
                    type: string
                  description: Objetivos de negocio para la generación
                asset_types:
                  type: array
                  items:
                    type: string
                  description: Tipos de activos a generar
              required:
                - profile_id
                - outcomes
      responses:
        '201':
          description: Activos generados correctamente
          content:
            application/json:
              schema:
                type: object
                properties:
                  generation_id:
                    type: string
                  assets:
                    type: array
                    items:
                      type: object
                      properties:
                        asset_id:
                          type: string
                        asset_type:
                          type: string
                        title:
                          type: string
                        content:
                          type: string
        '400':
          description: Petición inválida
          content:
            application/json:
              schema:
                type: object
                properties:
                  code:
                    type: string
                  message:
                    type: string
        '401':
          description: Autenticación requerida o inválida
          content:
            application/json:
              schema:
                type: object
                properties:
                  code:
                    type: string
                  message:
                    type: string
        '500':
          description: Error interno del servidor
          content:
            application/json:
              schema:
                type: object
                properties:
                  code:
                    type: string
                  message:
                    type: string
      examples:
        request:
          value:
            profile_id: profile_xyz
            outcomes:
              - "Mejorar el SEO local"
              - "Aumentar reservas"
            asset_types:
              - "website_copy"
              - "directory_listing"
        response:
          value:
            generation_id: gen_456
            assets:
              - asset_id: asset_1
                asset_type: website_copy
                title: "Texto para página principal"
                content: "Bienvenido a Panadería El Buen Horno, tu panadería local en Madrid..."
              - asset_id: asset_2
                asset_type: directory_listing
                title: "Descripción para Google Business"
                content: "Panadería El Buen Horno ofrece pan fresco y bollería artesanal..."
```

---

## 5. Historias de Usuario

### Imprescindibles

#### Historia 1
Título: Capturar el perfil de negocio mediante un proceso de incorporación guiado
Como Owner
Quiero completar un formulario guiado de incorporación que capture los datos clave de mi negocio
Para disponer de un `BusinessProfile` normalizado y reutilizable para generar activos digitales.

Criterios de aceptación:
- Dado que estoy autenticado como Owner, cuando completo el formulario de incorporación con los campos obligatorios, entonces el sistema crea un `BusinessProfile` en estado `draft`.
- Dado que el formulario contiene datos incompletos o inválidos, cuando intento enviarlo, entonces el sistema muestra las validaciones y no crea el perfil.
- Dado que el Owner confirma la información, cuando guardo la incorporación, entonces el sistema persiste el perfil y registra la acción en `AuditLog`.

Casos borde:
- Si el Owner omite `gdpr_consent`, el sistema debe bloquear la generación de activos posteriores y mostrar el error `gdpr_consent_required`.

#### Historia 2
Título: Normalizar el perfil y generar recomendaciones de IA para el perfil canónico
Como Admin
Quiero que el sistema proponga normalizaciones de campos clave con explicaciones
Para validar y aprobar un `BusinessProfile` que sea consistente antes de generar activos.

Criterios de aceptación:
- Dado que existe un `BusinessProfile` en estado `draft`, cuando el sistema ejecuta la normalización, entonces crea una `AIRecommendation` con `model_version`, `score` y `explanation`.
- Dado que la normalización sugiere cambios en categoría o dirección, cuando el Admin revisa la recomendación, entonces puede aceptar o rechazar la propuesta y el perfil solo avanza a `normalized` tras la aprobación humana.
- Dado que se aprueba la normalización, cuando se actualiza el perfil, entonces el sistema registra la acción en `AuditLog`.

Casos borde:
- Si la normalización falla por falta de datos esenciales, el flujo debe dejar el perfil en `draft` y notificar al Admin para completar los campos.

#### Historia 3
Título: Generar un paquete de activos web y de directorio desde el perfil normalizado
Como Owner
Quiero solicitar la generación de un paquete de activos digitales una vez el perfil esté normalizado
Para obtener contenido listo para revisión sin escribir los textos manualmente.

Criterios de aceptación:
- Dado que el `BusinessProfile` está en estado `normalized`, cuando solicito la generación, entonces el sistema crea un `AssetPackage` y un `GeneratedAsset` en estado `pending`.
- Dado que el worker procesa la tarea asíncrona, cuando la generación termina correctamente, entonces el sistema actualiza el `GeneratedAsset` a `ready_for_review` y crea `QualityCheck` y `AIRecommendation`.
- Dado que la generación falla por timeout o por un error de IA, cuando el worker marca el asset, entonces el estado se convierte en `error` o `needs_edit` y se notifica al Owner.

Casos borde:
- Si el perfil no está `normalized`, el sistema debe rechazar el pedido con `profile_not_normalized` y no encolar la tarea.

#### Historia 4
Título: Revisar y editar una variación de activo generada antes de aprobarla
Como Owner
Quiero seleccionar una variación generada, editarla y guardarla como versión nueva
Para asegurar que el contenido final refleje correctamente mi mensaje de negocio.

Criterios de aceptación:
- Dado que hay variaciones disponibles, cuando el Owner selecciona una variación y edita el contenido, entonces el sistema guarda una nueva `AssetVariation` y mantiene la versión anterior.
- Dado que edito una variación, cuando la guardo, entonces el cambio queda registrado con `created_by` y `AuditLog`.
- Dado que una variación requiere más trabajo, cuando el Owner guarda, entonces el `GeneratedAsset` puede permanecer en `needs_edit` hasta que se apruebe.

Casos borde:
- Si hay un conflicto de edición concurrente, el sistema debe advertir al Owner y exigir guardar como nueva versión.

#### Historia 5
Título: Publicar manualmente un activo aprobado con trazabilidad
Como Owner
Quiero iniciar la publicación de un activo aprobado y registrar el resultado
Para cerrar el ciclo del activo con control humano y evidencia de auditoría.

Criterios de aceptación:
- Dado que el `GeneratedAsset` o `AssetVariation` está `approved`, cuando inicio la publicación, entonces se crea un `PublicationTask` en `queued` y se emite `publication.requested`.
- Dado que el worker procesa la publicación, cuando la integración externa responde con éxito, entonces la `PublicationTask` pasa a `completed` y registra `AuditLog`.
- Dado que la publicación falla por credenciales o formato, cuando termina el intento, entonces el sistema actualiza la tarea a `failed` y notifica el motivo.

Casos borde:
- Si las credenciales de integración no están autorizadas, la publicación debe fallar con `integration_auth_failed` sin intentar publicar el contenido.

### Convenientes

#### Historia 6
Título: Visualizar métricas básicas de activación y publicación
Como Owner
Quiero ver un panel con la tasa de activación y el porcentaje de perfiles con activos
Para medir si el producto está generando resultados y priorizar los próximos pasos.

Criterios de aceptación:
- Dado que existen `BusinessProfile`, `GeneratedAsset` y `PublicationTask`, cuando accedo al panel, entonces veo métricas de activación, assets publicados y tiempo hasta la publicación.
- Dado que hay datos insuficientes, cuando ingreso al panel, entonces se muestra un mensaje claro de que se necesita más actividad para obtener métricas confiables.
- Dado que se actualizan los activos, cuando el panel se recarga, entonces los valores reflejan los datos actuales del sistema.

Casos borde:
- Si no hay ningún `GeneratedAsset` aprobado, el panel debe indicar `0% assets publicados` y no mostrar datos inválidos.

#### Historia 7
Título: Compartir un activo para revisión colaborativa con acceso temporal
Como Owner
Quiero generar un enlace de revisión temporal para un colaborador
Para recoger feedback sin dar acceso total al sistema.

Criterios de aceptación:
- Dado que el `GeneratedAsset` está en `ready_for_review`, cuando creo un enlace de revisión, entonces el sistema emite `asset.review.shared` y genera un token temporal.
- Dado que el colaborador utiliza el enlace, cuando accede, entonces puede añadir comentarios y estos se registran y notifican al Owner.
- Dado que el token expira, cuando se usa después de la expiración, entonces el sistema devuelve 401 y registra el intento en `AuditLog`.

Casos borde:
- Si el colaborador intenta editar sin permiso, el sistema debe responder 403 `insufficient_permissions` y no permitir cambios.

---

## 6. Tickets de Trabajo

**Ticket 1**

- ID: BE-101
- Nombre: Implementar creación de `BusinessProfile` y proceso de incorporación
- Descripción: Desarrollar el endpoint y la lógica backend para recibir las respuestas del formulario de incorporación, crear un `BusinessProfile` en estado `draft`, validar los campos obligatorios y capturar `gdpr_consent` como requisito para las siguientes etapas.
- Objetivo: Asegurar que los datos del negocio se almacenan de forma estructurada y que el sistema bloquea la generación de activos si falta consentimiento GDPR.
- Dependencias: Datos de dominio de campos obligatorios, esquema de `BusinessProfile`, servicio de auditoría para registrar acciones.
- Estimación: 5
  - Justificación: Incluye validación de formulario, persistencia, gestión de estado y auditoría; se trata de una integración moderada con lógica de negocio y varias reglas de validación.

**Ticket 2**

- ID: FE-102
- Nombre: Implementar interfaz de revisión de normalización y estado de `BusinessProfile`
- Descripción: Crear la pantalla frontend que presenta las recomendaciones de normalización generadas por IA, permite al Admin aceptar o rechazar cambios en categoría, dirección y otros campos clave, y visualiza el estado `draft` frente a `normalized`.
- Objetivo: Brindar una experiencia clara para validar el perfil antes de avanzar a la generación de activos, reduciendo errores de datos y manteniendo trazabilidad.
- Dependencias: Endpoints backend de normalización y aprobación, datos de `BusinessProfile`, esquema de rutas de estado y componente de notificaciones.
- Estimación: 3
  - Justificación: Trabajo frontend con componente de estado y presentación de recomendaciones; tiene complejidad moderada, pero no involucra lógica de negocio pesada.

**Ticket 3**

- ID: DB-103
- Nombre: Diseñar e implementar el modelo de datos para generación de activos y control de estado
- Descripción: Definir tablas y relaciones para `AssetPackage`, `GeneratedAsset`, `AssetVariation`, `QualityCheck` y `PublicationTask`, incluyendo los estados `pending`, `ready_for_review`, `needs_edit` y `approved`. Garantizar los índices necesarios para consultas por `profile_id` y estado.
- Objetivo: Dar soporte a la cadena de generación, revisión y publicación de activos con persistencia consistente y buen rendimiento en consultas de estado.
- Dependencias: Requisitos de negocio para la generación asíncrona, definición de estados de asset, esquemas existentes de `BusinessProfile` y sesión de descubrimiento.
- Estimación: 8
  - Justificación: Incluye diseño de schema, creación de múltiples tablas y relaciones, y optimización de consultas; requiere mayor cuidado de integridad y estructura de datos.

---

## 6.1 Fases futuras

Las historias de usuario convenientes (Historias 6 y 7) se consideran parte de una fase siguiente al MVP. Estas mejoras de panel de métricas y revisión colaborativa son importantes, pero se han diferenciado para mantener el alcance actual enfocado en el proceso de incorporación, la normalización y la generación de activos revisables.

- Historia 6: métricas básicas de activación y publicación. Se pospone para la próxima iteración una vez el flujo de generación/revisión esté validado.
- Historia 7: compartir activos para revisión colaborativa con acceso temporal. Se planifica como una extensión de experiencia post-MVP para evitar complejidad adicional en el lanzamiento inicial.

## 7. Solicitudes de cambio

> Documenta 3 de las solicitudes de cambio realizadas durante la ejecución del proyecto

**Solicitud de cambio 1**

**Solicitud de cambio 2**

**Solicitud de cambio 3**

---

## Implementación ejecutable — Entrega 2

El MVP ejecutable reconcilia las propuestas de la Entrega 1 con el contrato explícito de la Entrega 2. El backend utiliza NestJS + TypeScript + Prisma + PostgreSQL; el frontend utiliza React + TypeScript + Vite. La propuesta de FastAPI/SQLAlchemy del PRD y el modelo ampliado de publicación quedan registrados como alternativas arquitectónicas aplazadas en [`docs/ENTREGA2-IMPLEMENTATION-CONTRACT.md`](docs/ENTREGA2-IMPLEMENTATION-CONTRACT.md).

### Configuración local

Requisitos: Node.js 20+, npm y Docker Desktop con el daemon de Docker en ejecución.

```bash
cp .env.example .env
npm install
docker compose up -d postgres
npm run prisma:generate
npm run prisma:migrate
npm run dev:backend
npm run dev:frontend
```

Abre `http://localhost:5173`. La API se ejecuta en `http://localhost:3000`.

La implementación de IA predeterminada es una simulación síncrona. No se necesita una clave de API de proveedor para el desarrollo local ni para las pruebas. Es necesario sustituir `JWT_SECRET` por un secreto local en `.env`; `.env` está excluido de Git.

### Flujo del MVP implementado

`REGISTER → LOGIN → CREATE BUSINESS → COMPLETE DISCOVERY → REVIEW/APPROVE PROFILE → GENERATE DIGITAL PRESENCE → REVIEW/EDIT FIVE ASSETS`

Los cinco tipos de activos generados son exactamente:

- `BUSINESS_SUMMARY`
- `WEBSITE_CONTENT`
- `GOOGLE_BUSINESS_DESCRIPTION`
- `SOCIAL_MEDIA_BIO`
- `FAQ`

### API implementada

Todas las rutas tienen el prefijo `/api/v1`.

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `POST /business`
- `GET /business`
- `POST /discovery/submit`
- `GET /business-profile?businessId=...`
- `POST /business-profile/review`
- `POST /assets/generate-digital-presence`
- `GET /assets?businessId=...`
- `GET /assets/:id`
- `PATCH /assets/:id`
- `POST /assets/:id/regenerate`

### Verificación

El repositorio incluye pruebas unitarias para la normalización, la fundamentación del contexto de IA, la validación de resultados y el servicio de generación de IA, además de pruebas HTTP para la creación de negocios, el envío del descubrimiento y la generación.

#### E2E automatizado database-backed

La prueba E2E automatizada recorre exactamente:

```text
REGISTER
→ LOGIN
→ CREATE BUSINESS
→ DISCOVERY
→ APPROVE PROFILE
→ GENERATE FIVE ASSETS
→ VERIFY DATABASE PERSISTENCE
```

Utiliza `AppModule` real, `PrismaService` real, PostgreSQL real, controllers y services reales, sin mockear repositorios ni la persistencia. Verifica la persistencia de las seis entidades, los cinco tipos de assets y los snapshots/metadata de `AIGeneration`.

#### Validación adicional

Por separado, edit, regeneration, preservation of `AIGeneration` history y ownership isolation fueron verificados mediante tests de servicio y validación manual del flujo real contra NestJS + Prisma + PostgreSQL. Estas comprobaciones adicionales no forman parte del E2E automatizado descrito anteriormente.

Verificado localmente:

- Validación del esquema de Prisma
- Verificación de tipos de backend y frontend
- Análisis estático de backend y frontend
- Compilación de producción de backend y frontend
- Suite de pruebas backend: 12 suites y 27 pruebas superadas
- E2E automatizado database-backed: `REGISTER → LOGIN → CREATE BUSINESS → DISCOVERY → APPROVE PROFILE → GENERATE FIVE ASSETS → VERIFY DATABASE PERSISTENCE`, contra NestJS + Prisma + PostgreSQL reales.
- Validación adicional manual y mediante tests de servicio: edición, regeneración, conservación del historial de `AIGeneration` y aislamiento de ownership.
- Pipeline AI: `DiscoveryResponses → BusinessProfile → ContextBuilder → PromptBuilder → LLMGateway → Validation → Asset/AIGeneration`.
- `BusinessProfile` es la fuente canónica de IA; `DiscoveryResponses` no se envía directamente al LLM.
- Para Entrega 2, `promptVersion=v1` y `contextVersion=v1` son versiones fijas y explícitas del MVP.

Quedan aplazados para una fase posterior a la Entrega 2: publicación externa, integraciones con CMS/Google, OAuth, colaboración, notificaciones, búsqueda, analítica/KPIs, evaluación externa de IA, colas, workers y la infraestructura asíncrona.
