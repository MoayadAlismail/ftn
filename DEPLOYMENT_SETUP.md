# 🚀 FTN-Find Deployment Setup Checklist

This comprehensive guide covers everything you need to set up FTN-Find for production deployment.

## 📋 Pre-Deployment Checklist

### ✅ 1. Supabase Configuration

#### Database Setup
- [ ] Create Supabase project
- [ ] Run database schema from `SUPABASE_SCHEMA_CHANGES.md`
- [ ] Run talent features schema from `SUPABASE_TALENT_SETUP.md`
- [ ] Configure Row Level Security (RLS) policies
- [ ] Set up database indexes for performance
- [ ] Create database functions and triggers

#### Authentication Setup
- [ ] Configure OAuth providers (follow `SUPABASE_AUTH_SETUP.md`)
  - [ ] Google OAuth
  - [ ] LinkedIn OAuth
  - [ ] GitHub OAuth (talents only)
- [ ] Set up custom email templates
- [ ] Configure SMTP settings for auth emails
- [ ] Set session timeouts and security policies

#### Storage Setup
- [ ] Create 'resumes' bucket
- [ ] Configure bucket policies for file access
- [ ] Set file size limits (recommended: 10MB for resumes)
- [ ] Configure allowed file types (.pdf, .doc, .docx)

### ✅ 2. Environment Variables

Create `.env.local` file with all required variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# OAuth Configuration (from Supabase dashboard)
# These are managed in Supabase, not needed in env unless custom implementation

# Payment Processing
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_... # or pk_test_... for testing
STRIPE_SECRET_KEY=sk_live_... # or sk_test_... for testing
STRIPE_WEBHOOK_SECRET=whsec_...

# STC Pay (Saudi Arabia)
STC_PAY_MERCHANT_ID=your_merchant_id
STC_PAY_API_KEY=your_api_key
STC_PAY_WEBHOOK_SECRET=your_webhook_secret

# Apple Pay
APPLE_PAY_MERCHANT_ID=merchant.your-domain.com

# Calendly Integration
CALENDLY_API_TOKEN=your_personal_access_token
CALENDLY_EVENT_TYPE_UUID=your_consultation_event_uuid
CALENDLY_WEBHOOK_SECRET=your_webhook_secret

# Email Service (Optional - for notifications)
EMAIL_SERVICE_API_KEY=your_sendgrid_or_ses_key
EMAIL_FROM_ADDRESS=noreply@your-domain.com

# Analytics (Optional)
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID

# Error Tracking (Optional)
SENTRY_DSN=your_sentry_dsn
```

### ✅ 3. Third-Party Service Setup

#### Stripe Configuration
1. **Create Stripe Account**
   - [ ] Sign up at https://dashboard.stripe.com
   - [ ] Complete business verification
   - [ ] Get API keys from Dashboard > API keys

2. **Configure Stripe Settings**
   - [ ] Set up webhook endpoints
   - [ ] Configure payment methods (cards, Apple Pay)
   - [ ] Set up product catalog for application fees
   - [ ] Configure tax settings if applicable

3. **Webhook Endpoints** (for your domain)
   ```
   https://your-domain.com/api/webhooks/stripe
   ```
   
   **Events to listen for:**
   - [ ] `payment_intent.succeeded`
   - [ ] `payment_intent.payment_failed`
   - [ ] `invoice.payment_succeeded`
   - [ ] `invoice.payment_failed`

#### STC Pay Setup (Saudi Arabia)
1. **STC Pay Merchant Account**
   - [ ] Register at STC Pay merchant portal
   - [ ] Complete merchant verification
   - [ ] Get API credentials

2. **Configure STC Pay**
   - [ ] Set up webhook URL: `https://your-domain.com/api/webhooks/stc-pay`
   - [ ] Configure payment flows
   - [ ] Test payment integration

#### Calendly Integration
1. **Calendly Account Setup**
   - [ ] Create Calendly account
   - [ ] Set up consultation event type (30 minutes)
   - [ ] Configure availability and scheduling preferences

2. **API Configuration**
   - [ ] Generate Personal Access Token
   - [ ] Get Event Type UUID from event settings
   - [ ] Set up webhook endpoint: `https://your-domain.com/api/webhooks/calendly`

3. **Webhook Events**
   - [ ] `invitee.created` - Meeting scheduled
   - [ ] `invitee.canceled` - Meeting canceled
   - [ ] `invitee_no_show.created` - No-show tracking

### ✅ 4. OAuth Provider Setup

#### Google OAuth
1. **Google Cloud Console**
   - [ ] Create project at https://console.cloud.google.com
   - [ ] Enable Google+ API
   - [ ] Create OAuth 2.0 credentials

2. **Configuration**
   ```
   Authorized JavaScript origins: https://your-domain.com
   Authorized redirect URIs: https://your-project.supabase.co/auth/v1/callback
   ```

#### LinkedIn OAuth
1. **LinkedIn Developers**
   - [ ] Create app at https://www.linkedin.com/developers/
   - [ ] Request access to Sign In with LinkedIn
   - [ ] Get Client ID and Client Secret

2. **Configuration**
   ```
   Redirect URLs: https://your-project.supabase.co/auth/v1/callback
   ```

#### GitHub OAuth (For Talents)
1. **GitHub Settings**
   - [ ] Go to Settings > Developer settings > OAuth Apps
   - [ ] Create new OAuth app
   - [ ] Get Client ID and Client Secret

2. **Configuration**
   ```
   Authorization callback URL: https://your-project.supabase.co/auth/v1/callback
   ```

### ✅ 5. Domain and SSL Setup

#### Domain Configuration
- [ ] Purchase domain name
- [ ] Configure DNS settings
- [ ] Set up CDN (Cloudflare recommended)
- [ ] Configure SSL certificate

#### Email Setup
- [ ] Configure MX records for email
- [ ] Set up SPF, DKIM, and DMARC records
- [ ] Verify email deliverability

### ✅ 6. Deployment Platform Setup

#### Vercel Deployment (Recommended)
1. **Vercel Configuration**
   - [ ] Connect GitHub repository
   - [ ] Configure environment variables
   - [ ] Set up custom domain
   - [ ] Configure build settings

2. **Build Configuration**
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": ".next",
     "framework": "nextjs",
     "nodeVersion": "18.x"
   }
   ```

#### Alternative: Manual VPS Deployment
1. **Server Setup**
   - [ ] Ubuntu 20.04+ or similar
   - [ ] Node.js 18+ installed
   - [ ] Nginx configured
   - [ ] PM2 for process management
   - [ ] Firewall configured

2. **Deployment Script**
   ```bash
   #!/bin/bash
   git pull origin main
   npm install
   npm run build
   pm2 restart ftn-find
   ```

### ✅ 7. Database Sample Data

#### Production Data Setup
- [ ] Insert sample discount codes
- [ ] Create initial opportunity categories
- [ ] Set up location data for Saudi Arabia
- [ ] Configure industry categories
- [ ] Add sample company size options

#### SQL Scripts to Run
```sql
-- Insert discount codes
INSERT INTO discount_codes (code, description, discount_type, discount_value) VALUES
('LAUNCH20', '20% off for launch week', 'percentage', 20),
('TALENT50', 'SAR 50 off for new talents', 'fixed', 50),
('STUDENT', '50% student discount', 'percentage', 50);

-- Insert location data
INSERT INTO locations (name, country, region) VALUES
('Riyadh', 'Saudi Arabia', 'Central'),
('Jeddah', 'Saudi Arabia', 'Western'),
('Dammam', 'Saudi Arabia', 'Eastern'),
('Mecca', 'Saudi Arabia', 'Western'),
('Medina', 'Saudi Arabia', 'Western');
```

### ✅ 8. Monitoring and Analytics

#### Error Tracking
- [ ] Set up Sentry account
- [ ] Configure error tracking
- [ ] Set up performance monitoring
- [ ] Configure alert rules

#### Analytics
- [ ] Set up Google Analytics 4
- [ ] Configure conversion tracking
- [ ] Set up custom events
- [ ] Create analytics dashboard

#### Performance Monitoring
- [ ] Configure Vercel Analytics
- [ ] Set up Core Web Vitals monitoring
- [ ] Configure uptime monitoring
- [ ] Set up database performance tracking

### ✅ 9. Security Configuration

#### Security Headers
Configure in `next.config.js`:
```javascript
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
];
```

#### Rate Limiting
- [ ] Configure Vercel rate limiting
- [ ] Set up API rate limits
- [ ] Configure login attempt limits
- [ ] Set up payment attempt limits

### ✅ 10. Testing

#### Production Testing Checklist
- [ ] User registration flow (all roles)
- [ ] OAuth login (all providers)
- [ ] Profile creation and onboarding
- [ ] Job search and filtering
- [ ] Application submission
- [ ] Payment processing (test mode)
- [ ] Meeting scheduling
- [ ] Email notifications
- [ ] Mobile responsiveness
- [ ] Performance testing

#### Load Testing
- [ ] Database query performance
- [ ] API response times
- [ ] Concurrent user handling
- [ ] Payment processing under load

### ✅ 11. Content and Legal

#### Legal Pages
- [ ] Privacy Policy
- [ ] Terms of Service
- [ ] Cookie Policy
- [ ] GDPR compliance page
- [ ] Refund policy

#### Content Setup
- [ ] Landing page content
- [ ] FAQ section
- [ ] Help documentation
- [ ] Contact information
- [ ] About page

### ✅ 12. Launch Preparation

#### Pre-Launch
- [ ] Run full system tests
- [ ] Verify all integrations
- [ ] Test payment flows with real cards (small amounts)
- [ ] Verify email deliverability
- [ ] Check mobile experience
- [ ] Verify analytics tracking

#### Launch Day
- [ ] Monitor error rates
- [ ] Watch payment processing
- [ ] Monitor server performance
- [ ] Check user registration flow
- [ ] Verify email notifications
- [ ] Monitor social media

#### Post-Launch
- [ ] Gather user feedback
- [ ] Monitor conversion rates
- [ ] Track application completion rates
- [ ] Analyze user behavior
- [ ] Plan iterative improvements

## 🔧 Configuration Files

### 1. Supabase Auth Configuration

In Supabase Dashboard > Authentication > Settings:

```json
{
  "site_url": "https://your-domain.com",
  "additional_redirect_urls": [
    "https://your-domain.com/auth/callback"
  ],
  "jwt_expiry": 3600,
  "refresh_token_rotation_enabled": true,
  "password_requirements": {
    "min_length": 8,
    "require_lowercase": true,
    "require_uppercase": true,
    "require_numbers": true,
    "require_symbols": false
  }
}
```

### 2. Email Templates

Configure in Supabase Dashboard > Authentication > Email Templates:

**Confirmation Email Subject:**
```
Welcome to FTN-Find - Confirm Your Email
```

**Confirmation Email Body:**
```html
<h2>Welcome to FTN-Find!</h2>
<p>Click the link below to confirm your email address:</p>
<a href="{{ .ConfirmationURL }}">Confirm Email</a>
```

### 3. Webhook Endpoints

Set up these webhook endpoints in your application:

```
POST /api/webhooks/stripe - Stripe payment webhooks
POST /api/webhooks/stc-pay - STC Pay webhooks  
POST /api/webhooks/calendly - Calendly scheduling webhooks
POST /api/webhooks/supabase - Supabase database webhooks
```

## 🚨 Common Issues and Solutions

### Database Connection Issues
```
Error: Connection pool exhausted
Solution: Increase connection pool size in Supabase or implement connection pooling
```

### OAuth Redirect Issues
```
Error: Redirect URI mismatch
Solution: Ensure redirect URIs match exactly in OAuth provider settings
```

### Payment Processing Issues
```
Error: Webhook signature validation failed
Solution: Verify webhook secret matches Stripe dashboard settings
```

### Email Delivery Issues
```
Error: Emails not being delivered
Solution: Check SMTP settings and DNS records (SPF, DKIM, DMARC)
```

## 📞 Support Contacts

### Technical Support
- **Supabase Support**: https://supabase.com/support
- **Stripe Support**: https://support.stripe.com
- **Vercel Support**: https://vercel.com/support

### Emergency Contacts
- **Database Issues**: Monitor Supabase status page
- **Payment Issues**: Stripe dashboard for real-time status
- **Domain/DNS Issues**: Your domain registrar support

---

**✅ Once you've completed this checklist, your FTN-Find platform will be ready for production deployment!**

Remember to:
- Keep all API keys and secrets secure
- Regularly backup your database
- Monitor system performance and errors
- Stay updated with security patches
- Maintain documentation as the system evolves

