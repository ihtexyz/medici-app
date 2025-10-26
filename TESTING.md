# Testing Guide for Medici App

This document provides comprehensive information about the testing setup, how to run tests, and how to write new tests for the Medici Bitcoin banking app.

---

## Table of Contents

1. [Testing Stack](#testing-stack)
2. [Running Tests](#running-tests)
3. [Test Structure](#test-structure)
4. [Writing Tests](#writing-tests)
5. [Mocking](#mocking)
6. [Best Practices](#best-practices)
7. [Coverage Reports](#coverage-reports)
8. [CI/CD Integration](#cicd-integration)
9. [Troubleshooting](#troubleshooting)

---

## Testing Stack

Our testing setup uses the following technologies:

- **Jest 29.7.0** - Testing framework
- **React Testing Library 14.1.2** - Component testing utilities
- **ts-jest 29.1.1** - TypeScript support for Jest
- **@testing-library/jest-dom 6.1.5** - Custom DOM matchers
- **identity-obj-proxy 3.0.0** - CSS module mocking

### Why These Tools?

- **Jest**: Industry-standard testing framework with excellent TypeScript support
- **React Testing Library**: Encourages testing from the user's perspective
- **ts-jest**: Seamlessly integrates TypeScript with Jest
- **jsdom**: Provides browser-like environment for testing React components

---

## Running Tests

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

This will automatically re-run tests when files change (useful during development).

### Run Tests with Coverage

```bash
npm run test:coverage
```

This generates a coverage report showing which lines/branches are tested.

### Run Specific Test File

```bash
npm test TransactionHistory
```

or

```bash
npm test usePoolStats
```

### Run Tests Matching Pattern

```bash
npm test -- --testNamePattern="should fetch pool statistics"
```

---

## Test Structure

### Directory Structure

```
src/
├── components/
│   ├── TransactionHistory.tsx
│   └── __tests__/
│       └── TransactionHistory.test.tsx
├── hooks/
│   ├── useTransactionHistory.ts
│   ├── usePoolStats.ts
│   └── __tests__/
│       ├── useTransactionHistory.test.ts
│       └── usePoolStats.test.ts
└── setupTests.ts
```

### Test File Naming Conventions

- Component tests: `ComponentName.test.tsx`
- Hook tests: `hookName.test.ts`
- Utility tests: `utilityName.test.ts`
- Place test files in `__tests__` directory next to the code they test

---

## Writing Tests

### Component Testing Example

```tsx
import { render, screen } from '@testing-library/react'
import MyComponent from '../MyComponent'

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />)

    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })

  it('should handle user interaction', () => {
    const onClickMock = jest.fn()
    render(<MyComponent onClick={onClickMock} />)

    const button = screen.getByRole('button')
    button.click()

    expect(onClickMock).toHaveBeenCalledTimes(1)
  })
})
```

### Hook Testing Example

```ts
import { renderHook, act } from '@testing-library/react'
import { useMyHook } from '../useMyHook'

describe('useMyHook', () => {
  it('should return initial state', () => {
    const { result } = renderHook(() => useMyHook())

    expect(result.current.value).toBe(0)
  })

  it('should update state on action', () => {
    const { result } = renderHook(() => useMyHook())

    act(() => {
      result.current.increment()
    })

    expect(result.current.value).toBe(1)
  })
})
```

### Async Testing Example

```ts
import { renderHook, waitFor } from '@testing-library/react'
import { useAsyncData } from '../useAsyncData'

describe('useAsyncData', () => {
  it('should fetch data successfully', async () => {
    const { result } = renderHook(() => useAsyncData())

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toBeTruthy()
  })
})
```

---

## Mocking

### Mocking localStorage

Already configured in `setupTests.ts`:

```ts
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock as any
```

### Mocking window.ethereum

Already configured in `setupTests.ts`:

```ts
global.window.ethereum = {
  request: jest.fn(),
  on: jest.fn(),
  removeListener: jest.fn(),
} as any
```

### Mocking ethers.js

```ts
jest.mock('ethers', () => ({
  ethers: {
    JsonRpcProvider: jest.fn(),
    Contract: jest.fn(),
  },
}))

// In your test
const mockContract = {
  someMethod: jest.fn().mockResolvedValue(123n),
}

;(ethers.Contract as jest.Mock).mockImplementation(() => mockContract)
```

### Mocking Modules

```ts
jest.mock('../../config/cent', () => ({
  getBranches: jest.fn().mockReturnValue([
    { collSymbol: 'WBTC', stabilityPool: '0x123...' },
  ]),
}))
```

### Mocking Timers

```ts
beforeEach(() => {
  jest.useFakeTimers()
})

afterEach(() => {
  jest.useRealTimers()
})

it('should refresh after 30 seconds', () => {
  // ... setup

  jest.advanceTimersByTime(30000)

  // ... assertions
})
```

---

## Best Practices

### 1. Test Behavior, Not Implementation

❌ **Bad**:
```ts
expect(component.state.count).toBe(5)
```

✅ **Good**:
```ts
expect(screen.getByText('Count: 5')).toBeInTheDocument()
```

### 2. Use Descriptive Test Names

❌ **Bad**:
```ts
it('works', () => { ... })
```

✅ **Good**:
```ts
it('should display error message when form submission fails', () => { ... })
```

### 3. Arrange-Act-Assert Pattern

```ts
it('should increment counter', () => {
  // Arrange
  const { result } = renderHook(() => useCounter())

  // Act
  act(() => {
    result.current.increment()
  })

  // Assert
  expect(result.current.count).toBe(1)
})
```

### 4. Test Edge Cases

Always test:
- Empty states
- Error states
- Loading states
- Boundary values (0, negative, very large numbers)
- Invalid inputs

### 5. Clean Up After Tests

```ts
beforeEach(() => {
  jest.clearAllMocks()
  localStorage.clear()
})
```

### 6. Group Related Tests

```ts
describe('TransactionHistory', () => {
  describe('Empty State', () => {
    it('should render empty message', () => { ... })
    it('should render custom empty message', () => { ... })
  })

  describe('Transaction List', () => {
    it('should render all transactions', () => { ... })
    it('should display amounts', () => { ... })
  })
})
```

### 7. Use Test Data Builders

```ts
function createMockTransaction(overrides = {}) {
  return {
    id: '1',
    type: 'borrow',
    status: 'confirmed',
    timestamp: Date.now(),
    amount: '1000',
    token: 'CENT',
    description: 'Test transaction',
    ...overrides,
  }
}

// Usage
const transaction = createMockTransaction({ amount: '500' })
```

### 8. Avoid Test Interdependence

Each test should be independent and not rely on the order of execution.

---

## Coverage Reports

### Coverage Thresholds

Configured in `jest.config.ts`:

```ts
coverageThreshold: {
  global: {
    branches: 50,
    functions: 50,
    lines: 50,
    statements: 50,
  },
}
```

### Viewing Coverage

After running `npm run test:coverage`:

1. **Terminal Output**: Shows summary of coverage percentages
2. **HTML Report**: Open `coverage/lcov-report/index.html` in browser for detailed view

### Coverage Best Practices

- Aim for >80% coverage on critical paths (authentication, transactions, financial calculations)
- 100% coverage is not always necessary - focus on important business logic
- Exclude generated files and type definitions (already configured)

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

---

## Troubleshooting

### Common Issues

#### 1. "Cannot find module" errors

**Solution**: Check that module name mappers are configured correctly in `jest.config.ts`:

```ts
moduleNameMapper: {
  '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  '^@/(.*)$': '<rootDir>/src/$1',
}
```

#### 2. "ReferenceError: localStorage is not defined"

**Solution**: Ensure `setupFilesAfterEnv` is configured in `jest.config.ts`:

```ts
setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts']
```

#### 3. Tests timeout

**Solution**: Increase timeout for specific tests:

```ts
it('should fetch data', async () => {
  // ... test code
}, 10000) // 10 second timeout
```

Or globally in `jest.config.ts`:

```ts
testTimeout: 10000
```

#### 4. "act(...) warning"

**Solution**: Wrap state updates in `act()`:

```ts
import { act } from '@testing-library/react'

act(() => {
  result.current.updateState()
})
```

#### 5. Async updates not reflecting

**Solution**: Use `waitFor`:

```ts
await waitFor(() => {
  expect(result.current.loading).toBe(false)
})
```

#### 6. Mock not being used

**Solution**: Ensure mocks are defined before importing the module:

```ts
// Mock MUST come before import
jest.mock('./myModule')

import { myFunction } from './myModule'
```

---

## Example Test Suites

### Full Component Test Example

See: `src/components/__tests__/TransactionHistory.test.tsx`

**Coverage**:
- ✅ Empty states
- ✅ Rendering with data
- ✅ Status indicators (pending, confirmed, failed)
- ✅ User interactions (clicks)
- ✅ Loading states
- ✅ Error states
- ✅ Timestamp formatting

### Full Hook Test Example

See: `src/hooks/__tests__/useTransactionHistory.test.ts`

**Coverage**:
- ✅ Initialization
- ✅ Adding transactions
- ✅ Updating transactions
- ✅ Status changes (confirm, fail)
- ✅ localStorage persistence
- ✅ Filtering and querying
- ✅ Edge cases (limits, errors)

### Async Hook Test Example

See: `src/hooks/__tests__/usePoolStats.test.ts`

**Coverage**:
- ✅ Data fetching
- ✅ Error handling
- ✅ Auto-refresh intervals
- ✅ Cleanup on unmount
- ✅ Parameter changes
- ✅ Number formatting

---

## Testing Checklist for New Features

When adding a new feature, ensure you test:

- [ ] Component renders without crashing
- [ ] Component displays correct data
- [ ] User interactions work as expected
- [ ] Loading states are handled
- [ ] Error states are handled
- [ ] Empty states are handled
- [ ] Edge cases (null, undefined, empty arrays)
- [ ] Accessibility (proper ARIA labels, keyboard navigation)
- [ ] Responsive behavior (if applicable)
- [ ] Integration with other components/hooks

---

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Jest Cheat Sheet](https://github.com/sapegin/jest-cheat-sheet)

---

## Contributing

When adding new tests:

1. Follow the existing test structure
2. Use descriptive test names
3. Test edge cases and error scenarios
4. Maintain or improve coverage percentages
5. Document any complex test setups
6. Run `npm run test:coverage` before committing

---

**Last Updated**: 2025-10-26
**Maintained By**: Development Team
