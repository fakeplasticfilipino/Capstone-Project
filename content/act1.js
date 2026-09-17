// =============================================================
// MACARIO — content/act1.js
//
// Act I is now two scenes and three quests, up from the one-NPC
// skeleton this file was reset to (see git history and TRACKER.md,
// Blocks done, for that reset and why). The story: Nanay sends
// Macario off to the entablado with something to hand to the
// kutsero, a man Macario worked for as a boy; on the way, he finds
// only the kutsero's horse and goes to buy it apples before he can
// go any further.
//
// The kutsero scene now plays out in full: Kabayo (hungry) sends
// Macario looking for money, Kutsero gives him barya and points him
// at Tindero, a hazard sits on the road between them, and Tindero's
// stall — at the far edge of the now-wider map — sells the one apple
// this quest needs. Bringing it back to Kabayo, at the gift button,
// completes the quest and fades back to tondo, ending the memory.
//
// The whole kutsero scene is a flashback, not the story's present —
// it plays out grey (greyFilter) precisely because it is memory, not
// now — so finishing it must not finish Act I: Macario is back in the
// story's present, still on his way to the entablado, not done with
// the act. A fourth objective, pumunta_entablado, exists for exactly
// this: nothing in this file ever sets its flag, which is what keeps
// checkObjectives from seeing all objectives done and ending Act I
// the moment the flashback resolves — the same deliberate trick Block
// 19 used to keep Act I from finishing two objectives early. Kabayo's
// gift adds it as an open quest on the way back to tondo, so the
// player's log reflects the same thing the objective counter does:
// there is still somewhere to go. Whatever scene depicts arriving at
// the entablado is the next piece of content this act needs; nothing
// here builds it yet.
//
// Block 31 added the conversations around the memory. Nanay's opening
// now starts with his money ("yung pera mo"). The memory opens with her
// voice the moment its fade-in ends, and closing it puts Macario back
// beside her for her reply before he sets off. Both are a scene's
// arrivalDialogues (CLAUDE.md, Act data format). Past her, further down
// a road that is now twice as long, the Mananahi waits with his stage
// costume.
//
// Block 32 made that a quest and the first equipment. Nanay's opening
// was rewritten so she hands him his money (200 barya) and brings up
// the kutsero before the memory cuts in; the return ends with her
// reminding him to see the Mananahi, which logs "Kausapin ang
// mananahi"; and talking to the Mananahi completes it and opens her
// shop, which sells the stage clothes (content/items.js) for 100.
//
// The engine gained the pieces of support this needed, documented in
// CLAUDE.md (Act data format, Decisions on record):
//   - a scene can declare greyFilter to desaturate the shared Tondo
//     backdrop rather than needing a second background asset
//   - Acts.gotoScene fades to black around a scene swap (fadeToScene,
//     game.js) instead of cutting instantly
//   - an NPC can declare opensShop: true to skip dialogue and open
//     Tindahan directly (Tindero, below)
//   - an NPC's gift can declare onComplete, the same shape a
//     dialogueSet's already has, for a gift that should do something
//     beyond setting its flag and its quest (Kabayo's, below, ends
//     the scene)
//   - an item can declare buyFlag, a story flag set in state.flags
//     the moment it is bought (content/items.js, "Mansanas para sa
//     kabayo"), since
//     Kabayo's gift button has no way to ask Inventory.owns()
//     directly
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
// empty padding and never matched. footX, measured the same way, is
// where her feet are across the cell, which is the point game.js
// stands on the middle of her body (CLAUDE.md, Bodies, Block 24).
//
// Kutsero, Kabayo and Tindero have real art in Assets/Act 1/ (Block 33
// sorted out a Kutsero and Tindero mix-up in the file names). The
// Mananahi has none yet and draws as the dashed placeholder box naming
// her file.
// =============================================================

window.ACT_1 = {
  number: 1,
  title: "Origins",
  titleTagalog: "Ang Pinagmulan ni Macario",

  // Five objectives since Block 32, which added kausapin_mananahi. The
  // first two complete together, in Nanay's
  // onComplete below, since in the story the trip to work starts the
  // moment that conversation ends. The third has a real ending: giving
  // Kabayo the apple (his gift, binilhanNgMansanasAngKabayo) sets it —
  // that is the flashback resolving, not the act. The fourth,
  // pumunta_entablado, is the one that actually closes Act I, and
  // nothing in this file sets its flag yet: see the header above for
  // why that is deliberate.
  objectives: [
    { id: "kausapin_nanay", label: "Kausapin si Nanay", flag: "nakausapKayNanay" },
    { id: "pumunta_trabaho", label: "Pumunta sa trabaho", flag: "nasaDaanPatungoSaTrabaho" },
    { id: "bilhan_mansanas", label: "Bilhan ng mansanas ang kabayo", flag: "binilhanNgMansanasAngKabayo" },
    // Block 32. Given by Nanay when Macario is back from the memory, and
    // done when the conversation with the Mananahi ends. Buying the
    // clothes is not required to finish it: the act should not be locked
    // behind a purchase (CLAUDE.md, the no-game-over rule).
    { id: "kausapin_mananahi", label: "Kausapin ang mananahi", flag: "nakausapAngMananahi" },
    { id: "pumunta_entablado", label: "Pumunta sa entablado", flag: "nasaEntablado" },
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
      // Widened in Block 31 from one screen (1176) to hold the road the
      // Mananahi stands on, the same width the kutsero scene already has.
      worldWidth: 2150,
      startX: 80,
      // Block 31. The moment the flashback ends, back in the present,
      // Macario is standing with his mother and she answers the memory.
      // requiresFlag is the apple given to Kabayo, which is what sends
      // him back here; doneFlag keeps it to that one return.
      arrivalDialogues: [
        {
          requiresFlag: "binilhanNgMansanasAngKabayo",
          doneFlag: "nakabalikMulaSaAlaala",
          x: 210, // Nanay's body starts at 300, so a 50px gap, facing her
          facing: 1,
          lines: [
            { speaker: "Macario", text: "Naaalala mo pa pala yon ma?" },
            { speaker: "Nanay", text: "Abay siyempre, matanda ako pero hindi ako ulyanin!" },
            { speaker: "Nanay", text: "... Saan ka nga ulit pupunta?" },
            { speaker: "Macario", text: "Hahaha" },
            { speaker: "Macario", text: "Kailangan ko ng pumuntang trabaho ma, hinihintay na ako ng mga kapwa kong artista" },
            { speaker: "Nanay", text: "Okay sige, mag ingat ka ha!" },
            // Block 32. The errand to the tailor, and the quest it gives.
            { speaker: "Nanay", text: "Wag mo kalimutang dumaan sa mananahi para sa kadamitan mo" },
            { speaker: "Macario", text: "Opo nay" },
          ],
          onComplete: () => {
            addQuest("kausapin_mananahi", "Kausapin ang mananahi");
            markDirty();
          },
        },
      ],
      npcs: [
        {
          id: "nanay",
          x: 300,
          label: "Nanay",
          stage: 0,
          animation: {
            src: "Assets/Act 1/Nanay.png", frames: 14, fps: 6, columns: 5,
            contentTop: 45, contentHeight: 166, footX: 127,
          },
          dialogueSets: [
            {
              // Once the trip to work has started, this beat has happened
              // and she moves on to her second set, including after the
              // flashback returns Macario here (game.js, startDialogue).
              skipIfFlag: "nasaDaanPatungoSaTrabaho",
              lines: [
                // Block 32 script. She hands over his money (200 barya,
                // paid in onComplete), mentions the kutsero, and the memory
                // cuts him off.
                { speaker: "Nanay", text: "Macario anak, yung pera mo." },
                { speaker: "Macario", text: "Salamat Nay." },
                { speaker: "Nanay", text: "Hinahanap ka nung kutsero na naghatid sakin dito, kamusta ka na raw." },
                { speaker: "Macario", text: "Nay, mauuna na ako, medyo huli na ako sa trabaho eh" },
                { speaker: "Nanay", text: "Naaalala mo ba nung nagtrabaho ka sakaniya?" },
                { speaker: "Macario", text: "Nay, huli na 'ho ak-" },
              ],
              // Cut off mid-sentence, on purpose — Nanay's errand pulls
              // him away before he finishes. The fade and scene change
              // are the rest of the beat, not a separate player action,
              // so both quests complete here rather than waiting on
              // anything else.
              //
              // firstTime guards the scene change only, not the flags or
              // the quest log: buildNpcs() resets every NPC's stage to 0
              // on every scene load (see game.js), which is exactly what
              // lets this same dialogueSet play again if the player ever
              // returns to tondo — Kabayo's gift now sends them back here
              // once the memory ends. Without the guard, walking up to
              // Nanay a second time would fade back into the kutsero
              // scene all over again; with it, she just repeats herself,
              // same as any other NPC with nothing new to say.
              onComplete: () => {
                const firstTime = !state.flags.nasaDaanPatungoSaTrabaho;
                state.flags.nakausapKayNanay = true;
                state.flags.nasaDaanPatungoSaTrabaho = true;
                completeQuest("kausapin_nanay");
                completeQuest("pumunta_trabaho");
                // "yung pera mo": his money, 200 barya, once. It is what
                // pays the Mananahi's 100 later, and the firstTime guard
                // is what stops a second visit paying it again.
                if (firstTime && window.Game) Game.addCurrency(200);
                markDirty();
                if (firstTime && window.Acts) Acts.gotoScene("kutsero");
              },
            },
            {
              // Holds here on every later visit, same as before.
              lines: [
                { speaker: "Nanay", text: "Mag-ingat ka lagi, anak." },
                { speaker: "Macario", text: "Opo, Nanay." },
              ],
              onComplete: () => {},
            },
          ],
        },

        {
          // Block 31. Down the road toward the entablado, met only after
          // the flashback: before it, Macario has not yet been sent on his
          // way, and asking after a stage costume would come out of
          // order. Hidden until the apple is given to Kabayo, which is set
          // before the fade back to this scene, so buildNpcs already draws
          // her when tondo is rebuilt (and on any reload after).
          //
          // Assets/Act 1/Mananahi.png does not exist yet, so she is the
          // dashed placeholder box naming that file. If the art arrives as
          // a sprite sheet rather than a single picture, img becomes an
          // animation def measured with _dev/measure-sprite.js.
          //
          // Block 32. The first conversation completes the tailor quest and
          // ends straight into her shop (opensShopAfter), which stocks only
          // what names her as soldBy in content/items.js: the stage clothes,
          // 100 barya. After that, E opens the shop directly.
          id: "mananahi",
          x: 1500,
          label: "Mananahi",
          img: "Assets/Act 1/Mananahi.png",
          startsHidden: true,
          revealedByFlag: "binilhanNgMansanasAngKabayo",
          opensShopAfter: "nakausapAngMananahi",
          stage: 0,
          dialogueSets: [
            {
              onComplete: () => {
                state.flags.nakausapAngMananahi = true;
                completeQuest("kausapin_mananahi");
                markDirty();
              },
              lines: [
                { speaker: "Mana", text: "Oh, kamusta ka na Macario? Ang laki laki mo na" },
                { speaker: "Macario", text: "Ayos lang naman, ito, buhay pa din" },
                { speaker: "Mana", text: "Magpagupit ka na! Nagmumukha ka ng dalaga" },
                { speaker: "Macario", text: "Hahaha, saka na, malay natin ganahan ako" },
                { speaker: "Macario", text: "Andiyan na ba yung damit ko para sa entablado?" },
                { speaker: "Mana", text: "Oo, pero bayad muna hehe..." },
              ],
            },
          ],
        },
      ],
    },

    {
      // Same backdrop as tondo (#skyline is not per-scene art; see
      // CLAUDE.md, Act data format), but greyFilter desaturates it —
      // the trip to the kutsero, playing out as a memory. Wider than
      // tondo: it now holds four points of interest end to end rather
      // than one.
      id: "kutsero",
      worldWidth: 2150,
      startX: 80,
      greyFilter: true,
      // Block 31. Nanay's voice carries into the memory, opening it the
      // moment the fade-in ends. Once only, so a later visit (none today)
      // would not replay it.
      arrivalDialogues: [
        {
          doneFlag: "nagsimulaAngAlaala",
          lines: [
            { speaker: "Nanay", text: "Ilang taon ka nga noon?..." },
          ],
        },
      ],
      hazards: [
        // Between Kutsero and Tindero, not before Kutsero — the errand
        // itself is safe, the road to the stall is not. Declaring this
        // is also what makes the scene "dangerous" and shows the
        // hearts; see CLAUDE.md, Act data format.
        { x: 1300, width: 100, reason: "Natapakan mo ang bubog!" },
      ],
      npcs: [
        {
          id: "kabayo",
          x: 300,
          label: "Kabayo",
          // Real art (Block 30): a single strip of 22 frames, 32px cells,
          // a grazing loop that starts and ends with his head up. Measured
          // with _dev/measure-sprite.js. It warns that the grazing frames
          // are shorter than the union; that is his head going down, not
          // a mis-scaled pose, so the union pair is the right one: it
          // keeps his raised ears inside the box. He is drawn facing left,
          // toward Macario, who enters from the left of this scene.
          // At DISPLAY_HEIGHT a 32px cell is scaled about four and a half
          // times, which is what switches bodySprite to pixelated scaling.
          animation: {
            src: "Assets/Act 1/Horse.png", frames: 22, fps: 8,
            contentTop: 2, contentHeight: 30, footX: 19,
          },
          // Loops while Macario is within talking range and fades out
          // when he leaves (game.js, updateNearSounds).
          nearSound: "Assets/Act 1/Horse.mp3",
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
          // The gift button appears the moment "Mansanas para sa kabayo" is bought
          // (Inventory buy() sets buyFlag — see content/items.js) and
          // stays until it is used. onComplete runs after the flag and
          // the quest are both set, same order endDialogue already
          // uses for a plain dialogueSet, and is what actually ends
          // the memory: without it, the flag alone would finish Act I
          // in the background while the player was still standing next
          // to Kabayo in a greyed-out scene.
          gift: {
            buttonLabel: "Ibigay ang Mansanas",
            requiresFlag: "binilhAngMansanas",
            givenFlag: "binilhanNgMansanasAngKabayo",
            responseLines: [
              { speaker: "Macario", text: "Heto, kumain ka na." },
              { speaker: "Kabayo", text: "Neighh!" },
            ],
            completesQuest: "bilhan_mansanas",
            // The flashback resolving, not the act. "Mansanas para sa
            // kabayo" is a quest item (content/items.js, Block 25), and
            // this is the moment it is handed over, Inventory.consume.
            // It is a different item from the Mansanas a student can
            // eat, so eating apples can never use this one up. Then
            // addQuest for the entablado errand Nanay actually sent him
            // on, still open (its objective's flag is not set anywhere,
            // see the header), and back to the story's present.
            onComplete: () => {
              if (window.Inventory) Inventory.consume("mansanas-kabayo");
              addQuest("pumunta_entablado", "Pumunta sa entablado");
              if (window.Acts) Acts.gotoScene("tondo");
            },
          },
        },

        {
          id: "kutsero",
          x: 750,
          label: "Kutsero",
          // Real art. Block 27 wired in a sheet that turned out to be the
          // Tindero, saved under this name by mistake; Block 33 has the
          // real kutsero (straw hat, sash): a 5 by 3 sheet, 12 of its 15
          // cells used, measured with _dev/measure-sprite.js. Front-facing,
          // so no facing to get wrong from either side.
          animation: {
            src: "Assets/Act 1/Kutsero.png", frames: 12, fps: 6, columns: 5,
            contentTop: 74, contentHeight: 117, footX: 128,
          },
          stage: 0,
          dialogueSets: [
            {
              lines: [
                { speaker: "Macario", text: "Kutsero, pahingi akong barya, bili lang akong mansanas" },
                { speaker: "Kutsero", text: "O eto Macario, yung malaking mansanas dun sa Tindero sa may dulo." },
              ],
              // +10 barya, straight through the currency facade
              // (Game.addCurrency) — the same call acts.js uses to pay
              // out objectives, just triggered from a conversation
              // instead. Guarded on window.Game the way every other
              // content onComplete guards on window.Acts.
              onComplete: () => {
                if (window.Game) Game.addCurrency(10);
              },
            },
            {
              // Holds here on later visits so the barya is not paid out
              // twice — see Nanay's dialogueSets for the same pattern
              // and why it matters (buildNpcs resets stage on load, but
              // not mid-visit, so this only ever matters within one
              // stay in the scene, which is the only time it needs to).
              lines: [
                { speaker: "Kutsero", text: "Nasa iyo na ang barya. Pumunta ka na sa Tindero, nasa dulo ng daan." },
              ],
              onComplete: () => {},
            },
          ],
        },

        {
          // "Pressing E simply opens up Tindahan" — no dialogue at all,
          // so no dialogueSets: opensShop is checked before dialogueSets
          // would ever be read (see game.js, handleInteractPress and
          // the interact-label branch). Placed at the far edge of the
          // widened map.
          id: "tindero",
          x: 1950,
          label: "Tindero",
          // Block 33. The sheet Block 27 shipped as Kutsero.png, renamed by
          // the artist to what it always was: 5 by 3, 14 of 15 cells, the
          // same numbers it was measured with then (remeasured, unchanged).
          animation: {
            src: "Assets/Act 1/Tindero.png", frames: 14, fps: 6, columns: 5,
            contentTop: 69, contentHeight: 121, footX: 128,
          },
          opensShop: true,
        },
      ],
    },
  ],
};
