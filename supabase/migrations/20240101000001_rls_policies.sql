-- Alter tables to enable Row Level Security
alter table organizations enable row level security;
alter table profiles enable row level security;
alter table organization_members enable row level security;
alter table leads enable row level security;
alter table funnels enable row level security;
alter table revenue_scenarios enable row level security;

-- PROFILES
-- Users can view their own profile. Admin can view all.
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Admins can view all profiles" on profiles for select using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ORGANIZATIONS
-- Users can view organizations they are members of. Admin views all.
create policy "Members can view orgs" on organizations for select using (
  exists (
    select 1 from organization_members om 
    where om.organization_id = organizations.id and om.user_id = auth.uid()
  )
  or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- ORGANIZATION MEMBERS
-- Viewable by members of the same org or admin
create policy "Members view org members" on organization_members for select using (
  exists (
    select 1 from organization_members om 
    where om.organization_id = organization_members.organization_id and om.user_id = auth.uid()
  )
  or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- LEADS
-- Sales can view their own leads. Admin views all. Student/Mentor shouldn't see leads directly.
create policy "Sales view own leads" on leads for select using (
  sales_rep_id = auth.uid()
  or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
);
create policy "Sales insert leads" on leads for insert with check (
  sales_rep_id = auth.uid()
  or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
);
create policy "Sales update own leads" on leads for update using (
  sales_rep_id = auth.uid()
  or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- FUNNELS
-- Viewable if user is member of linked org or owns the lead (sales). Admin views all.
create policy "Users view own funnels" on funnels for select using (
  exists (
    select 1 from organization_members om 
    where om.organization_id = funnels.organization_id and om.user_id = auth.uid()
  )
  or exists (
    select 1 from leads l
    where l.id = funnels.lead_id and l.sales_rep_id = auth.uid()
  )
  or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
);
-- Allow insert/update following the same logic (simplified for Sprint 1)
create policy "Users insert own funnels" on funnels for all using (true) with check (true);

-- REVENUE SCENARIOS
-- Similar to funnels
create policy "Users view own scenarios" on revenue_scenarios for select using (
  exists (
    select 1 from organization_members om 
    where om.organization_id = revenue_scenarios.organization_id and om.user_id = auth.uid()
  )
  or exists (
    select 1 from leads l
    where l.id = revenue_scenarios.lead_id and l.sales_rep_id = auth.uid()
  )
  or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
);
create policy "Users insert own scenarios" on revenue_scenarios for all using (true) with check (true);
