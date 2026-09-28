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
// Act I is held open after that (holdOpen, acts.js): the story goes on
// from there and the post-test must not open yet.
//
// The lines are the proponents' script as written, apostrophes
// straightened. Lines marked PLACEHOLDER are ours, to be replaced by
// the proponents: everything the job-givers, the horse, the customers,
// the direktor and the play say beyond the lines the script gave.
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
// facing right). The Sultan and his soldiers share the walk and sword
// sheets of the old moro-moro (Block 40): delivered as JPEGs on black,
// keyed to PNGs, and the attack sheet grounded by its standing frames,
// with headroom for the raised sword.
const MARYAM = {
  src: "assets/sprites/characters/maryam.png", frames: 13, fps: 6, columns: 5,
  contentTop: 73, contentHeight: 117, footX: 128,
};
const MORO_WALK = { src: "assets/sprites/enemies/muslim-walk.png", frames: 12, fps: 10,
  columns: 4, contentTop: 43, contentHeight: 70, footX: 72 };
const MORO_ATTACK = { src: "assets/sprites/enemies/muslim-attack.png", frames: 15, fps: 24,
  columns: 4, contentTop: 30, contentHeight: 97, footX: 88, headroom: 29 };

// The bantay, a guardia civil (Block 73). The still is the artist's
// (delivered as Guard.png); the walk and the shot are made from it by
// _dev/tools/animate-bantay.js, which moves the still's own parts. All
// three share his height in the still (394 of it), so he is one size
// whatever he does; headroom shows the bayonet above his helmet. The
// shot's aimFrame is the rifle levelled, fireFrame the flash, and its
// muzzle is where the bullet leaves (game.js, guardFire).
const BANTAY = {
  src: "assets/sprites/enemies/bantay.png", frames: 1, fps: 1,
  contentTop: 50, contentHeight: 394, footX: 238, headroom: 8,
};
const BANTAY_WALK = {
  src: "assets/sprites/enemies/bantay-walk.png", frames: 8, fps: 10, columns: 4,
  contentTop: 40, contentHeight: 394, footX: 128, headroom: 40,
};
const BANTAY_SHOOT = {
  src: "assets/sprites/enemies/bantay-shoot.png", frames: 7, fps: 14, columns: 4,
  contentTop: 20, contentHeight: 394, footX: 88, headroom: 20,
  aimFrame: 2, fireFrame: 3, muzzle: { x: 367, y: 226 },
};
const bantay = (def) => Object.assign({
  shoots: true, hp: 2, speed: 1.3, detectRadius: 260,
  animation: BANTAY, walkAnimation: BANTAY_WALK, shootAnimation: BANTAY_SHOOT,
}, def);

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

// Where Macario stops beside someone he has walked or been sent to.
const BESIDE = 120;

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
  // Block 73. Work in progress, not the plot: a card, and the guards'
  // room, whose door leads back here beside Nanay. The card leaves the
  // screen black and the fade into the room takes the cutscene over
  // (game.js, playIntertitle's keepBlack).
  await playIntertitle(["<WIP>"], { keepBlack: true });
  if (window.Acts) Acts.gotoScene("bantayan", { x: BANTAYAN_START, facing: 1 });
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
    id: "kawal-" + (i + 1),
    x,
    hp: 2,
    animation: MORO_WALK,
    attackAnimation: MORO_ATTACK,
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
  ],

  // Block 56. Every step above can be done and Act I still does not
  // finish: the story continues and the post-test must wait for it
  // (acts.js, checkObjectives).
  holdOpen: true,

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
                { speaker: "Nanay", text: "Mag-iingat ka sa trabaho, anak. At umuwi ka bago dumilim." },
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
            onComplete() {
              Game.spendCurrency(Math.min(SAVINGS_GOAL, Game.currency()));
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
        { requiresFlag: "naihatidAngMgaDamit", doneFlag: "naitanghalAngDula",
          x: STAGE_ENTER_X, facing: -1, run: thePlay },
      ],
      decorations: [
        // The Sultan: off stage in the right wing until he walks on. He
        // steps only while he walks and turns the way he goes.
        { id: "sultan", x: STAGE_WIDTH + 100, hidden: true,
          walkOnly: true, faceMovement: true, animation: MORO_WALK },
      ],
      npcs: [
        {
          id: "direktor", x: STAGE_DIREKTOR_X, label: "Direktor", animation: DIREKTOR,
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
              lines: [
                { speaker: "Direktor", text: "Bumalik ka rito kahit kailan mo gusto. May puwesto ka sa amin." },
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
              lines: [
                { speaker: "Maryam", text: "Alam mo, mas bagay sa'yo si Don Rodrigo kaysa kay Julian. Huwag mo lang sasabihin sa kanya." },
              ],
            },
          ],
        },
      ],
    },
    {
      // Block 73. Work in progress, not the plot: the guards' room,
      // reached after Macario's thought through a "<WIP>" card. Three
      // bantay with every part of the stealth and hostile-guard system
      // (game.js, Blocks 37, 38 and 73): a patrol, a sentry with his back
      // turned for a takedown, and a second patrol; a platform above
      // their sight with a heart on it, and a crate to hide behind. Seen,
      // a guard turns hostile, stops, levels his rifle and fires, and
      // takes two punches or shots to put down. The door at the far end
      // goes back to the street beside Nanay, so the story carries on.
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
        bantay({ id: "bantay-1", x: 700, patrolFrom: 560, patrolTo: 1000, facing: -1 }),
        bantay({ id: "bantay-2", x: 1900, patrolFrom: 1900, patrolTo: 1900, facing: 1,
                 detectRadius: 280 }),
        bantay({ id: "bantay-3", x: 3300, patrolFrom: 3100, patrolTo: 3700, facing: -1,
                 speed: 1.5, detectRadius: 300 }),
      ],
      exits: [
        { id: "labas", x: BANTAYAN_WIDTH - 120, width: 100, label: "Lumabas",
          toScene: "tondo", toX: NANAY_X - BESIDE, toFacing: 1 },
      ],
    },
  ],
};
