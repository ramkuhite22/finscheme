-- FinScheme Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor to set up the necessary tables and RLS policies.

-- 1. Survey Submissions Table
CREATE TABLE IF NOT EXISTS public.survey_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    submitted_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    survey_name TEXT NOT NULL,
    session_id TEXT,
    full_name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    age_group TEXT,
    gender TEXT,
    state TEXT,
    livelihood TEXT,
    household_income TEXT,
    awareness_education_loan TEXT,
    receiving_scholarship TEXT,
    improved_circle_count TEXT,
    participation_barrier TEXT,
    reliance_decrease TEXT,
    apply_method TEXT,
    informed_level TEXT,
    transparent_terms TEXT,
    lost_wages TEXT,
    dbt_middlemen_removed TEXT,
    dbt_linked TEXT,
    financial_aid_reduced_burden TEXT,
    budget_use_good TEXT,
    benefit_type_impact TEXT,
    subsidy_lowers_bills TEXT,
    preference_type TEXT,
    tech_investment_likelihood TEXT,
    notes TEXT,
    page_url TEXT,
    referrer TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    utm_content TEXT,
    utm_term TEXT,
    locale TEXT,
    timezone TEXT,
    screen_size TEXT,
    user_agent TEXT
);

-- Enable Row Level Security
ALTER TABLE public.survey_submissions ENABLE ROW LEVEL SECURITY;

-- Create Policies
-- Allow anyone to insert survey responses (public submissions)
CREATE POLICY "Allow public insert" 
ON public.survey_submissions 
FOR INSERT 
WITH CHECK (true);

-- Allow authenticated users (e.g. staff/dashboard) to view submissions
CREATE POLICY "Allow authenticated read" 
ON public.survey_submissions 
FOR SELECT 
TO authenticated 
USING (true);


-- 2. Saved Schemes Table (Bookmarking)
CREATE TABLE IF NOT EXISTS public.saved_schemes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    scheme_name TEXT NOT NULL,
    category TEXT,
    saved_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE (user_id, scheme_name)
);

-- Enable Row Level Security
ALTER TABLE public.saved_schemes ENABLE ROW LEVEL SECURITY;

-- Create Policies
-- Users can manage their own saved schemes
CREATE POLICY "Allow users to manage own saved schemes" 
ON public.saved_schemes 
FOR ALL 
TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Create Indexes for performance
CREATE INDEX IF NOT EXISTS idx_survey_submissions_email ON public.survey_submissions(email);
CREATE INDEX IF NOT EXISTS idx_saved_schemes_user_id ON public.saved_schemes(user_id);
