// =============================================================
// MACARIO — content/act1.js
//
// Act I is now two scenes and three quests, up from the one-NPC
// skeleton this file was reset to (see git history and TRACKER.md,
// Blocks done, for that reset and why). The story: Nanay sends
// Macario off to the entablado with something to hand to the
// kutsero, a man Macario worked for as a boy; on the way, he finds
// only the kutsero's horse and goes to buy it apples before he can
// go any further. Nothing here resolves the "buy apples" quest yet —
// that is deliberately left open, the same way the rest of Act I was
// left open after the last reset, to be built one verified passage
// at a time rather than guessed at ahead of the source material.
//
// The engine gained two small pieces of support for this scene,
// documented in CLAUDE.md (Act data format, Decisions on record):
// a scene can declare greyFilter to desaturate the shared Tondo
// backdrop rather than needing a second background asset, and
// Acts.gotoScene now fades to black around the scene swap
// (fadeToScene, game.js) instead of cutting instantly.
//
// Nanay has real commissioned art: Assets/Act 1/Nanay.png, a
// 5-column by 3-row sheet, 14 of its 15 cells used. See CLAUDE.md's
// Pitfalls for the quoting fix that was needed in game.js before a
// path with a space in it (this one) would actually render.
//
// contentTop/contentHeight on her animation def say where she actually
// sits within her 256px frame (measured from the art's alpha channel),
// so game.js's spriteFit scales and grounds her by her own drawn height
// rather than the frame's — see game.js, above loadSpriteSheet, and
// CLAUDE.md, Decisions on record, for why that matters: without it she
// and Macario were scaled and grounded by two different amounts of
// empty padding and never matched.
//
// Kabayo (the kutsero's horse) has no art yet: img points at
// Assets/Horse.png, which does not exist on this device, so it falls
// back to the dashed placeholder box naming the file — the same
// fallback every other missing image in this project uses. There is
// nothing to wire in once real art exists; only the file needs to
// land in Assets/.
// =============================================================

window.ACT_1 = {
  number: 1,
  title: "Origins",
  titleTagalog: "Ang Pinagmulan ni Macario",

  // Three objectives for three quests. The first two complete
  // together, in Nanay's onComplete below, since in the story the
  // trip to work starts the moment that conversation ends. The third
  // has no flag anywhere yet — deliberately: nothing in this pass
  // implements buying the apples, so it stays open rather than being
  // marked done for a beat that has not been built. That keeps the
  // act from finishing early: checkObjectives only calls finishAct()
  // once every objective's flag is true, and this one's flag is never
  // set here.
  objectives: [
    { id: "kausapin_nanay", label: "Kausapin si Nanay", flag: "nakausapKayNanay" },
    { id: "pumunta_trabaho", label: "Pumunta sa trabaho", flag: "nasaDaanPatungoSaTrabaho" },
    { id: "bilhan_mansanas", label: "Bilhan ng mansanas ang kabayo", flag: "binilhanNgMansanasAngKabayo" },
  ],

  // Only the first two are known from the start. "Bilhan ng mansanas
  // ang kabayo" is added by Kabayo's own onComplete, in the kutsero
  // scene below, the moment Macario actually meets the horse — a
  // quest log entry for a fact the player does not know yet would be
  // a spoiler for no reason.
  startingQuests: [
    { id: "kausapin_nanay", text: "Kausapin si Nanay" },
    { id: "pumunta_trabaho", text: "Pumunta sa trabaho" },
  ],

  scenes: [
    {
      id: "tondo",
      worldWidth: 1176, // one screen at the tuned --zoom; nothing here needs more room yet
      startX: 80,
      npcs: [
        {
          id: "nanay",
          x: 300,
          label: "Nanay",
          stage: 0,
          animation: {
            src: "Assets/Act 1/Nanay.png", frames: 14, fps: 6, columns: 5,
            contentTop: 45, contentHeight: 166,
          },
          dialogueSets: [
            {
              lines: [
                { speaker: "Nanay", text: "Macario, anak, saan ka pupunta?" },
                { speaker: "Macario", text: "Sa entablado nay, huli na ‘ho ako" },
                { speaker: "Nanay", text: "Paki-bigay nga ito sa kutsero, naaalala mo pa ba siya? Nag-trabaho ka sakaniya dati, ang bata bata mo pa noon…" },
                { speaker: "Macario", text: "Nay, mahuhuli na po a-" },
              ],
              // Cut off mid-sentence, on purpose — Nanay's errand pulls
              // him away before he finishes. The fade and scene change
              // are the rest of the beat, not a separate player action,
              // so both quests complete here rather than waiting on
              // anything else.
              onComplete: () => {
                state.flags.nakausapKayNanay = true;
                state.flags.nasaDaanPatungoSaTrabaho = true;
                completeQuest("kausapin_nanay");
                completeQuest("pumunta_trabaho");
                markDirty();
                if (window.Acts) Acts.gotoScene("kutsero");
              },
            },
            {
              // Holds here on every later visit, same as before. There
              // is currently no way back to this scene once the player
              // has moved on, but the pattern costs nothing to keep.
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

    {
      // Same backdrop as tondo (#skyline is not per-scene art; see
      // CLAUDE.md, Act data format), but greyFilter desaturates it —
      // the trip to the kutsero, cut short before Macario finds him.
      id: "kutsero",
      worldWidth: 1176,
      startX: 80,
      greyFilter: true,
      npcs: [
        {
          id: "kabayo",
          x: 300,
          label: "Kabayo",
          img: "Assets/Horse.png",
          stage: 0,
          dialogueSets: [
            {
              lines: [
                { speaker: "Kabayo", text: "Neighh" },
                { speaker: "Macario", text: "Gutom ka na ba? Saglit lang ha, bili muna akong mansanas" },
              ],
              onComplete: () => {
                addQuest("bilhan_mansanas", "Bilhan ng mansanas ang kabayo");
              },
            },
          ],
        },
      ],
    },
  ],
};
