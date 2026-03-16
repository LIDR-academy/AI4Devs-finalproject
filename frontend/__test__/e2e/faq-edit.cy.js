describe('FAQ CRUD Operations', () => {
  beforeEach(() => {
    // Mock auth API response like product-edit.cy.js
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

    // Mock FAQs API response
    cy.intercept('GET', '/api/faqs*', {
      statusCode: 200,
      body: {
        data: [
          {
            id: '1',
            question: 'What are your shipping times?',
            answer: 'We ship within 24-48 hours for most orders.',
            isActive: true,
            createdAt: '2023-01-01T00:00:00.000Z',
            updatedAt: '2023-01-01T00:00:00.000Z'
          }
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1
        }
      }
    }).as('getFAQs');

    // Visit login page and login
    cy.visit('/login');
    cy.get('button[type="submit"]').click();
    cy.wait('@loginRequest');

    // Should redirect to dashboard
    cy.url().should('include', '/dashboard');
    
    // Navigate to FAQs
    cy.visit('/faqs');
  });

  it('should create a new FAQ', () => {
    cy.wait('@getFAQs');
    
    // Mock create FAQ API
    cy.intercept('POST', '/api/faqs', {
      statusCode: 201,
      body: {
        id: '2',
        question: 'Test FAQ Question',
        answer: 'This is a test answer for the FAQ',
        isActive: true,
        createdAt: '2023-01-03T00:00:00.000Z',
        updatedAt: '2023-01-03T00:00:00.000Z'
      }
    }).as('createFAQ');
    
    // Click add FAQ button
    cy.contains('Add FAQ').click();
    
    // Fill the form
    cy.get('input[name="question"]').type('Test FAQ Question');
    cy.get('textarea[name="answer"]').type('This is a test answer for the FAQ');
    
    // Submit the form
    cy.get('body').then(($body) => {
      if ($body.find('button[type="submit"]').length > 0) {
        cy.get('button[type="submit"]').first().click();
      } else if ($body.find('button:contains("Save"), button:contains("Create")').length > 0) {
        cy.get('button:contains("Save"), button:contains("Create")').first().click();
      }
    });
    
    cy.wait('@createFAQ');
    
    // Verify that the request was successful
    cy.get('@createFAQ.all').should('have.length.at.least', 1);
  });

  it('should edit an existing FAQ', () => {
    cy.wait('@getFAQs');
    
    // Mock single FAQ fetch
    cy.intercept('GET', '/api/faqs/1', {
      statusCode: 200,
      body: {
        id: '1',
        question: 'What are your shipping times?',
        answer: 'We ship within 24-48 hours for most orders.',
        isActive: true,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z'
      }
    }).as('getFAQ');

    // Mock update FAQ API
    cy.intercept('PUT', '/api/faqs/1', {
      statusCode: 200,
      body: {
        id: '1',
        question: 'What are your shipping times?',
        answer: 'Updated answer for testing',
        isActive: true,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-03T00:00:00.000Z'
      }
    }).as('updateFAQ');
    
    // Click edit on first FAQ
    cy.get('table tbody tr').first().find('button').first().click({ force: true });
    cy.wait('@getFAQ');
    
    // Update the answer
    cy.get('textarea[name="answer"]').clear().type('Updated answer for testing');
    
    // Submit the form
    cy.get('body').then(($body) => {
      if ($body.find('button[type="submit"]').length > 0) {
        cy.get('button[type="submit"]').first().click();
      } else if ($body.find('button:contains("Save"), button:contains("Create")').length > 0) {
        cy.get('button:contains("Save"), button:contains("Create")').first().click();
      }
    });
    
    cy.wait('@updateFAQ');
    
    // Verify the request was made
    cy.get('@updateFAQ.all').should('have.length.at.least', 1);
  });
}); 