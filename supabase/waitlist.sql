-- Waitlist table for pre-launch signups
-- Run this in your Supabase SQL Editor

create table if not exists public.waitlist (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  name text,
  role text, -- z.B. 'coach', 'heiler', 'therapeut', 'schamane', 'sonstige'
  city text,
  created_at timestamptz default now() not null
);

-- Enable RLS
alter table public.waitlist enable row level security;

-- Allow anonymous inserts (for the public form)
create policy "Anyone can insert into waitlist"
  on public.waitlist
  for insert
  to anon
  with check (true);

-- Only authenticated users (admin) can read
create policy "Authenticated users can read waitlist"
  on public.waitlist
  for select
  to authenticated
  using (true);
