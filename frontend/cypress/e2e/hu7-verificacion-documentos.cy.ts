describe('HU7 - Carga de documentos de verificacion', () => {
  beforeEach(() => {
    cy.visit('/es/login');
    cy.loginAsRole('doctor');
    cy.intercept('GET', '**/api/v1/doctors/verification', {
      statusCode: 200,
      body: { documents: [] },
    }).as('getDocuments');
  });

  it('sube un documento valido', () => {
    cy.intercept('POST', '**/api/v1/doctors/verification', {
      statusCode: 201,
      body: {
        message: 'Documento cargado correctamente',
        document: {
          id: 'doc-ver-1',
          documentType: 'cedula',
          status: 'pending',
          originalFilename: 'cedula.pdf',
          mimeType: 'application/pdf',
          fileSizeBytes: 100,
          createdAt: '2026-02-15T10:00:00.000Z',
        },
      },
    }).as('uploadDocument');

    cy.visit('/es/doctors/verification');
    cy.wait('@getDocuments');

    cy.get('[data-testid="verification-document-input"]').selectFile({
      contents: Cypress.Buffer.from('dummy-pdf'),
      fileName: 'cedula.pdf',
      mimeType: 'application/pdf',
      lastModified: Date.now(),
    });
    cy.get('[data-testid="verification-upload-submit"]').click();

    cy.wait('@uploadDocument');
    cy.contains('Documento cargado').should('be.visible');
  });

  it('rechaza extension de archivo invalida', () => {
    cy.visit('/es/doctors/verification');
    cy.wait('@getDocuments');

    cy.get('[data-testid="verification-document-input"]').selectFile({
      contents: Cypress.Buffer.from('malware'),
      fileName: 'malicioso.exe',
      mimeType: 'application/octet-stream',
      lastModified: Date.now(),
    });

    cy.get('[data-testid="verification-upload-error"]').should('be.visible');
  });
});
