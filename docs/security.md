# Cybernex Academy - Security Guide & OWASP Top 10 Prevention

## Current Security Implementation

### Security Headers (next.config.js)
```javascript
// Content Security Policy implementation
const cspValue = `default-src 'self';
  script-src 'self' 'unsafe-inline' https://*.vercel.app https://vercel.live;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' blob: data: https://*.googleusercontent.com https://*.supabase.co;
  connect-src 'self' https://*.supabase.co https://api.openai.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  block-all-mixed-content;
  upgrade-insecure-requests;`;
```

### Authentication Security
- **Supabase Auth**: JWT-based authentication with secure session management
- **Row Level Security (RLS)**: Database-level access controls
- **Environment Variables**: Secure credential management through Vercel

---

## OWASP Top 10 (2021) Prevention Guide

### A01: Broken Access Control

#### Current Implementation ✅
```typescript
// Middleware-based route protection
export async function middleware(request: NextRequest) {
  const { data: user } = await supabase.auth.getUser();
  
  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!user) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }
  
  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user || user.user_metadata.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
}
```

#### Security Checklist
- [x] **Route Protection**: Middleware enforces authentication
- [x] **Database RLS**: Supabase Row Level Security policies
- [ ] **API Authorization**: Implement role-based API access
- [ ] **Resource Access Control**: Verify user permissions for resources
- [ ] **Admin Functions**: Separate admin interface with elevated permissions

#### Recommended Enhancements
```typescript
// Enhanced authorization service
export class AuthorizationService {
  static async checkResourceAccess(
    userId: string, 
    resourceId: string, 
    action: 'read' | 'write' | 'delete'
  ): Promise<boolean> {
    const { data: resource } = await supabase
      .from('resources')
      .select('is_premium, created_by')
      .eq('id', resourceId)
      .single();
    
    const { data: user } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', userId)
      .single();
    
    // Check premium access
    if (resource.is_premium && user.subscription_tier !== 'pro') {
      return false;
    }
    
    // Check ownership for write/delete
    if (['write', 'delete'].includes(action)) {
      return resource.created_by === userId;
    }
    
    return true;
  }
}
```

### A02: Cryptographic Failures

#### Current Implementation ✅
- **HTTPS Enforcement**: Vercel provides SSL/TLS encryption
- **JWT Tokens**: Supabase handles token encryption
- **Environment Variables**: Secure storage of API keys

#### Security Checklist
- [x] **Data in Transit**: HTTPS for all communications
- [x] **Authentication Tokens**: Secure JWT implementation
- [ ] **Sensitive Data Encryption**: Database field encryption for PII
- [ ] **API Key Rotation**: Regular rotation of service keys
- [ ] **Backup Encryption**: Encrypted database backups

#### Recommended Enhancements
```typescript
// Data encryption utilities
import { createCipher, createDecipher } from 'crypto';

export class EncryptionService {
  private static readonly algorithm = 'aes-256-cbc';
  private static readonly key = process.env.ENCRYPTION_KEY;
  
  static encrypt(text: string): string {
    const cipher = createCipher(this.algorithm, this.key);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }
  
  static decrypt(encryptedText: string): string {
    const decipher = createDecipher(this.algorithm, this.key);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
  
  // Encrypt sensitive user data before storage
  static async encryptUserData(userData: any): Promise<any> {
    const sensitiveFields = ['email', 'phone', 'address'];
    const encrypted = { ...userData };
    
    sensitiveFields.forEach(field => {
      if (encrypted[field]) {
        encrypted[field] = this.encrypt(encrypted[field]);
      }
    });
    
    return encrypted;
  }
}
```

### A03: Injection

#### Current Implementation ✅
- **Parameterized Queries**: Supabase client prevents SQL injection
- **Input Validation**: TypeScript type checking

#### Security Checklist
- [x] **SQL Injection Prevention**: Supabase ORM with parameterized queries
- [ ] **NoSQL Injection**: Validate JSON inputs for database queries
- [ ] **Command Injection**: Validate any system command inputs
- [ ] **XPath/LDAP Injection**: Not applicable (no XML/LDAP usage)
- [ ] **Input Sanitization**: Comprehensive input validation

#### Recommended Enhancements
```typescript
// Input validation with Zod
import { z } from 'zod';

export const UserRegistrationSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128).regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    'Password must contain uppercase, lowercase, number, and special character'
  ),
  full_name: z.string().min(2).max(100).regex(/^[a-zA-Z\s]+$/, 'Only letters and spaces allowed'),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, 'Only alphanumeric and underscore allowed')
});

export const ResourceCreationSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(10).max(1000),
  content: z.string().max(50000),
  resource_type: z.enum(['course', 'article', 'video', 'tool', 'community', 'documentation']),
  difficulty_level: z.enum(['beginner', 'intermediate', 'advanced']),
  tags: z.array(z.string().max(50)).max(10)
});

// API route validation middleware
export function validateInput<T>(schema: z.ZodSchema<T>) {
  return async (req: NextRequest) => {
    try {
      const body = await req.json();
      const validatedData = schema.parse(body);
      return { success: true, data: validatedData };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { 
          success: false, 
          errors: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        };
      }
      throw error;
    }
  };
}
```

### A04: Insecure Design

#### Security Checklist
- [ ] **Threat Modeling**: Conduct systematic threat analysis
- [ ] **Security Requirements**: Define security requirements for each feature
- [ ] **Secure Architecture**: Review architecture for security flaws
- [ ] **Defense in Depth**: Multiple layers of security controls
- [ ] **Fail Secure**: System fails to secure state by default

#### Security Architecture Recommendations
```typescript
// Secure design patterns implementation
export class SecureDesignService {
  // Rate limiting per user and endpoint
  static createRateLimiter(requests: number, windowMs: number) {
    const attempts = new Map<string, { count: number; resetTime: number }>();
    
    return (userId: string): boolean => {
      const now = Date.now();
      const userAttempts = attempts.get(userId);
      
      if (!userAttempts || now > userAttempts.resetTime) {
        attempts.set(userId, { count: 1, resetTime: now + windowMs });
        return true;
      }
      
      if (userAttempts.count >= requests) {
        return false;
      }
      
      userAttempts.count++;
      return true;
    };
  }
  
  // Circuit breaker pattern for external services
  static createCircuitBreaker(threshold: number, timeout: number) {
    let failures = 0;
    let lastFailTime = 0;
    let state: 'closed' | 'open' | 'half-open' = 'closed';
    
    return async <T>(operation: () => Promise<T>): Promise<T> => {
      const now = Date.now();
      
      if (state === 'open' && now - lastFailTime < timeout) {
        throw new Error('Circuit breaker is open');
      }
      
      try {
        const result = await operation();
        failures = 0;
        state = 'closed';
        return result;
      } catch (error) {
        failures++;
        lastFailTime = now;
        
        if (failures >= threshold) {
          state = 'open';
        }
        
        throw error;
      }
    };
  }
}
```

### A05: Security Misconfiguration

#### Current Implementation ✅
- **Security Headers**: Comprehensive CSP and security headers
- **Environment Separation**: Development, staging, and production environments

#### Security Checklist
- [x] **Security Headers**: CSP, HSTS, X-Frame-Options implemented
- [x] **Environment Configuration**: Secure environment variable management
- [ ] **Default Credentials**: No default credentials in use
- [ ] **Error Handling**: Secure error messages (no sensitive data exposure)
- [ ] **Security Configurations**: Regular security configuration audits

#### Recommended Enhancements
```typescript
// Enhanced security headers
export function getSecurityHeaders(): Record<string, string> {
  return {
    // Prevent clickjacking
    'X-Frame-Options': 'DENY',
    
    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',
    
    // Enable XSS protection
    'X-XSS-Protection': '1; mode=block',
    
    // Strict transport security
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    
    // Referrer policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    
    // Permissions policy
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    
    // Content Security Policy (already implemented)
    'Content-Security-Policy': process.env.CSP_HEADER,
    
    // Cross-origin policies
    'Cross-Origin-Embedder-Policy': 'credentialless',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-site'
  };
}

// Error handling without information disclosure
export class SecureErrorHandler {
  static handleError(error: any, context: string): ApiResponse {
    // Log full error details for debugging
    console.error(`Error in ${context}:`, error);
    
    // Return sanitized error to client
    if (process.env.NODE_ENV === 'production') {
      return {
        success: false,
        error: 'An error occurred. Please try again later.',
        code: 'INTERNAL_ERROR'
      };
    }
    
    // Development environment can show more details
    return {
      success: false,
      error: error.message || 'An error occurred',
      code: error.code || 'UNKNOWN_ERROR'
    };
  }
}
```

### A06: Vulnerable and Outdated Components

#### Security Checklist
- [ ] **Dependency Scanning**: Regular vulnerability scanning of dependencies
- [ ] **Update Strategy**: Regular updates of packages and dependencies
- [ ] **Security Monitoring**: Automated alerts for security vulnerabilities
- [ ] **Component Inventory**: Maintain inventory of all components and versions

#### Recommended Tools & Processes
```json
// package.json security scripts
{
  "scripts": {
    "audit": "npm audit",
    "audit:fix": "npm audit fix",
    "security:check": "npm run audit && snyk test",
    "security:monitor": "snyk monitor",
    "outdated": "npm outdated"
  },
  "devDependencies": {
    "snyk": "^1.1290.0",
    "@security/audit": "^2.0.0"
  }
}
```

```typescript
// Automated security monitoring
export class SecurityMonitor {
  static async checkDependencies(): Promise<SecurityReport> {
    const vulnerabilities = await this.scanDependencies();
    const outdated = await this.checkOutdatedPackages();
    
    return {
      vulnerabilities: vulnerabilities.filter(v => v.severity === 'high'),
      outdatedPackages: outdated.filter(p => p.monthsBehind > 6),
      recommendations: this.generateRecommendations(vulnerabilities, outdated)
    };
  }
  
  static async generateSecurityReport(): Promise<void> {
    const report = await this.checkDependencies();
    
    if (report.vulnerabilities.length > 0) {
      await this.notifySecurityTeam(report);
    }
  }
}
```

### A07: Identification and Authentication Failures

#### Current Implementation ✅
- **Supabase Auth**: Industry-standard authentication
- **JWT Tokens**: Secure token-based sessions
- **Email Verification**: Account confirmation required

#### Security Checklist
- [x] **Strong Authentication**: Email verification required
- [ ] **Multi-Factor Authentication**: Implement 2FA for admin accounts
- [ ] **Session Management**: Secure session handling and cleanup
- [ ] **Password Policies**: Enforce strong password requirements
- [ ] **Account Lockout**: Implement account lockout after failed attempts

#### Recommended Enhancements
```typescript
// Enhanced authentication service
export class EnhancedAuthService {
  // Strong password validation
  static validatePassword(password: string): PasswordValidationResult {
    const requirements = {
      minLength: password.length >= 12,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumbers: /\d/.test(password),
      hasSpecialChars: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      notCommon: !this.isCommonPassword(password)
    };
    
    const score = Object.values(requirements).filter(Boolean).length;
    
    return {
      isValid: score >= 5,
      score,
      requirements,
      suggestions: this.getPasswordSuggestions(requirements)
    };
  }
  
  // Account lockout mechanism
  static async checkAccountLockout(email: string): Promise<boolean> {
    const attempts = await redis.get(`failed_attempts:${email}`);
    return attempts && parseInt(attempts) >= 5;
  }
  
  static async recordFailedAttempt(email: string): Promise<void> {
    const key = `failed_attempts:${email}`;
    const attempts = await redis.incr(key);
    
    if (attempts === 1) {
      await redis.expire(key, 3600); // 1 hour lockout
    }
    
    if (attempts >= 5) {
      await this.notifySecurityTeam(`Account lockout: ${email}`);
    }
  }
  
  // Session security
  static async validateSession(sessionToken: string): Promise<boolean> {
    const session = await redis.get(`session:${sessionToken}`);
    
    if (!session) return false;
    
    const sessionData = JSON.parse(session);
    const now = Date.now();
    
    // Check session expiry
    if (now > sessionData.expiresAt) {
      await redis.del(`session:${sessionToken}`);
      return false;
    }
    
    // Update last activity
    sessionData.lastActivity = now;
    await redis.setex(`session:${sessionToken}`, 3600, JSON.stringify(sessionData));
    
    return true;
  }
}
```

### A08: Software and Data Integrity Failures

#### Security Checklist
- [ ] **Code Signing**: Verify integrity of code deployments
- [ ] **Dependency Integrity**: Verify package integrity with checksums
- [ ] **CI/CD Security**: Secure deployment pipeline
- [ ] **Backup Integrity**: Verify backup integrity and restoration
- [ ] **Update Verification**: Verify authenticity of updates

#### Recommended Implementations
```typescript
// Integrity verification service
export class IntegrityService {
  // Verify file integrity with checksums
  static async verifyFileIntegrity(
    filePath: string, 
    expectedHash: string
  ): Promise<boolean> {
    const fileBuffer = await fs.readFile(filePath);
    const actualHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    return actualHash === expectedHash;
  }
  
  // Verify API response integrity
  static verifyApiResponse(response: any, signature: string): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', process.env.API_SECRET_KEY)
      .update(JSON.stringify(response))
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }
  
  // Database integrity checks
  static async performDataIntegrityCheck(): Promise<IntegrityReport> {
    const checksums = await this.calculateDataChecksums();
    const lastKnownChecksums = await this.getLastKnownChecksums();
    
    const issues = checksums.filter(current => {
      const previous = lastKnownChecksums.find(p => p.table === current.table);
      return previous && previous.checksum !== current.checksum;
    });
    
    return {
      passed: issues.length === 0,
      issues,
      timestamp: new Date().toISOString()
    };
  }
}
```

### A09: Security Logging and Monitoring Failures

#### Current Implementation ⚠️
- **Basic Logging**: Console logs and error tracking
- **No Security Monitoring**: Missing comprehensive security event logging

#### Security Checklist
- [ ] **Security Event Logging**: Log authentication, authorization, and security events
- [ ] **Log Integrity**: Protect logs from tampering
- [ ] **Real-time Monitoring**: Alert on suspicious activities
- [ ] **Log Analysis**: Regular analysis of security logs
- [ ] **Incident Response**: Automated incident response procedures

#### Recommended Implementation
```typescript
// Comprehensive security logging
export class SecurityLogger {
  static async logSecurityEvent(event: SecurityEvent): Promise<void> {
    const logEntry = {
      timestamp: new Date().toISOString(),
      eventType: event.type,
      userId: event.userId,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      action: event.action,
      resource: event.resource,
      outcome: event.outcome,
      riskScore: this.calculateRiskScore(event),
      metadata: event.metadata
    };
    
    // Store in secure logging system
    await this.storeSecurityLog(logEntry);
    
    // Real-time alerting for high-risk events
    if (logEntry.riskScore >= 8) {
      await this.triggerSecurityAlert(logEntry);
    }
  }
  
  static async analyzeSecurityLogs(): Promise<SecurityAnalysis> {
    const recentLogs = await this.getRecentSecurityLogs(24); // Last 24 hours
    
    return {
      suspiciousIPs: this.identifySuspiciousIPs(recentLogs),
      unusualPatterns: this.detectUnusualPatterns(recentLogs),
      authenticationFailures: this.analyzeAuthFailures(recentLogs),
      privilegeEscalations: this.detectPrivilegeEscalations(recentLogs),
      recommendations: this.generateSecurityRecommendations(recentLogs)
    };
  }
  
  // Real-time security monitoring
  static initializeSecurityMonitoring(): void {
    // Monitor for multiple failed logins
    this.monitorFailedLogins();
    
    // Monitor for unusual access patterns
    this.monitorAccessPatterns();
    
    // Monitor for privilege escalation attempts
    this.monitorPrivilegeEscalation();
    
    // Monitor for suspicious API usage
    this.monitorAPIUsage();
  }
}
```

### A10: Server-Side Request Forgery (SSRF)

#### Security Checklist
- [ ] **URL Validation**: Validate and sanitize user-provided URLs
- [ ] **Network Segmentation**: Restrict server network access
- [ ] **Allow Lists**: Use allow lists for external requests
- [ ] **Response Validation**: Validate responses from external services

#### Implementation
```typescript
// SSRF prevention service
export class SSRFPreventionService {
  private static readonly allowedDomains = [
    'api.github.com',
    'api.openai.com',
    'api.stripe.com',
    'hpfpuljthcngnswwfkrb.supabase.co'
  ];
  
  private static readonly blockedNetworks = [
    '127.0.0.0/8',    // Localhost
    '10.0.0.0/8',     // Private network
    '172.16.0.0/12',  // Private network
    '192.168.0.0/16', // Private network
    '169.254.0.0/16', // Link-local
    '::1/128',        // IPv6 localhost
    'fc00::/7'        // IPv6 private
  ];
  
  static async validateAndFetchURL(url: string): Promise<Response> {
    // Parse and validate URL
    const parsedUrl = new URL(url);
    
    // Check domain allow list
    if (!this.allowedDomains.includes(parsedUrl.hostname)) {
      throw new Error('Domain not allowed');
    }
    
    // Check for blocked networks
    if (await this.isBlockedNetwork(parsedUrl.hostname)) {
      throw new Error('Network access denied');
    }
    
    // Make request with timeout and size limits
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'CybernexAcademy/1.0'
        }
      });
      
      // Validate response size
      const contentLength = response.headers.get('content-length');
      if (contentLength && parseInt(contentLength) > 10485760) { // 10MB limit
        throw new Error('Response too large');
      }
      
      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }
  
  private static async isBlockedNetwork(hostname: string): Promise<boolean> {
    try {
      const address = await dns.promises.lookup(hostname);
      return this.blockedNetworks.some(network => 
        this.isIPInNetwork(address.address, network)
      );
    } catch {
      return true; // Block if DNS resolution fails
    }
  }
}
```

---

## Security Development Lifecycle

### Code Review Security Checklist

#### Authentication & Authorization
- [ ] Are all routes properly protected?
- [ ] Is user input validated and sanitized?
- [ ] Are permissions checked at both UI and API levels?
- [ ] Are session timeouts properly implemented?

#### Data Protection
- [ ] Is sensitive data encrypted in transit and at rest?
- [ ] Are database queries parameterized?
- [ ] Is personal data properly anonymized in logs?
- [ ] Are API keys and secrets stored securely?

#### Error Handling
- [ ] Do error messages avoid exposing sensitive information?
- [ ] Are all exceptions properly caught and handled?
- [ ] Is error logging comprehensive but secure?

#### Third-party Dependencies
- [ ] Are all dependencies up to date?
- [ ] Have security vulnerabilities been checked?
- [ ] Are only necessary permissions granted to third-party services?

### Security Testing

#### Automated Security Testing
```json
// GitHub Actions workflow for security testing
{
  "name": "Security Tests",
  "on": ["push", "pull_request"],
  "jobs": {
    "security": {
      "runs-on": "ubuntu-latest",
      "steps": [
        {
          "name": "Dependency Check",
          "run": "npm audit --audit-level=high"
        },
        {
          "name": "SAST Scan",
          "uses": "github/super-linter@v4",
          "env": {
            "DEFAULT_BRANCH": "main",
            "GITHUB_TOKEN": "${{ secrets.GITHUB_TOKEN }}"
          }
        },
        {
          "name": "Container Security Scan",
          "uses": "azure/container-scan@v0",
          "with": {
            "image-name": "cybernex-academy:latest"
          }
        }
      ]
    }
  }
}
```

#### Manual Security Testing Checklist
- [ ] **Authentication Bypass**: Attempt to access protected resources without authentication
- [ ] **Authorization Bypass**: Attempt to access resources without proper permissions
- [ ] **Input Validation**: Test with malicious inputs (XSS, SQL injection, etc.)
- [ ] **Session Management**: Test session timeout, fixation, and hijacking
- [ ] **Business Logic**: Test for business logic flaws and edge cases

### Incident Response Plan

#### Security Incident Classification
- **Critical**: Data breach, system compromise, service disruption
- **High**: Unauthorized access, privilege escalation, security control bypass
- **Medium**: Failed security monitoring, suspicious activity
- **Low**: Security policy violation, minor configuration issue

#### Response Procedures
1. **Detection**: Automated monitoring and manual reporting
2. **Analysis**: Determine scope and impact
3. **Containment**: Isolate affected systems
4. **Eradication**: Remove threats and vulnerabilities
5. **Recovery**: Restore systems and monitor
6. **Lessons Learned**: Document and improve

### Security Metrics & KPIs

#### Security Metrics to Track
- **Mean Time to Detection (MTTD)**: Average time to detect security incidents
- **Mean Time to Response (MTTR)**: Average time to respond to incidents
- **Vulnerability Management**: Time to patch known vulnerabilities
- **Security Test Coverage**: Percentage of code covered by security tests
- **Failed Authentication Rate**: Percentage of failed login attempts

---

This comprehensive security guide provides the foundation for secure development practices at Cybernex Academy. Regular reviews and updates ensure continued protection against evolving threats.