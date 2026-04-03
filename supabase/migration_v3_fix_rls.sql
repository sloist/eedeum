-- Fix: Allow authenticated users to insert their own user row on signup
create policy "Auth users can insert own profile" on public.users for insert with check (auth.uid() = id);

-- Fix: Allow authenticated users to update their own profile
create policy "Auth users can update own profile" on public.users for update using (auth.uid() = id);

-- Fix: Allow authenticated users to insert books (anyone can add a book)
create policy "Auth users can insert books" on public.books for insert with check (auth.uid() is not null);
