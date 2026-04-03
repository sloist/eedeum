-- ═══════════════════════════════════════════════════════════════
-- Migration V6: Comprehensive RLS Security Policies
-- Drops all existing policies and recreates them cleanly.
-- ═══════════════════════════════════════════════════════════════


-- ─────────────────────────────────────────────────────────────
-- 1. ENABLE RLS ON ALL TABLES
-- ─────────────────────────────────────────────────────────────

ALTER TABLE public.users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.underlines     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.echoes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saves          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_books     ENABLE ROW LEVEL SECURITY;


-- ─────────────────────────────────────────────────────────────
-- 2. DROP ALL EXISTING POLICIES
--    (safe to run even if they don't exist)
-- ─────────────────────────────────────────────────────────────

-- users
DROP POLICY IF EXISTS "Anyone can read users"          ON public.users;
DROP POLICY IF EXISTS "Auth users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Auth users can update own profile" ON public.users;

-- books
DROP POLICY IF EXISTS "Anyone can read books"          ON public.books;
DROP POLICY IF EXISTS "Auth users can insert books"    ON public.books;

-- underlines
DROP POLICY IF EXISTS "Anyone can read underlines"            ON public.underlines;
DROP POLICY IF EXISTS "Auth users can insert underlines"      ON public.underlines;
DROP POLICY IF EXISTS "Users can delete own underlines"       ON public.underlines;

-- echoes
DROP POLICY IF EXISTS "Anyone can read echoes"                ON public.echoes;
DROP POLICY IF EXISTS "Auth users can insert echoes"          ON public.echoes;
DROP POLICY IF EXISTS "Users can delete own echoes"           ON public.echoes;

-- likes
DROP POLICY IF EXISTS "Anyone can read likes"                 ON public.likes;
DROP POLICY IF EXISTS "Auth users can insert likes"           ON public.likes;
DROP POLICY IF EXISTS "Users can delete own likes"            ON public.likes;

-- saves
DROP POLICY IF EXISTS "Anyone can read saves"                 ON public.saves;
DROP POLICY IF EXISTS "Auth users can insert saves"           ON public.saves;
DROP POLICY IF EXISTS "Users can delete own saves"            ON public.saves;

-- follows
DROP POLICY IF EXISTS "Anyone can read follows"               ON public.follows;
DROP POLICY IF EXISTS "Auth users can insert follows"         ON public.follows;
DROP POLICY IF EXISTS "Users can delete own follows"          ON public.follows;

-- user_books
DROP POLICY IF EXISTS "Anyone can read user_books"            ON public.user_books;
DROP POLICY IF EXISTS "Auth users can insert own user_books"  ON public.user_books;
DROP POLICY IF EXISTS "Auth users can update own user_books"  ON public.user_books;
DROP POLICY IF EXISTS "Users can delete own user_books"       ON public.user_books;

-- New policy names (in case this migration is re-run)
DROP POLICY IF EXISTS "users_select_public"             ON public.users;
DROP POLICY IF EXISTS "users_insert_own"                ON public.users;
DROP POLICY IF EXISTS "users_update_own"                ON public.users;
DROP POLICY IF EXISTS "books_select_public"             ON public.books;
DROP POLICY IF EXISTS "books_insert_authenticated"      ON public.books;
DROP POLICY IF EXISTS "underlines_select_public"        ON public.underlines;
DROP POLICY IF EXISTS "underlines_insert_own"           ON public.underlines;
DROP POLICY IF EXISTS "underlines_update_own"           ON public.underlines;
DROP POLICY IF EXISTS "underlines_delete_own"           ON public.underlines;
DROP POLICY IF EXISTS "echoes_select_public"            ON public.echoes;
DROP POLICY IF EXISTS "echoes_insert_authenticated"     ON public.echoes;
DROP POLICY IF EXISTS "echoes_update_pin_underline_owner" ON public.echoes;
DROP POLICY IF EXISTS "echoes_delete_own_or_underline_owner" ON public.echoes;
DROP POLICY IF EXISTS "likes_select_public"             ON public.likes;
DROP POLICY IF EXISTS "likes_insert_own"                ON public.likes;
DROP POLICY IF EXISTS "likes_delete_own"                ON public.likes;
DROP POLICY IF EXISTS "saves_select_public"             ON public.saves;
DROP POLICY IF EXISTS "saves_insert_own"                ON public.saves;
DROP POLICY IF EXISTS "saves_delete_own"                ON public.saves;
DROP POLICY IF EXISTS "follows_select_public"           ON public.follows;
DROP POLICY IF EXISTS "follows_insert_own"              ON public.follows;
DROP POLICY IF EXISTS "follows_delete_own"              ON public.follows;
DROP POLICY IF EXISTS "user_books_select_public"        ON public.user_books;
DROP POLICY IF EXISTS "user_books_insert_own"           ON public.user_books;
DROP POLICY IF EXISTS "user_books_update_own"           ON public.user_books;
DROP POLICY IF EXISTS "user_books_delete_own"           ON public.user_books;


-- ═══════════════════════════════════════════════════════════════
-- 3. CREATE NEW POLICIES
-- ═══════════════════════════════════════════════════════════════


-- ─────────────────────────────────────────────────────────────
-- USERS
--   SELECT : anyone (public profiles)
--   INSERT : only yourself (on signup, id must match auth.uid())
--   UPDATE : only yourself
-- ─────────────────────────────────────────────────────────────

CREATE POLICY "users_select_public"
  ON public.users FOR SELECT
  USING (true);

CREATE POLICY "users_insert_own"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_own"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);


-- ─────────────────────────────────────────────────────────────
-- BOOKS
--   SELECT : anyone (books are shared reference data)
--   INSERT : any authenticated user can add a book
-- ─────────────────────────────────────────────────────────────

CREATE POLICY "books_select_public"
  ON public.books FOR SELECT
  USING (true);

CREATE POLICY "books_insert_authenticated"
  ON public.books FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);


-- ─────────────────────────────────────────────────────────────
-- UNDERLINES
--   SELECT : anyone (public feed)
--   INSERT : only the owner (user_id must match auth.uid())
--   UPDATE : only the owner
--   DELETE : only the owner
-- ─────────────────────────────────────────────────────────────

CREATE POLICY "underlines_select_public"
  ON public.underlines FOR SELECT
  USING (true);

CREATE POLICY "underlines_insert_own"
  ON public.underlines FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "underlines_update_own"
  ON public.underlines FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "underlines_delete_own"
  ON public.underlines FOR DELETE
  USING (auth.uid() = user_id);


-- ─────────────────────────────────────────────────────────────
-- ECHOES
--   SELECT : anyone
--   INSERT : any authenticated user (user_id must match auth.uid())
--   UPDATE : only the underline owner can update (for pinning/unpinning)
--   DELETE : the echo author OR the owner of the parent underline
-- ─────────────────────────────────────────────────────────────

CREATE POLICY "echoes_select_public"
  ON public.echoes FOR SELECT
  USING (true);

CREATE POLICY "echoes_insert_authenticated"
  ON public.echoes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: only the underline owner can pin/unpin echoes
CREATE POLICY "echoes_update_pin_underline_owner"
  ON public.echoes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.underlines
      WHERE underlines.id = echoes.underline_id
        AND underlines.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.underlines
      WHERE underlines.id = echoes.underline_id
        AND underlines.user_id = auth.uid()
    )
  );

-- DELETE: echo author can delete their own, OR underline owner can
-- remove any echo on their underline (moderation)
CREATE POLICY "echoes_delete_own_or_underline_owner"
  ON public.echoes FOR DELETE
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.underlines
      WHERE underlines.id = echoes.underline_id
        AND underlines.user_id = auth.uid()
    )
  );


-- ─────────────────────────────────────────────────────────────
-- LIKES
--   SELECT : anyone
--   INSERT : only yourself (user_id = auth.uid())
--   DELETE : only yourself
-- ─────────────────────────────────────────────────────────────

CREATE POLICY "likes_select_public"
  ON public.likes FOR SELECT
  USING (true);

CREATE POLICY "likes_insert_own"
  ON public.likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "likes_delete_own"
  ON public.likes FOR DELETE
  USING (auth.uid() = user_id);


-- ─────────────────────────────────────────────────────────────
-- SAVES
--   SELECT : anyone
--   INSERT : only yourself (user_id = auth.uid())
--   DELETE : only yourself
-- ─────────────────────────────────────────────────────────────

CREATE POLICY "saves_select_public"
  ON public.saves FOR SELECT
  USING (true);

CREATE POLICY "saves_insert_own"
  ON public.saves FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "saves_delete_own"
  ON public.saves FOR DELETE
  USING (auth.uid() = user_id);


-- ─────────────────────────────────────────────────────────────
-- FOLLOWS
--   SELECT : anyone
--   INSERT : only the follower (follower_id = auth.uid())
--   DELETE : only the follower can unfollow
-- ─────────────────────────────────────────────────────────────

CREATE POLICY "follows_select_public"
  ON public.follows FOR SELECT
  USING (true);

CREATE POLICY "follows_insert_own"
  ON public.follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "follows_delete_own"
  ON public.follows FOR DELETE
  USING (auth.uid() = follower_id);


-- ─────────────────────────────────────────────────────────────
-- USER_BOOKS
--   SELECT : anyone (public reading lists)
--   INSERT : only yourself
--   UPDATE : only yourself (e.g. change status)
--   DELETE : only yourself
-- ─────────────────────────────────────────────────────────────

CREATE POLICY "user_books_select_public"
  ON public.user_books FOR SELECT
  USING (true);

CREATE POLICY "user_books_insert_own"
  ON public.user_books FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_books_update_own"
  ON public.user_books FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_books_delete_own"
  ON public.user_books FOR DELETE
  USING (auth.uid() = user_id);
