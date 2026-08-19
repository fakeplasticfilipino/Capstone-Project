-- =============================================================
-- MACARIO — Enrollment setup (SQL version)
--
-- Use this INSTEAD of running create_accounts.js if you already
-- made your accounts by hand in the Supabase dashboard.
--
-- Run the steps ONE AT A TIME, top to bottom, and read the output
-- of each before moving on. Don't paste the whole file at once.
-- =============================================================


-- -------------------------------------------------------------
-- STEP 1 — See what you actually have right now
-- -------------------------------------------------------------
-- Run this by itself first. Look at the "role" column especially.

select
  u.email,
  p.role,
  p.full_name,
  p.class_id
from public.profiles p
join auth.users u on u.id = p.id
order by p.role, u.email;

-- WHAT YOU'RE LOOKING FOR:
--   * Is exactly ONE account marked 'teacher'?
--   * Is full_name filled in, or is it null?
--   * class_id is almost certainly null for everyone. That's fine,
--     Step 3 fixes it.
--
-- If EVERYONE says 'student', that's normal — accounts made through
-- the dashboard UI default to student. Step 2 fixes that.


-- -------------------------------------------------------------
-- STEP 2 — Promote one account to teacher
-- -------------------------------------------------------------
-- Skip this if Step 1 already showed a teacher.
-- Change the email to whichever account is yours/the teacher's.

update public.profiles
set role = 'teacher'
where id = (
  select id from auth.users
  where email = 'teacher1@example.com'   -- <<< EDIT THIS
);

-- While you're here — if full_name was null, set it. The dashboard
-- shows this, and "null" in a roster looks broken during a demo.

update public.profiles
set full_name = 'Guro Rivera'            -- <<< EDIT THIS
where id = (
  select id from auth.users
  where email = 'teacher1@example.com'   -- <<< AND THIS
);


-- -------------------------------------------------------------
-- STEP 3 — Create the class and enroll every student in it
-- -------------------------------------------------------------
-- This is the step that makes the teacher dashboard work at all.

-- 3a. Create the class, owned by your teacher account.
insert into public.classes (teacher_id, class_name, join_code)
select id, 'Grade 8 - Rizal', 'MAC8-RIZAL'   -- <<< EDIT THE CLASS NAME
from public.profiles
where role = 'teacher'
limit 1
on conflict (join_code) do nothing;

-- If this inserted 0 rows, you have no teacher account yet —
-- go back and do Step 2.

-- 3b. Put every student into that class.
update public.profiles
set class_id = (
  select id from public.classes where join_code = 'MAC8-RIZAL'
)
where role = 'student';


-- -------------------------------------------------------------
-- STEP 4 — Fill in student names (optional but do it)
-- -------------------------------------------------------------
-- Only needed if full_name was null in Step 1. Repeat per student.

update public.profiles
set full_name = 'Juan Dela Cruz'         -- <<< EDIT
where id = (
  select id from auth.users
  where email = 'student1@example.com'   -- <<< EDIT
);


-- -------------------------------------------------------------
-- STEP 5 — Verify
-- -------------------------------------------------------------
-- Re-run the Step 1 query. You now want to see:
--   * exactly one 'teacher', with class_id NULL
--     (teachers OWN a class, they aren't enrolled in it)
--   * every 'student' with the SAME class_id, not null
--   * no null full_names

select
  u.email,
  p.role,
  p.full_name,
  p.class_id
from public.profiles p
join auth.users u on u.id = p.id
order by p.role, u.email;


-- -------------------------------------------------------------
-- STEP 6 — Clean up stray teacher save files
-- -------------------------------------------------------------
-- Before the Block 1 patch, a teacher logging in got dropped into
-- the game and a save row was created for them. Those rows would
-- pollute your class averages later. Delete them.

delete from public.game_progress
where student_id in (
  select id from public.profiles where role = 'teacher'
);


-- -------------------------------------------------------------
-- NEED MORE ACCOUNTS LATER?
-- -------------------------------------------------------------
-- You can't create login accounts with SQL — passwords have to go
-- through Supabase's auth system. Two options:
--
--   A) Supabase dashboard -> Authentication -> Users -> Add user
--      (tick "Auto Confirm User"), then re-run Step 3b and Step 4.
--
--   B) Run create_accounts.js, which does all of it in one go.
--      Worth it once you're making 30+ student accounts for real
--      classroom testing. Not worth it for 3 test accounts.
