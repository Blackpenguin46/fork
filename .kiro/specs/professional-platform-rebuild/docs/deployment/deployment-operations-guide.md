# Deployment Operations Guide

## Overview

This document contains comprehensive deployment documentation for the CyberNex Academy platform, covering environment setup, CI/CD pipelines, and production deployment strategies.

## Contents

- [Environment Setup](./environment-configuration-guide.md) - Development and production environment configuration
- [CI/CD Pipeline](./continuous-integration-deployment.md) - Automated deployment and testing workflows
- [Vercel Deployment](./vercel-deployment-configuration.md) - Vercel-specific deployment configuration
- [Database Deployment](./database-migration-strategies.md) - Supabase database setup and migrations
- [Environment Variables](./environment-variables-management.md) - Configuration management
- [Monitoring Setup](./production-monitoring-setup.md) - Production monitoring and alerting
- [Performance Optimization](./production-performance-tuning.md) - Production performance tuning
- [Backup and Recovery](./backup-disaster-recovery.md) - Data backup and disaster recovery
- [Scaling Strategies](./horizontal-vertical-scaling.md) - Horizontal and vertical scaling approaches

## Deployment Architecture

### Production Environment
```
GitHub Repository
       ↓
GitHub Actions (CI/CD)
       ↓
Vercel Deployment
       ↓
Production Application
       ↓
Supabase Backend
```

### Environment Tiers
1. **Development**: Local development environment
2. **Staging**: Preview deployments for testing
3. **Production**: Live production environment

## Quick Deployment Guide

### Prerequisites
- GitHub repository with source code
- Vercel account connected to GitHub
- Supabase project configured
- Environment variables configured

### Deployment Steps
1. **Push to GitHub**: Code changes trigger automatic deployment
2. **CI/CD Pipeline**: Automated testing and building
3. **Vercel Deployment**: Automatic deployment to production
4. **Database Migrations**: Automatic or manual database updates
5. **Monitoring**: Verify deployment success and performance

## Environment Configuration

### Development Environment
```bash
# Local development setup
npm install
npm run dev

# Environment variables
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
STRIPE_SECRET_KEY=your_stripe_secret_key
```

### Production Environment
```bash
# Vercel environment variables
NEXT_PUBLIC_SUPABASE_URL=production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=production_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=production_service_role_key
STRIPE_SECRET_KEY=production_stripe_secret_key
REDIS_URL=production_redis_url
```

## CI/CD Pipeline

### GitHub Actions Workflow
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

### Pipeline Stages
1. **Code Quality**: ESLint, Prettier, TypeScript checking
2. **Testing**: Unit tests, integration tests, E2E tests
3. **Security**: Dependency scanning, security audits
4. **Build**: Next.js production build
5. **Deploy**: Vercel deployment
6. **Post-Deploy**: Health checks, monitoring alerts

## Vercel Configuration

### vercel.json
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm ci",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "crons": [
    {
      "path": "/api/news/sync",
      "schedule": "*/30 * * * *"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "https://cybernexacademy.com"
        }
      ]
    }
  ]
}
```

### Environment Variables
```bash
# Vercel CLI commands
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add STRIPE_SECRET_KEY production
```

## Database Deployment

### Supabase Setup
1. **Project Creation**: Create Supabase project
2. **Database Schema**: Apply initial schema
3. **RLS Policies**: Configure Row Level Security
4. **API Keys**: Generate and configure API keys
5. **Storage**: Set up file storage buckets

### Migration Strategy
```sql
-- Migration example
CREATE TABLE IF NOT EXISTS news_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  source TEXT NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE news_items ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "News items are viewable by everyone" ON news_items
  FOR SELECT USING (true);
```

## Monitoring and Alerting

### Production Monitoring
- **Uptime Monitoring**: Vercel built-in monitoring
- **Error Tracking**: Sentry integration
- **Performance**: Vercel Analytics + Microsoft Clarity
- **Database**: Supabase monitoring dashboard

### Alert Configuration
```javascript
// Sentry configuration
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  beforeSend(event) {
    // Filter sensitive data
    return event
  }
})
```

### Health Checks
```typescript
// Health check endpoint
export async function GET() {
  try {
    // Check database connection
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
    
    if (error) throw error
    
    return Response.json({ 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected'
    })
  } catch (error) {
    return Response.json({ 
      status: 'unhealthy',
      error: error.message 
    }, { status: 500 })
  }
}
```

## Performance Optimization

### Build Optimization
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react']
  },
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384]
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: false
}

module.exports = nextConfig
```

### Caching Strategy
```typescript
// API caching
export async function GET() {
  const data = await fetchData()
  
  return Response.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
    }
  })
}
```

## Security Configuration

### Content Security Policy
```javascript
// Security headers
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'"
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  }
]
```

### Environment Security
- **API Keys**: Stored in Vercel environment variables
- **Database**: Connection strings secured
- **Secrets**: Rotated regularly
- **Access Control**: Limited deployment permissions

## Backup and Recovery

### Database Backups
- **Automatic**: Supabase automatic daily backups
- **Manual**: On-demand backup before major deployments
- **Retention**: 30-day backup retention
- **Testing**: Regular backup restoration testing

### Code Backups
- **Git Repository**: Primary source of truth
- **Multiple Remotes**: GitHub + backup repository
- **Release Tags**: Tagged releases for rollback
- **Documentation**: Deployment documentation versioned

## Scaling Strategies

### Current Limits
- **Vercel**: 100GB bandwidth, 1000 serverless functions
- **Supabase**: 500MB database, 2GB bandwidth (free tier)
- **Performance**: Sub-2 second page loads

### Scaling Options
1. **Vertical Scaling**: Upgrade to paid tiers
2. **Horizontal Scaling**: Multiple deployments
3. **Caching**: Advanced caching layers
4. **CDN**: Global content distribution

### Monitoring Thresholds
- **Response Time**: > 2 seconds
- **Error Rate**: > 5%
- **Database Connections**: > 80% of limit
- **Bandwidth**: > 80% of monthly limit

---

For detailed deployment procedures and troubleshooting guides, refer to the individual documentation files in this section.