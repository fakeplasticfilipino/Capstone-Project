-- =============================================================
-- MACARIO — schema v13: a new account is always a student
--
-- Block 132 (14 Oct 2026). Found while building the dashboard's
-- account maker: the project's public sign-up is switched on
-- (GET /auth/v1/settings says "disable_signup": false), and
-- handle_new_user, the trigger that makes a profile for every new
-- account, takes the role from whatever the sign-up sent
-- (raw_user_meta_data ->> 'role'). So anyone holding the publishable
-- key, which is in the game's page, could sign up with role
-- "teacher" and, once the address was confirmed, rewrite every act's
-- test questions, trivia card and Talaan papers: those tables let any
-- teacher write, not only a class's own. Checked the same day: only
-- the two test accounts exist, so nobody has.
--
-- The fix here: the trigger always makes a student. A teacher is made
-- one by the service role afterwards (update profiles set role =
-- 'teacher'), which no browser can do since schema v11. The
-- create-students function already sets role 'student' itself, and
-- the local _dev/tools/create_accounts.js sets a teacher's role after
-- creating her. The other half is the proponent's: switch off
-- "Allow new users to sign up" in the Supabase dashboard
-- (Authentication, Sign In / Providers). Accounts made with the secret
-- key (the function, the script) still work with sign-up off.
--
-- Does not touch: any table, any row, any policy, any grant, the
-- trigger itself (on_auth_user_created), or full_name, which is still
-- read from the sign-up (the code, for a student).
--
-- Checked: pg_get_functiondef shows the new body; the execute grants
-- of schema v8 are unchanged (create or replace keeps them).
--
-- Undo (puts the hole back):
--   create or replace function public.handle_new_user() ... with
--   coalesce(new.raw_user_meta_data ->> 'role', 'student') as the role,
--   as in 001_macario_schema.sql.
-- =============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name)
  values (
    new.id,
    'student',
    new.raw_user_meta_data ->> 'full_name'
  );
  return new;
end;
$$;
