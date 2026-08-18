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
const mobileControls = document.getElementById("mobile-controls");
const btnPause = document.getElementById("btn-pause");

const questListEl = document.getElementById("quest-list");
const giftBtn = document.getElementById("gift-btn");

const PLAYER_WIDTH = 40;
const SPEED = 5;
const INTERACT_DISTANCE = 90;
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
const MAX_HEALTH = 3;
const INVULN_MS = 1000;

// There is no game over. Reaching zero returns Macario to the start of the
// scene at full health. A fail state that ejects a Grade 8 student from the
// lesson serves nobody, and being caught already costs them the walk back.

// Bump this whenever ANY file in Assets/ is replaced.
//
// The v=N strings in index.html only cover scripts and stylesheets.
// Images had no version at all, so browsers and the GitHub Pages CDN
// kept serving stale sprites indefinitely after a file was swapped.
// Every image load goes through assetUrl() so one number refreshes them all.
const ASSET_VERSION = 2;

function assetUrl(path) {
  if (!path) return path;
  return path + (path.includes("?") ? "&" : "?") + "v=" + ASSET_VERSION;
}

// --- Game state ----------------------------------------------------------
const state = {
  flags: {}, // arbitrary story flags, e.g. hasBuko, bukoGiven
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

  buildNpcs(token);
  buildDecorations(token);
  buildStage();
  buildPlatforms();
  buildHideSpots();
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
  currentScene = null;
  currentSceneId = null;
}

function unloadAct() {
  unloadScene();
  SCENES = [];
  currentActData = null;
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
        showPlaceholder(placeholder, npc.img, 80, 112);
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
  "Assets/Tondo.png",
  "Assets/Tondo.png"
);
checkBackgroundImage(
  document.getElementById("skyline-night"),
  "Assets/Tondo_Night.png",
  "Assets/Tondo_Night.png"
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
    const scale = displayHeight / sheet.frameHeight;
    const displayFrameWidth = sheet.frameWidth * scale;

    el.style.width = displayFrameWidth + "px";
    el.style.height = displayHeight + "px";
    el.style.backgroundImage = `url(${assetUrl(sheet.src)})`;
    el.style.backgroundSize =
      sheet.naturalWidth * scale + "px " + sheet.naturalHeight * scale + "px";
    el.style.backgroundPositionY = "0px";
    el.style.backgroundPositionX = "0px";

    npcAnimators.push({
      update(now) {
        const frameDuration = 1000 / sheet.fps;
        if (now - lastTime >= frameDuration) {
          lastTime = now;
          frame = (frame + 1) % sheet.frames;
          const column = frame % columns;
          const row = Math.floor(frame / columns);
          el.style.backgroundPositionX = -(column * displayFrameWidth) + "px";
          el.style.backgroundPositionY = -(row * displayHeight) + "px";
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
// Walk.png is a 5 + 5 + 2 grid, so 12 frames across 5 columns.
const SPRITE_SHEETS = {
  idle: { src: "Assets/Idle.png", frames: 6, fps: 6, columns: 6 },
  walk: { src: "Assets/Walk.png", frames: 12, fps: 12, columns: 5 },
  dead: { src: "Assets/Dead.png", frames: 5, fps: 6, columns: 5, loop: false },
};

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
]).then(() => {
  spritesReady = true;
  applyAnim(currentAnim, true);
});

function applyAnim(name, force) {
  if (!spritesReady) return;
  if (currentAnim === name && !force) return;
  currentAnim = name;
  currentFrame = 0;
  lastFrameTime = 0;

  const sheet = SPRITE_SHEETS[name];

  if (sheet.failed) {
    showPlaceholder(playerSpriteEl, sheet.src, 90, DISPLAY_HEIGHT);
    return;
  }

  clearPlaceholder(playerSpriteEl);

  // Scale so one FRAME is DISPLAY_HEIGHT tall, not the whole sheet.
  // Scaling by naturalHeight would shrink the character to 1/rows size
  // on any multi-row sheet.
  const scale = DISPLAY_HEIGHT / sheet.frameHeight;
  const displayFrameWidth = sheet.frameWidth * scale;

  playerSpriteEl.style.width = displayFrameWidth + "px";
  playerSpriteEl.style.height = DISPLAY_HEIGHT + "px";
  playerSpriteEl.style.backgroundImage = `url(${assetUrl(sheet.src)})`;
  playerSpriteEl.style.backgroundSize =
    sheet.naturalWidth * scale + "px " + sheet.naturalHeight * scale + "px";
  playerSpriteEl.style.backgroundPositionY = "0px";
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
      if (sheet.loop === false) {
        if (currentFrame < sheet.frames - 1) currentFrame++;
        // else hold on the last frame
      } else {
        currentFrame = (currentFrame + 1) % sheet.frames;
      }

      // Frame index to grid position. For a 5-column Walk sheet,
      // frame 5 wraps to column 0 of row 1 rather than running off
      // the right edge of the image.
      const columns = sheet.columns || sheet.frames;
      const column = currentFrame % columns;
      const row = Math.floor(currentFrame / columns);

      const scale = DISPLAY_HEIGHT / sheet.frameHeight;
      const displayFrameWidth = sheet.frameWidth * scale;

      playerSpriteEl.style.backgroundPositionX =
        -(column * displayFrameWidth) + "px";
      playerSpriteEl.style.backgroundPositionY = -(row * DISPLAY_HEIGHT) + "px";
    }
  }

  // Flip to face the direction of travel
  playerSpriteEl.style.transform = `scaleX(${facing})`;
}

let posX = 0;
let posY = GROUND_LEVEL; // distance from the bottom of the world, in px
let velY = 0;
let onGround = true;

let health = MAX_HEALTH;
let invulnUntil = 0; // timestamp; damage before this is ignored

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
function findNearby() {
  let closest = null;
  let closestType = null;
  let closestDist = Infinity;

  for (const npc of NPCS) {
    if (npc.hidden) continue;
    const dist = Math.abs(posX - npc.x);
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

function handleInteractPress() {
  if (authGated || uiBlocked) return;
  if (inDialogue) {
    advanceDialogue();
  } else if (cutscenePlaying) {
    // ignore E while the performance or blackout sequence runs
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

  // The Katipunero was waiting at the edge of the map. He declares
  // deathSequenceDone as his revealedByFlag, so setting it above is
  // all this needs to know.
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
  GUARDS = ((currentScene && currentScene.guards) || []).map((def) =>
    Object.assign({}, def, {
      pos: def.x,
      facing: def.facing || 1,
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
      showPlaceholder(sprite, guard.img || "Guard", 80, 112);
      el.appendChild(sprite);
      world.appendChild(el);
    }

    guard.el = el;
    guard.fillEl = fill;
    actElements.push(el);
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

function caughtBy(guard) {
  guard.alert = 0;
  damagePlayer("Nakita ka ng bantay!");
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
  // Hearts only appear where something can take them.
  const dangerous = Boolean(currentScene && currentScene.dangerous);
  hudEl.classList.toggle("hidden", !dangerous);
  if (dangerous) renderHearts();
}

function renderHearts() {
  const heartsEl = hudEls().hearts;
  if (!heartsEl) return;
  heartsEl.innerHTML = "";
  for (let i = 0; i < MAX_HEALTH; i++) {
    const heart = document.createElement("div");
    heart.className = "heart" + (i < health ? "" : " heart-empty");
    heartsEl.appendChild(heart);
  }
}

function showToast(text) {
  const toastEl = hudEls().toast;
  if (!toastEl) return;
  toastEl.textContent = text;
  toastEl.classList.remove("hidden");
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => toastEl.classList.add("hidden"), 1600);
}

function damagePlayer(reason) {
  const now = performance.now();
  if (now < invulnUntil) return; // still in the grace window
  invulnUntil = now + INVULN_MS;

  health -= 1;
  renderHearts();
  player.classList.add("player-hurt");
  setTimeout(() => player.classList.remove("player-hurt"), 400);

  if (health <= 0) {
    showToast(reason ? reason + " Ulitin natin." : "Ulitin natin.");
    respawnInScene();
  } else if (reason) {
    showToast(reason);
    respawnInScene();
  }
}

// Back to the start of the scene, guards reset to their posts. Health is
// only restored when it ran out, so a player on one heart still feels it.
function respawnInScene() {
  const scene = currentScene;
  posX = scene && typeof scene.startX === "number" ? scene.startX : 0;
  posY = floorHeightAt(posX);
  velY = 0;
  facing = 1;

  if (health <= 0) {
    health = MAX_HEALTH;
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

function startAttackHold() {
  if (authGated || uiBlocked || inDialogue || cutscenePlaying) return;
  attackHoldStart = performance.now();
}

function endAttackHold() {
  if (!attackHoldStart) return;
  const held = performance.now() - attackHoldStart;
  attackHoldStart = 0;

  if (authGated || uiBlocked || inDialogue || cutscenePlaying) return;

  if (held >= ATTACK_HOLD_MS) throwProjectile();
  else meleeAttack();
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

function throwProjectile() {
  if (projectile) return; // one at a time
  flashAttack();

  const el = document.createElement("div");
  el.className = "projectile";
  world.appendChild(el);
  actElements.push(el);

  projectile = {
    el: el,
    x: posX + facing * 30,
    y: posY + 60,
    dir: facing,
    travelled: 0,
  };

  el.style.left = projectile.x + "px";
  el.style.bottom = projectile.y + "px";
}

function updateProjectile(step) {
  if (!projectile) return;

  const distance = PROJECTILE_SPEED * step;
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
  updateProjectile(step);

  // During the stage cutscene, leave whatever animation is already set
  // (such as "dead") rather than switching back to idle or walk.
  if (!cutscenePlaying) {
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
    nearby = findNearby();
    if (nearby.type === "npc") {
      btnInteract.textContent = "Usap";
      btnInteract.classList.add("active");
    } else if (nearby.type === "stage") {
      btnInteract.textContent = "Ganap";
      btnInteract.classList.add("active");
    } else {
      btnInteract.textContent = "E";
      btnInteract.classList.remove("active");
    }

    if (nearby.type === "npc" && canGiveGift(nearby.ref)) {
      giftBtn.textContent = nearby.ref.gift.buttonLabel;
      giftBtn.classList.remove("hidden");
    } else {
      giftBtn.classList.add("hidden");
    }
  } else {
    // Dialogue or cutscene is showing. Tapping the dialogue box
    // advances it, so tuck the movement controls away.
    mobileControls.classList.add("hidden");
    if (btnPause) btnPause.classList.add("hidden");
    giftBtn.classList.add("hidden");
    btnInteract.textContent = "E";
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
  health = MAX_HEALTH;
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
    save_state: { quests, flags: state.flags, posX },
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
  setUiBlocked,
  isSignedIn: () => Boolean(currentUserId),
};
