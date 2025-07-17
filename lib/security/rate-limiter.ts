/**
 * Advanced Rate Limiting System
 * Implements multiple rate limiting strategies for different endpoints
 */

import { NextRequest } from 'next/server'

export interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  skipSuccessfulRequests?: boolean // Don't count successful requests
  skipFailedRequests?: boolean // Don't count failed requests
  keyGenerator?: (req: NextRequest) => string // Custom key generator
  onLimitReached?: (key: string) => void // Callback when limit is reached
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
  retryAfter?: number
}

export class RateLimiter {
  private store: Map<string, { count: number; resetTime: number; failures: number }> = new Map()
  private config: Required<RateLimitConfig>

  constructor(config: RateLimitConfig) {
    this.config = {
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      keyGenerator: this.defaultKeyGenerator,
      onLimitReached: () => {},
      ...config
    }

    // Clean up expired entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000)
  }

  private defaultKeyGenerator(req: NextRequest): string {
    // Use IP address as default key
    const forwarded = req.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : req.ip || 'unknown'
    return ip
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, data] of this.store.entries()) {
      if (now > data.resetTime) {
        this.store.delete(key)
      }
    }
  }

  async checkLimit(req: NextRequest, success?: boolean): Promise<RateLimitResult> {
    const key = this.config.keyGenerator(req)
    const now = Date.now()
    
    let record = this.store.get(key)
    
    // Initialize or reset if window expired
    if (!record || now > record.resetTime) {
      record = {
        count: 0,
        resetTime: now + this.config.windowMs,
        failures: 0
      }
      this.store.set(key, record)
    }

    // Check if we should count this request
    const shouldCount = (
      (success === undefined) || // Always count if success is not specified
      (success && !this.config.skipSuccessfulRequests) ||
      (!success && !this.config.skipFailedRequests)
    )

    if (shouldCount) {
      record.count++
      if (success === false) {
        record.failures++
      }
    }

    const allowed = record.count <= this.config.maxRequests
    const remaining = Math.max(0, this.config.maxRequests - record.count)
    
    if (!allowed) {
      this.config.onLimitReached(key)
    }

    return {
      allowed,
      remaining,
      resetTime: record.resetTime,
      retryAfter: allowed ? undefined : Math.ceil((record.resetTime - now) / 1000)
    }
  }

  reset(key: string): void {
    this.store.delete(key)
  }

  getStats(key: string): { count: number; failures: number; resetTime: number } | null {
    return this.store.get(key) || null
  }
}

// Predefined rate limiters for different use cases
export const rateLimiters = {
  // Authentication endpoints - strict limits
  auth: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    skipSuccessfulRequests: true, // Only count failed attempts
    onLimitReached: (key) => console.warn(`Auth rate limit exceeded for ${key}`)
  }),

  // Password reset - very strict
  passwordReset: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
    onLimitReached: (key) => console.warn(`Password reset rate limit exceeded for ${key}`)
  }),

  // API endpoints - moderate limits
  api: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
    onLimitReached: (key) => console.warn(`API rate limit exceeded for ${key}`)
  }),

  // Search endpoints - higher limits but still controlled
  search: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30,
    onLimitReached: (key) => console.warn(`Search rate limit exceeded for ${key}`)
  }),

  // File upload - strict limits
  upload: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
    onLimitReached: (key) => console.warn(`Upload rate limit exceeded for ${key}`)
  }),

  // Contact/feedback forms
  contact: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 5,
    onLimitReached: (key) => console.warn(`Contact form rate limit exceeded for ${key}`)
  })
}

/**
 * Advanced rate limiter with sliding window
 */
export class SlidingWindowRateLimiter {
  private requests: Map<string, number[]> = new Map()

  constructor(
    private maxRequests: number,
    private windowMs: number
  ) {
    // Cleanup old entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000)
  }

  private cleanup(): void {
    const cutoff = Date.now() - this.windowMs
    for (const [key, timestamps] of this.requests.entries()) {
      const filtered = timestamps.filter(ts => ts > cutoff)
      if (filtered.length === 0) {
        this.requests.delete(key)
      } else {
        this.requests.set(key, filtered)
      }
    }
  }

  checkLimit(key: string): RateLimitResult {
    const now = Date.now()
    const cutoff = now - this.windowMs
    
    let timestamps = this.requests.get(key) || []
    
    // Remove old timestamps
    timestamps = timestamps.filter(ts => ts > cutoff)
    
    // Add current request
    timestamps.push(now)
    this.requests.set(key, timestamps)
    
    const allowed = timestamps.length <= this.maxRequests
    const remaining = Math.max(0, this.maxRequests - timestamps.length)
    
    // Calculate when the oldest request will expire
    const oldestRequest = timestamps[0]
    const resetTime = oldestRequest + this.windowMs
    
    return {
      allowed,
      remaining,
      resetTime,
      retryAfter: allowed ? undefined : Math.ceil((resetTime - now) / 1000)
    }
  }
}

/**
 * Distributed rate limiter using Redis (for production)
 */
export class RedisRateLimiter {
  constructor(
    private redis: any, // Redis client
    private keyPrefix: string = 'rate_limit:'
  ) {}

  async checkLimit(
    key: string,
    maxRequests: number,
    windowMs: number
  ): Promise<RateLimitResult> {
    const redisKey = `${this.keyPrefix}${key}`
    const now = Date.now()
    const windowStart = now - windowMs

    try {
      // Use Redis pipeline for atomic operations
      const pipeline = this.redis.pipeline()
      
      // Remove expired entries
      pipeline.zremrangebyscore(redisKey, 0, windowStart)
      
      // Count current requests in window
      pipeline.zcard(redisKey)
      
      // Add current request
      pipeline.zadd(redisKey, now, `${now}-${Math.random()}`)
      
      // Set expiration
      pipeline.expire(redisKey, Math.ceil(windowMs / 1000))
      
      const results = await pipeline.exec()
      const count = results[1][1] + 1 // +1 for the request we just added
      
      const allowed = count <= maxRequests
      const remaining = Math.max(0, maxRequests - count)
      const resetTime = now + windowMs
      
      return {
        allowed,
        remaining,
        resetTime,
        retryAfter: allowed ? undefined : Math.ceil(windowMs / 1000)
      }
    } catch (error) {
      console.error('Redis rate limiter error:', error)
      // Fallback to allowing the request if Redis fails
      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetTime: now + windowMs
      }
    }
  }
}

/**
 * Rate limiting middleware factory
 */
export function createRateLimitMiddleware(limiter: RateLimiter) {
  return async (req: NextRequest) => {
    const result = await limiter.checkLimit(req)
    
    if (!result.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Too many requests',
          retryAfter: result.retryAfter
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': result.retryAfter?.toString() || '60',
            'X-RateLimit-Limit': limiter['config'].maxRequests.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': new Date(result.resetTime).toISOString()
          }
        }
      )
    }

    return null // Allow request to continue
  }
}

/**
 * IP-based rate limiting with geolocation awareness
 */
export class GeoRateLimiter extends RateLimiter {
  private suspiciousCountries = new Set(['CN', 'RU', 'KP', 'IR']) // Example suspicious countries
  private vpnRanges = new Set([
    // Add known VPN/proxy IP ranges
    '10.0.0.0/8',
    '172.16.0.0/12',
    '192.168.0.0/16'
  ])

  constructor(config: RateLimitConfig) {
    super(config)
  }

  async checkLimitWithGeo(req: NextRequest, geoData?: { country?: string; isVpn?: boolean }): Promise<RateLimitResult> {
    let adjustedConfig = { ...this.config }

    // Apply stricter limits for suspicious countries or VPNs
    if (geoData?.country && this.suspiciousCountries.has(geoData.country)) {
      adjustedConfig.maxRequests = Math.floor(adjustedConfig.maxRequests * 0.5)
    }

    if (geoData?.isVpn) {
      adjustedConfig.maxRequests = Math.floor(adjustedConfig.maxRequests * 0.3)
    }

    // Temporarily override config
    const originalConfig = this.config
    Object.assign(this.config, adjustedConfig)
    
    const result = await this.checkLimit(req)
    
    // Restore original config
    Object.assign(this.config, originalConfig)
    
    return result
  }
}

/**
 * Adaptive rate limiter that adjusts based on system load
 */
export class AdaptiveRateLimiter extends RateLimiter {
  private systemLoad = 0
  private lastLoadCheck = 0
  private loadCheckInterval = 30000 // 30 seconds

  constructor(config: RateLimitConfig) {
    super(config)
  }

  private async getSystemLoad(): Promise<number> {
    const now = Date.now()
    if (now - this.lastLoadCheck > this.loadCheckInterval) {
      try {
        // In a real implementation, you'd check actual system metrics
        // For now, we'll simulate based on active connections
        const activeConnections = this.store.size
        this.systemLoad = Math.min(1, activeConnections / 1000)
        this.lastLoadCheck = now
      } catch (error) {
        console.error('Failed to get system load:', error)
      }
    }
    return this.systemLoad
  }

  async checkAdaptiveLimit(req: NextRequest): Promise<RateLimitResult> {
    const load = await this.getSystemLoad()
    
    // Reduce limits when system is under high load
    const loadFactor = 1 - (load * 0.5) // Reduce by up to 50% under full load
    const adjustedMaxRequests = Math.floor(this.config.maxRequests * loadFactor)
    
    // Temporarily adjust config
    const originalMax = this.config.maxRequests
    this.config.maxRequests = Math.max(1, adjustedMaxRequests)
    
    const result = await this.checkLimit(req)
    
    // Restore original config
    this.config.maxRequests = originalMax
    
    return result
  }
}