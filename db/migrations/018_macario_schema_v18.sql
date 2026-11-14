-- =============================================================
-- MACARIO — schema v18: an administrator
--
-- Block 166 (14 Nov 2026, the instructor's direction: the game is to
-- run without its developers; the only reason to reach them is to make
-- an administrator). Until now a teacher's account was made by the
-- developers with the secret key. An administrator now makes teachers,
-- hands sections from one to another and manages any section's
-- students, from admin.html and the dashboard's Students tab.
--
-- What this does:
--   1. profiles.role may be 'admin' as well as 'student' and 'teacher'.
--   2. private.is_admin(): whether the caller's own profile says admin.
--      Security definer, like the other policy helpers, so the two
--      policies below do not read profiles through profiles' own
--      policies (the recursion CLAUDE.md warns of).
--   3. Two SELECT policies: an administrator reads every profile and
--      every class. Nothing else.
--
-- What an administrator still cannot do from a browser: write anything.
-- No INSERT, UPDATE or DELETE policy is added; every change an admin
-- makes goes through the create-students function, which checks the
-- role and does a fixed list of things. And read anything a student
-- did: no policy is added on game_progress, act_progress,
-- assessment_scores, game_sessions, feedback, player_inventory or
-- player_equipment, so scores stay the teacher's.
--
-- Nobody becomes an administrator by this file. handle_new_user still
-- makes every new account a student (schema v13) and no browser role
-- may update profiles (schema v11): the first administrator is made by
-- the developers, by hand, with the service role, and recorded in
-- TRACKER.md's Run log.
--
-- Does not touch: any row, any existing policy, grant or function.
--
-- Checked (TRACKER.md, Run log): before and after, what a student, the
-- teacher and a signed-out visitor can count in profiles and classes is
-- unchanged; an administrator counts every profile and class and no
-- row of assessment_scores.
--
-- Undo:
--   drop policy "Admins can view all profiles" on public.profiles;
--   drop policy "Admins can view all classes" on public.classes;
--   drop function private.is_admin();
--   alter table public.profiles drop constraint profiles_role_check;
--   alter table public.profiles add constraint profiles_role_check
--     check (role = any (array['student'::text, 'teacher'::text]));
--   (only once no profile has the role admin)
-- =============================================================

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role = any (array['student'::text, 'teacher'::text, 'admin'::text]));

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

revoke all on function private.is_admin() from public;
grant execute on function private.is_admin() to authenticated;

create policy "Admins can view all profiles"
  on public.profiles for select
  to authenticated
  using (private.is_admin());

create policy "Admins can view all classes"
  on public.classes for select
  to authenticated
  using (private.is_admin());
