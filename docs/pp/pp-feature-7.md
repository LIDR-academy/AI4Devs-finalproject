## 1. Feature 7: Administración y Configuración del Sistema (Prioridad: Muy Alta)

### 1.1. Objetivos de Prueba

* Validar que la definición de la API interna (Contrato OpenAPI) sea coherente y completa para la comunicación inicial requerida.
* Verificar que la funcionalidad de gestión de Etapas del Pipeline (CRUD, Reordenamiento, Flag IA) funcione correctamente y según los requisitos.
* Asegurar que la gestión básica de Usuarios (CRUD, Roles, Estado Activo/Inactivo) funcione según lo especificado y respete las constraints (email único).
* Validar que el sistema de autenticación (Login, Gestión de Sesión/Token, Protección de rutas) sea seguro y funcional.
* Confirmar que las funcionalidades de administración (Gestión Usuarios, Etapas) estén correctamente protegidas por el rol 'ADMIN'.

### 1.2. User Stories Cubiertas

* [US-01: Definir Contrato API Interna](./us/us-01-definir-contrato-api-interna.md)
* [US-02: Gestionar Etapas del Pipeline](./us/us-02-gestionar-etapas-pipeline.md)
* [US-03: Gestionar Usuarios Básicos](./us/us-03-gestionar-usuarios-basicos.md)
* [US-04: Autenticar Usuarios ATS](./us/us-04-autenticar-usuarios-ats.md)

### 1.3. Enfoque de Pruebas Específico

* **Pruebas Funcionales:**
    * **UI (Frontend - TK-002, TK-009, TK-014):**
        * Probar el formulario de Login con credenciales válidas, inválidas, usuario inactivo. Verificar redirección y mensajes de error.
        * Probar el CRUD completo de Usuarios desde la interfaz de administración (crear con roles, editar rol/estado, verificar lista). Prestar atención a validaciones (email único, campos obligatorios).
        * Probar el CRUD completo de Etapas del Pipeline (crear, editar nombre/flag IA, eliminar - validando restricciones).
        * Probar la funcionalidad de reordenamiento de etapas (drag-and-drop si se implementa) y verificar que el orden se persista.
    * **API (Backend - TK-003, TK-007, TK-012):**
        * Probar directamente el endpoint de Login (`POST /api/v1/auth/login`) con diferentes escenarios (éxito, credenciales incorrectas, usuario no encontrado, usuario inactivo). Verificar la respuesta (token/sesión) y códigos de estado.
        * Probar los endpoints CRUD de Usuarios (`GET /users`, `POST /users`, `GET /users/{id}`, `PATCH /users/{id}`). Verificar creación, validación de email único, actualización de rol/estado, correcta protección por rol ADMIN.
        * Probar los endpoints CRUD y de ordenamiento de Etapas (`GET /stages`, `POST /stages`, `PATCH /stages/{id}`, `PUT /stages/order`, `DELETE /stages/{id}`). Verificar creación, actualización (nombre, flag), reordenamiento y eliminación (con validación de uso). Protección por rol ADMIN.
* **Pruebas de Integración:**
    * Verificar que la lógica del frontend (TK-002, TK-010, TK-015) interactúa correctamente con los endpoints API del backend (TK-003, TK-007, TK-012), enviando datos y manejando respuestas/errores.
    * Validar que el contrato API definido en TK-001 se respeta en la estructura de las peticiones y respuestas de los endpoints implementados. (La integración real con Core AI se probará cuando F2/F4 se desarrollen).
* **Pruebas de Seguridad:**
    * **Autenticación (TK-004, TK-005):** Verificar la generación y validación segura de tokens/sesiones. Probar el acceso a rutas protegidas sin/con token inválido/expirado (esperar 401). Verificar la protección de la contraseña (hashing - TK-008).
    * **Autorización (TK-005, TK-007, TK-012):** Intentar acceder a los endpoints de gestión de usuarios y etapas con un usuario autenticado pero sin rol ADMIN (esperar 403 Forbidden). Verificar que usuarios con rol ADMIN sí pueden acceder.
* **Pruebas de Usabilidad (TK-009, TK-014):** Revisar la claridad y facilidad de uso de las interfaces de administración de Usuarios y Etapas.
* **Pruebas Unitarias (TK-008, TK-013, etc.):** Responsabilidad del desarrollador verificar la lógica interna de servicios (hashing, validaciones, lógica de negocio) y componentes FE.

### 1.4. Datos de Prueba Necesarios

* Usuarios predefinidos con roles: ADMIN, RECLUTADOR, MANAGER (al menos uno de cada).
* Un usuario inactivo para pruebas de login.
* Un conjunto inicial de Etapas del Pipeline definidas.
* Credenciales válidas e inválidas.

### 1.5. Priorización Interna

1.  **Autenticación (US-04):** Probar Login (API y UI) y Middleware de protección (TK-002 a TK-005). Es bloqueante para el resto.
2.  **Gestión de Usuarios (US-003):** Probar CRUD básico de usuarios (API y UI) y Autorización ADMIN (TK-006 a TK-010). Necesario para tener usuarios con roles.
3.  **Gestión de Etapas (US-002):** Probar CRUD básico de etapas y flag `seleccionable_ia` (API y UI) y Autorización ADMIN (TK-011 a TK-015). Necesario para configurar el pipeline y los parámetros IA posteriores.
4.  **API Contract (US-001):** Revisión estática de la definición (TK-001). Las pruebas dinámicas se harán al integrar con Core AI.

---
