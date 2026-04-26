-- LBV-81: MCP Token table for Paperclip MCP Server
-- Run in Supabase SQL Editor (Projekt fjyaolxtipqtcvvclegl)

CREATE TABLE IF NOT EXISTS mcp_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  scopes TEXT[] DEFAULT '{"all"}',
  expires_at TIMESTAMPTZ NOT NULL,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS mcp_tokens_user_id_idx ON mcp_tokens(user_id);
CREATE INDEX IF NOT EXISTS mcp_tokens_token_hash_idx ON mcp_tokens(token_hash);

-- RLS: enabled; service_role bypasses it (Portal + MCP server use service_role)
ALTER TABLE mcp_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own tokens" ON mcp_tokens
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tokens" ON mcp_tokens
  FOR DELETE USING (auth.uid() = user_id);
