# Documentación de la API TaskDistributor

## Acceso a la Documentación

Una vez que el servidor backend esté ejecutándose, puedes acceder a la documentación interactiva de la API a través de Swagger UI.

### URLs de Acceso

- **Documentación Interactiva (Swagger UI):** `http://localhost:5000/api/docs`
- **Especificación JSON:** `http://localhost:5000/api/docs.json`
- **Información General de la API:** `http://localhost:5000/api`

### Configuración del Servidor

Para iniciar el servidor en modo desarrollo:

```bash
cd backend
npm run dev
```

El servidor se ejecutará en `http://localhost:5000` por defecto.

## Características de la Documentación

### Swagger UI
- **Interfaz interactiva:** Permite probar todos los endpoints directamente desde el navegador
- **Autenticación:** Soporte para tokens JWT con botón "Authorize"
- **Esquemas:** Definiciones completas de todos los modelos de datos
- **Ejemplos:** Requests y responses de ejemplo para cada endpoint

### Endpoints Documentados

La API incluye documentación completa para:

#### 🔐 Autenticación (`/api/auth`)
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario (desarrollo)
- `GET /api/auth/profile` - Obtener perfil de usuario
- `POST /api/auth/logout` - Cerrar sesión

#### 📋 Gestión de Tareas (`/api/tasks`)
- `GET /api/tasks` - Listar tareas con filtros avanzados
- `GET /api/tasks/:id` - Obtener tarea específica
- `GET /api/tasks/stats` - Estadísticas y KPIs
- `GET /api/tasks/filter-options` - Opciones para filtros dinámicos

#### 🔗 Integración Redmine (`/api/redmine`)
- `GET /api/redmine/issues` - Obtener tareas de Redmine
- `GET /api/redmine/issues/:id` - Obtener tarea específica
- `POST /api/redmine/issues` - Crear tarea en Redmine
- `PUT /api/redmine/issues/:id` - Actualizar tarea
- `DELETE /api/redmine/issues/:id` - Eliminar tarea
- `GET /api/redmine/projects` - Obtener proyectos
- `GET /api/redmine/users` - Obtener usuarios
- `POST /api/redmine/sync` - Sincronizar datos

## Cómo Usar la Documentación

### 1. Acceder a Swagger UI
Navega a `http://localhost:5000/api/docs` en tu navegador web.

### 2. Autenticación
1. Haz clic en el botón **"Authorize"** en la parte superior
2. Introduce el token JWT obtenido del endpoint de login
3. Formato: `Bearer tu_token_jwt_aqui`

### 3. Probar Endpoints
1. Expande cualquier endpoint haciendo clic en él
2. Haz clic en **"Try it out"**
3. Completa los parámetros requeridos
4. Haz clic en **"Execute"**
5. Revisa la respuesta en la sección "Response"

### 4. Consultar Esquemas
- Los esquemas de datos están disponibles en la parte inferior de la página
- Cada endpoint muestra los esquemas de request y response
- Los ejemplos incluyen datos realistas del sistema

## Configuración de Seguridad

### Autenticación JWT
- La mayoría de endpoints requieren autenticación
- El token debe incluirse en el header `Authorization: Bearer <token>`
- Los tokens se obtienen del endpoint `/api/auth/login`

### CORS
La API está configurada para aceptar requests desde:
- `http://localhost:3000` (React desarrollo)
- `http://localhost:5173` (Vite desarrollo)

## Troubleshooting

### La documentación no carga
1. Verifica que el servidor esté ejecutándose en el puerto 5000
2. Comprueba la consola del navegador para errores
3. Asegúrate de que no hay conflictos de CORS

### Los endpoints no funcionan
1. Verifica que estés autenticado (botón "Authorize")
2. Comprueba que el token JWT sea válido
3. Revisa que los parámetros requeridos estén completos

### Error 404 en /api/docs
1. Confirma que el archivo `swagger.js` esté en la ruta correcta
2. Verifica que las dependencias `swagger-jsdoc` y `swagger-ui-express` estén instaladas
3. Comprueba los logs del servidor para errores de inicialización

## Desarrollo

### Agregar Nueva Documentación
Para documentar nuevos endpoints:

1. Agrega anotaciones JSDoc en los archivos de rutas
2. Usa el formato OpenAPI 3.0
3. Define esquemas en `components/schemas`
4. Incluye ejemplos y descripciones detalladas

### Ejemplo de Anotación
```javascript
/**
 * @swagger
 * /api/nuevo-endpoint:
 *   post:
 *     summary: Descripción breve
 *     tags: [TagName]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NuevoSchema'
 *     responses:
 *       200:
 *         description: Éxito
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespuestaSchema'
 */
```

La documentación se actualiza automáticamente al reiniciar el servidor. 