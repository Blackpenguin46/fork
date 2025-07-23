# Component Library Guide

## Overview

This document contains comprehensive documentation for React components used in the CyberNex Academy platform, including design patterns, usage examples, and accessibility guidelines.

## Contents

- [Component Overview](./component-architecture-patterns.md) - Component architecture and patterns
- [Design System](./design-system-tokens.md) - UI design tokens and guidelines
- [Dashboard Components](./dashboard-component-specs.md) - Main dashboard and section cards
- [News Feed Components](./news-feed-component-specs.md) - Live threat intelligence components
- [Resource Components](./resource-component-specs.md) - Content display and interaction
- [Navigation Components](./navigation-component-specs.md) - Navigation and routing components
- [Form Components](./form-component-specs.md) - Input and form handling components
- [Layout Components](./layout-component-specs.md) - Page structure and layout
- [Accessibility Guidelines](./accessibility-implementation-guide.md) - WCAG compliance and best practices
- [Mobile Optimization](./mobile-component-optimization.md) - Mobile-specific component considerations

## Component Architecture

### Atomic Design Principles

```
Atoms (Basic Elements)
├── Button
├── Input
├── Badge
├── Icon
└── Typography

Molecules (Simple Components)
├── SearchBox
├── NewsItem
├── ResourceCard
├── UserAvatar
└── BookmarkButton

Organisms (Complex Components)
├── LiveNewsFeed
├── ResourceGrid
├── NavigationBar
├── UserDashboard
└── SectionCards

Templates (Page Layouts)
├── DashboardLayout
├── SectionLayout
├── ResourceLayout
└── AuthLayout

Pages (Complete Views)
├── HomePage
├── CommunityPage
├── InsightsPage
└── AcademyPage
```

### Component Structure

```typescript
// Standard component structure
interface ComponentProps {
  // Props interface
}

const Component: React.FC<ComponentProps> = ({
  // Destructured props
}) => {
  // Component logic
  
  return (
    // JSX structure
  )
}

export default Component
```

## Core Components

### 1. MainDashboard
**Purpose**: Central hub displaying three main section cards

**Props**:
```typescript
interface MainDashboardProps {
  user?: User
  stats: SectionStats
  loading?: boolean
}
```

**Usage**:
```tsx
<MainDashboard 
  user={currentUser}
  stats={sectionStatistics}
  loading={isLoading}
/>
```

### 2. LiveNewsFeed
**Purpose**: Real-time cybersecurity threat intelligence display

**Props**:
```typescript
interface LiveNewsFeedProps {
  maxItems?: number
  autoRefresh?: boolean
  refreshInterval?: number
  showSeverityFilter?: boolean
  compact?: boolean
}
```

**Usage**:
```tsx
<LiveNewsFeed
  maxItems={10}
  autoRefresh={true}
  refreshInterval={300000} // 5 minutes
  showSeverityFilter={true}
/>
```

### 3. ResourceCard
**Purpose**: Display individual resources with metadata

**Props**:
```typescript
interface ResourceCardProps {
  resource: Resource
  showBookmark?: boolean
  showProgress?: boolean
  onClick?: (resource: Resource) => void
}
```

**Usage**:
```tsx
<ResourceCard
  resource={resourceData}
  showBookmark={true}
  showProgress={user?.isAuthenticated}
  onClick={handleResourceClick}
/>
```

### 4. SectionCard
**Purpose**: Reusable card for main dashboard sections

**Props**:
```typescript
interface SectionCardProps {
  title: string
  description: string
  href: string
  icon: LucideIcon
  stats: Record<string, number>
  gradient: string
  loading?: boolean
}
```

**Usage**:
```tsx
<SectionCard
  title="Community"
  description="Connect with cybersecurity professionals"
  href="/community"
  icon={Users}
  stats={{ members: 50000, discussions: 200 }}
  gradient="from-blue-500 to-purple-600"
/>
```

## Design System

### Color Palette
```css
/* Primary Colors */
--cyber-cyan: #00FFFF
--cyber-magenta: #FF00FF
--cyber-green: #00FF00

/* Background Colors */
--deep-space-blue: #0A192F
--slate-950: #020617
--slate-900: #0F172A
--slate-800: #1E293B

/* Text Colors */
--text-primary: #FFFFFF
--text-secondary: #CBD5E1
--text-muted: #64748B
```

### Typography Scale
```css
/* Font Families */
--font-inter: 'Inter', sans-serif
--font-orbitron: 'Orbitron', monospace
--font-jetbrains: 'JetBrains Mono', monospace

/* Font Sizes */
--text-xs: 0.75rem
--text-sm: 0.875rem
--text-base: 1rem
--text-lg: 1.125rem
--text-xl: 1.25rem
--text-2xl: 1.5rem
--text-3xl: 1.875rem
--text-4xl: 2.25rem
```

### Spacing Scale
```css
/* Spacing Units */
--space-1: 0.25rem
--space-2: 0.5rem
--space-3: 0.75rem
--space-4: 1rem
--space-6: 1.5rem
--space-8: 2rem
--space-12: 3rem
--space-16: 4rem
```

## Component Patterns

### 1. Loading States
```tsx
const ComponentWithLoading: React.FC<Props> = ({ loading, data }) => {
  if (loading) {
    return <ComponentSkeleton />
  }
  
  return <ComponentContent data={data} />
}
```

### 2. Error Boundaries
```tsx
const ComponentWithErrorBoundary: React.FC<Props> = ({ children }) => {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      {children}
    </ErrorBoundary>
  )
}
```

### 3. Responsive Design
```tsx
const ResponsiveComponent: React.FC<Props> = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Component content */}
    </div>
  )
}
```

### 4. Accessibility Patterns
```tsx
const AccessibleComponent: React.FC<Props> = ({ title, description }) => {
  return (
    <div role="region" aria-labelledby="section-title">
      <h2 id="section-title">{title}</h2>
      <p aria-describedby="section-description">{description}</p>
    </div>
  )
}
```

## State Management

### 1. Local State (useState)
```tsx
const [isOpen, setIsOpen] = useState(false)
const [data, setData] = useState<Data[]>([])
```

### 2. Context API
```tsx
const ThemeContext = createContext<ThemeContextType>()

const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
```

### 3. Custom Hooks
```tsx
const useApi = <T>(url: string) => {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Hook logic
  
  return { data, loading, error }
}
```

## Testing Components

### Unit Testing
```tsx
describe('ComponentName', () => {
  it('renders correctly with props', () => {
    render(<ComponentName prop="value" />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })
  
  it('handles user interactions', async () => {
    const handleClick = jest.fn()
    render(<ComponentName onClick={handleClick} />)
    
    await user.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalled()
  })
})
```

### Integration Testing
```tsx
describe('Component Integration', () => {
  it('integrates with API correctly', async () => {
    const mockData = { /* mock data */ }
    jest.spyOn(api, 'fetchData').mockResolvedValue(mockData)
    
    render(<ComponentWithAPI />)
    
    await waitFor(() => {
      expect(screen.getByText('Data loaded')).toBeInTheDocument()
    })
  })
})
```

## Performance Optimization

### 1. React.memo
```tsx
const OptimizedComponent = React.memo<Props>(({ data }) => {
  return <div>{/* Component content */}</div>
}, (prevProps, nextProps) => {
  return prevProps.data.id === nextProps.data.id
})
```

### 2. useMemo and useCallback
```tsx
const Component: React.FC<Props> = ({ items, onSelect }) => {
  const expensiveValue = useMemo(() => {
    return items.reduce((acc, item) => acc + item.value, 0)
  }, [items])
  
  const handleSelect = useCallback((item: Item) => {
    onSelect(item)
  }, [onSelect])
  
  return <div>{/* Component content */}</div>
}
```

### 3. Lazy Loading
```tsx
const LazyComponent = lazy(() => import('./HeavyComponent'))

const App: React.FC = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <LazyComponent />
    </Suspense>
  )
}
```

## Accessibility Guidelines

### WCAG 2.1 AA Compliance
- **Color Contrast**: Minimum 4.5:1 ratio for normal text
- **Keyboard Navigation**: All interactive elements accessible via keyboard
- **Screen Readers**: Proper ARIA labels and semantic HTML
- **Focus Management**: Visible focus indicators and logical tab order

### Implementation Examples
```tsx
// Proper button with accessibility
<button
  aria-label="Close dialog"
  aria-describedby="dialog-description"
  onClick={handleClose}
  className="focus:ring-2 focus:ring-cyber-cyan"
>
  <X aria-hidden="true" />
</button>

// Accessible form input
<div>
  <label htmlFor="search-input" className="sr-only">
    Search resources
  </label>
  <input
    id="search-input"
    type="text"
    placeholder="Search..."
    aria-describedby="search-help"
  />
  <div id="search-help" className="sr-only">
    Enter keywords to search for cybersecurity resources
  </div>
</div>
```

---

For detailed component specifications and examples, refer to the individual component documentation files in this section.