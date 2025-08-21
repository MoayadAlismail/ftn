# Supabase Talent Features Setup - Step 2

This document outlines the additional database schema for talent features. 

## ⚠️ PREREQUISITE: Core Schema Must Be Installed First

Before running this script, you MUST have already executed the core schema from `SUPABASE_SCHEMA_CHANGES.md`. That script creates the base tables (`talents`, `employers`, `saved_candidates`, etc.) that this script references.

## Overview

This is the SECOND script to run on your Supabase project. It adds talent-specific features including opportunity browsing, applications, payments, and meeting scheduling.

## Required Tables

### 1. Create `opportunities` Table

```sql
CREATE TABLE IF NOT EXISTS opportunities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  company_logo_url TEXT,
  location VARCHAR(100) NOT NULL,
  work_style VARCHAR(50) NOT NULL, -- 'Remote', 'On-site', 'Hybrid'
  job_type VARCHAR(50) NOT NULL, -- 'Full-time', 'Part-time', 'Contract', 'Internship'
  experience_level VARCHAR(50) NOT NULL, -- 'Entry Level', 'Mid Level', 'Senior Level', 'Executive'
  industry VARCHAR(100) NOT NULL,
  salary_min INTEGER,
  salary_max INTEGER,
  currency VARCHAR(10) DEFAULT 'SAR',
  description TEXT NOT NULL,
  requirements JSONB DEFAULT '[]', -- Array of requirement strings
  benefits JSONB DEFAULT '[]', -- Array of benefit strings
  skills JSONB DEFAULT '[]', -- Array of required skills
  company_size VARCHAR(50), -- 'Startup (1-10)', 'Small (11-50)', etc.
  application_url TEXT, -- External application URL if applicable
  is_remote BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Search optimization
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english', title || ' ' || company || ' ' || description)
  ) STORED
);

-- Indexes for performance
CREATE INDEX idx_opportunities_employer_id ON opportunities(employer_id);
CREATE INDEX idx_opportunities_location ON opportunities(location);
CREATE INDEX idx_opportunities_industry ON opportunities(industry);
CREATE INDEX idx_opportunities_job_type ON opportunities(job_type);
CREATE INDEX idx_opportunities_work_style ON opportunities(work_style);
CREATE INDEX idx_opportunities_experience_level ON opportunities(experience_level);
CREATE INDEX idx_opportunities_is_active ON opportunities(is_active);
CREATE INDEX idx_opportunities_created_at ON opportunities(created_at DESC);
CREATE INDEX idx_opportunities_expires_at ON opportunities(expires_at);
CREATE INDEX idx_opportunities_search_vector ON opportunities USING GIN(search_vector);
CREATE INDEX idx_opportunities_skills ON opportunities USING GIN(skills);
CREATE INDEX idx_opportunities_salary_range ON opportunities(salary_min, salary_max);
```

### 2. Create `talent_applications` Table

```sql
CREATE TABLE IF NOT EXISTS talent_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  talent_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
  cover_letter TEXT NOT NULL,
  portfolio_url TEXT,
  availability VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'reviewed', 'shortlisted', 'rejected', 'hired'
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  
  -- Payment information
  application_fee DECIMAL(10,2),
  discount_code VARCHAR(50),
  discount_amount DECIMAL(10,2),
  final_amount DECIMAL(10,2),
  payment_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'paid', 'failed', 'refunded'
  payment_method VARCHAR(50), -- 'card', 'stc', 'apple', etc.
  payment_reference VARCHAR(255),
  paid_at TIMESTAMP WITH TIME ZONE,
  
  -- Meeting scheduling
  calendly_event_url TEXT,
  meeting_scheduled_at TIMESTAMP WITH TIME ZONE,
  meeting_completed_at TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(talent_id, opportunity_id) -- Prevent duplicate applications
);

-- Indexes
CREATE INDEX idx_talent_applications_talent_id ON talent_applications(talent_id);
CREATE INDEX idx_talent_applications_opportunity_id ON talent_applications(opportunity_id);
CREATE INDEX idx_talent_applications_status ON talent_applications(status);
CREATE INDEX idx_talent_applications_payment_status ON talent_applications(payment_status);
CREATE INDEX idx_talent_applications_applied_at ON talent_applications(applied_at DESC);
```

### 3. Create `saved_opportunities` Table

```sql
CREATE TABLE IF NOT EXISTS saved_opportunities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  talent_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT, -- Personal notes about the opportunity
  
  UNIQUE(talent_id, opportunity_id) -- Prevent duplicate saves
);

-- Indexes
CREATE INDEX idx_saved_opportunities_talent_id ON saved_opportunities(talent_id);
CREATE INDEX idx_saved_opportunities_opportunity_id ON saved_opportunities(opportunity_id);
CREATE INDEX idx_saved_opportunities_saved_at ON saved_opportunities(saved_at DESC);
```

### 4. Create `discount_codes` Table

```sql
CREATE TABLE IF NOT EXISTS discount_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  discount_type VARCHAR(20) NOT NULL, -- 'percentage', 'fixed'
  discount_value DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  usage_limit INTEGER, -- NULL for unlimited
  usage_count INTEGER DEFAULT 0,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  applicable_to VARCHAR(50) DEFAULT 'all', -- 'all', 'new_users', 'students', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_discount_type CHECK (discount_type IN ('percentage', 'fixed')),
  CONSTRAINT valid_discount_value CHECK (
    (discount_type = 'percentage' AND discount_value > 0 AND discount_value <= 100) OR
    (discount_type = 'fixed' AND discount_value > 0)
  )
);

-- Indexes
CREATE UNIQUE INDEX idx_discount_codes_code ON discount_codes(code);
CREATE INDEX idx_discount_codes_is_active ON discount_codes(is_active);
CREATE INDEX idx_discount_codes_valid_until ON discount_codes(valid_until);
```

### 5. Create `talent_payments` Table

```sql
CREATE TABLE IF NOT EXISTS talent_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  talent_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  application_id UUID REFERENCES talent_applications(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'SAR',
  payment_method VARCHAR(50) NOT NULL,
  payment_provider VARCHAR(50), -- 'stripe', 'stc_pay', 'apple_pay', etc.
  payment_reference VARCHAR(255) UNIQUE,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'
  failure_reason TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Provider-specific data
  provider_payment_id VARCHAR(255),
  provider_data JSONB DEFAULT '{}'
);

-- Indexes
CREATE INDEX idx_talent_payments_talent_id ON talent_payments(talent_id);
CREATE INDEX idx_talent_payments_application_id ON talent_payments(application_id);
CREATE INDEX idx_talent_payments_status ON talent_payments(status);
CREATE INDEX idx_talent_payments_created_at ON talent_payments(created_at DESC);
CREATE UNIQUE INDEX idx_talent_payments_reference ON talent_payments(payment_reference);
```

## Talent-Specific Functions

All tables are now created. Next, we set up the functions for talent features.

### 1. Opportunity Search Function

```sql
CREATE OR REPLACE FUNCTION search_opportunities(
  p_search_text TEXT DEFAULT '',
  p_location TEXT[] DEFAULT '{}',
  p_industry TEXT[] DEFAULT '{}',
  p_job_type TEXT[] DEFAULT '{}',
  p_work_style TEXT[] DEFAULT '{}',
  p_experience_level TEXT[] DEFAULT '{}',
  p_min_salary INTEGER DEFAULT 0,
  p_max_salary INTEGER DEFAULT 999999,
  p_is_remote BOOLEAN DEFAULT NULL,
  p_posted_within_days INTEGER DEFAULT NULL,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
) RETURNS TABLE (
  id UUID,
  title VARCHAR,
  company VARCHAR,
  location VARCHAR,
  work_style VARCHAR,
  job_type VARCHAR,
  experience_level VARCHAR,
  industry VARCHAR,
  salary_min INTEGER,
  salary_max INTEGER,
  currency VARCHAR,
  description TEXT,
  requirements JSONB,
  benefits JSONB,
  skills JSONB,
  company_size VARCHAR,
  is_remote BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    o.title,
    o.company,
    o.location,
    o.work_style,
    o.job_type,
    o.experience_level,
    o.industry,
    o.salary_min,
    o.salary_max,
    o.currency,
    o.description,
    o.requirements,
    o.benefits,
    o.skills,
    o.company_size,
    o.is_remote,
    o.created_at,
    o.expires_at
  FROM opportunities o
  WHERE o.is_active = true
    AND (o.expires_at IS NULL OR o.expires_at > NOW())
    AND (p_search_text = '' OR o.search_vector @@ plainto_tsquery('english', p_search_text))
    AND (array_length(p_location, 1) IS NULL OR o.location = ANY(p_location))
    AND (array_length(p_industry, 1) IS NULL OR o.industry = ANY(p_industry))
    AND (array_length(p_job_type, 1) IS NULL OR o.job_type = ANY(p_job_type))
    AND (array_length(p_work_style, 1) IS NULL OR o.work_style = ANY(p_work_style))
    AND (array_length(p_experience_level, 1) IS NULL OR o.experience_level = ANY(p_experience_level))
    AND (o.salary_max IS NULL OR o.salary_max >= p_min_salary)
    AND (o.salary_min IS NULL OR o.salary_min <= p_max_salary)
    AND (p_is_remote IS NULL OR o.is_remote = p_is_remote)
    AND (p_posted_within_days IS NULL OR o.created_at >= NOW() - INTERVAL '1 day' * p_posted_within_days)
  ORDER BY 
    -- Boost search relevance if search text provided
    CASE WHEN p_search_text != '' THEN ts_rank(o.search_vector, plainto_tsquery('english', p_search_text)) ELSE 0 END DESC,
    o.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;
```

### 2. Discount Code Validation Function

```sql
CREATE OR REPLACE FUNCTION validate_discount_code(
  p_code VARCHAR(50),
  p_user_id UUID DEFAULT NULL
) RETURNS TABLE (
  is_valid BOOLEAN,
  discount_type VARCHAR(20),
  discount_value DECIMAL(10,2),
  description TEXT,
  error_message TEXT
) AS $$
DECLARE
  v_discount RECORD;
  v_usage_count INTEGER;
BEGIN
  -- Get discount code details
  SELECT * INTO v_discount
  FROM discount_codes
  WHERE code = UPPER(p_code) AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::VARCHAR(20), NULL::DECIMAL(10,2), NULL::TEXT, 'Invalid discount code'::TEXT;
    RETURN;
  END IF;
  
  -- Check if expired
  IF v_discount.valid_until IS NOT NULL AND v_discount.valid_until < NOW() THEN
    RETURN QUERY SELECT false, NULL::VARCHAR(20), NULL::DECIMAL(10,2), NULL::TEXT, 'Discount code has expired'::TEXT;
    RETURN;
  END IF;
  
  -- Check if not yet valid
  IF v_discount.valid_from > NOW() THEN
    RETURN QUERY SELECT false, NULL::VARCHAR(20), NULL::DECIMAL(10,2), NULL::TEXT, 'Discount code is not yet active'::TEXT;
    RETURN;
  END IF;
  
  -- Check usage limit
  IF v_discount.usage_limit IS NOT NULL AND v_discount.usage_count >= v_discount.usage_limit THEN
    RETURN QUERY SELECT false, NULL::VARCHAR(20), NULL::DECIMAL(10,2), NULL::TEXT, 'Discount code has reached its usage limit'::TEXT;
    RETURN;
  END IF;
  
  -- Additional checks for user-specific restrictions can be added here
  -- For example, check if user has already used this code
  
  -- If all checks pass
  RETURN QUERY SELECT 
    true,
    v_discount.discount_type,
    v_discount.discount_value,
    v_discount.description,
    NULL::TEXT;
END;
$$ LANGUAGE plpgsql;
```

### 3. Application Creation Function

```sql
CREATE OR REPLACE FUNCTION create_application(
  p_talent_id UUID,
  p_opportunity_id UUID,
  p_cover_letter TEXT,
  p_portfolio_url TEXT DEFAULT NULL,
  p_availability VARCHAR(255) DEFAULT NULL,
  p_application_fee DECIMAL(10,2) DEFAULT 99.00,
  p_discount_code VARCHAR(50) DEFAULT NULL
) RETURNS TABLE (
  application_id UUID,
  final_amount DECIMAL(10,2),
  success BOOLEAN,
  error_message TEXT
) AS $$
DECLARE
  v_application_id UUID;
  v_discount RECORD;
  v_discount_amount DECIMAL(10,2) := 0;
  v_final_amount DECIMAL(10,2);
BEGIN
  -- Check if application already exists
  IF EXISTS (
    SELECT 1 FROM talent_applications 
    WHERE talent_id = p_talent_id AND opportunity_id = p_opportunity_id
  ) THEN
    RETURN QUERY SELECT NULL::UUID, NULL::DECIMAL(10,2), false, 'You have already applied to this opportunity'::TEXT;
    RETURN;
  END IF;
  
  -- Validate discount code if provided
  IF p_discount_code IS NOT NULL THEN
    SELECT * INTO v_discount
    FROM validate_discount_code(p_discount_code, p_talent_id);
    
    IF NOT v_discount.is_valid THEN
      RETURN QUERY SELECT NULL::UUID, NULL::DECIMAL(10,2), false, v_discount.error_message;
      RETURN;
    END IF;
    
    -- Calculate discount amount
    IF v_discount.discount_type = 'percentage' THEN
      v_discount_amount := p_application_fee * (v_discount.discount_value / 100);
    ELSE
      v_discount_amount := v_discount.discount_value;
    END IF;
  END IF;
  
  -- Calculate final amount
  v_final_amount := GREATEST(0, p_application_fee - v_discount_amount);
  
  -- Create application
  INSERT INTO talent_applications (
    talent_id,
    opportunity_id,
    cover_letter,
    portfolio_url,
    availability,
    application_fee,
    discount_code,
    discount_amount,
    final_amount
  ) VALUES (
    p_talent_id,
    p_opportunity_id,
    p_cover_letter,
    p_portfolio_url,
    p_availability,
    p_application_fee,
    p_discount_code,
    v_discount_amount,
    v_final_amount
  ) RETURNING id INTO v_application_id;
  
  -- Update discount code usage if applied
  IF p_discount_code IS NOT NULL THEN
    UPDATE discount_codes 
    SET usage_count = usage_count + 1
    WHERE code = UPPER(p_discount_code);
  END IF;
  
  RETURN QUERY SELECT v_application_id, v_final_amount, true, NULL::TEXT;
END;
$$ LANGUAGE plpgsql;
```

## Row Level Security (RLS) Policies

### 1. Opportunities Table Policies

```sql
-- Enable RLS
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;

-- All users can view active opportunities
CREATE POLICY opportunities_public_read ON opportunities
  FOR SELECT USING (is_active = true AND (expires_at IS NULL OR expires_at > NOW()));

-- Only employers can manage their own opportunities
CREATE POLICY opportunities_employer_manage ON opportunities
  FOR ALL USING (employer_id = auth.uid());
```

### 2. Talent Applications Table Policies

```sql
-- Enable RLS
ALTER TABLE talent_applications ENABLE ROW LEVEL SECURITY;

-- Talents can only see their own applications
CREATE POLICY talent_applications_talent_policy ON talent_applications
  FOR ALL USING (talent_id = auth.uid());

-- Employers can see applications for their opportunities
CREATE POLICY talent_applications_employer_policy ON talent_applications
  FOR SELECT USING (
    opportunity_id IN (
      SELECT id FROM opportunities WHERE employer_id = auth.uid()
    )
  );
```

### 3. Saved Opportunities Table Policies

```sql
-- Enable RLS
ALTER TABLE saved_opportunities ENABLE ROW LEVEL SECURITY;

-- Talents can only manage their own saved opportunities
CREATE POLICY saved_opportunities_policy ON saved_opportunities
  FOR ALL USING (talent_id = auth.uid());
```

### 4. Talent Payments Table Policies

```sql
-- Enable RLS
ALTER TABLE talent_payments ENABLE ROW LEVEL SECURITY;

-- Talents can only see their own payments
CREATE POLICY talent_payments_policy ON talent_payments
  FOR ALL USING (talent_id = auth.uid());
```

## Sample Data Setup

### 1. Insert Sample Discount Codes

```sql
INSERT INTO discount_codes (code, description, discount_type, discount_value, applicable_to) VALUES
('TALENT20', '20% off application fee', 'percentage', 20, 'all'),
('NEWUSER', 'SAR 50 off for new users', 'fixed', 50, 'new_users'),
('STUDENT', '50% student discount', 'percentage', 50, 'students'),
('WELCOME', 'Welcome bonus - Free application', 'percentage', 100, 'new_users');
```

### 2. Insert Sample Opportunities (Optional)

```sql
-- Only run this if you want sample data
-- You'll need to replace the employer_id with an actual employer's auth.users.id
/*
INSERT INTO opportunities (
  employer_id, title, company, location, work_style, job_type, experience_level,
  industry, salary_min, salary_max, description, requirements, benefits, skills,
  company_size, is_remote
) VALUES
(
  'REPLACE_WITH_ACTUAL_EMPLOYER_USER_ID', -- Get this from auth.users table
  'Senior Frontend Developer',
  'TechCorp Saudi',
  'Riyadh',
  'Hybrid',
  'Full-time',
  'Senior Level',
  'Technology',
  15000,
  25000,
  'We are looking for a Senior Frontend Developer to join our dynamic team.',
  '["5+ years of React experience", "Strong TypeScript skills", "Experience with modern CSS frameworks"]',
  '["Health Insurance", "Annual Bonus", "Flexible Hours", "Professional Development"]',
  '["React", "TypeScript", "CSS", "JavaScript", "Git", "Tailwind CSS"]',
  'Medium (51-200)',
  false
);
*/
```

## Integration Requirements

### 1. Payment Gateway Setup

For production implementation, you'll need to set up payment gateways:

#### Stripe Integration (International Cards)
```javascript
// Install Stripe
npm install @stripe/stripe-js stripe

// Environment variables
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### STC Pay Integration (Saudi Arabia)
```javascript
// STC Pay API credentials
STC_PAY_MERCHANT_ID=your_merchant_id
STC_PAY_API_KEY=your_api_key
STC_PAY_WEBHOOK_SECRET=your_webhook_secret
```

### 2. Calendly Integration

```javascript
// Environment variables for Calendly
CALENDLY_API_TOKEN=your_calendly_token
CALENDLY_EVENT_TYPE_UUID=your_event_type_uuid
CALENDLY_WEBHOOK_SECRET=your_webhook_secret
```

### 3. Email Service Setup

For application notifications and confirmations:

```javascript
// Email service (SendGrid, AWS SES, etc.)
EMAIL_SERVICE_API_KEY=your_email_api_key
EMAIL_FROM_ADDRESS=noreply@ftn-find.com
EMAIL_TEMPLATE_APPLICATION_RECEIVED=d-...
EMAIL_TEMPLATE_PAYMENT_CONFIRMATION=d-...
```

## Required API Endpoints

### 1. Opportunity Management
- `GET /api/opportunities` - Search and filter opportunities
- `GET /api/opportunities/[id]` - Get opportunity details
- `POST /api/opportunities/[id]/save` - Save opportunity
- `DELETE /api/opportunities/[id]/save` - Unsave opportunity

### 2. Application Management
- `POST /api/applications` - Create application
- `GET /api/applications` - Get user's applications
- `GET /api/applications/[id]` - Get application details
- `PATCH /api/applications/[id]` - Update application status

### 3. Payment Processing
- `POST /api/payments/create-intent` - Create payment intent
- `POST /api/payments/confirm` - Confirm payment
- `POST /api/payments/webhook` - Handle payment webhooks
- `GET /api/payments/[id]` - Get payment details

### 4. Discount Codes
- `POST /api/discount-codes/validate` - Validate discount code
- `GET /api/discount-codes` - Get available codes (admin)

### 5. Meeting Scheduling
- `POST /api/calendly/schedule` - Schedule meeting
- `POST /api/calendly/webhook` - Handle Calendly webhooks
- `GET /api/meetings` - Get user's scheduled meetings

## Monitoring and Analytics

### 1. Application Metrics
- Track application conversion rates
- Monitor payment success rates
- Analyze popular discount codes
- Measure time-to-hire metrics

### 2. Performance Monitoring
- Database query performance for opportunity search
- Payment processing times
- User engagement with filtering features

### 3. Error Tracking
- Payment failures and reasons
- Application submission errors
- Calendly integration issues

## Security Considerations

### 1. Payment Security
- PCI compliance for card processing
- Secure webhook signature validation
- Encrypted storage of payment references

### 2. Data Protection
- Personal data encryption
- GDPR compliance for international users
- Audit trails for sensitive operations

### 3. Rate Limiting
- Application submission limits
- Payment attempt restrictions
- API endpoint rate limiting

## Backup and Recovery

### 1. Critical Data
- Application data and status
- Payment records and receipts
- Scheduled meeting information

### 2. Recovery Procedures
- Point-in-time recovery for payment data
- Application data restoration
- Integration state recovery

This comprehensive setup ensures a robust, scalable, and secure talent application system with integrated payment processing and meeting scheduling capabilities.

