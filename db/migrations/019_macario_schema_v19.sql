-- =============================================================
-- MACARIO — schema v19: several trivia cards for each act
--
-- Block 169 (25 Nov 2026). The panel asked for more trivia about
-- Macario Sakay; the proponents' answer is to let a teacher give an act
-- as many trivia cards as she likes, shown one after another before the
-- pre-test (and the game's own built-in set grew from one card an act
-- to three). Until now act_trivia held one row per act: act_number was
-- its primary key.
--
-- What this does:
--   1. act_trivia.position, a whole number from 1: the card's place in
--      the act's set. Every existing row becomes position 1, so the one
--      card each act has now stays its first.
--   2. The primary key becomes (act_number, position).
--   3. A DELETE policy for teachers, as assessment_items has had since
--      schema v6: a teacher who keeps fewer cards removes the rest.
--
-- Does not touch: any row's text; the read policy (anyone signed in);
-- the insert and update policies (teachers); any other table.
--
-- Checked (TRACKER.md, Run log): the existing row is position 1 and its
-- text unchanged; a teacher can insert a second card, update it and
-- delete it, inside a transaction that is rolled back; a student and a
-- signed-out visitor can do none of the three.
--
-- Undo (only while no act has more than one card):
--   drop policy "Teachers can remove trivia" on public.act_trivia;
--   alter table public.act_trivia drop constraint act_trivia_pkey;
--   alter table public.act_trivia add primary key (act_number);
--   alter table public.act_trivia drop column position;
-- =============================================================

alter table public.act_trivia
  add column if not exists position int not null default 1
    check (position >= 1);

alter table public.act_trivia drop constraint if exists act_trivia_pkey;
alter table public.act_trivia add constraint act_trivia_pkey primary key (act_number, position);

drop policy if exists "Teachers can remove trivia" on public.act_trivia;
create policy "Teachers can remove trivia"
  on public.act_trivia for delete
  using (private.my_role() = 'teacher');
