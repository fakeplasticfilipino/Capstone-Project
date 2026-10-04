// =============================================================
// MACARIO — content/act2.js
//
// ACT II, 1896 to 1898 (Block 113), from the proponent's plot, rebuilt
// the same day at the proponent's word to open at the press, put home
// second, and be the tragedy it is ("we're presenting historical
// shit, not wrapping children in a bubble"; CLAUDE.md, Writing
// dialogue, no watered-down narratives). STORY.md, "Act II, beat by
// beat", is every line. Every line here is ours, marked PLACEHOLDER
// below each block of them, until the proponents accept or replace it.
//
//   imprenta     Agosto 1896. The act opens at the Katipunan's press:
//                the second issue of Kalayaan printed (the work game),
//                "from Yokohama" like the first; a rumour that someone
//                went to the priest; the list of members, with where
//                each lives, kept under the press. Jacinto sends him home.
//   tondo        the street, Act I's paintings and people: the walk home,
//                the neighbours afraid of him already.
//   bahay        Nanay, the ink on his hands, "Pangulo", the father, her
//                plea and his promise, and in the middle of his answer
//                Isko at the door: a problem at the press, nothing more.
//                Nobody in the room knows the sweep has begun. He goes,
//                "Sandali lang po ito", on the promise he has just made.
//   tondo        more guards than he has ever seen between home and the
//                press. Later, the night: back toward home past the
//                patrols, and short of it a guard: "Hoy, sino ka?!
//                Bumalik ka dito!" The chase, away from her, to the
//                mountains. He never gets back.
//   imprenta     the sweep, found: three guards searching it, two
//                shelves to climb over them; the list under the press,
//                his own name in it, and only now the realisation: the
//                receipts they took have Nanay's door, and he left her.
//   pugad-lawin  23 August. Isko went to the house: empty, the door
//                broken, nobody knows. The cedula torn, for her.
//   san-juan     30 August. Fifteen soldiers in four waves; the rifles
//                from Manila; the Kasama falls ("Huwag kang lilingon");
//                the long run back to the river past five riflemen.
//   nangka       November. Three scarecrows, shots at straw, six more.
//   balara       That week, at night. Cavite's news; by the fire,
//                Bonifacio: everyone left someone.
//   laguna       1897. Bonifacio killed by his own side; Jacinto, and
//                Macario stays. The years after on black, and Nanay
//                still not found.
//
// Wrapped in a function: the act files share one global scope, and Act
// I's own constants must not be declared twice. The people who return
// are window.PEOPLE (content/people.js); the soldiers are the enemy
// catalogue's sundalo and bantay (content/enemies.js). Every flag starts
// with a2_, because the story's flags are kept from act to act.
//
// Art. Every picture this act names and nobody has drawn yet (ART.md,
// Owed) is the dashed placeholder box with its file name on it, and a
// room whose painting is owed is a dark wall with the name on it.
// =============================================================

(function () {
  const P = window.PEOPLE;

  // ---- Art ------------------------------------------------------------
  const owed = (folder, name) => ({ src: `assets/sprites/${folder}/${name}.png`, frames: 1, fps: 1 });
  const ISKO = owed("characters", "isko");
  const JACINTO = owed("characters", "jacinto");
  const BONIFACIO = owed("characters", "bonifacio");
  const MANLILIMBAG = owed("characters", "manlilimbag");
  const TAGAPAGBALITA = owed("characters", "tagapagbalita");
  const PALIMBAGAN = owed("scenery", "palimbagan");
  const DAYAMI = owed("scenery", "dayami");
  const PANAKOT = owed("scenery", "panakot");

  // ---- The street ---------------------------------------------------
  // Act I's street, its paintings in the same order. Joins at every
  // multiple of 1450; anyone a student must reach is 90 or more clear.
  const STREET_PAINTINGS = [
    "assets/backgrounds/act1/street-01.jpg",
    "assets/backgrounds/act1/street-02.jpg",
    "assets/backgrounds/act1/street-03.jpg",
    "assets/backgrounds/act1/street-04.jpg",
  ];
  const PANEL = 1450;
  const STREET_PANELS = Array.from({ length: 10 }, (_, i) => STREET_PAINTINGS[i % 4]);
  const STREET_WIDTH = 10 * PANEL;
  const STREET_SKY = "#51a6ea";

  const HOME_X = 2000;          // Nanay's door, where Act I left her
  const KUTSERO_X = 3300;
  const MANGINGISDA_X = 4800;
  const BARBERO_X = 5300;
  const MANANAHI_X = 6400;
  const TABAKERA_X = 6900;
  const PRESS_DOOR_X = 7900;    // the press, behind an ordinary door
  const BEHIND_PRESS_X = 8050;  // where the back window lets out
  const KARPINTERO_X = 10600;
  const MARYAM_X = 13250;       // outside the entablado
  const DIREKTOR_X = 13600;

  // August, by day: four guardia civil between Nanay's door and the
  // press, each with a crate in his beat. They catch, not shoot. Passing
  // each one's checkpoint (reach) is where a catch puts Macario back.
  const DAY_GUARDS = [
    { beat: [2600, 3000], hide: 2800 },
    { beat: [3700, 4150], hide: 3920 },
    { beat: [5950, 6300], hide: 6120 },
    { beat: [7330, 7700], hide: 7520 },
  ];
  const DAY_CHECKPOINTS = [3350, 4600, 6750];
  // The night of the raid, the way back toward home: four more, and the
  // two at Nanay's door, standing. Checkpoints in the order he meets
  // them, right to left (game.js, respawnX takes the last reached).
  const NIGHT_GUARDS = [
    { beat: [6500, 6950], hide: 6720 },
    { beat: [5000, 5450], hide: 5220 },
  ];
  const NIGHT_CHECKPOINTS = [6100];
  // Short of home (x 4550, a long way short of her door), the shout:
  // two guardia civil come round the corner between him and the house,
  // already after him (hostile), and the chase runs the other way, the
  // length of the street, to the road out to the mountains. Two more
  // stand on the way and turn on him when they see him. A catch puts him
  // back at the last point of the chase he passed.
  const SPOTTED_X = 4550;
  const CHASERS_X = [3700, 3560];
  const CHASE_GUARDS = [
    { beat: [7400, 7750] },
    { beat: [9300, 9650] },
  ];
  const CHASE_CHECKPOINTS = [6000, 8000, 10000];
  const MOUNTAIN_ROAD_X = 11300;

  // ---- Rooms ---------------------------------------------------------
  const ROOM = 1180;            // one screen wide, as the entablado
  const BAHAY_NANAY_X = 320;

  // The press: three rooms' worth, the door on the right, the press (and
  // under it the list) on the left, the back window at the left edge.
  // August: three guards, crates and paper to hide behind, and two high
  // shelves (platforms) a guard cannot see onto.
  const PRESS_WIDTH = 2600;
  const PRESS_ENTER_X = 2450;
  const PRESS_X = 210;
  const WINDOW_X = 10;
  const JACINTO_PRESS_X = 700;
  const PRINTER_X = 440;
  const HIDING_PRINTER_X = 2330;
  const PRESS_GUARDS = [
    { beat: [1850, 2200], hide: 2030, facing: -1 },
    { beat: [1100, 1500], hide: 1300, facing: 1 },
    { beat: [400, 800], hide: 600, facing: -1 },
  ];
  const PRESS_SHELVES = [{ x: 1580, y: 100, width: 220 }, { x: 860, y: 100, width: 200 }];
  const PRESS_CHECKPOINTS = [1750, 1000];

  const BATTLE_WIDTH = 4200;    // San Juan del Monte
  const RIVER_WIDTH = 2400;     // the Nangka
  const RETREAT_START = 3600;
  // San Juan, after the charge: the rifles from Manila in five lines
  // between Macario and the river, each with cover in his beat. They
  // shoot: seen, he is chased and fired on until he punches them down or
  // runs out of hearts (back to the last line he passed).
  const RETREAT_GUARDS = [
    { beat: [3000, 3350], hide: 3180 },
    { beat: [2300, 2650], hide: 2480 },
    { beat: [1600, 1950], hide: 1780 },
    { beat: [1000, 1350], hide: 1180 },
    { beat: [400, 750], hide: 580 },
  ];
  const RETREAT_CHECKPOINTS = [2850, 2150, 1450, 850];
  const DAYAMI_X = [1000, 1400, 1800];
  const LAGUNA_JACINTO_X = 800;

  const BESIDE = 120;
  const MEETS = 190;
  const HINT_HIGH = 155; // GROUND_LEVEL + 95, as Act I's: a jump to reach

  const CALM = null; // setMusic(null): the scene's own track
  const FIGHT = "assets/audio/music/intense.mp3";
  const NIGHT = "assets/audio/music/gabi.wav";

  // ---- Flags -------------------------------------------------------------
  const PANAKOT_FLAGS = DAYAMI_X.map((_, i) => "a2_panakot" + (i + 1));
  // From the sweep on, the neighbours are indoors: their fear is said on
  // the walk home, before it (the hints the proponent asked for).
  const SWEEP = { requiresFlag: "a2_paghuli" };

  function thinkAloud(text) {
    return playDialogue([{ speaker: "Macario (sa isip)", text }]);
  }

  // A run's checkpoints: each one sets its own flag when he passes it,
  // only on that run (requiresFlag).
  const reached = (xs, prefix, on) => xs.map((x, i) =>
    ({ x, flag: prefix + (i + 1), reach: true, requiresFlag: on }));

  // ---- The battles ---------------------------------------------------
  // At the proponent's word, a lot of fighting: waves of soldiers from
  // both sides of the screen, a wave at a time (spawnEnemies resolves
  // when every one is down), with a line between waves. The catalogue's
  // sundalo charge with the bayonet; a bantay among them is a rifle,
  // already hostile, that fires. Running out of hearts restarts the wave
  // in hand, the fallen staying down.
  async function battle(tag, waves) {
    setMusic(FIGHT);
    for (let w = 0; w < waves.length; w++) {
      const wave = waves[w];
      const here = playerX();
      const edges = viewEdges();
      const defs = wave.types.map((type, i) => {
        const fromRight = i % 2 === 0;
        const step = Math.floor(i / 2) * 110;
        const x = fromRight ? Math.max(here + 320, edges.right - 60) + step
          : Math.min(here - 320, edges.left + 20) - step;
        return {
          type, id: tag + "-" + (w + 1) + "-" + (i + 1),
          x: Math.max(40, Math.min(x, WORLD_WIDTH - 140)),
        };
      });
      if (w === 0) showToast("Pindutin ang Atake para lumaban!", 2400);
      await spawnEnemies(defs);
      if (wave.after) {
        setCutscene(true);
        await wait(300);
        await playDialogue(wave.after);
        setCutscene(false);
      }
    }
    setMusic(CALM);
  }

  // =============================================================
  // Beat 1. Agosto 1896, the press: the second issue of Kalayaan, the
  // one the histories say was in hand when the Katipunan was found out. The act opens here, the first thing
  // the student does is print. PLACEHOLDER, every line.
  // =============================================================
  async function theFirstPage() {
    setCutscene(true);
    turnPlayer(-1);
    await playIntertitle(["Tondo, Agosto 1896"], { startBlack: true });
    await wait(300);
    await movePlayer(PRESS_X + 110, 200);
    await playDialogue([
      { speaker: "Jacinto", text: "Dahan-dahan sa diin, Macario. Hinihintay ng bayan ang ikalawang labas." },
    ]);
    setCutscene(false);
  }

  // The press, used with E. In March, a round of the work game; in
  // August, the list of members taken from under it.
  async function usePress() {
    const f = state.flags;
    if (f.a2_paghuli) {
      if (!f.a2_nakitaAngRonda) return;
      if (f.a2_nakuhaAngListahan) {
        thinkAloud("Nasa akin na ang talaan. Sa bintana sa likod ako dadaan.");
        return;
      }
      await takeTheList();
      return;
    }
    if (!f.a2_simula) return;
    // Block 114: one round, as every job is now.
    if (f.a2_nakalimbag) {
      thinkAloud("Tapos na ang limbag ko. Sa iba na ang susunod na pahina."); // PLACEHOLDER
      return;
    }
    const good = await playWorkGame({
      title: "Palimbagan",
      hint: "Diinan ang palimbagan kapag nasa berde ang guhit.",
      verb: "Diinan",
      icon: "i-hand",
      scene: "press",
      hitText: "Malinaw ang limbag!",
      missText: "Kumalat ang tinta!",
      doneText: (n) => n + "/5 ang malinaw na pahina.",
    });
    if (good < 0 || f.a2_nakalimbag) return;
    f.a2_nakalimbag = true;
    markDirty();
    setTimeout(() => runSceneScript(), 0);
  }

  // After the first round: Kalayaan, "from Yokohama", and the list kept
  // under the press, with where everyone lives. PLACEHOLDER, every line.
  async function kalayaan() {
    setCutscene(true);
    await wait(300);
    await playDialogue([
      { speaker: "Jacinto", text: "Heto. Ang ikalawang labas ng Kalayaan." },
      { speaker: "Macario", text: "\"Inilimbag sa Yokohama\" pa rin po?" },
      { speaker: "Jacinto", text: "Doon pa rin. Hanggang ngayon, sa kabilang dagat nila hinahanap ang imprenta." },
      { speaker: "Jacinto", text: "Hindi sa ilalim ng ilong nila." },
      { speaker: "Manlilimbag", text: "Ginoo... may usap-usapan sa pagawaan. May kapatid daw na kinabahan, at nagpunta sa kura." },
      { speaker: "Jacinto", text: "..." },
      { speaker: "Jacinto", text: "Usap-usapan lang 'yan." },
      { speaker: "Manlilimbag", text: "Saan ko po itatago ang talaan?" },
      { speaker: "Jacinto", text: "Sa ilalim ng palimbagan. Ang mga pangalan ng kasapi, at kung saan sila nakatira." },
      { speaker: "Macario (sa isip)", text: "Pati ang pangalan ko. Pati ang bahay namin." },
      { speaker: "Jacinto", text: "Umuwi ka muna, Macario. Ilang gabi ka nang hindi umuuwi." },
    ]);
    setCutscene(false);
  }

  // =============================================================
  // Beat 2. Home, that evening. The ink, "Pangulo", the father, her plea,
  // the promise, and before he can finish answering her, Isko at the
  // door: trouble at the press. Nobody knows it is the sweep. He goes on
  // the promise he has just made, sure he will be back in an hour.
  // PLACEHOLDER, every line.
  // =============================================================
  async function home() {
    setCutscene(true);
    await wait(400);
    await playDialogue([
      { speaker: "Nanay", text: "Anak! Akala ko kung napaano ka na." },
    ]);
    await movePlayer(BAHAY_NANAY_X + BESIDE, 170);
    turnPlayer(-1);
    await playDialogue([
      { speaker: "Nanay", text: "Halika, kumain ka." },
      { speaker: "Nanay", text: "..." },
      { speaker: "Nanay", text: "Ano 'to? Tinta?" },
      { speaker: "Macario", text: "Sa entablado po, 'Nay. Pinta sa—" },
      { speaker: "Nanay", text: "Hindi ganyang kulay ang pinta sa entablado, Macario." },
      { speaker: "Nanay", text: "Noong gabing hinanap kita, may tumawag sa'yo sa pinto. \"Pangulo\"." },
      { speaker: "Macario", text: "'Nay..." },
      { speaker: "Nanay", text: "Hindi ako bingi, anak. Hindi rin bulag ang mga kapitbahay." },
      { speaker: "Nanay", text: "May hinuli na naman daw sa Trozo. Hindi na nakauwi sa pamilya nila." },
      { speaker: "Nanay", text: "Huwag kang makisama sa mga 'yan, anak." },
      { speaker: "Nanay", text: "Ganyan din ang tatay mo. Lumabas isang gabi, sabi babalik bago mag-umaga." },
      { speaker: "Nanay", text: "Hindi ko na siya nakita." },
      { speaker: "Nanay", text: "Hindi kita kayang mawala, Macario. Ikaw na lang ang natitira sa akin." },
      { speaker: "Macario", text: "Hindi po ako mawawala, 'Nay." },
      { speaker: "Macario", text: "Babalik po ako. Pangako." },
      { speaker: "Nanay", text: "..." },
      { speaker: "Nanay", text: "Magluluto ako ng sinigang sa Linggo. Umuwi ka." },
      { speaker: "Macario", text: "Opo, 'Nay. Uuwi p—" },
    ]);
    // The door, hammered.
    playSfx("door");
    await wait(260);
    playSfx("door");
    await wait(260);
    playSfx("door");
    await playDialogue([
      { speaker: "Isko", text: "Pangulo! Pangulo!" },
      { speaker: "Nanay", text: "..." },
    ]);
    turnPlayer(1);
    placeDecoration("isko-bahay", ROOM + 60);
    showDecoration("isko-bahay", true);
    await moveDecoration("isko-bahay", BAHAY_NANAY_X + BESIDE + MEETS, 320);
    // Nobody in the room knows the sweep has begun: Isko brings a
    // problem at the press, nothing more.
    state.flags.a2_paghuli = true;
    markDirty();
    await playDialogue([
      { speaker: "Isko", text: "Pasensya na po sa abala. May problema po sa imprenta." },
      { speaker: "Isko", text: "Ayaw pong ibigay ng mga manlilimbag 'yung mga papel na ipinalimbag natin." },
      { speaker: "Isko", text: "Kanina pa raw po sarado ang pinto. Walang sumasagot." },
      { speaker: "Macario", text: "Hindi ganyan ang mga tao roon." },
      { speaker: "Macario", text: "Pupuntahan ko." },
      { speaker: "Isko", text: "Sasama po ako—" },
      { speaker: "Macario", text: "Hindi. Sabihan mo ang mga kapatid sa pulungan. Baka kailanganin ko sila." },
      { speaker: "Isko", text: "Opo, Pangulo." },
    ]);
    await moveDecoration("isko-bahay", ROOM + 120, 360);
    showDecoration("isko-bahay", false);
    turnPlayer(-1);
    await wait(500);
    await playDialogue([
      { speaker: "Nanay", text: "Macario..." },
      { speaker: "Nanay", text: "Kapapangako mo lang." },
      { speaker: "Macario", text: "Sandali lang po ito, 'Nay. Babalik po ako agad." },
    ]);
    // He turns his back on her and goes.
    await movePlayer(ROOM - 90, 200);
    playSfx("door");
    state.flags.a2_nangako = true;
    markDirty();
    if (window.Acts) Acts.gotoScene("tondo", { x: HOME_X + 60, facing: 1 });
  }

  // =============================================================
  // Beat 4. The sweep, the press: the guardia civil got there first. A
  // printer hiding by the door tells him why. PLACEHOLDER, every line.
  // =============================================================
  async function theRaid() {
    setCutscene(true);
    await wait(500);
    await playDialogue([
      { speaker: "Macario (sa isip)", text: "Bukas ang pinto..." },
      { speaker: "Macario (sa isip)", text: "Mga guardia... nauna na sila." },
      { speaker: "Manlilimbag (pabulong)", text: "Pangulo... dito po." },
    ]);
    turnPlayer(-1);
    await playDialogue([
      { speaker: "Manlilimbag", text: "Pumasok sila bago pa kami makatakbo. Dinampot nila ang iba." },
      { speaker: "Manlilimbag", text: "Kinuha na nila ang mga resibo at ang mga sulat. Pero ang talaan... nasa ilalim pa ng palimbagan." },
      { speaker: "Macario", text: "Kapag nakita nila 'yon..." },
      { speaker: "Manlilimbag", text: "Daan-daang pangalan, Pangulo. Pati ang sa inyo." },
      { speaker: "Macario", text: "Kukunin ko. Lumabas ka na habang abala sila." },
    ]);
    setCutscene(false);
  }

  // Beat 5. The list, and what it means: the receipts the guards took
  // say where he lives. PLACEHOLDER, every line.
  async function takeTheList() {
    setCutscene(true);
    playSfx("page");
    await playDialogue([
      { speaker: "Macario (sa isip)", text: "Nandito... ang talaan ng mga kasapi." },
      { speaker: "Macario (sa isip)", text: "..." },
      { speaker: "Macario (sa isip)", text: "\"Macario Sakay. Tondo. Kasama ang ina.\"" },
      { speaker: "Macario (sa isip)", text: "Ang mga resibong kinuha nila... nakasulat din doon ang tirahan namin." },
      { speaker: "Macario (sa isip)", text: "Si Nanay!" },
      { speaker: "Macario (sa isip)", text: "Iniwan ko siyang mag-isa." },
    ]);
    state.flags.a2_nakuhaAngListahan = true;
    markDirty();
    setCutscene(false);
    showToast("Tumakas sa bintana at balikan si Nanay!", 3200);
  }

  // Out of the back window, onto the street at night. PLACEHOLDER.
  async function outTheWindow() {
    const f = state.flags;
    if (!f.a2_paghuli) {
      thinkAloud("Bintana sa likod. Daan palabas, kung sakaling magkagulo.");
      return;
    }
    if (!f.a2_nakuhaAngListahan) {
      thinkAloud("Hindi ako aalis nang wala ang talaan.");
      return;
    }
    setCutscene(true);
    await playIntertitle(["Gabi na nang makalabas siya sa imprenta."], { keepBlack: true });
    if (window.Acts) Acts.gotoScene("tondo", { x: BEHIND_PRESS_X, facing: -1 });
  }

  // =============================================================
  // Beat 6. The night, short of home: seen. Started where he stands
  // (the checkpoint at SPOTTED_X runs it), a long way short of her
  // door. He turns and runs, away from her. PLACEHOLDER, every line.
  // =============================================================
  async function spotted() {
    setCutscene(true);
    turnPlayer(-1);
    await playDialogue([
      { speaker: "Macario (sa isip)", text: "Malapit na ang bahay..." },
      { speaker: "Macario (sa isip)", text: "Konti na lang, 'Nay." },
    ]);
    refreshOnDuty(); // the two from round the corner
    refreshNpcVisibility(); // and the road out, at the end of the street
    await wait(400);
    await playDialogue([
      { speaker: "Bantay", text: "Hoy, sino ka?!" },
      { speaker: "Macario (sa isip)", text: "Hawak ko ang talaan. Hindi ako puwedeng mahuli." },
    ]);
    turnPlayer(1);
    await playDialogue([
      { speaker: "Bantay", text: "Bumalik ka dito!" },
    ]);
    playSfx("caught");
    setCutscene(false);
    showToast("Tumakbo! Papunta sa bundok, sa dulo ng kalye!", 3600);
  }

  // The road out of Tondo, at the end of the chase: the mountains, on
  // black. He never gets back to her. PLACEHOLDER.
  async function toTheMountains() {
    if (!state.flags.a2_nakita) return;
    setCutscene(true);
    state.flags.a2_nakatakas = true;
    markDirty();
    await playIntertitle(["Tumakas si Macario patungo sa kabundukan.",
      "Hindi na siya nakabalik kay Nanay."], { keepBlack: true });
    await playIntertitle(["Natuklasan ang Katipunan.",
      "Sa loob ng ilang araw, daan-daan ang hinuli sa Tondo."], { startBlack: true, keepBlack: true });
    await playIntertitle(["Agosto 23, 1896", "Pugad Lawin, Kalookan"],
      { startBlack: true, keepBlack: true });
    if (window.Acts) Acts.gotoScene("pugad-lawin", { x: 330, facing: 1 });
  }

  // =============================================================
  // Beat 7. Pugad Lawin. Isko went to the house. Then Bonifacio. The
  // cedula is the student's to tear: Bonifacio's gift button.
  // PLACEHOLDER, every line.
  // =============================================================
  async function theCry() {
    setCutscene(true);
    await wait(400);
    turnPlayer(-1);
    await playDialogue([
      { speaker: "Isko", text: "Pangulo! Buhay kayo!" },
      { speaker: "Macario", text: "Isko. Si Nanay?" },
      { speaker: "Isko", text: "..." },
      { speaker: "Isko", text: "Pumunta po ako sa bahay ninyo kinaumagahan. Wala nang tao. Sira ang pinto." },
      { speaker: "Isko", text: "Walang nakakaalam kung saan siya dinala. O kung... dinala man." },
      { speaker: "Macario", text: "..." },
      { speaker: "Macario", text: "Hindi ko siya pinabantayan." },
      { speaker: "Macario", text: "Inuna ko ang talaan. Ang pangalan ng iba." },
      { speaker: "Isko", text: "Pangulo..." },
    ]);
    turnPlayer(1);
    await wait(600);
    await playDialogue([
      { speaker: "Bonifacio", text: "Mga kapatid! Alam na ng mga Kastila ang lahat." },
      { speaker: "Bonifacio", text: "Hinuhuli na nila tayo isa-isa. Kung maghihintay tayo, sa bilangguan tayo mamamatay." },
      { speaker: "Bonifacio", text: "Kaya ngayon, wala nang atrasan." },
      { speaker: "Bonifacio", text: "Ilabas ang inyong mga sedula!" },
    ]);
    playSfx("page");
    await wait(250);
    playSfx("page");
    await playDialogue([
      { speaker: "Katipunero", text: "Punitin! Punitin!" },
    ]);
    state.flags.a2_nagtalumpati = true;
    markDirty();
    setCutscene(false);
  }

  // After the cedula: to San Juan del Monte, on black. PLACEHOLDER.
  async function toSanJuan() {
    setCutscene(true);
    await wait(300);
    await playIntertitle(["Agosto 30, 1896", "San Juan del Monte"], { keepBlack: true });
    state.flags.a2_papuntangSanJuan = true;
    markDirty();
    if (window.Acts) Acts.gotoScene("san-juan", { x: 600, facing: 1 });
  }

  // =============================================================
  // Beat 8. San Juan del Monte: the charge on the powder store. Fifteen
  // soldiers in four waves, then the rifles from Manila, and the Kasama
  // falls. He told Macario "Huwag kang lilingon" the night he led him
  // in (Act I); he says it again. PLACEHOLDER, every line.
  // =============================================================
  async function theCharge() {
    setCutscene(true);
    showDecoration("bonifacio-sj", true);
    showDecoration("kasama-sj", true);
    await wait(400);
    await playDialogue([
      { speaker: "Bonifacio", text: "Ang polvorin. Doon nakatago ang pulbura at mga armas ng mga Kastila." },
      { speaker: "Bonifacio", text: "Kapag nakuha natin 'yan, may baril na tayo." },
      { speaker: "Kasama", text: "Bolo laban sa riple, Pangulo..." },
      { speaker: "Macario", text: "Mas marami tayo." },
      { speaker: "Bonifacio", text: "Sugod!" },
    ]);
    await Promise.all([
      moveDecoration("bonifacio-sj", 1500, 420),
      moveDecoration("kasama-sj", 1560, 420),
    ]);
    showDecoration("bonifacio-sj", false);
    showDecoration("kasama-sj", false);
    setCutscene(false);
    await battle("sj", [
      { types: ["sundalo", "sundalo", "sundalo", "sundalo"],
        after: [{ speaker: "Macario (sa isip)", text: "May kasunod pa..." }] },
      { types: ["sundalo", "sundalo", "sundalo", "sundalo"],
        after: [{ speaker: "Bonifacio", text: "Huwag kayong titigil! Malapit na tayo sa polvorin!" }] },
      { types: ["sundalo", "bantay", "sundalo", "sundalo"],
        after: [{ speaker: "Macario (sa isip)", text: "Ang dami nila..." }] },
      { types: ["sundalo", "bantay", "sundalo"] },
    ]);
    setCutscene(true);
    await wait(400);
    playSfx("gunShot");
    await wait(220);
    playSfx("gunShot");
    await wait(160);
    playSfx("gunShot");
    await wait(500);
    // The Kasama, beside him for the last of it.
    const here = playerX();
    placeDecoration("kasama-sj", here + MEETS);
    showDecoration("kasama-sj", true);
    turnPlayer(1);
    await playDialogue([
      { speaker: "Kasama", text: "Pangulo! Dumating ang mga sundalo mula sa Maynila!" },
      { speaker: "Bonifacio", text: "Masyado silang marami! Umatras! Sa ilog!" },
    ]);
    playSfx("gunShot");
    await wait(300);
    playSfx("hurt");
    await playDialogue([
      { speaker: "Kasama", text: "Ah—!" },
      { speaker: "Macario", text: "Kasama!" },
      { speaker: "Kasama", text: "Huwag kang lilingon, Pangulo." },
      { speaker: "Kasama", text: "Gaya ng una nating lakad. Huwag kang lilingon." },
      { speaker: "Macario", text: "Hindi kita iiwan—" },
      { speaker: "Kasama", text: "Tumakbo ka na!" },
    ]);
    await playIntertitle(["Umatras ang mga Katipunero."], {
      whileBlack: () => {
        state.flags.a2_lumusob = true;
        markDirty();
        showDecoration("kasama-sj", false);
        refreshOnDuty();
        refreshNpcVisibility();
        placePlayer(RETREAT_START, -1);
      },
    });
    showToast("Umatras sa ilog, sa kaliwa! Iwasan ang mga sundalo.", 3600);
    setCutscene(false);
  }

  // Beat 9. The river, at the left edge, once the retreat is on: across
  // it, on black, to November and the hills of Morong. PLACEHOLDER.
  async function acrossTheRiver() {
    if (!state.flags.a2_lumusob) return;
    setCutscene(true);
    state.flags.a2_nakaatras = true;
    markDirty();
    await playIntertitle(["Mahigit isandaan at limampung Katipunero ang nasawi sa San Juan del Monte.",
      "Isa sa kanila ang Kasama."], { keepBlack: true });
    await playIntertitle(["Nagkawatak-watak ang mga nakaligtas."], { startBlack: true, keepBlack: true });
    await playIntertitle(["Nobyembre 1896", "Kabundukan ng Morong"], { startBlack: true, keepBlack: true });
    if (window.Acts) Acts.gotoScene("nangka", { x: 500, facing: 1 });
  }

  // =============================================================
  // Beat 10. The Nangka River: the scarecrows. PLACEHOLDER, every line.
  // =============================================================
  async function thePlanOfStraw() {
    setCutscene(true);
    await wait(400);
    await playDialogue([
      { speaker: "Bonifacio", text: "Nakuha natin ang Montalban. Pero babalik sila, at mas marami." },
      { speaker: "Bonifacio", text: "Kulang tayo sa tao. Kaya gagawa tayo ng tao." },
      { speaker: "Macario", text: "Po?" },
      { speaker: "Bonifacio", text: "Dayami, Sakay. Dayami at sombrero." },
      { speaker: "Bonifacio", text: "Artista ka, 'di ba? Ito ang pinakamalaki mong entablado." },
      { speaker: "Katipunero", text: "Tatlong bigkis ng dayami ang nasa pampang. Itayo mo, at susuotan namin ng sombrero." },
      { speaker: "Macario (sa isip)", text: "Mga artistang hindi humihinga... Sana maniwala ang mga manonood." },
    ]);
    setCutscene(false);
  }

  function raiseScarecrow(n) {
    return () => {
      const f = state.flags;
      if (!f.a2_planoNgPanakot) return;
      f[PANAKOT_FLAGS[n]] = true;
      markDirty();
      refreshNpcVisibility();
      playSfx("give");
      const raised = PANAKOT_FLAGS.filter((k) => f[k]).length;
      showToast("Naitayo ang panakot (" + raised + "/" + PANAKOT_FLAGS.length + ")", 2000);
      if (raised === PANAKOT_FLAGS.length && !f.a2_naitayoAngPanakot) {
        f.a2_naitayoAngPanakot = true;
        markDirty();
        setTimeout(() => runSceneScript(), 400);
      }
    };
  }

  // The Spanish come, and shoot at straw; then the fight, and the
  // reinforcements. To Balara on black. PLACEHOLDER, every line.
  async function theStrawArmy() {
    setCutscene(true);
    await wait(500);
    await playDialogue([
      { speaker: "Katipunero", text: "Ayan na sila! Sa kabilang pampang!" },
    ]);
    for (const gap of [0, 300, 180, 420]) {
      await wait(gap);
      playSfx("gunShot");
    }
    await wait(500);
    await playDialogue([
      { speaker: "Katipunero", text: "Binabaril nila ang dayami!" },
      { speaker: "Bonifacio", text: "Habang abala sila sa mga panakot, sa gilid tayo lulusob. Sugod!" },
    ]);
    setCutscene(false);
    await battle("ng", [
      { types: ["sundalo", "sundalo", "sundalo"],
        after: [{ speaker: "Katipunero", text: "Hindi nila alam kung saan kami nanggaling!" }] },
      { types: ["sundalo", "bantay", "sundalo"] },
    ]);
    setCutscene(true);
    await wait(400);
    await playDialogue([
      { speaker: "Katipunero", text: "Supremo! May dagdag na hukbo mula sa San Mateo!" },
      { speaker: "Bonifacio", text: "Hindi natin sila kaya ngayon. Umatras! Sa Balara!" },
    ]);
    await playIntertitle(["Dumating ang dagdag na hukbo ng Espanya.",
      "Umatras sina Macario at ang Supremo sa Balara."], { keepBlack: true });
    if (window.Acts) Acts.gotoScene("balara", { x: 400, facing: 1 });
  }

  // =============================================================
  // Beat 11. Balara, the same week, at night: news from Cavite.
  // PLACEHOLDER, every line.
  // =============================================================
  async function newsFromCavite() {
    setCutscene(true);
    await wait(600);
    placeDecoration("tagapagbalita", viewEdges().right + 80);
    showDecoration("tagapagbalita", true);
    await moveDecoration("tagapagbalita", 820, 260);
    await playDialogue([
      { speaker: "Tagapagbalita", text: "Supremo! Balita mula sa Cavite!" },
      { speaker: "Tagapagbalita", text: "Itinaboy ng mga tauhan ni Aguinaldo ang mga Kastila!" },
      { speaker: "Katipunero", text: "Sa Cavite, nananalo sila. Tayo rito, umaatras." },
      { speaker: "Bonifacio", text: "..." },
      { speaker: "Bonifacio", text: "Mabuti. Iisang Katipunan lang tayo." },
    ]);
    await moveDecoration("tagapagbalita", ROOM + 120, 240);
    showDecoration("tagapagbalita", false);
    setCutscene(false);
  }

  // After the talk by the fire: 1897 on black, and Laguna.
  async function theSplit() {
    setCutscene(true);
    await wait(300);
    await playIntertitle(["Marso 1897, Tejeros.", "Nahati ang himagsikan."], { keepBlack: true });
    await playIntertitle(["Mayo 10, 1897.", "Pinatay si Andres Bonifacio ng sarili niyang mga kasama."],
      { startBlack: true, keepBlack: true });
    await playIntertitle(["Laguna, 1897"], { startBlack: true, keepBlack: true });
    state.flags.a2_saLaguna = true;
    markDirty();
    if (window.Acts) Acts.gotoScene("laguna", { x: 450, facing: 1 });
  }

  // =============================================================
  // Beat 12. Laguna: Jacinto. PLACEHOLDER, every line.
  // =============================================================
  async function withJacinto() {
    setCutscene(true);
    await wait(400);
    await movePlayer(LAGUNA_JACINTO_X - BESIDE, 170);
    turnPlayer(1);
    await playDialogue([
      { speaker: "Macario", text: "Ginoong Jacinto." },
      { speaker: "Jacinto", text: "Macario. Buhay ka pa." },
      { speaker: "Macario", text: "Totoo po ba? Ang Supremo..." },
      { speaker: "Jacinto", text: "Totoo." },
      { speaker: "Jacinto", text: "Nilitis siya ng mga taga-Cavite, at ipinapatay." },
      { speaker: "Macario", text: "..." },
      { speaker: "Jacinto", text: "Sa kanila na ang pamahalaan nila. Pero sa atin pa rin ang Katipunan na itinatag niya." },
      { speaker: "Macario (sa isip)", text: "Hindi ako susunod sa pumatay sa Supremo." },
      { speaker: "Jacinto", text: "Magpahinga ka muna. Mahaba pa ang laban." },
    ]);
    setCutscene(false);
  }

  // Beat 13. The end of Act II: the years after, on black, and what he
  // makes of the last of them; Nanay still not found. The last card is
  // the one that lifts the black the others left (game.js, Block 113).
  // PLACEHOLDER, every line.
  async function theEnd() {
    setCutscene(true);
    await wait(300);
    await playIntertitle(["Disyembre 1897. Sa Biak-na-Bato, lumagda ng kasunduan ang mga pinuno ng himagsikan,",
      "at naglayag sila patungong Hong Kong."], { keepBlack: true });
    await playIntertitle(["1898. Dumating ang mga Amerikano."], { startBlack: true, keepBlack: true });
    await playIntertitle(["Hunyo 12, 1898. Idineklara ang kalayaan sa Kawit."], { startBlack: true, keepBlack: true });
    await playIntertitle(["Disyembre 1898. Ipinagbili ng Espanya ang Pilipinas sa Amerika",
      "sa halagang dalawampung milyong dolyar."], { startBlack: true });
    await wait(400);
    await playDialogue([
      { speaker: "Macario (sa isip)", text: "Dati, isang sedula ang halaga ko sa mga Kastila." },
      { speaker: "Macario (sa isip)", text: "Ngayon, ipinagbili nila ang buong bayan, na para bang kanila." },
      { speaker: "Macario (sa isip)", text: "At si Nanay... hindi ko pa rin alam kung nasaan siya." },
      { speaker: "Macario (sa isip)", text: "Babalik po ako, 'Nay. Pangako." },
      { speaker: "Jacinto", text: "Hindi pa tapos, Macario." },
      { speaker: "Macario", text: "Hindi pa po." },
    ]);
    await playIntertitle(["Wakas ng Ikalawang Yugto"]);
    state.flags.a2_wakas = true;
    markDirty();
    setCutscene(false);
  }

  // ---- The Talaan ----------------------------------------------------
  // Three papers of facts of the game's own, on the street (fixed, as
  // Act I's); a teacher's paper replaces its own slot. PLACEHOLDER.
  const HINT_SPOTS = [2600, { x: 4500, y: HINT_HIGH }, { x: 6100, y: HINT_HIGH }];

  // ---- Story points (?dev=1, Block 108) ---------------------------------
  // Each the flags set by then, built on the one before. Each guest wears
  // the stage clothes, which Act I handed over and he still wears.
  const DEV_PRINTED = { a2_simula: true, a2_nakalimbag: true, a2_umuwiNa: true };
  const DEV_SWEEP = Object.assign({}, DEV_PRINTED, { a2_nangako: true, a2_paghuli: true });
  const DEV_RAID = Object.assign({}, DEV_SWEEP, { a2_napansin: true, a2_nakitaAngRonda: true });
  const DEV_NIGHT = Object.assign({}, DEV_RAID, { a2_nakuhaAngListahan: true, a2_gabiNa: true });
  const DEV_CHASE = Object.assign({}, DEV_NIGHT, { a2_gabi1: true, a2_nakita: true });
  const DEV_CRY = Object.assign({}, DEV_CHASE, { a2_hinabol: true, a2_nakatakas: true });
  const DEV_CHARGE = Object.assign({}, DEV_CRY, { a2_nagtalumpati: true, a2_pinunit: true, a2_papuntangSanJuan: true });
  const DEV_RETREAT = Object.assign({}, DEV_CHARGE, { a2_lumusob: true });
  const DEV_STRAW = Object.assign({}, DEV_RETREAT, { a2_nakaatras: true });
  const DEV_BALARA = Object.assign({}, DEV_STRAW, { a2_planoNgPanakot: true, a2_naitayoAngPanakot: true,
    a2_saBalara: true }, Object.fromEntries(PANAKOT_FLAGS.map((k) => [k, true])));
  const DEV_LAGUNA = Object.assign({}, DEV_BALARA, { a2_balitaNgCavite: true, a2_kinausapAngSupremo: true,
    a2_saLaguna: true });
  const CLOTHES = ["damit-entablado"];
  const DEV_JUMPS = [
    { id: "simula", items: CLOTHES, label: "Ang simula: ang Kalayaan (Agosto 1896)", scene: "imprenta",
      flags: {}, task: "Maglimbag ng Kalayaan" },
    { id: "uwi", items: CLOTHES, label: "Pauwi kay Nanay", scene: "tondo",
      x: PRESS_DOOR_X - 60, facing: -1, flags: DEV_PRINTED, task: "Umuwi sa bahay" },
    { id: "bahay", items: CLOTHES, label: "Sa bahay: si Nanay", scene: "bahay",
      x: ROOM - 160, facing: -1, flags: DEV_PRINTED, task: "Umuwi sa bahay" },
    { id: "paghuli", items: CLOTHES, label: "Ang paghuli: pabalik sa imprenta", scene: "tondo",
      x: HOME_X + 60, facing: 1, flags: DEV_SWEEP, task: "Bumalik sa imprenta" },
    { id: "ronda", items: CLOTHES, label: "Ang ronda sa imprenta", scene: "imprenta",
      x: PRESS_ENTER_X, facing: -1, flags: DEV_RAID, task: "Kunin ang talaan ng mga kasapi" },
    { id: "gabi", items: CLOTHES, label: "Ang gabi: pauwi kay Nanay", scene: "tondo",
      x: BEHIND_PRESS_X, facing: -1, flags: DEV_NIGHT, task: "Balikan si Nanay" },
    { id: "habol", items: CLOTHES, label: "Ang habulan: papunta sa bundok", scene: "tondo",
      x: SPOTTED_X, facing: -1, flags: DEV_CHASE, task: "Tumakas papunta sa bundok" },
    { id: "sedula", items: CLOTHES, label: "Pugad Lawin: ang mga sedula", scene: "pugad-lawin",
      flags: DEV_CRY, task: "Punitin ang sedula" },
    { id: "sanjuan", items: CLOTHES, label: "San Juan del Monte: ang paglusob", scene: "san-juan",
      flags: DEV_CHARGE, task: "Lumusob sa San Juan del Monte" },
    { id: "atras", items: CLOTHES, label: "San Juan del Monte: ang pag-atras", scene: "san-juan",
      x: RETREAT_START, facing: -1, flags: DEV_RETREAT, task: "Umatras sa ilog" },
    { id: "panakot", items: CLOTHES, label: "Ilog Nangka: ang mga panakot", scene: "nangka",
      flags: DEV_STRAW, task: "Itayo ang mga panakot" },
    { id: "balara", items: CLOTHES, label: "Balara: ang Supremo", scene: "balara",
      flags: DEV_BALARA, task: "Kausapin ang Supremo" },
    { id: "laguna", items: CLOTHES, label: "Laguna: si Jacinto", scene: "laguna",
      flags: DEV_LAGUNA, task: "Sumama kay Jacinto sa Laguna" },
  ];

  const oneLine = (speaker, text, extra) => Object.assign({ lines: [{ speaker, text }] }, extra || {});

  window.ACT_2 = {
    number: 2,
    title: "The Long Shadow of War",
    titleTagalog: "Ang Mahabang Anino ng Digmaan",
    devJumps: DEV_JUMPS,

    // One chain, in story order, the quest log (Block 48).
    //
    //   1  the first round at the press (usePress).
    //   2  home, Nanay, and the sweep breaking in on the promise (home).
    //   3  the press reached again, through the sweep (theRaid).
    //   4  the list taken from under the press (takeTheList).
    //   5  back toward Nanay, until he is seen short of home (spotted).
    //   6  the chase, to the road to the mountains (toTheMountains).
    //   7  the cedula torn, Bonifacio's gift.
    //   8  the charge at San Juan del Monte (theCharge, 15 soldiers).
    //   9  across the river (acrossTheRiver), past the rifles.
    //  10  three scarecrows on the Nangka (n/3).
    //  11  the fight at the river and the retreat (theStrawArmy).
    //  12  the talk with Bonifacio by the fire at Balara.
    //  13  Jacinto in Laguna (withJacinto).
    //  14  staying with him, and the end (theEnd), which finishes Act II.
    linearObjectives: true,
    objectives: [
      { id: "maglimbag", label: "Maglimbag ng Kalayaan", flag: "a2_nakalimbag" },
      { id: "umuwi", label: "Umuwi sa bahay", flag: "a2_nangako" },
      { id: "bumalik_imprenta", label: "Bumalik sa imprenta", flag: "a2_nakitaAngRonda" },
      { id: "kunin_talaan", label: "Kunin ang talaan ng mga kasapi", flag: "a2_nakuhaAngListahan" },
      { id: "balikan_nanay", label: "Balikan si Nanay", flag: "a2_nakita" },
      { id: "tumakas", label: "Tumakas papunta sa bundok", flag: "a2_nakatakas" },
      { id: "punitin_sedula", label: "Punitin ang sedula", flag: "a2_pinunit" },
      { id: "lumusob", label: "Lumusob sa San Juan del Monte", flag: "a2_lumusob" },
      { id: "umatras", label: "Umatras sa ilog", flag: "a2_nakaatras" },
      { id: "panakot", label: "Itayo ang mga panakot", flag: "a2_naitayoAngPanakot",
        countFlags: PANAKOT_FLAGS },
      { id: "ilog_nangka", label: "Labanan ang mga Kastila sa ilog", flag: "a2_saBalara" },
      { id: "kausapin_supremo", label: "Kausapin ang Supremo", flag: "a2_kinausapAngSupremo" },
      { id: "kay_jacinto", label: "Sumama kay Jacinto sa Laguna", flag: "a2_kayJacinto" },
      { id: "manatili", label: "Kausapin si Jacinto", flag: "a2_wakas" },
    ],
    startingQuests: [],

    hints: {
      count: 3,
      fixed: true,
      label: "Papel",
      listLabel: "Mga Papel",
      places: [
        "On the street between Nanay's house and the Kutsero. Every student walks past it on the way home.",
        "On the street by the mangingisda, at jump height: the student has to jump for it.",
        "On the street just past the Mananahi, at jump height, short of the press.",
      ],
      foundText: "Naitala ito sa Talaan. Buksan ang Talaan sa pause para basahin ulit.",
      completeText: "Nahanap mo na ang lahat ng papel!",
      pool: [
        { slot: 1, title: "Ang Kalayaan",
          text: "Kalayaan ang pahayagan ng Katipunan. Inilimbag ito noong Marso 1896, at si Emilio Jacinto ang patnugot nito. Nakasulat dito na sa Yokohama, Hapon, ito inilimbag, para linlangin ang mga Kastila. Matapos itong lumabas, libu-libo ang sumapi sa Katipunan." },
        { slot: 2, title: "Ang pagkatuklas",
          text: "Noong Agosto 19, 1896, ipinagtapat ng isang kasapi, si Teodoro Patiño, ang lihim ng Katipunan kay Padre Mariano Gil, ang kura ng Tondo. Hinalughog ng mga Kastila ang isang imprenta, at nagsimula ang malawakang paghuli." },
        { slot: 3, title: "Ang Sigaw at ang San Juan del Monte",
          text: "Noong huling linggo ng Agosto 1896, pinunit ng mga Katipunero ang kanilang mga sedula bilang tanda ng paghihimagsik. Noong Agosto 30, 1896, nilusob nila ang polvorin ng mga Kastila sa San Juan del Monte. Mahigit 150 Katipunero ang nasawi." },
      ],
    },

    scenes: [
      {
        // Beats 1, 4 and 5. The Katipunan's press, and the act's first
        // scene. Its painting is owed. March: Jacinto and the printer, the
        // press used with E. August: three guardia civil searching it
        // (they catch, not shoot), two shelves above their sight, the
        // list under the press, the window out at the left edge.
        id: "imprenta",
        worldWidth: PRESS_WIDTH,
        backdrop: { src: "assets/backgrounds/act2/imprenta.jpg" },
        ground: { floor: "kahoy" }, // Block 114
        noRanged: true,
        startX: PRESS_ENTER_X,
        exits: [
          { id: "labas", x: PRESS_WIDTH - 70, width: 70, label: "Lumabas", requiresFlag: "a2_simula",
            unlessFlag: "a2_nakuhaAngListahan",
            toScene: "tondo", toX: PRESS_DOOR_X - 60, toFacing: -1 },
        ],
        guards: PRESS_GUARDS.map((g, i) => ({
          type: "bantay", id: "guardia-loob-" + (i + 1), shoots: false,
          x: g.facing < 0 ? g.beat[1] : g.beat[0], patrolFrom: g.beat[0], patrolTo: g.beat[1],
          facing: g.facing, requiresFlag: "a2_paghuli", unlessFlag: "a2_nakatakas",
        })),
        hideSpots: PRESS_GUARDS.map((g) => ({ x: g.hide, width: 110,
          requiresFlag: "a2_paghuli", unlessFlag: "a2_nakatakas" })),
        platforms: PRESS_SHELVES,
        checkpoints: reached(PRESS_CHECKPOINTS, "a2_loob", "a2_nakitaAngRonda"),
        scripts: [
          // Listed first: after the round, Kalayaan and the list.
          { requiresFlag: "a2_nakalimbag", unlessFlag: "a2_paghuli", doneFlag: "a2_umuwiNa",
            run: kalayaan },
          { unlessFlag: "a2_paghuli", doneFlag: "a2_simula", x: 900, facing: -1, run: theFirstPage },
          { requiresFlag: "a2_paghuli", doneFlag: "a2_nakitaAngRonda", x: PRESS_ENTER_X, facing: -1,
            run: theRaid },
        ],
        decorations: [],
        npcs: [
          {
            // The press, used with E (usePress).
            id: "palimbagan", x: PRESS_X, label: "Palimbagan", animation: PALIMBAGAN,
            displayHeight: 110,
            interactLabel: "Gamitin",
            interactIcon: "i-hand",
            dialogueSets: [],
            onInteract: usePress,
          },
          {
            // The back window: no picture, only a body to reach.
            id: "bintana", x: WINDOW_X, label: "Bintana", scenery: true,
            interactLabel: "Tumakas sa bintana",
            interactIcon: "i-out",
            dialogueSets: [],
            onInteract: outTheWindow,
          },
          {
            id: "jacinto", x: JACINTO_PRESS_X, label: "Jacinto", animation: JACINTO,
            hiddenByFlag: "a2_paghuli",
            // PLACEHOLDER.
            dialogueSets: [
              oneLine("Jacinto", "Pantay na diin, Macario. Ang malabong letra, hindi mababasa ng bayan.",
                { skipIfFlag: "a2_umuwiNa" }),
              oneLine("Jacinto", "Umuwi ka na. Hinihintay ka ng nanay mo.", { requiresFlag: "a2_umuwiNa" }),
            ],
          },
          {
            id: "manlilimbag", x: PRINTER_X, label: "Manlilimbag", animation: MANLILIMBAG,
            hiddenByFlag: "a2_paghuli",
            dialogueSets: [
              oneLine("Manlilimbag", "Yokohama, ha. Ni hindi ko alam kung saan 'yon."),
            ],
          },
          {
            // August: the printer who hid when the guards came.
            id: "manlilimbag-nakatago", x: HIDING_PRINTER_X, label: "Manlilimbag", animation: MANLILIMBAG,
            startsHidden: true, revealedByFlag: "a2_paghuli",
            speakers: ["Manlilimbag (pabulong)"],
            dialogueSets: [
              oneLine("Manlilimbag (pabulong)", "Bilisan n'yo po, Pangulo. Sa ilalim ng palimbagan."),
            ],
          },
        ],
      },
      {
        // The street. The walk home: the neighbours afraid of him. The
        // sweep (a2_paghuli), which he does not know is one: nobody out,
        // four guards on the way back to the press. The night: two
        // patrols, the shout short of home, and the chase to the
        // mountains. The night of the raid (from the list):
        // dark, nobody out, four more guards, and two at Nanay's door. No
        // gun among the neighbours (noRanged).
        id: "tondo",
        worldWidth: STREET_WIDTH,
        panels: STREET_PANELS,
        panelSky: STREET_SKY,
        startX: HOME_X + 150,
        hintSpots: HINT_SPOTS,
        noRanged: true,
        night: { requiresFlag: "a2_nakuhaAngListahan", unlessFlag: "a2_nakatakas", music: NIGHT },
        guards: [
          ...DAY_GUARDS.map((g, i) => ({
            type: "bantay", id: "guardia-araw-" + (i + 1), shoots: false,
            x: g.beat[0], patrolFrom: g.beat[0], patrolTo: g.beat[1], facing: 1,
            requiresFlag: "a2_paghuli", unlessFlag: "a2_nakuhaAngListahan",
          })),
          ...NIGHT_GUARDS.map((g, i) => ({
            type: "bantay", id: "guardia-gabi-" + (i + 1), shoots: false,
            x: g.beat[1], patrolFrom: g.beat[0], patrolTo: g.beat[1], facing: -1,
            requiresFlag: "a2_nakuhaAngListahan", unlessFlag: "a2_nakita",
          })),
          // Seen: the two from round the corner, after him from the start
          // (hostile, Block 113), until he is out of Tondo.
          ...CHASERS_X.map((x, i) => ({
            type: "bantay", id: "guardia-habol-" + (i + 1), hostile: true,
            x, patrolFrom: x, patrolTo: x, facing: 1,
            requiresFlag: "a2_nakita", unlessFlag: "a2_nakatakas",
          })),
          // And two on the way, who turn on him when they see him.
          ...CHASE_GUARDS.map((g, i) => ({
            type: "bantay", id: "guardia-daan-" + (i + 1),
            x: g.beat[1], patrolFrom: g.beat[0], patrolTo: g.beat[1], facing: -1,
            requiresFlag: "a2_nakita", unlessFlag: "a2_nakatakas",
          })),
        ],
        hideSpots: [
          ...DAY_GUARDS.map((g) => ({ x: g.hide, width: 110,
            requiresFlag: "a2_paghuli", unlessFlag: "a2_nakuhaAngListahan" })),
          ...NIGHT_GUARDS.map((g) => ({ x: g.hide, width: 110,
            requiresFlag: "a2_nakuhaAngListahan", unlessFlag: "a2_nakita" })),
        ],
        // In route order: the day's run to the press, then the night's
        // back from it (game.js, respawnX takes the last reached).
        checkpoints: [
          ...reached(DAY_CHECKPOINTS, "a2_araw", "a2_paghuli"),
          { x: BEHIND_PRESS_X, flag: "a2_nakuhaAngListahan" },
          ...reached(NIGHT_CHECKPOINTS, "a2_gabi", "a2_nakuhaAngListahan"),
          // The shout: reached, it starts spotted (script).
          { x: SPOTTED_X, flag: "a2_nakita", reach: true, requiresFlag: "a2_nakuhaAngListahan", script: true },
          ...reached(CHASE_CHECKPOINTS, "a2_habol", "a2_nakita"),
        ],
        pickups: [
          { id: "puso-habol-1", x: 6650, type: "heart" },
          { id: "puso-habol-2", x: 9000, type: "heart" },
        ],
        exits: [
          { id: "bahay", x: HOME_X - 40, width: 80, label: "Pumasok sa bahay",
            unlessFlag: "a2_nakuhaAngListahan",
            toScene: "bahay", toX: ROOM - 160, toFacing: -1 },
          { id: "imprenta", x: PRESS_DOOR_X, width: 80, label: "Pumasok sa imprenta",
            unlessFlag: "a2_nakuhaAngListahan",
            toScene: "imprenta", toX: PRESS_ENTER_X, toFacing: -1 },
        ],
        // On the way to the press, more guards than he has ever seen; out
        // of the window, the first thing he thinks. PLACEHOLDER.
        arrivalDialogues: [
          {
            requiresFlag: "a2_paghuli", unlessFlag: "a2_nakuhaAngListahan", doneFlag: "a2_napansin",
            lines: [
              { speaker: "Macario (sa isip)", text: "Bakit ang daming guardia sa kalye?" },
              { speaker: "Macario (sa isip)", text: "...Hindi ako dapat makita." },
            ],
          },
          {
            requiresFlag: "a2_nakuhaAngListahan", doneFlag: "a2_gabiNa",
            x: BEHIND_PRESS_X, facing: -1,
            lines: [
              { speaker: "Macario (sa isip)", text: "Kailangan kong maunahan sila sa bahay." },
              { speaker: "Macario (sa isip)", text: "Wala akong pinabantay sa kanya. Wala ni isa." },
            ],
          },
        ],
        scripts: [
          // The shout, where he stands (the checkpoint at SPOTTED_X).
          { requiresFlag: "a2_nakita", doneFlag: "a2_hinabol", run: spotted },
        ],
        decorations: [],
        npcs: [
          {
            // The chase's end: the road out of Tondo, to the mountains.
            id: "bundok", x: MOUNTAIN_ROAD_X, label: "Daan sa bundok", scenery: true,
            startsHidden: true, revealedByFlag: "a2_nakita", hiddenByFlag: "a2_nakatakas",
            interactLabel: "Tumakas sa bundok",
            interactIcon: "i-out",
            dialogueSets: [],
            onInteract: toTheMountains,
          },
          // The neighbours, on the walk home: none will be seen with him.
          // Indoors once the sweep is on. PLACEHOLDER, every line.
          {
            id: "kutsero", x: KUTSERO_X, label: "Kutsero", animation: P.kutsero, hiddenWhile: SWEEP,
            dialogueSets: [
              oneLine("Kutsero", "Hindi kita kilala, iho. Umalis ka na."),
            ],
          },
          {
            id: "mangingisda", x: MANGINGISDA_X, label: "Mangingisda", animation: P.mangingisda, hiddenWhile: SWEEP,
            dialogueSets: [
              oneLine("Mangingisda", "Sinunog ko na 'yung ibinigay mo noon. Pasensya na."),
            ],
          },
          {
            id: "barbero", x: BARBERO_X, label: "Barbero", animation: P.barbero, hiddenWhile: SWEEP,
            dialogueSets: [
              oneLine("Barbero", "Sarado kami. May nagtanong tungkol sa'yo kaninang umaga. Hindi ko sinabi kung saan ka nakatira."),
            ],
          },
          {
            id: "mananahi", x: MANANAHI_X, label: "Mananahi", animation: P.mananahi, hiddenWhile: SWEEP,
            speakers: ["Mananahi (pabulong)"],
            dialogueSets: [
              oneLine("Mananahi (pabulong)", "May kura raw sa Tondo na may alam na. Umalis ka muna, iho, habang kaya mo pa."),
            ],
          },
          {
            id: "tabakera", x: TABAKERA_X, label: "Tabakera", animation: P.tabakera, hiddenWhile: SWEEP,
            dialogueSets: [
              oneLine("Tabakera", "Tatlo na ang hinuli sa pagawaan kahapon. Huwag kang lalapit sa akin."),
            ],
          },
          {
            id: "karpintero", x: KARPINTERO_X, label: "Karpintero", animation: P.karpintero, hiddenWhile: SWEEP,
            dialogueSets: [
              oneLine("Karpintero", "Wala akong kilalang Macario. Wala."),
            ],
          },
          {
            id: "maryam", x: MARYAM_X, label: "Maryam", animation: P.maryam, hiddenWhile: SWEEP,
            dialogueSets: [
              {
                lines: [
                  { speaker: "Maryam", text: "May mga guardia sa entablado kanina. Hinahanap ka." },
                  { speaker: "Maryam", text: "Sino ba talaga 'yung dalawang lalaki noon, Macario?" },
                  { speaker: "Macario", text: "Mas mabuti nang hindi mo alam." },
                ],
              },
            ],
          },
          {
            id: "direktor", x: DIREKTOR_X, label: "Direktor", animation: P.direktor, facesPlayer: true,
            hiddenWhile: SWEEP,
            dialogueSets: [
              oneLine("Direktor", "Sarado ang entablado hanggang sa susunod na abiso. Mag-ingat ka, iho."),
            ],
          },
        ],
      },
      {
        // Beat 2. Home, one room; its painting is owed. Reached from the
        // street on the walk home, and (if he goes back in) in the sweep.
        id: "bahay",
        worldWidth: ROOM,
        backdrop: { src: "assets/backgrounds/act2/bahay.jpg" },
        ground: { floor: "kawayan" }, // Block 114
        noRanged: true,
        startX: ROOM - 160,
        wayOut: "Lumabas ng bahay: pumunta sa kanan",
        exits: [
          { id: "labas", x: ROOM - 70, width: 70, label: "Lumabas",
            toScene: "tondo", toX: HOME_X + 60, toFacing: 1 },
        ],
        scripts: [
          { requiresFlag: "a2_nakalimbag", unlessFlag: "a2_paghuli", doneFlag: "a2_nangako",
            x: ROOM - 160, facing: -1, run: home },
        ],
        decorations: [
          { id: "isko-bahay", x: ROOM + 60, hidden: true, animation: ISKO, faceMovement: true },
        ],
        npcs: [
          {
            id: "nanay", x: BAHAY_NANAY_X, label: "Nanay", animation: P.nanay, facesPlayer: true,
            // PLACEHOLDER. If he goes back in during the sweep.
            dialogueSets: [
              oneLine("Nanay", "Anak, huwag ka nang lumabas. Pakiusap."),
            ],
          },
        ],
      },
      {
        // Beat 7. Pugad Lawin, 23 August 1896. One screen; its painting
        // is owed. The cedula is Bonifacio's gift button.
        id: "pugad-lawin",
        worldWidth: ROOM,
        backdrop: { src: "assets/backgrounds/act2/pugad-lawin.jpg" },
        ground: { floor: "damo" }, // Block 114
        noRanged: true,
        startX: 330,
        scripts: [
          { requiresFlag: "a2_pinunit", doneFlag: "a2_papuntangSanJuan", run: toSanJuan },
          { doneFlag: "a2_nagtalumpati", x: 330, facing: 1, run: theCry },
        ],
        decorations: [],
        npcs: [
          {
            id: "isko", x: 140, label: "Isko", animation: ISKO, facesPlayer: true,
            dialogueSets: [oneLine("Isko", "Magtatanong-tanong po ako, Pangulo. May makakaalam din kung nasaan siya.")],
          },
          {
            id: "katipunero", x: 520, label: "Katipunero", animation: P.katipunero.idle, facesPlayer: true,
            dialogueSets: [oneLine("Katipunero", "Wala nang sedula. Wala nang atrasan.")],
          },
          {
            id: "bonifacio", x: 780, label: "Bonifacio", animation: BONIFACIO,
            // PLACEHOLDER, every line.
            dialogueSets: [
              oneLine("Bonifacio", "Ilabas mo ang sedula mo, kapatid.", { skipIfFlag: "a2_pinunit" }),
              oneLine("Bonifacio", "Sa makalawa, sa San Juan del Monte.", { requiresFlag: "a2_pinunit" }),
            ],
            gift: {
              buttonLabel: "Punitin ang sedula",
              requiresFlag: "a2_nagtalumpati",
              givenFlag: "a2_pinunit",
              responseLines: [
                { speaker: "Macario (sa isip)", text: "Ito ang papel na umubos sa pitaka ni Nanay." },
                { speaker: "Macario (sa isip)", text: "Kung nasaan ka man ngayon, 'Nay... para sa'yo ito." },
                { speaker: "Macario", text: "Wala nang sedula. Wala nang alipin." },
                { speaker: "Mga Katipunero", text: "Mabuhay ang Pilipinas!" },
                { speaker: "Bonifacio", text: "Ikaw si Sakay, 'di ba? 'Yung artista." },
                { speaker: "Macario", text: "Opo, Supremo." },
                { speaker: "Bonifacio", text: "Napanood kita bilang Baldovino. \"Walang bayang mananatiling alipin...\"" },
                { speaker: "Bonifacio", text: "Akala ko, linya lang. Ngayon, nakikita kong hindi." },
                { speaker: "Bonifacio", text: "Sa makalawa, lulusob tayo sa San Juan del Monte. Sumama ka sa akin." },
                { speaker: "Macario", text: "Opo." },
              ],
              onComplete() {
                playSfx("page");
                setTimeout(() => runSceneScript(), 0);
              },
            },
          },
          {
            id: "kasama", x: 980, label: "Kasama", animation: P.kasama.idle, facesPlayer: true,
            dialogueSets: [oneLine("Kasama", "Akala ko, nahuli ka na sa Tondo, Pangulo.")],
          },
        ],
      },
      {
        // Beats 8 and 9. San Juan del Monte, 30 August 1896. The charge
        // (theCharge), the Kasama's death, then the rifles in the field
        // between Macario and the river, and the river at the left edge.
        // Its painting is owed. A reload in the retreat starts at the last
        // line of rifles he passed.
        id: "san-juan",
        worldWidth: BATTLE_WIDTH,
        backdrop: { src: "assets/backgrounds/act2/san-juan.jpg" },
        ground: { floor: "damo" }, // Block 114
        dangerous: true,
        startX: RETREAT_START,
        scripts: [
          { requiresFlag: "a2_papuntangSanJuan", doneFlag: "a2_lumusob", x: 600, facing: 1,
            run: theCharge },
        ],
        guards: RETREAT_GUARDS.map((g, i) => ({
          type: "bantay", id: "riple-" + (i + 1),
          x: g.beat[1], patrolFrom: g.beat[0], patrolTo: g.beat[1], facing: 1,
          requiresFlag: "a2_lumusob", unlessFlag: "a2_nakaatras",
        })),
        hideSpots: RETREAT_GUARDS.map((g) => ({ x: g.hide, width: 110,
          requiresFlag: "a2_lumusob", unlessFlag: "a2_nakaatras" })),
        checkpoints: [
          { x: RETREAT_START, flag: "a2_lumusob" },
          ...reached(RETREAT_CHECKPOINTS, "a2_atras", "a2_lumusob"),
        ],
        pickups: [
          { id: "puso-sj-1", x: 1400, type: "heart" },
          { id: "puso-sj-2", x: 2100, type: "heart" },
          { id: "puso-sj-3", x: 2800, type: "heart" },
          { id: "puso-sj-4", x: 3500, type: "heart" },
        ],
        decorations: [
          { id: "bonifacio-sj", x: 450, hidden: true, animation: BONIFACIO, faceMovement: true, speakers: ["Bonifacio"] },
          { id: "kasama-sj", x: 760, hidden: true, animation: P.kasama.idle, walkAnimation: P.kasama.walk,
            faceMovement: true, speakers: ["Kasama"] },
        ],
        npcs: [
          {
            id: "ilog", x: 20, label: "Ilog", scenery: true,
            startsHidden: true, revealedByFlag: "a2_lumusob",
            interactLabel: "Tumawid sa ilog",
            interactIcon: "i-out",
            dialogueSets: [],
            onInteract: acrossTheRiver,
          },
        ],
      },
      {
        // Beats 10 and 11. The Nangka River, November 1896. Three
        // bundles of straw on the bank; each raised is a scarecrow in a
        // Katipunan hat (the bundle hidden, the scarecrow shown, from the
        // flags, so a reload keeps them). Its painting is owed.
        id: "nangka",
        worldWidth: RIVER_WIDTH,
        backdrop: { src: "assets/backgrounds/act2/nangka.jpg" },
        ground: { floor: "damo" }, // Block 114
        dangerous: true,
        startX: 500,
        scripts: [
          { requiresFlag: "a2_naitayoAngPanakot", doneFlag: "a2_saBalara", run: theStrawArmy },
          { doneFlag: "a2_planoNgPanakot", x: 500, facing: 1, run: thePlanOfStraw },
        ],
        decorations: [
          { id: "bonifacio-ng", x: 330, animation: BONIFACIO, speakers: ["Bonifacio"] },
        ],
        npcs: [
          {
            id: "katipunero", x: 700, label: "Katipunero", animation: P.katipunero.idle, facesPlayer: true,
            dialogueSets: [
              oneLine("Katipunero", "Tatlong bigkis sa pampang, Pangulo. Itayo mo na.", { skipIfFlag: "a2_naitayoAngPanakot" }),
              oneLine("Katipunero", "Mga sundalong hindi kumakain. Gusto ko ang ganyan.", { requiresFlag: "a2_naitayoAngPanakot" }),
            ],
          },
          {
            id: "isko", x: 160, label: "Isko", animation: ISKO, facesPlayer: true,
            dialogueSets: [oneLine("Isko", "Hindi ko pa rin matanggap, Pangulo. Ang Kasama...")],
          },
          ...DAYAMI_X.map((x, i) => ({
            id: "dayami-" + (i + 1), x, label: "Dayami", animation: DAYAMI, displayHeight: 70,
            hiddenByFlag: PANAKOT_FLAGS[i],
            interactLabel: "Itayo",
            interactIcon: "i-hand",
            dialogueSets: [],
            onInteract: raiseScarecrow(i),
          })),
          ...DAYAMI_X.map((x, i) => ({
            id: "panakot-" + (i + 1), x, label: "Panakot", animation: PANAKOT,
            startsHidden: true, revealedByFlag: PANAKOT_FLAGS[i],
            dialogueSets: [oneLine("Macario (sa isip)", "Mukha talaga siyang Katipunero. Mas matapang pa nga.")],
          })),
        ],
      },
      {
        // Beat 11. Balara, at night. The messenger on arrival; Bonifacio
        // by the fire. Its painting is owed.
        id: "balara",
        worldWidth: ROOM,
        backdrop: { src: "assets/backgrounds/act2/balara.jpg" },
        night: { music: NIGHT },
        noRanged: true,
        startX: 400,
        scripts: [
          { requiresFlag: "a2_kinausapAngSupremo", doneFlag: "a2_saLaguna", run: theSplit },
          { requiresFlag: "a2_saBalara", doneFlag: "a2_balitaNgCavite", x: 400, facing: 1,
            run: newsFromCavite },
        ],
        decorations: [
          { id: "tagapagbalita", x: ROOM + 80, hidden: true, animation: TAGAPAGBALITA, faceMovement: true },
        ],
        npcs: [
          {
            id: "bonifacio", x: 600, label: "Bonifacio", animation: BONIFACIO,
            // PLACEHOLDER, every line.
            dialogueSets: [
              {
                skipIfFlag: "a2_kinausapAngSupremo",
                lines: [
                  { speaker: "Bonifacio", text: "Hindi ka pa natutulog, Sakay?" },
                  { speaker: "Macario", text: "Hindi po ako makatulog, Supremo." },
                  { speaker: "Bonifacio", text: "Saan ka natutong lumaban?" },
                  { speaker: "Macario", text: "Sa entablado po. Kahoy na espada." },
                  { speaker: "Bonifacio", text: "Ako rin, alam mo ba? Umarte rin ako sa mga komedya noon." },
                  { speaker: "Bonifacio", text: "Ang pinagkaiba lang, dito, hindi na bumabangon ang namamatay." },
                  { speaker: "Macario", text: "..." },
                  { speaker: "Bonifacio", text: "May naiwan ka ba sa Tondo, Sakay?" },
                  { speaker: "Macario", text: "Ang nanay ko po. Hindi ko alam kung buhay pa siya." },
                  { speaker: "Bonifacio", text: "..." },
                  { speaker: "Bonifacio", text: "Lahat tayo may iniwan. Ang tanong lang, may babalikan pa ba tayo." },
                  { speaker: "Bonifacio", text: "Pupunta ako sa Cavite. Kailangang magkaisa ang Katipunan." },
                  { speaker: "Bonifacio", text: "Matulog ka na." },
                ],
                onComplete() {
                  state.flags.a2_kinausapAngSupremo = true;
                  markDirty();
                  setTimeout(() => runSceneScript(), 0);
                },
              },
              oneLine("Bonifacio", "Matulog ka na, Sakay."),
            ],
          },
          {
            id: "katipunero", x: 860, label: "Katipunero", animation: P.katipunero.idle, facesPlayer: true,
            dialogueSets: [oneLine("Katipunero", "Kung tutulong lang sana ang Cavite...")],
          },
          {
            id: "isko", x: 1020, label: "Isko", animation: ISKO, facesPlayer: true,
            dialogueSets: [oneLine("Isko", "Hindi po ako makatulog. Naririnig ko pa rin ang mga riple.")],
          },
        ],
      },
      {
        // Beats 12 and 13. Laguna, 1897: Jacinto's camp. Its painting is
        // owed. The second talk with Jacinto ends the act.
        id: "laguna",
        worldWidth: ROOM,
        backdrop: { src: "assets/backgrounds/act2/laguna.jpg" },
        ground: { floor: "damo" }, // Block 114
        noRanged: true,
        startX: 450,
        scripts: [
          { requiresFlag: "a2_nagpasya", doneFlag: "a2_wakas", run: theEnd },
          { requiresFlag: "a2_saLaguna", doneFlag: "a2_kayJacinto", x: 450, facing: 1, run: withJacinto },
        ],
        decorations: [],
        npcs: [
          {
            id: "katipunero", x: 380, label: "Katipunero", animation: P.katipunero.idle, facesPlayer: true,
            dialogueSets: [oneLine("Katipunero", "Hindi pa rin ako makapaniwala. Ang Supremo... sa kamay ng kapwa natin.")],
          },
          {
            id: "jacinto", x: LAGUNA_JACINTO_X, label: "Jacinto", animation: JACINTO,
            // PLACEHOLDER, every line.
            dialogueSets: [
              {
                requiresFlag: "a2_kayJacinto",
                skipIfFlag: "a2_nagpasya",
                lines: [
                  { speaker: "Jacinto", text: "Kakaunti na lang tayo, Macario. Hindi kita pipigilan kung aalis ka." },
                  { speaker: "Macario", text: "Hindi po ako aalis." },
                  { speaker: "Macario", text: "Sa Katipunan ako nanumpa, sa harap ng Mabalasig. Hindi sa kanila." },
                  { speaker: "Jacinto", text: "Kung gayon, dito tayo. Hanggang dulo." },
                ],
                onComplete() {
                  state.flags.a2_nagpasya = true;
                  markDirty();
                  setTimeout(() => runSceneScript(), 0);
                },
              },
              oneLine("Jacinto", "Hanggang dulo, Macario."),
            ],
          },
          {
            id: "isko", x: 1020, label: "Isko", animation: ISKO, facesPlayer: true,
            dialogueSets: [oneLine("Isko", "Nagtanong-tanong po ako sa mga galing Tondo. Wala pa ring nakakita kay Nanay ninyo.")],
          },
        ],
      },
    ],
  };
})();
