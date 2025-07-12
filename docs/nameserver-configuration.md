# Nameserver Configuration Guide

## Understanding Nameservers vs DNS Records

### What Are Nameservers?
Nameservers are like the "phone book" of the internet. They tell the world which DNS provider is responsible for managing your domain's DNS records.

### The Mistake You Made
You created DNS records **within** your current DNS zone, but what Vercel needs is for you to **delegate** your entire DNS zone to them.

## Correct Nameserver Setup

### What Nameservers Should Be Set To:
- **ns1.vercel-dns.com**
- **ns2.vercel-dns.com**

### Where to Set Nameservers
**At your domain registrar** (not in DNS records). Common registrars:

#### GoDaddy
1. Log into GoDaddy account
2. Go to "My Products" → "Domains"
3. Click on your domain
4. Find "Nameservers" section
5. Change to "Custom" nameservers
6. Enter Vercel's nameservers

#### Namecheap
1. Log into Namecheap account
2. Go to "Domain List"
3. Click "Manage" next to your domain
4. Find "Nameservers" section
5. Select "Custom DNS"
6. Enter Vercel's nameservers

#### Cloudflare (if registered through them)
1. Log into Cloudflare dashboard
2. Select your domain
3. Go to "DNS" tab
4. Look for "Nameservers" section
5. Update to Vercel's nameservers

#### Other Registrars
The process is similar - look for "Nameservers," "DNS Settings," or "Name Server Management" in your registrar's control panel.

## What Happens After Nameserver Change

### 1. DNS Propagation (24-48 hours)
- Old DNS records will stop working
- Vercel takes control of DNS management
- Your website may be temporarily inaccessible

### 2. Vercel Takes Over
- Vercel automatically creates A/AAAA records for your domain
- SSL certificate is automatically provisioned
- You manage DNS through Vercel dashboard

### 3. Re-add Preserved Records
- Add back your Google verification
- Add back DMARC policy
- Add back ProtonMail DKIM

## Verification

### Check Nameserver Propagation
```bash
# Check if nameservers have propagated
dig yourdomain.com NS

# Should return:
# yourdomain.com. IN NS ns1.vercel-dns.com.
# yourdomain.com. IN NS ns2.vercel-dns.com.
```

### Online Tools
- [WhatsMyDNS.net](https://whatsmydns.net/) - Check global propagation
- [DNS Checker](https://dnschecker.org/) - Multiple location checks

## Common Nameserver Mistakes

❌ **Wrong**: Creating A/CNAME records for nameservers
✅ **Correct**: Updating nameserver settings at registrar

❌ **Wrong**: Setting nameservers in DNS records section
✅ **Correct**: Setting nameservers in domain management section

❌ **Wrong**: Mixing nameservers from different providers
✅ **Correct**: Using only Vercel's nameservers

## Rollback Plan

If something goes wrong, you can always change nameservers back to your original DNS provider and restore the backed-up DNS records.

### Steps to Rollback:
1. Change nameservers back to original provider
2. Wait for propagation
3. Re-add all original DNS records
4. Test functionality

## Next Steps

After nameservers propagate:
1. Verify domain works in browser
2. Check Vercel dashboard shows domain as active
3. Re-add preserved DNS records
4. Test email functionality
5. Verify SSL certificate is working