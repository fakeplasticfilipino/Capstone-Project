-- =============================================================
-- MACARIO — Acts II to IV's built-in questions, into the database
--
-- Block 153 (7 Nov 2026). Since schema v15 the database grades every
-- test (submit_test), so it must hold every act's questions. Act I's
-- were already there; Acts II to IV's lived only in
-- content/questions.js, the game's fallback. This copies them across
-- word for word, generated from that file. The questions are the
-- teacher's (CLAUDE.md, Standing decisions): nothing here rewrites
-- one, and a test the teacher has already written in the database is
-- left alone (where not exists, per act and test).
--
-- Safe to run twice. Undo: delete the rows of acts 2 to 4 that were
-- never edited, from the dashboard, or leave them: the game showed
-- the same questions before.
-- =============================================================

insert into public.assessment_items (act_number, test_type, item_order, question, choices, correct_index)
select v.* from (values
  (2, 'pre', 1, 'Sino ang patnugot ng Kalayaan, ang pahayagan ng Katipunan?',
   '["Andres Bonifacio","Emilio Jacinto","Jose Rizal","Marcelo H. del Pilar"]'::jsonb, 1),
  (2, 'pre', 2, 'Bakit isinulat sa Kalayaan na sa Yokohama, Hapon ito inilimbag?',
   '["Upang linlangin ang mga Kastila kung saan ito ginawa","Dahil mas mura ang paglilimbag sa Hapon","Dahil mga Hapon ang sumulat nito","Upang mabasa rin ito ng mga Hapon"]'::jsonb, 0),
  (2, 'pre', 3, 'Paano natuklasan ng mga Kastila ang lihim ng Katipunan noong Agosto 1896?',
   '["Nahuli si Bonifacio sa isang pulong","Nabasa nila ang Kalayaan sa isang tindahan","Ipinagtapat ito ng kasaping si Teodoro Patiño sa kura ng Tondo","Isinuplong ito ng isang sundalong Pilipino sa gobernador"]'::jsonb, 2),
  (2, 'pre', 4, 'Ano ang ibig sabihin ng pagpunit ng mga Katipunero sa kanilang sedula noong Agosto 1896?',
   '["Ayaw na nilang magbayad ng buwis sa simbahan","Wala na silang pakinabang sa sedula","Iyon ang utos ng pamahalaang Kastila","Itinatakwil nila ang pamahalaang Kastila at sinisimulan ang paghihimagsik"]'::jsonb, 3),
  (2, 'pre', 5, 'Ano ang nilusob ng mga Katipunero sa San Juan del Monte noong Agosto 30, 1896?',
   '["Ang palasyo ng gobernador-heneral","Ang polvorin o imbakan ng pulbura ng mga Kastila","Ang simbahan ng Tondo","Ang daungan ng Maynila"]'::jsonb, 1),
  (2, 'pre', 6, 'Ano ang kinahinatnan ng paglusob sa San Juan del Monte?',
   '["Natalo ang mga Katipunero at mahigit 150 ang nasawi","Nakuha ng Katipunan ang buong Maynila","Sumuko ang mga Kastila nang walang laban","Walang nasawi sa magkabilang panig"]'::jsonb, 0),
  (2, 'pre', 7, 'Ano ang nangyari sa Biak-na-Bato noong Disyembre 1897?',
   '["Itinatag doon ang Katipunan","Nahuli roon si Andres Bonifacio","Lumagda ng kasunduan sa Espanya ang mga pinuno ng himagsikan at naglayag sila patungong Hong Kong","Idineklara roon ang kalayaan ng Pilipinas"]'::jsonb, 2),
  (2, 'pre', 8, 'Kailan at saan idineklara ang kalayaan ng Pilipinas?',
   '["Agosto 30, 1896, sa San Juan del Monte","Disyembre 1897, sa Biak-na-Bato","Hulyo 7, 1892, sa Tondo","Hunyo 12, 1898, sa Kawit"]'::jsonb, 3),
  (2, 'pre', 9, 'Ayon sa Kasunduan sa Paris noong Disyembre 1898, ano ang nangyari sa Pilipinas?',
   '["Kinilala ng Espanya ang kalayaan ng Pilipinas","Ipinagbili ito ng Espanya sa Amerika sa halagang dalawampung milyong dolyar","Hinati ito ng Espanya at ng Hapon","Ibinalik ito sa pamumuno ng mga Katipunero"]'::jsonb, 1),
  (2, 'pre', 10, 'Nang kakaunti na lamang ang natitira sa Katipunan, nanatili pa rin si Sakay. Ano ang ipinapakita nito?',
   '["Wala na siyang ibang mapupuntahan","Umaasa siyang gagantimpalaan siya","Natatakot siyang parusahan kung aalis","Tapat siya sa kanyang sinumpaan kahit humihina ang kilusan"]'::jsonb, 3)
) as v(act_number, test_type, item_order, question, choices, correct_index)
where not exists (select 1 from public.assessment_items a where a.act_number = 2 and a.test_type = 'pre');

insert into public.assessment_items (act_number, test_type, item_order, question, choices, correct_index)
select v.* from (values
  (2, 'post', 1, 'Ang Kalayaan, ang pahayagan ng Katipunan, ay pinamatnugutan ni:',
   '["Graciano Lopez Jaena","Apolinario Mabini","Emilio Aguinaldo","Emilio Jacinto"]'::jsonb, 3),
  (2, 'post', 2, 'Ano ang layunin ng pagsulat sa Kalayaan na inilimbag ito sa Yokohama, Hapon?',
   '["Ipakita na may tulong ang Hapon sa Katipunan","Ipagmalaki ang husay ng mga manlilimbag na Hapon","Iligaw ang mga Kastila upang hindi matunton ang tunay na imprenta","Makahikayat ng mga kasaping Hapon"]'::jsonb, 2),
  (2, 'post', 3, 'Kanino ipinagtapat ni Teodoro Patiño ang lihim ng Katipunan noong Agosto 19, 1896?',
   '["Kay Padre Mariano Gil, ang kura ng Tondo","Sa gobernador-heneral ng Pilipinas","Kay Andres Bonifacio","Sa isang opisyal ng Guardia Civil"]'::jsonb, 0),
  (2, 'post', 4, 'Bakit pinunit ng mga Katipunero ang kanilang sedula noong huling linggo ng Agosto 1896?',
   '["Bilang tanda ng paghihimagsik laban sa Espanya","Dahil luma na ang kanilang mga sedula","Upang hindi sila makilala ng mga kapwa Pilipino","Dahil iniutos ito ng kura ng kanilang bayan"]'::jsonb, 0),
  (2, 'post', 5, 'Ano ang pakay ng mga Katipunero sa paglusob sa San Juan del Monte noong 1896?',
   '["Iligtas si Jose Rizal sa bilangguan","Sakupin ang palengke ng bayan","Kunin ang polvorin, ang imbakan ng pulbura ng mga Kastila","Sunugin ang mga talaan ng buwis"]'::jsonb, 2),
  (2, 'post', 6, 'Ilan ang nasawing Katipunero sa labanan sa San Juan del Monte?',
   '["Wala ni isa","Mga sampu","Mga limampu","Mahigit 150"]'::jsonb, 3),
  (2, 'post', 7, 'Ano ang naging bunga ng kasunduan sa Biak-na-Bato noong Disyembre 1897?',
   '["Naglayag ang mga pinuno ng himagsikan patungong Hong Kong","Nagkaroon ng Asamblea ang mga Pilipino","Umalis ang lahat ng Kastila sa Pilipinas","Napalaya si Jose Rizal"]'::jsonb, 0),
  (2, 'post', 8, 'Ano ang nangyari sa Kawit noong Hunyo 12, 1898?',
   '["Itinatag ang Katipunan","Nilagdaan ang Kasunduan sa Paris","Idineklara ang kalayaan ng Pilipinas","Nagsimula ang labanan sa San Juan del Monte"]'::jsonb, 2),
  (2, 'post', 9, 'Sa halagang dalawampung milyong dolyar, ano ang ginawa ng Espanya sa Kasunduan sa Paris?',
   '["Binili ang Cuba mula sa Amerika","Nagtayo ng mga paaralan sa Maynila","Binayaran ang mga Pilipino para sa digmaan","Ipinagbili ang Pilipinas sa Amerika"]'::jsonb, 3),
  (2, 'post', 10, 'Sinabi ni Sakay kay Jacinto: "Sa Katipunan ako nanumpa." Ano ang ipinapakita ng kanyang pasyang manatili kahit humihina ang kilusan?',
   '["Katapatan sa layuning kanyang sinumpaan","Pagnanais na maging pinuno ng Katipunan","Kawalan ng ibang hanapbuhay","Pagsunod lamang sa utos ng kanyang ina"]'::jsonb, 0)
) as v(act_number, test_type, item_order, question, choices, correct_index)
where not exists (select 1 from public.assessment_items a where a.act_number = 2 and a.test_type = 'post');

insert into public.assessment_items (act_number, test_type, item_order, question, choices, correct_index)
select v.* from (values
  (3, 'pre', 1, 'Saan nagsimula ang Digmaang Pilipino-Amerikano noong gabi ng Pebrero 4, 1899?',
   '["Sa Santa Mesa, Maynila","Sa Kawit, Cavite","Sa Malolos, Bulacan","Sa Palanan, Isabela"]'::jsonb, 0),
  (3, 'pre', 2, 'Saan nahuli ng mga Amerikano si Emilio Aguinaldo noong Marso 1901?',
   '["Sa Tondo, Maynila","Sa Palanan, Isabela","Sa Biak-na-Bato, Bulacan","Sa Morong, Rizal"]'::jsonb, 1),
  (3, 'pre', 3, 'Anong partido ang itinatag noong 1901 kung saan naging Kalihim-Heneral si Macario Sakay?',
   '["Partido Federal","La Liga Filipina","Partido Nacionalista","Partido Liberal"]'::jsonb, 2),
  (3, 'pre', 4, 'Paano hinangad ng Partido Nacionalista na makamit ang kalayaan?',
   '["Sa pamamagitan ng armadong paglusob sa Maynila","Sa paghingi ng tulong sa Hapon","Sa pagsuko sa mga Amerikano","Sa mapayapa at legal na paraan, tulad ng petisyon"]'::jsonb, 3),
  (3, 'pre', 5, 'Ano ang ginawang krimen ng Batas sa Sedisyon (Batas Bilang 292) noong 1901?',
   '["Ang pagsusulong ng kalayaan, sa salita man o sa sulat, kahit sa mapayapang paraan","Ang pagbebenta ng bigas sa ibang bayan","Ang pagpasok sa paaralang Amerikano","Ang pagsasalita ng Ingles"]'::jsonb, 0),
  (3, 'pre', 6, 'Bakit nakalaya si Sakay mula sa Bilibid noong 1902?',
   '["Tumakas siya sa gabi","Dahil sa amnestiyang ibinigay nang ideklara ng mga Amerikano na tapos na ang digmaan","Binayaran ng kanyang mga kasama ang piyansa","Napatunayang wala siyang kasalanan sa hukuman"]'::jsonb, 1),
  (3, 'pre', 7, 'Anong pamahalaan ang itinatag ni Sakay sa kabundukan ng Morong noong 1902?',
   '["Republika ng Biak-na-Bato","Republika ng Malolos","Republika ng Katagalugan","Pamahalaang Diktatoryal"]'::jsonb, 2),
  (3, 'pre', 8, 'Saan ibinatay ang saligang batas ng Republika ng Katagalugan?',
   '["Sa saligang batas ng Amerika","Sa mga batas ng Espanya","Sa mga utos ng Komisyon ng Pilipinas","Sa mga aral ni Andres Bonifacio at ng Katipunan"]'::jsonb, 3),
  (3, 'pre', 9, 'Ayon sa Batas sa Bandolerismo ng Nobyembre 1902, ano ang itinawag ng mga Amerikano sa mga patuloy na lumalaban?',
   '["Mga bayani","Mga bandido","Mga sundalo","Mga rebolusyonaryo"]'::jsonb, 1),
  (3, 'pre', 10, 'Nanumpa si Sakay at ang kanyang mga tauhan na hindi gugupitin ang kanilang buhok hangga''t hindi malaya ang bayan. Ano ang ipinapakita nito?',
   '["Matibay nilang paninindigan na ituloy ang laban hanggang makamit ang kalayaan","Wala silang barbero sa bundok","Isa itong kaugalian ng mga Amerikano","Nais nilang magtago sa mga kapwa Pilipino"]'::jsonb, 0)
) as v(act_number, test_type, item_order, question, choices, correct_index)
where not exists (select 1 from public.assessment_items a where a.act_number = 3 and a.test_type = 'pre');

insert into public.assessment_items (act_number, test_type, item_order, question, choices, correct_index)
select v.* from (values
  (3, 'post', 1, 'Ang pamamaril ng isang bantay na Amerikano sa Santa Mesa noong Pebrero 4, 1899 ay naging simula ng:',
   '["Himagsikang 1896","Kasunduan sa Biak-na-Bato","Digmaang Pilipino-Amerikano","Pagtatatag ng Katipunan"]'::jsonb, 2),
  (3, 'post', 2, 'Anong pangyayari noong Marso 1901 sa Palanan, Isabela ang nagpahina sa paglaban sa mga Amerikano?',
   '["Ang pagkamatay ni Emilio Jacinto","Ang pagdating ng Konstabularya","Ang pagkakatatag ng Asamblea","Ang pagkadakip kay Emilio Aguinaldo"]'::jsonb, 3),
  (3, 'post', 3, 'Anong tungkulin ang hinawakan ni Sakay sa Partido Nacionalista nang itatag ito noong 1901?',
   '["Kalihim-Heneral","Tagapagsalita sa Amerika","Ingat-yaman","Pangulo"]'::jsonb, 0),
  (3, 'post', 4, 'Ano ang paraan ng Partido Nacionalista sa paghingi ng kalayaan bago ito ipagbawal?',
   '["Petisyon sa mga awtoridad na Amerikano, sa legal at mapayapang paraan","Pagsalakay sa mga himpilan ng Amerikano","Pagtatago sa kabundukan","Paglilimbag ng pahayagan sa Hapon"]'::jsonb, 0),
  (3, 'post', 5, 'Bakit itinuring na mapanganib ng mga Pilipino ang Batas sa Sedisyon ng 1901?',
   '["Dahil itinaas nito ang buwis sa bigas","Dahil ipinagbawal nito ang pagsasalita ng Tagalog","Dahil isinara nito ang lahat ng paaralan","Dahil kahit ang mapayapang pagsusulong ng kalayaan ay ginawa nitong krimen"]'::jsonb, 3),
  (3, 'post', 6, 'Ano ang nagpalaya kay Sakay at sa ibang bilanggong Pilipino sa Bilibid noong 1902?',
   '["Isang kasunduan sa Espanya","Ang utos ni Emilio Aguinaldo","Isang paglusob ng kanyang mga kasama","Ang amnestiyang kasunod ng pagdeklara ng mga Amerikano na tapos na ang digmaan"]'::jsonb, 3),
  (3, 'post', 7, 'Sino ang Pangulo ng Republika ng Katagalugan na itinatag sa kabundukan ng Morong?',
   '["Macario Sakay","Emilio Aguinaldo","Francisco Carreón","Julian Montalan"]'::jsonb, 0),
  (3, 'post', 8, 'Ano ang ginawang saligang batas ng Republika ng Katagalugan?',
   '["Ang Batas Bilang 292","Ang mga aral ng Katipunan ni Andres Bonifacio","Ang Kasunduan sa Paris","Ang Saligang Batas ng Malolos"]'::jsonb, 1),
  (3, 'post', 9, 'Ano ang epekto ng Batas sa Bandolerismo ng 1902 sa mga patuloy na lumalaban sa mga Amerikano?',
   '["Tinawag silang mga bandido at kamatayan ang parusa","Pinayagan silang bumuo ng partido","Kinilala sila bilang mga sundalo ng isang bansa","Binigyan sila ng lupa"]'::jsonb, 0),
  (3, 'post', 10, 'Ano ang sinasagisag ng mahabang buhok ni Sakay at ng kanyang mga tauhan?',
   '["Ang pagsunod sa uso ng panahon","Ang kanilang panata na lumaban hangga''t hindi malaya ang bayan","Ang kanilang pagiging mga artista ng komedya","Ang kanilang pagsuko sa mga Amerikano"]'::jsonb, 1)
) as v(act_number, test_type, item_order, question, choices, correct_index)
where not exists (select 1 from public.assessment_items a where a.act_number = 3 and a.test_type = 'post');

insert into public.assessment_items (act_number, test_type, item_order, question, choices, correct_index)
select v.* from (values
  (4, 'pre', 1, 'Ano ang ipinahayag ng manipesto ni Sakay noong Abril 5, 1904?',
   '["Na susuko na siya sa mga Amerikano","Na may buong karapatan ang mga Pilipino na ipaglaban ang kanilang kalayaan","Na lilipat siya sa Hong Kong","Na sasali siya sa Partido Federal"]'::jsonb, 1),
  (4, 'pre', 2, 'Bakit inipon ng mga Amerikano ang mga taga-baryo ng Cavite at Batangas sa mga kampong may bantay noong 1905?',
   '["Upang putulin ang pagkain at tulong ng mga mamamayan sa mga lumalaban sa bundok","Upang turuan sila ng Ingles","Upang ilayo sila sa bagyo","Upang bigyan sila ng bagong lupa"]'::jsonb, 0),
  (4, 'pre', 3, 'Ano ang naging epekto ng rekonsentrasyon sa mga taga-baryo?',
   '["Yumaman sila sa kalakalan","Nakapag-aral sila nang libre","Nagutom sila at nawalan ng kabuhayan","Naging kasapi sila ng Konstabularya"]'::jsonb, 2),
  (4, 'pre', 4, 'Sino ang lider-manggagawa na nakipag-usap kay Sakay noong 1906 upang bumaba ito mula sa bundok?',
   '["Emilio Aguinaldo","Pascual Poblete","Julian Montalan","Dominador Gómez"]'::jsonb, 3),
  (4, 'pre', 5, 'Bakit pumayag si Sakay na bumaba mula sa bundok noong 1906?',
   '["Dahil naubusan na siya ng tauhan","Dahil ipinangakong mabubuksan ang Asamblea ng Pilipinas kapag natapos ang labanan","Dahil inalok siya ng malaking halaga","Dahil may sakit siya"]'::jsonb, 1),
  (4, 'pre', 6, 'Alin ang isa sa mga kondisyong hiningi ni Sakay bago siya bumaba mula sa bundok?',
   '["Amnestiya para sa kanyang mga tauhan","Isang upuan sa Asamblea para sa kanya","Lupa sa Cavite para sa kanyang pamilya","Ang pag-alis ng lahat ng Amerikano sa loob ng isang buwan"]'::jsonb, 0),
  (4, 'pre', 7, 'Ano ang nangyari kay Sakay sa salu-salo sa Cavite noong Hulyo 17, 1906?',
   '["Ginawaran siya ng medalya","Nahalal siya sa Asamblea","Dinakip siya at ang kanyang mga opisyal","Lumagda siya ng kasunduang pangkapayapaan"]'::jsonb, 2),
  (4, 'pre', 8, 'Sa anong kaso hinatulan ng kamatayan si Sakay?',
   '["Pagnanakaw ng salapi ng pamahalaan","Pagtataksil sa Espanya","Pagsunog sa isang simbahan","Bandolerismo, o pagiging bandido"]'::jsonb, 3),
  (4, 'pre', 9, 'Ano ang nangyari noong Oktubre 16, 1907, tatlumpu''t tatlong araw matapos bitayin si Sakay?',
   '["Binuksan ang Asamblea ng Pilipinas","Idineklara ang kalayaan ng Pilipinas","Itinatag ang Katipunan","Nagsimula ang Digmaang Pilipino-Amerikano"]'::jsonb, 0),
  (4, 'pre', 10, 'Sa kanyang huling pahayag, ano ang nais patunayan ni Sakay?',
   '["Na pinagsisisihan niya ang paglaban","Na sila ay kasapi ng hukbong rebolusyonaryo na nagtanggol sa bayan, hindi mga bandido","Na dapat nang sumuko ang lahat ng Pilipino","Na wala siyang kinalaman sa Republika ng Katagalugan"]'::jsonb, 1)
) as v(act_number, test_type, item_order, question, choices, correct_index)
where not exists (select 1 from public.assessment_items a where a.act_number = 4 and a.test_type = 'pre');

insert into public.assessment_items (act_number, test_type, item_order, question, choices, correct_index)
select v.* from (values
  (4, 'post', 1, 'Ayon sa manipesto ni Sakay noong 1904, ano ang karapatan ng mga Pilipino?',
   '["Ang bumoto sa halalan ng Amerika","Ang maglakbay sa ibang bansa","Ang ipaglaban ang kanilang kalayaan","Ang magtayo ng sariling paaralan"]'::jsonb, 2),
  (4, 'post', 2, 'Ano ang tunay na layunin ng rekonsentrasyon sa Cavite at Batangas noong 1905?',
   '["Protektahan ang mga taga-baryo laban sa mga bandido","Magtayo ng mga bagong bayan","Bilangin ang populasyon","Pigilan ang mga mamamayan na magbigay ng pagkain at tulong sa mga lumalaban"]'::jsonb, 3),
  (4, 'post', 3, 'Ano ang dinanas ng mga taga-baryong inipon sa mga kampo noong 1905?',
   '["Gutom at paghihirap","Kasaganaan ng pagkain","Libreng tirahan sa Maynila","Mas mataas na sahod"]'::jsonb, 0),
  (4, 'post', 4, 'Sino si Dominador Gómez sa kuwento ni Sakay?',
   '["Ang hukom na naghatol sa kanya","Ang lider-manggagawa na nakipag-usap sa kanya upang bumaba mula sa bundok","Ang Pangalawang Pangulo ng Republika ng Katagalugan","Ang koronel na Amerikano na nag-anyaya sa kanya"]'::jsonb, 1),
  (4, 'post', 5, 'Ano ang ipinangako kay Sakay kapalit ng kanyang pagbaba mula sa bundok?',
   '["Na siya ang magiging gobernador ng Cavite","Na ibabalik ang Pilipinas sa Espanya","Na mabubuksan ang Asamblea ng Pilipinas kapag natapos ang labanan","Na bibigyan siya ng lupain sa Maynila"]'::jsonb, 2),
  (4, 'post', 6, 'Alin sa mga sumusunod ang kabilang sa mga hiningi ni Sakay bago siya sumuko?',
   '["Na palayain ang lahat ng bilanggo sa Hong Kong","Na siya ang mamuno sa Konstabularya","Na isara ang Bilibid","Na payagan siya at ang kanyang mga opisyal na lumabas ng bansa"]'::jsonb, 3),
  (4, 'post', 7, 'Ano ang naging kapalaran ni Sakay sa salu-salong idinaos ni Koronel Van Schaick sa Cavite?',
   '["Siya ay dinakip at dinisarmahan","Siya ay pinarangalan bilang bayani","Siya ay hinirang na opisyal ng Amerika","Siya ay pinauwi sa Tondo"]'::jsonb, 0),
  (4, 'post', 8, 'Sa ilalim ng anong paratang hinatulan ng kamatayan si Sakay at ang kanyang mga kasama?',
   '["Sedisyon","Bandolerismo","Pagtakas sa bilangguan","Pagsira ng ari-arian"]'::jsonb, 1),
  (4, 'post', 9, 'Kailan binitay si Sakay, at ano ang nangyari tatlumpu''t tatlong araw pagkaraan?',
   '["Hulyo 1906; nagsimula ang digmaan","Disyembre 1898; nilagdaan ang Kasunduan sa Paris","Setyembre 13, 1907; binuksan ang Asamblea ng Pilipinas","Marso 1903; itinatag ang Republika ng Katagalugan"]'::jsonb, 2),
  (4, 'post', 10, '"Hindi kami mga bandido at magnanakaw." Ano ang ipinaglaban ni Sakay sa kanyang huling pahayag?',
   '["Ang kanyang kayamanan","Ang kanyang pagkakaibigan sa mga Amerikano","Ang kanyang karapatang tumira sa Maynila","Ang dangal ng kanilang laban bilang mga rebolusyonaryong nagtanggol sa bayan"]'::jsonb, 3)
) as v(act_number, test_type, item_order, question, choices, correct_index)
where not exists (select 1 from public.assessment_items a where a.act_number = 4 and a.test_type = 'post');
