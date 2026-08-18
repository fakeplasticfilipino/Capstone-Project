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
// =============================================================

const ACT1_WORLD_WIDTH = 4400;

window.ACT_1 = {
  number: 1,
  title: "The Awakening",

  worldWidth: ACT1_WORLD_WIDTH,
  startX: 0,

  // Objectives drive act_progress.performance_score. Each maps to a
  // story flag in state.flags. Because flags are already persisted
  // inside save_state, objective progress survives a reload for free
  // rather than needing its own storage.
  objectives: [
    { id: "talk-nanay", label: "Kausapin si Nanay", flag: "hasBuko" },
    { id: "give-buko", label: "Ibigay ang buko sa barbero", flag: "bukoGiven" },
    { id: "perform-stage", label: "Umakyat sa entablado", flag: "deathSequenceDone" },
    { id: "meet-katipunero", label: "Kausapin ang Katipunero", flag: "metKatipunero" },
  ],

  startingQuests: [{ id: "go-to-work", text: "Pumunta sa trabaho" }],

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
              text: "Sumama ka, may naghihintay pang laban.",
            },
          ],
          onComplete: () => {
            // Fourth and final Act I objective. Setting this flag takes
            // the count to 4 of 4, which is what makes checkObjectives()
            // run the post-test, mark the act completed, and put up the
            // transition screen into Act II.
            //
            // This used to call teleportToNewRoom() as well, which
            // stranded the player in an empty room. Ending the act is
            // the controller's job, not the content's; all this file
            // does now is report that the last objective is met.
            state.flags.metKatipunero = true;
            markDirty();
            if (window.Acts) Acts.checkObjectives();
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
};
