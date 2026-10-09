// =============================================================
// MACARIO — content/act3.js
//
// ACT III, 1899 to 1902 (Block 117), from the proponent's plot, revised
// in Block 118 against the proponent's labelled sources, which are the
// source of truth: what is [CONTEXT] happened in the world without
// Macario, and he only hears of it (news, a letter, a notice, a black
// card); [MACARIO] is his, from the sources; [INSERT] is ours. STORY.md,
// "Act III, beat by beat", is every line, each beat tagged. Every line
// here is ours, accepted by the proponents on 9 Oct 2026. The
// Americans speak short, plain English (the proponent's choice), and
// what they say is given in Tagalog right after, by an interpreter or
// in Macario's thought, so no student is left out.
//
// The spine: whoever controls the words controls the war. A law calls
// asking for freedom sedition and a soldier a bandit; Macario answers by
// naming his own republic. He starts the act hiding in a disguise, the
// actor's trade turned to survival, and ends it swearing never to cut his
// hair until the country is free, where anyone can see him. Hair is the
// motif: the Barbero comes back, the haircut is played once more (on an
// American), and the vow pays it off.
//
//   burol        February 1899, his band in the hills outside Manila. A
//                runner brings the news of Santa Mesa [CONTEXT]: war. An
//                American patrol finds the band [INSERT]: fifteen in four
//                waves, then the retreat, on black.
//   tondo        May 1899, Act I's street under American guard. Isko's
//                letter: Jacinto is dead. Maryam, at the shut theatre,
//                dresses him from the costume trunk; past the sentries in
//                disguise to the barbershop. A stranger lives in Nanay's
//                house; the Mananahi says Nanay waited.
//   barberya     The Barbero hides him behind the scissors. An American
//                sits in the chair: the haircut. That night, the three who
//                took the pamphlets in Act I and refused him in Act II come
//                to be sworn; he teaches them Bonifacio's creed.
//   bayan        April 1901. Aguinaldo has sworn to America. Isko, with a
//                child he has never seen, surrenders; Macario lets him go.
//   calle-gunao  August 1901, Quiapo. The founding of the Partido
//                Nacionalista with Álvarez and Poblete [MACARIO]; he is
//                its Secretary-General, and gathers the petition's names.
//                November, two names in: Poblete brings the printed
//                Sedition Law [CONTEXT, read secondhand], and the third
//                will not sign (Block 120).
//   tondo        January 1902, at night: three houses past the patrols;
//                one does not answer.
//   barberya     The oath, and at its height the door broken in: someone
//                informed. Prison, on black.
//   selda        Bilibid, 4 July 1902: the amnesty from a guard at the
//                bars, and out of the gate himself (Block 120).
//   morong       The mountains: Carreón and Montalan, the Republika ng
//                Katagalugan, Macario its President and Generalissimo, its
//                flag raised, the vow not to cut their hair. November: the
//                Brigandage Act, on black [CONTEXT], and the Constabulary
//                come shouting "bandido" [INSERT]. The end.
//
// Wrapped in a function, as Act II is: the act files share one global
// scope. The people who return are window.PEOPLE (content/people.js);
// the fighters are the enemy catalogue's amerikano, sentinela and
// konstable (content/enemies.js), owed: placeholders until drawn. At the
// proponent's word (Block 118) no picture is made or borrowed for anyone
// not drawn: absent art is the placeholder, nothing else.
// Every flag starts with a3_.
//
// Art. Every picture this act names and nobody has drawn yet (ART.md,
// Owed) is the dashed placeholder box with its file name on it, and a
// room whose painting is owed is a dark wall with the name on it.
// =============================================================

(function () {
  const P = window.PEOPLE;

  // ---- Art ------------------------------------------------------------
  const owed = (folder, name) => ({ src: `assets/sprites/${folder}/${name}.png`, frames: 1, fps: 1 });
  const ALVAREZ = owed("characters", "alvarez");
  const CARREON = owed("characters", "carreon");
  const MONTALAN = owed("characters", "montalan");
  const GURO = owed("characters", "guro");
  const OPISYAL = owed("characters", "opisyal");
  const POBLETE = owed("characters", "poblete");
  const TAGAPAGBALITA = owed("characters", "tagapagbalita"); // Act II's, owed
  const WATAWAT = owed("scenery", "watawat-katagalugan");
  const AMERIKANO = owed("enemies", "amerikano");
  const KONSTABLE = owed("enemies", "konstable");
  const SUKI_AMERIKANO = owed("characters", "sundalong-amerikano");
  const BAGONG_NAKATIRA = owed("characters", "bagong-nakatira");
  const MANLILIMBAG = owed("characters", "manlilimbag"); // Act II's, owed
  const SILYA = owed("scenery", "silya-barbero"); // Act I's chair, owed
  // Block 120: Bilibid's guard (Act IV's, owed), and the Republic's
  // soldiers at Morong, seen beside its flag (Act IV's Kawal, owed).
  const BANTAY_BILIBID = owed("characters", "bantay-bilibid");
  const KAWAL = owed("characters", "kawal-katagalugan");

  // ---- The street ---------------------------------------------------
  // Act I's street. Joins at every multiple of 1450 (5800, 7250, 8700,
  // 10150, 11600, 13050); anyone a student must reach is 90 or more clear.
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

  const HOME_X = 2000;          // Nanay's house; strangers live there now
  const BARBERYA_X = 5260;      // the barbershop's door
  const MANANAHI_X = 6400;
  const ISKO_X = 12200;
  const ARRIVE_X = 12500;       // into Manila from the east, by day
  const MARYAM_X = 13250;       // at the shut entablado
  const NIGHT_ARRIVE_X = 12600;

  // The American sentries between the theatre and the barbershop: by day
  // in 1899, and again at night in January 1902. They catch, not shoot.
  // Passing each checkpoint (reach) is where a catch puts Macario back.
  const POSTS = [
    { beat: [11300, 11750], hide: 11420 },
    { beat: [9300, 9750], hide: 9500 },
    { beat: [7500, 7950], hide: 7700 },
    { beat: [5900, 6300], hide: 6100 },
  ];
  const DAY_CHECKPOINTS = [10600, 9000, 7100, 5500];
  // January 1902: three doors to knock on, between the patrols.
  const DOORS_X = [10900, 8300, 6700];

  // ---- Rooms ---------------------------------------------------------
  const ROOM = 1180;            // one screen wide, as the entablado
  const BARBERO_X = 260;
  const SILYA_X = 470;
  const RECRUITS_X = [700, 850, 1000];
  const TABLE_X = 620;          // where the oath is sworn
  const MESA_X = 1000;          // the officer's table at the town hall
  const BATTLE_WIDTH = 3200;    // the hills in 1899, and the camp at Morong
  const FLAG_X = 1500;          // the Katagalugan's flag, at Morong
  const KAWAL_X = [1700, 1820, 1940]; // its soldiers, beside it (Block 120)
  const LOOKOUT_X = 2300;

  const BESIDE = 120;
  const MEETS = 190;
  const HINT_HIGH = 155; // GROUND_LEVEL + 95, as Act I's: a jump to reach

  const CALM = null; // setMusic(null): the scene's own track
  const FIGHT = "assets/audio/music/intense.mp3";
  const NIGHT = "assets/audio/music/gabi.wav";

  // ---- Flags -------------------------------------------------------------
  const ARAL_FLAGS = ["a3_aral1", "a3_aral2", "a3_aral3"];
  // Block 120: two sign before the law; the third, after it, will not.
  const PIRMA_FLAGS = ["a3_pirma1", "a3_pirma2"];
  const PINTO_FLAGS = ["a3_pinto1", "a3_pinto2", "a3_pinto3"];
  // The street by day, before he is in the barbershop: the sentries are
  // on, the neighbours out. At night in 1902 only the patrols are out.
  const DAY = { requiresFlag: "a3_lumaban", unlessFlag: "a3_saBarberya" };
  const STREET_NIGHT = { requiresFlag: "a3_batas", unlessFlag: "a3_nahuli" };

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

  // ---- The battles ---------------------------------------------------
  // As Act II's (the proponent: a lot of fighting): waves from both sides
  // of the screen, a wave at a time, a line between waves. Running out of
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
  // Beat 1. February 1899, his band in the hills outside Manila [INSERT:
  // the sources do not say where he was]. Santa Mesa is [CONTEXT]: he is
  // not there, and hears of it from a runner.
  // =============================================================
  async function theNews() {
    setCutscene(true);
    await playIntertitle(["Pebrero 5, 1899", "Sa kabundukan, sa labas ng Maynila"], { startBlack: true });
    await wait(300);
    placeDecoration("tagapagbalita", viewEdges().right + 80);
    showDecoration("tagapagbalita", true);
    await moveDecoration("tagapagbalita", playerX() + MEETS, 280);
    await playDialogue([
      { speaker: "Tagapagbalita", text: "Pangulo! Balita mula sa Maynila!" },
      { speaker: "Tagapagbalita", text: "Kagabi, sa Santa Mesa, pinaputukan ng isang bantay na Amerikano ang ating mga sundalo." },
      { speaker: "Tagapagbalita", text: "Sa buong paligid ng Maynila, naglalaban na tayo at ang mga Amerikano." },
      { speaker: "Isko", text: "Pero kakampi raw natin sila, sabi ng mga heneral." },
      { speaker: "Macario", text: "Kakampi na bumili sa atin ng dalawampung milyong dolyar." },
      { speaker: "Macario", text: "..." },
      { speaker: "Macario", text: "Digmaan na naman, Isko. Bantayan natin ang kampo." },
    ]);
    await moveDecoration("tagapagbalita", -140, 280);
    showDecoration("tagapagbalita", false);
    setCutscene(false);
  }

  // At the lookout: an American patrol below, coming for the band
  // [INSERT].
  async function thePatrol() {
    if (state.flags.a3_putok) return;
    setCutscene(true);
    await playDialogue([
      { speaker: "Macario (sa isip)", text: "May gumagalaw sa ibaba ng burol..." },
      { speaker: "Macario (sa isip)", text: "Mga Amerikano. Paakyat dito." },
      { speaker: "Isko", text: "Pangulo! Natagpuan nila tayo!" },
      { speaker: "Macario", text: "Hindi tayo tatakbo nang hindi lumalaban." },
    ]);
    state.flags.a3_putok = true;
    markDirty();
    refreshNpcVisibility();
    setCutscene(false);
    setTimeout(() => runSceneScript(), 0);
  }

  // Beat 2. The patrol, and more behind it [INSERT]: fifteen in four
  // waves, then the retreat, and Manila under American guard, on black
  // [CONTEXT].
  async function theWar() {
    setCutscene(true);
    await wait(300);
    await playDialogue([
      { speaker: "Isko", text: "Ayan na sila!" },
    ]);
    setCutscene(false);
    await battle("sm", [
      { types: ["amerikano", "amerikano", "amerikano", "amerikano"],
        after: [{ speaker: "Macario (sa isip)", text: "Hindi sila tumitigil..." }] },
      { types: ["amerikano", "amerikano", "amerikano", "amerikano"],
        after: [{ speaker: "Isko", text: "May mga kanyon sila, Pangulo!" }] },
      { types: ["amerikano", "sentinela", "amerikano", "amerikano"],
        after: [{ speaker: "Macario (sa isip)", text: "Mas marami pa sila kaysa sa mga Kastila..." }] },
      { types: ["amerikano", "sentinela", "amerikano"] },
    ]);
    setCutscene(true);
    await wait(400);
    await playDialogue([
      { speaker: "Isko", text: "May dumarating pa sa ibaba, Pangulo!" },
      { speaker: "Macario", text: "Umatras tayo. Mas kailangan ng bayan ang buhay natin kaysa sa burol na ito." },
    ]);
    state.flags.a3_lumaban = true;
    markDirty();
    await playIntertitle(["Sa mga sumunod na buwan, bumagsak ang mga linya ng mga Pilipino sa paligid ng Maynila."],
      { keepBlack: true });
    await playIntertitle(["Napasailalim sa bantay ng mga Amerikano ang Maynila.", "Nagtago si Macario."],
      { startBlack: true, keepBlack: true });
    await playIntertitle(["Mayo 1899", "Tondo"], { startBlack: true, keepBlack: true });
    if (window.Acts) Acts.gotoScene("tondo", { x: ARRIVE_X, facing: -1 });
  }

  // =============================================================
  // Beat 4. Maryam dresses him from the costume trunk. Granted and worn
  // as the story does (Inventory.grant, then equip).
  // =============================================================
  function dressed() {
    state.flags.a3_nagbihis = true;
    markDirty();
    playSfx("give");
    if (window.Inventory && Inventory.grant) {
      Inventory.grant("balatkayo").then((ok) => { if (ok) Inventory.equip("balatkayo"); });
    }
    showToast("Suot mo ang balatkayo. Tumigil kapag nakatingin ang bantay.", 3600);
  }

  // =============================================================
  // Beat 6. The barbershop: the Barbero, and an American in the chair.
  // =============================================================
  async function theBarber() {
    setCutscene(true);
    showDecoration("suki", true);
    await wait(400);
    turnPlayer(-1);
    await playDialogue([
      { speaker: "Barbero", text: "Bukas pa kami, ginoo. Upo ka lang at—" },
      { speaker: "Barbero", text: "...Macario?" },
      { speaker: "Macario", text: "Magandang araw po." },
      { speaker: "Barbero", text: "Tatlong taon. Akala ko, patay ka na." },
      { speaker: "Macario", text: "Muntik na po." },
      { speaker: "Barbero", text: "Hindi bagay sa'yo ang maging magtataho." },
      { speaker: "Barbero", text: "Kung magtatago ka, dito ka magtago. Walang naghahanap ng rebelde sa likod ng gunting." },
      { speaker: "Sundalong Amerikano", text: "Hey, old man. I've been waiting." },
      { speaker: "Macario (sa isip)", text: "Kanina pa raw siya naghihintay." },
      { speaker: "Barbero (pabulong)", text: "Amerikano. Linggo-linggo siyang pumupunta rito." },
      { speaker: "Barbero", text: "Marunong ka pang humawak ng gunting?" },
      { speaker: "Macario", text: "Hindi kabayo ang mga suki n'yo, 'di po ba?" },
      { speaker: "Barbero", text: "...Naaalala mo pa." },
    ]);
    setCutscene(false);
  }

  // The chair: the haircut, once, on the American (the barber's game,
  // game.js, playCutGame, with his own hair).
  async function cutTheAmerican() {
    const f = state.flags;
    if (!f.a3_saBarberya) return;
    if (f.a3_nagupitan) {
      thinkAloud("Wala nang nakaupo. Tapos na ako rito.");
      return;
    }
    showDecoration("suki", true); // after a reload, too
    await playDialogue([
      { speaker: "Sundalong Amerikano", text: "Just a trim. Short on the sides." },
      { speaker: "Macario (sa isip)", text: "Maikli raw sa gilid." },
    ]);
    const clean = await playCutGame({
      title: "Barberya",
      hint: "Gupitin ang buhok na lampas sa guhit.",
      speaker: "Sundalong Amerikano",
      askText: "Just a trim. Short on the sides.",
      tooShortText: "Hey! Easy there, pal! (Dahan-dahan daw!)",
      customer: { hair: [176, 124, 70], hairLight: [205, 156, 96], hairShine: [226, 186, 128], moustache: false },
      doneText: (c) => (c >= 0.8 ? "Not bad, kid. Not bad at all." : "Huh. It'll grow back."),
    });
    if (clean < 0) return;
    setCutscene(true);
    // 6 Oct 2026: the verdict, given in Tagalog (the game's toast is his).
    await playDialogue([
      { speaker: "Macario (sa isip)", text: clean >= 0.8 ? "Hindi raw masama. Hindi talaga masama." : "Tutubo rin naman daw ulit." },
      { speaker: "Sundalong Amerikano", text: "Say. They tell me the insurrectos are hiding right here in Tondo." },
      { speaker: "Macario (sa isip)", text: "Nagtatago raw ang mga rebelde rito mismo sa Tondo." },
      { speaker: "Macario", text: "Dito po sa Tondo, ser?" },
      { speaker: "Sundalong Amerikano", text: "Bandits, all of 'em. Here. Keep the change." },
      { speaker: "Macario (sa isip)", text: "Mga bandido raw kaming lahat." },
      { speaker: "Macario (sa isip)", text: "At sa akin na raw ang sukli." },
    ]);
    if (window.Game && Game.addCurrency) Game.addCurrency(10);
    showToast("+10 barya", 2000);
    await moveDecoration("suki", ROOM + 120, 220);
    showDecoration("suki", false);
    await playDialogue([
      { speaker: "Barbero", text: "Ginupitan mo ang kaaway, at nag-iwan pa siya ng sukli." },
      { speaker: "Macario", text: "Mamayang gabi po, may darating na iba. Hindi para magpagupit." },
      { speaker: "Barbero", text: "Alam ko. Ikakandado ko ang pinto." },
    ]);
    f.a3_nagupitan = true;
    markDirty();
    setCutscene(false);
    setTimeout(() => runSceneScript(), 0);
  }

  // Beat 7. That night: the three who took the pamphlets in Act I come to
  // be sworn. On black, the room turns to night (refreshOnDuty) and they
  // are there (refreshNpcVisibility).
  async function thatNight() {
    setCutscene(true);
    await playIntertitle(["Nang gabing iyon."], {
      whileBlack: () => {
        state.flags.a3_gabiSaBarberya = true;
        markDirty();
        refreshOnDuty();
        refreshNpcVisibility();
        placePlayer(SILYA_X + 60, 1);
      },
    });
    await playDialogue([
      { speaker: "Macario (sa isip)", text: "Tatlong mukhang kilala ko." },
      { speaker: "Macario (sa isip)", text: "Ang tatlong tumanggap ng polyeto noon. At tumanggi sa akin pagkatapos." },
    ]);
    setCutscene(false);
  }

  // Beat 7, the end: the three sworn, the years on the move, Aguinaldo
  // taken, on black, and a town in April 1901.
  async function theFirstChapter() {
    setCutscene(true);
    await wait(300);
    await playDialogue([
      { speaker: "Macario", text: "Itaas ang inyong kanang kamay." },
      { speaker: "Macario", text: "Isinusumpa ba ninyong ipagtatanggol ang Inang Bayan, hanggang sa huling hininga?" },
      { speaker: "Mga Bagong Kasapi", text: "Isinusumpa namin." },
      { speaker: "Macario", text: "Mula ngayon, mga kapatid na kayo." },
      { speaker: "Barbero", text: "Ang batang nagsuklay noon ng kabayo. Tingnan mo ngayon." },
    ]);
    state.flags.a3_balangay = true;
    markDirty();
    await playIntertitle(["Sa sumunod na dalawang taon, palipat-lipat si Macario ng bayan, nakabalatkayo.",
      "Nagtatag siya ng mga bagong balangay ng Katipunan."], { keepBlack: true });
    // Block 120: Palanan is Isko's news in the town, not a card.
    await playIntertitle(["Abril 1901"], { startBlack: true, keepBlack: true });
    if (window.Acts) Acts.gotoScene("bayan", { x: 250, facing: 1 });
  }

  // =============================================================
  // Beat 8. A town, April 1901: the men in line before an American
  // table, Aguinaldo's proclamation on the wall, and Isko.
  // =============================================================
  async function theTown() {
    setCutscene(true);
    await wait(400);
    await playDialogue([
      { speaker: "Macario (sa isip)", text: "Bakit nakapila ang mga kawal sa harap ng mga Amerikano?" },
    ]);
    placeDecoration("isko-bayan", -120);
    showDecoration("isko-bayan", true);
    await moveDecoration("isko-bayan", playerX() - MEETS + 60, 300);
    turnPlayer(-1);
    // Block 120. Aguinaldo's capture [CONTEXT], heard from Isko rather
    // than read on a card: the disguise Macario lives by, turned on the
    // Republic.
    await playDialogue([
      { speaker: "Isko", text: "Pangulo... nahuli na raw ang Heneral sa Palanan." },
      { speaker: "Isko", text: "Mga sundalong nagpanggap na rebolusyonaryo ang humuli sa kanya." },
      { speaker: "Macario (sa isip)", text: "Nagbalatkayo sila. Gaya ko." },
      { speaker: "Isko", text: "Basahin n'yo po. Sa pader." },
    ]);
    turnPlayer(1);
    setCutscene(false);
  }

  // The proclamation, read with E.
  async function readTheProclamation() {
    const f = state.flags;
    if (!f.a3_saBayan) return;
    if (f.a3_nabasaAngProklama) {
      thinkAloud("Nabasa ko na. Ayoko nang basahin ulit.");
      return;
    }
    setCutscene(true);
    playSfx("page");
    await playDialogue([
      { speaker: "Macario (sa isip)", text: "\"Ako, si Emilio Aguinaldo...\"" },
      { speaker: "Macario (sa isip)", text: "\"...ay tumatanggap at kumikilala sa kapangyarihan ng Estados Unidos sa buong Pilipinas.\"" },
      { speaker: "Macario (sa isip)", text: "\"...Hinihikayat ko ang lahat na ibaba na ang kanilang mga sandata.\"" },
      { speaker: "Macario", text: "..." },
    ]);
    f.a3_nabasaAngProklama = true;
    markDirty();
    setCutscene(false);
    setTimeout(() => runSceneScript(), 0);
  }

  // Isko goes home: a child he has never seen. The hand raised to
  // America is the hand Macario asked to be raised in the oath.
  async function iskoGoesHome() {
    setCutscene(true);
    await wait(300);
    turnPlayer(-1);
    await playDialogue([
      { speaker: "Isko", text: "Totoo pala, Pangulo. Sumuko na ang Heneral." },
      { speaker: "Isko", text: "Sabi nila, ang manunumpa sa Amerika, makauuwi na. Walang kulong." },
      { speaker: "Macario", text: "At ikaw?" },
      { speaker: "Isko", text: "..." },
      { speaker: "Isko", text: "May anak na po ako, Pangulo. Dalawang taon na. Hindi pa niya ako nakikilala." },
      { speaker: "Macario", text: "..." },
      { speaker: "Macario", text: "Umuwi ka." },
      { speaker: "Isko", text: "Sumama na po kayo. Tapos na." },
      { speaker: "Macario", text: "Tapos na para kay Aguinaldo. Hindi ako sa kanya nanumpa." },
      { speaker: "Macario", text: "Ilang beses na tayong pinangakuan ng kapayapaan. Ilang beses na tayong ipinagbili." },
      { speaker: "Isko", text: "Hahanapin ko pa rin po si Nanay ninyo. Pangako." },
      { speaker: "Macario", text: "Huwag kang mangako, Isko. Mabigat dalhin." },
    ]);
    await moveDecoration("isko-bayan", MESA_X - MEETS + 40, 200);
    await playDialogue([
      { speaker: "Opisyal", text: "Name?" },
      { speaker: "Isko", text: "Francisco... Francisco Reyes." },
      { speaker: "Opisyal", text: "Raise your right hand." },
      { speaker: "Macario (sa isip)", text: "Itaas daw ang kanang kamay." },
      { speaker: "Macario (sa isip)", text: "Ang kamay na itinaas niya sa Katipunan." },
    ]);
    state.flags.a3_umalisSiIsko = true;
    markDirty();
    await playIntertitle(["Libu-libo ang sumuko at nanumpa ng katapatan sa Amerika.", "Tumanggi si Macario."],
      { keepBlack: true, whileBlack: () => showDecoration("isko-bayan", false) });
    await playIntertitle(["Agosto 1901", "Calle Gunao, Quiapo"], { startBlack: true, keepBlack: true });
    if (window.Acts) Acts.gotoScene("calle-gunao", { x: 150, facing: 1 });
  }

  // =============================================================
  // Beat 9. Calle Gunao, August 1901: the founding of the Partido
  // Nacionalista, Macario its Secretary-General, with Santiago Álvarez
  // and Pascual Poblete [MACARIO]. A house on the street [INSERT: the
  // sources give only the street].
  // =============================================================
  async function theFounding() {
    setCutscene(true);
    await wait(400);
    await movePlayer(560 - BESIDE, 170);
    await playDialogue([
      { speaker: "Álvarez", text: "Sakay. Ang sabi nila, ikaw ang huling Katipunerong ayaw bumaba ng bundok." },
      { speaker: "Macario", text: "At kayo, Heneral Álvarez? Bumaba na kayo?" },
      { speaker: "Álvarez", text: "Sa ibang daan na kami lalaban." },
      { speaker: "Poblete", text: "Isang partido, nang hayagan. Hihingin natin sa mga Amerikano ang kalayaan, ayon sa sarili nilang batas." },
      { speaker: "Macario", text: "Papel laban sa riple." },
      { speaker: "Álvarez", text: "Papel din ang Kalayaan, 'di ba? Ilang libo ang sumapi dahil doon." },
      { speaker: "Poblete", text: "Partido Nacionalista. At kailangan namin ng Kalihim-Heneral na kilala ng taga-Tondo." },
      { speaker: "Álvarez", text: "Ikaw, Sakay." },
      { speaker: "Macario", text: "..." },
      { speaker: "Macario (sa isip)", text: "Kung may daang walang mamamatay... susubukan ko." },
      { speaker: "Macario", text: "Tinatanggap ko." },
      { speaker: "Poblete", text: "Kung gayon, Kalihim-Heneral, kailangan ng petisyon ang mga pirma." },
    ]);
    setCutscene(false);
  }

  // Beat 10. November 1901: the Sedition Law. Passed without him
  // [CONTEXT]; Poblete brings the printed notice, and he reads it. The
  // law's own words in English, then in Tagalog.
  //
  // Block 120: it lands in the middle of the petition, after two names,
  // and the third (the Guro) will not sign once it is posted.
  async function theSeditionLaw() {
    setCutscene(true);
    await wait(300);
    await playIntertitle(["Nobyembre 1901"], { whileBlack: () => showDecoration("poblete", false) });
    placeDecoration("poblete-pinto", ROOM + 80);
    showDecoration("poblete-pinto", true);
    playSfx("door");
    await moveDecoration("poblete-pinto", playerX() + MEETS, 240);
    turnPlayer(1);
    await playDialogue([
      { speaker: "Poblete", text: "Sakay. Heneral. Basahin ninyo ito. Nakapaskil na sa buong Maynila." },
    ]);
    playSfx("page");
    await playDialogue([
      { speaker: "Macario (sa isip)", text: "\"Act Number 292. November 4, 1901.\"" },
      { speaker: "Macario (sa isip)", text: "\"Any person who advocates independence, by word or in writing, even by peaceful means, shall be punished.\"" },
      { speaker: "Macario (sa isip)", text: "Ang sinumang magsulong ng kalayaan, sa salita man o sa sulat, kahit sa mapayapang paraan, ay paparusahan." },
      { speaker: "Macario (sa isip)", text: "At krimen na rin ang pagsapi sa lihim na samahan." },
      { speaker: "Álvarez", text: "Kahit ang paghingi." },
      { speaker: "Poblete", text: "Ang petisyon natin... krimen na." },
      { speaker: "Macario (sa isip)", text: "Noon, sedula ang pinunit namin." },
      { speaker: "Macario (sa isip)", text: "Ngayon, krimen na ang bawat papel namin." },
      { speaker: "Poblete", text: "May isa pang pirmang kulang, Kalihim-Heneral. Ang guro." },
    ]);
    state.flags.a3_batas = true;
    markDirty();
    setCutscene(false);
  }

  // The last name refused, and January 1902.
  async function noOtherWay() {
    setCutscene(true);
    await wait(300);
    await playDialogue([
      { speaker: "Macario (sa isip)", text: "Dalawang pirma. Isang batas lang ang kinailangan nila." },
      { speaker: "Álvarez", text: "Ano ngayon, Kalihim-Heneral?" },
      { speaker: "Macario", text: "Wala nang ibang daan, Heneral." },
    ]);
    state.flags.a3_papuntangTondo = true;
    markDirty();
    await playIntertitle(["Enero 1902", "Tondo"], { keepBlack: true });
    if (window.Acts) Acts.gotoScene("tondo", { x: NIGHT_ARRIVE_X, facing: -1 });
  }

  // =============================================================
  // Beat 11. January 1902, at night: word to three houses, past the
  // patrols. "Anak ng Bayan" is Act I's password.
  // =============================================================
  const DOOR_LINES = [
    [
      { speaker: "Macario (pabulong)", text: "Anak ng Bayan." },
      { speaker: "Tinig sa Loob", text: "...Pasok ang hudyat." },
      { speaker: "Macario (pabulong)", text: "Bukas ng gabi, sa barberya. Tatlo kayo." },
      { speaker: "Tinig sa Loob", text: "Darating kami." },
    ],
    // Block 120: the second house does not answer. Someone got there
    // first; who, and what became of them, is not said.
    [
      { speaker: "Macario (pabulong)", text: "Anak ng Bayan." },
      { speaker: "Macario (sa isip)", text: "..." },
      { speaker: "Macario (sa isip)", text: "Walang sumasagot. Bukas ang bintana." },
      { speaker: "Macario (sa isip)", text: "Nauna na sila rito." },
    ],
    [
      { speaker: "Tinig sa Loob", text: "Akala ko, hindi ka na darating." },
      { speaker: "Macario (pabulong)", text: "Bukas ng gabi. Sa barberya." },
      { speaker: "Tinig sa Loob", text: "May nagtanong tungkol sa'yo kanina. Isang lalaking hindi taga-rito." },
    ],
  ];

  const EMPTY_DOOR = 1;

  function knock(n) {
    return async () => {
      const f = state.flags;
      if (!f.a3_batas || f.a3_nahuli) return;
      if (f[PINTO_FLAGS[n]]) {
        thinkAloud(n === EMPTY_DOOR ? "Wala nang tao rito." : "Naipaalam ko na rito. Sa susunod na bahay.");
        return;
      }
      playSfx("door");
      await wait(260);
      await playDialogue(DOOR_LINES[n]);
      tick(PINTO_FLAGS, PINTO_FLAGS[n], "a3_naipaalam", "Kinatok");
      if (f.a3_naipaalam) showToast("Pumunta sa barberya.", 3000);
    };
  }

  // =============================================================
  // Beat 12. The oath, and at its height the door broken in. Someone
  // informed; the record does not say who, and neither does the game.
  // Prison, and the amnesty, on black.
  // =============================================================
  async function theRaidOnTheOath() {
    setCutscene(true);
    await movePlayer(TABLE_X, 170);
    turnPlayer(1);
    await playDialogue([
      { speaker: "Macario", text: "Alisin ang piring." },
      { speaker: "Macario", text: "Sa labas ng pintong ito, krimen na ang pumasok dito." },
      { speaker: "Macario", text: "Kapag nahuli kayo, kulong. O higit pa." },
      { speaker: "Macario", text: "May aatras ba?" },
      { speaker: "Mga Bagong Kasapi", text: "..." },
      { speaker: "Macario", text: "Itaas ang inyong kanang kamay." },
      { speaker: "Macario", text: "Isinusumpa ba ninyong—" },
    ]);
    playSfx("door");
    await wait(220);
    playSfx("door");
    await wait(220);
    playSfx("door");
    await playDialogue([
      { speaker: "Sundalong Amerikano", text: "Open up! U.S. Army!" },
      { speaker: "Konstable", text: "Buksan n'yo! Konstabularya!" },
      { speaker: "Barbero", text: "Sa likod, Macario! Tumakbo ka!" },
    ]);
    turnPlayer(-1);
    placeDecoration("sundalo-likod", -100);
    showDecoration("sundalo-likod", true);
    await moveDecoration("sundalo-likod", 90, 260);
    await playDialogue([
      { speaker: "Sundalong Amerikano", text: "Hands up! Don't move!" },
      { speaker: "Macario (sa isip)", text: "Itaas daw ang kamay. Huwag gagalaw." },
      { speaker: "Macario (sa isip)", text: "Pati ang likod." },
      { speaker: "Macario (sa isip)", text: "May nagturo." },
    ]);
    placeDecoration("konstable-pinto", ROOM + 60);
    showDecoration("konstable-pinto", true);
    await moveDecoration("konstable-pinto", RECRUITS_X[2] + 60, 260);
    await playDialogue([
      { speaker: "Barbero", text: "Walang kinalaman dito ang mga batang 'yan!" },
      { speaker: "Konstable", text: "Tumahimik ka, matanda." },
      { speaker: "Macario", text: "..." },
    ]);
    state.flags.a3_nahuli = true;
    markDirty();
    await playIntertitle(["Enero 1902. Nahuli si Macario Sakay habang nagtatatag ng mga balangay ng Katipunan.",
      "Ikinulong siya sa Bilibid."], { keepBlack: true });
    // Block 120: the amnesty is shown in the cell, not put on cards.
    await playIntertitle(["Hulyo 4, 1902"], { startBlack: true, keepBlack: true });
    if (window.Acts) Acts.gotoScene("selda", { x: 300, facing: 1 });
  }

  // =============================================================
  // Block 120. Bilibid, 4 July 1902 [MACARIO: imprisoned, released under
  // the amnesty]. The war declared over and the amnesty [CONTEXT] reach
  // him from a guard at the bars [INSERT]; he walks out himself. Act IV's
  // cell, the same room he comes back to in 1906 ("Bilibid. Muli.").
  // =============================================================
  async function theAmnesty() {
    setCutscene(true);
    await wait(400);
    await playDialogue([
      { speaker: "Macario (sa isip)", text: "Anim na buwan na sa Bilibid." },
    ]);
    placeDecoration("bantay", ROOM + 60);
    showDecoration("bantay", true);
    await moveDecoration("bantay", playerX() + MEETS, 200);
    turnPlayer(1);
    await playDialogue([
      { speaker: "Bantay", text: "Sakay. May balita mula sa Maynila." },
      { speaker: "Bantay", text: "Idineklara raw ng mga Amerikano na tapos na ang digmaan." },
      { speaker: "Bantay", text: "Amnestiya sa mga bilanggong pulitikal. Kasama ka sa listahan." },
      { speaker: "Macario", text: "Tapos na raw ang digmaan." },
      { speaker: "Bantay", text: "Lumabas ka na, bago pa magbago ang isip nila." },
      { speaker: "Macario (sa isip)", text: "Malaya raw ako. Pero ang bayan?" },
    ]);
    await moveDecoration("bantay", ROOM + 60, 200);
    showDecoration("bantay", false);
    setCutscene(false);
  }

  // Out of the gate, on his own feet, and to Morong.
  async function outOfBilibid() {
    const f = state.flags;
    if (!f.a3_saSelda || f.a3_pinalaya) return;
    setCutscene(true);
    playSfx("door");
    f.a3_pinalaya = true;
    markDirty();
    await playIntertitle(["Lumabas si Macario sa bilangguan,", "at tumuloy sa kabundukan ng Morong."],
      { keepBlack: true });
    if (window.Acts) Acts.gotoScene("morong", { x: 400, facing: 1 });
  }

  // =============================================================
  // Beat 13. Morong, 1902: Carreón and Montalan; the Republika ng
  // Katagalugan, Bonifacio's creed its constitution.
  // =============================================================
  async function theMountains() {
    // Block 121. A save from before Block 120 put the arrest straight into
    // Morong, with no cell: the steps between are taken as done, so its
    // task line is not left at "Lumabas sa Bilibid".
    if (!state.flags.a3_pinalaya) { state.flags.a3_saSelda = state.flags.a3_pinalaya = true; markDirty(); }
    setCutscene(true);
    await wait(400);
    await movePlayer(900 - BESIDE - 40, 170);
    await playDialogue([
      { speaker: "Montalan", text: "Sakay! Akala namin, nasa Bilibid ka pa." },
      { speaker: "Macario", text: "Pinalaya nila ako. Tapos na raw ang digmaan." },
      { speaker: "Carreón", text: "Tapos na raw. Pero nasa lupa pa rin natin sila." },
      { speaker: "Montalan", text: "May mga tauhan kami rito sa Morong. Kulang lang kami ng pinuno." },
      { speaker: "Macario (sa isip)", text: "Isang Katipunang walang Supremo. Isang republikang walang pangalan." },
    ]);
    setCutscene(false);
  }

  // The Republic's own flag [MACARIO], raised with E once it is named.
  async function raiseTheFlag() {
    const f = state.flags;
    if (!f.a3_itinatag) {
      thinkAloud("Wala pang republikang magtataas nito.");
      return;
    }
    if (f.a3_watawat) {
      thinkAloud("Nakataas na. Sa amin.");
      return;
    }
    setCutscene(true);
    playSfx("fanfare");
    await playDialogue([
      { speaker: "Macario (sa isip)", text: "Hindi watawat ng Kastila. Hindi ng Amerika." },
      { speaker: "Mga Kawal", text: "Mabuhay ang Republika ng Katagalugan!" },
    ]);
    f.a3_watawat = true;
    markDirty();
    setCutscene(false);
    setTimeout(() => runSceneScript(), 0);
  }

  // The vow [MACARIO, reported]: a young fighter offers to cut his hair.
  async function theVow() {
    setCutscene(true);
    await wait(300);
    placeDecoration("batang-kawal", viewEdges().left - 80);
    showDecoration("batang-kawal", true);
    await moveDecoration("batang-kawal", playerX() - MEETS + 40, 260);
    turnPlayer(-1);
    await playDialogue([
      { speaker: "Batang Kawal", text: "Pangulo, ang haba na ng buhok n'yo. Gugupitan ko po kayo?" },
      { speaker: "Macario", text: "Barbero ako dati, iho." },
      { speaker: "Macario", text: "Pero ito, hindi ko na gugupitin." },
      { speaker: "Batang Kawal", text: "Po?" },
      { speaker: "Macario", text: "Hindi tayo magpapagupit hangga't hindi malaya ang bayan." },
      { speaker: "Montalan", text: "Hanggang sa paglaya!" },
      { speaker: "Mga Kawal", text: "Hanggang sa paglaya!" },
      { speaker: "Macario (sa isip)", text: "Tatlong taon akong nagtago sa balatkayo." },
      { speaker: "Macario (sa isip)", text: "Ngayon, makikilala nila ako kahit sa malayo." },
    ]);
    // His own clothes again: no more disguises.
    if (window.Inventory && Inventory.equip && Inventory.owns && Inventory.owns("damit-entablado")) {
      Inventory.equip("damit-entablado");
    }
    state.flags.a3_republika = true;
    markDirty();
    setCutscene(false);
    setTimeout(() => runSceneScript(), 0);
  }

  // Beat 14. November 1902: the Brigandage Act, passed without him, on
  // black [CONTEXT]; the Constabulary at the camp [INSERT]. Then the end.
  async function theBandits() {
    setCutscene(true);
    await wait(300);
    await playIntertitle(["Nobyembre 12, 1902", "Ipinasa ng mga Amerikano ang Batas sa Bandolerismo."],
      { keepBlack: true });
    await playIntertitle(["Ang sinumang patuloy na lumalaban ay hindi na sundalo.",
      "Isa na siyang bandido, at kamatayan ang parusa."], { startBlack: true,
      whileBlack: () => placePlayer(FLAG_X - 140, -1) });
    await wait(300);
    await playDialogue([
      { speaker: "Konstable", text: "Mga bandido! Sumuko kayo!" },
      { speaker: "Montalan", text: "Konstabularya. Mga Pilipino rin sila, Pangulo." },
      { speaker: "Macario", text: "Pilipinong naka-uniporme ng Amerikano." },
      { speaker: "Macario", text: "Ipagtanggol ang kampo!" },
      { speaker: "Montalan", text: "Ang watawat, Pangulo! Doon sila papunta!" },
    ]);
    setCutscene(false);
    // Block 120: the flag is what they come for. A Constable nearer the
    // flag than Macario goes for it; if it falls, the wave starts again.
    setDecoys([{ id: "watawat", hp: 8, holds: true, fallText: "Bumagsak ang watawat!" }]);
    showToast("Ipagtanggol ang watawat!", 3000);
    await battle("mr", [
      { types: ["konstable", "konstable", "konstable", "konstable"],
        after: [{ speaker: "Carreón", text: "Marami pa sa ibaba!" }] },
      { types: ["konstable", "konstable", "sentinela", "konstable"],
        after: [{ speaker: "Macario (sa isip)", text: "Kapwa Pilipino ang sinusuntok ko..." }] },
      { types: ["konstable", "sentinela", "konstable", "konstable"],
        after: [{ speaker: "Montalan", text: "Huwag kayong aatras!" }] },
      { types: ["konstable", "konstable", "sentinela"] },
    ]);
    setDecoys(null);
    setCutscene(true);
    await wait(400);
    await playDialogue([
      { speaker: "Montalan", text: "Umatras sila!" },
      { speaker: "Carreón", text: "Babalik sila. Sa susunod, mas marami." },
      { speaker: "Macario", text: "Hayaan mo silang bumalik." },
      { speaker: "Macario (sa isip)", text: "Noon, tinawag kaming insurekto." },
      { speaker: "Macario (sa isip)", text: "Ngayon, bandido." },
      { speaker: "Macario (sa isip)", text: "Pero kami ang nagbigay ng pangalan sa republikang ito. Hindi nila 'yon mababago." },
      { speaker: "Macario (sa isip)", text: "'Nay... humahaba na ang buhok ko. Kung makita mo ako, makikilala mo pa kaya ako?" },
    ]);
    await playIntertitle(["Wakas ng Ikatlong Yugto"]);
    state.flags.a3_wakas = true;
    markDirty();
    setCutscene(false);
  }

  // ---- The Talaan ----------------------------------------------------
  // Three papers of facts of the game's own, on the street by day (fixed,
  // as Acts I and II); a teacher's paper replaces its own slot.
  const HINT_SPOTS = [11200, { x: 9100, y: HINT_HIGH }, { x: 7700, y: HINT_HIGH }];

  // ---- Story points (?dev=1, Block 108) ---------------------------------
  // Each the flags set by then, built on the one before.
  const DEV_SHOT = { a3_simula: true, a3_putok: true };
  const DEV_TONDO = Object.assign({}, DEV_SHOT, { a3_lumaban: true, a3_saTondo: true });
  const DEV_LETTER = Object.assign({}, DEV_TONDO, { a3_nabasaAngSulat: true });
  const DEV_DRESSED = Object.assign({}, DEV_LETTER, { a3_nagbihis: true });
  const DEV_BARBER = Object.assign({}, DEV_DRESSED, { a3_saBarberya: true });
  const DEV_NIGHT = Object.assign({}, DEV_BARBER, { a3_nagupitan: true, a3_gabiSaBarberya: true });
  const DEV_TOWN = Object.assign({}, DEV_NIGHT, { a3_naturo: true, a3_balangay: true },
    Object.fromEntries(ARAL_FLAGS.map((k) => [k, true])));
  const DEV_GUNAO = Object.assign({}, DEV_TOWN, { a3_saBayan: true, a3_nabasaAngProklama: true,
    a3_umalisSiIsko: true, a3_saGunao: true });
  const DEV_LAW = Object.assign({}, DEV_GUNAO, { a3_pumirma: true, a3_batas: true },
    Object.fromEntries(PIRMA_FLAGS.map((k) => [k, true])));
  const DEV_STREET_NIGHT = Object.assign({}, DEV_LAW, { a3_tumanggi: true, a3_papuntangTondo: true, a3_saGabi: true });
  const DEV_OATH = Object.assign({}, DEV_STREET_NIGHT, { a3_naipaalam: true },
    Object.fromEntries(PINTO_FLAGS.map((k) => [k, true])));
  const DEV_CELL = Object.assign({}, DEV_OATH, { a3_handaNa: true, a3_nagsimula: true, a3_nahuli: true });
  const DEV_MORONG = Object.assign({}, DEV_CELL, { a3_saSelda: true, a3_pinalaya: true, a3_saMorong: true });
  const DEV_REPUBLIC = Object.assign({}, DEV_MORONG, { a3_itinatag: true, a3_watawat: true, a3_republika: true });
  const CLOTHES = ["damit-entablado"];
  const DISGUISE = ["damit-entablado", "balatkayo"];
  const DEV_JUMPS = [
    { id: "simula", items: CLOTHES, label: "Ang simula: ang balita (Pebrero 1899)", scene: "burol",
      flags: {}, task: "Bantayan ang kampo" },
    { id: "labanan", items: CLOTHES, label: "Ang burol: ang labanan", scene: "burol",
      x: LOOKOUT_X - 100, facing: 1, flags: DEV_SHOT, task: "Labanan ang mga Amerikano" },
    { id: "tondo", items: CLOTHES, label: "Tondo, 1899: ang sulat", scene: "tondo",
      x: ARRIVE_X, facing: -1, flags: DEV_TONDO, task: "Basahin ang sulat ni Isko" },
    { id: "maryam", items: CLOTHES, label: "Tondo, 1899: si Maryam", scene: "tondo",
      x: 13000, facing: 1, flags: DEV_LETTER, task: "Humingi ng tulong kay Maryam" },
    { id: "balatkayo", items: DISGUISE, label: "Tondo, 1899: ang balatkayo", scene: "tondo",
      x: 12000, facing: -1, flags: DEV_DRESSED, task: "Makarating sa barberya nang hindi nakikilala" },
    { id: "barberya", items: DISGUISE, label: "Ang barberya: ang suking Amerikano", scene: "barberya",
      x: ROOM - 160, facing: -1, flags: DEV_BARBER, task: "Gupitan ang suki" },
    { id: "aral", items: DISGUISE, label: "Ang barberya: ang aral ng Supremo", scene: "barberya",
      x: SILYA_X + 60, facing: 1, flags: DEV_NIGHT, task: "Ituro ang aral ng Supremo" },
    { id: "proklama", items: DISGUISE, label: "Abril 1901: ang proklama", scene: "bayan",
      x: 250, facing: 1, flags: Object.assign({}, DEV_TOWN, { a3_saBayan: true }), task: "Basahin ang proklama" },
    { id: "gunao", items: DISGUISE, label: "Calle Gunao, 1901: ang petisyon", scene: "calle-gunao",
      x: 440, facing: 1, flags: DEV_GUNAO, task: "Papirmahin ang petisyon" },
    { id: "batas", items: DISGUISE, label: "Calle Gunao, 1901: ang huling pirma", scene: "calle-gunao",
      x: 440, facing: 1, flags: DEV_LAW, task: "Kunin ang huling pirma" },
    { id: "gabi", items: DISGUISE, label: "Tondo, 1902: ang tatlong bahay", scene: "tondo",
      x: NIGHT_ARRIVE_X, facing: -1, flags: DEV_STREET_NIGHT, task: "Kumatok sa tatlong bahay" },
    { id: "panunumpa", items: DISGUISE, label: "Ang barberya, 1902: ang panunumpa", scene: "barberya",
      x: ROOM - 160, facing: -1, flags: DEV_OATH, task: "Panumpain ang mga bagong kasapi" },
    { id: "bilibid", items: DISGUISE, label: "Bilibid, Hulyo 1902: ang amnestiya", scene: "selda",
      x: 300, facing: 1, flags: DEV_CELL, task: "Lumabas sa Bilibid" },
    { id: "morong", items: DISGUISE, label: "Morong, 1902: ang Republika", scene: "morong",
      x: 640, facing: 1, flags: DEV_MORONG, task: "Itatag ang Republika" },
    { id: "bandido", items: CLOTHES, label: "Morong, 1902: ang mga bandido", scene: "morong",
      x: 900, facing: 1, flags: DEV_REPUBLIC, task: "Ipagtanggol ang kampo" },
  ];

  const oneLine = (speaker, text, extra) => Object.assign({ lines: [{ speaker, text }] }, extra || {});

  // A recruit taught a precept of Bonifacio's creed: the gift button.
  const teach = (n, lines) => ({
    buttonLabel: "Ituro ang aral",
    requiresFlag: "a3_gabiSaBarberya",
    givenFlag: ARAL_FLAGS[n],
    responseLines: lines,
    onComplete() {
      tick(ARAL_FLAGS, ARAL_FLAGS[n], "a3_naturo", "Naituro ang aral");
    },
  });
  // A member's name on the petition: the gift button.
  const sign = (n, lines) => ({
    buttonLabel: "Papirmahin",
    requiresFlag: "a3_saGunao",
    givenFlag: PIRMA_FLAGS[n],
    responseLines: lines,
    onComplete() {
      playSfx("page");
      tick(PIRMA_FLAGS, PIRMA_FLAGS[n], "a3_pumirma", "Pumirma");
    },
  });

  window.ACT_3 = {
    number: 3,
    title: "The Republic in the Shadows",
    titleTagalog: "Ang Republika sa Lilim",
    devJumps: DEV_JUMPS,

    // One chain, in story order, the quest log (Block 48).
    //
    //   1  the news of Santa Mesa, the lookout, the patrol (thePatrol).
    //   2  the battle and the retreat (theWar, fifteen Americans).
    //   3  Isko's letter: Jacinto is dead (his gift button).
    //   4  Maryam's trunk: the disguise (her conversation).
    //   5  past the sentries to the barbershop (theBarber, on arrival).
    //   6  the haircut on the American (cutTheAmerican).
    //   7  the creed taught to three (n/3) and their oath.
    //   8  Aguinaldo's proclamation, and Isko goes home (iskoGoesHome).
    //   9  the founding, Secretary-General; two sign the petition.
    //  10  the Sedition Law, a printed notice (theSeditionLaw), and the
    //      last name refused (Block 120).
    //  11  three houses knocked on at night (n/3); one is empty.
    //  12  the oath broken in on (theRaidOnTheOath): caught.
    //  13  Bilibid: the amnesty, and out of the gate (Block 120).
    //  14  the Republika ng Katagalugan, its flag, and the vow (theVow).
    //  15  the Brigandage Act and the flag defended (theBandits): the end.
    linearObjectives: true,
    // Block 125. guide: where each step is done, for the arrow (game.js,
    // THE GUIDE). A scene alone means "go there": its script takes over.
    // The battles name none.
    objectives: [
      { id: "bantayan", label: "Bantayan ang kampo", flag: "a3_putok",
        guide: { scene: "burol", npc: "bantayan" } },
      { id: "labanan", label: "Labanan ang mga Amerikano", flag: "a3_lumaban" },
      { id: "sulat", label: "Basahin ang sulat ni Isko", flag: "a3_nabasaAngSulat",
        guide: { scene: "tondo", npc: "isko" } },
      { id: "maryam", label: "Humingi ng tulong kay Maryam", flag: "a3_nagbihis",
        guide: { scene: "tondo", npc: "maryam" } },
      { id: "barberya", label: "Makarating sa barberya nang hindi nakikilala", flag: "a3_saBarberya",
        guide: { scene: "barberya" } },
      { id: "gupitan", label: "Gupitan ang suki", flag: "a3_nagupitan",
        guide: { scene: "barberya", npc: "silya" } },
      { id: "aral", label: "Ituro ang aral ng Supremo", flag: "a3_balangay", countFlags: ARAL_FLAGS,
        guide: { scene: "barberya", npcs: ["mangingisda", "tabakera", "karpintero"] } },
      { id: "proklama", label: "Basahin ang proklama", flag: "a3_umalisSiIsko",
        guide: { scene: "bayan", npc: "proklama" } },
      { id: "petisyon", label: "Papirmahin ang petisyon", flag: "a3_pumirma", countFlags: PIRMA_FLAGS,
        guide: { scene: "calle-gunao", npcs: ["manlilimbag", "direktor"] } },
      { id: "huling_pirma", label: "Kunin ang huling pirma", flag: "a3_tumanggi",
        guide: { scene: "calle-gunao", npc: "guro" } },
      { id: "tatlong_bahay", label: "Kumatok sa tatlong bahay", flag: "a3_naipaalam", countFlags: PINTO_FLAGS,
        guide: { scene: "tondo", npcs: PINTO_FLAGS.map((_, i) => "pinto-" + (i + 1)), doneFlags: PINTO_FLAGS } },
      { id: "panunumpa", label: "Panumpain ang mga bagong kasapi", flag: "a3_nahuli",
        guide: { scene: "barberya", npc: "mesa" } },
      { id: "bilibid", label: "Lumabas sa Bilibid", flag: "a3_pinalaya",
        guide: { scene: "selda", npc: "tarangkahan" } },
      { id: "republika", label: "Itatag ang Republika", flag: "a3_republika", guide: [
        { scene: "morong", npc: "carreon", unlessFlag: "a3_itinatag" },
        { scene: "morong", npc: "watawat", requiresFlag: "a3_itinatag" },
      ] },
      { id: "kampo", label: "Ipagtanggol ang kampo", flag: "a3_wakas" },
    ],
    startingQuests: [],

    hints: {
      count: 3,
      fixed: true,
      label: "Papel",
      listLabel: "Mga Papel",
      places: [
        "On the street by day in 1899, between the theatre and the first American sentry. Every student walks past it.",
        "On the street by day, past the second sentry, at jump height: the student has to jump for it.",
        "On the street by day, by the third sentry, at jump height, short of the barbershop.",
      ],
      foundText: "Naitala ito sa Talaan. Buksan ang Talaan sa pause para basahin ulit.",
      completeText: "Nahanap mo na ang lahat ng papel!",
      pool: [
        { slot: 1, title: "Ang Santa Mesa",
          text: "Noong gabi ng Pebrero 4, 1899, pinaputukan ng isang bantay na Amerikano ang mga sundalong Pilipino sa Santa Mesa, Maynila. Kinabukasan, nagsimula ang Digmaang Pilipino-Amerikano. Napasailalim ang Maynila sa mga Amerikano." },
        { slot: 2, title: "Ang Batas sa Sedisyon",
          text: "Noong Nobyembre 4, 1901, ipinasa ng Komisyon ng Pilipinas ang Batas Bilang 292. Ginawa nitong krimen ang pagsusulong ng kalayaan, sa salita man o sa sulat, kahit sa mapayapang paraan, at ang pagsapi sa mga lihim na samahan." },
        { slot: 3, title: "Ang Republika ng Katagalugan",
          text: "Noong 1902, itinatag ni Macario Sakay ang Republika ng Katagalugan sa kabundukan ng Morong, at ginawang saligang batas ang mga aral ni Andres Bonifacio. Noong Nobyembre 12, 1902, ipinasa ng mga Amerikano ang Batas sa Bandolerismo: tinawag nilang bandido ang sinumang patuloy na lumalaban." },
      ],
    },

    scenes: [
      {
        // Beats 1 and 2. His band's camp in the hills outside Manila,
        // February 1899 [INSERT]: the news of Santa Mesa, the lookout,
        // and the battle. Its painting is owed.
        id: "burol",
        worldWidth: BATTLE_WIDTH,
        backdrop: { src: "assets/backgrounds/act3/burol.jpg" },
        ground: { floor: "damo" },
        dangerous: true,
        startX: 400,
        scripts: [
          { requiresFlag: "a3_putok", doneFlag: "a3_lumaban", run: theWar },
          { doneFlag: "a3_simula", x: 400, facing: 1, run: theNews },
        ],
        pickups: [
          { id: "puso-sm-1", x: 900, type: "heart" },
          { id: "puso-sm-2", x: 1700, type: "heart" },
          { id: "puso-sm-3", x: 2600, type: "heart" },
        ],
        decorations: [
          { id: "tagapagbalita", x: BATTLE_WIDTH + 80, hidden: true, animation: TAGAPAGBALITA,
            faceMovement: true, speakers: ["Tagapagbalita"] },
        ],
        npcs: [
          {
            id: "isko", x: 200, label: "Isko", animation: P.isko, facesPlayer: true,
            dialogueSets: [oneLine("Isko", "Ikaw ang sumilip, Pangulo. Dito lang ako.")],
          },
          {
            // The lookout over the slope: no picture, a body to reach.
            id: "bantayan", x: LOOKOUT_X, label: "Bantayan", scenery: true,
            hiddenByFlag: "a3_putok",
            interactLabel: "Sumilip",
            interactIcon: "i-hand",
            dialogueSets: [],
            onInteract: thePatrol,
          },
        ],
      },
      {
        // Beats 3 to 5, and 11. Act I's street under American guard.
        // 1899 by day: Isko with the letter, Maryam at the shut theatre,
        // four sentries between the theatre and the barbershop, the
        // Mananahi, and strangers in Nanay's house. January 1902 at
        // night: four patrols, and three doors.
        id: "tondo",
        worldWidth: STREET_WIDTH,
        panels: STREET_PANELS,
        panelSky: STREET_SKY,
        startX: ARRIVE_X,
        hintSpots: HINT_SPOTS,
        noRanged: true,
        night: { requiresFlag: "a3_batas", unlessFlag: "a3_nahuli", music: NIGHT },
        guards: [
          ...POSTS.map((g, i) => ({
            type: "sentinela", id: "sentinela-araw-" + (i + 1), shoots: false,
            x: g.beat[1], patrolFrom: g.beat[0], patrolTo: g.beat[1], facing: -1,
            requiresFlag: "a3_lumaban", unlessFlag: "a3_saBarberya",
          })),
          ...POSTS.map((g, i) => ({
            type: "sentinela", id: "sentinela-gabi-" + (i + 1), shoots: false,
            x: g.beat[0], patrolFrom: g.beat[0], patrolTo: g.beat[1], facing: 1,
            requiresFlag: STREET_NIGHT.requiresFlag, unlessFlag: STREET_NIGHT.unlessFlag,
          })),
        ],
        hideSpots: [
          ...POSTS.map((g) => ({ x: g.hide, width: 110,
            requiresFlag: "a3_lumaban", unlessFlag: "a3_saBarberya" })),
          ...POSTS.map((g) => ({ x: g.hide, width: 110,
            requiresFlag: STREET_NIGHT.requiresFlag, unlessFlag: STREET_NIGHT.unlessFlag })),
        ],
        // In route order: the day's run west, then the night's.
        checkpoints: [
          { x: ARRIVE_X, flag: "a3_saTondo" },
          ...reached(DAY_CHECKPOINTS, "a3_araw", "a3_nagbihis"),
          { x: NIGHT_ARRIVE_X, flag: "a3_saGabi" },
          ...reached(DAY_CHECKPOINTS, "a3_gabi", "a3_batas"),
        ],
        exits: [
          { id: "barberya", x: BARBERYA_X, width: 80, label: "Pumasok sa barberya",
            requiresFlag: "a3_nagbihis", unlessFlag: "a3_nagupitan",
            toScene: "barberya", toX: ROOM - 160, toFacing: -1 },
          { id: "barberya-gabi", x: BARBERYA_X, width: 80, label: "Pumasok sa barberya",
            requiresFlag: "a3_naipaalam", unlessFlag: "a3_nahuli",
            toScene: "barberya", toX: ROOM - 160, toFacing: -1 },
        ],
        arrivalDialogues: [
          {
            requiresFlag: "a3_lumaban", unlessFlag: "a3_batas", doneFlag: "a3_saTondo",
            x: ARRIVE_X, facing: -1,
            lines: [
              { speaker: "Macario (sa isip)", text: "Mga Amerikano sa bawat kanto." },
              { speaker: "Macario (sa isip)", text: "Dito ako lumaki. Ngayon, kailangan kong magtago rito." },
            ],
          },
          {
            requiresFlag: "a3_batas", doneFlag: "a3_saGabi",
            x: NIGHT_ARRIVE_X, facing: -1,
            lines: [
              { speaker: "Macario (sa isip)", text: "Tatlong bahay. Tatlong pamilyang naghihintay ng balita." },
              { speaker: "Macario (sa isip)", text: "Bawal na ang humingi. Bawal na ang magtipon. Kaya sa gabi kami magtitipon." },
            ],
          },
        ],
        decorations: [],
        npcs: [
          {
            // Isko, with a letter from Laguna.
            id: "isko", x: ISKO_X, label: "Isko", animation: P.isko, facesPlayer: true,
            hiddenWhile: [{ requiresFlag: "a3_saBarberya" }],
            dialogueSets: [
              oneLine("Isko", "Pangulo... may sulat po. Galing Laguna.", { skipIfFlag: "a3_nabasaAngSulat" }),
              oneLine("Isko", "Mag-ingat kayo, Pangulo. Hihintayin ko kayo.", { requiresFlag: "a3_nabasaAngSulat" }),
            ],
            gift: {
              buttonLabel: "Basahin ang sulat",
              requiresFlag: "a3_saTondo",
              givenFlag: "a3_nabasaAngSulat",
              responseLines: [
                { speaker: "Macario (sa isip)", text: "\"Abril 16, 1899. Majayjay, Laguna.\"" },
                { speaker: "Macario (sa isip)", text: "\"Pumanaw si Ginoong Emilio Jacinto. Malarya ang kumuha sa kanya.\"" },
                { speaker: "Macario (sa isip)", text: "\"Dalawampu't tatlong taong gulang.\"" },
                { speaker: "Macario", text: "..." },
                { speaker: "Macario (sa isip)", text: "\"Hanggang dulo,\" sabi niya." },
                { speaker: "Isko", text: "Pangulo..." },
                { speaker: "Macario", text: "Hindi pa tapos, Isko. Hindi pa." },
              ],
            },
          },
          {
            // Maryam, at the shut theatre: the costume trunk.
            id: "maryam", x: MARYAM_X, label: "Maryam", animation: P.maryam,
            hiddenWhile: [STREET_NIGHT],
            dialogueSets: [
              oneLine("Maryam", "Macario? Buhay ka!", { skipIfFlag: "a3_nabasaAngSulat" }),
              {
                requiresFlag: "a3_nabasaAngSulat",
                skipIfFlag: "a3_nagbihis",
                lines: [
                  { speaker: "Maryam", text: "Macario? ...Ikaw nga!" },
                  { speaker: "Maryam", text: "Tatlong taon. Wala man lang sulat." },
                  { speaker: "Macario", text: "Walang sulat na ligtas, Maryam." },
                  { speaker: "Maryam", text: "Alam ko na ngayon kung sino 'yung dalawang lalaki noon." },
                  { speaker: "Maryam", text: "Sarado na ang entablado. Binabantayan ng mga Amerikano ang bawat dula." },
                  { speaker: "Macario", text: "Kailangan kong makarating sa barberya nang hindi nila ako nakikilala." },
                  { speaker: "Maryam", text: "..." },
                  { speaker: "Maryam", text: "Artista ka, 'di ba?" },
                  { speaker: "Maryam", text: "Nasa akin pa ang baul ng mga damit." },
                  { speaker: "Maryam", text: "Ayan. Magtataho. Walang tumitingin nang dalawang beses sa tindero." },
                  { speaker: "Maryam", text: "Yumuko ka, at huwag kang magmadali. Ang nagmamadali, may itinatago." },
                  { speaker: "Macario", text: "Salamat, Maryam." },
                  { speaker: "Maryam", text: "Huwag kang magpapahuli, ha. Wala na akong ibang kapareha sa entablado." },
                ],
                onComplete: dressed,
              },
              oneLine("Maryam", "Yumuko ka, Macario. Huwag kang magmadali."),
            ],
          },
          {
            // The Mananahi: Nanay waited. Her fate is still unknown.
            id: "mananahi", x: MANANAHI_X, label: "Mananahi", animation: P.mananahi,
            hiddenWhile: [STREET_NIGHT],
            dialogueSets: [
              {
                lines: [
                  { speaker: "Mananahi", text: "Macario? Iho..." },
                  { speaker: "Mananahi", text: "Hinintay ka ng nanay mo. Araw-araw, sa pinto." },
                  { speaker: "Mananahi", text: "Isang umaga, wala na siya. Bukas ang pinto. Walang nakakita." },
                  { speaker: "Macario", text: "..." },
                  { speaker: "Mananahi", text: "Patawarin mo ako. Wala akong nagawa." },
                  // Block 120: the house is on no task's way; she sends him.
                  { speaker: "Mananahi", text: "Iba na ang nakatira sa bahay ninyo. Puntahan mo, kung kaya mo." },
                ],
                skipIfFlag: "a3_kinausapAngMananahi",
                onComplete() { state.flags.a3_kinausapAngMananahi = true; markDirty(); },
              },
              oneLine("Mananahi", "Lampas sa barberya ang bahay ninyo, iho. Mag-ingat ka."),
            ],
          },
          {
            // Strangers in Nanay's house.
            id: "bagong-nakatira", x: HOME_X, label: "Bagong Nakatira", animation: BAGONG_NAKATIRA,
            hiddenWhile: [STREET_NIGHT],
            dialogueSets: [
              {
                lines: [
                  { speaker: "Bagong Nakatira", text: "Sino'ng hinahanap mo?" },
                  { speaker: "Macario", text: "'Yung dating nakatira rito. Isang babae, mag-isa." },
                  { speaker: "Bagong Nakatira", text: "Wala nang tao rito nang lumipat kami. Sira pa ang pinto noon." },
                  { speaker: "Macario", text: "..." },
                  { speaker: "Macario (sa isip)", text: "Babalik po ako, 'Nay. 'Yon ang sabi ko." },
                ],
                skipIfFlag: "a3_nakitaAngBahay",
                onComplete() { state.flags.a3_nakitaAngBahay = true; markDirty(); },
              },
              oneLine("Bagong Nakatira", "Wala na siya rito, ginoo. Pasensya na."),
            ],
          },
          // Three doors, January 1902: no picture, a body to reach.
          ...DOORS_X.map((x, i) => ({
            id: "pinto-" + (i + 1), x, label: "Pinto", scenery: true,
            startsHidden: true, revealedByFlag: "a3_batas", hiddenByFlag: "a3_nahuli",
            // Block 126. Lit until it has been knocked on.
            doorway: { unlessFlag: PINTO_FLAGS[i] },
            interactLabel: "Kumatok",
            interactIcon: "i-hand",
            speakers: ["Tinig sa Loob"],
            dialogueSets: [],
            onInteract: knock(i),
          })),
        ],
      },
      {
        // Beats 6, 7 and 12. The barbershop, one room; its painting is
        // owed. By day the Barbero and an American in the chair; that night
        // the three; in January 1902 the oath broken in on.
        id: "barberya",
        worldWidth: ROOM,
        backdrop: { src: "assets/backgrounds/act3/barberya.jpg" },
        ground: { floor: "kahoy" },
        night: { requiresFlag: "a3_gabiSaBarberya", music: NIGHT },
        noRanged: true,
        startX: ROOM - 160,
        exits: [
          { id: "labas", x: ROOM - 70, width: 70, label: "Lumabas", unlessFlag: "a3_nagupitan",
            toScene: "tondo", toX: BARBERYA_X + 60, toFacing: 1 },
        ],
        scripts: [
          { requiresFlag: "a3_naturo", doneFlag: "a3_balangay", run: theFirstChapter },
          { requiresFlag: "a3_nagupitan", unlessFlag: "a3_balangay", doneFlag: "a3_gabiSaBarberya",
            run: thatNight },
          { requiresFlag: "a3_nagbihis", unlessFlag: "a3_balangay", doneFlag: "a3_saBarberya",
            x: ROOM - 160, facing: -1, run: theBarber },
          { requiresFlag: "a3_nagsimula", doneFlag: "a3_nahuli", run: theRaidOnTheOath },
        ],
        arrivalDialogues: [
          {
            requiresFlag: "a3_naipaalam", doneFlag: "a3_handaNa", x: ROOM - 160, facing: -1,
            lines: [
              { speaker: "Barbero", text: "Nandito na sila. Tatlo, may piring na." },
              { speaker: "Barbero", text: "Ikinandado ko ang pinto. Bilisan mo." },
            ],
          },
        ],
        decorations: [
          { id: "suki", x: SILYA_X + 10, animation: SUKI_AMERIKANO, faceMovement: true,
            hidden: true, speakers: ["Sundalong Amerikano"] },
          { id: "sundalo-likod", x: -100, hidden: true, animation: AMERIKANO, speakers: ["Sundalong Amerikano"] },
          { id: "konstable-pinto", x: ROOM + 60, hidden: true, animation: KONSTABLE, facing: -1,
            speakers: ["Konstable"] },
        ],
        npcs: [
          {
            id: "barbero", x: BARBERO_X, label: "Barbero", animation: P.barbero,
            speakers: ["Barbero (pabulong)"],
            dialogueSets: [
              oneLine("Barbero", "Nandiyan ang silya, Macario. Huwag mo siyang sugatan.", { skipIfFlag: "a3_nagupitan" }),
              oneLine("Barbero", "Ingatan mo sila, Macario.", { requiresFlag: "a3_nagupitan", skipIfFlag: "a3_naipaalam" }),
              oneLine("Barbero", "Ikinandado ko ang pinto. Bilisan mo."),
            ],
          },
          {
            // His chair, for the haircut (cutTheAmerican). Act I's, owed.
            id: "silya", x: SILYA_X, label: "Silya", animation: SILYA, displayHeight: 90,
            hiddenByFlag: "a3_gabiSaBarberya",
            interactLabel: "Gupitin",
            interactIcon: "i-scissors",
            dialogueSets: [],
            onInteract: cutTheAmerican,
          },
          // That night: the three who took the pamphlets in Act I, taught
          // the creed one by one. The precepts
          // are Bonifacio's (Katungkulang Gagawin ng mga Z.LL.B.), in
          // today's spelling.
          {
            id: "mangingisda", x: RECRUITS_X[0], label: "Mangingisda", animation: P.mangingisda,
            startsHidden: true, revealedByFlag: "a3_gabiSaBarberya", hiddenByFlag: "a3_balangay",
            dialogueSets: [oneLine("Mangingisda", "Handa na ako, Pangulo.")],
            gift: teach(0, [
              { speaker: "Mangingisda", text: "Noon, sinunog ko ang polyetong ibinigay mo. Natakot ako." },
              { speaker: "Macario", text: "At ngayon?" },
              { speaker: "Mangingisda", text: "Kinuha ng mga Amerikano ang bangka ko. Wala na akong ikatatakot." },
              { speaker: "Macario", text: "Ito ang unang aral ng Supremo." },
              { speaker: "Macario", text: "\"Ang tunay na pag-ibig sa Diyos ay siya ring pag-ibig sa Tinubuang Lupa, at siya ring pag-ibig sa kapwa.\"" },
            ]),
          },
          {
            id: "tabakera", x: RECRUITS_X[1], label: "Tabakera", animation: P.tabakera,
            startsHidden: true, revealedByFlag: "a3_gabiSaBarberya", hiddenByFlag: "a3_balangay",
            dialogueSets: [oneLine("Tabakera", "Hindi na ako lalayo ngayon.")],
            gift: teach(1, [
              { speaker: "Tabakera", text: "Tatlo ang hinuli sa pagawaan noon. Ako ang hindi lumapit sa'yo." },
              { speaker: "Tabakera", text: "Ngayon, ako na ang lalapit." },
              { speaker: "Macario", text: "\"Ang tunay na kapurihan at kaginhawahan ay ang mamatay sa pagliligtas at pagtatanggol sa Inang Bayan.\"" },
              { speaker: "Tabakera", text: "...Mabigat." },
              { speaker: "Macario", text: "Mabigat talaga." },
            ]),
          },
          {
            id: "karpintero", x: RECRUITS_X[2], label: "Karpintero", animation: P.karpintero,
            startsHidden: true, revealedByFlag: "a3_gabiSaBarberya", hiddenByFlag: "a3_balangay",
            dialogueSets: [oneLine("Karpintero", "Kilala na kita ngayon, Macario.")],
            gift: teach(2, [
              { speaker: "Karpintero", text: "\"Wala akong kilalang Macario,\" sabi ko noon." },
              { speaker: "Karpintero", text: "Patawarin mo ako." },
              { speaker: "Macario", text: "Ito ang huli. \"Magtatagumpay ang lahat ng mabuting nais kung may hinahon, tiyaga, katuwiran at pag-asa.\"" },
              { speaker: "Karpintero", text: "Pag-asa. Matagal ko nang hindi naririnig 'yan." },
            ]),
          },
          // January 1902: three new members, blindfolded.
          ...RECRUITS_X.map((x, i) => ({
            id: "bagong-kasapi-" + (i + 1), x, label: "Bagong Kasapi", animation: P.katipunero.idle,
            startsHidden: true, revealedByFlag: "a3_naipaalam", hiddenByFlag: "a3_nahuli",
            speakers: i === 0 ? ["Mga Bagong Kasapi"] : [],
            dialogueSets: [oneLine("Bagong Kasapi", "Handa na po kami.")],
          })),
          {
            // January 1902: the table where the oath is sworn.
            id: "mesa", x: TABLE_X, label: "Mesa", scenery: true,
            startsHidden: true, revealedByFlag: "a3_naipaalam", hiddenByFlag: "a3_nahuli",
            interactLabel: "Simulan ang panunumpa",
            interactIcon: "i-hand",
            dialogueSets: [],
            onInteract() {
              if (state.flags.a3_nagsimula) return;
              state.flags.a3_nagsimula = true;
              markDirty();
              runSceneScript();
            },
          },
        ],
      },
      {
        // Block 120. A cell in Bilibid, July 1902: Act IV's room (its
        // painting owed, the floor the engine's stone). The amnesty from a
        // guard; the gate at the right edge.
        id: "selda",
        worldWidth: ROOM,
        backdrop: { src: "assets/backgrounds/act4/selda.jpg" },
        ground: { floor: "bato" },
        noRanged: true,
        startX: 300,
        wayOut: "Lumabas sa Bilibid: pumunta sa kanan",
        scripts: [
          { requiresFlag: "a3_nahuli", doneFlag: "a3_saSelda", x: 300, facing: 1, run: theAmnesty },
        ],
        decorations: [
          { id: "bantay", x: ROOM + 60, hidden: true, animation: BANTAY_BILIBID, faceMovement: true,
            speakers: ["Bantay"] },
        ],
        npcs: [
          {
            // The gate: no picture, a body to reach.
            id: "tarangkahan", x: ROOM - 100, label: "Tarangkahan", scenery: true,
            // Block 126. Lit while it is the way out.
            doorway: { requiresFlag: "a3_saSelda", unlessFlag: "a3_pinalaya" },
            interactLabel: "Lumabas",
            interactIcon: "i-out",
            dialogueSets: [],
            onInteract: outOfBilibid,
          },
        ],
      },
      {
        // Beat 8. A town, April 1901: the proclamation on the wall, the
        // men in line before an American officer's table. Its painting is
        // owed.
        id: "bayan",
        worldWidth: ROOM,
        backdrop: { src: "assets/backgrounds/act3/bayan.jpg" },
        noRanged: true,
        startX: 250,
        scripts: [
          { requiresFlag: "a3_nabasaAngProklama", doneFlag: "a3_umalisSiIsko", run: iskoGoesHome },
          { requiresFlag: "a3_balangay", doneFlag: "a3_saBayan", x: 250, facing: 1, run: theTown },
        ],
        decorations: [
          { id: "isko-bayan", x: -120, hidden: true, animation: P.isko, faceMovement: true, speakers: ["Isko"] },
          { id: "opisyal", x: MESA_X + 60, animation: OPISYAL, facing: -1, speakers: ["Opisyal"] },
          { id: "pila-1", x: MESA_X - 240, animation: P.katipunero.idle },
          { id: "pila-2", x: MESA_X - 330, animation: P.katipunero.idle },
        ],
        npcs: [
          {
            // Aguinaldo's proclamation, on the wall.
            id: "proklama", x: 480, label: "Proklama", scenery: true,
            interactLabel: "Basahin",
            interactIcon: "i-hand",
            dialogueSets: [],
            onInteract: readTheProclamation,
          },
        ],
      },
      {
        // Beats 9 and 10. Calle Gunao, Quiapo: a house where the Partido
        // Nacionalista is founded [INSERT: the house]. Its painting is owed.
        id: "calle-gunao",
        worldWidth: ROOM,
        backdrop: { src: "assets/backgrounds/act3/calle-gunao.jpg" },
        ground: { floor: "kahoy" },
        noRanged: true,
        startX: 150,
        scripts: [
          { requiresFlag: "a3_tumanggi", doneFlag: "a3_papuntangTondo", run: noOtherWay },
          { requiresFlag: "a3_pumirma", unlessFlag: "a3_tumanggi", doneFlag: "a3_batas", run: theSeditionLaw },
          { requiresFlag: "a3_umalisSiIsko", doneFlag: "a3_saGunao", x: 150, facing: 1, run: theFounding },
        ],
        decorations: [
          // Poblete, standing at the meeting, and coming in in November.
          { id: "poblete", x: 680, animation: POBLETE, facing: -1, speakers: ["Poblete"] },
          { id: "poblete-pinto", x: ROOM + 80, hidden: true, animation: POBLETE, faceMovement: true },
        ],
        npcs: [
          {
            id: "alvarez", x: 560, label: "Álvarez", animation: ALVAREZ,
            dialogueSets: [
              oneLine("Álvarez", "Kailangan natin ng mga pirma, Kalihim-Heneral.", { skipIfFlag: "a3_pumirma" }),
              oneLine("Álvarez", "Kahit ang paghingi, Sakay. Kahit ang paghingi."),
            ],
          },
          // Two sign; the third, the Guro, means to and then will not,
          // once the law is posted (Block 120).
          {
            id: "manlilimbag", x: 330, label: "Manlilimbag", animation: MANLILIMBAG,
            dialogueSets: [oneLine("Manlilimbag", "Ako na ang maglilimbag nito, Pangulo, kung papayagan nila.")],
            gift: sign(0, [
              { speaker: "Manlilimbag", text: "Pangulo? ...Buhay pa pala tayong dalawa." },
              { speaker: "Manlilimbag", text: "Nakalabas ako noong gabi ng paghuli. Hindi lahat." },
              { speaker: "Macario", text: "Pipirma ka?" },
              { speaker: "Manlilimbag", text: "Ako pa ang maglilimbag ng petisyon, kung papayagan nila." },
            ]),
          },
          {
            id: "direktor", x: 780, label: "Direktor", animation: P.direktor, facesPlayer: true,
            dialogueSets: [oneLine("Direktor", "Matanda na ako para matakot, iho.")],
            gift: sign(1, [
              { speaker: "Direktor", text: "Isinara nila ang entablado ko. Bawal daw ang dulang may watawat." },
              { speaker: "Direktor", text: "Pipirma ako. Matanda na ako para matakot." },
              { speaker: "Macario", text: "Salamat po, Direktor." },
              { speaker: "Direktor", text: "\"Walang bayang mananatiling alipin.\" Sa entablado ko mo 'yan unang sinabi." },
            ]),
          },
          {
            id: "guro", x: 980, label: "Guro", animation: GURO,
            dialogueSets: [
              {
                skipIfFlag: "a3_batas",
                lines: [
                  { speaker: "Guro", text: "Ingles na raw ang ituturo sa mga bata. May mga gurong Amerikanong dumating sa barkong Thomas." },
                  { speaker: "Guro", text: "Sa sariling bayan, dayuhan na ang wika natin." },
                  { speaker: "Guro", text: "Pipirma ako. Bukas, pagkatapos ng klase." },
                ],
              },
              oneLine("Guro", "Patawad, Kalihim-Heneral.", { requiresFlag: "a3_tumanggi" }),
            ],
            gift: {
              buttonLabel: "Papirmahin",
              requiresFlag: "a3_batas",
              givenFlag: "a3_tumanggi",
              responseLines: [
                { speaker: "Guro", text: "Nabasa ko ang nakapaskil, Kalihim-Heneral." },
                { speaker: "Guro", text: "Krimen na raw ang pumirma. May tatlo akong anak." },
                { speaker: "Macario", text: "Hindi kita pipilitin." },
                { speaker: "Guro", text: "...Patawad." },
              ],
              onComplete() { setTimeout(() => runSceneScript(), 0); },
            },
          },
        ],
      },
      {
        // Beats 13 and 14. The camp in the mountains of Morong, 1902.
        // Its painting is owed. Carreón and Montalan; the Republic and its
        // flag; the vow; the Constabulary's attack.
        id: "morong",
        worldWidth: BATTLE_WIDTH,
        backdrop: { src: "assets/backgrounds/act3/morong.jpg" },
        ground: { floor: "damo" },
        dangerous: true,
        startX: 400,
        scripts: [
          { requiresFlag: "a3_republika", doneFlag: "a3_wakas", run: theBandits },
          { requiresFlag: "a3_watawat", doneFlag: "a3_republika", run: theVow },
          // a3_nahuli, not a3_pinalaya (Block 121): every way here today
          // is out of Bilibid, and a save from before Block 120, arrested
          // and already in Morong, still has its welcome.
          { requiresFlag: "a3_nahuli", doneFlag: "a3_saMorong", x: 400, facing: 1, run: theMountains },
        ],
        // Block 120: a lost wave of the last fight starts him by the flag.
        checkpoints: [{ x: FLAG_X - 140, flag: "a3_republika" }],
        pickups: [
          { id: "puso-mr-1", x: 700, type: "heart" },
          { id: "puso-mr-2", x: 1600, type: "heart" },
          { id: "puso-mr-3", x: 2500, type: "heart" },
        ],
        decorations: [
          { id: "batang-kawal", x: -120, hidden: true, animation: P.katipunero.idle,
            walkAnimation: P.katipunero.walk, faceMovement: true, speakers: ["Batang Kawal"] },
          // Block 120. The Republic's soldiers, seen beside its flag (owed).
          ...KAWAL_X.map((x, i) => ({
            id: "kawal-" + (i + 1), x, animation: KAWAL, facing: -1,
            speakers: i === 0 ? ["Mga Kawal"] : [],
          })),
        ],
        npcs: [
          {
            id: "montalan", x: 900, label: "Montalan", animation: MONTALAN,
            dialogueSets: [
              oneLine("Montalan", "Kausapin mo si Carreón. Siya ang marunong sa mga papel.", { skipIfFlag: "a3_itinatag" }),
              oneLine("Montalan", "Hanggang sa paglaya, Pangulo."),
            ],
          },
          {
            // The Republic's flag, raised with E (raiseTheFlag). Owed.
            id: "watawat", x: FLAG_X, label: "Watawat", animation: WATAWAT,
            interactLabel: "Itaas ang watawat",
            interactIcon: "i-hand",
            dialogueSets: [],
            onInteract: raiseTheFlag,
          },
          {
            id: "carreon", x: 1100, label: "Carreón", animation: CARREON,
            dialogueSets: [
              {
                requiresFlag: "a3_saMorong",
                skipIfFlag: "a3_itinatag",
                lines: [
                  { speaker: "Carreón", text: "Kung magtatayo tayo ng pamahalaan, kailangan natin ng saligang batas." },
                  { speaker: "Macario", text: "Mayroon na tayo. Ang mga aral ng Supremo." },
                  { speaker: "Carreón", text: "At ng pangalan." },
                  { speaker: "Macario", text: "Republika ng Katagalugan." },
                  { speaker: "Macario", text: "Hindi ng Amerika. Hindi ng Cavite. Atin." },
                  { speaker: "Carreón", text: "Kung gayon, ikaw ang Pangulo at Heneralisimo. Ako ang Ikalawang Pangulo." },
                  { speaker: "Montalan", text: "At ako ang hahawak sa hukbo." },
                  { speaker: "Carreón", text: "May sarili na rin tayong watawat. Itaas mo, Pangulo." },
                ],
                onComplete() {
                  state.flags.a3_itinatag = true;
                  markDirty();
                  refreshNpcVisibility();
                  showToast("Itaas ang watawat ng Republika.", 3000);
                },
              },
              oneLine("Carreón", "Republika ng Katagalugan. Maganda pakinggan, Pangulo."),
            ],
          },
        ],
      },
    ],
  };
})();
