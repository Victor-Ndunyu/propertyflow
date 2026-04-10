create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce(auth.jwt() ->> 'role' = 'admin', false)
    or coalesce(auth.jwt() -> 'app_metadata' ->> 'role' = 'admin', false);
$$;

create table if not exists public.agent_profiles (
  agent_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  agency_name text not null default 'Independent',
  phone text,
  license_number text,
  operating_market text,
  verification_status text not null default 'unverified'
    check (verification_status in ('unverified', 'under_review', 'verified', 'needs_info', 'suspended')),
  verification_tier text not null default 'basic'
    check (verification_tier in ('basic', 'verified', 'priority', 'enterprise')),
  trust_score integer not null default 50 check (trust_score between 0 and 100),
  escrow_enabled boolean not null default false,
  commission_hold_percentage numeric(5,2) not null default 2.00 check (commission_hold_percentage >= 0 and commission_hold_percentage <= 100),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.agent_verifications (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agent_profiles(agent_id) on delete cascade,
  legal_name text not null,
  agency_name text not null,
  phone text not null,
  license_number text not null,
  license_region text not null,
  document_url text not null,
  selfie_url text,
  notes text,
  status text not null default 'under_review'
    check (status in ('under_review', 'approved', 'rejected', 'needs_info')),
  risk_score integer not null default 0 check (risk_score between 0 and 100),
  submitted_at timestamptz not null default timezone('utc', now()),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id)
);

create table if not exists public.deals (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  agent_id uuid not null references public.agent_profiles(agent_id) on delete cascade,
  client_name text not null,
  client_email text,
  client_phone text,
  agreed_amount numeric(14,2) not null check (agreed_amount > 0),
  currency text not null default 'USD',
  commission_rate numeric(6,4) not null default 0.0200 check (commission_rate >= 0 and commission_rate <= 1),
  commission_amount numeric(14,2) generated always as (round(agreed_amount * commission_rate, 2)) stored,
  escrow_required boolean not null default true,
  stage text not null default 'lead'
    check (stage in ('lead', 'offer', 'contract_signed', 'escrow_funded', 'closing', 'completed', 'cancelled')),
  escrow_status text not null default 'pending'
    check (escrow_status in ('pending', 'funded', 'holding', 'released', 'refunded')),
  commission_status text not null default 'locked'
    check (commission_status in ('locked', 'due', 'collected', 'released', 'at_risk')),
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  closed_at timestamptz
);

create table if not exists public.escrow_milestones (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references public.deals(id) on delete cascade,
  label text not null,
  amount numeric(14,2) not null check (amount >= 0),
  due_at timestamptz,
  completed_at timestamptz,
  status text not null default 'pending'
    check (status in ('pending', 'funded', 'released', 'complete', 'overdue')),
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.commission_events (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references public.deals(id) on delete cascade,
  amount numeric(14,2) not null check (amount >= 0),
  status text not null default 'locked'
    check (status in ('locked', 'due', 'collected', 'released', 'at_risk')),
  due_at timestamptz,
  settled_at timestamptz,
  external_reference text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.risk_alerts (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references public.agent_profiles(agent_id) on delete set null,
  property_id uuid references public.properties(id) on delete set null,
  deal_id uuid references public.deals(id) on delete set null,
  category text not null
    check (category in ('anti_circumvention', 'commission', 'verification', 'escrow', 'compliance')),
  severity text not null default 'medium'
    check (severity in ('low', 'medium', 'high', 'critical')),
  score integer not null default 50 check (score between 0 and 100),
  title text not null,
  description text not null,
  signal_source text not null default 'automation'
    check (signal_source in ('automation', 'agent', 'admin', 'system')),
  status text not null default 'open'
    check (status in ('open', 'monitoring', 'resolved', 'dismissed')),
  fingerprint text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  resolved_at timestamptz,
  resolved_by uuid references auth.users(id)
);

create unique index if not exists risk_alerts_fingerprint_key
  on public.risk_alerts (fingerprint)
  where fingerprint is not null;

create index if not exists deals_agent_id_created_at_idx
  on public.deals (agent_id, created_at desc);

create index if not exists deals_property_id_idx
  on public.deals (property_id);

create index if not exists escrow_milestones_deal_id_sort_order_idx
  on public.escrow_milestones (deal_id, sort_order);

create index if not exists commission_events_deal_id_idx
  on public.commission_events (deal_id);

create index if not exists risk_alerts_status_created_at_idx
  on public.risk_alerts (status, created_at desc);

create or replace function public.sync_profile_verification_status()
returns trigger
language plpgsql
as $$
begin
  update public.agent_profiles
  set
    full_name = coalesce(nullif(new.legal_name, ''), full_name),
    agency_name = coalesce(nullif(new.agency_name, ''), agency_name),
    phone = coalesce(nullif(new.phone, ''), phone),
    license_number = coalesce(nullif(new.license_number, ''), license_number),
    operating_market = coalesce(nullif(new.license_region, ''), operating_market),
    verification_status = case
      when new.status = 'approved' then 'verified'
      when new.status in ('rejected', 'needs_info') then 'needs_info'
      else 'under_review'
    end,
    verification_tier = case
      when new.status = 'approved' then 'verified'
      else verification_tier
    end,
    trust_score = greatest(
      0,
      least(
        100,
        case
          when new.status = 'approved' then 92 - least(new.risk_score, 40) / 5
          when new.status = 'needs_info' then 62 - least(new.risk_score, 30) / 6
          when new.status = 'rejected' then 45 - least(new.risk_score, 30) / 4
          else 70 - least(new.risk_score, 40) / 4
        end
      )
    )
  where agent_id = new.agent_id;

  return new;
end;
$$;

create or replace function public.sync_deal_lifecycle()
returns trigger
language plpgsql
as $$
begin
  if new.stage = 'completed' and coalesce(old.stage, '') <> 'completed' then
    new.closed_at = coalesce(new.closed_at, timezone('utc', now()));
    new.escrow_status = 'released';
  end if;

  if new.stage = 'escrow_funded' and new.escrow_status = 'pending' then
    new.escrow_status = 'funded';
  end if;

  if new.stage = 'contract_signed' and new.commission_status = 'locked' then
    new.commission_status = 'due';
  end if;

  return new;
end;
$$;

create or replace function public.bootstrap_deal_workflow()
returns trigger
language plpgsql
as $$
begin
  insert into public.commission_events (deal_id, amount, status, due_at)
  values (
    new.id,
    new.commission_amount,
    case when new.stage in ('contract_signed', 'escrow_funded', 'closing', 'completed') then 'due' else 'locked' end,
    timezone('utc', now()) + interval '7 days'
  )
  on conflict do nothing;

  if new.escrow_required then
    insert into public.escrow_milestones (deal_id, label, amount, due_at, sort_order)
    values
      (new.id, 'Earnest deposit secured', round(new.agreed_amount * 0.10, 2), timezone('utc', now()) + interval '3 days', 1),
      (new.id, 'Escrow midpoint release', round(new.agreed_amount * 0.40, 2), timezone('utc', now()) + interval '14 days', 2),
      (new.id, 'Final settlement release', round(new.agreed_amount * 0.50, 2), timezone('utc', now()) + interval '30 days', 3)
    on conflict do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists agent_profiles_set_updated_at on public.agent_profiles;
create trigger agent_profiles_set_updated_at
before update on public.agent_profiles
for each row
execute function public.set_updated_at();

drop trigger if exists deals_set_updated_at on public.deals;
create trigger deals_set_updated_at
before update on public.deals
for each row
execute function public.set_updated_at();

drop trigger if exists deals_sync_lifecycle on public.deals;
create trigger deals_sync_lifecycle
before update on public.deals
for each row
execute function public.sync_deal_lifecycle();

drop trigger if exists deals_bootstrap_workflow on public.deals;
create trigger deals_bootstrap_workflow
after insert on public.deals
for each row
execute function public.bootstrap_deal_workflow();

drop trigger if exists commission_events_set_updated_at on public.commission_events;
create trigger commission_events_set_updated_at
before update on public.commission_events
for each row
execute function public.set_updated_at();

drop trigger if exists risk_alerts_set_updated_at on public.risk_alerts;
create trigger risk_alerts_set_updated_at
before update on public.risk_alerts
for each row
execute function public.set_updated_at();

drop trigger if exists sync_profile_verification_status_trigger on public.agent_verifications;
create trigger sync_profile_verification_status_trigger
after insert or update on public.agent_verifications
for each row
execute function public.sync_profile_verification_status();

alter table public.agent_profiles enable row level security;
alter table public.agent_verifications enable row level security;
alter table public.deals enable row level security;
alter table public.escrow_milestones enable row level security;
alter table public.commission_events enable row level security;
alter table public.risk_alerts enable row level security;

drop policy if exists "agent profiles are readable" on public.agent_profiles;
create policy "agent profiles are readable"
  on public.agent_profiles
  for select
  using (true);

drop policy if exists "agents manage their own profile" on public.agent_profiles;
create policy "agents manage their own profile"
  on public.agent_profiles
  for all
  using (auth.uid() = agent_id or public.is_admin())
  with check (auth.uid() = agent_id or public.is_admin());

drop policy if exists "agent verification visibility" on public.agent_verifications;
create policy "agent verification visibility"
  on public.agent_verifications
  for select
  using (auth.uid() = agent_id or public.is_admin());

drop policy if exists "agents submit verification packets" on public.agent_verifications;
create policy "agents submit verification packets"
  on public.agent_verifications
  for insert
  with check (auth.uid() = agent_id or public.is_admin());

drop policy if exists "verification packets can be updated by owner or admin" on public.agent_verifications;
create policy "verification packets can be updated by owner or admin"
  on public.agent_verifications
  for update
  using (auth.uid() = agent_id or public.is_admin())
  with check (auth.uid() = agent_id or public.is_admin());

drop policy if exists "deals visible to assigned agent or admin" on public.deals;
create policy "deals visible to assigned agent or admin"
  on public.deals
  for select
  using (auth.uid() = agent_id or public.is_admin());

drop policy if exists "deals managed by assigned agent or admin" on public.deals;
create policy "deals managed by assigned agent or admin"
  on public.deals
  for all
  using (auth.uid() = agent_id or public.is_admin())
  with check (auth.uid() = agent_id or public.is_admin());

drop policy if exists "escrow milestones visible to assigned agent or admin" on public.escrow_milestones;
create policy "escrow milestones visible to assigned agent or admin"
  on public.escrow_milestones
  for select
  using (
    exists (
      select 1
      from public.deals
      where public.deals.id = escrow_milestones.deal_id
        and (public.deals.agent_id = auth.uid() or public.is_admin())
    )
  );

drop policy if exists "escrow milestones managed by assigned agent or admin" on public.escrow_milestones;
create policy "escrow milestones managed by assigned agent or admin"
  on public.escrow_milestones
  for all
  using (
    exists (
      select 1
      from public.deals
      where public.deals.id = escrow_milestones.deal_id
        and (public.deals.agent_id = auth.uid() or public.is_admin())
    )
  )
  with check (
    exists (
      select 1
      from public.deals
      where public.deals.id = escrow_milestones.deal_id
        and (public.deals.agent_id = auth.uid() or public.is_admin())
    )
  );

drop policy if exists "commission events visible to assigned agent or admin" on public.commission_events;
create policy "commission events visible to assigned agent or admin"
  on public.commission_events
  for select
  using (
    exists (
      select 1
      from public.deals
      where public.deals.id = commission_events.deal_id
        and (public.deals.agent_id = auth.uid() or public.is_admin())
    )
  );

drop policy if exists "commission events managed by admin or assigned agent" on public.commission_events;
create policy "commission events managed by admin or assigned agent"
  on public.commission_events
  for all
  using (
    exists (
      select 1
      from public.deals
      where public.deals.id = commission_events.deal_id
        and (public.deals.agent_id = auth.uid() or public.is_admin())
    )
  )
  with check (
    exists (
      select 1
      from public.deals
      where public.deals.id = commission_events.deal_id
        and (public.deals.agent_id = auth.uid() or public.is_admin())
    )
  );

drop policy if exists "risk alerts visible to assigned agent or admin" on public.risk_alerts;
create policy "risk alerts visible to assigned agent or admin"
  on public.risk_alerts
  for select
  using (auth.uid() = agent_id or public.is_admin());

drop policy if exists "risk alerts created by assigned agent or admin" on public.risk_alerts;
create policy "risk alerts created by assigned agent or admin"
  on public.risk_alerts
  for insert
  with check (auth.uid() = agent_id or public.is_admin());

drop policy if exists "risk alerts updated by assigned agent or admin" on public.risk_alerts;
create policy "risk alerts updated by assigned agent or admin"
  on public.risk_alerts
  for update
  using (auth.uid() = agent_id or public.is_admin())
  with check (auth.uid() = agent_id or public.is_admin());
