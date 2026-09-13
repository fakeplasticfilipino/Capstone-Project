// =============================================================
// MACARIO — content/act1.js
//
// BLANK SLATE, ON PURPOSE. This is a deliberate reset, not a draft
// left unfinished. The narrative-complete version that used to live
// here (two scenes, five objectives, a stage cutscene, a guard
// corridor, three other NPCs) is preserved in git history and in
// TRACKER.md's Blocks done, and _dev/test.js keeps a private copy of
// its gameplay skeleton (guard, hazard, hideSpot, platform, pickup)
// so the engine mechanics that content exercised stay fully tested
// even though nothing here uses them right now. See CLAUDE.md,
// Decisions on record, for why: the resource person's source
// material had not been read into that version, and starting over
// from a real placeholder base was chosen over layering more content
// on a narrative built ahead of the source.
//
// WHAT'S HERE. One scene, one NPC, one exchange: Macario and Nanay,
// carrying the same two LO1 facts (Tondo, mananahi at barbero) the
// item bank in db/macario_items_v3.sql already commits to as correct
// answers. Nothing else — no stage, no guard, no second scene, no
// other NPC — is declared yet. The engine still supports all of it;
// it is simply not present in this file until the next pass adds it
// back deliberately, against the source material rather than ahead
// of it.
//
// Nanay has real commissioned art: Assets/Act 1/Nanay.png, a
// 5-column by 3-row sheet, 14 of its 15 cells used. See CLAUDE.md's
// Pitfalls for the quoting fix that was needed in game.js before a
// path with a space in it (this one) would actually render.
// =============================================================

window.ACT_1 = {
  number: 1,
  title: "Origins",
  titleTagalog: "Ang Pinagmulan ni Macario",

  // One objective for the one beat that exists. checkObjectives() pays
  // floor(50 / 1) = 50 barya on it, and the remaining 50 lands on
  // Acts.complete() same as any other act — nothing here needed to
  // change for the drip math to still hold together at N = 1.
  objectives: [
    { id: "pinagmulan", label: "Alamin ang pinagmulan", flag: "nalamanAngPinagmulan" },
  ],

  startingQuests: [{ id: "pinagmulan", text: "Kausapin ang nanay" }],

  scenes: [
    {
      id: "tondo",
      worldWidth: 1176, // one screen at the tuned --zoom; nothing here needs more room yet
      startX: 80,
      npcs: [
        {
          // LO1, both pairs: Tondo and "mananahi at barbero", both
          // said in plain terms rather than implied.
          id: "nanay",
          x: 300,
          label: "Nanay",
          stage: 0,
          animation: { src: "Assets/Act 1/Nanay.png", frames: 14, fps: 6, columns: 5 },
          dialogueSets: [
            {
              lines: [
                { speaker: "Nanay", text: "Macario, anak, kumusta ang trabaho mo ngayon?" },
                { speaker: "Macario", text: "Mabuti naman, Nanay. Mananahi at barbero pa rin ako, dito rin sa Tondo." },
                { speaker: "Nanay", text: "Karaniwang trabaho lang ito, pero iyan ang nagbibigay sa atin ng makakain." },
              ],
              onComplete: () => {
                state.flags.nalamanAngPinagmulan = true;
                completeQuest("pinagmulan");
                markDirty();
                if (window.Acts) Acts.checkObjectives();
              },
            },
            {
              // Holds here on every later visit. Short, and not tied
              // to any objective — the first conversation already
              // did that, and there is nowhere else to send the
              // player yet.
              lines: [
                { speaker: "Nanay", text: "Mag-ingat ka lagi, anak." },
                { speaker: "Macario", text: "Opo, Nanay." },
              ],
              onComplete: () => {},
            },
          ],
        },
      ],
    },
  ],
};
