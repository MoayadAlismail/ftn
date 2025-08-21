# 🚀 Your Setup Requirements - Everything You Need to Do

This is your personal checklist of all the setup tasks required from your side to deploy FTN-Find.

## 📋 Critical Setup Tasks (MUST DO)

### 🗄️ 1. Supabase Setup (REQUIRED)

#### Create Supabase Project
1. **Sign up**: Go to https://supabase.com and create an account
2. **Create project**: Click "New Project" and fill in:
   - Project name: `ftn-find` (or your preferred name)
   - Database password: Choose a strong password
   - Region: Choose closest to your users (e.g., Singapore for Middle East)

#### Get API Keys
After project creation, go to Settings > API:
- Copy `Project URL` 
- Copy `anon public` key
- Copy `service_role` key (keep this SECRET!)

#### Database Setup
**Run these SQL scripts in Supabase SQL Editor (FRESH PROJECT - NO EXISTING TABLES):**

1. **STEP 1: Run Core Schema**: Copy all SQL from `SUPABASE_SCHEMA_CHANGES.md` and execute
   - Creates all base tables: `talents`, `employers`, `saved_candidates`, `employer_subscriptions`, `usage_tracking`
   - Sets up all core functions and RLS policies
   
2. **STEP 2: Run Talent Features Schema**: Copy all SQL from `SUPABASE_TALENT_SETUP.md` and execute
   - Creates: `opportunities`, `talent_applications`, `saved_opportunities`, `discount_codes`, `talent_payments`
   - Adds search functions, payment processing, and additional RLS policies
   - Inserts sample discount codes

**This complete setup includes:**
- ✅ ALL tables from scratch (no assumptions about existing tables)
- ✅ ALL security policies (Row Level Security)
- ✅ ALL database functions for search, payments, usage tracking
- ✅ ALL indexes for optimal performance
- ✅ Sample data (discount codes, etc.)
- ✅ Complete auth.users integration

#### Storage Setup
In Supabase Dashboard > Storage:
1. Create a new bucket called `resumes`
2. Set bucket to **private** (not public)
3. Create storage policies for file access

### 🔐 2. OAuth Providers Setup (REQUIRED)

#### Google OAuth
1. **Google Cloud Console**: https://console.cloud.google.com
2. **Create/Select Project**: Create new project or use existing
3. **Enable APIs**: Search for "Google+ API" and enable it
4. **Create Credentials**:
   - Go to APIs & Services > Credentials
   - Click "Create Credentials" > "OAuth 2.0 Client ID"
   - Choose "Web application"
   - Add redirect URI: `https://YOUR_SUPABASE_PROJECT.supabase.co/auth/v1/callback`
5. **Copy Client ID and Secret**
6. **Add to Supabase**: 
   - Go to Supabase Dashboard > Authentication > Providers
   - Enable Google provider
   - Add your Client ID and Secret

#### LinkedIn OAuth
1. **LinkedIn Developers**: https://www.linkedin.com/developers/
2. **Create App**: Click "Create app"
3. **Fill Details**: Company name, app name, etc.
4. **Products**: Request "Sign In with LinkedIn" product
5. **OAuth Settings**:
   - Redirect URL: `https://YOUR_SUPABASE_PROJECT.supabase.co/auth/v1/callback`
6. **Get Credentials**: Copy Client ID and Secret
7. **Add to Supabase**: Same as Google, but select LinkedIn provider

#### GitHub OAuth (For Talents Only)
1. **GitHub Settings**: https://github.com/settings/developers
2. **New OAuth App**: Click "New OAuth App"
3. **Fill Details**:
   - Application name: "FTN-Find"
   - Homepage URL: Your domain
   - Authorization callback URL: `https://YOUR_SUPABASE_PROJECT.supabase.co/auth/v1/callback`
4. **Get Credentials**: Copy Client ID and Secret
5. **Add to Supabase**: Enable GitHub provider in Supabase

### 💳 3. Payment Gateway Setup (REQUIRED for Production)

#### Stripe Setup
1. **Create Account**: https://dashboard.stripe.com/register
2. **Business Verification**: Complete your business profile
3. **Get API Keys**:
   - Dashboard > Developers > API keys
   - Copy Publishable key and Secret key
   - Start with TEST keys, switch to LIVE for production
4. **Webhook Endpoint**: 
   - Dashboard > Developers > Webhooks
   - Add endpoint: `https://your-domain.com/api/webhooks/stripe`
   - Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`

#### STC Pay (Saudi Arabia - Optional)
1. **Merchant Registration**: Contact STC Pay for merchant account
2. **Get Credentials**: API key and Merchant ID
3. **Configure Webhooks**: Set your webhook URL

### 📅 4. Calendly Integration (REQUIRED)

#### Calendly Account
1. **Sign Up**: https://calendly.com
2. **Create Event Type**:
   - Name: "Career Consultation" 
   - Duration: 30 minutes
   - Set your availability
3. **Get Event Type UUID**:
   - Go to event settings
   - Copy the UUID from the URL or API
4. **Generate API Token**:
   - Account Settings > Developers
   - Create Personal Access Token

### 🌐 5. Environment Variables (REQUIRED)

Create `.env.local` file in your project root:

```bash
# Supabase (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Site URL (REQUIRED)
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# Stripe (REQUIRED for payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... (or pk_live_... for production)
STRIPE_SECRET_KEY=sk_test_... (or sk_live_... for production)
STRIPE_WEBHOOK_SECRET=whsec_...

# Calendly (REQUIRED)
CALENDLY_API_TOKEN=your_personal_access_token
CALENDLY_EVENT_TYPE_UUID=your_consultation_event_uuid

# Optional (for Saudi Arabia)
STC_PAY_MERCHANT_ID=your_merchant_id
STC_PAY_API_KEY=your_api_key
```

## 🎯 Optional Setup Tasks (RECOMMENDED)

### 📧 Email Service (Recommended)
- **SendGrid** or **AWS SES** for transactional emails
- Configure in Supabase > Authentication > Settings > SMTP

### 📊 Analytics (Recommended)
- **Google Analytics 4**: Add tracking ID to environment variables
- **Vercel Analytics**: Enable in Vercel dashboard

### 🔍 Error Tracking (Recommended)
- **Sentry**: For error monitoring and performance tracking

### 🌍 Domain & Hosting (REQUIRED for Production)

#### Domain Setup
1. **Purchase Domain**: From any domain registrar
2. **DNS Configuration**: Point to your hosting provider

#### Vercel Deployment (Recommended)
1. **Connect GitHub**: Link your repository
2. **Import Project**: Import from GitHub
3. **Environment Variables**: Add all your env vars in Vercel dashboard
4. **Custom Domain**: Add your domain in Vercel project settings
5. **Deploy**: Automatic deployment on git push

## ⚠️ Critical Security Notes

### Keep These SECRET:
- ✅ Supabase `service_role` key
- ✅ Stripe `secret` key
- ✅ All webhook secrets
- ✅ OAuth client secrets
- ✅ API tokens

### Never Commit:
- ❌ `.env.local` file
- ❌ Any API keys or secrets
- ❌ Database passwords

## 🧪 Testing Your Setup

### 1. Database Test
```sql
-- Run in Supabase SQL Editor to verify all tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Should show: discount_codes, employer_subscriptions, employers, invites, opportunities, 
-- saved_candidates, saved_opportunities, talent_applications, talent_payments, 
-- talents, usage_tracking

-- Test specific tables
SELECT COUNT(*) FROM talents;
SELECT COUNT(*) FROM opportunities;
SELECT COUNT(*) FROM discount_codes; -- Should have 4 sample codes
```

### 2. Authentication Test
- Try signing up with Google
- Try signing up with LinkedIn
- Try talent and employer flows

### 3. Payment Test
- Use Stripe test cards: `4242 4242 4242 4242`
- Test discount codes: `TALENT20`, `NEWUSER`, `STUDENT`

### 4. Integration Test
- Submit a job application
- Process payment (test mode)
- Schedule Calendly meeting

## 📞 Where to Get Help

### Documentation
- **Complete setup**: `DEPLOYMENT_SETUP.md`
- **Database schema**: `SUPABASE_SCHEMA_CHANGES.md` + `SUPABASE_TALENT_SETUP.md`
- **OAuth setup**: `SUPABASE_AUTH_SETUP.md`

### Support Resources
- **Supabase Docs**: https://supabase.com/docs
- **Stripe Docs**: https://stripe.com/docs
- **Calendly API**: https://developer.calendly.com
- **Next.js Docs**: https://nextjs.org/docs

### If You Get Stuck
1. Check the error messages carefully
2. Verify all environment variables are set correctly
3. Ensure all API keys have proper permissions
4. Check that webhook URLs are accessible
5. Verify OAuth redirect URLs match exactly

## 🎉 Launch Checklist

Before going live:
- [ ] All environment variables configured
- [ ] Database schema deployed
- [ ] OAuth providers working
- [ ] Payment processing tested
- [ ] Calendly integration working
- [ ] Domain and SSL configured
- [ ] Error monitoring set up

**Once everything is set up, your FTN-Find platform will be fully functional with:**
- ✅ User authentication (Google, LinkedIn, GitHub)
- ✅ Role-based access (Talent vs Employer)
- ✅ Job search and filtering
- ✅ Application submissions
- ✅ Payment processing with discounts
- ✅ Calendly meeting scheduling
- ✅ Complete dashboard for both user types

**Estimated setup time**: 4-6 hours for a developer familiar with these services.

