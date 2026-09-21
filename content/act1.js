// =============================================================
// MACARIO — content/act1.js
//
// Act I is now two scenes and three quests, up from the one-NPC
// skeleton this file was reset to (see git history and TRACKER.md,
// Blocks done, for that reset and why). The story: Nanay sends
// Macario off to the entablado with something to hand to the
// kutsero, a man Macario worked for as a boy; on the way, he finds
// only the kutsero's horse and goes to buy it apples before he can
// go any further.
//
// The kutsero scene now plays out in full: Kabayo (hungry) sends
// Macario looking for money, Kutsero gives him barya and points him
// at Tindero, a hazard sits on the road between them, and Tindero's
// stall — at the far edge of the now-wider map — sells the one apple
// this quest needs. Bringing it back to Kabayo, at the gift button,
// completes the quest and fades back to tondo, ending the memory.
//
// The whole kutsero scene is a flashback, not the story's present —
// it plays out grey (greyFilter) precisely because it is memory, not
// now — so finishing it must not finish Act I: Macario is back in the
// story's present, still on his way to the entablado, not done with
// the act. A fourth objective, pumunta_entablado, exists for exactly
// this: nothing in this file ever sets its flag, which is what keeps
// checkObjectives from seeing all objectives done and ending Act I
// the moment the flashback resolves — the same deliberate trick Block
// 19 used to keep Act I from finishing two objectives early. Kabayo's
// gift adds it as an open quest on the way back to tondo, so the
// player's log reflects the same thing the objective counter does:
// there is still somewhere to go. Whatever scene depicts arriving at
// the entablado is the next piece of content this act needs; nothing
// here builds it yet.
//
// Block 31 added the conversations around the memory. Nanay's opening
// now starts with his money ("yung pera mo"). The memory opens with her
// voice the moment its fade-in ends, and closing it puts Macario back
// beside her for her reply before he sets off. Both are a scene's
// arrivalDialogues (CLAUDE.md, Act data format). Past her, further down
// a road that is now twice as long, the Mananahi waits with his stage
// costume.
//
// Block 32 made that a quest and the first equipment. Nanay's opening
// was rewritten so she hands him his money (200 barya) and brings up
// the kutsero before the memory cuts in; the return ends with her
// reminding him to see the Mananahi, which logs "Kausapin ang
// mananahi"; and talking to the Mananahi completes it and opens her
// shop, which sells the stage clothes (content/items.js) for 100.
//
// The engine gained the pieces of support this needed, documented in
// CLAUDE.md (Act data format, Decisions on record):
//   - a scene can declare greyFilter to desaturate the shared Tondo
//     backdrop rather than needing a second background asset
//   - Acts.gotoScene fades to black around a scene swap (fadeToScene,
//     game.js) instead of cutting instantly
//   - an NPC can declare opensShop: true to skip dialogue and open
//     Tindahan directly (Tindero, below)
//   - an NPC's gift can declare onComplete, the same shape a
//     dialogueSet's already has, for a gift that should do something
//     beyond setting its flag and its quest (Kabayo's, below, ends
//     the scene)
//   - an item can declare buyFlag, a story flag set in state.flags
//     the moment it is bought (content/items.js, "Mansanas para sa
//     kabayo"), since
//     Kabayo's gift button has no way to ask Inventory.owns()
//     directly
//
// Nanay has real commissioned art: assets/sprites/characters/nanay.png, a
// 5-column by 3-row sheet, 14 of its 15 cells used. See CLAUDE.md's
// Pitfalls for the quoting fix that was needed in game.js before a
// path with a space in it (this one) would actually render.
//
// contentTop/contentHeight on her animation def say where she actually
// sits within her 256px frame (measured from the art's alpha channel),
// so game.js's spriteFit scales and grounds her by her own drawn height
// rather than the frame's — see game.js, above loadSpriteSheet, and
// CLAUDE.md, Decisions on record, for why that matters: without it she
// and Macario were scaled and grounded by two different amounts of
// empty padding and never matched. footX, measured the same way, is
// where her feet are across the cell, which is the point game.js
// stands on the middle of her body (CLAUDE.md, Bodies, Block 24).
//
// Block 37, a placeholder pass written ahead of the source book and to be
// corrected against it: the moro-moro now ends with Maryam announcing the
// Christian kingdom's victory, her conversion and her marriage to Macario,
// which sets nasaEntablado at last. Outside, Bonifacio and a second
// Katipunero meet him at the stairs, exchange the password, and hand him
// pamphlets. The road out of tondo then leads to "lansangan", a long street
// with guards who shoot, no gun for Macario, and three people to give a
// pamphlet to. The third one finishes Act I, which runs the post-test.
//
// Kutsero, Kabayo and Tindero have real art in assets/sprites/characters/ (Block 33
// sorted out a Kutsero and Tindero mix-up in the file names). The
// Mananahi, Bonifacio, the Katipunero, the townspeople and the street's
// guards are stand-in stills (Block 41, STILL below) until theirs exist.
//
// Block 42, polish without changing the story. The act declares a guide
// (ACT_1.guide, below): an ordered list of where to go next, which the
// engine draws as an arrow over the target or a tab at the screen's edge,
// so a student always knows where the next conversation is. The
// lansangan grew to 11000px with ten citizens and eight guards, and a
// consistency pass tidied names and spelling (the Mananahi speaks as
// "Mananahi", the Kutsero's barya is paid once per save rather than once
// per visit, and every count in the dialogue matches the street).
// =============================================================

// =============================================================
// Block 37 script pieces, shared by more than one entry below (an arrival
// conversation and the NPC who carries the same lines for a reload), so
// each is written once. Plain top-level declarations: nothing here runs at
// parse time, and state, addQuest and the rest belong to game.js, which is
// loaded by the time any of these are called.
//
// PLACEHOLDER SCRIPT. Every line in this block was written ahead of the
// resource person's source book, to give the scenes a shape. Check each one
// against the book before the pilot, above all anything a student could
// take as fact: the password, who met Sakay, and what the pamphlets were.
// =============================================================

// The end of the moro-moro: the Christian kingdom wins, and the princess
// converts and marries the hero, which is how the form traditionally ends.
const PLAY_ENDING = [
  { speaker: "Maryam", text: "Mga manonood! Nagwagi ang kaharian ng mga Kristiyano!" },
  { speaker: "Maryam", text: "Mula ngayon, tatalikuran ko ang dati kong pananampalataya. Ako ay magpapabinyag." },
  { speaker: "Maryam", text: "At ako ay pakakasal kay Macario!" },
  { speaker: "Macario", text: "Mahal ko, wala nang hahadlang sa atin!" },
  { speaker: "Mga Manonood", text: "Mabuhay! Mabuhay ang magkasintahan!" },
  { speaker: "Mga Manonood", text: "(Hiyawan at palakpakan)" },
];

function endOfPlay() {
  state.flags.nasaEntablado = true;
  markDirty();
}

// Block 48. The moro-moro after Maryam's love scene, which Macario now
// starts by talking to her rather than it opening the moment he walks in.
// Moved here unchanged from the entablado's arrival dialogue (Block 35):
// the man walks on, the confrontation, the fight, the ending.
async function playMoroMoro() {
  // Fetched while the love scene is still being read, so the swap when
  // the fight starts is instant (Block 36).
  prepareMusic("assets/audio/music/intense.mp3");
  setCutscene(true);
  turnPlayer(1); // toward the sound
  showDecoration("muslim", true);
  await moveDecoration("muslim", 800, 200);
  await playDialogue([
    { speaker: "Muslim", text: "Anong ginagawa mo dito, Maryam? Bakit kasama mo ang Kafir na ito?!" },
    { speaker: "Maryam", text: "Hindi ikaw ang tunay kong mahal! Si Macario ang hinahanap ng puso ko!" },
    { speaker: "Muslim", text: "Mga guwardiya, kunin niyo ang puta, patayin niyo ang Kafir!" },
  ]);

  // He leaves the fighting to his guards, who come in from the same
  // wing, spaced so they arrive one after another.
  moveDecoration("muslim", 1300, 260).then(() => showDecoration("muslim", false));
  setCutscene(false);
  setMusic("assets/audio/music/intense.mp3");
  await spawnEnemies([1240, 1310, 1380, 1450, 1520].map((x, i) => ({
    id: "guwardiya-" + (i + 1),
    x,
    hp: 2,
    animation: MUSLIM_WALK,
    attackAnimation: MUSLIM_ATTACK,
  })));

  setMusic(null);
  state.flags.nagapiAngMgaGuwardiya = true;
  markDirty();
  showToast("Napatumba mo ang mga guwardiya!");

  await playDialogue(PLAY_ENDING);
  endOfPlay();
}

// Outside the entablado. Greeting, the password asked and answered, then
// the task. The costume line is what tells a student the stage clothes'
// effect (stillDetectionMult, content/items.js) is worth something now.
const KATIPUNAN_MEETING = [
  { speaker: "Bonifacio", text: "Macario! Mahusay ang pagganap mo kanina." },
  { speaker: "Macario", text: "Salamat, Andres. Hindi ko inaasahang manonood ka." },
  { speaker: "Katipunero", text: "Kapatid, saan ka nanggaling?" },
  { speaker: "Macario", text: "Sa dilim." },
  { speaker: "Katipunero", text: "At saan ka patungo?" },
  { speaker: "Macario", text: "Sa liwanag. Anak ng Bayan." },
  { speaker: "Bonifacio", text: "Mabuti. Ligtas tayong mag-usap." },
  { speaker: "Bonifacio", text: "May mga papel na kailangang makarating sa sampung kapatid sa kabilang lansangan." },
  { speaker: "Bonifacio", text: "Nagbabantay ang mga guardia civil doon. Iwan mo ang baril mo; hindi ito laban." },
  { speaker: "Katipunero", text: "Kung makita ka, tumigil ka lang. Suot ang damit pang-entablado, aakalain nilang artista ka lang na pauwi." },
  { speaker: "Katipunero", text: "Kung kailangan, umakyat ka. Ang bantay ay nakatingin sa daan, hindi sa itaas." },
  { speaker: "Macario", text: "Makakaasa kayo." },
];

// Block 40. The man in the moro-moro, and the five guards who share his
// sprite. Both sheets were delivered as JPEGs on black and keyed to PNGs
// with _dev/tools/key-black.py; the .jpg originals stay beside them. Numbers from
// _dev/tools/measure-sprite.js. The attack sheet's union box runs the full cell
// because the sword crosses into neighbouring cells, so its pair is the
// standing body (frames 0 to 3: top 30, feet at 126) and headroom 29 shows
// the sword raised above his head without drawing the stray tip that
// reaches row 0 of frame 9 from the frame above it. footX 88 is where he
// stands in the standing frames; the lunge frames move the sword, not
// the feet. One def serves every guard: loading a sheet only fills in the
// same measured geometry again.
const MUSLIM_WALK = { src: "assets/sprites/enemies/muslim-walk.png", frames: 12, fps: 10,
  columns: 4, contentTop: 43, contentHeight: 70, footX: 72 };
const MUSLIM_ATTACK = { src: "assets/sprites/enemies/muslim-attack.png", frames: 15, fps: 24,
  columns: 4, contentTop: 30, contentHeight: 97, footX: 88, headroom: 29 };

// Block 41. Stand-in stills for the characters the artist has not drawn
// yet, made by _dev/tools/make-placeholder-sprites.py from frames of the
// commissioned sheets (recoloured, with a prop or two), so they share the
// painted style. One frame each, measured with measure-sprite.js. Real
// art replaces them by dropping a sheet over the same file name and
// changing frames, columns and the three numbers here. Bantay's footX is
// the body's, 128; the tool reads 130 because his rifle butt is in the
// bottom rows it averages.
const STILL = {
  mananahi:   { src: "assets/sprites/characters/mananahi.png",   frames: 1, fps: 1,
                contentTop: 45, contentHeight: 166, footX: 128 },
  bonifacio:  { src: "assets/sprites/characters/bonifacio.png",  frames: 1, fps: 1,
                contentTop: 69, contentHeight: 121, footX: 128 },
  katipunero: { src: "assets/sprites/characters/katipunero.png", frames: 1, fps: 1,
                contentTop: 74, contentHeight: 117, footX: 128 },
  mamamayan:  { src: "assets/sprites/characters/mamamayan.png",  frames: 1, fps: 1,
                contentTop: 74, contentHeight: 117, footX: 128 },
  bantay:     { src: "assets/sprites/enemies/bantay.png",     frames: 1, fps: 1,
                contentTop: 69, contentHeight: 121, footX: 128 },
};

// Block 42. Ten people on the street, left to right, each waiting for one
// pamphlet. One table rather than ten calls, so the count in the quest
// line, the guide's list and the flags cannot disagree. The first three
// flags are Block 37's, kept so an older save still counts what it gave.
//
// PLACEHOLDER SCRIPT, like the rest of Block 37: every line below was
// written ahead of the source book. The trades are ordinary workers of
// Tondo, which is all the item bank commits to about who the Katipunan's
// members were (CLAUDE.md, Decisions on record).
const CITIZENS = [
  { id: "mangingisda", x: 450, label: "Mangingisda", flag: "nabigyanSiMangingisda",
    before: [
      { speaker: "Mangingisda", text: "Psst. Ikaw ba ang artista?" },
      { speaker: "Macario", text: "Anak ng Bayan." },
      { speaker: "Mangingisda", text: "Ah, kapatid. May dala ka ba para sa akin?" },
    ],
    thanks: "Salamat, kapatid. Babasahin ko ito mamayang gabi." },
  { id: "labandera", x: 1800, label: "Labandera", flag: "nabigyanSiLabandera",
    before: [
      { speaker: "Labandera", text: "Maraming bantay ngayon. Mag-ingat ka." },
      { speaker: "Macario", text: "Anak ng Bayan." },
      { speaker: "Labandera", text: "Kapatid! Iabot mo na, bago may makakita." },
    ],
    thanks: "Itatago ko ito sa mga labada. Walang maghahanap doon." },
  { id: "kargador", x: 3500, label: "Kargador", flag: "nabigyanSiKargador",
    before: [
      { speaker: "Kargador", text: "Mabigat ang pasan ko. Mas mabigat yata ang dala mo." },
      { speaker: "Macario", text: "Anak ng Bayan." },
      { speaker: "Kargador", text: "Kapatid. Isingit mo sa mga sako." },
    ],
    thanks: "Walang bantay na maghahalughog ng sako ng bigas. Salamat." },
  { id: "tindera", x: 5100, label: "Tindera", flag: "nabigyanSiTindera",
    before: [
      { speaker: "Tindera", text: "Bili na, bili na! ... Ay, ikaw pala." },
      { speaker: "Macario", text: "Anak ng Bayan." },
      { speaker: "Tindera", text: "Kapatid, ilagay mo sa ilalim ng bilao." },
    ],
    thanks: "Mababasa ito ng bawat suki ko. Salamat, kapatid." },
  { id: "panday", x: 6650, label: "Panday", flag: "nabigyanSiPanday",
    before: [
      { speaker: "Panday", text: "Mainit dito sa pandayan. Ano ang kailangan mo?" },
      { speaker: "Macario", text: "Anak ng Bayan." },
      { speaker: "Panday", text: "Kapatid. Akin na, bago bumalik ang bantay." },
    ],
    thanks: "Itatago ko ito sa ilalim ng palihan. Salamat." },
  { id: "sapatero", x: 8250, label: "Sapatero", flag: "nabigyanSiSapatero",
    before: [
      { speaker: "Sapatero", text: "Sira ba ang sapatos mo, o may iba kang dala?" },
      { speaker: "Macario", text: "Anak ng Bayan." },
      { speaker: "Sapatero", text: "Ah, kapatid. Iabot mo nang mabilis." },
    ],
    thanks: "Isisingit ko ito sa bawat sapatos na aayusin ko." },
  { id: "tabakera", x: 9050, label: "Tabakera", flag: "nabigyanSiTabakera",
    before: [
      { speaker: "Tabakera", text: "Galing ako sa pagawaan ng tabako. Pagod na kami roon." },
      { speaker: "Macario", text: "Anak ng Bayan." },
      { speaker: "Tabakera", text: "Kapatid! Marami kaming naghihintay nito." },
    ],
    thanks: "Ipapasa ko ito sa mga kasama ko sa pagawaan." },
  { id: "panadero", x: 10300, label: "Panadero", flag: "nabigyanSiPanadero",
    before: [
      { speaker: "Panadero", text: "Mainit pa ang pandesal. Pero hindi iyan ang hanap mo, ano?" },
      { speaker: "Macario", text: "Anak ng Bayan." },
      { speaker: "Panadero", text: "Kapatid. Isasama ko sa bilao ng tinapay." },
    ],
    thanks: "Kasama ng tinapay, darating ito sa bawat bahay." },
  { id: "manghahabi", x: 10550, label: "Manghahabi", flag: "nabigyanSiManghahabi",
    before: [
      { speaker: "Manghahabi", text: "Mahaba pa ang hinahabi ko. Sino ka?" },
      { speaker: "Macario", text: "Anak ng Bayan." },
      { speaker: "Manghahabi", text: "Kapatid, ikaw pala. Iabot mo rito." },
    ],
    thanks: "Isisingit ko ito sa mga tela. Salamat, kapatid." },
  { id: "karpintero", x: 10800, label: "Karpintero", flag: "nabigyanSiKarpintero",
    before: [
      { speaker: "Karpintero", text: "Nakalampas ka sa mga bantay? Magaling." },
      { speaker: "Macario", text: "Anak ng Bayan." },
      { speaker: "Karpintero", text: "Kapatid. Ako ang huli sa daan mo, hindi ba?" },
    ],
    thanks: "Ipapasa ko ito sa mga kasama ko sa talyer. Salamat, kapatid." },
];

const PAMPHLET_FLAGS = CITIZENS.map((c) => c.flag);

// Block 49. Four new paintings of the Tondo street, laid along every road
// in order and repeated when a road is longer than four (game.js,
// buildPanelBackdrop), with a coconut palm over each join. Block 45's
// single repeated Tondo.png and Block 43's eight paintings are both gone.
const STREET_PANELS = [
  "assets/backgrounds/act1/street-01.png",
  "assets/backgrounds/act1/street-02.png",
  "assets/backgrounds/act1/street-03.png",
  "assets/backgrounds/act1/street-04.png",
];

// Block 46. A picture stands whole on the floor instead of running down
// behind the dirt strip, so on a screen taller than it the strip of sky
// above is this colour: the average of the four paintings' top rows, so
// their own sky simply carries on upward.
const STREET_SKY = "#51a6ea";

// The meeting is done: the pamphlet step becomes the task in hand. The
// quest log follows the flag (Block 48); nothing here writes to it.
function katipunanTask() {
  state.flags.nakausapAngKatipunan = true;
  markDirty();
}

// A citizen's gift has just been handed over, so its flag is already set
// (endDialogue, game.js). Counts every flag rather than adding one, so the
// order they are reached in does not matter and a reload cannot miscount.
// The last finishes the objective, and with it Act I.
// The quest line's count comes from the objective's countFlags (Block 48).
function givePamphlet() {
  const n = PAMPHLET_FLAGS.filter((f) => state.flags[f]).length;
  if (n >= PAMPHLET_FLAGS.length) {
    state.flags.naipamahagiAngPolyeto = true;
    showToast("Naipamahagi mo ang lahat ng polyeto!");
  } else {
    showToast("Polyeto: " + n + " sa " + PAMPHLET_FLAGS.length);
  }
  markDirty();
}

// One citizen: talks before and after, and takes a pamphlet through the
// gift button (Iabot ang polyeto), the same mechanism Kabayo's apple uses.
// All ten share one stand-in still until the artist says otherwise.
function citizen({ id, x, label, flag, before, thanks }) {
  thanks = [{ speaker: label, text: thanks }];
  return {
    id, x, label,
    animation: STILL.mamamayan,
    stage: 0,
    dialogueSets: [
      { skipIfFlag: flag, lines: before, onComplete: () => {} },
      { lines: thanks, onComplete: () => {} },
    ],
    gift: {
      buttonLabel: "Iabot ang polyeto",
      requiresFlag: "nakausapAngKatipunan",
      givenFlag: flag,
      responseLines: [
        { speaker: "Macario", text: "Anak ng Bayan. Para sa iyo ito, kapatid." },
        thanks[0],
      ],
      onComplete: givePamphlet,
    },
  };
}

window.ACT_1 = {
  number: 1,
  title: "Origins",
  titleTagalog: "Ang Pinagmulan ni Macario",

  // Block 48. Act I's objectives are one chain, in the order the story
  // plays them, and the quest log is drawn from it (linearObjectives,
  // game.js): the task in hand is the first step whose flag is not set,
  // finished steps go under "Tapos na". Every step is something the
  // student does, named for who or where, and the story gates each one
  // behind the one before (the Kutsero talks about the horse until
  // Macario has seen it, the apple is on sale only while buying it is the
  // task, the entablado stays shut until the Mananahi, the play waits for
  // Maryam), so the chain cannot be finished out of order.
  //
  // Nothing in this file calls addQuest or completeQuest any more; each
  // step is done when its flag is set. Pumunta sa trabaho is gone: it
  // finished the moment Nanay stopped talking, before Macario went
  // anywhere. His job now starts when he talks to Maryam on the stage.
  //
  // Eleven objectives make the currency drip floor(50 / 11) = 4 barya
  // each, the remainder paid on completion (CLAUDE.md, Decisions on
  // record).
  linearObjectives: true,
  objectives: [
    { id: "kausapin_nanay", label: "Kausapin si Nanay", flag: "nakausapKayNanay" },
    // The memory.
    { id: "lapitan_kabayo", label: "Lapitan ang kabayo", flag: "nakitaAngKabayo" },
    { id: "humingi_barya", label: "Humingi ng barya sa Kutsero", flag: "nakahingiNgBarya" },
    { id: "bumili_mansanas", label: "Bumili ng mansanas sa Tindero", flag: "binilhAngMansanas" },
    { id: "bilhan_mansanas", label: "Ibigay ang mansanas sa kabayo", flag: "binilhanNgMansanasAngKabayo" },
    // Back in tondo. Buying the clothes is not required: the act should
    // not be locked behind a purchase (CLAUDE.md, the no-game-over rule).
    { id: "kausapin_mananahi", label: "Kausapin ang Mananahi", flag: "nakausapAngMananahi" },
    // The job.
    { id: "pumunta_entablado", label: "Pumunta sa entablado", flag: "nakapasokSaEntablado" },
    { id: "kausapin_maryam", label: "Kausapin si Maryam", flag: "nakausapSiMaryam" },
    { id: "tapusin_dula", label: "Tapusin ang dula", flag: "nasaEntablado" },
    // Block 37's placeholder ending.
    { id: "kausapin_katipunan", label: "Kausapin si Bonifacio sa labas", flag: "nakausapAngKatipunan" },
    { id: "ipamahagi_polyeto", label: "Ipamahagi ang mga polyeto", flag: "naipamahagiAngPolyeto",
      countFlags: PAMPHLET_FLAGS },
  ],

  // The chain is the quest log, so there is nothing to add at the start.
  startingQuests: [],

  // Block 42, following Block 48's chain. Where to go next, for the guide
  // (game.js, updateGuide). The first entry whose scene and conditions
  // hold is the target; within a scene the later steps come first.
  guide: [
    // tondo, at the start: his mother.
    { scene: "tondo", unlessFlag: "nakausapKayNanay", npc: "nanay" },
    // After the meeting: the road out to the street.
    { scene: "tondo", requiresFlag: "nakausapAngKatipunan",
      unlessFlag: "naipamahagiAngPolyeto", exit: "tumuloy-lansangan",
      label: "Lansangan" },
    // After the play, for a student who reloaded before the meeting opened.
    { scene: "tondo", requiresFlag: "nasaEntablado", npc: "bonifacio" },
    // After the tailor: the stage.
    { scene: "tondo", requiresFlag: "nakausapAngMananahi", exit: "pasok-entablado",
      label: "Entablado" },
    // Back from the memory: the tailor.
    { scene: "tondo", requiresFlag: "binilhanNgMansanasAngKabayo", npc: "mananahi" },

    // The memory: the horse, the kutsero, the stall, and back to the horse.
    { scene: "kutsero", requiresFlag: "binilhAngMansanas", npc: "kabayo" },
    { scene: "kutsero", requiresFlag: "nakahingiNgBarya", npc: "tindero" },
    { scene: "kutsero", requiresFlag: "nakitaAngKabayo", npc: "kutsero" },
    { scene: "kutsero", npc: "kabayo" },

    // The stage: Maryam until the play is won, then the way out.
    { scene: "entablado", requiresFlag: "nasaEntablado",
      exit: "lumabas-entablado", label: "Labas" },
    { scene: "entablado", unlessFlag: "nagapiAngMgaGuwardiya", npc: "maryam" },

    // The street: whichever citizen still waiting is nearest.
    { scene: "lansangan", unlessFlag: "naipamahagiAngPolyeto",
      npcs: CITIZENS.map((c) => c.id) },
  ],

  scenes: [
    {
      id: "tondo",
      // Widened in Block 31 from one screen (1176) to hold the road the
      // Mananahi stands on, and again in Block 34 to 2900 so the entablado
      // stands at the end of it, clear of her.
      worldWidth: 2900,
      // Block 49. The first two paintings, a palm over the join at 1450
      // (game.js, PANEL_WIDTH).
      panels: STREET_PANELS,
      panelSky: STREET_SKY,
      // Block 34. The outside of the entablado, as scenery. Its picture has
      // a transparent background, measured the way a sprite is (the
      // drawing's alpha box, feet at the bottom of the stairs), drawn 400px
      // tall: about three people, the height a building reads beside
      // them. Macario walks in front of it (#player is above decorations).
      decorations: [
        {
          id: "entablado-labas",
          x: 2400,
          displayHeight: 400,
          animation: {
            src: "assets/backgrounds/act1/entablado-outside.png", frames: 1, fps: 1,
            contentTop: 14, contentHeight: 914, footX: 835,
          },
        },
      ],
      // The door is the stairs, in the middle of the building. Not gated on
      // any flag: nothing inside has story yet, and pumunta_entablado's
      // flag is still set by nothing, so going in does not finish Act I.
      exits: [
        // Block 48. Shut until the Mananahi, the step before it, so the
        // play cannot start ahead of the story.
        { id: "pasok-entablado", x: 2330, width: 140, label: "Pasok",
          toScene: "entablado", requiresFlag: "nakausapAngMananahi" },
        // Block 37. The end of the road, open only once the Katipunan has
        // given Macario the pamphlets. Same Tondo backdrop on the other
        // side, through the usual fade.
        { id: "tumuloy-lansangan", x: 2780, width: 120, label: "Tumuloy",
          toScene: "lansangan", requiresFlag: "nakausapAngKatipunan" },
      ],
      startX: 80,
      // Block 31. The moment the flashback ends, back in the present,
      // Macario is standing with his mother and she answers the memory.
      // requiresFlag is the apple given to Kabayo, which is what sends
      // him back here; doneFlag keeps it to that one return.
      arrivalDialogues: [
        {
          requiresFlag: "binilhanNgMansanasAngKabayo",
          doneFlag: "nakabalikMulaSaAlaala",
          x: 210, // Nanay's body starts at 300, so a 50px gap, facing her
          facing: 1,
          lines: [
            { speaker: "Macario", text: "Naaalala mo pa pala 'yon, Nay?" },
            { speaker: "Nanay", text: "Aba'y siyempre, matanda na ako pero hindi ako ulyanin!" },
            { speaker: "Nanay", text: "... Saan ka nga ulit pupunta?" },
            { speaker: "Macario", text: "Hahaha" },
            { speaker: "Macario", text: "Kailangan ko nang pumunta sa trabaho, Nay. Hinihintay na ako ng mga kapwa ko artista." },
            { speaker: "Nanay", text: "O sige, mag-ingat ka ha!" },
            // Block 32. The errand to the tailor, and the quest it gives.
            { speaker: "Nanay", text: "'Wag mong kalimutang dumaan sa mananahi para sa damit mo." },
            { speaker: "Macario", text: "Opo, Nay." },
          ],
          // The next step, the Mananahi, is already the task in hand: the
          // apple given to Kabayo is what finished the one before it.
          onComplete: () => {},
        },
        // Block 37. Out of the entablado after the play: Bonifacio and a
        // second Katipunero are waiting at the stairs. Plays once, through
        // the fade out of the entablado; a student who reloads before it
        // opens gets the same conversation from Bonifacio (below).
        {
          requiresFlag: "nasaEntablado",
          doneFlag: "nakausapAngKatipunan",
          x: 2180, // the stairs; Katipunero's body ends at 2090
          facing: -1,
          lines: KATIPUNAN_MEETING,
          onComplete: katipunanTask,
        },
      ],
      npcs: [
        {
          id: "nanay",
          x: 300,
          label: "Nanay",
          stage: 0,
          animation: {
            src: "assets/sprites/characters/nanay.png", frames: 14, fps: 6, columns: 5,
            contentTop: 45, contentHeight: 166, footX: 127,
          },
          dialogueSets: [
            {
              // Once the trip to work has started, this beat has happened
              // and she moves on to her second set, including after the
              // flashback returns Macario here (game.js, startDialogue).
              skipIfFlag: "nasaDaanPatungoSaTrabaho",
              lines: [
                // Block 32 script. She hands over his money (200 barya,
                // paid in onComplete), mentions the kutsero, and the memory
                // cuts him off.
                { speaker: "Nanay", text: "Macario, anak, 'yung pera mo." },
                { speaker: "Macario", text: "Salamat, Nay." },
                { speaker: "Nanay", text: "Hinahanap ka nung kutserong naghatid sa akin dito. Kumusta ka na raw." },
                { speaker: "Macario", text: "Nay, mauuna na ako. Medyo huli na ako sa trabaho, eh." },
                { speaker: "Nanay", text: "Naaalala mo ba nung nagtrabaho ka sa kaniya?" },
                { speaker: "Macario", text: "Nay, huli na 'ho ak-" },
              ],
              // Cut off mid-sentence, on purpose — Nanay's errand pulls
              // him away before he finishes. The fade and scene change
              // are the rest of the beat, not a separate player action,
              // so both quests complete here rather than waiting on
              // anything else.
              //
              // firstTime guards the scene change only, not the flags or
              // the quest log: buildNpcs() resets every NPC's stage to 0
              // on every scene load (see game.js), which is exactly what
              // lets this same dialogueSet play again if the player ever
              // returns to tondo — Kabayo's gift now sends them back here
              // once the memory ends. Without the guard, walking up to
              // Nanay a second time would fade back into the kutsero
              // scene all over again; with it, she just repeats herself,
              // same as any other NPC with nothing new to say.
              onComplete: () => {
                const firstTime = !state.flags.nasaDaanPatungoSaTrabaho;
                state.flags.nakausapKayNanay = true;
                // Kept, though no objective reads it since Block 48: it is
                // what skips this set on a later visit.
                state.flags.nasaDaanPatungoSaTrabaho = true;
                // "yung pera mo": his money, 200 barya, once. It is what
                // pays the Mananahi's 100 later, and the firstTime guard
                // is what stops a second visit paying it again.
                if (firstTime && window.Game) Game.addCurrency(200);
                markDirty();
                if (firstTime && window.Acts) Acts.gotoScene("kutsero");
              },
            },
            {
              // Holds here on every later visit, same as before.
              lines: [
                { speaker: "Nanay", text: "Mag-ingat ka lagi, anak." },
                { speaker: "Macario", text: "Opo, Nay." },
              ],
              onComplete: () => {},
            },
          ],
        },

        {
          // Block 31. Down the road toward the entablado, met only after
          // the flashback: before it, Macario has not yet been sent on his
          // way, and asking after a stage costume would come out of
          // order. Hidden until the apple is given to Kabayo, which is set
          // before the fade back to this scene, so buildNpcs already draws
          // her when tondo is rebuilt (and on any reload after).
          //
          // Drawn from a stand-in still (Block 41) until the artist's
          // Mananahi.png replaces it; see STILL above.
          //
          // Block 32. The first conversation completes the tailor quest and
          // ends straight into her shop (opensShopAfter), which stocks only
          // what names her as soldBy in content/items.js: the stage clothes,
          // 100 barya. After that, E opens the shop directly.
          id: "mananahi",
          x: 1500,
          label: "Mananahi",
          animation: STILL.mananahi,
          startsHidden: true,
          revealedByFlag: "binilhanNgMansanasAngKabayo",
          opensShopAfter: "nakausapAngMananahi",
          stage: 0,
          dialogueSets: [
            {
              onComplete: () => {
                state.flags.nakausapAngMananahi = true;
                markDirty();
              },
              lines: [
                { speaker: "Mananahi", text: "O, kumusta ka na, Macario? Ang laki-laki mo na!" },
                { speaker: "Macario", text: "Ayos lang naman. Heto, buhay pa rin." },
                { speaker: "Mananahi", text: "Magpagupit ka na! Nagmumukha ka nang dalaga." },
                { speaker: "Macario", text: "Hahaha, saka na. Malay natin, ganahan ako." },
                { speaker: "Macario", text: "Nandiyan na ba 'yung damit ko para sa entablado?" },
                { speaker: "Mananahi", text: "Oo, pero bayad muna, hehe..." },
              ],
            },
          ],
        },

        {
          // Block 37. Waiting outside the entablado once the play is over.
          // A stand-in still until real art exists (Block 41).
          id: "bonifacio",
          x: 1900,
          label: "Bonifacio",
          animation: STILL.bonifacio,
          startsHidden: true,
          revealedByFlag: "nasaEntablado",
          stage: 0,
          dialogueSets: [
            {
              // The meeting itself, for the student who reloaded before
              // the arrival conversation could open. Skipped once it has
              // happened either way.
              skipIfFlag: "nakausapAngKatipunan",
              lines: KATIPUNAN_MEETING,
              onComplete: () => {
                state.flags.nakausapAngKatipunan = true;
                katipunanTask();
              },
            },
            {
              lines: [
                { speaker: "Bonifacio", text: "Sa dulo ng daan, tumuloy ka. Sampung kapatid ang naghihintay." },
                { speaker: "Bonifacio", text: "Huwag kang magpapakita sa mga bantay." },
              ],
              onComplete: () => {},
            },
          ],
        },

        {
          // The second Katipunero, unnamed until the source says who.
          // A stand-in still until real art exists (Block 41).
          id: "katipunero",
          x: 2010,
          label: "Katipunero",
          animation: STILL.katipunero,
          startsHidden: true,
          revealedByFlag: "nasaEntablado",
          stage: 0,
          dialogueSets: [
            {
              lines: [
                { speaker: "Katipunero", text: "Kay Andres ka makipag-usap, kapatid." },
              ],
              skipIfFlag: "nakausapAngKatipunan",
              onComplete: () => {},
            },
            {
              lines: [
                { speaker: "Katipunero", text: "Kung makita ka ng bantay, tumigil ka lang. Isa ka lang artistang pauwi." },
                // Block 42. The street's seventh guard stands with his back to
                // the road, the one place a takedown is the plain answer.
                { speaker: "Katipunero", text: "At kung nakatalikod ang bantay, lapitan mo at patumbahin mula sa likod." },
              ],
              onComplete: () => {},
            },
          ],
        },
      ],
    },

    {
      // Same backdrop as tondo (#skyline is not per-scene art; see
      // CLAUDE.md, Act data format), but greyFilter desaturates it —
      // the trip to the kutsero, playing out as a memory. Wider than
      // tondo: it now holds four points of interest end to end rather
      // than one.
      id: "kutsero",
      worldWidth: 2150,
      // Block 49. The same street, greyed with the rest of the memory;
      // one palm at 1450, between the glass and the Tindero.
      panels: STREET_PANELS,
      panelSky: STREET_SKY,
      startX: 80,
      greyFilter: true,
      // Block 31. Nanay's voice carries into the memory, opening it the
      // moment the fade-in ends. Once only, so a later visit (none today)
      // would not replay it.
      arrivalDialogues: [
        {
          doneFlag: "nagsimulaAngAlaala",
          lines: [
            { speaker: "Nanay", text: "Ilang taon ka nga noon?..." },
          ],
        },
      ],
      hazards: [
        // Between Kutsero and Tindero, not before Kutsero — the errand
        // itself is safe, the road to the stall is not. Declaring this
        // is also what makes the scene "dangerous" and shows the
        // hearts; see CLAUDE.md, Act data format.
        { x: 1300, width: 100, reason: "Natapakan mo ang bubog!" },
      ],
      npcs: [
        {
          id: "kabayo",
          x: 300,
          label: "Kabayo",
          // Real art (Block 30): a single strip of 22 frames, 32px cells,
          // a grazing loop that starts and ends with his head up. Measured
          // with _dev/tools/measure-sprite.js. It warns that the grazing frames
          // are shorter than the union; that is his head going down, not
          // a mis-scaled pose, so the union pair is the right one: it
          // keeps his raised ears inside the box. He is drawn facing left,
          // toward Macario, who enters from the left of this scene.
          // At DISPLAY_HEIGHT a 32px cell is scaled about four and a half
          // times, which is what switches bodySprite to pixelated scaling.
          animation: {
            src: "assets/sprites/characters/kabayo.png", frames: 22, fps: 8,
            contentTop: 2, contentHeight: 30, footX: 19,
          },
          // Loops while Macario is within talking range and fades out
          // when he leaves (game.js, updateNearSounds).
          nearSound: "assets/audio/sfx/horse.mp3",
          stage: 0,
          dialogueSets: [
            {
              lines: [
                { speaker: "Kabayo", text: "Neighh" },
                { speaker: "Macario", text: "Gutom ka na ba? Saglit lang ha, ibibili muna kita ng mansanas." },
              ],
              // Block 48. Seeing the horse is the first step of the memory.
              onComplete: () => {
                state.flags.nakitaAngKabayo = true;
                markDirty();
              },
            },
          ],
          // The gift button appears the moment "Mansanas para sa kabayo" is bought
          // (Inventory buy() sets buyFlag — see content/items.js) and
          // stays until it is used. onComplete runs after the flag and
          // the quest are both set, same order endDialogue already
          // uses for a plain dialogueSet, and is what actually ends
          // the memory: without it, the flag alone would finish Act I
          // in the background while the player was still standing next
          // to Kabayo in a greyed-out scene.
          gift: {
            buttonLabel: "Ibigay ang mansanas",
            requiresFlag: "binilhAngMansanas",
            givenFlag: "binilhanNgMansanasAngKabayo",
            responseLines: [
              { speaker: "Macario", text: "Heto, kumain ka na." },
              { speaker: "Kabayo", text: "Neighh!" },
            ],
            // The flashback resolving, not the act. "Mansanas para sa
            // kabayo" is a quest item (content/items.js, Block 25), and
            // this is the moment it is handed over, Inventory.consume.
            // It is a different item from the Mansanas a student can
            // eat, so eating apples can never use this one up. Then back
            // to the story's present.
            onComplete: () => {
              if (window.Inventory) Inventory.consume("mansanas-kabayo");
              if (window.Acts) Acts.gotoScene("tondo");
            },
          },
        },

        {
          id: "kutsero",
          x: 750,
          label: "Kutsero",
          // Real art. Block 27 wired in a sheet that turned out to be the
          // Tindero, saved under this name by mistake; Block 33 has the
          // real kutsero (straw hat, sash): a 5 by 3 sheet, 12 of its 15
          // cells used, measured with _dev/tools/measure-sprite.js. Front-facing,
          // so no facing to get wrong from either side.
          animation: {
            src: "assets/sprites/characters/kutsero.png", frames: 12, fps: 6, columns: 5,
            contentTop: 74, contentHeight: 117, footX: 128,
          },
          stage: 0,
          dialogueSets: [
            {
              // Block 48. Before Macario has seen the horse, the Kutsero
              // sends him to it, so the barya is asked for with a reason.
              // Picked by flags each time (game.js, requiresFlag).
              skipIfFlag: "nakitaAngKabayo",
              lines: [
                { speaker: "Kutsero", text: "O, Macario! Nakita mo na ba ang kabayo ko? Mukhang gutom na siya." },
              ],
              onComplete: () => {},
            },
            {
              // Block 42. Skipped once the barya has been given, so leaving
              // the memory and reloading back into it cannot pay twice.
              requiresFlag: "nakitaAngKabayo",
              skipIfFlag: "nakahingiNgBarya",
              lines: [
                { speaker: "Macario", text: "Kutsero, pahingi po ng barya. Ibibili ko lang ng mansanas si Kabayo." },
                { speaker: "Kutsero", text: "O, heto, Macario. 'Yung malaking mansanas, doon sa Tindero sa dulo ng daan." },
              ],
              // +10 barya, straight through the currency facade
              // (Game.addCurrency) — the same call acts.js uses to pay
              // out objectives, just triggered from a conversation
              // instead. Guarded on window.Game the way every other
              // content onComplete guards on window.Acts.
              // Block 42. The flag is what the guide reads to send Macario on
              // to the Tindero, and what keeps the barya to one payment.
              onComplete: () => {
                const firstTime = !state.flags.nakahingiNgBarya;
                state.flags.nakahingiNgBarya = true;
                if (firstTime && window.Game) Game.addCurrency(10);
                markDirty();
              },
            },
            {
              // Holds here on later visits so the barya is not paid out
              // twice — see Nanay's dialogueSets for the same pattern
              // and why it matters (buildNpcs resets stage on load, but
              // not mid-visit, so this only ever matters within one
              // stay in the scene, which is the only time it needs to).
              lines: [
                { speaker: "Kutsero", text: "Nasa iyo na ang barya. Pumunta ka na sa Tindero, nasa dulo ng daan." },
              ],
              onComplete: () => {},
            },
          ],
        },

        {
          // "Pressing E simply opens up Tindahan" — no dialogue at all,
          // so no dialogueSets: opensShop is checked before dialogueSets
          // would ever be read (see game.js, handleInteractPress and
          // the interact-label branch). Placed at the far edge of the
          // widened map.
          id: "tindero",
          x: 1950,
          label: "Tindero",
          // Block 33. The sheet Block 27 shipped as Kutsero.png, renamed by
          // the artist to what it always was: 5 by 3, 14 of 15 cells, the
          // same numbers it was measured with then (remeasured, unchanged).
          animation: {
            src: "assets/sprites/characters/tindero.png", frames: 14, fps: 6, columns: 5,
            contentTop: 69, contentHeight: 121, footX: 128,
          },
          opensShop: true,
        },
      ],
    },
    {
      // Block 34. Inside the entablado. Entablado.png is one painting of the
      // stage, curtains and backdrop included, so the scene brings it as its
      // own backdrop, drawn once rather than tiled, and hides the dirt strip
      // because the painting has its own wooden floor. One phone screen
      // wide. No story here yet; the only thing to do is leave, and leaving
      // puts Macario back at the stairs outside rather than at the start of
      // the road.
      //
      // Block 35. The moro-moro. Maryam is on stage when Macario walks in and
      // the love scene opens by itself (arrivalDialogues). A man walks on
      // from the right, the confrontation plays, he calls the guards and
      // walks off, and five guards come in from the wings to fight. Beating
      // them sets nagapiAngMgaGuwardiya. Until then every entry through the
      // door plays the scene again (unlessFlag), which is also what happens
      // after a reload in the middle of it: the fight is not saved, the
      // flag that says it was won is.
      //
      // Maryam is a decoration: she only stands and speaks through the
      // script, and a decoration can do both without the E-to-talk an NPC
      // would bring. The man and his guards share one walk sheet and one
      // attack sheet (Block 40): there is no separate guard picture.
      //
      // Block 37. Winning the fight is not the end of the play any more:
      // Maryam announces the Christian kingdom's victory, her conversion and
      // her marriage to Macario, the audience cheers, and that sets
      // nasaEntablado, the objective this scene exists for.
      id: "entablado",
      worldWidth: 1176,
      startX: 700,
      backdrop: { src: "assets/backgrounds/act1/entablado-inside.png" },
      ground: false,
      npcs: [
        {
          // Block 48. Maryam is someone to talk to now, not scenery: the
          // play starts when Macario speaks to her, not the moment he walks
          // in. maryam.png (was Muslim_Girl.png): 5 by 3, 13 frames,
          // measured with measure-sprite.js, drawn facing right, toward
          // where he comes from. Her body is 290 to 370, so she stands
          // where the decoration stood (330). The love scene is her first
          // conversation and replays on every visit until the fight is won
          // (the fight is not saved, the flag that says it was won is).
          id: "maryam",
          x: 290,
          label: "Maryam",
          animation: {
            src: "assets/sprites/characters/maryam.png", frames: 13, fps: 6, columns: 5,
            contentTop: 73, contentHeight: 117, footX: 128,
          },
          stage: 0,
          dialogueSets: [
            {
              skipIfFlag: "nagapiAngMgaGuwardiya",
              lines: [
                { speaker: "Maryam", text: "O Macario, bagama't iniibig kita, hindi tayo puwedeng magsama." },
                { speaker: "Maryam", text: "Hindi puwedeng magsama ang Muslim na babae at ang Kristiyanong lalaki..." },
                { speaker: "Macario", text: "Hindi ito maaari, mahal ko! Gagawin ko ang lahat, magsama lang tayo!" },
                { speaker: "Maryam", text: "Hindi ko kaya kung ikaw ay mawawala, Macario!" },
                { speaker: "Macario", text: "..." },
                { speaker: "Maryam", text: "Ano iyon?" },
              ],
              onComplete: () => {
                state.flags.nakausapSiMaryam = true;
                markDirty();
                playMoroMoro();
              },
            },
            {
              lines: [
                { speaker: "Maryam", text: "Ang galing mo kanina, Macario. Hinihintay ka na yata sa labas." },
              ],
              onComplete: () => {},
            },
          ],
        },
      ],
      decorations: [
        {
          // Block 40. Real art: the walk sheet the artist delivered as
          // Muslim_Walk.jpg, keyed to a transparent PNG (_dev/tools/key-black.py)
          // and measured with measure-sprite.js. It steps only while he is
          // walking (walkOnly) and turns to face the way he walks
          // (faceMovement), so he walks on facing Maryam and Macario, stands
          // still to speak, and turns to walk off.
          id: "muslim",
          x: 1300, // off stage, in the right wing
          hidden: true,
          walkOnly: true,
          faceMovement: true,
          animation: MUSLIM_WALK,
        },
      ],
      arrivalDialogues: [
        {
          // Block 48. Walking in no longer starts the play. Macario says
          // who he is looking for, from the right of the stage, and the
          // student walks to Maryam to begin. Once only.
          doneFlag: "nakapasokSaEntablado",
          x: 700,
          facing: -1,
          lines: [
            { speaker: "Macario", text: "Nahuli ba ako? Kailangan kong makausap si Maryam bago magsimula ang dula." },
          ],
        },
        // Block 37. A student who won the fight on an earlier build, or who
        // reloaded between the last guard falling and Maryam's lines, walks
        // in to the ending instead of nothing. doneFlag is nasaEntablado
        // itself, so the ending plays once however it is reached.
        {
          requiresFlag: "nagapiAngMgaGuwardiya",
          doneFlag: "nasaEntablado",
          x: 440,
          facing: -1,
          lines: PLAY_ENDING,
          onComplete: endOfPlay,
        },
      ],
      exits: [
        { id: "lumabas-entablado", x: 0, width: 80, label: "Lumabas",
          toScene: "tondo", toX: 2180, toFacing: -1 },
      ],
    },

    {
      // Block 37, rebuilt in Block 42. The street past the end of the tondo
      // road: the same Tondo backdrop, reached through the usual fade, long
      // on purpose (11000px, about four tondo roads) so the errand takes
      // real time.
      //
      // Macario carries pamphlets for the Katipunan, and ten people along
      // the road are waiting for one each (CITIZENS, above). Eight guards
      // watch the road and turn hostile when their meter fills (shoots:
      // true, game.js); he has no gun here (noRanged), so the ways past are
      // to stay out of sight on a platform, to take a guard down from
      // behind, to run, or to stand still and trust the stage clothes,
      // which slow a guard's meter to a fifth while he does.
      //
      // The road teaches one thing per stretch, then mixes them:
      //   the Mangingisda stands before any guard: the first pamphlet is
      //     given in safety, so the gift button is learned before the
      //     danger is.
      //   1 patrols under a low, wide platform: climb and wait.
      //   2 patrols a stretch with a small high ledge (and a heart) above
      //     it, with a short sight, so a student in the stage clothes who
      //     freezes can let him walk past.
      //   3 is a sentry facing the way Macario comes, under a long walkway:
      //     go over him and drop down behind.
      //   4 patrols quicker, with a platform in the middle of his beat.
      //   5 and 6 patrol toward each other over one shared platform (with a
      //     heart): wait up there until both have turned away.
      //   7 is a sentry with his back turned: walk up and take him down
      //     from behind, or run past him.
      //   8 patrols quickly under two steps, the higher one with a heart.
      //   The last three citizens stand in a quiet square past every guard.
      // Numbers are chosen, not measured, like every other tuning number in
      // this game; judge them on a phone.
      //
      // Every guard's cone (style.css, .guard-sight) stays below the height
      // of every platform here, which is the rule itself drawn: up there,
      // he cannot see you.
      //
      // The guards are a stand-in still (STILL.bantay, above), not the
      // artist's, front-facing, so the cones on the road are still what
      // shows which way each faces. The citizens share one stand-in still,
      // assets/sprites/characters/mamamayan.png.
      id: "lansangan",
      worldWidth: 11000,
      // Block 49. All four paintings twice over, in order, with a palm
      // over each of the seven joins.
      panels: STREET_PANELS,
      panelSky: STREET_SKY,
      startX: 200,
      noRanged: true,
      // Once, on the way in: how many he is looking for, and the one rule.
      arrivalDialogues: [
        {
          doneFlag: "nakaratingSaLansangan",
          lines: [
            { speaker: "Macario", text: "Sampung kapatid ang naghihintay sa kahabaan ng lansangang ito." },
            { speaker: "Macario", text: "Walang dapat makakita sa akin na may dalang polyeto." },
          ],
        },
      ],
      exits: [
        // The way back, so nobody is stuck on a street they walked into.
        { id: "bumalik-tondo", x: 0, width: 80, label: "Bumalik",
          toScene: "tondo", toX: 2740, toFacing: -1 },
      ],
      // Running out of hearts starts him at the furthest of these whose
      // citizen has been given a pamphlet, rather than at the start of an
      // 11000px road. Each is just past its citizen and outside every
      // guard's sight and patrol.
      checkpoints: [
        { x: 1900, flag: "nabigyanSiLabandera" },
        { x: 5200, flag: "nabigyanSiTindera" },
        { x: 8350, flag: "nabigyanSiSapatero" },
        { x: 10400, flag: "nabigyanSiPanadero" },
      ],
      // Seven platforms of five heights. All clear GUARD_SIGHT_CLEARANCE
      // (60 above the floor, game.js), so standing on any of them is out
      // of a guard's sight.
      platforms: [
        { x: 960, y: 135, width: 220 },   // 75 up, easy to reach (guard 1)
        { x: 2700, y: 172, width: 100 },  // 112 up, near the top of a jump (2)
        { x: 4300, y: 150, width: 520 },  // 90 up, a walkway over a sentry (3)
        { x: 5850, y: 145, width: 180 },  // 85 up, mid-beat (4)
        { x: 7250, y: 150, width: 320 },  // 90 up, shared by guards 5 and 6
        { x: 9560, y: 138, width: 200 },  // 78 up, a first step (8)
        { x: 9820, y: 175, width: 110 },  // 115 up, the second, with a heart
      ],
      // Three hearts, each on a platform, worth the climb.
      pickups: [
        { id: "puso-lansangan", x: 2740, y: 172, type: "heart" },
        { id: "puso-lansangan-2", x: 7400, y: 150, type: "heart" },
        { id: "puso-lansangan-3", x: 9860, y: 175, type: "heart" },
      ],
      guards: [
        { id: "bantay-1", x: 1000, patrolFrom: 900, patrolTo: 1400,
          speed: 1.4, facing: -1, detectRadius: 240, shoots: true,
          animation: STILL.bantay },
        { id: "bantay-2", x: 2500, patrolFrom: 2350, patrolTo: 3150,
          speed: 1.4, facing: -1, detectRadius: 200, shoots: true,
          animation: STILL.bantay },
        { id: "bantay-3", x: 4640, patrolFrom: 4640, patrolTo: 4640,
          facing: -1, detectRadius: 300, shoots: true,
          animation: STILL.bantay },
        { id: "bantay-4", x: 5600, patrolFrom: 5550, patrolTo: 6300,
          speed: 1.6, facing: 1, detectRadius: 200, shoots: true,
          animation: STILL.bantay },
        { id: "bantay-5", x: 7000, patrolFrom: 7000, patrolTo: 7500,
          speed: 1.3, facing: 1, detectRadius: 200, shoots: true,
          animation: STILL.bantay },
        { id: "bantay-6", x: 7900, patrolFrom: 7300, patrolTo: 7900,
          speed: 1.3, facing: -1, detectRadius: 200, shoots: true,
          animation: STILL.bantay },
        { id: "bantay-7", x: 8600, patrolFrom: 8600, patrolTo: 8600,
          facing: 1, detectRadius: 260, shoots: true,
          animation: STILL.bantay },
        { id: "bantay-8", x: 9400, patrolFrom: 9400, patrolTo: 10000,
          speed: 1.6, facing: 1, detectRadius: 220, shoots: true,
          animation: STILL.bantay },
      ],
      npcs: CITIZENS.map(citizen),
    },
  ],
};
