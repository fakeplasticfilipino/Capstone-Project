-- =============================================================
-- MACARIO — Act I assessment item bank, revision 3
--
-- Replaces the 5 + 5 Act I bank seeded in macario_schema_v2.sql
-- with 10 matched pairs, and replaces the Act I trivia fact.
--
-- Purely additive and idempotent. Run once in the Supabase SQL
-- Editor. CLEAR THE EDITOR BEFORE PASTING.
--
-- RUN THIS ONLY AFTER Ms. Donadillo-Espiritu has validated the
-- items. The validation packet is the companion document. Seeding
-- unvalidated items is how an unvalidated instrument ends up in
-- front of real students.
--
-- BEFORE ANY REAL COLLECTION, reset the test accounts:
--   delete from public.assessment_scores where student_id = '<uuid>';
--   delete from public.act_progress    where student_id = '<uuid>';
-- One attempt per student per act per test type is enforced by a
-- unique constraint, so an account that sat the old 5-item test
-- cannot sit the new 10-item one without this.
--
--
-- WHY THIS REVISION EXISTS
--
-- Three defects in the v2 bank, each of which biases a pre/post
-- gain design toward showing no learning.
--
-- 1. The two forms were not parallel. All five pre-test items were
--    recall. Four of five post-test items required inference. A
--    gain score subtracts one from the other, which is only
--    meaningful when both measure the same construct at the same
--    cognitive level. A student could learn a great deal and still
--    post a flat or negative gain.
--
-- 2. The trivia card gave away the pre-test. It named Tondo, the
--    trades, and the komedya, which were the answers to pre-test
--    items 1, 2 and 3. acts.js runs trivia BEFORE the pre-test, so
--    students read three answers seconds before being asked them.
--    That inflates the pre-test and shrinks the measured gain from
--    the other side.
--
-- 3. Five items meant one question was worth 20 points of a score,
--    and reliability across five dichotomous items is poor.
--
-- Every item below belongs to a matched pair: the same learning
-- objective, the same cognitive level, different wording, different
-- distractors, and the key in a different position. item_order N in
-- the pre-test is the partner of item_order N in the post-test.
--
-- LEARNING OBJECTIVES, two pairs each:
--   LO1  Sakay's origins and social class            pairs 1, 2
--   LO2  Theatre experience and public speaking      pairs 3, 4
--   LO3  The Katipunan, when joined, and its aim     pairs 5, 6
--   LO4  Secrecy and communication in the movement   pairs 7, 8
--   LO5  Personal cost, and who the Katipunan was    pairs 9, 10
--
-- COVERAGE WARNING, recorded here because it is not an item defect
-- and cannot be fixed by editing items. Act I's current dialogue
-- does not teach most of these objectives. It is greetings and
-- errands. Nothing in the script states that Sakay came from Tondo,
-- names 1894, or explains what the Katipunan wanted or why it was
-- secret. Until the script teaches them, these items measure prior
-- knowledge and guessing rather than anything the game did. See
-- TRACKER.md.
-- =============================================================


-- =============================================================
-- TRIVIA
--
-- The replacement is deliberately drawn from OUTSIDE the tested
-- content. It previews who Sakay becomes rather than restating any
-- Act I fact, so the card can keep its place before the pre-test
-- without contaminating it.
-- =============================================================

insert into public.act_trivia (act_number, fact) values
  (1, 'Si Macario Sakay ay isa sa mga pinunong nagpatuloy ng laban para sa kalayaan kahit matapos ang panahon ng Espanya. Ngunit ang kanyang kuwento ay nagsimula sa isang ordinaryong araw sa Maynila, bilang isang karaniwang manggagawa.')
on conflict (act_number) do update set fact = excluded.fact;


-- =============================================================
-- ACT I PRE-TEST, 10 items
-- =============================================================

insert into public.assessment_items (act_number, test_type, item_order, question, choices, correct_index) values

  -- LO1, pair 1. Remembering.
  (1, 'pre', 1,
   'Saan sa Maynila nagmula si Macario Sakay?',
   '["Tondo","Binondo","Intramuros","Malate"]'::jsonb, 0),

  -- LO1, pair 2. Remembering.
  (1, 'pre', 2,
   'Bago sumali sa himagsikan, ano ang ikinabubuhay ni Macario Sakay?',
   '["Guro at manunulat","Mananahi at barbero","Mangingisda at magsasaka","Kawani ng pamahalaan"]'::jsonb, 1),

  -- LO2, pair 3. Remembering.
  (1, 'pre', 3,
   'Anong uri ng dulang panteatro ang madalas ginampanan ni Sakay noong kabataan niya?',
   '["Sarswela","Balagtasan","Komedya o moro-moro","Bodabil"]'::jsonb, 2),

  -- LO2, pair 4. Understanding.
  (1, 'pre', 4,
   'Paano nakatutulong sa isang pinuno ang karanasan sa entablado?',
   '["Nagbibigay ito ng yaman upang tustusan ang kilusan","Nagsasanay ito sa pagsasalita sa harap ng maraming tao","Nagpapalakas ito ng katawan para sa labanan","Nagbibigay ito ng koneksyon sa mga awtoridad"]'::jsonb, 1),

  -- LO3, pair 5. Remembering.
  (1, 'pre', 5,
   'Anong lihim na samahan ang sinalihan ni Macario Sakay noong 1894?',
   '["La Liga Filipina","Katipunan","Propaganda Movement","Guardia Civil"]'::jsonb, 1),

  -- LO3, pair 6. Understanding.
  (1, 'pre', 6,
   'Ano ang pangunahing layunin ng Katipunan nang ito ay itatag?',
   '["Makamit ang kalayaan mula sa Espanya sa pamamagitan ng himagsikan","Humiling ng reporma sa pamahalaang Kastila","Magtatag ng mga paaralan para sa mga Pilipino","Makipagkalakalan sa ibang bansa"]'::jsonb, 0),

  -- LO4, pair 7. Understanding.
  (1, 'pre', 7,
   'Bakit kinailangang manatiling lihim ang Katipunan?',
   '["Dahil kakaunti lamang ang miyembro nito","Dahil ipinagbabawal ito at parurusahan ng mga awtoridad","Dahil ito ay isang samahang panrelihiyon","Dahil wala pa itong sapat na salapi"]'::jsonb, 1),

  -- LO4, pair 8. Understanding.
  (1, 'pre', 8,
   'Bakit mahalaga ang mga tagapaghatid ng mensahe sa isang lihim na kilusan?',
   '["Sila ang nag-iimbak ng mga sandata","Sila ang nagdadala ng balita nang hindi nabubunyag ang kilusan","Sila ang laging nangunguna sa labanan","Sila ang humahalili sa pinuno kapag wala ito"]'::jsonb, 1),

  -- LO5, pair 9. Analyzing.
  (1, 'pre', 9,
   'Ano ang ipinapakita kapag iniwan ng isang tao ang kanyang matatag na hanapbuhay upang sumali sa isang mapanganib na kilusan?',
   '["Kawalan ng kakayahan sa kanyang trabaho","Pagnanais na yumaman sa madaling paraan","Handa siyang isakripisyo ang sariling kapakanan para sa layunin","Pagsunod lamang sa utos ng kanyang pamilya"]'::jsonb, 2),

  -- LO5, pair 10. Analyzing.
  (1, 'pre', 10,
   'Kung ang isang kilusan ay binubuo ng mga karaniwang manggagawa, ano ang ipinapakita nito tungkol sa kilusang iyon?',
   '["Ito ay kilusan ng mga mayayaman lamang","Ito ay kilusang bayan na may malawak na suporta mula sa mamamayan","Ito ay itinatag at pinondohan ng mga dayuhan","Ito ay isang samahang pang-akademiko"]'::jsonb, 1)

on conflict (act_number, test_type, item_order) do update
  set question = excluded.question,
      choices = excluded.choices,
      correct_index = excluded.correct_index;


-- =============================================================
-- ACT I POST-TEST, 10 items
--
-- Each item is the partner of the pre-test item with the same
-- item_order: same objective, same cognitive level, different
-- surface. Keys sit in different positions from their partners so
-- a student who remembers "it was B" gains nothing.
-- =============================================================

insert into public.assessment_items (act_number, test_type, item_order, question, choices, correct_index) values

  -- LO1, pair 1. Remembering.
  (1, 'post', 1,
   'Aling lugar sa Maynila ang kinalakhan ni Macario Sakay?',
   '["Malate","Sampaloc","Tondo","Quiapo"]'::jsonb, 2),

  -- LO1, pair 2. Remembering.
  (1, 'post', 2,
   'Alin sa mga sumusunod na hanapbuhay ang ginawa ni Sakay bago siya naging Katipunero?',
   '["Mangangalakal sa Binondo","Tagapagturo sa isang paaralan","Barbero at mananahi","Marino sa daungan"]'::jsonb, 2),

  -- LO2, pair 3. Remembering.
  (1, 'post', 3,
   'Sa anong uri ng palabas madalas umarte si Sakay bago siya sumapi sa Katipunan?',
   '["Moro-moro o komedya","Sarswela","Dulang panradyo","Pantomima"]'::jsonb, 0),

  -- LO2, pair 4. Understanding.
  (1, 'post', 4,
   'Bakit naging kapaki-pakinabang kay Sakay ang kanyang karanasan sa komedya nang siya ay maging pinuno?',
   '["Natuto siyang gumamit ng iba''t ibang sandata","Nakilala siya ng mga opisyal na Kastila","Nahasa ang kanyang tinig at tapang na humarap sa madla","Nakaipon siya ng malaking salapi mula rito"]'::jsonb, 2),

  -- LO3, pair 5. Remembering.
  (1, 'post', 5,
   'Saang samahan sumapi si Macario Sakay noong 1894?',
   '["Cuerpo de Compromisarios","La Solidaridad","Katipunan","La Liga Filipina"]'::jsonb, 2),

  -- LO3, pair 6. Understanding.
  (1, 'post', 6,
   'Ano ang hangarin ng Katipunan para sa Pilipinas?',
   '["Pantay na karapatan bilang lalawigan ng Espanya","Ganap na kalayaan sa pamamagitan ng armadong pakikibaka","Pagbabago sa pamumuno ng simbahan","Higit na malawak na kalakalan sa Asya"]'::jsonb, 1),

  -- LO4, pair 7. Understanding.
  (1, 'post', 7,
   'Bakit itinago ng mga Katipunero ang kanilang pagkakakilanlan at mga pagpupulong?',
   '["Upang hindi sila mahuli at maparusahan ng mga awtoridad","Upang hindi sila makilala ng ibang mga Pilipino","Dahil ipinagbawal ito ng kanilang mga pamilya","Upang makatipid sa gastos ng pagpupulong"]'::jsonb, 0),

  -- LO4, pair 8. Understanding.
  (1, 'post', 8,
   'Ano ang panganib na hinaharap ng isang Katipunerong naghahatid ng mensahe malapit sa kuta ng kaaway?',
   '["Mawawala ang kanyang kabuhayan","Mapapagalitan siya ng kanyang pinuno","Mahuhuli siya at malalantad ang buong kilusan","Mababawasan ang kanyang ranggo sa samahan"]'::jsonb, 2),

  -- LO5, pair 9. Analyzing.
  (1, 'post', 9,
   'Ano ang ipinapahiwatig ng pasya ni Sakay na talikuran ang kanyang hanapbuhay upang sumapi sa Katipunan?',
   '["Hindi siya mahusay sa kanyang trabaho","Inuna niya ang kapakanan ng bayan kaysa sa sariling kaginhawahan","Inaasahan niyang kikita nang malaki sa himagsikan","Wala na siyang ibang mapagpipilian noon"]'::jsonb, 1),

  -- LO5, pair 10. Analyzing.
  (1, 'post', 10,
   'Ang mga tulad ni Sakay na mananahi at barbero ay naging bahagi ng Katipunan. Ano ang sinasabi nito tungkol sa katangian ng Katipunan?',
   '["Pinamunuan ito ng mga edukadong ilustrado lamang","Isa itong kilusang nag-ugat sa karaniwang mamamayan","Umasa ito sa tulong ng ibang bansa","Bukas lamang ito sa mga taga-Maynila"]'::jsonb, 1)

on conflict (act_number, test_type, item_order) do update
  set question = excluded.question,
      choices = excluded.choices,
      correct_index = excluded.correct_index;


-- =============================================================
-- VERIFICATION
--
-- Should return 20 for Act I (10 pre + 10 post):
--   select count(*) from public.assessment_items where act_number = 1;
--
-- Should return 10 questions with NO correct_index column:
--   select * from public.get_assessment_items(1, 'pre');
--
-- Confirm the trivia no longer names Tondo, the trades, or the
-- komedya, which were the leaked pre-test answers:
--   select fact from public.act_trivia where act_number = 1;
-- =============================================================
