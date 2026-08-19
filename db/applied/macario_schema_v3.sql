-- =============================================================
-- MACARIO — Schema v3 (Block 7)
--
-- Purely ADDITIVE to macario_schema_v2.sql. Nothing here drops a
-- table, drops a policy, or touches an existing row.
--
-- Run this whole file once in Supabase's SQL Editor.
-- Safe to re-run: every statement is idempotent.
--
-- CLEAR THE SQL EDITOR BEFORE PASTING. Leftover text from a
-- previous query executes alongside this one.
--
-- WHY ONE MIGRATION FOR FIVE TABLES
--
-- Only the shell is built in Block 7. Inventory, equipment,
-- rewards, achievements and telemetry arrive in Blocks 8 through
-- 11, and none of them writes to these tables yet.
--
-- They are created now anyway, because row level security has
-- already cost this project real debugging time once through
-- policies that queried each other and recursed. Four separate
-- migrations over the coming weeks is four separate chances to
-- reintroduce that, each in an editor that has to be cleared
-- first. One reviewed pass is safer than four rushed ones, and an
-- empty table that nothing writes to costs nothing.
-- =============================================================


-- =============================================================
-- PART 1 — CURRENCY
--
-- One integer per student, so it is a column on game_progress
-- rather than a table of its own. The existing game_progress
-- policies already scope it correctly and no new policy is needed.
--
-- SECURITY NOTE, stated here so it is a decision rather than a
-- discovery: this column is written by the client. A student with
-- the browser console open can set it to any value. That is
-- consistent with the decision already on record about act
-- unlocking, and it is acceptable for the same reason: currency
-- buys cosmetics only. It does not touch assessment scores, act
-- completion, objective counts, or anything the teacher dashboard
-- reports. The data that matters is protected by RLS; this is not
-- that data.
-- =============================================================

alter table public.game_progress
  add column if not exists currency int not null default 0;


-- =============================================================
-- PART 2 — INVENTORY AND EQUIPMENT
--
-- WHAT IS DELIBERATELY NOT HERE: the item catalogue.
--
-- Item definitions are static content, identical for every
-- student, and hold no secret. They live in the content layer as
-- content/items.js, alongside the acts, and arrive with Block 8.
--
-- This is the opposite of the choice made for assessment_items,
-- and the difference is the whole reason. That table holds
-- correct_index, which must never reach the browser. An item's
-- name and sprite have nothing to hide, so a database round trip
-- on a low-end phone would buy nothing at all.
--
-- Only OWNERSHIP needs the database, which is what follows.
--
-- item_id is therefore text and carries no foreign key. It refers
-- to a key in window.ITEMS. An item removed from the content file
-- leaves an orphan row that the client ignores, which is the
-- correct failure: a student's save is not corrupted by an edit
-- to a content file.
-- =============================================================

create table if not exists public.player_inventory (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references public.profiles(id) on delete cascade,
  item_id     text not null,
  quantity    int  not null default 1 check (quantity >= 0),
  acquired_at timestamptz not null default now(),
  unique (student_id, item_id)
);

alter table public.player_inventory enable row level security;

drop policy if exists "Students can view own inventory" on public.player_inventory;
create policy "Students can view own inventory"
  on public.player_inventory for select
  using (student_id = auth.uid());

drop policy if exists "Students can insert own inventory" on public.player_inventory;
create policy "Students can insert own inventory"
  on public.player_inventory for insert
  with check (student_id = auth.uid());

drop policy if exists "Students can update own inventory" on public.player_inventory;
create policy "Students can update own inventory"
  on public.player_inventory for update
  using (student_id = auth.uid());

drop policy if exists "Students can delete own inventory" on public.player_inventory;
create policy "Students can delete own inventory"
  on public.player_inventory for delete
  using (student_id = auth.uid());

drop policy if exists "Teachers can view their students' inventory" on public.player_inventory;
create policy "Teachers can view their students' inventory"
  on public.player_inventory for select
  using (public.is_teacher_of(player_inventory.student_id));


-- One row per OCCUPIED slot rather than a column per slot, so
-- adding a slot in Block 8 is data rather than another migration.
create table if not exists public.player_equipment (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references public.profiles(id) on delete cascade,
  slot        text not null,
  item_id     text not null,
  equipped_at timestamptz not null default now(),
  unique (student_id, slot)
);

alter table public.player_equipment enable row level security;

drop policy if exists "Students can view own equipment" on public.player_equipment;
create policy "Students can view own equipment"
  on public.player_equipment for select
  using (student_id = auth.uid());

drop policy if exists "Students can insert own equipment" on public.player_equipment;
create policy "Students can insert own equipment"
  on public.player_equipment for insert
  with check (student_id = auth.uid());

drop policy if exists "Students can update own equipment" on public.player_equipment;
create policy "Students can update own equipment"
  on public.player_equipment for update
  using (student_id = auth.uid());

drop policy if exists "Students can delete own equipment" on public.player_equipment;
create policy "Students can delete own equipment"
  on public.player_equipment for delete
  using (student_id = auth.uid());

drop policy if exists "Teachers can view their students' equipment" on public.player_equipment;
create policy "Teachers can view their students' equipment"
  on public.player_equipment for select
  using (public.is_teacher_of(player_equipment.student_id));


-- =============================================================
-- PART 3 — ACHIEVEMENTS
--
-- As with items, the catalogue is content and lives in
-- content/achievements.js. Only the unlock record is stored.
-- =============================================================

create table if not exists public.player_achievements (
  id             uuid primary key default gen_random_uuid(),
  student_id     uuid not null references public.profiles(id) on delete cascade,
  achievement_id text not null,
  unlocked_at    timestamptz not null default now(),
  unique (student_id, achievement_id)
);

alter table public.player_achievements enable row level security;

drop policy if exists "Students can view own achievements" on public.player_achievements;
create policy "Students can view own achievements"
  on public.player_achievements for select
  using (student_id = auth.uid());

drop policy if exists "Students can insert own achievements" on public.player_achievements;
create policy "Students can insert own achievements"
  on public.player_achievements for insert
  with check (student_id = auth.uid());

drop policy if exists "Teachers can view their students' achievements" on public.player_achievements;
create policy "Teachers can view their students' achievements"
  on public.player_achievements for select
  using (public.is_teacher_of(player_achievements.student_id));

-- No update and no delete policy, deliberately. An achievement is
-- unlocked once and never taken back, so the absence of those
-- policies is the enforcement.


-- =============================================================
-- PART 4 — TELEMETRY
--
-- These two tables exist to close the gap between the ERD, which
-- documents 15 entities, and the tables actually built. They are
-- named to match GameSession and PlayerAction in that document.
--
-- The ERD's third entity, GameScore, is deliberately NOT created.
-- It is already satisfied by assessment_scores together with
-- act_progress.performance_score, and a third table duplicating
-- them would be a worse answer at the defence than annotating the
-- ERD, which is the documentation task on record.
--
-- Nothing writes to these until Block 11. Three constraints apply
-- when it does, recorded here because they are easy to get wrong
-- once the tables already exist and inserting into them looks
-- harmless:
--
--   Fire and forget. A telemetry write that fails or stalls on a
--   bad connection must never block gameplay or surface an error
--   to a student. Nothing in the game reads these back.
--
--   Batched. The target device is a low-end Android phone, often
--   on mobile data. Flush periodically, not once per event.
--
--   Meaningful, not exhaustive. Act entered, scene changed, guard
--   detection triggered, damage taken, item equipped, test
--   submitted. Not input, not frames, not position. PlayerAction
--   describes a student's choices; a replay log on a class of
--   fifty is a table nobody will ever query.
-- =============================================================

create table if not exists public.game_sessions (
  id         uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  act_number int check (act_number between 1 and 4),
  started_at timestamptz not null default now(),
  ended_at   timestamptz
);

create index if not exists game_sessions_student_idx
  on public.game_sessions (student_id, started_at desc);

alter table public.game_sessions enable row level security;

drop policy if exists "Students can view own sessions" on public.game_sessions;
create policy "Students can view own sessions"
  on public.game_sessions for select
  using (student_id = auth.uid());

drop policy if exists "Students can insert own sessions" on public.game_sessions;
create policy "Students can insert own sessions"
  on public.game_sessions for insert
  with check (student_id = auth.uid());

drop policy if exists "Students can update own sessions" on public.game_sessions;
create policy "Students can update own sessions"
  on public.game_sessions for update
  using (student_id = auth.uid());

drop policy if exists "Teachers can view their students' sessions" on public.game_sessions;
create policy "Teachers can view their students' sessions"
  on public.game_sessions for select
  using (public.is_teacher_of(game_sessions.student_id));


-- student_id is carried on this table as well as on game_sessions,
-- which is deliberate denormalisation.
--
-- The alternative is a policy that looks the student up through
-- game_sessions, and game_sessions has policies of its own. That
-- is exactly the shape that produced "infinite recursion detected
-- in policy for relation profiles" in v1. Repeating one uuid per
-- row is cheaper than another security definer helper and much
-- cheaper than debugging a policy cycle a second time.
create table if not exists public.player_actions (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references public.game_sessions(id) on delete cascade,
  student_id  uuid not null references public.profiles(id) on delete cascade,
  action_type text not null,
  detail      jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists player_actions_session_idx
  on public.player_actions (session_id, created_at);

alter table public.player_actions enable row level security;

drop policy if exists "Students can view own actions" on public.player_actions;
create policy "Students can view own actions"
  on public.player_actions for select
  using (student_id = auth.uid());

drop policy if exists "Students can insert own actions" on public.player_actions;
create policy "Students can insert own actions"
  on public.player_actions for insert
  with check (student_id = auth.uid());

drop policy if exists "Teachers can view their students' actions" on public.player_actions;
create policy "Teachers can view their students' actions"
  on public.player_actions for select
  using (public.is_teacher_of(player_actions.student_id));

-- No update and no delete policy. Telemetry is append only; a
-- student being able to edit their own action log would make the
-- table worthless as evidence of anything.


-- =============================================================
-- VERIFICATION
--
-- Run these as each account rather than as the SQL editor's
-- service role, which bypasses RLS and will happily tell you
-- everything is fine.
--
-- As hi@example.com (student), from the browser console:
--   await sb.from('player_inventory').select('*')
-- Expect: data [], error null.
-- An error means RLS is denying a student their own empty table.
-- A hang means a policy cycle.
--
-- As guro@example.com (teacher), in an incognito window:
--   the same query, expecting data [] and error null.
--
-- Confirm the new column exists and defaults correctly:
--   select currency from public.game_progress limit 5;
-- Expect 0 for every existing row.
-- =============================================================
