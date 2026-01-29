-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Notes table
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  source TEXT DEFAULT 'user' CHECK (source IN ('user', 'notion', 'ai')),
  notion_page_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, id)
);

-- Note tags table
CREATE TABLE IF NOT EXISTS note_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(note_id, tag)
);

-- Note links table
CREATE TABLE IF NOT EXISTS note_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  to_note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  reason TEXT,
  score FLOAT DEFAULT 0.5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(from_note_id, to_note_id)
);

-- Note embeddings table
CREATE TABLE IF NOT EXISTS note_embeddings (
  note_id UUID PRIMARY KEY REFERENCES notes(id) ON DELETE CASCADE,
  embedding VECTOR(1536),
  model TEXT DEFAULT 'text-embedding-3-small',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_embeddings ENABLE ROW LEVEL SECURITY;

-- RLS policies for notes
DROP POLICY IF EXISTS "Users can view their own notes" ON notes;
DROP POLICY IF EXISTS "Users can insert their own notes" ON notes;
DROP POLICY IF EXISTS "Users can update their own notes" ON notes;
DROP POLICY IF EXISTS "Users can delete their own notes" ON notes;

CREATE POLICY "Users can view their own notes"
  ON notes FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notes"
  ON notes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes"
  ON notes FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes"
  ON notes FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for note_tags
DROP POLICY IF EXISTS "Users can view tags for their notes" ON note_tags;
DROP POLICY IF EXISTS "Users can manage tags for their notes" ON note_tags;
DROP POLICY IF EXISTS "Users can update tags for their notes" ON note_tags;
DROP POLICY IF EXISTS "Users can delete tags for their notes" ON note_tags;

CREATE POLICY "Users can view tags for their notes"
  ON note_tags FOR SELECT USING (
    note_id IN (SELECT id FROM notes WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage tags for their notes"
  ON note_tags FOR INSERT WITH CHECK (
    note_id IN (SELECT id FROM notes WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update tags for their notes"
  ON note_tags FOR UPDATE USING (
    note_id IN (SELECT id FROM notes WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete tags for their notes"
  ON note_tags FOR DELETE USING (
    note_id IN (SELECT id FROM notes WHERE user_id = auth.uid())
  );

-- RLS policies for note_links
DROP POLICY IF EXISTS "Users can view links for their notes" ON note_links;
DROP POLICY IF EXISTS "Users can manage links for their notes" ON note_links;

CREATE POLICY "Users can view links for their notes"
  ON note_links FOR SELECT USING (
    from_note_id IN (SELECT id FROM notes WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage links for their notes"
  ON note_links FOR INSERT WITH CHECK (
    from_note_id IN (SELECT id FROM notes WHERE user_id = auth.uid())
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_note_tags_note_id ON note_tags(note_id);
CREATE INDEX IF NOT EXISTS idx_note_links_from ON note_links(from_note_id);
CREATE INDEX IF NOT EXISTS idx_note_links_to ON note_links(to_note_id);
CREATE INDEX IF NOT EXISTS idx_note_embeddings_embedding ON note_embeddings USING ivfflat (embedding vector_cosine_ops);
