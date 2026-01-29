-- AI Search history table
CREATE TABLE IF NOT EXISTS ai_search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  results JSONB,
  model_used TEXT DEFAULT 'gpt-4',
  tokens_used INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User preferences/settings table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
  language TEXT DEFAULT 'ko' CHECK (language IN ('ko', 'en')),
  ai_model TEXT DEFAULT 'gpt-4' CHECK (ai_model IN ('gpt-4', 'gpt-3.5-turbo')),
  auto_sync_notion BOOLEAN DEFAULT false,
  notion_sync_interval INT DEFAULT 3600,
  notifications_enabled BOOLEAN DEFAULT true,
  email_digests BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notion tokens table (for OAuth storage)
CREATE TABLE IF NOT EXISTS notion_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  token_type TEXT DEFAULT 'bearer',
  owner_type TEXT,
  owner_id TEXT,
  workspace_id TEXT,
  workspace_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Sync logs table (for tracking sync operations)
CREATE TABLE IF NOT EXISTS sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('notion', 'openai', 'manual')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'success', 'failed')),
  notes_synced INT DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB
);

-- Enable RLS for all new tables
ALTER TABLE ai_search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notion_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for ai_search_history
CREATE POLICY "Users can view their own search history"
  ON ai_search_history FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own search history"
  ON ai_search_history FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own search history"
  ON ai_search_history FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for user_preferences
CREATE POLICY "Users can view their own preferences"
  ON user_preferences FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON user_preferences FOR UPDATE USING (auth.uid() = user_id);

-- RLS policies for notion_tokens
CREATE POLICY "Users can view their own Notion tokens"
  ON notion_tokens FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own Notion tokens"
  ON notion_tokens FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Notion tokens"
  ON notion_tokens FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Notion tokens"
  ON notion_tokens FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for sync_logs
CREATE POLICY "Users can view their own sync logs"
  ON sync_logs FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sync logs"
  ON sync_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ai_search_history_user_id_created ON ai_search_history(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_notion_tokens_user_id ON notion_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_user_id_started ON sync_logs(user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_sync_logs_status ON sync_logs(user_id, status, started_at DESC);
