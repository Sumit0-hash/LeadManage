/*
  # Lead Management System Database Schema

  1. New Tables
    - `leads`
      - `id` (uuid, primary key)
      - `first_name` (text, required)
      - `last_name` (text, required)
      - `email` (text, unique, required)
      - `phone` (text)
      - `company` (text)
      - `city` (text)
      - `state` (text)
      - `source` (enum: website, facebook_ads, google_ads, referral, events, other)
      - `status` (enum: new, contacted, qualified, lost, won)
      - `score` (integer 0-100, default 0)
      - `lead_value` (numeric, default 0)
      - `last_activity_at` (timestamptz, nullable)
      - `is_qualified` (boolean, default false)
      - `created_at` (timestamptz, default now)
      - `updated_at` (timestamptz, default now)
      - `user_id` (uuid, foreign key to auth.users)

  2. Security
    - Enable RLS on `leads` table
    - Add policies for authenticated users to manage their own leads
    
  3. Indexes
    - Add indexes for common query patterns
*/

-- Create custom types for enums
CREATE TYPE lead_source AS ENUM ('website', 'facebook_ads', 'google_ads', 'referral', 'events', 'other');
CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'qualified', 'lost', 'won');

-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  company text,
  city text,
  state text,
  source lead_source DEFAULT 'website',
  status lead_status DEFAULT 'new',
  score integer DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  lead_value numeric DEFAULT 0,
  last_activity_at timestamptz,
  is_qualified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own leads"
  ON leads
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own leads"
  ON leads
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own leads"
  ON leads
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own leads"
  ON leads
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS leads_user_id_idx ON leads(user_id);
CREATE INDEX IF NOT EXISTS leads_email_idx ON leads(email);
CREATE INDEX IF NOT EXISTS leads_status_idx ON leads(status);
CREATE INDEX IF NOT EXISTS leads_source_idx ON leads(source);
CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads(created_at);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();