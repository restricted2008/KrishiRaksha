describe('Farmer Registration Flow', () => {
  beforeEach(() => {
    cy.visit('/register');
  });

  it('should display the registration form', () => {
    cy.contains('Register').should('be.visible');
    cy.get('form').should('exist');
  });

  it('should navigate through multi-step registration', () => {
    // Step 1: Personal Information
    cy.get('input[name="name"]').type('Test Farmer');
    cy.get('input[name="email"]').type('testfarmer@example.com');
    cy.get('input[name="phone"]').type('+91 98765 43210');
    cy.get('button').contains('Next').click();

    // Step 2: Location Information
    cy.get('input[name="location"]').type('Maharashtra, India');
    cy.get('input[name="address"]').type('Test Address Line 1');
    cy.get('button').contains('Next').click();

    // Step 3: Farm Information
    cy.get('input[name="farmName"]').type('Test Farm');
    cy.get('input[name="farmSize"]').type('10');
    cy.get('select[name="farmSizeUnit"]').select('acres');
    cy.get('button').contains('Next').click();

    // Step 4: Account Setup
    cy.get('input[name="password"]').type('SecurePassword123!');
    cy.get('input[name="confirmPassword"]').type('SecurePassword123!');
    cy.get('button').contains('Register').click();

    // Verify success
    cy.url().should('include', '/dashboard');
    cy.contains('Welcome').should('be.visible');
  });

  it('should show validation errors for empty fields', () => {
    cy.get('button').contains('Next').click();
    cy.contains('required').should('be.visible');
  });

  it('should allow going back to previous steps', () => {
    // Move to step 2
    cy.fillRegistrationForm({
      name: 'Test Farmer',
      email: 'test@example.com',
      phone: '+91 98765 43210',
    });
    cy.get('button').contains('Next').click();

    // Go back to step 1
    cy.get('button').contains('Back').click();
    cy.get('input[name="name"]').should('have.value', 'Test Farmer');
  });

  it('should validate email format', () => {
    cy.get('input[name="email"]').type('invalid-email');
    cy.get('input[name="email"]').blur();
    cy.contains('valid email').should('be.visible');
  });

  it('should validate phone number format', () => {
    cy.get('input[name="phone"]').type('123');
    cy.get('input[name="phone"]').blur();
    cy.contains('valid phone').should('be.visible');
  });

  it('should validate password strength', () => {
    // Navigate to password step
    cy.fillRegistrationForm({
      name: 'Test Farmer',
      email: 'test@example.com',
      phone: '+91 98765 43210',
    });
    cy.get('button').contains('Next').click();
    
    cy.fillRegistrationForm({
      location: 'Test Location',
      address: 'Test Address',
    });
    cy.get('button').contains('Next').click();
    
    cy.fillRegistrationForm({
      farmName: 'Test Farm',
      farmSize: '10',
    });
    cy.get('button').contains('Next').click();

    // Test weak password
    cy.get('input[name="password"]').type('weak');
    cy.get('input[name="password"]').blur();
    cy.contains('password').should('be.visible');
  });

  it('should validate password confirmation match', () => {
    // Navigate to password step (abbreviated)
    cy.fillRegistrationForm({
      name: 'Test',
      email: 'test@example.com',
      phone: '+91 98765 43210',
    });
    cy.get('button').contains('Next').click();
    cy.get('button').contains('Next').click();
    cy.get('button').contains('Next').click();

    // Enter mismatched passwords
    cy.get('input[name="password"]').type('SecurePassword123!');
    cy.get('input[name="confirmPassword"]').type('DifferentPassword123!');
    cy.get('input[name="confirmPassword"]').blur();
    cy.contains('match').should('be.visible');
  });

  it('should persist data when navigating between steps', () => {
    const testData = {
      name: 'Persistence Test',
      email: 'persist@test.com',
      phone: '+91 12345 67890',
    };

    cy.fillRegistrationForm(testData);
    cy.get('button').contains('Next').click();
    cy.get('button').contains('Back').click();

    // Verify data persists
    cy.get('input[name="name"]').should('have.value', testData.name);
    cy.get('input[name="email"]').should('have.value', testData.email);
    cy.get('input[name="phone"]').should('have.value', testData.phone);
  });

  it('should show progress indicator', () => {
    cy.get('[data-testid="progress-indicator"]').should('exist');
    cy.get('[data-testid="step-1"]').should('have.class', 'active');
    
    cy.fillRegistrationForm({
      name: 'Test',
      email: 'test@example.com',
      phone: '+91 98765 43210',
    });
    cy.get('button').contains('Next').click();
    
    cy.get('[data-testid="step-2"]').should('have.class', 'active');
  });

  it('should handle server errors gracefully', () => {
    // Intercept registration API call
    cy.intercept('POST', '/api/register', {
      statusCode: 500,
      body: { error: 'Server error' },
    }).as('registerRequest');

    // Fill form and submit
    cy.fillRegistrationForm({
      name: 'Test',
      email: 'test@example.com',
      phone: '+91 98765 43210',
    });
    cy.get('button').contains('Next').click();
    cy.get('button').contains('Next').click();
    cy.get('button').contains('Next').click();
    
    cy.get('input[name="password"]').type('SecurePassword123!');
    cy.get('input[name="confirmPassword"]').type('SecurePassword123!');
    cy.get('button').contains('Register').click();

    cy.wait('@registerRequest');
    cy.contains('error').should('be.visible');
  });
});
