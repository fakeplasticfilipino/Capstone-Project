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
// The story so far, in three beats:
//
//   tondo    the street. Macario stands alone; three siga come up behind
//            him and taunt him about his father. Nanay walks in and calls
//            him home. (A scene script: it plays by itself, on a login
//            as well as through a fade; see CLAUDE.md, Act data format,
//            scripts.)
//   bahay    at home, the same street backdrop at the proponents'
//            direction. Nanay tells him the money went on the cedula and
//            there is nothing left for rice; he says he will work.
//   tondo    back on the street. He wonders where to find work, and the
//            savings quest opens: Mag-ipon ng pera na mai-bibigay kay
//            Nanay (0/100), which counts his barya.
//
// The savings step's flag is set by nothing yet, on purpose: the work
// that earns the barya, and handing it to Nanay, are the next passages
// to write. Until then Act I cannot complete, which is the same
// deliberate gap Blocks 19 to 36 used (CLAUDE.md, Act data format).
//
// The lines are the proponents' script as written, apostrophes
// straightened. The siga are stand-in stills (Block 52, made the way
// Block 41's were) until the artist draws them.
// =============================================================

// Block 49. The paintings of the street, laid along every road in order
// (game.js, buildPanelBackdrop), with a shadow tree over each join
// (Block 50). Block 53 added the fifth, tondo.jpg, the river village
// that had been only the fallback backdrop, so the street shows all
// five backgrounds end to end, each whole.
const STREET_PANELS = [
  "assets/backgrounds/act1/street-01.jpg",
  "assets/backgrounds/act1/street-02.jpg",
  "assets/backgrounds/act1/street-03.jpg",
  "assets/backgrounds/act1/street-04.jpg",
  "assets/backgrounds/act1/tondo.jpg",
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

// Block 53. Her walk: 8 frames made by _dev/tools/make-walk-cycle.py from
// the first frame of her sheet (the artist's pixels, moved: the feet
// step in turn, the body leans and dips, the hem kicks), 4 by 2.
// Measured with measure-sprite.js (45, 166); footX is her idle sheet's
// 127 rather than the 129 the tool reads, which the walk's lean pulls
// forward, so she does not shift sideways when she stops.
const NANAY_WALK = {
  src: "assets/sprites/characters/nanay-walk.png", frames: 8, fps: 10, columns: 4,
  contentTop: 45, contentHeight: 166, footX: 127,
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

window.ACT_1 = {
  number: 1,
  title: "Origins",
  titleTagalog: "Ang Pinagmulan ni Macario",

  // One chain, in story order, drawn as the quest log (Block 48): the
  // task in hand is the first step whose flag is not set.
  //
  //   1  set when the thought on the street ends (thinkingAboutWork).
  //   2  counts his barya toward 100 (countCurrency, Block 52). Its flag
  //      is set by nothing yet: earning the money and giving it to Nanay
  //      are still to be written, and until then Act I stays open.
  linearObjectives: true,
  objectives: [
    { id: "umuwi_kasama_nanay", label: "Umuwi kasama si Nanay",
      flag: "nagpasyangMagtrabaho" },
    { id: "mag_ipon", label: "Mag-ipon ng pera na mai-bibigay kay Nanay",
      flag: "naibigayAngIponKayNanay", countCurrency: 100 },
  ],

  // Block 52. The savings step counts barya, so the act's own barya for
  // finishing a step (acts.js, the drip) is switched off: otherwise the
  // count would move without the story paying him anything. The whole
  // performance award is still paid when Act I completes.
  objectiveCurrency: false,

  // The chain is the quest log, so there is nothing to add at the start.
  startingQuests: [],

  // Nobody to walk to yet. The guide (Block 42) is ready for the next
  // passage: an entry per place the story sends him.
  guide: [],

  scenes: [
    {
      // The id stays "tondo" so a save made before the rewrite lands on
      // the street rather than nowhere; the old kutsero, entablado and
      // lansangan ids fall back to this first scene too (game.js,
      // loadScene).
      id: "tondo",
      // Block 53. All five paintings, one panel each: 5 x 1450.
      worldWidth: STREET_PANELS.length * PANEL,
      panels: STREET_PANELS,
      panelSky: STREET_SKY,
      startX: STREET_SPOT,
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
      ],
      scripts: [
        { doneFlag: "nakitaAngMgaSiga", x: STREET_SPOT, facing: 1,
          run: openingOnTheStreet },
        { requiresFlag: "nakausapSiNanaySaBahay", doneFlag: "nagpasyangMagtrabaho",
          x: STREET_SPOT, facing: 1, run: thinkingAboutWork },
      ],
      npcs: [],
    },
    {
      // At home. The same street paintings, at the proponents' direction
      // (keep the background), one panel wide, so no tree stands in it.
      id: "bahay",
      worldWidth: 1450,
      panels: STREET_PANELS,
      panelSky: STREET_SKY,
      startX: 560,
      decorations: [
        { id: "nanay-bahay", x: 700, animation: NANAY },
      ],
      scripts: [
        { doneFlag: "nakausapSiNanaySaBahay", x: 560, facing: 1, run: talkAtHome },
      ],
      npcs: [],
    },
  ],
};
