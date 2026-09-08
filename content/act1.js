// =============================================================
// MACARIO — content/act1.js
//
// ACT I: the real story. This replaces the test stage wholesale.
// The old file was one room proving every engine system with
// placeholder dialogue about buko and errands. It taught none of
// the five learning objectives the item bank in
// db/macario_items_v3.sql tests. This one is written directly
// against those ten item pairs: every line of player-facing fact
// below exists because a correct answer in that file requires the
// student to have seen it.
//
// SOURCING. Every historical fact stated below — Tondo, the tailor
// and barber trade, the moro-moro, 1894, the Katipunan's aim of
// independence through revolution rather than reform, why it had
// to stay secret, the danger to a messenger, and that its members
// were ordinary workers — is stated because db/macario_items_v3.sql
// already commits to it as the correct answer to a validated item.
// Nothing here goes further than that: no other date, no other
// named person, no invented incident. The connective tissue between
// beats (a director noticing his stage presence, a recruiter naming
// the year) is ordinary scene-setting for a game, not a claim about
// what is documented. If the resource person's source material has
// more to say, later passages sharpen or replace these beats; they
// do not need to invent new ones to hit the ten items.
//
// STRUCTURE. Two scenes, five objectives, matching the checkpoint:
// a student who knew nothing at the pre-test should be able to
// answer every post-test item from something this file showed them.
//
//   Scene "tondo"   safe. Origins, trade, the theatre performance,
//                   and the recruitment into the Katipunan.
//   Scene "misyon"  dangerous. The first task as a Katipunero: get
//                   a message past a patrol without being caught,
//                   then the personal cost of what he just did.
//
// Five objectives keeps the currency drip unchanged from the test
// stage: floor(50 / 5) = 10 barya each, so nothing in acts.js or
// the award math needed to move.
//
// deathSequenceDone is not this file's name to choose. game.js sets
// it directly when the stage cutscene's death animation finishes,
// so the "entablado" objective below has to use that exact string
// or it will never be marked done.
//
// The hidden-NPC pattern (startsHidden + revealedByFlag) the test
// stage used is deliberately not reused here. The engine only calls
// revealNpcsByFlag() after that same death sequence and on save
// restore, so it only ever works when the flag in question IS
// deathSequenceDone. A courier contact "hidden until you cross the
// guard" would need a flag nothing re-checks. The guard corridor
// itself is what makes reaching that NPC hard; hiding them behind a
// flag would add nothing.
//
// SPRITES. The four NPCs, the guard, the two decorations and the
// Tondo day/night skyline now have placeholder art — flat silhouette
// pieces, Claude-drawn, meant to be replaced rather than kept. They
// exist so the scene reads as a place instead of a field of dashed
// boxes; they are not a substitute for the commissioned art on
// TRACKER's Blocked-on-other-people list, which still names what's
// actually missing. Guards render ONLY through the animation path —
// buildGuards() in game.js never attempts to load a static guard.img
// at all, it shows the placeholder box unconditionally in that
// branch — so Guwardiya.png below is declared as animation, not img,
// or the art would sit in Assets/ and never be seen.
// =============================================================

// A phone in landscape shows 1176 world pixels across at --zoom 0.7.
// Both scenes below are sized as multiples of that rather than as
// raw pixels, so they read the same way on the device they were
// tuned for.
const TONDO_WIDTH = Math.round(1176 * 2);      // 2 screens, 2352
const MISYON_WIDTH = Math.round(1176 * 2.5);   // 2.5 screens, 2940

window.ACT_1 = {
  number: 1,
  title: "Origins",
  titleTagalog: "Ang Pinagmulan ni Macario",

  // Each objective's flag is checked against state.flags by
  // Acts.checkObjectives(), which also runs the currency drip. Five
  // objectives, so each one pays 10 barya on the way to the 50 the
  // completion half of the score is worth.
  objectives: [
    { id: "pinagmulan", label: "Alamin ang pinagmulan", flag: "nalamanAngPinagmulan" },
    { id: "entablado", label: "Umarte sa entablado", flag: "deathSequenceDone" },
    { id: "katipunan", label: "Sumapi sa Katipunan", flag: "sumapiSaKatipunan" },
    { id: "mensahe", label: "Ihatid ang lihim na mensahe", flag: "naihatidAngMensahe" },
    { id: "pag-alis", label: "Magpaalam sa dating buhay", flag: "nagpaalam" },
  ],

  startingQuests: [{ id: "pinagmulan", text: "Kausapin ang kapitbahay" }],

  scenes: [
    // ===========================================================
    // SCENE 1: Tondo
    //
    // Safe — no guard, no hazard, so the hearts stay off screen.
    // Three beats, left to right: who Sakay is and what he does for
    // a living (LO1), the moro-moro he performs in and what it
    // trained in him (LO2), and the recruitment that puts him in
    // the Katipunan in 1894 with a stated aim and a stated reason
    // for secrecy (LO3, and the setup for LO4). The last beat sends
    // the player to scene "misyon" with a task already assigned.
    // ===========================================================
    {
      id: "tondo",
      worldWidth: TONDO_WIDTH,
      startX: 80,
      npcs: [
        {
          // LO1, both pairs. The correct answers in the item bank
          // are Tondo and "mananahi at barbero"; both are said in
          // plain terms here rather than implied.
          id: "kapitbahay",
          x: 300,
          img: "Assets/Kapitbahay.png",
          label: "Kapitbahay",
          stage: 0,
          dialogueSets: [
            {
              lines: [
                { speaker: "Kapitbahay", text: "Kumusta, Macario! Dito ka pa rin nananahi, dito sa Tondo?" },
                { speaker: "Macario", text: "Oo, dito pa rin. Mananahi at barbero ako, tulad ng dati." },
                { speaker: "Kapitbahay", text: "Karaniwang trabaho lang, pero sapat na para mabuhay dito sa atin." },
                { speaker: "Kapitbahay", text: "Mamayang gabi may pagtatanghal sa entablado. Aakyat ka pa rin, di ba?" },
                { speaker: "Macario", text: "Oo. Pupunta ako roon mamaya." },
              ],
              onComplete: () => {
                state.flags.nalamanAngPinagmulan = true;
                completeQuest("pinagmulan");
                addQuest("entablado", "Pumunta sa entablado");
                markDirty();
                if (window.Acts) Acts.checkObjectives();
              },
            },
            {
              // Holds here on every later visit. Short, and not tied
              // to any objective — the first conversation already
              // did that.
              lines: [
                { speaker: "Kapitbahay", text: "Doon sa entablado, sa may tabi ng kalye. Hindi mo mamimintasan." },
                { speaker: "Macario", text: "Aalis na ako. Baka mahuli ako sa simula." },
              ],
              onComplete: () => {},
            },
          ],
        },

        {
          // LO2 pair 4. Meeting this NPC only makes sense placed
          // after the stage, so it sits past it rather than being
          // gated on deathSequenceDone — a player who somehow
          // reaches this NPC before performing just hears the same
          // lines a beat early, which costs nothing.
          id: "direktor",
          x: 1300,
          img: "Assets/Direktor.png",
          label: "Direktor ng Dulaan",
          stage: 0,
          dialogueSets: [
            {
              lines: [
                { speaker: "Direktor", text: "Napanood kita sa entablado. Magaling kang umarte sa moro-moro." },
                { speaker: "Macario", text: "Sanay na ako. Malimit akong gumanap sa mga dulang tulad niyan." },
                { speaker: "Direktor", text: "Ang husay mong magsalita nang harapan sa napakaraming tao ay hindi karaniwan." },
                { speaker: "Direktor", text: "Balang-araw, magagamit mo pa iyan — hindi lang sa entablado." },
                { speaker: "Macario", text: "Sa entablado lang naman ako natututong magsalita nang ganito." },
                { speaker: "Direktor", text: "May bulong-bulungan ngayon tungkol sa isang lihim na kapisanan. Baka may maghanap sa iyo." },
              ],
              onComplete: () => {
                completeQuest("entablado");
                addQuest("katipunan", "Kausapin ang naghihintay na tao sa dulo ng kalye");
                markDirty();
                if (window.Acts) Acts.checkObjectives();
              },
            },
          ],
        },

        {
          // LO3, both pairs, and the setup for LO4 pair 7. The year
          // is stated as the scene's present ("ngayong taong 1894")
          // and Macario's own line ("Sasapi ako") is what ties the
          // date to him joining, rather than only to the recruiter
          // having joined at some point.
          id: "kasapi",
          x: 2100,
          img: "Assets/Kasapi.png",
          label: "Kasapi ng Katipunan",
          stage: 0,
          dialogueSets: [
            {
              lines: [
                { speaker: "Kasapi", text: "Ikaw si Macario Sakay? May nagsabing makikita kita rito." },
                { speaker: "Macario", text: "Ako nga. Bakit mo ako hinahanap?" },
                { speaker: "Kasapi", text: "Ngayong taong 1894, kami sa Katipunan ay naghahanap ng mga taong may tapang." },
                { speaker: "Kasapi", text: "Lihim na samahan ito. Layunin naming makamit ang ganap na kalayaan ng Pilipinas sa pamamagitan ng himagsikan — hindi lamang reporma." },
                { speaker: "Macario", text: "Sasapi ako. Ano ang dapat kong malaman?" },
                { speaker: "Kasapi", text: "Ipinagbabawal ito ng mga awtoridad. Ang sinumang mahuli ay parurusahan, kaya dapat itago ang lahat — mga miyembro, mga pulong, lahat." },
                { speaker: "Kasapi", text: "Bilang simula, dalhin mo itong mensahe sa isang kasama sa kabilang lansangan. Huwag hayaang makita ka ng mga bantay." },
              ],
              onComplete: () => {
                state.flags.sumapiSaKatipunan = true;
                completeQuest("katipunan");
                addQuest("mensahe", "Ihatid ang lihim na mensahe nang hindi nahuhuli");
                markDirty();
                if (window.Acts) {
                  Acts.checkObjectives();
                  Acts.gotoScene("misyon");
                }
              },
            },
          ],
        },
      ],

      // The stage and its cutscene carry LO2 pair 3: this is a
      // moro-moro, stated in the lines themselves rather than only
      // in the surrounding dialogue, so the fact stands even if a
      // student never re-talks to the director.
      stage: {
        x: 900,
        width: 260,
        rampWidth: 50,
        label: "Entablado",
        poemPart1: [
          { speaker: "Macario", text: "Ito na ang eksena ko sa moro-moro ngayong gabi." },
          { speaker: "Macario", text: "Kailangan kong ipakita ang tapang ng tauhang ginagampanan ko." },
        ],
        poemPart2: [
          { speaker: "Macario", text: "Dito nagtatapos ang labanan sa dula — 'namamatay' ang tauhan ko sa entablado." },
          { speaker: "Macario", text: "Pagtatanghal lamang ito. Ngunit sa totoong buhay, may hihintay pa sa akin." },
        ],
      },

      decorations: [
        {
          id: "palengke",
          x: 550,
          animation: { src: "Assets/Palengke.png", frames: 4, fps: 6 },
          displayHeight: 70,
        },
      ],
    },

    // ===========================================================
    // SCENE 2: Misyon
    //
    // Dangerous — a guard, a hazard, a hide spot and a platform,
    // the same mechanics the test stage exercised, now carrying the
    // stakes LO4 pair 8 states in words: a courier caught here does
    // not just cost Macario a heart, it exposes the whole movement.
    // The contact at the far end is the destination the corridor
    // makes hard to reach; nothing about them needs to be hidden.
    // ===========================================================
    {
      id: "misyon",
      worldWidth: MISYON_WIDTH,
      startX: 80,
      dangerous: true,

      npcs: [
        {
          // LO4 pair 8 on the first conversation, LO5 pairs 9 and
          // 10 on the second. Both pairs land on the same NPC
          // because both keyed answers are one fact each about the
          // same two people: what Macario gave up, and that this
          // contact — like him — is an ordinary worker.
          id: "kasama-katipunero",
          x: 2750,
          img: "Assets/KasamangKatipunero.png",
          label: "Kasamang Katipunero",
          stage: 0,
          dialogueSets: [
            {
              lines: [
                { speaker: "Kasamang Katipunero", text: "Ikaw ba ang ipinadala? Nasa iyo ba ang mensahe?" },
                { speaker: "Macario", text: "Oo, narito. Hindi ako napansin ng mga bantay." },
                { speaker: "Kasamang Katipunero", text: "Mabuti. Kung nahuli ka sana, malalaman ng mga Kastila ang buong kilusan — hindi lang tayong dalawa." },
                { speaker: "Kasamang Katipunero", text: "Kaya kami, mga tagapaghatid, ay laging tago. Kami ang nagdadala ng balita nang hindi nabubunyag ang kilusan." },
              ],
              onComplete: () => {
                state.flags.naihatidAngMensahe = true;
                completeQuest("mensahe");
                addQuest("pag-alis", "Makipag-usap muli bago umalis");
                markDirty();
                if (window.Acts) Acts.checkObjectives();
              },
            },
            {
              lines: [
                { speaker: "Kasamang Katipunero", text: "Kilala rin kita noon — ikaw ang mananahi sa palengke, hindi ba?" },
                { speaker: "Macario", text: "Oo. Pero iniwan ko na ang aking pagtahi at pag-ahit para dito." },
                { speaker: "Kasamang Katipunero", text: "Marami sa amin ay ganoon din. Mga karaniwang manggagawa lamang — mananahi, barbero, magsasaka." },
                { speaker: "Macario", text: "Kung ganoon, hindi lang ilang tao ang kikilos — ang buong bayan." },
                { speaker: "Kasamang Katipunero", text: "Iyan ang tunay na lakas ng Katipunan." },
              ],
              onComplete: () => {
                state.flags.nagpaalam = true;
                completeQuest("pag-alis");
                markDirty();
                if (window.Acts) Acts.checkObjectives();
              },
            },
          ],
        },
      ],

      // A route over the corridor rather than through it, and a
      // heart on it — the same pairing the test stage used, kept
      // because it still teaches the jump somewhere safe before the
      // guard below is reached.
      platforms: [{ x: 650, y: 150, width: 220 }],
      pickups: [{ id: "misyon-puso", x: 730, y: 150, type: "heart" }],

      // Patrol width 800 (two thirds of a screen) and detection
      // radius 300 (about a quarter) are the test stage's tuned
      // numbers, carried over unchanged — they were already fitted
      // to this 1176 pixel camera and nothing here changes the
      // reason they were chosen. The hide spot sits inside the
      // patrol rather than before it, so it is cover you have to
      // reach while being hunted rather than scenery.
      //
      // animation, not img — see the SPRITES note at the top of this
      // file. img is accepted by the act data format but buildGuards()
      // has no code path that ever loads it; a guard is either
      // animated or a placeholder box, nothing in between.
      guards: [
        {
          id: "guwardiya",
          x: 1800,
          patrolFrom: 1400,
          patrolTo: 2200,
          speed: 1.4,
          facing: 1,
          detectRadius: 300,
          alertRate: 0.01,
          decayRate: 0.02,
          animation: { src: "Assets/Guwardiya.png", frames: 4, fps: 4 },
        },
      ],
      hideSpots: [{ x: 1650, width: 110 }],

      // Past the patrol, its own stretch, so it reads as its own
      // problem rather than piling onto the guard.
      hazards: [{ x: 2500, width: 90, reason: "Nakita ka sandali ng bantay sa daan!" }],

      decorations: [
        {
          id: "poste",
          x: 300,
          animation: { src: "Assets/Poste.png", frames: 4, fps: 6 },
          displayHeight: 70,
        },
      ],
    },
  ],
};
