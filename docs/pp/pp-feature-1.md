## 2. Feature 1: Gestión del Ciclo de Vida de la Vacante (Prioridad: Muy Alta)

### 2.1. Objetivos de Prueba

* Verificar las operaciones CRUD (Crear, Leer, Actualizar) para las Vacantes.
* Validar la correcta implementación de los diferentes estados de una vacante (Borrador, Publicada, Cerrada, Archivada) y las transiciones permitidas entre ellos.
* Asegurar que las fechas relevantes (`fecha_creacion`, `fecha_actualizacion`, `fecha_publicacion`, `fecha_cierre`) se gestionan correctamente.
* Confirmar que las validaciones de campos obligatorios (título, ubicación) funcionan.
* (Opcional - Could Have) Validar la funcionalidad de creación y uso de plantillas de vacantes.

### 2.2. User Stories Cubiertas

* [US-05: Crear Nueva Vacante](./us/us-05-crear-nueva-vacante.md)
* [US-06: Editar Vacante Existente](./us/us-06-editar-vacante-existente.md)
* [US-07: Publicar/Despublicar Vacante](./us/us-07-publicar-despublicar-vacante.md)
* [US-08: Utilizar Plantillas para Crear Vacantes](./us/us-08-utilizar-plantilla-vacante.md) (Could Have)

### 2.3. Enfoque de Pruebas Específico

* **Pruebas Funcionales:**
    * **UI (Frontend - TK-019, TK-020, TK-024, TK-025, TK-028, TK-029, TK-033, TK-034, TK-035):**
        * **Creación (US-05):** Probar el formulario "Crear Nueva Vacante". Verificar campos obligatorios, guardar, cancelar, redirección post-guardado.
        * **Edición (US-06):** Probar el formulario "Editar Vacante". Verificar la carga de datos existentes, modificación de todos los campos editables, guardado de cambios, cancelación.
        * **Cambio de Estado (US-07):** Probar los botones/controles para Publicar, Cerrar, Reabrir, Archivar. Verificar que los controles correctos se muestren según el estado actual. Confirmar la actualización visual del estado tras la acción.
        * **Plantillas (US-08 - Could Have):** Probar la acción "Guardar como Plantilla" (modal, nombre, guardado - TK-033). Probar la acción "Cargar desde Plantilla" (listar, seleccionar, pre-rellenar formulario - TK-034). Probar la interacción con la API de plantillas (TK-035).
    * **API (Backend - TK-017, TK-021, TK-022, TK-026, TK-031):**
        * Probar `POST /jobs` (TK-017): Crear vacante con datos válidos e inválidos. Verificar respuesta 201 y datos creados.
        * Probar `GET /jobs/{id}` (TK-021): Obtener detalles de vacante existente e inexistente (404).
        * Probar `PATCH /jobs/{id}` (TK-022): Actualizar diferentes campos. Verificar respuesta 200 y datos actualizados. Probar con ID inexistente (404).
        * Probar `PATCH /jobs/{id}/status` (TK-026): Probar transiciones de estado válidas e inválidas. Verificar respuesta 200, nuevo estado y actualización de fechas (`fecha_publicacion`, `fecha_cierre`). Probar con ID inexistente (404) o transición inválida (400/409).
        * Probar API CRUD Plantillas (`/job-templates` - TK-031) (Could Have): Probar listar, obtener, crear (desde vacante y directo), eliminar.
* **Pruebas de Integración:**
    * Verificar la interacción FE/BE para todas las operaciones CRUD de vacantes y cambios de estado.
    * (Could Have) Verificar interacción FE/BE para plantillas.
* **Pruebas de Seguridad:**
    * Confirmar que solo usuarios autenticados (con rol adecuado, ej. Reclutador/Admin) pueden realizar operaciones CRUD y cambios de estado en vacantes (requiere probar con diferentes roles).
* **Pruebas de Usabilidad (TK-019, TK-024):** Revisar la claridad y facilidad de uso de los formularios de creación/edición y los controles de cambio de estado.
* **Pruebas Unitarias (TK-018, TK-023, TK-027, TK-032):** Responsabilidad del desarrollador verificar la lógica de negocio (validaciones, lógica de fechas, máquina de estados, interacción BBDD).

### 2.4. Datos de Prueba Necesarios

* Usuarios con roles Reclutador y Admin.
* Datos de ejemplo para vacantes (títulos, ubicaciones, descripciones).
* (Could Have) Plantillas pre-guardadas si se prueba US-008.

### 2.5. Priorización Interna

1.  **Crear Vacante (US-05):** Fundamental.
2.  **Editar Vacante (US-06):** Fundamental.
3.  **Publicar/Despublicar (US-07):** Esencial para el ciclo de vida.
4.  **Plantillas (US-08):** Menor prioridad (Could Have).

---