describe('Language Switching', () => {
  beforeEach(() => {
    // Login before each test
    cy.visit('/');
    cy.get('button').contains('Iniciar Sesión').click();
    cy.origin('http://localhost:8080', () => {
      cy.get('#username').type('testuser');
      cy.get('#password').type('testpassword');
      cy.get('input[type="submit"]').click();
    });
    cy.url().should('include', '/callback');
    cy.wait(2000);
  });

  it('should display language switcher in navbar', () => {
    // Check that language switcher is visible in navbar
    cy.get('[data-testid="language-switcher"]').should('be.visible');
    cy.get('[data-testid="language-switcher"] button').should('be.visible');
    
    // Check that current language is displayed
    cy.get('[data-testid="language-switcher"] button span').should('contain.text', 'Català');
    cy.get('[data-testid="language-switcher"] button span').should('contain.text', '🇪🇸');
  });

  it('should open language dropdown when clicked', () => {
    // Click language switcher
    cy.get('[data-testid="language-switcher"] button').click();
    
    // Check dropdown is visible
    cy.get('[data-testid="language-switcher"] .absolute').should('be.visible');
    
    // Check all 6 languages are present
    cy.get('[data-testid="language-switcher"] .absolute button').should('have.length', 6);
    
    // Verify specific languages
    cy.get('[data-testid="language-switcher"] .absolute button').should('contain.text', 'Català');
    cy.get('[data-testid="language-switcher"] .absolute button').should('contain.text', 'Español');
    cy.get('[data-testid="language-switcher"] .absolute button').should('contain.text', 'Română');
    cy.get('[data-testid="language-switcher"] .absolute button').should('contain.text', 'Українська');
    cy.get('[data-testid="language-switcher"] .absolute button').should('contain.text', 'English');
    cy.get('[data-testid="language-switcher"] .absolute button').should('contain.text', 'Français');
  });

  it('should switch to Spanish and verify UI changes', () => {
    // Switch to Spanish
    cy.get('[data-testid="language-switcher"] button').click();
    cy.get('[data-testid="language-switcher"] .absolute button').contains('Español').click();
    
    // Verify language switcher shows Spanish
    cy.get('[data-testid="language-switcher"] button span').should('contain.text', 'Español');
    
    // Navigate to trips page and verify Spanish text
    cy.visit('/trips');
    cy.contains('Mis Viajes').should('be.visible');
    cy.contains('Crear Viaje').should('be.visible');
  });

  it('should switch to English and verify UI changes', () => {
    // Switch to English
    cy.get('[data-testid="language-switcher"] button').click();
    cy.get('[data-testid="language-switcher"] .absolute button').contains('English').click();
    
    // Verify language switcher shows English
    cy.get('[data-testid="language-switcher"] button span').should('contain.text', 'English');
    
    // Navigate to trips page and verify English text
    cy.visit('/trips');
    cy.contains('My Trips').should('be.visible');
    cy.contains('Create Trip').should('be.visible');
  });

  it('should switch to Romanian and verify UI changes', () => {
    // Switch to Romanian
    cy.get('[data-testid="language-switcher"] button').click();
    cy.get('[data-testid="language-switcher"] .absolute button').contains('Română').click();
    
    // Verify language switcher shows Romanian
    cy.get('[data-testid="language-switcher"] button span').should('contain.text', 'Română');
    
    // Navigate to trips page and verify Romanian text
    cy.visit('/trips');
    cy.contains('Călătoriile Mele').should('be.visible');
    cy.contains('Creează Călătorie').should('be.visible');
  });

  it('should switch to Ukrainian and verify UI changes', () => {
    // Switch to Ukrainian
    cy.get('[data-testid="language-switcher"] button').click();
    cy.get('[data-testid="language-switcher"] .absolute button').contains('Українська').click();
    
    // Verify language switcher shows Ukrainian
    cy.get('[data-testid="language-switcher"] button span').should('contain.text', 'Українська');
    
    // Navigate to trips page and verify Ukrainian text
    cy.visit('/trips');
    cy.contains('Мої Поїздки').should('be.visible');
    cy.contains('Створити Поїздку').should('be.visible');
  });

  it('should switch to French and verify UI changes', () => {
    // Switch to French
    cy.get('[data-testid="language-switcher"] button').click();
    cy.get('[data-testid="language-switcher"] .absolute button').contains('Français').click();
    
    // Verify language switcher shows French
    cy.get('[data-testid="language-switcher"] button span').should('contain.text', 'Français');
    
    // Navigate to trips page and verify French text
    cy.visit('/trips');
    cy.contains('Mes Voyages').should('be.visible');
    cy.contains('Créer un Voyage').should('be.visible');
  });

  it('should persist language selection after page reload', () => {
    // Switch to English
    cy.get('[data-testid="language-switcher"] button').click();
    cy.get('[data-testid="language-switcher"] .absolute button').contains('English').click();
    
    // Reload page
    cy.reload();
    cy.wait(2000);
    
    // Verify language is still English
    cy.get('[data-testid="language-switcher"] button span').should('contain.text', 'English');
    
    // Navigate to trips and verify English text persists
    cy.visit('/trips');
    cy.contains('My Trips').should('be.visible');
  });

  it('should verify validation messages in different languages', () => {
    // Test with Spanish
    cy.get('[data-testid="language-switcher"] button').click();
    cy.get('[data-testid="language-switcher"] .absolute button').contains('Español').click();
    
    // Go to profile page and test validation
    cy.visit('/me');
    cy.get('input[type="text"]').first().clear();
    cy.contains('Guardar Cambios').click();
    cy.contains('El nombre debe tener al menos 2 caracteres').should('be.visible');
    
    // Switch to English and test validation
    cy.get('[data-testid="language-switcher"] button').click();
    cy.get('[data-testid="language-switcher"] .absolute button').contains('English').click();
    
    cy.get('input[type="text"]').first().clear();
    cy.contains('Save Changes').click();
    cy.contains('Name must be at least 2 characters').should('be.visible');
  });

  it('should verify matches page translations', () => {
    // Switch to French
    cy.get('[data-testid="language-switcher"] button').click();
    cy.get('[data-testid="language-switcher"] .absolute button').contains('Français').click();
    
    // Navigate to matches page
    cy.visit('/matches');
    cy.contains('Mes Correspondances').should('be.visible');
    cy.contains('Rechercher').should('be.visible');
  });

  it('should verify bookings page translations', () => {
    // Switch to Romanian
    cy.get('[data-testid="language-switcher"] button').click();
    cy.get('[data-testid="language-switcher"] .absolute button').contains('Română').click();
    
    // Navigate to bookings page
    cy.visit('/bookings');
    cy.contains('Rezervările Mele').should('be.visible');
    cy.contains('Căutare').should('be.visible');
  });

  it('should verify history page translations', () => {
    // Switch to Ukrainian
    cy.get('[data-testid="language-switcher"] button').click();
    cy.get('[data-testid="language-switcher"] .absolute button').contains('Українська').click();
    
    // Navigate to history page
    cy.visit('/history');
    cy.contains('Історія Поїздок').should('be.visible');
    cy.contains('Фільтри').should('be.visible');
  });

  it('should verify profile page translations', () => {
    // Switch to English
    cy.get('[data-testid="language-switcher"] button').click();
    cy.get('[data-testid="language-switcher"] .absolute button').contains('English').click();
    
    // Navigate to profile page
    cy.visit('/me');
    cy.contains('My Profile').should('be.visible');
    cy.contains('Account Information').should('be.visible');
    cy.contains('Push Notifications').should('be.visible');
  });

  it('should verify trust profile translations', () => {
    // Switch to Spanish
    cy.get('[data-testid="language-switcher"] button').click();
    cy.get('[data-testid="language-switcher"] .absolute button').contains('Español').click();
    
    // Navigate to trust profile (assuming it exists)
    cy.visit('/trust-profile');
    cy.contains('Perfil de Confianza').should('be.visible');
    cy.contains('Valoraciones').should('be.visible');
  });

  it('should close dropdown when clicking outside', () => {
    // Open dropdown
    cy.get('[data-testid="language-switcher"] button').click();
    cy.get('[data-testid="language-switcher"] .absolute').should('be.visible');
    
    // Click outside
    cy.get('body').click();
    
    // Verify dropdown is closed
    cy.get('[data-testid="language-switcher"] .absolute').should('not.be.visible');
  });

  it('should show current language as selected in dropdown', () => {
    // Open dropdown
    cy.get('[data-testid="language-switcher"] button').click();
    
    // Check that current language (Catalan) is highlighted
    cy.get('[data-testid="language-switcher"] .absolute button')
      .contains('Català')
      .should('have.class', 'bg-primary-100');
    
    // Check that checkmark is visible for current language
    cy.get('[data-testid="language-switcher"] .absolute button')
      .contains('Català')
      .find('svg')
      .should('be.visible');
  });

  it('should handle rapid language switching', () => {
    // Switch between multiple languages quickly
    const languages = ['English', 'Español', 'Français', 'Română'];
    
    languages.forEach(lang => {
      cy.get('[data-testid="language-switcher"] button').click();
      cy.get('[data-testid="language-switcher"] .absolute button').contains(lang).click();
      cy.get('[data-testid="language-switcher"] button span').should('contain.text', lang);
    });
  });

  it('should maintain language across different pages', () => {
    // Set to French
    cy.get('[data-testid="language-switcher"] button').click();
    cy.get('[data-testid="language-switcher"] .absolute button').contains('Français').click();
    
    // Navigate through different pages
    const pages = ['/trips', '/matches', '/bookings', '/history', '/me'];
    
    pages.forEach(page => {
      cy.visit(page);
      cy.get('[data-testid="language-switcher"] button span').should('contain.text', 'Français');
    });
  });
});
