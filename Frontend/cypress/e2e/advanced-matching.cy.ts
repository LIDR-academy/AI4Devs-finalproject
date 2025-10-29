describe('Advanced Matching Features', () => {
  beforeEach(() => {
    // Mock API responses
    cy.intercept('GET', '**/api/matches**', { fixture: 'matches.json' }).as('getMatches');
    cy.intercept('GET', '**/api/bookings**', { fixture: 'bookings.json' }).as('getBookings');
    cy.intercept('POST', '**/api/bookings**', { fixture: 'booking-created.json' }).as('createBooking');
    
    // Visit matches page
    cy.visit('/matches');
  });

  describe('Search and Basic Functionality', () => {
    it('should display search form with all required fields', () => {
      cy.get('[data-testid="direction-filter"]').should('be.visible');
      cy.get('[data-testid="destination-select"]').should('be.visible');
      cy.get('[data-testid="time-input"]').should('be.visible');
      cy.get('[data-testid="origin-input"]').should('be.visible');
      cy.get('[data-testid="search-button"]').should('be.visible');
    });

    it('should perform search and display results', () => {
      // Fill search form
      cy.get('[data-testid="destination-select"]').select('SEDE-1');
      cy.get('[data-testid="time-input"]').type('08:30');
      cy.get('[data-testid="origin-input"]').type('40.4168,-3.7038');
      
      // Submit search
      cy.get('[data-testid="search-button"]').click();
      
      // Wait for API call
      cy.wait('@getMatches');
      
      // Verify results are displayed
      cy.get('[data-testid="match-card"]').should('have.length.at.least', 1);
      cy.get('[data-testid="results-title"]').should('contain', 'Found');
    });

    it('should show initial state when no search is performed', () => {
      cy.get('[data-testid="initial-state"]').should('be.visible');
      cy.get('[data-testid="initial-title"]').should('contain', 'Find your ideal trip');
    });

    it('should show empty state when no matches found', () => {
      // Mock empty response
      cy.intercept('GET', '**/api/matches**', { body: [] }).as('getEmptyMatches');
      
      // Perform search
      cy.get('[data-testid="destination-select"]').select('SEDE-1');
      cy.get('[data-testid="search-button"]').click();
      cy.wait('@getEmptyMatches');
      
      // Verify empty state
      cy.get('[data-testid="empty-results"]').should('be.visible');
      cy.get('[data-testid="empty-message"]').should('contain', 'No trips found');
    });
  });

  describe('Advanced Filtering', () => {
    beforeEach(() => {
      // Perform initial search to get results
      cy.get('[data-testid="destination-select"]').select('SEDE-1');
      cy.get('[data-testid="search-button"]').click();
      cy.wait('@getMatches');
    });

    it('should display filter controls after search', () => {
      cy.get('[data-testid="filter-section"]').should('be.visible');
      cy.get('[data-testid="min-score-slider"]').should('be.visible');
      cy.get('[data-testid="min-seats-select"]').should('be.visible');
      cy.get('[data-testid="date-from-input"]').should('be.visible');
      cy.get('[data-testid="date-to-input"]').should('be.visible');
      cy.get('[data-testid="sort-by-select"]').should('be.visible');
      cy.get('[data-testid="sort-order-select"]').should('be.visible');
    });

    it('should filter by minimum score', () => {
      // Set score filter
      cy.get('[data-testid="min-score-slider"]').invoke('val', 70).trigger('change');
      
      // Verify filter is applied
      cy.get('[data-testid="active-filters"]').should('contain', 'Score ≥ 70%');
      cy.get('[data-testid="filtered-count"]').should('be.visible');
    });

    it('should filter by minimum seats', () => {
      // Set seats filter
      cy.get('[data-testid="min-seats-select"]').select('3');
      
      // Verify filter is applied
      cy.get('[data-testid="active-filters"]').should('contain', 'Seats ≥ 3');
    });

    it('should filter by date range', () => {
      // Set date filters
      cy.get('[data-testid="date-from-input"]').type('2024-01-15');
      cy.get('[data-testid="date-to-input"]').type('2024-01-16');
      
      // Verify filters are applied
      cy.get('[data-testid="active-filters"]').should('contain', 'From');
      cy.get('[data-testid="active-filters"]').should('contain', 'To');
    });

    it('should sort by different criteria', () => {
      // Sort by score
      cy.get('[data-testid="sort-by-select"]').select('score');
      cy.get('[data-testid="sort-order-select"]').select('desc');
      
      // Verify sorting is applied
      cy.get('[data-testid="match-card"]').first().should('contain', 'Excellent');
      
      // Sort by date
      cy.get('[data-testid="sort-by-select"]').select('date');
      
      // Verify date sorting
      cy.get('[data-testid="match-card"]').should('have.length.at.least', 1);
      
      // Sort by seats
      cy.get('[data-testid="sort-by-select"]').select('seats');
      
      // Verify seats sorting
      cy.get('[data-testid="match-card"]').should('have.length.at.least', 1);
    });

    it('should show active filter count', () => {
      // Apply multiple filters
      cy.get('[data-testid="min-score-slider"]').invoke('val', 60).trigger('change');
      cy.get('[data-testid="min-seats-select"]').select('2');
      
      // Verify count
      cy.get('[data-testid="active-count"]').should('contain', '2 active filters');
    });

    it('should remove filter chips when clicked', () => {
      // Apply filter
      cy.get('[data-testid="min-score-slider"]').invoke('val', 70).trigger('change');
      
      // Verify chip appears
      cy.get('[data-testid="score-chip"]').should('be.visible');
      
      // Remove chip
      cy.get('[data-testid="score-chip"]').find('button').click();
      
      // Verify chip is removed
      cy.get('[data-testid="score-chip"]').should('not.exist');
    });

    it('should clear all filters', () => {
      // Apply multiple filters
      cy.get('[data-testid="min-score-slider"]').invoke('val', 70).trigger('change');
      cy.get('[data-testid="min-seats-select"]').select('2');
      
      // Clear filters
      cy.get('[data-testid="clear-filters"]').click();
      
      // Verify filters are cleared
      cy.get('[data-testid="active-filters"]').should('not.exist');
      cy.get('[data-testid="active-count"]').should('not.exist');
    });

    it('should show no filtered results when filters are too restrictive', () => {
      // Apply very restrictive filters
      cy.get('[data-testid="min-score-slider"]').invoke('val', 95).trigger('change');
      cy.get('[data-testid="min-seats-select"]').select('8');
      
      // Verify no filtered results message
      cy.get('[data-testid="no-filtered-results"]').should('be.visible');
      cy.get('[data-testid="no-filtered-message"]').should('contain', 'No results match your filters');
    });
  });

  describe('Match Card Features', () => {
    beforeEach(() => {
      // Perform search to get results
      cy.get('[data-testid="destination-select"]').select('SEDE-1');
      cy.get('[data-testid="search-button"]').click();
      cy.wait('@getMatches');
    });

    it('should display match cards with all information', () => {
      cy.get('[data-testid="match-card"]').first().within(() => {
        // Score badge
        cy.get('[data-testid="score-badge"]').should('be.visible');
        
        // Trip information
        cy.get('[data-testid="trip-title"]').should('contain', 'Trip to');
        cy.get('[data-testid="origin-info"]').should('be.visible');
        cy.get('[data-testid="seats-info"]').should('be.visible');
        
        // Date and time
        cy.get('[data-testid="trip-date"]').should('be.visible');
        cy.get('[data-testid="trip-time"]').should('be.visible');
        
        // Action buttons
        cy.get('[data-testid="book-button"]').should('be.visible');
        cy.get('[data-testid="view-profile-button"]').should('be.visible');
        cy.get('[data-testid="rate-button"]').should('be.visible');
      });
    });

    it('should show score badge with correct color and label', () => {
      cy.get('[data-testid="match-card"]').first().within(() => {
        cy.get('[data-testid="score-badge"]').should('have.class', 'text-green-600');
        cy.get('[data-testid="score-badge"]').should('contain', 'Excellent');
      });
    });

    it('should toggle map visibility', () => {
      cy.get('[data-testid="match-card"]').first().within(() => {
        // Show map
        cy.get('[data-testid="show-map-button"]').click();
        cy.get('[data-testid="map-preview"]').should('be.visible');
        cy.get('[data-testid="map-links"]').should('be.visible');
        
        // Hide map
        cy.get('[data-testid="hide-map-button"]').click();
        cy.get('[data-testid="map-preview"]').should('not.exist');
      });
    });

    it('should show compatibility reasons', () => {
      cy.get('[data-testid="match-card"]').first().within(() => {
        cy.get('[data-testid="compatibility-reasons"]').should('be.visible');
        cy.get('[data-testid="reason-item"]').should('have.length.at.least', 1);
      });
    });

    it('should disable book button when no seats available', () => {
      // Mock match with no seats
      cy.intercept('GET', '**/api/matches**', { 
        fixture: 'matches-no-seats.json' 
      }).as('getMatchesNoSeats');
      
      cy.get('[data-testid="search-button"]').click();
      cy.wait('@getMatchesNoSeats');
      
      cy.get('[data-testid="match-card"]').first().within(() => {
        cy.get('[data-testid="book-button"]').should('be.disabled');
        cy.get('[data-testid="book-button"]').should('contain', 'No seats available');
      });
    });

    it('should show already booked status', () => {
      // Mock match that's already booked
      cy.intercept('GET', '**/api/matches**', { 
        fixture: 'matches-booked.json' 
      }).as('getMatchesBooked');
      
      cy.get('[data-testid="search-button"]').click();
      cy.wait('@getMatchesBooked');
      
      cy.get('[data-testid="match-card"]').first().within(() => {
        cy.get('[data-testid="booked-badge"]').should('be.visible');
        cy.get('[data-testid="booked-badge"]').should('contain', 'Already Booked');
        cy.get('[data-testid="book-button"]').should('be.disabled');
      });
    });
  });

  describe('Booking Flow', () => {
    beforeEach(() => {
      // Perform search
      cy.get('[data-testid="destination-select"]').select('SEDE-1');
      cy.get('[data-testid="search-button"]').click();
      cy.wait('@getMatches');
    });

    it('should open seat selection modal when booking', () => {
      cy.get('[data-testid="match-card"]').first().within(() => {
        cy.get('[data-testid="book-button"]').click();
      });
      
      // Verify modal opens
      cy.get('[data-testid="seat-selection-modal"]').should('be.visible');
      cy.get('[data-testid="modal-title"]').should('contain', 'Select Seats');
      cy.get('[data-testid="available-seats"]').should('be.visible');
    });

    it('should complete booking flow', () => {
      // Start booking
      cy.get('[data-testid="match-card"]').first().within(() => {
        cy.get('[data-testid="book-button"]').click();
      });
      
      // Select seats
      cy.get('[data-testid="seat-selection-modal"]').within(() => {
        cy.get('[data-testid="seat-input"]').type('2');
        cy.get('[data-testid="confirm-booking"]').click();
      });
      
      // Wait for booking creation
      cy.wait('@createBooking');
      
      // Verify success message
      cy.get('[data-testid="success-message"]').should('contain', 'Booking created successfully');
    });

    it('should handle booking errors gracefully', () => {
      // Mock booking error
      cy.intercept('POST', '**/api/bookings**', { 
        statusCode: 400,
        body: { message: 'No seats available' }
      }).as('createBookingError');
      
      // Start booking
      cy.get('[data-testid="match-card"]').first().within(() => {
        cy.get('[data-testid="book-button"]').click();
      });
      
      // Complete booking
      cy.get('[data-testid="seat-selection-modal"]').within(() => {
        cy.get('[data-testid="seat-input"]').type('2');
        cy.get('[data-testid="confirm-booking"]').click();
      });
      
      // Wait for error
      cy.wait('@createBookingError');
      
      // Verify error message
      cy.get('[data-testid="error-message"]').should('contain', 'No seats available');
    });
  });

  describe('Trust System Integration', () => {
    beforeEach(() => {
      // Perform search
      cy.get('[data-testid="destination-select"]').select('SEDE-1');
      cy.get('[data-testid="search-button"]').click();
      cy.wait('@getMatches');
    });

    it('should open trust profile modal', () => {
      cy.get('[data-testid="match-card"]').first().within(() => {
        cy.get('[data-testid="view-profile-button"]').click();
      });
      
      // Verify modal opens
      cy.get('[data-testid="trust-profile-modal"]').should('be.visible');
      cy.get('[data-testid="modal-title"]').should('contain', 'Trust Profile');
    });

    it('should open rating form modal', () => {
      cy.get('[data-testid="match-card"]').first().within(() => {
        cy.get('[data-testid="rate-button"]').click();
      });
      
      // Verify modal opens
      cy.get('[data-testid="rating-modal"]').should('be.visible');
      cy.get('[data-testid="modal-title"]').should('contain', 'Rate User');
    });

    it('should close modals when close button is clicked', () => {
      // Open trust profile modal
      cy.get('[data-testid="match-card"]').first().within(() => {
        cy.get('[data-testid="view-profile-button"]').click();
      });
      
      // Close modal
      cy.get('[data-testid="trust-profile-modal"]').within(() => {
        cy.get('[data-testid="close-button"]').click();
      });
      
      // Verify modal is closed
      cy.get('[data-testid="trust-profile-modal"]').should('not.exist');
    });
  });

  describe('Persistence and State Management', () => {
    it('should persist search parameters in localStorage', () => {
      // Perform search
      cy.get('[data-testid="destination-select"]').select('SEDE-1');
      cy.get('[data-testid="time-input"]').type('08:30');
      cy.get('[data-testid="search-button"]').click();
      cy.wait('@getMatches');
      
      // Reload page
      cy.reload();
      
      // Verify search parameters are restored
      cy.get('[data-testid="destination-select"]').should('have.value', 'SEDE-1');
      cy.get('[data-testid="time-input"]').should('have.value', '08:30');
    });

    it('should persist filter settings in localStorage', () => {
      // Perform search
      cy.get('[data-testid="destination-select"]').select('SEDE-1');
      cy.get('[data-testid="search-button"]').click();
      cy.wait('@getMatches');
      
      // Apply filters
      cy.get('[data-testid="min-score-slider"]').invoke('val', 70).trigger('change');
      cy.get('[data-testid="min-seats-select"]').select('2');
      
      // Reload page
      cy.reload();
      
      // Perform search again
      cy.get('[data-testid="destination-select"]').select('SEDE-1');
      cy.get('[data-testid="search-button"]').click();
      cy.wait('@getMatches');
      
      // Verify filters are restored
      cy.get('[data-testid="min-score-slider"]').should('have.value', '70');
      cy.get('[data-testid="min-seats-select"]').should('have.value', '2');
    });
  });

  describe('Responsive Design', () => {
    it('should work on mobile devices', () => {
      cy.viewport('iphone-x');
      
      // Verify mobile layout
      cy.get('[data-testid="search-form"]').should('be.visible');
      cy.get('[data-testid="filter-section"]').should('be.visible');
      
      // Perform search
      cy.get('[data-testid="destination-select"]').select('SEDE-1');
      cy.get('[data-testid="search-button"]').click();
      cy.wait('@getMatches');
      
      // Verify mobile match cards
      cy.get('[data-testid="match-card"]').should('be.visible');
    });

    it('should work on tablet devices', () => {
      cy.viewport('ipad-2');
      
      // Verify tablet layout
      cy.get('[data-testid="search-form"]').should('be.visible');
      
      // Perform search
      cy.get('[data-testid="destination-select"]').select('SEDE-1');
      cy.get('[data-testid="search-button"]').click();
      cy.wait('@getMatches');
      
      // Verify tablet match cards layout
      cy.get('[data-testid="match-card"]').should('be.visible');
    });
  });
});
