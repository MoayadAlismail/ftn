# FTN-Find: AI-Powered Talent Matching Platform

A comprehensive talent-employer matching platform built with Next.js, Supabase, and modern web technologies. FTN-Find streamlines the hiring process with AI-powered matching, advanced filtering, and integrated payment processing.

## 🚀 Features

### For Talents
- **AI-Powered Job Matching**: Get personalized job recommendations based on your profile
- **Advanced Job Search**: Filter opportunities by location, industry, salary, work style, and more
- **Resume Upload & Analysis**: Upload your resume for AI-powered profile enhancement
- **Application Management**: Apply to jobs with integrated payment processing
- **Career Consultation**: Schedule meetings with career experts after application
- **Save Opportunities**: Bookmark interesting positions for later review

### For Employers
- **Candidate Discovery**: AI-powered search and matching for qualified candidates
- **Profile Management**: View detailed candidate profiles and download resumes
- **Application Tracking**: Manage incoming applications with status updates
- **Saved Candidates**: Build talent pipelines by saving promising candidates
- **Subscription Management**: Flexible billing with usage tracking and limits

### Platform Features
- **Multi-Role Authentication**: Separate flows for talents and employers with OAuth support
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Real-time Updates**: Live notifications and status updates
- **Secure Payments**: Multiple payment methods with discount code support
- **Meeting Scheduling**: Integrated Calendly for consultation booking

## 🛠 Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations and transitions
- **Shadcn/ui** - Modern, accessible UI components
- **Lucide React** - Beautiful icon library

### Backend & Database
- **Supabase** - Backend-as-a-Service with PostgreSQL
- **Row Level Security** - Database-level security policies
- **Real-time Subscriptions** - Live data updates
- **Storage** - File upload and management for resumes

### Authentication
- **Supabase Auth** - Multi-provider authentication
- **OAuth Providers**: Google, LinkedIn, GitHub
- **Role-based Access Control** - Talent vs Employer permissions
- **JWT Tokens** - Secure session management

### Payment Processing
- **Stripe** (Ready for integration)
- **STC Pay** (Saudi Arabia mobile payments)
- **Apple Pay** (Biometric payments)
- **Discount Code System** - Flexible promotion management

### Integrations
- **Calendly** - Meeting scheduling integration
- **Email Services** - Notification system ready
- **AI/ML Services** - Job matching and recommendations

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── auth/                     # Authentication pages
│   │   ├── callback/             # OAuth callback handler
│   │   ├── talent/               # Talent auth flows
│   │   └── employer/             # Employer auth flows
│   ├── talent/                   # Talent dashboard and features
│   │   ├── dashboard/            # Main dashboard
│   │   ├── opportunities/        # Job browsing and search
│   │   ├── apply/               # Application and payment flow
│   │   ├── match-making/        # AI matching interface
│   │   └── onboarding/          # Profile setup
│   ├── employer/                # Employer dashboard and features
│   │   └── dashboard/           # Employer management interface
│   │       ├── home/            # AI candidate search
│   │       ├── saved-candidates/ # Saved talent profiles
│   │       └── billing/         # Subscription management
│   └── api/                     # API routes (future)
├── components/                  # Shared React components
│   ├── ui/                      # Shadcn/ui components
│   ├── landing/                 # Landing page sections
│   └── shared/                  # Common components
├── features/                    # Feature-specific components
│   ├── auth/                    # Authentication components
│   ├── talent/                  # Talent-specific features
│   └── employer/                # Employer-specific features
├── lib/                         # Utility libraries
│   ├── supabase/               # Database client and utils
│   ├── auth-utils.ts           # Authentication helpers
│   └── utils.ts                # General utilities
├── contexts/                    # React Context providers
│   ├── AuthContext.tsx         # User authentication state
│   └── LoadingContext.tsx      # Loading state management
├── constants/                   # Application constants
└── types/                       # TypeScript type definitions
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ftn-find
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```

4. **Configure environment variables**
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

   # OAuth Providers (Optional)
   NEXT_PUBLIC_SITE_URL=http://localhost:3000

   # Payment Processing (Production)
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...

   # Calendly Integration
   CALENDLY_API_TOKEN=your_calendly_token
   CALENDLY_EVENT_TYPE_UUID=your_event_type_uuid
   ```

5. **Database Setup**
   - Follow the instructions in `SUPABASE_SCHEMA_CHANGES.md`
   - Run the SQL scripts to set up tables and functions
   - Configure Row Level Security policies

6. **Authentication Setup**
   - Follow the instructions in `SUPABASE_AUTH_SETUP.md`
   - Configure OAuth providers in Supabase dashboard

7. **Run the development server**
   ```bash
   npm run dev
   ```

8. **Build for production**
   ```bash
   npm run build
   npm start
   ```

## 📚 Documentation

### Setup Guides
- [Database Schema Setup](SUPABASE_SCHEMA_CHANGES.md) - Complete database configuration
- [Authentication Setup](SUPABASE_AUTH_SETUP.md) - OAuth provider configuration
- [Talent Features Setup](SUPABASE_TALENT_SETUP.md) - Phase 5 talent features

### API Documentation
- [Authentication Flow](docs/auth-flow.md) - User authentication and authorization
- [Payment Processing](docs/payments.md) - Payment gateway integration
- [Meeting Scheduling](docs/calendly.md) - Calendly integration guide

### Development
- [Contributing Guidelines](CONTRIBUTING.md) - How to contribute to the project
- [Code Style Guide](docs/code-style.md) - Coding standards and best practices
- [Testing Guide](docs/testing.md) - Testing strategies and implementation

## 🔧 Configuration

### Authentication Providers

**Google OAuth**
```javascript
// Supabase Dashboard > Authentication > Providers
Client ID: your_google_client_id
Client Secret: your_google_client_secret
Redirect URL: https://your-domain.com/auth/callback
```

**LinkedIn OAuth**
```javascript
Client ID: your_linkedin_client_id
Client Secret: your_linkedin_client_secret
Redirect URL: https://your-domain.com/auth/callback
```

**GitHub OAuth** (Talents only)
```javascript
Client ID: your_github_client_id
Client Secret: your_github_client_secret
Redirect URL: https://your-domain.com/auth/callback
```

### Payment Configuration

**Stripe**
```javascript
// Test mode
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

// Production
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
```

**STC Pay** (Saudi Arabia)
```javascript
STC_PAY_MERCHANT_ID=your_merchant_id
STC_PAY_API_KEY=your_api_key
```

### Calendly Integration
```javascript
CALENDLY_API_TOKEN=your_personal_access_token
CALENDLY_EVENT_TYPE_UUID=your_30min_consultation_uuid
```

## 🔐 Security

### Authentication Security
- JWT tokens with automatic refresh
- Role-based access control
- OAuth provider validation
- Session management with secure cookies

### Database Security
- Row Level Security (RLS) enabled
- User data isolation
- SQL injection prevention
- Encrypted sensitive data

### Payment Security
- PCI-compliant payment processing
- Secure webhook validation
- Encrypted payment references
- Fraud detection integration

## 📊 Monitoring

### Performance Monitoring
- Next.js Analytics integration
- Database query performance tracking
- API response time monitoring
- Error tracking with Sentry (ready for integration)

### Business Metrics
- User registration and onboarding rates
- Job application conversion rates
- Payment processing success rates
- Meeting scheduling completion rates

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Docker
```bash
# Build container
docker build -t ftn-find .

# Run container
docker run -p 3000:3000 ftn-find
```

### Manual Deployment
```bash
# Build production bundle
npm run build

# Start production server
npm start
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Code Quality
- ESLint for code linting
- Prettier for code formatting
- TypeScript for type safety
- Husky for pre-commit hooks