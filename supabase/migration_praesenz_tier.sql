-- Migration: Präsenz-Tier MVP — offerings (JSONB) + tagline
-- Issue: LBV-199
-- Apply via Supabase SQL Editor BEFORE deploying the code changes.
-- Run this AFTER migration_featured_listing.sql (which adds is_featured).

ALTER TABLE hosts
  ADD COLUMN IF NOT EXISTS offerings JSONB,
  ADD COLUMN IF NOT EXISTS tagline VARCHAR(150);

-- RLS note: no new policies needed.
-- Anon/authenticated already have SELECT on hosts (existing policy covers all columns).
-- UPDATE is restricted to service role only — no UPDATE policy for anon/auth exists.

-- Test setup: mark a host as Präsenz and add sample data
-- Adjust slug to a real host in your DB, preferably one with telegram_username set.
-- Run manually after verifying the host slug:
--
--   UPDATE hosts
--   SET
--     is_featured = true,
--     tagline     = 'Bewegung als Weg zur inneren Freiheit',
--     offerings   = '[
--       {"title": "Einzelcoaching", "description": "1:1 Session 90 Min. Systemische Arbeit und Inneres Kind.", "price": "120 €"},
--       {"title": "Gruppenklasse", "description": "Wöchentlicher Kurs, Dienstag 19:00 Uhr, Hamburg Altona.", "price": "18 €"},
--       {"title": "Persönliches Bewegungsprogramm", "description": "Maßgeschneiderter 8-Wochen-Plan mit wöchentlichem Check-in."}
--     ]'::jsonb
--   WHERE slug = 'school-of-movement';
