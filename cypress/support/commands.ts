/// <reference types="cypress" />

/**
 * Custom Cypress commands for KrishiRaksha
 */

Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login');
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should('not.include', '/login');
});

Cypress.Commands.add('fillRegistrationForm', (data: Record<string, string>) => {
  Object.entries(data).forEach(([field, value]) => {
    cy.get(`input[name="${field}"], select[name="${field}"], textarea[name="${field}"]`)
      .clear()
      .type(value);
  });
});

// Prevent TypeScript errors
export {};
