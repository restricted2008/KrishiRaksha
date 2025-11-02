# Testing Guide for KrishiRaksha

This document provides comprehensive information about testing the KrishiRaksha application.

## Table of Contents

- [Overview](#overview)
- [Testing Stack](#testing-stack)
- [Unit Testing](#unit-testing)
- [End-to-End Testing](#end-to-end-testing)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Best Practices](#best-practices)
- [CI/CD Integration](#cicd-integration)

## Overview

KrishiRaksha uses a comprehensive testing strategy that includes:
- **Unit Tests**: Testing individual components and functions using Jest and React Testing Library
- **End-to-End Tests**: Testing complete user workflows using Cypress
- **Continuous Integration**: Automated testing on every push and pull request

## Testing Stack

### Unit Testing
- **Jest**: JavaScript testing framework
- **React Testing Library**: Testing utilities for React components
- **@testing-library/jest-dom**: Custom Jest matchers for DOM assertions
- **ts-jest**: TypeScript support for Jest

### E2E Testing
- **Cypress**: End-to-end testing framework
- **Cypress Testing Library**: Enhanced Cypress commands

## Unit Testing

### Configuration

Jest is configured in `jest.config.js` with:
- TypeScript support via ts-jest
- React Testing Library setup
- Module path aliases matching your tsconfig
- Coverage reporting
- jsdom test environment

### Test File Structure

```
src/
├── components/
│   └── Button/
│       ├── Button.tsx
│       └── Button.test.tsx
├── store/
│   └── slices/
│       ├── userSlice.ts
│       └── __tests__/
│           └── userSlice.test.ts
└── test/
    ├── setup.ts
    ├── testUtils.tsx
    └── mocks/
        └── fileMock.js
```

### Running Unit Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- userSlice.test.ts
```

### Example Unit Test

```typescript
import { render, screen, fireEvent } from '@/test/testUtils';
import { Button } from './Button';

describe('Button', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDisabled();
  });
});
```

## End-to-End Testing

### Configuration

Cypress is configured in `cypress.config.ts` with:
- Base URL: http://localhost:5173
- E2E tests location: `cypress/e2e/`
- Support files for custom commands
- Screenshot and video configuration

### Test File Structure

```
cypress/
├── e2e/
│   ├── registration.cy.ts
│   ├── login.cy.ts
│   └── dashboard.cy.ts
└── support/
    ├── commands.ts
    └── e2e.ts
```

### Running E2E Tests

```bash
# Open Cypress Test Runner (interactive)
npm run cypress

# Run Cypress in headless mode
npm run cypress:headless

# Open E2E tests specifically
npm run e2e

# Run E2E tests in headless mode
npm run e2e:headless
```

### Example E2E Test

```typescript
describe('User Login', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('successfully logs in with valid credentials', () => {
    cy.get('input[name="email"]').type('farmer@example.com');
    cy.get('input[name="password"]').type('SecurePassword123!');
    cy.get('button[type="submit"]').click();
    
    cy.url().should('include', '/dashboard');
    cy.contains('Welcome').should('be.visible');
  });

  it('shows error with invalid credentials', () => {
    cy.get('input[name="email"]').type('invalid@example.com');
    cy.get('input[name="password"]').type('wrong');
    cy.get('button[type="submit"]').click();
    
    cy.contains('Invalid credentials').should('be.visible');
  });
});
```

### Custom Cypress Commands

We've defined custom commands in `cypress/support/commands.ts`:

```typescript
// Login command
cy.login('farmer@example.com', 'password123');

// Fill registration form
cy.fillRegistrationForm({
  name: 'Test Farmer',
  email: 'test@example.com',
  phone: '+91 98765 43210'
});
```

## Writing Tests

### Test Utilities

Use the custom render function from `src/test/testUtils.tsx` that includes all necessary providers:

```typescript
import { render, screen } from '@/test/testUtils';
import { MyComponent } from './MyComponent';

test('renders component', () => {
  render(<MyComponent />);
  expect(screen.getByText('Hello')).toBeInTheDocument();
});
```

### Mock Data

Mock data for testing is available in `src/test/testUtils.tsx`:

```typescript
import { mockUser, mockBatch } from '@/test/testUtils';

test('displays user information', () => {
  render(<UserProfile user={mockUser} />);
  expect(screen.getByText(mockUser.name)).toBeInTheDocument();
});
```

### Testing Zustand Stores

```typescript
import { createUserSlice } from '../userSlice';

describe('userSlice', () => {
  let slice;
  const mockSet = jest.fn();
  const mockGet = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    slice = createUserSlice(mockSet, mockGet, {});
  });

  it('sets user correctly', () => {
    const user = { id: '1', name: 'Test' };
    slice.setUser(user);
    
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        user,
        isAuthenticated: true
      })
    );
  });
});
```

## Best Practices

### Unit Testing
1. **Test behavior, not implementation**: Focus on what the component does, not how it does it
2. **Use data-testid sparingly**: Prefer queries by role, label, or text
3. **Mock external dependencies**: Use Jest mocks for API calls, localStorage, etc.
4. **Keep tests simple**: One assertion per test when possible
5. **Use descriptive test names**: "should display error when form is invalid"

### E2E Testing
1. **Test critical user journeys**: Registration, login, core features
2. **Use custom commands**: Create reusable commands for common actions
3. **Wait for elements properly**: Use cy.wait() and assertions, not arbitrary timeouts
4. **Clean up test data**: Reset state between tests
5. **Test on different viewports**: Mobile, tablet, desktop

### General
1. **Write tests before fixing bugs**: Reproduce the bug in a test first
2. **Maintain test coverage**: Aim for >80% coverage on critical paths
3. **Run tests locally**: Before pushing code
4. **Keep tests fast**: Parallelize when possible
5. **Document complex test scenarios**: Add comments explaining why

## Coverage Goals

- **Overall**: 80%+ coverage
- **Critical paths**: 90%+ coverage (authentication, registration, data submission)
- **UI Components**: 70%+ coverage
- **Store/State Management**: 90%+ coverage
- **Utilities**: 85%+ coverage

### Viewing Coverage

```bash
npm run test:coverage
```

Coverage reports are generated in the `coverage/` directory. Open `coverage/lcov-report/index.html` in a browser to view detailed coverage information.

## CI/CD Integration

### GitHub Actions Workflow

Our CI/CD pipeline runs on every push and pull request:

1. **Unit Tests**: Run on Node 18.x and 20.x
2. **E2E Tests**: Run Cypress tests in Chrome
3. **Linting**: Check code quality
4. **Build**: Create production bundle
5. **Deploy**: Deploy to production (main branch only)

### Workflow File

See `.github/workflows/ci.yml` for the complete workflow configuration.

### Running All Tests

```bash
# Run unit and E2E tests
npm run test:all
```

## Troubleshooting

### Common Issues

**Issue**: Tests fail with module not found errors
**Solution**: Check module aliases in jest.config.js match tsconfig.json

**Issue**: Cypress tests timeout
**Solution**: Increase wait-on-timeout in cypress.config.ts or check if dev server is running

**Issue**: Tests pass locally but fail in CI
**Solution**: Check for timing issues, use proper waits, ensure consistent test data

**Issue**: Coverage reports are missing
**Solution**: Run `npm run test:coverage` and check jest.config.js coverage settings

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Cypress Documentation](https://docs.cypress.io/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Questions?

For questions or issues with testing, please:
1. Check this documentation first
2. Review existing test files for examples
3. Consult the official documentation for Jest/Cypress
4. Open an issue in the repository
