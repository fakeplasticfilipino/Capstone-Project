// =============================================================
// MACARIO — game.js
//
// Blocks applied:
//   Block 1   role routing (teachers redirect to teacher.html)
//   Block 2.1 Act I content extracted to content/act1.js
//   Block 2.2 world building wrapped in loadAct() / unloadAct()
//   Block 2.4 act transition replaces the empty-room ending
//   Block 2.5 resume into the act recorded in game_progress
//   Block 6   scenes, jump, health, stealth, combat
//   Block 7   pause state and the shell facade
//
// game.js is now the ENGINE only. It knows how to render a world,
// run dialogue, and animate sprites. It does not know what is in
// any particular act. Act content lives in content/actN.js.
//
// REQUIRES: content/act1.js must load BEFORE this file.
// =============================================================

const world = document.getElementById("world");
const viewport = document.getElementById("viewport");

// Block 36. The camera needs the viewport's width every frame, and reading
// it back from the layout after the frame's own writes forced the browser
// to lay the whole world out again, every frame, to answer. It changes
// only when the window or the phone's orientation does, so it is measured
// then and remembered.
let viewportWidth = 0;

function measureViewport() {
  viewportWidth = viewport.clientWidth || viewportWidth;
  return viewportWidth;
}

window.addEventListener("resize", () => {
  measureViewport();
});
window.addEventListener("orientationchange", () => {
  setTimeout(measureViewport, 200); // after the browser has settled the new size
});
const player = document.getElementById("player");

const dialogueBox = document.getElementById("dialogue-box");
const dialogueSpeaker = document.getElementById("dialogue-speaker");
const dialogueText = document.getElementById("dialogue-text");

const btnLeft = document.getElementById("btn-left");
const btnRight = document.getElementById("btn-right");
const btnInteract = document.getElementById("btn-interact");

// Every button in the game is now an icon plus a label, so writing a
// button's text means writing the label SPAN rather than the button.
// This one runs every frame on #btn-interact, and setting textContent
// there wiped the icon on the first frame after the screen was drawn.
//
// A button that carries an icon but no span gets one built for it
// rather than being written over. That case is a mistake in the
// markup, and the old fallback of writing the button directly turned
// it into an icon that vanished the first time the label changed --
// which is exactly what happened to the quiz button, whose label has
// never been in index.html. A button with no icon at all is written
// directly, which is the honest fallback.
function setLabel(el, text) {
  if (!el) return;
  let span = el.querySelector(".lbl");
  if (!span && el.querySelector(".ico")) {
    span = document.createElement("span");
    span.className = "lbl";
    el.appendChild(span);
  }
  const target = span || el;
  // Only when it actually changes (Block 36). The game loop writes the
  // interact button every frame, and writing the same word back still
  // dirties the element, which cost a style recalculation and a layout
  // sixty times a second on a phone that has neither to spare.
  if (target.textContent === text) return;
  target.textContent = text;
}

// Points an existing button's icon at a different symbol. Used where
// one button means two things depending on the screen, such as the
// quiz button, which is an arrow on every question but the last and a
// tick on that one.
function setIcon(el, symbolId) {
  if (!el || !symbolId) return;
  const use = el.querySelector(".ico use");
  if (use) use.setAttribute("href", "#" + symbolId);
}

// Builds one for a button that is created in JavaScript rather than
// declared in index.html. SVG elements need the namespace; created
// with createElement they parse as unknown HTML and draw nothing,
// which is a blank square rather than an error.
function makeIcon(symbolId) {
  const NS = "http://www.w3.org/2000/svg";
  const box = document.createElement("span");
  box.className = "ico";
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("aria-hidden", "true");
  const use = document.createElementNS(NS, "use");
  use.setAttribute("href", "#" + symbolId);
  svg.appendChild(use);
  box.appendChild(svg);
  return box;
}
const mobileControls = document.getElementById("mobile-controls");
const btnPause = document.getElementById("btn-pause");
// Shop and inventory buttons added in Block 13. They ride the same
// visibility branch as btnPause below, further gated on window.Inventory
// so they never appear if that module fails to load. Since Block 25
// they are the only way into either screen from play.
const btnInventoryMain = document.getElementById("btn-inventory");
const btnShopMain = document.getElementById("btn-shop");

const questListEl = document.getElementById("quest-list");
const giftBtn = document.getElementById("gift-btn");

// --- Bodies ----------------------------------------------------------------
// Every character in the world is a BODY first and a picture second. A
// body is a box on the ground: its left edge is the character's x (posX
// for Macario, npc.x for an NPC, guard.pos for a guard) and its width is
// one of the constants below. Every rule that asks "is he touching it"
// reads the body and nothing else, and every sprite is drawn so that the
// feet of the character in the art stand on the centre of that body (see
// bodySprite, above loadSpriteSheet). The picture follows the body; the
// body never follows the picture.
//
// This replaced a model in which the logic box and the picture only
// shared a left edge. The picture is a whole sprite-sheet CELL scaled up
// (over 300px wide for the idle sheet) with the character drawn in the
// middle of it, so Macario's drawn feet stood roughly 140px to the right
// of the 40px box every collision actually used. A hazard therefore hurt
// him when he was drawn well past it and never when he was drawn standing
// on it, and a thrown spear, an NPC's reach and a guard's catch were all
// measured from a point on screen where nobody was standing. Patching
// each consumer with its own offset (Blocks 22 and 23 did that for the
// throw) could not converge, because there was no single place where the
// picture and the body were made to agree. There is now.
//
// Two rules, used consistently, are the whole collision model:
//   harm is by OVERLAP: any part of the body inside a hazard band hurts.
//   support and cover are by CENTRE: a platform holds him and a hide spot
//   hides him while the middle of his body is over it, so standing half
//   off a ledge or half out of a crate behaves the way it looks.
const PLAYER_WIDTH = 40;
const SPEED = 5;
const INTERACT_DISTANCE = 90;
// An NPC's body is wider than Macario's on purpose. It is only ever used
// for reach (findNearby's edgeGap), never for harm, and a generous box is
// what makes talking to someone forgiving on a touch screen. Exact
// per-NPC widths are not tracked in content and do not need to be.
const NPC_WIDTH = 80;
// A guard's body is the same size as Macario's: guards catch, get hit and
// get taken down, which are the same kind of contact his body has.
const GUARD_WIDTH = PLAYER_WIDTH;
// Block 38. Read by buildGuards, which loadAct can reach at parse time, so
// they sit up here rather than with the rest of the hostile-guard numbers
// (the temporal dead zone pitfall in CLAUDE.md).
const GUARD_HP = 2;
const GUARD_CHASE_SPEED = 2.6; // per 60fps frame; SPEED is 5
// Block 35. A fighting enemy has the same body as a guard, for the same
// reason: it hits, gets hit and gets knocked back like Macario does.
const ENEMY_WIDTH = PLAYER_WIDTH;
const PLATFORM_HEIGHT = 40; // must match #stage-platform's CSS height
const GROUND_LEVEL = 60; // must match --ground-level in style.css
const DISPLAY_HEIGHT = 134; // shared sprite height (player + animated NPCs)

// --- Physics -------------------------------------------------------------
// Tuned per 60fps frame, then scaled by the real frame delta in the loop.
// The target device is a low-end Android phone that will not hold 60fps,
// and a frame-counted jump would reach half its height at 30fps.
const GRAVITY = 0.8;
const JUMP_VELOCITY = 14;
const TERMINAL_VELOCITY = -22; // clamp the descent so a long fall stays readable

// --- Health --------------------------------------------------------------
// The floor, before equipment. Everything that reads a maximum reads
// maxHealth, which an accessory can raise; this constant is only ever
// the starting point that setEffects adds a bonus to.
const BASE_MAX_HEALTH = 3;
let maxHealth = BASE_MAX_HEALTH;
const INVULN_MS = 1000;

// --- Equipment effects ---------------------------------------------------
// Plain numbers, handed in by inventory.js through Game.setEffects. The
// engine never learns that an item exists: it is told a maximum health
// bonus and a projectile speed multiplier, and applies them. That is what
// keeps equipment out of this file the way acts are.
//
// Declared here rather than beside the other mutable state further down,
// because loadAct() runs at parse time and reaches into the HUD, and
// anything it can touch has to be initialised above it.
let equipEffects = { maxHealthBonus: 0, projectileSpeedMult: 1, stillDetectionMult: 1 };

// Block 32. Whether Macario is standing still on the ground this frame,
// set by the game loop just before guards are updated, and read by
// detection for stillDetectionMult. Declared up here beside the effects
// it serves, for the same parse-time reason.
let playerStill = true;

// The little hop that comes with a hazard shove. Without being moved
// clear the player is left standing in the band, the invulnerability
// lapses, and all three hearts go while they are holding still.
const HAZARD_RECOIL_VELOCITY = 7;

// --- Pickups -------------------------------------------------------------
// Drawn at PICKUP_SIZE square. PICKUP_REACH is generous on both axes
// because the target device is a phone and a pixel-exact collectible on a
// 412px screen is a collectible nobody collects.
const PICKUP_SIZE = 22;
const PICKUP_REACH = 46;

// --- Difficulty ----------------------------------------------------------
// Guard speed scaled by act number, and nothing else. One lever moves the
// whole curve: speed sets the detection window, the cost of a mistimed
// run, and how much ground a patrol covers. A system with more knobs
// would need tuning data this project will never collect.
//
// alertRate is deliberately NOT scaled. It is the per-guard lever the
// content uses to make one sentry harder than the one beside it, and
// scaling both would make the two indistinguishable.
//
//   Act I 1.00   Act II 1.15   Act III 1.30   Act IV 1.45
//
// The ceiling matters. Act I's faster guard is 1.4, which reaches 2.03 in
// Act IV against a player SPEED of 5. Scaled guard speed must stay well
// under SPEED or a corridor stops being solvable by running, which is the
// one route a struggling student reliably finds.
const DIFFICULTY_STEP = 0.15;

function difficultyMultiplier(actNumber) {
  const n = Number(actNumber) || 1;
  return 1 + (n - 1) * DIFFICULTY_STEP;
}

// There is no game over. Reaching zero returns Macario to the start of the
// scene at full health. A fail state that ejects a Grade 8 student from the
// lesson serves nobody, and being caught already costs them the walk back.

// Bump this whenever ANY file in assets/ is replaced.
//
// The v=N strings in index.html only cover scripts and stylesheets.
// Images had no version at all, so browsers and the GitHub Pages CDN
// kept serving stale sprites indefinitely after a file was swapped.
// Every image load goes through assetUrl() so one number refreshes them all.
const ASSET_VERSION = 21;

function assetUrl(path) {
  if (!path) return path;
  return path + (path.includes("?") ? "&" : "?") + "v=" + ASSET_VERSION;
}

// --- Game state ----------------------------------------------------------
const state = {
  flags: {}, // arbitrary story flags, named by whatever content is loaded
};

// --- Quest system ----------------------------------------------------------
const quests = []; // { id, text, done }
let saveDirty = false;
let saveDebounceTimer = null;

// Saves are refused until the login sequence has finished resolving
// which act the student is in.
//
// loadAct() runs once at parse time to draw the backdrop behind the
// login box, and it adds that act's starting quests, which calls
// markDirty(). The resulting debounced save would then fire partway
// through login, while Acts.current is still its initial 1, and
// write current_act = 1 over a student who was in Act III. The
// slower the connection, the more reliably it happened, which is the
// wrong way round for a phone on school wifi.
let saveReady = false;

function addQuest(id, text) {
  if (quests.some((q) => q.id === id)) return;
  quests.push({ id, text, done: false });
  renderQuests();
  markDirty();
}

function completeQuest(id) {
  const q = quests.find((q) => q.id === id);
  if (q) q.done = true;
  renderQuests();
  markDirty();
}

// Block 37. Rewrites a logged quest's line, for a task that counts
// ("Ipamahagi ang mga polyeto (1/3)"). Does nothing for a quest not
// logged, so content cannot add one by accident through here.
function setQuestText(id, text) {
  const q = quests.find((q) => q.id === id);
  if (!q || q.text === text) return;
  q.text = text;
  renderQuests();
  markDirty();
}

// Emptied on an act change. The log is the tasks of the act in hand,
// not a permanent record of every act.
function clearQuests() {
  quests.length = 0;
  renderQuests();
  markDirty();
}

// =============================================================
// THE QUEST LOG (Block 48; Block 57)
//
// The log on screen is "Gawain": what to do now, and nothing else. The
// tasks already done are not on the world's screen at all since Block
// 57: they are listed in the settings panel (shell.js, reading
// Game.doneQuests), at the proponent's direction, so the corner of the
// screen a student glances at never grows with history.
//
// An act that declares linearObjectives drives the log from its
// objectives instead of from addQuest calls scattered through content.
// Its objectives are one chain, in the order the story plays them; the
// current task is the first whose flag is not set, and everything
// before it is done. That rule is also applied to the flags themselves
// (syncObjectiveChain): a set flag marks every earlier step done, so a
// save from before a step existed, or a step passed some other way,
// never leaves the chain stuck on something already behind the student,
// and the act can still complete. The quests array is rebuilt from the
// chain, so everything that reads it (a shop item that waits on a quest
// with forQuest, the guide's questOpen) sees the current step as the
// one open quest.
//
// An objective may declare countFlags, and its line then ends with the
// count of those set, "(3/10)", worked out here rather than rewritten
// by content.
//
// Acts without linearObjectives keep the old behaviour: addQuest,
// completeQuest and setQuestText, with open quests shown and done ones
// in the settings list.
// =============================================================

let questDrawnKey = null;

// Block 52. "Bagong gawain" is announced when the step in hand changes
// while the student is playing, and never for the step a login or a
// reload lands on. questAnnounceReady is switched on once the world is
// handed over (enterWorldScripts), and questAnnouncedId is the step the
// last render showed, reset on every act load so a new act starts quiet.
let questAnnounceReady = false;
let questAnnouncedId = null;

function objectiveLine(o) {
  // Block 52. A step that is a sum of money rather than a list of people
  // reads the barya balance, capped at the target so a student who has
  // more does not read "(140/100)". The line only shows the count: the
  // step's flag is still set by content, because what finishing it means
  // (handing it over, say) is the story's to decide, not the engine's.
  if (typeof o.countCurrency === "number" && o.countCurrency > 0) {
    const have = Math.min(currency, o.countCurrency);
    return o.label + " (" + have + "/" + o.countCurrency + ")";
  }
  if (!Array.isArray(o.countFlags)) return o.label;
  const n = o.countFlags.filter((f) => state.flags[f]).length;
  return o.label + " (" + n + "/" + o.countFlags.length + ")";
}

// Backfills the chain and rebuilds the quests array from it. Returns
// nothing; renderQuests draws. Safe to call as often as markDirty is.
function syncObjectiveChain() {
  const act = currentActData;
  if (!act || !act.linearObjectives) return;
  const list = act.objectives || [];
  let last = -1;
  list.forEach((o, i) => { if (state.flags[o.flag]) last = i; });
  for (let i = 0; i < last; i++) state.flags[list[i].flag] = true;

  const next = [];
  for (let i = 0; i < list.length; i++) {
    const o = list[i];
    const done = Boolean(state.flags[o.flag]);
    next.push({ id: o.id, text: objectiveLine(o), done });
    if (!done) break;
  }
  quests.length = 0;
  quests.push(...next);
}

function renderQuests() {
  syncObjectiveChain();
  const current = quests.filter((q) => !q.done);
  const doneCount = quests.length - current.length;

  const act = currentActData;
  if (act && act.linearObjectives) {
    const id = current.length ? current[0].id : null;
    if (id !== questAnnouncedId) {
      if (questAnnounceReady && id && questAnnouncedId !== null) {
        showToast("Bagong gawain: " + current[0].text, 3200);
      }
      questAnnouncedId = id;
    }
  }

  // Written only when something shown changed: markDirty calls this
  // from the loop's own paths, and rebuilding an identical list would
  // dirty the page for nothing (Block 36).
  const key = JSON.stringify([current.map((q) => q.text), doneCount > 0]);
  if (key === questDrawnKey) return;
  questDrawnKey = key;

  questListEl.innerHTML = "";
  current.forEach((q) => {
    const li = document.createElement("li");
    li.textContent = q.text;
    questListEl.appendChild(li);
  });
  if (!current.length) {
    const li = document.createElement("li");
    li.className = "quest-none";
    li.textContent = doneCount ? "Wala nang gawain." : "Walang gawain.";
    questListEl.appendChild(li);
  }
}

// Block 57. The lines of the tasks already done, in the order they were
// done, for the settings panel. A copy, like every other facade read.
function doneQuestTexts() {
  syncObjectiveChain();
  return quests.filter((q) => q.done).map((q) => q.text);
}

// =============================================================
// ACT LOADING
//
// Everything below is populated by loadAct() from an act data
// file. These were previously hardcoded constants built once at
// script load. Making them reloadable is what allows moving
// between acts without a page refresh.
// =============================================================

let currentActData = null;
let SCENES = []; // every scene in the current act
let currentScene = null; // the scene data currently built
let currentSceneId = null;

let NPCS = []; // the current SCENE's NPCs
let STAGE = null; // the current scene's stage, or null if it has none
let WORLD_WIDTH = 4400; // overwritten per scene
let PLATFORMS = []; // one-way platforms, jumped up through and landed on
let GUARDS = []; // patrolling guards, empty outside stealth scenes
// Block 35. Enemies that fight rather than patrol, spawned by content at
// run time (spawnEnemies). Declared up here because unloadScene and
// updateHudVisibility, both reached at parse time, read it.
let ENEMIES = [];
// Block 37. Shots from guards in flight. Declared up here with the other
// scene lists, not beside the code that fires them, because unloadScene
// clears them and loadAct reaches unloadScene at parse time (the temporal
// dead zone pitfall in CLAUDE.md).
let GUARD_BULLETS = [];
let enemiesDone = null; // resolves the spawnEnemies promise
let HIDE_SPOTS = []; // regions that suppress guard detection
let HAZARDS = []; // ground regions that cost one health on contact
let PICKUPS = []; // collectibles; currently only hearts

// Native pixel dimensions of the fallback backdrop,
// assets/backgrounds/act1/street-01.jpg since Block 54 (tondo.jpg was
// removed as old). A backdrop tile is
// drawn at the full height of the skyline, so at any rendered height it
// is exactly this ratio times as wide. buildSkylineTiles() uses it to lay
// the tiles out without hardcoding a width that would only be right at
// one screen size or --zoom.
const SKYLINE_ASPECT = 1952 / 736;

// Ids collected during this visit to the scene. Created by loadScene and
// cleared only by loadScene, never by respawnInScene, so a heart already
// spent cannot be farmed by dying on purpose. Leaving the scene and
// coming back does restore them, which matches health not being
// persisted either.
let collectedPickups = new Set();

let stageEl = null;
let slopeLeft = null;
let slopeRight = null;

let actElements = []; // every DOM node loadAct created, for cleanup
let decorationEls = [];
let npcAnimators = []; // animated sprites needing an .update(now) each frame

// Incremented on every load. setupNpcAnimation captures the value
// and refuses to register itself if the act changed while its image
// was still downloading, which would otherwise leave an animator
// pointing at a removed element.
let actLoadToken = 0;

// An act is a list of scenes. Acts that predate scenes, which is every
// act except Act I, declare their world directly on the act object; those
// are wrapped in a single implicit scene here rather than being rewritten.
// content/act2.js through act4.js therefore need no changes at all.
function scenesFor(actData) {
  if (Array.isArray(actData.scenes) && actData.scenes.length) {
    return actData.scenes;
  }
  return [
    {
      id: "road",
      worldWidth: actData.worldWidth,
      startX: actData.startX,
      npcs: actData.npcs,
      stage: actData.stage,
      decorations: actData.decorations,
    },
  ];
}

function loadAct(actData, sceneId) {
  unloadAct();

  currentActData = actData;
  SCENES = scenesFor(actData);
  questAnnouncedId = null;

  // Quests belong to the act, not the scene, so they are added once here
  // rather than being re-added every time the player changes room.
  (actData.startingQuests || []).forEach((q) => addQuest(q.id, q.text));

  loadScene(sceneId);
}

// Builds one scene. Everything that used to be per-act is now per-scene;
// the act above it only decides which scene is current.
function loadScene(sceneId) {
  unloadScene();

  actLoadToken++;
  const token = actLoadToken;

  const scene =
    SCENES.find((candidate) => candidate.id === sceneId) || SCENES[0];

  currentScene = scene;
  currentSceneId = scene.id;
  currentRoom = scene.id; // persisted through game_progress.current_room

  NPCS = scene.npcs || [];
  STAGE = scene.stage || null;
  WORLD_WIDTH = scene.worldWidth || 4400;
  PLATFORMS = scene.platforms || [];
  HIDE_SPOTS = scene.hideSpots || [];
  HAZARDS = scene.hazards || [];
  PICKUPS = scene.pickups || [];
  collectedPickups = new Set();

  // Same Tondo.png backdrop, desaturated. Lets content reuse the one
  // backdrop for a flashback or memory beat instead of needing a second
  // background asset; see CLAUDE.md, Act data format. Toggled rather than
  // only ever added, so leaving the scene (gotoScene back to a scene
  // without the flag) clears it instead of leaving the world permanently
  // grey.
  document
    .getElementById("skyline")
    .classList.toggle("grey-filter", Boolean(scene.greyFilter));
  // The ground is part of the backdrop too. It was a missing-file
  // placeholder until Lupa.jpg (Block 33), so nobody saw a brown road
  // under a grey memory until then. Characters stay in colour, as before.
  document
    .getElementById("ground-tiles")
    .classList.toggle("grey-filter", Boolean(scene.greyFilter));

  // Block 34. A scene may bring its own backdrop picture (the inside of
  // the entablado) instead of the shared Tondo.png, and may hide the dirt
  // strip when the picture already has a floor. Both are set or cleared
  // on every load, like greyFilter, so leaving the scene restores Tondo.
  const skylineEl = document.getElementById("skyline");
  if (scene.backdrop && scene.backdrop.src) {
    // Absolute, because a url() inside a custom property is resolved
    // against the stylesheet that reads it (css/style.css, one folder
    // down since Block 44), not against this page.
    skylineEl.style.setProperty("--skyline-src",
      `url("${new URL(assetUrl(scene.backdrop.src), document.baseURI).href}")`);
  } else {
    skylineEl.style.removeProperty("--skyline-src");
  }
  document
    .getElementById("ground-tiles")
    .classList.toggle("ground-hidden", scene.ground === false);

  // Block 36. The world element was a fixed 4400px whatever the scene
  // actually was, so the backdrop, the ground strip and every layer over
  // them were painted and held in memory at that width even in a room one
  // screen wide. Sized to the scene instead, which is the same number the
  // camera already clamps to. Set BEFORE the backdrop is built, because
  // that reads the world's width to know how many tiles to lay.
  world.style.width = WORLD_WIDTH + "px";
  measureViewport();

  buildSkylineTiles();
  buildNpcs(token);
  buildDecorations(token);
  buildStage();
  buildPlatforms();
  buildHideSpots();
  buildHazards();
  buildPickups();
  buildGuards(token);

  posX = typeof scene.startX === "number" ? scene.startX : 0;
  posY = groundHeightAt(posX);
  velY = 0;

  updateHudVisibility();
  renderQuests();
}

function unloadScene() {
  actElements.forEach((el) => el.remove());
  actElements = [];
  decorationEls = [];
  npcAnimators = [];

  stageEl = null;
  slopeLeft = null;
  slopeRight = null;

  NPCS = [];
  STAGE = null;
  PLATFORMS = [];
  GUARDS = [];
  HIDE_SPOTS = [];
  HAZARDS = [];
  PICKUPS = [];
  ENEMIES = []; // their elements are in actElements, removed above
  GUARD_BULLETS = []; // likewise
  enemiesDone = null;
  currentScene = null;
  currentSceneId = null;
}

function unloadAct() {
  unloadScene();
  SCENES = [];
  currentActData = null;
}

// Lays the backdrop out as tiles, every other one mirrored (Block 26).
//
// Tondo.png is a painted scene, not a texture drawn to repeat, so plain
// repeat-x put the image's right edge against its own left edge and left
// a visible jump in the clouds and the water. Blocks 18 to 25 covered each
// seam with a dark "tree shadow" band, which hid the jump by putting a
// black post in the middle of the scene instead.
//
// Mirroring removes the seam rather than hiding it. When the second copy
// is flipped, the pixels on both sides of the join are the SAME column of
// the image, so nothing jumps; the third copy is unflipped again and meets
// the second at the image's other edge, which is equally continuous. The
// cost is a symmetry a careful eye can find, which in a painting of stilt
// houses and palms reads as more village rather than as a mistake. It
// needs no new art and no image editing, which is the constraint the
// backdrop has always had.
//
// Tiles are absolutely positioned divs inside #skyline and #skyline-night,
// each taking its picture from its own layer's --skyline-src, so one
// function serves both and greyFilter (a filter on #skyline) still
// applies to everything inside it. Widths are whole pixels and each tile
// overlaps the next by one, because two fractional edges can leave a
// hairline of the sky showing through; the overlap is invisible exactly
// because the mirrored columns match. background-size is the tile's own
// box, so the rounding stretches the image by under a pixel rather than
// cropping it.
//
// Rebuilt on every scene load from the skyline's rendered height (there is
// no resize handling anywhere in this engine; see CLAUDE.md) and pushed to
// actElements, so unloadScene removes them with everything else the scene
// made.
// Block 36. The night layer is built only when a scene actually turns to
// night (runNightTransition), rather than at every scene load. It is
// invisible until then, and a second full set of backdrop tiles is a
// second set of textures for a phone to hold for nothing.
function buildSkylineTiles(layerIds) {
  const backdrop = currentScene && currentScene.backdrop;

  // Block 43. A street drawn as a row of different paintings, each one
  // panel, with a shadow tree in front of every join. Only the day layer:
  // there is no night art for the panels, and no shipped scene turns to
  // night.
  if (currentScene && Array.isArray(currentScene.panels) && currentScene.panels.length) {
    if (!layerIds || layerIds.includes("skyline")) buildPanelBackdrop(currentScene);
    return;
  }

  // Block 34. A scene's own backdrop is one painting of one room, not a
  // street, so it is drawn once rather than tiled: a mirrored second
  // copy of a stage would put a second set of curtains beside the first.
  // It covers the whole visible world, anchored at the bottom so the
  // painted floor stays under the characters' feet; on a screen wider
  // than the picture's own shape the top edge is what gets cropped. The
  // night layer is left empty, since only Tondo has a night picture.
  if (backdrop && backdrop.src) {
    const layer = document.getElementById("skyline");
    if (!layer) return;
    layer.classList.add("skyline-tiled");
    const tile = document.createElement("div");
    tile.className = "skyline-tile";
    tile.style.left = "0px";
    tile.style.width = Math.max(WORLD_WIDTH, viewport.clientWidth) + "px";
    tile.style.backgroundSize = "cover";
    tile.style.backgroundPosition = "center bottom";
    layer.appendChild(tile);
    actElements.push(tile);
    return;
  }

  (layerIds || ["skyline"]).forEach((id) => {
    const layer = document.getElementById(id);
    if (!layer) return;
    const height = layer.clientHeight;
    if (!height) return; // not laid out yet; skip rather than divide by 0

    const tileWidth = Math.max(1, Math.round(height * SKYLINE_ASPECT));
    const totalWidth = world.clientWidth;
    layer.classList.add("skyline-tiled");

    for (let i = 0, x = 0; x < totalWidth; i++, x += tileWidth) {
      const tile = document.createElement("div");
      tile.className = "skyline-tile" + (i % 2 ? " skyline-tile-mirrored" : "");
      tile.style.left = x + "px";
      tile.style.width = tileWidth + 1 + "px";
      layer.appendChild(tile);
      actElements.push(tile);
    }
  });
}

// =============================================================
// PANEL BACKDROPS AND SHADOW TREES (Block 43)
//
// A scene may declare panels: a list of paintings laid side by side along
// the road, repeated in order if the road is longer than the list. Unlike
// Tondo.png's mirrored tiles, these are different pictures, and two
// different paintings never meet cleanly at an edge: a hut is cut in half,
// the path jumps. So every join gets a shadow tree, a dark silhouette in
// the foreground that Macario, the NPCs and the guards all pass behind.
// It hides the join and reads as the nearest tree on the street rather
// than as a seam.
//
// Each panel is a fixed PANEL_WIDTH of the world, not "one image wide at
// the layer's height" the way Tondo's tiles are. The layer's height is
// the screen's height over --zoom, so it differs by phone; a width that
// followed it would put every join, and so every tree, somewhere
// different on each phone, and a tree could land on the Mananahi on one
// device and nowhere near her on another. With a fixed width the trees
// are at the same x on every screen, which is what lets content keep its
// people clear of them (verify_new_scene.js checks that). The painting
// covers its panel (background-size: cover), anchored at the bottom so
// the road stays under the characters' feet: on a short screen a little
// sky is cropped, on a wide one a little of each side, and the side is
// under the tree anyway.
// =============================================================

const PANEL_WIDTH = 1450;       // world px; about one phone screen and a bit
const SHADOW_TREE_WIDTH = 440;  // must match .shadow-tree's CSS width

// Where the trees stand: every join between two panels, and never at the
// very end of the world, where there is nothing to join.
function panelJoins(scene) {
  const width = scene.panelWidth || PANEL_WIDTH;
  const joins = [];
  for (let x = width; x < (scene.worldWidth || WORLD_WIDTH) - 1; x += width) joins.push(x);
  return joins;
}

function buildPanelBackdrop(scene) {
  const layer = document.getElementById("skyline");
  if (!layer) return;
  layer.classList.add("skyline-tiled");
  const width = scene.panelWidth || PANEL_WIDTH;

  for (let i = 0, x = 0; x < WORLD_WIDTH; i++, x += width) {
    const tile = document.createElement("div");
    // Block 45. mirrorPanels flips every second panel, as Block 26 did
    // for Tondo's tiles: a flipped copy meets its neighbour at the same
    // column of the painting, so even under the tree nothing jumps. Safe
    // with cover, because it crops both edges of every panel alike.
    const mirrored = scene.mirrorPanels && i % 2 === 1;
    tile.className = "skyline-tile skyline-panel" + (mirrored ? " skyline-tile-mirrored" : "");
    tile.style.left = x + "px";
    // One pixel of overlap, as with Tondo's tiles, so two fractional
    // edges never leave a hairline of the layer showing through.
    tile.style.width = width + 1 + "px";
    tile.style.backgroundImage = `url("${assetUrl(scene.panels[i % scene.panels.length])}")`;
    // Block 46. The whole picture stands on the floor (.skyline-panel):
    // anything above its top edge is panelSky, so the sky carries on up
    // a tall screen instead of ending in the page's own colour.
    if (scene.panelSky) tile.style.backgroundColor = scene.panelSky;
    layer.appendChild(tile);
    actElements.push(tile);
  }

  panelJoins(scene).forEach((x, i) => {
    // The tree's shade on the painting, behind everyone: it softens the
    // two paintings into each other either side of the trunk. In the
    // backdrop layer, so greyFilter greys it with the paintings.
    const shade = document.createElement("div");
    shade.className = "panel-join-shade";
    shade.style.left = x + "px";
    layer.appendChild(shade);
    actElements.push(shade);

    // The tree itself, in front of everyone. Its own element in #world,
    // above #player (style.css, .shadow-tree).
    const tree = document.createElement("div");
    tree.className = "shadow-tree";
    tree.style.left = x - SHADOW_TREE_WIDTH / 2 + "px";
    // Which of the four models stands here is the join's own number, so
    // a road is palm, tree, palm, tree rather than one shape repeated,
    // and the same tree stands at the same place on every phone and on
    // every visit. Picking at random would put a different tree at the
    // same join on a reload, which is not what a street does.
    tree.style.backgroundImage = SHADOW_TREE_URLS[i % SHADOW_TREE_URLS.length];
    // Characters stay in colour in a memory, but the tree is scenery,
    // so it greys with the paintings behind it.
    if (scene.greyFilter) tree.classList.add("grey-filter");
    world.appendChild(tree);
    actElements.push(tree);
  });
}

// Four trees in silhouette (Block 50; one coconut palm before that, and
// a broad leafy tree before that again), each drawn in a box
// SHADOW_TREE_WIDTH by 1200 and set as a tree element's background,
// anchored at the bottom: whatever the screen's height, the trunk stands
// on the road and the crown sits high above it.
//
// They are mostly trunk on purpose. The trunk is what hides the join, so
// it is fat, about 180 world px where a student is walking, and it is
// long, so on a phone the screen holds trunk and only the lowest leaves.
// Two are coconut palms, leaning opposite ways, with drooping fronds and
// a cluster of coconuts; two are ordinary broadleaf trees with a wide
// canopy and a couple of limbs beneath it. Every one of them stands its
// base centred on the join, whatever way it leans above, because the road
// is where the two paintings actually meet in front of the student.
//
// Generated once (_dev/tools/make-shadow-tree.py) and pasted in as SVG
// data URLs rather than shipped as files: they cost no download, so a
// slow connection cannot leave a join bare, and one URL per model means
// the browser decodes each one once however many stand on the road.
//
// Consts, not functions: loadAct reaches buildPanelBackdrop at parse time
// (the TDZ pitfall), and that first call is further down this file than
// these lines, so the values already exist when they are read.
const SHADOW_TREE_SVGS = [
  "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 440 1200\"><g fill=\"#0c1a0e\"><path d=\"M131 1200 L135 1182 L138 1164 L141 1146 L144 1129 L146 1111 L148 1094 L150 1076 L152 1059 L153 1041 L155 1024 L156 1007 L158 990 L159 973 L161 956 L162 939 L164 923 L165 906 L167 890 L169 873 L171 857 L172 840 L174 824 L176 808 L178 792 L180 776 L182 760 L184 744 L186 728 L188 713 L190 697 L192 682 L192 666 L192 651 L191 636 L191 621 L192 606 L196 591 L201 576 L207 561 L212 546 L285 546 L286 561 L287 576 L288 591 L288 606 L285 621 L281 636 L276 651 L272 666 L269 682 L267 697 L266 713 L265 728 L264 744 L264 760 L263 776 L263 792 L263 808 L263 824 L263 840 L263 857 L263 873 L264 890 L265 906 L265 923 L266 939 L268 956 L269 973 L270 990 L272 1007 L274 1024 L276 1041 L278 1059 L281 1076 L284 1094 L287 1111 L291 1129 L295 1146 L299 1164 L304 1182 L309 1200 Z M123 1200 L156 1170 L198 1190 L220 1200 Z M306 1200 L277 1176 L242 1192 L220 1200 Z M330 1200 L293 1184 L242 1194 L220 1200 Z\"/><path d=\"M246 500 L233 483 L216 477 L199 465 L180 467 L161 459 L144 470 L122 468 L108 484 L88 489 L77 509 L59 521 L50 544 L37 563 L30 588 L16 610 L3 633 L3 633 L16 610 L30 588 L52 575 L67 559 L88 551 L99 536 L119 534 L128 520 L145 522 L155 510 L169 514 L181 503 L194 507 L210 500 L226 503 L246 500 Z\"/><path d=\"M246 500 L237 476 L221 462 L209 441 L189 437 L174 420 L153 425 L133 414 L115 428 L93 427 L80 446 L61 454 L53 476 L39 493 L34 518 L20 537 L7 559 L7 559 L20 537 L34 518 L57 509 L72 496 L92 494 L102 482 L118 487 L126 476 L138 485 L149 474 L159 484 L174 476 L186 486 L206 485 L222 495 L246 500 Z\"/><path d=\"M246 500 L246 473 L236 454 L234 430 L218 419 L212 398 L193 396 L180 379 L160 388 L141 383 L130 401 L114 408 L111 428 L102 443 L102 465 L93 484 L84 505 L84 505 L93 484 L102 465 L122 456 L132 446 L148 446 L152 438 L161 447 L162 439 L163 450 L170 441 L171 452 L187 450 L193 463 L212 470 L224 486 L246 500 Z\"/><path d=\"M246 500 L254 475 L252 455 L259 435 L251 421 L257 404 L245 396 L244 378 L220 377 L194 377 L193 396 L185 405 L191 420 L190 435 L198 453 L194 472 L191 495 L191 495 L194 472 L198 453 L212 439 L217 427 L230 422 L228 416 L234 427 L215 425 L197 427 L203 419 L198 427 L212 432 L211 446 L225 460 L230 479 L246 500 Z\"/><path d=\"M246 500 L261 478 L266 459 L280 444 L279 429 L292 423 L287 414 L295 420 L279 419 L257 424 L260 411 L258 415 L270 419 L275 431 L289 444 L292 462 L294 483 L294 483 L292 462 L289 444 L297 426 L296 413 L303 398 L295 390 L291 370 L263 374 L241 379 L243 395 L232 404 L239 420 L232 434 L239 454 L237 475 L246 500 Z\"/><path d=\"M246 500 L267 484 L278 466 L298 457 L302 442 L319 442 L319 430 L329 437 L327 426 L328 434 L332 423 L334 429 L348 425 L357 433 L375 439 L383 454 L391 472 L391 472 L383 454 L375 439 L376 419 L368 406 L364 387 L348 383 L335 367 L318 376 L298 371 L289 390 L270 395 L268 416 L253 429 L253 452 L244 473 L246 500 Z\"/><path d=\"M246 500 L270 493 L286 481 L306 479 L317 468 L333 473 L342 462 L354 471 L364 461 L372 471 L386 464 L396 473 L414 473 L428 483 L449 489 L462 506 L475 525 L475 525 L462 506 L449 489 L443 467 L430 452 L421 432 L403 427 L389 410 L369 414 L350 403 L332 416 L311 414 L298 432 L279 439 L269 460 L253 475 L246 500 Z\"/><path d=\"M246 500 L267 501 L282 496 L299 501 L313 496 L326 505 L339 499 L350 511 L365 507 L375 519 L393 519 L405 532 L424 538 L439 552 L461 563 L475 582 L488 603 L488 603 L475 582 L461 563 L454 539 L440 522 L431 501 L413 492 L401 473 L381 470 L366 456 L346 460 L328 451 L310 461 L291 461 L275 475 L258 483 L246 500 Z\"/><path d=\"M246 500 L231 490 L215 489 L197 484 L182 492 L162 491 L149 505 L129 510 L119 529 L100 539 L93 561 L76 576 L70 601 L58 622 L54 649 L41 673 L29 698 L29 698 L41 673 L54 649 L74 632 L88 612 L108 600 L118 582 L137 574 L145 557 L162 553 L170 538 L185 537 L193 523 L207 522 L218 511 L231 509 L246 500 Z\"/><path d=\"M246 500 L241 484 L232 474 L224 462 L211 460 L198 453 L185 461 L171 463 L163 477 L150 487 L146 505 L135 521 L132 543 L125 565 L123 592 L115 620 L107 650 L107 650 L115 620 L123 592 L137 570 L146 548 L159 532 L165 516 L178 507 L183 495 L193 493 L196 485 L202 488 L207 482 L212 486 L223 486 L232 493 L246 500 Z\"/><path d=\"M246 500 L259 492 L267 485 L277 484 L282 480 L287 485 L291 482 L294 489 L303 491 L306 501 L318 509 L323 524 L335 539 L344 558 L356 579 L363 604 L370 632 L370 632 L363 604 L356 579 L354 554 L347 534 L345 514 L335 499 L331 483 L319 475 L313 462 L300 461 L288 454 L277 461 L265 464 L259 475 L250 485 L246 500 Z\"/><circle cx=\"246\" cy=\"506\" r=\"44\"/><circle cx=\"246\" cy=\"474\" r=\"32\"/><circle cx=\"246\" cy=\"444\" r=\"24\"/><circle cx=\"246\" cy=\"416\" r=\"16\"/><circle cx=\"226\" cy=\"542\" r=\"12\"/><circle cx=\"246\" cy=\"550\" r=\"12\"/><circle cx=\"266\" cy=\"538\" r=\"11\"/></g></svg>",
  "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 440 1200\"><g fill=\"#0c1a0e\"><path d=\"M119 1200 L124 1179 L128 1158 L132 1138 L135 1117 L138 1097 L140 1076 L142 1056 L145 1036 L146 1016 L148 996 L150 976 L152 956 L153 936 L155 917 L156 897 L158 878 L159 858 L161 839 L162 820 L164 801 L165 782 L167 763 L168 744 L170 726 L172 707 L173 689 L175 670 L177 652 L179 634 L181 616 L182 598 L184 580 L186 562 L188 544 L190 527 L192 509 L194 492 L196 474 L198 457 L199 440 L281 440 L279 457 L278 474 L277 492 L276 509 L275 527 L274 544 L273 562 L272 580 L271 598 L271 616 L270 634 L270 652 L269 670 L269 689 L269 707 L269 726 L269 744 L269 763 L269 782 L269 801 L270 820 L270 839 L271 858 L272 878 L273 897 L274 917 L275 936 L277 956 L278 976 L280 996 L282 1016 L285 1036 L287 1056 L290 1076 L293 1097 L297 1117 L301 1138 L306 1158 L311 1179 L317 1200 Z M114 1200 L150 1170 L196 1190 L220 1200 Z M314 1200 L282 1176 L244 1192 L220 1200 Z M340 1200 L299 1184 L244 1194 L220 1200 Z\"/><path d=\"M180 660 L117 400 L151 400 L224 630 Z\"/><path d=\"M216 620 L284 360 L316 360 L256 590 Z\"/><path d=\"M-5 335 L13 329 L29 330 L47 326 L60 339 L75 345 L70 367 L54 365 L36 369 L23 356 L8 350 Z\"/><path d=\"M83 214 L107 220 L121 233 L143 241 L146 263 L157 280 L134 298 L120 285 L98 277 L95 255 L84 238 Z\"/><path d=\"M258 154 L272 176 L274 197 L284 218 L270 238 L265 259 L234 256 L233 235 L222 213 L236 194 L241 173 Z\"/><path d=\"M418 243 L413 265 L401 279 L394 300 L373 304 L357 314 L339 294 L351 279 L358 259 L379 255 L395 245 Z\"/><path d=\"M485 353 L472 366 L457 371 L443 382 L427 377 L411 377 L407 357 L422 352 L435 341 L452 346 L468 345 Z\"/><path d=\"M101 366 L120 358 L137 360 L155 355 L169 368 L185 375 L179 397 L162 396 L144 401 L130 388 L114 381 Z\"/><path d=\"M379 382 L365 395 L349 399 L335 410 L318 403 L301 403 L298 381 L314 377 L329 366 L346 372 L362 373 Z\"/><circle cx=\"238\" cy=\"474\" r=\"92\"/><circle cx=\"88\" cy=\"360\" r=\"74\"/><circle cx=\"158\" cy=\"304\" r=\"96\"/><circle cx=\"248\" cy=\"278\" r=\"104\"/><circle cx=\"334\" cy=\"316\" r=\"90\"/><circle cx=\"394\" cy=\"370\" r=\"70\"/><circle cx=\"198\" cy=\"390\" r=\"78\"/><circle cx=\"284\" cy=\"394\" r=\"74\"/><circle cx=\"128\" cy=\"422\" r=\"56\"/><circle cx=\"348\" cy=\"426\" r=\"54\"/><circle cx=\"238\" cy=\"224\" r=\"70\"/><circle cx=\"168\" cy=\"242\" r=\"56\"/><circle cx=\"312\" cy=\"246\" r=\"54\"/><circle cx=\"114\" cy=\"454\" r=\"38\"/><circle cx=\"192\" cy=\"470\" r=\"44\"/><circle cx=\"274\" cy=\"472\" r=\"40\"/><circle cx=\"354\" cy=\"450\" r=\"36\"/><circle cx=\"234\" cy=\"430\" r=\"48\"/></g></svg>",
  "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 440 1200\"><g fill=\"#0c1a0e\"><path d=\"M131 1200 L137 1184 L142 1167 L146 1151 L150 1135 L153 1119 L156 1103 L159 1087 L162 1072 L164 1056 L166 1040 L168 1025 L169 1009 L171 994 L172 979 L173 963 L174 948 L175 933 L175 918 L176 903 L176 888 L176 873 L176 859 L176 844 L176 829 L175 815 L175 800 L174 786 L173 772 L172 758 L171 743 L169 729 L166 715 L162 701 L157 688 L153 674 L150 660 L149 646 L150 633 L151 619 L152 606 L227 606 L233 619 L239 633 L245 646 L249 660 L250 674 L250 688 L250 701 L250 715 L250 729 L252 743 L253 758 L255 772 L257 786 L259 800 L261 815 L262 829 L264 844 L265 859 L266 873 L268 888 L269 903 L270 918 L271 933 L272 948 L273 963 L274 979 L275 994 L276 1009 L277 1025 L278 1040 L280 1056 L281 1072 L283 1087 L285 1103 L287 1119 L289 1135 L292 1151 L295 1167 L299 1184 L303 1200 Z M123 1200 L156 1170 L198 1190 L220 1200 Z M306 1200 L277 1176 L242 1192 L220 1200 Z M330 1200 L293 1184 L242 1194 L220 1200 Z\"/><path d=\"M190 560 L210 563 L225 560 L241 567 L254 563 L266 574 L280 570 L289 583 L306 580 L315 594 L334 596 L345 611 L365 619 L380 634 L402 647 L416 668 L429 691 L429 691 L416 668 L402 647 L396 622 L383 603 L374 581 L357 569 L346 549 L326 544 L312 528 L291 530 L274 519 L255 528 L236 525 L220 537 L203 544 L190 560 Z\"/><path d=\"M190 560 L214 555 L230 545 L250 547 L261 537 L276 544 L286 535 L296 545 L308 536 L316 548 L332 543 L342 554 L362 557 L376 569 L399 578 L412 597 L425 619 L425 619 L412 597 L399 578 L394 554 L380 537 L372 515 L353 507 L341 488 L320 489 L302 475 L282 486 L261 480 L246 497 L226 502 L214 522 L198 536 L190 560 Z\"/><path d=\"M190 560 L212 546 L224 530 L243 523 L249 510 L264 513 L265 502 L273 511 L274 499 L275 508 L283 499 L287 507 L303 506 L313 517 L332 525 L342 544 L351 564 L351 564 L342 544 L332 525 L333 503 L324 488 L321 468 L305 462 L294 444 L275 449 L256 440 L243 457 L223 459 L218 480 L202 491 L200 514 L190 533 L190 560 Z\"/><path d=\"M190 560 L205 539 L211 520 L225 507 L224 493 L238 488 L232 481 L238 489 L220 486 L201 488 L207 478 L205 484 L219 489 L223 501 L238 515 L241 534 L244 557 L244 557 L241 534 L238 515 L245 497 L244 482 L251 467 L242 458 L242 440 L217 439 L191 440 L191 458 L178 466 L185 482 L177 496 L184 515 L182 535 L190 560 Z\"/><path d=\"M190 560 L199 535 L197 515 L204 495 L197 481 L204 465 L193 457 L195 440 L172 436 L144 433 L142 452 L134 461 L141 475 L140 488 L148 506 L145 524 L143 545 L143 545 L145 524 L148 506 L162 493 L166 482 L179 477 L177 473 L180 485 L158 481 L141 482 L149 476 L144 484 L157 491 L156 505 L170 519 L175 539 L190 560 Z\"/><path d=\"M190 560 L192 533 L183 513 L183 490 L169 477 L166 456 L148 451 L139 433 L119 438 L102 429 L89 445 L73 449 L70 467 L62 480 L63 500 L55 516 L47 534 L47 534 L55 516 L63 500 L81 494 L90 487 L104 490 L105 484 L110 496 L110 487 L108 498 L118 491 L118 503 L134 503 L139 518 L158 527 L169 544 L190 560 Z\"/><path d=\"M190 560 L183 536 L168 520 L158 499 L139 493 L126 474 L105 477 L88 464 L69 475 L49 471 L35 488 L17 493 L8 513 L-5 527 L-10 550 L-23 566 L-36 585 L-36 585 L-23 566 L-10 550 L11 543 L25 533 L43 534 L52 525 L66 532 L74 522 L84 532 L95 523 L104 534 L120 529 L131 540 L151 541 L166 553 L190 560 Z\"/><path d=\"M190 560 L178 543 L161 535 L146 521 L127 522 L109 512 L92 520 L72 516 L57 530 L37 533 L26 552 L8 561 L-1 582 L-14 599 L-21 622 L-35 641 L-48 662 L-48 662 L-35 641 L-21 622 L-0 611 L15 598 L34 592 L45 579 L63 579 L73 567 L88 571 L98 560 L111 565 L124 556 L137 561 L154 556 L170 561 L190 560 Z\"/><path d=\"M190 560 L205 569 L218 571 L228 582 L242 583 L250 596 L265 597 L272 613 L289 616 L297 633 L316 640 L326 658 L345 671 L359 689 L379 707 L391 730 L403 755 L403 755 L391 730 L379 707 L374 680 L363 659 L357 635 L341 620 L334 598 L315 588 L305 569 L285 565 L273 551 L253 552 L238 544 L220 549 L205 550 L190 560 Z\"/><path d=\"M190 560 L204 553 L213 546 L223 547 L228 542 L233 548 L239 545 L241 554 L251 555 L255 567 L268 576 L274 592 L287 608 L296 629 L310 651 L318 678 L325 707 L325 707 L318 678 L310 651 L308 625 L301 602 L298 581 L287 565 L284 547 L271 538 L264 524 L249 522 L237 514 L224 520 L211 522 L204 534 L194 544 L190 560 Z\"/><path d=\"M190 560 L186 545 L178 536 L172 524 L160 522 L149 515 L138 521 L125 523 L118 535 L107 544 L103 560 L94 574 L91 594 L85 614 L83 638 L76 662 L70 689 L70 689 L76 662 L83 638 L95 617 L103 598 L115 584 L120 569 L132 561 L135 551 L144 550 L146 543 L151 546 L155 541 L160 545 L169 545 L177 553 L190 560 Z\"/><circle cx=\"190\" cy=\"566\" r=\"44\"/><circle cx=\"190\" cy=\"534\" r=\"32\"/><circle cx=\"190\" cy=\"504\" r=\"24\"/><circle cx=\"190\" cy=\"476\" r=\"16\"/><circle cx=\"208\" cy=\"604\" r=\"12\"/><circle cx=\"188\" cy=\"610\" r=\"12\"/><circle cx=\"170\" cy=\"596\" r=\"11\"/></g></svg>",
  "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 440 1200\"><g fill=\"#0c1a0e\"><path d=\"M123 1200 L128 1181 L133 1162 L137 1143 L140 1124 L143 1105 L146 1086 L148 1067 L150 1049 L152 1030 L153 1012 L155 994 L156 975 L157 957 L158 939 L159 921 L160 903 L160 885 L161 868 L161 850 L162 832 L162 815 L163 798 L163 780 L163 763 L163 746 L164 729 L164 712 L164 695 L164 679 L164 662 L164 645 L164 629 L163 612 L163 596 L163 580 L162 564 L161 548 L161 532 L160 516 L159 500 L242 500 L243 516 L244 532 L246 548 L247 564 L249 580 L250 596 L251 612 L253 629 L254 645 L255 662 L257 679 L258 695 L259 712 L261 729 L262 746 L264 763 L265 780 L267 798 L268 815 L270 832 L271 850 L273 868 L274 885 L276 903 L278 921 L279 939 L281 957 L283 975 L285 994 L287 1012 L289 1030 L292 1049 L294 1067 L297 1086 L300 1105 L303 1124 L307 1143 L311 1162 L315 1181 L320 1200 Z M114 1200 L150 1170 L196 1190 L220 1200 Z M314 1200 L282 1176 L244 1192 L220 1200 Z M340 1200 L299 1184 L244 1194 L220 1200 Z\"/><path d=\"M214 600 L287 340 L321 340 L258 570 Z\"/><path d=\"M182 560 L126 300 L158 300 L222 530 Z\"/><path d=\"M430 404 L417 418 L402 424 L389 436 L372 431 L356 433 L351 412 L365 406 L379 394 L396 398 L412 397 Z\"/><path d=\"M344 278 L343 302 L333 319 L330 341 L309 349 L295 362 L273 344 L283 327 L286 305 L307 297 L321 284 Z\"/><path d=\"M166 218 L184 236 L190 256 L204 275 L195 297 L194 318 L164 322 L158 302 L144 283 L153 261 L153 241 Z\"/><path d=\"M10 312 L32 313 L48 322 L69 325 L77 345 L90 358 L73 379 L57 370 L37 367 L29 348 L16 334 Z\"/><path d=\"M-49 419 L-33 412 L-18 412 L-1 407 L12 417 L27 421 L23 442 L8 441 L-8 447 L-22 436 L-36 432 Z\"/><path d=\"M328 430 L314 444 L299 450 L285 463 L267 458 L251 459 L245 437 L261 431 L275 419 L293 424 L309 422 Z\"/><path d=\"M52 449 L68 439 L84 438 L101 431 L116 441 L131 444 L129 466 L114 467 L97 474 L82 464 L67 461 Z\"/><circle cx=\"198\" cy=\"534\" r=\"92\"/><circle cx=\"338\" cy=\"426\" r=\"72\"/><circle cx=\"272\" cy=\"368\" r=\"94\"/><circle cx=\"182\" cy=\"340\" r=\"102\"/><circle cx=\"96\" cy=\"380\" r=\"88\"/><circle cx=\"40\" cy=\"434\" r=\"68\"/><circle cx=\"232\" cy=\"452\" r=\"76\"/><circle cx=\"146\" cy=\"456\" r=\"72\"/><circle cx=\"302\" cy=\"484\" r=\"54\"/><circle cx=\"82\" cy=\"488\" r=\"52\"/><circle cx=\"192\" cy=\"290\" r=\"68\"/><circle cx=\"262\" cy=\"310\" r=\"56\"/><circle cx=\"118\" cy=\"312\" r=\"52\"/><circle cx=\"316\" cy=\"512\" r=\"36\"/><circle cx=\"238\" cy=\"528\" r=\"42\"/><circle cx=\"156\" cy=\"530\" r=\"38\"/><circle cx=\"78\" cy=\"508\" r=\"34\"/><circle cx=\"200\" cy=\"488\" r=\"46\"/></g></svg>",
];

const SHADOW_TREE_URLS = SHADOW_TREE_SVGS.map(
  (svg) => 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")');





function buildNpcs(token) {
  NPCS.forEach((npc) => {
    // Reset per-load runtime state so replaying an act starts clean.
    npc.stage = 0;
    npc.nearSoundOn = false;

    // An NPC that starts hidden stays hidden until its flag is set.
    // Checking the flag here rather than only on reveal means a
    // reloaded save rebuilds the world in the right state without
    // the engine knowing which NPC belongs to which act.
    npc.hidden =
      Boolean(npc.startsHidden) && !state.flags[npc.revealedByFlag];

    const el = document.createElement("div");
    el.className = "entity";
    el.id = "npc-" + npc.id;
    // Block 57. An NPC may be drawn at its own height (the horse, the
    // apple tree), like a decoration's displayHeight. Its body is still
    // NPC_WIDTH wide; only the picture changes size.
    const npcHeight = npc.displayHeight || DISPLAY_HEIGHT;
    mountBody(el, npc.x, NPC_WIDTH, npcHeight);
    if (npc.hidden) el.style.display = "none";

    if (npc.animation) {
      // Animated sprite sheet, same system and display size as the player.
      const spriteEl = document.createElement("div");
      spriteEl.className = "sprite npc-sprite npc-anim-sprite";
      el.appendChild(spriteEl);
      world.appendChild(el);
      setupNpcAnimation(npc.animation, spriteEl, npcHeight, token, NPC_WIDTH);
    } else {
      // Static image, falling back to a placeholder box showing the
      // expected filename if the file is missing. An <img> cannot
      // display text, so on error it is swapped for a real div.
      const img = document.createElement("img");
      img.className = "sprite npc-sprite";
      img.src = assetUrl(npc.img);
      img.alt = npc.label;
      // A static image has no measured feet, so it is centred on the
      // body, the same assumption an unmeasured sheet gets.
      img.style.left = "0px"; // .npc-sprite is NPC_WIDTH wide until it loads
      img.onload = () => {
        img.style.left = (NPC_WIDTH - img.offsetWidth) / 2 + "px";
      };
      img.onerror = () => {
        const placeholder = document.createElement("div");
        placeholder.className = "sprite npc-sprite";
        // Same box every other character gets. 80 by 112 was written
        // here before anything else used a placeholder, and it left
        // Macario a head taller than every NPC and guard on screen.
        bodyPlaceholder(placeholder, npc.img, DISPLAY_HEIGHT, NPC_WIDTH);
        img.replaceWith(placeholder);
      };
      el.appendChild(img);
      world.appendChild(el);
    }

    actElements.push(el);
  });
}

function buildDecorations(token) {
  ((currentScene && currentScene.decorations) || []).forEach((dec) => {
    const el = document.createElement("div");
    el.className = "entity";
    el.id = "dec-" + dec.id;
    // A decoration has no body, so its x is simply where it stands: a
    // zero-width box, with the art's feet on it.
    mountBody(el, dec.x, 0, dec.displayHeight || DISPLAY_HEIGHT);
    // Block 35. A decoration may start hidden, for a character who walks on
    // later in a scripted scene (showDecoration), and may be mirrored.
    dec.currentX = dec.x;
    if (dec.hidden) el.style.display = "none";

    const spriteEl = document.createElement("div");
    spriteEl.className = "sprite npc-sprite npc-anim-sprite";
    if (dec.facing === -1) spriteEl.style.transform = "scaleX(-1)";
    el.appendChild(spriteEl);
    world.appendChild(el);

    // Block 40. A decoration with walkOnly steps its sheet only while
    // moveDecoration is carrying it, so a walk cycle stands still when he
    // does instead of walking on the spot.
    dec.moving = false;
    dec.spriteEl = spriteEl;
    setupNpcAnimation(
      dec.animation,
      spriteEl,
      dec.displayHeight || DISPLAY_HEIGHT,
      token,
      0,
      dec.walkOnly ? { playing: () => dec.moving } : undefined
    );

    // Block 53. A decoration with both an idle sheet (animation) and a
    // walk sheet (walkAnimation) shows the walk only while moveDecoration
    // is carrying it, the same two-sprites-in-one-body swap an enemy's
    // attack sheet uses: both are built once, and a walk only changes
    // which one is displayed.
    dec.walkSpriteEl = null;
    if (dec.walkAnimation) {
      const walkEl = document.createElement("div");
      walkEl.className = "sprite npc-sprite npc-anim-sprite";
      walkEl.style.display = "none";
      if (dec.facing === -1) walkEl.style.transform = "scaleX(-1)";
      el.appendChild(walkEl);
      dec.walkSpriteEl = walkEl;
      setupNpcAnimation(dec.walkAnimation, walkEl, dec.displayHeight || DISPLAY_HEIGHT,
        token, 0, { playing: () => dec.moving });
    }

    actElements.push(el);
    decorationEls.push(el);
  });
}

function buildStage() {
  if (!STAGE) return; // acts without a stage skip this entirely

  stageEl = document.createElement("div");
  stageEl.id = "stage-platform";
  stageEl.style.left = STAGE.x - STAGE.width / 2 + "px";
  stageEl.style.width = STAGE.width + "px";
  world.appendChild(stageEl);
  actElements.push(stageEl);

  // Sloped ramps on both sides so the player visually walks up onto it.
  slopeLeft = document.createElement("div");
  slopeLeft.className = "stage-slope stage-slope-left";
  slopeLeft.style.left = STAGE.x - STAGE.width / 2 - STAGE.rampWidth + "px";
  slopeLeft.style.width = STAGE.rampWidth + "px";
  world.appendChild(slopeLeft);
  actElements.push(slopeLeft);

  slopeRight = document.createElement("div");
  slopeRight.className = "stage-slope stage-slope-right";
  slopeRight.style.left = STAGE.x + STAGE.width / 2 + "px";
  slopeRight.style.width = STAGE.rampWidth + "px";
  world.appendChild(slopeRight);
  actElements.push(slopeRight);
}

// --- Fallback checks for CSS-only background images -----------------------
// The skyline, night skyline, and ground tiles are set purely in CSS and
// are not act-specific, so they are checked once here rather than inside
// loadAct. Each is preloaded only to detect a 404 and substitute a
// labelled placeholder fill.
function checkBackgroundImage(el, src, label) {
  const img = new Image();
  img.onerror = () => {
    el.style.backgroundImage = "none";
    el.style.backgroundColor = "#333";
    el.style.display = "flex";
    el.style.alignItems = "center";
    el.style.justifyContent = "center";
    el.style.color = "#ffd54f";
    el.style.fontSize = "14px";
    el.style.border = "2px dashed #ffd54f";
    el.textContent = label;
  };
  img.src = assetUrl(src);
}

checkBackgroundImage(
  document.getElementById("skyline"),
  "assets/backgrounds/act1/street-01.jpg",
  "assets/backgrounds/act1/street-01.jpg"
);
checkBackgroundImage(
  document.getElementById("skyline-night"),
  "assets/backgrounds/act1/tondo-night.png",
  "assets/backgrounds/act1/tondo-night.png"
);
checkBackgroundImage(
  document.getElementById("ground-tiles"),
  "assets/backgrounds/act1/ground-lupa.jpg",
  "assets/backgrounds/act1/ground-lupa.jpg"
);

// opts (Block 40), both optional:
//   playing()  the animation steps only while this returns true, and is
//              held on its first frame otherwise, restarting from it each
//              time it turns true again. A walk cycle for someone who is
//              standing still, or an attack played once per swing.
//   loop       false holds the last frame instead of wrapping.
function setupNpcAnimation(sheet, el, displayHeight, token, bodyWidth, opts) {
  displayHeight = displayHeight || DISPLAY_HEIGHT;
  bodyWidth = bodyWidth || 0;
  opts = opts || {};
  let frame = 0;
  let lastTime = 0;
  let wasPlaying = true;

  loadSpriteSheet(sheet).then(() => {
    // The act may have changed while this image was loading.
    if (token !== undefined && token !== actLoadToken) return;

    if (sheet.failed) {
      bodyPlaceholder(el, sheet.src, displayHeight, bodyWidth);
      return;
    }

    // Grid aware, matching the player. The first multi-row sheet
    // delivered would otherwise render at the wrong scale and walk off
    // the right edge of the image.
    const columns = sheet.columns || sheet.frames;
    const fit = bodySprite(el, sheet, displayHeight, bodyWidth);

    const draw = () => {
      const column = frame % columns;
      const row = Math.floor(frame / columns);
      el.style.backgroundPositionX = -(column * fit.displayFrameWidth) + "px";
      el.style.backgroundPositionY = -(row * fit.rowStep + fit.topOffset) + "px";
    };

    npcAnimators.push({
      update(now) {
        if (opts.playing) {
          const playing = Boolean(opts.playing(now));
          if (!playing) {
            // Written once on the change, not every frame (Block 36).
            if (wasPlaying || frame !== 0) { frame = 0; draw(); }
            wasPlaying = false;
            return;
          }
          if (!wasPlaying) {
            wasPlaying = true;
            frame = 0;
            lastTime = now;
            draw();
            return;
          }
        }
        const frameDuration = 1000 / sheet.fps;
        if (now - lastTime >= frameDuration) {
          lastTime = now;
          if (opts.loop === false && frame === sheet.frames - 1) return;
          frame = (frame + 1) % sheet.frames;
          draw();
        }
      },
    });
  });
}

// Reveals every hidden NPC whose revealedByFlag is now set. Called
// after a story beat fires and again after a save is restored.
//
// This replaced two hardcoded checks for npc.id === "katipunan",
// which put Act I content knowledge inside the engine and meant
// every later act would need its own copy of the same three lines.
function revealNpcsByFlag() {
  NPCS.forEach((npc) => {
    if (!npc.revealedByFlag) return;
    if (!state.flags[npc.revealedByFlag]) return;
    if (!npc.hidden) return;

    npc.hidden = false;
    const el = document.getElementById("npc-" + npc.id);
    if (el) el.style.display = "";
  });
}

// =============================================================
// TERRAIN
//
// Two surfaces exist. The stage ramp, which predates all of this and
// is a continuous height function of x, and scene platforms, which are
// discrete rectangles. floorHeightAt covers the first; platforms are
// resolved separately because landing on one depends on falling onto
// it rather than merely standing at that x.
// =============================================================

function floorHeightAt(x) {
  return GROUND_LEVEL + getPlatformOffset(x);
}

// The highest platform top at x that the player is at or above. Only
// consulted while descending, which is what makes platforms one-way:
// a jump from below passes through and lands on top.
function platformTopUnder(x, fromY) {
  let best = null;
  const centre = x + PLAYER_WIDTH / 2;

  PLATFORMS.forEach((plat) => {
    if (centre < plat.x || centre > plat.x + plat.width) return;
    const top = plat.y;
    if (fromY < top - 1) return; // still below it, keep rising through
    if (best === null || top > best) best = top;
  });

  return best;
}

// The surface the player should rest on at x, given where they are now.
function groundHeightAt(x, fromY) {
  const floor = floorHeightAt(x);
  if (fromY === undefined) return floor;

  const plat = platformTopUnder(x, fromY);
  return plat !== null && plat > floor ? plat : floor;
}

// How high (0 to PLATFORM_HEIGHT) the player is lifted at world-x.
function getPlatformOffset(x) {
  if (!STAGE) return 0; // this scene has no stage

  const half = STAGE.width / 2;
  const left = STAGE.x - half;
  const right = STAGE.x + half;
  const rampLeftStart = left - STAGE.rampWidth;
  const rampRightEnd = right + STAGE.rampWidth;

  if (x >= left && x <= right) return PLATFORM_HEIGHT;
  if (x >= rampLeftStart && x < left) {
    const t = (x - rampLeftStart) / STAGE.rampWidth;
    return t * PLATFORM_HEIGHT;
  }
  if (x > right && x <= rampRightEnd) {
    const t = (rampRightEnd - x) / STAGE.rampWidth;
    return t * PLATFORM_HEIGHT;
  }
  return 0;
}

// --- Player sprite animation ---------------------------------------------
const playerSpriteEl = player.querySelector(".player-sprite");
// #player's box is his body. Its left is written every frame in the game
// loop; its size never changes.
mountBody(player, 0, PLAYER_WIDTH);

// columns is how many frames sit across one row of the sheet. Omit it
// for a plain single-row strip and it defaults to the frame count.
// Macario_Walking.png is a full 5 by 4 grid, 20 frames across 5 columns.
// Macario_Idle.png is a 5 + 5 + 5 + 1 grid, 16 frames across 5 columns.
// Both are real commissioned art, delivered this session, and live in
// assets/sprites/player (not assets/ directly) alongside any other sprite that
// is not specific to one act; see CLAUDE.md, Decisions on record.
// fps is carried over unchanged from the placeholder sheets these
// replace; it has not been checked against a phone yet.
//
// contentTop and contentHeight are measured from each sheet's own alpha
// channel (the union of every frame's non-transparent bounding box, in
// native pixels within the 256px cell), not eyeballed — see spriteFit,
// above loadSpriteSheet. Without them Macario's idle pose rendered
// visibly smaller than his walk cycle, both floated well above the
// ground, and neither matched an animated NPC like Nanay, because all
// of them were being scaled and grounded by the empty space in their
// frame rather than by the character actually drawn in it.
// The sheets Macario wears with nothing equipped. An outfit replaces
// whichever of the three it declares and leaves the rest alone, so a
// cosmetic that only redraws the walk cycle is a complete outfit.
const BASE_SPRITE_SHEETS = {
  idle: {
    src: "assets/sprites/player/macario-idle.png", frames: 16, fps: 6, columns: 5,
    contentTop: 73, contentHeight: 106, footX: 130,
  },
  walk: {
    src: "assets/sprites/player/macario-walk.png", frames: 20, fps: 12, columns: 5,
    contentTop: 60, contentHeight: 127, footX: 126,
  },
  dead: { src: "assets/sprites/player/macario-dead.png", frames: 5, fps: 6, columns: 5, loop: false },

  // Block 28. The redrawn shooting sheet: 5 by 3, 12 of its 15 cells,
  // played as two named views of the one image through startFrame and
  // endFrame (see Sprite sheets in CLAUDE.md). Frames 0-2 are the aim,
  // held on frame 2 while the button stays down. Frames 3-11 are the shot:
  // the muzzle flash is frame 3, then the recoil lifts the pistol and
  // brings it back down, played once at the instant the projectile
  // leaves. The fire clip starts ON the flash frame, so the flash and the
  // projectile appear together.
  //
  // contentTop/contentHeight are the union across all twelve frames, which
  // includes the pistol raised in recoil; a tighter pair would crop the
  // gun off the top of the box in frames 5-7. footX is from the feet, as
  // always. muzzle is the pistol's tip in frame 2, in the same native cell
  // pixels, and is where throwProjectile starts the shot.
  shootAim: {
    src: "assets/sprites/player/macario-shoot.png", frames: 12, fps: 8, columns: 5,
    startFrame: 0, endFrame: 2, loop: false,
    contentTop: 63, contentHeight: 126, footX: 117,
  },
  shootFire: {
    src: "assets/sprites/player/macario-shoot.png", frames: 12, fps: 18, columns: 5,
    startFrame: 3, endFrame: 11, loop: false,
    contentTop: 63, contentHeight: 126, footX: 117,
    muzzle: { x: 178, y: 87 },
  },

  // Block 27. The one-tap melee swing: a 4 by 3 sheet, 12 frames, played
  // once per tap (playMelee). 24fps puts the whole punch at half a second,
  // quick enough that a second tap never feels ignored. The file is a PNG
  // with transparency that happens to carry a .jpg name; browsers read the
  // bytes, not the extension, so it is referenced as delivered. The punch
  // dips about ten native pixels at full extension (frames 5 to 10), which
  // is the lunge in the art rather than a size error, so one
  // contentTop/contentHeight pair is right for it.
  melee: {
    src: "assets/sprites/player/macario-melee.png", frames: 12, fps: 24, columns: 4,
    loop: false,
    contentTop: 47, contentHeight: 109, footX: 96,
  },

  // Block 35. The jump: a 4 by 3 sheet, 9 frames. 0-2 crouch, 3 pushes
  // off, 4-6 are in the air, 7 comes down, 8 lands. The crouch is not
  // played: waiting for it before leaving the ground would put a delay
  // on a jump the student expects the instant they press. Three views of
  // the one image, chosen in the game loop from his vertical speed rather
  // than from time, so a short hop and a long fall both look right.
  //
  // This artist drew the jump's height INTO the cell: the tucked frames sit
  // 40 to 50 native pixels above the feet of the standing ones. The engine
  // already moves Macario up and down, so drawing that offset as well
  // would put him twice as high as his body. frameBottoms, one per frame
  // and measured with measure-sprite.js, puts each frame's own feet on the
  // ground of his body instead. contentHeight is the push-off frame's
  // height (3), which is a standing figure, so he is the same size in the
  // air as on the ground.
  jumpRise: {
    src: "assets/sprites/player/macario-jump.png", frames: 9, fps: 14, columns: 4,
    startFrame: 3, endFrame: 6, loop: false,
    contentTop: 44, contentHeight: 102, footX: 106,
    frameBottoms: [146, 146, 146, 145, 108, 95, 96, 120, 145],
  },
  jumpFall: {
    src: "assets/sprites/player/macario-jump.png", frames: 9, fps: 14, columns: 4,
    startFrame: 7, endFrame: 7, loop: false,
    contentTop: 44, contentHeight: 102, footX: 106,
    frameBottoms: [146, 146, 146, 145, 108, 95, 96, 120, 145],
  },
  jumpLand: {
    src: "assets/sprites/player/macario-jump.png", frames: 9, fps: 14, columns: 4,
    startFrame: 8, endFrame: 8, loop: false,
    contentTop: 44, contentHeight: 102, footX: 106,
    frameBottoms: [146, 146, 146, 145, 108, 95, 96, 120, 145],
  },
};

// The set actually in use. Reassigned by setOutfit, which is why this is
// a let; everything that draws the player reads it rather than the base.
let SPRITE_SHEETS = BASE_SPRITE_SHEETS;

// Sprite art does not fill its frame edge to edge. Every sheet in this
// project sits in a 256px-tall cell, but how much of that cell the artist
// actually drew the character into varies a lot sheet to sheet — Nanay's
// drawing fills about two thirds of hers, Macario's idle pose barely
// two fifths of his. Scaling every sheet so its FULL FRAME is
// DISPLAY_HEIGHT tall (what this used to do unconditionally) therefore
// rendered a different apparent character height per sheet, and left
// every one of them floating above the ground by however much empty
// space sits below the feet, because the box's bottom edge is the
// bottom of the FRAME, not the bottom of the drawing.
//
// A sheet may declare contentTop and contentHeight, in the sheet's own
// native pixels, to say where the drawn character actually sits inside
// its frame. These are measured from the real art's alpha channel
// (union of the non-transparent bounding box across every frame, so no
// pose gets clipped), not eyeballed, and are not something this engine
// derives on its own — a new sheet needs them measured the same way
// before it will line up with the others. spriteFit turns those two
// numbers into a scale that makes the CHARACTER, not the frame,
// DISPLAY_HEIGHT tall, plus the background-position shift that puts its
// feet at the box's bottom edge. A sheet with neither field falls back
// to the old behaviour exactly (contentTop 0, contentHeight the full
// frameHeight), which is what keeps every sheet nobody has measured yet
// — cosmetics with no art, the test harness's own fixtures — rendering
// exactly as it always has.
function spriteFit(sheet, displayHeight) {
  const contentHeight = sheet.contentHeight || sheet.frameHeight;
  // Block 40. headroom is native pixels ABOVE contentTop still to be
  // shown, for a pose that reaches over the head (a raised sword). The
  // character is still sized by contentHeight, so he stays the height of
  // everyone else; the element just grows upward to show the reach.
  const headroom = Math.min(sheet.headroom || 0, sheet.contentTop || 0);
  const contentTop = (sheet.contentTop || 0) - headroom;
  const scale = displayHeight / contentHeight;
  return {
    scale,
    boxHeight: displayHeight + headroom * scale,
    displayFrameWidth: sheet.frameWidth * scale,
    // The scaled distance from one row to the next in the background
    // image. Equal to displayHeight only in the no-correction case
    // (contentHeight === frameHeight); otherwise the scaled frame is
    // taller than the box it is cropped into, and stepping by
    // displayHeight instead of this would land on the wrong row.
    rowStep: sheet.frameHeight * scale,
    topOffset: contentTop * scale,
    // Where the character's feet stand, in rendered px from the sprite
    // element's own left edge. footX is measured the same way as
    // contentTop (_dev/tools/measure-sprite.js), from the feet rather than the
    // whole drawing, because an extended arm widens a drawing on one side
    // only. Absent, the middle of the cell, which is where an artist
    // centres a character by default and where every unmeasured sheet
    // (outfits with no art, the harness fixtures) is assumed to stand.
    footOffset: (typeof sheet.footX === "number" ? sheet.footX : sheet.frameWidth / 2) * scale,
  };
}

// Sizes a sprite element for a sheet and stands it on a body. The element
// is absolutely positioned inside its .entity, whose own box IS the body
// (left = x, width = the body width, see mountBody), so putting the feet
// at bodyWidth / 2 is all it takes for the art to stand where the logic
// stands. transform-origin is set to the same point so that facing left,
// a scaleX(-1), mirrors the character about his own feet instead of
// about the middle of a 300px cell, which would throw him sideways by
// however far the feet sit from that middle every time he turned.
//
// The one function every animated character goes through: the player
// (applyAnim), NPCs, guards and decorations (setupNpcAnimation). A
// second copy of this arithmetic anywhere is how the two drifted apart
// in the first place.
function bodySprite(el, sheet, displayHeight, bodyWidth) {
  const fit = spriteFit(sheet, displayHeight);
  el.style.width = fit.displayFrameWidth + "px";
  el.style.height = fit.boxHeight + "px";
  el.style.left = bodyWidth / 2 - fit.footOffset + "px";
  el.style.transformOrigin = fit.footOffset + "px 100%";
  // Quoted: an unquoted CSS url() breaks on the first space in the path,
  // and assets/sprites/characters/nanay.png has one. Without the quotes this silently
  // no-ops (backgroundImage stays "none") even though the preload
  // already succeeded and computed real frame geometry.
  el.style.backgroundImage = `url("${assetUrl(sheet.src)}")`;
  el.style.backgroundSize =
    sheet.naturalWidth * fit.scale + "px " + sheet.naturalHeight * fit.scale + "px";
  el.style.backgroundPositionY = -fit.topOffset + "px";
  el.style.backgroundPositionX = "0px";
  // Small pixel art scaled up several times is smeared into a blur by
  // the browser's default smoothing. Horse.png is a 32px cell drawn at
  // about four and a half times that. Every other sheet in this project
  // is painted at 256px and scaled DOWN or barely up (Macario's idle is
  // 1.26), where nearest-neighbour would only add jagged edges, so the
  // switch is made on the scale itself rather than declared per sheet:
  // a new sheet gets the right treatment without anyone remembering a
  // field. 2 is the point where a source pixel is at least two screen
  // pixels wide and smoothing starts to show as blur.
  el.style.imageRendering = fit.scale >= 2 ? "pixelated" : "";
  return fit;
}

// The placeholder box, stood on a body the same way: centred on it, and
// flipped about its own middle.
function bodyPlaceholder(el, filename, displayHeight, bodyWidth) {
  const width = Math.round(displayHeight * 0.7);
  showPlaceholder(el, filename, width, displayHeight);
  el.style.left = (bodyWidth - width) / 2 + "px";
  el.style.transformOrigin = "50% 100%";
}

// Makes an .entity element's box the body itself. Its children are drawn
// relative to this box and may overhang it freely; the box is what the
// camera, the debugging eye and the harness can trust to be where the
// logic thinks the character is.
function mountBody(el, x, bodyWidth, height) {
  el.style.left = x + "px";
  el.style.width = bodyWidth + "px";
  el.style.height = (height || DISPLAY_HEIGHT) + "px";
}

function loadSpriteSheet(def) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      def.naturalWidth = img.naturalWidth;
      def.naturalHeight = img.naturalHeight;

      // Grid geometry. A single-row strip is just the case where
      // columns equals frames and rows works out to 1, so this stays
      // backward compatible with every existing sheet.
      const columns = def.columns || def.frames;
      def.frameWidth = img.naturalWidth / columns;
      def.rows = Math.ceil(def.frames / columns);
      def.frameHeight = img.naturalHeight / def.rows;

      def.failed = false;
      resolve(def);
    };
    img.onerror = () => {
      def.failed = true;
      resolve(def); // resolve, not reject, so Promise.all never hangs
    };
    img.src = assetUrl(def.src);
  });
}

// Turns any element into a dashed placeholder box showing the missing
// filename. Used whenever an expected image or sprite sheet fails to load.
function showPlaceholder(el, filename, width, height) {
  el.style.backgroundImage = "none";
  el.style.width = width + "px";
  el.style.height = height + "px";
  el.style.display = "flex";
  el.style.alignItems = "center";
  el.style.justifyContent = "center";
  el.style.textAlign = "center";
  el.style.padding = "4px";
  el.style.boxSizing = "border-box";
  el.style.border = "2px dashed #ffd54f";
  el.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
  el.style.color = "#ffd54f";
  el.style.fontSize = "11px";
  el.style.lineHeight = "1.3";
  el.style.overflowWrap = "break-word";
  el.textContent = filename;
  // Block 37. Marked so a rule that mirrors real art for facing (a guard
  // turning, style.css) can leave a box of text readable.
  el.classList.add("sprite-placeholder");
}

// Undo showPlaceholder's inline styles so a real sprite renders cleanly.
function clearPlaceholder(el) {
  el.classList.remove("sprite-placeholder");
  el.textContent = "";
  el.style.display = "";
  el.style.border = "";
  el.style.backgroundColor = "";
  el.style.color = "";
  el.style.fontSize = "";
  el.style.padding = "";
}

let spritesReady = false;
let currentAnim = "idle";
let currentFrame = 0;
let lastFrameTime = 0;
let facing = 1; // 1 = facing right, -1 = facing left

Promise.all([
  loadSpriteSheet(SPRITE_SHEETS.idle),
  loadSpriteSheet(SPRITE_SHEETS.walk),
  loadSpriteSheet(SPRITE_SHEETS.dead),
  loadSpriteSheet(SPRITE_SHEETS.shootAim),
  loadSpriteSheet(SPRITE_SHEETS.shootFire),
  loadSpriteSheet(SPRITE_SHEETS.melee),
  loadSpriteSheet(SPRITE_SHEETS.jumpRise),
  loadSpriteSheet(SPRITE_SHEETS.jumpFall),
  loadSpriteSheet(SPRITE_SHEETS.jumpLand),
]).then(() => {
  spritesReady = true;
  applyAnim(currentAnim, true);
});

// Swaps the player's sheets for an outfit's, or back to the base set when
// passed nothing. inventory.js is the only caller.
//
// A sheet that fails to load is NOT special-cased. It goes through the same
// dashed placeholder every other missing image in this project goes
// through, showing the filename it wanted, which is how the artist finds
// out what to draw. Hiding an outfit until its art exists would mean two
// behaviours for one situation.
async function setOutfit(sheets) {
  const next = Object.assign({}, BASE_SPRITE_SHEETS);

  if (sheets) {
    ["idle", "walk", "dead"].forEach((name) => {
      if (sheets[name] && sheets[name].src) next[name] = sheets[name];
    });
  }

  SPRITE_SHEETS = next;

  // loadSpriteSheet caches its geometry onto the def, so re-loading the
  // base sheets costs a cache hit and nothing else. It resolves rather
  // than rejects on a missing file, so this never hangs.
  await Promise.all([
    loadSpriteSheet(next.idle),
    loadSpriteSheet(next.walk),
    loadSpriteSheet(next.dead),
  ]);

  spritesReady = true;
  applyAnim(currentAnim, true);
}

function applyAnim(name, force) {
  if (!spritesReady) return;
  if (currentAnim === name && !force) return;
  currentAnim = name;

  const sheet = SPRITE_SHEETS[name];
  // startFrame lets a sheet declare it plays a sub-range of a larger
  // image (see shootAim/shootFire above) rather than always starting at
  // frame 0. Absent, this is exactly frame 0, as every sheet before them
  // behaved.
  currentFrame = sheet.startFrame || 0;
  lastFrameTime = 0;

  if (sheet.failed) {
    bodyPlaceholder(playerSpriteEl, sheet.src, DISPLAY_HEIGHT, PLAYER_WIDTH);
    return;
  }

  clearPlaceholder(playerSpriteEl);

  // The character, not the frame, is DISPLAY_HEIGHT tall with its feet on
  // the ground (spriteFit), and those feet stand on the middle of his body
  // (bodySprite). Each sheet carries its own footX, so switching from idle
  // to walk to the shooting pose never slides him sideways.
  bodySprite(playerSpriteEl, sheet, DISPLAY_HEIGHT, PLAYER_WIDTH);
  // Draw the clip's own first frame now. bodySprite leaves the picture on
  // frame 0, which for a clip that starts later in its sheet (the fire
  // clip at 3, the jump at 3) showed the wrong pose for one frame tick,
  // long enough to see on a jump.
  drawPlayerFrame(sheet);
}

// Positions the background on currentFrame. frameBottoms, when a sheet
// has it, grounds each frame by its own feet (see jumpRise, above).
function drawPlayerFrame(sheet) {
  const columns = sheet.columns || sheet.frames;
  const column = currentFrame % columns;
  const row = Math.floor(currentFrame / columns);
  const fit = spriteFit(sheet, DISPLAY_HEIGHT);
  let topOffset = fit.topOffset;
  if (Array.isArray(sheet.frameBottoms) && typeof sheet.frameBottoms[currentFrame] === "number") {
    const contentHeight = sheet.contentHeight || sheet.frameHeight;
    topOffset = (sheet.frameBottoms[currentFrame] + 1 - contentHeight) * fit.scale;
  }
  playerSpriteEl.style.backgroundPositionX = -(column * fit.displayFrameWidth) + "px";
  playerSpriteEl.style.backgroundPositionY = -(row * fit.rowStep + topOffset) + "px";
}

function updateAnimFrame(now) {
  if (!spritesReady) return;
  const sheet = SPRITE_SHEETS[currentAnim];

  // A missing sheet has no frames to step, but the placeholder box
  // should still face the right way, so the flip below is not skipped.
  if (!sheet.failed) {
    const frameDuration = 1000 / sheet.fps;

    if (now - lastFrameTime >= frameDuration) {
      lastFrameTime = now;

      // A sheet may declare startFrame/endFrame to play only part of
      // itself (see shootAim/shootFire, above BASE_SPRITE_SHEETS).
      // Absent, this is 0 and frames - 1, exactly the old behaviour.
      const startFrame = sheet.startFrame || 0;
      const endFrame = sheet.endFrame != null ? sheet.endFrame : sheet.frames - 1;

      if (sheet.loop === false) {
        if (currentFrame < endFrame) currentFrame++;
        // else hold on endFrame
      } else {
        currentFrame = currentFrame + 1 > endFrame ? startFrame : currentFrame + 1;
      }

      // Frame index to grid position. For a 5-column Walk sheet,
      // frame 5 wraps to column 0 of row 1 rather than running off
      // the right edge of the image.
      drawPlayerFrame(sheet);
    }
  }

  // Flip to face the direction of travel
  playerSpriteEl.style.transform = `scaleX(${facing})`;
}

let posX = 0;
let posY = GROUND_LEVEL; // distance from the bottom of the world, in px
let velY = 0;
let onGround = true;

let health = maxHealth;
let invulnUntil = 0; // timestamp; damage before this is ignored

// --- Measurement ---------------------------------------------------------
// Per-act counters. The engine counts; acts.js reads them through
// Game.stats() and writes them to act_progress. game.js still knows
// nothing about what an act is, which is the point.
//
// Unlike health, these are PERSISTED, inside game_progress.save_state.
// Health is a moment-to-moment resource and restoring it on load is a
// kindness. These are a record, and a student who closes the tab halfway
// through an act and resumes later would otherwise restart both counters
// at zero, making their survival and stealth terms read perfect for the
// half they replayed. On a shared classroom phone that is not an edge
// case, and the whole point of these numbers is that they are trusted.
let damageTaken = 0;
let detections = 0;
let playMs = 0; // unpaused, unblocked play time

// --- Currency ------------------------------------------------------------
// Lives here because game.js is the only writer of game_progress, and
// currency is save state exactly like quests, flags and position. acts.js
// awards it and inventory.js spends it, both through the facade; neither
// touches the column.
//
// Client written, per the decision on record. A student with the console
// open can set it to anything, which is acceptable because it buys
// cosmetics only and touches nothing the teacher dashboard reports. That
// belongs in the documentation rather than in a defence nobody asked for.
let currency = 0;

let currentRoom = "road"; // the current scene id, persisted as-is
let authGated = true; // true until the player is logged in
let inDialogue = false;
let cutscenePlaying = false; // locks movement for the whole stage sequence
let scriptWalking = false; // Block 57: movePlayer is carrying him
// What was last written to the player element, so an unmoved frame writes
// nothing (Block 36).
let lastDrawnX = null;
let lastDrawnY = null;
let lastCameraX = null;

// Raised while acts.js or assessment.js has a full-screen overlay up.
// Kept separate from cutscenePlaying so a trivia card or a test does
// not read as a cutscene to the animation code, which deliberately
// leaves the current sprite alone during one.
let uiBlocked = false;

function setUiBlocked(value) {
  uiBlocked = Boolean(value);
}
let dialogueStep = 0;
let activeNpc = null;
let activeSet = null;
let activeMode = null; // "npc" | "gift" | "cutscene-part1" | "cutscene-part2"
let nearby = { type: null, ref: null };

const blackout = document.getElementById("blackout");
const skylineNight = document.getElementById("skyline-night");

// The pre-login backdrop. enterGameAsUser() reloads whichever act
// game_progress.current_act names once the student is known; until
// then the auth overlay covers this entirely.
loadAct(window.ACT_1);

const keysPressed = {};

document.addEventListener("keydown", (e) => {
  const key = (e.key || "").toLowerCase();
  const wasDown = keysPressed[key];
  keysPressed[key] = true;

  if (key === "e") handleInteractPress();

  // Guarded on wasDown so holding a key does not re-fire on autorepeat.
  if (!wasDown && (key === " " || key === "w" || key === "arrowup")) {
    e.preventDefault();
    handleJumpPress();
  }

  if (!wasDown && key === "j") startAttackHold();
});

document.addEventListener("keyup", (e) => {
  if ((e.key || "").toLowerCase() === "j") endAttackHold();
});

function handleJumpPress() {
  if (authGated || uiBlocked || inDialogue || cutscenePlaying) return;
  if (!onGround) return; // single jump, no double jump by decision
  velY = JUMP_VELOCITY;
  onGround = false;
}

document.addEventListener("keyup", (e) => {
  keysPressed[(e.key || "").toLowerCase()] = false;
});

// --- Mobile controls ---
function bindHold(button, key) {
  const start = (e) => {
    e.preventDefault();
    keysPressed[key] = true;
  };
  const end = (e) => {
    e.preventDefault();
    keysPressed[key] = false;
  };
  button.addEventListener("touchstart", start);
  button.addEventListener("touchend", end);
  button.addEventListener("touchcancel", end);
  button.addEventListener("mousedown", start);
  button.addEventListener("mouseup", end);
  button.addEventListener("mouseleave", end);
}

bindHold(btnLeft, "a");
bindHold(btnRight, "d");

const btnJump = document.getElementById("btn-jump");
const btnAttack = document.getElementById("btn-attack");

if (btnJump) {
  const jump = (e) => {
    e.preventDefault();
    handleJumpPress();
  };
  btnJump.addEventListener("touchstart", jump, { passive: false });
  btnJump.addEventListener("mousedown", jump);
}

// Attack is press-and-release rather than click, because the hold
// duration is what chooses between a swing and a throw.
if (btnAttack) {
  const down = (e) => {
    e.preventDefault();
    startAttackHold();
  };
  const up = (e) => {
    e.preventDefault();
    endAttackHold();
  };
  btnAttack.addEventListener("touchstart", down, { passive: false });
  btnAttack.addEventListener("touchend", up);
  btnAttack.addEventListener("touchcancel", up);
  btnAttack.addEventListener("mousedown", down);
  btnAttack.addEventListener("mouseup", up);
  btnAttack.addEventListener("mouseleave", up);
}

btnInteract.addEventListener("click", (e) => {
  e.preventDefault();
  handleInteractPress();
});
btnInteract.addEventListener(
  "touchstart",
  (e) => {
    e.preventDefault();
    handleInteractPress();
  },
  { passive: false }
);

giftBtn.addEventListener("click", (e) => {
  e.preventDefault();
  if (nearby.type === "npc" && nearby.ref.gift && canGiveGift(nearby.ref)) {
    startGift(nearby.ref);
  }
});

// --- Interaction / dialogue ---
// The empty space between two entities' own bounding boxes, given each
// one's left-edge anchor and width, rather than the raw distance
// between the anchors themselves — 0 once they overlap, never
// negative. Comparing anchors directly (the player's posX against an
// NPC's npc.x) used to be what findNearby did, and since the player
// is 40px wide (PLAYER_WIDTH) and an NPC is roughly 80 (NPC_WIDTH),
// that quietly needed a different amount of walking depending on
// which side Macario approached from: from the left, npc.x is past
// the NPC's own far edge, so the anchor-to-anchor distance undercounts
// how close he already is and the prompt appears early, well before
// contact; from the right, npc.x is the NPC's NEAR edge, so the same
// math overcounts the gap and nothing happens until Macario's own body
// has all but swallowed the NPC's — which is what made it feel like
// interaction only worked "from the far right" of a thing. Measuring
// the gap between the boxes themselves removes the direction from the
// answer entirely.
function edgeGap(aX, aWidth, bX, bWidth) {
  const aCentre = aX + aWidth / 2;
  const bCentre = bX + bWidth / 2;
  return Math.max(0, Math.abs(aCentre - bCentre) - (aWidth + bWidth) / 2);
}

function findNearby() {
  let closest = null;
  let closestType = null;
  let closestDist = Infinity;

  // Block 48. Nobody to talk to mid-fight: the moro-moro's Maryam is an
  // NPC now, standing in the middle of it.
  const talkable = enemiesAlive() ? [] : NPCS;
  for (const npc of talkable) {
    if (npc.hidden) continue;
    const dist = edgeGap(posX, PLAYER_WIDTH, npc.x, NPC_WIDTH);
    if (dist < INTERACT_DISTANCE && dist < closestDist) {
      closest = npc;
      closestType = "npc";
      closestDist = dist;
    }
  }

  // Block 34. Doorways to another scene. An exit is a zone on the road,
  // x and width like a hazard, reached the same edge-to-edge way an NPC
  // is, so standing at the stairs of the entablado is enough.
  // No way out mid-fight (Block 35): walking out would unload the enemies
  // and the fight with them.
  const exits = enemiesAlive() ? [] : (currentScene && currentScene.exits) || [];
  for (const exit of exits) {
    // Block 37. An exit may wait on a story flag: the road out of tondo
    // opens only once the Katipunan has given Macario somewhere to go.
    if (exit.requiresFlag && !state.flags[exit.requiresFlag]) continue;
    const dist = edgeGap(posX, PLAYER_WIDTH, exit.x, exit.width || 80);
    if (dist < INTERACT_DISTANCE && dist < closestDist) {
      closest = exit;
      closestType = "exit";
      closestDist = dist;
    }
  }

  if (STAGE) {
    // STAGE.x is the stage's centre, so it is compared with the centre
    // of the body rather than its left edge.
    const stageDist = Math.abs(posX + PLAYER_WIDTH / 2 - STAGE.x);
    if (stageDist < INTERACT_DISTANCE && stageDist < closestDist) {
      closest = STAGE;
      closestType = "stage";
      closestDist = stageDist;
    }
  }

  return { type: closestType, ref: closest };
}

function canGiveGift(npc) {
  const gift = npc.gift;
  if (!gift) return false;
  if (!state.flags[gift.requiresFlag]) return false;
  if (state.flags[gift.givenFlag]) return false;
  return true;
}

// Set by shell.js, the only thing that knows how to open the shop
// screen (Shell._openShop). Content marks an NPC opensShop: true (a
// Tindero, say) to skip dialogue entirely and ask for the shop
// instead; the engine does not know what a shop is, only that
// something wants to hear about this, the same shape Inventory.onChange
// already uses in the other direction.
let shopRequestListener = null;

// sellerId is the NPC's id, so a shop can stock only what that seller
// sells (Inventory.forSale). The corner button passes none.
function requestShop(sellerId) {
  if (shopRequestListener) shopRequestListener(sellerId || null);
}

// Block 32. An NPC may open the shop from the start (opensShop: true,
// Tindero) or only once a flag is set (opensShopAfter, the Mananahi,
// who talks first and sells afterwards).
function npcOpensShop(npc) {
  if (!npc) return false;
  if (npc.opensShop) return true;
  return Boolean(npc.opensShopAfter && state.flags[npc.opensShopAfter]);
}

function handleInteractPress() {
  if (authGated || uiBlocked) return;
  if (inDialogue) {
    advanceDialogue();
  } else if (cutscenePlaying) {
    // ignore E while the performance or blackout sequence runs
  } else if (nearby.type === "npc" && npcOpensShop(nearby.ref)) {
    requestShop(nearby.ref.id);
  } else if (nearby.type === "npc" && typeof nearby.ref.onInteract === "function") {
    // Block 57. Something to use rather than someone to talk to (the
    // apple tree): content decides what pressing E does, the way a
    // gift's onComplete does. No dialogue box is opened for it here.
    nearby.ref.onInteract();
  } else if (nearby.type === "npc") {
    startDialogue(nearby.ref);
  } else if (nearby.type === "stage") {
    startPerformance();
  } else if (nearby.type === "exit" && window.Acts) {
    const exit = nearby.ref;
    Acts.gotoScene(exit.toScene, { x: exit.toX, facing: exit.toFacing });
  }
}

function startDialogue(npc) {
  activeNpc = npc;
  activeMode = "npc";
  let setIndex = Math.min(npc.stage, npc.dialogueSets.length - 1);
  // Block 31. buildNpcs resets stage to 0 on every scene load, which is
  // right for a scene seen once and wrong for one the story comes back
  // to: returning to tondo after the flashback replayed Nanay's opening
  // errand. A set whose skipIfFlag is already true is a beat that has
  // happened, so conversation starts past it. Read from the flags rather
  // than stored on the NPC, so a reload lands on the same set.
  while (
    setIndex < npc.dialogueSets.length - 1 &&
    npc.dialogueSets[setIndex].skipIfFlag &&
    state.flags[npc.dialogueSets[setIndex].skipIfFlag]
  ) {
    setIndex++;
  }
  // Block 48. A set may also wait on a flag (requiresFlag). An NPC that
  // declares one picks its set from the flags alone, each time: the first
  // set that is neither passed (skipIfFlag) nor still waiting
  // (requiresFlag), else the last. That lets someone say one thing
  // before a step of the story and another after it, whichever order
  // the student meets them in, without a conversation moving him on.
  if (npc.dialogueSets.some((d) => d.requiresFlag)) {
    const i = npc.dialogueSets.findIndex((d) =>
      !(d.skipIfFlag && state.flags[d.skipIfFlag]) &&
      !(d.requiresFlag && !state.flags[d.requiresFlag]));
    setIndex = i === -1 ? npc.dialogueSets.length - 1 : i;
  }
  npc.stage = setIndex;
  activeSet = npc.dialogueSets[setIndex];
  inDialogue = true;
  dialogueStep = 0;
  dialogueBox.classList.remove("hidden");
  showDialogueStep();
}

function startGift(npc) {
  activeNpc = npc;
  activeMode = "gift";
  activeSet = { lines: npc.gift.responseLines };
  inDialogue = true;
  dialogueStep = 0;
  dialogueBox.classList.remove("hidden");
  showDialogueStep();
}

function startPerformance() {
  if (cutscenePlaying) return;
  cutscenePlaying = true;
  // Same reasoning as respawnInScene: don't let a held attack button
  // leave the shooting pose stuck across a scene the player no longer
  // controls.
  attackHoldStart = 0;
  shooting = null;
  clearTimeout(shootFireTimer);
  activeNpc = null;
  activeMode = "cutscene-part1";
  activeSet = { lines: STAGE.poemPart1 };
  inDialogue = true;
  dialogueStep = 0;
  dialogueBox.classList.remove("hidden");
  showDialogueStep();
}

function showDialogueStep() {
  const line = activeSet.lines[dialogueStep];
  dialogueSpeaker.textContent = line.speaker;
  dialogueText.textContent = line.text;
}

function advanceDialogue() {
  dialogueStep++;
  if (dialogueStep >= activeSet.lines.length) {
    endDialogue();
  } else {
    showDialogueStep();
  }
}

function endDialogue() {
  const finishedMode = activeMode;
  const finishedNpc = activeNpc;
  const finishedSet = activeSet;

  inDialogue = false;
  dialogueBox.classList.add("hidden");

  if (finishedMode === "gift") {
    const gift = finishedNpc.gift;
    state.flags[gift.givenFlag] = true;
    markDirty();
    if (gift.completesQuest) completeQuest(gift.completesQuest);
    // Same shape as a dialogueSet's onComplete, one step later: a gift
    // can end an errand (a scene change, say) exactly the way finishing
    // a conversation already can. Optional — most gifts so far have had
    // nothing further to do once the flag and the quest were set.
    if (gift.onComplete) gift.onComplete();
  } else if (finishedMode === "npc") {
    if (finishedSet.onComplete) {
      finishedSet.onComplete();
      if (finishedNpc.stage < finishedNpc.dialogueSets.length - 1) {
        finishedNpc.stage++;
      }
    }
    // The conversation that sets an opensShopAfter flag ends straight
    // into the shop, so "pay me first" is followed by somewhere to pay
    // rather than by a second press of E.
    if (finishedNpc.opensShopAfter && state.flags[finishedNpc.opensShopAfter]) {
      requestShop(finishedNpc.id);
    }
  } else if (finishedMode === "script") {
    const resolve = finishedSet.resolve;
    if (resolve) setTimeout(resolve, 0); // after the state below is cleared
  } else if (finishedMode === "arrival") {
    // Set on the way OUT, not in: a reload mid-conversation should hear
    // it again rather than lose it.
    if (finishedSet.doneFlag) state.flags[finishedSet.doneFlag] = true;
    markDirty();
    if (finishedSet.onComplete) finishedSet.onComplete();
  } else if (finishedMode === "cutscene-part1") {
    // First half of the poem is done. Fade to night, then continue.
    runNightTransition();
  } else if (finishedMode === "cutscene-part2") {
    // Second half is done. Now the death animation and blackout.
    runDeathSequence();
  }

  activeNpc = null;
  activeSet = null;
  activeMode = null;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runNightTransition() {
  blackout.classList.add("visible");
  await wait(900); // fade to black

  buildSkylineTiles(["skyline-night"]); // built now rather than at every load
  skylineNight.classList.add("visible"); // swap while hidden behind black
  markDirty();

  await wait(400); // hold black briefly
  blackout.classList.remove("visible");

  await wait(900); // fade back in, revealing the night scene
  activeMode = "cutscene-part2";
  activeSet = { lines: STAGE.poemPart2 };
  inDialogue = true;
  dialogueStep = 0;
  dialogueBox.classList.remove("hidden");
  showDialogueStep();
}

async function runDeathSequence() {
  applyAnim("dead", true);
  const deadSheet = SPRITE_SHEETS.dead;
  const animMs = (deadSheet.frames / deadSheet.fps) * 1000;

  await wait(animMs + 400); // let the animation finish and hold
  blackout.classList.add("visible");

  await wait(900); // fade to black and hold
  blackout.classList.remove("visible");

  await wait(900); // fade back in, scene now permanently night
  applyAnim("idle", true);
  cutscenePlaying = false;

  state.flags.deathSequenceDone = true;

  // Content may hide an NPC behind this moment by declaring
  // deathSequenceDone as its revealedByFlag, so setting the flag above
  // is all this needs to know. The engine does not know which NPC, or
  // whether there is one at all.
  revealNpcsByFlag();

  markDirty();
  saveProgress(); // save immediately rather than waiting for the next tick
}

// teleportToNewRoom() and hideActWorld() lived here. Both existed
// only to serve the placeholder Act I ending, which faded to black
// and left the player in an empty room with no interactables and no
// way out. Acts.showTransition() replaces that, so both are gone
// rather than kept as dead code. Saves written by the old ending are
// migrated in applyLoadedState().

// A plain scene-to-scene move under cover of black, for content that
// wants the fade without the stage's poem/death machinery around it.
// Reuses the same #blackout element and hold/fade timings as
// runNightTransition/runDeathSequence above rather than inventing a
// second blackout mechanism. Acts.gotoScene calls this rather than
// loadScene directly.
//
// cutscenePlaying is set for the duration so movement, jumping,
// attacking and interacting are all suppressed the same way they
// already are for the stage sequence (see handleInteractPress,
// handleJumpPress, canAct in the game loop, and playerIsSafe) — a
// scene swap mid-stride would otherwise be visible for a frame on
// either side of the blackout, and an interact press during the fade
// could fire against a scene that is no longer the one on screen. The
// same defensive clear startPerformance and respawnInScene already do
// is repeated here, since a fade can just as easily start with the
// attack button held down as either of those can.
async function fadeToScene(sceneId, placement) {
  cutscenePlaying = true;
  attackHoldStart = 0;
  shooting = null;
  clearTimeout(shootFireTimer);

  blackout.classList.add("visible");
  await wait(900); // fade to black

  loadScene(sceneId); // swap while hidden behind black

  // Block 34. Where to stand in the new scene when it is not its startX:
  // coming back out of the entablado lands at its door, not at the far
  // end of the road. An arrival dialogue's own x, below, still wins.
  if (placement && typeof placement.x === "number") {
    posX = Math.max(0, Math.min(placement.x, WORLD_WIDTH - PLAYER_WIDTH));
    posY = groundHeightAt(posX);
    velY = 0;
  }
  if (placement && (placement.facing === 1 || placement.facing === -1)) {
    facing = placement.facing;
  }

  // Block 31. Chosen and placed while the screen is still black, so a
  // student never sees Macario jump from the scene's startX to where the
  // conversation needs him.
  const arrival = pendingArrival(currentScene);
  if (!arrival) placeForSceneScript(pendingSceneScript(currentScene));
  if (arrival && typeof arrival.x === "number") {
    posX = Math.max(0, Math.min(arrival.x, WORLD_WIDTH - PLAYER_WIDTH));
    posY = groundHeightAt(posX);
    velY = 0;
    if (arrival.facing === 1 || arrival.facing === -1) facing = arrival.facing;
  }

  await wait(400); // hold black briefly, same as runNightTransition
  blackout.classList.remove("visible");

  // Each scene's own music, or Calm (Block 35), so a fight's track never
  // follows him out of the room it was fought in.
  setMusic(currentScene && currentScene.music);

  await wait(900); // fade back in
  cutscenePlaying = false;

  // After the fade-in rather than during it, so the first line is read
  // against the scene it belongs to and not against black.
  if (arrival) startArrivalDialogue(arrival);
  // Block 52. A scene script plays through a fade too, when no arrival
  // conversation has claimed the moment.
  else runSceneScript();
}

// A scene's arrivalDialogues are conversations that open by themselves
// when the scene is entered through a fade, with nobody to talk to: a
// voice in a memory, or a reply the moment the memory ends. The first
// entry whose requiresFlag is set (or that has none) and whose doneFlag
// is not yet set is the one that plays. doneFlag is what makes it once
// only, and it lives in state.flags, so it survives a reload the way an
// objective does.
function pendingArrival(scene) {
  const list = (scene && scene.arrivalDialogues) || [];
  return list.find((a) =>
    (!a.requiresFlag || state.flags[a.requiresFlag]) &&
    !(a.doneFlag && state.flags[a.doneFlag]) &&
    !(a.unlessFlag && state.flags[a.unlessFlag]) &&
    Array.isArray(a.lines) && a.lines.length
  ) || null;
}

// =============================================================
// SCENE SCRIPTS (Block 52)
//
// A scene's scripts are cutscenes that play by themselves, written in
// content as an async function out of the Block 35 calls (playDialogue,
// setCutscene, moveDecoration and the rest). They differ from
// arrivalDialogues in one way that matters: they also play on a login or
// reload into the scene, once the title, trivia and pre-test are out of
// the way, because an act's opening is a script and a student meeting
// the act for the first time arrives by logging in, not through a fade.
//
//   scripts: [{ requiresFlag, unlessFlag, doneFlag, x, facing, run }]
//
// The first entry whose requiresFlag is set (or that has none), whose
// unlessFlag and doneFlag are not, is the one that plays. doneFlag is set
// when run() resolves, not when it starts, so a student who reloads in
// the middle watches it again from the top rather than landing past a
// scene they never saw. x and facing place Macario before it starts
// (under the blackout, through a fade). A script that changes scene
// should call Acts.gotoScene without awaiting it as its last step, or
// its doneFlag lands only after the next scene has already begun.
// =============================================================

const sceneScriptsRunning = new Set();

function pendingSceneScript(scene) {
  const list = (scene && scene.scripts) || [];
  return list.find((s) =>
    typeof s.run === "function" &&
    !sceneScriptsRunning.has(s) &&
    (!s.requiresFlag || state.flags[s.requiresFlag]) &&
    !(s.doneFlag && state.flags[s.doneFlag]) &&
    !(s.unlessFlag && state.flags[s.unlessFlag])
  ) || null;
}

function placeForSceneScript(entry) {
  if (!entry) return;
  if (typeof entry.x === "number") {
    posX = Math.max(0, Math.min(entry.x, WORLD_WIDTH - PLAYER_WIDTH));
    posY = groundHeightAt(posX);
    velY = 0;
  }
  if (entry.facing === 1 || entry.facing === -1) facing = entry.facing;
}

async function runSceneScript() {
  const entry = pendingSceneScript(currentScene);
  if (!entry) return;
  placeForSceneScript(entry);
  sceneScriptsRunning.add(entry);
  // The script owns setCutscene. It is not cleared here on the way out,
  // because a script that ends by starting a fade has already handed the
  // flag to fadeToScene, and clearing it would free Macario mid-fade.
  try {
    await entry.run();
    // Set even when the script ended by leaving the scene: the beat
    // has happened either way.
    if (entry.doneFlag) {
      state.flags[entry.doneFlag] = true;
      markDirty();
    }
  } catch (err) {
    console.error("Scene script failed:", err);
  } finally {
    sceneScriptsRunning.delete(entry);
  }
}

// Called once from each entry path, after the world has been handed to
// the student: from here on a change of step is news worth announcing,
// and the scene the student landed in may have a script waiting.
function enterWorldScripts() {
  questAnnounceReady = true;
  if (currentActData && currentActData.linearObjectives) renderQuests();
  runSceneScript();
}

function startArrivalDialogue(arrival) {
  activeNpc = null;
  activeMode = "arrival";
  activeSet = arrival;
  inDialogue = true;
  dialogueStep = 0;
  dialogueBox.classList.remove("hidden");
  showDialogueStep();
}

// =============================================================
// SCENE FURNITURE
// =============================================================

function buildPlatforms() {
  PLATFORMS.forEach((plat, i) => {
    const el = document.createElement("div");
    el.className = "platform";
    el.id = "plat-" + i;
    el.style.left = plat.x + "px";
    el.style.width = plat.width + "px";
    el.style.bottom = plat.y + "px";
    el.style.height = "14px";
    world.appendChild(el);
    actElements.push(el);
  });
}

function buildHideSpots() {
  HIDE_SPOTS.forEach((spot, i) => {
    const el = document.createElement("div");
    el.className = "hide-spot";
    el.id = "hide-" + i;
    el.style.left = spot.x + "px";
    el.style.width = spot.width + "px";
    world.appendChild(el);
    actElements.push(el);
  });
}

// Guards carry their own runtime state, reset on every scene load so a
// respawn starts them where the level designer put them rather than
// wherever they happened to be standing.
function buildGuards(token) {
  // The act number comes from the act data in hand, NOT from window.Acts.
  // loadAct runs at parse time to draw the backdrop behind the login box,
  // and acts.js has not executed yet at that point, so Acts.current would
  // be undefined on the first build and every guard would be created
  // unscaled.
  const speedScale = difficultyMultiplier(
    currentActData && currentActData.number
  );

  GUARDS = ((currentScene && currentScene.guards) || []).map((def) =>
    Object.assign({}, def, {
      pos: def.x,
      baseSpeed: def.speed || 1.4,
      speed: (def.speed || 1.4) * speedScale,
      facing: def.facing || 1,
      // Kept separately because respawnInScene needs the facing the level
      // gave this guard, not the one it happened to be walking in. Without
      // it every guard resets to facing right, including the outpost
      // sentry the content deliberately faces left.
      facingStart: def.facing || 1,
      alert: 0,
      disabled: false,
      // Block 37. A guard that shoots fires once its meter fills instead
      // of catching, and then waits this long before it can fire again.
      nextShotAt: 0,
      // Block 38. A shooting guard who has seen Macario stays on him.
      hostile: false,
      hp: def.hp || GUARD_HP,
      maxHp: def.hp || GUARD_HP,
      chaseSpeed: GUARD_CHASE_SPEED * speedScale,
      // What was last written to the page, so the loop writes only on a
      // change (Block 36).
      drawnFill: -1,
      drawnFacing: 0,
      drawnAlerted: null,
    })
  );

  GUARDS.forEach((guard) => {
    const el = document.createElement("div");
    el.className = "entity guard";
    el.id = "guard-" + guard.id;
    mountBody(el, guard.pos, GUARD_WIDTH);

    const meter = document.createElement("div");
    meter.className = "guard-meter";
    const fill = document.createElement("div");
    fill.className = "guard-meter-fill";
    meter.appendChild(fill);
    el.appendChild(meter);

    // Block 37. The ground he can see, drawn. Which way a guard faces and
    // how far he sees are the whole of the stealth rule, and neither was
    // visible before: a placeholder box has no front. The band starts at
    // the middle of his body and runs detectRadius, the same centre to
    // centre distance updateGuards measures, so the picture and the rule
    // are one number. It lies on the floor, so standing on a platform
    // above it reads as being out of his sight, which is what it is.
    const sight = document.createElement("div");
    sight.className = "guard-sight";
    sight.style.width = (guard.detectRadius || 240) + "px";
    el.appendChild(sight);

    if (guard.animation) {
      const sprite = document.createElement("div");
      sprite.className = "sprite npc-sprite npc-anim-sprite";
      el.appendChild(sprite);
      world.appendChild(el);
      setupNpcAnimation(guard.animation, sprite, DISPLAY_HEIGHT, token, GUARD_WIDTH);
    } else {
      const sprite = document.createElement("div");
      sprite.className = "sprite npc-sprite";
      bodyPlaceholder(sprite, guard.img || "Guard", DISPLAY_HEIGHT, GUARD_WIDTH);
      el.appendChild(sprite);
      world.appendChild(el);
    }

    guard.el = el;
    guard.fillEl = fill;
    actElements.push(el);
  });
}

// Hazards are drawn rather than invisible, for the same reason the hide
// spots are drawn as crates: a mechanic that has to be learned without a
// tutorial has to be visible before it is felt.
function buildHazards() {
  HAZARDS.forEach((hazard, i) => {
    const el = document.createElement("div");
    el.className = "hazard";
    el.id = "hazard-" + i;
    el.style.left = hazard.x + "px";
    el.style.width = hazard.width + "px";
    world.appendChild(el);
    actElements.push(el);
  });
}

// Pickups reuse the HUD heart shape rather than an image. Art is an
// external blocker on this project, and a pickup that renders as a
// dashed placeholder box teaches nothing.
function buildPickups() {
  PICKUPS.forEach((pickup) => {
    const el = document.createElement("div");
    el.className = "pickup pickup-" + (pickup.type || "heart");
    el.id = "pickup-" + pickup.id;
    el.style.left = pickup.x + "px";
    // y is optional and defaults to the floor, so a heart can be put on a
    // platform to make the jump worth using.
    el.style.bottom =
      (typeof pickup.y === "number" ? pickup.y : GROUND_LEVEL) + "px";
    world.appendChild(el);
    actElements.push(el);
    pickup.el = el;
  });
}

function inHideSpot(x) {
  const centre = x + PLAYER_WIDTH / 2;
  return HIDE_SPOTS.some(
    (spot) => centre >= spot.x && centre <= spot.x + spot.width
  );
}

// =============================================================
// STEALTH
//
// Detection is a meter rather than a switch. A bar that is visibly
// filling is what teaches the mechanic; an instant catch teaches only
// that the level is unfair. No line of sight calculation, per the
// decision already on record: being in front and within radius is the
// whole test.
// =============================================================

// Block 37. Standing on a platform at least this high above the floor is
// out of a guard's sight. A guard watches the road, and a student who has
// climbed onto a roof or a stack of crates has left it. Only while standing
// there: in the middle of a jump he is still in view, or every hop would be
// a way through.
const GUARD_SIGHT_CLEARANCE = 60;

function aboveGuardSight() {
  return onGround && posY - floorHeightAt(posX) >= GUARD_SIGHT_CLEARANCE;
}

function updateGuards(step) {
  if (!GUARDS.length) return;

  const hidden = inHideSpot(posX) || aboveGuardSight();
  const now = performance.now();

  GUARDS.forEach((guard) => {
    if (guard.disabled) {
      guard.alert = 0;
      drawGuard(guard);
      return;
    }

    // Block 38. Once he has seen Macario he no longer patrols or looks:
    // he hunts. See updateHostileGuard.
    if (guard.hostile) {
      updateHostileGuard(guard, step, now);
      drawGuard(guard);
      return;
    }

    // Patrol. A guard whose bounds collapse to a point is a stationary
    // sentry and keeps the facing the level gave it. Without this it
    // reaches its limit every frame and flips constantly, which reads as
    // a twitching guard that can never actually catch anyone.
    const route = (guard.patrolTo || 0) - (guard.patrolFrom || 0);
    if (route >= 1) {
      const speed = (guard.speed || 1.4) * step;
      guard.pos += speed * guard.facing;
      if (guard.pos <= guard.patrolFrom) {
        guard.pos = guard.patrolFrom;
        guard.facing = 1;
      } else if (guard.pos >= guard.patrolTo) {
        guard.pos = guard.patrolTo;
        guard.facing = -1;
      }
      guard.el.style.left = guard.pos + "px";
    }

    // Detection.
    // Centre to centre, so "in front" means in front of the body the
    // student can see rather than of either character's left edge.
    const dx = posX + PLAYER_WIDTH / 2 - (guard.pos + GUARD_WIDTH / 2);
    const inFront = Math.sign(dx) === guard.facing || dx === 0;
    const inRange = Math.abs(dx) <= (guard.detectRadius || 240);
    const seen = inFront && inRange && !hidden && !playerIsSafe();

    if (seen) {
      // Worn equipment can slow the fill while Macario keeps still
      // (Block 32). It never touches decay, so moving out of sight
      // still clears the meter at the same rate, and it never stops the
      // fill outright: standing in plain view is still a way to be
      // caught, only a slower one.
      const stillMult = playerStill ? equipEffects.stillDetectionMult : 1;
      guard.disguised = stillMult < 1;
      guard.alert = Math.min(1, guard.alert + (guard.alertRate || 0.012) * stillMult * step);
      // Block 38. The first time the clothes are what is holding a guard
      // back in a scene, say so. The meter turning blue (drawGuard) says
      // it every time after.
      if (guard.disguised && currentScene && !currentScene._disguiseNoted) {
        currentScene._disguiseNoted = true;
        showToast("Artista lang ang tingin niya sa iyo. Huwag kang gagalaw.");
      }
    } else {
      guard.disguised = false;
      guard.alert = Math.max(0, guard.alert - (guard.decayRate || 0.02) * step);
    }

    if (guard.alert >= 1) {
      if (guard.shoots) becomeHostile(guard, now);
      else caughtBy(guard);
    }

    drawGuard(guard);
  });
}

// Writes a guard's meter and facing only when they change (Block 36): a
// scene with several guards on a long road would otherwise dirty every
// one of them every frame.
function drawGuard(guard) {
  if (!guard.el) return;
  const fill = guard.disabled ? 0 : Math.round(guard.alert * 100);
  if (fill !== guard.drawnFill) {
    guard.fillEl.style.width = fill + "%";
    guard.drawnFill = fill;
  }
  const alerted = !guard.disabled && (guard.alert >= 1 || guard.hostile);
  if (alerted !== guard.drawnAlerted) {
    guard.el.classList.toggle("guard-alerted", alerted);
    guard.drawnAlerted = alerted;
  }
  const hostile = !guard.disabled && guard.hostile;
  if (hostile !== guard.drawnHostile) {
    guard.el.classList.toggle("guard-hostile", hostile);
    guard.drawnHostile = hostile;
  }
  const disguised = !guard.disabled && !guard.hostile && Boolean(guard.disguised);
  if (disguised !== guard.drawnDisguised) {
    guard.el.classList.toggle("guard-disguised", disguised);
    guard.drawnDisguised = disguised;
  }
  if (guard.facing !== guard.drawnFacing) {
    guard.el.classList.toggle("guard-facing-left", guard.facing === -1);
    guard.drawnFacing = guard.facing;
  }
  if (guard.disabled && !guard.drawnDown) {
    guard.el.classList.add("guard-down");
    guard.drawnDown = true;
  }
}

// =============================================================
// HOSTILE GUARDS AND THEIR SHOTS (Blocks 37 and 38)
//
// A guard declared shoots: true does not catch. When his meter fills he
// turns hostile and stays that way, the way an enemy in most games does
// once it has spotted the player: he stops patrolling, turns to face
// Macario wherever he goes, closes to GUARD_HOLD_DISTANCE at a run and
// fires every GUARD_SHOT_COOLDOWN_MS while in range. Block 37 had him fire
// once and go back to watching, which read as a guard who forgot what he
// had just seen.
//
// Hostility ends only two ways: the guard goes down (two punches, or a
// takedown before he turned), or Macario runs out of hearts, which resets
// every guard to his post (respawnInScene). Being seen is counted once,
// on the turn, not per shot. The chase speed is well under Macario's, so
// running is always a way out of range, and his bullets fly at chest
// height, so a jump or a platform still gets over them.
//
// Each bullet is visible and travels the way he faces. A hit costs one
// heart and knocks Macario on the way the bullet was going, like the
// glass on the road; it does not send him to the start of the scene.
// =============================================================

const GUARD_HOLD_DISTANCE = 170;    // centre to centre; he shoots from here
const GUARD_FIRE_RANGE_EXTRA = 160; // past detectRadius, he still fires
const GUARD_AIM_MS = 450;           // from turning hostile to the first shot
const GUARD_HIT_KNOCKBACK = 40;
const GUARD_HIT_STAGGER_MS = 600;

function becomeHostile(guard, now) {
  if (guard.hostile || guard.disabled) return;
  guard.hostile = true;
  guard.alert = 1;
  guard.nextShotAt = now + GUARD_AIM_MS;
  detections += 1;
  showToast("Nakita ka! Hinahabol ka ng bantay!");
}

function updateHostileGuard(guard, step, now) {
  const dx = posX + PLAYER_WIDTH / 2 - (guard.pos + GUARD_WIDTH / 2);
  const dist = Math.abs(dx);
  if (dx !== 0) guard.facing = Math.sign(dx);

  if (dist > GUARD_HOLD_DISTANCE) {
    const move = Math.min(guard.chaseSpeed * step, dist - GUARD_HOLD_DISTANCE);
    guard.pos += move * guard.facing;
    guard.pos = Math.max(0, Math.min(guard.pos, WORLD_WIDTH - GUARD_WIDTH));
    guard.el.style.left = guard.pos + "px";
  }

  const range = (guard.detectRadius || 240) + GUARD_FIRE_RANGE_EXTRA;
  if (now >= guard.nextShotAt && dist <= range) guardFire(guard, now);
}

// A punch on a guard who is already fighting. He takes it rather than
// dropping at once, the same way the moro-moro's guards do.
function hitGuard(guard) {
  guard.hp -= 1;
  if (guard.hp <= 0) {
    disableGuard(guard, "Napatumba mo ang bantay.");
    return;
  }
  const away = Math.sign(guard.pos + GUARD_WIDTH / 2 - (posX + PLAYER_WIDTH / 2)) || 1;
  guard.pos = Math.max(0, Math.min(guard.pos + away * GUARD_HIT_KNOCKBACK, WORLD_WIDTH - GUARD_WIDTH));
  guard.el.style.left = guard.pos + "px";
  guard.nextShotAt = Math.max(guard.nextShotAt, performance.now() + GUARD_HIT_STAGGER_MS);
  guard.el.classList.add("guard-firing");
  setTimeout(() => guard.el && guard.el.classList.remove("guard-firing"), 150);
}

const GUARD_BULLET_SPEED = 9;       // per 60fps frame; well under a dodge
const GUARD_BULLET_SIZE = 10;       // must match .guard-bullet's CSS width
const GUARD_BULLET_HEIGHT = 70;     // above the guard's floor: chest height
const GUARD_BULLET_RANGE_EXTRA = 120; // past his detectRadius, then gone
const GUARD_SHOT_COOLDOWN_MS = 1300;
const GUARD_BULLET_RECOIL = 50;
const PLAYER_HIT_HEIGHT = 110;      // how tall the body is for a bullet


function guardFire(guard, now) {
  guard.nextShotAt = now + GUARD_SHOT_COOLDOWN_MS;
  playSfx("gunShot");

  const el = document.createElement("div");
  el.className = "guard-bullet";
  world.appendChild(el);
  actElements.push(el);

  const dir = guard.facing;
  const x = dir >= 0
    ? guard.pos + GUARD_WIDTH
    : guard.pos - GUARD_BULLET_SIZE;
  const y = floorHeightAt(guard.pos) + GUARD_BULLET_HEIGHT;
  el.style.left = x + "px";
  el.style.bottom = y + "px";

  GUARD_BULLETS.push({
    el, x, y, dir,
    left: (guard.detectRadius || 240) + GUARD_BULLET_RANGE_EXTRA,
  });

  guard.el.classList.add("guard-firing");
  setTimeout(() => guard.el && guard.el.classList.remove("guard-firing"), 180);
}

function updateGuardBullets(step) {
  if (!GUARD_BULLETS.length) return;

  GUARD_BULLETS = GUARD_BULLETS.filter((bullet) => {
    const distance = GUARD_BULLET_SPEED * step;
    bullet.x += distance * bullet.dir;
    bullet.left -= distance;
    bullet.el.style.left = bullet.x + "px";

    const overlapsX =
      bullet.x + GUARD_BULLET_SIZE > posX && bullet.x < posX + PLAYER_WIDTH;
    const overlapsY =
      bullet.y + GUARD_BULLET_SIZE > posY && bullet.y < posY + PLAYER_HIT_HEIGHT;

    if (overlapsX && overlapsY && !inHideSpot(posX)) {
      bullet.el.remove();
      const hit = damagePlayer("Tinamaan ka ng bala!", false);
      if (hit && health > 0) {
        posX += bullet.dir * GUARD_BULLET_RECOIL;
        posX = Math.max(0, Math.min(posX, WORLD_WIDTH - PLAYER_WIDTH));
        velY = HAZARD_RECOIL_VELOCITY;
      }
      return false;
    }

    if (bullet.left <= 0 || bullet.x < 0 || bullet.x > WORLD_WIDTH) {
      bullet.el.remove();
      return false;
    }
    return true;
  });
}

function clearGuardBullets() {
  GUARD_BULLETS.forEach((bullet) => bullet.el.remove());
  GUARD_BULLETS = [];
}

// Dialogue, cutscenes and overlays all suspend detection. Being spotted
// while unable to move is not a mechanic, it is a bug report.
function playerIsSafe() {
  return inDialogue || cutscenePlaying || uiBlocked || authGated;
}

// A catch increments BOTH counters, and that is intended rather than an
// oversight. Being seen is a stealth failure and it costs a health point,
// so it is counted in both terms. The two are correlated by design; the
// documentation says so rather than leaving a panel to notice.
function caughtBy(guard) {
  guard.alert = 0;
  detections += 1;
  damagePlayer("Nakita ka ng bantay!", true);
}

// =============================================================
// HEALTH
// =============================================================

// Looked up lazily rather than held in consts at this point in the file.
// loadAct() runs at parse time, above here, and reaches updateHudVisibility
// on its way through loadScene; a const declared below would still be in
// its temporal dead zone and throw before the login box ever appeared.
// Cached on the function itself rather than in a module-level const.
// Function declarations hoist; a const at this point in the file would
// still be in its temporal dead zone when loadAct() runs at parse time
// several hundred lines above, and would throw before the login box ever
// rendered.
function hudEls() {
  if (!hudEls.cache) {
    hudEls.cache = {
      root: document.getElementById("hud"),
      hearts: document.getElementById("hud-hearts"),
      toast: document.getElementById("toast"),
    };
  }
  return hudEls.cache;
}

function updateHudVisibility() {
  const hudEl = hudEls().root;
  if (!hudEl) return;
  // Hearts only appear where something can take them. Derived rather than
  // read straight off the flag, because a scene that declares a hazard and
  // forgets the flag would take a heart the student cannot see, and that
  // failure is silent. The explicit flag still works and still wins.
  const dangerous = Boolean(
    currentScene &&
      (currentScene.dangerous ||
        (currentScene.guards && currentScene.guards.length) ||
        (currentScene.hazards && currentScene.hazards.length) ||
        ENEMIES.some((e) => !e.dead))
  );
  hudEl.classList.toggle("hidden", !dangerous);
  if (dangerous) renderHearts();
}

function renderHearts() {
  const heartsEl = hudEls().hearts;
  if (!heartsEl) return;
  heartsEl.innerHTML = "";
  for (let i = 0; i < maxHealth; i++) {
    const heart = document.createElement("div");
    heart.className = "heart" + (i < health ? "" : " heart-empty");
    heartsEl.appendChild(heart);
  }
}

// The whole of what equipment does to the engine. Called by inventory.js
// on sync and on every equip or unequip, including the optimistic one it
// reverts a moment later if the write fails.
//
// Defensive about its input on purpose: it is the boundary between a file
// that may be absent and one that must never throw. A missing or nonsense
// multiplier falls back to 1 rather than making the projectile stand still.
function setEffects(next) {
  const e = next || {};

  const mult = Number(e.projectileSpeedMult);
  equipEffects.projectileSpeedMult = isFinite(mult) && mult > 0 ? mult : 1;

  // Block 32. How fast a guard's meter fills while Macario stands still,
  // as a multiplier: 0.5 is half as fast. Only a slowing is accepted.
  // Worn clothes that made a student easier to see would be a trap
  // bought with barya.
  const still = Number(e.stillDetectionMult);
  equipEffects.stillDetectionMult = isFinite(still) && still > 0 && still < 1 ? still : 1;

  const bonus = Number(e.maxHealthBonus);
  equipEffects.maxHealthBonus =
    isFinite(bonus) && bonus > 0 ? Math.floor(bonus) : 0;

  setMaxHealth(BASE_MAX_HEALTH + equipEffects.maxHealthBonus);
}

// A raised maximum arrives FULL. A fourth heart that renders empty until
// the student happens to find a pickup reads as a broken item rather than
// a reward, and the amulet is the reward for reaching the outpost.
//
// Lowering it clamps, which is the taking-it-off case: a student wearing
// four hearts who unequips at full health drops to three rather than
// keeping a heart the HUD can no longer draw.
function setMaxHealth(next) {
  const previous = maxHealth;
  maxHealth = Math.max(1, next);

  if (maxHealth > previous) health += maxHealth - previous;
  if (health > maxHealth) health = maxHealth;

  renderHearts();
}

function showToast(text, ms) {
  const toastEl = hudEls().toast;
  if (!toastEl) return;
  toastEl.textContent = text;
  toastEl.classList.remove("hidden");
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => toastEl.classList.add("hidden"), ms || 1600);
}

// respawn says whether surviving the hit also sends the player back to
// the start of the scene. A guard catch does; the walk back is the cost
// of being seen. A hazard does not, because being returned to the
// entrance for one heart turns a small mistake into a two minute one,
// and a Grade 8 student meeting that twice simply stops trying.
//
// Running out of health always respawns regardless, since that path
// restores health and there is nowhere else to put the player.
function damagePlayer(reason, respawn) {
  const now = performance.now();
  if (now < invulnUntil) return false; // still in the grace window
  invulnUntil = now + INVULN_MS;

  // Counted here rather than at each call site, so the grace window
  // that stops the damage also stops the count.
  damageTaken += 1;

  health -= 1;
  renderHearts();
  player.classList.add("player-hurt");
  setTimeout(() => player.classList.remove("player-hurt"), 400);

  if (health <= 0) {
    showToast(reason ? reason + " Ulitin natin." : "Ulitin natin.");
    respawnInScene();
  } else {
    if (reason) showToast(reason);
    if (respawn) respawnInScene();
  }

  return true; // the hit landed, so the caller may knock the player back
}

// Back to the start of the scene, guards reset to their posts. Health is
// only restored when it ran out, so a player on one heart still feels it.
function respawnInScene() {
  const scene = currentScene;
  posX = respawnX(scene);
  posY = floorHeightAt(posX);
  velY = 0;
  facing = 1;

  // A guard catch or a hazard can respawn the player while the attack
  // button happens to be down. Without this, shooting would stay stuck
  // and suppress the idle/walk switch (see gameLoop) for the rest of
  // the visit to this scene, since nothing else clears it once the
  // press that started it is gone.
  attackHoldStart = 0;
  shooting = null;
  clearTimeout(shootFireTimer);

  if (health <= 0) {
    health = maxHealth;
    renderHearts();
  }

  // Block 35. A lost fight starts over rather than ending: every enemy
  // still standing goes back to where it came from at full strength, and
  // the ones already beaten stay beaten, so a struggling student's second
  // try is shorter than their first.
  resetEnemies();

  clearGuardBullets();

  GUARDS.forEach((guard) => {
    if (guard.disabled) return;
    guard.pos = guard.x;
    guard.facing = guard.facingStart || 1;
    guard.alert = 0;
    guard.nextShotAt = 0;
    guard.hostile = false;
    guard.disguised = false;
    guard.hp = guard.maxHp || GUARD_HP;
    if (guard.el) guard.el.style.left = guard.pos + "px";
    drawGuard(guard);
  });
}

// Block 37. Where a respawn puts Macario: the furthest checkpoint whose
// flag is set, else the scene's startX. A scene declares checkpoints as
// [{ x, flag }], and the flags are story flags already being set for
// another reason (a pamphlet handed over), so a long road does not send a
// student who ran out of hearts all the way back for work already done.
function respawnX(scene) {
  let x = scene && typeof scene.startX === "number" ? scene.startX : 0;
  ((scene && scene.checkpoints) || []).forEach((cp) => {
    if (cp.flag && state.flags[cp.flag] && cp.x > x) x = cp.x;
  });
  return x;
}

// =============================================================
// HAZARDS AND PICKUPS
// =============================================================

// Contact is tested against the base floor rather than onGround, because
// onGround is also true on a platform, and the outpost has platforms
// above and beside the hazards. Using onGround would take a heart from a
// player standing safely on a crate, which is the exact case the
// platforms were placed to reward.
function updateHazards() {
  if (!HAZARDS.length) return;
  if (playerIsSafe()) return; // dialogue, cutscene, overlay, or not logged in

  const onFloor = posY <= floorHeightAt(posX) + 1;
  if (!onFloor) return; // jumped it

  // Harm is by overlap (see Bodies, at the top of this file): any part
  // of the body over the band hurts, which is what a student standing
  // with one foot on broken glass expects. It used to be the centre of
  // the body, and that was only survivable while nobody could see where
  // the body was.
  const hazard = HAZARDS.find(
    (h) => posX + PLAYER_WIDTH > h.x && posX < h.x + h.width
  );
  if (!hazard) return;

  const hit = damagePlayer(hazard.reason || "Nasugatan ka!", false);

  // Only shove when the hit actually landed. Knocking the player back
  // during the invulnerability window would push them across the level a
  // frame at a time while they stood still.
  if (!hit) return;
  if (health <= 0) return; // damagePlayer already respawned them

  const goingRight = facing >= 0;
  posX = goingRight
    ? hazard.x - PLAYER_WIDTH - 2
    : hazard.x + hazard.width + 2;
  posX = Math.max(0, Math.min(posX, WORLD_WIDTH - PLAYER_WIDTH));
  velY = HAZARD_RECOIL_VELOCITY;
}

// Collected by walking into them. No button: the interact button already
// means NPC and stage, and a third meaning would be a worse tutorial than
// no pickup at all.
function updatePickups() {
  if (!PICKUPS.length) return;
  if (playerIsSafe()) return;

  const centre = posX + PLAYER_WIDTH / 2;
  const footY = posY;

  PICKUPS.forEach((pickup) => {
    if (collectedPickups.has(pickup.id)) return;

    const px = pickup.x;
    const py = typeof pickup.y === "number" ? pickup.y : GROUND_LEVEL;
    if (Math.abs(centre - (px + PICKUP_SIZE / 2)) > PICKUP_REACH) return;
    if (Math.abs(footY - py) > PICKUP_REACH) return;

    // A pickup is refused at full health rather than consumed. A student
    // who walks over the last heart before the corridor should not lose it
    // for having been careful, and a pickup that vanishes with no effect
    // teaches that pickups are worthless.
    if (health >= maxHealth) return;

    collectedPickups.add(pickup.id);
    if (pickup.el) pickup.el.remove();

    health = Math.min(maxHealth, health + 1);
    renderHearts();
    showToast("Nakakuha ka ng puso!");
  });
}

// =============================================================
// COMBAT
//
// Deliberately minimal, per the decision on record: tap to attack,
// hold for ranged, no combos.
//
// The interesting part is not the swing, it is that melee reads the
// guard's facing. From behind an unalerted guard it is a takedown;
// from the front it gets Macario seen and costs him a health point.
// That is what makes stealth and combat interlock rather than sit
// beside each other, and it means the corridor can be solved two
// ways, which is worth more than either route alone.
// =============================================================

const MELEE_RANGE = 70;
const ATTACK_HOLD_MS = 400; // beyond this, release throws instead of swings
const PROJECTILE_SPEED = 12;
const PROJECTILE_RANGE = 520;

let attackHoldStart = 0;
let projectile = null; // at most one in flight

// Which attack clip currently owns the player's pose: "aim" while the
// button is held, "fire" for the brief flourish right after a throw, and
// "melee" for the punch a tap plays (Block 27). The main loop's own
// idle/walk switch (see gameLoop) is suppressed while this is set, the
// same way cutscenePlaying already suppresses it for the death sequence.
// The name predates melee having a clip of its own; it is kept because
// every reset path already clears it (respawnInScene, startPerformance,
// loadScene) and a rename would be churn through all of them.
let shooting = null; // null | "aim" | "fire" | "melee"
let shootFireTimer = null; // hands the pose back after fire or melee

// How long the button must be down before the aim pose shows (Block 27).
// Before melee had its own clip, the aim pose appeared the instant the
// button went down, which was harmless. With a punch to play on release,
// every tap would flash the aiming arm for a frame or two first. A tap is
// well under this; a hold that becomes a throw is well over it, and
// ATTACK_HOLD_MS still alone decides which one a release is.
const AIM_POSE_DELAY_MS = 150;

// Block 37. A scene that declares noRanged: true has no shot: a courier
// carrying pamphlets past the guardia is not there to start a gunfight.
function rangedDisabled() {
  return Boolean(currentScene && currentScene.noRanged);
}

function startAttackHold() {
  if (authGated || uiBlocked || inDialogue || cutscenePlaying) return;
  attackHoldStart = performance.now();
}

// Called every frame from the game loop. Switches to the aim pose once
// the button has been held past AIM_POSE_DELAY_MS, and not before, so a
// tap goes straight from idle or walk into the punch.
function updateAttackHoldPose(now) {
  if (!attackHoldStart || shooting === "aim") return;
  if (rangedDisabled()) return; // nothing to aim
  if (now - attackHoldStart < AIM_POSE_DELAY_MS) return;
  shooting = "aim";
  applyAnim("shootAim", true);
}

function endAttackHold() {
  if (!attackHoldStart) return;
  const held = performance.now() - attackHoldStart;
  attackHoldStart = 0;

  if (authGated || uiBlocked || inDialogue || cutscenePlaying) {
    shooting = null;
    return;
  }

  if (held >= ATTACK_HOLD_MS && rangedDisabled()) {
    // Block 37. A scene can take the gun away (noRanged). A hold still
    // does something, a punch, so the button never feels dead, and says
    // why it was not a shot.
    showToast("Hindi puwedeng bumaril dito.");
    meleeAttack();
    playMelee();
  } else if (held >= ATTACK_HOLD_MS) {
    // Fire the instant the throw happens, not before, so the muzzle
    // flash frame lands with the projectile actually appearing.
    throwProjectile();
    playShootFire();
  } else {
    // A short tap was never a throw: drop any aim pose and swing. The hit
    // lands on release, as it always has, and the punch clip plays over
    // it; gameplay is not made to wait for the art.
    meleeAttack();
    playMelee();
  }
}

// Plays the punch once, then hands the pose back. Same timer approach as
// playShootFire, below, and the same timer, so a throw straight after a
// punch (or the reverse) cancels the earlier hand-back rather than
// letting it end the new clip early.
function playMelee() {
  shooting = "melee";
  applyAnim("melee", true);

  const sheet = SPRITE_SHEETS.melee;
  const duration = sheet.frames * (1000 / sheet.fps);

  clearTimeout(shootFireTimer);
  shootFireTimer = setTimeout(() => {
    shooting = null;
  }, duration);
}

// Plays shootFire's three frames once, then hands the pose back to the
// normal idle/walk switch. There is no general "animation finished"
// callback in this engine (see applyAnim/updateAnimFrame) — a plain
// timer sized to the clip's own frame count and fps is the same
// approach flashAttack already uses for the melee brightness flash.
function playShootFire() {
  shooting = "fire";
  applyAnim("shootFire", true);

  const sheet = SPRITE_SHEETS.shootFire;
  const frameCount = sheet.endFrame - sheet.startFrame + 1;
  const duration = frameCount * (1000 / sheet.fps);

  clearTimeout(shootFireTimer);
  shootFireTimer = setTimeout(() => {
    shooting = null;
  }, duration);
}

function flashAttack() {
  player.classList.add("player-attack");
  setTimeout(() => player.classList.remove("player-attack"), 180);
}

function meleeAttack() {
  flashAttack();

  // Measured centre to centre, the same way detection is.
  const centre = posX + PLAYER_WIDTH / 2;
  const reach = centre + facing * MELEE_RANGE;
  const lo = Math.min(centre, reach);
  const hi = Math.max(centre, reach);

  // Block 35. A fighting enemy is hit from any side: there is no stealth
  // to reward. The nearest one in front takes it, one target per swing.
  const target = ENEMIES
    .filter((e) => !e.dead)
    .map((e) => ({ e, c: e.pos + ENEMY_WIDTH / 2 }))
    .filter(({ c }) => c >= lo - ENEMY_WIDTH / 2 && c <= hi)
    .sort((a, b) => Math.abs(a.c - centre) - Math.abs(b.c - centre))[0];
  if (target) {
    hitEnemy(target.e, ENEMY_PUNCH_DAMAGE);
    return;
  }

  for (const guard of GUARDS) {
    if (guard.disabled) continue;
    const guardCentre = guard.pos + GUARD_WIDTH / 2;
    if (guardCentre < lo || guardCentre > hi) continue;

    // Behind means the guard is facing away from Macario.
    const behind = Math.sign(guardCentre - centre) === guard.facing;

    if (guard.hostile) {
      // Block 38. Already fighting: a punch is a hit, not a mistake.
      hitGuard(guard);
    } else if (behind && guard.alert < 1) {
      disableGuard(guard, "Natumba ang bantay.");
    } else if (guard.shoots) {
      // From the front he sees it coming, turns on Macario, and it costs
      // a heart, the same price the stealth rule always charged.
      becomeHostile(guard, performance.now());
      damagePlayer("Nakita ka ng bantay!");
    } else {
      guard.alert = 1;
      damagePlayer("Nakita ka ng bantay!");
    }
    return; // one target per swing
  }
}

function disableGuard(guard, message) {
  guard.disabled = true;
  guard.alert = 0;
  drawGuard(guard);
  if (message) showToast(message);
}

// The spear leaves from the front of his BODY, plus a gap. Blocks 22 and
// 23 tried to clear the rendered sprite element instead, first with the
// body width and then with the element's offsetWidth, and both were wrong
// for the same underlying reason: the element was a whole scaled cell
// hanging off to the right of the body, so "past its edge" was over 300px
// ahead of him facing right and inside him facing left. With the art now
// standing on the body (bodySprite), the body's own leading edge is where
// his front actually is, in both directions, whatever sheet is loaded.
const PROJECTILE_SPAWN_GAP = 30;
const PROJECTILE_SIZE = 14; // must match .projectile's CSS width

function throwProjectile() {
  if (projectile) return; // one at a time
  flashAttack();
  // Here rather than in playShootFire, which runs whether or not a shot
  // actually left: a release while the last shot is still in flight
  // plays the fire pose but throws nothing, and must not bang either.
  // endAttackHold calls this and playShootFire in the same step, so the
  // sound still lands with the muzzle flash.
  playSfx("gunShot");

  const el = document.createElement("div");
  el.className = "projectile";
  world.appendChild(el);
  actElements.push(el);

  // projectile.x is the ball's left edge, so a leftward throw also steps
  // back by the ball's own width to keep the whole ball clear.
  let x = facing >= 0
    ? posX + PLAYER_WIDTH + PROJECTILE_SPAWN_GAP
    : posX - PROJECTILE_SPAWN_GAP - PROJECTILE_SIZE;
  let y = posY + 60;

  // Block 28. When the fire sheet names its muzzle, the shot starts at the
  // pistol's tip instead: measured from the feet, the same point bodySprite
  // stands on the middle of the body, so it lands on the drawn gun in
  // either facing. Never nearer the body than the plain spawn point above,
  // so a sheet with a short arm cannot put the shot inside Macario.
  const sheet = SPRITE_SHEETS.shootFire;
  if (sheet && sheet.muzzle && sheet.frameHeight && !sheet.failed) {
    const fit = spriteFit(sheet, DISPLAY_HEIGHT);
    const forward = (sheet.muzzle.x - (sheet.footX != null ? sheet.footX : sheet.frameWidth / 2)) * fit.scale;
    const up = (sheet.contentTop + sheet.contentHeight - sheet.muzzle.y) * fit.scale;
    const centre = posX + PLAYER_WIDTH / 2;
    const tip = centre + facing * forward;
    x = facing >= 0
      ? Math.max(x, tip)
      : Math.min(x, tip - PROJECTILE_SIZE);
    y = posY + up - PROJECTILE_SIZE / 2;
  }

  projectile = {
    el: el,
    x: x,
    y: y,
    dir: facing,
    travelled: 0,
  };

  el.style.left = projectile.x + "px";
  el.style.bottom = projectile.y + "px";
}

function updateProjectile(step) {
  if (!projectile) return;

  // The multiplier is the whole of the weapon slot. A faster spear also
  // clears the one-in-flight limiter sooner, so the same lever makes the
  // throw both quicker and more frequent.
  const distance = PROJECTILE_SPEED * equipEffects.projectileSpeedMult * step;
  projectile.x += distance * projectile.dir;
  projectile.travelled += distance;
  projectile.el.style.left = projectile.x + "px";

  for (const enemy of ENEMIES) {
    if (enemy.dead) continue;
    const enemyCentre = enemy.pos + ENEMY_WIDTH / 2;
    if (Math.abs(enemyCentre - (projectile.x + PROJECTILE_SIZE / 2)) > 30) continue;
    hitEnemy(enemy, ENEMY_SHOT_DAMAGE);
    destroyProjectile();
    return;
  }

  for (const guard of GUARDS) {
    if (guard.disabled) continue;
    const guardCentre = guard.pos + GUARD_WIDTH / 2;
    if (Math.abs(guardCentre - (projectile.x + PROJECTILE_SIZE / 2)) > 40) continue;
    disableGuard(guard, "Tinamaan ang bantay.");
    destroyProjectile();
    return;
  }

  if (
    projectile.travelled >= PROJECTILE_RANGE ||
    projectile.x < 0 ||
    projectile.x > WORLD_WIDTH
  ) {
    destroyProjectile();
  }
}

function destroyProjectile() {
  if (!projectile) return;
  projectile.el.remove();
  projectile = null;
}

// Tapping the dialogue box advances it, which is easier on mobile.
dialogueBox.addEventListener("click", () => {
  if (inDialogue) advanceDialogue();
});

// =============================================================
// SCRIPTED SCENES AND COMBAT (Block 35)
//
// The moro-moro on the entablado is the first scene where things happen
// to Macario rather than because he walked up to someone: Maryam's lines,
// a man walking on from the wings, guards pouring in. Content writes that
// sequence as an ordinary async function (content/act1.js) out of the
// small calls below, the same way it already calls addQuest or
// Acts.gotoScene. The engine still knows nothing about the play.
// =============================================================

// A real landing holds the landing frame this long. Short, because it is
// a pose on a character who can already move again.
const LAND_POSE_MS = 140;
// Below this height off the ground he is walking down a slope, not jumping.
const AIRBORNE_MIN_HEIGHT = 8;
let landPoseUntil = 0;

// Block 57. The apple mini-game, replacing Block 56's timing bar, which
// the proponent found dishonest: a press on a moving marker has nothing
// to do with the work Macario is paid for, and the pay was a random
// number. Here the task is the work. Apples hang in the tree and fall
// one at a time; Macario moves a basket left and right under them, and
// every apple caught is an apple he has. A miss costs nothing: another
// apple drops. Nothing here pays: content hears about each catch
// (onCatch) and decides what it means.
//
//   playCatchGame({ title, hint, goal, start,
//                   onCatch(n) -> string, doneText })
//
// Resolves with how many he holds when the window closes, so a student
// who stops at two and comes back later starts at two (content passes
// start). Controls: the two buttons (held), A and D or the arrow keys,
// or a finger dragged across the field. Elements are looked up on each
// call rather than at load, so nothing here is reached while loadAct
// runs (the TDZ note in CLAUDE.md). The field's size is read once, on
// opening, and never again while it runs (Block 36).
const CATCH_BASKET_WIDTH = 72;   // must match #catch-basket's CSS width
const CATCH_APPLE_SIZE = 24;     // must match #catch-apple's CSS size
const CATCH_CANOPY_HEIGHT = 46;  // must match #catch-canopy's CSS height
const CATCH_BASKET_SPEED = 330;  // px a second
const CATCH_FALL_SPEED = 120;    // px a second at the start
const CATCH_FALL_STEP = 14;      // a little faster with each apple held
const CATCH_HANG_MS = 650;       // the apple shakes before it lets go

function playCatchGame(opts) {
  const o = opts || {};
  const screen = document.getElementById("catch-screen");
  if (!screen || !screen.classList.contains("hidden")) return Promise.resolve(0);
  const titleEl = document.getElementById("catch-title");
  const hintEl = document.getElementById("catch-hint");
  const fieldEl = document.getElementById("catch-field");
  const appleEl = document.getElementById("catch-apple");
  const basketEl = document.getElementById("catch-basket");
  const resultEl = document.getElementById("catch-result");
  const leftBtn = document.getElementById("catch-left");
  const rightBtn = document.getElementById("catch-right");
  const stopBtn = document.getElementById("catch-stop");

  return new Promise((resolve) => {
    const goal = Math.max(1, Math.floor(Number(o.goal) || 3));
    let count = Math.max(0, Math.min(goal, Math.floor(Number(o.start) || 0)));
    const openedAt = performance.now();
    let fieldW = 0;
    let fieldH = 0;
    let basketX = 0;
    let dragX = null;
    const held = { left: false, right: false };
    // The apple: hanging (waiting to drop), falling, or none.
    let apple = null;
    let nextAppleAt = 0;
    let last = 0;
    let raf = 0;
    let closed = false;

    function setResult(text, cls) {
      resultEl.textContent = text || "";
      resultEl.className = "shell-sub" + (cls ? " " + cls : "");
    }

    function drawBasket() {
      basketEl.style.transform = "translateX(" + Math.round(basketX) + "px)";
    }

    function drawApple() {
      if (!apple) { appleEl.classList.add("hidden"); return; }
      appleEl.classList.remove("hidden");
      appleEl.classList.toggle("catch-apple-hanging", apple.hanging);
      appleEl.style.transform =
        "translate(" + Math.round(apple.x) + "px," + Math.round(apple.y) + "px)";
    }

    function finished() { return count >= goal; }

    function showDone() {
      setResult(o.doneText || "Sapat na!", "catch-hit");
      setLabel(stopBtn, "Tapos na");
      stopBtn.classList.add("shell-btn-primary");
      stopBtn.classList.remove("shell-btn-ghost");
    }

    function spawnApple(now) {
      const margin = 10;
      const x = margin + Math.random() * Math.max(0, fieldW - CATCH_APPLE_SIZE - margin * 2);
      apple = { x, y: CATCH_CANOPY_HEIGHT - CATCH_APPLE_SIZE / 2, hanging: true,
                dropAt: now + CATCH_HANG_MS };
      drawApple();
    }

    function tick(now) {
      if (closed) return;
      const dt = last ? Math.min(now - last, 50) / 1000 : 0.016;
      last = now;

      // The basket: a finger's position wins, then the held buttons.
      let dir = (held.right ? 1 : 0) - (held.left ? 1 : 0);
      if (dragX !== null) {
        const want = dragX - CATCH_BASKET_WIDTH / 2;
        const gap = want - basketX;
        dir = Math.abs(gap) < 2 ? 0 : Math.sign(gap);
        const stepPx = Math.min(Math.abs(gap), CATCH_BASKET_SPEED * 1.6 * dt);
        basketX += dir * stepPx;
      } else if (dir) {
        basketX += dir * CATCH_BASKET_SPEED * dt;
      }
      const before = basketX;
      basketX = Math.max(0, Math.min(basketX, fieldW - CATCH_BASKET_WIDTH));
      if (dir || before !== basketX) drawBasket();

      if (!finished()) {
        if (!apple && now >= nextAppleAt) spawnApple(now);
        if (apple && apple.hanging && now >= apple.dropAt) {
          apple.hanging = false;
          drawApple();
        }
        if (apple && !apple.hanging) {
          apple.y += (CATCH_FALL_SPEED + CATCH_FALL_STEP * count) * dt;
          const basketTop = fieldH - 34;
          const appleBottom = apple.y + CATCH_APPLE_SIZE;
          const centre = apple.x + CATCH_APPLE_SIZE / 2;
          const inBasket = centre >= basketX - 6 && centre <= basketX + CATCH_BASKET_WIDTH + 6;
          if (appleBottom >= basketTop && appleBottom <= basketTop + 16 && inBasket) {
            count++;
            apple = null;
            drawApple();
            const line = typeof o.onCatch === "function" ? o.onCatch(count) : "";
            if (finished()) showDone();
            else setResult(line || "Nasalo mo! (" + count + "/" + goal + ")", "catch-hit");
            nextAppleAt = now + 500;
          } else if (apple.y >= fieldH - CATCH_APPLE_SIZE) {
            apple = null;
            drawApple();
            setResult(o.missText || "Nahulog sa lupa! May isa pa.", "catch-miss");
            nextAppleAt = now + 600;
          } else {
            drawApple();
          }
        }
      }
      raf = requestAnimationFrame(tick);
    }

    function close() {
      if (closed) return;
      closed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("keyup", onKeyUp, true);
      window.removeEventListener("pointerup", onPointerUp);
      fieldEl.onpointerdown = null;
      fieldEl.onpointermove = null;
      stopBtn.onclick = null;
      [leftBtn, rightBtn].forEach((b) => {
        b.onpointerdown = null; b.onpointerup = null;
        b.onpointerleave = null; b.onpointercancel = null;
      });
      screen.classList.add("hidden");
      setUiBlocked(false);
      resolve(count);
    }

    function keySide(key) {
      if (key === "a" || key === "arrowleft") return "left";
      if (key === "d" || key === "arrowright") return "right";
      return null;
    }

    // Taken in the capture phase on window and stopped there, so neither
    // the world (a jump, a walk) nor the shell (Escape opens pause) also
    // acts on a key while the window is up. The E that closed the
    // conversation opening it is older than openedAt and is ignored.
    function onKeyDown(e) {
      const key = (e.key || "").toLowerCase();
      const side = keySide(key);
      if (side) {
        e.preventDefault(); e.stopPropagation();
        held[side] = true;
        dragX = null;
      } else if (key === "escape") {
        e.preventDefault(); e.stopPropagation();
        close();
      } else if (key === "e" || key === " " || key === "enter") {
        e.preventDefault(); e.stopPropagation();
        if (!e.repeat && e.timeStamp >= openedAt && finished()) close();
      }
    }

    function onKeyUp(e) {
      const side = keySide((e.key || "").toLowerCase());
      if (side) { e.stopPropagation(); held[side] = false; }
    }

    function fieldX(e) {
      const r = fieldEl.getBoundingClientRect();
      // The field is inside #app-scale, which is scaled by --zoom; its
      // rendered width over its layout width is that scale.
      const scale = r.width / (fieldW || r.width || 1);
      return (e.clientX - r.left) / (scale || 1);
    }

    function onPointerUp() { dragX = null; }

    function holdButton(btn, side) {
      btn.onpointerdown = (e) => { e.preventDefault(); held[side] = true; dragX = null; };
      btn.onpointerup = () => { held[side] = false; };
      btn.onpointerleave = () => { held[side] = false; };
      btn.onpointercancel = () => { held[side] = false; };
    }

    titleEl.textContent = o.title || "";
    hintEl.textContent = o.hint || "";
    setResult(count ? "Hawak mo: " + count + "/" + goal : "", "");
    setLabel(stopBtn, "Bumalik");
    stopBtn.classList.remove("shell-btn-primary");
    stopBtn.classList.add("shell-btn-ghost");
    stopBtn.onclick = close;
    holdButton(leftBtn, "left");
    holdButton(rightBtn, "right");
    fieldEl.onpointerdown = (e) => { dragX = fieldX(e); };
    fieldEl.onpointermove = (e) => { if (dragX !== null || e.buttons) dragX = fieldX(e); };
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("keyup", onKeyUp, true);

    setUiBlocked(true);
    keysPressed["a"] = false;
    keysPressed["d"] = false;
    screen.classList.remove("hidden");
    fieldW = fieldEl.clientWidth;
    fieldH = fieldEl.clientHeight;
    basketX = (fieldW - CATCH_BASKET_WIDTH) / 2;
    apple = null;
    nextAppleAt = performance.now() + 500;
    drawBasket();
    drawApple();
    if (finished()) showDone();
    raf = requestAnimationFrame(tick);
  });
}

// Block 57. A black card with a few lines of text, faded in and out:
// the place and year before a part of the story ("Tondo, 1880"), or a
// jump in time. The screen goes black, the lines come up one after the
// other, hold long enough to read, fade, and the black lifts.
//
//   await playIntertitle(lines, { startBlack, whileBlack, holdMs })
//
// startBlack puts the black up at once rather than fading it in, for an
// opening where the world must not be seen first. whileBlack runs after
// the text has gone and before the black lifts, which is where a jump in
// time moves Macario (placePlayer) without anyone seeing him move. A tap
// or E, once the first line has been up a moment, skips the rest of the
// reading time, never the fades. The script that
// calls this owns setCutscene, so the world is still behind it.
const INTERTITLE_FADE_MS = 900;
const INTERTITLE_LINE_MS = 900;
const INTERTITLE_TEXT_OUT_MS = 800;
const INTERTITLE_SKIP_AFTER_MS = 1200;

function playIntertitle(lines, opts) {
  const o = opts || {};
  const el = document.getElementById("intertitle");
  const box = document.getElementById("intertitle-text");
  if (!el || !box) return Promise.resolve();
  const list = (Array.isArray(lines) ? lines : [lines]).filter(Boolean).map(String);
  const words = list.join(" ").split(/\s+/).length;
  const hold = typeof o.holdMs === "number" ? o.holdMs : 1600 + words * 260;

  // A tap skips the rest of the reading time at once, not one line of
  // it: the lines still to come appear together and the text fades.
  let skip = null;
  let skipped = false;
  const skippable = (ms) => new Promise((resolve) => {
    if (skipped) { resolve(); return; }
    const t = setTimeout(done, ms);
    function done() { clearTimeout(t); skip = null; resolve(); }
    skip = () => { skipped = true; done(); };
  });
  // Not in the first moments, so a tap meant for whatever came before
  // (the last line of a conversation) does not throw the card away
  // unread.
  let skipFrom = Infinity;
  const onKey = (e) => {
    const key = (e.key || "").toLowerCase();
    if (key !== "e" && key !== " " && key !== "enter") return;
    e.preventDefault();
    e.stopPropagation();
    if (!e.repeat && skip && performance.now() >= skipFrom) skip();
  };
  const onTap = () => { if (skip && performance.now() >= skipFrom) skip(); };

  return (async () => {
    box.innerHTML = "";
    list.forEach((text, i) => {
      const p = document.createElement("p");
      p.className = "intertitle-line" + (i === 0 ? " intertitle-head" : "");
      p.textContent = text;
      box.appendChild(p);
    });
    el.classList.remove("hidden");
    if (o.startBlack) {
      el.classList.add("instant", "visible");
      void el.offsetWidth; // commit the instant black before transitions return
      el.classList.remove("instant");
    } else {
      void el.offsetWidth;
      el.classList.add("visible");
      await wait(INTERTITLE_FADE_MS);
    }
    skipFrom = performance.now() + INTERTITLE_SKIP_AFTER_MS;
    window.addEventListener("keydown", onKey, true);
    el.addEventListener("pointerdown", onTap);
    try {
      for (const p of box.children) {
        p.classList.add("shown");
        await skippable(INTERTITLE_LINE_MS);
      }
      await skippable(hold);
    } finally {
      window.removeEventListener("keydown", onKey, true);
      el.removeEventListener("pointerdown", onTap);
      skip = null;
    }
    [...box.children].forEach((p) => p.classList.remove("shown"));
    await wait(INTERTITLE_TEXT_OUT_MS);
    if (typeof o.whileBlack === "function") await o.whileBlack();
    el.classList.remove("visible");
    await wait(INTERTITLE_FADE_MS);
    el.classList.add("hidden");
    box.innerHTML = "";
  })();
}

// Block 57. Walks Macario to x at pxPerSecond and resolves on arrival:
// the player's own moveDecoration, for a script in which he leaves with
// someone rather than being cut away from. He faces the way he walks and
// shows the walk cycle while he goes (scriptWalking, read by the loop);
// the camera follows him as it always does. A scene change mid-walk
// ends the walk where it is.
function movePlayer(toX, pxPerSecond) {
  const target = Math.max(0, Math.min(Number(toX) || 0, WORLD_WIDTH - PLAYER_WIDTH));
  const speed = Math.max(1, pxPerSecond || 170);
  const token = actLoadToken;
  if (target !== posX) facing = target < posX ? -1 : 1;
  scriptWalking = true;
  applyAnim("walk"); // at once, not on the loop's next frame
  return new Promise((resolve) => {
    let last = 0;
    const done = () => {
      scriptWalking = false;
      applyAnim("idle");
      resolve();
    };
    const tick = (now) => {
      if (token !== actLoadToken) return done();
      if (paused) { last = now; requestAnimationFrame(tick); return; }
      const dt = last ? Math.min(now - last, 50) : 16;
      last = now;
      const stepPx = (speed * dt) / 1000;
      posX = Math.abs(target - posX) <= stepPx ? target : posX + Math.sign(target - posX) * stepPx;
      posY = groundHeightAt(posX);
      if (posX === target) return done();
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

// Block 57. Puts Macario at x, facing 1 or -1, at once: for a script
// that has hidden the move (under an intertitle's black).
function placePlayer(x, dir) {
  placeForSceneScript({ x, facing: dir });
}

// Opens a conversation from a script and resolves when it is closed. It
// uses the dialogue box exactly as talking to an NPC does, so E and a tap
// advance it the same way.
function playDialogue(lines) {
  return new Promise((resolve) => {
    activeNpc = null;
    activeMode = "script";
    activeSet = { lines, resolve };
    inDialogue = true;
    dialogueStep = 0;
    dialogueBox.classList.remove("hidden");
    showDialogueStep();
  });
}

// Holds the world still for the parts of a script with no dialogue box on
// screen (someone walking on). Same flag the stage cutscene and the scene
// fade use, so controls hide and nothing can hurt him meanwhile.
function setCutscene(on) {
  cutscenePlaying = Boolean(on);
  if (on) {
    attackHoldStart = 0;
    shooting = null;
    clearTimeout(shootFireTimer);
    keysPressed["a"] = false;
    keysPressed["d"] = false;
  }
}

function turnPlayer(dir) {
  if (dir === 1 || dir === -1) facing = dir;
}

function decorationEl(id) {
  return document.getElementById("dec-" + id);
}

function showDecoration(id, visible) {
  const el = decorationEl(id);
  if (el) el.style.display = visible ? "" : "none";
}

// Walks a decoration to x at pxPerSecond and resolves on arrival. A scene
// change mid-walk removes the element, and the walk simply stops there.
function moveDecoration(id, toX, pxPerSecond) {
  const dec = ((currentScene && currentScene.decorations) || []).find((d) => d.id === id);
  const el = decorationEl(id);
  if (!dec || !el) return Promise.resolve();
  const speed = Math.max(1, pxPerSecond || 160);
  // Block 40. faceMovement turns the art toward where he is walking, and
  // leaves it that way when he stops. The art is assumed to face right.
  const from0 = typeof dec.currentX === "number" ? dec.currentX : dec.x;
  if (dec.faceMovement && dec.spriteEl && toX !== from0) {
    const flip = toX < from0 ? "scaleX(-1)" : "";
    dec.spriteEl.style.transform = flip;
    if (dec.walkSpriteEl) dec.walkSpriteEl.style.transform = flip;
  }
  dec.moving = true;
  // Block 53. The walk sheet in, the idle sheet out, for the length of
  // the walk; back again on arrival.
  const swap = (walking) => {
    if (!dec.walkSpriteEl) return;
    dec.walkSpriteEl.style.display = walking ? "" : "none";
    if (dec.spriteEl) dec.spriteEl.style.display = walking ? "none" : "";
  };
  if (toX !== from0) swap(true);
  return new Promise((resolve) => {
    let last = 0;
    const done = () => { dec.moving = false; swap(false); resolve(); };
    const tick = (now) => {
      if (!el.isConnected) return done();
      if (paused) { last = now; requestAnimationFrame(tick); return; }
      const dt = last ? Math.min(now - last, 50) : 16;
      last = now;
      const from = typeof dec.currentX === "number" ? dec.currentX : dec.x;
      const stepPx = (speed * dt) / 1000;
      const next = Math.abs(toX - from) <= stepPx ? toX : from + Math.sign(toX - from) * stepPx;
      dec.currentX = next;
      el.style.left = next + "px";
      if (next === toX) return done();
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

// ---- Combat -------------------------------------------------------
//
// Deliberately small, like stealth. An enemy walks at Macario, stops at
// arm's length, and swings on a timer. The swing is telegraphed: the
// enemy lights up for ENEMY_TELEGRAPH_MS before it lands, which is the
// whole of what teaches a Grade 8 student when to step back. A punch takes
// one point, a shot two; being hit knocks an enemy back and delays its
// next swing, so punching the one in front is always a way through. Speed
// is scaled by act exactly as guard speed is (difficultyMultiplier), which
// keeps dynamic difficulty the one lever it was.

const ENEMY_BASE_SPEED = 2.2;   // per 60fps frame; well under SPEED (5)
const ENEMY_REACH = 55;         // centre to centre; under MELEE_RANGE (70)
const ENEMY_SPACING = 50;       // enemies queue rather than stack
const ENEMY_WINDUP_MS = 700;    // from reaching him to the first swing
const ENEMY_COOLDOWN_MS = 1800; // between swings: a beat to punch back in
const ENEMY_TELEGRAPH_MS = 350; // the lit-up warning before a swing
const ENEMY_ATTACK_FOLLOW_MS = 280; // the attack clip's follow-through
const ENEMY_STAGGER_MS = 350;
const ENEMY_KNOCKBACK = 45;
const ENEMY_HIT_RECOIL = 40;    // how far a hit pushes Macario back
const ENEMY_PUNCH_DAMAGE = 1;
const ENEMY_SHOT_DAMAGE = 2;

function enemiesAlive() {
  return ENEMIES.some((e) => !e.dead);
}

// defs: [{ id, x, hp, speed, img | animation }]. Resolves once every one
// of them is down. Content awaits it to carry the scene on after the fight.
function spawnEnemies(defs) {
  const token = actLoadToken;
  const speedScale = difficultyMultiplier(currentActData && currentActData.number);

  const spawned = (defs || []).map((def) => {
    const hp = Math.max(1, def.hp || 2);
    const enemy = Object.assign({}, def, {
      pos: def.x,
      hp,
      maxHp: hp,
      speed: (def.speed || ENEMY_BASE_SPEED) * speedScale,
      facing: -1,
      dead: false,
      nextSwingAt: 0,
      staggerUntil: 0,
    });

    const el = document.createElement("div");
    el.className = "entity enemy";
    el.id = "enemy-" + def.id;
    mountBody(el, enemy.pos, ENEMY_WIDTH);

    const meter = document.createElement("div");
    meter.className = "guard-meter enemy-meter";
    const fill = document.createElement("div");
    fill.className = "guard-meter-fill enemy-meter-fill";
    fill.style.width = "100%";
    meter.appendChild(fill);
    el.appendChild(meter);

    const sprite = document.createElement("div");
    sprite.className = "sprite npc-sprite" + (def.animation ? " npc-anim-sprite" : "");
    el.appendChild(sprite);

    // Block 40. An enemy may bring an attack sheet beside its walk sheet.
    // The walk steps only while he is walking; the attack is a second
    // sprite, shown and played once from its first frame for each swing,
    // starting with the telegraph so the wind-up IS the warning.
    let attackSprite = null;
    if (def.animation && def.attackAnimation) {
      attackSprite = document.createElement("div");
      attackSprite.className = "sprite npc-sprite npc-anim-sprite enemy-attack-sprite";
      attackSprite.style.display = "none";
      el.appendChild(attackSprite);
    }
    world.appendChild(el);
    if (def.animation) {
      setupNpcAnimation(def.animation, sprite, DISPLAY_HEIGHT, token, ENEMY_WIDTH,
        def.attackAnimation ? { playing: () => enemy.walking && !enemy.attacking } : undefined);
      if (attackSprite) {
        setupNpcAnimation(def.attackAnimation, attackSprite, DISPLAY_HEIGHT, token, ENEMY_WIDTH,
          { playing: () => enemy.attacking, loop: false });
      }
    } else {
      bodyPlaceholder(sprite, def.img || "Kaaway", DISPLAY_HEIGHT, ENEMY_WIDTH);
    }

    enemy.el = el;
    enemy.fillEl = fill;
    enemy.spriteEl = sprite;
    enemy.attackSpriteEl = attackSprite;
    enemy.walking = false;
    enemy.attacking = false;
    enemy.attackEnd = 0;
    actElements.push(el);
    return enemy;
  });

  ENEMIES = ENEMIES.filter((e) => !e.dead).concat(spawned);
  updateHudVisibility();

  return new Promise((resolve) => {
    enemiesDone = resolve;
    if (!enemiesAlive()) finishFight();
  });
}

function finishFight() {
  updateHudVisibility();
  const resolve = enemiesDone;
  enemiesDone = null;
  if (resolve) resolve();
}

function updateEnemies(step, now) {
  if (!ENEMIES.length) return;
  const playerCentre = posX + PLAYER_WIDTH / 2;

  ENEMIES.forEach((enemy) => {
    if (enemy.dead) return;
    const centre = enemy.pos + ENEMY_WIDTH / 2;
    const dx = playerCentre - centre;
    const dir = Math.sign(dx) || enemy.facing;
    const dist = Math.abs(dx);
    enemy.facing = dir;

    if (now >= enemy.staggerUntil) {
      if (dist > ENEMY_REACH) {
        // Wait behind a comrade who is already closer, instead of
        // walking through him.
        const blocked = ENEMIES.some((other) => {
          if (other === enemy || other.dead) return false;
          const oc = other.pos + ENEMY_WIDTH / 2;
          return Math.sign(oc - centre) === dir &&
            Math.abs(oc - centre) < ENEMY_SPACING &&
            Math.abs(playerCentre - oc) < dist;
        });
        if (!blocked) {
          enemy.pos += dir * Math.min(enemy.speed * step, dist - ENEMY_REACH);
        }
        enemy.walking = !blocked;
        enemy.nextSwingAt = 0;
      } else {
        enemy.walking = false;
        if (!enemy.nextSwingAt) enemy.nextSwingAt = now + ENEMY_WINDUP_MS;
        if (now >= enemy.nextSwingAt) {
          enemy.nextSwingAt = now + ENEMY_COOLDOWN_MS;
          const hit = damagePlayer("Nasugatan ka!", false);
          if (hit && health > 0) {
            posX = Math.max(0, Math.min(posX + dir * ENEMY_HIT_RECOIL, WORLD_WIDTH - PLAYER_WIDTH));
            velY = HAZARD_RECOIL_VELOCITY;
          }
        }
      }
    }

    const telegraph = enemy.nextSwingAt && enemy.nextSwingAt - now <= ENEMY_TELEGRAPH_MS && now < enemy.nextSwingAt;
    if (Boolean(telegraph) !== enemy.drawnWindup) {
      enemy.el.classList.toggle("enemy-windup", Boolean(telegraph));
      enemy.drawnWindup = Boolean(telegraph);
    }

    // Block 40. The attack clip runs from the start of the telegraph to
    // ENEMY_ATTACK_FOLLOW_MS after the blow, so the lunge lands on the hit.
    // A stagger cancels it.
    if (telegraph && !enemy.attacking && now >= enemy.staggerUntil) {
      enemy.attacking = true;
      enemy.attackEnd = enemy.nextSwingAt + ENEMY_ATTACK_FOLLOW_MS;
    }
    if (enemy.attacking && (now >= enemy.attackEnd || now < enemy.staggerUntil)) {
      enemy.attacking = false;
    }
    if (enemy.attackSpriteEl && enemy.attacking !== enemy.drawnAttacking) {
      enemy.attackSpriteEl.style.display = enemy.attacking ? "" : "none";
      enemy.spriteEl.style.visibility = enemy.attacking ? "hidden" : "";
      enemy.drawnAttacking = enemy.attacking;
    }

    if (enemy.pos !== enemy.drawnPos) {
      enemy.el.style.left = enemy.pos + "px";
      enemy.drawnPos = enemy.pos;
    }
    // Facing, written only when it turns (Block 36). The art faces right.
    if (enemy.animation && enemy.spriteEl && dir !== enemy.drawnFacing) {
      const flip = dir < 0 ? "scaleX(-1)" : "";
      enemy.spriteEl.style.transform = flip;
      if (enemy.attackSpriteEl) enemy.attackSpriteEl.style.transform = flip;
      enemy.drawnFacing = dir;
    }
  });
}

function hitEnemy(enemy, damage) {
  if (!enemy || enemy.dead) return;
  const now = performance.now();
  const away = Math.sign(enemy.pos + ENEMY_WIDTH / 2 - (posX + PLAYER_WIDTH / 2)) || 1;

  enemy.hp -= damage;
  enemy.fillEl.style.width = Math.max(0, (enemy.hp / enemy.maxHp) * 100) + "%";
  enemy.el.classList.add("enemy-hit");
  setTimeout(() => enemy.el && enemy.el.classList.remove("enemy-hit"), 150);

  if (enemy.hp <= 0) {
    enemy.dead = true;
    enemy.el.classList.remove("enemy-windup");
    enemy.el.classList.add("enemy-down");
    if (!enemiesAlive()) finishFight();
    return;
  }

  enemy.pos += away * ENEMY_KNOCKBACK;
  enemy.staggerUntil = now + ENEMY_STAGGER_MS;
  enemy.nextSwingAt = Math.max(enemy.nextSwingAt || 0, now + ENEMY_STAGGER_MS + ENEMY_WINDUP_MS);
  enemy.el.style.left = enemy.pos + "px";
}

function resetEnemies() {
  ENEMIES.forEach((enemy) => {
    if (enemy.dead) return;
    enemy.pos = enemy.x;
    enemy.hp = enemy.maxHp;
    enemy.nextSwingAt = 0;
    enemy.staggerUntil = 0;
    enemy.fillEl.style.width = "100%";
    enemy.el.classList.remove("enemy-windup");
    enemy.drawnWindup = false;
    enemy.attacking = false;
    enemy.walking = false;
    enemy.el.style.left = enemy.pos + "px";
    enemy.drawnPos = enemy.pos;
  });
}

// =============================================================
// AUDIO (Block 30)
//
// Three kinds of sound, and three mechanisms, because each one has a
// different cost on a low-end phone.
//
// Music is one long file (Calm.mp3, two minutes) played through a
// single <audio> element. The browser streams and decodes it as it
// plays. Decoding it up front through Web Audio would hold the whole
// track as raw samples, about 40MB, on a phone chosen for being short
// of memory.
//
// One-shot effects (the gunshot) go through Web Audio instead. An
// <audio> element on Android Chrome can start a noticeable fraction of
// a second late, which is exactly the gap between the muzzle flash and
// the bang a student would notice. A decoded two second clip is small,
// and a buffer source starts on the next audio frame. If Web Audio is
// missing or the decode fails, a plain <audio> is the fallback, late
// rather than silent.
//
// Ambience that belongs to a character (Kabayo's Horse.mp3) is an NPC's
// nearSound. It loops on its own <audio> element while Macario is in
// talking range, fades in and out rather than cutting, and starts from
// the top on each new approach so the first thing heard is a neigh
// rather than the middle of a silence.
//
// Nothing here is touched by loadAct, which runs at parse time. Every
// call site is either the game loop (first run on a later frame) or a
// function called after the page has finished parsing, so the lets
// below are always initialised before anything reads them.
// =============================================================

const MUSIC_SRC = "assets/audio/music/calm.mp3";
// Block 35. The track now playing. A scene may name its own (music) and a
// script may change it for a moment (setMusic, the fight). null is Calm.
let musicSrc = MUSIC_SRC;
const SFX_SOURCES = { gunShot: "assets/audio/sfx/gunshot.mp3" };

// Music sits under everything else. It is the one sound that never
// stops, and a classroom of phones all playing it at full volume is
// the complaint this number exists to prevent.
const MUSIC_VOLUME = 0.35;
const SFX_VOLUME = 0.8;
const NEAR_SOUND_VOLUME = 0.7;
const NEAR_SOUND_FADE_MS = 500;

// Ambience starts at the same reach as the Usap prompt and stops a
// little further out. Without the gap, standing on the boundary starts
// and stops it every few frames.
const NEAR_SOUND_RELEASE = 60;

// Both on by default. shell.js hands in the stored setting at start-up,
// before any sound could have played.
let audioPrefs = { music: true, sfx: true };

let musicEl = null;
let musicWanted = false; // the world has been entered; music belongs on
// Block 36. One element per track, kept. Dropping the old one on every
// swap meant coming back to Calm downloaded two megabytes again, on a
// phone, in the middle of play.
const musicEls = new Map();

let audioCtx = null;
const sfxBuffers = {}; // name -> AudioBuffer, once decoded

const nearSoundEls = new Map(); // src -> { el, volume }
let lastNearSoundNow = 0;

function assetAudio(src, loop) {
  const el = new Audio(assetUrl(src));
  el.loop = Boolean(loop);
  el.preload = "auto";
  return el;
}

// A rejected play() is the browser refusing sound before a gesture. It
// is not an error worth a console line, and the unlock listener below
// retries on the next tap.
function tryPlay(el) {
  try {
    const p = el.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  } catch (err) {
    // Some older engines throw synchronously instead.
  }
}

function musicElementFor(src) {
  let el = musicEls.get(src);
  if (!el) {
    el = assetAudio(src, true);
    el.volume = MUSIC_VOLUME;
    musicEls.set(src, el);
  }
  return el;
}

// Fetches a track without playing it, so a swap at a dramatic moment is
// not the moment the phone starts downloading two megabytes. Content calls
// this when a scene that will need the track is entered.
function prepareMusic(src) {
  if (!src) return;
  musicElementFor(src);
}

// Swaps the track. The one playing is paused and kept, so switching back
// is instant and costs no network.
function setMusic(src) {
  const next = src || MUSIC_SRC;
  if (next === musicSrc) return;
  if (musicEl) musicEl.pause();
  musicSrc = next;
  musicEl = null;
  syncMusic();
}

function startMusic() {
  musicWanted = true;
  syncMusic();
}

function syncMusic() {
  const shouldPlay = musicWanted && audioPrefs.music && !document.hidden;
  if (!shouldPlay) {
    if (musicEl && !musicEl.paused) musicEl.pause();
    return;
  }
  musicEl = musicElementFor(musicSrc);
  if (musicEl.paused) tryPlay(musicEl);
}

function ensureAudioContext() {
  if (audioCtx) return audioCtx;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  try {
    audioCtx = new Ctx();
  } catch (err) {
    return null;
  }
  return audioCtx;
}

// Fetched and decoded once, as soon as the page has parsed, so the
// first shot is not the one that waits for the network. A context made
// before a gesture starts suspended; decoding still works in that state.
function preloadSfx() {
  const ctx = ensureAudioContext();
  if (!ctx || !window.fetch) return;
  Object.keys(SFX_SOURCES).forEach((name) => {
    fetch(assetUrl(SFX_SOURCES[name]))
      .then((res) => (res.ok ? res.arrayBuffer() : Promise.reject(res.status)))
      .then((data) => new Promise((resolve, reject) => {
        // The callback form, because older Android WebViews never
        // returned a promise from decodeAudioData.
        ctx.decodeAudioData(data, resolve, reject);
      }))
      .then((buffer) => { sfxBuffers[name] = buffer; })
      .catch(() => {}); // the <audio> fallback in playSfx covers it
  });
}

function playSfx(name) {
  if (!audioPrefs.sfx || document.hidden) return;
  const src = SFX_SOURCES[name];
  if (!src) return;

  const ctx = audioCtx;
  const buffer = sfxBuffers[name];
  if (ctx && buffer) {
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    gain.gain.value = SFX_VOLUME;
    source.buffer = buffer;
    source.connect(gain);
    gain.connect(ctx.destination);
    source.start(0);
    return;
  }

  const el = assetAudio(src, false);
  el.volume = SFX_VOLUME;
  tryPlay(el);
}

// Called every frame from the top of gameLoop, paused or not. Decides
// which NPC ambience should be audible and eases each element's volume
// toward that, so walking away fades Kabayo out rather than cutting him
// off mid-neigh. A paused world, an open screen or a hidden tab counts
// as nobody being near.
function updateNearSounds(now) {
  const dt = lastNearSoundNow ? Math.min(now - lastNearSoundNow, 100) : 16;
  lastNearSoundNow = now;

  const live = !paused && !uiBlocked && !authGated && !document.hidden &&
    audioPrefs.sfx;
  const wanted = new Set();

  for (const npc of NPCS) {
    if (!npc.nearSound) continue;
    let on = false;
    if (live && !npc.hidden) {
      const gap = edgeGap(posX, PLAYER_WIDTH, npc.x, NPC_WIDTH);
      on = gap < INTERACT_DISTANCE ||
        (npc.nearSoundOn && gap < INTERACT_DISTANCE + NEAR_SOUND_RELEASE);
    }
    npc.nearSoundOn = on;
    if (on) wanted.add(npc.nearSound);
  }

  // A scene with nothing to say, and nothing still fading: done.
  if (!wanted.size && !nearSoundEls.size) return;

  wanted.forEach((src) => {
    if (!nearSoundEls.has(src)) {
      nearSoundEls.set(src, { el: assetAudio(src, true), volume: 0 });
    }
  });

  const stepAmount = (NEAR_SOUND_VOLUME / NEAR_SOUND_FADE_MS) * dt;
  nearSoundEls.forEach((entry, src) => {
    const target = wanted.has(src) ? NEAR_SOUND_VOLUME : 0;
    if (entry.volume < target) {
      entry.volume = Math.min(target, entry.volume + stepAmount);
    } else if (entry.volume > target) {
      entry.volume = Math.max(target, entry.volume - stepAmount);
    }
    entry.el.volume = entry.volume;

    if (target > 0 && entry.el.paused) {
      tryPlay(entry.el);
    } else if (target === 0 && entry.volume === 0) {
      // Faded all the way out: stop, rewind for the next approach, and
      // forget it, so a scene left behind costs nothing per frame.
      entry.el.pause();
      try { entry.el.currentTime = 0; } catch (err) {}
      nearSoundEls.delete(src);
    }
  });
}

function setAudio(prefs) {
  if (prefs && typeof prefs.music === "boolean") audioPrefs.music = prefs.music;
  if (prefs && typeof prefs.sfx === "boolean") audioPrefs.sfx = prefs.sfx;
  syncMusic();
  // updateNearSounds reads audioPrefs.sfx on the next frame and fades
  // any ambience out on its own; nothing to do for it here.
}

// A phone locked or switched away from Chrome should go quiet. Chrome
// usually silences a hidden tab itself, but not reliably on every
// Android build, and a phone in a pocket playing music through a
// lesson is the one audio failure a teacher would hear about.
document.addEventListener("visibilitychange", () => {
  syncMusic();
  if (audioCtx) {
    if (document.hidden) audioCtx.suspend().catch(() => {});
    else audioCtx.resume().catch(() => {});
  }
});

// The browser will not start sound until the page has had a gesture.
// The title tap normally counts, so music starts straight after it, but
// if play() was refused anyway this retries on the next touch or key,
// which is also when a suspended Web Audio context is allowed to resume.
["pointerdown", "keydown", "touchend"].forEach((type) => {
  document.addEventListener(type, () => {
    if (audioCtx && audioCtx.state === "suspended" && !document.hidden) {
      audioCtx.resume().catch(() => {});
    }
    if (musicWanted) syncMusic();
  }, { capture: true, passive: true });
});

preloadSfx();

// =============================================================
// PAUSE
//
// shell.js owns the pause SCREEN. This owns the pause STATE,
// because everything that has to stop lives in this file.
//
// Drawing a panel over the world is not enough. Guards keep
// patrolling behind it and a detection meter keeps filling, which
// is exactly the unfairness the meter was introduced to prevent.
// So the loop stops doing work at all rather than being hidden.
//
// The subtler half is the timers. Invulnerability and the attack
// hold are both measured against performance.now(), which does not
// stop for a pause screen. Left alone, a ten second pause silently
// eats the one second invulnerability window, and a student who
// paused mid-hold releases into a throw they never asked for. Both
// are pushed forward by however long the pause actually lasted.
// =============================================================

let paused = false;
let pausedAt = 0;

function isPaused() {
  return paused;
}

function setPaused(value) {
  const next = Boolean(value);
  if (next === paused) return next;

  // Pausing mid-cutscene is refused rather than handled. The stage
  // sequence is driven by awaited wait() promises, and no flag in
  // here can suspend a setTimeout that has already been scheduled;
  // allowing it would desynchronise the poem from the night
  // transition. A cutscene is short and tapped through, so refusing
  // costs little. The caller is told, so it can leave its screen
  // closed rather than opening one over a game that never stopped.
  if (next && cutscenePlaying) return false;

  paused = next;

  if (paused) {
    pausedAt = performance.now();
  } else {
    const elapsed = performance.now() - pausedAt;
    if (invulnUntil) invulnUntil += elapsed;
    if (attackHoldStart) attackHoldStart += elapsed;
    ENEMIES.forEach((e) => {
      if (e.nextSwingAt) e.nextSwingAt += elapsed;
      if (e.staggerUntil) e.staggerUntil += elapsed;
    });
    if (landPoseUntil) landPoseUntil += elapsed;

    // Resume on a fresh delta. Without this, the first frame back
    // integrates the entire pause in one step. It is clamped to
    // three frames, so nothing falls through the floor, but it is
    // still a visible jolt.
    lastFrameNow = 0;
    lastFrameTime = 0;
  }

  return paused;
}

// --- Game loop ---
let lastFrameNow = 0;

// =============================================================
// THE GUIDE (Block 42)
//
// Students were getting lost: the quest log says what to do, not where,
// and Act I's roads run to 11000px. The guide answers "where" and only
// that. An act declares an ordered list of goals (content, `guide`);
// the first whose conditions hold in the current scene is the target.
// On screen, a bobbing arrow with the target's name stands over it; off
// screen, a tab at the edge of the screen points the way with the
// distance in metres.
//
// The engine still knows nothing about what a goal means. An entry names
// a place the engine can already find (an NPC, an exit, or an x) and the
// flags or quests that decide when it applies, the same vocabulary
// arrivalDialogues and exits already use:
//
//   { scene, requiresFlag, unlessFlag, questOpen, unlessQuest,
//     npc: id | npcs: [ids] | exit: id | x, label }
//
// npcs picks the nearest of several that is visible and still has a gift
// to receive, which is what "the next citizen" means on the pamphlet
// street without the content counting anything.
//
// Hidden whenever a student could not act on it (dialogue, cutscene,
// a screen, a fight) and written only on a change, like everything else
// the loop touches (Block 36).
// =============================================================

const GUIDE_ONSCREEN_MARGIN = 40;  // world px inside the viewport edge
const GUIDE_MARKER_ABOVE = 16;     // above a character's head
const GUIDE_EXIT_HEIGHT = 170;     // over a doorway, which has no head
const PX_PER_METRE = 80;           // Macario is 134px, about 1.7m

let guideDrawn = { mode: null, x: null, bottom: null, markerText: null, edgeText: null };

function guideConditionsHold(entry) {
  if (entry.scene && entry.scene !== currentSceneId) return false;
  if (entry.requiresFlag && !state.flags[entry.requiresFlag]) return false;
  if (entry.unlessFlag && state.flags[entry.unlessFlag]) return false;
  if (entry.questOpen) {
    const q = quests.find((quest) => quest.id === entry.questOpen);
    if (!q || q.done) return false;
  }
  if (entry.unlessQuest && quests.some((quest) => quest.id === entry.unlessQuest)) {
    return false;
  }
  return true;
}

function guideNpcPoint(npc) {
  return {
    x: npc.x + NPC_WIDTH / 2,
    bottom: GROUND_LEVEL + (npc.displayHeight || DISPLAY_HEIGHT) + GUIDE_MARKER_ABOVE,
    label: npc.label,
  };
}

// Where an entry points in this scene, or null if the thing it names is
// not here (a hidden NPC, an exit still shut, every citizen already given
// a pamphlet), in which case the next entry is tried.
function guidePoint(entry) {
  if (entry.npc) {
    const npc = NPCS.find((n) => n.id === entry.npc);
    return npc && !npc.hidden ? guideNpcPoint(npc) : null;
  }
  if (entry.npcs) {
    const centre = posX + PLAYER_WIDTH / 2;
    let best = null;
    let bestDist = Infinity;
    entry.npcs.forEach((id) => {
      const npc = NPCS.find((n) => n.id === id);
      if (!npc || npc.hidden) return;
      if (npc.gift && state.flags[npc.gift.givenFlag]) return;
      const dist = Math.abs(npc.x + NPC_WIDTH / 2 - centre);
      if (dist < bestDist) { best = npc; bestDist = dist; }
    });
    return best ? guideNpcPoint(best) : null;
  }
  if (entry.exit) {
    const exit = ((currentScene && currentScene.exits) || []).find((e) => e.id === entry.exit);
    if (!exit || (exit.requiresFlag && !state.flags[exit.requiresFlag])) return null;
    return {
      x: exit.x + (exit.width || 80) / 2,
      bottom: GROUND_LEVEL + GUIDE_EXIT_HEIGHT,
      label: exit.label,
    };
  }
  if (typeof entry.x === "number") {
    return { x: entry.x, bottom: GROUND_LEVEL + GUIDE_EXIT_HEIGHT, label: "" };
  }
  return null;
}

// The current target, or null. Exposed to the harness by name.
function guideTarget() {
  const entries = (currentActData && currentActData.guide) || [];
  for (const entry of entries) {
    if (!guideConditionsHold(entry)) continue;
    const point = guidePoint(entry);
    if (point) return Object.assign(point, { label: entry.label || point.label || "" });
    // A goal whose place is not in this scene yet stops the search rather
    // than falling through to an earlier step of the story.
    if (entry.stop !== false) return null;
  }
  return null;
}

function guideEls() {
  if (!guideEls.cache) {
    guideEls.cache = {
      marker: document.getElementById("guide-marker"),
      markerLabel: document.querySelector("#guide-marker .guide-label"),
      edge: document.getElementById("guide-edge"),
      edgeLabel: document.querySelector("#guide-edge .guide-label"),
    };
  }
  return guideEls.cache;
}

function updateGuide(active, cameraX) {
  const els = guideEls();
  if (!els.marker || !els.edge) return;

  const target = active && !enemiesAlive() ? guideTarget() : null;
  let mode = null;
  let text = null;

  if (target) {
    const left = cameraX + GUIDE_ONSCREEN_MARGIN;
    const right = cameraX + viewportWidth - GUIDE_ONSCREEN_MARGIN;
    if (target.x >= left && target.x <= right) {
      mode = "marker";
      text = target.label;
    } else {
      mode = target.x < left ? "edge-left" : "edge-right";
      const metres = Math.max(1, Math.round(Math.abs(target.x - (posX + PLAYER_WIDTH / 2)) / PX_PER_METRE));
      text = (target.label ? target.label + " " : "") + metres + "m";
    }
  }

  if (mode !== guideDrawn.mode) {
    els.marker.classList.toggle("hidden", mode !== "marker");
    els.edge.classList.toggle("hidden", !mode || mode === "marker");
    els.edge.classList.toggle("guide-edge-left", mode === "edge-left");
    els.edge.classList.toggle("guide-edge-right", mode === "edge-right");
    guideDrawn.mode = mode;
  }
  if (!mode) return;

  if (mode === "marker") {
    if (target.x !== guideDrawn.x) {
      els.marker.style.left = target.x + "px";
      guideDrawn.x = target.x;
    }
    if (target.bottom !== guideDrawn.bottom) {
      els.marker.style.bottom = target.bottom + "px";
      guideDrawn.bottom = target.bottom;
    }
    if (text !== guideDrawn.markerText) {
      els.markerLabel.textContent = text;
      guideDrawn.markerText = text;
    }
  } else if (text !== guideDrawn.edgeText) {
    els.edgeLabel.textContent = text;
    guideDrawn.edgeText = text;
  }
}

function gameLoop(now) {
  now = now || 0;

  // Before the pause check, on purpose: a paused world has to be able
  // to fade its ambience OUT, and the paused branch below does nothing
  // else.
  updateNearSounds(now);

  // A paused game does no work whatsoever. The next frame is still
  // requested, so resuming is a flag flip rather than a restart.
  if (paused) {
    requestAnimationFrame(gameLoop);
    return;
  }

  // Frame delta expressed in 60fps frames, clamped so a tab returning from
  // the background does not integrate one huge step and drop the player
  // through the floor. The target device will not hold 60fps, and a
  // frame-counted jump would reach half its height at 30.
  const step = lastFrameNow ? Math.min((now - lastFrameNow) / 16.67, 3) : 1;

  // Play time in real milliseconds, from the same delta the physics uses
  // and clamped the same way. Paused frames never reach here because the
  // loop returns early above, so pause is excluded for free; the login
  // screen and any open overlay are excluded explicitly.
  //
  // This is deliberately not the difference between two wall-clock
  // timestamps, which would count the minutes a student spent with the
  // tab in their pocket.
  const deltaMs = lastFrameNow ? Math.min(now - lastFrameNow, 50) : 0;
  if (!authGated && !uiBlocked) playMs += deltaMs;

  lastFrameNow = now;

  let isWalking = false;
  const canAct = !inDialogue && !cutscenePlaying && !authGated && !uiBlocked;

  if (canAct) {
    if (keysPressed["a"]) {
      posX -= SPEED * step;
      facing = -1;
      isWalking = true;
    }
    if (keysPressed["d"]) {
      posX += SPEED * step;
      facing = 1;
      isWalking = true;
    }
    posX = Math.max(0, Math.min(posX, WORLD_WIDTH - PLAYER_WIDTH));
  }

  // Vertical motion resolves every frame regardless of canAct, so a player
  // who triggers dialogue mid-air still lands rather than hanging there.
  velY -= GRAVITY * step;
  if (velY < TERMINAL_VELOCITY) velY = TERMINAL_VELOCITY;

  const previousY = posY;
  posY += velY * step;

  const surface = groundHeightAt(posX, previousY);
  if (posY <= surface) {
    // Block 35. Touching down from a real fall holds the landing frame
    // for a moment. Measured by the speed he lands at, so stepping down
    // a ramp does not count as a landing.
    if (!onGround && velY < -4) landPoseUntil = now + LAND_POSE_MS;
    posY = surface;
    velY = 0;
    onGround = true;
  } else {
    onGround = false;
  }
  const airborne = !onGround && (velY > 0 || posY - surface > AIRBORNE_MIN_HEIGHT);

  // Walking or in the air is moving; anything else, including talking
  // or holding the attack button, is standing still.
  playerStill = !isWalking && onGround;
  if (canAct) updateGuards(step);
  if (canAct) updateGuardBullets(step);
  if (canAct) updateEnemies(step, now);

  // After the vertical resolution, so the ground test sees where the
  // player actually ended up this frame rather than where they were
  // mid-fall.
  updateHazards();
  updatePickups();

  updateProjectile(step);

  // During the stage cutscene, leave whatever animation is already set
  // (such as "dead") rather than switching back to idle or walk. The
  // same holds while an attack clip owns the pose (aiming, firing or
  // punching) — see updateAttackHoldPose, playShootFire and playMelee.
  if (canAct) updateAttackHoldPose(now);
  // Block 57. A script walking him (movePlayer) shows the walk even
  // though the cutscene holds everything else still.
  if (scriptWalking && !shooting) {
    applyAnim("walk");
  } else if (!cutscenePlaying && !shooting) {
    if (airborne) {
      applyAnim(velY > 0 ? "jumpRise" : "jumpFall");
    } else if (!isWalking && now < landPoseUntil) {
      applyAnim("jumpLand");
    } else {
      applyAnim(isWalking && onGround ? "walk" : "idle");
    }
  }
  updateAnimFrame(now);
  npcAnimators.forEach((animator) => animator.update(now));

  // Writing the same pixel back still invalidates the element, so both
  // are written only when they move (Block 36). Standing still, reading
  // dialogue or in a shop, this is the difference between a frame that
  // lays out and one that does not.
  if (posX !== lastDrawnX) {
    player.style.left = posX + "px";
    lastDrawnX = posX;
  }
  if (posY !== lastDrawnY) {
    player.style.bottom = posY + "px";
    lastDrawnY = posY;
  }

  // Camera: centre the player, clamped to world bounds.
  let cameraX = posX - (viewportWidth || measureViewport()) / 2 + PLAYER_WIDTH / 2;
  cameraX = Math.max(0, Math.min(cameraX, WORLD_WIDTH - viewportWidth));
  if (cameraX !== lastCameraX) {
    world.style.transform = `translateX(${-cameraX}px)`;
    lastCameraX = cameraX;
  }

  // Block 42. Where to go next, while the student can act on it.
  updateGuide(!inDialogue && !cutscenePlaying && !authGated && !uiBlocked, cameraX);

  // Interact and gift buttons follow whichever NPC or stage is nearby.
  if (!inDialogue && !cutscenePlaying && !authGated && !uiBlocked) {
    mobileControls.classList.remove("hidden");
    // The pause button rides along with the movement controls rather
    // than tracking its own condition. The branch this sits in is
    // already the exact definition of "the student is playing", and a
    // second copy of it would be a second thing to keep in step.
    if (btnPause) btnPause.classList.remove("hidden");
    if (btnInventoryMain && window.Inventory) {
      btnInventoryMain.classList.remove("hidden");
    }
    if (btnShopMain && window.Inventory) {
      btnShopMain.classList.remove("hidden");
    }
    nearby = findNearby();
    if (nearby.type === "npc" && npcOpensShop(nearby.ref)) {
      setLabel(btnInteract, "Tindahan");
      btnInteract.classList.add("active");
    } else if (nearby.type === "npc") {
      setLabel(btnInteract, nearby.ref.interactLabel || "Usap");
      btnInteract.classList.add("active");
    } else if (nearby.type === "stage") {
      setLabel(btnInteract, "Ganap");
      btnInteract.classList.add("active");
    } else if (nearby.type === "exit") {
      setLabel(btnInteract, nearby.ref.label || "Pasok");
      btnInteract.classList.add("active");
    } else {
      setLabel(btnInteract, "E");
      btnInteract.classList.remove("active");
    }

    if (nearby.type === "npc" && canGiveGift(nearby.ref)) {
      setLabel(giftBtn, nearby.ref.gift.buttonLabel);
      giftBtn.classList.remove("hidden");
    } else {
      giftBtn.classList.add("hidden");
    }
  } else {
    // Dialogue or cutscene is showing. Tapping the dialogue box
    // advances it, so tuck the movement controls away.
    mobileControls.classList.add("hidden");
    if (btnPause) btnPause.classList.add("hidden");
    if (btnInventoryMain) btnInventoryMain.classList.add("hidden");
    if (btnShopMain) btnShopMain.classList.add("hidden");
    giftBtn.classList.add("hidden");
    setLabel(btnInteract, "E");
    btnInteract.classList.remove("active");
  }

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);

// =============================================================
// AUTH + SAVE/LOAD (Supabase)
// Login only. Accounts are pre-created by the developer via the
// admin script, not by self-signup.
// =============================================================

const authForm = document.getElementById("auth-form");
const authEmail = document.getElementById("auth-email");
const authPassword = document.getElementById("auth-password");
const authSubmit = document.getElementById("auth-submit");
const authStatus = document.getElementById("auth-status");
const authOverlay = document.getElementById("auth-overlay");

let currentUserId = null;
let currentProfile = null; // the logged-in student's profiles row
let isGuest = false; // see enterGameAsGuest, Block 14
let autosaveTimer = null; // guards against stacking a second interval

authForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  authSubmit.disabled = true;
  authStatus.textContent = "Loading...";
  authStatus.className = "";

  const email = authEmail.value.trim();
  const password = authPassword.value;

  try {
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    // On success, onAuthStateChange takes over.
  } catch (err) {
    authStatus.textContent = err.message || "May error, subukan ulit.";
    authStatus.className = "";
  } finally {
    authSubmit.disabled = false;
  }
});

// AUTH BOOTSTRAP RUNS AFTER EVERY SCRIPT TAG HAS PARSED.
//
// This used to run at parse time, and that was a real bug rather
// than a style point. acts.js and assessment.js load AFTER this
// file, by design, but enterGameAsUser needs both. When a session
// is already in storage, getSession() resolves on a microtask,
// which runs before the browser reaches the next script tag. The
// act lookup was therefore skipped on every single reload, the
// window.Acts guards silently swallowed it, and the student was
// dropped into Act I no matter what current_act said.
//
// DOMContentLoaded fires after all synchronous scripts at the end
// of body have executed, so by here the whole page is assembled.
// The listener is registered rather than called directly because
// this file is not last in the document.
document.addEventListener("DOMContentLoaded", startAuth);

function startAuth() {
  sb.auth.onAuthStateChange((_event, session) => {
    if (session) enterGameAsUser(session.user.id);
  });

  sb.auth.getSession().then(({ data: { session } }) => {
    if (session) enterGameAsUser(session.user.id);
  });
}

async function enterGameAsUser(userId) {
  if (currentUserId === userId) return; // already entered

  // Look up the role before doing anything student-specific. A teacher
  // reaching this point would otherwise be dropped into the game and
  // given a game_progress row, polluting their own class averages.
  const { data: profile, error: profileError } = await sb
    .from("profiles")
    .select("id, role, full_name, class_id")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) {
    console.error("Profile fetch failed:", profileError);
    authStatus.textContent = "May error sa account. Subukan ulit.";
    return;
  }

  if (profile && profile.role === "teacher") {
    authStatus.textContent = "Teacher account, inililipat sa dashboard...";
    authStatus.className = "success";
    window.location.replace("teacher.html");
    return;
  }

  // --- Student path ---
  currentUserId = userId;
  currentProfile = profile || null;
  authOverlay.classList.add("hidden");
  authGated = false;

  // ORDER HERE IS LOAD BEARING, in three separate ways.
  //
  // The act_progress map has to be read before the act is chosen,
  // because Acts.resolveAct cannot tell a locked act from an open
  // one without it.
  //
  // The act has to be loaded before the save is applied, because
  // loadAct() resets posX to that act's startX and would otherwise
  // throw away the restored position.
  //
  // And syncStart has to run last, because its catch-up objective
  // count reads the flags the save restores, and because it is what
  // resumes the pre-test, which must not begin until the shell has
  // handed the screen over.
  const row = await loadProgress(userId);
  if (!row) return;

  let actNumber = 1;
  if (window.Acts) {
    await Acts.loadProgressMap();
    actNumber = Acts.resolveAct(row.current_act);

    // Set before saves are unblocked, so nothing can write a stale
    // current_act in the window before syncStart runs.
    Acts.current = actNumber;

    // Always reload, even for Act I, because the stored scene may not be
    // the one the parse-time load built. An unknown scene id, including
    // the "empty" that old saves hold, falls back to the act's first
    // scene inside loadScene, which is the whole legacy migration.
    loadAct(Acts.getAct(actNumber), row.current_room);
  }

  applyLoadedState(row);

  saveReady = true;

  // The world is built and the save is restored. Hand the screen to
  // the shell and WAIT there for the student to tap Magpatuloy.
  //
  // This call is the only signal the shell gets, deliberately. An
  // event was tried first and is the wrong mechanism: shell.js
  // registers its listener inside its own DOMContentLoaded handler,
  // which runs after this file's, and the browser drains microtasks
  // between the two. A stored session can therefore have this function
  // already running before the shell is listening at all. That is the
  // same microtask hazard recorded in the pitfalls below, and calling
  // the shell directly is immune to it.
  //
  // Waiting here, rather than letting syncStart run underneath, is the
  // whole point. syncStart resumes the trivia card and the pre-test,
  // and those open an overlay of their own. Started now, they would
  // run behind the title screen, where a student can neither see them
  // nor answer them, and the first thing they would meet on tapping
  // Magpatuloy is a test already in progress.
  //
  // THIS IS THE ONE PLACE ANYTHING GUARDS ON window.Shell. Everywhere
  // else a missing shell should fail loudly and immediately, because
  // it is not optional the way assessment.js is. Here it would instead
  // hang the login on a promise that nothing left on the page can ever
  // resolve, and a student staring at a frozen screen cannot report
  // what went wrong.
  if (window.Shell) await Shell.awaitEntry();

  // The title tap that resolved awaitEntry is the user gesture a
  // browser wants before it will play sound; see startMusic.
  startMusic();

  if (window.Acts) await Acts.syncStart(actNumber);

  // Block 52. Only while the act is actually being played: a student who
  // lands on the completed screen, or in a locked act, has no scene to
  // watch.
  if (!window.Acts || Acts.status === "playing") enterWorldScripts();

  // Safety-net save, in case something set saveDirty without going
  // through markDirty's own debounce.
  if (autosaveTimer === null) {
    autosaveTimer = setInterval(() => {
      if (saveDirty) saveProgress();
    }, 10000);
  }
}

// Block 14. Play-as-guest: skips Supabase entirely rather than
// authenticating as a real, disposable account. currentUserId is
// deliberately never set for a guest, which is what makes this safe
// to add without touching every write site by hand: saveProgress,
// Acts.syncStart, Acts._ensureRow, Acts.setStatus and
// Acts.checkObjectives all already refuse to run without a
// currentUserId (see acts.js), because that guard was written for
// "nothing to write yet" rather than "guest", and it already covers
// this case for free. A guest therefore gets exactly Act I's world —
// movement, dialogue, combat, health — and nothing that touches the
// database: no game_progress row, no act_progress row, no trivia, no
// pre-test or post-test, no currency, no equipment grant. Closing the
// tab loses everything, which is the point.
//
// See CLAUDE.md, Decisions on record, Guest mode, for why
// Acts.syncStart is skipped outright rather than called and trusted
// to no-op.
async function enterGameAsGuest() {
  if (currentUserId || isGuest) return; // a real login, or already a guest

  isGuest = true;
  authOverlay.classList.add("hidden");
  authGated = false;

  if (window.Acts) {
    Acts.current = 1;
    loadAct(Acts.getAct(1), "tondo");
  }

  if (window.Shell) await Shell.awaitEntry();
  startMusic();
  enterWorldScripts();
}

async function loadProgress(userId) {
  let { data: row, error } = await sb
    .from("game_progress")
    .select("*")
    .eq("student_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Load error:", error);
    return null;
  }

  if (!row) {
    // First time playing. Create a default save row.
    const { data: inserted, error: insertError } = await sb
      .from("game_progress")
      .insert({ student_id: userId })
      .select()
      .single();
    if (insertError) {
      console.error("Insert error:", insertError);
      return null;
    }
    row = inserted;
  }

  // Returns rather than applying. The caller has to load the right
  // act in between reading this row and restoring it.
  return row;
}

function applyLoadedState(row) {
  const saved = row.save_state || {};

  if (Array.isArray(saved.quests)) {
    quests.length = 0;
    quests.push(...saved.quests);
    renderQuests();
  }

  if (saved.flags) {
    Object.assign(state.flags, saved.flags);
  }

  // Absent on any save written before Block 9, which is why each field is
  // checked rather than the object being assigned wholesale. An older
  // save resumes with zeroed counters, which is the best that can be done
  // for data that was never recorded.
  if (saved.stats) {
    if (typeof saved.stats.damageTaken === "number") {
      damageTaken = saved.stats.damageTaken;
    }
    if (typeof saved.stats.detections === "number") {
      detections = saved.stats.detections;
    }
    if (typeof saved.stats.playMs === "number") {
      playMs = saved.stats.playMs;
    }
  }

  if (typeof row.currency === "number") currency = row.currency;
  // Block 52. A step that counts barya was drawn before the balance was
  // restored; draw it again with the real number.
  renderQuests();

  if (typeof saved.posX === "number") {
    posX = saved.posX;
    // Drop to whatever surface is under the restored position, rather
    // than resuming at the height the previous scene happened to use.
    posY = floorHeightAt(posX);
    velY = 0;
  }

  // currentRoom is set by loadScene, which has already run and has
  // already resolved an unknown or legacy scene id to a real one.

  if (row.is_night) {
    skylineNight.classList.add("visible");
  }

  // Any NPC whose reveal flag is already set in the restored save.
  revealNpcsByFlag();

  // Health is deliberately not restored. A student who closed the tab on
  // one heart resumes at full, because punishing them for a bus arriving
  // is not a mechanic worth having.
  health = maxHealth;
  updateHudVisibility();
}

function markDirty() {
  // Block 48. Flags are set by content directly and then markDirty is
  // called, so this is the one place a change of step is always seen.
  if (currentActData && currentActData.linearObjectives) renderQuests();
  saveDirty = true;
  clearTimeout(saveDebounceTimer);
  saveDebounceTimer = setTimeout(() => {
    if (saveDirty) saveProgress();
  }, 800);
}

async function saveProgress() {
  if (!currentUserId || !saveReady) return;
  saveDirty = false;

  const payload = {
    student_id: currentUserId,
    current_room: currentRoom,
    // Without this the column keeps its default of 1 forever, the
    // dashboard's Act column is meaningless, and there is nothing
    // for the next login to resume into.
    current_act: window.Acts ? Acts.current : 1,
    is_night: skylineNight.classList.contains("visible"),
    currency,
    save_state: {
      quests,
      flags: state.flags,
      posX,
      stats: { damageTaken, detections, playMs },
    },
    updated_at: new Date().toISOString(),
  };

  const { error } = await sb.from("game_progress").upsert(payload);
  if (error) console.error("Save error:", error);

  // Recount objectives on the same cadence as the save rather than
  // after every flag mutation. This early-returns when the count has
  // not moved, so most calls cost nothing.
  if (window.Acts) Acts.checkObjectives();
}

window.addEventListener("beforeunload", () => {
  if (saveDirty) saveProgress();
});

// Logout has to await this. saveProgress is debounced by 800ms, so
// signing out in the second after an objective registers would drop
// it, and a shared classroom phone is exactly where logout gets used
// one second after something happened.
async function flushSave() {
  clearTimeout(saveDebounceTimer);
  if (saveDirty) await saveProgress();
}

// The opposite of flushSave, and the only caller is the full reset.
//
// After reset_my_play_data() has run there is no game_progress row,
// and every piece of state this file is holding describes a student
// who no longer exists in the database. Anything that writes between
// the wipe and the reload puts some of it straight back, which is
// the difference between a fresh start and a half-wiped account that
// looks fine and is not.
//
// All four write paths have to stop, not just the debounce: the
// pending timer, the ten second autosave, the beforeunload flush
// (which reads saveDirty), and saveProgress itself (which is gated
// on saveReady). Clearing only the timer was the first version of
// this and the autosave rewrote the row two seconds later.
function stopSaving() {
  saveReady = false;
  saveDirty = false;
  clearTimeout(saveDebounceTimer);
  if (autosaveTimer !== null) {
    clearInterval(autosaveTimer);
    autosaveTimer = null;
  }
}

// =============================================================
// SHELL FACADE
//
// The whole of what shell.js is allowed to touch. Everything else
// in this file stays private to it.
//
// Unlike window.Assessment, this is NOT optional, and nothing
// should guard on its presence. assessment.js can be absent and the
// act flow degrades honestly to playing then completed; a missing
// shell means no way into the game at all. A guard there would turn
// a load failure into a blank screen with nothing in the console.
// =============================================================

window.Game = {
  setPaused,
  isPaused,
  flushSave,

  // Silences every save path. Called by shell.js immediately before
  // the full reset, so nothing writes the wiped student back.
  stopSaving,
  setUiBlocked,
  isSignedIn: () => Boolean(currentUserId),

  // Block 14. See enterGameAsGuest above for what a guest does and,
  // more importantly, does not do.
  enterAsGuest: enterGameAsGuest,
  isGuest: () => isGuest,

  // Read by acts.js, which is the only thing that writes them anywhere.
  // Returned as a copy so a caller cannot mutate the engine's counters by
  // holding onto the object.
  stats: () => ({ damageTaken, detections, playMs }),

  // Set by inventory.js from the student's equipped items, and by nothing
  // else. Takes numbers rather than items deliberately: the engine applies
  // a bonus and a multiplier and never learns what produced them, which is
  // the same line game.js holds against acts.js.
  setEffects,

  // Block 25. Health as the inventory screen needs it: what the student
  // has, to decide whether an apple would do anything, and a heal, which
  // is the whole of what a consumable does to the engine. heal refuses at
  // full health and reports it, so a use is never spent for nothing, the
  // same rule a heart pickup follows. Numbers in, numbers out: the engine
  // still never learns that the heal was an apple.
  health: () => ({ health, max: maxHealth }),

  heal(amount) {
    const n = Math.max(0, Math.floor(Number(amount) || 0));
    if (!n || health >= maxHealth) return false;
    health = Math.min(maxHealth, health + n);
    renderHearts();
    return true;
  },

  // Block 30. The two sound switches, as plain booleans. shell.js owns
  // the setting and where it is stored; this owns what it silences.
  setAudio,
  audio: () => ({ music: audioPrefs.music, sfx: audioPrefs.sfx }),

  // Block 57. The tasks already done, for the settings panel, which is
  // where they are listed now rather than under the log. Lines only.
  doneQuests: doneQuestTexts,

  // Swaps the player's sprite sheets for an outfit's. Awaitable, because
  // the sheets have to load before the swap is visible.
  setOutfit,

  // Currency. acts.js awards it, inventory.js spends it, and the column
  // itself is written by saveProgress along with everything else, so an
  // award costs no extra round trip.
  currency: () => currency,

  addCurrency(amount) {
    const n = Math.max(0, Math.round(Number(amount) || 0));
    if (!n) return currency;
    currency += n;
    markDirty();
    return currency;
  },

  // Returns false and changes nothing when the student is short, so a
  // caller can treat it as the whole of the affordability check.
  spendCurrency(amount) {
    const n = Math.max(0, Math.round(Number(amount) || 0));
    if (n > currency) return false;
    currency -= n;
    markDirty();
    return true;
  },

  // Called from Acts.enterAct, so the counters are per act. NOT called on
  // respawn, on a scene change, or on death: being sent back to the start
  // of the outpost is the cost of being caught, and wiping the record of
  // it would make the score measure the last attempt rather than the act.
  resetStats() {
    damageTaken = 0;
    detections = 0;
    playMs = 0;
  },

  // shell.js is the only thing that knows how to open the shop screen,
  // and game.js is the only thing that knows an NPC just asked for it
  // (opensShop: true, handled in handleInteractPress). Registered once,
  // from shell.js's own init, the same direction Inventory.onChange
  // already runs in.
  onShopRequest(fn) {
    shopRequestListener = typeof fn === "function" ? fn : null;
  },
};
