-- =============================================================
-- MACARIO — Schema v2 (Block 0)
--
-- Purely ADDITIVE to macario_schema.sql. Nothing here drops a
-- table or touches existing rows. The only things dropped are
-- four RLS *policies*, which are immediately recreated in a
-- non-recursive form.
--
-- Run this whole file once in Supabase's SQL Editor.
-- Safe to re-run: every statement is idempotent.
-- =============================================================


-- =============================================================
-- PART 1 — FIX THE RLS RECURSION
--
-- The v1 policies had a cycle:
--   profiles policy  -> queries classes
--   classes policy   -> queries profiles
-- Postgres detects this and throws:
--   "infinite recursion detected in policy for relation profiles"
--
-- The fix: helper functions marked SECURITY DEFINER. They run as
-- the function owner, which bypasses RLS on the tables they read,
-- so the cycle is broken. Each is STABLE so Postgres caches the
-- result within a single query.
--
-- NOTE: do NOT name these current_role() / current_user() —
-- those are reserved SQL keywords in Postgres.
-- =============================================================

create or replace function public.my_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.my_class_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select class_id from public.profiles where id = auth.uid();
$$;

-- True if the currently logged-in user is the teacher of the
-- class that p_student belongs to.
create or replace function public.is_teacher_of(p_student uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    join public.classes c on c.id = p.class_id
    where p.id = p_student
      and c.teacher_id = auth.uid()
  );
$$;

grant execute on function public.my_role()            to authenticated;
grant execute on function public.my_class_id()        to authenticated;
grant execute on function public.is_teacher_of(uuid)  to authenticated;


-- ---- Rewrite the four recursive policies -------------------

drop policy if exists "Teachers can view students in their class" on public.profiles;
create policy "Teachers can view students in their class"
  on public.profiles for select
  using (public.is_teacher_of(profiles.id));

drop policy if exists "Students can view their own class" on public.classes;
create policy "Students can view their own class"
  on public.classes for select
  using (id = public.my_class_id());

drop policy if exists "Teachers can view their students' progress" on public.game_progress;
create policy "Teachers can view their students' progress"
  on public.game_progress for select
  using (public.is_teacher_of(game_progress.student_id));

drop policy if exists "Teachers can view their students' scores" on public.assessment_scores;
create policy "Teachers can view their students' scores"
  on public.assessment_scores for select
  using (public.is_teacher_of(assessment_scores.student_id));


-- =============================================================
-- PART 2 — ACT STRUCTURE
-- =============================================================

-- Which act the student is currently sitting in. The detailed
-- per-act state lives in act_progress below; this is just the
-- pointer the game reads on load.
alter table public.game_progress
  add column if not exists current_act int not null default 1;


-- One row per student per act. This is what the teacher
-- dashboard aggregates over.
create table if not exists public.act_progress (
  student_id        uuid not null references public.profiles(id) on delete cascade,
  act_number        int  not null check (act_number between 1 and 4),

  -- Mirrors the flow controller's state machine in acts.js:
  -- locked -> trivia -> pretest -> playing -> posttest -> completed
  status            text not null default 'locked'
                    check (status in ('locked','trivia','pretest','playing','posttest','completed')),

  -- Objective completion. performance_score is derived from these
  -- for now; stealth/combat terms get added when those systems land.
  objectives_total  int not null default 0,
  objectives_done   int not null default 0,
  performance_score numeric,

  started_at        timestamptz,
  completed_at      timestamptz,
  updated_at        timestamptz not null default now(),

  primary key (student_id, act_number)
);

alter table public.act_progress enable row level security;

drop policy if exists "Students can view own act progress" on public.act_progress;
create policy "Students can view own act progress"
  on public.act_progress for select
  using (student_id = auth.uid());

drop policy if exists "Students can insert own act progress" on public.act_progress;
create policy "Students can insert own act progress"
  on public.act_progress for insert
  with check (student_id = auth.uid());

drop policy if exists "Students can update own act progress" on public.act_progress;
create policy "Students can update own act progress"
  on public.act_progress for update
  using (student_id = auth.uid());

drop policy if exists "Teachers can view their students' act progress" on public.act_progress;
create policy "Teachers can view their students' act progress"
  on public.act_progress for select
  using (public.is_teacher_of(act_progress.student_id));


-- =============================================================
-- PART 3 — ASSESSMENT ITEM BANK
--
-- SECURITY: this table holds the answer key. It has RLS enabled
-- and NO select policy for students, so a student querying it
-- directly gets zero rows even with a valid token. Questions are
-- served by get_assessment_items() (which omits correct_index)
-- and graded by submit_assessment() — both SECURITY DEFINER.
-- The answer key never leaves the database.
-- =============================================================

create table if not exists public.assessment_items (
  id            uuid primary key default gen_random_uuid(),
  act_number    int  not null check (act_number between 1 and 4),
  test_type     text not null check (test_type in ('pre','post')),
  item_order    int  not null,
  question      text not null,
  choices       jsonb not null,          -- ["choice A","choice B","choice C","choice D"]
  correct_index int  not null,           -- 0-based index into choices
  unique (act_number, test_type, item_order)
);

alter table public.assessment_items enable row level security;
-- Deliberately no student-facing select policy. Teachers get one
-- so they can review the bank from the dashboard later if needed.
drop policy if exists "Teachers can view the item bank" on public.assessment_items;
create policy "Teachers can view the item bank"
  on public.assessment_items for select
  using (public.my_role() = 'teacher');


-- The trivia fact shown before each pre-test (proposal: "each
-- pre-test is preceded by a historical trivia fact").
create table if not exists public.act_trivia (
  act_number int primary key check (act_number between 1 and 4),
  fact       text not null
);

alter table public.act_trivia enable row level security;

drop policy if exists "Anyone logged in can read trivia" on public.act_trivia;
create policy "Anyone logged in can read trivia"
  on public.act_trivia for select
  using (auth.uid() is not null);


-- ---- Serve questions WITHOUT the answer key ----------------

create or replace function public.get_assessment_items(
  p_act_number int,
  p_test_type  text
)
returns table (
  id         uuid,
  item_order int,
  question   text,
  choices    jsonb
)
language sql
stable
security definer
set search_path = public
as $$
  select id, item_order, question, choices
  from public.assessment_items
  where act_number = p_act_number
    and test_type  = p_test_type
  order by item_order;
$$;

grant execute on function public.get_assessment_items(int, text) to authenticated;


-- ---- Grade server-side -------------------------------------
--
-- p_answers shape: {"<item_id>": <choice_index>, ...}
--
-- Enforces one attempt per (student, act, test_type). The unique
-- constraint on assessment_scores is the real backstop; the
-- explicit check here just produces a friendlier error.

create or replace function public.submit_assessment(
  p_act_number int,
  p_test_type  text,
  p_answers    jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_student uuid := auth.uid();
  v_score   int  := 0;
  v_max     int  := 0;
  v_item    record;
  v_answer  int;
begin
  if v_student is null then
    raise exception 'Not authenticated';
  end if;

  if p_test_type not in ('pre','post') then
    raise exception 'Invalid test type: %', p_test_type;
  end if;

  if exists (
    select 1 from public.assessment_scores
    where student_id = v_student
      and act_number = p_act_number
      and test_type  = p_test_type
  ) then
    raise exception 'ALREADY_SUBMITTED';
  end if;

  for v_item in
    select id, correct_index
    from public.assessment_items
    where act_number = p_act_number
      and test_type  = p_test_type
  loop
    v_max := v_max + 1;

    -- Unanswered or malformed -> counts as wrong, never crashes.
    begin
      v_answer := (p_answers ->> v_item.id::text)::int;
    exception when others then
      v_answer := null;
    end;

    if v_answer is not null and v_answer = v_item.correct_index then
      v_score := v_score + 1;
    end if;
  end loop;

  if v_max = 0 then
    raise exception 'NO_ITEMS_CONFIGURED for act % (%)', p_act_number, p_test_type;
  end if;

  insert into public.assessment_scores
    (student_id, act_number, test_type, score, max_score)
  values
    (v_student, p_act_number, p_test_type, v_score, v_max);

  return jsonb_build_object('score', v_score, 'max_score', v_max);
end;
$$;

grant execute on function public.submit_assessment(int, text, jsonb) to authenticated;


-- =============================================================
-- PART 4 — SEED: ACT I ("The Awakening")
--
-- ⚠️ VALIDATE THESE WITH YOUR RESOURCE PERSON before testing on
-- real students. Ms. Donadillo-Espiritu is already listed in your
-- appendix as the subject-matter consultant — having her sign off
-- on the item bank is a cheap, strong line in your defense.
--
-- Pre and post are PARALLEL FORMS: same five learning objectives,
-- different wording and different correct positions. That is what
-- makes a pre/post gain score defensible rather than a memory test.
-- =============================================================

insert into public.act_trivia (act_number, fact) values
  (1, 'Bago maging heneral, si Macario Sakay ay isang mananahi, barbero, at umaarte sa komedya o moro-moro sa Tondo. Ang karanasang ito sa entablado ang tumulong sa kanya upang maging mahusay na tagapagsalita at pinuno.')
on conflict (act_number) do update set fact = excluded.fact;


-- ---- Act I PRE-TEST ----
insert into public.assessment_items (act_number, test_type, item_order, question, choices, correct_index) values
  (1, 'pre', 1,
   'Saang lugar sa Maynila ipinanganak at lumaki si Macario Sakay?',
   '["Tondo","Binondo","Intramuros","Malate"]'::jsonb, 0),

  (1, 'pre', 2,
   'Ano ang isa sa mga hanapbuhay ni Macario Sakay bago siya sumali sa himagsikan?',
   '["Guro sa paaralan","Mananahi at barbero","Mangingisda","Kawani ng gobyerno"]'::jsonb, 1),

  (1, 'pre', 3,
   'Anong uri ng dulang panteatro ang madalas na ginagampanan ni Sakay noong kabataan niya?',
   '["Sarswela","Balagtasan","Komedya o moro-moro","Bodabil"]'::jsonb, 2),

  (1, 'pre', 4,
   'Anong lihim na samahan ang sinalihan ni Macario Sakay noong 1894?',
   '["La Liga Filipina","Katipunan","Guardia Civil","Propaganda Movement"]'::jsonb, 1),

  (1, 'pre', 5,
   'Ano ang pangunahing layunin ng Katipunan nang ito ay itatag?',
   '["Makamit ang kalayaan mula sa Espanya sa pamamagitan ng himagsikan","Humiling ng repormang pang-ekonomiya sa Espanya","Magtatag ng paaralan para sa mga Pilipino","Makipagkalakalan sa Amerika"]'::jsonb, 0)
on conflict (act_number, test_type, item_order) do update
  set question = excluded.question,
      choices = excluded.choices,
      correct_index = excluded.correct_index;


-- ---- Act I POST-TEST (parallel form) ----
insert into public.assessment_items (act_number, test_type, item_order, question, choices, correct_index) values
  (1, 'post', 1,
   'Alin sa mga sumusunod ang tumpak tungkol sa pinagmulan ni Macario Sakay?',
   '["Isa siyang mayamang mestizo mula sa Intramuros","Siya ay anak ng isang Kastilang opisyal","Isa siyang manggagawa mula sa Tondo, Maynila","Ipinanganak siya sa lalawigan ng Cavite"]'::jsonb, 2),

  (1, 'post', 2,
   'Paano nakatulong ang karanasan ni Sakay sa entablado sa kanyang naging papel bilang pinuno?',
   '["Nagbigay ito sa kanya ng yaman upang tustusan ang digmaan","Hinasa nito ang kanyang kakayahan sa pagsasalita at paghikayat ng tao","Naging dahilan ito upang siya ay maging kaibigan ng mga Kastila","Wala itong naging kaugnayan sa kanyang pamumuno"]'::jsonb, 1),

  (1, 'post', 3,
   'Bakit kinailangang manatiling lihim ang Katipunan?',
   '["Dahil ito ay isang samahang panrelihiyon","Dahil ipinagbabawal ito at parurusahan ng mga awtoridad na Kastila","Dahil kakaunti lamang ang miyembro nito","Dahil ito ay samahan ng mga mangangalakal"]'::jsonb, 1),

  (1, 'post', 4,
   'Ano ang ipinapakita ng desisyon ni Sakay na iwan ang kanyang marangal na hanapbuhay upang sumali sa Katipunan?',
   '["Kawalan ng interes sa kanyang trabaho","Pagnanais na yumaman sa pamamagitan ng digmaan","Handa siyang isakripisyo ang sariling kapakanan para sa bayan","Sinunod lamang niya ang utos ng kanyang pamilya"]'::jsonb, 2),

  (1, 'post', 5,
   'Ang mga ordinaryong manggagawa tulad nina Sakay ay may mahalagang papel sa himagsikan. Ano ang ipinapahiwatig nito tungkol sa Katipunan?',
   '["Ito ay kilusang pinamunuan lamang ng mga mayayaman","Ito ay kilusang bayan na binubuo ng karaniwang mamamayan","Ito ay itinatag ng mga dayuhan","Ito ay samahang pang-akademiko"]'::jsonb, 1)
on conflict (act_number, test_type, item_order) do update
  set question = excluded.question,
      choices = excluded.choices,
      correct_index = excluded.correct_index;


-- =============================================================
-- PART 5 — VERIFICATION
-- Run these after the migration. Expected results in comments.
-- =============================================================

-- Should return 10 (5 pre + 5 post for Act I):
--   select count(*) from public.assessment_items;

-- Should return the questions WITHOUT any correct_index column:
--   select * from public.get_assessment_items(1, 'pre');

-- RECURSION CHECK — the important one.
-- In Supabase SQL Editor, use the role impersonation dropdown to
-- run as a teacher account, then:
--   select * from public.profiles;
-- Expected: their own row plus their students' rows.
-- FAILURE MODE: "infinite recursion detected in policy for relation
-- profiles" means Part 1 did not apply — re-run it.
