-- =============================================================
-- MACARIO — schema v5
--
-- CLEAR THE SQL EDITOR BEFORE PASTING.
--
-- Adds an in-game full reset, and nothing else. No new tables, no
-- new columns, no policy changes. The ERD stays at eleven entities.
--
--
-- WHY A FUNCTION RATHER THAN A DELETE POLICY
--
-- The settings screen offers a reset that puts a student back to a
-- completely fresh start. Doing that from the client is impossible
-- and must stay impossible: assessment_scores has a select policy
-- and an insert policy and nothing else, which is what makes one
-- attempt per student per act per test type mean what it says. The
-- same is true of feedback, and game_progress, act_progress and
-- game_sessions have no delete policy either.
--
-- Adding delete policies would have been the smaller migration and
-- is the wrong one. It would hand every student's browser, forever,
-- the ability to erase their own assessment scores, which is the
-- single finding this study rests on. A security definer function
-- is narrower: it does exactly one fixed thing, and the caller
-- cannot vary it.
--
--
-- WHO MAY CALL IT
--
-- Named accounts only, listed in is_reset_allowed below. This copies
-- the precedent in db/reset_test_accounts.sql, which names the two
-- test accounts explicitly rather than taking a role, and for the
-- same reason stated there: a study account's one attempt IS the
-- data, and deleting it deletes the finding.
--
-- A role check would not do. Pilot students and study students are
-- both role 'student', and create_accounts.js issues both as
-- mag-aaralNN@example.com, so there is no pattern that separates
-- them either. Only a list does.
--
-- The check is server side. A study account cannot reset itself by
-- tapping, by editing the page, or from the browser console, because
-- the refusal happens in the database rather than in shell.js.
--
--
-- EXTENDING THE LIST
--
-- When the pilot accounts exist, add their addresses to the array in
-- is_reset_allowed and run that one statement again. It is a
-- create or replace, so it needs no migration of its own and nothing
-- else in this file has to be re-run. Record it in TRACKER.md's Run
-- log the same way.
-- =============================================================


-- =============================================================
-- PART 1 — WHO IS ALLOWED
--
-- Kept separate so the list lives in exactly one place. Both
-- functions below read it, so the button a student sees and the
-- refusal the database gives can never disagree.
--
-- NOT granted to any client role. It takes a uuid, so exposing it
-- would let any logged in student probe whether another account is
-- on the list. can_reset_my_data() below is the public read, and it
-- can only ask about the caller.
-- =============================================================

create or replace function public.is_reset_allowed(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from auth.users u
    where u.id = uid
      and lower(u.email) = any (array[
        -- The two development accounts. Add pilot addresses here.
        -- NEVER add a study account.
        'hi@example.com',
        'guro@example.com'
      ])
  );
$$;

revoke all on function public.is_reset_allowed(uuid) from public;
revoke all on function public.is_reset_allowed(uuid) from anon;
revoke all on function public.is_reset_allowed(uuid) from authenticated;


-- =============================================================
-- PART 2 — THE READ
--
-- shell.js asks this before drawing the reset button, so a student
-- who may not reset never sees the offer. That is a courtesy, not
-- the guarantee. The guarantee is PART 3 refusing.
-- =============================================================

create or replace function public.can_reset_my_data()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select coalesce(public.is_reset_allowed(auth.uid()), false);
$$;

revoke all on function public.can_reset_my_data() from public;
revoke all on function public.can_reset_my_data() from anon;
grant execute on function public.can_reset_my_data() to authenticated;


-- =============================================================
-- PART 3 — THE RESET
--
-- Deletes the caller's rows in all seven student-owned tables. It
-- takes no arguments on purpose: there is no student_id to pass, so
-- there is no request a student could edit to reset somebody else.
--
-- profiles and auth.users are NOT touched. The account, its class
-- enrolment and its password all survive, which is what makes this
-- "start the game over" rather than "delete me". The student stays
-- logged in.
--
-- The delete order matches db/reset_test_accounts.sql. Equipment
-- before inventory, because a slot row names an item the student
-- owns and clearing ownership first would leave the account wearing
-- something it no longer has.
--
-- Raises rather than returning false on refusal, so a client that
-- ignores the return value still cannot mistake a refusal for a
-- wipe.
-- =============================================================

create or replace function public.reset_my_play_data()
returns void
language plpgsql
volatile
security definer
set search_path = public, auth
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;

  if not public.is_reset_allowed(uid) then
    raise exception 'NOT_ALLOWED';
  end if;

  delete from public.feedback           where student_id = uid;
  delete from public.assessment_scores  where student_id = uid;
  delete from public.act_progress       where student_id = uid;
  delete from public.game_progress      where student_id = uid;
  delete from public.game_sessions      where student_id = uid;
  delete from public.player_equipment   where student_id = uid;
  delete from public.player_inventory   where student_id = uid;
end;
$$;

revoke all on function public.reset_my_play_data() from public;
revoke all on function public.reset_my_play_data() from anon;
grant execute on function public.reset_my_play_data() to authenticated;


-- =============================================================
-- VERIFY
--
-- Expect three rows, all security definer, and the grants below
-- them. Anything else means a statement above did not run.
-- =============================================================

select p.proname                          as function,
       p.prosecdef                        as security_definer,
       pg_get_function_identity_arguments(p.oid) as arguments
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in ('is_reset_allowed', 'can_reset_my_data', 'reset_my_play_data')
order by p.proname;

-- Expect exactly two rows, both for role authenticated:
--   can_reset_my_data   and   reset_my_play_data
-- is_reset_allowed must NOT appear. If it does, its revoke did not
-- run and any student can probe the allowlist.
select r.routine_name, r.grantee, r.privilege_type
from information_schema.routine_privileges r
where r.routine_schema = 'public'
  and r.routine_name in ('is_reset_allowed', 'can_reset_my_data', 'reset_my_play_data')
  and r.grantee in ('anon', 'authenticated')
order by r.routine_name, r.grantee;
