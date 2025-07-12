# Fix: www.cybernexacademy.com DNS Issue

## The Problem
You're getting `DNS_PROBE_POSSIBLE` for `www.cybernexacademy.com` because there's no DNS record for the `www` subdomain.

## Current Status
- ✅ `cybernexacademy.com` (root domain) - has A records
- ❌ `www.cybernexacademy.com` (www subdomain) - missing DNS records

## The Fix: Add www CNAME Record

### In Your Vercel Dashboard:
1. Go to your project Settings → Domains → DNS Records
2. Click "Add Record"
3. Add a CNAME record:
   - **Type**: CNAME
   - **Name**: `www`
   - **Value**: `cybernexacademy.com` (your root domain)
   - **TTL**: 60 (default)
4. Save the record

## Alternative: Add www as a Domain in Vercel

### Option 1: Automatic Redirect Setup
1. Go to Project Settings → Domains
2. Add `www.cybernexacademy.com` as an additional domain
3. Vercel will automatically:
   - Create the necessary DNS records
   - Set up redirect from www to non-www (or vice versa)
   - Handle SSL certificate for both

### Option 2: Manual CNAME (Simpler)
Just add the CNAME record as described above.

## Expected Result
After adding the CNAME record:
- `www.cybernexacademy.com` will resolve
- Both `cybernexacademy.com` and `www.cybernexacademy.com` will work
- SSL certificate will cover both domains

## Verification
After making the change, test both:
```bash
# Test root domain
dig cybernexacademy.com A

# Test www subdomain  
dig www.cybernexacademy.com CNAME
```

Both should resolve properly within a few minutes of adding the CNAME record.