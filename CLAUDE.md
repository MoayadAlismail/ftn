# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `npm run dev` - Start development server on localhost:3000
- `npm run dev-turbo` - Start development server with Turbo mode for faster builds
- `npm run build` - Build the application for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint to check for code quality issues

### Environment Setup
- Copy `.env.example` to `.env.local` and configure Supabase variables
- Required env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Architecture Overview

### Tech Stack
- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, Shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Real-time)
- **State Management**: React Context API (AuthContext, LoadingContext)
- **Authentication**: Supabase Auth with OAuth providers (Google, LinkedIn, GitHub)
- **Payments**: Stripe integration (ready)
- **Integrations**: Calendly for meeting scheduling

### Core Architecture Patterns

#### 1. Feature-Based Organization
```
src/
├── app/              # Next.js App Router pages
├── features/         # Domain-specific components (talent/, employer/, auth/)
├── components/       # Shared UI components
├── lib/             # Utilities and services
├── contexts/        # Global state management
└── constants/       # Application constants and enums
```

#### 2. Role-Based Architecture
The application supports two distinct user roles:
- **Talents**: Job seekers with dashboard, opportunities, applications
- **Employers**: Companies with candidate search, job posting, billing

#### 3. Authentication Flow
- Multi-provider OAuth authentication through Supabase
- Role-based routing with middleware protection
- Enhanced user data with `getCurrentUser()` utility from `src/lib/auth-utils.ts`
- Context-based auth state management in `AuthContext.tsx`

### Key Components

#### Authentication System
- **AuthContext**: Global auth state with user, session, and role management
- **Middleware**: Route protection and role-based access control
- **Auth Utils**: Extended user data fetching and role validation
- **OAuth Providers**: Google, LinkedIn, GitHub integration

#### Database Layer
- **Supabase Client**: Browser and server clients in `src/lib/supabase/`
- **Row Level Security**: Database-level access control
- **Real-time Features**: Live updates and subscriptions

#### UI Components
- **Shadcn/ui**: Copy-paste components for full customization
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: Animations and transitions
- **Radix UI**: Accessible component primitives

### Important Files

#### Core Configuration
- `src/middleware.ts`: Route protection and authentication middleware
- `src/contexts/AuthContext.tsx`: Global authentication state management
- `src/lib/auth-utils.ts`: Enhanced user data and role utilities
- `src/constants/enums.ts`: Application constants and role definitions

#### Supabase Integration
- `src/lib/supabase/client.ts`: Browser client configuration
- `src/lib/supabase/server.ts`: Server-side client configuration
- `src/lib/supabase/middleware.ts`: Middleware client configuration

### Development Patterns

#### Component Organization
- Page components in `src/app/` follow App Router structure
- Feature-specific components in `src/features/[domain]/`
- Shared components in `src/components/ui/` and `src/components/`

#### State Management
- Use React Context for global state (auth, loading)
- Local state with useState/useReducer for component-specific state
- Supabase real-time subscriptions for live data

#### Type Safety
- TypeScript strict mode enabled
- Custom types in `src/types/`
- Supabase generated types for database operations

#### Authentication Patterns
- Always check `isAuthenticated` before accessing protected features
- Use `authUser` from AuthContext for enhanced user data
- Role-based component rendering with `userRole` checks

### Security Considerations
- Row Level Security (RLS) enabled on all Supabase tables
- JWT token-based authentication with automatic refresh
- Role-based access control at both middleware and component levels
- Input validation and sanitization

### Performance Optimizations
- Next.js automatic code splitting
- Image optimization with Next.js Image component
- Lazy loading for feature components
- Efficient re-renders with proper Context structuring

### Integration Points
- **Calendly**: Meeting scheduling integration
- **Stripe**: Payment processing (configured but not fully implemented)
- **Supabase**: Primary backend service for all data operations
- **OAuth Providers**: Social authentication integration