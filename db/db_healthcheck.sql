-- =============================================================
-- MACARIO — database health check
--
-- Read-only. Creates nothing, changes nothing, deletes nothing.
-- Safe to run any number of times.
--
-- CLEAR THE SQL EDITOR FIRST, paste this whole file, and Run.
-- Then copy the whole result table and send it back.
--
-- It answers: which migrations actually ran, whether row level
-- security is on everywhere it should be, how many assessment
-- items are seeded, and whether the accounts are set up in a way
-- that lets the teacher dashboard show anything.
-- =============================================================

-- The eleven tables of the revised ERD, as of schema v4.
-- player_actions and player_achievements were DROPPED in v4 and are
-- deliberately absent; section 1b below checks they are really gone.
with expected_tables(name) as (
  values ('profiles'),('classes'),('game_progress'),('act_progress'),
         ('assessment_items'),('assessment_scores'),('act_trivia'),
         ('player_inventory'),('player_equipment'),('game_sessions'),
         ('feedback')
),
dropped_tables(name) as (
  values ('player_actions'),('player_achievements')
),
expected_columns(tbl, col, added_by) as (
  values ('game_progress','currency','v3'),
         ('act_progress','damage_taken','v4'),
         ('act_progress','detections','v4'),
         ('act_progress','elapsed_ms','v4')
),
expected_funcs(name) as (
  values ('my_role'),('my_class_id'),('is_teacher_of'),
         ('get_assessment_items'),('submit_assessment')
)

-- 1. Does every table exist, and is RLS switched on?
select '1 table' as kind,
       e.name as item,
       case when t.tablename is null then 'MISSING'
            when t.rowsecurity     then 'ok, RLS on'
            else                        'EXISTS BUT RLS IS OFF' end as status
from expected_tables e
left join pg_tables t
  on t.schemaname = 'public' and t.tablename = e.name

union all

-- 1b. Are the two v4 drops actually gone? A row reading STILL
--     PRESENT means macario_schema_v4.sql has not been run, or was
--     stopped by the safety guard in its PART 3.
select '1b dropped', d.name,
       case when t.tablename is null then 'ok, gone'
            else 'STILL PRESENT' end
from dropped_tables d
left join pg_tables t
  on t.schemaname = 'public' and t.tablename = d.name

union all

-- 2. Did the migrations add their columns? Any v4 row reading
--    MISSING means Block 9 will write to a column that does not
--    exist: the write fails in the console while the score still
--    looks correct in memory, which is the worst way to find out.
select '2 column', e.added_by || ' ' || e.tbl || '.' || e.col,
       case when exists (
         select 1 from information_schema.columns
         where table_schema = 'public'
           and table_name   = e.tbl
           and column_name  = e.col
       ) then 'ok' else 'MISSING' end
from expected_columns e

union all

-- 3. Do the security definer functions exist?
select '3 function', e.name,
       case when p.proname is null then 'MISSING' else 'ok' end
from expected_funcs e
left join pg_proc p
  on p.proname = e.name and p.pronamespace = 'public'::regnamespace

union all

-- 4. How many assessment items are seeded, per act and test type?
--    Act 1 should read 5 before macario_items_v3.sql, 10 after.
select '4 items', 'act ' || act_number || ' ' || test_type, count(*)::text
from public.assessment_items
group by act_number, test_type

union all

-- 5. Which trivia fact is live? The v2 one names Tondo and the
--    trades, which are pre-test answers. The v3 one does not.
select '5 trivia', 'act ' || act_number, left(fact, 70) || '...'
from public.act_trivia

union all

-- 6. How many accounts of each role?
select '6 accounts', coalesce(role, 'no role set'), count(*)::text
from public.profiles
group by role

union all

-- 7. Are students assigned to a class? If not, every teacher
--    policy returns zero rows and the dashboard looks broken
--    with no error anywhere.
select '7 enrollment',
       case when class_id is null then 'students WITHOUT a class'
            else 'students with a class' end,
       count(*)::text
from public.profiles
where role = 'student'
group by case when class_id is null then 'students WITHOUT a class'
              else 'students with a class' end

union all

-- 8. Has anyone already sat a test? Matters because one attempt
--    per act per test type is enforced.
select '8 scores', 'assessment_scores rows', count(*)::text
from public.assessment_scores

union all

-- 9. Block 9 write targets. Both are expected to be 0 until an act
--    has actually been played through on this database.
select '9 block 9', 'game_sessions rows', count(*)::text
from public.game_sessions

union all

select '9 block 9', 'feedback rows', count(*)::text
from public.feedback

order by 1, 2;
