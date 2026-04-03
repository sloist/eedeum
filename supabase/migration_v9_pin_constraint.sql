-- Only one pinned echo per underline
CREATE UNIQUE INDEX IF NOT EXISTS idx_echoes_one_pin_per_underline
ON public.echoes(underline_id) WHERE pinned = true;
