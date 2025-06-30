export interface ValidationError {
  field: string
  message: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

export function validateEmail(email: string): ValidationResult {
  const errors: ValidationError[] = []
  
  if (!email) {
    errors.push({ field: 'email', message: 'Email is required' })
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push({ field: 'email', message: 'Please enter a valid email address' })
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validatePassword(password: string): ValidationResult {
  const errors: ValidationError[] = []
  
  if (!password) {
    errors.push({ field: 'password', message: 'Password is required' })
  } else {
    // Minimum length requirement
    if (password.length < 12) {
      errors.push({ field: 'password', message: 'Password must be at least 12 characters long' })
    }
    
    // Maximum length for security
    if (password.length > 128) {
      errors.push({ field: 'password', message: 'Password must be less than 128 characters' })
    }
    
    // Character requirements
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push({ field: 'password', message: 'Password must contain at least one lowercase letter' })
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push({ field: 'password', message: 'Password must contain at least one uppercase letter' })
    }
    if (!/(?=.*\d)/.test(password)) {
      errors.push({ field: 'password', message: 'Password must contain at least one number' })
    }
    if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password)) {
      errors.push({ field: 'password', message: 'Password must contain at least one special character' })
    }
    
    // Common password patterns to avoid
    const commonPatterns = [
      /(.)\1{2,}/, // Repeated characters (aaa, 111, etc.)
      /012|123|234|345|456|567|678|789|890/, // Sequential numbers
      /abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz/i, // Sequential letters
      /password|admin|user|login|cybernex/i, // Common words
      /qwerty|asdf|zxcv/i // Keyboard patterns
    ]
    
    for (const pattern of commonPatterns) {
      if (pattern.test(password)) {
        errors.push({ field: 'password', message: 'Password contains common patterns that are easily guessed' })
        break
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export function getPasswordStrength(password: string): {
  score: number // 0-4
  feedback: string[]
  color: string
} {
  const feedback: string[] = []
  let score = 0
  
  if (password.length >= 12) score++
  if (/(?=.*[a-z])/.test(password)) score++
  if (/(?=.*[A-Z])/.test(password)) score++
  if (/(?=.*\d)/.test(password)) score++
  if (/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password)) score++
  
  // Additional strength factors
  if (password.length >= 16) score = Math.min(score + 0.5, 5)
  if (/(?=.*[a-z].*[a-z])/.test(password)) score = Math.min(score + 0.2, 5)
  if (/(?=.*[A-Z].*[A-Z])/.test(password)) score = Math.min(score + 0.2, 5)
  if (/(?=.*\d.*\d)/.test(password)) score = Math.min(score + 0.2, 5)
  
  // Penalties for common patterns
  if (/(.)\1{2,}/.test(password)) score = Math.max(score - 1, 0)
  if (/012|123|234|345|456|567|678|789|890/.test(password)) score = Math.max(score - 1, 0)
  
  score = Math.min(Math.floor(score), 4)
  
  if (score === 0) {
    feedback.push('Very weak - needs major improvements')
    return { score, feedback, color: 'red' }
  } else if (score === 1) {
    feedback.push('Weak - add more character types and length')
    return { score, feedback, color: 'red' }
  } else if (score === 2) {
    feedback.push('Fair - consider adding more characters')
    return { score, feedback, color: 'orange' }
  } else if (score === 3) {
    feedback.push('Good - strong password')
    return { score, feedback, color: 'yellow' }
  } else {
    feedback.push('Excellent - very strong password')
    return { score, feedback, color: 'green' }
  }
}

export function validatePasswordConfirmation(password: string, confirmPassword: string): ValidationResult {
  const errors: ValidationError[] = []
  
  if (!confirmPassword) {
    errors.push({ field: 'confirmPassword', message: 'Please confirm your password' })
  } else if (password !== confirmPassword) {
    errors.push({ field: 'confirmPassword', message: 'Passwords do not match' })
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validateUsername(username: string): ValidationResult {
  const errors: ValidationError[] = []
  
  if (!username) {
    errors.push({ field: 'username', message: 'Username is required' })
  } else {
    if (username.length < 3) {
      errors.push({ field: 'username', message: 'Username must be at least 3 characters long' })
    }
    if (username.length > 30) {
      errors.push({ field: 'username', message: 'Username must be less than 30 characters' })
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      errors.push({ field: 'username', message: 'Username can only contain letters, numbers, hyphens, and underscores' })
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validateFullName(fullName: string): ValidationResult {
  const errors: ValidationError[] = []
  
  if (!fullName || !fullName.trim()) {
    errors.push({ field: 'fullName', message: 'Full name is required' })
  } else if (fullName.trim().length < 2) {
    errors.push({ field: 'fullName', message: 'Full name must be at least 2 characters long' })
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validateRegistrationForm(formData: {
  email: string
  password: string
  confirmPassword: string
  username: string
  fullName: string
}): ValidationResult {
  const allErrors: ValidationError[] = []
  
  const emailValidation = validateEmail(formData.email)
  const passwordValidation = validatePassword(formData.password)
  const passwordConfirmValidation = validatePasswordConfirmation(formData.password, formData.confirmPassword)
  const usernameValidation = validateUsername(formData.username)
  const fullNameValidation = validateFullName(formData.fullName)
  
  allErrors.push(...emailValidation.errors)
  allErrors.push(...passwordValidation.errors)
  allErrors.push(...passwordConfirmValidation.errors)
  allErrors.push(...usernameValidation.errors)
  allErrors.push(...fullNameValidation.errors)
  
  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  }
}

export function validateLoginForm(formData: {
  email: string
  password: string
}): ValidationResult {
  const allErrors: ValidationError[] = []
  
  const emailValidation = validateEmail(formData.email)
  allErrors.push(...emailValidation.errors)
  
  if (!formData.password) {
    allErrors.push({ field: 'password', message: 'Password is required' })
  }
  
  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  }
}