# API Documentation Guide

## Overview

This document contains comprehensive API documentation for the CyberNex Academy platform, including endpoint specifications, authentication, and integration guides.

## Contents

- [API Overview](./api-conventions-standards.md) - General API information and conventions
- [Authentication](./authentication-authorization-guide.md) - Authentication and authorization methods
- [News Feed API](./news-feed-endpoints.md) - Real-time threat intelligence endpoints
- [User Management API](./user-management-endpoints.md) - User profiles and preferences
- [Resource Management API](./resource-management-endpoints.md) - Content and resource endpoints
- [Analytics API](./analytics-tracking-endpoints.md) - User activity and platform metrics
- [External Integrations](./external-api-integrations.md) - Third-party API integrations
- [Rate Limiting](./rate-limiting-policies.md) - API usage limits and throttling
- [Error Handling](./error-response-formats.md) - Error codes and response formats

## API Base URL

```
Production: https://cybernexacademy.com/api
Development: http://localhost:3000/api
```

## Authentication

All authenticated endpoints require a valid JWT token in the Authorization header:

```http
Authorization: Bearer <jwt_token>
```

## Standard Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z",
    "requestId": "req_123456789"
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {
      // Additional error context
    }
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z",
    "requestId": "req_123456789"
  }
}
```

## Core API Endpoints

### News Feed API
```http
GET /api/news/live-feed          # Get latest threat intelligence
GET /api/news/sources            # Get configured news sources
GET /api/news/categories         # Get news categories
POST /api/news/sync              # Trigger manual news sync (admin)
```

### User Management API
```http
GET /api/users/profile           # Get user profile
PUT /api/users/profile           # Update user profile
GET /api/users/preferences       # Get user preferences
PUT /api/users/preferences       # Update user preferences
GET /api/users/activity          # Get user activity history
```

### Resource Management API
```http
GET /api/resources               # Get resources with filtering
GET /api/resources/:id           # Get specific resource
POST /api/resources/:id/bookmark # Bookmark a resource
DELETE /api/resources/:id/bookmark # Remove bookmark
GET /api/resources/search        # Search resources
```

### Analytics API
```http
GET /api/analytics/dashboard     # Get dashboard statistics
GET /api/analytics/user-stats    # Get user-specific statistics
POST /api/analytics/events       # Track user events
GET /api/analytics/popular       # Get popular content
```

## Rate Limiting

### Default Limits
- **Authenticated users**: 1000 requests per hour
- **Anonymous users**: 100 requests per hour
- **Search endpoints**: 60 requests per minute
- **Analytics endpoints**: 300 requests per hour

### Rate Limit Headers
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## External API Integrations

### NIST NVD API
- **Rate Limit**: 5 requests per 30 seconds
- **Caching**: 2 hours
- **Fallback**: Cached data if API unavailable

### RSS Feeds
- **Update Frequency**: Every 30 minutes
- **Sources**: 8 major cybersecurity blogs
- **Caching**: 30 minutes

### HackerNews API
- **Update Frequency**: Every hour
- **Filtering**: Security-related keywords
- **Caching**: 1 hour

## Security Measures

### Input Validation
- All inputs validated using Zod schemas
- SQL injection prevention with parameterized queries
- XSS prevention with content sanitization

### Authentication Security
- JWT tokens with 24-hour expiration
- Refresh token rotation
- Session invalidation on logout

### API Security
- CORS configuration for allowed origins
- Request size limits (1MB for most endpoints)
- IP-based rate limiting
- Request logging for security monitoring

## Error Codes

### Authentication Errors (401)
- `AUTH_TOKEN_MISSING`: No authorization token provided
- `AUTH_TOKEN_INVALID`: Invalid or expired token
- `AUTH_TOKEN_EXPIRED`: Token has expired

### Authorization Errors (403)
- `INSUFFICIENT_PERMISSIONS`: User lacks required permissions
- `SUBSCRIPTION_REQUIRED`: Premium subscription required
- `ACCOUNT_SUSPENDED`: User account is suspended

### Validation Errors (400)
- `INVALID_INPUT`: Request data validation failed
- `MISSING_REQUIRED_FIELD`: Required field not provided
- `INVALID_FORMAT`: Data format is incorrect

### Rate Limiting Errors (429)
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `QUOTA_EXCEEDED`: API quota exceeded

### Server Errors (500)
- `INTERNAL_ERROR`: Unexpected server error
- `DATABASE_ERROR`: Database operation failed
- `EXTERNAL_API_ERROR`: External service unavailable

## API Versioning

### Current Version: v1
- All endpoints prefixed with `/api/v1/`
- Backward compatibility maintained for 12 months
- Deprecation notices provided 6 months in advance

### Version Headers
```http
API-Version: v1
Accept-Version: v1
```

## Testing and Development

### API Testing
- Comprehensive test suite with Jest
- Integration tests for all endpoints
- Mock external API responses
- Performance testing for high-load scenarios

### Development Tools
- OpenAPI/Swagger documentation
- Postman collection for manual testing
- API client SDKs for common languages
- Development sandbox environment

## Monitoring and Analytics

### API Metrics
- Request/response times
- Error rates by endpoint
- Usage patterns and trends
- Geographic distribution of requests

### Alerting
- High error rates (>5%)
- Slow response times (>2 seconds)
- Rate limit violations
- External API failures

---

For detailed endpoint specifications and examples, refer to the individual API documentation files in this section.