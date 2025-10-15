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
    // In bypass mode, there is no real Keycloak session; just ensure app is loaded
    cy.visit('/')
    cy.wait(500)
    return
  }

  cy.session(
    [username, password],
    () => {
      cy.visit('/')

      // Click login button (robust against re-render)
      cy.get('body', { timeout: 10000 }).then(($body) => {
        const text = $body.text()
        if (text.includes('Iniciar Sesión')) {
          cy.contains('Iniciar Sesión', { timeout: 10000 })
            .should('be.visible')
            .click({ force: true })
        } else if (text.includes('Comenzar Ahora')) {
          cy.contains('Comenzar Ahora', { timeout: 10000 })
            .should('be.visible')
            .click({ force: true })
        } else if (text.includes('Cerrar Sesión')) {
          // already authenticated
          return
        } else {
          cy.contains(/Iniciar Sesión|Comenzar Ahora|Cerrar Sesión/, { timeout: 10000 }).should('be.visible')
        }
      })

      // Handle Keycloak login page via cy.origin
      cy.origin(
        Cypress.env('keycloakUrl'),
        { args: { username, password } },
        ({ username, password }) => {
          cy.url({ timeout: 15000 }).should('include', '/realms/')
          cy.get('input[name="username"]', { timeout: 10000 }).should('be.visible')
          cy.get('input[name="username"]').clear().type(username)
          cy.get('input[name="password"]').clear().type(password)
          cy.get('input[type="submit"]').click()
        }
      )

      // Verify back to app and authenticated UI appears
      cy.url({ timeout: 20000 }).should('include', Cypress.config('baseUrl'))
      cy.contains(/Crear Viaje|Cerrar Sesión/, { timeout: 20000 }).should('be.visible')

      // Give extra time for AuthProvider to update state after callback
      cy.wait(1000)

      // Reload the page to ensure state is fresh
      cy.reload()

      // Confirm authenticated state
      cy.contains(/Crear Viaje|Cerrar Sesión/, { timeout: 10000 }).should('be.visible')
    },
    {
      validate() {
        const isBypassValidate = Cypress.env('authDisabled') === true || Cypress.env('authDisabled') === 'true'
        if (isBypassValidate) {
          cy.visit('/')
          return
        }
        cy.visit('/')
        cy.contains(/Crear Viaje|Cerrar Sesión/, { timeout: 10000 }).should('be.visible')
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

// Prevent TypeScript errors
export {}
