// =============================================================
// MACARIO — content/act4.js
//
// ACT IV, 1903 to 1907 (Block 119), from the proponent's labelled
// sources, which are the source of truth: what is [CONTEXT] happened in
// the world without Macario, and he only hears of it (news, a guard, a
// black card); [MACARIO] is his, from the sources; [INSERT] is ours.
// STORY.md, "Act IV, beat by beat", is every line, each beat tagged.
// Every line here is ours, accepted by the proponents on 9 Oct 2026.
// The Americans speak short,
// plain English, given in Tagalog right after (Block 117's rule).
//
// The spine: who gets the last word. The law calls him a bandit; he
// answers with orders, a manifesto and a republic, and at the end with
// his last statement, which is the last line anyone speaks in the game.
// A tragedy: the Republic at its height, the people who feed it starved,
// the choice to come down for an Assembly, the reception that is a play
// staged for him, the court, the cell, the morning. The hair he swore
// not to cut is never cut; the Assembly opens thirty-three days after he
// dies.
//
//   morong       March 1903: the first presidential order. A post to
//                raid for guns and uniforms ("Makikita mo rin").
//   himpilan     1903, at night: past the Constabulary's guards to the
//                storeroom, then the bell, and fifteen fought on the way
//                out to the fence (Block 120).
//   morong       April 1904: the manifesto, printed on half a press.
//   dimasalang   Late 1904: the costume for Tanay, his last performance
//                [INSERT]; whether he went is left as the record leaves
//                it. 1905: the reconcentration heard of [CONTEXT], one sack
//                of rice for three. 1906: Gómez, sent by Ide [CONTEXT],
//                and the terms [MACARIO].
//   malabon      24 January 1905: San Francisco de Malabon, fifteen in
//                four waves, a push into the plaza (Block 120).
//   tondo        14 July 1906: down into Manila, the crowd [INSERT],
//                Isko and his son, Maryam, the Kutsero's carriage where
//                the crowd thins out.
//   sala         17 July 1906, Cavite: Van Schaick's reception; seized at
//                the toast.
//   selda        Bilibid, 1906 and 1907: Montalan; the Supreme Court and
//                the election heard through the bars [CONTEXT]; the last
//                night.
//   hukuman      September 1906: the plea, changed, and the sentence.
//   patyo        13 September 1907: he walks to the scaffold himself, and
//                speaks. The Assembly opens, on black [CONTEXT].
//
// Wrapped in a function, as Acts II and III are: the act files share one
// global scope. The people who return are window.PEOPLE (content/
// people.js); the fighters are the enemy catalogue's konstable,
// bantay-konstable, amerikano and sentinela (content/enemies.js), owed:
// placeholders until drawn. No picture is made or borrowed for anyone not
// drawn (Block 118). Every flag starts with a4_.
// =============================================================

(function () {
  const P = window.PEOPLE;

  // ---- Art ------------------------------------------------------------
  const owed = (folder, name) => ({ src: `assets/sprites/${folder}/${name}.png`, frames: 1, fps: 1 });
  const CARREON = owed("characters", "carreon");           // Act III's, owed
  const MONTALAN = owed("characters", "montalan");         // Act III's, owed
  const MANLILIMBAG = owed("characters", "manlilimbag");   // Act II's, owed
  const TAGAPAGBALITA = owed("characters", "tagapagbalita"); // Act II's, owed
  const PALIMBAGAN = owed("scenery", "palimbagan");        // Act II's, owed
  const KAWAL = owed("characters", "kawal-katagalugan");
  const GOMEZ = owed("characters", "gomez");
  const TAGA_CAVITE = owed("characters", "taga-cavite");
  const ANAK_NI_ISKO = owed("characters", "anak-ni-isko");
  const VAN_SCHAICK = owed("characters", "van-schaick");
  const VILLAFUERTE = owed("characters", "villafuerte");
  const DE_VEGA = owed("characters", "de-vega");
  const HUKOM = owed("characters", "hukom");
  const BANTAY_BILIBID = owed("characters", "bantay-bilibid");
  const AMERIKANO = owed("enemies", "amerikano");          // Act III's, owed
  // Block 120. The crowd in Manila, seen and not only heard: two
  // townspeople, owed, placeholders until drawn.
  const TAONG_BAYAN = [owed("characters", "taong-bayan-1"), owed("characters", "taong-bayan-2")];

  // ---- The street ---------------------------------------------------
  // Act I's street, by day in July 1906. Joins at every multiple of 1450;
  // anyone a student must reach is 90 or more clear.
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
  const ARRIVE_X = 12500;       // into Manila from the east
  const MARYAM_X = 13250;
  const ISKO_X = 11000;
  const CROWD_X = [9300, 8000, 7600];
  // Block 120. The townspeople, most of them near where he comes in.
  const TOWNSPEOPLE_X = [12150, 12330, 11900, 11380, 10700, 9950];
  const MANANAHI_X = 6400;
  // Block 120: where the crowd thins out, with the carriage, rather than
  // where he stood in Act I, a long empty walk further on.
  const KUTSERO_X = 5950;
  const KABAYO_X = 6230;

  // ---- Rooms and fields ----------------------------------------------
  const ROOM = 1180;            // one screen wide, as the entablado
  const FIELD = 3200;           // the camps, and the battle at Malabon
  const POST_WIDTH = 2600;      // the Constabulary's post, as Act II's press
  const POST_ENTER_X = 2450;
  const STOREROOM_X = 150;
  const YARD_WIDTH = 2400;      // Bilibid's yard
  const SCAFFOLD_X = 1900;

  // The post at night: three of the Constabulary, each with a crate in
  // his beat. They catch, not shoot; a catch puts Macario back at the
  // last point he passed (reach).
  const POST_GUARDS = [
    { beat: [1850, 2200], hide: 2020 },
    { beat: [1150, 1500], hide: 1320 },
    { beat: [450, 800], hide: 620 },
  ];
  const POST_CHECKPOINTS = [1650, 950];
  // Block 120. After the alarm, the fight out, toward the fence where he
  // came in: a wave at the storeroom, then one at each of these, and the
  // fence. Each is where a lost wave starts him again.
  const FIGHT_OUT_X = [900, 1600, 2250];
  const FENCE_X = POST_ENTER_X;
  const LABAS_FLAGS = FIGHT_OUT_X.map((_, i) => "a4_labas" + (i + 1));
  // Malabon: the push from the edge of town into the plaza.
  const PLAZA_X = [1200, 2000, 2700];
  const PLAZA_FLAGS = PLAZA_X.map((_, i) => "a4_plaza" + (i + 1));

  const MONTALAN_X = 900;
  const KAWAL_X = [1300, 1500, 1700];
  const HANAY_X = 1150;         // the line of three, drilled (Block 120)
  const GOMEZ_X = 2100;

  const MEETS = 190;
  const HINT_HIGH = 155; // GROUND_LEVEL + 95, as Act I's: a jump to reach

  const CALM = null; // setMusic(null): the scene's own track
  const FIGHT = "assets/audio/music/intense.mp3";
  const NIGHT = "assets/audio/music/gabi.wav";

  // ---- Flags -------------------------------------------------------------
  const BIGAS_FLAGS = ["a4_bigas1", "a4_bigas2", "a4_bigas3"];

  function thinkAloud(text) {
    return playDialogue([{ speaker: "Macario (sa isip)", text }]);
  }

  // A run's checkpoints: each one sets its own flag when he passes it,
  // only on that run (requiresFlag).
  const reached = (xs, prefix, on) => xs.map((x, i) =>
    ({ x, flag: prefix + (i + 1), reach: true, requiresFlag: on }));

  // Counts a set of flags and sets done when all are; for a step counted
  // (n/3) whose third tick plays the scene's next script.
  function tick(flags, flag, done, text) {
    const f = state.flags;
    f[flag] = true;
    markDirty();
    const n = flags.filter((k) => f[k]).length;
    showToast(text + " (" + n + "/" + flags.length + ")", 2000);
    if (n === flags.length && !f[done]) {
      f[done] = true;
      markDirty();
      setTimeout(() => runSceneScript(), 400);
    }
  }

  // Someone a script walks on stays as a person to talk to: the walker
  // (a decoration) is put away and the NPC shown where he stopped.
  function arrived(decoration, flag) {
    state.flags[flag] = true;
    markDirty();
    showDecoration(decoration, false);
    refreshNpcVisibility();
  }

  // ---- The battles ---------------------------------------------------
  // As Acts II and III (the proponent: a lot of fighting): waves from
  // both sides of the screen, a line between waves. Running out of hearts
  // restarts the wave in hand, the fallen staying down.
  //
  // Block 120: a battle may move. A wave with at waits for him to get
  // there first (advanceTo, the opts.go line at the top of the log), and
  // opts.end is where the fight is over; opts.follow are the decorations
  // who fight beside him and walk up behind him as he goes. A wave with
  // rouse brings the guards on duty in as its first fighters.
  async function battle(tag, waves, opts) {
    const o = opts || {};
    const advance = async (x) => {
      await advanceTo(x, o.go, 1); // always onward, to the right (Block 121)
      (o.follow || []).forEach((id, i) => {
        moveDecoration(id, Math.max(40, playerX() - MEETS - i * 90), 300);
      });
    };
    setMusic(FIGHT);
    for (let w = 0; w < waves.length; w++) {
      const wave = waves[w];
      if (wave.at != null) await advance(wave.at);
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
      if (wave.rouse) rouseGuards();
      await spawnEnemies(defs);
      if (wave.after) {
        setCutscene(true);
        await wait(300);
        await playDialogue(wave.after);
        setCutscene(false);
      }
    }
    if (o.end != null) await advance(o.end);
    setMusic(CALM);
  }

  // A moving fight's checkpoints are cleared when it starts, so a reload
  // that fights it again from the top starts it where it starts.
  function clearRun(flags) {
    flags.forEach((k) => { state.flags[k] = false; });
    markDirty();
  }

  // =============================================================
  // Beat 1. Morong, March 1903: Presidential Order No. 1 [MACARIO]; the
  // words are ours.
  // =============================================================
  async function theOrder() {
    setCutscene(true);
    await playIntertitle(["Marso 18, 1903", "Kabundukan ng Morong"], { startBlack: true });
    await wait(300);
    await playDialogue([
      { speaker: "Carreón", text: "Pangulo, handa na ang unang kautusan. Lagda n'yo na lang ang kulang." },
      { speaker: "Macario (sa isip)", text: "\"Kautusan ng Pangulo, Bilang 1.\"" },
      { speaker: "Macario (sa isip)", text: "Noon, ako ang tumatanggap ng utos. Ngayon, pangalan ko na ang nasa ibaba." },
    ]);
    setCutscene(false);
  }

  // The order, signed with E at the table.
  async function signTheOrder() {
    const f = state.flags;
    if (!f.a4_simula || f.a4_kautusan) return;
    playSfx("page");
    await thinkAloud("Macario Sakay, Pangulo ng Republika ng Katagalugan.");
    f.a4_kautusan = true;
    markDirty();
    setTimeout(() => runSceneScript(), 0);
  }

  // [MACARIO, reported] Military Circular No. 1 and the army organized;
  // a post to raid for guns and uniforms. "Makikita mo rin" is paid at
  // Tanay.
  async function toThePost() {
    setCutscene(true);
    await wait(300);
    await playDialogue([
      { speaker: "Montalan", text: "Kalahati ng mga tauhan, walang baril, Pangulo." },
      { speaker: "Macario", text: "Kung gayon, kukuha tayo." },
      { speaker: "Montalan", text: "May himpilan ng Konstabularya sa bayan sa ibaba. Puno ng riple, at ng uniporme." },
      { speaker: "Macario", text: "Uniporme?" },
      { speaker: "Montalan", text: "Para saan ang uniporme, Pangulo?" },
      { speaker: "Macario", text: "Makikita mo rin." },
    ]);
    await playIntertitle(["Mayo 5, 1903. Inilabas ni Sakay ang Sirkular Militar Bilang 1.",
      "Inayos niya ang kanyang hukbo."], { keepBlack: true });
    await playIntertitle(["Isang himpilan ng Konstabularya, sa gabi."], { startBlack: true, keepBlack: true });
    if (window.Acts) Acts.gotoScene("himpilan", { x: POST_ENTER_X, facing: -1 });
  }

  // =============================================================
  // Beat 2. The raid for guns and uniforms [MACARIO, reported]; how it
  // goes is ours.
  // =============================================================
  async function takeTheGuns() {
    const f = state.flags;
    if (!f.a4_kautusan || f.a4_kinuha) return;
    setCutscene(true);
    playSfx("give");
    await playDialogue([
      { speaker: "Macario (sa isip)", text: "Mga riple. At mga uniporme ng Konstabularya." },
      { speaker: "Macario (sa isip)", text: "Isang kasuotan pa para sa baul." },
    ]);
    f.a4_kinuha = true;
    markDirty();
    setCutscene(false);
    setTimeout(() => runSceneScript(), 0);
  }

  // Block 120. The bell is heard, not put on a card: it rings, Montalan
  // comes out of the storeroom behind him, and the three on watch turn on
  // him where they stand (rouseGuards), the first of the fight out.
  async function theAlarm() {
    setCutscene(true);
    clearRun(LABAS_FLAGS);
    state.flags.a4_labas0 = true;
    markDirty();
    playSfx("kampana");
    await wait(1100);
    turnPlayer(-1);
    placeDecoration("montalan-h", STOREROOM_X);
    showDecoration("montalan-h", true);
    await moveDecoration("montalan-h", Math.max(40, playerX() - MEETS), 300);
    await playDialogue([
      { speaker: "Montalan", text: "Pangulo! Gising na ang buong himpilan!" },
      { speaker: "Macario", text: "Dalhin ang mga riple. Lalaban tayo palabas!" },
    ]);
    playSfx("kampana");
    turnPlayer(1);
    setCutscene(false);
    await battle("hp", [
      { rouse: true, types: ["konstable", "konstable"],
        after: [{ speaker: "Montalan", text: "Marami pa sa loob!" }] },
      { at: FIGHT_OUT_X[0], types: ["konstable", "konstable", "bantay-konstable", "konstable"],
        after: [{ speaker: "Macario (sa isip)", text: "Kapwa Pilipino na naman ang kaharap ko." }] },
      { at: FIGHT_OUT_X[1], types: ["konstable", "bantay-konstable", "konstable"],
        after: [{ speaker: "Montalan", text: "Malapit na ang bakod!" }] },
      { at: FIGHT_OUT_X[2], types: ["konstable", "konstable", "bantay-konstable"] },
    ], { go: "Lumaban palabas: pumunta sa kanan, sa bakod", end: FENCE_X, follow: ["montalan-h"] });
    setCutscene(true);
    await wait(400);
    await playDialogue([
      { speaker: "Montalan", text: "Nakalabas tayo! Dala ang lahat!" },
      { speaker: "Macario", text: "Bukas, babasahin ng Maynila na ninakawan sila ng mga bandido." },
    ]);
    state.flags.a4_himpilan = true;
    markDirty();
    await playIntertitle(["Abril 5, 1904", "Kabundukan ng Morong"], { keepBlack: true });
    if (window.Acts) Acts.gotoScene("morong", { x: 400, facing: 1 });
  }

  // =============================================================
  // Beat 3. The manifesto of 5 April 1904 [MACARIO]; the Manlilimbag and
  // his half a press are ours.
  // =============================================================
  async function thePress() {
    setCutscene(true);
    await wait(400);
    placeDecoration("manlilimbag-lakad", -120);
    showDecoration("manlilimbag-lakad", true);
    await moveDecoration("manlilimbag-lakad", playerX() - MEETS, 260);
    turnPlayer(-1);
    await playDialogue([
      { speaker: "Manlilimbag", text: "Pangulo! Dinala ko ang lumang palimbagan. Kalahati lang ang naisalba ko." },
      { speaker: "Macario", text: "Sapat na ang kalahati." },
      { speaker: "Carreón", text: "Ano ang ilalagay natin, Pangulo?" },
      { speaker: "Macario", text: "Na may buong karapatan ang bawat Pilipino na ipaglaban ang kanyang kalayaan." },
      { speaker: "Macario", text: "Tinawag nila kaming bandido sa batas nila. Sasagutin namin sa papel namin." },
    ]);
    arrived("manlilimbag-lakad", "a4_saManipesto");
    setCutscene(false);
  }

  // The press, used with E: the work game, once.
  async function printTheManifesto() {
    const f = state.flags;
    if (!f.a4_saManipesto) return;
    if (f.a4_manipesto) {
      thinkAloud("Nailimbag na. Nasa mga bayan na ito.");
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
    if (good < 0 || f.a4_manipesto) return;
    f.a4_manipesto = true;
    markDirty();
    setTimeout(() => runSceneScript(), 0);
  }

  async function toDiMasalang() {
    setCutscene(true);
    await wait(300);
    await playDialogue([
      { speaker: "Macario (sa isip)", text: "\"...may buong karapatan ang mga Pilipino na ipaglaban ang kanilang kalayaan.\"" },
      { speaker: "Manlilimbag", text: "Gaya ng Kalayaan noon, Pangulo. Sa sariling papel." },
    ]);
    await playIntertitle(["Agosto 1904. Inilipat ni Sakay ang kanyang himpilan sa kabundukan ng Di-Masalang."],
      { keepBlack: true });
    if (window.Acts) Acts.gotoScene("dimasalang", { x: 400, facing: 1 });
  }

  // =============================================================
  // Beat 4. Late 1904: Tanay taken in stolen Constabulary uniforms
  // [MACARIO, reported]. That he plans the disguise, his last performance,
  // is [INSERT]; whether he was there the record does not say, and the
  // game does not either.
  // =============================================================
  async function theLastPerformance() {
    setCutscene(true);
    await wait(400);
    await movePlayer(MONTALAN_X - 200, 170);
    await playDialogue([
      { speaker: "Montalan", text: "Tanay. May himpilan ng Konstabularya roon, at maraming baril." },
      { speaker: "Montalan", text: "Pero makikita nila tayong paakyat bago pa tayo makalapit." },
      { speaker: "Macario", text: "Kaya hindi tayo papasok bilang mga kawal ng Republika." },
      { speaker: "Macario", text: "Papasok tayo bilang Konstabularya." },
      { speaker: "Montalan", text: "...Ang mga uniporme. Ito pala ang ibig mong sabihin." },
      { speaker: "Montalan", text: "Isang dula?" },
      { speaker: "Macario", text: "Ang huli kong dula, siguro." },
    ]);
    setCutscene(false);
  }

  // Block 120. The three drilled together, once, rather than taught one
  // by one (the seventh "three of something" in the game): the line of
  // three, used with E, is the work game's drill, a row of figures
  // saluting, and then what each of them asks, as one scene.
  async function drillTheFighters() {
    const f = state.flags;
    if (!f.a4_saDimasalang) return;
    if (f.a4_ensayo) {
      thinkAloud("Handa na sila. Wala na akong maituturo pa.");
      return;
    }
    const good = await playWorkGame({
      title: "Ensayo",
      hint: "Pindutin kapag nasa berde ang guhit: sabay-sabay ang saludo.",
      verb: "Saludo",
      icon: "i-hand",
      scene: "drill",
      hitText: "Sabay-sabay!",
      missText: "Magulo ang hanay!",
      doneText: (n) => n + "/5 ang malinis na saludo.",
    });
    if (good < 0 || f.a4_ensayo) return;
    setCutscene(true);
    await playDialogue([
      { speaker: "Kawal", text: "Ganito po ba sumaludo ang Konstable?" },
      { speaker: "Macario", text: "Masyadong mabagal." },
      { speaker: "Macario", text: "Sumasaludo ang Konstable na parang may utang sa kanya ang buong mundo." },
      { speaker: "Kawal", text: "...Ganito?" },
      { speaker: "Macario", text: "'Yan." },
      { speaker: "Kawal", text: "Pangulo, ang buhok namin. Walang Konstable na ganito kahaba ang buhok." },
      { speaker: "Macario", text: "Itali, at itago sa ilalim ng sumbrero." },
      { speaker: "Kawal", text: "Hindi po namin gugupitin?" },
      { speaker: "Macario", text: "Hindi. Sumumpa tayo." },
      { speaker: "Batang Kawal", text: "Paano po kung kausapin ako ng bantay?" },
      { speaker: "Macario", text: "Huwag kang magpaliwanag. Ang nagpapaliwanag, may itinatago." },
      { speaker: "Macario (sa isip)", text: "Kay Maryam ko natutunan 'yan." },
    ]);
    f.a4_ensayo = true;
    markDirty();
    refreshNpcVisibility();
    setCutscene(false);
    setTimeout(() => runSceneScript(), 0);
  }

  async function toTanay() {
    setCutscene(true);
    await wait(300);
    await playDialogue([
      { speaker: "Montalan", text: "Handa na sila, Pangulo." },
      { speaker: "Macario", text: "Sa Tanay, walang palakpakan. Kung tama ang pagganap, walang makakapansin." },
    ]);
    state.flags.a4_tanay = true;
    markDirty();
    await playIntertitle(["Huling bahagi ng 1904",
      "Pumasok sa bayan ng Tanay ang mga tauhan ni Sakay, suot ang mga ninakaw na uniporme ng Konstabularya."],
      { keepBlack: true });
    await playIntertitle(["Nakuha nila ang bayan.", "Hindi sinasabi ng mga tala kung kasama si Sakay."],
      { startBlack: true, keepBlack: true });
    await playIntertitle(["Enero 24, 1905", "San Francisco de Malabon, Cavite"], { startBlack: true, keepBlack: true });
    if (window.Acts) Acts.gotoScene("malabon", { x: 400, facing: 1 });
  }

  // =============================================================
  // Beat 5. San Francisco de Malabon, 24 January 1905 [MACARIO,
  // reported]; the battle shown is ours.
  // =============================================================
  // Block 120: a push into the plaza, a wave at the edge of town and one
  // at each stretch of road after it, the officers coming up behind.
  async function malabon() {
    setCutscene(true);
    clearRun(PLAZA_FLAGS);
    await wait(300);
    // Block 123 (approved 6 Oct 2026): the disguise, as the Constabulary's
    // own report of 1905 tells this raid: at dusk, in the uniforms of the
    // Constabulary and the Scouts, the barracks rushed before a challenge.
    await playDialogue([
      { speaker: "Montalan", text: "Takipsilim na, Pangulo. Suot pa rin natin ang mga uniporme ng Konstabularya." },
      { speaker: "Macario", text: "Hanggang hindi tayo nakakalapit sa kuwartel, Konstabularya tayo sa mata nila." },
      { speaker: "Montalan", text: "Ang garison, Pangulo. Nasa plaza ang mga baril nila." },
      { speaker: "Macario", text: "Pasok!" },
    ]);
    setCutscene(false);
    await battle("sf", [
      { types: ["konstable", "konstable", "konstable", "konstable"],
        after: [{ speaker: "Villafuerte", text: "Pangulo! Sa kaliwa!" }] },
      { at: PLAZA_X[0], types: ["konstable", "konstable", "konstable", "konstable"],
        after: [{ speaker: "De Vega", text: "Ako na rito!" }] },
      { at: PLAZA_X[1], types: ["konstable", "amerikano", "sentinela", "amerikano"],
        after: [
          { speaker: "Montalan", text: "Dumating ang mga Amerikano!" },
          { speaker: "Macario (sa isip)", text: "Isang bayan pa. Isang bayan pa na hindi nila hawak." },
        ] },
      { at: PLAZA_X[2], types: ["amerikano", "sentinela", "amerikano"] },
    ], { go: "Sumulong sa plaza: pumunta sa kanan", follow: ["montalan-m", "villafuerte-m", "de-vega-m"] });
    setCutscene(true);
    await wait(400);
    await playDialogue([
      { speaker: "De Vega", text: "Kanila na naman ang plaza bukas, Pangulo." },
      { speaker: "Macario", text: "Pero ngayong gabi, atin." },
    ]);
    state.flags.a4_malabon = true;
    markDirty();
    await playIntertitle(["Kinabukasan, nabasa sa Maynila: sinalakay ng mga bandido ang San Francisco de Malabon."],
      { keepBlack: true });
    await playIntertitle(["1905", "Kabundukan ng Di-Masalang"], { startBlack: true, keepBlack: true });
    if (window.Acts) Acts.gotoScene("dimasalang", { x: 400, facing: 1 });
  }

  // =============================================================
  // Beat 6. 1905: the reconcentration [CONTEXT], heard of from a woman of
  // Cavite [INSERT]; he is never in the camps.
  // =============================================================
  async function hunger() {
    setCutscene(true);
    await wait(400);
    placeDecoration("taga-cavite", -120);
    showDecoration("taga-cavite", true);
    await moveDecoration("taga-cavite", playerX() - MEETS, 200);
    turnPlayer(-1);
    await playDialogue([
      { speaker: "Taga-Cavite", text: "Ito na lang po ang naitakas ko, Pangulo." },
      { speaker: "Macario", text: "Nasaan ang iba? Ang mga dating nagdadala sa amin?" },
      { speaker: "Taga-Cavite", text: "Inipon kami ng mga Amerikano. Lahat ng taga-baryo, sa loob ng bakod, may bantay." },
      { speaker: "Taga-Cavite", text: "Ang hindi pumasok, kalaban daw." },
      { speaker: "Taga-Cavite", text: "Wala nang magtatanim. Wala nang magdadala sa inyo." },
      { speaker: "Macario", text: "..." },
      { speaker: "Macario (sa isip)", text: "Hindi kami ang tinamaan nila. Ang mga nagpapakain sa amin." },
      { speaker: "Macario (sa isip)", text: "Isang sako. Tatlong kawal na hindi pa kumakain." },
    ]);
    showToast("Hatiin ang bigas sa mga kawal.", 3000);
    setCutscene(false);
  }

  // =============================================================
  // Beat 7. 1906: Ide sends Dominador Gómez [CONTEXT], heard of from the
  // messenger; the meeting and the terms [MACARIO].
  // =============================================================
  async function gomezComes() {
    setCutscene(true);
    await playIntertitle(["1906"]);
    placeDecoration("tagapagbalita", viewEdges().right + 80);
    showDecoration("tagapagbalita", true);
    await moveDecoration("tagapagbalita", playerX() + MEETS, 280);
    turnPlayer(1);
    await playDialogue([
      { speaker: "Tagapagbalita", text: "Pangulo! May darating. Si Dominador Gómez, ang lider ng mga manggagawa sa Maynila." },
      { speaker: "Tagapagbalita", text: "Pinahintulutan daw siya ng Gobernador-Heneral na si Ide na makipag-usap sa inyo." },
      { speaker: "Montalan", text: "Sugo ng Amerikano." },
      { speaker: "Macario", text: "Pilipinong sugo ng Amerikano. Pakinggan natin." },
    ]);
    await moveDecoration("tagapagbalita", WORLD_WIDTH + 140, 280);
    showDecoration("tagapagbalita", false);
    placeDecoration("gomez-lakad", WORLD_WIDTH + 80);
    showDecoration("gomez-lakad", true);
    await moveDecoration("gomez-lakad", GOMEZ_X + 40, 200);
    arrived("gomez-lakad", "a4_dumatingSiGomez");
    setCutscene(false);
  }

  // [CONTEXT] nothing; the wait for the answer, Montalan's doubt, and the
  // way down.
  async function toManila() {
    setCutscene(true);
    await wait(300);
    await playDialogue([
      { speaker: "Montalan", text: "Hindi ako nagtitiwala sa kanila, Pangulo." },
      { speaker: "Macario", text: "Hindi rin ako. Pero kung ako na lang ang nakaharang, aalis ako sa daan." },
    ]);
    await playIntertitle(["Hulyo 14, 1906", "Maynila"], { keepBlack: true });
    if (window.Acts) Acts.gotoScene("tondo", { x: ARRIVE_X, facing: -1 });
  }

  // =============================================================
  // Beat 8. 14 July 1906: down from the mountains into Manila [MACARIO];
  // the crowd, Isko, Maryam and the Kutsero are [INSERT].
  // =============================================================
  async function toCavite() {
    setCutscene(true);
    await playIntertitle(["Hulyo 17, 1906", "Cavite"], { keepBlack: true });
    if (window.Acts) Acts.gotoScene("sala", { x: 150, facing: 1 });
  }

  // =============================================================
  // Beat 9. 17 July 1906, Cavite: Colonel Van Schaick's reception; seized
  // and disarmed [MACARIO]. The toast broken at its peak is ours.
  // =============================================================
  async function theReception() {
    setCutscene(true);
    await wait(400);
    await playDialogue([
      { speaker: "Van Schaick", text: "Mr. Sakay. Welcome to Cavite." },
      { speaker: "Macario (sa isip)", text: "Maligayang pagdating daw sa Cavite." },
      { speaker: "Van Schaick", text: "Please. Enjoy the music. You are our guests." },
      { speaker: "Macario (sa isip)", text: "Mga panauhin daw kami." },
      { speaker: "Montalan (pabulong)", text: "Masyadong mabait, Pangulo." },
      { speaker: "Macario (pabulong)", text: "Ngumiti ka. Dula ito para sa kanila." },
    ]);
    showToast("Itaas ang baso sa mesa.", 3000);
    setCutscene(false);
  }

  async function seized() {
    setCutscene(true);
    await movePlayer(560, 170);
    turnPlayer(1);
    await playDialogue([
      { speaker: "Van Schaick", text: "A toast. To peace." },
      { speaker: "Macario (sa isip)", text: "Sa kapayapaan daw." },
      { speaker: "Macario", text: "Sa kapayapaan... at sa Asamblea." },
      { speaker: "Macario", text: "At sa araw na—" },
      { speaker: "Van Schaick", text: "Now!" },
    ]);
    placeDecoration("sundalo-1", -100);
    placeDecoration("sundalo-2", ROOM + 60);
    showDecoration("sundalo-1", true);
    showDecoration("sundalo-2", true);
    moveDecoration("sundalo-1", 340, 300);
    await moveDecoration("sundalo-2", 760, 300);
    await playDialogue([
      { speaker: "Sundalong Amerikano", text: "Hands up! Drop your weapons!" },
      { speaker: "Macario (sa isip)", text: "Itaas daw ang kamay. Ibaba ang sandata." },
      { speaker: "De Vega", text: "Pangulo!" },
      { speaker: "Macario", text: "Huwag! ...Huwag." },
      { speaker: "Macario (sa isip)", text: "Ilang ulit akong nagbalatkayo para malusutan sila." },
      { speaker: "Macario (sa isip)", text: "Ngayon, sila ang gumanap." },
    ]);
    state.flags.a4_nahuli = true;
    markDirty();
    await playIntertitle(["Hulyo 17, 1906. Dinakip at dinisarmahan si Sakay at ang kanyang mga opisyal sa salu-salo."],
      { keepBlack: true });
    await playIntertitle(["Hulyo 20, 1906. Dinala siya sa Maynila at ikinulong sa Bilibid."],
      { startBlack: true, keepBlack: true });
    if (window.Acts) Acts.gotoScene("selda", { x: 300, facing: 1 });
  }

  // =============================================================
  // Beat 10. Bilibid, 1906 [MACARIO, reported].
  // =============================================================
  async function inBilibid() {
    setCutscene(true);
    await wait(400);
    await playDialogue([
      { speaker: "Macario (sa isip)", text: "Bilibid. Muli." },
      { speaker: "Macario (sa isip)", text: "Amnestiya ang ipinangako. Rehas ang ibinigay." },
    ]);
    setCutscene(false);
  }

  async function toCourt() {
    setCutscene(true);
    await wait(300);
    await playIntertitle(["Setyembre 17, 1906", "Hukuman ng Unang Dulugan, Cavite"], { keepBlack: true });
    if (window.Acts) Acts.gotoScene("hukuman", { x: 300, facing: 1 });
  }

  // =============================================================
  // Beat 11. The Court of First Instance of Cavite [MACARIO]: arraigned
  // for bandolerismo on 17 September, he pleads not guilty; on 21
  // September the plea is changed to guilty, why the record does not say;
  // before the end of 1906, death for four.
  // =============================================================
  async function theCharge() {
    setCutscene(true);
    await wait(400);
    await playDialogue([
      { speaker: "Hukom", text: "Macario Sakay." },
      { speaker: "Hukom", text: "You are charged with bandolerismo. Brigandage." },
      { speaker: "Macario (sa isip)", text: "Bandolerismo. Pagiging bandido." },
      { speaker: "Hukom", text: "How do you plead?" },
      { speaker: "Macario (sa isip)", text: "Ano raw ang sagot ko." },
    ]);
    setCutscene(false);
  }

  async function answerTheCourt() {
    const f = state.flags;
    if (!f.a4_saHukuman || f.a4_sumagot) return;
    setCutscene(true);
    await playDialogue([
      { speaker: "Macario", text: "Hindi ako nagkasala." },
      { speaker: "Hukom", text: "Not guilty. So noted." },
      { speaker: "Macario (sa isip)", text: "Hindi raw nagkasala. Itinala." },
    ]);
    f.a4_sumagot = true;
    markDirty();
    setCutscene(false);
    setTimeout(() => runSceneScript(), 0);
  }

  async function theSentence() {
    setCutscene(true);
    await wait(300);
    await playIntertitle(["Setyembre 21, 1906",
      "Binago ni Sakay at ng kanyang mga kasama ang kanilang sagot: nagkasala.",
      "Hindi sinasabi ng mga tala kung bakit."], { keepBlack: true });
    await playIntertitle(["Bago matapos ang 1906"], { startBlack: true });
    await wait(300);
    await playDialogue([
      { speaker: "Hukom", text: "The court finds the accused guilty of bandolerismo." },
      { speaker: "Macario (sa isip)", text: "Nagkasala raw kami ng bandolerismo." },
      { speaker: "Hukom", text: "Macario Sakay. Julian Montalan. León Villafuerte. Lucio de Vega." },
      { speaker: "Hukom", text: "Sentenced to death by hanging." },
      { speaker: "Macario (sa isip)", text: "Kamatayan. Bibitayin kaming apat." },
      { speaker: "Macario", text: "..." },
    ]);
    state.flags.a4_hatol = true;
    markDirty();
    await playIntertitle(["Hulyo 26, 1907", "Bilibid"], { keepBlack: true });
    if (window.Acts) Acts.gotoScene("selda", { x: 300, facing: 1 });
  }

  // =============================================================
  // Beat 12. 1907, the cell. The Supreme Court upholds the sentence on
  // 26 July [CONTEXT] and the Assembly is elected on 30 July [CONTEXT]:
  // he hears both through the bars. The guard, the hair and the last
  // night are [INSERT].
  // =============================================================
  async function theVerdict() {
    setCutscene(true);
    await wait(400);
    placeDecoration("bantay", ROOM + 60);
    showDecoration("bantay", true);
    await moveDecoration("bantay", playerX() + MEETS, 200);
    turnPlayer(1);
    await playDialogue([
      { speaker: "Bantay", text: "Sakay. Galing sa Korte Suprema." },
      { speaker: "Bantay", text: "Pinagtibay ang hatol. Bibitayin kayo." },
      { speaker: "De Vega", text: "Wala na palang tutubos." },
      { speaker: "Macario", text: "..." },
    ]);
    await moveDecoration("bantay", ROOM + 60, 200);
    showDecoration("bantay", false);
    setCutscene(false);
  }

  async function lookOut() {
    const f = state.flags;
    if (!f.a4_saSelda1907) {
      thinkAloud("Sa labas, ang Maynila. Hindi ko na abot.");
      return;
    }
    if (f.a4_dumungaw) return;
    setCutscene(true);
    await playIntertitle(["Hulyo 30, 1907"], {
      whileBlack: () => {
        placeDecoration("bantay", 900);
        showDecoration("bantay", true);
      },
    });
    await playDialogue([
      { speaker: "Bantay", text: "Bumoboto na raw sila sa labas. Ang unang halalan ng Asamblea." },
      { speaker: "Macario (sa isip)", text: "Ang Asamblea. Para rito ako bumaba." },
      { speaker: "Macario (sa isip)", text: "Bumoboto sila. At narito ako." },
      { speaker: "De Vega", text: "Sulit ba, Pangulo?" },
      { speaker: "Macario", text: "Kung may Pilipinong susulat ng batas para sa sariling bayan... oo." },
      { speaker: "Bantay", text: "Ang haba ng buhok mo, Sakay." },
      { speaker: "Macario", text: "Sumumpa ako. Hindi ko ito gugupitin hangga't hindi malaya ang bayan." },
      { speaker: "Bantay", text: "Hindi pa malaya ang bayan." },
      { speaker: "Macario", text: "Hindi pa nga." },
    ]);
    f.a4_dumungaw = true;
    markDirty();
    setCutscene(false);
    setTimeout(() => runSceneScript(), 0);
  }

  // The last night: the father who went out one night and never came
  // back, the first thing said in the game, answered.
  async function theLastNight() {
    setCutscene(true);
    await playIntertitle(["Setyembre 12, 1907", "Ang huling gabi"], {
      whileBlack: () => showDecoration("bantay", false),
    });
    await wait(300);
    await playDialogue([
      { speaker: "Macario (sa isip)", text: "'Nay..." },
      { speaker: "Macario (sa isip)", text: "Umalis si Tatay isang gabi at hindi na bumalik. Hinintay mo siya." },
      { speaker: "Macario (sa isip)", text: "Hinintay mo rin ako." },
      { speaker: "Macario (sa isip)", text: "..." },
      { speaker: "Macario (sa isip)", text: "Patawad po." },
    ]);
    await playIntertitle(["Setyembre 13, 1907"], { keepBlack: true });
    if (window.Acts) Acts.gotoScene("patyo", { x: 200, facing: 1 });
  }

  // =============================================================
  // Beat 13. 13 September 1907, about 8:30 in the morning, Old Bilibid,
  // with Lucio de Vega [MACARIO]. The student walks him there; nothing
  // walks for him. His statement: the substance is documented, the
  // wording varies by translation, and this Tagalog is ours. The Assembly
  // opens 33 days later [CONTEXT], on black.
  // =============================================================
  async function theMorning() {
    setCutscene(true);
    await wait(400);
    await playDialogue([
      { speaker: "Macario (sa isip)", text: "Alas-otso y medya ng umaga." },
      { speaker: "Bantay", text: "Oras na, Sakay." },
      { speaker: "Macario (sa isip)", text: "Ilang beses akong umakyat sa entablado." },
      { speaker: "Macario (sa isip)", text: "Ito ang huli." },
    ]);
    moveDecoration("de-vega-p", SCAFFOLD_X + 120, 70);
    setCutscene(false);
  }

  async function theStatement() {
    setCutscene(true);
    await movePlayer(SCAFFOLD_X, 90);
    turnPlayer(-1);
    await wait(500);
    await playDialogue([
      { speaker: "Macario", text: "Darating ang kamatayan sa ating lahat, maaga man o huli." },
      { speaker: "Macario", text: "Kaya haharapin ko nang mahinahon ang Panginoong Maykapal." },
      { speaker: "Macario", text: "Ngunit nais kong sabihin sa inyo: hindi kami mga bandido at magnanakaw, gaya ng paratang sa amin ng mga Amerikano." },
      { speaker: "Macario", text: "Kami ay mga kasapi ng hukbong rebolusyonaryo na nagtanggol sa ating Inang Bayan, ang Pilipinas." },
      { speaker: "Macario", text: "Paalam! Mabuhay ang Republika, at nawa'y isilang ang ating kalayaan sa hinaharap!" },
      { speaker: "Macario", text: "Paalam! Mabuhay ang Pilipinas!" },
    ]);
    await wait(600);
    await playIntertitle(["Setyembre 13, 1907. Alas-otso y medya ng umaga.",
      "Binitay si Macario Sakay sa Lumang Bilibid, Santa Cruz, Maynila, kasama si Lucio de Vega."],
    { keepBlack: true, holdMs: 4500 });
    await playIntertitle(["Hindi niya ginupit ang kanyang buhok."], { startBlack: true, keepBlack: true });
    await playIntertitle(["Oktubre 16, 1907. Binuksan ang Asamblea ng Pilipinas.",
      "Tatlumpu't tatlong araw matapos siyang mamatay."], { startBlack: true, keepBlack: true, holdMs: 4500 });
    await playIntertitle(["Hindi nalaman kailanman kung ano ang nangyari sa kanyang ina."],
      { startBlack: true, keepBlack: true });
    await playIntertitle(["Wakas ng Ikaapat na Yugto"], { startBlack: true, keepBlack: true });
    state.flags.a4_wakas = true;
    markDirty();
    setCutscene(false);
  }

  // ---- The Talaan ----------------------------------------------------
  // Three papers of facts of the game's own, on the street in July 1906
  // (fixed, as Acts I to III); a teacher's paper replaces its own slot.
  const HINT_SPOTS = [11800, { x: 9600, y: HINT_HIGH }, { x: 6900, y: HINT_HIGH }];

  // ---- Story points (?dev=1, Block 108) ---------------------------------
  // Each the flags set by then, built on the one before.
  const DEV_POST = { a4_simula: true, a4_kautusan: true, a4_papuntaHimpilan: true };
  const DEV_PRESS = Object.assign({}, DEV_POST, { a4_kinuha: true, a4_himpilan: true });
  const DEV_TANAY = Object.assign({}, DEV_PRESS, { a4_saManipesto: true, a4_manipesto: true, a4_lumipat: true });
  const DEV_MALABON = Object.assign({}, DEV_TANAY, { a4_saDimasalang: true, a4_ensayo: true, a4_tanay: true });
  const DEV_RICE = Object.assign({}, DEV_MALABON, { a4_malabon: true });
  const DEV_GOMEZ = Object.assign({}, DEV_RICE, { a4_gutom: true, a4_bigas: true, a4_dumatingSiGomez: true },
    Object.fromEntries(BIGAS_FLAGS.map((k) => [k, true])));
  const DEV_MANILA = Object.assign({}, DEV_GOMEZ, { a4_gomez: true, a4_pababa: true });
  const DEV_HALL = Object.assign({}, DEV_MANILA, { a4_bumaba: true, a4_saCavite: true });
  const DEV_CELL = Object.assign({}, DEV_HALL, { a4_saSala: true, a4_tagay: true, a4_nahuli: true });
  const DEV_COURT = Object.assign({}, DEV_CELL, { a4_saSelda: true, a4_bilibid: true, a4_papuntaHukuman: true });
  const DEV_1907 = Object.assign({}, DEV_COURT, { a4_saHukuman: true, a4_sumagot: true, a4_hatol: true });
  const DEV_YARD = Object.assign({}, DEV_1907, { a4_saSelda1907: true, a4_dumungaw: true, a4_hulingGabi: true });
  const CLOTHES = ["damit-entablado"];
  const DEV_JUMPS = [
    { id: "simula", items: CLOTHES, label: "Ang simula: ang unang kautusan (1903)", scene: "morong",
      flags: {}, task: "Lagdaan ang unang kautusan" },
    { id: "himpilan", items: CLOTHES, label: "Ang himpilan: mga riple at uniporme", scene: "himpilan",
      x: POST_ENTER_X, facing: -1, flags: DEV_POST, task: "Kunin ang mga baril at uniporme" },
    { id: "manipesto", items: CLOTHES, label: "Morong, 1904: ang manipesto", scene: "morong",
      x: 400, facing: 1, flags: DEV_PRESS, task: "Ilimbag ang manipesto" },
    { id: "tanay", items: CLOTHES, label: "Di-Masalang, 1904: ang huling dula", scene: "dimasalang",
      x: 400, facing: 1, flags: DEV_TANAY, task: "Ihanda ang mga kawal" },
    { id: "malabon", items: CLOTHES, label: "San Francisco de Malabon, 1905", scene: "malabon",
      x: 400, facing: 1, flags: DEV_MALABON, task: "Salakayin ang San Francisco de Malabon" },
    { id: "bigas", items: CLOTHES, label: "Di-Masalang, 1905: ang gutom", scene: "dimasalang",
      x: 400, facing: 1, flags: DEV_RICE, task: "Hatiin ang bigas" },
    { id: "gomez", items: CLOTHES, label: "Di-Masalang, 1906: si Gómez", scene: "dimasalang",
      x: GOMEZ_X - 200, facing: 1, flags: DEV_GOMEZ, task: "Harapin si Dominador Gómez" },
    { id: "maynila", items: CLOTHES, label: "Maynila, Hulyo 1906", scene: "tondo",
      x: ARRIVE_X, facing: -1, flags: DEV_MANILA, task: "Bumaba sa Maynila" },
    { id: "salusalo", items: CLOTHES, label: "Cavite, 1906: ang salu-salo", scene: "sala",
      x: 150, facing: 1, flags: DEV_HALL, task: "Dumalo sa salu-salo" },
    { id: "bilibid", items: CLOTHES, label: "Bilibid, 1906", scene: "selda",
      x: 300, facing: 1, flags: DEV_CELL, task: "Kausapin si Montalan" },
    { id: "hukuman", items: CLOTHES, label: "Ang hukuman, 1906", scene: "hukuman",
      x: 300, facing: 1, flags: DEV_COURT, task: "Harapin ang hukuman" },
    { id: "bintana", items: CLOTHES, label: "Bilibid, 1907", scene: "selda",
      x: 300, facing: 1, flags: DEV_1907, task: "Dumungaw sa bintana" },
    { id: "umaga", items: CLOTHES, label: "Ang huling umaga (1907)", scene: "patyo",
      x: 200, facing: 1, flags: DEV_YARD, task: "Lumakad sa huling umaga" },
  ];

  const oneLine = (speaker, text, extra) => Object.assign({ lines: [{ speaker, text }] }, extra || {});

  // The three fighters drilled for Tanay (drillTheFighters), 1905: what they say through the act, and the rice
  // shared out by talking to each (n/3).
  const fighterSets = (speaker, n, before, waiting, rice, after) => [
    oneLine(speaker, before, { skipIfFlag: "a4_ensayo" }),
    oneLine(speaker, waiting, { requiresFlag: "a4_ensayo", skipIfFlag: "a4_gutom" }),
    {
      requiresFlag: "a4_gutom",
      skipIfFlag: BIGAS_FLAGS[n],
      lines: rice,
      onComplete() {
        playSfx("give");
        tick(BIGAS_FLAGS, BIGAS_FLAGS[n], "a4_bigas", "Nabigyan ng bigas");
      },
    },
    oneLine(speaker, after, { requiresFlag: BIGAS_FLAGS[n] }),
  ];

  window.ACT_4 = {
    number: 4,
    title: "The Bitter Harvest",
    titleTagalog: "Ang Mapait na Ani",
    devJumps: DEV_JUMPS,

    // One chain, in story order, the quest log (Block 48).
    //
    //   1  the first presidential order, signed (signTheOrder).
    //   2  the post raided for guns and uniforms; the bell, and the
    //      fight out to the fence (theAlarm, Block 120).
    //   3  the manifesto printed (printTheManifesto).
    //   4  three drilled to pass as the Constabulary (drillTheFighters,
    //      Block 120); Tanay.
    //   5  San Francisco de Malabon (malabon, fifteen in four waves,
    //      pushing into the plaza, Block 120).
    //   6  the rice shared out (n/3).
    //   7  Gómez heard, and the terms.
    //   8  down into Manila: the Kutsero's carriage to Cavite.
    //   9  the reception: seized at the toast (seized).
    //  10  Bilibid: Montalan.
    //  11  the court: the plea and the sentence (theSentence).
    //  12  the window: the Assembly elected without him (lookOut).
    //  13  the last morning: the walk and the statement. The end.
    linearObjectives: true,
    objectiveCurrency: false,
    // Block 125. guide: where each step is done, for the arrow (game.js,
    // THE GUIDE). The battle at Malabon names none.
    objectives: [
      { id: "kautusan", label: "Lagdaan ang unang kautusan", flag: "a4_kautusan",
        guide: { scene: "morong", npc: "mesa" } },
      { id: "himpilan", label: "Kunin ang mga baril at uniporme", flag: "a4_himpilan",
        guide: { scene: "himpilan", npc: "bodega" } },
      { id: "manipesto", label: "Ilimbag ang manipesto", flag: "a4_manipesto",
        guide: { scene: "morong", npc: "palimbagan" } },
      { id: "tanay", label: "Ihanda ang mga kawal", flag: "a4_ensayo",
        guide: { scene: "dimasalang", npc: "hanay" } },
      { id: "malabon", label: "Salakayin ang San Francisco de Malabon", flag: "a4_malabon" },
      { id: "bigas", label: "Hatiin ang bigas", flag: "a4_bigas", countFlags: BIGAS_FLAGS,
        guide: { scene: "dimasalang", npcs: ["kawal-1", "kawal-2", "batang-kawal"], doneFlags: BIGAS_FLAGS } },
      { id: "gomez", label: "Harapin si Dominador Gómez", flag: "a4_gomez",
        guide: { scene: "dimasalang", npc: "gomez" } },
      { id: "maynila", label: "Bumaba sa Maynila", flag: "a4_bumaba",
        guide: { scene: "tondo", npc: "kutsero" } },
      { id: "salusalo", label: "Dumalo sa salu-salo", flag: "a4_nahuli",
        guide: { scene: "sala", npc: "mesa" } },
      { id: "bilibid", label: "Kausapin si Montalan", flag: "a4_bilibid",
        guide: { scene: "selda", npc: "montalan" } },
      { id: "hukuman", label: "Harapin ang hukuman", flag: "a4_hatol",
        guide: { scene: "hukuman", npc: "hukom" } },
      { id: "bintana", label: "Dumungaw sa bintana", flag: "a4_dumungaw",
        guide: { scene: "selda", npc: "bintana" } },
      { id: "umaga", label: "Lumakad sa huling umaga", flag: "a4_wakas",
        guide: { scene: "patyo", x: SCAFFOLD_X - 150 } },
    ],
    startingQuests: [],

    // Block 128. Words of the period and what has happened by now, as
    // Act I's: each earned or shown by the flag of its beat.
    // PLACEHOLDER: ours, until the proponents accept or replace them.
    glossary: {
      title: "Talaan",
      hint: "Matutuklasan mo ang mga salita habang naglalaro.",
      entries: [
        { id: "a4_konstabularya", requiresFlag: "a4_himpilan", term: "Konstabularya",
          text: "Ang Philippine Constabulary: pulisyang itinatag ng mga Amerikano, binubuo ng mga Pilipino, para tugisin ang mga lumalaban." },
        { id: "a4_manipesto", requiresFlag: "a4_manipesto", term: "Manipesto",
          text: "Pahayag na isinusulat at ipinakakalat ng isang pinuno o pangkat para ipaalam ang kanilang paninindigan." },
        { id: "a4_rekonsentrasyon", requiresFlag: "a4_bigas", term: "Rekonsentrasyon",
          text: "Sapilitang paglilipat ng mga taga-baryo sa mga kampong may bantay." },
        { id: "a4_asamblea", requiresFlag: "a4_gomez", term: "Asamblea",
          text: "Kapulungan ng mga kinatawang inihalal ng mamamayan para gumawa ng mga batas." },
        { id: "a4_bandolerismo", requiresFlag: "a4_hatol", term: "Bandolerismo",
          text: "Ang krimen ng pagiging bandido o tulisan." },
      ],
    },
    timeline: [
      { requiresFlag: "a4_kautusan", year: "Mayo 5, 1903",
        text: "Inilabas ni Sakay ang Sirkular Militar Bilang 1, at inayos ang kanyang hukbo." },
      { requiresFlag: "a4_manipesto", year: "Abril 5, 1904",
        text: "Naglabas si Sakay ng manipesto mula sa kabundukan ng Morong." },
      { requiresFlag: "a4_lumipat", year: "Agosto 1904",
        text: "Inilipat ni Sakay ang kanyang himpilan sa kabundukan ng Di-Masalang." },
      { requiresFlag: "a4_tanay", year: "Huling bahagi ng 1904",
        text: "Nakuha ng mga tauhan ni Sakay ang bayan ng Tanay, suot ang mga ninakaw na uniporme ng Konstabularya. Hindi sinasabi ng mga tala kung kasama si Sakay." },
      { requiresFlag: "a4_malabon", year: "Enero 24, 1905",
        text: "Sinalakay ng hukbo ni Sakay ang San Francisco de Malabon, Cavite." },
      { requiresFlag: "a4_bigas", year: "1905",
        text: "Inipon ng mga Amerikano ang mga taga-baryo sa mga kampong may bantay. Nagutom ang mga baryo, at ang mga nasa bundok." },
      { requiresFlag: "a4_gomez", year: "1906",
        text: "Dumating si Dominador Gómez, dala ang pangako ng Asamblea ng Pilipinas." },
      { requiresFlag: "a4_bumaba", year: "Hulyo 14, 1906",
        text: "Bumaba si Sakay sa Maynila, at sinalubong siya ng mga tao." },
      { requiresFlag: "a4_nahuli", year: "Hulyo 17, 1906",
        text: "Sa isang salu-salo sa Cavite, dinakip si Sakay at ang kanyang mga opisyal." },
      { requiresFlag: "a4_hatol", year: "1906",
        text: "Hinatulan ng kamatayan si Sakay." },
      { requiresFlag: "a4_dumungaw", year: "Hulyo 30, 1907",
        text: "Bumoto ang mga Pilipino sa unang halalan para sa Asamblea, habang nasa Bilibid si Sakay." },
    ],

    hints: {
      count: 3,
      fixed: true,
      label: "Papel",
      listLabel: "Mga Papel",
      places: [
        "On the street in Manila, July 1906, just past where Macario arrives and before Isko. Every student walks past it.",
        "On the street, past Isko and before the fisherman, at jump height: the student has to jump for it.",
        "On the street, past the seamstress's spot heading west, at jump height, before the Kutsero.",
      ],
      foundText: "Naitala ito sa Talaan. Buksan ang Talaan sa pause para basahin ulit.",
      completeText: "Nahanap mo na ang lahat ng papel!",
      pool: [
        { slot: 1, title: "Ang Manipesto ng 1904",
          text: "Noong Abril 5, 1904, naglabas si Macario Sakay ng manipesto mula sa kabundukan. Ipinahayag nito na may buong karapatan ang mga Pilipino na ipaglaban ang kanilang kalayaan." },
        { slot: 2, title: "Ang Rekonsentrasyon",
          text: "Noong 1905, inipon ng mga Amerikano ang mga taga-baryo ng Cavite at Batangas sa mga kampong may bantay. Nagutom ang mga taga-baryo, at naubos ang pagkain at tulong para sa mga lumalaban sa bundok." },
        { slot: 3, title: "Ang Asamblea ng Pilipinas",
          text: "Noong Hulyo 30, 1907, bumoto ang mga Pilipino sa unang halalan para sa Asamblea ng Pilipinas. Binuksan ito noong Oktubre 16, 1907. Ito ang asambleang ipinangako nang pumayag si Sakay na bumaba mula sa bundok noong 1906." },
      ],
    },

    scenes: [
      {
        // Beats 1 and 3. The camp in the mountains of Morong, Act III's
        // painting (owed): the first order in 1903, the manifesto in 1904.
        id: "morong",
        worldWidth: FIELD,
        backdrop: { src: "assets/backgrounds/act3/morong.jpg" },
        ground: { floor: "damo" },
        noRanged: true,
        startX: 400,
        scripts: [
          { requiresFlag: "a4_manipesto", doneFlag: "a4_lumipat", run: toDiMasalang },
          { requiresFlag: "a4_himpilan", unlessFlag: "a4_manipesto", doneFlag: "a4_saManipesto",
            x: 400, facing: 1, run: thePress },
          { requiresFlag: "a4_kautusan", unlessFlag: "a4_himpilan", doneFlag: "a4_papuntaHimpilan", run: toThePost },
          { doneFlag: "a4_simula", x: 400, facing: 1, run: theOrder },
        ],
        decorations: [
          { id: "manlilimbag-lakad", x: -120, hidden: true, animation: MANLILIMBAG, faceMovement: true },
        ],
        npcs: [
          {
            id: "carreon", x: 1100, label: "Carreón", animation: CARREON,
            dialogueSets: [
              oneLine("Carreón", "Ang lagda n'yo, Pangulo. Nasa mesa.", { skipIfFlag: "a4_kautusan" }),
              oneLine("Carreón", "Isang republika, may sarili nang kautusan.", { skipIfFlag: "a4_himpilan" }),
              oneLine("Carreón", "Papel laban sa batas nila. Gusto ko 'yan, Pangulo."),
            ],
          },
          {
            id: "montalan", x: MONTALAN_X, label: "Montalan", animation: MONTALAN,
            dialogueSets: [
              oneLine("Montalan", "Kulang tayo sa baril, Pangulo.", { skipIfFlag: "a4_himpilan" }),
              oneLine("Montalan", "May riple na tayo. At uniporme. Para saan pa rin, hindi ko alam."),
            ],
          },
          {
            // The table where the order is signed: no picture.
            id: "mesa", x: 640, label: "Mesa", scenery: true,
            hiddenByFlag: "a4_kautusan",
            interactLabel: "Lagdaan",
            interactIcon: "i-hand",
            dialogueSets: [],
            onInteract: signTheOrder,
          },
          {
            id: "manlilimbag", x: 400 - MEETS, label: "Manlilimbag", animation: MANLILIMBAG,
            startsHidden: true, revealedByFlag: "a4_saManipesto",
            dialogueSets: [oneLine("Manlilimbag", "Kalahating palimbagan, Pangulo. Pero buong salita.")],
          },
          {
            // Act II's press, half of it; used with E (printTheManifesto).
            id: "palimbagan", x: 1500, label: "Palimbagan", animation: PALIMBAGAN,
            displayHeight: 110,
            startsHidden: true, revealedByFlag: "a4_saManipesto",
            interactLabel: "Ilimbag",
            interactIcon: "i-hand",
            dialogueSets: [],
            onInteract: printTheManifesto,
          },
        ],
      },
      {
        // Beat 2. A post of the Constabulary in a town below the
        // mountains, 1903, at night [INSERT: the place]. Its painting is
        // owed. In from the right; the storeroom at the left.
        id: "himpilan",
        worldWidth: POST_WIDTH,
        backdrop: { src: "assets/backgrounds/act4/himpilan.jpg" },
        night: { music: NIGHT },
        startX: POST_ENTER_X,
        guards: POST_GUARDS.map((g, i) => ({
          type: "bantay-konstable", id: "konstable-bantay-" + (i + 1), shoots: false,
          x: g.beat[1], patrolFrom: g.beat[0], patrolTo: g.beat[1], facing: -1,
          // Block 120: on duty until the fight is over, since the alarm
          // turns these three on him (rouseGuards); a reload mid-fight
          // finds them at their posts and the alarm rouses them again.
          requiresFlag: "a4_kautusan", unlessFlag: "a4_himpilan",
        })),
        hideSpots: POST_GUARDS.map((g) => ({ x: g.hide, width: 110,
          requiresFlag: "a4_kautusan", unlessFlag: "a4_kinuha" })),
        // In route order: the run in, then the fight out (Block 120).
        checkpoints: [
          ...reached(POST_CHECKPOINTS, "a4_bakuran", "a4_kautusan"),
          { x: STOREROOM_X + 150, flag: "a4_labas0" },
          ...reached(FIGHT_OUT_X, "a4_labas", "a4_kinuha"),
        ],
        pickups: [
          { id: "puso-hp-1", x: 700, type: "heart" },
          { id: "puso-hp-2", x: 1400, type: "heart" },
          { id: "puso-hp-3", x: 2100, type: "heart" },
        ],
        scripts: [
          { requiresFlag: "a4_kinuha", doneFlag: "a4_himpilan", run: theAlarm },
        ],
        arrivalDialogues: [
          {
            requiresFlag: "a4_kautusan", doneFlag: "a4_saHimpilan", x: POST_ENTER_X, facing: -1,
            lines: [
              { speaker: "Macario (sa isip)", text: "Tatlong bantay sa bakuran." },
              { speaker: "Macario (sa isip)", text: "Nasa dulo ang bodega. Huwag akong makita." },
            ],
          },
        ],
        decorations: [
          { id: "montalan-h", x: -120, hidden: true, animation: MONTALAN, speakers: ["Montalan"] },
        ],
        npcs: [
          {
            // The storeroom: no picture, a body to reach.
            id: "bodega", x: STOREROOM_X, label: "Bodega", scenery: true,
            hiddenByFlag: "a4_kinuha",
            interactLabel: "Kunin",
            interactIcon: "i-hand",
            dialogueSets: [],
            onInteract: takeTheGuns,
          },
        ],
      },
      {
        // Beats 4, 6 and 7. The camp in the Di-Masalang mountains, from
        // August 1904. Its painting is owed.
        id: "dimasalang",
        worldWidth: FIELD,
        backdrop: { src: "assets/backgrounds/act4/dimasalang.jpg" },
        ground: { floor: "damo" },
        noRanged: true,
        startX: 400,
        scripts: [
          { requiresFlag: "a4_gomez", doneFlag: "a4_pababa", run: toManila },
          { requiresFlag: "a4_bigas", doneFlag: "a4_dumatingSiGomez", run: gomezComes },
          { requiresFlag: "a4_malabon", doneFlag: "a4_gutom", x: 400, facing: 1, run: hunger },
          { requiresFlag: "a4_ensayo", unlessFlag: "a4_malabon", doneFlag: "a4_tanay", run: toTanay },
          { requiresFlag: "a4_manipesto", doneFlag: "a4_saDimasalang", x: 400, facing: 1, run: theLastPerformance },
        ],
        decorations: [
          { id: "tagapagbalita", x: FIELD + 80, hidden: true, animation: TAGAPAGBALITA,
            faceMovement: true, speakers: ["Tagapagbalita"] },
          { id: "taga-cavite", x: -120, hidden: true, animation: TAGA_CAVITE, faceMovement: true,
            speakers: ["Taga-Cavite"] },
          { id: "gomez-lakad", x: FIELD + 80, hidden: true, animation: GOMEZ, faceMovement: true },
        ],
        npcs: [
          {
            id: "montalan", x: MONTALAN_X, label: "Montalan", animation: MONTALAN,
            dialogueSets: [
              oneLine("Montalan", "Turuan mo sila, Pangulo. Hindi sila artista.", { skipIfFlag: "a4_malabon" }),
              oneLine("Montalan", "Wala nang dumarating mula sa mga baryo, Pangulo.", { skipIfFlag: "a4_dumatingSiGomez" }),
              oneLine("Montalan", "Sugo ng Amerikano, Pangulo. Mag-ingat ka sa sasabihin niya.", { skipIfFlag: "a4_gomez" }),
              oneLine("Montalan", "Kung bababa ka, bababa kami."),
            ],
          },
          {
            // Block 120. The line of three, drilled with E: no picture,
            // a body to reach beside them.
            id: "hanay", x: HANAY_X, label: "Hanay", scenery: true,
            hiddenByFlag: "a4_ensayo",
            interactLabel: "Sanayin",
            interactIcon: "i-hand",
            dialogueSets: [],
            onInteract: drillTheFighters,
          },
          {
            id: "kawal-1", x: KAWAL_X[0], label: "Kawal", animation: KAWAL,
            dialogueSets: fighterSets("Kawal", 0,
              "Pangulo, hindi pa po ako nakasuot ng uniporme kahit kailan.",
              "Sumasaludo pa rin po ako sa salamin ng ilog.",
              [
                { speaker: "Macario", text: "Kunin mo ito." },
                { speaker: "Kawal", text: "Salamat, Pangulo." },
              ],
              "Salamat sa bigas, Pangulo."),
          },
          {
            id: "kawal-2", x: KAWAL_X[1], label: "Kawal", animation: KAWAL,
            dialogueSets: fighterSets("Kawal", 1,
              "Ang uniporme, Pangulo... masikip.",
              "Nakatago pa rin po sa sumbrero ang buhok ko.",
              [
                { speaker: "Kawal", text: "Kayo po, Pangulo? Kumain na kayo?" },
                { speaker: "Macario", text: "Mamaya na ako." },
              ],
              "Mamaya na raw kayo, Pangulo. Lagi n'yo 'yang sinasabi."),
          },
          {
            // The young fighter who offered to cut his hair at Morong
            // (Act III), as he was drawn there.
            id: "batang-kawal", x: KAWAL_X[2], label: "Batang Kawal", animation: P.katipunero.idle,
            dialogueSets: fighterSets("Batang Kawal", 2,
              "Ano po ang sasabihin ko kung tanungin nila ako?",
              "Hindi na po ako nagpapaliwanag, Pangulo.",
              [
                { speaker: "Batang Kawal", text: "Pangulo... hindi na kayo kumakain, 'di po ba?" },
                { speaker: "Macario", text: "Kumain ka. Mas kailangan ka ng bayan nang may lakas." },
              ],
              "Busog na po ako, Pangulo. Totoo."),
          },
          {
            // Dominador Gómez, from 1906: the terms [MACARIO].
            id: "gomez", x: GOMEZ_X, label: "Gómez", animation: GOMEZ,
            startsHidden: true, revealedByFlag: "a4_dumatingSiGomez",
            dialogueSets: [
              {
                requiresFlag: "a4_dumatingSiGomez",
                skipIfFlag: "a4_gomez",
                lines: [
                  { speaker: "Gómez", text: "Heneral Sakay. Malayo ang inakyat ko." },
                  { speaker: "Macario", text: "Pangulo. Hindi Heneral. May Republika kami rito." },
                  { speaker: "Gómez", text: "Pangulo, kung gayon." },
                  { speaker: "Gómez", text: "Nangako ang mga Amerikano ng isang Asamblea. Mga Pilipinong boboto, mga Pilipinong gagawa ng batas." },
                  { speaker: "Gómez", text: "Pero hindi nila ito bubuksan habang may lumalaban pa sa bundok." },
                  { speaker: "Gómez", text: "Kayo na lang ang natitira, Pangulo." },
                  { speaker: "Macario", text: "..." },
                  { speaker: "Montalan", text: "At ang kapalit? Bitayan?" },
                  { speaker: "Gómez", text: "Amnestiya. Para sa lahat ng tauhan ninyo." },
                  { speaker: "Macario (sa isip)", text: "Isang Asamblea. Mga Pilipinong susulat ng batas sa sariling bayan." },
                  { speaker: "Macario (sa isip)", text: "Noon, batas nila ang tumawag sa amin na bandido." },
                  { speaker: "Macario", text: "May mga kondisyon ako." },
                  { speaker: "Macario", text: "Amnestiya sa lahat ng tauhan ko. Karapatang magdala ng baril." },
                  { speaker: "Macario", text: "At pahintulot na makaalis ng bansa, ako at ang aking mga opisyal." },
                  { speaker: "Gómez", text: "Dadalhin ko ang mga ito sa Gobernador-Heneral." },
                  { speaker: "Macario", text: "..." },
                  { speaker: "Macario", text: "Kung para sa Asamblea... bababa ako." },
                ],
                onComplete() {
                  state.flags.a4_gomez = true;
                  markDirty();
                  setTimeout(() => runSceneScript(), 0);
                },
              },
              oneLine("Gómez", "Dadalhin ko ang mga kondisyon ninyo, Pangulo."),
            ],
          },
        ],
      },
      {
        // Beat 5. San Francisco de Malabon, Cavite, 24 January 1905. Its
        // painting is owed. Villafuerte and de Vega fight beside him.
        id: "malabon",
        worldWidth: FIELD,
        backdrop: { src: "assets/backgrounds/act4/malabon.jpg" },
        dangerous: true,
        startX: 400,
        checkpoints: reached(PLAZA_X, "a4_plaza", "a4_tanay"), // Block 120
        scripts: [
          { requiresFlag: "a4_tanay", doneFlag: "a4_malabon", x: 400, facing: 1, run: malabon },
        ],
        pickups: [
          { id: "puso-sf-1", x: 900, type: "heart" },
          { id: "puso-sf-2", x: 1700, type: "heart" },
          { id: "puso-sf-3", x: 2600, type: "heart" },
        ],
        decorations: [
          { id: "montalan-m", x: 220, animation: MONTALAN, speakers: ["Montalan"] },
          { id: "villafuerte-m", x: 120, animation: VILLAFUERTE, speakers: ["Villafuerte"] },
          { id: "de-vega-m", x: 40, animation: DE_VEGA, speakers: ["De Vega"] },
        ],
        npcs: [],
      },
      {
        // Beat 8. Act I's street, 14 July 1906: down from the mountains
        // into Manila [MACARIO]; the crowd, and those who knew him
        // [INSERT].
        id: "tondo",
        worldWidth: STREET_WIDTH,
        panels: STREET_PANELS,
        panelSky: STREET_SKY,
        startX: ARRIVE_X,
        hintSpots: HINT_SPOTS,
        noRanged: true,
        scripts: [
          { requiresFlag: "a4_bumaba", doneFlag: "a4_saCavite", run: toCavite },
        ],
        arrivalDialogues: [
          {
            requiresFlag: "a4_gomez", doneFlag: "a4_saMaynila", x: ARRIVE_X, facing: -1,
            lines: [
              { speaker: "Macario (sa isip)", text: "Apat na taon akong nasa bundok." },
              { speaker: "Mga Tao", text: "Si Sakay! Si Sakay 'yan!" },
              { speaker: "Mga Tao", text: "Ang haba ng buhok!" },
              { speaker: "Macario (sa isip)", text: "Makikilala nila ako kahit sa malayo. 'Yon ang sinabi ko." },
            ],
          },
        ],
        decorations: [
          { id: "anak-ni-isko", x: ISKO_X + 110, animation: ANAK_NI_ISKO, displayHeight: 80 },
          // Block 120. The crowd, seen: townspeople, owed. The first answers
          // to "Mga Tao".
          ...TOWNSPEOPLE_X.map((x, i) => ({
            id: "tao-" + (i + 1), x, animation: TAONG_BAYAN[i % 2], facing: i % 3 === 0 ? -1 : 1,
            speakers: i === 0 ? ["Mga Tao"] : [],
          })),
          // The Kutsero's horse, with the carriage (Act I's art).
          { id: "kabayo", x: KABAYO_X, animation: P.kabayo, displayHeight: 120 },
        ],
        npcs: [
          {
            // Isko, Francisco Reyes since 1901, with his son. He kept
            // looking for Nanay; her fate stays unknown.
            id: "isko", x: ISKO_X, label: "Isko", animation: P.isko, facesPlayer: true,
            dialogueSets: [
              {
                lines: [
                  { speaker: "Isko", text: "Pangulo!" },
                  { speaker: "Macario", text: "Isko. ...Francisco Reyes, 'di ba?" },
                  { speaker: "Isko", text: "Isko pa rin po, sa inyo." },
                  { speaker: "Isko", text: "Ito po si Andres. Pitong taon na." },
                  { speaker: "Macario", text: "Andres." },
                  { speaker: "Isko", text: "Gaya ng Supremo." },
                  { speaker: "Isko", text: "Hinanap ko po si Nanay ninyo. Sa Tondo, sa Malabon, sa mga ospital." },
                  { speaker: "Isko", text: "Wala po. Walang nakaaalam." },
                  { speaker: "Macario", text: "..." },
                  { speaker: "Macario", text: "Sinabi ko sa'yong huwag kang mangako." },
                  { speaker: "Isko", text: "Kaya nga po hindi ako tumigil." },
                ],
                skipIfFlag: "a4_nakitaSiIsko",
                onComplete() { state.flags.a4_nakitaSiIsko = true; markDirty(); },
              },
              oneLine("Isko", "Mag-ingat po kayo sa Cavite, Pangulo."),
            ],
          },
          {
            // Maryam.
            id: "maryam", x: MARYAM_X, label: "Maryam", animation: P.maryam,
            dialogueSets: [
              {
                lines: [
                  { speaker: "Maryam", text: "Macario! Ang haba ng buhok mo." },
                  { speaker: "Maryam", text: "Para kang Sultan sa dula natin." },
                  { speaker: "Macario", text: "Bumaba na ako, Maryam." },
                  { speaker: "Maryam", text: "Tapos na ba ang dula?" },
                  { speaker: "Macario", text: "Ang huling eksena, sa Cavite. May salu-salo raw." },
                  { speaker: "Maryam", text: "..." },
                  { speaker: "Maryam", text: "Mag-ingat ka sa mga eksenang hindi mo isinulat." },
                ],
                skipIfFlag: "a4_nakitaSiMaryam",
                onComplete() { state.flags.a4_nakitaSiMaryam = true; markDirty(); },
              },
              oneLine("Maryam", "Mag-ingat ka, Macario."),
            ],
          },
          {
            // The three who took the pamphlets, in the crowd.
            id: "mangingisda", x: CROWD_X[0], label: "Mangingisda", animation: P.mangingisda,
            dialogueSets: [oneLine("Mangingisda", "Pangulo! Bumaba na raw kayo!")],
          },
          {
            id: "tabakera", x: CROWD_X[1], label: "Tabakera", animation: P.tabakera,
            dialogueSets: [oneLine("Tabakera", "Kung ganyan kahaba ang buhok, ikaw nga 'yan.")],
          },
          {
            id: "karpintero", x: CROWD_X[2], label: "Karpintero", animation: P.karpintero,
            dialogueSets: [oneLine("Karpintero", "Sabi ko sa'yo, kilala na kita, Macario.")],
          },
          {
            // The Mananahi.
            id: "mananahi", x: MANANAHI_X, label: "Mananahi", animation: P.mananahi,
            dialogueSets: [
              {
                lines: [
                  { speaker: "Mananahi", text: "Iho... nakita kita." },
                  { speaker: "Mananahi", text: "Sana nakita ka rin niya." },
                ],
                skipIfFlag: "a4_nakitaAngMananahi",
                onComplete() { state.flags.a4_nakitaAngMananahi = true; markDirty(); },
              },
              oneLine("Mananahi", "Nandito lang ako, iho."),
            ],
          },
          {
            // The Kutsero, his first employer: the carriage to Cavite,
            // waiting where the crowd thins out (Block 120).
            id: "kutsero", x: KUTSERO_X, label: "Kutsero", animation: P.kutsero,
            dialogueSets: [oneLine("Kutsero", "Ang batang nagsuklay ng kabayo ko. Tingnan mo ngayon.")],
            gift: {
              buttonLabel: "Sumakay",
              requiresFlag: "a4_gomez",
              givenFlag: "a4_bumaba",
              responseLines: [
                { speaker: "Kutsero", text: "Macario? Ikaw nga." },
                { speaker: "Kutsero", text: "Sumakay ka. Wala nang bayad." },
                { speaker: "Macario", text: "Salamat po." },
              ],
              onComplete() { setTimeout(() => runSceneScript(), 0); },
            },
          },
        ],
      },
      {
        // Beat 9. The hall in Cavite, 17 July 1906, Colonel Louis Van
        // Schaick's reception. Its painting is owed.
        id: "sala",
        worldWidth: ROOM,
        backdrop: { src: "assets/backgrounds/act4/sala.jpg" },
        ground: { floor: "kahoy" },
        noRanged: true,
        startX: 150,
        scripts: [
          { requiresFlag: "a4_tagay", doneFlag: "a4_nahuli", run: seized },
          { requiresFlag: "a4_bumaba", doneFlag: "a4_saSala", x: 150, facing: 1, run: theReception },
        ],
        decorations: [
          { id: "villafuerte-s", x: 100, animation: VILLAFUERTE, speakers: ["Villafuerte"] },
          { id: "de-vega-s", x: 200, animation: DE_VEGA, speakers: ["De Vega"] },
          { id: "sundalo-1", x: -100, hidden: true, animation: AMERIKANO, faceMovement: true,
            speakers: ["Sundalong Amerikano"] },
          { id: "sundalo-2", x: ROOM + 60, hidden: true, animation: AMERIKANO, faceMovement: true },
        ],
        npcs: [
          {
            id: "van-schaick", x: 920, label: "Van Schaick", animation: VAN_SCHAICK,
            dialogueSets: [{
              lines: [
                { speaker: "Van Schaick", text: "Relax, Mr. Sakay. The war is over." },
                { speaker: "Macario (sa isip)", text: "Magpahinga raw ako. Tapos na raw ang digmaan." },
              ],
            }],
          },
          {
            id: "montalan", x: 380, label: "Montalan", animation: MONTALAN,
            speakers: ["Montalan (pabulong)"],
            dialogueSets: [oneLine("Montalan (pabulong)", "Hindi ko gusto ang dami ng sundalo sa labas, Pangulo.")],
          },
          {
            // The table: the toast (seized). No picture.
            id: "mesa", x: 640, label: "Mesa", scenery: true,
            interactLabel: "Itaas ang baso",
            interactIcon: "i-hand",
            dialogueSets: [],
            onInteract() {
              if (!state.flags.a4_saSala || state.flags.a4_tagay) return;
              state.flags.a4_tagay = true;
              markDirty();
              runSceneScript();
            },
          },
        ],
      },
      {
        // Beats 10 and 12. A cell in Bilibid, 1906 and 1907. Its painting
        // is owed; the floor is the engine's stone.
        id: "selda",
        worldWidth: ROOM,
        backdrop: { src: "assets/backgrounds/act4/selda.jpg" },
        ground: { floor: "bato" },
        noRanged: true,
        startX: 300,
        scripts: [
          { requiresFlag: "a4_dumungaw", doneFlag: "a4_hulingGabi", run: theLastNight },
          { requiresFlag: "a4_hatol", doneFlag: "a4_saSelda1907", x: 300, facing: 1, run: theVerdict },
          { requiresFlag: "a4_bilibid", unlessFlag: "a4_hatol", doneFlag: "a4_papuntaHukuman", run: toCourt },
          { requiresFlag: "a4_nahuli", doneFlag: "a4_saSelda", x: 300, facing: 1, run: inBilibid },
        ],
        decorations: [
          { id: "bantay", x: ROOM + 60, hidden: true, animation: BANTAY_BILIBID, faceMovement: true,
            speakers: ["Bantay"] },
        ],
        npcs: [
          {
            id: "montalan", x: 700, label: "Montalan", animation: MONTALAN,
            dialogueSets: [
              {
                requiresFlag: "a4_saSelda",
                skipIfFlag: "a4_bilibid",
                lines: [
                  { speaker: "Montalan", text: "Amnestiya raw, Sakay." },
                  { speaker: "Macario", text: "Sa papel nila, amnestiya. Sa batas nila, bandido." },
                  { speaker: "Montalan", text: "At ang Asamblea?" },
                  { speaker: "Macario", text: "Bubuksan nila. Wala na kasing nakaharang." },
                ],
                onComplete() {
                  state.flags.a4_bilibid = true;
                  markDirty();
                  setTimeout(() => runSceneScript(), 0);
                },
              },
              oneLine("Montalan", "Hindi nila tayo mapapatahimik, Sakay. Kahit dito."),
            ],
          },
          {
            id: "de-vega", x: 520, label: "De Vega", animation: DE_VEGA,
            startsHidden: true, revealedByFlag: "a4_hatol",
            dialogueSets: [oneLine("De Vega", "Kasama mo ako hanggang dulo, Pangulo.")],
          },
          {
            // The window, barred: no picture.
            id: "bintana", x: 1000, label: "Bintana", scenery: true,
            interactLabel: "Dumungaw",
            interactIcon: "i-hand",
            dialogueSets: [],
            onInteract: lookOut,
          },
        ],
      },
      {
        // Beat 11. The Court of First Instance of Cavite, 1906. Its
        // painting is owed.
        id: "hukuman",
        worldWidth: ROOM,
        backdrop: { src: "assets/backgrounds/act4/hukuman.jpg" },
        ground: { floor: "kahoy" },
        noRanged: true,
        startX: 300,
        scripts: [
          { requiresFlag: "a4_sumagot", doneFlag: "a4_hatol", run: theSentence },
          { requiresFlag: "a4_bilibid", doneFlag: "a4_saHukuman", x: 300, facing: 1, run: theCharge },
        ],
        decorations: [
          { id: "montalan-k", x: 140, animation: MONTALAN },
          { id: "villafuerte-k", x: 60, animation: VILLAFUERTE },
          { id: "de-vega-k", x: 210, animation: DE_VEGA },
        ],
        npcs: [
          {
            id: "hukom", x: 900, label: "Hukom", animation: HUKOM,
            interactLabel: "Sumagot",
            interactIcon: "i-talk",
            dialogueSets: [],
            onInteract: answerTheCourt,
          },
        ],
      },
      {
        // Beat 13. The yard of Old Bilibid, Santa Cruz, Manila, 13
        // September 1907; the scaffold is the painting's (owed). He walks
        // there himself (the checkpoint runs the statement).
        id: "patyo",
        worldWidth: YARD_WIDTH,
        backdrop: { src: "assets/backgrounds/act4/patyo.jpg" },
        ground: { floor: "bato" },
        noRanged: true,
        startX: 200,
        checkpoints: [
          { x: SCAFFOLD_X - 150, flag: "a4_saBitayan", reach: true, requiresFlag: "a4_saPatyo", script: true },
        ],
        scripts: [
          { requiresFlag: "a4_saBitayan", doneFlag: "a4_wakas", run: theStatement },
          { requiresFlag: "a4_hulingGabi", doneFlag: "a4_saPatyo", x: 200, facing: 1, run: theMorning },
        ],
        decorations: [
          { id: "de-vega-p", x: 420, animation: DE_VEGA, faceMovement: true, speakers: ["De Vega"] },
          { id: "bantay-p", x: 60, animation: BANTAY_BILIBID, speakers: ["Bantay"] },
        ],
        npcs: [],
      },
    ],
  };
})();
