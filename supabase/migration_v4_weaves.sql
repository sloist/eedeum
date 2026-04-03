-- Weaves (엮음)
create table if not exists public.weaves (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  title text not null,
  description text,
  cover_color text default '#7B6548',
  is_public boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Weave Blocks (엮음 블록)
create table if not exists public.weave_blocks (
  id uuid primary key default gen_random_uuid(),
  weave_id uuid references public.weaves(id) on delete cascade not null,
  block_type text not null check (block_type in ('underline', 'note', 'divider')),
  position integer not null default 0,
  underline_id uuid references public.underlines(id) on delete set null,
  content text,
  created_at timestamptz default now()
);

-- Indexes
create index if not exists idx_weaves_user on public.weaves(user_id);
create index if not exists idx_weave_blocks_weave on public.weave_blocks(weave_id);
create index if not exists idx_weave_blocks_position on public.weave_blocks(weave_id, position);

-- RLS
alter table public.weaves enable row level security;
alter table public.weave_blocks enable row level security;

-- Read: public weaves anyone can read, private only owner
create policy "Anyone can read public weaves" on public.weaves for select using (is_public = true or auth.uid() = user_id);
create policy "Anyone can read blocks of accessible weaves" on public.weave_blocks for select using (
  exists (select 1 from public.weaves where id = weave_id and (is_public = true or auth.uid() = user_id))
);

-- Write: only owner
create policy "Users can insert own weaves" on public.weaves for insert with check (auth.uid() = user_id);
create policy "Users can update own weaves" on public.weaves for update using (auth.uid() = user_id);
create policy "Users can delete own weaves" on public.weaves for delete using (auth.uid() = user_id);

create policy "Users can insert blocks in own weaves" on public.weave_blocks for insert with check (
  exists (select 1 from public.weaves where id = weave_id and auth.uid() = user_id)
);
create policy "Users can update blocks in own weaves" on public.weave_blocks for update using (
  exists (select 1 from public.weaves where id = weave_id and auth.uid() = user_id)
);
create policy "Users can delete blocks in own weaves" on public.weave_blocks for delete using (
  exists (select 1 from public.weaves where id = weave_id and auth.uid() = user_id)
);
