# Technology Stack

## Framework & Language
- **Next.js 14** with App Router (React 18)
- **TypeScript** in strict mode
- **Node.js** runtime

## Frontend
- **Styling**: Tailwind CSS with custom cyber theme
- **UI Components**: Radix UI primitives
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Fonts**: Inter, Orbitron (cyber theme), JetBrains Mono

## Backend & Database
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with JWT
- **Storage**: Supabase Storage
- **API**: Next.js API Routes
- **ORM**: Supabase client with TypeScript types

## External Services
- **Payments**: Stripe integration
- **Analytics**: Vercel Analytics & Speed Insights
- **Email**: Resend for transactional emails
- **Deployment**: Vercel

## Development Tools
- **Package Manager**: npm
- **Linting**: ESLint with Next.js config
- **CSS Processing**: PostCSS with Tailwind
- **Type Checking**: TypeScript compiler

## Common Commands

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

### Database Operations
```bash
npm run supabase           # General Supabase CLI wrapper
npm run db:profiles        # Manage profiles table
npm run db:resources       # Manage resources table
npm run db:categories      # Manage categories table
npm run db:stats          # View database statistics
npm run db:tables         # List all tables
```

### Content Management
```bash
npm run generate:resources # Generate sample resources
npm run seed:resources     # Seed database with resources
```

## Environment Variables
Required variables in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`

## Security Features
- Content Security Policy (CSP) headers
- CORS configuration for API routes
- Row Level Security (RLS) in Supabase
- Input validation and sanitization
- Secure authentication flows