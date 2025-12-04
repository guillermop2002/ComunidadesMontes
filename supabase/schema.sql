-- Enable PostGIS extension
create extension if not exists postgis;

-- Create Enum for Person Role
create type person_role as enum ('comunero', 'neighbor', 'president', 'secretary', 'treasurer');

-- Table: Houses (Casa Aberta)
create table houses (
  id uuid primary key default gen_random_uuid(),
  address text not null,
  catastro_ref text unique,
  geom geometry(POINT, 4326), -- WGS84 Coordinates
  last_consumption_date date,
  created_at timestamptz default now()
);

-- Table: People (Census)
create table people (
  id uuid primary key default gen_random_uuid(),
  dni text unique not null,
  name text not null,
  phone_number text,
  role person_role default 'neighbor',
  house_id uuid references houses(id),
  residency_years int default 0,
  created_at timestamptz default now()
);

-- Table: Wind Turbines (Assets)
create table wind_turbines (
  id uuid primary key default gen_random_uuid(),
  model text not null, -- e.g., "Vestas V90"
  hub_height float not null, -- meters
  rotor_radius float not null, -- meters
  geom geometry(POINT, 4326),
  installation_date date
);

-- RLS Policies (Security)
alter table people enable row level security;

-- Policy: Admin sees all
create policy "Admins can see all people"
on people for select
to authenticated
using (auth.jwt() ->> 'email' in (select email from admins)); -- Placeholder logic
