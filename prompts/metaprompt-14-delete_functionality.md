# METAPROMPT LLM GEMINI

**_FEATURE: FUNCIONALIDAD DE BORRADO DE PLANTILLAS_**

Gemini como Arquitecto de Producto refina este prompt para /create-spec de agent-os.

El objetivo de la feature es añadir la posibilidad de borrar versiones, templates y comparisons (hacer las modificaciones en los endpoints del backend, el frontend y definir los delete cascada en bbdd donde sea necesario) :

- Al borrar una comparación se deben los registros en la tabla comparisons y comparisons_fields. Tanto si se borra la source_version_id como la target_version_id
- Cuando se borrar una versión se deben borrar los registros template_versions y los de template_fields y las comparaciones en las que interviene (tabla comparisons y comparisons_fields). Si esta versión es source_version_id como target_version_id
  - Si la versión a borrar es la actual (is_current=true) no se debe dejar borrar la versión: arrojar un error al usuario indicando que debe borrar el template
- Cuando se borrar un template (tabla pdf_template) se debe borrar el template, sus versiones (tabla template_versions), los campos de esas versiones (tabla template_fields) y las comparaciones en las que interviene (tabla comparisons y comparisons_fields). Si cualquiera de sus versiones es source_version_id como target_version_id

Solo existe el endpoint delete templates (DELETE /api/v1/templates/{template_id}) y ya tiene implementado el delete cascada, crear los endpoint delete version (templates/versions) y comparisons.  
Antes de hacer nada revisa la estructura de base de datos existente y los endpoints para que el nuevo código sea coherente.  
Frontend: Añadir el típico icono de la papelera para borrar en las páginas /templates, /comparisons. Para borrar una versión usar la modal “Version History” accesible desde la ruta /templates. Pedir confirmación al usuario para proceder al borrado

# RESPUESTA DEL MODELO (prompt refinado)

## 📋 SPEC: Implementación de Funcionalidad de Borrado (Templates, Versiones y Comparaciones)

### 🎯 Objetivo

Implementar la funcionalidad completa de borrado (DELETE) para las tres entidades principales (`Template`, `TemplateVersion`, `Comparison`), asegurando la integridad referencial de los datos a través de **Delete Cascade** en el modelo de base de datos y la validación de la lógica de negocio en el _backend_ (no permitir el borrado de la versión actual).

### 1. Modificaciones en el Modelo de Datos (Backend/Alembic)

**Acción Requerida**: Revisar los modelos de SQLAlchemy y generar la migración Alembic (`alembic revision --autogenerate`) necesaria para establecer las reglas `ondelete="CASCADE"` en las siguientes Claves Foráneas (FKs):

| Tabla Padre         | Dependencias (Hijos)          | FK a Revisar/Asegurar CASCADE                                      |
| :------------------ | :---------------------------- | :----------------------------------------------------------------- |
| `comparisons`       | `comparison_fields`           | `comparison_fields.comparison_id`                                  |
| `template_versions` | `template_fields`             | `template_fields.version_id`                                       |
| `pdf_templates`     | `template_versions`           | `template_versions.template_id`                                    |
| `pdf_templates`     | `comparisons` (source/target) | `comparisons.source_template_id`, `comparisons.target_template_id` |

### 2. Implementación de Endpoints (Backend - FastAPI)

#### A. Borrar Comparación

- **Endpoint**: `DELETE /api/v1/comparisons/{comparison_id}`
- **Lógica**: Eliminar el registro de `comparisons`. El CASCADE debe eliminar `comparison_fields`.
- **Respuesta**: HTTP 204 No Content.

#### B. Borrar Versión (Nuevo Endpoint)

- **Endpoint**: `DELETE /api/v1/templates/{template_id}/versions/{version_id}`
- **Lógica**:
  1.  **VALIDACIÓN CRÍTICA**: Comprobar si `template_versions.is_current` es **True**.
  2.  Si es True, **DENIEGA** la operación (HTTP 400) con mensaje: "Cannot delete current version. Please delete the entire template instead."
  3.  Si es False, eliminar el registro de `template_versions`. El CASCADE debe eliminar `template_fields` y las comparaciones asociadas.
- **Respuesta**: HTTP 204 No Content.

#### C. Borrar Template (Refactorización y Refuerzo)

- **Endpoint**: `DELETE /api/v1/templates/{template_id}` (Existente)
- **Lógica**:
  1.  Eliminar el registro de `pdf_templates`. El CASCADE debe limpiar todas sus versiones, campos y comparaciones.
  2.  **Borrado Físico**: Tras la eliminación exitosa en DB, eliminar **todos** los archivos PDF asociados a las versiones borradas del sistema de archivos (`./uploads`).
- **Respuesta**: HTTP 204 No Content.

### 3. Implementación en el Frontend (React/TypeScript)

**Requisito de UX**: En todos los casos, se debe mostrar una **Modal de Confirmación** antes de ejecutar el DELETE.

| Página/Componente            | Icono                                    | Endpoint a Llamar                                              |
| :--------------------------- | :--------------------------------------- | :------------------------------------------------------------- |
| **`/templates`** (Listado)   | Icono de Papelera (🗑️) por fila.         | `DELETE /api/v1/templates/{template_id}`                       |
| **`/comparisons`** (Listado) | Icono de Papelera (🗑️) por fila.         | `DELETE /api/v1/comparisons/{comparison_id}`                   |
| **Modal "Version History"**  | Icono de Papelera (🗑️) por cada versión. | `DELETE /api/v1/templates/{template_id}/versions/{version_id}` |

### 4. Integración de Actividad (Activity Log)

**Acción Requerida**: Modificar el servicio de _Activity Log_ para registrar los siguientes eventos de borrado:

- `TEMPLATE_DELETED`
- `VERSION_DELETED`
- `COMPARISON_DELETED`

### 5. Checklist de Pruebas Unitarias (Backend)

- Probar que el borrado de una versión actual (`is_current=True`) falla (HTTP 400).
- Probar que el borrado de una versión antigua (`is_current=False`) es exitoso.
- Probar que el borrado de un Template elimina físicamente los archivos PDF.
- Probar la eliminación en cascada de `comparison_fields` al borrar `comparisons`.
