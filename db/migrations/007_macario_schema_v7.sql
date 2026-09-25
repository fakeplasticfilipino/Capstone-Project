-- =============================================================
-- MACARIO — schema v7 (Block 70)
--
-- Run once in the Supabase SQL Editor. CLEAR THE EDITOR BEFORE
-- PASTING. Safe to run twice: every statement checks first.
--
-- The teacher's Talaan papers. Up to three per act (slot 1 to 3), a
-- title and a text each, written from the dashboard (teacher.html,
-- Talaan Papers) and laid by the game at three places fixed in the
-- act's content. An empty slot is no row.
--
-- Anyone may read them, guests included (the anon role), because they
-- are the game's content and hold nothing private. Only a teacher may
-- write them.
-- =============================================================


create table if not exists public.talaan_entries (
  act_number int not null check (act_number between 1 and 4),
  slot       int not null check (slot between 1 and 3),
  title      text not null default '' check (char_length(title) <= 60),
  body       text not null check (char_length(body) between 1 and 400),
  updated_at timestamptz not null default now(),
  primary key (act_number, slot)
);

alter table public.talaan_entries enable row level security;

grant select on public.talaan_entries to anon, authenticated;
grant insert, update, delete on public.talaan_entries to authenticated;

drop policy if exists "Anyone can read the Talaan papers" on public.talaan_entries;
create policy "Anyone can read the Talaan papers"
  on public.talaan_entries for select
  to anon, authenticated
  using (true);

drop policy if exists "Teachers can add Talaan papers" on public.talaan_entries;
create policy "Teachers can add Talaan papers"
  on public.talaan_entries for insert
  to authenticated
  with check (public.my_role() = 'teacher');

drop policy if exists "Teachers can edit Talaan papers" on public.talaan_entries;
create policy "Teachers can edit Talaan papers"
  on public.talaan_entries for update
  to authenticated
  using (public.my_role() = 'teacher')
  with check (public.my_role() = 'teacher');

drop policy if exists "Teachers can remove Talaan papers" on public.talaan_entries;
create policy "Teachers can remove Talaan papers"
  on public.talaan_entries for delete
  to authenticated
  using (public.my_role() = 'teacher');


-- =============================================================
-- VERIFY
--
--   select policyname from pg_policies
--    where tablename = 'talaan_entries' order by 1;
--   -- the four policies above
--
-- Then record it in TRACKER.md's Run log.
-- =============================================================
