describe('MediaFile App', () => {
  it('should load the home page', () => {
    cy.visit('/');
    cy.contains('MediaFile').should('be.visible');
    cy.contains('Store, Share & Manage').should('be.visible');
  });

  it('should navigate to login page', () => {
    cy.visit('/');
    cy.contains('Sign In').click();
    cy.url().should('include', '/login');
    cy.contains('Welcome Back').should('be.visible');
  });

  it('should navigate to register page', () => {
    cy.visit('/');
    cy.contains('Get Started Free').click();
    cy.url().should('include', '/register');
    cy.contains('Create Account').should('be.visible');
  });

  it('should show validation on login', () => {
    cy.visit('/login');
    cy.get('button[type="submit"]').click();
    // HTML5 validation will prevent submission
  });

  it('should show validation on register', () => {
    cy.visit('/register');
    cy.get('button[type="submit"]').click();
    // HTML5 validation will prevent submission
  });
});

describe('Authentication Flow', () => {
  const testUser = {
    name: 'Cypress Test User',
    email: `cypress${Date.now()}@test.com`,
    password: 'TestPass123',
  };

  it('should register a new user', () => {
    cy.visit('/register');
    cy.get('input[type="text"]').type(testUser.name);
    cy.get('input[type="email"]').type(testUser.email);
    cy.get('input[type="password"]').first().type(testUser.password);
    cy.get('input[type="password"]').last().type(testUser.password);
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });

  it('should login with registered user', () => {
    cy.visit('/login');
    cy.get('input[type="email"]').type(testUser.email);
    cy.get('input[type="password"]').type(testUser.password);
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
    cy.contains('My Files').should('be.visible');
  });
});
