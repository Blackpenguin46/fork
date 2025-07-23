# Testing Strategy Guide

## Overview

This document contains comprehensive testing documentation for the CyberNex Academy platform, covering testing strategies, frameworks, and best practices for ensuring code quality and reliability.

## Contents

- [Testing Strategy](./testing-methodology-approach.md) - Overall testing approach and methodologies
- [Unit Testing](./unit-testing-specifications.md) - Component and function-level testing
- [Integration Testing](./integration-testing-procedures.md) - API and service integration testing
- [End-to-End Testing](./e2e-testing-scenarios.md) - Full user journey testing
- [Performance Testing](./performance-load-testing.md) - Load and performance testing
- [Security Testing](./security-vulnerability-testing.md) - Security vulnerability testing
- [Accessibility Testing](./accessibility-compliance-testing.md) - WCAG compliance testing
- [Visual Regression Testing](./visual-regression-procedures.md) - UI consistency testing
- [API Testing](./api-endpoint-testing.md) - API endpoint testing
- [Mobile Testing](./mobile-device-testing.md) - Mobile-specific testing approaches
- [Test Automation](./ci-cd-test-automation.md) - CI/CD testing integration

## Testing Philosophy

### 1. Testing Pyramid
```
    /\
   /  \     E2E Tests (Few)
  /____\    
 /      \   Integration Tests (Some)
/__________\ Unit Tests (Many)
```

- **Unit Tests (70%)**: Fast, isolated, comprehensive coverage
- **Integration Tests (20%)**: API and service interactions
- **E2E Tests (10%)**: Critical user journeys

### 2. Test-Driven Development (TDD)
1. **Red**: Write failing test
2. **Green**: Write minimal code to pass
3. **Refactor**: Improve code while keeping tests green

### 3. Behavior-Driven Development (BDD)
- Tests written in natural language
- Focus on user behavior and outcomes
- Collaboration between developers, testers, and stakeholders

## Testing Stack

### Unit Testing
- **Framework**: Jest
- **React Testing**: React Testing Library
- **Mocking**: Jest mocks, MSW (Mock Service Worker)
- **Coverage**: Istanbul/NYC

### Integration Testing
- **API Testing**: Supertest
- **Database Testing**: Test database instances
- **Service Testing**: Docker containers

### End-to-End Testing
- **Framework**: Playwright
- **Browser Support**: Chromium, Firefox, Safari
- **Mobile Testing**: Device emulation

### Performance Testing
- **Load Testing**: Artillery, k6
- **Lighthouse**: Performance auditing
- **Bundle Analysis**: webpack-bundle-analyzer

## Unit Testing

### Component Testing
```typescript
// Example component test
import { render, screen, fireEvent } from '@testing-library/react'
import { LiveNewsFeed } from '@/components/news/LiveNewsFeed'

describe('LiveNewsFeed', () => {
  const mockNews = [
    {
      id: '1',
      title: 'Critical Security Vulnerability',
      summary: 'A critical vulnerability has been discovered',
      source: 'NIST',
      severity: 'critical' as const,
      publishedAt: new Date(),
      url: 'https://example.com'
    }
  ]

  it('renders news items correctly', () => {
    render(<LiveNewsFeed news={mockNews} />)
    
    expect(screen.getByText('Critical Security Vulnerability')).toBeInTheDocument()
    expect(screen.getByText('NIST')).toBeInTheDocument()
  })

  it('applies correct severity styling', () => {
    render(<LiveNewsFeed news={mockNews} />)
    
    const newsItem = screen.getByTestId('news-item-1')
    expect(newsItem).toHaveClass('border-red-500') // Critical severity
  })

  it('handles empty news list', () => {
    render(<LiveNewsFeed news={[]} />)
    
    expect(screen.getByText('No recent news available')).toBeInTheDocument()
  })

  it('calls onClick when news item is clicked', () => {
    const handleClick = jest.fn()
    render(<LiveNewsFeed news={mockNews} onItemClick={handleClick} />)
    
    fireEvent.click(screen.getByText('Critical Security Vulnerability'))
    expect(handleClick).toHaveBeenCalledWith(mockNews[0])
  })
})
```

### Service Testing
```typescript
// Example service test
import { NewsAggregationService } from '@/lib/services/news-aggregation'
import { mockRSSResponse, mockNISTResponse } from '@/test/mocks'

describe('NewsAggregationService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('aggregates news from multiple sources', async () => {
    // Mock external API responses
    jest.spyOn(global, 'fetch')
      .mockResolvedValueOnce(mockRSSResponse)
      .mockResolvedValueOnce(mockNISTResponse)

    const news = await NewsAggregationService.aggregateNews()

    expect(news).toHaveLength(2)
    expect(news[0].source).toBe('RSS')
    expect(news[1].source).toBe('NIST')
  })

  it('handles API failures gracefully', async () => {
    jest.spyOn(global, 'fetch').mockRejectedValue(new Error('API Error'))

    const news = await NewsAggregationService.aggregateNews()

    expect(news).toEqual([])
    expect(console.error).toHaveBeenCalledWith('Failed to fetch news:', expect.any(Error))
  })

  it('deduplicates similar news items', async () => {
    const duplicateNews = [
      { title: 'Security Alert', source: 'Source1' },
      { title: 'Security Alert', source: 'Source2' }
    ]

    jest.spyOn(NewsAggregationService, 'fetchFromSources')
      .mockResolvedValue(duplicateNews)

    const news = await NewsAggregationService.aggregateNews()

    expect(news).toHaveLength(1)
  })
})
```

## Integration Testing

### API Integration Tests
```typescript
// Example API integration test
import { createMocks } from 'node-mocks-http'
import handler from '@/app/api/news/live-feed/route'
import { supabase } from '@/lib/supabase'

describe('/api/news/live-feed', () => {
  beforeEach(async () => {
    // Clean test database
    await supabase.from('news_items').delete().neq('id', '')
  })

  it('returns latest news items', async () => {
    // Seed test data
    await supabase.from('news_items').insert([
      {
        title: 'Test News 1',
        source: 'Test Source',
        severity: 'high',
        published_at: new Date().toISOString()
      }
    ])

    const { req, res } = createMocks({ method: 'GET' })
    await handler(req, res)

    expect(res._getStatusCode()).toBe(200)
    
    const data = JSON.parse(res._getData())
    expect(data.success).toBe(true)
    expect(data.data).toHaveLength(1)
    expect(data.data[0].title).toBe('Test News 1')
  })

  it('filters news by severity', async () => {
    await supabase.from('news_items').insert([
      { title: 'Critical News', severity: 'critical' },
      { title: 'Low News', severity: 'low' }
    ])

    const { req, res } = createMocks({
      method: 'GET',
      query: { severity: 'critical' }
    })
    await handler(req, res)

    const data = JSON.parse(res._getData())
    expect(data.data).toHaveLength(1)
    expect(data.data[0].severity).toBe('critical')
  })

  it('handles authentication for premium features', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      headers: { authorization: 'Bearer invalid-token' }
    })
    await handler(req, res)

    expect(res._getStatusCode()).toBe(401)
  })
})
```

### Database Integration Tests
```typescript
// Database integration test
describe('Database Operations', () => {
  let testUserId: string

  beforeAll(async () => {
    // Create test user
    const { data: user } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'testpassword123'
    })
    testUserId = user.user!.id
  })

  afterAll(async () => {
    // Cleanup test user
    await supabase.from('profiles').delete().eq('id', testUserId)
  })

  it('creates user profile on signup', async () => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', testUserId)
      .single()

    expect(profile).toBeTruthy()
    expect(profile.email).toBe('test@example.com')
  })

  it('enforces RLS policies', async () => {
    // Try to access another user's data
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', 'different-user-id')

    expect(data).toHaveLength(0) // RLS should prevent access
  })
})
```

## End-to-End Testing

### User Journey Tests
```typescript
// Playwright E2E test
import { test, expect } from '@playwright/test'

test.describe('User Authentication Flow', () => {
  test('user can sign up and access dashboard', async ({ page }) => {
    // Navigate to signup page
    await page.goto('/auth/register')

    // Fill signup form
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.fill('[data-testid="password-input"]', 'SecurePassword123!')
    await page.fill('[data-testid="confirm-password-input"]', 'SecurePassword123!')

    // Submit form
    await page.click('[data-testid="signup-button"]')

    // Verify redirect to dashboard
    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('h1')).toContainText('Welcome to CyberNex Academy')
  })

  test('user can navigate between sections', async ({ page }) => {
    // Login first
    await page.goto('/auth/login')
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.fill('[data-testid="password-input"]', 'SecurePassword123!')
    await page.click('[data-testid="login-button"]')

    // Navigate to Community section
    await page.click('[data-testid="community-card"]')
    await expect(page).toHaveURL('/community')
    await expect(page.locator('h1')).toContainText('Community')

    // Navigate to Insights section
    await page.click('[data-testid="insights-nav"]')
    await expect(page).toHaveURL('/insights')
    await expect(page.locator('[data-testid="live-news-feed"]')).toBeVisible()
  })
})

test.describe('News Feed Functionality', () => {
  test('displays live news feed', async ({ page }) => {
    await page.goto('/insights')

    // Wait for news feed to load
    await page.waitForSelector('[data-testid="news-item"]')

    // Verify news items are displayed
    const newsItems = await page.locator('[data-testid="news-item"]').count()
    expect(newsItems).toBeGreaterThan(0)

    // Verify severity indicators
    const criticalItems = await page.locator('[data-testid="news-item"][data-severity="critical"]').count()
    if (criticalItems > 0) {
      await expect(page.locator('[data-testid="news-item"][data-severity="critical"]').first())
        .toHaveClass(/border-red-500/)
    }
  })

  test('filters news by severity', async ({ page }) => {
    await page.goto('/insights')

    // Apply critical severity filter
    await page.click('[data-testid="severity-filter"]')
    await page.click('[data-testid="filter-critical"]')

    // Verify only critical items are shown
    const newsItems = await page.locator('[data-testid="news-item"]')
    const count = await newsItems.count()

    for (let i = 0; i < count; i++) {
      await expect(newsItems.nth(i)).toHaveAttribute('data-severity', 'critical')
    }
  })
})
```

## Performance Testing

### Load Testing
```javascript
// Artillery load test configuration
module.exports = {
  config: {
    target: 'https://cybernexacademy.com',
    phases: [
      { duration: 60, arrivalRate: 10 }, // Warm up
      { duration: 300, arrivalRate: 50 }, // Sustained load
      { duration: 60, arrivalRate: 100 } // Peak load
    ],
    defaults: {
      headers: {
        'User-Agent': 'Artillery Load Test'
      }
    }
  },
  scenarios: [
    {
      name: 'Homepage Load',
      weight: 40,
      flow: [
        { get: { url: '/' } },
        { think: 3 },
        { get: { url: '/community' } },
        { think: 2 },
        { get: { url: '/insights' } }
      ]
    },
    {
      name: 'API Load',
      weight: 30,
      flow: [
        { get: { url: '/api/news/live-feed' } },
        { think: 1 },
        { get: { url: '/api/resources?section=community' } }
      ]
    },
    {
      name: 'User Journey',
      weight: 30,
      flow: [
        { get: { url: '/auth/login' } },
        { post: {
            url: '/api/auth/login',
            json: {
              email: 'test@example.com',
              password: 'password123'
            }
          }
        },
        { get: { url: '/dashboard' } }
      ]
    }
  ]
}
```

### Lighthouse Performance Testing
```javascript
// Lighthouse CI configuration
module.exports = {
  ci: {
    collect: {
      url: [
        'https://cybernexacademy.com',
        'https://cybernexacademy.com/community',
        'https://cybernexacademy.com/insights',
        'https://cybernexacademy.com/academy'
      ],
      numberOfRuns: 3
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }]
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
}
```

## Test Automation

### GitHub Actions CI/CD
```yaml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run test:unit -- --coverage
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run build
      - run: npm run test:e2e
      
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  performance-tests:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run test:performance
      
      - name: Run Lighthouse CI
        run: |
          npm install -g @lhci/cli@0.12.x
          lhci autorun
```

## Test Coverage Requirements

### Coverage Targets
- **Unit Tests**: 90% line coverage, 85% branch coverage
- **Integration Tests**: 80% API endpoint coverage
- **E2E Tests**: 100% critical user journey coverage

### Coverage Reporting
```json
{
  "jest": {
    "collectCoverageFrom": [
      "src/**/*.{ts,tsx}",
      "!src/**/*.d.ts",
      "!src/**/*.stories.tsx",
      "!src/test/**/*"
    ],
    "coverageThreshold": {
      "global": {
        "branches": 85,
        "functions": 90,
        "lines": 90,
        "statements": 90
      }
    }
  }
}
```

## Testing Best Practices

### 1. Test Organization
- Group related tests in describe blocks
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Keep tests independent and isolated

### 2. Mock Strategy
- Mock external dependencies
- Use real implementations for internal code
- Avoid over-mocking
- Reset mocks between tests

### 3. Data Management
- Use factories for test data generation
- Clean up test data after each test
- Use separate test databases
- Avoid hardcoded test data

### 4. Async Testing
- Properly handle promises and async operations
- Use appropriate waiting strategies
- Avoid arbitrary timeouts
- Test both success and error scenarios

---

For detailed testing procedures and specific test examples, refer to the individual testing documentation files in this section.