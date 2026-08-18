// =============================================================
// MACARIO — content/act4.js
//
// ACT IV: The Bitter Harvest
//
// STUB. This file exists so the four-act structure is real in
// code rather than only in the proposal: the act is registered,
// enterable once Act III is complete, and writes its own
// act_progress row. It has no content yet.
//
// Script and dialogue are human work and are tracked separately.
// When they arrive, this file fills in exactly like act1.js does;
// no engine change is needed to bring it to life.
//
// LOAD ORDER: before game.js in index.html, alongside the other
// act content files.
// =============================================================

window.ACT_4 = {
  number: 4,
  title: "The Bitter Harvest",
  titleTagalog: "Ang Mapait na Ani",

  worldWidth: 4400,
  startX: 0,

  // Shown on the act title card. Its presence is what marks an act
  // as unbuilt, so the transition screen can be honest about it
  // rather than dropping the student into a silent empty world.
  developmentNotice:
    "Ang yugtong ito ay kasalukuyang binubuo. Wala pang laman ang mundo.",

  // Empty on purpose. An act with no objectives cannot complete,
  // which is correct: the act cannot be reported as finished until it
  // has content that can actually be finished. A placeholder objective
  // here would either be uncompletable or completable on entry, and
  // the second would be a lie in the dashboard.
  objectives: [],

  startingQuests: [],
  npcs: [],
  decorations: [],
};
