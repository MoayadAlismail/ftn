# Supabase Auth Provider Setup Guide

This guide walks you through setting up OAuth providers for FTN Find's authentication system.

## Overview

FTN Find uses role-based authentication with the following providers:
- **Talents**: Google, GitHub, LinkedIn
- **Employers**: Google, LinkedIn

## Prerequisites

1. A Supabase project created
2. Developer accounts for each OAuth provider
3. Domain(s) configured for production

## 1. Google OAuth Setup

### Step 1: Create Google OAuth App
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Choose "Web application"
6. Add authorized origins:
   - `http://localhost:3000` (development)
   - `https://yourdomain.com` (production)
7. Add authorized redirect URIs:
   - `https://[PROJECT_ID].supabase.co/auth/v1/callback`

### Step 2: Configure in Supabase
1. In Supabase Dashboard → Authentication → Providers
2. Enable "Google"
3. Add your Client ID and Client Secret
4. Set redirect URL: `https://[PROJECT_ID].supabase.co/auth/v1/callback`

## 2. GitHub OAuth Setup

### Step 1: Create GitHub OAuth App
1. Go to GitHub → Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Fill in:
   - Application name: "FTN Find"
   - Homepage URL: `https://yourdomain.com`
   - Authorization callback URL: `https://[PROJECT_ID].supabase.co/auth/v1/callback`

### Step 2: Configure in Supabase
1. In Supabase Dashboard → Authentication → Providers
2. Enable "GitHub"
3. Add your Client ID and Client Secret

## 3. LinkedIn OAuth Setup

### Step 1: Create LinkedIn App
1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/apps)
2. Click "Create app"
3. Fill in required information
4. In "Auth" tab, add redirect URLs:
   - `https://[PROJECT_ID].supabase.co/auth/v1/callback`
5. Request OpenID Connect permissions

### Step 2: Configure in Supabase
1. In Supabase Dashboard → Authentication → Providers
2. Enable "LinkedIn (OpenID Connect)"
3. Add your Client ID and Client Secret

## 4. Environment Variables

Ensure these are set in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 5. Supabase Configuration

### Enable Required Providers
In Supabase Dashboard → Authentication → Providers, enable:
- ✅ Google
- ✅ GitHub 
- ✅ LinkedIn (OpenID Connect)

### Site URL Configuration
In Supabase Dashboard → Authentication → URL Configuration:
- Site URL: `https://yourdomain.com`
- Redirect URLs: Add all your app URLs

### Email Templates (Optional)
Customize email templates in Authentication → Email Templates:
- Confirm signup
- Reset password
- Magic link

## 6. Testing the Setup

### Development Testing
1. Start your local server: `npm run dev`
2. Navigate to signup/login pages
3. Test each provider for both roles
4. Verify role-based redirects work correctly

### Provider-Specific Testing
- **Google**: Test with personal and work emails
- **GitHub**: Test with GitHub account
- **LinkedIn**: Test with professional account

## 7. Production Deployment

### Update OAuth App Settings
For each provider, add production URLs:
- **Google**: Add production domain to authorized origins
- **GitHub**: Update callback URL to production
- **LinkedIn**: Add production redirect URL

### Environment Variables
Update production environment with:
- Production Supabase URL
- Production API keys
- Correct redirect URLs

## 8. Security Considerations

### Rate Limiting
Supabase automatically handles rate limiting for auth endpoints.

### PKCE (Proof Key for Code Exchange)
Automatically enabled for OAuth flows in Supabase.

### Session Management
- Sessions expire after 1 hour by default
- Refresh tokens valid for 30 days
- Configure in Authentication → Settings

## 9. Troubleshooting

### Common Issues

**"Invalid redirect URI"**
- Check OAuth app settings match Supabase callback URL
- Ensure HTTPS in production

**"Provider not enabled"**
- Verify provider is enabled in Supabase dashboard
- Check client credentials are correct

**"Role mismatch errors"**
- Verify user metadata is being set correctly
- Check role validation logic in auth callbacks

### Debug Mode
Enable debug logging by setting:
```env
NEXT_PUBLIC_SUPABASE_DEBUG=true
```

## 10. Monitoring

### Supabase Analytics
Monitor authentication metrics in Supabase Dashboard:
- User signups by provider
- Login success rates
- Error rates

### Error Tracking
Implement error tracking for auth failures:
```javascript
// In your auth handlers
try {
  // Auth logic
} catch (error) {
  console.error('Auth error:', error);
  // Send to error tracking service
}
```

## Support

For additional help:
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [OAuth Provider Documentation](https://supabase.com/docs/guides/auth/social-login)
- Project-specific auth utilities in `src/lib/auth-utils.ts`

