# 🧪 Análisis de Cobertura de Tests E2E

## Estado Actual (Octubre 2025)

Este documento analiza la cobertura de los tests E2E de Cypress comparada con las funcionalidades implementadas.

---

## 📊 Cobertura General

| Categoría | Tests Existentes | Funcionalidades Cubiertas | Gaps Identificados |
|-----------|------------------|---------------------------|-------------------|
| **Autenticación** | 3 tests | ✅ Login, ✅ Perfil básico | ❌ Validaciones de perfil |
| **Viajes** | 3 tests | ✅ Crear, ✅ Editar, ✅ Eliminar | ❌ Validaciones de formulario |
| **Búsqueda** | 2 tests | ✅ Buscar, ✅ Renderizar matches | ❌ Reservar desde matches |
| **Reservas** | 3 tests | ✅ Crear básico, ✅ Cancelar | ❌ UI actualizada, ❌ Flujo desde matches |
| **Flujos** | 2 tests | ✅ Navegación, ✅ Auth persistente | ❌ Flujo completo de reserva |

---

## ✅ Funcionalidades CUBIERTAS por Tests

### 1. Autenticación (`02-authentication/`)
- ✅ Login via Keycloak
- ✅ Editar perfil básico
- ✅ Navegación autenticada

### 2. Viajes (`03-trips/`)
- ✅ Crear viaje con datos básicos
- ✅ Editar viaje (+1 asiento)
- ✅ Eliminar viaje
- ✅ Navegación a página trips

### 3. Búsqueda de Viajes (`04-matches/`)
- ✅ Buscar viajes por destino
- ✅ Renderizar matches encontrados
- ✅ Verificar que encuentra resultados

### 4. Reservas (`05-bookings/`)
- ✅ Crear reserva desde formulario manual (con trip ID)
- ✅ Cancelar reserva
- ✅ Verificar estado CANCELLED

### 5. Navegación General (`06-flows/`)
- ✅ Navegación entre páginas
- ✅ Persistencia de autenticación

---

## ❌ Funcionalidades NUEVAS que NO están cubiertas

### 1. Validaciones de Formularios ⚠️ CRÍTICO

**Implementado en código**:
- Validación de campos obligatorios
- Validación de email con regex
- Validación de rangos (lat/lng, asientos)
- Mensajes de error específicos
- Prevención de envío con errores

**NO cubierto en tests**:
```typescript
// FALTA:
describe('Trip Form Validations', () => {
  it('should show error when lat is out of range', () => {
    // Ingresar lat = 95 (inválido)
    // Verificar mensaje: "La latitud debe estar entre -90 y 90"
  })
  
  it('should prevent submit with empty required fields', () => {
    // Intentar enviar sin llenar
    // Verificar que no se envía y muestra errores
  })
  
  it('should show error for past dates', () => {
    // Seleccionar fecha pasada
    // Verificar mensaje: "La fecha debe ser en el futuro"
  })
})
```

### 2. Perfil con Validaciones Mejoradas ⚠️ CRÍTICO

**Test actual**: Solo llena campos y guarda

**NO cubierto**:
```typescript
// FALTA:
describe('Profile Validations', () => {
  it('should validate email format', () => {
    // Ingresar email sin @
    // Verificar error
  })
  
  it('should mark required fields with asterisk', () => {
    // Verificar que campos tienen * rojo
  })
  
  it('should show helper text for optional fields', () => {
    // Verificar helper text en Horario
  })
  
  it('should use dropdown for sede', () => {
    // Verificar que Sede es un <select>, no <input>
  })
})
```

### 3. Reservar desde Buscador ⚠️ CRÍTICO

**Implementado**:
- Botón "Reservar Viaje" en cada match
- Prompt para seleccionar asientos
- Validación de asientos disponibles
- Mensaje de éxito/error
- Marca de "Ya reservado"

**Test actual**: ❌ No existe

**FALTA**:
```typescript
// FALTA:
describe('Book from Matches', () => {
  it('should book a trip from search results', () => {
    cy.visit('/matches')
    // Buscar viajes
    cy.get('select').select('SEDE-1')
    cy.contains('Buscar Viajes').click()
    
    // Reservar primer match
    cy.contains('Reservar Viaje').first().click()
    // Ingresar número de asientos en prompt
    cy.window().then((win) => {
      cy.stub(win, 'prompt').returns('1')
    })
    
    // Verificar mensaje de éxito
    cy.contains('Reserva creada exitosamente').should('be.visible')
    
    // Verificar marca "Ya reservado"
    cy.contains('Ya reservado').should('be.visible')
  })
  
  it('should show error when requesting too many seats', () => {
    // Intentar reservar más asientos de los disponibles
    // Verificar error
  })
})
```

### 4. UI Actualizada de Reservas

**Implementado**:
- Cards con diseño moderno
- Badges de estado con colores
- Información detallada (fecha, asientos, etc.)
- Mensajes de éxito/error
- Estado vacío mejorado

**Test actual**: Usa selectores antiguos (`input[aria-label="Trip ID"]`)

**FALTA actualizar**:
```typescript
// El test actual busca:
cy.get('input[aria-label="Trip ID"]')  // ❌ Ya no existe

// Debería buscar:
cy.get('[data-cy="booking-card"]')     // ✅ Nuevos selectores
cy.contains('Reserva #')               // ✅ Nuevo formato
```

### 5. Menú Responsive

**Implementado**:
- Botón hamburger en móvil
- Menú desplegable
- Cierre automático al navegar

**NO cubierto**:
```typescript
// FALTA:
describe('Responsive Menu', () => {
  it('should show hamburger menu on mobile', () => {
    cy.viewport('iphone-x')
    cy.visit('/')
    cy.get('[aria-expanded]').should('be.visible')
    cy.get('[aria-expanded]').click()
    cy.contains('Viajes').should('be.visible')
  })
})
```

### 6. Feedback Visual

**Implementado**:
- Loading spinners en botones
- Mensajes de éxito/error temporales
- Confirmaciones antes de eliminar
- Estados disabled durante acciones

**NO cubierto**:
```typescript
// FALTA:
describe('Visual Feedback', () => {
  it('should show loading state when creating trip', () => {
    // Verificar spinner durante creación
  })
  
  it('should show confirmation before deleting', () => {
    // Verificar dialog de confirmación
  })
  
  it('should disable button during action', () => {
    // Verificar que botón se deshabilita
  })
})
```

---

## 📈 Prioridad de Tests Faltantes

### 🔴 ALTA PRIORIDAD (Funcionalidad crítica)

1. **Reservar desde buscador** (Flujo principal del producto)
   - Es la funcionalidad más importante
   - Actualmente solo se puede reservar manualmente con Trip ID

2. **Validaciones de formularios** (Calidad de datos)
   - Asegura que no se envíen datos inválidos
   - Evita errores en backend

3. **UI actualizada de Reservas** (Regresión)
   - Tests actuales fallarán con la nueva UI
   - Necesitan actualización urgente

### 🟡 MEDIA PRIORIDAD (UX)

4. **Perfil con validaciones**
   - Email format validation
   - Sede como dropdown

5. **Feedback visual**
   - Loading states
   - Confirmaciones

### 🟢 BAJA PRIORIDAD (Nice to have)

6. **Menú responsive**
   - Funciona pero no está testeado
   - Más importante para mobile

---

## 🎯 Tests Recomendados para Agregar

### Nuevo archivo: `03-trips/form-validations.cy.ts`
```typescript
describe('Trip Form Validations', () => {
  beforeEach(() => {
    cy.loginViaKeycloak('test.user', 'password123')
    cy.visit('/trips')
    cy.contains('Crear Viaje').click()
  })

  it('should show asterisks on required fields', () => {
    cy.contains('Latitud de Origen *').should('be.visible')
    cy.contains('Longitud de Origen *').should('be.visible')
    cy.contains('Destino *').should('be.visible')
    cy.contains('Fecha y Hora *').should('be.visible')
    cy.contains('Asientos Totales *').should('be.visible')
  })

  it('should validate latitude range', () => {
    cy.get('input[placeholder="40.4168"]').type('95')
    cy.get('input[placeholder="40.4168"]').blur()
    cy.contains('debe estar entre -90 y 90').should('be.visible')
  })

  it('should prevent submit with errors', () => {
    cy.contains('button', 'Crear Viaje').click()
    cy.contains('corrige los errores').should('be.visible')
  })

  it('should validate future dates only', () => {
    // Llenar campos válidos excepto fecha
    cy.get('input[placeholder="40.4168"]').type('40.4168')
    cy.get('input[placeholder="-3.7038"]').type('-3.7038')
    cy.get('select').select('SEDE-1')
    // Fecha pasada
    cy.get('input[type="datetime-local"]').type('2020-01-01T08:00')
    cy.get('input[type="number"]').type('2')
    
    cy.contains('button', 'Crear Viaje').click()
    cy.contains('debe ser en el futuro').should('be.visible')
  })
})
```

### Nuevo archivo: `04-matches/book-from-search.cy.ts`
```typescript
describe('Book from Search Results', () => {
  beforeEach(() => {
    cy.loginViaKeycloak('test.user', 'password123')
  })

  it('should book a trip from search results', () => {
    cy.visit('/matches')
    cy.get('select').select('SEDE-1')
    cy.contains('Buscar Viajes').click()
    
    // Esperar resultados
    cy.contains('Encontrados', { timeout: 10000 }).should('be.visible')
    
    // Mock del prompt para asientos
    cy.window().then((win) => {
      cy.stub(win, 'prompt').returns('1')
      cy.stub(win, 'confirm').returns(true)
    })
    
    // Reservar primer viaje
    cy.contains('Reservar Viaje').first().click()
    
    // Verificar mensaje de éxito
    cy.contains('Reserva creada exitosamente', { timeout: 8000 }).should('be.visible')
    
    // Verificar marca "Ya reservado"
    cy.contains('Ya reservado').should('be.visible')
  })

  it('should validate seats availability', () => {
    cy.visit('/matches')
    cy.get('select').select('SEDE-1')
    cy.contains('Buscar Viajes').click()
    
    cy.contains('Encontrados').should('be.visible')
    
    // Intentar reservar más asientos de los disponibles
    cy.window().then((win) => {
      cy.stub(win, 'prompt').returns('999')
    })
    
    cy.contains('Reservar Viaje').first().click()
    cy.contains('Solo hay').should('be.visible')
  })
  
  it('should disable button when no seats available', () => {
    // Crear viaje sin asientos disponibles
    // Verificar que botón dice "Sin asientos disponibles"
    // Verificar que está disabled
  })
})
```

### Actualizar: `05-bookings/create-cancel.cy.ts`
```typescript
describe('Bookings - Updated UI', () => {
  beforeEach(() => {
    cy.loginViaKeycloak('test.user', 'password123')
  })

  it('should show bookings with new card design', () => {
    // Crear una reserva primero
    cy.request('http://localhost:8081/api/trips').then((res) => {
      const tripId = res.body[0].id
      return cy.request('POST', 'http://localhost:8083/api/bookings', {
        tripId,
        seatsRequested: 1
      })
    })
    
    cy.visit('/bookings')
    
    // Verificar nuevo diseño
    cy.get('[data-cy="booking-card"]').should('exist')
    cy.contains('Reserva #').should('be.visible')
    cy.contains('ID del Viaje').should('be.visible')
    cy.contains('Asientos reservados').should('be.visible')
    
    // Verificar badge de estado
    cy.contains('Pendiente').should('be.visible')
  })

  it('should show confirmation before cancelling', () => {
    cy.visit('/bookings')
    
    cy.window().then((win) => {
      cy.stub(win, 'confirm').returns(false)
    })
    
    cy.contains('Cancelar Reserva').first().click()
    
    // No debería cancelarse si el usuario rechaza
    cy.contains('CANCELLED').should('not.exist')
  })

  it('should show empty state when no bookings', () => {
    // Cancelar todas las reservas
    cy.visit('/bookings')
    cy.contains('No tienes reservas').should('be.visible')
    cy.contains('📋').should('be.visible')
    cy.contains('Ve a "Buscar"').should('be.visible')
  })
})
```

### Nuevo archivo: `02-authentication/profile-validations.cy.ts`
```typescript
describe('Profile Validations', () => {
  beforeEach(() => {
    cy.loginViaKeycloak('test.user', 'password123')
    cy.visit('/me')
  })

  it('should show required field indicators', () => {
    cy.contains('Nombre').should('contain', '*')
    cy.contains('Email').should('contain', '*')
    cy.contains('Sede').should('contain', '*')
    cy.contains('Horario').should('not.contain', '*')
  })

  it('should show explanation for required fields', () => {
    cy.contains('Indica un campo obligatorio').should('be.visible')
  })

  it('should validate email format', () => {
    cy.contains('Email').parent().find('input').clear().type('invalidemail')
    cy.contains('Email').parent().find('input').blur()
    cy.contains('email válido').should('be.visible')
  })

  it('should validate minimum name length', () => {
    cy.contains('Nombre').parent().find('input').clear().type('A')
    cy.contains('Nombre').parent().find('input').blur()
    cy.contains('al menos 2 caracteres').should('be.visible')
  })

  it('should use dropdown for sede selection', () => {
    cy.contains('Sede').parent().find('select').should('exist')
    cy.contains('Sede').parent().find('select').select('SEDE-1')
  })

  it('should prevent submit with validation errors', () => {
    cy.contains('Nombre').parent().find('input').clear()
    cy.contains('Guardar Cambios').click()
    cy.contains('corrige los errores').should('be.visible')
  })
})
```

### Nuevo archivo: `07-responsive/mobile-menu.cy.ts`
```typescript
describe('Responsive Mobile Menu', () => {
  beforeEach(() => {
    cy.loginViaKeycloak('test.user', 'password123')
  })

  it('should show hamburger menu on mobile', () => {
    cy.viewport('iphone-x')
    cy.visit('/')
    
    // Verificar que menú desktop está oculto
    cy.get('.md\\:flex').should('not.be.visible')
    
    // Verificar botón hamburger visible
    cy.get('button[aria-expanded]').should('be.visible')
    
    // Abrir menú
    cy.get('button[aria-expanded]').click()
    
    // Verificar opciones del menú
    cy.contains('Viajes').should('be.visible')
    cy.contains('Buscar').should('be.visible')
    cy.contains('Reservas').should('be.visible')
    cy.contains('Mi Perfil').should('be.visible')
  })

  it('should close menu after navigation', () => {
    cy.viewport('iphone-x')
    cy.visit('/')
    
    cy.get('button[aria-expanded]').click()
    cy.contains('Viajes').click()
    
    // Menú debería cerrarse
    cy.get('button[aria-expanded]').should('have.attr', 'aria-expanded', 'false')
  })

  it('should show sticky navbar on scroll', () => {
    cy.visit('/trips')
    cy.scrollTo('bottom')
    
    // Navbar debería seguir visible
    cy.get('nav').should('be.visible')
    cy.contains('bonÀreaGo').should('be.visible')
  })
})
```

---

## 🔧 Tests que Necesitan ACTUALIZACIÓN

### `05-bookings/create-cancel.cy.ts` ⚠️ ROMPERÁ
**Problema**: Usa selectores antiguos que ya no existen

**Línea 16-17**: 
```typescript
cy.get('input[aria-label="Trip ID"]').clear().type(tripId)  // ❌ No existe
cy.get('input[aria-label="Seats"]').clear().type('1')       // ❌ No existe
```

**Debería usar**:
```typescript
// El formulario manual fue eliminado
// Ahora se reserva desde /matches
// O hacer request directa a la API
```

### `02-authentication/profile-edit.cy.ts` ⚠️ PUEDE FALLAR
**Problema**: Asume que Sede es un input, ahora es un select

**Línea 12**:
```typescript
cy.contains('Sede').parent().find('input').clear().type('SEDE-1')  // ❌ Ahora es select
```

**Debería usar**:
```typescript
cy.contains('Sede').parent().find('select').select('SEDE-1')  // ✅ Correcto
```

---

## 📝 Resumen de Acciones Recomendadas

### Inmediatas (Prevenir regresión)
1. ✅ Actualizar `profile-edit.cy.ts` → Cambiar input por select
2. ✅ Actualizar `create-cancel.cy.ts` → Adaptar a nueva UI o eliminar

### Corto plazo (Cobertura crítica)
3. ✅ Crear `book-from-search.cy.ts` → Flujo principal
4. ✅ Crear `form-validations.cy.ts` → Validaciones de trips
5. ✅ Crear `profile-validations.cy.ts` → Validaciones de perfil

### Mediano plazo (Cobertura completa)
6. ✅ Crear `mobile-menu.cy.ts` → Tests responsive
7. ✅ Crear `visual-feedback.cy.ts` → Loading, mensajes, etc.
8. ✅ Actualizar `complete-journey.cy.ts` → Incluir flujo de reserva

---

## 🎯 Métricas de Cobertura

### Actual
```
Tests totales: 13
Funcionalidades cubiertas: ~40%
Tests que fallarán con cambios: 2-3
```

### Objetivo
```
Tests totales: 25-30
Funcionalidades cubiertas: ~85%
Tests actualizados: 100%
```

---

## 🚀 Cómo Ejecutar Tests

```bash
# Todos los tests E2E
npm run cypress:run

# Modo interactivo (desarrollo)
npm run cypress:open

# Solo un test específico
npx cypress run --spec "cypress/e2e/04-matches/book-from-search.cy.ts"
```

---

## 📚 Referencias

- **Cypress Docs**: https://docs.cypress.io
- **Test Patterns**: `/Frontend/cypress/README.md`
- **Custom Commands**: `/Frontend/cypress/support/commands.ts`
- **System Patterns**: `/memory-bank/systemPatterns.md`


