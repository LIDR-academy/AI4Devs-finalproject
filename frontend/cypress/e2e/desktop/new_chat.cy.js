describe('DESKTOP: Botón - Nuevo chat', () => {
    beforeEach(() => {
        // Establecer el tamaño de la ventana para entorno de escritorio
        cy.viewport(1280, 720);

        // Visita la página principal de la aplicación
        cy.visit('http://localhost:3001');
    });

    it('should reload the page and reset the chat and itinerary', () => {
        // Hacer click en el botón "Nuevo chat"
        cy.contains('Nuevo chat').click();

        // Verificar que la página se haya recargado
        cy.reload();

        // Verificar que el Itinerary esté vacío y aparezca el loading
        cy.get('.itinerary .itinerary-details').should('not.exist');
        cy.get('.itinerary-loading').should('exist');

        // Verificar que el Chat esté vacío y aparezca el loading
        cy.get('.chat .message-list').should('not.exist');
        cy.get('.chat-waiting-message').should('exist');
    });
});