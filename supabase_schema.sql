create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null check (role in ('administrador', 'productor', 'inversionista', 'veterinario', 'auditor')),
  phone text,
  status text default 'activo',
  created_at timestamp with time zone default now()
);

create table if not exists cattle (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  name text,
  breed text,
  sex text,
  weight numeric,
  temperature numeric,
  health_status text,
  location text,
  owner_id uuid references profiles(id),
  created_at timestamp with time zone default now()
);

create table if not exists productive_records (
  id uuid primary key default gen_random_uuid(),
  cattle_id uuid references cattle(id) on delete cascade,
  weight numeric,
  milk_production numeric,
  note text,
  record_date date default current_date
);

create table if not exists health_records (
  id uuid primary key default gen_random_uuid(),
  cattle_id uuid references cattle(id) on delete cascade,
  veterinarian_id uuid references profiles(id),
  diagnosis text,
  treatment text,
  vaccine text,
  next_checkup date,
  status text,
  created_at timestamp with time zone default now()
);

create table if not exists investment_projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  cattle_id uuid references cattle(id),
  goal_amount numeric not null,
  raised_amount numeric default 0,
  projected_return numeric,
  status text default 'activo',
  start_date date default current_date,
  end_date date
);

create table if not exists investments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references investment_projects(id) on delete cascade,
  investor_id uuid references profiles(id),
  amount numeric not null,
  expected_return numeric,
  status text default 'registrado',
  created_at timestamp with time zone default now()
);

create table if not exists traceability_events (
  id uuid primary key default gen_random_uuid(),
  cattle_id uuid references cattle(id),
  investment_id uuid references investments(id),
  event_type text not null,
  description text,
  hash_code text,
  created_at timestamp with time zone default now()
);

create table if not exists climate_records (
  id uuid primary key default gen_random_uuid(),
  temperature numeric,
  humidity numeric,
  rainfall numeric,
  event_type text,
  location text,
  created_at timestamp with time zone default now()
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  action text not null,
  module text not null,
  description text,
  created_at timestamp with time zone default now()
);

alter table profiles enable row level security;
alter table cattle enable row level security;
alter table productive_records enable row level security;
alter table health_records enable row level security;
alter table investment_projects enable row level security;
alter table investments enable row level security;
alter table traceability_events enable row level security;
alter table climate_records enable row level security;
alter table audit_logs enable row level security;

-- Políticas demo para desarrollo. Ajustar antes de producción.
create policy "profiles_select_authenticated" on profiles for select to authenticated using (true);
create policy "cattle_select_authenticated" on cattle for select to authenticated using (true);
create policy "productive_select_authenticated" on productive_records for select to authenticated using (true);
create policy "health_select_authenticated" on health_records for select to authenticated using (true);
create policy "projects_select_authenticated" on investment_projects for select to authenticated using (true);
create policy "investments_select_authenticated" on investments for select to authenticated using (true);
create policy "traceability_select_authenticated" on traceability_events for select to authenticated using (true);
create policy "climate_select_authenticated" on climate_records for select to authenticated using (true);
create policy "audit_select_authenticated" on audit_logs for select to authenticated using (true);
