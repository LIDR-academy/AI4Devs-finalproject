describe('IKIGOO: Complete mobile E2E', () => {
    beforeEach(() => {
        cy.viewport(550, 750)
        cy.visit('http://localhost:3001');
    });

    it('open app: should show the application', () => {
        cy.get('.chat-header').should('exist');
        cy.get('.sidebar').should('be.hidden');
        cy.get('.itinerary').should('not.exist');

        cy.get('.chat .message-list').should('not.exist');
        cy.get('.chat-waiting-message').should('exist');
    });

    it('btn new chat: should reload the page and reset the chat and itinerary', () => {
        cy.get('.chat-header .menu-icon').should('exist');
        cy.get('.chat-header .menu-icon').click();

        cy.get('.sidebar').should('exist');
        cy.get('.sidebar .btn-new-chat').last().click();

        cy.reload();

        cy.get('.chat .message-list').should('not.exist');
        cy.get('.chat-waiting-message').should('exist');
    });

    it('btn send message: should send a message to the chat', () => {
        cy.get('.chat-input .input-message').type('Itinerary to London');
        cy.get('.chat-input .btn-send-message').click();

        cy.get('.chat .message-list').should('exist');
        cy.get('.chat .message-list').should('have.length', 1);
    });

    it('receiving message: should show the assistant message in the chat', () => {
        cy.intercept('POST', '/chat').as('askChat');

        cy.get('.chat-input .input-message').type('Itinerary to London');
        cy.get('.chat-input .input-message').should('have.value', 'Itinerary to London');
        cy.get('.chat-input .btn-send-message').click();

        cy.get('.chat .message-list').should('exist');
        cy.get('.chat .message-list .message-item').should('have.length', 1);

        cy.wait('@askChat', { timeout: 10000 }); 

        cy.get('.chat .message-list .message-item').should('have.length', 2);
    });
});