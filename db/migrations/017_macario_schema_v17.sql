-- =============================================================
-- MACARIO — schema v17: question types
--
-- Block 160 (9 Nov 2026, the instructor's suggestion, the proponent's
-- yes in the session the same day). Every question was one of four
-- choices with one right answer. A teacher may now also write:
--
--   multi      several right answers, ticked as boxes; right only when
--              exactly the right ones are ticked (all or nothing)
--   truefalse  Tama or Mali; graded as a single choice
--   essay      a few sentences of the student's own, kept for the
--              teacher to read and never scored: out of the score, the
--              maximum, the pass mark and the learning gain
--
-- What this does:
--
-- 1. assessment_items gains item_type (single, multi, truefalse, essay;
--    every existing row is single) and correct_indexes, the right
--    answers of a multi question as a list. correct_index stays, not
--    null: a multi question keeps its first right answer there, an
--    essay -1, so nothing that reads it breaks.
--
-- 2. submit_test is replaced. It grades each type as above. An answer
--    is a whole number (single, truefalse), a list of whole numbers
--    (multi) or text, at most 2000 characters kept (essay); anything
--    else is no answer. The answers record (schema 012) gains t, the
--    type, for multi and essay, and e, the essay's text, in place of
--    c and k. A test of essays only has a maximum of 0 and counts as
--    passed. Also fixed: the pass check on an earlier try divided two
--    whole numbers (8 / 10 = 0), so a post-test passed with less than
--    full marks could be sat again; it divides as numeric now.
--
-- Does not touch: any policy or grant (both columns are reached by
-- the table's existing ones: students read, teachers write), any row,
-- what a student may write (still nothing but through submit_test).
--
-- Checked (TRACKER.md, Run log): inside a transaction rolled back, as
-- the test student, with a multi, a true-or-false and an essay question
-- added for the probe: each graded as above; the essay's text in the
-- record and out of the maximum; a direct insert still refused.
--
-- Undo:
--   re-run the function from 015_macario_schema_v15.sql;
--   alter table public.assessment_items drop column correct_indexes,
--     drop column item_type;   (after deleting any non-single rows)
-- =============================================================

alter table public.assessment_items
  add column if not exists item_type text not null default 'single'
    check (item_type in ('single', 'multi', 'truefalse', 'essay')),
  add column if not exists correct_indexes jsonb
    check (correct_indexes is null or jsonb_typeof(correct_indexes) = 'array');

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
  v_items   int := 0;
  v_record  jsonb := '{}'::jsonb;
  v_item    record;
  v_raw     jsonb;
  v_choice  int;
  v_set     jsonb;
  v_key     jsonb;
  v_right   boolean;
  v_text    text;
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
        'passed', p_test = 'pre' or v_row.max_score = 0
                  or v_row.score::numeric / v_row.max_score >= v_pass,
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
    if v_row.max_score = 0 or v_row.score::numeric / v_row.max_score >= v_pass then
      raise exception 'ALREADY_PASSED' using errcode = '23505';
    end if;
    v_attempt := v_row.attempt + 1;
  end if;
  if p_attempt is not null and p_attempt <> v_attempt then
    raise exception 'BAD_ATTEMPT' using errcode = '23505';
  end if;

  for v_item in
    select id, item_order, question, correct_index, item_type, correct_indexes
      from public.assessment_items
     where act_number = p_act and test_type = p_test
     order by item_order
  loop
    v_items := v_items + 1;
    v_raw := p_answers -> v_item.item_order::text;

    if v_item.item_type = 'essay' then
      -- Kept for the teacher, never scored.
      if v_raw is not null and jsonb_typeof(v_raw) = 'string' then
        v_text := left(btrim(v_raw #>> '{}'), 2000);
        if v_text <> '' then
          v_record := v_record || jsonb_build_object(v_item.id::text, jsonb_build_object(
            'o', v_item.item_order, 't', 'essay', 'e', v_text,
            'q', left(v_item.question, 600)));
        end if;
      end if;
      continue;
    end if;

    v_max := v_max + 1;

    if v_item.item_type = 'multi' then
      -- Every element a whole number, else no answer; compared as sets.
      if v_raw is not null and jsonb_typeof(v_raw) = 'array' and jsonb_array_length(v_raw) > 0
         and not exists (select 1 from jsonb_array_elements(v_raw) x
                          where jsonb_typeof(x) <> 'number' or (x #>> '{}') !~ '^[0-9]{1,3}$') then
        select coalesce(jsonb_agg(distinct (x #>> '{}')::int order by (x #>> '{}')::int), '[]'::jsonb)
          into v_set from jsonb_array_elements(v_raw) x;
        select coalesce(jsonb_agg(distinct (x #>> '{}')::int order by (x #>> '{}')::int), '[]'::jsonb)
          into v_key
          from jsonb_array_elements(coalesce(v_item.correct_indexes, jsonb_build_array(v_item.correct_index))) x
         where jsonb_typeof(x) = 'number';
        v_right := v_set = v_key;
        if v_right then v_score := v_score + 1; end if;
        v_record := v_record || jsonb_build_object(v_item.id::text, jsonb_build_object(
          'o', v_item.item_order, 't', 'multi', 'c', v_set,
          'k', case when v_right then 1 else 0 end,
          'q', left(v_item.question, 600)));
      end if;
      continue;
    end if;

    -- single and truefalse: one whole number.
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

  if v_items = 0 then
    raise exception 'NO_ITEMS' using errcode = 'P0002';
  end if;

  insert into public.assessment_scores
    (student_id, act_number, test_type, score, max_score, attempt, answers)
  values
    (v_student, p_act, p_test, v_score, v_max, v_attempt, v_record);

  return jsonb_build_object('score', v_score, 'max_score', v_max, 'attempt', v_attempt,
    'passed', p_test = 'pre' or v_max = 0 or v_score::numeric / v_max >= v_pass);
end;
$$;

revoke all on function public.submit_test(int, text, jsonb, int) from public, anon;
grant execute on function public.submit_test(int, text, jsonb, int) to authenticated;

comment on function public.submit_test(int, text, jsonb, int) is
  'Block 160: grades a test (single, multi all or nothing, truefalse; essay kept, not scored) against assessment_items and writes the score for auth.uid(); the only way a browser writes assessment_scores.';
