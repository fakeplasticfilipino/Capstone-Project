// =============================================================
// MACARIO — content/act1.js
//
// ACT I: TEST STAGE. This is not the story.
//
// The previous contents of this file, the road through Tondo and the
// Spanish outpost, have been deleted. They were placeholder from the
// start and were always going to be rewritten once the mechanics
// stopped moving. The mechanics have now stopped moving, so what sits
// here in the meantime is a proving ground: one room holding exactly
// one example of every system the engine has, plus a bare second room
// to prove that scene transport works.
//
// The old content is in git history if anyone needs to read it. Do
// not restore it. The real Act I is written against the resource
// person's source material and against the ten item pairs in
// db/macario_items_v3.sql, and neither of those is what this file is.
//
// WHAT THIS STAGE DELIBERATELY DOES NOT DO IS TEACH. The item bank
// tests five learning objectives: Sakay's origins, the theatre years,
// the Katipunan and 1894, secrecy, and personal cost. Nothing below
// states any of them. A gain measured against this stage reflects
// prior knowledge and a second look at the questions, and nothing
// else. That is expected until the rewrite lands.
//
// ONE EXAMPLE OF EACH, and no more. If a mechanic ends up represented
// twice here, delete one. The point of this file is that a person can
// walk it in two minutes and see everything the engine can do.
//
// LOAD ORDER: before game.js, which reads window.ACT_1 on startup.
//
// SPRITES. Only Assets/Walk.png and Assets/Cement_Tile.png exist, so
// every character below renders as a labelled placeholder box naming
// the file it wants. That is the fallback system working, and it
// doubles as the shopping list for whoever draws them.
// =============================================================

const TEST_ROOM_WIDTH = 2400;
const TEST_EXIT_WIDTH = 900;

window.ACT_1 = {
  number: 1,
  title: "Test Stage",
  titleTagalog: "Pagsubok na Yugto",

  // Five objectives, one per interaction worth proving. Five is also
  // convenient arithmetic: the currency drip is floor(50 / total), so
  // each one pays exactly 10 barya and a full run pays the completion
  // half of the score in round numbers.
  //
  // Each maps to a flag in state.flags. Flags persist inside
  // save_state, so objective progress survives a reload without any
  // storage of its own.
  objectives: [
    { id: "talk", label: "Kausapin ang Gabay", flag: "nakausapAngGabay" },
    { id: "gift", label: "Ibigay ang pakete", flag: "naibigayAngPakete" },
    { id: "stage", label: "Umakyat sa entablado", flag: "deathSequenceDone" },
    { id: "sneak", label: "Makalusot sa bantay", flag: "nakalusot" },
    { id: "finish", label: "Tapusin ang pagsubok", flag: "natapos" },
  ],

  startingQuests: [{ id: "talk", text: "Kausapin ang Gabay" }],

  scenes: [
    // ===========================================================
    // SCENE 1: the test room
    //
    // Left to right, the room is ordered so each mechanic is met once
    // and in a sensible order: talk, give, perform, sneak, survive,
    // then leave. Walking it end to end is the manual test.
    //
    // Marked dangerous, which is what puts the hearts on screen. A
    // scene also counts as dangerous if it declares a guard or a
    // hazard, and this one declares both, so the flag is redundant
    // here. It is stated anyway, because relying on a derivation to
    // show the health bar is how a scene ends up costing a heart the
    // student never saw coming.
    // ===========================================================
    {
      id: "silid",
      worldWidth: TEST_ROOM_WIDTH,
      startX: 60,
      dangerous: true,

      npcs: [
        {
          // EXAMPLE: dialogue, multiple conversations, and a gift.
          //
          // Two dialogueSets rather than one, because the engine
          // advances one set per conversation and then holds on the
          // last, and that behaviour is invisible with a single set.
          // Talk to the Gabay twice and the second conversation is
          // different.
          id: "gabay",
          x: 320,
          img: "Assets/Gabay.png",
          label: "Gabay",
          stage: 0,
          dialogueSets: [
            {
              lines: [
                { speaker: "Gabay", text: "Pagsubok na yugto ito. Hindi pa ito ang kuwento." },
                { speaker: "Ikaw", text: "Ano ang dapat kong gawin dito?" },
                { speaker: "Gabay", text: "Subukan ang lahat. May isang halimbawa ng bawat bagay." },
                { speaker: "Gabay", text: "May dala kang pakete. Ibigay mo sa akin kapag handa ka na." },
              ],
              onComplete: () => {
                state.flags.nakausapAngGabay = true;
                completeQuest("talk");
                addQuest("gift", "Ibigay ang pakete sa Gabay");
                markDirty();
                if (window.Acts) Acts.checkObjectives();
              },
            },
            {
              // The second conversation. Its only job is to prove that
              // dialogueSets advance, so it is short and says so.
              lines: [
                { speaker: "Gabay", text: "Ibang usapan na ito. Umuusad ang dialogueSets." },
                { speaker: "Gabay", text: "Sunod: ang entablado sa kanan." },
              ],
              onComplete: () => {
                addQuest("stage", "Umakyat sa entablado");
                markDirty();
              },
            },
          ],

          // EXAMPLE: the gift interaction, which is a separate button
          // from E-to-talk. It appears only once requiresFlag is set,
          // so it cannot be used before the first conversation.
          gift: {
            buttonLabel: "Ibigay ang pakete",
            requiresFlag: "nakausapAngGabay",
            givenFlag: "naibigayAngPakete",
            responseLines: [
              { speaker: "Gabay", text: "Natanggap. Gumagana ang gift button." },
            ],
            completesQuest: "gift",
          },
        },

        {
          // EXAMPLE: an NPC that starts hidden and is revealed by a
          // flag, and EXAMPLE: scene transport.
          //
          // Hidden until the stage cutscene finishes. The engine
          // reveals any hidden NPC whose flag is set, both at the
          // moment it is set and when a save is restored, so this one
          // field covers a fresh run and a reload alike.
          id: "tagapagbantay",
          x: 2150,
          img: "Assets/Tagapagbantay.png",
          label: "Tagapagbantay",
          stage: 0,
          startsHidden: true,
          revealedByFlag: "deathSequenceDone",
          dialogueSets: [
            {
              lines: [
                { speaker: "Tagapagbantay", text: "Nakalusot ka sa bantay." },
                { speaker: "Ikaw", text: "Kaunti na lang ang natitira." },
                { speaker: "Tagapagbantay", text: "Dumaan ka sa pinto. Ibang silid iyon." },
              ],
              onComplete: () => {
                state.flags.nakalusot = true;
                completeQuest("sneak");
                addQuest("finish", "Tapusin ang pagsubok sa kabilang silid");
                markDirty();
                if (window.Acts) {
                  Acts.checkObjectives();
                  // The scene change. The act, its objectives and its
                  // act_progress row are all unchanged; only the
                  // location moves, and the new scene id is persisted
                  // in game_progress.current_room.
                  Acts.gotoScene("labasan");
                }
              },
            },
          ],
        },
      ],

      // EXAMPLE: the stage and its cutscene.
      //
      // Walk to the middle of the platform and press E. Two lines, a
      // fade to night, two more lines, the death animation, a
      // blackout, then control returns with the scene permanently
      // night. It is the only thing in the game that locks movement
      // outright, and it is the one place the pause screen refuses to
      // open, because the sequence runs on awaited timers that no flag
      // in the engine can suspend.
      //
      // The flag it sets, deathSequenceDone, is named in game.js
      // rather than here, so the objective above has to match that
      // spelling exactly. Worth knowing before anyone renames it.
      stage: {
        x: 760,
        width: 260,
        rampWidth: 50,
        label: "Entablado",
        poemPart1: [
          { speaker: "Macario", text: "Pagsubok ang eksenang ito." },
          { speaker: "Macario", text: "Titigil ang paggalaw hanggang matapos." },
        ],
        poemPart2: [
          { speaker: "Macario", text: "Magdidilim, at magiging gabi ang paligid." },
          { speaker: "Macario", text: "Pagkatapos, babalik sa iyo ang kontrol." },
        ],
      },

      // EXAMPLE: a hide spot. Standing inside one suppresses detection
      // entirely, which is the counter to the guard below.
      hideSpots: [{ x: 1180, width: 96 }],

      // EXAMPLE: a one-way platform. Passed through from below, landed
      // on from above.
      platforms: [{ x: 1320, y: 150, width: 190 }],

      // EXAMPLE: a heart pickup, placed on the platform so it also
      // proves a pickup can sit somewhere other than the floor.
      // Refused rather than consumed at full health.
      pickups: [{ id: "test-heart", x: 1380, y: 150, type: "heart" }],

      // EXAMPLE: a patrolling guard with a detection meter.
      //
      // One guard, not two. The meter fills while it can see you and
      // drains when it cannot, and a full meter is a catch: back to
      // the start of the scene, one heart gone, and one detection on
      // the record. From behind, with the meter empty, melee is a
      // takedown instead. The thrown spear works at range.
      //
      // Speed is scaled by act number inside the engine, so 1.4 here
      // is 1.4 in play, Act I being the 1.00 multiplier.
      guards: [
        {
          id: "bantay",
          x: 1600,
          patrolFrom: 1450,
          patrolTo: 1850,
          speed: 1.4,
          facing: 1,
          detectRadius: 240,
          alertRate: 0.012,
          decayRate: 0.02,
          img: "Assets/Guard.png",
        },
      ],

      // EXAMPLE: a hazard. One health on contact, then a shove clear
      // of the band rather than a trip back to the entrance. Cleared
      // with a jump.
      hazards: [{ x: 1950, width: 70, reason: "Natusok ka! Pagsubok na hazard." }],

      // EXAMPLE: a decoration. Animated, and not interactable.
      decorations: [
        {
          id: "dekorasyon",
          x: 520,
          animation: { src: "Assets/Dekorasyon.png", frames: 4, fps: 6 },
          displayHeight: 70,
        },
      ],
    },

    // ===========================================================
    // SCENE 2: the exit
    //
    // Deliberately bare. Its whole job is to prove that gotoScene
    // moves the player, that current_room persists across a reload,
    // and that the act can be finished from a scene other than the
    // one it started in.
    //
    // NOT marked dangerous, and holding no guard and no hazard, so
    // the hearts disappear on arrival. That contrast is itself part
    // of the test: a safe room should not show a health bar.
    // ===========================================================
    {
      id: "labasan",
      worldWidth: TEST_EXIT_WIDTH,
      startX: 60,

      npcs: [
        {
          id: "kasama",
          x: 700,
          img: "Assets/Kasama.png",
          label: "Kasama",
          stage: 0,
          dialogueSets: [
            {
              lines: [
                { speaker: "Kasama", text: "Ito na ang huling bahagi ng pagsubok." },
                { speaker: "Kasama", text: "Pagkatapos nito: ang post-test, ang feedback, at ang susunod na yugto." },
              ],
              onComplete: () => {
                // The fifth objective, which takes the count to 5 of 5.
                // That is what runs the post-test, writes the
                // completion, offers the feedback form and puts up the
                // transition screen.
                state.flags.natapos = true;
                completeQuest("finish");
                markDirty();
                if (window.Acts) Acts.checkObjectives();
              },
            },
          ],
        },
      ],

      decorations: [],
    },
  ],
};
