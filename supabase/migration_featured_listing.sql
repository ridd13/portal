-- Migration: Featured Listing Support
-- Issue: LBV-199
-- Apply via Supabase SQL Editor BEFORE deploying the code changes.

ALTER TABLE hosts
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS featured_until timestamptz;

-- Partial index — fast lookup for "who is currently featured?"
CREATE INDEX IF NOT EXISTS idx_hosts_is_featured
  ON hosts (is_featured)
  WHERE is_featured = true;

-- RLS note: no new policies needed.
-- Anon/authenticated already have SELECT on hosts (existing policy).
-- UPDATE on is_featured is restricted to service role only (no UPDATE policy for anon/auth exists).

-- To feature a host manually:
--   UPDATE hosts SET is_featured = true WHERE slug = 'school-of-movement';
-- To remove:
--   UPDATE hosts SET is_featured = false WHERE slug = 'school-of-movement';
