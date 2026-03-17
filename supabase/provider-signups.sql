-- Provider Signups: Erfasst Anbieter:innen-Registrierungen für Marktanalyse
-- Muss manuell im Supabase SQL Editor ausgeführt werden

CREATE TABLE provider_signups (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  name text,
  city text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE provider_signups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon kann Signups erstellen"
  ON provider_signups FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated kann Signups lesen"
  ON provider_signups FOR SELECT TO authenticated
  USING (true);
