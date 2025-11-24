# Testing Guide

This document describes the testing setup and conventions for the Sensei MVP project.

## Tech Stack

- **Jest**: Testing framework
- **React Testing Library**: Component testing utilities
- **@testing-library/user-event**: User interaction simulation

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

Tests are organized using the `__tests__` directory pattern:

```
src/
├── lib/
│   ├── api.ts
│   └── __tests__/
│       ├── api.test.ts
│       └── utils.test.ts
└── components/
    └── session/
        ├── Step1Goal.tsx
        └── __tests__/
            └── Step1Goal.test.tsx
```

## Test Coverage

Current test coverage:

### API Client Tests (`src/lib/__tests__/api.test.ts`)
- ✅ Auth APIs (sendMagicLink, verifyMagicLink, logout)
- ✅ Session APIs (startSession, getSession, saveStep, scoreSession, getSessions)
- ✅ Progression APIs (getProgressionStats, getXpHistory)
- ✅ User APIs (getMe, deleteAccount)
- ✅ Error handling

### Utility Functions (`src/lib/__tests__/utils.test.ts`)
- ✅ Score color utilities
- ✅ Score label utilities
- ✅ Date formatting utilities
- ✅ Display name utilities
- ✅ XP progress calculations
- ✅ Email validation
- ✅ Text length validation

### Component Tests (`src/components/session/__tests__/Step1Goal.test.tsx`)
- ✅ Component rendering
- ✅ Objective selection
- ✅ Text input handling
- ✅ Form validation
- ✅ Submission handling
- ✅ Loading states

## Writing Tests

### Component Test Template

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import YourComponent from '../YourComponent'

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}))

describe('YourComponent', () => {
  const mockProps = {
    // Define your mock props here
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render correctly', () => {
    render(<YourComponent {...mockProps} />)
    expect(screen.getByText('Some Text')).toBeTruthy()
  })

  it('should handle user interactions', async () => {
    const user = userEvent.setup()
    render(<YourComponent {...mockProps} />)

    const button = screen.getByText('Click Me')
    await user.click(button)

    // Assert expected behavior
  })
})
```

### API Test Template

```typescript
import * as api from '../api'

global.fetch = jest.fn()

describe('API Function', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  it('should make correct API call', async () => {
    const mockResponse = { data: { /* your data */ } }
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    const result = await api.yourFunction()

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/your-endpoint',
      expect.objectContaining({
        method: 'POST',
        headers: expect.any(Object),
      })
    )
    expect(result).toEqual(mockResponse.data)
  })
})
```

## Best Practices

### 1. Use Descriptive Test Names
```typescript
// Good
it('should display error message when email is invalid', () => {})

// Bad
it('test email', () => {})
```

### 2. Arrange-Act-Assert Pattern
```typescript
it('should update score when slider changes', async () => {
  // Arrange
  const user = userEvent.setup()
  render(<Component />)

  // Act
  const slider = screen.getByRole('slider')
  await user.type(slider, '75')

  // Assert
  expect(screen.getByText('75')).toBeTruthy()
})
```

### 3. Mock External Dependencies
```typescript
// Mock fetch for API calls
global.fetch = jest.fn()

// Mock framer-motion for animations
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}))

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/',
  }),
}))
```

### 4. Clean Up After Tests
```typescript
beforeEach(() => {
  jest.clearAllMocks()
  localStorage.clear()
})
```

### 5. Test User Interactions
```typescript
it('should submit form on button click', async () => {
  const user = userEvent.setup()
  const onSubmit = jest.fn()

  render(<Form onSubmit={onSubmit} />)

  await user.type(screen.getByLabelText('Name'), 'John Doe')
  await user.click(screen.getByText('Submit'))

  expect(onSubmit).toHaveBeenCalledWith({ name: 'John Doe' })
})
```

### 6. Test Error States
```typescript
it('should display error message when API call fails', async () => {
  ;(global.fetch as jest.Mock).mockRejectedValueOnce(
    new Error('Network error')
  )

  render(<Component />)

  await waitFor(() => {
    expect(screen.getByText(/error/i)).toBeTruthy()
  })
})
```

## Common Issues

### Framer Motion Errors
If you encounter animation-related errors, mock framer-motion:

```typescript
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => children,
}))
```

### LocalStorage Not Defined
LocalStorage is mocked globally in `jest.setup.js`:

```typescript
global.localStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
```

### Async Timeout Errors
Use `waitFor` for async operations:

```typescript
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeTruthy()
}, { timeout: 3000 })
```

## CI/CD Integration

Tests run automatically in CI/CD pipelines. Ensure all tests pass before merging:

```bash
# Pre-commit check
npm test

# Build check
npm run build && npm test
```

## Coverage Goals

- **Overall**: 80%+ coverage
- **Critical paths**: 90%+ coverage (auth, session flow, scoring)
- **UI components**: 70%+ coverage

Check coverage with:

```bash
npm run test:coverage
```

## Future Improvements

- [ ] Add E2E tests with Playwright
- [ ] Add visual regression tests
- [ ] Increase component test coverage to 80%
- [ ] Add integration tests for full session flow
- [ ] Add performance tests for AI scoring
