// =============================================================
// MACARIO — content/act1.js
//
// Act I, rewritten from the start in Block 52 against the proponents'
// new script and plot, rebuilt in Block 57 around one street, given its
// stage in Block 59 and its end in Blocks 80 and 94. What came before is
// in git history and DECISIONS.md; none of it should be copied back in
// without a reason. STORY.md is the whole act, beat by beat and line by
// line; this is the outline.
//
// All of it on the street (tondo) unless it says:
//
//   "Tondo, 1890" on black (playIntertitle). Macario stands alone;
//   three siga come up behind him and taunt him about his father, and
//   it ends in a fight. Nanay comes to call him home and they walk off
//   together, to where she stays for the rest of the act. There she
//   tells him the money went on the cedula; he says he will work.
//
//   Block 89: nothing is staged but the turns. The Kutsero, the Barbero
//   (Block 94, a game of his own: the customer's order of tools,
//   playOrderGame) and the Mananahi each give him work that is simply
//   there afterwards, a round he can do again for a few barya, up to a
//   cap from each. The one thing scripted is the Mananahi stopping him
//   at the sewing to send him to the direktor at the far end of the
//   street with the costumes for tonight's play.
//
//   The direktor's lead actor has not come. The costume fits Macario,
//   so the direktor begs him to take the part. In the entablado Maryam
//   walks him through it backstage, he forgets his first line and adds
//   one of his own, the Sultan's soldiers attack (spawnEnemies), and the
//   curtain closes on a standing crowd. The direktor pays him. The
//   Mananahi, outside, saw it; he gives Nanay the 100 he has saved.
//
//   Block 80: a black card, four years on (Tondo, 1894), and he plays
//   Principe Baldovino. Two men of the Katipunan find him in the wings;
//   a password for the one waiting on the street takes him to the
//   pulungan, where he takes the oath and is sent out the back door at
//   night with pamphlets for three people, past the guardia civil.
//
//   Block 94: after the third pamphlet the Kasama comes for him (Block
//   95), he reports, and a year on (Tondo, 1895) he is the head of his
//   own council: he lies to Nanay at the door, and the door is shut on
//   her as they call him Pangulo. That ends Act I, and the post-test
//   runs. The Talaan has three papers of facts of its own, which a
//   teacher's paper replaces.
//
// The lines are the proponents' script as written, apostrophes
// straightened. The lines of ours (everything the job-givers, the horse,
// the customers, the direktor and the plays say beyond the lines the
// script gave, and every line from Block 80 on) were accepted by the
// proponents on 4 Oct 2026 (Block 113).
//
// Art. Everyone is drawn since Block 102. A picture still owed (ART.md,
// Owed: the barber's chair, the sewing table, the pulungan) names a file
// that does not exist and is drawn as the dashed placeholder box with
// that name on it. Real art replaces it by being saved under that name
// and measured (measure-sprite.js). A character delivered as one still
// is animated by _dev/tools/animate-still.js and a rig in _dev/rigs/
// (CLAUDE.md, Animating a character from one still).
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
// Every real sheet measured with _dev/tools/measure-sprite.js. A def
// with only src, frames 1 and fps 1 names art that does not exist yet
// and is drawn as the placeholder box (see the header).

// Nanay (Block 101): the proponent's still of her side on, facing right,
// animated by _dev/tools/animate-still.js (rig _dev/rigs/nanay.js) to
// stand with the calm idle and to walk, a short step under the long
// skirt. One cell for both, so she does not slide when she stops.
// Block 113: her sheets, and those of everyone who returns in Act II,
// are in content/people.js (window.PEOPLE), described once for both acts.
const NANAY = window.PEOPLE.nanay;
const NANAY_WALK = window.PEOPLE.nanayWalk;

// The three siga, all the artist's since Block 98 (the big one since
// Block 96): the leader in a salakot with a shawl over his shoulders, the
// big one in a red sash, the small one with a pouch at his belt. Each is
// animated from one still by _dev/tools/animate-still.js (rigs in
// _dev/rigs/); his walk, his numbers (SIGA_CELLS) and his size are the
// enemy catalogue's (content/enemies.js), which loads first, so the boy
// who walks on in the opening is the boy who fights. The idle is a calm
// breath, sway and nod (Block 101: it was far too much), while the
// leader taunts; the walk shows only while the opening walks them on
// (walkAnimation). One cell for both sheets, so a boy does not slide
// when he stops.
const sigaSheets = (n) => ({
  idle: { src: `assets/sprites/characters/siga-${n}.png`, frames: 8, fps: 4, ...SIGA_CELLS[n] },
  walk: window.ENEMY_TYPES["siga" + n].animation,
  height: window.ENEMY_TYPES["siga" + n].displayHeight,
});
const SIGA = { 1: sigaSheets(1), 2: sigaSheets(2), 3: sigaSheets(3) };

// The Kutsero (Block 101): the proponent's still, facing the front, a
// coil of rope on his shoulder and a whip in his hand, left still as the
// Mananahi is: only people drawn side on are animated.
const KUTSERO = window.PEOPLE.kutsero;
// The Mananahi (Block 98): the artist's still, facing the front, and
// left still at the proponent's direction ("can stay stationary").
const MANANAHI = window.PEOPLE.mananahi;
// The Kutsero's horse (Block 100): the proponent's still of a saddled
// bay, animated by _dev/tools/animate-kabayo.js to dip his head and tuck
// his tail, a horse at rest. The grooming game draws the same sheet.
const KABAYO = {
  src: "assets/sprites/characters/kabayo.png", frames: 12, fps: 6, columns: 4,
  contentTop: 4, contentHeight: 262, footX: 115, headroom: 4,
};
// The direktor (Block 98), on the street and inside alike: the artist's
// still of an old man with a cane and the play under his arm, animated by
// _dev/tools/animate-still.js (rig _dev/rigs/direktor.js) to breathe and
// nod only, so his cane stays on the ground. He never walks.
const DIREKTOR = window.PEOPLE.direktor;

// The play's cast (Block 101, the proponent's stills). Maryam faces the
// front and stands still. The Sultan is drawn three-quarter, with his
// kampilan: the calm idle, and the march (each leg lifted in turn) when
// he walks on and off, from _dev/rigs/sultan.js. His soldiers are the
// "kawal" of the enemy catalogue (content/enemies.js), where their
// sheets and numbers are.
const MARYAM = window.PEOPLE.maryam;
const SULTAN_CELL = { columns: 4, contentTop: 8, contentHeight: 383, footX: 87, headroom: 8 };
const SULTAN = {
  idle: { src: "assets/sprites/characters/sultan.png", frames: 8, fps: 4, ...SULTAN_CELL },
  walk: { src: "assets/sprites/characters/sultan-walk.png", frames: 8, fps: 10, ...SULTAN_CELL },
};

// Block 80. The Katipunan's people and the three who take the pamphlets:
// the Katipunero who speaks in the wings, the Kasama beside him who then
// waits on the street and leads the way in, and (Block 81, after the
// histories) the Mabalasig, the "terrible brother" who conducted a
// recruit's rite. Since Block 98 the Katipunero and the Kasama are the
// artist's, animated from one still each by _dev/tools/animate-still.js
// (rigs _dev/rigs/katipunero.js and kasama.js): standing, a breath, a
// sway and a nod; walking, when a scene walks them on or off
// (walkAnimation, with faceMovement so they face the way they go; the
// art faces right). Since Block 101 the Mabalasig is the proponent's
// still, side on, idle only (rig _dev/rigs/mabalasig.js).
const KATIPUNERO_SHEETS = window.PEOPLE.katipunero;
const KASAMA_SHEETS = window.PEOPLE.kasama;
const KATIPUNERO = KATIPUNERO_SHEETS.idle;
const KASAMA = KASAMA_SHEETS.idle;
const MABALASIG = window.PEOPLE.mabalasig;

// Block 94. The Barbero and his chair; since Block 101 the Barbero is the
// proponent's still, facing the front and left still. The chair is owed.
const BARBERO = window.PEOPLE.barbero;
const SILYA = { src: "assets/sprites/scenery/silya-barbero.png", frames: 1, fps: 1 };

// The guardia civil of the pamphlet run are the "bantay" of the enemy
// catalogue (content/enemies.js, Block 76), where their art and numbers
// are.

// ---- Where everyone stands ---------------------------------------
// An NPC's x is the left edge of an 80px body. Joins at 1450, 2900,
// 4350, 5800, 7250, 8700, 10150, 11600 and 13050.
const STREET_SPOT = 900;      // Macario, for the opening
const NANAY_X = 2000;         // where she and Macario walk to, and stay
const KUTSERO_X = 3300;
const KABAYO_X = 3560;
// Block 94. The barberya, between the Kutsero and the Mananahi, 410 clear
// of the join at 5800. It stands in the first guard's beat, so it is
// closed (hidden) from the oath on: the pamphlet run is at night.
const BARBERO_X = 5300;
const SILYA_X = 5440;
const MANANAHI_X = 6400;
// Block 85. Where she waits after the first play, outside the entablado,
// left of where Lumabas puts Macario (13480) and 200 clear of the join.
const MANANAHI_AT_PLAY_X = 13250;
const DIREKTOR_X = 13600;     // at the far end, by the entablado

// Inside the entablado, one phone screen wide (a sideways phone at
// --zoom 0.7 shows about 1175; Block 56's 900 left a dark strip at the
// side): the direktor in the left wing, Maryam on the stage, the Sultan
// and his soldiers from the right wing, and the way out on the right.
const STAGE_WIDTH = 1180;
const STAGE_DIREKTOR_X = 60;
const STAGE_MARYAM_X = 300;
const STAGE_ENTER_X = 560;    // where the fade in puts Macario
const STAGE_PLAY_X = 440;     // his mark once the curtain opens
const SULTAN_MARK = 760;

// Block 80. Where the two men of the Katipunan find him after Principe
// Baldovino: stage right, away from the direktor in the left wing. They
// stand on the far side of him, from the right wing.
const APPROACH_X = 700;

// Where Macario stops beside someone he has walked or been sent to.
const BESIDE = 120;
// Block 93. How far in front of him Nanay stops when she comes for him
// after the opening fight (the old fixed spots, 900 and 1090, apart).
const NANAY_MEETS = 190;

// Block 80. The Kasama waits on the street "bago ang entablado", between
// the last join (13050) and the direktor, left of him.
const KASAMA_X = 12500;

// Block 80. The secret room, one screen wide like the entablado: the way
// out on the left, where he came in, the Kasama by it, the Mabalasig and
// the Katipunero at the far end. Its picture is owed (ART.md).
const PULUNGAN_WIDTH = 1180;
const PULUNGAN_ENTER_X = 120;
const PULUNGAN_KASAMA_X = 300;
const MABALASIG_X = 760;
const PULUNGAN_KATIPUNERO_X = 920;
// Block 94. A year on, Macario stands where the Mabalasig stood, at the
// head of the room, facing the door; the men come to him. Nanay is at the
// door, on the left.
const HEAD_X = MABALASIG_X;
const BEFORE_HEAD_X = 560;
const DOOR_X = 40;

// Block 81. The pamphlet run. He leaves the pulungan by the back, onto
// the street short of the mangingisda, so the three are met left to
// right and a checkpoint at each is always the furthest one reached
// (game.js, respawnX takes the furthest). Three guardia civil walk the
// street on this run only (requiresFlag, unlessFlag), one before each
// of the three, each with a crate to hide behind in the middle of his
// beat: follow him while his back is turned, duck in when he turns, go
// on when he has passed. None shoots; one that sees Macario catches him,
// a heart and back to the last checkpoint. Every x here is clear of the
// joins (4350, 5800, 7250, 10150).
const BACK_DOOR_X = 4100;
const PAMPHLET_GUARDS = [
  { beat: [5000, 5600], hide: 5250 },   // between the mangingisda and the tree
  { beat: [7400, 8000], hide: 7650 },   // past the tabakera
  { beat: [9700, 10150], hide: 9880 },  // before the karpintero
];
// A guard's sight is 260 from the middle of his body, so each beat's
// right end stops short of the next person's hand-over spot (x - 120).

const SAVINGS_GOAL = 100;

// Block 89. The two jobs are things that are there, not steps: the horse
// to groom and the sewing to help with, each a round of the work game
// (game.js, playWorkGame) that pays JOB_PAY_MIN to JOB_PAY_MAX by how
// many strokes were good, and stops paying at JOB_CAP from that job. With
// the play's 79 to 110 the savings are reached by anyone who has done
// three or four rounds.
const JOB_PAY_MIN = 4;
const JOB_PAY_MAX = 7;
const JOB_CAP = 25;
const JOB_ROUNDS = 5;
const HORSE_JOB = {
  earned: "kitaSaKutsero",
  full: "punoNaAngKutsero",
  first: "naalagaanAngKabayo",
  title: "Kabayo",
  hint: "Suklayin siya kapag nasa berde ang guhit.",
  verb: "Suklayin",
  icon: "i-brush",
  scene: "horse",
  art: KABAYO,
  hitText: "Hiiiii!",
  missText: "Umiwas ang kabayo!",
  giver: "Kutsero",
  fullText: "Sapat na 'yan sa ngayon, Macario. Malinis na malinis na si Kabayo.",
};
const SEWING_JOB = {
  earned: "kitaSaMananahi",
  full: "punoNaAngMananahi",
  first: "natulungangMananahi",
  title: "Pananahi",
  hint: "Hawakan ang pindutan, bitawan kapag nasa berde.",
  verb: "Hilahin",
  icon: "i-needle",
  mode: "hold",
  scene: "cloth",
  snapText: "Napatid ang sinulid!",
  hitText: "Diretso ang tahi!",
  missText: "Baluktot ang tahi!",
  giver: "Mananahi",
  fullText: "Sapat na ang natahi mo ngayon, iho. Bukas na ulit.",
};
// Block 94. The third job, the Barbero's chair, with a game of its own at
// the proponent's request (game.js, playOrderGame): the customer asks
// for the cut as a list of tools, and Macario uses them in that order.
// Its first round is the step in the log. Block 102, at the proponent's
// word: easier (five short requests, two tools up to four, said more
// slowly) and paid by the round right, 4 to 7 barya each, up to 20 from
// him, so one good run is all of it.
const BARBER_JOB = {
  game: "order",
  earned: "kitaSaBarbero",
  full: "punoNaAngBarbero",
  first: "nakapaggupit",
  title: "Barberya",
  hint: "Tandaan ang gusto ng suki",
  speaker: "Suki",
  tools: [
    { label: "Suklay", icon: "i-comb" },
    { label: "Gunting", icon: "i-scissors" },
    { label: "Labaha", icon: "i-razor" },
  ],
  hitText: "Tama ang pagkakasunod-sunod!",
  missText: "Naku, hindi 'yan ang gusto ng suki!",
  giver: "Barbero",
  fullText: "Sapat na ang nagupit mo ngayon, iho. Bukas ulit.",
  lengths: [2, 2, 3, 3, 4],
  payPerRound: true,
  cap: 20,
};
// The sewing he does before the Mananahi stops him, counted in the quest
// line (countFlags) and by the flags below.
const SEWING_BEFORE_ERRAND = 2;
const SEWING_FLAGS = ["natapusanNgTahi1", "natapusanNgTahi2"];
const TAHIAN_X = 6400 + 140; // the sewing table, beside the Mananahi
const TAHIAN = { src: "assets/sprites/scenery/tahian.png", frames: 1, fps: 1 };

// The direktor's costumes are the one delivery, and the last.
const DIREKTOR_FLAG = "naihatidKay_direktor";

// Block 80. The three who take the Katipunan's pamphlets, on the street
// once Macario has been sworn in, in the order the Kasama names them and
// (Block 81) the order he meets them from the back door: the mangingisda
// short of the Barbero, the tabakera past the Mananahi, the karpintero
// past the middle of the street. All clear of the joins by 270px or more. Names and
// lines are ours. Their art is the proponent's (Block 102): stills
// facing the front, standing still, as the Kutsero does.
const CITIZENS = [
  { id: "mangingisda", label: "Mangingisda", x: 4800, animation: window.PEOPLE.mangingisda,
    waiting: "Maaga pa ako bukas sa laot. Ano'ng kailangan mo?",
    thanks: "Matagal ko nang hinihintay 'to. Sa bangka ko itatago, walang guardia na sumisilip doon.",
    after: "Nabasa ko na. Ipinasa ko na rin sa kapitbahay." },
  { id: "tabakera", label: "Tabakera", x: 6900, animation: window.PEOPLE.tabakera,
    waiting: "Pagod na ako, iho. Maghapon akong nagbalot ng tabako.",
    thanks: "Isisingit ko 'to sa mga tabako. Maraming babae sa pagawaan ang dapat makabasa nito.",
    after: "Kumakalat na sa pagawaan ang ibinigay mo. Mag-ingat ka, ha." },
  { id: "karpintero", label: "Karpintero", x: 10600, animation: window.PEOPLE.karpintero,
    waiting: "Gabi na, iho. Sarado na ang talyer.",
    thanks: "Katipunan? ...Itatago ko 'to. Ipapabasa ko sa mga kasama ko sa talyer.",
    after: "Wala akong nakita, wala akong narinig. Ingat ka, iho." },
];
const pamphletFlag = (c) => "naibigayAngPolyetoKay_" + c.id;
// Block 102, at the proponent's word. The pamphlet night, from the oath
// to the report: the street holds only the three and the guardia civil,
// so everyone else is away (hiddenWhile). Block 103: and the horse and
// the sewing table with them (the barber's chair goes at the oath).
const PAMPHLET_NIGHT = { requiresFlag: "tinanggapSaKatipunan", unlessFlag: "nakapagUlat" };
const PAMPHLET_FLAGS = CITIZENS.map(pamphletFlag);

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
  await playIntertitle(["Tondo, 1890", "Kung saan nagsimula ang buhay ni Macario"],
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
    { speaker: "Siga", text: "Ano, Macario? Hinihintay mo pa rin ang tatay mo?" },
    { speaker: "Mga Siga", text: "BAHAHAHAHAHAHA!" },
    { speaker: "Macario", text: "Isara mo 'yang bunganga mo!" },
  ]);

  // The insult ends in a fight (Block 87): the three step out of the
  // scenery and become enemies where they stood. Beaten, they are gone
  // before Nanay comes.
  ["siga-1", "siga-2", "siga-3"].forEach((id) => showDecoration(id, false));
  setCutscene(false);
  setMusic("assets/audio/music/intense.mp3");
  showToast("Pindutin ang Atake para lumaban!", 2600);
  const brawl = spawnEnemies([[ "siga1", 760 ], [ "siga2", 690 ], [ "siga3", 620 ]].map(([type, x], i) => ({
    type, id: "siga-away-" + (i + 1), x: x - 20,
  })));
  // Block 92. The world waits until he has struck once.
  await teach("atake");
  await brawl;
  setMusic(null);
  setCutscene(true);
  turnPlayer(1);
  await wait(300);

  // Nanay, from the right. Block 93: from just past the edge of the
  // screen to a step in front of him, wherever the fight left him; a
  // fixed spot put her off screen when he had fought his way left. She
  // walks on her walk sheet (Block 101).
  const here = playerX();
  placeDecoration("nanay", Math.max(here + NANAY_MEETS, viewEdges().right + 80));
  showDecoration("nanay", true);
  await moveDecoration("nanay", here + NANAY_MEETS, 170);
  await wait(300);

  await playDialogue([
    { speaker: "Nanay", text: "Macario, umuwi na tayo. May kailangan akong sabihin sa'yo." },
    { speaker: "Nanay", text: "Tama na 'yan, anak. Huwag mo na silang pansinin." },
    { speaker: "Macario", text: "Tsk." },
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
    { speaker: "Macario", text: "'Nay, ano po ba 'yung sasabihin n'yo?" },
    { speaker: "Nanay", text: "Macario, anak, naubos na 'yung pera natin sa pagbili ko ng cedula..." },
    { speaker: "Nanay", text: "Wala na tayong pambili ng bigas. Humingi na lang ako ng ulam sa kapitbahay para sa hapunan natin ngayon..." },
    { speaker: "Nanay", text: "Pasensya ka na, anak, ha?" },
    { speaker: "Macario", text: "Ayos lang po, 'Nay. Magtatrabaho na po ako para makatulong sa inyo." },
    { speaker: "Nanay", text: "Sigurado ka ba diyan, 'nak?" },
    { speaker: "Macario", text: "Opo, 'Nay. Ako na po ang bahala." },
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
    { speaker: "Macario (sa isip)", text: "Kailangan ko ng pera para matulungan si Nanay. Saan kaya ako makakahanap ng trabaho?" },
  ]);
  // Block 93. The step is done with the thought, before the lessons, so
  // the log already names the Kutsero while he learns to walk there (the
  // script's doneFlag sets it again, harmlessly, when it resolves).
  state.flags.nagpasyangMagtrabaho = true;
  markDirty();
  setCutscene(false);
  // Block 92. The first things a student needs, each waiting for him.
  await teach("lakad");
  await teach("talon");
}

// -------------------------------------------------------------
// Block 59. The last delivery. The costumes are handed over (the
// direktor's gift button), and a scene script in tondo takes it from
// there: his lead actor is missing, the house is full, and the costume
// fits the boy who brought it. Started straight from the gift by
// runSceneScript; a reload before Macario says yes plays it again from
// the top. It ends by going inside, without awaiting the fade, and its
// doneFlag is the delivery step's own flag, so "Bagong gawain" names
// the play as they go in.
// -------------------------------------------------------------
async function theMissingActor() {
  setCutscene(true);
  await wait(300);
  await playDialogue([
    { speaker: "Direktor", text: "Teka... nasaan na ba si Julian?" },
    { speaker: "Direktor", text: "Julian! JULIAN!" },
    { speaker: "Macario", text: "Sino po si Julian?" },
    { speaker: "Direktor", text: "'Yung bida namin. Siya dapat ang gaganap na Don Rodrigo mamaya." },
    { speaker: "Direktor", text: "Kaninang umaga pa siya hindi nagpapakita. Ang sabi ng kapatid niya, nilalagnat daw." },
    { speaker: "Direktor", text: "Diyos ko... puno na ang mga upuan sa loob. Hindi ko puwedeng pauwiin ang mga tao." },
    { speaker: "Macario", text: "Wala po bang ibang puwedeng pumalit sa kanya?" },
    { speaker: "Direktor", text: "Wala na. May kanya-kanyang papel na ang lahat ng artista ko." },
    { speaker: "Direktor", text: "..." },
    { speaker: "Direktor", text: "Iho, tumayo ka nga nang tuwid." },
    { speaker: "Macario", text: "Po?" },
    { speaker: "Direktor", text: "Kasing-tangkad mo si Julian. Kasyang-kasya sa'yo 'yang damit na dinala mo." },
    { speaker: "Macario", text: "Ako po? Naku, hindi po ako marunong umarte." },
    { speaker: "Direktor", text: "Hindi mo kailangang maging magaling. Kailangan ko lang ng taong kayang tumayo sa entablado nang hindi tumatakbo palabas." },
    { speaker: "Direktor", text: "Nasa gilid lang ako. Ibubulong ko sa'yo ang bawat linya. At babayaran kita, siyempre." },
    { speaker: "Macario (sa isip)", text: "Dagdag na pera para kay Nanay..." },
    { speaker: "Macario", text: "Sige po. Susubukan ko." },
    { speaker: "Direktor", text: "Salamat, iho! Tara na sa loob, bago ka pa magbago ng isip!" },
  ]);
  // The fade takes the cutscene over from here (game.js, runSceneScript).
  if (window.Acts) Acts.gotoScene("entablado", { x: STAGE_ENTER_X, facing: -1 });
}

// -------------------------------------------------------------
// Block 59. The play, inside the entablado: a moro-moro, the kind of
// play Tondo's stages put on, two kingdoms at war and a love across
// them. A scene script, run after the fade in; the fight is not saved,
// so a reload in the middle of it plays the whole thing again, while a
// reload after the pay does not (the flag is set before the pay).
//
// -------------------------------------------------------------
const CURTAIN_OPENS = [
  { speaker: "Maryam", text: "O Don Rodrigo! Bakit ka naparito? Kapag nakita ka ng aking ama, tiyak ang iyong kamatayan!" },
  { speaker: "Macario", text: "..." },
  { speaker: "Direktor (pabulong)", text: "\"Hindi ako natatakot sa kamatayan...\"" },
  { speaker: "Macario", text: "Hindi ako natatakot sa kamatayan!" },
  { speaker: "Macario", text: "...Ang tanging kinatatakutan ko ay ang mawalay sa iyo." },
  { speaker: "Direktor (pabulong)", text: "Wala 'yan sa iskrip..." },
  { speaker: "Maryam", text: "Kay tamis ng iyong mga salita, Don Rodrigo..." },
  { speaker: "Mga Manonood", text: "Uyyy!" },
];

async function thePlay() {
  setCutscene(true);
  // Fetched while the first scenes are read, so the swap when the
  // fight starts is instant (Block 36).
  prepareMusic("assets/audio/music/intense.mp3");
  await wait(300);

  // Backstage, before the curtain.
  await playDialogue([
    { speaker: "Maryam", text: "Ikaw ba 'yung papalit kay Julian?" },
    { speaker: "Macario", text: "Opo. Macario po." },
    { speaker: "Maryam", text: "Ako si Maryam. Ako ang prinsesa." },
    { speaker: "Maryam", text: "Namumutla ka. Kinakabahan ka, 'no?" },
    { speaker: "Macario", text: "Hindi ko nga po alam ang kuwento." },
    { speaker: "Maryam", text: "Madali lang. Magkasintahan tayo, pero magkaaway ang mga kaharian natin." },
    { speaker: "Maryam", text: "Darating ang ama ko, ang Sultan, kasama ang mga kawal niya. Lalabanan mo sila." },
    { speaker: "Maryam", text: "Kahoy lang ang mga espada. Basta huwag mong lakasan ang palo." },
    { speaker: "Macario", text: "...Sige po." },
    { speaker: "Direktor (pabulong)", text: "Pumuwesto na ang lahat! Bubuksan na ang telon!" },
  ]);

  await playIntertitle(["Bumukas ang telon."], {
    whileBlack: () => placePlayer(STAGE_PLAY_X, -1),
  });
  await wait(300);
  await playDialogue(CURTAIN_OPENS);

  // The Sultan, from the right wing.
  turnPlayer(1);
  showDecoration("sultan", true);
  await moveDecoration("sultan", SULTAN_MARK, 200);
  await playDialogue([
    { speaker: "Sultan", text: "Maryam! Sino ang lapastangang ito na nangangahas lumapit sa aking anak?" },
    { speaker: "Maryam", text: "Ama, maawa po kayo! Mahal ko siya!" },
    { speaker: "Sultan", text: "Isang kaaway, sa loob ng aking palasyo? Mga kawal! Dakpin ang kabalyerong iyan!" },
    { speaker: "Direktor (pabulong)", text: "Ikaw na, Macario! Labanan mo sila!" },
  ]);

  // He leaves the fighting to his soldiers, who come in from the same
  // wing, spaced so they arrive one after another.
  const sultanOff = moveDecoration("sultan", STAGE_WIDTH + 100, 260)
    .then(() => showDecoration("sultan", false));
  setCutscene(false);
  setMusic("assets/audio/music/intense.mp3");
  showToast("Pindutin ang Atake para lumaban!", 2600);
  await spawnEnemies([80, 160, 240, 320].map((d) => STAGE_WIDTH + d).map((x, i) => ({
    type: "kawal", id: "kawal-" + (i + 1), x,
  })));
  setMusic(null);
  setCutscene(true);

  // The Sultan comes back to a stage of fallen soldiers. A quick fight
  // can end before he is off, and two walks at once would fight over
  // him, so he finishes leaving first. Block 93: meanwhile Macario walks
  // back to his mark beside Maryam, as he does after Principe Baldovino;
  // the fight could leave him at the edge of the stage, or on the very
  // spot the Sultan walks back to.
  await Promise.all([sultanOff, movePlayer(STAGE_PLAY_X, 220)]);
  showDecoration("sultan", true);
  turnPlayer(1);
  await moveDecoration("sultan", SULTAN_MARK, 200);
  await playDialogue([
    { speaker: "Sultan", text: "Natalo... ang lahat ng aking kawal?" },
    { speaker: "Sultan", text: "Kung ganyan katapang ang pag-ibig mo sa aking anak, sino ako para humadlang?" },
    { speaker: "Maryam", text: "Ama!" },
    { speaker: "Sultan", text: "Sa inyo na ang aking basbas." },
    { speaker: "Mga Manonood", text: "Mabuhay! Mabuhay!", sfx: "cheer" },
  ]);

  // The curtain closes, and he is in the wings with the direktor.
  await playIntertitle(["Nagsara ang telon.", "Tumayo at pumalakpak ang mga manonood."], {
    sfx: "applause", // Block 81
    whileBlack: () => {
      showDecoration("sultan", false);
      placePlayer(STAGE_DIREKTOR_X + 140, -1);
    },
  });
  await wait(300);
  await playDialogue([
    { speaker: "Direktor", text: "Macario! Narinig mo ba 'yon? Nakatayo ang mga tao!" },
    { speaker: "Macario", text: "Nanginginig pa rin po ang tuhod ko." },
    { speaker: "Direktor", text: "'Yung linya mo kanina, 'yung \"mawalay sa iyo\"... hindi ko isinulat 'yon." },
    { speaker: "Macario", text: "Pasensya na po. Bigla na lang pong lumabas sa bibig ko." },
    { speaker: "Direktor", text: "Pasensya? Isasama ko 'yon sa iskrip!" },
    { speaker: "Maryam", text: "Hindi ka raw marunong umarte, ha." },
    { speaker: "Direktor", text: "Heto, iho. Sa'yo 'yan. Pinaghirapan mo." },
  ]);

  // Set before the pay, so a reload cannot pay twice.
  state.flags.naitanghalAngDula = true;
  // Block 56: 79 to 110 at random, the proponent's own numbers for what
  // the direktor pays.
  const pay = 79 + Math.floor(Math.random() * 32);
  Game.addCurrency(pay);
  showToast("+" + pay + " barya", 2200);
  markDirty();

  await playDialogue([
    { speaker: "Macario", text: "Salamat po!" },
    { speaker: "Direktor", text: "At kung gusto mo, may puwesto ka sa kompanya namin. Pag-isipan mo, ha?" },
  ]);
  setCutscene(false);
}

// -------------------------------------------------------------
// Block 80, and Block 81 against the histories. The end of Act I.
//
//
// What the histories say, and this follows (DECISIONS.md, Block 81):
// Sakay acted in Principe Baldovino, a komedya attributed to Huseng
// Sisiw, whose prince fights the enemy's armies and wins; he joined the
// Katipunan in 1894, when a recruit was blindfolded, led into a dim room
// hung in black, faced a posted warning and the Mabalasig ("terrible
// brother"), answered three questions, went through ordeals, and signed
// the oath in blood from his arm; "Anak ng Bayan" was the first grade's
// (the Katipon's) password. The play's words, and the line Macario adds
// to it, are ours.
//
// Four years on. Started from Nanay's gift through runSceneScript, as
// the direktor's scene is started from his, so a reload before the
// card lifts plays it again. The card leaves the fade's black up
// (keepBlack) and the fade takes him straight onto the stage, in the
// middle of the play: nobody sees the street between the two.
// -------------------------------------------------------------
async function fourYearsLater() {
  setCutscene(true);
  await wait(600);
  // Block 83. The year is on the card: the opening is 1890, so four years
  // on is 1894, the year Sakay joined the Katipunan.
  await playIntertitle(["Pagkalipas ng apat na taon", "Tondo, 1894",
    "Ngayong gabi sa entablado: Principe Baldovino"], { keepBlack: true });
  if (window.Acts) Acts.gotoScene("entablado", { x: STAGE_PLAY_X, facing: -1 });
}

// Principe Baldovino, in the entablado: a komedya, so a prince, a
// princess held by the enemy, and a battle he wins. He is the company's
// lead now and needs no whisper from the wings. After the battle he adds
// a line of his own again, as he did on his first night, and this one
// is not about love: it is the line the Katipunan hears.
async function principeBaldovino() {
  setCutscene(true);
  prepareMusic("assets/audio/music/intense.mp3");
  await wait(400);
  await playDialogue([
    { speaker: "Maryam", text: "Principe Baldovino! Ikaw ba 'yan? Bihag ako ng kaaway, at bukas ay ilalayo nila ako sa kaharian!" },
    { speaker: "Macario", text: "Prinsesa, huwag kang mangamba. Walang pader at walang hukbong makahahadlang sa akin." },
    { speaker: "Direktor (pabulong)", text: "Ayan na ang mga kawal..." },
  ]);

  // The battle every komedya has: two of the enemy's soldiers from the
  // right wing, fought for real (the first play's kawal).
  turnPlayer(1);
  setCutscene(false);
  setMusic("assets/audio/music/intense.mp3");
  showToast("Pindutin ang Atake para lumaban!", 2600);
  await spawnEnemies([80, 200].map((d) => STAGE_WIDTH + d).map((x, i) => ({
    type: "kawal", id: "baldovino-kawal-" + (i + 1), x,
  })));
  setMusic(null);
  setCutscene(true);
  // Block 82. Back to her side on his own feet, seen, not moved there.
  await movePlayer(STAGE_PLAY_X, 220);
  turnPlayer(-1);
  await wait(300);

  await playDialogue([
    { speaker: "Maryam", text: "Iniligtas mo ako, mahal kong prinsipe!" },
    { speaker: "Macario", text: "At tandaan ng lahat ng nakikinig:" },
    { speaker: "Macario", text: "Walang bayang mananatiling alipin, kung ang mga anak nito ay handang lumaban!" },
    { speaker: "Direktor (pabulong)", text: "Wala na naman 'yan sa iskrip..." },
    { speaker: "Mga Manonood", text: "..." },
    { speaker: "Mga Manonood", text: "Mabuhay si Baldovino!", sfx: "cheer" },
  ]);

  await playIntertitle(["Nagsara ang telon.", "Muling tumayo at pumalakpak ang mga manonood."], {
    sfx: "applause",
    whileBlack: () => placePlayer(STAGE_DIREKTOR_X + 140, -1),
  });
  await wait(300);
  await playDialogue([
    { speaker: "Direktor", text: "Macario... 'yung idinagdag mo sa dulo. Wala 'yon sa iskrip." },
    { speaker: "Macario", text: "Pasensya na po. Bigla na naman pong lumabas." },
    { speaker: "Direktor", text: "Nagustuhan ng mga tao. Pero may guardia civil sa likod ng mga upuan ngayong gabi. Mag-ingat ka." },
    { speaker: "Direktor", text: "Pag-uwi mo, huwag mo nang hubarin 'yang damit mo." },
    { speaker: "Macario", text: "Po?" },
    { speaker: "Direktor", text: "Walang guardia na nag-uusisa sa artistang pagod. Tumayo ka lang nang tahimik, iisipin nilang nagpapahinga ka lang." },
  ]);
  // Block 82. The stage clothes, worn from here (content/items.js): a
  // guard notices him five times more slowly while he stands still. The
  // guard's meter drawn pale blue while they help is how a student sees
  // it working.
  if (window.Inventory && Inventory.grant) {
    if (await Inventory.grant("damit-entablado")) Inventory.equip("damit-entablado");
  }
  showToast("Suot mo: Damit-Pangteatro", 2600);
  await wait(400);
  await playDialogue([
    { speaker: "Maryam", text: "Apat na taon na, pero hindi ka pa rin marunong sumunod sa iskrip, 'no?" },
  ]);
  // Saved before the men come, so a reload from here plays only them.
  state.flags.naitanghalAngBaldovino = true;
  markDirty();
  await theKatipunanAsks();
}

// In the wings, stage right. Two men who are not of the company, and the
// question the proponent asked for: is he sure. His reason is spoken, in
// his own words, and it is Nanay's cedula from the opening. The Kasama
// then gives him the word to say on the street. The step (the play) is
// finished only when they have gone, so "Bagong gawain" names the street
// after they have told him to go there.
async function theKatipunanAsks() {
  setCutscene(true);
  // He crosses to stage right as they come out of the wing to meet him.
  showDecoration("katipunero", true);
  showDecoration("kasama", true);
  await Promise.all([
    movePlayer(APPROACH_X, 200),
    moveDecoration("katipunero", APPROACH_X + BESIDE, 200),
    moveDecoration("kasama", APPROACH_X + BESIDE + 90, 200),
  ]);
  turnPlayer(1);
  await wait(300);
  await playDialogue([
    { speaker: "Katipunero", text: "Principe Baldovino." },
    { speaker: "Macario", text: "Macario po. Sino po sila?" },
    { speaker: "Katipunero", text: "'Yung huling linya mo kanina. Wala 'yon sa komedya." },
    { speaker: "Katipunero", text: "Linya lang ba 'yon, o pinaniniwalaan mo?" },
    { speaker: "Macario", text: "..." },
    { speaker: "Katipunero", text: "May kaibigan kang nagtanong-tanong tungkol sa amin. Sabi niya, gusto mo raw sumali." },
    { speaker: "Macario", text: "Kayo po ba... ang Katipunan?" },
    { speaker: "Kasama", text: "Hinaan mo ang boses mo." },
    { speaker: "Katipunero", text: "Minsan ko lang itatanong. Sigurado ka bang gusto mong sumali?" },
    { speaker: "Katipunero", text: "Hindi ito komedya. Dito, hindi kahoy ang mga espada." },
    { speaker: "Macario (sa isip)", text: "Si Nanay..." },
    { speaker: "Macario (sa isip)", text: "Pero kaya nga ako sasali. Para wala nang inang mauubusan ng pambili ng bigas dahil sa cedula." },
    { speaker: "Macario", text: "Sigurado po ako." },
  ]);
  // Block 85. Broken with movement, not read in one breath: the older
  // man has what he came for and goes, and the Kasama stays a moment.
  await moveDecoration("katipunero", STAGE_WIDTH + 100, 200);
  showDecoration("katipunero", false);
  await playDialogue([
    { speaker: "Kasama", text: "Paglabas mo, hanapin mo ako sa kalye, bago ang entablado." },
    { speaker: "Kasama", text: "Lalapitan mo ako at sasabihin mo: \"Anak ng Bayan.\" Kapag hindi mo 'yon sinabi, hindi kita kilala." },
    { speaker: "Macario", text: "Anak ng Bayan." },
    { speaker: "Kasama", text: "Hindi rito. Sa labas." },
  ]);
  await moveDecoration("kasama", STAGE_WIDTH + 180, 200);
  showDecoration("kasama", false);
  state.flags.nilapitanNgKatipunan = true;
  markDirty();
  setCutscene(false);
  // Block 92. The stage clothes are in the bag now.
  if (window.Inventory) await teach("bag");
}

// The Kasama on the street, once the word is said: the blindfold, as a
// recruit was led in, and the fade into the room (the card held black,
// keepBlack, so the street is not seen between them).
async function intoThePulungan() {
  setCutscene(true);
  await playIntertitle(["Piniringan ang mga mata ni Macario,",
    "at dinala siya sa isang lihim na silid sa Tondo."], { keepBlack: true });
  if (window.Acts) Acts.gotoScene("pulungan", { x: PULUNGAN_ENTER_X, facing: 1 });
}

// Block 81. The rite, in the pulungan, in the order the histories give
// it: the blindfold off in a dim room hung in black, the warning on the
// wall, the Mabalasig's challenge to turn back, the three questions, an
// ordeal (of the two recorded, the leap over a fire said to be burning,
// rather than the revolver said to be loaded, for a Grade 8 room), the
// oath signed in blood from the arm, and the first grade's name and
// password. The warning is a paraphrase, not the original's words. A
// scene script on arrival (and on a reload into the room, which plays
// it again from the top). Its doneFlag is the step's own flag, so the
// pamphlets are announced as he is sent out.
async function theOath() {
  setCutscene(true);
  await wait(400);
  await playDialogue([
    { speaker: "Mabalasig", text: "Alisin ang kanyang piring." },
    { speaker: "Macario (sa isip)", text: "Madilim... itim ang lahat ng kurtina." },
  ]);
  // Block 85. He looks around the room before anyone speaks again.
  turnPlayer(-1);
  await wait(700);
  turnPlayer(1);
  await wait(400);
  await playDialogue([
    { speaker: "Mabalasig", text: "Basahin mo ang nakasulat sa dingding." },
    { speaker: "Macario", text: "\"Kung may lakas at tapang ka, magpatuloy ka. Kung pag-uusisa lamang ang nagdala sa iyo rito, umalis ka na.\"" },
    { speaker: "Mabalasig", text: "Ako ang Mabalasig. Ito na ang huli mong pagkakataong umatras." },
    { speaker: "Macario", text: "Hindi po ako aatras." },
    { speaker: "Mabalasig", text: "Lumapit ka." },
  ]);
  await movePlayer(MABALASIG_X - BESIDE, 170);
  turnPlayer(1);
  await wait(300);
  await playDialogue([
    { speaker: "Mabalasig", text: "Tatlong tanong. Sagutin mo nang tapat." },
    { speaker: "Mabalasig", text: "Ano ang kalagayan ng ating bayan nang dumating ang mga Kastila?" },
    { speaker: "Macario", text: "May sarili po tayong pamumuhay at pamahalaan. Malaya po tayo." },
    { speaker: "Mabalasig", text: "At ano ang kalagayan nito ngayon?" },
    { speaker: "Macario", text: "Alipin po sa sarili nating lupa." },
    { speaker: "Mabalasig", text: "At ano ang maaasahan nito sa darating na panahon?" },
    { speaker: "Macario", text: "Kalayaan po... kung may lalaban." },
    { speaker: "Mabalasig", text: "..." },
    { speaker: "Mabalasig", text: "Piringan siyang muli." },
  ]);
  await playIntertitle(["Muling piniringan si Macario."]);
  await playDialogue([
    { speaker: "Mabalasig", text: "Sa harap mo ay may nagliliyab na apoy. Tumalon ka." },
    { speaker: "Macario (sa isip)", text: "Wala akong makita..." },
    { speaker: "Macario (sa isip)", text: "Para kay Nanay. Para sa bayan." },
  ]);
  // Block 82. The leap is shown, not told on a card: he jumps, and it is
  // the Mabalasig who says there was no fire.
  await jumpPlayer(50);
  await wait(500);
  await playDialogue([
    { speaker: "Mabalasig", text: "Alisin ang piring." },
    { speaker: "Mabalasig", text: "Walang apoy. Tapang mo ang sinubok namin, hindi ang balat mo." },
  ]);
  await wait(300);
  await playDialogue([
    { speaker: "Mabalasig", text: "Ngayon, ang panunumpa." },
    { speaker: "Mabalasig", text: "Isumpa mong ipagtatanggol mo ang Katipunan, iingatan mo ang mga lihim nito, at tutulungan mo ang bawat kapatid sa anumang panganib." },
    { speaker: "Macario", text: "Isinusumpa ko po." },
  ]);
  await playIntertitle(["Hiniwaan si Macario sa braso,",
    "at sa sarili niyang dugo, nilagdaan niya ang panunumpa."]);
  await wait(300);
  await playDialogue([
    { speaker: "Mabalasig", text: "Mula ngayon, kapatid ka na namin, Macario. Isa ka nang Katipon, ang unang baitang." },
    { speaker: "Mabalasig", text: "Kaya \"Anak ng Bayan\" ang salitang ibinigay sa iyo. Iyon ang hudyat ng mga Katipon." },
    { speaker: "Katipunero", text: "Maligayang pagdating, kapatid. Hindi na linya lang 'yung sinabi mo sa entablado." },
    { speaker: "Mabalasig", text: "Heto ang una mong gawain: mga polyeto. Kailangang mabasa ito ng ating mga kababayan." },
  ]);
  // Block 85. He takes the pamphlets to the Kasama by the door, who
  // tells him the rest there, where the way out is.
  await movePlayer(PULUNGAN_KASAMA_X + BESIDE, 170);
  turnPlayer(-1);
  await wait(300);
  await playDialogue([
    { speaker: "Kasama", text: "Sa likod ka dadaan. Ang mangingisda ang pinakamalapit. Ang tabakera, lampas sa patahian. Ang karpintero, malapit na sa entablado." },
    { speaker: "Kasama", text: "May mga guardia civil na nagroronda ngayong gabi. Huwag kang dadaan sa harap nila. Magtago ka kung kailangan." },
    { speaker: "Kasama", text: "Mabuti't suot mo pa 'yang damit-teatro. Kapag tumigil ka at hindi gumalaw, hindi ka nila agad papansinin." },
    { speaker: "Macario", text: "Opo. Ako na po ang bahala." },
  ]);
  setCutscene(false);
}

// The third pamphlet handed over, whichever it was: his thought, and
// (Block 94) the night's rounds over, under a card, so the guards leave
// the street unseen (refreshOnDuty reads the flag they go off duty on).
// Block 95, at the proponent's request: the Kasama then comes to him,
// wherever he is, as Nanay does after the opening fight, and takes him
// back to the pulungan; a door to find on a dark street was not found.
// Its doneFlag is the pamphlets' step, set before the fade so the report
// is due on arrival. A reload before it ends plays it again.
async function thePamphletsDelivered() {
  setCutscene(true);
  await wait(400);
  await playDialogue([
    { speaker: "Macario (sa isip)", text: "Naibigay ko na ang tatlo." },
    { speaker: "Macario (sa isip)", text: "Dati, barya ang iniipon ko para kay Nanay." },
    { speaker: "Macario (sa isip)", text: "Ngayon, may mas malaki na akong ipinaglalaban." },
  ]);
  await playIntertitle(["Natapos ang ronda ng mga guardia civil."], {
    whileBlack: () => {
      state.flags.nataposAngRonda = true;
      markDirty();
      refreshOnDuty();
      refreshNpcVisibility();
    },
  });
  await wait(300);
  turnPlayer(1);
  const here = playerX();
  placeDecoration("kasama-kalye", Math.max(here + NANAY_MEETS, viewEdges().right + 80));
  showDecoration("kasama-kalye", true);
  await moveDecoration("kasama-kalye", here + NANAY_MEETS, 200);
  await wait(300);
  await playDialogue([
    { speaker: "Kasama", text: "Tapos na ang tatlo?" },
    { speaker: "Macario", text: "Opo. Walang nakakita sa akin." },
    { speaker: "Kasama", text: "Mabuti. Sumunod ka. Hinihintay ka nila sa pulungan." },
  ]);
  await toThePulunganAgain();
}

// The Kasama takes him back, through a card held black into the fade, as
// he took him in the first time. Also the Kasama's line on the street
// after a reload between the pamphlets and the report.
async function toThePulunganAgain() {
  setCutscene(true);
  state.flags.naipamigayAngMgaPolyeto = true;
  markDirty();
  await playIntertitle(["Ibinalik siya ng Kasama sa lihim na silid."], {
    keepBlack: true,
    whileBlack: () => showDecoration("kasama-kalye", false),
  });
  if (window.Acts) Acts.gotoScene("pulungan", { x: PULUNGAN_ENTER_X, facing: 1 });
}

// -------------------------------------------------------------
// Block 94, at the proponent's direction: the end of Act I is his rise,
// told the way The Godfather ends. He reports, a year passes, and he is
// the head of his own council of the Katipunan (a sangguniang balangay;
// the histories make him the head of a council, never of the Katipunan,
// whose Supremo was Bonifacio). Men take his orders; his mother comes to
// the door and asks whether he is one of them; he lies to her, the way
// the actor he is would; and the door is shut on her as they call him
// Pangulo.
//
// The report, on arrival (the Kasama brings him, Block 95).
// Its flag is saved before the year passes, so a reload from there plays
// only the year (theYearAfter), as Principe Baldovino hands on to the men.
// -------------------------------------------------------------
async function theReport() {
  setCutscene(true);
  await wait(400);
  await playDialogue([
    { speaker: "Kasama", text: "Narito na siya." },
    { speaker: "Macario", text: "Naiabot ko na po ang tatlo." },
  ]);
  await movePlayer(MABALASIG_X - BESIDE, 170);
  turnPlayer(1);
  await wait(300);
  await playDialogue([
    { speaker: "Mabalasig", text: "Lahat? Sa iisang gabi, at may ronda pa?" },
    { speaker: "Macario", text: "Nagtago po ako sa likod ng mga kahon. Kapag tumitigil po ako, akala nila artistang pagod lang." },
    { speaker: "Katipunero", text: "Sabi ko sa inyo. Hindi lang linya ang alam ng batang 'yan." },
    { speaker: "Mabalasig", text: "..." },
    { speaker: "Mabalasig", text: "Hindi ka nagmadali, at walang nahuli. Tatandaan namin ang gabing ito, kapatid." },
  ]);
  state.flags.nakapagUlat = true;
  markDirty();
  await theYearAfter();
}

// A year on, in the same room. The people of the room are moving copies
// here (decorations), the NPCs hidden while it plays (hiddenWhile), and
// the last flag, set after the last card, finishes Act I.
async function theYearAfter() {
  setCutscene(true);
  await playIntertitle(["Pagkalipas ng isang taon", "Tondo, 1895"], {
    whileBlack: () => {
      state.flags.lumipasAngIsangTaon = true;
      markDirty();
      refreshNpcVisibility();
      showDecoration("katipunero-1895", true);
      showDecoration("mabalasig-1895", true);
      placePlayer(HEAD_X, -1);
    },
  });
  await wait(400);
  await playDialogue([
    { speaker: "Katipunero", text: "Pangulo, handa na ang mga polyeto para sa susunod na linggo." },
    { speaker: "Macario", text: "Hatiin sa tatlo. Iba't ibang daan, iba't ibang gabi." },
    { speaker: "Macario", text: "At walang dalawang kapatid na lalabas nang magkasama." },
    { speaker: "Katipunero", text: "Masusunod, Pangulo." },
  ]);
  // One goes out by the door as the other comes in by it.
  showDecoration("kasama-1895", true);
  await Promise.all([
    moveDecoration("katipunero-1895", -120, 240)
      .then(() => showDecoration("katipunero-1895", false)),
    moveDecoration("kasama-1895", BEFORE_HEAD_X, 240),
  ]);
  await playDialogue([
    { speaker: "Kasama", text: "Pangulo. May tatlong gustong sumapi. Naghihintay sila sa kabilang silid." },
    { speaker: "Macario", text: "Sino ang nagdala sa kanila?" },
    { speaker: "Kasama", text: "Ako. Kilala ko ang mga pamilya nila." },
    { speaker: "Macario", text: "Piringan sila. Ang Mabalasig ang tatanggap sa kanila, gaya ng pagtanggap niya sa akin." },
    { speaker: "Mabalasig", text: "Masusunod." },
    { speaker: "Kasama", text: "..." },
    { speaker: "Kasama", text: "May isa pa, Pangulo. Nasa pinto ang nanay mo. Hinahanap ka." },
    { speaker: "Macario", text: "..." },
  ]);

  // Nanay, at the door. He goes to her, so she does not come in.
  playSfx("door");
  showDecoration("nanay-1895", true);
  await wait(500);
  await movePlayer(DOOR_X + NANAY_MEETS, 170);
  turnPlayer(-1);
  await wait(300);
  await playDialogue([
    { speaker: "Nanay", text: "Macario, anak. Gabi-gabi ka na lang wala sa bahay." },
    { speaker: "Nanay", text: "Sabi ng mga kapitbahay, may mga lihim na pulong daw dito sa Tondo. Hinuhuli raw ng guardia civil ang mga dumadalo." },
    { speaker: "Nanay", text: "Anak... hindi ka naman kasali sa mga 'yon, 'di ba?" },
    { speaker: "Macario", text: "..." },
    { speaker: "Macario", text: "Hindi po, 'Nay. Nag-eensayo lang po kami ng bagong komedya." },
    { speaker: "Nanay", text: "..." },
    { speaker: "Nanay", text: "O siya. Umuwi ka bago mag-umaga, ha?" },
    { speaker: "Macario", text: "Opo, 'Nay." },
  ]);

  // He turns his back on her and goes back to his place; she is still at
  // the door when the Kasama shuts it.
  await movePlayer(HEAD_X, 170);
  turnPlayer(-1);
  await wait(300);
  await playDialogue([
    { speaker: "Mabalasig", text: "Pangulo, handa na ang mga bagong kapatid." },
    { speaker: "Macario", text: "Simulan na natin." },
  ]);
  await moveDecoration("kasama-1895", DOOR_X + 110, 200);
  await playDialogue([
    { speaker: "Kasama", text: "Pangulo." },
  ]);
  playSfx("door");
  showDecoration("nanay-1895", false);
  await wait(1200);

  await playIntertitle(["Isang taon pa lamang mula nang sumapi siya,",
    "pinuno na si Macario ng kanyang balangay sa Katipunan.",
    "Wakas ng Unang Yugto"], {
    whileBlack: () => {
      ["kasama-1895", "mabalasig-1895"].forEach((id) => showDecoration(id, false));
      placePlayer(BEFORE_HEAD_X, -1);
    },
  });
  // The last step: Act I finishes and the post-test runs.
  state.flags.pinunoNgBalangay = true;
  markDirty();
  refreshNpcVisibility();
  setCutscene(false);
}

// -------------------------------------------------------------
// Block 89. The jobs. Both are the same activity with different words
// (playWorkGame), repeatable until the giver has paid JOB_CAP. Nothing
// here is a step of the story except the first round, which finishes the
// quest line's step, and the Mananahi stopping him at the sewing.
// -------------------------------------------------------------
function jobPay(job, good, earned, rounds) {
  const cap = job.cap || JOB_CAP;
  // The barber pays by the round right (Block 102); the others by how
  // good the round was as a whole.
  const pay = job.payPerRound
    ? Array.from({ length: good }, () => JOB_PAY_MIN + Math.floor(Math.random() * (JOB_PAY_MAX - JOB_PAY_MIN + 1)))
      .reduce((a, b) => a + b, 0)
    : JOB_PAY_MIN + Math.round((JOB_PAY_MAX - JOB_PAY_MIN) * good / rounds);
  return Math.max(0, Math.min(pay, cap - earned));
}

// One round. Returns how many barya it paid, or -1 if he left it. The
// barber's job plays its own game (Block 94); the other two the work game.
async function workAt(job) {
  const earned = Number(state.flags[job.earned]) || 0;
  const cap = job.cap || JOB_CAP;
  if (earned >= cap) {
    await playDialogue([{ speaker: job.giver, text: job.fullText }]);
    return -1;
  }
  let pay = 0;
  const rounds = job.lengths ? job.lengths.length : JOB_ROUNDS;
  const doneText = (n) => {
    pay = jobPay(job, n, earned, rounds);
    return n + "/" + rounds + " ang maayos. +" + pay + " barya";
  };
  const good = job.game === "order"
    ? await playOrderGame({
      title: job.title,
      hint: job.hint,
      speaker: job.speaker,
      tools: job.tools,
      lengths: job.lengths,
      hitText: job.hitText,
      missText: job.missText,
      doneText,
    })
    : await playWorkGame({
      title: job.title,
      hint: job.hint,
      verb: job.verb,
      icon: job.icon,
      mode: job.mode,
      scene: job.scene,
      art: job.art,
      snapText: job.snapText,
      hitText: job.hitText,
      missText: job.missText,
      rounds,
      doneText,
    });
  if (good < 0) return -1;
  Game.addCurrency(pay);
  state.flags[job.earned] = earned + pay;
  state.flags[job.first] = true;
  if (earned + pay >= cap) state.flags[job.full] = true;
  markDirty();
  showToast("+" + pay + " barya", 2200);
  return pay;
}

function thinkAloud(text) {
  return playDialogue([{ speaker: "Macario (sa isip)", text }]);
}

function groomHorse() {
  if (!state.flags.nakausapAngKutsero) {
    thinkAloud("Kabayo ito ng Kutsero. Kausapin ko muna siya bago ko galawin.");
    return;
  }
  workAt(HORSE_JOB);
}

// Block 94. The barber's chair. His first round is the log's step.
function cutHair() {
  if (!state.flags.nakausapAngBarbero) {
    thinkAloud("Silya ito ng Barbero. Kausapin ko muna siya.");
    return;
  }
  workAt(BARBER_JOB);
}

async function sew() {
  if (!state.flags.nakausapAngMananahi) {
    thinkAloud("Tahian ito ng Mananahi. Kausapin ko muna siya.");
    return;
  }
  if (state.flags.mayDalangDamit && !state.flags.naihatidAngMgaDamit) {
    thinkAloud("May dala akong damit para sa direktor. Ihahatid ko muna.");
    return;
  }
  const pay = await workAt(SEWING_JOB);
  if (pay < 0) return;
  // Counted, so the first two rounds are the quest line's (n/2) and the
  // second is when she stops him.
  const rounds = (Number(state.flags.bilangNgTahi) || 0) + 1;
  state.flags.bilangNgTahi = rounds;
  if (rounds <= SEWING_FLAGS.length) state.flags[SEWING_FLAGS[rounds - 1]] = true;
  if (rounds >= SEWING_BEFORE_ERRAND && !state.flags.tinawagAngMananahi) {
    state.flags.tinawagAngMananahi = true;
    markDirty();
    setTimeout(() => runSceneScript(), 0);
  }
  markDirty();
}

// The one thing scripted about the work: she stops him at the sewing,
// because the costumes for tonight were forgotten. The flag it sets is what lets the direktor take his delivery.
async function mananahiStopsHim() {
  setCutscene(true);
  turnPlayer(-1);
  await wait(300);
  await playDialogue([
    { speaker: "Mananahi", text: "Macario, teka! Ihinto mo muna 'yan." },
    { speaker: "Macario", text: "Po? May mali po ba sa tahi ko?" },
    { speaker: "Mananahi", text: "Wala, wala. Nakalimutan ko lang ang mas mahalaga." },
    { speaker: "Mananahi", text: "'Yung mga damit ng direktor para sa palabas mamayang gabi. Kanina pa dapat nakarating 'yon." },
    { speaker: "Mananahi", text: "Ikaw na ang magdala. Nasa dulo pa ng kalye ang entablado." },
    { speaker: "Macario", text: "Sige po, ihahatid ko na ngayon." },
    { speaker: "Mananahi", text: "Bilisan mo, ha. Huwag mong ibababa sa daan 'yan." },
  ]);
  setCutscene(false);
}

// ---- The Talaan ------------------------------------------------------
// Block 69 took out the words and hints the proponents did not want.
// Block 70: the teacher writes up to three papers from the dashboard
// (teacher.html, Talaan Papers), and they lie at the three places below,
// always the same ones, paper 1 at the first. The engine lays them
// (hints, fixed: true); this file only says where. The dashboard
// describes these places to the teacher in words (js/teacher-talaan.js,
// PLACES), so a spot moved here is described again there.
//
// The first is on the road between Nanay and the Kutsero, where every
// student walks. The other two are at jump height (HINT_HIGH), so Talon
// has a use on a street with no platforms. All three are well clear of
// every shadow tree and every person.
const HINT_HIGH = 155; // GROUND_LEVEL + 95: out of reach without a jump
const HINT_SPOTS = [2500, { x: 8200, y: HINT_HIGH }, { x: 12200, y: HINT_HIGH }];

// Words (a glossary) can still be added the Block 68 way: give ACT_1 a
// glossary ({ title, hint, entries: [{ id, term, text }] }) and call
// unlockGlossary(id) where each word is earned. CLAUDE.md, Act data
// format, has the rest.

// Block 108. Points in the story a tester can start from, as a guest,
// from the title screen opened with ?dev=1 (shell.js), so a block's
// checks on the phone need not be played to from the start. Each is the
// flags the story has set by then, built on the one before, and where
// Macario stands; the beat it leads to plays by itself, as after a
// reload. task is the step the log should show, and verify_new_scene.js
// starts from every point and checks it. The flag sets are the ones that
// suite's reload checks already use. items are handed over and worn, as
// the story does (the stage clothes, from the direktor after Baldovino).
const DEV_OPENING_DONE = { nakitaAngMgaSiga: true, nakausapSiNanaySaBahay: true, nagpasyangMagtrabaho: true };
const DEV_SENT_TO_DIREKTOR = Object.assign({}, DEV_OPENING_DONE, {
  nakausapAngKutsero: true, [HORSE_JOB.first]: true, [BARBER_JOB.first]: true,
  nakausapAngMananahi: true, [SEWING_JOB.first]: true, [SEWING_FLAGS[0]]: true, [SEWING_FLAGS[1]]: true,
  tinawagAngMananahi: true, mayDalangDamit: true });
const DEV_AT_THE_PLAY = Object.assign({}, DEV_SENT_TO_DIREKTOR, {
  naihatidKay_direktor: true, naihatidAngMgaDamit: true });
const DEV_PLAYED = Object.assign({}, DEV_AT_THE_PLAY, { naitanghalAngDula: true, nabayaranNgMananahi: true });
const DEV_FOUR_YEARS = Object.assign({}, DEV_PLAYED, { naibigayAngIponKayNanay: true, lumipasAngApatNaTaon: true });
const DEV_ASKED = Object.assign({}, DEV_FOUR_YEARS, { naitanghalAngBaldovino: true, nilapitanNgKatipunan: true });
const DEV_WORD_SAID = Object.assign({}, DEV_ASKED, { nakausapAngKasama: true });
const DEV_SWORN = Object.assign({}, DEV_WORD_SAID, { tinanggapSaKatipunan: true });
const DEV_ROUNDS_OVER = Object.assign({}, DEV_SWORN, Object.fromEntries(PAMPHLET_FLAGS.map((f) => [f, true])), {
  naipamigayAngTatlongPolyeto: true, nataposAngRonda: true, naipamigayAngMgaPolyeto: true });
const DEV_JUMPS = [
  { id: "trabaho", label: "Mga trabaho (pagkatapos ng simula)", scene: "tondo", x: 2150, facing: 1,
    flags: DEV_OPENING_DONE, task: "Maghanap ng trabaho: kausapin ang Kutsero" },
  { id: "direktor", label: "Ang mga damit para sa direktor", scene: "tondo", x: 13300, facing: 1,
    flags: DEV_SENT_TO_DIREKTOR, currency: 40, task: "Ihatid ang mga damit sa direktor" },
  { id: "dula", label: "Ang dula: Don Rodrigo", scene: "entablado",
    flags: DEV_AT_THE_PLAY, currency: 40, task: "Gumanap bilang Don Rodrigo sa dula" },
  { id: "ipon", label: "Ang ipon para kay Nanay", scene: "tondo", x: 1900, facing: 1,
    flags: DEV_PLAYED, currency: 120, task: "Mag-ipon para kay Nanay" },
  { id: "baldovino", label: "Apat na taon: Principe Baldovino", scene: "entablado",
    flags: DEV_FOUR_YEARS, currency: 20, task: "Gumanap bilang Principe Baldovino" },
  { id: "kasama", items: ["damit-entablado"], label: "Ang Kasama sa kalye", scene: "tondo", x: 12250, facing: 1,
    flags: DEV_ASKED, currency: 20, task: "Hanapin ang naghihintay sa kalye" },
  { id: "panunumpa", items: ["damit-entablado"], label: "Ang panunumpa", scene: "pulungan",
    flags: DEV_WORD_SAID, currency: 20, task: "Sumapi sa Katipunan" },
  { id: "polyeto", items: ["damit-entablado"], label: "Ang gabi ng mga polyeto", scene: "tondo", x: 4100, facing: 1,
    flags: DEV_SWORN, currency: 20, task: "Ipamigay ang mga polyeto" },
  { id: "ulat", items: ["damit-entablado"], label: "Ang ulat at ang wakas", scene: "pulungan",
    flags: DEV_ROUNDS_OVER, currency: 20, task: "Bumalik sa pulungan at mag-ulat" },
];

window.ACT_1 = {
  number: 1,
  title: "Origins",
  titleTagalog: "Ang Pinagmulan ni Macario",
  devJumps: DEV_JUMPS, // Block 108

  // One chain, in story order, drawn as the quest log (Block 48): the
  // task in hand is the first step whose flag is not set.
  //
  //   1  the thought on the street, at the end of the opening.
  //   2  the Kutsero's first conversation.
  //   3  the first grooming of the horse.
  //   4  Block 94: the first round of the barber's game.
  //   5  the Mananahi's first conversation.
  //   6  two rounds of sewing, then she stops him (mananahiStopsHim).
  //   7  done when Macario agrees to act, at the end of the direktor's
  //      scene (theMissingActor).
  //   8  the play, inside the entablado (thePlay), which the direktor
  //      pays for.
  //   9  Nanay's gift, "Ibigay ang ipon"; counts the barya to 100.
  //  10  Block 80: four years on, Principe Baldovino (principeBaldovino);
  //      done when the Katipunan's two men have gone (theKatipunanAsks).
  //  11  the word said to the Kasama on the street.
  //  12  the oath in the pulungan (theOath).
  //  13  counts the pamphlets; done by the beat after the third
  //      (thePamphletsDelivered).
  //  14  Block 94: the report and the year after (theReport,
  //      theYearAfter), which finishes Act I.
  linearObjectives: true,
  objectives: [
    { id: "umuwi_kasama_nanay", label: "Umuwi kasama si Nanay",
      flag: "nagpasyangMagtrabaho" },
    { id: "kausapin_kutsero", label: "Maghanap ng trabaho: kausapin ang Kutsero",
      flag: "nakausapAngKutsero" },
    { id: "alagaan_kabayo", label: "Alagaan ang kabayo ng Kutsero",
      flag: HORSE_JOB.first },
    // Block 94. The barber's first game.
    { id: "barberya", label: "Magtrabaho sa barberya",
      flag: BARBER_JOB.first },
    { id: "kausapin_mananahi", label: "Kausapin ang Mananahi",
      flag: "nakausapAngMananahi" },
    { id: "tulungan_mananahi", label: "Tulungan ang Mananahi sa pananahi",
      flag: "tinawagAngMananahi", countFlags: SEWING_FLAGS },
    { id: "ihatid_damit", label: "Ihatid ang mga damit sa direktor",
      flag: "naihatidAngMgaDamit" },
    { id: "gumanap_sa_dula", label: "Gumanap bilang Don Rodrigo sa dula",
      flag: "naitanghalAngDula" },
    { id: "mag_ipon", label: "Mag-ipon para kay Nanay",
      flag: "naibigayAngIponKayNanay", countCurrency: SAVINGS_GOAL,
      pinned: { from: "nakausapAngKutsero" } },
    { id: "gumanap_baldovino", label: "Gumanap bilang Principe Baldovino",
      flag: "nilapitanNgKatipunan" },
    { id: "hanapin_kasama", label: "Hanapin ang naghihintay sa kalye",
      flag: "nakausapAngKasama" },
    { id: "sumapi_katipunan", label: "Sumapi sa Katipunan",
      flag: "tinanggapSaKatipunan" },
    { id: "ipamigay_polyeto", label: "Ipamigay ang mga polyeto",
      flag: "naipamigayAngMgaPolyeto", countFlags: PAMPHLET_FLAGS },
    // Block 94. Done only at the very end, a year on (theYearAfter).
    { id: "mag_ulat", label: "Bumalik sa pulungan at mag-ulat",
      flag: "pinunoNgBalangay" },
  ],

  // Block 80. No holdOpen any more (Block 56 held the act open while its
  // story was unwritten): the last pamphlet's beat finishes Act I and
  // the post-test runs.

  // Block 52. A step counts barya, so the act's own barya for finishing
  // a step (acts.js, the drip) is switched off: the only barya in the
  // act is what the story pays him. The performance award is still paid
  // when Act I completes.
  objectiveCurrency: false,

  // The chain is the quest log, so there is nothing to add at the start.
  startingQuests: [],

  // Block 70. The teacher's Talaan papers. Block 94: the three below are
  // the game's own, facts from the general histories, laid when the
  // teacher has written nothing; a paper she writes on the dashboard
  // replaces its own slot only (game.js, hintsDef). Ours, accepted
  // by the proponents on 4 Oct 2026 (Block 113).
  hints: {
    count: 3,
    fixed: true,
    label: "Papel",
    listLabel: "Mga Papel",
    // Polish list #7. Where each paper lies, in English, for the teacher's
    // Talaan editor, which reads it from here. A spot moved in HINT_SPOTS
    // is described again here.
    places: [
      "On the road between Nanay and the Kutsero. Every student walks past it early in the act.",
      "Past the Mananahi's sewing, at jump height: the student has to jump for it.",
      "Near the end of the street, before the direktor, at jump height.",
    ],
    foundText: "Naitala ito sa Talaan. Buksan ang Talaan sa pause para basahin ulit.",
    completeText: "Nahanap mo na ang lahat ng papel!",
    pool: [
      { slot: 1, title: "Si Macario Sakay",
        text: "Ipinanganak si Macario Sakay sa Tondo, Maynila, noong 1870. Mahirap ang kanyang pamilya, kaya maaga siyang nagtrabaho: naging aprendis siya sa pagawaan ng kalesa, at naging barbero at mananahi." },
      { slot: 2, title: "Ang komedya",
        text: "Mahilig sa teatro si Sakay. Umarte siya sa mga komedya o moro-moro, mga dula tungkol sa digmaan ng mga kaharian. Isa sa mga ginampanan niya ang Principe Baldovino." },
      { slot: 3, title: "Ang Katipunan",
        text: "Itinatag ni Andres Bonifacio at ng kanyang mga kasama ang Katipunan noong Hulyo 7, 1892, sa Maynila. Lihim na samahan ito na naglalayong makamit ang kalayaan ng Pilipinas mula sa Espanya. Sumapi si Sakay noong 1894." },
    ],
  },


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
      hintSpots: HINT_SPOTS,
      // Block 81. The pamphlet run's guardia civil (PAMPHLET_GUARDS): the
      // catalogue's bantay, on duty only while the pamphlets are the task
      // (Block 94: until the card after the third, nataposAngRonda), not
      // shooting, so being seen is a catch rather than a gunfight on
      // a street full of neighbours.
      guards: PAMPHLET_GUARDS.map((g, i) => ({
        type: "bantay", id: "guardia-" + (i + 1), shoots: false,
        x: g.beat[0], patrolFrom: g.beat[0], patrolTo: g.beat[1], facing: 1,
        requiresFlag: "tinanggapSaKatipunan", unlessFlag: "nataposAngRonda",
      })),
      hideSpots: PAMPHLET_GUARDS.map((g) => ({ x: g.hide, width: 110,
        requiresFlag: "tinanggapSaKatipunan", unlessFlag: "nataposAngRonda" })),
      // A catch sends him to the furthest of these reached: the back door,
      // then each of the three once handed a pamphlet.
      checkpoints: [
        { x: BACK_DOOR_X, flag: "tinanggapSaKatipunan" },
        ...CITIZENS.map((c) => ({ x: c.x - BESIDE, flag: pamphletFlag(c) })),
      ],
      // Block 85. Night on the pamphlet run, as the story says it is: the
      // street darkened, and the crickets instead of the day's music.
      // Block 94: still night after the rounds, until he has reported.
      night: { requiresFlag: "tinanggapSaKatipunan", unlessFlag: "nakapagUlat",
               music: "assets/audio/music/gabi.wav" },
      // Block 81. No gun on this street: a shot at the guardia civil among
      // the neighbours is not the errand the Kasama gave (a long hold
      // punches, as on the stage).
      noRanged: true,
      decorations: [
        // Block 95. The Kasama who comes to take him back to the pulungan
        // after the pamphlets (thePamphletsDelivered), hidden until then.
        { id: "kasama-kalye", x: KASAMA_X, hidden: true, animation: KASAMA,
          walkAnimation: KASAMA_SHEETS.walk, faceMovement: true },
        // Off to the left, hidden until the opening walks them on.
        { id: "siga-1", x: 260, hidden: true, animation: SIGA[1].idle,
          walkAnimation: SIGA[1].walk, displayHeight: SIGA[1].height,
          speakers: ["Siga", "Mga Siga"] }, // the leader's bust speaks for them
        { id: "siga-2", x: 180, hidden: true, animation: SIGA[2].idle,
          walkAnimation: SIGA[2].walk, displayHeight: SIGA[2].height },
        { id: "siga-3", x: 100, hidden: true, animation: SIGA[3].idle,
          walkAnimation: SIGA[3].walk, displayHeight: SIGA[3].height },
        // Nanay while the opening moves her: off to the right, hidden
        // until she comes to call him home. The NPC below takes over
        // once she has stopped.
        // Since Block 101 she is drawn side on and turns the way she walks.
        { id: "nanay", x: 1750, hidden: true, animation: NANAY, walkAnimation: NANAY_WALK,
          faceMovement: true },
      ],
      scripts: [
        { unlessFlag: "nakausapSiNanaySaBahay", doneFlag: "nagpasyangMagtrabaho",
          x: STREET_SPOT, facing: 1, run: openingOnTheStreet },
        // A reload after the talk with Nanay and before the thought.
        { requiresFlag: "nakausapSiNanaySaBahay", doneFlag: "nagpasyangMagtrabaho",
          x: NANAY_X - BESIDE, facing: 1, run: () => thinkingAboutWork(false) },
        // Block 89. The Mananahi stops him at the sewing and sends him to
        // the direktor. No x: he is where he was sewing.
        { requiresFlag: "tinawagAngMananahi", unlessFlag: "naihatidAngMgaDamit", doneFlag: "mayDalangDamit",
          run: mananahiStopsHim },
        // Block 59. The costumes handed over, and the direktor's lead
        // actor missing.
        { requiresFlag: DIREKTOR_FLAG, doneFlag: "naihatidAngMgaDamit",
          x: DIREKTOR_X - BESIDE, facing: 1, run: theMissingActor },
        // Block 80. The savings given: four years on, into the play.
        { requiresFlag: "naibigayAngIponKayNanay", doneFlag: "lumipasAngApatNaTaon",
          x: NANAY_X - BESIDE, facing: 1, run: fourYearsLater },
        // Block 80. The third pamphlet handed over: the end of Act I.
        { requiresFlag: "naipamigayAngTatlongPolyeto", doneFlag: "naipamigayAngMgaPolyeto",
          run: thePamphletsDelivered },
      ],
      npcs: [
        {
          id: "nanay", x: NANAY_X, label: "Nanay", animation: NANAY,
          facesPlayer: true, // Block 101: drawn side on now
          startsHidden: true, revealedByFlag: "nakausapSiNanaySaBahay",
          hiddenWhile: PAMPHLET_NIGHT,
          // Block 80. With a requiresFlag among them, the set is picked
          // from the flags each time (Block 48), not stepped through.
          dialogueSets: [
            {
              // Before the savings.
              skipIfFlag: "naibigayAngIponKayNanay",
              lines: [
                { speaker: "Nanay", text: "Mag-iingat ka sa trabaho, anak. At umuwi ka bago dumilim." },
              ],
            },
            {
              skipIfFlag: "tinanggapSaKatipunan",
              lines: [
                { speaker: "Nanay", text: "Ituloy mo lang 'yan, 'nak. Malayo ang mararating mo sa buhay." },
              ],
            },
            {
              // Scan S22. After the oath: she does not know,
              // and he cannot tell her (the lie a year on starts here).
              requiresFlag: "tinanggapSaKatipunan",
              lines: [
                { speaker: "Nanay", text: "Lagi ka nang ginagabi, 'nak. Saan ka ba nanggagaling?" },
              ],
            },
          ],
          gift: {
            buttonLabel: "Ibigay ang ipon",
            requiresFlag: "naitanghalAngDula",
            requiresCurrency: SAVINGS_GOAL,
            givenFlag: "naibigayAngIponKayNanay",
            // The proponents' lines, with four of ours after
            // the third, for the play Block 59 added.
            responseLines: [
              { speaker: "Macario", text: "'Nay, nakapag-ipon na po ako ng pera para makatulong." },
              { speaker: "Nanay", text: "Maraming salamat, anak ko! Napakahusay mo! Ginalingan mo ba sa trabaho?" },
              { speaker: "Macario", text: "Opo, 'Nay. Nagtrabaho po ako sa Kutsero at sa Mananahi." },
              // Block 94, the third job.
              { speaker: "Macario", text: "Pati po sa Barbero." },
              { speaker: "Macario", text: "Tapos, Nay... umarte pa po ako sa entablado." },
              { speaker: "Nanay", text: "Ikaw? Sa entablado?" },
              { speaker: "Macario", text: "Nagkasakit po kasi 'yung bida nila. Ako na lang po ang ipinalit ng direktor." },
              { speaker: "Nanay", text: "Kaya pala hindi mawala-wala 'yang ngiti mo." },
              { speaker: "Nanay", text: "Ituloy mo lang 'yan, 'nak. Malayo ang mararating mo sa buhay." },
              { speaker: "Macario", text: "Maraming salamat po, 'Nay!" },
            ],
            // Block 80. And then four years pass (fourYearsLater), a
            // scene script waiting on this gift's flag.
            onComplete() {
              Game.spendCurrency(Math.min(SAVINGS_GOAL, Game.currency()));
              setTimeout(() => runSceneScript(), 0);
            },
          },
        },
        {
          id: "kutsero", x: KUTSERO_X, label: "Kutsero", animation: KUTSERO,
          hiddenWhile: PAMPHLET_NIGHT,
          // Picked from the flags each time, not stepped through.
          dialogueSets: [
            {
              skipIfFlag: "nakausapAngKutsero",
              lines: [
                { speaker: "Macario", text: "Kutsero, maaari po ba akong magtrabaho rito?" },
                { speaker: "Kutsero", text: "Macario? Mabuti naman at naisipan mong magtrabaho." },
                { speaker: "Macario", text: "Kailangan na po, e. Nangangailangan po si Nanay." },
                { speaker: "Kutsero", text: "O sige, magsimula ka na agad. Alagaan mo 'yung kabayo sa kuwadra." },
                // What the work is, and that it pays each time.
                { speaker: "Kutsero", text: "Suklayin mo siya. Bawat linis na matapos mo, may bayad ka sa akin." },
              ],
              onComplete() {
                state.flags.nakausapAngKutsero = true;
                markDirty();
              },
            },
            {
              // Before the first grooming.
              requiresFlag: "nakausapAngKutsero",
              skipIfFlag: "naalagaanAngKabayo",
              lines: [
                { speaker: "Kutsero", text: "Nariyan lang si Kabayo. Suklayin mo, may barya ka sa bawat linis." },
              ],
            },
            {
              // While there is more to earn.
              requiresFlag: "nakausapAngKutsero",
              skipIfFlag: HORSE_JOB.full,
              lines: [
                { speaker: "Kutsero", text: "Ang ganda ng trabaho mo. Balik ka lang kung gusto mo pa ng dagdag na barya." },
              ],
            },
            {
              // Paid all he will pay.
              lines: [
                { speaker: "Kutsero", text: HORSE_JOB.fullText },
              ],
            },
          ],
        },
        {
          // The horse, beside the Kutsero: something to use rather
          // than someone to talk to (Block 89).
          id: "kabayo", x: KABAYO_X, label: "Kabayo", animation: KABAYO,
          hiddenWhile: PAMPHLET_NIGHT, // Block 103: stabled for the night
          displayHeight: 120,
          nearSound: "assets/audio/sfx/horse.mp3",
          interactLabel: "Suklayin",
          interactIcon: "i-brush", // Block 93
          dialogueSets: [],
          onInteract: groomHorse,
        },
        {
          // Block 94. The Barbero, the third job. Before the horse he sends
          // Macario to the Kutsero, as the Mananahi sends him here, so the
          // jobs are met in the log's order and none is passed by. Closed
          // from the oath on: his stand is in the first guard's beat, and
          // the run is at night.
          id: "barbero", x: BARBERO_X, label: "Barbero", animation: BARBERO,
          hiddenByFlag: "tinanggapSaKatipunan",
          // Picked from the flags each time (Block 48).
          dialogueSets: [
            {
              skipIfFlag: HORSE_JOB.first,
              lines: [
                { speaker: "Barbero", text: "Wala pa akong maipapagawa sa'yo, iho. Pero naghahanap daw ng tagaalaga ng kabayo ang Kutsero." },
              ],
            },
            {
              requiresFlag: HORSE_JOB.first,
              skipIfFlag: "nakausapAngBarbero",
              lines: [
                { speaker: "Macario", text: "Magandang araw po. Naghahanap po ba kayo ng katulong?" },
                { speaker: "Barbero", text: "Katulong? Marunong ka bang humawak ng gunting?" },
                { speaker: "Macario", text: "Nakapagsuklay na po ako ng kabayo." },
                { speaker: "Barbero", text: "..." },
                { speaker: "Barbero", text: "Hindi kabayo ang mga suki ko, iho." },
                { speaker: "Barbero", text: "Pero sige. Makinig kang mabuti sa gusto ng suki, at sundin mo nang tama ang pagkakasunod-sunod." },
                { speaker: "Barbero", text: "Nariyan ang silya. May bayad ang bawat gupit na matapos mo." },
              ],
              onComplete() {
                state.flags.nakausapAngBarbero = true;
                markDirty();
              },
            },
            {
              // Four years on.
              requiresFlag: "lumipasAngApatNaTaon",
              lines: [
                { speaker: "Barbero", text: "Artista ka na raw, Macario. Pero hindi mo pa rin nakakalimutan ang gunting, ha?" },
              ],
            },
            {
              // Before the first cut, and while there is more to earn.
              requiresFlag: "nakausapAngBarbero",
              skipIfFlag: BARBER_JOB.full,
              lines: [
                { speaker: "Barbero", text: "Nariyan ang silya, iho. Tandaan mo lang ang gusto ng suki." },
              ],
            },
            {
              lines: [
                { speaker: "Barbero", text: BARBER_JOB.fullText },
              ],
            },
          ],
        },
        {
          // Block 94. His chair, used with E, as the tahian is: the
          // barber's own game (cutHair). Owed (ART.md), a placeholder box.
          id: "silya", x: SILYA_X, label: "Silya", animation: SILYA, displayHeight: 90,
          hiddenByFlag: "tinanggapSaKatipunan",
          interactLabel: "Gupitin",
          interactIcon: "i-scissors",
          dialogueSets: [],
          onInteract: cutHair,
        },
        {
          // The Mananahi's sewing table, beside her, used with E (Block
          // 89). Scenery with no picture until Block 93, which named one,
          // owed (ART.md), so the table is seen: the placeholder box until
          // the artist draws it.
          id: "tahian", x: TAHIAN_X, label: "Tahian", animation: TAHIAN, displayHeight: 90,
          hiddenWhile: PAMPHLET_NIGHT, // Block 103: taken in for the night
          interactLabel: "Manahi",
          interactIcon: "i-needle", // Block 93
          dialogueSets: [],
          onInteract: sew,
        },
        {
          id: "mananahi", x: MANANAHI_X, label: "Mananahi", animation: MANANAHI,
          dialogueSets: [
            {
              // Block 94. Before the barber: she sends him
              // there first, so the jobs are met in the log's order.
              skipIfFlag: BARBER_JOB.first,
              lines: [
                { speaker: "Mananahi", text: "Wala pa akong maipapatahi sa'yo ngayon, iho. Pero balita ko, naghahanap ng katulong ang Barbero. Puntahan mo muna siya." },
              ],
            },
            {
              skipIfFlag: "nakausapAngMananahi",
              lines: [
                { speaker: "Macario", text: "Mananahi, tumatanggap po ba kayo ng trabahador?" },
                { speaker: "Mananahi", text: "Oo naman, Macario. Kumusta na ang inay mo?" },
                { speaker: "Macario", text: "Ayos lang po. Nangangailangan lang po kami ng pera ngayon." },
                { speaker: "Mananahi", text: "O, sige, sige. Tara rito." },
                // What the work is, and that it pays each time.
                { speaker: "Mananahi", text: "Nariyan ang tahian. Tulungan mo akong magtahi, may bayad ang bawat matapos mo." },
              ],
              onComplete() {
                state.flags.nakausapAngMananahi = true;
                markDirty();
              },
            },
            {
              // Sent with the costumes, not yet delivered.
              requiresFlag: "mayDalangDamit",
              skipIfFlag: "naihatidAngMgaDamit",
              lines: [
                { speaker: "Mananahi", text: "Ihatid mo na 'yung damit ng direktor, baka hinahanap na nila." },
              ],
            },
            {
              // While there is sewing to do.
              skipIfFlag: "mayDalangDamit",
              lines: [
                { speaker: "Mananahi", text: "Nariyan ang tahian, kung gusto mo pa ng dagdag na barya." },
              ],
            },
            {
              // Delivered, and the play not yet done: only an
              // old save or a reload mid-fade reaches this.
              skipIfFlag: "naitanghalAngDula",
              lines: [
                { speaker: "Mananahi", text: "Hinahanap ka raw ng direktor sa entablado. Bilisan mo!" },
              ],
            },
            {
              // Scan S22. Four years on, while her sewing
              // still pays.
              requiresFlag: "lumipasAngApatNaTaon",
              skipIfFlag: SEWING_JOB.full,
              lines: [
                { speaker: "Mananahi", text: "Nariyan pa rin ang tahian, iho, kung may oras ka." },
              ],
            },
            {
              // Four years on, once it has paid all it will.
              lines: [
                { speaker: "Mananahi", text: "Kapag may tahi ulit, ipapatawag kita, ha?" },
              ],
            },
          ],
          // Block 85. At the play from the night of it until the years
          // pass: she is outside the entablado (below), so being paid is
          // not a 7000px walk back to her shop.
          hiddenWhile: [{ requiresFlag: "naitanghalAngDula", unlessFlag: "lumipasAngApatNaTaon" }, PAMPHLET_NIGHT],
        },
        {
          // Block 85. The Mananahi after the first play, outside the
          // entablado: she came to watch the costume she sewed, and has
          // seen it herself rather than heard it. She no longer pays
          // (Block 89): the work paid each time.
          id: "mananahi-sa-entablado", x: MANANAHI_AT_PLAY_X, label: "Mananahi", animation: MANANAHI,
          startsHidden: true, revealedByFlag: "naitanghalAngDula", hiddenByFlag: "lumipasAngApatNaTaon",
          dialogueSets: [
            {
              // After the play.
              lines: [
                { speaker: "Mananahi", text: "Macario! Nanood ako sa likod. Ikaw pala ang bumida!" },
                { speaker: "Macario", text: "Nawala po kasi 'yung artista nila. Ako na lang po ang pinagsuot ng damit." },
                { speaker: "Mananahi", text: "Aba, e 'di ikaw pala ang unang nagsuot ng tinahi ko! Kasya ba?" },
                { speaker: "Macario", text: "Kasyang-kasya po." },
                { speaker: "Mananahi", text: "Sabi ko na nga ba." },
              ],
            },
            {
              // Afterwards, before the savings are given.
              lines: [
                { speaker: "Mananahi", text: "Iuwi mo na 'yang naipon mo sa nanay mo. Matutuwa 'yon." },
              ],
            },
          ],
        },
        {
          // The direktor, on the street by the entablado: the one
          // delivery, and the story's turn (Block 59).
          id: "direktor", x: DIREKTOR_X, label: "Direktor", animation: DIREKTOR,
          hiddenWhile: PAMPHLET_NIGHT,
          facesPlayer: true,
          // With a requiresFlag among them, the set is picked from the
          // flags each time (CLAUDE.md, Block 48), so the one that takes
          // him inside comes first.
          dialogueSets: [
            {
              // Macario said yes, and a reload or an old save left him on
              // the street: the direktor takes him in.
              requiresFlag: "naihatidAngMgaDamit",
              skipIfFlag: "naitanghalAngDula",
              lines: [
                { speaker: "Direktor", text: "O, ano pa'ng hinihintay natin? Tara na sa loob, naghihintay na ang mga tao!" },
              ],
              onComplete() {
                if (window.Acts) Acts.gotoScene("entablado", { x: STAGE_ENTER_X, facing: -1 });
              },
            },
            {
              // Before the Mananahi has sent him.
              skipIfFlag: "mayDalangDamit",
              lines: [
                { speaker: "Direktor", text: "Pasensya na, iho, abala kami. Mamayang gabi na ang palabas at ang dami pang kulang." },
              ],
            },
            {
              // Sent, with the costumes still on him; they are his gift
              // button.
              skipIfFlag: DIREKTOR_FLAG,
              lines: [
                { speaker: "Direktor", text: "Ikaw 'yung bata ng Mananahi, 'di ba? Dala mo na ba ang mga damit namin?" },
              ],
            },
            {
              // Block 80. Four years on, after Principe Baldovino.
              requiresFlag: "lumipasAngApatNaTaon",
              lines: [
                { speaker: "Direktor", text: "Apat na taon na, iho, at ikaw pa rin ang hinahanap ng mga manonood." },
              ],
            },
            {
              // Afterwards.
              lines: [
                { speaker: "Direktor", text: "Hindi pa rin ako makapaniwala. Iniligtas mo ang palabas namin, iho." },
              ],
            },
          ],
          gift: {
            buttonLabel: "Iabot ang damit",
            requiresFlag: "mayDalangDamit",
            givenFlag: DIREKTOR_FLAG,
            responseLines: [
              { speaker: "Macario", text: "Magandang hapon po. Padala po ng Mananahi, 'yung mga damit para sa palabas." },
              { speaker: "Direktor", text: "Salamat sa Diyos, dumating din! Akin na, iho." },
            ],
            // His scene (theMissingActor) is waiting on this flag.
            onComplete() {
              setTimeout(() => runSceneScript(), 0);
            },
          },
        },
        {
          // Block 80. The Kasama, on the street once the Katipunan has
          // found Macario in the wings. The word said, he takes him to
          // the pulungan; a reload before the oath is over leaves him
          // here to be asked again.
          id: "kasama", x: KASAMA_X, label: "Kasama", animation: KASAMA,
          facesPlayer: true,
          startsHidden: true, revealedByFlag: "nilapitanNgKatipunan",
          // Block 95. Away while he comes to Macario after the rounds (a
          // decoration, kasama-kalye, thePamphletsDelivered); back here
          // after, for a reload that lands before the report. Block 102:
          // and off the street the whole run, from the oath.
          hiddenWhile: { requiresFlag: "tinanggapSaKatipunan", unlessFlag: "naipamigayAngMgaPolyeto" },
          dialogueSets: [
            {
              // Block 95. Afterwards, a year on.
              requiresFlag: "nakapagUlat",
              lines: [
                { speaker: "Kasama", text: "Sa pulungan na tayo mag-usap, Pangulo. Maraming mata ang kalye." },
              ],
            },
            {
              // Block 95. The pamphlets given, the report not
              // yet made (a reload): he takes him back.
              requiresFlag: "naipamigayAngMgaPolyeto",
              skipIfFlag: "nakapagUlat",
              lines: [
                { speaker: "Kasama", text: "Mabuti. Sumunod ka. Hinihintay ka nila sa pulungan." },
              ],
              onComplete: toThePulunganAgain,
            },
            {
              requiresFlag: "nakausapAngKasama",
              skipIfFlag: "tinanggapSaKatipunan",
              lines: [
                { speaker: "Kasama", text: "Ano pa'ng hinihintay mo? Sumunod ka na." },
              ],
              onComplete: intoThePulungan,
            },
            {
              skipIfFlag: "nakausapAngKasama",
              lines: [
                { speaker: "Macario", text: "Anak ng Bayan." },
                { speaker: "Kasama", text: "..." },
                { speaker: "Kasama", text: "Walang sumunod sa'yo?" },
                { speaker: "Macario", text: "Wala po." },
                { speaker: "Kasama", text: "Sumunod ka sa akin. Huwag kang lilingon." },
              ],
              onComplete() {
                state.flags.nakausapAngKasama = true;
                markDirty();
                intoThePulungan();
              },
            },
            {
              lines: [
                { speaker: "Kasama", text: "Huwag kang tumambay rito. Ipamigay mo na ang mga polyeto." },
              ],
            },
          ],
        },
        // Block 80. The three who take the pamphlets (CITIZENS, above),
        // there once Macario is sworn in. Each is a gift, as the
        // Mananahi's customers are, counted from the flags so the order
        // does not matter and a reload cannot miscount.
        ...CITIZENS.map((c) => ({
          id: c.id, x: c.x, label: c.label, animation: c.animation,
          startsHidden: true, revealedByFlag: "tinanggapSaKatipunan",
          dialogueSets: [
            // requiresFlag picks from the flags (Block 48), so talking
            // twice before the hand-over does not reach the thanks after.
            { skipIfFlag: pamphletFlag(c),
              lines: [{ speaker: c.label, text: c.waiting }] },
            { requiresFlag: pamphletFlag(c),
              lines: [{ speaker: c.label, text: c.after }] },
          ],
          gift: {
            buttonLabel: "Iabot ang polyeto",
            requiresFlag: "tinanggapSaKatipunan",
            givenFlag: pamphletFlag(c),
            responseLines: [
              { speaker: "Macario", text: "Para po sa inyo. Itago n'yo po, at basahin nang palihim." },
              { speaker: c.label, text: c.thanks },
            ],
            // The third, whichever it is, starts the last beat.
            onComplete() {
              if (CITIZENS.every((x) => state.flags[pamphletFlag(x)])) {
                state.flags.naipamigayAngTatlongPolyeto = true;
                setTimeout(() => runSceneScript(), 0);
              }
              markDirty();
            },
          },
        })),
      ],
    },
    {
      // Block 56. Inside the entablado, one screen wide with its own
      // floor. Since Block 57 the only way in is with the direktor, and
      // since Block 59 it is where the play happens (thePlay). No gun
      // on a stage: a long hold punches (noRanged).
      id: "entablado",
      worldWidth: STAGE_WIDTH,
      backdrop: { src: "assets/backgrounds/act1/entablado-inside.jpg" },
      ground: false,
      noRanged: true,
      startX: STAGE_ENTER_X,
      // Block 93. Said at the top of the log once the student is free
      // here: nothing else says the way out is at the right edge.
      wayOut: "Lumabas ng entablado: pumunta sa kanan",
      // Block 93. The actors stand low on the stage, under the box.
      dialogueAtTop: true,
      exits: [
        { id: "labas", x: STAGE_WIDTH - 70, width: 70, label: "Lumabas",
          toScene: "tondo", toX: DIREKTOR_X - BESIDE, toFacing: 1 },
      ],
      scripts: [
        // The first play. Never after the jump in time (Block 80): a save
        // from before Block 59 that gave Nanay the savings without it
        // goes on to Principe Baldovino instead.
        { requiresFlag: "naihatidAngMgaDamit", unlessFlag: "lumipasAngApatNaTaon",
          doneFlag: "naitanghalAngDula", x: STAGE_ENTER_X, facing: -1, run: thePlay },
        // Block 80. A reload after Principe Baldovino and before the two
        // men have gone plays only them. Listed before the play, which
        // it follows, because the first entry that is due is the one run.
        { requiresFlag: "naitanghalAngBaldovino", doneFlag: "nilapitanNgKatipunan",
          x: APPROACH_X, facing: 1, run: theKatipunanAsks },
        // Block 80. Four years on, in the middle of the play.
        { requiresFlag: "lumipasAngApatNaTaon", doneFlag: "naitanghalAngBaldovino",
          x: STAGE_PLAY_X, facing: -1, run: principeBaldovino },
      ],
      decorations: [
        // The Sultan: off stage in the right wing until he walks on. He
        // marches while he walks, stands with the idle, and turns the
        // way he goes (Block 101).
        { id: "sultan", x: STAGE_WIDTH + 100, hidden: true,
          animation: SULTAN.idle, walkAnimation: SULTAN.walk, faceMovement: true },
        // Block 80. The Katipunan's two men, in the right wing until they
        // come to find him after Principe Baldovino.
        { id: "katipunero", x: STAGE_WIDTH + 100, hidden: true, animation: KATIPUNERO,
          walkAnimation: KATIPUNERO_SHEETS.walk, faceMovement: true },
        { id: "kasama", x: STAGE_WIDTH + 180, hidden: true, animation: KASAMA,
          walkAnimation: KASAMA_SHEETS.walk, faceMovement: true },
      ],
      npcs: [
        {
          id: "direktor", x: STAGE_DIREKTOR_X, label: "Direktor", animation: DIREKTOR,
          facesPlayer: true,
          // Block 80. Picked from the flags (Block 48): before the first
          // play, after it, and four years on.
          dialogueSets: [
            {
              skipIfFlag: "naitanghalAngDula",
              lines: [
                { speaker: "Direktor", text: "Huminga ka nang malalim, iho. Nandito lang ako sa gilid." },
              ],
            },
            {
              skipIfFlag: "lumipasAngApatNaTaon",
              lines: [
                { speaker: "Direktor", text: "Bumalik ka rito kahit kailan mo gusto. May puwesto ka sa amin." },
              ],
            },
            {
              // Block 80.
              requiresFlag: "lumipasAngApatNaTaon",
              lines: [
                { speaker: "Direktor", text: "Magpahinga ka na, iho. May palabas ulit tayo sa Sabado." },
              ],
            },
          ],
        },
        {
          id: "maryam", x: STAGE_MARYAM_X, label: "Maryam", animation: MARYAM,
          dialogueSets: [
            {
              skipIfFlag: "naitanghalAngDula",
              lines: [
                { speaker: "Maryam", text: "Kaya mo 'yan. Tumingin ka lang sa akin kapag nalito ka." },
              ],
            },
            {
              skipIfFlag: "lumipasAngApatNaTaon",
              lines: [
                { speaker: "Maryam", text: "Alam mo, mas bagay sa'yo si Don Rodrigo kaysa kay Julian. Huwag mo lang sasabihin sa kanya." },
              ],
            },
            {
              // Block 80. She saw the two men.
              requiresFlag: "lumipasAngApatNaTaon",
              lines: [
                { speaker: "Maryam", text: "Sino 'yung dalawang lalaking kausap mo kanina? Ang seryoso ng mga mukha." },
              ],
            },
          ],
        },
      ],
    },
    {
      // Block 80. The Katipunan's secret room, reached only with the
      // Kasama, once, through a black card (intoThePulungan). One screen
      // wide. Its picture is owed (ART.md), so the engine draws a dark
      // room with the file name on it until it arrives; the dirt strip
      // stays until then, and a painting with its own floor sets ground:
      // false. The way out stays shut until he is sworn in. Since Block 81
      // it is the back way ("Sa likod ka dadaan"), onto the street short
      // of the mangingisda, facing the three and the guardia civil.
      id: "pulungan",
      worldWidth: PULUNGAN_WIDTH,
      backdrop: { src: "assets/backgrounds/act1/pulungan.jpg" },
      noRanged: true,
      startX: PULUNGAN_ENTER_X,
      wayOut: "Lumabas sa likod: pumunta sa kaliwa", // Block 93
      exits: [
        { id: "labas", x: 0, width: 70, label: "Lumabas sa likod", requiresFlag: "tinanggapSaKatipunan",
          toScene: "tondo", toX: BACK_DOOR_X, toFacing: 1 },
      ],
      scripts: [
        // Block 94. A reload after the report and before the end plays
        // only the year after. Listed first: the first entry due is run.
        { requiresFlag: "nakapagUlat", doneFlag: "pinunoNgBalangay", run: theYearAfter },
        // Block 94. Back through the back door with the three given.
        { requiresFlag: "naipamigayAngMgaPolyeto", doneFlag: "nakapagUlat",
          x: PULUNGAN_ENTER_X, facing: 1, run: theReport },
        { requiresFlag: "nakausapAngKasama", doneFlag: "tinanggapSaKatipunan",
          x: PULUNGAN_ENTER_X, facing: 1, run: theOath },
      ],
      // Block 94. The year after (theYearAfter): the room's people as
      // decorations that can move, and Nanay at the door, all hidden
      // until it plays.
      decorations: [
        { id: "katipunero-1895", x: BEFORE_HEAD_X, hidden: true, animation: KATIPUNERO,
          walkAnimation: KATIPUNERO_SHEETS.walk, faceMovement: true },
        { id: "mabalasig-1895", x: PULUNGAN_KATIPUNERO_X, hidden: true, animation: MABALASIG },
        { id: "kasama-1895", x: -120, hidden: true, animation: KASAMA,
          walkAnimation: KASAMA_SHEETS.walk, faceMovement: true },
        { id: "nanay-1895", x: DOOR_X, hidden: true, animation: NANAY },
      ],
      npcs: [
        {
          id: "kasama", x: PULUNGAN_KASAMA_X, label: "Kasama", animation: KASAMA,
          facesPlayer: true,
          hiddenWhile: { requiresFlag: "lumipasAngIsangTaon", unlessFlag: "pinunoNgBalangay" },
          dialogueSets: [
            {
              // Block 94, a year on.
              requiresFlag: "pinunoNgBalangay",
              lines: [
                { speaker: "Kasama", text: "Umuwi na ang nanay mo, Pangulo. Hindi ko siya pinapasok." },
              ],
            },
            {
              lines: [
                { speaker: "Kasama", text: "Lumabas ka nang mag-isa. Hindi tayo dapat makitang magkasama." },
              ],
            },
          ],
        },
        {
          id: "mabalasig", x: MABALASIG_X, label: "Mabalasig", animation: MABALASIG,
          facesPlayer: true,
          hiddenWhile: { requiresFlag: "lumipasAngIsangTaon", unlessFlag: "pinunoNgBalangay" },
          dialogueSets: [
            {
              // Block 94, a year on.
              requiresFlag: "pinunoNgBalangay",
              lines: [
                { speaker: "Mabalasig", text: "Nakapiring na ang tatlo sa kabilang silid, Pangulo." },
              ],
            },
            {
              lines: [
                { speaker: "Mabalasig", text: "Humayo ka na, kapatid. Naghihintay ang tatlo." },
              ],
            },
          ],
        },
        {
          id: "katipunero", x: PULUNGAN_KATIPUNERO_X, label: "Katipunero", animation: KATIPUNERO,
          facesPlayer: true,
          hiddenWhile: { requiresFlag: "lumipasAngIsangTaon", unlessFlag: "pinunoNgBalangay" },
          dialogueSets: [
            {
              // Block 94, a year on.
              requiresFlag: "pinunoNgBalangay",
              lines: [
                { speaker: "Katipunero", text: "Naipadala na ang mga polyeto, Pangulo. Tatlong daan, gaya ng utos mo." },
              ],
            },
            {
              lines: [
                { speaker: "Katipunero", text: "Sa susunod na palabas mo, manonood ulit ako. Sa likod, gaya ng dati." },
              ],
            },
          ],
        },
      ],
    },
  ],
};
