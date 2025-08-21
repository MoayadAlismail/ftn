#!/usr/bin/env node

/**
 * Environment variable validation script
 * Run this before deployment to ensure all required variables are set
 */

const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
];

const optionalVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GEMINI_API_KEY'
];

console.log('🔍 Validating environment variables...\n');

let hasErrors = false;

// Check required variables
console.log('Required variables:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.log(`❌ ${varName}: Missing`);
    hasErrors = true;
  } else {
    console.log(`✅ ${varName}: Set`);
  }
});

console.log('\nOptional variables:');
optionalVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.log(`⚠️  ${varName}: Not set (optional)`);
  } else {
    console.log(`✅ ${varName}: Set`);
  }
});

console.log('\n📋 Summary:');
if (hasErrors) {
  console.log('❌ Build will fail - missing required environment variables');
  console.log('\n💡 Make sure to set these in your deployment platform:');
  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      console.log(`   - ${varName}`);
    }
  });
  process.exit(1);
} else {
  console.log('✅ All required environment variables are set');
  console.log('🚀 Ready for deployment!');
} 