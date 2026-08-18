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

with expected_tables(name) as (
  values ('profiles'),('classes'),('game_progress'),('act_progress'),
         ('assessment_items'),('assessment_scores'),('act_trivia'),
         ('player_inventory'),('player_equipment'),('player_achievements'),
         ('game_sessions'),('player_actions')
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

-- 2. Did schema v3 add the currency column?
select '2 column', 'game_progress.currency',
       case when exists (
         select 1 from information_schema.columns
         where table_schema = 'public'
           and table_name   = 'game_progress'
           and column_name  = 'currency'
       ) then 'ok' else 'MISSING' end

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

order by 1, 2;
