CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL, -- 'echo', 'like', 'follow', 'reply'
  actor_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  underline_id uuid REFERENCES public.underlines(id) ON DELETE CASCADE,
  echo_id uuid REFERENCES public.echoes(id) ON DELETE CASCADE,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifications_select" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notifications_insert" ON public.notifications FOR INSERT WITH CHECK (true); -- any authenticated user can create
CREATE POLICY "notifications_update" ON public.notifications FOR UPDATE USING (auth.uid() = user_id); -- mark as read

CREATE INDEX idx_notifications_user ON public.notifications(user_id, created_at DESC);
