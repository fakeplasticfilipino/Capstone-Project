// =============================================================
// MACARIO — content/act1.js
//
// Act I, rewritten from the start in Block 52 against the proponents'
// new script and plot, and rebuilt in Block 57 around one street: no
// room to be carried into, except the entablado, which the direktor
// takes Macario into himself. What came before is in git history and
// CLAUDE.md, Decisions on record. None of it should be copied back in
// without a reason.
//
// The story so far, all of it on the street (tondo) unless it says:
//
//   "Tondo, 1880" on black (playIntertitle). Macario stands alone;
//   three siga come up behind him and taunt him about his father.
//   Nanay comes to call him home and they walk off together, to where
//   she stays for the rest of the act. There she tells him the money
//   went on the cedula; he says he will work, and wonders where.
//
//   The Kutsero gives him work: three apples from the tree up the road
//   (a mini-game, game.js, playCatchGame), fed to the white horse, and
//   50 barya. Then the Mananahi: three finished clothes carried to three
//   of her customers along the street, and 50 barya. He gives Nanay the
//   100.
//
//   "1884" on black, and he is beside the Mananahi, who sends him with
//   a costume for the direktor at the far end of the street. The
//   direktor takes him inside the entablado (the one scene change),
//   where he hands it over and is paid.
//
// Act I is held open after that (holdOpen, acts.js): the story goes on
// from there and the post-test must not open yet.
//
// The lines are the proponents' script as written, apostrophes
// straightened. Lines marked PLACEHOLDER are ours, to be replaced by
// the proponents: everything the job-givers, the horse, the customers
// and the direktor say beyond the lines the script gave. The siga are
// stand-in stills (Block 52); the customers and the direktor wear other
// characters' art; the apple tree is drawn in code (Block 57, scenery).
// =============================================================

// Block 49. The paintings of the street, laid along the road in order
// (game.js, buildPanelBackdrop), with a shadow tree over each join
// (Block 50). Block 57 made the street ten paintings long at the
// proponent's direction, which with four paintings means the four in
// order, twice, and then the first two again.
const STREET_PAINTINGS = [
  "assets/backgrounds/act1/street-01.jpg",
  "assets/backgrounds/act1/street-02.jpg",
  "assets/backgrounds/act1/street-03.jpg",
  "assets/backgrounds/act1/street-04.jpg",
];
const STREET_PANEL_COUNT = 10;
const STREET_PANELS = Array.from({ length: STREET_PANEL_COUNT },
  (_, i) => STREET_PAINTINGS[i % STREET_PAINTINGS.length]);

// One panel's width in the world (game.js, PANEL_WIDTH). The joins, and
// the trees over them, are at every multiple of it; everyone a student
// must reach stands at least 90px clear of one (CLAUDE.md, Block 50).
const PANEL = 1450;
const STREET_WIDTH = STREET_PANEL_COUNT * PANEL; // 14500

// Block 46. The sky above a painting on a tall screen: the average of
// the four paintings' top rows.
const STREET_SKY = "#51a6ea";

// ---- Art ----------------------------------------------------------
// Every sheet measured with _dev/tools/measure-sprite.js.

// Nanay's real sheet (5 by 3, 14 frames). Block 57: she slides on with
// it rather than walking with the drawn profile walk (Block 54), at the
// proponent's direction.
const NANAY = {
  src: "assets/sprites/characters/nanay.png", frames: 14, fps: 6, columns: 5,
  contentTop: 45, contentHeight: 166, footX: 127,
};

// Block 52. The three siga: stand-in stills made by
// _dev/tools/make-placeholder-sprites.py.
const SIGA = {
  1: { src: "assets/sprites/characters/siga-1.png", frames: 1, fps: 1,
       contentTop: 69, contentHeight: 121, footX: 128 },
  2: { src: "assets/sprites/characters/siga-2.png", frames: 1, fps: 1,
       contentTop: 74, contentHeight: 117, footX: 128 },
  3: { src: "assets/sprites/characters/siga-3.png", frames: 1, fps: 1,
       contentTop: 69, contentHeight: 121, footX: 128 },
};

// The Kutsero's real sheet (Block 33) and the Mananahi's still (Block 41).
const KUTSERO = {
  src: "assets/sprites/characters/kutsero.png", frames: 12, fps: 6, columns: 5,
  contentTop: 74, contentHeight: 117, footX: 128,
};
const MANANAHI = {
  src: "assets/sprites/characters/mananahi.png", frames: 1, fps: 1,
  contentTop: 45, contentHeight: 166, footX: 128,
};
// The white horse: a 22-frame strip of 32px cells.
const KABAYO = {
  src: "assets/sprites/characters/kabayo.png", frames: 22, fps: 10, columns: 22,
  contentTop: 2, contentHeight: 30, footX: 19,
};
// Block 57. The apple tree, drawn by _dev/tools/make-apple-tree.py.
const PUNO = {
  src: "assets/sprites/scenery/puno-mansanas.png", frames: 1, fps: 1,
  contentTop: 3, contentHeight: 77, footX: 32,
};
// The direktor wears the mamamayan still (a stand-in).
const DIREKTOR = {
  src: "assets/sprites/characters/mamamayan.png", frames: 1, fps: 1,
  contentTop: 74, contentHeight: 117, footX: 128,
};

// ---- Where everyone stands ---------------------------------------
// An NPC's x is the left edge of an 80px body. Joins at 1450, 2900,
// 4350, 5800, 7250, 8700, 10150, 11600 and 13050.
const STREET_SPOT = 900;      // Macario, for the opening
const NANAY_X = 2000;         // where she and Macario walk to, and stay
const KUTSERO_X = 3300;
const KABAYO_X = 3560;
const PUNO_X = 4900;
const MANANAHI_X = 6400;
const DIREKTOR_X = 13600;     // at the far end, by the entablado

// Where Macario stops beside someone he has walked or been sent to.
const BESIDE = 120;

const SAVINGS_GOAL = 100;
const JOB_PAY = 50; // each job pays this, once; the two make the savings

// Three apples, one flag each, so the quest line can count them
// (countFlags) and a student who stops at two keeps two.
const APPLE_FLAGS = ["nakuhangMansanas1", "nakuhangMansanas2", "nakuhangMansanas3"];

// Block 57. The Mananahi's three customers, one table from which the
// people, the gifts, the flags, the quest count and the guide are all
// derived, so they cannot disagree. Names and lines are PLACEHOLDER.
const CUSTOMERS = [
  { id: "aling-rosa", label: "Aling Rosa", x: 7800,
    animation: { src: "assets/sprites/characters/maryam.png", frames: 13, fps: 6, columns: 5,
                 contentTop: 73, contentHeight: 117, footX: 128 },
    waiting: "Ang tagal naman ng baro ko. Ngayong araw daw ang pista!",
    thanks: "Ay, salamat, iho! Kasyang-kasya ito sa akin." },
  { id: "mang-tomas", label: "Mang Tomas", x: 9300,
    animation: { src: "assets/sprites/characters/tindero.png", frames: 14, fps: 6, columns: 5,
                 contentTop: 69, contentHeight: 121, footX: 128 },
    waiting: "Hinihintay ko ang pantalon na ipinatahi ko sa mananahi.",
    thanks: "Aba, ang ganda ng pagkakatahi. Pakisabi salamat." },
  { id: "ginoong-reyes", label: "Ginoong Reyes", x: 10800,
    animation: { src: "assets/sprites/characters/katipunero.png", frames: 1, fps: 1,
                 contentTop: 74, contentHeight: 117, footX: 128 },
    waiting: "May pupuntahan ako mamaya. Sana dumating na ang camisa ko.",
    thanks: "Sakto ang dating mo, bata. Salamat!" },
];
const customerFlag = (c) => "naihatidKay_" + c.id.replace(/-/g, "_");

// -------------------------------------------------------------
// The opening, on the street. Black first, with the place and the year.
// The siga walk up behind him from the left, he turns to them, Nanay
// comes in from the right, and the two of them walk off together to
// where she stays; there she tells him about the money, and he decides
// to work. Nanay is scenery while she moves and a person once she has
// stopped: the decoration is hidden and the NPC shown in its place.
// -------------------------------------------------------------
async function openingOnTheStreet() {
  setCutscene(true);
  turnPlayer(1);
  await playIntertitle(["Tondo, 1880", "Kung saan nagsimula ang buhay ni Macario"],
    { startBlack: true });
  await wait(500);

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

  // Nanay, from the right. She slides on (Block 57, no walk sheet).
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

  // They walk away together, the siga left behind off screen.
  await Promise.all([
    moveDecoration("nanay", NANAY_X + 40, 170),
    movePlayer(NANAY_X - BESIDE, 170),
  ]);
  ["siga-1", "siga-2", "siga-3"].forEach((id) => showDecoration(id, false));
  turnPlayer(1);
  await wait(300);

  await playDialogue([
    { speaker: "Macario", text: "Nay, ano po ba yung sasabihin niyo?" },
    { speaker: "Nanay", text: "Macario, anak, naubos na yung pera natin sa pagbili ko ng Cedula..." },
    { speaker: "Nanay", text: "Wala na tayong pambili ng bigas, humingi ako ng ulam sa kapitbahay para sa hapunan natin ngayon..." },
    { speaker: "Nanay", text: "Pasensya ka na anak ha?" },
    { speaker: "Macario", text: "Okay lang 'Nay, magta-trabaho na po ako para makatulong sainyo" },
    { speaker: "Nanay", text: "Sigurado ka ba diyan 'nak?" },
    { speaker: "Macario", text: "Opo inay, ako na po ang bahala" },
  ]);

  // From here she is someone to talk to. The flag is saved now, so a
  // reload after this point replays only the thought below.
  state.flags.nakitaAngMgaSiga = true;
  state.flags.nakausapSiNanaySaBahay = true;
  markDirty();
  revealNpcsByFlag();
  showDecoration("nanay", false);

  await thinkingAboutWork(true);
}

// His own thought, and then the quest: the doneFlag of this script is
// the first objective's flag, so setting it moves the log on, which the
// engine announces ("Bagong gawain", game.js, renderQuests).
async function thinkingAboutWork(alreadyHeld) {
  if (!alreadyHeld) setCutscene(true);
  await wait(300);
  await playDialogue([
    { speaker: "Macario (sa isip)", text: "Kailangan ko ng pera para matulungan si Nanay, saan kaya ako makakahanap ng trabaho?" },
  ]);
  setCutscene(false);
}

// -------------------------------------------------------------
// After the savings. "1884" on black, and when it lifts he is beside
// the Mananahi, who sends him to the direktor. A scene script in tondo
// (so a reload before it is over plays it again), started straight
// from Nanay's gift by runSceneScript.
// -------------------------------------------------------------
async function yearsOfWork() {
  setCutscene(true);
  await playIntertitle(["1884", "Nagtrabaho si Macario bilang isang tagatulong ng kutsero at manananahi"], {
    whileBlack: () => placePlayer(MANANAHI_X - BESIDE, 1),
  });
  await wait(300);
  await playDialogue([
    { speaker: "Mananahi", text: "Oh Macario, padala nga to dun sa direktor, asa dulo siya ng kalye sa loob ng entablado, ingatan mo mahal yang damit na yan" },
    { speaker: "Macario", text: "Sige 'ho" },
    { speaker: "Mananahi", text: "Nasa sakaniya na yung bayad, wag mo kalimutan kolektahin" },
  ]);
  setCutscene(false);
}

// -------------------------------------------------------------
// The apples. The tree opens the mini-game only while the apples are
// the task; any other time Macario just looks at it.
// -------------------------------------------------------------
function applesHeld() {
  return APPLE_FLAGS.filter((f) => state.flags[f]).length;
}

function pickApples() {
  if (!state.flags.nakausapAngKutsero || state.flags.napakainAngKabayo) {
    playDialogue([{ speaker: "Macario (sa isip)", text: "Ang daming bunga ng punong ito." }]);
    return;
  }
  if (applesHeld() >= APPLE_FLAGS.length) {
    playDialogue([{ speaker: "Macario (sa isip)", text: "Tatlo na ang hawak ko. Dalhin ko na sa kabayo." }]);
    return;
  }
  playCatchGame({
    title: "Puno ng mansanas",
    hint: "Saluhin ng basket ang mga nahuhulog na mansanas.",
    goal: APPLE_FLAGS.length,
    start: applesHeld(),
    onCatch(n) {
      state.flags[APPLE_FLAGS[n - 1]] = true;
      markDirty(); // redraws the (n/3)
      return "Nasalo mo! (" + n + "/" + APPLE_FLAGS.length + ")";
    },
    doneText: "Tatlo na! Dalhin mo na sa kabayo.",
  });
}

// A job's pay: fixed, once, shown as a toast.
function payForJob() {
  Game.addCurrency(JOB_PAY);
  showToast("+" + JOB_PAY + " barya", 2200);
}

window.ACT_1 = {
  number: 1,
  title: "Origins",
  titleTagalog: "Ang Pinagmulan ni Macario",

  // One chain, in story order, drawn as the quest log (Block 48): the
  // task in hand is the first step whose flag is not set.
  //
  //   1  the thought on the street, at the end of the opening.
  //   2  the Kutsero's first conversation.
  //   3  counts the apples caught; done when the horse is fed.
  //   4  the Kutsero's gift button, which pays 50.
  //   5  the Mananahi's first conversation, once the Kutsero has paid.
  //   6  counts the customers given their clothes; done at the third.
  //   7  the Mananahi's gift button, which pays 50.
  //   8  Nanay's gift, "Ibigay ang ipon"; counts the barya to 100.
  //   9  the direktor's gift inside the entablado, which pays him.
  linearObjectives: true,
  objectives: [
    { id: "umuwi_kasama_nanay", label: "Umuwi kasama si Nanay",
      flag: "nagpasyangMagtrabaho" },
    { id: "kausapin_kutsero", label: "Maghanap ng trabaho: kausapin ang Kutsero",
      flag: "nakausapAngKutsero" },
    { id: "pakainin_kabayo", label: "Kumuha ng tatlong mansanas at ipakain sa kabayo",
      flag: "napakainAngKabayo", countFlags: APPLE_FLAGS },
    { id: "bayad_kutsero", label: "Kunin ang bayad sa Kutsero",
      flag: "nabayaranNgKutsero" },
    { id: "kausapin_mananahi", label: "Kausapin ang Mananahi",
      flag: "nakausapAngMananahi" },
    { id: "ihatid_damit", label: "Ihatid ang mga damit sa mga suki",
      flag: "naihatidAngMgaDamit", countFlags: CUSTOMERS.map(customerFlag) },
    { id: "bayad_mananahi", label: "Kunin ang bayad sa Mananahi",
      flag: "nabayaranNgMananahi" },
    { id: "mag_ipon", label: "Ibigay kay Nanay ang naipon",
      flag: "naibigayAngIponKayNanay", countCurrency: SAVINGS_GOAL },
    { id: "dalhin_ang_damit", label: "Dalhin ang damit sa direktor sa entablado",
      flag: "nakolektaAngBayad" },
  ],

  // Block 56. Every step above can be done and Act I still does not
  // finish: the story continues past the entablado and the post-test
  // must wait for it (acts.js, checkObjectives).
  holdOpen: true,

  // Block 52. A step counts barya, so the act's own barya for finishing
  // a step (acts.js, the drip) is switched off: the only barya in the
  // act is what the story pays him. The performance award is still paid
  // when Act I completes.
  objectiveCurrency: false,

  // The chain is the quest log, so there is nothing to add at the start.
  startingQuests: [],

  // Where to go next (Block 42). Later steps first.
  guide: [
    { scene: "tondo", requiresFlag: "natanggapAngPadala", unlessFlag: "nakolektaAngBayad",
      npc: "direktor", label: "Direktor" },
    { scene: "tondo", requiresFlag: "nabayaranNgMananahi", unlessFlag: "naibigayAngIponKayNanay",
      npc: "nanay", label: "Nanay" },
    { scene: "tondo", requiresFlag: "naihatidAngMgaDamit", unlessFlag: "nabayaranNgMananahi",
      npc: "mananahi", label: "Mananahi" },
    { scene: "tondo", requiresFlag: "nakausapAngMananahi", unlessFlag: "naihatidAngMgaDamit",
      npcs: CUSTOMERS.map((c) => c.id) },
    { scene: "tondo", requiresFlag: "nabayaranNgKutsero", unlessFlag: "nakausapAngMananahi",
      npc: "mananahi", label: "Mananahi" },
    { scene: "tondo", requiresFlag: "napakainAngKabayo", unlessFlag: "nabayaranNgKutsero",
      npc: "kutsero", label: "Kutsero" },
    { scene: "tondo", requiresFlag: "nakuhangMansanas3", unlessFlag: "napakainAngKabayo",
      npc: "kabayo", label: "Kabayo" },
    { scene: "tondo", requiresFlag: "nakausapAngKutsero", unlessFlag: "nakuhangMansanas3",
      npc: "puno", label: "Puno ng mansanas" },
    { scene: "tondo", requiresFlag: "nagpasyangMagtrabaho", unlessFlag: "nakausapAngKutsero",
      npc: "kutsero", label: "Kutsero" },
    { scene: "entablado", requiresFlag: "natanggapAngPadala", unlessFlag: "nakolektaAngBayad",
      npc: "direktor", label: "Direktor" },
  ],

  scenes: [
    {
      // The id stays "tondo" so a save made before the rewrite lands on
      // the street; every retired scene id (bahay, patahian, kutsero,
      // lansangan) falls back to this first scene too (game.js,
      // loadScene).
      id: "tondo",
      worldWidth: STREET_WIDTH,
      panels: STREET_PANELS,
      panelSky: STREET_SKY,
      startX: STREET_SPOT,
      decorations: [
        // Off to the left, hidden until the opening walks them on.
        { id: "siga-1", x: 260, hidden: true, animation: SIGA[1] },
        { id: "siga-2", x: 180, hidden: true, animation: SIGA[2] },
        { id: "siga-3", x: 100, hidden: true, animation: SIGA[3] },
        // Nanay while the opening moves her: off to the right, hidden
        // until she comes to call him home. The NPC below takes over
        // once she has stopped.
        { id: "nanay", x: 1750, hidden: true, animation: NANAY },
      ],
      scripts: [
        { unlessFlag: "nakausapSiNanaySaBahay", doneFlag: "nagpasyangMagtrabaho",
          x: STREET_SPOT, facing: 1, run: openingOnTheStreet },
        // A reload after the talk with Nanay and before the thought.
        { requiresFlag: "nakausapSiNanaySaBahay", doneFlag: "nagpasyangMagtrabaho",
          x: NANAY_X - BESIDE, facing: 1, run: () => thinkingAboutWork(false) },
        // It places Macario itself, under the black.
        { requiresFlag: "naibigayAngIponKayNanay", doneFlag: "natanggapAngPadala",
          run: yearsOfWork },
      ],
      npcs: [
        {
          id: "nanay", x: NANAY_X, label: "Nanay", animation: NANAY,
          startsHidden: true, revealedByFlag: "nakausapSiNanaySaBahay",
          dialogueSets: [
            {
              // PLACEHOLDER. Before the savings.
              skipIfFlag: "naibigayAngIponKayNanay",
              lines: [
                { speaker: "Nanay", text: "Mag-ingat ka sa trabaho, anak." },
              ],
            },
            {
              lines: [
                { speaker: "Nanay", text: "Tuloy mo lang yan Nak, malayo ang mararating mo sa buhay" },
              ],
            },
          ],
          gift: {
            buttonLabel: "Ibigay ang ipon",
            requiresFlag: "nabayaranNgMananahi",
            givenFlag: "naibigayAngIponKayNanay",
            responseLines: [
              { speaker: "Macario", text: "Nay, nakapag-ipon na ako ng pera para makatulong" },
              { speaker: "Nanay", text: "Maraming salamat anak ko! Napakahusay mo! Ginalingan mo ba sa trabaho?" },
              { speaker: "Macario", text: "Opo Nay, nagtrabaho ako para sa Kutsero at mananahi" },
              { speaker: "Nanay", text: "Tuloy mo lang yan Nak, malayo ang mararating mo sa buhay" },
              { speaker: "Macario", text: "Maraming salamat nay!" },
            ],
            // The years pass (yearsOfWork), started here rather than
            // waiting for a reload: the gift's flag is what it waits on.
            onComplete() {
              Game.spendCurrency(Math.min(SAVINGS_GOAL, Game.currency()));
              setTimeout(() => runSceneScript(), 0);
            },
          },
        },
        {
          id: "kutsero", x: KUTSERO_X, label: "Kutsero", animation: KUTSERO,
          dialogueSets: [
            {
              skipIfFlag: "nakausapAngKutsero",
              lines: [
                { speaker: "Macario", text: "Kutsero, maaari po ba akong magtrabaho dito?" },
                { speaker: "Kutsero", text: "Macario? Buti naman at naisipan mo magtrabaho" },
                { speaker: "Macario", text: "Kailangan na 'ho eh, nangangailangan si Nanay" },
                { speaker: "Kutsero", text: "O sige, magsimula ka na kaagad, alagaan mo yung puting kabayo kuwadra" },
                // PLACEHOLDER. What the work is, for the new job.
                { speaker: "Kutsero", text: "Gutom na siya. Kumuha ka ng tatlong mansanas sa puno sa unahan, at ipakain mo sa kanya." },
              ],
              onComplete() {
                state.flags.nakausapAngKutsero = true;
                markDirty();
              },
            },
            {
              // PLACEHOLDER. While the apples are the task.
              skipIfFlag: "napakainAngKabayo",
              lines: [
                { speaker: "Kutsero", text: "Nasa puno sa unahan ang mansanas. Tatlo ang kailangan ng kabayo." },
              ],
            },
            {
              // PLACEHOLDER. The horse is fed; the pay is his gift button.
              skipIfFlag: "nabayaranNgKutsero",
              lines: [
                { speaker: "Kutsero", text: "Busog na ang kabayo! Halika, kunin mo ang bayad mo." },
              ],
            },
            {
              // PLACEHOLDER. Afterwards.
              lines: [
                { speaker: "Kutsero", text: "Salamat sa tulong mo, Macario." },
              ],
            },
          ],
          gift: {
            buttonLabel: "Kunin ang bayad",
            requiresFlag: "napakainAngKabayo",
            givenFlag: "nabayaranNgKutsero",
            // PLACEHOLDER.
            responseLines: [
              { speaker: "Kutsero", text: "Heto ang limampung barya, Macario. Pinaghirapan mo 'yan." },
              { speaker: "Macario", text: "Maraming salamat po!" },
            ],
            onComplete: payForJob,
          },
        },
        {
          // The white horse, beside the Kutsero, and the one he is fed to.
          id: "kabayo", x: KABAYO_X, label: "Kabayo", animation: KABAYO,
          displayHeight: 120,
          nearSound: "assets/audio/sfx/horse.mp3",
          dialogueSets: [
            {
              // PLACEHOLDER.
              lines: [
                { speaker: "Kabayo", text: "Hiiiii!" },
              ],
            },
          ],
          gift: {
            buttonLabel: "Ipakain ang mansanas",
            requiresFlag: "nakuhangMansanas3",
            givenFlag: "napakainAngKabayo",
            // PLACEHOLDER.
            responseLines: [
              { speaker: "Macario", text: "Heto, kabayo. Tatlong mansanas para sa'yo." },
              { speaker: "Kabayo", text: "Hiiiii!" },
            ],
          },
        },
        {
          // Block 57. Something to use rather than someone to talk to:
          // E opens the apple mini-game (onInteract).
          id: "puno", x: PUNO_X, label: "Puno ng mansanas", animation: PUNO,
          displayHeight: 280, interactLabel: "Pumitas",
          dialogueSets: [],
          onInteract: pickApples,
        },
        {
          id: "mananahi", x: MANANAHI_X, label: "Mananahi", animation: MANANAHI,
          dialogueSets: [
            {
              // PLACEHOLDER. Before the Kutsero's job is done.
              skipIfFlag: "nabayaranNgKutsero",
              lines: [
                { speaker: "Mananahi", text: "Macario! Balikan mo ako pagkatapos mo sa Kutsero, may maipapagawa ako sa'yo." },
              ],
            },
            {
              requiresFlag: "nabayaranNgKutsero",
              skipIfFlag: "nakausapAngMananahi",
              lines: [
                { speaker: "Macario", text: "Mananahi, tumatanggap ba kayo ng trabahador?" },
                { speaker: "Mananahi", text: "Oo naman Macario, kamusta na ang inay mo?" },
                { speaker: "Macario", text: "Okay lang 'ho, nangangailangan kami ng pera ngayon" },
                { speaker: "Mananahi", text: "O sige sige, tara dito" },
                // PLACEHOLDER. What the work is.
                { speaker: "Mananahi", text: "May tatlong damit dito na tapos ko nang tahiin. Ihatid mo sa mga suki ko sa kalye: kay Aling Rosa, kay Mang Tomas at kay Ginoong Reyes." },
              ],
              onComplete() {
                state.flags.nakausapAngMananahi = true;
                markDirty();
              },
            },
            {
              // PLACEHOLDER. While the clothes are being delivered.
              skipIfFlag: "naihatidAngMgaDamit",
              lines: [
                { speaker: "Mananahi", text: "Nasa kalye ang tatlong suki. Ihatid mo ang mga damit nila." },
              ],
            },
            {
              // PLACEHOLDER. Delivered; the pay is her gift button.
              skipIfFlag: "nabayaranNgMananahi",
              lines: [
                { speaker: "Mananahi", text: "Naihatid mo lahat? Ang galing mo! Kunin mo na ang bayad mo." },
              ],
            },
            {
              // PLACEHOLDER. Paid, before the savings are given.
              skipIfFlag: "naibigayAngIponKayNanay",
              lines: [
                { speaker: "Mananahi", text: "Iuwi mo na 'yang kinita mo sa inay mo." },
              ],
            },
            {
              // PLACEHOLDER. Afterwards.
              lines: [
                { speaker: "Mananahi", text: "Ingatan mo ang damit ha." },
              ],
            },
          ],
          gift: {
            buttonLabel: "Kunin ang bayad",
            requiresFlag: "naihatidAngMgaDamit",
            givenFlag: "nabayaranNgMananahi",
            // PLACEHOLDER.
            responseLines: [
              { speaker: "Mananahi", text: "Heto ang limampung barya. Salamat sa tulong, Macario." },
              { speaker: "Macario", text: "Salamat din po!" },
            ],
            onComplete: payForJob,
          },
        },
        // The three customers (CUSTOMERS, above).
        ...CUSTOMERS.map((c) => ({
          id: c.id, x: c.x, label: c.label, animation: c.animation,
          dialogueSets: [
            { skipIfFlag: customerFlag(c),
              lines: [{ speaker: c.label, text: c.waiting }] },
            { lines: [{ speaker: c.label, text: c.thanks }] },
          ],
          gift: {
            buttonLabel: "Iabot ang damit",
            requiresFlag: "nakausapAngMananahi",
            givenFlag: customerFlag(c),
            responseLines: [
              { speaker: "Macario", text: "Magandang araw po! Padala po ng Mananahi." },
              { speaker: c.label, text: c.thanks },
            ],
            // Counted from the flags, so the order does not matter and a
            // reload cannot miscount.
            onComplete() {
              if (CUSTOMERS.every((x) => state.flags[customerFlag(x)])) {
                state.flags.naihatidAngMgaDamit = true;
              }
              markDirty();
            },
          },
        })),
        {
          // Block 57. The direktor, on the street by the entablado.
          // Talking to him with the costume takes them both inside.
          id: "direktor", x: DIREKTOR_X, label: "Direktor", animation: DIREKTOR,
          dialogueSets: [
            {
              // PLACEHOLDER. Before the errand.
              skipIfFlag: "natanggapAngPadala",
              lines: [
                { speaker: "Direktor", text: "Abala kami sa paghahanda ng palabas, iho." },
              ],
            },
            {
              // PLACEHOLDER. With the costume.
              skipIfFlag: "nakolektaAngBayad",
              lines: [
                { speaker: "Macario", text: "Magandang araw po. May padala po ang Mananahi para sa inyo." },
                { speaker: "Direktor", text: "Ah, ang damit! Halika, sa loob tayo ng entablado." },
              ],
              onComplete() {
                if (window.Acts) Acts.gotoScene("entablado", { x: 300, facing: 1 });
              },
            },
            {
              // PLACEHOLDER. Afterwards.
              lines: [
                { speaker: "Direktor", text: "Salamat ulit, iho." },
              ],
            },
          ],
        },
      ],
    },
    {
      // Block 56. Inside the entablado, the painting the old moro-moro
      // used, one screen wide with its own floor. Since Block 57 the
      // only way in is with the direktor.
      id: "entablado",
      worldWidth: 900,
      backdrop: { src: "assets/backgrounds/act1/entablado-inside.jpg" },
      ground: false,
      startX: 300,
      exits: [
        { id: "labas", x: 20, width: 90, label: "Lumabas",
          toScene: "tondo", toX: DIREKTOR_X - BESIDE, toFacing: 1 },
      ],
      decorations: [],
      npcs: [
        {
          id: "direktor", x: 440, label: "Direktor", animation: DIREKTOR,
          dialogueSets: [
            {
              // PLACEHOLDER.
              skipIfFlag: "nakolektaAngBayad",
              lines: [
                { speaker: "Direktor", text: "Dito na natin gagamitin ang damit. Iabot mo na, iho." },
              ],
            },
            {
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
            // Block 56: 79 to 110 at random, as the proponent asked.
            onComplete() {
              const pay = 79 + Math.floor(Math.random() * 32);
              Game.addCurrency(pay);
              showToast("+" + pay + " barya", 2200);
            },
          },
        },
      ],
    },
  ],
};
