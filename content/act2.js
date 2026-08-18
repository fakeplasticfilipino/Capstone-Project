// =============================================================
// MACARIO — content/act2.js
//
// ACT II: The Long Shadow of War
//
// STUB. This file exists so the four-act structure is real in
// code rather than only in the proposal: the act is registered,
// enterable once Act I is complete, and writes its own
// act_progress row. It has no content yet.
//
// Script and dialogue are human work and are tracked separately.
// When they arrive, this file fills in exactly like act1.js does;
// no engine change is needed to bring it to life.
//
// LOAD ORDER: before game.js in index.html, alongside the other
// act content files.
// =============================================================

window.ACT_2 = {
  number: 2,
  title: "The Long Shadow of War",
  titleTagalog: "Ang Mahabang Anino ng Digmaan",

  worldWidth: 4400,
  startX: 0,

  // Shown on the act title card. Its presence is what marks an act
  // as unbuilt, so the transition screen can be honest about it
  // rather than dropping the student into a silent empty world.
  developmentNotice:
    "Ang yugtong ito ay kasalukuyang binubuo. Wala pang laman ang mundo.",

  // Empty on purpose. An act with no objectives cannot complete,
  // which is correct: Act III stays locked until Act II has content
  // that can actually be finished. A placeholder objective here
  // would either be uncompletable, blocking progression forever, or
  // completable on entry, which would be a lie in the dashboard.
  objectives: [],

  startingQuests: [],
  npcs: [],
  decorations: [],
};
