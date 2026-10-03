-- =============================================================
-- MACARIO — Act I assessment items, revision 4 (Scan list, 3 Oct 2026)
--
-- Corrections to the v3 bank, found by the Scan list (TRACKER.md):
--   S10  post item 10's stem named "mananahi at barbero", which is the
--        answer to post item 2 in the same test; it now says "karaniwang
--        manggagawa".
--   S11  no key was ever D, so a student could rule D out; keys moved
--        (by swapping two choices, the words unchanged) so each letter
--        is the key two or three times per test.
--   S12  pair 10 had its key in the same place (B) in both tests.
--   S16  pre item 2 offered "Mangingisda at magsasaka", and a mangingisda
--        is someone the student meets in the game; now "Magsasaka at
--        mangangalakal".
--
-- Keys after: pre A,B,C,D,B,A,D,B,C,D; post D,C,A,C,D,B,A,D,B,B.
--
-- Each update changes an item ONLY if it is still exactly as v3 seeded
-- it, so a question a teacher has edited on the dashboard is left
-- alone (that teacher's version wins). Safe to run more than once.
-- Run in the Supabase SQL Editor; CLEAR THE EDITOR FIRST. Then record
-- it in TRACKER.md's Run log. Run it BEFORE any student sits a test, or
-- students before and after it sat different tests.
-- =============================================================

-- pre 2
update public.assessment_items
   set question = 'Bago sumali sa himagsikan, ano ang ikinabubuhay ni Macario Sakay?',
       choices = '["Guro at manunulat","Mananahi at barbero","Magsasaka at mangangalakal","Kawani ng pamahalaan"]'::jsonb,
       correct_index = 1
 where act_number = 1 and test_type = 'pre' and item_order = 2
   and question = 'Bago sumali sa himagsikan, ano ang ikinabubuhay ni Macario Sakay?'
   and choices = '["Guro at manunulat","Mananahi at barbero","Mangingisda at magsasaka","Kawani ng pamahalaan"]'::jsonb
   and correct_index = 1;

-- pre 4
update public.assessment_items
   set question = 'Paano nakatutulong sa isang pinuno ang karanasan sa entablado?',
       choices = '["Nagbibigay ito ng yaman upang tustusan ang kilusan","Nagbibigay ito ng koneksyon sa mga awtoridad","Nagpapalakas ito ng katawan para sa labanan","Nagsasanay ito sa pagsasalita sa harap ng maraming tao"]'::jsonb,
       correct_index = 3
 where act_number = 1 and test_type = 'pre' and item_order = 4
   and question = 'Paano nakatutulong sa isang pinuno ang karanasan sa entablado?'
   and choices = '["Nagbibigay ito ng yaman upang tustusan ang kilusan","Nagsasanay ito sa pagsasalita sa harap ng maraming tao","Nagpapalakas ito ng katawan para sa labanan","Nagbibigay ito ng koneksyon sa mga awtoridad"]'::jsonb
   and correct_index = 1;

-- pre 7
update public.assessment_items
   set question = 'Bakit kinailangang manatiling lihim ang Katipunan?',
       choices = '["Dahil kakaunti lamang ang miyembro nito","Dahil wala pa itong sapat na salapi","Dahil ito ay isang samahang panrelihiyon","Dahil ipinagbabawal ito at parurusahan ng mga awtoridad"]'::jsonb,
       correct_index = 3
 where act_number = 1 and test_type = 'pre' and item_order = 7
   and question = 'Bakit kinailangang manatiling lihim ang Katipunan?'
   and choices = '["Dahil kakaunti lamang ang miyembro nito","Dahil ipinagbabawal ito at parurusahan ng mga awtoridad","Dahil ito ay isang samahang panrelihiyon","Dahil wala pa itong sapat na salapi"]'::jsonb
   and correct_index = 1;

-- pre 10
update public.assessment_items
   set question = 'Kung ang isang kilusan ay binubuo ng mga karaniwang manggagawa, ano ang ipinapakita nito tungkol sa kilusang iyon?',
       choices = '["Ito ay kilusan ng mga mayayaman lamang","Ito ay isang samahang pang-akademiko","Ito ay itinatag at pinondohan ng mga dayuhan","Ito ay kilusang bayan na may malawak na suporta mula sa mamamayan"]'::jsonb,
       correct_index = 3
 where act_number = 1 and test_type = 'pre' and item_order = 10
   and question = 'Kung ang isang kilusan ay binubuo ng mga karaniwang manggagawa, ano ang ipinapakita nito tungkol sa kilusang iyon?'
   and choices = '["Ito ay kilusan ng mga mayayaman lamang","Ito ay kilusang bayan na may malawak na suporta mula sa mamamayan","Ito ay itinatag at pinondohan ng mga dayuhan","Ito ay isang samahang pang-akademiko"]'::jsonb
   and correct_index = 1;

-- post 1
update public.assessment_items
   set question = 'Aling lugar sa Maynila ang kinalakhan ni Macario Sakay?',
       choices = '["Malate","Sampaloc","Quiapo","Tondo"]'::jsonb,
       correct_index = 3
 where act_number = 1 and test_type = 'post' and item_order = 1
   and question = 'Aling lugar sa Maynila ang kinalakhan ni Macario Sakay?'
   and choices = '["Malate","Sampaloc","Tondo","Quiapo"]'::jsonb
   and correct_index = 2;

-- post 5
update public.assessment_items
   set question = 'Saang samahan sumapi si Macario Sakay noong 1894?',
       choices = '["Cuerpo de Compromisarios","La Solidaridad","La Liga Filipina","Katipunan"]'::jsonb,
       correct_index = 3
 where act_number = 1 and test_type = 'post' and item_order = 5
   and question = 'Saang samahan sumapi si Macario Sakay noong 1894?'
   and choices = '["Cuerpo de Compromisarios","La Solidaridad","Katipunan","La Liga Filipina"]'::jsonb
   and correct_index = 2;

-- post 8
update public.assessment_items
   set question = 'Ano ang panganib na hinaharap ng isang Katipunerong naghahatid ng mensahe malapit sa kuta ng kaaway?',
       choices = '["Mawawala ang kanyang kabuhayan","Mapapagalitan siya ng kanyang pinuno","Mababawasan ang kanyang ranggo sa samahan","Mahuhuli siya at malalantad ang buong kilusan"]'::jsonb,
       correct_index = 3
 where act_number = 1 and test_type = 'post' and item_order = 8
   and question = 'Ano ang panganib na hinaharap ng isang Katipunerong naghahatid ng mensahe malapit sa kuta ng kaaway?'
   and choices = '["Mawawala ang kanyang kabuhayan","Mapapagalitan siya ng kanyang pinuno","Mahuhuli siya at malalantad ang buong kilusan","Mababawasan ang kanyang ranggo sa samahan"]'::jsonb
   and correct_index = 2;

-- post 10
update public.assessment_items
   set question = 'Maraming karaniwang manggagawa, tulad ni Sakay, ang naging bahagi ng Katipunan. Ano ang sinasabi nito tungkol sa katangian ng Katipunan?',
       choices = '["Pinamunuan ito ng mga edukadong ilustrado lamang","Isa itong kilusang nag-ugat sa karaniwang mamamayan","Umasa ito sa tulong ng ibang bansa","Bukas lamang ito sa mga taga-Maynila"]'::jsonb,
       correct_index = 1
 where act_number = 1 and test_type = 'post' and item_order = 10
   and question = 'Ang mga tulad ni Sakay na mananahi at barbero ay naging bahagi ng Katipunan. Ano ang sinasabi nito tungkol sa katangian ng Katipunan?'
   and choices = '["Pinamunuan ito ng mga edukadong ilustrado lamang","Isa itong kilusang nag-ugat sa karaniwang mamamayan","Umasa ito sa tulong ng ibang bansa","Bukas lamang ito sa mga taga-Maynila"]'::jsonb
   and correct_index = 1;

-- Check: should list the ten pre and ten post keys above.
--   select test_type, item_order, correct_index from public.assessment_items
--   where act_number = 1 order by test_type desc, item_order;
