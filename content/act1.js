// =============================================================
// MACARIO — content/act1.js
//
// Act I, rewritten from the start in Block 52 against the proponents'
// new script and plot. What came before (Nanay's errand, the kutsero
// memory, the entablado and the moro-moro, the Katipunan at the stairs,
// the pamphlet street) is in git history and CLAUDE.md, Decisions on
// record, Blocks 19 to 51. None of it should be copied back in without
// a reason; the art, sounds and engine features it used are all still
// there to build the new story from (TRACKER.md, Start here, lists them).
//
// The story so far:
//
//   tondo      the street. Macario stands alone; three siga come up
//              behind him and taunt him about his father. Nanay walks in
//              and calls him home. (A scene script: it plays by itself,
//              on a login as well as through a fade; see CLAUDE.md, Act
//              data format, scripts.)
//   bahay      at home, the same street backdrop at the proponents'
//              direction. Nanay tells him the money went on the cedula
//              and there is nothing left for rice; he says he will work.
//   tondo      back on the street. He wonders where to find work, and
//              the savings quest opens (0/100), counting his barya.
//              (Block 56) The Kutsero and the Mananahi each give him a
//              job: a timing mini-game (game.js, playTimingGame), 5 to
//              14 barya a success, at most 50 from each until he has
//              given Nanay his savings.
//   bahay      he gives Nanay the 100; the cap is lifted, and the fade
//              goes straight to
//   patahian   the tailor's shop. The Mananahi sends him with a costume
//              to the direktor inside the entablado at the street's end.
//   entablado  he hands it over and collects the pay, 79 to 110 barya.
//
// Act I is held open after that (holdOpen, acts.js): the story goes on
// from there and the post-test must not open yet.
//
// The lines are the proponents' script as written, apostrophes
// straightened. Lines marked PLACEHOLDER are ours, to be replaced: the
// direktor's two, and the short ones a job-giver says on a second visit.
// The siga are stand-in stills (Block 52, made the way Block 41's were)
// until the artist draws them; the direktor wears the mamamayan still.
// =============================================================

// Block 49. The paintings of the street, laid along every road in order
// (game.js, buildPanelBackdrop), with a shadow tree over each join
// (Block 50). Block 53 made the street exactly as long as the paintings,
// so each is shown whole and none repeats. (Block 53 briefly added
// tondo.jpg as a fifth; the proponent removed that file as old, Block 54.)
const STREET_PANELS = [
  "assets/backgrounds/act1/street-01.jpg",
  "assets/backgrounds/act1/street-02.jpg",
  "assets/backgrounds/act1/street-03.jpg",
  "assets/backgrounds/act1/street-04.jpg",
];

// One panel's width in the world (game.js, PANEL_WIDTH). The street is
// exactly as many panels as there are paintings, so none repeats and
// none is cut off at the road's end.
const PANEL = 1450;

// Block 46. The sky above a painting on a tall screen: the average of
// the four paintings' top rows.
const STREET_SKY = "#51a6ea";

// Nanay's real sheet (5 by 3, 14 frames), measured with
// _dev/tools/measure-sprite.js. One def, shared by every scene she is in.
const NANAY = {
  src: "assets/sprites/characters/nanay.png", frames: 14, fps: 6, columns: 5,
  contentTop: 45, contentHeight: 166, footX: 127,
};

// Block 54. Her walk, in profile: 8 frames drawn from nothing in code
// (the tool was deleted with the verdict, Block 55) in her sheet's colours (Block 53's walk
// moved her front-facing pixels and so walked toward the camera). A
// stand-in until the artist draws her walk. 4 by 2 cells of 160px,
// measured with measure-sprite.js.
const NANAY_WALK = {
  src: "assets/sprites/characters/nanay-walk.png", frames: 8, fps: 10, columns: 4,
  contentTop: 25, contentHeight: 128, footX: 79,
};

// Block 52. The three siga: stand-in stills made by
// _dev/tools/make-placeholder-sprites.py from frames of the Tindero and
// the Kutsero, recoloured, one with a bandana. Measured with
// measure-sprite.js. Real art replaces each by dropping a sheet over the
// same file name and changing frames, columns and the three numbers.
const SIGA = {
  1: { src: "assets/sprites/characters/siga-1.png", frames: 1, fps: 1,
       contentTop: 69, contentHeight: 121, footX: 128 },
  2: { src: "assets/sprites/characters/siga-2.png", frames: 1, fps: 1,
       contentTop: 74, contentHeight: 117, footX: 128 },
  3: { src: "assets/sprites/characters/siga-3.png", frames: 1, fps: 1,
       contentTop: 69, contentHeight: 121, footX: 128 },
};

// Where Macario stands on the street for both of its scripts. His body
// runs 900 to 940; the join (and its tree) is at 1450, well clear.
const STREET_SPOT = 900;

// -------------------------------------------------------------
// The opening, on the street. The siga walk up behind him from the
// left, he turns to them, Nanay walks in from the right, he turns to
// her, and they go home. The last step starts the fade without
// awaiting it (CLAUDE.md, scripts): the script is done once it has
// handed over to the next scene.
// -------------------------------------------------------------
async function openingOnTheStreet() {
  setCutscene(true);
  turnPlayer(1);
  await wait(700);

  // From behind: he faces right, they come from the left.
  ["siga-1", "siga-2", "siga-3"].forEach((id) => showDecoration(id, true));
  await Promise.all([
    moveDecoration("siga-1", 760, 170),
    moveDecoration("siga-2", 690, 170),
    moveDecoration("siga-3", 620, 170),
  ]);
  turnPlayer(-1);
  await wait(300);

  await playDialogue([
    { speaker: "Siga", text: "Ano Macario, inaantay mo pa din tatay mo?" },
    { speaker: "Mga Siga", text: "BAHAHAHAHAHAHA!" },
    { speaker: "Macario", text: "Isarado mo 'yang bunganga mo!" },
  ]);

  // Nanay, from the right.
  showDecoration("nanay", true);
  await moveDecoration("nanay", 1090, 170);
  turnPlayer(1);
  await wait(300);

  await playDialogue([
    { speaker: "Nanay", text: "Macario, uwi na, may kailangan akong sabihin sayo" },
    { speaker: "Mga Siga", text: "HAHAHAHHHHA! NAGSUMBONG SA NANAY!" },
    { speaker: "Nanay", text: "Wag mo pansinin yung mga yan" },
    { speaker: "Macario", text: "Tsk" },
  ]);

  // Handed to the fade, which holds the world still from here.
  setCutscene(false);
  if (window.Acts) Acts.gotoScene("bahay");
}

// -------------------------------------------------------------
// At home. Nanay stands beside him from the first frame; the
// conversation opens the moment the fade clears, and ends on the way
// back out to the street.
// -------------------------------------------------------------
async function talkAtHome() {
  setCutscene(true);
  await wait(400);
  await playDialogue([
    { speaker: "Macario", text: "Nay, ano po ba yung sasabihin niyo?" },
    { speaker: "Nanay", text: "Macario, anak, naubos na yung pera natin sa pagbili ko ng Cedula..." },
    { speaker: "Nanay", text: "Wala na tayong pambili ng bigas, humingi ako ng ulam sa kapitbahay para sa hapunan natin ngayon..." },
    { speaker: "Nanay", text: "Pasensya ka na anak ha?" },
    { speaker: "Macario", text: "Okay lang 'Nay, magta-trabaho na po ako para makatulong sainyo" },
    { speaker: "Nanay", text: "Sigurado ka ba diyan 'nak?" },
    { speaker: "Macario", text: "Opo inay, ako na po ang bahala" },
  ]);
  setCutscene(false);
  if (window.Acts) Acts.gotoScene("tondo");
}

// -------------------------------------------------------------
// Back on the street, alone. His own thought, and then the quest: the
// doneFlag of this script is the first objective's flag, so setting it
// moves the log on to the savings step, which the engine announces
// ("Bagong gawain", game.js, renderQuests).
// -------------------------------------------------------------
async function thinkingAboutWork() {
  setCutscene(true);
  await wait(300);
  await playDialogue([
    { speaker: "Macario (sa isip)", text: "Kailangan ko ng pera para matulungan si Nanay, saan kaya ako makakahanap ng trabaho?" },
  ]);
  setCutscene(false);
}

// -------------------------------------------------------------
// Block 56. The people and the jobs.
// -------------------------------------------------------------

// The Kutsero's real sheet (Block 33: 5 by 3, 12 frames), the
// Mananahi's still and the mamamayan still the direktor wears, all
// measured with measure-sprite.js.
const KUTSERO = {
  src: "assets/sprites/characters/kutsero.png", frames: 12, fps: 6, columns: 5,
  contentTop: 74, contentHeight: 117, footX: 128,
};
const MANANAHI = {
  src: "assets/sprites/characters/mananahi.png", frames: 1, fps: 1,
  contentTop: 45, contentHeight: 166, footX: 128,
};
const DIREKTOR = {
  src: "assets/sprites/characters/mamamayan.png", frames: 1, fps: 1,
  contentTop: 74, contentHeight: 117, footX: 128,
};
// The white horse in the Kutsero's stable: a 22-frame strip of 32px cells.
const KABAYO = {
  src: "assets/sprites/characters/kabayo.png", frames: 22, fps: 10, columns: 22,
  contentTop: 2, contentHeight: 30, footX: 19,
};

// Where each stands on the street. NPC x is the left edge of an 80px
// body; all of it is at least 90px from the joins at 1450, 2900, 4350.
const KUTSERO_X = 1900;
const KABAYO_X = 2150;
const MANANAHI_X = 3500;

// The jobs. Each pays JOB_PAY_MIN to JOB_PAY_MAX barya a success, and
// until the savings are given to Nanay at most JOB_CAP from each job
// (the last pay is trimmed to land on the cap exactly, so the two jobs
// together make exactly the 100). What each job has paid is kept in its
// own flag as a number, so it survives a reload with the rest of the
// save (state.flags is stored whole).
const JOB_CAP = 50;
const JOB_PAY_MIN = 5;
const JOB_PAY_MAX = 14;
const SAVINGS_GOAL = 100;

const JOBS = {
  kutsero: {
    earnedFlag: "kinitaSaKutsero",
    cappedFlag: "sapatNaSaKutsero",
    title: "Kuwadra",
    hint: "Pindutin kapag nasa berde ang marka para masuklay nang maayos ang puting kabayo.",
    actionLabel: "Suklayin",
  },
  mananahi: {
    earnedFlag: "kinitaSaMananahi",
    cappedFlag: "sapatNaSaMananahi",
    title: "Patahian",
    hint: "Pindutin kapag nasa berde ang marka para tumama ang tahi.",
    actionLabel: "Tahiin",
  },
};

function randomInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

// The cap holds only until the savings are handed over.
function jobCapped() {
  return !state.flags.naibigayAngIponKayNanay;
}

function jobCanPlay(job) {
  if (!jobCapped()) return true;
  return (Number(state.flags[job.earnedFlag]) || 0) < JOB_CAP;
}

// One success: pays, records it, and sets the flags the dialogue and the
// guide read. Returns the line the mini-game shows.
function jobPay(job) {
  const earned = Number(state.flags[job.earnedFlag]) || 0;
  let pay = randomInt(JOB_PAY_MIN, JOB_PAY_MAX);
  if (jobCapped()) pay = Math.min(pay, JOB_CAP - earned);
  if (pay <= 0) return "";
  state.flags[job.earnedFlag] = earned + pay;
  if (jobCapped() && earned + pay >= JOB_CAP) state.flags[job.cappedFlag] = true;
  Game.addCurrency(pay); // marks the save dirty, and redraws the (n/100)
  if (!state.flags.sapatNaAngIpon && Game.currency() >= SAVINGS_GOAL) {
    state.flags.sapatNaAngIpon = true;
    markDirty();
  }
  return "Magaling! +" + pay + " barya";
}

// Opened from a conversation's onComplete, a tick later, so the press
// that closed the dialogue box is over before the job screen is up.
function startJob(key) {
  const job = JOBS[key];
  setTimeout(() => {
    playTimingGame({
      title: job.title,
      hint: job.hint,
      actionLabel: job.actionLabel,
      canPlay: () => jobCanPlay(job),
      capText: "Sapat na muna ang kinita mo rito. Iuwi mo na kay Nanay.",
      onSuccess: () => jobPay(job),
    });
  }, 0);
}

// -------------------------------------------------------------
// The tailor's shop, straight after Nanay (her gift's onComplete fades
// here). The Mananahi hands him the costume for the direktor; the
// doneFlag opens the entablado's door and moves the log on.
// -------------------------------------------------------------
async function errandAtTheShop() {
  setCutscene(true);
  await wait(400);
  await playDialogue([
    { speaker: "Mananahi", text: "Oh Macario, padala nga to dun sa direktor, asa dulo siya ng kalye sa loob ng entablado, ingatan mo mahal yang damit na yan" },
    { speaker: "Macario", text: "Sige 'ho" },
    { speaker: "Mananahi", text: "Nasa sakaniya na yung bayad, wag mo kalimutan kolektahin" },
  ]);
  setCutscene(false);
}

window.ACT_1 = {
  number: 1,
  title: "Origins",
  titleTagalog: "Ang Pinagmulan ni Macario",

  // One chain, in story order, drawn as the quest log (Block 48): the
  // task in hand is the first step whose flag is not set.
  //
  //   1  set when the thought on the street ends (thinkingAboutWork).
  //   2  counts his barya toward 100 (countCurrency, Block 52); set by
  //      Nanay's gift, "Ibigay ang ipon" (Block 56).
  //   3  set by the direktor's gift, which also pays him (Block 56).
  linearObjectives: true,
  objectives: [
    { id: "umuwi_kasama_nanay", label: "Umuwi kasama si Nanay",
      flag: "nagpasyangMagtrabaho" },
    { id: "mag_ipon", label: "Mag-ipon ng pera na mai-bibigay kay Nanay",
      flag: "naibigayAngIponKayNanay", countCurrency: SAVINGS_GOAL },
    { id: "dalhin_ang_damit", label: "Dalhin ang damit sa direktor sa entablado",
      flag: "nakolektaAngBayad" },
  ],

  // Block 56. Every step above can be done and Act I still does not
  // finish: the story continues past the entablado and the post-test
  // must wait for it (acts.js, checkObjectives).
  holdOpen: true,

  // Block 52. The savings step counts barya, so the act's own barya for
  // finishing a step (acts.js, the drip) is switched off: otherwise the
  // count would move without the story paying him anything. The whole
  // performance award is still paid when Act I completes.
  objectiveCurrency: false,

  // The chain is the quest log, so there is nothing to add at the start.
  startingQuests: [],

  // Where to go next (Block 42). Later steps first within a scene.
  guide: [
    { scene: "tondo", requiresFlag: "natanggapAngPadala", unlessFlag: "nakolektaAngBayad",
      exit: "entablado", label: "Direktor" },
    { scene: "tondo", requiresFlag: "sapatNaAngIpon", unlessFlag: "naibigayAngIponKayNanay",
      exit: "umuwi", label: "Nanay" },
    { scene: "tondo", requiresFlag: "nagpasyangMagtrabaho", unlessFlag: "nakausapAngKutsero",
      npc: "kutsero", label: "Kutsero" },
    { scene: "tondo", requiresFlag: "nagpasyangMagtrabaho", unlessFlag: "nakausapAngMananahi",
      npc: "mananahi", label: "Mananahi" },
    { scene: "bahay", requiresFlag: "sapatNaAngIpon", unlessFlag: "naibigayAngIponKayNanay",
      npc: "nanay", label: "Nanay" },
    { scene: "bahay", requiresFlag: "nagpasyangMagtrabaho", unlessFlag: "naibigayAngIponKayNanay",
      exit: "labas", label: "Trabaho" },
    { scene: "patahian", requiresFlag: "natanggapAngPadala", unlessFlag: "nakolektaAngBayad",
      exit: "labas", label: "Entablado" },
    { scene: "entablado", requiresFlag: "natanggapAngPadala", unlessFlag: "nakolektaAngBayad",
      npc: "direktor", label: "Direktor" },
  ],

  scenes: [
    {
      // The id stays "tondo" so a save made before the rewrite lands on
      // the street rather than nowhere; the old kutsero and lansangan
      // ids fall back to this first scene too (game.js, loadScene).
      id: "tondo",
      // Block 53. Every painting once, one panel each.
      worldWidth: STREET_PANELS.length * PANEL,
      panels: STREET_PANELS,
      panelSky: STREET_SKY,
      startX: STREET_SPOT,
      exits: [
        // Home, at the street's start. Shut until the story has sent him
        // out to work, so the opening cannot be walked out of.
        { id: "umuwi", x: 230, width: 90, label: "Umuwi",
          requiresFlag: "nagpasyangMagtrabaho",
          toScene: "bahay", toX: 300, toFacing: 1 },
        // The entablado, at the street's end. Opens with the errand.
        { id: "entablado", x: 5660, width: 100, label: "Pumasok sa entablado",
          requiresFlag: "natanggapAngPadala",
          toScene: "entablado", toX: 140, toFacing: 1 },
      ],
      decorations: [
        // Off to the left, hidden until the opening walks them on.
        { id: "siga-1", x: 260, hidden: true, animation: SIGA[1] },
        { id: "siga-2", x: 180, hidden: true, animation: SIGA[2] },
        { id: "siga-3", x: 100, hidden: true, animation: SIGA[3] },
        // Off to the right, hidden until she comes to call him home.
        // She walks on with her walk sheet and stands with her idle one
        // (walkAnimation, Block 53), turned the way she walks.
        { id: "nanay", x: 1750, hidden: true, animation: NANAY,
          walkAnimation: NANAY_WALK, faceMovement: true },
        // The white horse beside the Kutsero.
        { id: "kabayo", x: KABAYO_X, displayHeight: 120, animation: KABAYO },
      ],
      scripts: [
        { doneFlag: "nakitaAngMgaSiga", x: STREET_SPOT, facing: 1,
          run: openingOnTheStreet },
        { requiresFlag: "nakausapSiNanaySaBahay", doneFlag: "nagpasyangMagtrabaho",
          x: STREET_SPOT, facing: 1, run: thinkingAboutWork },
      ],
      npcs: [
        {
          id: "kutsero", x: KUTSERO_X, label: "Kutsero", animation: KUTSERO,
          nearSound: "assets/audio/sfx/horse.mp3",
          dialogueSets: [
            {
              skipIfFlag: "nakausapAngKutsero",
              lines: [
                { speaker: "Macario", text: "Kutsero, maaari po ba akong magtrabaho dito?" },
                { speaker: "Kutsero", text: "Macario? Buti naman at naisipan mo magtrabaho" },
                { speaker: "Macario", text: "Kailangan na 'ho eh, nangangailangan si Nanay" },
                { speaker: "Kutsero", text: "O sige, magsimula ka na kaagad, alagaan mo yung puting kabayo kuwadra" },
              ],
              onComplete() {
                state.flags.nakausapAngKutsero = true;
                markDirty();
                startJob("kutsero");
              },
            },
            {
              // PLACEHOLDER. At the cap, before the savings are given.
              requiresFlag: "sapatNaSaKutsero",
              skipIfFlag: "naibigayAngIponKayNanay",
              lines: [
                { speaker: "Kutsero", text: "Sapat na muna ang kinita mo ngayon, Macario. Iuwi mo na 'yan sa Nanay mo." },
              ],
            },
            {
              // PLACEHOLDER. Every visit after the first.
              requiresFlag: "nakausapAngKutsero",
              lines: [
                { speaker: "Kutsero", text: "O Macario, tuloy ka sa kuwadra." },
              ],
              onComplete() { startJob("kutsero"); },
            },
          ],
        },
        {
          id: "mananahi", x: MANANAHI_X, label: "Mananahi", animation: MANANAHI,
          dialogueSets: [
            {
              skipIfFlag: "nakausapAngMananahi",
              lines: [
                { speaker: "Macario", text: "Mananahi, tumatanggap ba kayo ng trabahador?" },
                { speaker: "Mananahi", text: "Oo naman Macario, kamusta na ang inay mo?" },
                { speaker: "Macario", text: "Okay lang 'ho, nangangailangan kami ng pera ngayon" },
                { speaker: "Mananahi", text: "O sige sige, tara dito" },
              ],
              onComplete() {
                state.flags.nakausapAngMananahi = true;
                markDirty();
                startJob("mananahi");
              },
            },
            {
              // PLACEHOLDER. At the cap, before the savings are given.
              requiresFlag: "sapatNaSaMananahi",
              skipIfFlag: "naibigayAngIponKayNanay",
              lines: [
                { speaker: "Mananahi", text: "Sapat na muna 'yan, Macario. Iuwi mo na sa inay mo." },
              ],
            },
            {
              // PLACEHOLDER. Every visit after the first.
              requiresFlag: "nakausapAngMananahi",
              lines: [
                { speaker: "Mananahi", text: "O Macario, tara dito." },
              ],
              onComplete() { startJob("mananahi"); },
            },
          ],
        },
      ],
    },
    {
      // At home. The same street paintings, at the proponents' direction
      // (keep the background), one panel wide, so no tree stands in it.
      // Block 56: Nanay is a person here now rather than scenery, so the
      // savings can be given to her.
      id: "bahay",
      worldWidth: 1450,
      panels: STREET_PANELS,
      panelSky: STREET_SKY,
      startX: 560,
      exits: [
        { id: "labas", x: 150, width: 90, label: "Lumabas",
          requiresFlag: "nagpasyangMagtrabaho",
          toScene: "tondo", toX: 360, toFacing: 1 },
      ],
      decorations: [],
      scripts: [
        { doneFlag: "nakausapSiNanaySaBahay", x: 560, facing: 1, run: talkAtHome },
      ],
      npcs: [
        {
          id: "nanay", x: 660, label: "Nanay", animation: NANAY,
          dialogueSets: [
            {
              // PLACEHOLDER. Before the savings.
              skipIfFlag: "naibigayAngIponKayNanay",
              lines: [
                { speaker: "Nanay", text: "Mag-ingat ka sa trabaho, anak." },
              ],
            },
            {
              requiresFlag: "naibigayAngIponKayNanay",
              lines: [
                { speaker: "Nanay", text: "Tuloy mo lang yan Nak, malayo ang mararating mo sa buhay" },
              ],
            },
          ],
          gift: {
            buttonLabel: "Ibigay ang ipon",
            requiresFlag: "sapatNaAngIpon",
            givenFlag: "naibigayAngIponKayNanay",
            responseLines: [
              { speaker: "Macario", text: "Nay, nakapag-ipon na ako ng pera para makatulong" },
              { speaker: "Nanay", text: "Maraming salamat anak ko! Napakahusay mo! Ginalingan mo ba sa trabaho?" },
              { speaker: "Macario", text: "Opo Nay, nagtrabaho ako para sa Kutsero at mananahi" },
              { speaker: "Nanay", text: "Tuloy mo lang yan Nak, malayo ang mararating mo sa buhay" },
              { speaker: "Macario", text: "Maraming salamat nay!" },
            ],
            // The flag set here is what lifts the jobs' cap (jobCapped).
            // Then straight to the tailor's shop.
            onComplete() {
              Game.spendCurrency(Math.min(SAVINGS_GOAL, Game.currency()));
              if (window.Acts) Acts.gotoScene("patahian");
            },
          },
        },
      ],
    },
    {
      // Block 56. Inside the tailor's shop. No painting of it exists, so
      // it borrows one street panel the way bahay does.
      id: "patahian",
      worldWidth: 1450,
      panels: ["assets/backgrounds/act1/street-03.jpg"],
      panelSky: STREET_SKY,
      startX: 560,
      exits: [
        { id: "labas", x: 150, width: 90, label: "Lumabas",
          toScene: "tondo", toX: MANANAHI_X - 120, toFacing: 1 },
      ],
      decorations: [
        { id: "mananahi-patahian", x: 740, animation: MANANAHI },
      ],
      scripts: [
        { doneFlag: "natanggapAngPadala", x: 560, facing: 1, run: errandAtTheShop },
      ],
      npcs: [],
    },
    {
      // Block 56. Inside the entablado, the painting the old moro-moro
      // used, one screen wide with its own floor.
      id: "entablado",
      worldWidth: 900,
      backdrop: { src: "assets/backgrounds/act1/entablado-inside.jpg" },
      ground: false,
      startX: 140,
      exits: [
        { id: "labas", x: 20, width: 90, label: "Lumabas",
          toScene: "tondo", toX: 5560, toFacing: -1 },
      ],
      decorations: [],
      npcs: [
        {
          id: "direktor", x: 520, label: "Direktor", animation: DIREKTOR,
          dialogueSets: [
            {
              // PLACEHOLDER.
              skipIfFlag: "nakolektaAngBayad",
              lines: [
                { speaker: "Direktor", text: "Abala kami sa paghahanda ng palabas, iho." },
              ],
            },
            {
              requiresFlag: "nakolektaAngBayad",
              lines: [
                { speaker: "Direktor", text: "Salamat ulit, iho." },
              ],
            },
          ],
          gift: {
            buttonLabel: "Iabot ang damit",
            requiresFlag: "natanggapAngPadala",
            givenFlag: "nakolektaAngBayad",
            // PLACEHOLDER, both lines (Block 56: the proponent asked for
            // two short ones to stand in).
            responseLines: [
              { speaker: "Direktor", text: "Ay, salamat! Ito na ang damit na hinihintay namin para sa palabas." },
              { speaker: "Direktor", text: "Heto ang bayad, iho. Pakisabi sa Mananahi, maraming salamat." },
            ],
            onComplete() {
              const pay = randomInt(79, 110);
              Game.addCurrency(pay);
              showToast("+" + pay + " barya", 2200);
            },
          },
        },
      ],
    },
  ],
};
