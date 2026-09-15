-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Enum for User Roles
create type user_role as enum ('admin', 'sales', 'mentor', 'student');

-- 1. Organizations
create table organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  segment text,
  website text,
  monthly_revenue numeric,
  revenue_goal numeric,
  employees_count text,
  city text,
  state text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Profiles (Extends auth.users)
create table profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  role user_role default 'student'::user_role not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Trigger for creating a profile automatically when a user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', coalesce((new.raw_user_meta_data->>'role')::user_role, 'student'::user_role));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. Organization Members
create table organization_members (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  role user_role not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (organization_id, user_id)
);

-- 4. Leads (For Commercial Diagnosis)
create table leads (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) on delete set null,
  sales_rep_id uuid references profiles(id) on delete set null,
  
  -- Context
  contact_name text not null,
  company_name text not null,
  role text,
  segment text,
  
  -- Financial
  current_revenue numeric,
  revenue_goal numeric,
  average_ticket numeric,
  
  -- Acquisition
  monthly_investment numeric,
  leads_per_month integer,
  main_channels text[],
  
  -- Commercial
  mqls_per_month integer,
  opportunities_per_month integer,
  sales_per_month integer,
  
  -- Client
  is_recurring boolean default false,
  ltv numeric,
  
  -- Status
  status text default 'new' not null, -- new, diagnosing, converted, lost
  conversion_notes text,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Funnels (Current Funnel)
create table funnels (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) on delete cascade,
  lead_id uuid references leads(id) on delete cascade, -- if still in diagnosis phase
  
  total_leads integer default 0,
  mqls integer default 0,
  opportunities integer default 0,
  sales integer default 0,
  average_ticket numeric default 0,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Ensure it belongs to either an org or a lead
  constraint chk_funnel_owner check (organization_id is not null or lead_id is not null)
);

-- 6. Revenue Scenarios (Funil Reverso)
create table revenue_scenarios (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) on delete cascade,
  lead_id uuid references leads(id) on delete cascade,
  
  scenario_type text not null, -- 'current', 'goal', 'optimized'
  
  revenue_goal numeric,
  average_ticket numeric,
  conversion_opp_to_sale numeric,
  conversion_mql_to_opp numeric,
  conversion_lead_to_mql numeric,
  cost_per_lead numeric,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
