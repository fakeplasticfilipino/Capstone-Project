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
  (span || el).textContent = text;
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
// so they never appear if that module fails to load — the same guard
// shell.js applies to their pause-menu counterparts.
const btnInventoryMain = document.getElementById("btn-inventory");
const btnShopMain = document.getElementById("btn-shop");

const questListEl = document.getElementById("quest-list");
const giftBtn = document.getElementById("gift-btn");

const PLAYER_WIDTH = 40;
const SPEED = 5;
const INTERACT_DISTANCE = 90;
// .npc-sprite's CSS width (style.css) — used only to size the interact
// zone around an NPC's own anchor (npc.x, its left edge, same as
// posX for the player), never to place the NPC itself. A rough
// constant rather than each NPC's real rendered width, the same way
// PLAYER_WIDTH already is: exact per-NPC widths (an animated sheet's
// varies by its own aspect ratio) aren't tracked in NPC data, and
// don't need to be for a reach check. See findNearby's edgeGap.
const NPC_WIDTH = 80;
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
let equipEffects = { maxHealthBonus: 0, projectileSpeedMult: 1 };

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

// Bump this whenever ANY file in Assets/ is replaced.
//
// The v=N strings in index.html only cover scripts and stylesheets.
// Images had no version at all, so browsers and the GitHub Pages CDN
// kept serving stale sprites indefinitely after a file was swapped.
// Every image load goes through assetUrl() so one number refreshes them all.
const ASSET_VERSION = 8;

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

// Emptied on an act change. The log is "Mga Gawain", the tasks in
// front of you now, not a permanent record of everything ever done.
function clearQuests() {
  quests.length = 0;
  renderQuests();
  markDirty();
}

function renderQuests() {
  questListEl.innerHTML = "";
  quests.forEach((q) => {
    const li = document.createElement("li");
    li.textContent = q.text;
    if (q.done) li.classList.add("completed");
    questListEl.appendChild(li);
  });
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
let HIDE_SPOTS = []; // regions that suppress guard detection
let HAZARDS = []; // ground regions that cost one health on contact
let PICKUPS = []; // collectibles; currently only hearts

// Native pixel dimensions of Assets/Act 1/Tondo.png. #skyline scales that
// image via background-size: auto 100%, so at any rendered height the
// tile is exactly this ratio times as wide — used by buildSkylineShadows()
// below to find exactly where the background repeats, without hardcoding
// a pixel width that would only be right at one screen size / --zoom.
const SKYLINE_ASPECT = 1983 / 793;
const TREE_SHADOW_WIDTH = 140; // px, width of each seam-masking shadow band

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

  buildSkylineShadows();
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
  currentScene = null;
  currentSceneId = null;
}

function unloadAct() {
  unloadScene();
  SCENES = [];
  currentActData = null;
}

// Places one .tree-shadow div at each x where the tiled #skyline background
// image repeats, so the seam reads as a tree's cast shadow rather than an
// obvious texture repeat. Recomputed fresh every scene load (there is no
// window-resize handling anywhere in this engine — see CLAUDE.md — so this
// one-time-per-scene computation matches how everything else here works)
// from the skyline element's actual rendered height, since background-size:
// auto 100% makes the tile's pixel width depend on viewport size / --zoom,
// not a fixed constant. Appended to #world before any NPC/guard/decoration
// so it sits low in the DOM-order stacking tier, alongside #ground-tiles.
function buildSkylineShadows() {
  const skyline = document.getElementById("skyline");
  const renderedHeight = skyline.clientHeight;
  if (!renderedHeight) return; // not laid out yet — skip rather than divide by 0
  const tileWidth = renderedHeight * SKYLINE_ASPECT;
  const totalWidth = world.clientWidth;
  for (let seamX = tileWidth; seamX < totalWidth; seamX += tileWidth) {
    const shadow = document.createElement("div");
    shadow.className = "tree-shadow";
    shadow.style.left = `${seamX - TREE_SHADOW_WIDTH / 2}px`;
    shadow.style.width = `${TREE_SHADOW_WIDTH}px`;
    world.appendChild(shadow);
    actElements.push(shadow);
  }
}

function buildNpcs(token) {
  NPCS.forEach((npc) => {
    // Reset per-load runtime state so replaying an act starts clean.
    npc.stage = 0;

    // An NPC that starts hidden stays hidden until its flag is set.
    // Checking the flag here rather than only on reveal means a
    // reloaded save rebuilds the world in the right state without
    // the engine knowing which NPC belongs to which act.
    npc.hidden =
      Boolean(npc.startsHidden) && !state.flags[npc.revealedByFlag];

    const el = document.createElement("div");
    el.className = "entity";
    el.id = "npc-" + npc.id;
    el.style.left = npc.x + "px";
    if (npc.hidden) el.style.display = "none";

    if (npc.animation) {
      // Animated sprite sheet, same system and display size as the player.
      const spriteEl = document.createElement("div");
      spriteEl.className = "sprite npc-sprite npc-anim-sprite";
      el.appendChild(spriteEl);
      world.appendChild(el);
      setupNpcAnimation(npc.animation, spriteEl, DISPLAY_HEIGHT, token);
    } else {
      // Static image, falling back to a placeholder box showing the
      // expected filename if the file is missing. An <img> cannot
      // display text, so on error it is swapped for a real div.
      const img = document.createElement("img");
      img.className = "sprite npc-sprite";
      img.src = assetUrl(npc.img);
      img.alt = npc.label;
      img.onerror = () => {
        const placeholder = document.createElement("div");
        placeholder.className = "sprite npc-sprite";
        // Same box every other character gets. 80 by 112 was written
        // here before anything else used a placeholder, and it left
        // Macario a head taller than every NPC and guard on screen.
        // Nobody saw it while the camera was zoomed in far enough to
        // show him alone.
        showPlaceholder(
          placeholder,
          npc.img,
          Math.round(DISPLAY_HEIGHT * 0.7),
          DISPLAY_HEIGHT
        );
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
    el.style.left = dec.x + "px";

    const spriteEl = document.createElement("div");
    spriteEl.className = "sprite npc-sprite npc-anim-sprite";
    el.appendChild(spriteEl);
    world.appendChild(el);

    setupNpcAnimation(
      dec.animation,
      spriteEl,
      dec.displayHeight || DISPLAY_HEIGHT,
      token
    );

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
  "Assets/Act 1/Tondo.png",
  "Assets/Act 1/Tondo.png"
);
checkBackgroundImage(
  document.getElementById("skyline-night"),
  "Assets/Act 1/Tondo_Night.png",
  "Assets/Act 1/Tondo_Night.png"
);
checkBackgroundImage(
  document.getElementById("ground-tiles"),
  "Assets/Cement_Tile.png",
  "Assets/Cement_Tile.png"
);

function setupNpcAnimation(sheet, el, displayHeight, token) {
  displayHeight = displayHeight || DISPLAY_HEIGHT;
  let frame = 0;
  let lastTime = 0;

  loadSpriteSheet(sheet).then(() => {
    // The act may have changed while this image was loading.
    if (token !== undefined && token !== actLoadToken) return;

    if (sheet.failed) {
      showPlaceholder(
        el,
        sheet.src,
        Math.round(displayHeight * 0.7),
        displayHeight
      );
      return;
    }

    // Grid aware, matching the player. NPC sheets are single-row today,
    // but the first multi-row sheet delivered would otherwise render
    // at the wrong scale and walk off the right edge of the image.
    const columns = sheet.columns || sheet.frames;
    const fit = spriteFit(sheet, displayHeight);

    el.style.width = fit.displayFrameWidth + "px";
    el.style.height = displayHeight + "px";
    // Quoted: an unquoted CSS url() breaks on the first space in the
    // path, and Assets/Act 1/Nanay.png has one. Without the quotes
    // this silently no-ops (backgroundImage stays "none") even though
    // the preload above already succeeded and computed real frame
    // geometry, which makes the failure look like a smaller layout
    // bug rather than the sprite never actually drawing.
    el.style.backgroundImage = `url("${assetUrl(sheet.src)}")`;
    el.style.backgroundSize =
      sheet.naturalWidth * fit.scale + "px " + sheet.naturalHeight * fit.scale + "px";
    el.style.backgroundPositionY = -fit.topOffset + "px";
    el.style.backgroundPositionX = "0px";

    npcAnimators.push({
      update(now) {
        const frameDuration = 1000 / sheet.fps;
        if (now - lastTime >= frameDuration) {
          lastTime = now;
          frame = (frame + 1) % sheet.frames;
          const column = frame % columns;
          const row = Math.floor(frame / columns);
          el.style.backgroundPositionX = -(column * fit.displayFrameWidth) + "px";
          el.style.backgroundPositionY = -(row * fit.rowStep + fit.topOffset) + "px";
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

// columns is how many frames sit across one row of the sheet. Omit it
// for a plain single-row strip and it defaults to the frame count.
// Macario_Walking.png is a full 5 by 4 grid, 20 frames across 5 columns.
// Macario_Idle.png is a 5 + 5 + 5 + 1 grid, 16 frames across 5 columns.
// Both are real commissioned art, delivered this session, and live in
// Assets/Prefab (not Assets/ directly) alongside any other sprite that
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
    src: "Assets/Prefab/Macario_Idle.png", frames: 16, fps: 6, columns: 5,
    contentTop: 73, contentHeight: 106,
  },
  walk: {
    src: "Assets/Prefab/Macario_Walking.png", frames: 20, fps: 12, columns: 5,
    contentTop: 60, contentHeight: 127,
  },
  dead: { src: "Assets/Dead.png", frames: 5, fps: 6, columns: 5, loop: false },

  // One 25-frame sheet, played as two separate named views rather than
  // two files, via the optional startFrame/endFrame fields (see
  // applyAnim/updateAnimFrame and Sprite sheets in CLAUDE.md): frames
  // 0-12 are the aim/draw-up pose, held on frame 12 for as long as the
  // attack button stays down, and frames 13-15 are the fire flourish (a
  // muzzle flash lands on frame 14), played once at the instant the
  // throw actually happens. Frames 16-24 are unused for now. fps for
  // both, like the walk/idle pair before them, is a first guess nobody
  // has judged on a phone yet.
  shootAim: {
    src: "Assets/Prefab/Macario_Shooting.png", frames: 25, fps: 8, columns: 5,
    startFrame: 0, endFrame: 12, loop: false,
    contentTop: 23, contentHeight: 51,
  },
  shootFire: {
    src: "Assets/Prefab/Macario_Shooting.png", frames: 25, fps: 12, columns: 5,
    startFrame: 13, endFrame: 15, loop: false,
    contentTop: 23, contentHeight: 51,
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
  const contentTop = sheet.contentTop || 0;
  const scale = displayHeight / contentHeight;
  return {
    scale,
    displayFrameWidth: sheet.frameWidth * scale,
    // The scaled distance from one row to the next in the background
    // image. Equal to displayHeight only in the no-correction case
    // (contentHeight === frameHeight); otherwise the scaled frame is
    // taller than the box it is cropped into, and stepping by
    // displayHeight instead of this would land on the wrong row.
    rowStep: sheet.frameHeight * scale,
    topOffset: contentTop * scale,
  };
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
}

// Undo showPlaceholder's inline styles so a real sprite renders cleanly.
function clearPlaceholder(el) {
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
    showPlaceholder(
      playerSpriteEl,
      sheet.src,
      Math.round(DISPLAY_HEIGHT * 0.7),
      DISPLAY_HEIGHT
    );
    return;
  }

  clearPlaceholder(playerSpriteEl);

  // Scale so the CHARACTER (per contentHeight, see spriteFit above
  // loadSpriteSheet), not the whole frame, is DISPLAY_HEIGHT tall, and
  // shift the background up so its feet (contentTop + contentHeight)
  // land on the box's bottom edge instead of the frame's.
  const fit = spriteFit(sheet, DISPLAY_HEIGHT);

  playerSpriteEl.style.width = fit.displayFrameWidth + "px";
  playerSpriteEl.style.height = DISPLAY_HEIGHT + "px";
  // Quoted for the same reason as setupNpcAnimation above: a path
  // with a space breaks an unquoted url().
  playerSpriteEl.style.backgroundImage = `url("${assetUrl(sheet.src)}")`;
  playerSpriteEl.style.backgroundSize =
    sheet.naturalWidth * fit.scale + "px " + sheet.naturalHeight * fit.scale + "px";
  playerSpriteEl.style.backgroundPositionY = -fit.topOffset + "px";
  playerSpriteEl.style.backgroundPositionX = "0px";
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
      const columns = sheet.columns || sheet.frames;
      const column = currentFrame % columns;
      const row = Math.floor(currentFrame / columns);

      const fit = spriteFit(sheet, DISPLAY_HEIGHT);

      playerSpriteEl.style.backgroundPositionX =
        -(column * fit.displayFrameWidth) + "px";
      playerSpriteEl.style.backgroundPositionY =
        -(row * fit.rowStep + fit.topOffset) + "px";
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

  for (const npc of NPCS) {
    if (npc.hidden) continue;
    const dist = edgeGap(posX, PLAYER_WIDTH, npc.x, NPC_WIDTH);
    if (dist < INTERACT_DISTANCE && dist < closestDist) {
      closest = npc;
      closestType = "npc";
      closestDist = dist;
    }
  }

  if (STAGE) {
    const stageDist = Math.abs(posX - STAGE.x);
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

function requestShop() {
  if (shopRequestListener) shopRequestListener();
}

function handleInteractPress() {
  if (authGated || uiBlocked) return;
  if (inDialogue) {
    advanceDialogue();
  } else if (cutscenePlaying) {
    // ignore E while the performance or blackout sequence runs
  } else if (nearby.type === "npc" && nearby.ref.opensShop) {
    requestShop();
  } else if (nearby.type === "npc") {
    startDialogue(nearby.ref);
  } else if (nearby.type === "stage") {
    startPerformance();
  }
}

function startDialogue(npc) {
  activeNpc = npc;
  activeMode = "npc";
  const setIndex = Math.min(npc.stage, npc.dialogueSets.length - 1);
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
async function fadeToScene(sceneId) {
  cutscenePlaying = true;
  attackHoldStart = 0;
  shooting = null;
  clearTimeout(shootFireTimer);

  blackout.classList.add("visible");
  await wait(900); // fade to black

  loadScene(sceneId); // swap while hidden behind black

  await wait(400); // hold black briefly, same as runNightTransition
  blackout.classList.remove("visible");

  await wait(900); // fade back in
  cutscenePlaying = false;
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
    })
  );

  GUARDS.forEach((guard) => {
    const el = document.createElement("div");
    el.className = "entity guard";
    el.id = "guard-" + guard.id;
    el.style.left = guard.pos + "px";

    const meter = document.createElement("div");
    meter.className = "guard-meter";
    const fill = document.createElement("div");
    fill.className = "guard-meter-fill";
    meter.appendChild(fill);
    el.appendChild(meter);

    if (guard.animation) {
      const sprite = document.createElement("div");
      sprite.className = "sprite npc-sprite npc-anim-sprite";
      el.appendChild(sprite);
      world.appendChild(el);
      setupNpcAnimation(guard.animation, sprite, DISPLAY_HEIGHT, token);
    } else {
      const sprite = document.createElement("div");
      sprite.className = "sprite npc-sprite";
      showPlaceholder(
        sprite,
        guard.img || "Guard",
        Math.round(DISPLAY_HEIGHT * 0.7),
        DISPLAY_HEIGHT
      );
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

function updateGuards(step) {
  if (!GUARDS.length) return;

  const hidden = inHideSpot(posX);

  GUARDS.forEach((guard) => {
    if (guard.disabled) {
      guard.alert = 0;
      if (guard.fillEl) guard.fillEl.style.width = "0%";
      if (guard.el) guard.el.classList.add("guard-down");
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
    const dx = posX - guard.pos;
    const inFront = Math.sign(dx) === guard.facing || dx === 0;
    const inRange = Math.abs(dx) <= (guard.detectRadius || 240);
    const seen = inFront && inRange && !hidden && !playerIsSafe();

    if (seen) {
      guard.alert = Math.min(1, guard.alert + (guard.alertRate || 0.012) * step);
    } else {
      guard.alert = Math.max(0, guard.alert - (guard.decayRate || 0.02) * step);
    }

    guard.fillEl.style.width = Math.round(guard.alert * 100) + "%";
    guard.el.classList.toggle("guard-alerted", guard.alert >= 1);

    if (guard.alert >= 1) caughtBy(guard);
  });
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
        (currentScene.hazards && currentScene.hazards.length))
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

function showToast(text) {
  const toastEl = hudEls().toast;
  if (!toastEl) return;
  toastEl.textContent = text;
  toastEl.classList.remove("hidden");
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => toastEl.classList.add("hidden"), 1600);
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
  posX = scene && typeof scene.startX === "number" ? scene.startX : 0;
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

  GUARDS.forEach((guard) => {
    if (guard.disabled) return;
    guard.pos = guard.x;
    guard.facing = guard.facingStart || 1;
    guard.alert = 0;
    if (guard.fillEl) guard.fillEl.style.width = "0%";
    if (guard.el) guard.el.style.left = guard.pos + "px";
  });
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

  const centre = posX + PLAYER_WIDTH / 2;
  const hazard = HAZARDS.find(
    (h) => centre >= h.x && centre <= h.x + h.width
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

// Whether the shooting sheet currently owns the player's pose: "aim"
// while the button is down (nothing yet decides melee vs. throw — that
// is only known on release), "fire" for the brief flourish right after
// a throw. The main loop's own idle/walk switch (see gameLoop) is
// suppressed while this is set, the same way cutscenePlaying already
// suppresses it for the death sequence.
let shooting = null; // null | "aim" | "fire"
let shootFireTimer = null;

function startAttackHold() {
  if (authGated || uiBlocked || inDialogue || cutscenePlaying) return;
  attackHoldStart = performance.now();
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

  if (held >= ATTACK_HOLD_MS) {
    // Fire the instant the throw happens, not before, so the muzzle
    // flash frame lands with the projectile actually appearing.
    throwProjectile();
    playShootFire();
  } else {
    // A short tap was never a throw — drop the aim pose and swing
    // instead, rather than let the sheet decide gameplay.
    shooting = null;
    meleeAttack();
  }
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

  const reach = posX + facing * MELEE_RANGE;
  const lo = Math.min(posX, reach);
  const hi = Math.max(posX, reach);

  for (const guard of GUARDS) {
    if (guard.disabled) continue;
    if (guard.pos < lo || guard.pos > hi) continue;

    // Behind means the guard is facing away from Macario.
    const behind = Math.sign(guard.pos - posX) === guard.facing;

    if (behind && guard.alert < 1) {
      disableGuard(guard, "Natumba ang bantay.");
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
  if (guard.fillEl) guard.fillEl.style.width = "0%";
  if (guard.el) guard.el.classList.add("guard-down");
  if (message) showToast(message);
}

// Clearance from Macario's own LEADING edge, which is NOT posX +/-
// PLAYER_WIDTH. PLAYER_WIDTH (40) is only his logic-side hitbox, used
// for collision and interaction reach — narrower, on purpose, than how
// wide he actually renders. The visible <div class="player-sprite">
// is sized in applyAnim() to fit.displayFrameWidth (scaled from the
// loaded sheet to DISPLAY_HEIGHT, currently well over 100px), and its
// box always sits with its LEFT edge pinned to posX (#player's own
// `left` is set to posX + "px" in the game loop, and #player has no
// CSS width of its own, so it just wraps its one child). Facing left
// only mirrors the artwork in place via scaleX(-1) in applyAnim — a
// CSS transform, which repaints the sprite but never moves its layout
// box — so the sprite always extends rightward from posX, in BOTH
// facing directions, and never extends left of it at all.
//
// That is why a rightward throw needs posX + the sprite's real
// rendered width as its leading edge: anything short of that (the
// previous fix used PLAYER_WIDTH, 40) still lands inside the visible
// body. A leftward throw was already fine as soon as it moved past
// posX at all, since the sprite never occupies that side to begin
// with — so its leading edge stays posX. (.projectile also carries
// its own z-index in style.css, above #player's, as a backstop for
// any case where the two still end up overlapping on screen.)
const PROJECTILE_SPAWN_GAP = 30;

function throwProjectile() {
  if (projectile) return; // one at a time
  flashAttack();

  const el = document.createElement("div");
  el.className = "projectile";
  world.appendChild(el);
  actElements.push(el);

  // offsetWidth (not a CSS constant) so this tracks whatever sprite
  // sheet is actually loaded, rather than drifting stale if the art
  // changes. Falls back to PLAYER_WIDTH only if asked to throw before
  // any sheet has finished loading (offsetWidth would read 0 then).
  const spriteWidth = playerSpriteEl.offsetWidth || PLAYER_WIDTH;
  const leadingEdge = facing >= 0 ? posX + spriteWidth : posX;

  projectile = {
    el: el,
    x: leadingEdge + facing * PROJECTILE_SPAWN_GAP,
    y: posY + 60,
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

  for (const guard of GUARDS) {
    if (guard.disabled) continue;
    if (Math.abs(guard.pos - projectile.x) > 40) continue;
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

function gameLoop(now) {
  now = now || 0;

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
    posY = surface;
    velY = 0;
    onGround = true;
  } else {
    onGround = false;
  }

  if (canAct) updateGuards(step);

  // After the vertical resolution, so the ground test sees where the
  // player actually ended up this frame rather than where they were
  // mid-fall.
  updateHazards();
  updatePickups();

  updateProjectile(step);

  // During the stage cutscene, leave whatever animation is already set
  // (such as "dead") rather than switching back to idle or walk. The
  // same holds while shooting owns the pose (aiming or firing) — see
  // startAttackHold/playShootFire.
  if (!cutscenePlaying && !shooting) {
    applyAnim(isWalking && onGround ? "walk" : "idle");
  }
  updateAnimFrame(now);
  npcAnimators.forEach((animator) => animator.update(now));

  player.style.left = posX + "px";
  player.style.bottom = posY + "px";

  // Camera: centre the player, clamped to world bounds.
  const viewportWidth = viewport.clientWidth;
  let cameraX = posX - viewportWidth / 2 + PLAYER_WIDTH / 2;
  cameraX = Math.max(0, Math.min(cameraX, WORLD_WIDTH - viewportWidth));
  world.style.transform = `translateX(${-cameraX}px)`;

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
    if (nearby.type === "npc" && nearby.ref.opensShop) {
      setLabel(btnInteract, "Tindahan");
      btnInteract.classList.add("active");
    } else if (nearby.type === "npc") {
      setLabel(btnInteract, "Usap");
      btnInteract.classList.add("active");
    } else if (nearby.type === "stage") {
      setLabel(btnInteract, "Ganap");
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

  if (window.Acts) await Acts.syncStart(actNumber);

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
