describe('IKIGOO: Complete desktop E2E', () => {
    beforeEach(() => {
        cy.viewport(1280, 720);
        cy.visit('http://localhost:3001');
    });

    it('open app: should show the application', () => {
        cy.get('.itinerary .itinerary-details').should('not.exist');
        cy.get('.itinerary-loading').should('exist');

        cy.get('.chat .message-list').should('not.exist');
        cy.get('.chat-waiting-message').should('exist');
    });

    it('btn new chat: should reload the page and reset the chat and itinerary', () => {
        cy.get('.sidebar .btn-new-chat').click();

        cy.reload();

        cy.get('.itinerary .itinerary-details').should('not.exist');
        cy.get('.itinerary-loading').should('exist');

        cy.get('.chat .message-list').should('not.exist');
        cy.get('.chat-waiting-message').should('exist');
    });

    it('btn send message: should send a message to the chat', () => {
        cy.get('.chat-input .input-message').type('Itinerary to London');
        cy.get('.chat-input .btn-send-message').click();

        cy.get('.chat .message-list').should('exist');
        cy.get('.chat .message-list').should('have.length', 1);
    });
});