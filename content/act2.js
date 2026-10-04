// =============================================================
// MACARIO — content/act2.js
//
// ACT II, 1896 to 1898 (Block 113), from the proponent's plot and the
// beats asked for: Macario at home with Nanay, called Pangulo at the
// door; the Katipunan's press and its paper; the press raided and the
// Katipunan discovered; the cedulas torn; San Juan del Monte; the Nangka
// River and the scarecrows; Balara; Bonifacio's death; Laguna with
// Jacinto; and the years after told on black. STORY.md, "Act II, beat by
// beat", is every line. Every line here is ours, marked PLACEHOLDER
// below each block of them, until the proponents accept or replace it.
//
//   bahay        Marso 1896. Nanay, the knock, "Pangulo", her warning
//                and his promise (theMorning).
//   tondo        the street, Act I's paintings. Isko waits outside and
//                sends him to the press. In August Isko brings the news,
//                the neighbours will not talk to him, and a guard walks
//                in front of the press.
//   imprenta     the Katipunan's press. In March Jacinto and Kalayaan,
//                and a round of the work game at the press. In August
//                the guardia civil searching it: the list of members to
//                take from under the press, and the window out.
//   pugad-lawin  23 August. Bonifacio's words, and the cedula torn by
//                the student's own hand (Bonifacio's gift button).
//   san-juan     30 August. The charge on the powder store, fifteen
//                soldiers in four waves, then the rifles from Manila and
//                the run back to the river past their patrols.
//   nangka       November. Three scarecrows raised on the bank, the
//                Spanish shooting at straw, a fight, and the retreat.
//   balara       That week, at night. The news from Cavite, and a talk
//                with Bonifacio by the fire about the theatre.
//   laguna       1897. Bonifacio dead at the hands of his own side;
//                Jacinto, and Macario's choice to stay. The ending on
//                black: Biak-na-Bato, the Americans, Kawit, Paris.
//
// Wrapped in a function: the act files share one global scope, and Act
// I's own constants (NANAY, KASAMA, BESIDE...) must not be declared
// twice. The people who return are window.PEOPLE (content/people.js);
// the soldiers are the enemy catalogue's sundalo and bantay
// (content/enemies.js). Every flag starts with a2_, because the story's
// flags are kept from act to act.
//
// Art. Every picture this act names and nobody has drawn yet (ART.md,
// Owed) is the dashed placeholder box with its file name on it, and a
// room whose painting is owed is a dark wall with the name on it.
// =============================================================

(function () {
  const P = window.PEOPLE;

  // ---- Art ------------------------------------------------------------
  // Owed (ART.md): a def with only src, frames 1 and fps 1 is the
  // placeholder box until the picture is drawn and measured.
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
  // Act I's street, its paintings in the same order, so the town is the
  // same town and everyone stands where they stood. Joins at every
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
  const ISKO_X = 2250;
  const KUTSERO_X = 3300;
  const MANGINGISDA_X = 4800;
  const BARBERO_X = 5300;
  const MANANAHI_X = 6400;
  const TABAKERA_X = 6900;
  const PRESS_DOOR_X = 7900;    // the press, behind an ordinary door
  const KARPINTERO_X = 10600;
  const MARYAM_X = 13250;       // outside the entablado
  const DIREKTOR_X = 13600;

  // August. One guardia civil walks in front of the press, short of its
  // door, with a crate in his beat to hide behind; a catch sends Macario
  // back to the tabakera's corner (the checkpoint), not home.
  const STREET_GUARD = { beat: [7330, 7700], hide: 7520 };
  const STREET_CHECKPOINT = 7000;

  // ---- Rooms ---------------------------------------------------------
  const ROOM = 1180;            // one screen wide, as the entablado
  const BAHAY_NANAY_X = 320;
  const BAHAY_START_X = 640;

  // The press: wider than a screen, so there is a room to cross. The
  // door on the right, the press (and under it the list) on the left,
  // the back window at the left edge. Two guards in August.
  const PRESS_WIDTH = 1800;
  const PRESS_ENTER_X = 1650;
  const PRESS_X = 210;
  const WINDOW_X = 10;
  const JACINTO_PRESS_X = 700;
  const PRINTER_X = 440;
  const HIDING_PRINTER_X = 1500;
  const PRESS_GUARDS = [
    { beat: [1050, 1400], hide: 1220, facing: -1 },
    { beat: [450, 800], hide: 620, facing: 1 },
  ];

  const BATTLE_WIDTH = 3000;    // San Juan del Monte
  const RIVER_WIDTH = 2400;     // the Nangka
  const RETREAT_START = 2400;
  // San Juan, after the charge: the rifles from Manila in three lines
  // between Macario and the river, each with cover in his beat. They
  // shoot (the catalogue's bantay): seen, he is chased and fired on until
  // he punches them down or runs out of hearts (back to RETREAT_START).
  const RETREAT_GUARDS = [
    { beat: [1600, 1950], hide: 1780 },
    { beat: [1000, 1350], hide: 1180 },
    { beat: [400, 750], hide: 580 },
  ];
  const DAYAMI_X = [1000, 1400, 1800];

  const BESIDE = 120;
  const MEETS = 190;
  const HINT_HIGH = 155; // GROUND_LEVEL + 95, as Act I's: a jump to reach

  const CALM = null; // setMusic(null): the scene's own track
  const FIGHT = "assets/audio/music/intense.mp3";
  const NIGHT = "assets/audio/music/gabi.wav";

  // ---- Flags -------------------------------------------------------------
  const PANAKOT_FLAGS = DAYAMI_X.map((_, i) => "a2_panakot" + (i + 1));
  const MARCH = { skipIfFlag: "a2_agosto" };

  function thinkAloud(text) {
    return playDialogue([{ speaker: "Macario (sa isip)", text }]);
  }

  // ---- The battles ---------------------------------------------------
  // At the proponent's word, a lot of fighting: each battle is waves of
  // soldiers that come from both sides of the screen, a wave at a time
  // (spawnEnemies resolves when every one is down), with a line between
  // waves. The catalogue's sundalo charge with the bayonet; a bantay
  // among them is a rifle, already hostile, that fires. Running out of
  // hearts restarts the wave in hand, the fallen staying down.
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
  // Beat 1. Marso 1896, inside the house. Plays by itself the first time
  // a student enters Act II. PLACEHOLDER, every line.
  // =============================================================
  async function theMorning() {
    setCutscene(true);
    turnPlayer(-1);
    await playIntertitle(["Tondo, Marso 1896"], { startBlack: true });
    await wait(400);
    await playDialogue([
      { speaker: "Nanay", text: "Kumain ka muna bago umalis, anak." },
      { speaker: "Macario", text: "Busog pa po ako, 'Nay." },
      { speaker: "Nanay", text: "Busog? E kagabi ka pa hindi kumakain." },
    ]);
    playSfx("door");
    await wait(600);
    await playDialogue([
      { speaker: "Isko", text: "Pangulo! Pangulo, nandiyan po ba kayo?" },
      { speaker: "Nanay", text: "..." },
      { speaker: "Nanay", text: "Pangulo." },
      { speaker: "Nanay", text: "'Yan din ang tawag nila sa'yo noong gabing 'yon, sa pinto." },
      { speaker: "Macario", text: "'Nay..." },
      { speaker: "Nanay", text: "Hindi ako bingi, Macario. Hindi rin bulag ang mga kapitbahay." },
      { speaker: "Nanay", text: "May hinuli na naman daw sa Trozo. Mga rebelde raw. Hindi na nakauwi sa pamilya nila." },
      { speaker: "Nanay", text: "Huwag kang makisama sa mga 'yan, anak." },
      { speaker: "Nanay", text: "Ganyan din ang tatay mo. Lumabas isang gabi, sabi babalik bago mag-umaga." },
      { speaker: "Nanay", text: "Hindi ko na siya nakita." },
      { speaker: "Nanay", text: "Hindi kita kayang mawala, Macario. Ikaw na lang ang natitira sa akin." },
      { speaker: "Macario", text: "Hindi po ako mawawala, 'Nay." },
      { speaker: "Macario", text: "Babalik po ako. Pangako." },
      { speaker: "Nanay", text: "..." },
      { speaker: "Nanay", text: "Mag-ingat ka. Pakiusap." },
    ]);
    setCutscene(false);
  }

  // =============================================================
  // Beat 3. The press in March: Jacinto and Kalayaan. On arrival.
  // PLACEHOLDER, every line.
  // =============================================================
  async function jacintoAtThePress() {
    setCutscene(true);
    await wait(400);
    await movePlayer(JACINTO_PRESS_X + BESIDE, 170);
    turnPlayer(-1);
    await playDialogue([
      { speaker: "Jacinto", text: "Macario. Dumating ka rin." },
      { speaker: "Jacinto", text: "Heto. Ang unang pahayagan ng Katipunan." },
      { speaker: "Macario", text: "\"Kalayaan\"..." },
      { speaker: "Macario", text: "\"Inilimbag sa Yokohama\"? Nasa Hapon po ba tayo?" },
      { speaker: "Jacinto", text: "Kung ang guardia ang tatanungin, oo." },
      { speaker: "Jacinto", text: "Hahanapin nila ang imprenta sa kabilang dagat, hindi sa ilalim ng ilong nila." },
      { speaker: "Manlilimbag", text: "Handa na ang tinta, Ginoo." },
      { speaker: "Jacinto", text: "Ikaw sa palimbagan, Macario. Diinan mo nang pantay, at huwag kang magmamadali." },
    ]);
    setCutscene(false);
  }

  // The press, used with E. In March, a round of the work game; in
  // August, the list of members taken from under it.
  async function usePress() {
    const f = state.flags;
    if (f.a2_agosto) {
      if (!f.a2_nakitaAngRonda) return;
      if (f.a2_nakuhaAngListahan) {
        thinkAloud("Nasa akin na ang listahan. Sa bintana sa likod ako dadaan.");
        return;
      }
      await thinkAloud("Nandito... ang listahan ng mga kasapi.");
      state.flags.a2_nakuhaAngListahan = true;
      markDirty();
      playSfx("page");
      showToast("Nakuha mo ang listahan. Tumakas sa bintana sa likod!", 3200);
      return;
    }
    if (!f.a2_saImprenta) {
      thinkAloud("Kausapin ko muna si Ginoong Jacinto.");
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

  // After the first round: Jacinto, and the months pass on black. Into
  // August on the street, at Nanay's door. PLACEHOLDER, every line.
  async function kalayaanPrinted() {
    setCutscene(true);
    await wait(300);
    await playDialogue([
      { speaker: "Jacinto", text: "Sapat na para ngayong gabi." },
      { speaker: "Jacinto", text: "Ipababasa ito ng Supremo sa bawat balangay. Pati sa mga probinsya." },
      { speaker: "Macario (sa isip)", text: "Dati, polyeto lang ang dala ko. Ngayon, isang buong pahayagan." },
    ]);
    await playIntertitle(["Kumalat ang Kalayaan sa Maynila at sa mga karatig-bayan.",
      "Libu-libo ang sumapi sa Katipunan."], { keepBlack: true });
    await playIntertitle(["Agosto 1896"], {
      startBlack: true, keepBlack: true,
      whileBlack: () => {
        state.flags.a2_agosto = true;
        markDirty();
      },
    });
    if (window.Acts) Acts.gotoScene("tondo", { x: HOME_X + 150, facing: 1 });
  }

  // =============================================================
  // Beat 4. August, outside the house: Isko brings the news. Isko runs
  // up from the right and goes in to Nanay. PLACEHOLDER, every line.
  // =============================================================
  async function iskoBringsNews() {
    setCutscene(true);
    turnPlayer(1);
    const here = playerX();
    placeDecoration("isko-takbo", Math.max(here + MEETS, viewEdges().right + 80));
    showDecoration("isko-takbo", true);
    await moveDecoration("isko-takbo", here + MEETS, 260);
    await playDialogue([
      { speaker: "Isko", text: "Pangulo! May problema po sa imprenta." },
      { speaker: "Macario", text: "Hinaan mo ang boses mo. Ano'ng nangyari?" },
      { speaker: "Isko", text: "Ayaw pong ibigay ng mga manlilimbag 'yung mga papel na ipinalimbag natin." },
      { speaker: "Isko", text: "Kanina pa raw po sarado ang pinto. Walang sumasagot." },
      { speaker: "Macario", text: "Hindi ganyan ang mga tao roon." },
      { speaker: "Macario", text: "Pupuntahan ko." },
      { speaker: "Isko", text: "Sasama po ako—" },
      { speaker: "Macario", text: "Hindi. Bantayan mo si Nanay." },
      { speaker: "Isko", text: "...Opo, Pangulo." },
    ]);
    await moveDecoration("isko-takbo", HOME_X + 20, 220);
    playSfx("door");
    showDecoration("isko-takbo", false);
    setCutscene(false);
  }

  // =============================================================
  // Beat 6. August, the press: the guardia civil got there first. A
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
      { speaker: "Manlilimbag", text: "May kapatid na nagtapat sa kura ng Tondo. Alam na nila ang lahat." },
      { speaker: "Manlilimbag", text: "Kinuha na nila ang mga papel. Pero ang listahan ng mga kasapi... nasa ilalim pa ng palimbagan." },
      { speaker: "Macario", text: "Kapag nakita nila 'yon..." },
      { speaker: "Manlilimbag", text: "Daan-daang pangalan, Pangulo. Pati ang sa inyo." },
      { speaker: "Macario", text: "Kukunin ko. Lumabas ka na habang abala sila." },
    ]);
    setCutscene(false);
  }

  // Beat 6, the way out: the back window, once the list is his. A card,
  // the discovery and the arrests, and the hills north of the city.
  // PLACEHOLDER, every line.
  async function outTheWindow() {
    const f = state.flags;
    if (!f.a2_agosto) {
      thinkAloud("Bintana sa likod. Daan palabas, kung sakaling magkagulo.");
      return;
    }
    if (!f.a2_nakuhaAngListahan) {
      thinkAloud("Hindi ako aalis nang wala ang listahan.");
      return;
    }
    setCutscene(true);
    f.a2_nakatakas = true;
    markDirty();
    await playIntertitle(["Natuklasan ang Katipunan.",
      "Sa loob ng ilang araw, daan-daan ang hinuli sa Tondo."], { keepBlack: true });
    await playIntertitle(["Agosto 23, 1896", "Pugad Lawin, Kalookan"],
      { startBlack: true, keepBlack: true });
    if (window.Acts) Acts.gotoScene("pugad-lawin", { x: 330, facing: 1 });
  }

  // =============================================================
  // Beat 7. Pugad Lawin. Isko, then Bonifacio. The cedula is the
  // student's to tear: Bonifacio's gift button. PLACEHOLDER, every line.
  // =============================================================
  async function theCry() {
    setCutscene(true);
    await wait(400);
    turnPlayer(-1);
    await playDialogue([
      { speaker: "Isko", text: "Pangulo! Nakalabas kayo!" },
      { speaker: "Macario", text: "Si Nanay?" },
      { speaker: "Isko", text: "Ligtas po. Dinala ko sa kapatid niya sa Pandacan, bago pa dumating ang mga guardia." },
      { speaker: "Macario", text: "...Salamat, Isko." },
    ]);
    turnPlayer(1);
    await wait(300);
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
  // soldiers in four waves (the proponent asked for a lot of them), then
  // the rifles from Manila, and the order to fall back to the river.
  // PLACEHOLDER, every line.
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
    // The others charge ahead, off the screen; the waves come at him.
    await Promise.all([
      moveDecoration("bonifacio-sj", BATTLE_WIDTH + 200, 420),
      moveDecoration("kasama-sj", BATTLE_WIDTH + 260, 420),
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
    await playDialogue([
      { speaker: "Kasama", text: "Pangulo! Dumating ang mga sundalo mula sa Maynila!" },
      { speaker: "Bonifacio", text: "Masyado silang marami! Umatras! Sa ilog!" },
      { speaker: "Kasama", text: "Ah—!" },
      { speaker: "Macario", text: "Kasama!" },
      { speaker: "Kasama", text: "Daplis lang 'to... Tumakbo ka na!" },
    ]);
    await playIntertitle(["Umatras ang mga Katipunero."], {
      whileBlack: () => {
        state.flags.a2_lumusob = true;
        markDirty();
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
      "Nagkawatak-watak ang mga nakaligtas."], { keepBlack: true });
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
  // makes of the last of them. PLACEHOLDER, every line.
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
      { speaker: "Jacinto", text: "Hindi pa tapos, Macario." },
      { speaker: "Macario", text: "Hindi pa po." },
    ]);
    await playIntertitle(["Wakas ng Ikalawang Yugto"]);
    state.flags.a2_wakas = true;
    markDirty();
    setCutscene(false);
  }

  const LAGUNA_JACINTO_X = 800;

  // ---- The Talaan ----------------------------------------------------
  // Three papers of facts of the game's own, on the street (fixed, as
  // Act I's); a teacher's paper replaces its own slot. PLACEHOLDER.
  const HINT_SPOTS = [2600, { x: 4500, y: HINT_HIGH }, { x: 6100, y: HINT_HIGH }];

  // ---- Story points (?dev=1, Block 108) ---------------------------------
  // Each the flags set by then, built on the one before. Each guest wears
  // the stage clothes, which Act I handed over and he still wears.
  const DEV_MORNING = { a2_nangako: true };
  const DEV_AT_PRESS = Object.assign({}, DEV_MORNING, { a2_sinundoNiIsko: true });
  const DEV_PRINTING = Object.assign({}, DEV_AT_PRESS, { a2_saImprenta: true });
  const DEV_AUGUST = Object.assign({}, DEV_PRINTING, { a2_nakalimbag: true, a2_agosto: true });
  const DEV_RAID = Object.assign({}, DEV_AUGUST, { a2_nagulatSiIsko: true, a2_nakitaAngRonda: true });
  const DEV_CRY = Object.assign({}, DEV_RAID, { a2_nakuhaAngListahan: true, a2_nakatakas: true });
  const DEV_CHARGE = Object.assign({}, DEV_CRY, { a2_nagtalumpati: true, a2_pinunit: true, a2_papuntangSanJuan: true });
  const DEV_RETREAT = Object.assign({}, DEV_CHARGE, { a2_lumusob: true });
  const DEV_STRAW = Object.assign({}, DEV_RETREAT, { a2_nakaatras: true });
  const DEV_BALARA = Object.assign({}, DEV_STRAW, { a2_planoNgPanakot: true, a2_naitayoAngPanakot: true,
    a2_saBalara: true }, Object.fromEntries(PANAKOT_FLAGS.map((k) => [k, true])));
  const DEV_LAGUNA = Object.assign({}, DEV_BALARA, { a2_balitaNgCavite: true, a2_kinausapAngSupremo: true,
    a2_saLaguna: true });
  const CLOTHES = ["damit-entablado"];
  const DEV_JUMPS = [
    { id: "umaga", items: CLOTHES, label: "Ang simula: si Nanay (Marso 1896)", scene: "bahay",
      flags: {}, task: "Kausapin si Nanay" },
    { id: "imprenta", items: CLOTHES, label: "Papunta sa imprenta (Marso 1896)", scene: "tondo",
      x: HOME_X + 150, facing: 1, flags: DEV_AT_PRESS, task: "Pumunta sa imprenta" },
    { id: "limbag", items: CLOTHES, label: "Ang Kalayaan sa palimbagan", scene: "imprenta",
      x: PRESS_X + BESIDE, facing: -1, flags: DEV_PRINTING, task: "Maglimbag ng Kalayaan" },
    { id: "agosto", items: CLOTHES, label: "Agosto 1896: ang balita ni Isko", scene: "tondo",
      x: HOME_X + 150, facing: 1, flags: DEV_AUGUST, task: "Alamin ang nangyari sa imprenta" },
    { id: "ronda", items: CLOTHES, label: "Ang ronda sa imprenta", scene: "imprenta",
      x: PRESS_ENTER_X, facing: -1, flags: DEV_RAID, task: "Kunin ang listahan ng mga kasapi" },
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

  // ---- People who talk the same way in more than one place --------------
  const oneLine = (speaker, text, extra) => Object.assign({ lines: [{ speaker, text }] }, extra || {});

  window.ACT_2 = {
    number: 2,
    title: "The Long Shadow of War",
    titleTagalog: "Ang Mahabang Anino ng Digmaan",
    devJumps: DEV_JUMPS,

    // One chain, in story order, the quest log (Block 48).
    //
    //   1  the morning at home (theMorning).
    //   2  the press reached in March (jacintoAtThePress).
    //   3  the first round at the press (usePress).
    //   4  August: the press reached again (theRaid).
    //   5  the list taken from under the press.
    //   6  out of the back window (outTheWindow).
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
      { id: "kausapin_nanay", label: "Kausapin si Nanay", flag: "a2_nangako" },
      { id: "pumunta_imprenta", label: "Pumunta sa imprenta", flag: "a2_saImprenta" },
      { id: "maglimbag", label: "Maglimbag ng Kalayaan", flag: "a2_nakalimbag" },
      { id: "alamin_imprenta", label: "Alamin ang nangyari sa imprenta", flag: "a2_nakitaAngRonda" },
      { id: "kunin_listahan", label: "Kunin ang listahan ng mga kasapi", flag: "a2_nakuhaAngListahan" },
      { id: "tumakas", label: "Tumakas sa likod ng imprenta", flag: "a2_nakatakas" },
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
        "On the street between Nanay's house and the Kutsero. Every student walks past it on the way to the press.",
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
        // Beat 1. Home, one room. The first scene, so a student entering
        // Act II starts here. Its painting is owed (a dark wall until it
        // is drawn). The door, on the right, opens once the morning is
        // over.
        id: "bahay",
        worldWidth: ROOM,
        backdrop: { src: "assets/backgrounds/act2/bahay.jpg" },
        noRanged: true,
        startX: BAHAY_START_X,
        wayOut: "Lumabas ng bahay: pumunta sa kanan",
        exits: [
          { id: "labas", x: ROOM - 70, width: 70, label: "Lumabas", requiresFlag: "a2_nangako",
            toScene: "tondo", toX: HOME_X + 60, toFacing: 1 },
        ],
        scripts: [
          { unlessFlag: "a2_nangako", doneFlag: "a2_nangako", x: BAHAY_START_X, facing: -1,
            run: theMorning },
        ],
        npcs: [
          {
            id: "nanay", x: BAHAY_NANAY_X, label: "Nanay", animation: P.nanay, facesPlayer: true,
            // PLACEHOLDER.
            dialogueSets: [
              oneLine("Nanay", "Mag-ingat ka, anak. Pakiusap.", { skipIfFlag: "a2_agosto" }),
              oneLine("Nanay", "Anak, ang daming guardia sa kalye. Huwag ka nang lumabas.",
                { requiresFlag: "a2_agosto" }),
            ],
          },
        ],
        decorations: [],
      },
      {
        // The street. March: Isko outside, everyone as they were. August
        // (a2_agosto): Isko's news, the neighbours afraid, and a guard in
        // front of the press. No gun among the neighbours (noRanged).
        id: "tondo",
        worldWidth: STREET_WIDTH,
        panels: STREET_PANELS,
        panelSky: STREET_SKY,
        startX: HOME_X + 150,
        hintSpots: HINT_SPOTS,
        noRanged: true,
        guards: [
          { type: "bantay", id: "guardia-imprenta", shoots: false,
            x: STREET_GUARD.beat[0], patrolFrom: STREET_GUARD.beat[0], patrolTo: STREET_GUARD.beat[1],
            facing: 1, requiresFlag: "a2_agosto", unlessFlag: "a2_nakatakas" },
        ],
        hideSpots: [
          { x: STREET_GUARD.hide, width: 110, requiresFlag: "a2_agosto", unlessFlag: "a2_nakatakas" },
        ],
        checkpoints: [{ x: STREET_CHECKPOINT, flag: "a2_agosto" }],
        exits: [
          { id: "bahay", x: HOME_X - 40, width: 80, label: "Pumasok sa bahay",
            toScene: "bahay", toX: ROOM - 160, toFacing: -1 },
          { id: "imprenta", x: PRESS_DOOR_X, width: 80, label: "Pumasok sa imprenta",
            toScene: "imprenta", toX: PRESS_ENTER_X, toFacing: -1 },
        ],
        // Beat 2. Isko at the door, the first time out. PLACEHOLDER.
        arrivalDialogues: [
          {
            requiresFlag: "a2_nangako", unlessFlag: "a2_agosto", doneFlag: "a2_sinundoNiIsko",
            x: HOME_X + 60, facing: 1,
            lines: [
              { speaker: "Isko", text: "Pinasusundo po kayo ni Ginoong Jacinto. Sa imprenta raw po." },
              { speaker: "Macario", text: "Huwag mo akong tatawaging Pangulo sa harap ng bahay namin." },
              { speaker: "Isko", text: "Ay... opo. Pasensya na po, Pang— Macario." },
              { speaker: "Isko", text: "Hanggang ngayon po, hindi ko alam kung bakit walang apoy." },
              { speaker: "Macario", text: "Mabuti nang hindi mo alam." },
              { speaker: "Isko", text: "Nasa gitna po ng kalye ang imprenta, lampas sa tabakera." },
            ],
          },
        ],
        scripts: [
          // Beat 4. August, at the door.
          { requiresFlag: "a2_agosto", doneFlag: "a2_nagulatSiIsko", x: HOME_X + 150, facing: 1,
            run: iskoBringsNews },
        ],
        decorations: [
          { id: "isko-takbo", x: HOME_X + 400, hidden: true, animation: ISKO, faceMovement: true },
        ],
        npcs: [
          {
            id: "isko", x: ISKO_X, label: "Isko", animation: ISKO,
            hiddenByFlag: "a2_agosto",
            // PLACEHOLDER.
            dialogueSets: [
              oneLine("Isko", "Sa imprenta po, Pang— Macario. Lampas sa tabakera, sa gitna ng kalye."),
            ],
          },
          // The neighbours. One line each, March and August (Block 113,
          // the proponent's warnings: in August nobody will be seen with
          // him). PLACEHOLDER, every line.
          {
            id: "kutsero", x: KUTSERO_X, label: "Kutsero", animation: P.kutsero,
            dialogueSets: [
              oneLine("Kutsero", "Macario! Bihira ka nang dumaan dito. Kumusta ang nanay mo?", MARCH),
              oneLine("Kutsero", "Hindi kita kilala, iho. Umalis ka na.", { requiresFlag: "a2_agosto" }),
            ],
          },
          {
            id: "mangingisda", x: MANGINGISDA_X, label: "Mangingisda", animation: P.mangingisda,
            dialogueSets: [
              oneLine("Mangingisda", "May bago raw na pahayagan? Pabasa naman ako kapag may kopya ka.", MARCH),
              oneLine("Mangingisda", "Sinunog ko na 'yung ibinigay mo noon. Pasensya na.", { requiresFlag: "a2_agosto" }),
            ],
          },
          {
            id: "barbero", x: BARBERO_X, label: "Barbero", animation: P.barbero,
            dialogueSets: [
              oneLine("Barbero", "Mahaba na ang buhok mo, iho. Dumaan ka minsan, libre na.", MARCH),
              oneLine("Barbero", "Sarado kami. May nagtanong tungkol sa'yo kaninang umaga. Hindi ko sinabi kung saan ka nakatira.",
                { requiresFlag: "a2_agosto" }),
            ],
          },
          {
            id: "mananahi", x: MANANAHI_X, label: "Mananahi", animation: P.mananahi,
            speakers: ["Mananahi (pabulong)"],
            dialogueSets: [
              oneLine("Mananahi", "Aba, suot mo pa rin ang tinahi ko? Kasya pa rin, ha.", MARCH),
              oneLine("Mananahi (pabulong)", "May kura raw sa Tondo na may alam na. Umalis ka muna, iho, habang kaya mo pa.",
                { requiresFlag: "a2_agosto" }),
            ],
          },
          {
            id: "tabakera", x: TABAKERA_X, label: "Tabakera", animation: P.tabakera,
            dialogueSets: [
              oneLine("Tabakera", "Ikaw 'yung bata ng polyeto, 'di ba? Tahimik lang ako.", MARCH),
              oneLine("Tabakera", "Tatlo na ang hinuli sa pagawaan kahapon. Huwag kang lalapit sa akin.",
                { requiresFlag: "a2_agosto" }),
            ],
          },
          {
            id: "karpintero", x: KARPINTERO_X, label: "Karpintero", animation: P.karpintero,
            dialogueSets: [
              oneLine("Karpintero", "May ginagawa akong mga kahon para sa isang imprenta. Hindi ko tinanong kung ano'ng ilalagay.", MARCH),
              oneLine("Karpintero", "Wala akong kilalang Macario. Wala.", { requiresFlag: "a2_agosto" }),
            ],
          },
          {
            id: "maryam", x: MARYAM_X, label: "Maryam", animation: P.maryam,
            dialogueSets: [
              oneLine("Maryam", "Macario! Hindi ka na sumisipot sa ensayo. Galit na ang direktor.", MARCH),
              {
                requiresFlag: "a2_agosto",
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
            dialogueSets: [
              oneLine("Direktor", "Iho, may palabas tayo sa Sabado. Sana dumating ka.", MARCH),
              oneLine("Direktor", "Sarado ang entablado hanggang sa susunod na abiso. Mag-ingat ka, iho.",
                { requiresFlag: "a2_agosto" }),
            ],
          },
        ],
      },
      {
        // Beats 3, 5 and 6. The Katipunan's press. Its painting is owed.
        // March: Jacinto and the printer, the press used with E. August:
        // two guardia civil searching it (they catch, not shoot), the
        // list under the press, the window out at the left edge.
        id: "imprenta",
        worldWidth: PRESS_WIDTH,
        backdrop: { src: "assets/backgrounds/act2/imprenta.jpg" },
        noRanged: true,
        startX: PRESS_ENTER_X,
        exits: [
          { id: "labas", x: PRESS_WIDTH - 70, width: 70, label: "Lumabas",
            toScene: "tondo", toX: PRESS_DOOR_X - 60, toFacing: -1 },
        ],
        guards: PRESS_GUARDS.map((g, i) => ({
          type: "bantay", id: "guardia-loob-" + (i + 1), shoots: false,
          x: g.facing < 0 ? g.beat[1] : g.beat[0], patrolFrom: g.beat[0], patrolTo: g.beat[1],
          facing: g.facing, requiresFlag: "a2_agosto", unlessFlag: "a2_nakatakas",
        })),
        hideSpots: PRESS_GUARDS.map((g) => ({ x: g.hide, width: 110,
          requiresFlag: "a2_agosto", unlessFlag: "a2_nakatakas" })),
        scripts: [
          // Listed first: after the round, the months pass.
          { requiresFlag: "a2_nakalimbag", unlessFlag: "a2_agosto", doneFlag: "a2_agosto",
            run: kalayaanPrinted },
          { unlessFlag: "a2_agosto", doneFlag: "a2_saImprenta", x: PRESS_ENTER_X - 200, facing: -1,
            run: jacintoAtThePress },
          { requiresFlag: "a2_agosto", doneFlag: "a2_nakitaAngRonda", x: PRESS_ENTER_X, facing: -1,
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
            hiddenByFlag: "a2_agosto",
            // PLACEHOLDER.
            dialogueSets: [
              oneLine("Jacinto", "Pantay na diin, Macario. Ang malabong letra, hindi mababasa ng bayan."),
            ],
          },
          {
            id: "manlilimbag", x: PRINTER_X, label: "Manlilimbag", animation: MANLILIMBAG,
            hiddenByFlag: "a2_agosto",
            dialogueSets: [
              oneLine("Manlilimbag", "Yokohama, ha. Ni hindi ko alam kung saan 'yon."),
            ],
          },
          {
            // August: the printer who hid when the guards came.
            id: "manlilimbag-nakatago", x: HIDING_PRINTER_X, label: "Manlilimbag", animation: MANLILIMBAG,
            startsHidden: true, revealedByFlag: "a2_agosto",
            speakers: ["Manlilimbag (pabulong)"],
            dialogueSets: [
              oneLine("Manlilimbag (pabulong)", "Bilisan n'yo po, Pangulo. Sa ilalim ng palimbagan."),
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
            dialogueSets: [oneLine("Isko", "Nasa Pandacan po si Nanay ninyo. Walang nakakaalam.")],
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
                { speaker: "Macario (sa isip)", text: "Ang papel na nagsasabing alipin kami sa sarili naming bayan." },
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
        // (theCharge), then the rifles in the field between Macario and
        // the river, and the river at the left edge. Its painting is
        // owed. A reload in the retreat starts at RETREAT_START.
        id: "san-juan",
        worldWidth: BATTLE_WIDTH,
        backdrop: { src: "assets/backgrounds/act2/san-juan.jpg" },
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
        checkpoints: [{ x: RETREAT_START, flag: "a2_lumusob" }],
        pickups: [
          { id: "puso-sj-1", x: 1400, type: "heart" },
          { id: "puso-sj-2", x: 2100, type: "heart" },
          { id: "puso-sj-3", x: 2700, type: "heart" },
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
            id: "kasama", x: 160, label: "Kasama", animation: P.kasama.idle, facesPlayer: true,
            dialogueSets: [oneLine("Kasama", "Huwag mo akong alalahanin, Pangulo. Gasgas lang 'to.")],
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
            id: "kasama", x: 200, label: "Kasama", animation: P.kasama.idle, facesPlayer: true,
            dialogueSets: [oneLine("Kasama", "Malayo sa puso ang tama, Pangulo. Mabubuhay pa ako.")],
          },
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
        noRanged: true,
        startX: 450,
        scripts: [
          { requiresFlag: "a2_nagpasya", doneFlag: "a2_wakas", run: theEnd },
          { requiresFlag: "a2_saLaguna", doneFlag: "a2_kayJacinto", x: 450, facing: 1, run: withJacinto },
        ],
        decorations: [],
        npcs: [
          {
            id: "kasama", x: 180, label: "Kasama", animation: P.kasama.idle, facesPlayer: true,
            dialogueSets: [oneLine("Kasama", "Magaling na ang sugat ko, Pangulo. Hindi pa tapos ang laban natin.")],
          },
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
            dialogueSets: [oneLine("Isko", "Pangulo, may sulat po. Ligtas pa rin daw si Nanay ninyo sa Pandacan.")],
          },
        ],
      },
    ],
  };
})();
