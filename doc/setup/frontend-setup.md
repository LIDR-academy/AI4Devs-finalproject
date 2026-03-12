# 🌐 Guía de Setup del Frontend

## Resumen

El frontend de bonÀreaGo es una aplicación React construida con Vite que se puede ejecutar de dos formas:

1. **Docker + Nginx** (producción-like)
2. **Local con Vite** (desarrollo rápido con hot reload)

---

## 🚀 Scripts Disponibles

### 1. `start-frontend.sh` - Docker + Nginx

**Qué hace:**
- Verifica que la infraestructura esté corriendo
- Detecta si hay microservicios activos
- Ofrece levantar microservicios si no están corriendo
- Construye y levanta el frontend en Docker con Nginx
- Sirve en puerto 3000

**Cuándo usar:**
- Demos o presentaciones
- Testing en entorno tipo producción
- No tienes Node.js instalado localmente

**Ejemplo:**
```bash
./scripts/start-frontend.sh
```

**Salida esperada:**
```
🌐 Iniciando Frontend...

🔍 Verificando infraestructura...
✅ Infraestructura OK

🔍 Verificando microservicios...
⚠️  No hay microservicios corriendo

❓ ¿Quieres levantar los microservicios también?
Levantar microservicios? [y/N]: y

🚀 Levantando microservicios...
⏳ Esperando a que los servicios arranquen...

🏗️  Construyendo y levantando frontend...
✅ Frontend levantado exitosamente!

🌐 Accede a la aplicación en:
   👉 http://localhost:3000
```

---

### 2. `start-frontend-dev.sh` - Local con Hot Reload ⭐

**Qué hace:**
- Verifica Node.js está instalado
- Verifica que la infraestructura esté corriendo
- Instala dependencias npm si es necesario
- Crea archivo `.env.local` con variables de entorno
- Inicia Vite en modo desarrollo
- Sirve en puerto 5173 (puerto por defecto de Vite)

**Cuándo usar:**
- Desarrollo activo del frontend
- Necesitas ver cambios instantáneamente
- Estás trabajando en componentes o estilos

**Ventajas:**
- ⚡ Hot reload - cambios se ven al instante
- 🔥 Vite es extremadamente rápido
- 🛠️ Mejor experiencia de desarrollo
- 🐛 Errores más claros en consola

**Requisitos:**
- Node.js 20+ instalado
- npm instalado

**Ejemplo:**
```bash
./scripts/start-frontend-dev.sh
```

**Salida esperada:**
```
⚡ Iniciando Frontend en Modo Desarrollo (Local)

✅ Node.js v20.x.x
✅ npm 10.x.x

🔍 Verificando infraestructura...
✅ Infraestructura OK

🔍 Verificando microservicios...
✅ Microservicios disponibles

📦 Dependencias ya instaladas

🎯 Variables de entorno:
VITE_API_BASE_URL=http://localhost:8081
VITE_OIDC_ISSUER=http://localhost:8080/realms/covoituraje
VITE_OIDC_CLIENT_ID=covoituraje-frontend

🚀 Iniciando servidor de desarrollo...

  VITE v7.x.x  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

### 3. `start-all-services.sh` - Sistema Completo

**Qué hace:**
- Verifica/levanta infraestructura
- Levanta todos los microservicios
- Levanta el frontend
- Ejecuta verificación completa

**Cuándo usar:**
- Primera vez usando el proyecto
- Testing end-to-end completo
- Demos completas
- No sabes qué componentes necesitas

**Ejemplo:**
```bash
./scripts/start-all-services.sh
```

**Salida esperada:**
```
🚀 Iniciando Todos los Servicios...

🔍 Paso 1: Verificando infraestructura...
✅ Infraestructura OK

🔧 Paso 2: Levantando microservicios...
   • trips-service (puerto 8081)
   • users-service (puerto 8082)
   • booking-service (puerto 8083)
   • matching-service (puerto 8084)

⏳ Esperando a que los microservicios arranquen...

🌐 Paso 3: Levantando frontend...

🔍 Paso 4: Verificando estado...

🎉 ¡Sistema completo levantado!

🌐 FRONTEND: http://localhost:3000
```

---

## 🎯 Flujos de Trabajo Recomendados

### Flujo 1: Primera Vez Usando el Proyecto

```bash
# 1. Setup completo (solo una vez)
./scripts/setup-dev.sh

# 2. Levantar todo
./scripts/start-all-services.sh

# 3. Verificar
./scripts/verify-all.sh

# 4. Abrir navegador
open http://localhost:3000
```

### Flujo 2: Desarrollo Diario del Frontend

```bash
# 1. Levantar infraestructura (si no está)
./scripts/dev-infra.sh

# 2. Levantar microservicios necesarios
docker-compose --profile services up -d trips-service users-service

# 3. Levantar frontend en modo dev
./scripts/start-frontend-dev.sh

# Ahora puedes editar archivos y ver cambios al instante!
```

### Flujo 3: Testing Completo

```bash
# 1. Levantar todo
./scripts/start-all-services.sh

# 2. Ejecutar tests del frontend
cd Frontend
npm run test

# 3. Tests de integración
npm run test:int

# 4. Ver coverage
npm run test:coverage
```

### Flujo 4: Demo para el Cliente

```bash
# 1. Resetear todo para empezar limpio
docker-compose --profile services down -v

# 2. Setup completo
./scripts/setup-dev.sh

# 3. Levantar todo
./scripts/start-all-services.sh

# 4. Verificar que todo está OK
./scripts/verify-all.sh

# 5. Compartir URL
echo "Demo lista en: http://localhost:3000"
echo "Credenciales: test.user / password123"
```

---

## 🔧 Configuración

### Variables de Entorno

El frontend usa estas variables de entorno (Vite):

| Variable | Descripción | Valor por Defecto |
|----------|-------------|-------------------|
| `VITE_API_BASE_URL` | URL base de los microservicios | `http://localhost:8081` |
| `VITE_OIDC_ISSUER` | URL del issuer de Keycloak | `http://localhost:8080/realms/covoituraje` |
| `VITE_OIDC_CLIENT_ID` | Client ID en Keycloak | `covoituraje-frontend` |

**Para Docker:** Se configuran en `docker-compose.yml`

**Para local:** Se crean automáticamente en `Frontend/.env.local`

### Puertos

| Modo | Puerto | URL |
|------|--------|-----|
| Docker + Nginx | 3000 | http://localhost:3000 |
| Vite Dev Server | 5173 | http://localhost:5173 |

---

## 🐛 Troubleshooting

### Frontend no arranca en Docker

```bash
# Ver logs
docker logs covoituraje_frontend

# Rebuild desde cero
docker-compose --profile services build --no-cache frontend
docker-compose --profile services up -d frontend
```

### Frontend local no encuentra los servicios

```bash
# Verificar que los microservicios están corriendo
./scripts/verify-all.sh

# Verificar archivo .env.local
cat Frontend/.env.local

# Debería mostrar las URLs correctas
```

### Error de dependencias npm

```bash
cd Frontend

# Limpiar node_modules
rm -rf node_modules package-lock.json

# Reinstalar
npm install

# Intentar de nuevo
npm run dev
```

### Puerto 3000 o 5173 ya está en uso

```bash
# Ver qué está usando el puerto
lsof -i :3000
lsof -i :5173

# Matar el proceso
kill -9 <PID>

# O cambiar el puerto en vite.config.ts para modo dev
```

### Cambios no se reflejan en Docker

Docker + Nginx **no tiene hot reload**. Debes rebuild:

```bash
docker-compose --profile services build frontend
docker-compose --profile services up -d frontend
```

**Solución:** Usa `start-frontend-dev.sh` para desarrollo.

---

## 📚 Comandos Útiles

### Ver logs del frontend

```bash
# Docker
docker logs -f covoituraje_frontend

# Local (en la terminal donde corre Vite)
# Los logs se muestran automáticamente
```

### Rebuild del frontend

```bash
# Docker - rebuild completo
docker-compose --profile services build --no-cache frontend
docker-compose --profile services up -d frontend

# Local - Vite hace rebuild automático
# No necesitas hacer nada!
```

### Detener el frontend

```bash
# Docker
docker-compose stop frontend

# Local
# Ctrl+C en la terminal donde corre Vite
```

### Acceder al contenedor del frontend

```bash
docker exec -it covoituraje_frontend sh
```

---

## 🎨 Estructura del Frontend

```
Frontend/
├── src/
│   ├── api/              # Clientes API para microservicios
│   ├── auth/             # Integración con Keycloak
│   ├── components/       # Componentes React
│   ├── pages/            # Páginas/vistas
│   └── types/            # TypeScript types
├── dist/                 # Build de producción (generado)
├── Dockerfile           # Build de Docker + Nginx
├── nginx.conf           # Configuración de Nginx
├── package.json         # Dependencias y scripts
└── vite.config.ts       # Configuración de Vite
```

---

## 🚀 Próximos Pasos

Después de levantar el frontend:

1. **Explorar la aplicación:** http://localhost:3000 (o 5173 en modo dev)
2. **Login con usuario de prueba:** test.user / password123
3. **Ver la documentación de API:** `doc/api/`
4. **Leer el código:** Empieza por `src/App.tsx`

Para más información:
- **Frontend README:** `Frontend/README.md`
- **Quick Start:** `QUICK-START.md`
- **Documentación completa:** `doc/setup/local.md`

