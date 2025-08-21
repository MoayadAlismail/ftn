# Supabase Core Schema Setup - Fresh Project

This document provides the complete database schema setup for a FRESH Supabase project with no existing tables.

## Overview

This is the FIRST script to run on your new Supabase project. It creates all core tables, functions, and security policies from scratch.

## ⚠️ IMPORTANT: Fresh Project Setup

This script assumes you have a COMPLETELY FRESH Supabase project with NO existing tables. If you have any existing tables, you may need to adjust the CREATE statements.

## Required Tables - Core Schema

### 1. Create `talents` Table (Base Table)

```sql
-- Create talents table (referenced by other tables)
CREATE TABLE IF NOT EXISTS talents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  bio TEXT,
  resume_url TEXT,
  location_pref JSONB DEFAULT '[]',
  industry_pref JSONB DEFAULT '[]',
  work_style_pref JSONB DEFAULT '[]',
  skills JSONB DEFAULT '[]',
  experience_level VARCHAR(50),
  education TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for search performance
CREATE INDEX idx_talents_user_id ON talents(user_id);
CREATE INDEX idx_talents_email ON talents(email);
CREATE INDEX idx_talents_location_pref ON talents USING GIN(location_pref);
CREATE INDEX idx_talents_industry_pref ON talents USING GIN(industry_pref);
CREATE INDEX idx_talents_work_style_pref ON talents USING GIN(work_style_pref);
CREATE INDEX idx_talents_skills ON talents USING GIN(skills);
CREATE INDEX idx_talents_created_at ON talents(created_at DESC);
```

### 2. Create `employers` Table

```sql
-- Create employers table
CREATE TABLE IF NOT EXISTS employers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  company_name VARCHAR(255),
  company_size VARCHAR(50),
  industry VARCHAR(100),
  website_url VARCHAR(255),
  company_description TEXT,
  contact_email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for performance
CREATE INDEX idx_employers_user_id ON employers(user_id);
```

### 3. Create `saved_candidates` Table

```sql
-- Create saved_candidates table
CREATE TABLE IF NOT EXISTS saved_candidates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  talent_id UUID REFERENCES talents(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  source VARCHAR(50) DEFAULT 'manual', -- 'search', 'application', 'manual'
  
  -- Prevent duplicate saves
  UNIQUE(employer_id, talent_id)
);

-- Add indexes for performance
CREATE INDEX idx_saved_candidates_employer_id ON saved_candidates(employer_id);
CREATE INDEX idx_saved_candidates_talent_id ON saved_candidates(talent_id);
CREATE INDEX idx_saved_candidates_saved_at ON saved_candidates(saved_at DESC);
```

### 4. Create `employer_subscriptions` Table

```sql
CREATE TABLE IF NOT EXISTS employer_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  plan_id VARCHAR(50) NOT NULL DEFAULT 'starter', -- 'starter', 'professional', 'enterprise'
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'cancelled', 'expired', 'suspended'
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '1 month'),
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Usage tracking
  monthly_invites_used INTEGER DEFAULT 0,
  monthly_downloads_used INTEGER DEFAULT 0,
  saved_candidates_count INTEGER DEFAULT 0,
  
  -- Billing information
  stripe_subscription_id VARCHAR(255), -- For payment integration
  stripe_customer_id VARCHAR(255),
  
  CONSTRAINT valid_plan_id CHECK (plan_id IN ('starter', 'professional', 'enterprise')),
  CONSTRAINT valid_status CHECK (status IN ('active', 'cancelled', 'expired', 'suspended'))
);

-- Indexes
CREATE INDEX idx_employer_subscriptions_employer_id ON employer_subscriptions(employer_id);
CREATE INDEX idx_employer_subscriptions_status ON employer_subscriptions(status);
CREATE INDEX idx_employer_subscriptions_period_end ON employer_subscriptions(current_period_end);
```

### 5. Create `usage_tracking` Table

```sql
CREATE TABLE IF NOT EXISTS usage_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL, -- 'invite_sent', 'resume_download', 'candidate_saved'
  target_id UUID, -- talent_id for invites/saves, resume_id for downloads
  metadata JSONB DEFAULT '{}', -- Additional context
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_action_type CHECK (action_type IN ('invite_sent', 'resume_download', 'candidate_saved', 'candidate_unsaved'))
);

-- Indexes for analytics and usage limits
CREATE INDEX idx_usage_tracking_employer_id ON usage_tracking(employer_id);
CREATE INDEX idx_usage_tracking_action_type ON usage_tracking(action_type);
CREATE INDEX idx_usage_tracking_created_at ON usage_tracking(created_at DESC);
CREATE INDEX idx_usage_tracking_employer_action_date ON usage_tracking(employer_id, action_type, created_at DESC);
```

### 6. Create `invites` Table

```sql
-- Create invites table for tracking employer invitations to talents
CREATE TABLE IF NOT EXISTS invites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  talent_id UUID REFERENCES talents(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'sent', -- 'sent', 'viewed', 'accepted', 'declined', 'expired'
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  viewed_at TIMESTAMP WITH TIME ZONE,
  responded_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
  
  -- Prevent duplicate invites for same talent from same employer
  UNIQUE(employer_id, talent_id)
);

-- Indexes for performance
CREATE INDEX idx_invites_employer_id ON invites(employer_id);
CREATE INDEX idx_invites_talent_id ON invites(talent_id);
CREATE INDEX idx_invites_status ON invites(status);
CREATE INDEX idx_invites_sent_at ON invites(sent_at DESC);
CREATE INDEX idx_invites_expires_at ON invites(expires_at);
```

## Core Database Functions

All tables are now created. Next, we need to set up the core functions that handle business logic.

## Required Functions

### 1. Usage Tracking Function

```sql
CREATE OR REPLACE FUNCTION track_usage(
  p_employer_id UUID,
  p_action_type VARCHAR(50),
  p_target_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
) RETURNS VOID AS $$
BEGIN
  INSERT INTO usage_tracking (employer_id, action_type, target_id, metadata)
  VALUES (p_employer_id, p_action_type, p_target_id, p_metadata);
  
  -- Update subscription usage counters
  IF p_action_type = 'invite_sent' THEN
    UPDATE employer_subscriptions 
    SET monthly_invites_used = monthly_invites_used + 1
    WHERE employer_id = p_employer_id;
  ELSIF p_action_type = 'resume_download' THEN
    UPDATE employer_subscriptions 
    SET monthly_downloads_used = monthly_downloads_used + 1
    WHERE employer_id = p_employer_id;
  ELSIF p_action_type = 'candidate_saved' THEN
    UPDATE employer_subscriptions 
    SET saved_candidates_count = saved_candidates_count + 1
    WHERE employer_id = p_employer_id;
  ELSIF p_action_type = 'candidate_unsaved' THEN
    UPDATE employer_subscriptions 
    SET saved_candidates_count = GREATEST(0, saved_candidates_count - 1)
    WHERE employer_id = p_employer_id;
  END IF;
END;
$$ LANGUAGE plpgsql;
```

### 2. Monthly Usage Reset Function

```sql
CREATE OR REPLACE FUNCTION reset_monthly_usage() RETURNS VOID AS $$
BEGIN
  UPDATE employer_subscriptions 
  SET 
    monthly_invites_used = 0,
    monthly_downloads_used = 0
  WHERE 
    current_period_end <= NOW() 
    AND status = 'active';
    
  -- Update billing periods
  UPDATE employer_subscriptions 
  SET 
    current_period_start = current_period_end,
    current_period_end = current_period_end + INTERVAL '1 month'
  WHERE 
    current_period_end <= NOW() 
    AND status = 'active'
    AND NOT cancel_at_period_end;
    
  -- Cancel subscriptions that should end
  UPDATE employer_subscriptions 
  SET status = 'cancelled'
  WHERE 
    current_period_end <= NOW() 
    AND cancel_at_period_end = TRUE;
END;
$$ LANGUAGE plpgsql;
```

### 3. Usage Limit Check Function

```sql
CREATE OR REPLACE FUNCTION check_usage_limit(
  p_employer_id UUID,
  p_action_type VARCHAR(50)
) RETURNS BOOLEAN AS $$
DECLARE
  v_subscription RECORD;
  v_limit INTEGER;
BEGIN
  SELECT * INTO v_subscription 
  FROM employer_subscriptions 
  WHERE employer_id = p_employer_id AND status = 'active';
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Define limits based on plan
  IF p_action_type = 'invite_sent' THEN
    CASE v_subscription.plan_id
      WHEN 'starter' THEN v_limit := 10;
      WHEN 'professional' THEN v_limit := 50;
      WHEN 'enterprise' THEN v_limit := -1; -- unlimited
    END CASE;
    
    IF v_limit = -1 THEN RETURN TRUE; END IF;
    RETURN v_subscription.monthly_invites_used < v_limit;
    
  ELSIF p_action_type = 'resume_download' THEN
    CASE v_subscription.plan_id
      WHEN 'starter' THEN v_limit := 20;
      WHEN 'professional' THEN v_limit := -1; -- unlimited
      WHEN 'enterprise' THEN v_limit := -1; -- unlimited
    END CASE;
    
    IF v_limit = -1 THEN RETURN TRUE; END IF;
    RETURN v_subscription.monthly_downloads_used < v_limit;
    
  ELSIF p_action_type = 'candidate_saved' THEN
    CASE v_subscription.plan_id
      WHEN 'starter' THEN v_limit := 50;
      WHEN 'professional' THEN v_limit := 500;
      WHEN 'enterprise' THEN v_limit := -1; -- unlimited
    END CASE;
    
    IF v_limit = -1 THEN RETURN TRUE; END IF;
    RETURN v_subscription.saved_candidates_count < v_limit;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;
```

### 4. Invite Management Function

```sql
-- Function to handle invite expiration and status updates
CREATE OR REPLACE FUNCTION update_invite_statuses() RETURNS VOID AS $$
BEGIN
  -- Mark expired invites
  UPDATE invites 
  SET status = 'expired'
  WHERE expires_at < NOW() AND status = 'sent';
END;
$$ LANGUAGE plpgsql;
```

## Required Row Level Security (RLS) Policies

### 1. `saved_candidates` Table Policies

```sql
-- Enable RLS
ALTER TABLE saved_candidates ENABLE ROW LEVEL SECURITY;

-- Employers can only see their own saved candidates
CREATE POLICY saved_candidates_employer_policy ON saved_candidates
  FOR ALL USING (employer_id = auth.uid());

-- Talents can see who saved them (optional - for transparency)
CREATE POLICY saved_candidates_talent_view_policy ON saved_candidates
  FOR SELECT USING (
    talent_id IN (
      SELECT id FROM talents WHERE user_id = auth.uid()
    )
  );
```

### 2. `invites` Table Policies

```sql
-- Enable RLS
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;

-- Employers can manage their own sent invites
CREATE POLICY invites_employer_policy ON invites
  FOR ALL USING (employer_id = auth.uid());

-- Talents can view invites sent to them
CREATE POLICY invites_talent_view_policy ON invites
  FOR SELECT USING (
    talent_id IN (
      SELECT id FROM talents WHERE user_id = auth.uid()
    )
  );

-- Talents can update status of invites sent to them (accept/decline)
CREATE POLICY invites_talent_update_policy ON invites
  FOR UPDATE USING (
    talent_id IN (
      SELECT id FROM talents WHERE user_id = auth.uid()
    )
  ) WITH CHECK (
    talent_id IN (
      SELECT id FROM talents WHERE user_id = auth.uid()
    )
  );
```

### 3. `employer_subscriptions` Table Policies

```sql
-- Enable RLS
ALTER TABLE employer_subscriptions ENABLE ROW LEVEL SECURITY;

-- Employers can only see their own subscription
CREATE POLICY employer_subscriptions_policy ON employer_subscriptions
  FOR ALL USING (employer_id = auth.uid());
```

### 4. `usage_tracking` Table Policies

```sql
-- Enable RLS
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

-- Employers can only see their own usage
CREATE POLICY usage_tracking_policy ON usage_tracking
  FOR ALL USING (employer_id = auth.uid());
```

## Automated Tasks (Cron Jobs)

### 1. Monthly Billing Reset

Set up a cron job to run the monthly reset:

```sql
-- Using pg_cron extension (if available)
SELECT cron.schedule('monthly-usage-reset', '0 0 1 * *', 'SELECT reset_monthly_usage();');
```

Or implement in application code to run daily and check for expired periods.

### 2. Subscription Status Updates

```sql
-- Function to check and update subscription statuses
CREATE OR REPLACE FUNCTION update_subscription_statuses() RETURNS VOID AS $$
BEGIN
  -- Mark expired subscriptions
  UPDATE employer_subscriptions 
  SET status = 'expired'
  WHERE current_period_end < NOW() AND status = 'active';
  
  -- Update usage counters based on actual saved candidates
  UPDATE employer_subscriptions 
  SET saved_candidates_count = (
    SELECT COUNT(*) 
    FROM saved_candidates 
    WHERE saved_candidates.employer_id = employer_subscriptions.employer_id
  );
END;
$$ LANGUAGE plpgsql;
```

## Initial Data Setup

### 1. Create Default Subscriptions for New Employers (Optional)

This can be handled by your application when employers sign up, but if you want to pre-populate:

```sql
-- This will be empty on a fresh install, but shows the pattern
-- Your app should create subscriptions when employers register
INSERT INTO employer_subscriptions (employer_id, plan_id, status)
SELECT DISTINCT user_id, 'starter', 'active'
FROM employers 
WHERE user_id NOT IN (
  SELECT employer_id FROM employer_subscriptions WHERE employer_id IS NOT NULL
);
```

## API Integration Points

### 1. Usage Tracking Triggers

For automatic usage tracking, consider these trigger points in your application:

- **Resume Downloads**: Call `track_usage()` on successful download
- **Candidate Saves**: Call `track_usage()` on save/unsave actions
- **Invites Sent**: Call `track_usage()` on successful invite delivery

### 2. Usage Limit Checks

Before allowing actions, check limits:

```javascript
// Example usage in TypeScript/JavaScript
const canPerformAction = await supabase
  .rpc('check_usage_limit', {
    p_employer_id: employerId,
    p_action_type: 'resume_download'
  });

if (!canPerformAction) {
  throw new Error('Usage limit exceeded for your current plan');
}
```

## Performance Considerations

### 1. Database Indexes

All required indexes are included in the schema above. Key performance areas:

- **Saved Candidates**: Indexed by employer_id and saved_at for fast retrieval
- **Usage Tracking**: Composite indexes for efficient usage queries
- **Talents**: GIN indexes on JSONB fields for array searches

### 2. Query Optimization

Use efficient queries for common operations:

```sql
-- Get saved candidates with talent details (optimized)
SELECT 
  sc.saved_at,
  t.full_name,
  t.email,
  t.bio,
  t.location_pref,
  t.industry_pref,
  t.work_style_pref,
  t.resume_url
FROM saved_candidates sc
JOIN talents t ON sc.talent_id = t.id
WHERE sc.employer_id = $1
ORDER BY sc.saved_at DESC
LIMIT $2 OFFSET $3;
```

## Security Considerations

1. **RLS Policies**: Ensure employers can only access their own data
2. **Usage Validation**: Server-side validation of all usage limits
3. **API Rate Limiting**: Implement application-level rate limiting
4. **Data Encryption**: Consider encrypting sensitive talent data
5. **Audit Trail**: Usage tracking provides audit capabilities

## Backup and Recovery

1. **Regular Backups**: Ensure all new tables are included in backup schedules
2. **Point-in-Time Recovery**: Critical for billing and usage data
3. **Data Retention**: Define policies for usage tracking data (consider archiving old data)

## Monitoring and Alerts

Set up monitoring for:

1. **Usage Patterns**: Unusual spikes in usage
2. **Subscription Status**: Failed renewals or cancellations
3. **Performance**: Query performance on new indexes
4. **Storage Growth**: Monitor growth of usage_tracking table

## Implementation Priority

1. **High Priority**: `saved_candidates` enhancements, `employer_subscriptions` table
2. **Medium Priority**: Usage tracking system, RLS policies
3. **Low Priority**: Advanced analytics functions, automated jobs

This schema provides a robust foundation for the employer features while maintaining scalability and security.

