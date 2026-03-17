describe('Push subscription flow', () => {
  function createMockSubscription() {
    const p256 = new TextEncoder().encode('p256dh-mock');
    const auth = new TextEncoder().encode('auth-mock');
    return {
      endpoint: 'https://push.example/sub/abc',
      getKey: (name: 'p256dh' | 'auth') => {
        return name === 'p256dh' ? p256.buffer : auth.buffer;
      },
      unsubscribe: cy.stub().resolves(true)
    } as unknown as PushSubscription;
  }

  function createMockPushManager() {
    return {
      getSubscription: cy.stub().resolves(null),
      subscribe: cy.stub().resolves(createMockSubscription()),
      permissionState: 'granted'
    };
  }

  function createMockServiceWorker() {
    return {
      register: cy.stub().resolves({
        pushManager: createMockPushManager()
      }),
      getRegistration: cy.stub().resolves({
        pushManager: createMockPushManager()
      })
    };
  }

  it('enables push and calls subscribe API', () => {
    // Ensure app is authenticated or bypassed
    Cypress.env('authDisabled', true)
    cy.loginViaKeycloak('test', 'test')
    // Intercept backend subscribe call
    cy.intercept('GET', '**/users/me', { statusCode: 200, body: { id: 'u1', name: 'Test', email: 't@t.com', sedeId: 'SEDE-1' } }).as('me')
    cy.intercept('POST', '**/notifications/subscribe', { statusCode: 200, body: {} }).as('subscribe');

    cy.visit('/profile', {
      onBeforeLoad(win) {
        const swMock = createMockServiceWorker();
        Object.defineProperty(win.navigator, 'serviceWorker', { value: swMock, configurable: true });
      }
    });

    cy.contains('Notificaciones Push', { timeout: 15000 });
    cy.contains('Habilitar').click();

    cy.wait('@subscribe').its('request.body').should((body) => {
      expect(body).to.have.property('endpoint');
      expect(body).to.have.property('p256dhKey');
      expect(body).to.have.property('authKey');
    });
  });

  it('disables push and calls unsubscribe API', () => {
    Cypress.env('authDisabled', true)
    cy.loginViaKeycloak('test', 'test')
    cy.intercept('GET', '**/users/me', { statusCode: 200, body: { id: 'u1', name: 'Test', email: 't@t.com', sedeId: 'SEDE-1' } }).as('me')
    cy.intercept('DELETE', '**/notifications/unsubscribe*', { statusCode: 200, body: {} }).as('unsubscribe');

    cy.visit('/profile', {
      onBeforeLoad(win) {
        const mockSub = createMockSubscription();
        const swMock = {
          register: cy.stub().resolves({
            pushManager: {
              getSubscription: cy.stub().resolves(mockSub)
            }
          }),
          getRegistration: cy.stub().resolves({
            pushManager: {
              getSubscription: cy.stub().resolves(mockSub)
            }
          })
        } as any;
        Object.defineProperty(win.navigator, 'serviceWorker', { value: swMock, configurable: true });
      }
    });

    cy.contains('Deshabilitar', { timeout: 15000 }).click();
    cy.wait('@unsubscribe').its('request.url').should('contain', 'endpoint=');
  });

  it('handles service worker registration failure', () => {
    Cypress.env('authDisabled', true)
    cy.loginViaKeycloak('test', 'test')
    cy.intercept('GET', '**/users/me', { statusCode: 200, body: { id: 'u1', name: 'Test', email: 't@t.com', sedeId: 'SEDE-1' } }).as('me')

    cy.visit('/profile', {
      onBeforeLoad(win) {
        const swMock = {
          register: cy.stub().rejects(new Error('Service Worker registration failed')),
          getRegistration: cy.stub().resolves(null)
        } as any;
        Object.defineProperty(win.navigator, 'serviceWorker', { value: swMock, configurable: true });
      }
    });

    cy.contains('Notificaciones Push', { timeout: 15000 });
    cy.contains('Habilitar').click();
    
    // Should show error message
    cy.contains('Error al registrar Service Worker').should('be.visible');
  });

  it('handles push permission denied', () => {
    Cypress.env('authDisabled', true)
    cy.loginViaKeycloak('test', 'test')
    cy.intercept('GET', '**/users/me', { statusCode: 200, body: { id: 'u1', name: 'Test', email: 't@t.com', sedeId: 'SEDE-1' } }).as('me')

    cy.visit('/profile', {
      onBeforeLoad(win) {
        const swMock = {
          register: cy.stub().resolves({
            pushManager: {
              getSubscription: cy.stub().resolves(null),
              subscribe: cy.stub().rejects(new Error('Permission denied')),
              permissionState: 'denied'
            }
          }),
          getRegistration: cy.stub().resolves(null)
        } as any;
        Object.defineProperty(win.navigator, 'serviceWorker', { value: swMock, configurable: true });
      }
    });

    cy.contains('Notificaciones Push', { timeout: 15000 });
    cy.contains('Habilitar').click();
    
    // Should show permission denied message
    cy.contains('Permisos de notificación denegados').should('be.visible');
  });

  it('handles subscription API failure', () => {
    Cypress.env('authDisabled', true)
    cy.loginViaKeycloak('test', 'test')
    cy.intercept('GET', '**/users/me', { statusCode: 200, body: { id: 'u1', name: 'Test', email: 't@t.com', sedeId: 'SEDE-1' } }).as('me')
    cy.intercept('POST', '**/notifications/subscribe', { statusCode: 500, body: { error: 'Internal Server Error' } }).as('subscribe');

    cy.visit('/profile', {
      onBeforeLoad(win) {
        const swMock = createMockServiceWorker();
        Object.defineProperty(win.navigator, 'serviceWorker', { value: swMock, configurable: true });
      }
    });

    cy.contains('Notificaciones Push', { timeout: 15000 });
    cy.contains('Habilitar').click();

    cy.wait('@subscribe');
    cy.contains('Error al suscribirse a notificaciones').should('be.visible');
  });

  it('handles unsubscribe API failure', () => {
    Cypress.env('authDisabled', true)
    cy.loginViaKeycloak('test', 'test')
    cy.intercept('GET', '**/users/me', { statusCode: 200, body: { id: 'u1', name: 'Test', email: 't@t.com', sedeId: 'SEDE-1' } }).as('me')
    cy.intercept('DELETE', '**/notifications/unsubscribe*', { statusCode: 500, body: { error: 'Internal Server Error' } }).as('unsubscribe');

    cy.visit('/profile', {
      onBeforeLoad(win) {
        const mockSub = createMockSubscription();
        const swMock = {
          register: cy.stub().resolves({
            pushManager: {
              getSubscription: cy.stub().resolves(mockSub)
            }
          }),
          getRegistration: cy.stub().resolves({
            pushManager: {
              getSubscription: cy.stub().resolves(mockSub)
            }
          })
        } as any;
        Object.defineProperty(win.navigator, 'serviceWorker', { value: swMock, configurable: true });
      }
    });

    cy.contains('Deshabilitar', { timeout: 15000 }).click();
    cy.wait('@unsubscribe');
    cy.contains('Error al desuscribirse de notificaciones').should('be.visible');
  });

  it('persists subscription state across page reloads', () => {
    Cypress.env('authDisabled', true)
    cy.loginViaKeycloak('test', 'test')
    cy.intercept('GET', '**/users/me', { statusCode: 200, body: { id: 'u1', name: 'Test', email: 't@t.com', sedeId: 'SEDE-1' } }).as('me')
    cy.intercept('POST', '**/notifications/subscribe', { statusCode: 200, body: {} }).as('subscribe');

    cy.visit('/profile', {
      onBeforeLoad(win) {
        const swMock = createMockServiceWorker();
        Object.defineProperty(win.navigator, 'serviceWorker', { value: swMock, configurable: true });
      }
    });

    cy.contains('Notificaciones Push', { timeout: 15000 });
    cy.contains('Habilitar').click();
    cy.wait('@subscribe');

    // Reload page
    cy.reload();
    cy.contains('Deshabilitar', { timeout: 15000 }).should('be.visible');
  });

  it('handles network connectivity issues', () => {
    Cypress.env('authDisabled', true)
    cy.loginViaKeycloak('test', 'test')
    cy.intercept('GET', '**/users/me', { statusCode: 200, body: { id: 'u1', name: 'Test', email: 't@t.com', sedeId: 'SEDE-1' } }).as('me')
    cy.intercept('POST', '**/notifications/subscribe', { forceNetworkError: true }).as('subscribe');

    cy.visit('/profile', {
      onBeforeLoad(win) {
        const swMock = createMockServiceWorker();
        Object.defineProperty(win.navigator, 'serviceWorker', { value: swMock, configurable: true });
      }
    });

    cy.contains('Notificaciones Push', { timeout: 15000 });
    cy.contains('Habilitar').click();
    
    cy.contains('Error de conexión').should('be.visible');
  });
});


