// =============================================================
// MACARIO — content/act1.js
//
// Act I, rewritten from the start in Block 52 against the proponents'
// new script and plot, rebuilt in Block 57 around one street, and given
// its stage in Block 59: no jump in time, the direktor is the last of
// the Mananahi's deliveries, and the delivery turns into Macario's first
// play. What came before is in git history and CLAUDE.md, Decisions on
// record. None of it should be copied back in without a reason.
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
//   50 barya. Then the Mananahi: three finished orders, to Aling Rosa,
//   to Mang Tomas, and last to the direktor at the far end of the
//   street, whose are the costumes for tonight's play.
//
//   The direktor's lead actor has not come; he is sick, and the seats
//   are full. The costume fits Macario, so the direktor begs him to
//   take the part, promising to whisper every line from the wings. They
//   go into the entablado (the one scene change): Maryam walks him
//   through the story backstage, the curtain opens, Macario forgets his
//   first line and then adds one of his own, the Sultan's soldiers
//   attack (a real fight, spawnEnemies), the Sultan gives his blessing,
//   and the curtain closes on a standing crowd. The direktor pays him.
//
//   Back on the street the Mananahi pays him and he gives Nanay the 100.
//
// Block 80, the end of the act, at the proponent's direction:
//
//   A black card, four years on, and Macario is the lead of the
//   company, playing Principe Baldovino in the entablado. After the
//   curtain two men of the Katipunan find him in the wings and ask
//   whether he is sure he wants to join; he is, and is given a password
//   for the one who will wait on the street. Saying it there takes him
//   to a secret room (pulungan), where he answers the three questions,
//   signs in his own blood, and is sent out with pamphlets for three
//   people on the street. The third handed over ends Act I, and the
//   post-test runs.
//
// The lines are the proponents' script as written, apostrophes
// straightened. Lines marked PLACEHOLDER are ours, to be replaced by
// the proponents: everything the job-givers, the horse, the customers,
// the direktor and the plays say beyond the lines the script gave, and
// every line of Block 80.
//
// Art. Block 59 deleted every picture made in code or recoloured from
// the artist's frames (the siga, the Mananahi, the apple tree, the
// Block 41 stand-ins) at the proponent's request, so anyone without
// the artist's own sheet names a file that does not exist and is drawn
// as the dashed placeholder box with that name on it: mananahi.png,
// direktor.png, aling-rosa.png. The siga are the exception since Block
// 72: drawn from nothing by _dev/tools/draw-siga.js at the proponent's
// request, not traced or recoloured from anyone's sheet. Real
// art replaces each by being saved under that name and measured
// (measure-sprite.js); the def below then gains its columns, frames and
// the three numbers.
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

// Nanay's real sheet (5 by 3, 14 frames). Block 57: she slides on with
// it rather than walking, at the proponent's direction.
const NANAY = {
  src: "assets/sprites/characters/nanay.png", frames: 14, fps: 6, columns: 5,
  contentTop: 45, contentHeight: 166, footX: 127,
};

// The three siga (Block 72), each an idle sheet and a walk sheet drawn
// by _dev/tools/draw-siga.js: the leader in the red panyo, the big one
// in the buri hat, the small one in the ochre shirt. The walk shows only
// while the opening walks them on (walkAnimation). footX is the hip, 128,
// on both sheets, so a boy does not slide when he stops; the walk's own
// measured stance (124) would move him four pixels. height keeps them
// three sizes: spriteFit draws every sheet DISPLAY_HEIGHT tall, so a boy
// taller or shorter than Macario's 127 says so here.
const sigaSheets = (n, top, height) => ({
  idle: { src: `assets/sprites/characters/siga-${n}.png`, frames: 12, fps: 7, columns: 4,
          contentTop: top, contentHeight: height, footX: 128 },
  walk: { src: `assets/sprites/characters/siga-${n}-walk.png`, frames: 8, fps: 14, columns: 4,
          contentTop: top, contentHeight: height, footX: 128 },
  height: Math.round(134 * height / 127),
});
const SIGA = {
  1: sigaSheets(1, 61, 127),
  2: sigaSheets(2, 51, 137),
  3: sigaSheets(3, 73, 115),
};

// The Kutsero's real sheet (Block 33). The Mananahi is a placeholder.
const KUTSERO = {
  src: "assets/sprites/characters/kutsero.png", frames: 12, fps: 6, columns: 5,
  contentTop: 74, contentHeight: 117, footX: 128,
};
const MANANAHI = { src: "assets/sprites/characters/mananahi.png", frames: 1, fps: 1 };
// The white horse: a 22-frame strip of 32px cells.
const KABAYO = {
  src: "assets/sprites/characters/kabayo.png", frames: 22, fps: 10, columns: 22,
  contentTop: 2, contentHeight: 30, footX: 19,
};
// The direktor. A placeholder, on the street and inside alike.
const DIREKTOR = { src: "assets/sprites/characters/direktor.png", frames: 1, fps: 1 };

// The play's cast, all real art. Maryam (5 by 3, 13 frames, drawn
// facing right). The Sultan walks on the walk sheet of his soldiers,
// who are the "kawal" of the enemy catalogue (content/enemies.js,
// Block 76), where their sheets and numbers are.
const MARYAM = {
  src: "assets/sprites/characters/maryam.png", frames: 13, fps: 6, columns: 5,
  contentTop: 73, contentHeight: 117, footX: 128,
};
const MORO_WALK = window.ENEMY_TYPES.kawal.animation;

// Block 80. The Katipunan's people and the three who take the pamphlets,
// all owed (ART.md): the Katipunero who speaks in the wings, the Kasama
// beside him who then waits on the street and leads the way in, and
// (Block 81, after the histories) the Mabalasig, the "terrible brother"
// who conducted a recruit's rite.
const owed = (name) => ({ src: `assets/sprites/characters/${name}.png`, frames: 1, fps: 1 });
const KATIPUNERO = owed("katipunero");
const KASAMA = owed("kasama");
const MABALASIG = owed("mabalasig");

// The guards of the Test Room are the "bantay" of the enemy catalogue
// (content/enemies.js, Block 76), where their art and numbers are.

// ---- Where everyone stands ---------------------------------------
// An NPC's x is the left edge of an 80px body. Joins at 1450, 2900,
// 4350, 5800, 7250, 8700, 10150, 11600 and 13050.
const STREET_SPOT = 900;      // Macario, for the opening
const NANAY_X = 2000;         // where she and Macario walk to, and stay
const KUTSERO_X = 3300;
const KABAYO_X = 3560;
// Block 69. The apple tree is the silhouette tree over the join at 5800
// (a broadleaf, not a palm), so it needs no picture of its own: its
// body is centred on the trunk.
const PUNO_X = 5800 - 40;
const MANANAHI_X = 6400;
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

// Block 80. The Kasama waits on the street "bago ang entablado", between
// the last join (13050) and Mang Tomas, left of the direktor.
const KASAMA_X = 12500;

// Block 80. The secret room, one screen wide like the entablado: the way
// out on the left, where he came in, the Kasama by it, the Mabalasig and
// the Katipunero at the far end. Its picture is owed (ART.md).
const PULUNGAN_WIDTH = 1180;
const PULUNGAN_ENTER_X = 120;
const PULUNGAN_KASAMA_X = 300;
const MABALASIG_X = 760;
const PULUNGAN_KATIPUNERO_X = 920;

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
  { beat: [7400, 8000], hide: 7650 },   // past the tabakera, before Aling Rosa
  { beat: [9700, 10150], hide: 9880 },  // past Mang Tomas, before the karpintero
];
// A guard's sight is 260 from the middle of his body, so each beat's
// right end stops short of the next person's hand-over spot (x - 120).

// The guards' room (Block 73, work in progress, not the plot): three
// paintings of the town, three guards, and a door back to Nanay at the
// far end. Joins at 1450 and 2900.
const BANTAYAN_WIDTH = 3 * PANEL; // 4350
const BANTAYAN_START = 150;

const SAVINGS_GOAL = 100;
const JOB_PAY = 50; // each job pays this, once; the two make the savings

// Three apples, one flag each, so the quest line can count them
// (countFlags) and a student who stops at two keeps two.
const APPLE_FLAGS = ["nakuhangMansanas1", "nakuhangMansanas2", "nakuhangMansanas3"];

// Block 57, cut to two in Block 59. The Mananahi's customers on the
// way, one table from which the people, the gifts and the flags are
// derived. The direktor is the third delivery and the last,
// and is written out on his own below, because his is where the story
// turns. Names and lines are PLACEHOLDER. Mang Tomas wears the
// Tindero's real sheet; Aling Rosa is a placeholder.
const CUSTOMERS = [
  { id: "aling-rosa", label: "Aling Rosa", x: 7800,
    animation: { src: "assets/sprites/characters/aling-rosa.png", frames: 1, fps: 1 },
    waiting: "Hay naku, ang tagal naman ng baro ko. Pista pa naman bukas.",
    thanks: "Ay, salamat, iho! Pakisabi sa Mananahi, ang ganda ng pagkakatahi.",
    after: "Isusuot ko 'to bukas sa pista. Abangan mo ako, ha!" },
  { id: "mang-tomas", label: "Mang Tomas", x: 9300,
    animation: { src: "assets/sprites/characters/tindero.png", frames: 14, fps: 6, columns: 5,
                 contentTop: 69, contentHeight: 121, footX: 128 },
    waiting: "Galing ka ba sa Mananahi? Kanina ko pa hinihintay 'yung pantalon ko.",
    thanks: "Aba, sakto 'to sa akin. Salamat, bata.",
    after: "Salamat ulit, bata. Ingat ka sa daan." },
];
const customerFlag = (c) => "naihatidKay_" + c.id.replace(/-/g, "_");
const DIREKTOR_FLAG = "naihatidKay_direktor";
// All three deliveries, in the order the quest line counts them.
const DELIVERY_FLAGS = [...CUSTOMERS.map(customerFlag), DIREKTOR_FLAG];

// Block 80. The three who take the Katipunan's pamphlets, on the street
// once Macario has been sworn in, in the order the Kasama names them and
// (Block 81) the order he meets them from the back door: the mangingisda
// before the apple tree, the tabakera past the Mananahi, the karpintero
// past Mang Tomas. All clear of the joins by 270px or more. Names and
// lines are PLACEHOLDER; their art is owed.
const CITIZENS = [
  { id: "mangingisda", label: "Mangingisda", x: 4800, animation: owed("mangingisda"),
    waiting: "Maaga pa ako bukas sa laot. Ano'ng kailangan mo?",
    thanks: "Matagal ko nang hinihintay 'to. Sa bangka ko itatago, walang guardia na sumisilip doon.",
    after: "Nabasa ko na. Ipinasa ko na rin sa kapitbahay." },
  { id: "tabakera", label: "Tabakera", x: 6900, animation: owed("tabakera"),
    waiting: "Pagod na ako, iho. Maghapon akong nagbalot ng tabako.",
    thanks: "Isisingit ko 'to sa mga tabako. Maraming babae sa pagawaan ang dapat makabasa nito.",
    after: "Kumakalat na sa pagawaan ang ibinigay mo. Mag-ingat ka, ha." },
  { id: "karpintero", label: "Karpintero", x: 10600, animation: owed("karpintero"),
    waiting: "Gabi na, iho. Sarado na ang talyer.",
    thanks: "Katipunan? ...Itatago ko 'to. Ipapabasa ko sa mga kasama ko sa talyer.",
    after: "Wala akong nakita, wala akong narinig. Ingat ka, iho." },
];
const pamphletFlag = (c) => "naibigayAngPolyetoKay_" + c.id;
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
// Block 59. The last delivery. The costumes are handed over (the
// direktor's gift button), and a scene script in tondo takes it from
// there: his lead actor is missing, the house is full, and the costume
// fits the boy who brought it. Started straight from the gift by
// runSceneScript; a reload before Macario says yes plays it again from
// the top. It ends by going inside, without awaiting the fade, and its
// doneFlag is the delivery step's own flag, so "Bagong gawain" names
// the play as they go in. PLACEHOLDER, every line.
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
// PLACEHOLDER, every line.
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
  // him, so he finishes leaving first.
  await sultanOff;
  showDecoration("sultan", true);
  turnPlayer(1);
  await moveDecoration("sultan", SULTAN_MARK, 200);
  await playDialogue([
    { speaker: "Sultan", text: "Natalo... ang lahat ng aking kawal?" },
    { speaker: "Sultan", text: "Kung ganyan katapang ang pag-ibig mo sa aking anak, sino ako para humadlang?" },
    { speaker: "Maryam", text: "Ama!" },
    { speaker: "Sultan", text: "Sa inyo na ang aking basbas." },
    { speaker: "Mga Manonood", text: "Mabuhay! Mabuhay!" },
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
// PLACEHOLDER, every line.
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
  await playIntertitle(["Pagkalipas ng apat na taon",
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
  placePlayer(STAGE_PLAY_X, -1);
  await wait(300);

  await playDialogue([
    { speaker: "Maryam", text: "Iniligtas mo ako, mahal kong prinsipe!" },
    { speaker: "Macario", text: "At tandaan ng lahat ng nakikinig:" },
    { speaker: "Macario", text: "Walang bayang mananatiling alipin, kung ang mga anak nito ay handang lumaban!" },
    { speaker: "Direktor (pabulong)", text: "Wala na naman 'yan sa iskrip..." },
    { speaker: "Mga Manonood", text: "..." },
    { speaker: "Mga Manonood", text: "Mabuhay si Baldovino!" },
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
    { speaker: "Katipunero", text: "Kung gayon, makinig ka." },
    { speaker: "Kasama", text: "Paglabas mo, hanapin mo ako sa kalye, bago ang entablado." },
    { speaker: "Kasama", text: "Lalapitan mo ako at sasabihin mo: \"Anak ng Bayan.\" Kapag hindi mo 'yon sinabi, hindi kita kilala." },
    { speaker: "Macario", text: "Anak ng Bayan." },
    { speaker: "Kasama", text: "Hindi rito. Sa labas." },
  ]);
  await Promise.all([
    moveDecoration("katipunero", STAGE_WIDTH + 100, 200),
    moveDecoration("kasama", STAGE_WIDTH + 180, 200),
  ]);
  showDecoration("katipunero", false);
  showDecoration("kasama", false);
  state.flags.nilapitanNgKatipunan = true;
  markDirty();
  setCutscene(false);
}

// The Kasama on the street, once the word is said: the blindfold, as a
// recruit was led in, and the fade into the room (the Test Room's way
// in, Block 74).
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
    { speaker: "Mabalasig", text: "Basahin mo ang nakasulat sa dingding." },
    { speaker: "Macario", text: "\"Kung may lakas at tapang ka, magpatuloy ka. Kung pag-uusisa lamang ang nagdala sa iyo rito, umalis ka na.\"" },
    { speaker: "Mabalasig", text: "Ako ang Mabalasig. Ito na ang huli mong pagkakataong umatras." },
    { speaker: "Mabalasig", text: "Kung kulang ang tapang mo, walang lugar para sa iyo rito." },
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
  await playIntertitle(["Tumalon siya.", "Walang apoy. Pagsubok lamang iyon ng kanyang tapang."]);
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
    { speaker: "Mabalasig", text: "Heto ang una mong gawain. Mga polyeto." },
    { speaker: "Mabalasig", text: "Nakasulat diyan kung bakit tayo lumalaban. Kailangang mabasa ito ng ating mga kababayan." },
    { speaker: "Kasama", text: "Sa likod ka dadaan. Ang mangingisda ang pinakamalapit, bago ang puno ng mansanas. Ang tabakera, lampas sa patahian. Ang karpintero, lampas pa kay Mang Tomas." },
    { speaker: "Kasama", text: "May mga guardia civil na nagroronda ngayong gabi. Huwag kang dadaan sa harap nila. Magtago ka kung kailangan." },
    { speaker: "Kasama", text: "Kapag nahuli ka, hindi ka na makakauwi sa nanay mo." },
    { speaker: "Macario", text: "Opo. Ako na po ang bahala." },
  ]);
  setCutscene(false);
}

// The third pamphlet handed over, whichever it was: his thought, and the
// last card. Its doneFlag is the last step's flag, so setting it
// finishes Act I and the post-test runs (acts.js, checkObjectives). A
// reload before it ends plays it again.
async function thePamphletsDelivered() {
  setCutscene(true);
  await wait(400);
  await playDialogue([
    { speaker: "Macario (sa isip)", text: "Naibigay ko na ang tatlo." },
    { speaker: "Macario (sa isip)", text: "Dati, barya ang iniipon ko para kay Nanay." },
    { speaker: "Macario (sa isip)", text: "Ngayon, may mas malaki na akong ipinaglalaban." },
  ]);
  await playIntertitle(["Dito nagsimula ang paglilingkod ni Macario sa Katipunan.",
    "Wakas ng Unang Yugto"]);
  setCutscene(false);
}

// -------------------------------------------------------------
// The apples. The tree opens the mini-game only while the apples are
// the task; any other time Macario just looks at it.
// -------------------------------------------------------------
function applesHeld() {
  return APPLE_FLAGS.filter((f) => state.flags[f]).length;
}

// Block 65. PLACEHOLDER. Once the horse is fed the tree is a game of its
// own: thirty seconds, as many as he can catch, golden apples worth
// three, and his best kept in a flag as a number (as Block 56 kept pay).
// Nothing is paid and nothing waits on it.
const APPLE_ROUND_MS = 30000;
const APPLE_BEST_FLAG = "rekordSaMansanas";

function appleRound() {
  const best = Number(state.flags[APPLE_BEST_FLAG]) || 0;
  playCatchGame({
    title: "Puno ng mansanas",
    hint: best ? "Ilan ang masasalo mo sa loob ng 30 segundo? Rekord mo: " + best + "."
               : "Ilan ang masasalo mo sa loob ng 30 segundo?",
    timeLimitMs: APPLE_ROUND_MS,
    missText: "Sayang!",
    doneText(n) {
      if (n > best) {
        state.flags[APPLE_BEST_FLAG] = n;
        markDirty();
        return best ? "Bagong rekord: " + n + "!" : "Nakasalo ka ng " + n + "!";
      }
      return "Nakasalo ka ng " + n + ". Rekord mo: " + best + ".";
    },
  });
}

function pickApples() {
  if (state.flags.napakainAngKabayo) {
    appleRound();
    return;
  }
  if (!state.flags.nakausapAngKutsero) {
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
  //   6  counts the deliveries; done when Macario agrees to act, at the
  //      end of the direktor's scene (theMissingActor).
  //   7  the play, inside the entablado (thePlay), which the direktor
  //      pays for.
  //   8  the Mananahi's gift button, which pays 50.
  //   9  Nanay's gift, "Ibigay ang ipon"; counts the barya to 100.
  //  10  Block 80: four years on, Principe Baldovino (principeBaldovino);
  //      done when the Katipunan's two men have gone (theKatipunanAsks).
  //  11  the word said to the Kasama on the street.
  //  12  the oath in the pulungan (theOath).
  //  13  counts the pamphlets; done by the last beat after the third
  //      (thePamphletsDelivered), which finishes Act I.
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
    { id: "ihatid_damit", label: "Ihatid ang mga tinahing damit",
      flag: "naihatidAngMgaDamit", countFlags: DELIVERY_FLAGS },
    { id: "gumanap_sa_dula", label: "Gumanap bilang Don Rodrigo sa dula",
      flag: "naitanghalAngDula" },
    { id: "bayad_mananahi", label: "Kunin ang bayad sa Mananahi",
      flag: "nabayaranNgMananahi" },
    { id: "mag_ipon", label: "Ibigay kay Nanay ang naipon",
      flag: "naibigayAngIponKayNanay", countCurrency: SAVINGS_GOAL },
    { id: "gumanap_baldovino", label: "Gumanap bilang Principe Baldovino",
      flag: "nilapitanNgKatipunan" },
    { id: "hanapin_kasama", label: "Hanapin ang naghihintay sa kalye",
      flag: "nakausapAngKasama" },
    { id: "sumapi_katipunan", label: "Sumapi sa Katipunan",
      flag: "tinanggapSaKatipunan" },
    { id: "ipamigay_polyeto", label: "Ipamigay ang mga polyeto",
      flag: "naipamigayAngMgaPolyeto", countFlags: PAMPHLET_FLAGS },
  ],

  // Block 74. The guards' room, outside the story, reached only from the
  // Test Room button in settings: a "<WIP>" card, then the room. Its
  // door returns to wherever the student was (game.js, enterTestRoom).
  testRoom: { scene: "bantayan", card: ["<WIP>"], x: BANTAYAN_START, facing: 1 },

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

  // Block 68. Kept when the act is replayed after a failed post-test
  // (acts.js, replayAct): the apple round's best score.
  keepFlagsOnReplay: ["rekordSaMansanas"],

  // Block 70. The teacher's Talaan papers. The pool is empty here and
  // filled from the database; with no papers written, nothing lies on
  // the road and the Talaan button stays hidden.
  hints: {
    count: 3,
    fixed: true,
    label: "Papel",
    listLabel: "Mga Papel",
    // PLACEHOLDER: ours, until the proponents word these.
    foundText: "Naitala ito sa Talaan. Buksan ang Talaan sa pause para basahin ulit.",
    completeText: "Nahanap mo na ang lahat ng papel!",
    pool: [],
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
      // catalogue's bantay, on duty only while the pamphlets are the task,
      // not shooting, so being seen is a catch rather than a gunfight on
      // a street full of neighbours.
      guards: PAMPHLET_GUARDS.map((g, i) => ({
        type: "bantay", id: "guardia-" + (i + 1), shoots: false,
        x: g.beat[0], patrolFrom: g.beat[0], patrolTo: g.beat[1], facing: 1,
        requiresFlag: "tinanggapSaKatipunan", unlessFlag: "naipamigayAngMgaPolyeto",
      })),
      hideSpots: PAMPHLET_GUARDS.map((g) => ({ x: g.hide, width: 110,
        requiresFlag: "tinanggapSaKatipunan", unlessFlag: "naipamigayAngMgaPolyeto" })),
      // A catch sends him to the furthest of these reached: the back door,
      // then each of the three once handed a pamphlet.
      checkpoints: [
        { x: BACK_DOOR_X, flag: "tinanggapSaKatipunan" },
        ...CITIZENS.map((c) => ({ x: c.x - BESIDE, flag: pamphletFlag(c) })),
      ],
      // Block 81. No gun on this street: a shot at the guardia civil among
      // the neighbours is not the errand the Kasama gave (a long hold
      // punches, as on the stage).
      noRanged: true,
      decorations: [
        // Off to the left, hidden until the opening walks them on.
        { id: "siga-1", x: 260, hidden: true, animation: SIGA[1].idle,
          walkAnimation: SIGA[1].walk, displayHeight: SIGA[1].height },
        { id: "siga-2", x: 180, hidden: true, animation: SIGA[2].idle,
          walkAnimation: SIGA[2].walk, displayHeight: SIGA[2].height },
        { id: "siga-3", x: 100, hidden: true, animation: SIGA[3].idle,
          walkAnimation: SIGA[3].walk, displayHeight: SIGA[3].height },
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
          startsHidden: true, revealedByFlag: "nakausapSiNanaySaBahay",
          // Block 80. With a requiresFlag among them, the set is picked
          // from the flags each time (Block 48), not stepped through.
          dialogueSets: [
            {
              // PLACEHOLDER. Before the savings.
              skipIfFlag: "naibigayAngIponKayNanay",
              lines: [
                { speaker: "Nanay", text: "Mag-iingat ka sa trabaho, anak. At umuwi ka bago dumilim." },
              ],
            },
            {
              skipIfFlag: "tinanggapSaKatipunan",
              lines: [
                { speaker: "Nanay", text: "Tuloy mo lang yan Nak, malayo ang mararating mo sa buhay" },
              ],
            },
            {
              // PLACEHOLDER. Sworn in; she does not know, and worries.
              requiresFlag: "tinanggapSaKatipunan",
              lines: [
                { speaker: "Nanay", text: "Ginagabi ka na naman, anak. Mag-ingat ka sa mga guardia civil sa labas." },
              ],
            },
          ],
          gift: {
            buttonLabel: "Ibigay ang ipon",
            requiresFlag: "nabayaranNgMananahi",
            givenFlag: "naibigayAngIponKayNanay",
            // The proponents' lines, with four of ours (PLACEHOLDER) after
            // the third, for the play Block 59 added.
            responseLines: [
              { speaker: "Macario", text: "Nay, nakapag-ipon na ako ng pera para makatulong" },
              { speaker: "Nanay", text: "Maraming salamat anak ko! Napakahusay mo! Ginalingan mo ba sa trabaho?" },
              { speaker: "Macario", text: "Opo Nay, nagtrabaho ako para sa Kutsero at mananahi" },
              { speaker: "Macario", text: "Tapos, Nay... umarte pa po ako sa entablado." },
              { speaker: "Nanay", text: "Ikaw? Sa entablado?" },
              { speaker: "Macario", text: "Nagkasakit po kasi 'yung bida nila. Ako na lang po ang ipinalit ng direktor." },
              { speaker: "Nanay", text: "Kaya pala hindi mawala-wala 'yang ngiti mo." },
              { speaker: "Nanay", text: "Tuloy mo lang yan Nak, malayo ang mararating mo sa buhay" },
              { speaker: "Macario", text: "Maraming salamat nay!" },
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
          dialogueSets: [
            {
              skipIfFlag: "nakausapAngKutsero",
              lines: [
                { speaker: "Macario", text: "Kutsero, maaari po ba akong magtrabaho dito?" },
                { speaker: "Kutsero", text: "Macario? Buti naman at naisipan mo magtrabaho" },
                { speaker: "Macario", text: "Kailangan na 'ho eh, nangangailangan si Nanay" },
                { speaker: "Kutsero", text: "O sige, magsimula ka na kaagad, alagaan mo yung puting kabayo kuwadra" },
                // PLACEHOLDER. What the work is, for the new job.
                { speaker: "Kutsero", text: "Gutom na 'yon. May puno ng mansanas diyan sa unahan. Kumuha ka ng tatlo, tapos ipakain mo sa kanya." },
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
                { speaker: "Kutsero", text: "Nasa unahan lang ang puno. Tatlong mansanas, ha." },
              ],
            },
            {
              // PLACEHOLDER. The horse is fed; the pay is his gift button.
              skipIfFlag: "nabayaranNgKutsero",
              lines: [
                { speaker: "Kutsero", text: "Aba, busog na busog na siya! Halika, may bayad ka sa akin." },
              ],
            },
            {
              // PLACEHOLDER. Afterwards.
              lines: [
                { speaker: "Kutsero", text: "Salamat, Macario. Balik ka lang kung kailangan mo pa ng trabaho." },
              ],
            },
          ],
          gift: {
            buttonLabel: "Kunin ang bayad",
            requiresFlag: "napakainAngKabayo",
            givenFlag: "nabayaranNgKutsero",
            // PLACEHOLDER.
            responseLines: [
              { speaker: "Kutsero", text: "Heto ang limampung barya. Pinaghirapan mo 'yan." },
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
              { speaker: "Macario", text: "Heto na, kaibigan. Dahan-dahan lang, ha." },
              { speaker: "Kabayo", text: "Hiiiii!" },
            ],
          },
        },
        {
          // Block 57. Something to use rather than someone to talk to:
          // E opens the apple mini-game (onInteract). Block 69: scenery,
          // with no picture; the shadow tree over the join is the tree.
          id: "puno", x: PUNO_X, label: "Puno ng mansanas", scenery: true,
          interactLabel: "Pumitas",
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
                { speaker: "Mananahi", text: "O, Macario. Naghahanap ka raw ng trabaho? Unahin mo muna 'yung sa Kutsero, tapos balikan mo ako. Baka may maipagawa ako sa'yo." },
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
                { speaker: "Mananahi", text: "May tatlong tahi akong tapos na. 'Yung baro ni Aling Rosa, 'yung pantalon ni Mang Tomas, at 'yung mga damit ng direktor para sa palabas mamayang gabi." },
                { speaker: "Mananahi", text: "Kina Aling Rosa at Mang Tomas ka muna, madadaanan mo naman sila. Nasa dulo pa ng kalye 'yung entablado, kaya sa direktor ka na huling pumunta." },
                { speaker: "Macario", text: "Sige po, ihahatid ko na ngayon." },
              ],
              onComplete() {
                state.flags.nakausapAngMananahi = true;
                markDirty();
              },
            },
            {
              // PLACEHOLDER. While there are clothes still to deliver.
              skipIfFlag: "naihatidAngMgaDamit",
              lines: [
                { speaker: "Mananahi", text: "O, may bitbit ka pa? Ihatid mo na, baka hinahanap na nila." },
              ],
            },
            {
              // PLACEHOLDER. Delivered, and the play not yet done: only an
              // old save or a reload mid-fade reaches this.
              skipIfFlag: "naitanghalAngDula",
              lines: [
                { speaker: "Mananahi", text: "Hinahanap ka raw ng direktor sa entablado. Bilisan mo!" },
              ],
            },
            {
              // PLACEHOLDER. After the play; the pay is her gift button.
              skipIfFlag: "nabayaranNgMananahi",
              lines: [
                { speaker: "Mananahi", text: "Macario! Totoo ba 'yung ibinalita sa akin? Ikaw raw ang bumida sa entablado?" },
                { speaker: "Macario", text: "Nawala po kasi 'yung artista nila. Ako na lang po ang pinagsuot ng damit." },
                { speaker: "Mananahi", text: "Aba, e 'di ikaw pala ang unang nagsuot ng tinahi ko! Kasya ba?" },
                { speaker: "Macario", text: "Kasyang-kasya po." },
                { speaker: "Mananahi", text: "Sabi ko na nga ba. Halika, kunin mo na ang bayad mo." },
              ],
            },
            {
              // PLACEHOLDER. Paid, before the savings are given.
              skipIfFlag: "naibigayAngIponKayNanay",
              lines: [
                { speaker: "Mananahi", text: "Iuwi mo na 'yan sa nanay mo. Matutuwa 'yon." },
              ],
            },
            {
              // PLACEHOLDER. Afterwards.
              lines: [
                { speaker: "Mananahi", text: "Kapag may tahi ulit, ipapatawag kita, ha?" },
              ],
            },
          ],
          gift: {
            buttonLabel: "Kunin ang bayad",
            requiresFlag: "naitanghalAngDula",
            givenFlag: "nabayaranNgMananahi",
            // PLACEHOLDER.
            responseLines: [
              { speaker: "Mananahi", text: "Heto ang limampung barya. Salamat, Macario, malaking tulong ka." },
              { speaker: "Macario", text: "Salamat din po!" },
            ],
            onComplete: payForJob,
          },
        },
        // The two customers on the way (CUSTOMERS, above).
        ...CUSTOMERS.map((c) => ({
          id: c.id, x: c.x, label: c.label, animation: c.animation,
          dialogueSets: [
            { skipIfFlag: customerFlag(c),
              lines: [{ speaker: c.label, text: c.waiting }] },
            { lines: [{ speaker: c.label, text: c.after }] },
          ],
          gift: {
            buttonLabel: "Iabot ang damit",
            requiresFlag: "nakausapAngMananahi",
            givenFlag: customerFlag(c),
            responseLines: [
              { speaker: "Macario", text: "Magandang araw po! Padala po ng Mananahi." },
              { speaker: c.label, text: c.thanks },
            ],
            // Counted from the flags, so the order of the two does not
            // matter and a reload cannot miscount. Both done is what lets
            // the direktor take his.
            onComplete() {
              if (CUSTOMERS.every((x) => state.flags[customerFlag(x)])) {
                state.flags.naihatidSaDalawangSuki = true;
              }
              markDirty();
            },
          },
        })),
        {
          // The direktor, on the street by the entablado: the last of the
          // three deliveries (Block 59). PLACEHOLDER, every line.
          id: "direktor", x: DIREKTOR_X, label: "Direktor", animation: DIREKTOR,
          // With a requiresFlag among them, the set is picked from the
          // flags each time (CLAUDE.md, Block 48), so the one that takes
          // him inside comes first: an old save whose deliveries were
          // all done under Block 57 has none of this block's flags for
          // the two customers, and must still be taken in.
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
              // Before the Mananahi's errand.
              skipIfFlag: "nakausapAngMananahi",
              lines: [
                { speaker: "Direktor", text: "Pasensya na, iho, abala kami. Mamayang gabi na ang palabas at ang dami pang kulang." },
              ],
            },
            {
              // The errand, with the other two not yet delivered.
              skipIfFlag: "naihatidSaDalawangSuki",
              lines: [
                { speaker: "Direktor", text: "Galing ka sa Mananahi? Mamaya ko pa kailangan 'yang mga damit namin, iho. Ihatid mo muna 'yung sa iba, baka sila ang naiinip na." },
              ],
            },
            {
              // Ready for his; the costumes are his gift button.
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
            requiresFlag: "naihatidSaDalawangSuki",
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
          // here to be asked again. PLACEHOLDER, every line.
          id: "kasama", x: KASAMA_X, label: "Kasama", animation: KASAMA,
          startsHidden: true, revealedByFlag: "nilapitanNgKatipunan",
          dialogueSets: [
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
              skipIfFlag: "naipamigayAngMgaPolyeto",
              lines: [
                { speaker: "Kasama", text: "Huwag kang tumambay rito. Ipamigay mo na ang mga polyeto." },
              ],
            },
            {
              lines: [
                { speaker: "Kasama", text: "Magaling, kapatid. Magkikita pa tayo." },
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
        // steps only while he walks and turns the way he goes.
        { id: "sultan", x: STAGE_WIDTH + 100, hidden: true,
          walkOnly: true, faceMovement: true, animation: MORO_WALK },
        // Block 80. The Katipunan's two men, in the right wing until they
        // come to find him after Principe Baldovino.
        { id: "katipunero", x: STAGE_WIDTH + 100, hidden: true, animation: KATIPUNERO },
        { id: "kasama", x: STAGE_WIDTH + 180, hidden: true, animation: KASAMA },
      ],
      npcs: [
        {
          id: "direktor", x: STAGE_DIREKTOR_X, label: "Direktor", animation: DIREKTOR,
          // Block 80. Picked from the flags (Block 48): before the first
          // play, after it, and four years on.
          dialogueSets: [
            {
              // PLACEHOLDER.
              skipIfFlag: "naitanghalAngDula",
              lines: [
                { speaker: "Direktor", text: "Huminga ka nang malalim, iho. Nandito lang ako sa gilid." },
              ],
            },
            {
              // PLACEHOLDER.
              skipIfFlag: "lumipasAngApatNaTaon",
              lines: [
                { speaker: "Direktor", text: "Bumalik ka rito kahit kailan mo gusto. May puwesto ka sa amin." },
              ],
            },
            {
              // PLACEHOLDER. Block 80.
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
              // PLACEHOLDER.
              skipIfFlag: "naitanghalAngDula",
              lines: [
                { speaker: "Maryam", text: "Kaya mo 'yan. Tumingin ka lang sa akin kapag nalito ka." },
              ],
            },
            {
              // PLACEHOLDER.
              skipIfFlag: "lumipasAngApatNaTaon",
              lines: [
                { speaker: "Maryam", text: "Alam mo, mas bagay sa'yo si Don Rodrigo kaysa kay Julian. Huwag mo lang sasabihin sa kanya." },
              ],
            },
            {
              // PLACEHOLDER. Block 80. She saw the two men.
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
      exits: [
        { id: "labas", x: 0, width: 70, label: "Lumabas sa likod", requiresFlag: "tinanggapSaKatipunan",
          toScene: "tondo", toX: BACK_DOOR_X, toFacing: 1 },
      ],
      scripts: [
        { requiresFlag: "nakausapAngKasama", doneFlag: "tinanggapSaKatipunan",
          x: PULUNGAN_ENTER_X, facing: 1, run: theOath },
      ],
      npcs: [
        {
          id: "kasama", x: PULUNGAN_KASAMA_X, label: "Kasama", animation: KASAMA,
          dialogueSets: [
            {
              // PLACEHOLDER.
              lines: [
                { speaker: "Kasama", text: "Lumabas ka nang mag-isa. Hindi tayo dapat makitang magkasama." },
              ],
            },
          ],
        },
        {
          id: "mabalasig", x: MABALASIG_X, label: "Mabalasig", animation: MABALASIG,
          dialogueSets: [
            {
              // PLACEHOLDER.
              lines: [
                { speaker: "Mabalasig", text: "Humayo ka na, kapatid. Naghihintay ang tatlo." },
              ],
            },
          ],
        },
        {
          id: "katipunero", x: PULUNGAN_KATIPUNERO_X, label: "Katipunero", animation: KATIPUNERO,
          dialogueSets: [
            {
              // PLACEHOLDER.
              lines: [
                { speaker: "Katipunero", text: "Sa susunod na palabas mo, manonood ulit ako. Sa likod, gaya ng dati." },
              ],
            },
          ],
        },
      ],
    },
    {
      // Block 73, and since Block 74 reached only from the Test Room
      // button in settings (testRoom, above), never from the story. Three
      // bantay with every part of the stealth and hostile-guard system
      // (game.js, Blocks 37, 38 and 73): a patrol, a sentry with his back
      // turned for a takedown, and a second patrol; a platform above
      // their sight with a heart on it, and a crate to hide behind. Seen,
      // a guard turns hostile, stops, levels his rifle and fires, and
      // takes two punches or shots to put down. The door at the far end
      // goes back to wherever the student came from (back: true); beside
      // Nanay only if that is not known.
      id: "bantayan",
      worldWidth: BANTAYAN_WIDTH,
      panels: [STREET_PAINTINGS[2], STREET_PAINTINGS[3], STREET_PAINTINGS[2]],
      panelSky: STREET_SKY,
      startX: BANTAYAN_START,
      music: "assets/audio/music/intense.mp3",
      platforms: [{ x: 1150, y: 150, width: 220 }],
      pickups: [{ id: "bantayan-puso", x: 1240, y: 150, type: "heart" }],
      hideSpots: [{ x: 2500, width: 110 }],
      guards: [
        { type: "bantay", id: "bantay-1", x: 700, patrolFrom: 560, patrolTo: 1000, facing: -1 },
        { type: "bantay", id: "bantay-2", x: 1900, patrolFrom: 1900, patrolTo: 1900, facing: 1,
          detectRadius: 280 },
        { type: "bantay", id: "bantay-3", x: 3300, patrolFrom: 3100, patrolTo: 3700, facing: -1,
          speed: 1.5, detectRadius: 300 },
      ],
      exits: [
        { id: "labas", x: BANTAYAN_WIDTH - 120, width: 100, label: "Lumabas", back: true,
          toScene: "tondo", toX: NANAY_X - BESIDE, toFacing: 1 },
      ],
    },
  ],
};
