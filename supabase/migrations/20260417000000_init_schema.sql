-- AppetiteIQ initial schema
--
-- Creates carriers, agents, underwriting rules, risk submissions,
-- carrier matches, and submission outcomes. All tables use uuid PKs
-- and timestamptz for time columns. RLS is enabled on every table
-- with baseline policies — tighten these as auth roles firm up.

set search_path = public;

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type rule_type as enum ('hard_stop', 'preference', 'required');
create type rule_operator as enum ('eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'in', 'not_in', 'contains', 'between');
create type submission_outcome_kind as enum ('quoted', 'bound', 'declined', 'withdrawn', 'pending');

-- ---------------------------------------------------------------------------
-- carriers
-- ---------------------------------------------------------------------------

create table carriers (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    slug text not null unique,
    logo_url text,
    appetite_notes text,
    active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index carriers_active_idx on carriers (active) where active;

-- ---------------------------------------------------------------------------
-- agents (linked to auth.users)
-- ---------------------------------------------------------------------------

create table agents (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null unique references auth.users (id) on delete cascade,
    agency_name text,
    email text not null unique,
    created_at timestamptz not null default now()
);

create index agents_email_idx on agents (email);

-- ---------------------------------------------------------------------------
-- underwriting_rules
-- ---------------------------------------------------------------------------

create table underwriting_rules (
    id uuid primary key default gen_random_uuid(),
    carrier_id uuid not null references carriers (id) on delete cascade,
    rule_type rule_type not null,
    field text not null,
    operator rule_operator not null,
    value jsonb not null,
    weight numeric(6, 3) not null default 1.0,
    created_at timestamptz not null default now()
);

create index underwriting_rules_carrier_idx on underwriting_rules (carrier_id);
create index underwriting_rules_field_idx on underwriting_rules (field);

-- ---------------------------------------------------------------------------
-- risk_submissions
-- ---------------------------------------------------------------------------

create table risk_submissions (
    id uuid primary key default gen_random_uuid(),
    agent_id uuid not null references agents (id) on delete cascade,
    property_type text not null,
    location text not null,
    year_built integer,
    num_units integer,
    occupancy_type text,
    claim_history jsonb not null default '[]'::jsonb,
    created_at timestamptz not null default now(),
    check (year_built is null or (year_built between 1700 and extract(year from now())::int + 1)),
    check (num_units is null or num_units >= 0)
);

create index risk_submissions_agent_idx on risk_submissions (agent_id);
create index risk_submissions_created_idx on risk_submissions (created_at desc);

-- ---------------------------------------------------------------------------
-- carrier_matches
-- ---------------------------------------------------------------------------

create table carrier_matches (
    id uuid primary key default gen_random_uuid(),
    submission_id uuid not null references risk_submissions (id) on delete cascade,
    carrier_id uuid not null references carriers (id) on delete restrict,
    fit_score numeric(5, 2) not null,
    guidance_notes text,
    required_docs text[] not null default '{}',
    created_at timestamptz not null default now(),
    unique (submission_id, carrier_id),
    check (fit_score between 0 and 100)
);

create index carrier_matches_submission_idx on carrier_matches (submission_id);
create index carrier_matches_carrier_idx on carrier_matches (carrier_id);
create index carrier_matches_score_idx on carrier_matches (submission_id, fit_score desc);

-- ---------------------------------------------------------------------------
-- submission_outcomes
-- ---------------------------------------------------------------------------

create table submission_outcomes (
    id uuid primary key default gen_random_uuid(),
    match_id uuid not null references carrier_matches (id) on delete cascade,
    outcome submission_outcome_kind not null,
    agent_notes text,
    created_at timestamptz not null default now()
);

create index submission_outcomes_match_idx on submission_outcomes (match_id);

-- ---------------------------------------------------------------------------
-- updated_at trigger for carriers
-- ---------------------------------------------------------------------------

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create trigger carriers_set_updated_at
before update on carriers
for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table carriers enable row level security;
alter table underwriting_rules enable row level security;
alter table agents enable row level security;
alter table risk_submissions enable row level security;
alter table carrier_matches enable row level security;
alter table submission_outcomes enable row level security;

-- Carriers & rules are shared reference data: any authenticated user can read.
create policy "carriers readable by authenticated"
on carriers for select
to authenticated
using (true);

create policy "underwriting_rules readable by authenticated"
on underwriting_rules for select
to authenticated
using (true);

-- Agents can read and update their own row.
create policy "agents read own row"
on agents for select
to authenticated
using (user_id = auth.uid());

create policy "agents insert own row"
on agents for insert
to authenticated
with check (user_id = auth.uid());

create policy "agents update own row"
on agents for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- Agents own their submissions and everything derived from them.
create policy "agents manage own submissions"
on risk_submissions for all
to authenticated
using (
    agent_id in (select id from agents where user_id = auth.uid())
)
with check (
    agent_id in (select id from agents where user_id = auth.uid())
);

create policy "agents read matches for own submissions"
on carrier_matches for select
to authenticated
using (
    submission_id in (
        select rs.id
        from risk_submissions rs
        join agents a on a.id = rs.agent_id
        where a.user_id = auth.uid()
    )
);

create policy "agents manage outcomes on own matches"
on submission_outcomes for all
to authenticated
using (
    match_id in (
        select cm.id
        from carrier_matches cm
        join risk_submissions rs on rs.id = cm.submission_id
        join agents a on a.id = rs.agent_id
        where a.user_id = auth.uid()
    )
)
with check (
    match_id in (
        select cm.id
        from carrier_matches cm
        join risk_submissions rs on rs.id = cm.submission_id
        join agents a on a.id = rs.agent_id
        where a.user_id = auth.uid()
    )
);
