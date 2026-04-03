-- 사용자별 차단 (안 보기) 테이블
CREATE TABLE IF NOT EXISTS public.user_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  block_type text NOT NULL, -- 'user', 'book', 'underline'
  target_id text NOT NULL,  -- user_id, book_id, or underline_id
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, block_type, target_id)
);

ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "blocks_own" ON public.user_blocks FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_user_blocks_user ON public.user_blocks(user_id);
