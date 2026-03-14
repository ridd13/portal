-- Event-Intake Pipeline: Hosts- und Events-Tabelle erweitern
-- ⚠️  Diese SQL muss manuell im Supabase SQL Editor ausgeführt werden!

-- ============================================================
-- 1. HOSTS: Telegram-Username, E-Mail, Avatar
-- ============================================================

-- Telegram-Username Feld (ohne @, lowercase)
alter table public.hosts
  add column if not exists telegram_username text;

-- Unique Index für schnellen Lookup
create unique index if not exists idx_hosts_telegram
  on public.hosts(telegram_username)
  where telegram_username is not null;

-- E-Mail Feld für Hosts (für Kommunikation außerhalb Telegram)
alter table public.hosts
  add column if not exists email text;

-- Profilbild-URL
alter table public.hosts
  add column if not exists avatar_url text;

-- ============================================================
-- 2. EVENTS: Source-Tracking für importierte Events
-- ============================================================

-- Quell-Information für importierte Events
-- Werte: 'manual', 'telegram', 'form'
alter table public.events
  add column if not exists source_type text default 'manual';

-- Telegram Message-ID für Deduplizierung
alter table public.events
  add column if not exists source_message_id text;

-- Index für Deduplizierung
create unique index if not exists idx_events_source_msg
  on public.events(source_message_id)
  where source_message_id is not null;
