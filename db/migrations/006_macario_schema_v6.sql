-- =============================================================
-- MACARIO — schema v6 (Block 68)
--
-- Run once in the Supabase SQL Editor. CLEAR THE EDITOR BEFORE
-- PASTING. Safe to run twice: every statement checks first.
--
-- What it changes, at the instructor's direction:
--
-- 1. The questions are in the game. Students may now read
--    assessment_items whole, answer key included, and the game grades
--    a test itself (js/assessment.js). get_assessment_items and
--    submit_assessment are left in place, unused.
--
-- 2. Teachers may edit the questions and answers, and the trivia card,
--    from the dashboard (teacher.html, Mga Tanong): insert, update and
--    delete on assessment_items, insert and update on act_trivia.
--
-- 3. A failed post-test may be taken again after replaying the act.
--    assessment_scores gains an attempt number, and one row per
--    (student, act, test, attempt) replaces one row per (student, act,
--    test). The pre-test is still one attempt only, enforced by a
--    partial unique index.
--
-- Nothing here deletes a row. Existing scores become attempt 1.
-- =============================================================


-- ---- 1. Students read the questions, answers included ----------

drop policy if exists "Students can read the item bank" on public.assessment_items;
create policy "Students can read the item bank"
  on public.assessment_items for select
  using (auth.uid() is not null);


-- ---- 2. Teachers edit the questions and the trivia card --------

drop policy if exists "Teachers can add items" on public.assessment_items;
create policy "Teachers can add items"
  on public.assessment_items for insert
  with check (public.my_role() = 'teacher');

drop policy if exists "Teachers can edit items" on public.assessment_items;
create policy "Teachers can edit items"
  on public.assessment_items for update
  using (public.my_role() = 'teacher')
  with check (public.my_role() = 'teacher');

drop policy if exists "Teachers can remove items" on public.assessment_items;
create policy "Teachers can remove items"
  on public.assessment_items for delete
  using (public.my_role() = 'teacher');

drop policy if exists "Teachers can add trivia" on public.act_trivia;
create policy "Teachers can add trivia"
  on public.act_trivia for insert
  with check (public.my_role() = 'teacher');

drop policy if exists "Teachers can edit trivia" on public.act_trivia;
create policy "Teachers can edit trivia"
  on public.act_trivia for update
  using (public.my_role() = 'teacher')
  with check (public.my_role() = 'teacher');


-- ---- 3. Attempts --------------------------------------------------

alter table public.assessment_scores
  add column if not exists attempt int not null default 1;

-- The v1 constraint allowed one row per (student, act, test). Its
-- name is Postgres's default for an unnamed unique constraint.
alter table public.assessment_scores
  drop constraint if exists assessment_scores_student_id_act_number_test_type_key;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'assessment_scores_one_row_per_attempt'
  ) then
    alter table public.assessment_scores
      add constraint assessment_scores_one_row_per_attempt
      unique (student_id, act_number, test_type, attempt);
  end if;
end $$;

-- The pre-test stays one attempt: it is the baseline the gain is
-- measured from.
create unique index if not exists assessment_scores_one_pretest
  on public.assessment_scores (student_id, act_number)
  where test_type = 'pre';


-- =============================================================
-- VERIFY
--
--   select column_name from information_schema.columns
--    where table_name = 'assessment_scores' and column_name = 'attempt';
--   -- one row
--
--   select policyname from pg_policies
--    where tablename in ('assessment_items', 'act_trivia') order by 1;
--   -- includes the six policies above
--
-- Then record it in TRACKER.md's Run log.
-- =============================================================
