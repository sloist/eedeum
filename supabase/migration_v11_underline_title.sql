-- v11: Add title field to underlines for "제목 한 줄"
ALTER TABLE public.underlines ADD COLUMN IF NOT EXISTS title text;
