# Project Structure

## Root Directory
- `.env.local` - Environment variables (not committed)
- `.env.example` - Environment template
- `package.json` - Dependencies and scripts
- `next.config.js` - Next.js configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration
- `middleware.ts` - Next.js middleware for auth/routing

## Core Application Structure

### `/app` - Next.js App Router
```
app/
├── layout.tsx              # Root layout with providers
├── page.tsx               # Homepage (landing/dashboard)
├── globals.css            # Global styles and CSS variables
├── providers.tsx          # Context providers (auth, theme)
├── auth/                  # Authentication pages
├── dashboard/             # User dashboard
├── academy/               # Learning platform
├── community/             # Community features
├── insights/              # Threat intelligence
├── api/                   # API routes
└── [dynamic]/             # Dynamic routes
```

### `/components` - Reusable Components
```
components/
├── ui/                    # Base UI components (Radix-based)
├── layout/                # Layout components (Navbar, Footer)
├── auth/                  # Authentication components
├── dashboard/             # Dashboard-specific components
├── resources/             # Resource display components
├── search/                # Search and filtering
└── [feature]/             # Feature-specific components
```

### `/lib` - Utilities and Services
```
lib/
├── supabase.ts           # Supabase client configuration
├── utils.ts              # General utilities (cn, etc.)
├── auth/                 # Authentication utilities
├── services/             # Business logic services
├── types/                # TypeScript type definitions
├── stripe/               # Payment processing
└── utils/                # Feature-specific utilities
```

## Data and Configuration

### `/database` - Database Schema
- `migrations/` - SQL migration files
- Schema documentation and diagrams

### `/supabase` - Supabase Configuration
- `config.toml` - Supabase project configuration
- `migrations/` - Supabase-managed migrations
- `functions/` - Edge functions

### `/docs` - Documentation
- Comprehensive project documentation
- Architecture guides and development notes

## Styling and Assets

### `/public` - Static Assets
- Images, icons, and static files
- SEO assets (robots.txt, sitemap.xml)

### Styling Approach
- **Tailwind CSS** with custom cyber theme
- **CSS Variables** for dynamic theming
- **Component-scoped** styles when needed
- **Responsive-first** design approach

## Key Conventions

### File Naming
- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Pages**: lowercase with hyphens (e.g., `learning-paths/`)
- **Utilities**: camelCase (e.g., `userService.ts`)
- **Types**: PascalCase interfaces (e.g., `UserProfile`)

### Import Organization
```typescript
// External libraries
import { useState } from 'react'
import { Button } from '@/components/ui/button'

// Internal utilities
import { supabase } from '@/lib/supabase'
import { UserService } from '@/lib/services/user'

// Types
import type { User } from '@/lib/types/database'
```

### Component Structure
```typescript
// Props interface
interface ComponentProps {
  // props definition
}

// Main component
export default function Component({ }: ComponentProps) {
  // hooks and state
  // handlers
  // render
}
```

## Development Patterns

### API Routes
- Located in `/app/api/`
- RESTful conventions
- Proper error handling and validation
- Supabase integration for data operations

### Authentication
- Supabase Auth integration
- Protected routes via middleware
- User context throughout app
- Role-based access control

### State Management
- React Context for global state
- Local state with useState/useReducer
- Server state via Supabase real-time
- Form state with controlled components

### Error Handling
- Error boundaries for component errors
- API error responses with proper status codes
- User-friendly error messages
- Logging for debugging