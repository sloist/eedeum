CREATE TABLE IF NOT EXISTS public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  target_type text NOT NULL, -- 'underline', 'echo', 'user'
  target_id uuid NOT NULL,
  reason text,
  status text DEFAULT 'pending', -- 'pending', 'reviewed', 'actioned'
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reports_insert" ON public.reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "reports_select_own" ON public.reports FOR SELECT USING (auth.uid() = reporter_id);

CREATE INDEX idx_reports_target ON public.reports(target_type, target_id);
CREATE INDEX idx_reports_status ON public.reports(status) WHERE status = 'pending';

-- Add hidden flag to underlines and echoes
ALTER TABLE public.underlines ADD COLUMN IF NOT EXISTS hidden boolean DEFAULT false;
ALTER TABLE public.echoes ADD COLUMN IF NOT EXISTS hidden boolean DEFAULT false;
