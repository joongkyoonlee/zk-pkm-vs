-- Add notion_page_id column to notes table
ALTER TABLE notes
ADD COLUMN IF NOT EXISTS notion_page_id TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_notes_notion_page_id 
ON notes(user_id, notion_page_id);
