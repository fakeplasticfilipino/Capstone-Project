-- =============================================================
-- MACARIO — Database schema for Supabase
-- Run this whole file once in Supabase's SQL Editor (Run button).
-- Safe to re-read top to bottom before running — nothing here
-- touches anything outside the tables/policies it creates.
-- =============================================================

-- Just in case gen_random_uuid() isn't already enabled on this project.
create extension if not exists "pgcrypto";

-- -------------------------------------------------------------
-- 1. PROFILES
-- Every logged-in person (student or teacher) gets a row here.
-- This "extends" Supabase's built-in auth.users table with the
-- extra info our game actually needs (role, name, which class).
-- -------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'student' check (role in ('student', 'teacher')),
  full_name text,
  class_id uuid, -- filled in once "classes" exists below
  created_at timestamptz not null default now()
);

-- -------------------------------------------------------------
-- 2. CLASSES
-- A teacher creates a class; students join it with a code.
-- -------------------------------------------------------------
create table public.classes (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  class_name text not null,
  join_code text not null unique,
  created_at timestamptz not null default now()
);

-- Now that "classes" exists, link profiles.class_id to it.
alter table public.profiles
  add constraint profiles_class_id_fkey
  foreign key (class_id) references public.classes(id) on delete set null;

-- -------------------------------------------------------------
-- 3. GAME PROGRESS
-- One row per student = their live save file. save_state is a
-- flexible JSON blob (quests, dialogue flags, etc.) so we don't
-- have to keep editing the database every time a new quest or
-- story flag gets added in the game's code.
-- -------------------------------------------------------------
create table public.game_progress (
  student_id uuid primary key references public.profiles(id) on delete cascade,
  current_room text not null default 'road',
  is_night boolean not null default false,
  save_state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- -------------------------------------------------------------
-- 4. ASSESSMENT SCORES
-- Structured (not JSON) so the teacher dashboard can easily run
-- averages, completion rates, etc. One row per act per test.
-- -------------------------------------------------------------
create table public.assessment_scores (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  act_number int not null,
  test_type text not null check (test_type in ('pre', 'post')),
  score numeric not null,
  max_score numeric not null,
  completed_at timestamptz not null default now(),
  unique (student_id, act_number, test_type)
);

-- -------------------------------------------------------------
-- Auto-create a profile row the moment someone signs up.
-- role/full_name are passed in during signup (we'll set this up
-- in the game's login code) and default to 'student' if omitted.
-- -------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'role', 'student'),
    new.raw_user_meta_data ->> 'full_name'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================
-- ROW LEVEL SECURITY
-- Without this, anyone with the publishable key could read or
-- edit ANY row. These policies make the database itself enforce
-- "you can only touch your own data" — no matter what the
-- front-end code does or doesn't check.
-- =============================================================

alter table public.profiles enable row level security;
alter table public.classes enable row level security;
alter table public.game_progress enable row level security;
alter table public.assessment_scores enable row level security;

-- ---- profiles ----
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Teachers can view students in their class"
  on public.profiles for select
  using (
    exists (
      select 1 from public.classes c
      where c.id = profiles.class_id
      and c.teacher_id = auth.uid()
    )
  );

-- ---- classes ----
create policy "Teachers can manage their own classes"
  on public.classes for all
  using (teacher_id = auth.uid())
  with check (teacher_id = auth.uid());

create policy "Students can view their own class"
  on public.classes for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.class_id = classes.id
    )
  );

-- ---- game_progress ----
create policy "Students can view own progress"
  on public.game_progress for select
  using (student_id = auth.uid());

create policy "Students can insert own progress"
  on public.game_progress for insert
  with check (student_id = auth.uid());

create policy "Students can update own progress"
  on public.game_progress for update
  using (student_id = auth.uid());

create policy "Teachers can view their students' progress"
  on public.game_progress for select
  using (
    exists (
      select 1 from public.profiles p
      join public.classes c on c.id = p.class_id
      where p.id = game_progress.student_id
      and c.teacher_id = auth.uid()
    )
  );

-- ---- assessment_scores ----
create policy "Students can view own scores"
  on public.assessment_scores for select
  using (student_id = auth.uid());

create policy "Students can insert own scores"
  on public.assessment_scores for insert
  with check (student_id = auth.uid());

create policy "Teachers can view their students' scores"
  on public.assessment_scores for select
  using (
    exists (
      select 1 from public.profiles p
      join public.classes c on c.id = p.class_id
      where p.id = assessment_scores.student_id
      and c.teacher_id = auth.uid()
    )
  );
