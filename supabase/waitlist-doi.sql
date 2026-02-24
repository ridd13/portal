-- Double Opt-In Erweiterung für die Waitlist-Tabelle
-- ⚠️  Diese SQL muss manuell im Supabase SQL Editor ausgeführt werden!
--     Vercel/Next.js führt dieses Skript NICHT automatisch aus.

-- Neue Spalten für Double Opt-In
alter table public.waitlist
  add column if not exists confirmed boolean default false,
  add column if not exists confirmation_token uuid default gen_random_uuid(),
  add column if not exists confirmed_at timestamptz;

-- Index für schnellen Token-Lookup beim Bestätigungslink
create index if not exists idx_waitlist_token on public.waitlist(confirmation_token);

-- RLS-Policies für Double Opt-In
-- Anon braucht Select-Zugriff um zu prüfen ob E-Mail bereits existiert + Token zu lesen
create policy "Anon can select waitlist for duplicate check"
  on public.waitlist
  for select
  to anon
  using (true);

-- Anon darf Einträge über den Bestätigungs-Token bestätigen (confirmed auf true setzen)
create policy "Anon can confirm via token"
  on public.waitlist
  for update
  to anon
  using (true)
  with check (confirmed = true);
