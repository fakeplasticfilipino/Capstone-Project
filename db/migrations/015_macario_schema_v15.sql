-- =============================================================
-- MACARIO — schema v15: the database grades every test
--
-- Block 153 (7 Nov 2026, the proponent's choice, before the repository
-- is reviewed). Since schema 006 the game graded a test itself and
-- inserted the score, and the only check on that insert was
-- student_id = auth.uid(): a student with the console open could
-- write any score he liked, for any act, as attempt after attempt.
-- The scores are the study's data, so they are now written by the
-- database alone.
--
-- What this does:
--
-- 1. public.submit_test(p_act, p_test, p_answers, p_attempt), security
--    definer. The caller is auth.uid(), never an argument. It reads the
--    act's questions from assessment_items, counts the right answers
--    in p_answers ({ "<item_order>": choice }), builds the answers
--    record the dashboard's Questions report reads (schema 012:
--    { item id: { o, c, k, q } }), inserts the row and returns
--    { score, max_score, attempt, passed }. It enforces what the game
--    used to enforce alone: the pre-test once; a post-test again only
--    after a failed one; the attempt numbered by the database. The
--    same p_attempt sent twice (a reply lost to a dropped connection,
--    then the kept score sent again) returns the row already written
--    instead of writing a second.
--
-- 2. Students and visitors lose INSERT on assessment_scores (a revoke,
--    not a dropped policy, so it is undone by one grant). The function
--    is now the only way a score is written from a browser.
--
-- Does not touch: what anyone may read. Students still read the
-- questions whole, answers included, and their own scores, as the
-- proponent wants for a teaching tool; teachers' reads and edits of
-- the questions are unchanged. No row is changed or deleted; the one
-- score already written stays as it is. The pass mark (0.75) is the
-- one content/questions.js gives every act; a change there is a change
-- here too.
--
-- Checked (TRACKER.md, Run log): inside a transaction that is rolled
-- back, as the test student, a direct insert is refused, submit_test
-- grades and records, a second pre-test is refused, a repeated
-- attempt returns the first row; as a visitor the function is refused.
--
-- Undo:
--   grant insert on public.assessment_scores to authenticated;
--   drop function public.submit_test(int, text, jsonb, int);
--   (and the game's assessment.js from before Block 153)
-- =============================================================

create or replace function public.submit_test(
  p_act     int,
  p_test    text,
  p_answers jsonb,
  p_attempt int default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student uuid := auth.uid();
  v_pass    numeric := 0.75;
  v_row     public.assessment_scores%rowtype;
  v_attempt int := 1;
  v_score   int := 0;
  v_max     int := 0;
  v_record  jsonb := '{}'::jsonb;
  v_item    record;
  v_raw     jsonb;
  v_choice  int;
begin
  if v_student is null then
    raise exception 'NOT_SIGNED_IN' using errcode = '28000';
  end if;
  if p_test is null or p_test not in ('pre', 'post') then
    raise exception 'BAD_TEST' using errcode = '22023';
  end if;
  if p_answers is null or jsonb_typeof(p_answers) <> 'object' then
    raise exception 'BAD_ANSWERS' using errcode = '22023';
  end if;

  -- The same try sent again: what was written the first time.
  if p_attempt is not null then
    select * into v_row from public.assessment_scores
     where student_id = v_student and act_number = p_act
       and test_type = p_test and attempt = p_attempt;
    if found then
      return jsonb_build_object('score', v_row.score, 'max_score', v_row.max_score,
        'attempt', v_row.attempt,
        'passed', p_test = 'pre' or (v_row.max_score > 0 and v_row.score / v_row.max_score >= v_pass),
        'already', true);
    end if;
  end if;

  -- The last try decides whether another may be sat.
  select * into v_row from public.assessment_scores
   where student_id = v_student and act_number = p_act and test_type = p_test
   order by attempt desc limit 1;
  if found then
    if p_test = 'pre' then
      raise exception 'ALREADY_SUBMITTED' using errcode = '23505';
    end if;
    if v_row.max_score > 0 and v_row.score / v_row.max_score >= v_pass then
      raise exception 'ALREADY_PASSED' using errcode = '23505';
    end if;
    v_attempt := v_row.attempt + 1;
  end if;
  if p_attempt is not null and p_attempt <> v_attempt then
    raise exception 'BAD_ATTEMPT' using errcode = '23505';
  end if;

  for v_item in
    select id, item_order, question, correct_index
      from public.assessment_items
     where act_number = p_act and test_type = p_test
     order by item_order
  loop
    v_max := v_max + 1;
    v_raw := p_answers -> v_item.item_order::text;
    -- Only a whole number is an answer; anything else is no answer.
    if v_raw is not null and jsonb_typeof(v_raw) = 'number'
       and (v_raw #>> '{}') ~ '^[0-9]{1,3}$' then
      v_choice := (v_raw #>> '{}')::int;
      if v_choice = v_item.correct_index then
        v_score := v_score + 1;
      end if;
      v_record := v_record || jsonb_build_object(v_item.id::text, jsonb_build_object(
        'o', v_item.item_order, 'c', v_choice,
        'k', case when v_choice = v_item.correct_index then 1 else 0 end,
        'q', left(v_item.question, 600)));
    end if;
  end loop;

  if v_max = 0 then
    raise exception 'NO_ITEMS' using errcode = 'P0002';
  end if;

  insert into public.assessment_scores
    (student_id, act_number, test_type, score, max_score, attempt, answers)
  values
    (v_student, p_act, p_test, v_score, v_max, v_attempt, v_record);

  return jsonb_build_object('score', v_score, 'max_score', v_max, 'attempt', v_attempt,
    'passed', p_test = 'pre' or v_score::numeric / v_max >= v_pass);
end;
$$;

revoke all on function public.submit_test(int, text, jsonb, int) from public, anon;
grant execute on function public.submit_test(int, text, jsonb, int) to authenticated;

-- The function is now the only door a score comes in by.
revoke insert on public.assessment_scores from anon, authenticated;

comment on function public.submit_test(int, text, jsonb, int) is
  'Block 153: grades a test against assessment_items and writes the score for auth.uid(); the only way a browser writes assessment_scores.';
