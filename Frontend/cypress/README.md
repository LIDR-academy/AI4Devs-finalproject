# 🧪 Cypress E2E Tests - bonÀreaGo

Suite de tests End-to-End para bonÀreaGo usando Cypress.

## 📋 Requisitos Previos

Antes de ejecutar los tests E2E, asegúrate de que todo el sistema esté corriendo:

```bash
# Desde la raíz del proyecto
cd /Users/admin/Documents/AI4Devs-finalproject

# Levantar todo el sistema (infraestructura + microservicios + frontend)
./scripts/start-all-services.sh

# O paso a paso:
./scripts/dev-infra.sh  # Infraestructura
docker-compose --profile services up -d  # Microservicios
./scripts/start-frontend.sh  # Frontend
```

Verifica que todo esté corriendo:
```bash
./scripts/verify-all.sh
```

Deberías ver:
- ✅ PostgreSQL (puerto 5434)
- ✅ Keycloak (http://localhost:8080)
- ✅ Todos los microservicios (8081-8084)
- ✅ Frontend en uno de estos puertos:
  - http://localhost:5173 (modo desarrollo con Vite)
  - http://localhost:3000 (modo Docker)

## ⚙️ Configuración del Puerto

Por defecto, Cypress está configurado para el modo de **desarrollo local** (puerto 5173):

```typescript
// cypress.config.ts
export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',  // Vite dev server
    // ...
  }
})
```

Si necesitas ejecutar tests contra el frontend en Docker (puerto 3000), actualiza temporalmente la configuración:

```typescript
baseUrl: 'http://localhost:3000',  // Docker/Production mode
```

💡 **Recomendación**: Usa el modo desarrollo (5173) para tests durante el desarrollo, ya que tiene hot reload.

## 🚀 Ejecutar Tests

### Modo Interactivo (Recomendado para desarrollo)

```bash
cd Frontend

# Abrir Cypress Test Runner
npm run cypress
# o
npm run test:e2e:open
```

Esto abrirá la interfaz gráfica de Cypress donde podrás:
- Ver todos los tests disponibles
- Ejecutar tests individuales
- Ver la ejecución en tiempo real
- Hacer debug visualmente

### Modo Headless (CI/CD)

```bash
cd Frontend

# Ejecutar todos los tests
npm run test:e2e

# Ejecutar en Chrome específicamente
npm run test:e2e:chrome

# Ejecutar solo smoke tests (rápido)
npm run test:e2e:smoke
```

## 📁 Estructura de Tests

```
cypress/
├── e2e/
│   ├── 01-smoke/          # Tests básicos de humo
│   │   └── app-loads.cy.ts
│   ├── 02-authentication/ # Tests de login/logout
│   │   └── login.cy.ts
│   ├── 03-trips/          # Tests de viajes
│   │   └── navigate-trips.cy.ts
│   ├── 04-matches/        # Tests de búsqueda
│   │   └── navigate-matches.cy.ts
│   ├── 05-bookings/       # Tests de reservas
│   └── 06-flows/          # Tests de flujos completos
│       └── complete-journey.cy.ts
├── fixtures/              # Datos de prueba
│   └── users.json
└── support/               # Comandos personalizados
    ├── commands.ts
    └── e2e.ts
```

## 🎯 Tests Disponibles

### 01. Smoke Tests
- ✅ Aplicación carga correctamente
- ✅ Navegación visible
- ✅ Secciones principales presentes
- ✅ Infraestructura disponible

### 02. Authentication
- ✅ Mostrar botón de login
- ✅ Redirección a Keycloak
- ✅ Login exitoso con credenciales válidas
- ✅ Error con credenciales inválidas
- ✅ Logout exitoso
- ✅ Protección de rutas privadas

### 03. Trips
- ✅ Navegación a página de viajes
- ✅ Elementos de página visibles

### 04. Matches
- ✅ Navegación a búsqueda de viajes
- ✅ Funcionalidad de búsqueda presente

### 06. Complete Flows
- ✅ Flujo de navegación completo
- ✅ Persistencia de autenticación

## 🔧 Comandos Personalizados

### `cy.loginViaKeycloak(username, password)`

Login automático con caché de sesión:

```typescript
cy.loginViaKeycloak('test.user', 'password123')
```

Este comando:
- Usa `cy.session()` para cachear la autenticación
- Solo hace login una vez por suite de tests
- Maneja automáticamente la redirección a Keycloak

### `cy.logout()`

Cerrar sesión:

```typescript
cy.logout()
```

### `cy.getByCy(selector)`

Obtener elemento por atributo `data-cy`:

```typescript
cy.getByCy('submit-button').click()
```

## 📝 Escribir Nuevos Tests

### Template Básico

```typescript
describe('Feature Name', () => {
  beforeEach(() => {
    // Login si es necesario
    cy.loginViaKeycloak('test.user', 'password123')
  })

  it('should do something', () => {
    cy.visit('/page')
    cy.contains('Expected Text').should('be.visible')
    cy.get('button').click()
    cy.url().should('include', '/expected-url')
  })
})
```

### Best Practices

1. **Usa `data-cy` attributes** en componentes importantes:
   ```tsx
   <button data-cy="submit-button">Submit</button>
   ```

2. **Agrupa tests relacionados** con `describe`:
   ```typescript
   describe('User Profile', () => {
     describe('Edit Profile', () => {
       it('should update name', () => {})
       it('should update email', () => {})
     })
   })
   ```

3. **Usa fixtures para datos**:
   ```typescript
   cy.fixture('users').then((users) => {
     cy.loginViaKeycloak(users.testUser.username, users.testUser.password)
   })
   ```

4. **Limpia estado entre tests**:
   ```typescript
   beforeEach(() => {
     cy.clearCookies()
     cy.clearLocalStorage()
   })
   ```

## 🐛 Debugging

### Ver Tests en Acción

```bash
npm run test:e2e:open
```

Esto abre el Test Runner donde puedes:
- Ver cada comando ejecutándose
- Inspeccionar el DOM en cualquier momento
- Ver network requests
- Time travel entre estados

### Screenshots y Videos

Por defecto:
- ✅ Screenshots se toman cuando un test falla
- ❌ Videos están deshabilitados (configurar en `cypress.config.ts`)

Screenshots se guardan en: `cypress/screenshots/`

### Console Logs

Los logs de consola del browser aparecen en:
- DevTools del Test Runner
- Terminal cuando ejecutas en headless

## ⚙️ Configuración

Edita `cypress.config.ts` para personalizar:

```typescript
export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    env: {
      keycloakUrl: 'http://localhost:8080',
      apiUrl: 'http://localhost:8081',
    },
    retries: 2,  // Reintentar tests fallidos
    video: true,  // Grabar videos
  },
})
```

## 🔗 Variables de Entorno

Las variables de entorno se configuran en `cypress.config.ts`:

```typescript
env: {
  keycloakUrl: 'http://localhost:8080',
  keycloakRealm: 'covoituraje',
  apiUrl: 'http://localhost:8081',
}
```

Acceder en tests:
```typescript
Cypress.env('keycloakUrl')
```

## 📊 CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Start services
        run: |
          docker-compose up -d
          ./scripts/verify-all.sh
      
      - name: Run Cypress
        uses: cypress-io/github-action@v6
        with:
          working-directory: Frontend
          wait-on: 'http://localhost:3000'
          browser: chrome
```

## 🆘 Troubleshooting

### Tests Fallan con "Keycloak not available"

Verifica que Keycloak esté corriendo:
```bash
curl http://localhost:8080/realms/covoituraje
./scripts/verify-all.sh
```

### Tests Fallan con Timeout

Aumenta el timeout en `cypress.config.ts`:
```typescript
defaultCommandTimeout: 10000,  // 10 segundos
pageLoadTimeout: 30000,        // 30 segundos
```

### Error: "Origin policy error"

Asegúrate de tener habilitado:
```typescript
experimentalOriginDependencies: true
```

### Frontend no responde

```bash
# Verificar que el frontend esté corriendo
docker ps | grep frontend
curl http://localhost:3000

# Reiniciar si es necesario
docker-compose restart frontend
```

## 📚 Recursos

- [Documentación Oficial de Cypress](https://docs.cypress.io)
- [Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [Examples](https://github.com/cypress-io/cypress-example-recipes)
- [Cypress Real World App](https://github.com/cypress-io/cypress-realworld-app)

## ✅ Próximos Pasos

1. **Ejecutar smoke tests** para verificar el setup:
   ```bash
   npm run test:e2e:smoke
   ```

2. **Agregar más tests** según vayas desarrollando features

3. **Integrar con CI/CD** una vez que tengas una suite estable

4. **Configurar Cypress Cloud** (opcional) para test recording y analytics
