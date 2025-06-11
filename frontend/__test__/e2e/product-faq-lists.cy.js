describe('Product and FAQ Lists', () => {
  beforeEach(() => {
    // Reset any previous login state
    cy.clearLocalStorage();
    cy.window().then((win) => {
      win.sessionStorage.clear();
    });
    
    // Mock successful login
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        message: 'Login successful',
        token: 'test-token',
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
  });

  describe('Product List', () => {
    beforeEach(() => {
      // Mock products API response
      cy.intercept('GET', '/api/products*', {
        statusCode: 200,
        body: {
          data: [
            {
              id: '1',
              name: 'Parmigiano Reggiano DOP',
              description: 'Authentic Parmigiano Reggiano aged 24 months from Emilia-Romagna.',
              price: 19.99,
              imageUrl: 'https://images.unsplash.com/photo-1599937970284-31e55c9435c4',
              category: 'Cheese & Dairy',
              createdAt: '2023-01-01T00:00:00.000Z',
              updatedAt: '2023-01-01T00:00:00.000Z'
            },
            {
              id: '2',
              name: 'Extra Virgin Olive Oil',
              description: 'Cold-pressed Tuscan extra virgin olive oil with fruity notes.',
              price: 24.99,
              imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5',
              category: 'Olive Oil & Vinegar',
              createdAt: '2023-01-02T00:00:00.000Z',
              updatedAt: '2023-01-02T00:00:00.000Z'
            }
          ],
          pagination: {
            page: 1,
            limit: 10,
            total: 2,
            totalPages: 1
          }
        }
      }).as('getProducts');

      // Mock categories API response
      cy.intercept('GET', '/api/products/categories', {
        statusCode: 200,
        body: ['Cheese & Dairy', 'Olive Oil & Vinegar']
      }).as('getCategories');

      // Navigate to products page
      cy.visit('/products');
    });

    it('should display product list', () => {
      cy.wait('@getProducts');
      
      // Check page title
      cy.contains('h1', 'Products').should('be.visible');
      
      // Check product list is displayed
      cy.get('table').should('be.visible');
      cy.contains('Parmigiano Reggiano DOP').should('be.visible');
      cy.contains('Extra Virgin Olive Oil').should('be.visible');
      
      // Check products are displayed (without checking price format)
      cy.get('table tbody tr').should('have.length', 2);
    });

    it('should filter products by category', () => {
      cy.wait('@getProducts');
      
      // Intercept filtered products request
      cy.intercept('GET', '/api/products*category=Cheese+%26+Dairy*', {
        statusCode: 200,
        body: {
          data: [
            {
              id: '1',
              name: 'Parmigiano Reggiano DOP',
              description: 'Authentic Parmigiano Reggiano aged 24 months from Emilia-Romagna.',
              price: 19.99,
              imageUrl: 'https://images.unsplash.com/photo-1599937970284-31e55c9435c4',
              category: 'Cheese & Dairy',
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
      }).as('getFilteredProducts');
      
      // Select category from dropdown
      cy.get('select').eq(0).select('Cheese & Dairy');
      cy.wait('@getFilteredProducts');
      
      // Check only filtered product is displayed
      cy.contains('Parmigiano Reggiano DOP').should('be.visible');
      cy.contains('Extra Virgin Olive Oil').should('not.exist');
    });

    it('should show add product button for admins', () => {
      cy.wait('@getProducts');
      
      // Check add button is present
      cy.contains('button', 'Add Product').should('be.visible');
    });

    it('should open edit form when edit button clicked', () => {
      cy.wait('@getProducts');
      
      // Mock product fetch by ID
      cy.intercept('GET', '/api/products/1', {
        statusCode: 200,
        body: {
          id: '1',
          name: 'Parmigiano Reggiano DOP',
          description: 'Authentic Parmigiano Reggiano aged 24 months from Emilia-Romagna.',
          price: 19.99,
          category: 'Cheese & Dairy',
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T00:00:00.000Z'
        }
      }).as('getProduct');
      
      // Find and click edit button for first product
      cy.get('table tbody tr').first().find('button').first().click();
      cy.wait('@getProduct');
      
      // Check slide panel appears with form
      cy.contains('Edit Product').should('be.visible');
      cy.get('form').should('be.visible');
      cy.get('input[name="name"]').should('have.value', 'Parmigiano Reggiano DOP');
    });
  });

  describe('FAQ List', () => {
    beforeEach(() => {
      // Mock FAQs API response
      cy.intercept('GET', '/api/faqs*', {
        statusCode: 200,
        body: {
          data: [
            {
              id: '1',
              question: 'Do you ship internationally?',
              answer: 'Yes, we ship to most countries worldwide.',
              createdAt: '2023-01-01T00:00:00.000Z',
              updatedAt: '2023-01-01T00:00:00.000Z'
            },
            {
              id: '2',
              question: 'What is your return policy?',
              answer: 'We accept returns within 30 days of purchase.',
              createdAt: '2023-01-02T00:00:00.000Z',
              updatedAt: '2023-01-02T00:00:00.000Z'
            }
          ],
          pagination: {
            page: 1,
            limit: 10,
            total: 2,
            totalPages: 1
          }
        }
      }).as('getFaqs');

      // Navigate to FAQs page
      cy.visit('/faqs');
    });

    it('should display FAQ list', () => {
      cy.wait('@getFaqs');
      
      // Check page title
      cy.contains('h1', 'FAQs').should('be.visible');
      
      // Check FAQ list is displayed
      cy.get('table').should('be.visible');
      cy.contains('Do you ship internationally?').should('be.visible');
      cy.contains('What is your return policy?').should('be.visible');
    });

    it('should show add FAQ button for admins', () => {
      cy.wait('@getFaqs');
      
      // Check add button is present
      cy.contains('button', 'Add FAQ').should('be.visible');
    });

    it('should open edit form when edit button clicked', () => {
      cy.wait('@getFaqs');
      
      // Mock FAQ fetch by ID
      cy.intercept('GET', '/api/faqs/1', {
        statusCode: 200,
        body: {
          id: '1',
          question: 'Do you ship internationally?',
          answer: 'Yes, we ship to most countries worldwide.',
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T00:00:00.000Z'
        }
      }).as('getFaq');
      
      // Find and click edit button for first FAQ
      cy.get('table tbody tr').first().find('button').first().click();
      cy.wait('@getFaq');
      
      // Check slide panel appears with form
      cy.contains('Edit FAQ').should('be.visible');
      cy.get('form').should('be.visible');
      cy.get('input[name="question"]').should('have.value', 'Do you ship internationally?');
    });
  });
}); 