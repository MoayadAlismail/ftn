# Deployment Guide

This guide will help you deploy your FTN application to various platforms.

## Prerequisites

Before deploying, ensure you have:

1. **Supabase Project**: A Supabase project with the required database tables and functions
2. **Environment Variables**: All required environment variables configured
3. **Node.js**: Version 18.x (recommended for compatibility)

## Environment Variables

### Required Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Optional Variables

```bash
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
GEMINI_API_KEY=your_gemini_ai_api_key
```

### Getting Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project or select an existing one
3. Navigate to **Settings** > **API**
4. Copy the **Project URL** and **anon/public key**

## Local Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env.local` file with your environment variables
4. Run the development server: `npm run dev`
5. Validate environment: `npm run validate-env`

## Deployment Options

### 1. Vercel (Recommended)

Vercel is the easiest platform for Next.js applications.

#### Steps:
1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy automatically

#### Environment Variables in Vercel:
- Go to your project settings
- Navigate to **Environment Variables**
- Add each variable with the exact names from above

### 2. Heroku

#### Prerequisites:
- Heroku CLI installed
- Heroku account

#### Steps:
1. Login to Heroku: `heroku login`
2. Create a new app: `heroku create your-app-name`
3. Set environment variables:
   ```bash
   heroku config:set NEXT_PUBLIC_SUPABASE_URL=your_url
   heroku config:set NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   ```
4. Deploy: `git push heroku main`

#### Environment Variables in Heroku:
- Go to your app dashboard
- Navigate to **Settings** > **Config Vars**
- Add each variable

### 3. Railway

#### Steps:
1. Connect your GitHub repository to [Railway](https://railway.app)
2. Add environment variables in the dashboard
3. Deploy automatically

### 4. Netlify

#### Steps:
1. Connect your GitHub repository to [Netlify](https://netlify.com)
2. Set build command: `npm run build`
3. Set publish directory: `.next`
4. Add environment variables in the dashboard

## Troubleshooting

### Common Issues

#### 1. Build Fails with Supabase Error
**Error**: `Your project's URL and API key are required to create a Supabase client!`

**Solution**: Ensure environment variables are properly set in your deployment platform.

#### 2. Node.js Version Issues
**Error**: Build process fails with Node.js compatibility issues

**Solution**: 
- Ensure your platform supports Node.js 18.x
- Check that `engines.node` is set to `18.x` in package.json

#### 3. Environment Variables Not Loading
**Error**: Application can't connect to Supabase

**Solution**:
- Verify variable names are exactly correct (case-sensitive)
- Ensure variables are set in the correct environment (production/staging)
- Restart your deployment after setting variables

### Validation

Before deploying, run:
```bash
npm run validate-env
```

This will check if all required environment variables are set.

## Post-Deployment

1. **Test the Application**: Ensure all features work correctly
2. **Monitor Logs**: Check for any runtime errors
3. **Database Setup**: Ensure your Supabase database has the required tables and functions
4. **Authentication**: Test login/signup flows

## Support

If you encounter issues:
1. Check the deployment platform logs
2. Verify environment variables are set correctly
3. Ensure your Supabase project is properly configured
4. Check the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) 