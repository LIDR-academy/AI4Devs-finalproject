describe('Matches Direction Filter', () => {
  it('should load matches page and allow sede selection', () => {
    cy.loginViaKeycloak('test.user', 'password123');
    cy.visit('/matches');

    // Wait for page to load
    cy.get('body', { timeout: 10000 }).should('be.visible');

    // Test basic functionality - verify page loads and has form elements
    cy.get('select').should('exist');
    cy.get('button').should('exist');
    
    // Wait for selects to be fully loaded
    cy.get('select').should('have.length.at.least', 2);
    
    // Test that we can select different sedes
    cy.get('select').eq(1).should('be.visible').select('SEDE-1');
    cy.get('select').eq(1).should('have.value', 'SEDE-1');
    
    cy.get('select').eq(1).select('SEDE-2');
    cy.get('select').eq(1).should('have.value', 'SEDE-2');
    
    // Test that search button is clickable
    cy.get('button').contains('Buscar Viajes').should('be.visible').click();
    
    // Verify we're still on matches page
    cy.url().should('include', '/matches');
  });
});


