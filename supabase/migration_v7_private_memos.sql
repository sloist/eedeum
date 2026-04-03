CREATE TABLE IF NOT EXISTS public.private_memos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  underline_id uuid REFERENCES public.underlines(id) ON DELETE CASCADE NOT NULL,
  text text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE public.private_memos ENABLE ROW LEVEL SECURITY;
-- Only the owner can see/manage their private memos
CREATE POLICY "private_memos_select" ON public.private_memos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "private_memos_insert" ON public.private_memos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "private_memos_delete" ON public.private_memos FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_private_memos_user ON public.private_memos(user_id);
CREATE INDEX idx_private_memos_underline ON public.private_memos(underline_id);
