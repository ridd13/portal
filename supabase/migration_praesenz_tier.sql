-- Migration: Präsenz-Tier MVP — offerings_text + tagline
-- Issue: LBV-199
-- Apply via Supabase SQL Editor BEFORE deploying the code changes.
-- Run this AFTER migration_featured_listing.sql (which adds is_featured).

ALTER TABLE hosts
  ADD COLUMN IF NOT EXISTS offerings_text TEXT,
  ADD COLUMN IF NOT EXISTS tagline VARCHAR(150);

-- RLS note: no new policies needed.
-- Anon/authenticated already have SELECT on hosts (existing policy covers all columns).
-- UPDATE is restricted to service role only — no UPDATE policy for anon/auth exists.

-- Test setup: mark a host as Präsenz and add sample data
-- Adjust slug to a real host in your DB.
-- Run manually after verifying the host slug:
--
--   UPDATE hosts
--   SET
--     is_featured    = true,
--     tagline        = 'Bewegung als Weg zur inneren Freiheit',
--     offerings_text = E'1:1 Coaching — Körper, Geist & Bewegung\nGruppenklassen (wöchentlich, Hamburg)\nPersonalisiertes Bewegungsprogramm'
--   WHERE slug = 'school-of-movement';
