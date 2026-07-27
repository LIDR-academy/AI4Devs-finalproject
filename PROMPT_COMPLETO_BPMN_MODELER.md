# PROMPT COMPLETO: Modelador BPMN con Extensiones OOP

## Descripción General

Crea una aplicación web completa de **Modelador BPMN con extensiones OOP (Object-Oriented Programming)**. Es una herramienta profesional para diseñar, versionar y colaborar en diagramas de procesos de negocio BPMN 2.0, con capacidades avanzadas de integración de metadatos orientados a objetos.

---

## Stack Tecnológico

### Backend
- **Framework**: FastAPI (Python)
- **Base de Datos**: MongoDB con Motor (async driver)
- **Autenticación**: Emergent Google OAuth
- **IA**: Gemini 3 Flash via `emergentintegrations` library
- **WebSockets**: FastAPI WebSocket nativo para colaboración en tiempo real
- **Puerto**: 8001

### Frontend
- **Framework**: React 18 con Create React App (craco)
- **Estilos**: Tailwind CSS + shadcn/ui components
- **Editor BPMN**: bpmn-js v17 con bpmn-js-properties-panel v5
- **Drag & Drop**: @hello-pangea/dnd
- **Iconos**: Lucide React
- **Notificaciones**: Sonner (toast)
- **Animaciones**: Framer Motion
- **Puerto**: 3000

### Variables de Entorno

**Backend (.env)**:
```
MONGO_URL="mongodb://localhost:27017"
DB_NAME="bpmn_modeler"
CORS_ORIGINS="*"
EMERGENT_LLM_KEY=<tu-key>
```

**Frontend (.env)**:
```
REACT_APP_BACKEND_URL=<url-del-backend>
```

---

## Entidades de Base de Datos (MongoDB Collections)

### 1. users
```javascript
{
  user_id: string,        // UUID generado
  email: string,          // Email de Google
  name: string,           // Nombre completo
  picture: string,        // URL avatar
  created_at: datetime
}
```

### 2. user_sessions
```javascript
{
  user_id: string,
  session_token: string,  // Token de sesión
  expires_at: datetime,   // Expiración (7 días)
  created_at: datetime
}
```

### 3. diagrams (BpmnDiagram)
```javascript
{
  id: string,             // UUID
  name: string,           // Nombre del diagrama (requerido)
  description: string,    // Descripción
  current_xml: string,    // XML actual del diagrama BPMN (requerido)
  current_version: int,   // Número de versión actual (default 1)
  tags: [string],         // Etiquetas para organizar
  created_by: string,     // Email del creador
  created_at: datetime,
  updated_at: datetime
}
```

### 4. versions (BpmnVersion)
```javascript
{
  id: string,
  diagram_id: string,           // ID del diagrama padre (requerido)
  version_number: int,          // Número de versión (requerido)
  xml_content: string,          // Contenido XML de esta versión (requerido)
  commit_message: string,       // Mensaje descriptivo de los cambios
  validation_status: string,    // "valid" | "warning" | "error"
  validation_errors: [string],  // Errores encontrados
  tags: [string],               // Tags de versión (production, hotfix, feature)
  annotations: string,          // Notas personalizadas
  parent_version: int,          // Versión padre para árbol de versiones
  changed_elements: [string],   // IDs de elementos modificados
  created_by: string,
  created_at: datetime
}
```

### 5. oop_classes (OOPClass)
```javascript
{
  id: string,
  name: string,           // Nombre de la clase (requerido)
  description: string,    // Descripción y propósito
  properties: [{          // Lista de propiedades
    name: string,
    type: string,         // string|number|boolean|date|array|object|reference
    description: string,
    required: boolean,
    referenceClass: string,   // Para type="reference"
    arrayItemType: string,    // Para type="array"
    arrayItemClass: string    // Para arrays de referencias
  }],
  category: string,       // order|payment|shipping|customer|inventory|other
  tags: [string],
  created_by: string,
  created_at: datetime,
  updated_at: datetime
}
```

### 6. oop_class_versions (OOPClassVersion)
```javascript
{
  id: string,
  class_id: string,       // ID de la clase (requerido)
  class_name: string,     // Nombre de la clase (requerido)
  version_number: int,    // Número de versión (requerido)
  description: string,
  properties: [OOPProperty],
  category: string,
  tags: [string],
  commit_message: string,
  changes_summary: {      // Resumen de cambios
    added: [string],
    removed: [string],
    modified: [string]
  },
  created_by: string,
  created_at: datetime
}
```

### 7. branches (Branch)
```javascript
{
  id: string,
  diagram_id: string,     // Diagrama principal (requerido)
  name: string,           // Nombre de rama (requerido)
  description: string,
  base_version: int,      // Versión base
  current_xml: string,    // XML actual de la rama (requerido)
  current_version: int,
  is_merged: boolean,
  merged_version: int,    // Versión donde se fusionó
  status: string,         // active|merged|archived
  created_by: string,
  created_at: datetime
}
```

### 8. comments (Comment)
```javascript
{
  id: string,
  diagram_id: string,     // ID del diagrama (requerido)
  element_id: string,     // ID del elemento BPMN (requerido)
  element_name: string,   // Nombre del elemento (requerido)
  content: string,        // Contenido del comentario (requerido)
  mentions: [string],     // Emails mencionados
  parent_comment_id: string,  // Para hilos de respuestas
  is_resolved: boolean,
  created_by: string,
  created_by_name: string,
  created_at: datetime
}
```

### 9. notifications (Notification)
```javascript
{
  id: string,
  recipient_email: string,    // Email del destinatario (requerido)
  type: string,               // mention|reply|diagram_update|version_saved
  message: string,            // Mensaje de notificación (requerido)
  from_user: string,          // Email del remitente (requerido)
  diagram_id: string,
  diagram_name: string,
  comment_id: string,
  is_read: boolean,
  created_at: datetime
}
```

### 10. favorites (Favorite)
```javascript
{
  id: string,
  user_id: string,        // ID del usuario (requerido)
  diagram_id: string,     // ID del diagrama (requerido)
  diagram_name: string,   // Nombre del diagrama (requerido)
  created_at: datetime
}
```

### 11. components (BpmnComponent)
```javascript
{
  id: string,
  name: string,           // Nombre del componente (requerido)
  xml_fragment: string,   // XML del componente (requerido)
  description: string,
  category: string,       // subprocess|event|task|gateway|pattern|other
  preview_image: string,  // URL de preview
  tags: [string],
  is_public: boolean,
  usage_count: int,       // Contador de usos
  created_by: string,
  created_at: datetime
}
```

### 12. git_repos (GitRepository)
```javascript
{
  id: string,
  name: string,           // Nombre del repo (requerido)
  provider: string,       // github|gitlab|bitbucket (requerido)
  repository_url: string, // URL del repositorio (requerido)
  access_token: string,   // Token de acceso (requerido)
  default_branch: string, // Rama por defecto (default "main")
  current_branch: string,
  last_sync: datetime,
  sync_path: string,      // Ruta de sincronización (default "bpmn/")
  auto_sync: boolean,
  diagram_id: string,     // Diagrama asociado
  created_by: string,
  created_at: datetime
}
```

---

## API Endpoints (Prefijo /api)

### Autenticación
```
GET  /api/auth/session     - Obtener datos de sesión OAuth (Header: X-Session-ID)
GET  /api/auth/me          - Obtener usuario actual (Header: Authorization: Bearer <token>)
POST /api/auth/logout      - Cerrar sesión
```

### Diagramas
```
GET    /api/diagrams                    - Listar diagramas (?search=, ?tag=)
GET    /api/diagrams/{id}               - Obtener diagrama por ID
POST   /api/diagrams                    - Crear diagrama
PUT    /api/diagrams/{id}               - Actualizar diagrama
DELETE /api/diagrams/{id}               - Eliminar diagrama
```

### Versiones
```
GET  /api/diagrams/{id}/versions              - Listar versiones
POST /api/diagrams/{id}/versions              - Crear versión
GET  /api/diagrams/{id}/versions/{num}        - Obtener versión específica
POST /api/diagrams/{id}/revert/{num}          - Revertir a versión
```

### Ramas
```
GET  /api/diagrams/{id}/branches        - Listar ramas
POST /api/diagrams/{id}/branches        - Crear rama
PUT  /api/branches/{id}                 - Actualizar rama (body: current_xml)
POST /api/branches/{id}/merge           - Fusionar rama
```

### Clases OOP
```
GET    /api/oop-classes                 - Listar clases (?search=, ?category=)
GET    /api/oop-classes/{id}            - Obtener clase
POST   /api/oop-classes                 - Crear clase
PUT    /api/oop-classes/{id}            - Actualizar clase
DELETE /api/oop-classes/{id}            - Eliminar clase
GET    /api/oop-classes/{id}/versions   - Listar versiones de clase
```

### Comentarios
```
GET  /api/diagrams/{id}/comments        - Listar comentarios (?element_id=)
POST /api/diagrams/{id}/comments        - Crear comentario
PUT  /api/comments/{id}/resolve         - Marcar como resuelto
```

### Notificaciones
```
GET /api/notifications                  - Listar notificaciones del usuario
GET /api/notifications/unread-count     - Contar no leídas
PUT /api/notifications/{id}/read        - Marcar como leída
PUT /api/notifications/read-all         - Marcar todas como leídas
```

### Favoritos
```
GET    /api/favorites                   - Listar favoritos del usuario
POST   /api/favorites/{diagram_id}      - Añadir a favoritos
DELETE /api/favorites/{diagram_id}      - Quitar de favoritos
```

### Componentes BPMN
```
GET    /api/components                  - Listar componentes (?search=, ?category=)
POST   /api/components                  - Crear componente
PUT    /api/components/{id}             - Actualizar componente
DELETE /api/components/{id}             - Eliminar componente
POST   /api/components/{id}/use         - Incrementar contador de uso
```

### Repositorios Git
```
GET    /api/git-repos                   - Listar repositorios del usuario
POST   /api/git-repos                   - Crear configuración de repo
DELETE /api/git-repos/{id}              - Eliminar configuración
```

### IA (Gemini 3 Flash)
```
POST /api/ai/generate-bpmn              - Generar diagrama desde prompt
     Body: { prompt: string, context?: string }
     Response: { xml: string }

POST /api/ai/analyze-code               - Analizar código y generar BPMN
     Body: { code: string, language: string }
     Response: { xml: string }
```

### Dashboard
```
GET /api/stats                          - Obtener estadísticas
GET /api/tags                           - Obtener todos los tags con conteo
```

### Health
```
GET /api/                               - API info
GET /api/health                         - Health check
```

### WebSocket
```
WS /ws/diagram/{diagram_id}             - Colaboración en tiempo real
   Messages:
   - { type: "cursor", position: {x, y} }
   - { type: "select", element_id: string }
   - { type: "update", xml: string }
   - { type: "lock", element_id: string }
   - { type: "unlock", element_id: string }
   
   Server sends:
   - { type: "presence", users: [{id, name, color, cursor, selected_element}] }
   - { type: "cursor", user_id, position }
   - { type: "select", user_id, element_id }
   - { type: "update", user_id, xml }
   - { type: "lock/unlock", user_id, element_id }
```

---

## Páginas del Frontend

### 1. Landing Page (`/`)
- Hero section con título, descripción y CTAs
- Grid de 6 características principales con iconos
- Sección de beneficios con checklist
- CTA final con botón de registro
- Footer con logo y copyright

### 2. Login Page (`/login`)
- Card centrada con logo
- Botón de "Continuar con Google" (Emergent OAuth)
- Links a términos y políticas
- Botón para volver al inicio

### 3. Dashboard (`/dashboard`) - Protegida
- **Sidebar fijo** con navegación:
  - Logo + nombre app
  - Links: Dashboard, Biblioteca, Clases OOP, Componentes
  - Usuario actual con dropdown (Configuración, Cerrar Sesión)

- **Header** con:
  - Título y saludo
  - Dropdown de notificaciones con badge de no leídas
  - Botón "Nuevo Diagrama"

- **Contenido**:
  - Grid de 4 cards de estadísticas (diagramas, versiones, ramas, clases)
  - Card de favoritos con lista y botón para quitar
  - Card de actividad reciente (últimas versiones)
  - Grid de acciones rápidas (nuevo diagrama, biblioteca, clases, componentes)

### 4. Biblioteca de Diagramas (`/library`) - Protegida
- **Sidebar** igual que Dashboard + árbol de categorías/tags con contadores
- **Header** con búsqueda, selector de ordenamiento, botón nuevo diagrama
- **Contenido**:
  - Accordion por categorías (tags)
  - Cards de diagramas con: nombre, descripción, versión, fecha, tags
  - Acciones: abrir, gestionar tags, eliminar
  - Botón de favorito en cada card
- **Dialogs**:
  - Gestión de tags (añadir/quitar)
  - Confirmación de eliminación

### 5. Editor BPMN (`/editor` y `/editor/:diagramId`) - Protegida
- **Toolbar superior**:
  - Botón volver a biblioteca
  - Logo + nombre del diagrama + badge "Sin guardar"
  - Menú Archivo (Nuevo, Importar, Exportar BPMN/SVG)
  - Botón IA (generar diagrama)
  - Botón Analizar Código
  - Dropdown notificaciones
  - Toggles para paneles (Comentarios, OOP, Componentes)
  - Indicador de colaboradores
  - Botón Historial
  - Botón Ramas
  - Botón Guardar

- **Canvas central**:
  - bpmn-js Modeler con paleta de herramientas BPMN a la izquierda
  - Controles de zoom (-, fit, +) en esquina inferior derecha
  - Overlay de carga mientras inicializa

- **Panel derecho** (colapsable):
  - Tabs: Props, Comentarios, OOP
  - **Props**: muestra ID, tipo, nombre del elemento seleccionado + selectores de Input/Output Class OOP
  - **Comentarios**: lista de comentarios del elemento + textarea para nuevo comentario
  - **OOP**: lista de clases OOP arrastrables al canvas

- **Dialogs**:
  - Guardar versión (mensaje de commit + tags)
  - Generar con IA (textarea para prompt)
  - Analizar código (selector de lenguaje + textarea para código)
  - Gestión de ramas (crear, listar, fusionar)

- **Sheet lateral**:
  - Historial de versiones con botón revertir

### 6. Gestor de Clases OOP (`/oop-classes`) - Protegida
- **Sidebar** con filtro por categoría
- **Header** con búsqueda, ordenamiento, toggle vista grid/lista, botón nueva clase
- **Contenido**:
  - Vista Grid: cards con nombre, categoría, propiedades, acciones
  - Vista Lista: filas expandibles con propiedades
  - Acciones: editar, historial, duplicar, eliminar

- **Dialog de edición**:
  - Campos: nombre, descripción, categoría, tags
  - Lista de propiedades con drag & drop para reordenar
  - Cada propiedad: nombre, tipo, referencia (si aplica), requerido
  - Tipos soportados: string, number, boolean, date, array, object, reference

- **Dialog de historial**: lista de versiones con comparación

### 7. Catálogo de Componentes (`/components`) - Protegida
- **Sidebar** con filtro por categoría (subprocess, event, task, gateway, pattern, other)
- **Header** con búsqueda y botón nuevo componente
- **Contenido**: Grid de cards con icono de categoría, nombre, descripción, tags, contador de usos
- **Acciones**: preview, editar, duplicar, eliminar

- **Dialog de edición**: nombre, categoría, descripción, textarea para XML fragment
- **Dialog de preview**: muestra XML formateado con botón copiar

---

## XML BPMN por Defecto

```xml
<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" 
                  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" 
                  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" 
                  xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
                  xmlns:oop="http://schema.org/oop"
                  id="Definitions_1" 
                  targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="true">
    <bpmn:startEvent id="StartEvent_1" name="Inicio">
      <bpmn:outgoing>Flow_1</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:task id="Task_1" name="Tarea 1">
      <bpmn:incoming>Flow_1</bpmn:incoming>
      <bpmn:outgoing>Flow_2</bpmn:outgoing>
    </bpmn:task>
    <bpmn:endEvent id="EndEvent_1" name="Fin">
      <bpmn:incoming>Flow_2</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="Task_1" />
    <bpmn:sequenceFlow id="Flow_2" sourceRef="Task_1" targetRef="EndEvent_1" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="StartEvent_1_di" bpmnElement="StartEvent_1">
        <dc:Bounds x="179" y="99" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="185" y="142" width="25" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_1_di" bpmnElement="Task_1">
        <dc:Bounds x="270" y="77" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="EndEvent_1_di" bpmnElement="EndEvent_1">
        <dc:Bounds x="432" y="99" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="441" y="142" width="18" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_1_di" bpmnElement="Flow_1">
        <di:waypoint x="215" y="117" />
        <di:waypoint x="270" y="117" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_2_di" bpmnElement="Flow_2">
        <di:waypoint x="370" y="117" />
        <di:waypoint x="432" y="117" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>
```

---

## Integraciones

### Emergent Google OAuth
1. Login redirige a `https://auth.emergentagent.com/?redirect=<origin>/dashboard`
2. Google OAuth completa y redirige de vuelta con `#session_id=<id>`
3. Frontend detecta hash y llama a `/api/auth/session` con header `X-Session-ID`
4. Backend valida con `https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data`
5. Backend crea/actualiza usuario y sesión, devuelve `session_token`
6. Frontend guarda token en cookie y localStorage

### Gemini 3 Flash (emergentintegrations)
```python
from emergentintegrations.llm.chat import LlmChat, UserMessage

chat = LlmChat(
    api_key=EMERGENT_LLM_KEY,
    session_id=f"bpmn-gen-{uuid.uuid4()}",
    system_message="You are a BPMN 2.0 expert..."
).with_model("gemini", "gemini-3-flash-preview")

user_message = UserMessage(text=prompt)
response = await chat.send_message(user_message)
```

### WebSocket Collaboration
- Conexión por diagrama: `/ws/diagram/{diagram_id}`
- ConnectionManager mantiene conexiones activas por diagrama
- Broadcast de presencia, cursores, selecciones y actualizaciones
- Colores únicos por usuario

---

## Estilo Visual

### Colores principales
- **Primary**: Violet (262 83% 58%)
- **Background**: Slate-50 (#f8fafc)
- **Cards**: White con sombra sutil
- **Status**: 
  - Valid: Emerald (#10b981)
  - Warning: Amber (#f59e0b)
  - Error: Rose (#ef4444)

### Categorías OOP (badges)
- Order: Blue
- Payment: Green
- Shipping: Orange
- Customer: Purple
- Inventory: Yellow
- Other: Slate

### Tipografía
- Headings: Manrope (600-800)
- Body: Inter (400-600)
- Code: JetBrains Mono

### Componentes shadcn/ui utilizados
- Button, Input, Textarea, Label
- Card, Badge, Avatar
- Dialog, AlertDialog, Sheet
- Select, Tabs, Accordion
- ScrollArea, DropdownMenu
- Tooltip, Switch
- Sonner (toasts)

---

## Dependencias Frontend (package.json)

```json
{
  "dependencies": {
    "react": "^18.x",
    "react-dom": "^18.x",
    "react-router-dom": "^6.x",
    "bpmn-js": "^17.x",
    "bpmn-js-properties-panel": "^5.x",
    "@bpmn-io/properties-panel": "^3.x",
    "diagram-js": "^14.x",
    "@hello-pangea/dnd": "^16.x",
    "lucide-react": "^0.x",
    "framer-motion": "^11.x",
    "sonner": "^1.x",
    "uuid": "^9.x",
    "tailwindcss": "^3.x",
    "@radix-ui/react-*": "latest",
    "class-variance-authority": "^0.x",
    "clsx": "^2.x",
    "tailwind-merge": "^2.x"
  }
}
```

---

## Dependencias Backend (requirements.txt)

```
fastapi
uvicorn
motor
pydantic
python-dotenv
httpx
websockets
aiofiles
emergentintegrations
```

---

## Notas Importantes de Implementación

### MongoDB
- Siempre excluir `_id` en proyecciones: `{"_id": 0}`
- Crear copia del documento antes de `insert_one` (MongoDB muta añadiendo `_id`)
- Usar `datetime.now(timezone.utc)` y convertir a ISO string para almacenar

### bpmn-js
- Limpiar container antes de crear modeler: `containerRef.current.innerHTML = ''`
- Validar que XML tenga `bpmn:definitions` antes de importar
- Siempre incluir sección `bpmndi:BPMNDiagram` para que se renderice
- Usar fallback a diagrama por defecto si XML es inválido

### Autenticación
- Token se guarda en cookie Y localStorage (fallback)
- Verificar token en header `Authorization: Bearer <token>`
- URLs de redirect deben usar `window.location.origin` (nunca hardcodear)

### CORS
- Backend permite todos los orígenes por defecto (`*`)
- Para producción, configurar `CORS_ORIGINS` con dominios específicos

---

## Flujos de Usuario Principales

1. **Crear diagrama**: Dashboard → "Nuevo Diagrama" → Editor → Diseñar → Guardar
2. **Editar con OOP**: Seleccionar tarea → Panel Props → Asignar Input/Output Class
3. **Versionar**: Editar → Guardar → Mensaje de commit → Ver historial → Revertir si necesario
4. **Colaborar**: Múltiples usuarios abren mismo diagrama → Ven cursores → Editan → Sincroniza automáticamente
5. **Generar con IA**: Editor → Botón IA → Describir proceso → Generar → Ajustar
6. **Analizar código**: Editor → Analizar Código → Pegar código → Seleccionar lenguaje → Generar BPMN

---

## Estructura de Archivos

```
/app
├── backend/
│   ├── server.py           # API FastAPI completa
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── App.js          # Router y Auth
│   │   ├── App.css
│   │   ├── index.css       # Tailwind + estilos globales
│   │   ├── index.js
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── DiagramsLibrary.jsx
│   │   │   ├── BpmnEditorPage.jsx
│   │   │   ├── OOPClassesManager.jsx
│   │   │   └── BpmnComponentsLibrary.jsx
│   │   └── components/ui/  # shadcn components
│   ├── package.json
│   ├── tailwind.config.js
│   └── .env
└── memory/
    └── PRD.md
```

---

Este prompt contiene toda la información necesaria para regenerar la aplicación completa del Modelador BPMN con Extensiones OOP.
