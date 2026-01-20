# Guía de Pruebas - SIGQ Backend

## Verificación de Errores

### 1. Verificar Compilación TypeScript

```bash
cd backend
npm run build
```

Si hay errores de compilación, se mostrarán aquí.

### 2. Verificar Linter

```bash
npm run lint
```

### 3. Verificar Tests

```bash
npm test
```

## Configuración Inicial

### 1. Instalar Dependencias

```bash
cd backend
npm install
```

### 2. Configurar Variables de Entorno

Crea un archivo `.env` en `backend/` con:

```env
# PostgreSQL (debe coincidir con docker-compose.yml)
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=sigq_user
POSTGRES_PASSWORD=sigq_password_change_in_prod
POSTGRES_DB=sigq_db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Keycloak
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=sistema-quirurgico
KEYCLOAK_CLIENT_ID=backend-api
KEYCLOAK_CLIENT_SECRET=change-this-in-production
KEYCLOAK_ADMIN_USER=admin
KEYCLOAK_ADMIN_PASSWORD=admin_change_in_prod

# JWT
JWT_SECRET=change-this-secret-in-production-use-strong-secret-min-32-chars
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# API
NODE_ENV=development
API_PORT=3000
CORS_ORIGIN=http://localhost:5173,http://localhost:3000

# Encriptación
ENCRYPTION_KEY=change-this-encryption-key-32-chars-minimum

# Orthanc
ORTHANC_URL=http://localhost:8042
ORTHANC_USERNAME=orthanc
ORTHANC_PASSWORD=orthanc

# HL7 FHIR (opcional)
FHIR_SERVER_URL=
FHIR_CLIENT_ID=
FHIR_CLIENT_SECRET=

# Logging
LOG_LEVEL=debug
LOG_FORMAT=json
```

### 3. Iniciar Servicios Docker

```bash
cd ../docker
docker compose up -d
```

Espera a que todos los servicios estén corriendo:
```bash
docker compose ps
```

## Iniciar el Backend

### Modo Desarrollo

```bash
cd backend
npm run start:dev
```

El servidor estará disponible en: http://localhost:3000

## Pruebas Manuales

### 1. Health Check

```bash
# Verificar que el servidor está corriendo
curl http://localhost:3000/health

# Ver información de la API
curl http://localhost:3000/
```

**Respuesta esperada:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-16T...",
  "uptime": 123.45,
  "environment": "development"
}
```

### 2. Documentación Swagger

Abre en el navegador:
```
http://localhost:3000/api/docs
```

Aquí puedes ver y probar todos los endpoints interactivamente.

### 3. Autenticación

#### 3.1 Login (simulado - requiere Keycloak configurado)

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Nota**: Este endpoint requiere que Keycloak esté configurado. Por ahora retorna tokens simulados.

#### 3.2 Obtener Perfil (requiere token)

```bash
# Primero obtén un token del login
TOKEN="tu-token-aqui"

curl http://localhost:3000/api/v1/auth/profile \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Módulo HCE - Pacientes

#### 4.1 Crear Paciente

```bash
TOKEN="tu-token-aqui"

curl -X POST http://localhost:3000/api/v1/hce/patients \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Juan",
    "lastName": "Pérez García",
    "dateOfBirth": "1985-05-15",
    "gender": "M",
    "ssn": "12345678A",
    "phone": "+34 600 123 456",
    "address": "Calle Principal 123, Madrid"
  }'
```

**Respuesta esperada:**
```json
{
  "data": {
    "id": "uuid-del-paciente",
    "firstName": "Juan",
    "lastName": "Pérez García",
    ...
  },
  "statusCode": 201,
  "timestamp": "2024-01-16T..."
}
```

#### 4.2 Buscar Pacientes

```bash
TOKEN="tu-token-aqui"

# Buscar por nombre
curl "http://localhost:3000/api/v1/hce/patients?firstName=Juan" \
  -H "Authorization: Bearer $TOKEN"

# Buscar por apellidos
curl "http://localhost:3000/api/v1/hce/patients?lastName=Pérez" \
  -H "Authorization: Bearer $TOKEN"
```

#### 4.3 Obtener Paciente por ID

```bash
TOKEN="tu-token-aqui"
PATIENT_ID="uuid-del-paciente"

curl "http://localhost:3000/api/v1/hce/patients/$PATIENT_ID" \
  -H "Authorization: Bearer $TOKEN"
```

#### 4.4 Obtener Historia Clínica Completa

```bash
TOKEN="tu-token-aqui"
PATIENT_ID="uuid-del-paciente"

curl "http://localhost:3000/api/v1/hce/patients/$PATIENT_ID/medical-history" \
  -H "Authorization: Bearer $TOKEN"
```

#### 4.5 Agregar Alergia

```bash
TOKEN="tu-token-aqui"
PATIENT_ID="uuid-del-paciente"

curl -X POST http://localhost:3000/api/v1/hce/allergies \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "'$PATIENT_ID'",
    "allergen": "Penicilina",
    "severity": "High",
    "notes": "Reacción severa observada"
  }'
```

#### 4.6 Agregar Medicación

```bash
TOKEN="tu-token-aqui"
PATIENT_ID="uuid-del-paciente"

curl -X POST http://localhost:3000/api/v1/hce/medications \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "'$PATIENT_ID'",
    "name": "Paracetamol",
    "dosage": "500mg",
    "frequency": "Cada 8 horas",
    "startDate": "2024-01-15"
  }'
```

### 5. Módulo de Integración

#### 5.1 Verificar Estado de Integraciones

```bash
TOKEN="tu-token-aqui"

curl http://localhost:3000/api/v1/integration/status \
  -H "Authorization: Bearer $TOKEN"
```

**Respuesta esperada:**
```json
{
  "data": {
    "orthanc": true,
    "fhir": false
  },
  "statusCode": 200,
  "timestamp": "2024-01-16T..."
}
```

#### 5.2 Listar Pacientes en Orthanc

```bash
TOKEN="tu-token-aqui"

curl http://localhost:3000/api/v1/integration/orthanc/patients \
  -H "Authorization: Bearer $TOKEN"
```

#### 5.3 Sincronizar Datos de Paciente

```bash
TOKEN="tu-token-aqui"
PATIENT_ID="uuid-del-paciente"

curl -X POST "http://localhost:3000/api/v1/integration/sync/patient/$PATIENT_ID" \
  -H "Authorization: Bearer $TOKEN"
```

#### 5.4 Subir Archivo DICOM

```bash
TOKEN="tu-token-aqui"

curl -X POST http://localhost:3000/api/v1/integration/orthanc/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/ruta/a/tu/archivo.dcm"
```

## Pruebas con Postman/Insomnia

### Importar Colección

1. Abre Swagger: http://localhost:3000/api/docs
2. En la parte superior derecha, busca "Export" o "Download"
3. Descarga el archivo OpenAPI/Swagger JSON
4. Importa en Postman o Insomnia

### Configurar Variables

Crea variables de entorno en tu cliente HTTP:
- `base_url`: `http://localhost:3000`
- `token`: (se obtiene del login)

## Verificación de Base de Datos

### Conectar a PostgreSQL

```bash
docker compose exec postgres psql -U sigq_user -d sigq_db
```

### Verificar Tablas Creadas

```sql
\dt
```

Deberías ver:
- `patients`
- `medical_records`
- `allergies`
- `medications`
- `lab_results`
- `images`

### Ver Pacientes Creados

```sql
SELECT id, "firstName", "lastName", "dateOfBirth", gender 
FROM patients 
LIMIT 10;
```

## Troubleshooting

### Error: "Cannot connect to database"

1. Verifica que PostgreSQL esté corriendo:
   ```bash
   docker compose ps
   ```

2. Verifica las credenciales en `.env`

3. Prueba la conexión:
   ```bash
   docker compose exec postgres psql -U sigq_user -d sigq_db -c "SELECT version();"
   ```

### Error: "Keycloak connection failed"

1. Verifica que Keycloak esté corriendo:
   ```bash
   curl http://localhost:8080/health/ready
   ```

2. Verifica las credenciales en `.env`

### Error: "Orthanc connection failed"

1. Verifica que Orthanc esté corriendo:
   ```bash
   curl http://localhost:8042/system
   ```

2. Verifica las credenciales en `.env`

### Error: "Port 3000 already in use"

Cambia el puerto en `.env`:
```env
API_PORT=3001
```

## Pruebas Automatizadas

### Ejecutar Tests Unitarios

```bash
npm test
```

### Ejecutar Tests con Cobertura

```bash
npm run test:cov
```

### Ejecutar Tests E2E

```bash
npm run test:e2e
```

## Checklist de Verificación

- [ ] Backend compila sin errores (`npm run build`)
- [ ] No hay errores de linter (`npm run lint`)
- [ ] Servidor inicia correctamente (`npm run start:dev`)
- [ ] Health check responde (`curl http://localhost:3000/health`)
- [ ] Swagger está accesible (`http://localhost:3000/api/docs`)
- [ ] PostgreSQL está conectado (verificar logs)
- [ ] TypeORM crea las tablas automáticamente (en desarrollo)
- [ ] Endpoints de autenticación responden
- [ ] Endpoints de HCE responden (con token)
- [ ] Endpoints de integración responden (con token)

## Próximos Pasos

Una vez que todo funcione:

1. Configurar Keycloak completamente (realm, clientes, usuarios)
2. Crear usuarios de prueba en Keycloak
3. Probar autenticación real con Keycloak
4. Subir archivos DICOM de prueba a Orthanc
5. Configurar servidor FHIR (si está disponible)
6. Implementar tests automatizados
