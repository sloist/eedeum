-- ═══════════════════════════════════════
-- 밑줄 (Underline) Migration V2
-- user_books, daily_quotes, echoes.is_same_line
-- ═══════════════════════════════════════

-- 1. user_books (보유 중인 책)
create table if not exists public.user_books (
  user_id uuid references public.users(id) on delete cascade not null,
  book_id uuid references public.books(id) on delete cascade not null,
  status text default 'owned' check (status in ('owned', 'reading', 'finished')),
  created_at timestamptz default now(),
  primary key (user_id, book_id)
);

-- 2. Add is_same_line to echoes ("나도 여기에 밑줄")
alter table public.echoes add column if not exists is_same_line boolean default false;

-- 3. daily_quotes (오늘의 한 줄)
create table if not exists public.daily_quotes (
  id uuid primary key default gen_random_uuid(),
  underline_id uuid references public.underlines(id) on delete cascade not null,
  display_date date unique not null default current_date,
  created_at timestamptz default now()
);

-- ═══════════════════════════════════════
-- Indexes
-- ═══════════════════════════════════════

create index if not exists idx_user_books_user on public.user_books(user_id);
create index if not exists idx_user_books_book on public.user_books(book_id);
create index if not exists idx_user_books_status on public.user_books(status);
create index if not exists idx_daily_quotes_date on public.daily_quotes(display_date desc);
create index if not exists idx_daily_quotes_underline on public.daily_quotes(underline_id);
create index if not exists idx_echoes_is_same_line on public.echoes(is_same_line) where is_same_line = true;

-- ═══════════════════════════════════════
-- RLS (Row Level Security)
-- ═══════════════════════════════════════

alter table public.user_books enable row level security;
alter table public.daily_quotes enable row level security;

-- Public read policies
create policy "Anyone can read user_books" on public.user_books for select using (true);
create policy "Anyone can read daily_quotes" on public.daily_quotes for select using (true);

-- Insert policies (auth users own rows)
create policy "Auth users can insert own user_books" on public.user_books for insert with check (auth.uid() = user_id);

-- Update policies
create policy "Auth users can update own user_books" on public.user_books for update using (auth.uid() = user_id);

-- Delete policies
create policy "Users can delete own user_books" on public.user_books for delete using (auth.uid() = user_id);

-- daily_quotes: only service role / admin should insert, so no insert policy for regular users
-- (insert via service role key bypasses RLS)
