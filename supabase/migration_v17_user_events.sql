-- v17: 사용자 행동 이벤트 로그
-- 지금은 기록과 수집 단계. 추천은 다음 단계.

CREATE TABLE user_events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id  uuid,
  event_type  text NOT NULL,       -- view, detail, save, echo, share, search, search_click, follow, weave_cite
  target_type text NOT NULL,       -- underline, book, user, weave
  target_id   text NOT NULL,
  source      text,                -- feed, detail, search, profile, weave, shelf, book_page
  context     text,                -- home_feed, book_page, same_line, featured_note, search_result 등
  metadata    jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- 조회 성능 인덱스
CREATE INDEX idx_user_events_user ON user_events(user_id, created_at DESC);
CREATE INDEX idx_user_events_type ON user_events(event_type, created_at DESC);
CREATE INDEX idx_user_events_target ON user_events(target_type, target_id, created_at DESC);
CREATE INDEX idx_user_events_source ON user_events(source, created_at DESC);

-- RLS
ALTER TABLE user_events ENABLE ROW LEVEL SECURITY;

-- 사용자는 자기 이벤트만 insert 가능
CREATE POLICY "Users can insert own events"
  ON user_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 읽기는 자기 것만
CREATE POLICY "Users can read own events"
  ON user_events FOR SELECT
  USING (auth.uid() = user_id);
