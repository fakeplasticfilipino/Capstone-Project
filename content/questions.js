// =============================================================
// MACARIO — content/questions.js (Block 68)
//
// The trivia card and the pre-test and post-test questions, with their
// answers, inside the game itself. At the instructor's direction the
// answer key is no longer kept secret in the database: the game grades
// a test itself (assessment.js) and writes the score.
//
// This file is the built-in bank. The teacher may edit the questions
// and answers from the dashboard (teacher.html, Mga Tanong), which
// saves them to the assessment_items and act_trivia tables; when the
// database has questions for a test, those are used, and this file is
// the fallback when it has none or cannot be reached.
//
// Act I's items started as db/seeds/macario_items_v3.sql: ten matched
// pairs, pre-test item n the partner of post-test item n. correct is
// the 0-based index of the right choice. The questions are the
// teacher's to write and change, on the dashboard; this file is only
// the fallback (CLAUDE.md, Standing decisions).
//
// passing is the share of a post-test a student must get right to
// pass. Below it, the student is offered a replay of the act and
// another try at the post-test (acts.js, finishAct).
// =============================================================

window.QUESTIONS = {
  1: {
    passing: 0.75,
    trivia: "Si Macario Sakay ay isa sa mga pinunong nagpatuloy ng laban para sa kalayaan kahit matapos ang panahon ng Espanya. Ngunit ang kanyang kuwento ay nagsimula sa isang ordinaryong araw sa Maynila, bilang isang karaniwang manggagawa.",
    pre: [
      { question: "Saan sa Maynila nagmula si Macario Sakay?",
        choices: ["Tondo", "Binondo", "Intramuros", "Malate"],
        correct: 0 },
      { question: "Bago sumali sa himagsikan, ano ang ikinabubuhay ni Macario Sakay?",
        choices: ["Guro at manunulat", "Mananahi at barbero", "Magsasaka at mangangalakal", "Kawani ng pamahalaan"],
        correct: 1 },
      { question: "Anong uri ng dulang panteatro ang madalas ginampanan ni Sakay noong kabataan niya?",
        choices: ["Sarswela", "Balagtasan", "Komedya o moro-moro", "Bodabil"],
        correct: 2 },
      { question: "Paano nakatutulong sa isang pinuno ang karanasan sa entablado?",
        choices: ["Nagbibigay ito ng yaman upang tustusan ang kilusan", "Nagbibigay ito ng koneksyon sa mga awtoridad", "Nagpapalakas ito ng katawan para sa labanan", "Nagsasanay ito sa pagsasalita sa harap ng maraming tao"],
        correct: 3 },
      { question: "Anong lihim na samahan ang sinalihan ni Macario Sakay noong 1894?",
        choices: ["La Liga Filipina", "Katipunan", "Propaganda Movement", "Guardia Civil"],
        correct: 1 },
      { question: "Ano ang pangunahing layunin ng Katipunan nang ito ay itatag?",
        choices: ["Makamit ang kalayaan mula sa Espanya sa pamamagitan ng himagsikan", "Humiling ng reporma sa pamahalaang Kastila", "Magtatag ng mga paaralan para sa mga Pilipino", "Makipagkalakalan sa ibang bansa"],
        correct: 0 },
      { question: "Bakit kinailangang manatiling lihim ang Katipunan?",
        choices: ["Dahil kakaunti lamang ang miyembro nito", "Dahil wala pa itong sapat na salapi", "Dahil ito ay isang samahang panrelihiyon", "Dahil ipinagbabawal ito at parurusahan ng mga awtoridad"],
        correct: 3 },
      { question: "Bakit mahalaga ang mga tagapaghatid ng mensahe sa isang lihim na kilusan?",
        choices: ["Sila ang nag-iimbak ng mga sandata", "Sila ang nagdadala ng balita nang hindi nabubunyag ang kilusan", "Sila ang laging nangunguna sa labanan", "Sila ang humahalili sa pinuno kapag wala ito"],
        correct: 1 },
      { question: "Ano ang ipinapakita kapag iniwan ng isang tao ang kanyang matatag na hanapbuhay upang sumali sa isang mapanganib na kilusan?",
        choices: ["Kawalan ng kakayahan sa kanyang trabaho", "Pagnanais na yumaman sa madaling paraan", "Handa siyang isakripisyo ang sariling kapakanan para sa layunin", "Pagsunod lamang sa utos ng kanyang pamilya"],
        correct: 2 },
      { question: "Kung ang isang kilusan ay binubuo ng mga karaniwang manggagawa, ano ang ipinapakita nito tungkol sa kilusang iyon?",
        choices: ["Ito ay kilusan ng mga mayayaman lamang", "Ito ay isang samahang pang-akademiko", "Ito ay itinatag at pinondohan ng mga dayuhan", "Ito ay kilusang bayan na may malawak na suporta mula sa mamamayan"],
        correct: 3 },
    ],
    post: [
      { question: "Aling lugar sa Maynila ang kinalakhan ni Macario Sakay?",
        choices: ["Malate", "Sampaloc", "Quiapo", "Tondo"],
        correct: 3 },
      { question: "Alin sa mga sumusunod na hanapbuhay ang ginawa ni Sakay bago siya naging Katipunero?",
        choices: ["Mangangalakal sa Binondo", "Tagapagturo sa isang paaralan", "Barbero at mananahi", "Marino sa daungan"],
        correct: 2 },
      { question: "Sa anong uri ng palabas madalas umarte si Sakay bago siya sumapi sa Katipunan?",
        choices: ["Moro-moro o komedya", "Sarswela", "Dulang panradyo", "Pantomima"],
        correct: 0 },
      { question: "Bakit naging kapaki-pakinabang kay Sakay ang kanyang karanasan sa komedya nang siya ay maging pinuno?",
        choices: ["Natuto siyang gumamit ng iba't ibang sandata", "Nakilala siya ng mga opisyal na Kastila", "Nahasa ang kanyang tinig at tapang na humarap sa madla", "Nakaipon siya ng malaking salapi mula rito"],
        correct: 2 },
      { question: "Saang samahan sumapi si Macario Sakay noong 1894?",
        choices: ["Cuerpo de Compromisarios", "La Solidaridad", "La Liga Filipina", "Katipunan"],
        correct: 3 },
      { question: "Ano ang hangarin ng Katipunan para sa Pilipinas?",
        choices: ["Pantay na karapatan bilang lalawigan ng Espanya", "Ganap na kalayaan sa pamamagitan ng armadong pakikibaka", "Pagbabago sa pamumuno ng simbahan", "Higit na malawak na kalakalan sa Asya"],
        correct: 1 },
      { question: "Bakit itinago ng mga Katipunero ang kanilang pagkakakilanlan at mga pagpupulong?",
        choices: ["Upang hindi sila mahuli at maparusahan ng mga awtoridad", "Upang hindi sila makilala ng ibang mga Pilipino", "Dahil ipinagbawal ito ng kanilang mga pamilya", "Upang makatipid sa gastos ng pagpupulong"],
        correct: 0 },
      { question: "Ano ang panganib na hinaharap ng isang Katipunerong naghahatid ng mensahe malapit sa kuta ng kaaway?",
        choices: ["Mawawala ang kanyang kabuhayan", "Mapapagalitan siya ng kanyang pinuno", "Mababawasan ang kanyang ranggo sa samahan", "Mahuhuli siya at malalantad ang buong kilusan"],
        correct: 3 },
      { question: "Ano ang ipinapahiwatig ng pasya ni Sakay na talikuran ang kanyang hanapbuhay upang sumapi sa Katipunan?",
        choices: ["Hindi siya mahusay sa kanyang trabaho", "Inuna niya ang kapakanan ng bayan kaysa sa sariling kaginhawahan", "Inaasahan niyang kikita nang malaki sa himagsikan", "Wala na siyang ibang mapagpipilian noon"],
        correct: 1 },
      { question: "Maraming karaniwang manggagawa, tulad ni Sakay, ang naging bahagi ng Katipunan. Ano ang sinasabi nito tungkol sa katangian ng Katipunan?",
        choices: ["Pinamunuan ito ng mga edukadong ilustrado lamang", "Isa itong kilusang nag-ugat sa karaniwang mamamayan", "Umasa ito sa tulong ng ibang bansa", "Bukas lamang ito sa mga taga-Maynila"],
        correct: 1 },
    ],
  },
};
