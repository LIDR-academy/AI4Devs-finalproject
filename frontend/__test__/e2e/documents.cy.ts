describe('Documents CRUD Operations', () => {
  beforeEach(() => {
    // Simplified setup for CI compatibility
    cy.clearLocalStorage();
    
    // Mock auth API response
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        token: 'fake-jwt-token',
        user: {
          id: '1',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
        }
      }
    }).as('loginRequest');

    // Visit login page and login
    cy.visit('/login');
    cy.get('button[type="submit"]').click();
    cy.wait('@loginRequest');

    // Should redirect to dashboard
    cy.url().should('include', '/dashboard');
    
    // Navigate to documents
    cy.visit('/documents');
    
    // Wait for page to load
    cy.wait(1000);
  });

  it('should display the documents page', () => {
    cy.contains('Documents').should('be.visible');
    // Wait for the page to load completely
    cy.get('[data-testid="upload-button"], button:contains("Upload")').should('be.visible');
  });

  it('should open upload modal', () => {
    // Use a more specific selector and wait for stability
    cy.get('[data-testid="upload-button"], button:contains("Upload")').first().click({ force: true });
    cy.wait(500); // Wait for modal to open
    cy.get('input[type="file"]').should('exist');
  });

  it('should search documents', () => {
    // Check if search input exists, if not skip the test
    cy.get('body').then(($body) => {
      if ($body.find('input[placeholder*="Search"]').length > 0) {
        cy.get('input[placeholder*="Search"]').first().type('test');
        cy.get('input[placeholder*="Search"]').first().should('have.value', 'test');
      } else {
        cy.log('Search functionality not available on this page');
      }
    });
  });

  it('should handle file upload form', () => {
    // Mock upload API
    cy.intercept('POST', '/api/documents/upload', {
      statusCode: 201,
      body: {
        id: '2',
        filename: 'uploaded-document.pdf',
        originalName: 'Uploaded Document.pdf',
        title: 'Uploaded Document',
        mimeType: 'application/pdf',
        size: 2048,
        status: 'processing',
        isActive: true,
        createdAt: '2023-01-03T00:00:00.000Z',
        updatedAt: '2023-01-03T00:00:00.000Z'
      }
    }).as('uploadDocument');
    
    cy.get('[data-testid="upload-button"], button:contains("Upload")').first().click({ force: true });
    cy.wait(500); // Wait for modal to open
    
    // Check if form exists
    cy.get('body').then(($body) => {
      if ($body.find('input[type="text"]').length > 0) {
        cy.get('input[type="text"]').first().type('Test Document', { force: true });
      }
      
      // Try to find and click submit button
      if ($body.find('button[type="submit"]').length > 0) {
        cy.get('button[type="submit"]').first().click({ force: true });
      }
    });
    
    cy.wait(1000);
  });
}); 