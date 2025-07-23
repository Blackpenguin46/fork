# Security Implementation Guide

## Overview

This document contains comprehensive security documentation for the CyberNex Academy platform, covering security implementation, best practices, and compliance requirements.

## Contents

- [Security Overview](./security-architecture-principles.md) - Platform security architecture and principles
- [Authentication Security](./authentication-implementation-guide.md) - User authentication and session management
- [API Security](./api-security-best-practices.md) - API protection and secure coding practices
- [Data Protection](./data-encryption-privacy-guide.md) - Data encryption and privacy measures
- [Input Validation](./input-validation-sanitization.md) - Input sanitization and validation
- [Database Security](./database-security-controls.md) - Database protection and access control
- [Frontend Security](./frontend-security-measures.md) - Client-side security measures
- [Infrastructure Security](./infrastructure-security-hardening.md) - Deployment and hosting security
- [Compliance](./compliance-requirements-guide.md) - GDPR, SOC 2, and other compliance requirements
- [Security Monitoring](./security-monitoring-incident-response.md) - Threat detection and incident response
- [Security Testing](./security-testing-procedures.md) - Security testing procedures and tools

## Security Principles

### 1. Defense in Depth
Multiple layers of security controls to protect against various attack vectors:
- **Perimeter Security**: Firewall, DDoS protection
- **Application Security**: Input validation, authentication
- **Data Security**: Encryption, access controls
- **Monitoring**: Logging, alerting, incident response

### 2. Zero Trust Architecture
Never trust, always verify approach:
- **Identity Verification**: Multi-factor authentication
- **Device Trust**: Device registration and monitoring
- **Network Segmentation**: Micro-segmentation of services
- **Continuous Monitoring**: Real-time security assessment

### 3. Principle of Least Privilege
Users and systems have minimum necessary permissions:
- **Role-Based Access Control (RBAC)**: Granular permissions
- **API Access Control**: Scoped API keys and tokens
- **Database Permissions**: Limited database access
- **Administrative Access**: Restricted admin privileges

### 4. Security by Design
Security integrated throughout development lifecycle:
- **Secure Coding Standards**: OWASP guidelines
- **Security Reviews**: Code and architecture reviews
- **Threat Modeling**: Systematic threat analysis
- **Security Testing**: Automated and manual testing

## Authentication Security

### Multi-Factor Authentication (MFA)
```typescript
// MFA implementation example
interface MFAConfig {
  enabled: boolean
  methods: ('totp' | 'sms' | 'email')[]
  backupCodes: boolean
  gracePeriod: number // days
}

const mfaConfig: MFAConfig = {
  enabled: true,
  methods: ['totp', 'email'],
  backupCodes: true,
  gracePeriod: 7
}
```

### Session Management
```typescript
// Secure session configuration
const sessionConfig = {
  maxAge: 24 * 60 * 60, // 24 hours
  rolling: true, // Extend on activity
  secure: process.env.NODE_ENV === 'production',
  httpOnly: true,
  sameSite: 'strict' as const
}
```

### Password Security
- **Minimum Requirements**: 12 characters, mixed case, numbers, symbols
- **Password Hashing**: bcrypt with salt rounds ≥ 12
- **Password History**: Prevent reuse of last 12 passwords
- **Account Lockout**: 5 failed attempts, 15-minute lockout

## API Security

### Input Validation
```typescript
// Zod schema validation
import { z } from 'zod'

const userInputSchema = z.object({
  email: z.string().email().max(255),
  name: z.string().min(1).max(100).regex(/^[a-zA-Z\s]+$/),
  age: z.number().int().min(13).max(120)
})

// API endpoint with validation
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = userInputSchema.parse(body)
    
    // Process validated data
    return Response.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ 
        error: 'Validation failed',
        details: error.errors 
      }, { status: 400 })
    }
    throw error
  }
}
```

### Rate Limiting
```typescript
// Rate limiting implementation
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 h'), // 100 requests per hour
  analytics: true
})

export async function middleware(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? 'anonymous'
  const { success, limit, reset, remaining } = await ratelimit.limit(ip)
  
  if (!success) {
    return new Response('Rate limit exceeded', { 
      status: 429,
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': new Date(reset).toISOString()
      }
    })
  }
  
  return NextResponse.next()
}
```

### API Authentication
```typescript
// JWT token validation
import jwt from 'jsonwebtoken'

export async function validateToken(token: string): Promise<User | null> {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload
    
    // Additional validation
    if (decoded.exp < Date.now() / 1000) {
      throw new Error('Token expired')
    }
    
    // Fetch user from database
    const user = await getUserById(decoded.sub)
    if (!user || !user.isActive) {
      throw new Error('Invalid user')
    }
    
    return user
  } catch (error) {
    console.error('Token validation failed:', error)
    return null
  }
}
```

## Data Protection

### Encryption at Rest
```typescript
// Data encryption utilities
import crypto from 'crypto'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!
const ALGORITHM = 'aes-256-gcm'

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY)
  cipher.setAAD(Buffer.from('additional-data'))
  
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  const authTag = cipher.getAuthTag()
  
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
}

export function decrypt(encryptedText: string): string {
  const [ivHex, authTagHex, encrypted] = encryptedText.split(':')
  
  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')
  
  const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY)
  decipher.setAAD(Buffer.from('additional-data'))
  decipher.setAuthTag(authTag)
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  
  return decrypted
}
```

### PII Handling
```typescript
// PII data handling
interface PIIData {
  email: string
  fullName: string
  phoneNumber?: string
  address?: string
}

class PIIHandler {
  static mask(data: PIIData): Partial<PIIData> {
    return {
      email: this.maskEmail(data.email),
      fullName: this.maskName(data.fullName),
      phoneNumber: data.phoneNumber ? this.maskPhone(data.phoneNumber) : undefined
    }
  }
  
  private static maskEmail(email: string): string {
    const [local, domain] = email.split('@')
    return `${local.slice(0, 2)}***@${domain}`
  }
  
  private static maskName(name: string): string {
    const parts = name.split(' ')
    return parts.map(part => `${part.slice(0, 1)}***`).join(' ')
  }
  
  private static maskPhone(phone: string): string {
    return `***-***-${phone.slice(-4)}`
  }
}
```

## Database Security

### Row Level Security (RLS)
```sql
-- Enable RLS on sensitive tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy for users to access only their own data
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy for admin access
CREATE POLICY "Admins can view all profiles" ON user_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );
```

### Parameterized Queries
```typescript
// Safe database queries
export async function getUserByEmail(email: string): Promise<User | null> {
  // Using Supabase client (automatically parameterized)
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single()
  
  if (error) {
    console.error('Database query failed:', error)
    return null
  }
  
  return data
}

// Raw SQL with parameters (if needed)
export async function customQuery(userId: string): Promise<any[]> {
  const { data, error } = await supabase
    .rpc('custom_function', { user_id: userId })
  
  if (error) throw error
  return data
}
```

## Frontend Security

### Content Security Policy (CSP)
```typescript
// CSP configuration
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' blob: data: https:;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://api.stripe.com https://*.supabase.co;
  frame-src https://js.stripe.com;
`

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  response.headers.set('Content-Security-Policy', cspHeader.replace(/\s{2,}/g, ' ').trim())
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin')
  
  return response
}
```

### XSS Prevention
```typescript
// Content sanitization
import DOMPurify from 'isomorphic-dompurify'

export function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'a', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target'],
    ALLOW_DATA_ATTR: false
  })
}

// Safe rendering component
interface SafeHTMLProps {
  content: string
  className?: string
}

const SafeHTML: React.FC<SafeHTMLProps> = ({ content, className }) => {
  const sanitizedContent = sanitizeHTML(content)
  
  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  )
}
```

## Security Monitoring

### Audit Logging
```typescript
// Security audit logging
interface AuditLog {
  userId?: string
  action: string
  resource: string
  ipAddress: string
  userAgent: string
  timestamp: Date
  success: boolean
  details?: Record<string, any>
}

export async function logSecurityEvent(event: Omit<AuditLog, 'timestamp'>) {
  const auditLog: AuditLog = {
    ...event,
    timestamp: new Date()
  }
  
  // Log to database
  await supabase.from('audit_logs').insert(auditLog)
  
  // Log to external service for critical events
  if (event.action.includes('login_failed') || event.action.includes('unauthorized')) {
    await sendToSecurityService(auditLog)
  }
}
```

### Intrusion Detection
```typescript
// Suspicious activity detection
export class IntrusionDetector {
  static async checkSuspiciousActivity(userId: string, action: string): Promise<boolean> {
    const recentLogs = await this.getRecentLogs(userId, action, 15) // 15 minutes
    
    // Check for rapid repeated actions
    if (recentLogs.length > 10) {
      await this.flagSuspiciousActivity(userId, 'rapid_actions', { count: recentLogs.length })
      return true
    }
    
    // Check for failed login attempts
    if (action === 'login_attempt') {
      const failedAttempts = recentLogs.filter(log => !log.success).length
      if (failedAttempts >= 5) {
        await this.lockAccount(userId, 15) // 15 minutes
        return true
      }
    }
    
    return false
  }
  
  private static async flagSuspiciousActivity(userId: string, type: string, details: any) {
    await supabase.from('security_incidents').insert({
      user_id: userId,
      incident_type: type,
      details,
      status: 'open',
      created_at: new Date()
    })
  }
}
```

## Compliance

### GDPR Compliance
```typescript
// GDPR data handling
export class GDPRCompliance {
  static async handleDataRequest(userId: string, requestType: 'export' | 'delete'): Promise<void> {
    switch (requestType) {
      case 'export':
        await this.exportUserData(userId)
        break
      case 'delete':
        await this.deleteUserData(userId)
        break
    }
  }
  
  private static async exportUserData(userId: string): Promise<void> {
    // Collect all user data
    const userData = await this.collectUserData(userId)
    
    // Create export file
    const exportData = {
      personal_information: userData.profile,
      activity_logs: userData.activities,
      preferences: userData.preferences,
      export_date: new Date().toISOString()
    }
    
    // Send to user or make available for download
    await this.deliverExport(userId, exportData)
  }
  
  private static async deleteUserData(userId: string): Promise<void> {
    // Anonymize or delete user data
    await supabase.from('user_profiles').delete().eq('user_id', userId)
    await supabase.from('user_activities').delete().eq('user_id', userId)
    
    // Log deletion for compliance
    await this.logDataDeletion(userId)
  }
}
```

### Data Retention
```typescript
// Automated data retention
export class DataRetention {
  static async cleanupExpiredData(): Promise<void> {
    const retentionPeriods = {
      audit_logs: 365, // 1 year
      user_sessions: 30, // 30 days
      temporary_files: 7, // 7 days
      deleted_accounts: 90 // 90 days
    }
    
    for (const [table, days] of Object.entries(retentionPeriods)) {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - days)
      
      await supabase
        .from(table)
        .delete()
        .lt('created_at', cutoffDate.toISOString())
    }
  }
}
```

## Security Testing

### Automated Security Scanning
```yaml
# GitHub Actions security workflow
name: Security Scan

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run Snyk to check for vulnerabilities
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high
      
      - name: Run CodeQL Analysis
        uses: github/codeql-action/analyze@v2
        with:
          languages: typescript
      
      - name: OWASP ZAP Baseline Scan
        uses: zaproxy/action-baseline@v0.7.0
        with:
          target: 'https://cybernexacademy.com'
```

### Penetration Testing
- **Frequency**: Quarterly automated scans, annual manual testing
- **Scope**: Web application, API endpoints, infrastructure
- **Tools**: OWASP ZAP, Burp Suite, Nessus
- **Reporting**: Detailed findings with remediation timelines

---

For detailed security procedures and incident response plans, refer to the individual security documentation files in this section.