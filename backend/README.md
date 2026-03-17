# TaskDistributor Backend

Backend API para el sistema TaskDistributor - Sistema de gestión y distribución de tareas que integra con Redmine.

## 🚀 Características

- **API RESTful** con Express.js
- **Base de datos PostgreSQL** con Prisma ORM
- **Autenticación JWT** con roles de usuario
- **Integración con Redmine** (mock implementado)
- **Sistema de filtros avanzados** (US-08-02)
- **Particionamiento de tablas** para optimización
- **Documentación Swagger** (en desarrollo)

## 📋 Requisitos

- Node.js >= 18.0.0
- npm >= 8.0.0
- PostgreSQL >= 13 (o Supabase)

## ⚙️ Configuración

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Copia el archivo de ejemplo y configura tus variables:

```bash
cp env.example .env
```

Edita el archivo `.env` con tus credenciales:

```env
# Base de datos (Supabase o PostgreSQL local)
DATABASE_URL="postgresql://postgres:TU_PASSWORD@db.TU_PROJECT_REF.supabase.co:5432/postgres?schema=public"

# JWT
JWT_SECRET="tu-clave-secreta-jwt-muy-larga-y-segura"
JWT_EXPIRE="30d"

# Servidor
PORT=4000
NODE_ENV=development
```

### 3. Configurar la base de datos

Ejecuta el script completo de configuración:

```bash
npm run db:setup
```

O paso a paso:

```bash
# 1. Generar cliente Prisma
npm run prisma:generate

# 2. Ejecutar migraciones
npm run prisma:migrate

# 3. Configurar particionamiento
npm run db:partition

# 4. Cargar datos de muestra
npm run db:seed
```

## 🏃‍♂️ Ejecutar el servidor

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm start
```

El servidor estará disponible en `http://localhost:4000`

## 📚 Endpoints de la API

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario (desarrollo)
- `GET /api/auth/profile` - Obtener perfil del usuario
- `POST /api/auth/logout` - Cerrar sesión

### Tareas (US-08-02)
- `GET /api/tasks` - Listar tareas con filtros avanzados
- `GET /api/tasks/:id` - Obtener tarea específica
- `GET /api/tasks/stats` - Estadísticas de tareas
- `GET /api/tasks/filter-options` - Opciones para filtros dinámicos

### Utilidades
- `GET /health` - Health check
- `GET /api/docs` - Documentación de endpoints

## 🔐 Usuarios de prueba

Después de ejecutar el seed, tendrás estos usuarios disponibles:

```
Admin: admin@taskdistributor.com / password123
Negocio: negocio@taskdistributor.com / password123
Tecnología: tecnologia@taskdistributor.com / password123
```

## 🎯 Filtros avanzados (US-08-02)

La API soporta filtros avanzados en `/api/tasks`:

### Parámetros de consulta disponibles:

- `search` - Búsqueda por texto
- `departamento` - Filtro por departamento
- `status_id` - Estado de Redmine
- `priority_id` - Prioridad
- `equipo_id` - Equipo asignado
- `etapa` - Etapa (sin_planificar, planificada, en_curso, finalizada)
- `responsable_negocio` - Responsable de negocio
- `pendientes_planificar` - Solo tareas pendientes de planificar
- `fecha_inicio_desde/hasta` - Rango de fechas de inicio
- `fecha_fin_desde/hasta` - Rango de fechas de fin
- `estimacion_sprints_min/max` - Rango de estimación
- `sort_by` - Campo de ordenamiento
- `sort_order` - Orden (asc/desc)
- `offset` - Paginación
- `limit` - Límite de resultados

### Ejemplo de uso:

```bash
GET /api/tasks?departamento=Marketing&etapa=planificada&sort_by=priority&sort_order=desc&limit=10
```

## 🗄️ Base de datos

### Esquema principal:
- `users` - Usuarios del sistema
- `tareas_extended` - Información extendida de tareas de Redmine
- `equipos` - Equipos de desarrollo
- `departamentos` - Departamentos de negocio
- `matriz_afinidad` - Afinidad entre equipos y departamentos
- `asignaciones` - Asignaciones de tareas a equipos
- `historial_estimaciones` - Historial de cambios (particionado)

### Comandos útiles:

```bash
# Ver base de datos en interfaz gráfica
npm run prisma:studio

# Resetear base de datos
npm run prisma:reset

# Solo cargar datos de muestra
npm run db:seed
```

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Tests en modo watch
npm run test:watch

# Coverage
npm run test:coverage
```

## 🔧 Scripts disponibles

- `npm start` - Iniciar servidor en producción
- `npm run dev` - Iniciar servidor en desarrollo
- `npm run db:setup` - Configuración completa de BD
- `npm run db:seed` - Cargar datos de muestra
- `npm run db:partition` - Configurar particionamiento
- `npm run prisma:studio` - Interfaz gráfica de BD
- `npm run lint` - Linter
- `npm run test` - Tests

## 🏗️ Arquitectura

```
src/
├── api/
│   ├── controllers/     # Controladores HTTP
│   ├── middlewares/     # Middlewares (auth, etc.)
│   ├── routes/          # Definición de rutas
│   └── services/        # Lógica de negocio
├── config/              # Configuración (DB, JWT)
├── app.js              # Configuración de Express
└── server.js           # Punto de entrada

prisma/
├── schema.prisma       # Esquema de base de datos
└── seed.js            # Datos de muestra

scripts/
├── partition_setup.sql # Script de particionamiento
└── run-partition.js   # Ejecutor de particionamiento
```

## 🔄 Integración con Redmine

Actualmente implementado como **mock service**. Para conectar con Redmine real:

1. Configura las variables de entorno:
```env
REDMINE_BASE_URL="https://tu-redmine-server.com"
REDMINE_API_KEY="tu-api-key"
```

2. Reemplaza `src/api/services/redmineService.js` con implementación real.

## 📈 Optimizaciones

- **Particionamiento** de tabla `historial_estimaciones` por fecha
- **Índices** optimizados para consultas frecuentes
- **Paginación** en todos los endpoints de listado
- **Caching** de consultas lentas (middleware implementado)

## 🚨 Troubleshooting

### Error de conexión a base de datos
- Verifica que `DATABASE_URL` esté correctamente configurada
- Asegúrate de que la base de datos esté accesible

### Error en migraciones
```bash
npm run prisma:reset
npm run db:setup
```

### Puerto en uso
```bash
# Cambiar puerto en .env
PORT=4001
```

## 📝 Notas de desarrollo

- Los datos mock de Redmine están en `src/api/services/redmineService.js`
- El particionamiento se configura automáticamente para años 2023-2025
- Los filtros por rol de usuario están implementados pero simplificados
- La documentación Swagger está pendiente de implementación

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request 