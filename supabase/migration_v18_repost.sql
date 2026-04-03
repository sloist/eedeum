-- v18: 리포스트 기능 — 다른 사람의 한줄을 내 한줄로 공유
ALTER TABLE public.underlines
  ADD COLUMN IF NOT EXISTS repost_id uuid REFERENCES public.underlines(id) ON DELETE SET NULL;

-- 리포스트 조회 성능용 인덱스
CREATE INDEX IF NOT EXISTS idx_underlines_repost_id ON public.underlines(repost_id) WHERE repost_id IS NOT NULL;
