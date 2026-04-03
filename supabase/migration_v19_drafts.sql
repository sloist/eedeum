-- v19: 임시 보관함 — 아직 정리 안 된 문장을 일단 남기기
ALTER TABLE public.underlines
  ADD COLUMN IF NOT EXISTS is_draft boolean DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_underlines_draft ON public.underlines(user_id, is_draft) WHERE is_draft = true;
