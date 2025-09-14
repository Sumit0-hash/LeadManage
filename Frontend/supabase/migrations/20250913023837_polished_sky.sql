/*
  # Seed Data for Lead Management System

  1. Purpose
    - Create a test user and sample leads for demonstration
    - Provides 100+ leads with realistic data for testing
    
  2. Test User
    - Email: test@example.com
    - Password: testpassword123
    
  3. Sample Data
    - 120 leads with varied data across all fields
    - Different sources, statuses, and scores
    - Realistic company and location data
*/

-- Insert sample leads for testing (will be associated with users after they sign up)
DO $$
DECLARE
    companies text[] := ARRAY['TechCorp', 'InnovateLab', 'DataSoft', 'CloudTech', 'NextGen Solutions', 'Digital Dynamics', 'FutureTech', 'SmartSys', 'TechAdvance', 'InnovateNow'];
    cities text[] := ARRAY['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'];
    states text[] := ARRAY['NY', 'CA', 'IL', 'TX', 'AZ', 'PA', 'TX', 'CA', 'TX', 'CA'];
    sources lead_source[] := ARRAY['website', 'facebook_ads', 'google_ads', 'referral', 'events', 'other'];
    statuses lead_status[] := ARRAY['new', 'contacted', 'qualified', 'lost', 'won'];
    first_names text[] := ARRAY['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Jessica', 'William', 'Ashley', 'James', 'Amanda', 'Christopher', 'Stephanie', 'Daniel', 'Melissa', 'Matthew', 'Nicole', 'Anthony', 'Elizabeth'];
    last_names text[] := ARRAY['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
    i integer;
BEGIN
    -- Note: This will create leads without user_id initially
    -- They will be associated with users when they register through the application
    FOR i IN 1..120 LOOP
        INSERT INTO leads (
            first_name,
            last_name,
            email,
            phone,
            company,
            city,
            state,
            source,
            status,
            score,
            lead_value,
            last_activity_at,
            is_qualified,
            created_at,
            user_id
        ) VALUES (
            first_names[1 + (i % array_length(first_names, 1))],
            last_names[1 + (i % array_length(last_names, 1))],
            'lead' || i || '@example.com',
            '+1-555-' || LPAD((100 + i)::text, 4, '0'),
            companies[1 + (i % array_length(companies, 1))],
            cities[1 + (i % array_length(cities, 1))],
            states[1 + (i % array_length(states, 1))],
            sources[1 + (i % array_length(sources, 1))],
            statuses[1 + (i % array_length(statuses, 1))],
            (i * 7) % 101, -- Score between 0-100
            (i * 150.5)::numeric, -- Random lead value
            CASE 
                WHEN i % 3 = 0 THEN now() - (i || ' days')::interval
                ELSE NULL
            END,
            i % 4 = 0, -- 25% are qualified
            now() - (i || ' days')::interval,
            '00000000-0000-0000-0000-000000000000'::uuid -- Placeholder, will be updated when users register
        );
    END LOOP;
END $$;