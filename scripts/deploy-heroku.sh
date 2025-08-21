#!/bin/bash

# Heroku Deployment Script
# This script helps automate the Heroku deployment process

set -e

echo "🚀 Starting Heroku deployment..."

# Check if Heroku CLI is installed
if ! command -v heroku &> /dev/null; then
    echo "❌ Heroku CLI is not installed. Please install it first:"
    echo "   https://devcenter.heroku.com/articles/heroku-cli"
    exit 1
fi

# Check if user is logged in to Heroku
if ! heroku auth:whoami &> /dev/null; then
    echo "🔐 Please login to Heroku first:"
    echo "   heroku login"
    exit 1
fi

# Get app name from command line argument or prompt
if [ -z "$1" ]; then
    echo "📝 Enter your Heroku app name:"
    read -r APP_NAME
else
    APP_NAME=$1
fi

echo "📱 Deploying to Heroku app: $APP_NAME"

# Check if app exists, create if it doesn't
if ! heroku apps:info --app "$APP_NAME" &> /dev/null; then
    echo "🆕 Creating new Heroku app: $APP_NAME"
    heroku create "$APP_NAME"
else
    echo "✅ App $APP_NAME already exists"
fi

# Set Node.js version
echo "🔧 Setting Node.js version to 18.x"
heroku config:set NODE_VERSION=18 --app "$APP_NAME"

# Check if environment variables are set
echo "🔍 Checking environment variables..."

if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo "❌ NEXT_PUBLIC_SUPABASE_URL is not set"
    echo "   Please set it in your shell or .env file"
    exit 1
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo "❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is not set"
    echo "   Please set it in your shell or .env file"
    exit 1
fi

# Set environment variables
echo "🔐 Setting environment variables..."
heroku config:set NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL" --app "$APP_NAME"
heroku config:set NEXT_PUBLIC_SUPABASE_ANON_KEY="$NEXT_PUBLIC_SUPABASE_ANON_KEY" --app "$APP_NAME"

# Set optional environment variables if they exist
if [ -n "$GOOGLE_CLIENT_ID" ]; then
    heroku config:set GOOGLE_CLIENT_ID="$GOOGLE_CLIENT_ID" --app "$APP_NAME"
fi

if [ -n "$GOOGLE_CLIENT_SECRET" ]; then
    heroku config:set GOOGLE_CLIENT_SECRET="$GOOGLE_CLIENT_SECRET" --app "$APP_NAME"
fi

if [ -n "$GEMINI_API_KEY" ]; then
    heroku config:set GEMINI_API_KEY="$GEMINI_API_KEY" --app "$APP_NAME"
fi

# Deploy the application
echo "🚀 Deploying application..."
git push heroku main

# Open the application
echo "🌐 Opening application in browser..."
heroku open --app "$APP_NAME"

echo "✅ Deployment complete!"
echo "📊 View logs with: heroku logs --tail --app $APP_NAME"
echo "🔧 Open dashboard with: heroku dashboard --app $APP_NAME" 