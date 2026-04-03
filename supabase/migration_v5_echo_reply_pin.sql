-- v5: Add reply and pin support to echoes
-- Run this in Supabase SQL Editor

-- parent_id for author replies (1-level deep only)
ALTER TABLE public.echoes ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES public.echoes(id) ON DELETE CASCADE;

-- pinned flag (only 1 echo can be pinned per underline, enforced in app)
ALTER TABLE public.echoes ADD COLUMN IF NOT EXISTS pinned boolean DEFAULT false;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_echoes_parent_id ON public.echoes(parent_id);
CREATE INDEX IF NOT EXISTS idx_echoes_pinned ON public.echoes(pinned) WHERE pinned = true;
