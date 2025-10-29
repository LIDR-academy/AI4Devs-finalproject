/// <reference types="cypress" />

// ***********************************************
// Custom commands for bonÀreaGo E2E tests
// ***********************************************

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login via Keycloak
       * @example cy.loginViaKeycloak('test.user', 'password123')
       */
      loginViaKeycloak(username: string, password: string): Chainable<void>
      
      /**
       * Custom command to logout
       * @example cy.logout()
       */
      logout(): Chainable<void>
      
      /**
       * Custom command to get element by data-cy attribute
       * @example cy.getByCy('submit-button')
       */
      getByCy(selector: string): Chainable<JQuery<HTMLElement>>
      
      /**
       * Alias for loginViaKeycloak for backward compatibility
       * @example cy.login()
       */
      login(): Chainable<void>
      
      /**
       * Smart authentication helper that handles both authenticated and non-authenticated states
       * @example cy.ensureAuthenticated()
       */
      ensureAuthenticated(): Chainable<void>
    }
  }
}

/**
 * Login via Keycloak using cy.session for performance
 * This caches the authentication state
 */
Cypress.Commands.add('loginViaKeycloak', (username: string, password: string) => {
  const isBypass = Cypress.env('authDisabled') === true || Cypress.env('authDisabled') === 'true'
  
  if (isBypass) {
    cy.log('🔓 Auth bypass enabled - skipping Keycloak login')
    cy.visit('/')
    cy.wait(500)
    return
  }

  cy.log(`🔐 Attempting login for user: ${username}`)

  cy.session(
    [username, password],
    () => {
      cy.log('📍 Step 1: Visiting home page')
      cy.visit('/')
      cy.wait(2000) // Wait for app to load

      // Check if already authenticated
      cy.log('📍 Step 2: Checking if already authenticated')
      cy.get('body', { timeout: 10000 }).then(($body) => {
        const text = $body.text()
        if (text.includes('Cerrar Sesión') || text.includes('Logout')) {
          cy.log('✅ Already authenticated, skipping login')
          return
        }
        cy.log('❌ Not authenticated, proceeding with login')
      })

      // Multiple strategies to find and click login button
      cy.log('📍 Step 3: Looking for login button')
      cy.get('body').then(($body) => {
        const bodyText = $body.text()
        
        // Strategy 1: Look for "Iniciar Sesión" button
        if (bodyText.includes('Iniciar Sesión')) {
          cy.log('✅ Found "Iniciar Sesión" button')
          cy.contains('button', 'Iniciar Sesión', { timeout: 5000 })
            .should('be.visible')
            .click({ force: true })
        }
        // Strategy 2: Look for "Login" button
        else if (bodyText.includes('Login')) {
          cy.log('✅ Found "Login" button')
          cy.contains('button', 'Login', { timeout: 5000 })
            .should('be.visible')
            .click({ force: true })
        }
        // Strategy 3: Look for "Comenzar Ahora" button
        else if (bodyText.includes('Comenzar Ahora')) {
          cy.log('✅ Found "Comenzar Ahora" button')
          cy.contains('button', 'Comenzar Ahora', { timeout: 5000 })
            .should('be.visible')
            .click({ force: true })
        }
        // Strategy 4: Fallback - any button with login text
        else {
          cy.log('⚠️ Using fallback strategy - looking for any login button')
          cy.get('button').contains(/Iniciar Sesión|Login|Comenzar Ahora/i, { timeout: 10000 })
            .first()
            .should('be.visible')
            .click({ force: true })
        }
      })

      // Handle Keycloak login page via cy.origin
      cy.log('📍 Step 4: Handling Keycloak login page')
      cy.origin(
        Cypress.env('keycloakUrl'),
        { args: { username, password } },
        ({ username, password }) => {
          cy.log(`🔑 Entering credentials for ${username}`)
          cy.url({ timeout: 15000 }).should('include', '/realms/')
          
          cy.get('input[name="username"]', { timeout: 10000 })
            .should('be.visible')
            .clear()
            .type(username)
          
          cy.get('input[name="password"]')
            .should('be.visible')
            .clear()
            .type(password)
          
          cy.get('input[type="submit"]').click()
          cy.log('✅ Credentials submitted')
        }
      )

      // Verify back to app and authenticated UI appears
      cy.log('📍 Step 5: Verifying redirect back to app')
      cy.url({ timeout: 20000 }).should('include', Cypress.config('baseUrl'))
      
      cy.log('📍 Step 6: Verifying authenticated UI')
      cy.contains(/Crear Viaje|Cerrar Sesión/i, { timeout: 20000 }).should('be.visible')

      // Give extra time for AuthProvider to update state after callback
      cy.wait(1000)

      // Reload the page to ensure state is fresh
      cy.log('📍 Step 7: Reloading page to ensure fresh state')
      cy.reload()

      // Confirm authenticated state
      cy.log('📍 Step 8: Confirming authenticated state')
      cy.contains(/Crear Viaje|Cerrar Sesión/i, { timeout: 10000 }).should('be.visible')
      cy.log('✅ Login successful!')
    },
    {
      validate() {
        const isBypassValidate = Cypress.env('authDisabled') === true || Cypress.env('authDisabled') === 'true'
        if (isBypassValidate) {
          cy.visit('/')
          return
        }
        cy.log('🔍 Validating session')
        cy.visit('/')
        cy.contains(/Crear Viaje|Cerrar Sesión/i, { timeout: 10000 }).should('be.visible')
        cy.log('✅ Session valid')
      },
    }
  )

  // After session is restored, visit home
  cy.visit('/')
})

/**
 * Logout command
 */
Cypress.Commands.add('logout', () => {
  cy.contains('Cerrar Sesión').click()
  cy.contains('Iniciar Sesión', { timeout: 5000 }).should('be.visible')
})

/**
 * Get element by data-cy attribute
 */
Cypress.Commands.add('getByCy', (selector: string) => {
  return cy.get(`[data-cy="${selector}"]`)
})

/**
 * Alias for loginViaKeycloak for backward compatibility
 */
Cypress.Commands.add('login', () => {
  cy.loginViaKeycloak('test.user', 'password123')
})

/**
 * Smart authentication helper that handles both authenticated and non-authenticated states
 * This replaces the problematic beforeEach logic in individual tests
 */
Cypress.Commands.add('ensureAuthenticated', () => {
  const isBypass = Cypress.env('authDisabled') === true || Cypress.env('authDisabled') === 'true'
  
  if (isBypass) {
    cy.log('🔓 Auth bypass enabled - skipping authentication')
    cy.visit('/')
    cy.wait(500)
    return
  }

  cy.log('🔐 Ensuring user is authenticated')
  cy.visit('/')
  cy.wait(2000) // Wait for app to load

  // Check if already authenticated
  cy.get('body', { timeout: 10000 }).then(($body) => {
    const text = $body.text()
    if (text.includes('Cerrar Sesión') || text.includes('Logout') || text.includes('Crear Viaje')) {
      cy.log('✅ Already authenticated, skipping login')
      return
    }
    
    // Not authenticated, proceed with login
    cy.log('❌ Not authenticated, proceeding with login')
    cy.loginViaKeycloak('testuser', 'testpassword')
  })
})

// Prevent TypeScript errors
export {}
