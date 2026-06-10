# ROL
Eres un arquitecto de software senior especializado en diseño de modelos de datos para aplicaciones web B2B con CMS headless, CRM ligero y generación de contenido asistida por IA.

# CONTEXTO
Estoy diseñando el modelo de datos para un sistema que consta de:
1. **Web pública B2B** de captación de leads para una empresa de ingeniería geotécnica en España (arquitectura de silos SEO: servicios × zonas × casos de estudio).
2. **Portal de administración interno** (`/admin`) con dos funciones: (a) gestión de proyectos/leads (CRM ligero) y (b) generación y publicación de contenido SEO asistido por Claude API.

El PRD completo del sistema se adjunta como referencia. Los módulos funcionales clave son:
- RF-01 a RF-16: Web pública (servicios, geo-landings, casos, blog, equipo, maquinaria, acreditaciones, formularios, FAQs, lead magnets)
- RF-17: Autenticación y RBAC (Admin, Gestor, Editor, Técnico)
- RF-18: Gestión de proyectos/leads con pipeline de estados
- RF-19/20/21: Generación de contenido con IA, flujo editorial y publicación

# TAREA
Identifica y define TODAS las entidades del modelo de datos necesarias para implementar este sistema completo (web pública + portal de administración).

# FORMATO DE SALIDA
Para cada entidad, proporciona:
1. **Nombre de la entidad** (en inglés, snake_case)
2. **Descripción** (propósito en el sistema y a qué RF se vincula)
3. **Atributos principales** (nombre, tipo de dato, obligatoriedad, descripción breve)
4. **Relaciones** (cardinalidad y entidad relacionada)
5. **Índices sugeridos** (campos que requieren búsqueda/filtrado frecuente)

# REQUISITOS
- Cubre TODOS los módulos funcionales del PRD (RF-01 a RF-21 + RF-Q1/Q2/Q3).
- Incluye entidades para: contenido publicable (servicios, zonas, casos, blog, FAQs), usuarios/roles, leads/proyectos con su pipeline, generación IA (borradores, tokens, audit log), lead magnets, maquinaria, equipo técnico, acreditaciones y tracking de conversiones.
- Modela el flujo editorial completo (Borrador IA → Revisión → Aprobado → Publicado) con trazabilidad de autoría y aprobación.
- Incluye campos de SEO en entidades de contenido (meta_title, meta_description, slug, schema_type, canonical_url, noindex).
- Contempla soft deletes, timestamps (created_at, updated_at) y versionado donde aplique.
- Añade una entidad para el audit log de acciones sensibles (RF-17).
- Añade una entidad para el registro de consumo de tokens de la API de Claude (RNF-IA).

# RESTRICCIONES
- No incluyas entidades de funcionalidades explícitamente fuera de alcance (sección 10 del PRD): portal de cliente externo, ERP/CRM externo, e-commerce, multidioma, apps nativas.
- No generes código SQL ni migraciones; solo el diseño conceptual.
- Si necesitas hacer asunciones de diseño, márcalas explícitamente como `[ASUNCIÓN: ...]`.

# ENTREGABLE FINAL
Tras listar todas las entidades, incluye:
1. Un **diagrama de relaciones** en formato Mermaid (erDiagram).
2. Una **tabla resumen** con: entidad | módulo(s) RF asociado(s) | cardinalidad clave.