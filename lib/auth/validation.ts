/**
 * Enhanced Authentication Validation
 * Comprehensive validation for registration, login, and password security
 */

export interface ValidationError {
  field: string
  message: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

export interface RegistrationFormData {
  email: string
  password: string
  confirmPassword: string
  username: string
  fullName: string
}

export interface PasswordStrength {
  score: number // 0-4
  feedback: string[]
  isStrong: boolean
}

/**
 * Validate email format and domain
 */
export function validateEmail(email: string): ValidationError | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  if (!email) {
    return { field: 'email', message: 'Email is required' }
  }
  
  if (!emailRegex.test(email)) {
    return { field: 'email', message: 'Please enter a valid email address' }
  }
  
  if (email.length > 254) {
    return { field: 'email', message: 'Email address is too long' }
  }
  
  // Check for common disposable email domains
  const disposableDomains = [
    '10minutemail.com', 'tempmail.org', 'guerrillamail.com',
    'mailinator.com', 'throwaway.email', 'temp-mail.org'
  ]
  
  const domain = email.split('@')[1]?.toLowerCase()
  if (domain && disposableDomains.includes(domain)) {
    return { field: 'email', message: 'Please use a permanent email address' }
  }
  
  return null
}

/**
 * Validate username format and availability
 */
export function validateUsername(username: string): ValidationError | null {
  if (!username) {
    return { field: 'username', message: 'Username is required' }
  }
  
  if (username.length < 3) {
    return { field: 'username', message: 'Username must be at least 3 characters long' }
  }
  
  if (username.length > 30) {
    return { field: 'username', message: 'Username must be less than 30 characters' }
  }
  
  // Allow letters, numbers, underscores, and hyphens
  const usernameRegex = /^[a-zA-Z0-9_-]+$/
  if (!usernameRegex.test(username)) {
    return { field: 'username', message: 'Username can only contain letters, numbers, underscores, and hyphens' }
  }
  
  // Check for reserved usernames
  const reservedUsernames = [
    'admin', 'administrator', 'root', 'api', 'www', 'mail', 'ftp',
    'support', 'help', 'info', 'contact', 'about', 'terms', 'privacy',
    'cybernex', 'academy', 'null', 'undefined', 'test', 'demo'
  ]
  
  if (reservedUsernames.includes(username.toLowerCase())) {
    return { field: 'username', message: 'This username is reserved and cannot be used' }
  }
  
  return null
}

/**
 * Validate full name
 */
export function validateFullName(fullName: string): ValidationError | null {
  if (!fullName) {
    return { field: 'fullName', message: 'Full name is required' }
  }
  
  if (fullName.length < 2) {
    return { field: 'fullName', message: 'Full name must be at least 2 characters long' }
  }
  
  if (fullName.length > 100) {
    return { field: 'fullName', message: 'Full name must be less than 100 characters' }
  }
  
  // Allow letters, spaces, hyphens, and apostrophes
  const nameRegex = /^[a-zA-Z\s'-]+$/
  if (!nameRegex.test(fullName)) {
    return { field: 'fullName', message: 'Full name can only contain letters, spaces, hyphens, and apostrophes' }
  }
  
  return null
}

/**
 * Comprehensive password strength validation
 */
export function validatePasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = []
  let score = 0
  
  if (!password) {
    return {
      score: 0,
      feedback: ['Password is required'],
      isStrong: false
    }
  }
  
  // Length check
  if (password.length < 8) {
    feedback.push('Password must be at least 8 characters long')
  } else if (password.length >= 8) {
    score += 1
  }
  
  if (password.length >= 12) {
    score += 1
  }
  
  // Character variety checks
  const hasLowercase = /[a-z]/.test(password)
  const hasUppercase = /[A-Z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  
  if (hasLowercase) score += 0.5
  if (hasUppercase) score += 0.5
  if (hasNumbers) score += 0.5
  if (hasSpecialChars) score += 0.5
  
  if (!hasLowercase) feedback.push('Add lowercase letters')
  if (!hasUppercase) feedback.push('Add uppercase letters')
  if (!hasNumbers) feedback.push('Add numbers')
  if (!hasSpecialChars) feedback.push('Add special characters (!@#$%^&*)')
  
  // Common password checks
  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123',
    'password123', 'admin', 'letmein', 'welcome', 'monkey',
    'dragon', 'master', 'shadow', 'superman', 'michael'
  ]
  
  if (commonPasswords.includes(password.toLowerCase())) {
    feedback.push('Avoid common passwords')
    score = Math.max(0, score - 2)
  }
  
  // Sequential characters check
  const hasSequential = /(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|123|234|345|456|567|678|789)/i.test(password)
  if (hasSequential) {
    feedback.push('Avoid sequential characters')
    score = Math.max(0, score - 0.5)
  }
  
  // Repeated characters check
  const hasRepeated = /(.)\1{2,}/.test(password)
  if (hasRepeated) {
    feedback.push('Avoid repeated characters')
    score = Math.max(0, score - 0.5)
  }
  
  // Normalize score to 0-4 range
  score = Math.min(4, Math.max(0, score))
  
  if (feedback.length === 0) {
    if (score >= 4) {
      feedback.push('Excellent password strength!')
    } else if (score >= 3) {
      feedback.push('Good password strength')
    } else if (score >= 2) {
      feedback.push('Fair password strength')
    }
  }
  
  return {
    score: Math.round(score),
    feedback,
    isStrong: score >= 3 && password.length >= 8
  }
}

/**
 * Validate password confirmation
 */
export function validatePasswordConfirmation(
  password: string,
  confirmPassword: string
): ValidationError | null {
  if (!confirmPassword) {
    return { field: 'confirmPassword', message: 'Please confirm your password' }
  }
  
  if (password !== confirmPassword) {
    return { field: 'confirmPassword', message: 'Passwords do not match' }
  }
  
  return null
}

/**
 * Comprehensive registration form validation
 */
export function validateRegistrationForm(data: RegistrationFormData): ValidationResult {
  const errors: ValidationError[] = []
  
  // Validate each field
  const emailError = validateEmail(data.email)
  if (emailError) errors.push(emailError)
  
  const usernameError = validateUsername(data.username)
  if (usernameError) errors.push(usernameError)
  
  const fullNameError = validateFullName(data.fullName)
  if (fullNameError) errors.push(fullNameError)
  
  const passwordStrength = validatePasswordStrength(data.password)
  if (!passwordStrength.isStrong) {
    errors.push({
      field: 'password',
      message: passwordStrength.feedback.join('. ')
    })
  }
  
  const confirmPasswordError = validatePasswordConfirmation(data.password, data.confirmPassword)
  if (confirmPasswordError) errors.push(confirmPasswordError)
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validate login form
 */
export function validateLoginForm(email: string, password: string): ValidationResult {
  const errors: ValidationError[] = []
  
  const emailError = validateEmail(email)
  if (emailError) errors.push(emailError)
  
  if (!password) {
    errors.push({ field: 'password', message: 'Password is required' })
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Rate limiting validation
 */
export class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map()
  
  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 15 * 60 * 1000 // 15 minutes
  ) {}
  
  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const record = this.attempts.get(identifier)
    
    if (!record || now > record.resetTime) {
      this.attempts.set(identifier, { count: 1, resetTime: now + this.windowMs })
      return true
    }
    
    if (record.count >= this.maxAttempts) {
      return false
    }
    
    record.count++
    return true
  }
  
  getRemainingTime(identifier: string): number {
    const record = this.attempts.get(identifier)
    if (!record) return 0
    
    const remaining = record.resetTime - Date.now()
    return Math.max(0, remaining)
  }
  
  reset(identifier: string): void {
    this.attempts.delete(identifier)
  }
}

// Export singleton rate limiter instances
export const authRateLimiter = new RateLimiter(5, 15 * 60 * 1000) // 5 attempts per 15 minutes
export const passwordResetRateLimiter = new RateLimiter(3, 60 * 60 * 1000) // 3 attempts per hour