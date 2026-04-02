-- Add feeling_private column to underlines
-- When true, the feeling (감상) is only visible to the author
ALTER TABLE underlines ADD COLUMN IF NOT EXISTS feeling_private boolean DEFAULT false;
