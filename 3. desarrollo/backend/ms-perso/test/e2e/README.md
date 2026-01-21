# Tests E2E - MS-PERSO

## 📋 Descripción

Tests End-to-End (E2E) para validar flujos completos de la aplicación, desde la entrada HTTP hasta la base de datos.

## 🎯 Objetivo

Validar que los flujos críticos funcionan correctamente en un entorno similar a producción, incluyendo:
- Validación de DTOs
- Códigos HTTP apropiados
- Formato de respuestas
- Manejo de errores
- Integración con base de datos

## 📁 Estructura

```
test/e2e/
├── setup.ts                              # Configuración de variables de entorno
├── clien/
│   ├── registrar-cliente-completo.e2e-spec.ts
│   └── actualizar-cliente-completo.e2e-spec.ts
└── clbnc/
    ├── login.e2e-spec.ts
    └── recuperar-password.e2e-spec.ts
```

## 🚀 Ejecución

```bash
# Ejecutar todos los tests E2E
npm run test:e2e

# Ejecutar un archivo específico
npm run test:e2e -- registrar-cliente-completo.e2e-spec.ts
```

## ⚙️ Configuración

### Variables de Entorno

Los tests E2E requieren las siguientes variables de entorno (configuradas en `setup.ts`):

```env
appPort=8000
nodeEnv=test
msNatsServer=nats://localhost:4222
dbHost=localhost
dbPort=5432
dbUser=test
dbPassword=test
dbName=test_db
dbSsl=false
jwtAccessSecret=test-access-secret-key-for-e2e-tests
jwtRefreshSecret=test-refresh-secret-key-for-e2e-tests
```

### Base de Datos de Prueba

**IMPORTANTE**: Los tests E2E actuales solo validan:
- ✅ Validación de DTOs (campos requeridos, formatos, etc.)
- ✅ Códigos HTTP (400, 401, 404, etc.)
- ✅ Mensajes de error

**PENDIENTE**: Para ejecutar tests con datos reales, se requiere:
1. Base de datos PostgreSQL de prueba configurada
2. Datos de catálogos (oficinas, provincias, cantones, parroquias, etc.)
3. Limpieza de datos entre tests
4. Rollback de transacciones

## 📊 Tests Implementados

### ClienController

#### `registrar-cliente-completo.e2e-spec.ts`
- ✅ Rechazar registro sin datos de persona
- ✅ Rechazar registro sin datos de cliente
- ✅ Rechazar registro sin domicilio
- ✅ Rechazar registro sin actividad económica
- ✅ Rechazar registro con identificación inválida
- ✅ Rechazar registro con nombre vacío

#### `actualizar-cliente-completo.e2e-spec.ts`
- ✅ Rechazar actualización sin ID de cliente
- ✅ Rechazar actualización con ID inválido
- ✅ Rechazar actualización sin datos de persona
- ✅ Rechazar actualización sin datos de cliente
- ✅ Rechazar actualización con cliente inexistente
- ✅ Rechazar actualización con nombre de persona vacío

### ClbncController

#### `login.e2e-spec.ts`
- ✅ Rechazar login sin username
- ✅ Rechazar login sin password
- ✅ Rechazar login con username vacío
- ✅ Rechazar login con password vacío
- ✅ Rechazar login con credenciales inválidas
- ✅ Rechazar login con username muy corto
- ✅ Rechazar login con password muy corto

#### `recuperar-password.e2e-spec.ts`
- ✅ Rechazar inicio de recuperación sin username
- ✅ Rechazar inicio de recuperación con username vacío
- ✅ Rechazar inicio de recuperación con username inválido
- ✅ Rechazar completar recuperación sin username
- ✅ Rechazar completar recuperación sin código de verificación
- ✅ Rechazar completar recuperación sin password nuevo
- ✅ Rechazar completar recuperación con password muy corto
- ✅ Rechazar completar recuperación con código inválido

## 🔧 Troubleshooting

### Error: "Cannot find module '@nestjs/swagger'"

**Solución**: Instalar la dependencia faltante:
```bash
npm install --save-dev @nestjs/swagger
```

### Error: "Configuración de validación error"

**Solución**: Verificar que todas las variables de entorno estén configuradas en `setup.ts` o en un archivo `.env.test`.

### Error: "Cannot connect to database"

**Solución**: 
1. Verificar que PostgreSQL esté corriendo
2. Verificar credenciales de conexión
3. Crear base de datos de prueba: `CREATE DATABASE test_db;`

## 📝 Notas

- Los tests E2E actuales se enfocan en **validación de entrada** (DTOs) y **códigos HTTP**
- Los tests con **datos reales** requieren configuración adicional de BD de prueba
- Se recomienda usar **transacciones** y **rollback** para tests con datos reales
- Los tests deben ser **independientes** y **idempotentes**

## 🎯 Próximos Pasos

1. ✅ Crear estructura de tests E2E
2. ✅ Implementar tests de validación
3. ⏳ Configurar base de datos de prueba
4. ⏳ Implementar tests con datos reales
5. ⏳ Implementar limpieza de datos entre tests
6. ⏳ Configurar CI/CD para ejecutar tests E2E

