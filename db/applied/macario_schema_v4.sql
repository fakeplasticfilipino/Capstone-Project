-- =============================================================
-- MACARIO — Schema v4 (Block 9)
--
-- Run this whole file once in Supabase's SQL Editor.
-- Safe to re-run: every statement is idempotent.
--
-- CLEAR THE SQL EDITOR BEFORE PASTING. Leftover text from a
-- previous query executes alongside this one.
--
-- THIS MIGRATION IS NOT PURELY ADDITIVE.
--
-- v3 was. This one drops two tables, player_actions and
-- player_achievements, in PART 4. Both are empty and nothing in
-- the codebase has ever read or written either, but read PART 4
-- before running rather than after.
--
-- WHAT THIS BLOCK IS FOR
--
-- performance_score is currently the objective completion
-- percentage and nothing else, while the paper specifies a score
-- from completion, stealth effectiveness and combat efficiency.
-- The columns added in PART 1 are what the other two terms are
-- computed from. PART 2 adds the optional user feedback the paper
-- asks for in both the Assessment module description and the
-- third specific objective.
-- =============================================================


-- =============================================================
-- PART 1 — MEASUREMENT COLUMNS ON act_progress
--
-- Three counters per student per act, written by acts.js on the
-- same cadence as objectives_done.
--
-- No new policies. act_progress already has working policies
-- scoped by student_id and these columns inherit them. Adding
-- policies to a table that already has correct ones is how the
-- recursion problem in v1 started.
--
-- elapsed_ms is bigint rather than int. An int would hold about
-- 24 days of milliseconds, which is plenty, but bigint costs
-- nothing here and removes the question entirely.
--
-- Time is RECORDED BUT NOT SCORED. A timer in the formula would
-- reward skipping the dialogue, which is the entire lesson. It is
-- stored because "how long did a class take" is a question a
-- teacher will ask and the answer is cheap to keep.
-- =============================================================

alter table public.act_progress
  add column if not exists damage_taken int not null default 0;

alter table public.act_progress
  add column if not exists detections int not null default 0;

alter table public.act_progress
  add column if not exists elapsed_ms bigint not null default 0;


-- =============================================================
-- PART 2 — FEEDBACK
--
-- Optional and skippable by design. A required form after a
-- post-test is answered by a student who wants to leave, which is
-- worse than no data.
--
-- Skipping leaves NO ROW. That is what makes the form genuinely
-- optional: absence is the skip, and there is no "declined"
-- sentinel to misread later.
--
-- student_id is carried on the row rather than reached through a
-- join. A policy that looks a student up through another table
-- that has policies of its own is the exact shape that produced
-- "infinite recursion detected in policy for relation profiles"
-- in v1. One repeated uuid per row is much cheaper than debugging
-- a policy cycle a second time.
--
-- No update policy and no delete policy, deliberately. A student
-- who wants to change their answer has no mechanism, which is
-- correct for a research instrument.
-- =============================================================

create table if not exists public.feedback (
  id         uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  act_number int  not null check (act_number between 1 and 4),

  -- Five point scale. The client renders it; the check constraint
  -- is what actually guarantees it.
  rating     int  not null check (rating between 1 and 5),

  -- Optional free text. Capped at 300 characters client side; the
  -- constraint here is the real limit, because a class of fifty
  -- Grade 8 students is not something to moderate on defense week.
  comment    text check (comment is null or char_length(comment) <= 300),

  created_at timestamptz not null default now(),

  -- One submission per student per act, enforced by the database
  -- rather than by the client, exactly as assessment_scores does.
  unique (student_id, act_number)
);

create index if not exists feedback_student_idx
  on public.feedback (student_id, act_number);

alter table public.feedback enable row level security;

drop policy if exists "Students can view own feedback" on public.feedback;
create policy "Students can view own feedback"
  on public.feedback for select
  using (student_id = auth.uid());

drop policy if exists "Students can insert own feedback" on public.feedback;
create policy "Students can insert own feedback"
  on public.feedback for insert
  with check (student_id = auth.uid());

drop policy if exists "Teachers can view their students' feedback" on public.feedback;
create policy "Teachers can view their students' feedback"
  on public.feedback for select
  using (public.is_teacher_of(feedback.student_id));


-- =============================================================
-- PART 3 — SAFETY CHECK BEFORE THE DROPS
--
-- Run this and read the output before letting PART 4 execute.
-- Both counts must be 0. They will be: nothing in the codebase
-- has ever written to either table. This exists so that a drop is
-- never a silent loss if that assumption is somehow wrong.
--
-- If either count is not 0, STOP, and do not run PART 4.
-- =============================================================

do $$
declare
  n_actions int := 0;
  n_achievements int := 0;
begin
  if to_regclass('public.player_actions') is not null then
    execute 'select count(*) from public.player_actions' into n_actions;
  end if;
  if to_regclass('public.player_achievements') is not null then
    execute 'select count(*) from public.player_achievements' into n_achievements;
  end if;

  raise notice 'player_actions rows: %', n_actions;
  raise notice 'player_achievements rows: %', n_achievements;

  if n_actions > 0 or n_achievements > 0 then
    raise exception
      'Refusing to drop: player_actions=% player_achievements=%. Remove this guard deliberately if the data is genuinely disposable.',
      n_actions, n_achievements;
  end if;
end $$;


-- =============================================================
-- PART 4 — DROPS
--
-- The ERD was revised to match what is built rather than the
-- reverse, and it now has eleven entities. These two are not
-- among them:
--
--   player_actions       a per-action replay log costs writes on
--                        a phone on mobile data and would never
--                        be queried. PlayerAction in the ERD
--                        describes a student's choices, not a
--                        replay log.
--
--   player_achievements  achievements add nothing that currency
--                        and cosmetics do not already cover.
--
-- Dropping a table drops its policies and indexes with it, so no
-- separate statements are needed.
--
-- After this runs the database holds eleven tables, which is what
-- the revised diagram shows. A panel that inspects the schema
-- finds it matching the ERD rather than finding two tables the
-- diagram does not explain.
-- =============================================================

drop table if exists public.player_actions;
drop table if exists public.player_achievements;


-- =============================================================
-- PART 5 — VERIFY
--
-- Expect exactly eleven rows, and no player_actions or
-- player_achievements among them.
-- =============================================================

select table_name
from information_schema.tables
where table_schema = 'public'
order by table_name;
