// =============================================================
// MACARIO — content/act1.js
//
// ACT I: The Awakening
//
// This file holds Act I as pure DATA. It contains no engine logic.
// game.js knows how to render a world, run dialogue, and animate
// sprites; it does not know what is in any particular act. That
// separation is what lets Acts II through IV exist as their own
// files without touching the engine.
//
// LOAD ORDER: this file must be included BEFORE game.js in
// index.html, since game.js reads window.ACT_1 on startup.
//
// The onComplete callbacks below reference globals defined in
// game.js (state, addQuest, markDirty) and in acts.js (Acts). That
// is safe even though this file loads first, because the callbacks
// are not invoked until the player actually finishes that
// conversation.
//
// SCENES
// Act I has two locations. The road through Tondo, which is the
// original world, and the outpost, reached after the Katipunero.
// Scenes hold everything that used to sit on the act itself, so
// the engine builds one at a time and the act only decides which.
// =============================================================

const ACT1_WORLD_WIDTH = 4400;
const KUTA_WORLD_WIDTH = 2600;

window.ACT_1 = {
  number: 1,
  title: "The Awakening",
  titleTagalog: "Ang Paggising",

  // Objectives drive act_progress.performance_score. Each maps to a
  // story flag in state.flags. Because flags are already persisted
  // inside save_state, objective progress survives a reload for free
  // rather than needing its own storage.
  //
  // The fifth was added with the outpost. Students already partway
  // through Act I are unaffected: their existing flags carry over and
  // the new objective is simply not yet met.
  objectives: [
    { id: "talk-nanay", label: "Kausapin si Nanay", flag: "hasBuko" },
    { id: "give-buko", label: "Ibigay ang buko sa barbero", flag: "bukoGiven" },
    { id: "perform-stage", label: "Umakyat sa entablado", flag: "deathSequenceDone" },
    { id: "meet-katipunero", label: "Kausapin ang Katipunero", flag: "metKatipunero" },
    { id: "deliver-message", label: "Ihatid ang mensahe", flag: "messageDelivered" },
  ],

  startingQuests: [{ id: "go-to-work", text: "Pumunta sa trabaho" }],

  scenes: [
    // ===========================================================
    // SCENE 1: the road through Tondo
    // ===========================================================
    {
      id: "road",
      worldWidth: ACT1_WORLD_WIDTH,
      startX: 0,

      // -----------------------------------------------------------
      // NPCs
      //
      // Positions (x) run left to right along the road.
      // Each NPC has one or more dialogueSets: the first conversation
      // uses set 0, the next uses set 1, and so on, staying on the
      // last set thereafter. A set may define onComplete(), which runs
      // once, at the moment that conversation ends.
      // -----------------------------------------------------------
      npcs: [
        {
          id: "nanay",
          x: 700,
          animation: { src: "Assets/Nanay.png", frames: 7, fps: 6 },
          label: "Nanay Sakay",
          stage: 0,
          dialogueSets: [
            {
              lines: [
                { speaker: "Nanay Sakay", text: "Kamusta trabaho nak?" },
                { speaker: "Ikaw", text: "Late na ko 'ma" },
                {
                  speaker: "Nanay Sakay",
                  text: "Paki-bigay itong buko sa barbero, nanghihingi siya kahapon",
                },
                { speaker: "Ikaw", text: "Sige Inay, ingat ka" },
              ],
              onComplete: () => {
                state.flags.hasBuko = true;
                addQuest("give-buko", "Ibigay ang buko sa barbero");
              },
            },
          ],
        },
        {
          id: "stablehand",
          x: 1100,
          animation: { src: "Assets/Stablehand.png", frames: 14, fps: 6 },
          label: "Stablehand",
          stage: 0,
          dialogueSets: [
            {
              lines: [
                { speaker: "Stablehand", text: "Magandang umaga Macario" },
                {
                  speaker: "Ikaw",
                  text: "Magandang umaga kaibigan, kamusta ang mga kabayo?",
                },
                { speaker: "Stablehand", text: "Ayos lang, hinahanap ka na" },
                { speaker: "Kabayo", text: "*neigh*" },
                { speaker: "Ikaw", text: "*Hinaplos ni Macario*" },
                { speaker: "Stablehand", text: "Sige na una na ko, mag ingat kayo!" },
              ],
            },
          ],
        },
        {
          id: "tailor",
          x: 1900,
          img: "Assets/Tailor.png",
          label: "Tailor",
          stage: 0,
          dialogueSets: [
            {
              lines: [
                { speaker: "Tailor", text: "Macario toy, Macario!" },
                {
                  speaker: "Tailor",
                  text: "Hinahanap ka na ng mga suki ko, magta-trabaho ka ulit?",
                },
                {
                  speaker: "Ikaw",
                  text: "Di na muna kuya, masaya na ko sa trabaho ko",
                },
              ],
            },
          ],
        },
        {
          id: "barber",
          x: 2700,
          img: "Assets/Barber.jpg",
          label: "Barber",
          stage: 0,
          dialogueSets: [
            {
              lines: [
                {
                  speaker: "Barber",
                  text: "Papagupit ka ba Sakay? Haba na ng buhok mo!",
                },
                { speaker: "Ikaw", text: "Hahaha, sa susunod" },
                { speaker: "Barber", text: "Balak mo ba mag-trabaho ulit dito?" },
                {
                  speaker: "Ikaw",
                  text: "Hindi eh, maya na lang late na ko sa trabaho!",
                },
                { speaker: "Barber", text: "Ingat ka Bingkul" },
              ],
            },
          ],
          // A giveable-item interaction, separate from normal E-to-talk.
          gift: {
            buttonLabel: "Ibigay ang buko",
            requiresFlag: "hasBuko",
            givenFlag: "bukoGiven",
            responseLines: [
              {
                speaker: "Barber",
                text: "Maraming salamat Sakay, ingat ka paakyat ng entablado",
              },
            ],
            completesQuest: "give-buko",
          },
        },
        {
          // Waits at the far edge of the map. Stays hidden until the
          // stage performance finishes, then appears.
          // NOTE: placeholder dialogue, replace with final lines.
          id: "katipunan",
          x: ACT1_WORLD_WIDTH - 300,
          animation: { src: "Assets/Katipunan.png", frames: 11, fps: 6 },
          label: "Katipunero",
          stage: 0,
          startsHidden: true,
          // Set by the stage cutscene. The engine reveals any hidden NPC
          // whose flag is set, both when the beat fires and when a save
          // is restored, so this one field covers both cases.
          revealedByFlag: "deathSequenceDone",
          dialogueSets: [
            {
              lines: [
                { speaker: "Katipunero", text: "Kasama, dumating ka rin." },
                { speaker: "Ikaw", text: "Handa na ako." },
                {
                  speaker: "Katipunero",
                  text: "May kuta ang mga Espanyol sa likod ng gubat.",
                },
                {
                  speaker: "Katipunero",
                  text: "Ihatid mo itong mensahe sa kasama natin doon. Huwag kang magpapahuli.",
                },
              ],
              onComplete: () => {
                // Fourth objective. This no longer ends the act: the
                // outpost is the fifth objective and it runs before the
                // post-test, so ending here would close Act I early.
                state.flags.metKatipunero = true;
                markDirty();
                if (window.Acts) {
                  Acts.checkObjectives();
                  Acts.gotoScene("kuta");
                }
                addQuest("deliver-message", "Ihatid ang mensahe sa kasama");
              },
            },
          ],
        },
      ],

      // -----------------------------------------------------------
      // The stage (entablado)
      //
      // Walking to the middle of the platform and pressing E starts the
      // performance: two lines of the poem, a fade to night, two more
      // lines, the death animation, a blackout, then control returns
      // with the scene permanently night.
      //
      // NOTE: placeholder poetry. Replace with final text or a verified
      // historical quotation.
      // -----------------------------------------------------------
      stage: {
        x: 3900,
        width: 260,
        rampWidth: 50,
        label: "Entablado",
        poemPart1: [
          { speaker: "Macario", text: "Hindi ako magnanakaw, hindi ako tulisan." },
          {
            speaker: "Macario",
            text: "Ipinaglaban ko lamang ang bayan kong sinilangan.",
          },
        ],
        poemPart2: [
          {
            speaker: "Macario",
            text: "Kung ito ang wakas, tanggap ko nang buong puso.",
          },
          { speaker: "Macario", text: "Mabuhay ang Pilipinas, mabuhay ang bayan ko." },
        ],
      },

      // -----------------------------------------------------------
      // Decorations: animated, but not interactable.
      // -----------------------------------------------------------
      decorations: [
        {
          id: "horse",
          x: 1220, // just right of the Stablehand at x 1100
          animation: { src: "Assets/Horse.png", frames: 22, fps: 10 },
          displayHeight: 70, // taller than people, since horses are
        },
      ],
    },

    // ===========================================================
    // SCENE 2: the Spanish outpost
    //
    // The stealth section. Two patrolling guards between Macario and
    // the kasama waiting at the far end. Crates suppress detection and
    // can be jumped onto; platforms give the jump somewhere to go.
    //
    // Marked dangerous, which is what puts the hearts on screen.
    //
    // Tuning notes for whoever balances this later: detectRadius is
    // generous on purpose because there is no line of sight test, so a
    // guard "sees" through crates unless the player is inside one.
    // alertRate is what actually sets the difficulty; the radius mostly
    // sets how far ahead the player can read the threat.
    // ===========================================================
    {
      id: "kuta",
      worldWidth: KUTA_WORLD_WIDTH,
      startX: 60,
      dangerous: true,

      guards: [
        {
          id: "bantay-1",
          x: 900,
          patrolFrom: 700,
          patrolTo: 1200,
          speed: 1.4,
          facing: 1,
          detectRadius: 260,
          alertRate: 0.012,
          decayRate: 0.02,
          img: "Assets/Guard.png",
        },
        {
          id: "bantay-2",
          x: 1800,
          patrolFrom: 1620,
          patrolTo: 2060,
          speed: 1.1,
          facing: -1,
          detectRadius: 240,
          alertRate: 0.01,
          decayRate: 0.02,
          img: "Assets/Guard.png",
        },
      ],

      // Standing inside one of these suppresses detection entirely.
      hideSpots: [
        { x: 620, width: 96 },
        { x: 1380, width: 96 },
        { x: 1960, width: 96 },
      ],

      // One-way: jumped up through from below, landed on from above.
      platforms: [
        { x: 1040, y: 150, width: 190 },
        { x: 1500, y: 190, width: 170 },
      ],

      npcs: [
        {
          id: "kasama",
          x: KUTA_WORLD_WIDTH - 150,
          img: "Assets/Kasama.png",
          label: "Kasama",
          stage: 0,
          dialogueSets: [
            {
              lines: [
                { speaker: "Kasama", text: "Nakalusot ka! Akala ko nahuli ka na." },
                { speaker: "Ikaw", text: "Narito ang mensahe mula sa Katipunan." },
                {
                  speaker: "Kasama",
                  text: "Salamat, kapatid. Malalaman na nila ang oras ng paggalaw.",
                },
                {
                  speaker: "Kasama",
                  text: "Umalis ka na bago magpalit ng bantay.",
                },
              ],
              onComplete: () => {
                // Fifth and final Act I objective. This takes the count
                // to 5 of 5, which is what runs the post-test and puts up
                // the transition into Act II.
                state.flags.messageDelivered = true;
                completeQuest("deliver-message");
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
