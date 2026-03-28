-- ═══════════════════════════════════════
-- 밑줄 (Underline) Database Schema
-- ═══════════════════════════════════════

-- Users
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  avatar_emoji text default '🌿',
  handle text unique not null,
  bio text default '',
  created_at timestamptz default now()
);

-- Books
create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text not null,
  cover_color text default '#8B7355',
  topics text[] default '{}',
  created_at timestamptz default now()
);

-- Underlines (밑줄)
create table if not exists public.underlines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  book_id uuid references public.books(id) on delete cascade not null,
  quote text not null,
  page int,
  feeling text,
  photo_url text,
  created_at timestamptz default now()
);

-- Echoes (공감)
create table if not exists public.echoes (
  id uuid primary key default gen_random_uuid(),
  underline_id uuid references public.underlines(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  text text not null,
  created_at timestamptz default now()
);

-- Saves (저장)
create table if not exists public.saves (
  user_id uuid references public.users(id) on delete cascade not null,
  underline_id uuid references public.underlines(id) on delete cascade not null,
  created_at timestamptz default now(),
  primary key (user_id, underline_id)
);

-- Likes (좋아요)
create table if not exists public.likes (
  user_id uuid references public.users(id) on delete cascade not null,
  underline_id uuid references public.underlines(id) on delete cascade not null,
  created_at timestamptz default now(),
  primary key (user_id, underline_id)
);

-- Follows
create table if not exists public.follows (
  follower_id uuid references public.users(id) on delete cascade not null,
  following_id uuid references public.users(id) on delete cascade not null,
  created_at timestamptz default now(),
  primary key (follower_id, following_id)
);

-- Indexes
create index if not exists idx_underlines_user on public.underlines(user_id);
create index if not exists idx_underlines_book on public.underlines(book_id);
create index if not exists idx_underlines_created on public.underlines(created_at desc);
create index if not exists idx_echoes_underline on public.echoes(underline_id);
create index if not exists idx_likes_underline on public.likes(underline_id);
create index if not exists idx_saves_user on public.saves(user_id);
create index if not exists idx_follows_follower on public.follows(follower_id);
create index if not exists idx_follows_following on public.follows(following_id);

-- RLS (Row Level Security)
alter table public.users enable row level security;
alter table public.books enable row level security;
alter table public.underlines enable row level security;
alter table public.echoes enable row level security;
alter table public.saves enable row level security;
alter table public.likes enable row level security;
alter table public.follows enable row level security;

-- Public read policies (모든 사람이 읽기 가능)
create policy "Anyone can read users" on public.users for select using (true);
create policy "Anyone can read books" on public.books for select using (true);
create policy "Anyone can read underlines" on public.underlines for select using (true);
create policy "Anyone can read echoes" on public.echoes for select using (true);
create policy "Anyone can read likes" on public.likes for select using (true);
create policy "Anyone can read saves" on public.saves for select using (true);
create policy "Anyone can read follows" on public.follows for select using (true);

-- Insert policies (로그인 유저만 쓰기 가능)
create policy "Auth users can insert underlines" on public.underlines for insert with check (auth.uid() = user_id);
create policy "Auth users can insert echoes" on public.echoes for insert with check (auth.uid() = user_id);
create policy "Auth users can insert likes" on public.likes for insert with check (auth.uid() = user_id);
create policy "Auth users can insert saves" on public.saves for insert with check (auth.uid() = user_id);
create policy "Auth users can insert follows" on public.follows for insert with check (auth.uid() = follower_id);

-- Delete policies (자기 것만 삭제 가능)
create policy "Users can delete own underlines" on public.underlines for delete using (auth.uid() = user_id);
create policy "Users can delete own echoes" on public.echoes for delete using (auth.uid() = user_id);
create policy "Users can delete own likes" on public.likes for delete using (auth.uid() = user_id);
create policy "Users can delete own saves" on public.saves for delete using (auth.uid() = user_id);
create policy "Users can delete own follows" on public.follows for delete using (auth.uid() = follower_id);
