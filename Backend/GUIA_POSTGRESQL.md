# Guía: Configuración de PostgreSQL con Docker para TravelSplit

Esta guía te explica paso a paso cómo iniciar PostgreSQL en Docker y conectarlo al backend de NestJS.

## 📋 Requisitos Previos

- Docker Desktop instalado y ejecutándose
- Docker Compose instalado (viene con Docker Desktop)
- Node.js v22.x instalado

## 🚀 Paso 1: Iniciar PostgreSQL con Docker

### Opción A: Usando Docker Compose (Recomendado)

1. **Abre una terminal** y navega al directorio `Backend`:
   ```bash
   cd Backend
   ```

2. **Inicia el contenedor de PostgreSQL**:
   ```bash
   docker-compose up -d
   ```

   El flag `-d` ejecuta el contenedor en modo "detached" (en segundo plano).

3. **Verifica que el contenedor esté corriendo**:
   ```bash
   docker-compose ps
   ```

   Deberías ver algo como:
   ```
   NAME                    STATUS          PORTS
   travelsplit-postgres    Up (healthy)    0.0.0.0:5432->5432/tcp
   ```

### Opción B: Usando Docker directamente

Si prefieres usar comandos de Docker directamente:

```bash
docker run -d \
  --name travelsplit-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=travelsplit \
  -p 5432:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:17-alpine
```

## ⚙️ Paso 2: Configurar Variables de Entorno

1. **Crea el archivo `.env.local` (recomendado)** en el directorio `Backend`:
   ```bash
   # En Windows (PowerShell)
   Copy-Item .env.example .env.local
   
   # En Linux/Mac
   cp .env.example .env.local
   ```

2. **Edita el archivo `.env.local`** con tus configuraciones. El archivo debería verse así:

   ```env
   # Application Configuration
   PORT=3000
   NODE_ENV=development
   API_PREFIX=api

   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=postgres
   DB_NAME=travelsplit
   # Importante: por defecto el backend NO sincroniza el esquema automáticamente.
   # Para habilitar sincronización automática (solo desarrollo), configura:
   # DB_SYNCHRONIZE=true
   DB_SYNCHRONIZE=false
   DB_LOGGING=false
   ```

   **Nota importante (DB_SYNCHRONIZE)**:
   - `DB_SYNCHRONIZE=false` es el comportamiento por defecto (recomendado).
   - Si estás en **desarrollo local** y quieres que TypeORM cree/actualice tablas automáticamente, debes configurar **explícitamente** `DB_SYNCHRONIZE=true`.
   - En entornos no locales (staging/producción), mantén `DB_SYNCHRONIZE=false` y usa **migraciones**.

   **Nota importante**: Las credenciales en `.env` deben coincidir con las del `docker-compose.yml`:
   - `DB_USERNAME` = `POSTGRES_USER` (postgres)
   - `DB_PASSWORD` = `POSTGRES_PASSWORD` (postgres)
   - `DB_NAME` = `POSTGRES_DB` (travelsplit)

## 🔍 Paso 3: Verificar la Conexión a PostgreSQL

### Verificar que el contenedor esté saludable:

```bash
docker-compose ps
```

El estado debe mostrar `Up (healthy)`.

### Conectarse a PostgreSQL desde la terminal:

```bash
# Usando docker-compose
docker-compose exec postgres psql -U postgres -d travelsplit

# O usando docker directamente
docker exec -it travelsplit-postgres psql -U postgres -d travelsplit
```

Una vez dentro, puedes ejecutar comandos SQL:
```sql
-- Listar todas las bases de datos
\l

-- Listar todas las tablas
\dt

-- Salir
\q
```

### Ver los logs del contenedor:

```bash
docker-compose logs postgres
```

## 🔌 Paso 4: Conectar el Backend a PostgreSQL

El backend ya está configurado para conectarse automáticamente. Solo necesitas:

1. **Instalar las dependencias** (si no lo has hecho):
   ```bash
   cd Backend
   npm install
   ```

2. **Iniciar el backend**:
   ```bash
   npm run start:dev
   ```

3. **Verificar la conexión**: El backend intentará conectarse automáticamente cuando se inicie. Si todo está bien, verás:
   ```
   Application is running on: http://localhost:3000/api
   Swagger documentation: http://localhost:3000/api/docs
   ```

   Si hay un error de conexión, verás un mensaje indicando que no puede conectarse a la base de datos.

## 🛠️ Comandos Útiles de Docker

### Detener PostgreSQL:
```bash
docker-compose down
```

### Detener y eliminar los volúmenes (⚠️ Esto borra todos los datos):
```bash
docker-compose down -v
```

### Reiniciar PostgreSQL:
```bash
docker-compose restart
```

### Ver los logs en tiempo real:
```bash
docker-compose logs -f postgres
```

### Acceder al contenedor:
```bash
docker-compose exec postgres sh
```

## 🔧 Configuración Avanzada

### Cambiar el Puerto de PostgreSQL

Si el puerto 5432 ya está en uso, puedes cambiarlo:

1. **En `docker-compose.yml`**, cambia el mapeo de puertos:
   ```yaml
   ports:
     - '5433:5432'  # Puerto externo:puerto interno
   ```

2. **En `.env`**, actualiza el puerto:
   ```env
   DB_PORT=5433
   ```

### Cambiar las Credenciales

1. **En `docker-compose.yml`**, cambia las variables de entorno:
   ```yaml
   environment:
     POSTGRES_USER: mi_usuario
     POSTGRES_PASSWORD: mi_contraseña_segura
     POSTGRES_DB: travelsplit
   ```

2. **En `.env`**, actualiza las credenciales:
   ```env
   DB_USERNAME=mi_usuario
   DB_PASSWORD=mi_contraseña_segura
   ```

### Habilitar Logging de SQL (para debugging)

En `.env`, cambia:
```env
DB_LOGGING=true
```

Esto mostrará todas las consultas SQL en la consola del backend.

## 🐛 Solución de Problemas

### Error: "Port 5432 is already in use"

**Solución**: Cambia el puerto en `docker-compose.yml` y `.env` como se explicó arriba.

### Error: "Cannot connect to database"

**Verifica**:
1. Que el contenedor esté corriendo: `docker-compose ps`
2. Que las credenciales en `.env` coincidan con `docker-compose.yml`
3. Que el puerto sea el correcto

### Error: "Database does not exist"

**Solución**: El contenedor crea la base de datos automáticamente. Si no existe, reinicia el contenedor:
```bash
docker-compose down
docker-compose up -d
```

### Limpiar todo y empezar de nuevo

```bash
# Detener y eliminar contenedores y volúmenes
docker-compose down -v

# Eliminar la imagen (opcional)
docker rmi postgres:17-alpine

# Volver a iniciar
docker-compose up -d
```

## 📊 Estructura de la Configuración

```
Backend/
├── docker-compose.yml    # Configuración de Docker
├── .env                  # Variables de entorno (crear desde env.example.txt)
├── env.example.txt       # Template de variables de entorno
└── src/
    └── config/
        └── database.config.ts  # Configuración de TypeORM
```

## ✅ Checklist de Verificación

- [ ] Docker Desktop está ejecutándose
- [ ] Contenedor de PostgreSQL está corriendo (`docker-compose ps`)
- [ ] Archivo `.env` creado y configurado
- [ ] Credenciales en `.env` coinciden con `docker-compose.yml`
- [ ] Backend se inicia sin errores (`npm run start:dev`)
- [ ] Puedes acceder a `http://localhost:3000/api/health`
- [ ] Swagger está disponible en `http://localhost:3000/api/docs`

## 🎯 Próximos Pasos

Una vez que PostgreSQL esté corriendo y conectado:

1. El backend creará automáticamente las tablas cuando definas las entidades
2. Puedes usar herramientas como **pgAdmin** o **DBeaver** para gestionar la base de datos visualmente
3. Para desarrollo, `DB_SYNCHRONIZE=true` crea/actualiza las tablas automáticamente
4. Para producción, desactiva `DB_SYNCHRONIZE` y usa migraciones

---

**¿Necesitas ayuda?** Revisa los logs con `docker-compose logs postgres` o `npm run start:dev` para ver los errores específicos.












