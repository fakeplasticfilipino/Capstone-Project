// =============================================================
// MACARIO — content/act3.js
//
// ACT III: The Republic in the Shadows
//
// STUB. This file exists so the four-act structure is real in
// code rather than only in the proposal: the act is registered,
// enterable once Act II is complete, and writes its own
// act_progress row. It has no content yet.
//
// Script and dialogue are human work and are tracked separately.
// When they arrive, this file fills in exactly like act1.js does;
// no engine change is needed to bring it to life.
//
// LOAD ORDER: before game.js in index.html, alongside the other
// act content files.
// =============================================================

window.ACT_3 = {
  number: 3,
  title: "The Republic in the Shadows",
  titleTagalog: "Ang Republika sa Lilim",

  worldWidth: 4400,
  startX: 0,

  // Shown on the act title card. Its presence is what marks an act
  // as unbuilt, so the transition screen can be honest about it
  // rather than dropping the student into a silent empty world.
  developmentNotice:
    "Ang yugtong ito ay kasalukuyang binubuo. Wala pang laman ang mundo.",

  // Empty on purpose. An act with no objectives cannot complete,
  // which is correct: Act IV stays locked until Act III has content
  // that can actually be finished. A placeholder objective here
  // would either be uncompletable, blocking progression forever, or
  // completable on entry, which would be a lie in the dashboard.
  objectives: [],

  startingQuests: [],
  npcs: [],
  decorations: [],
};
