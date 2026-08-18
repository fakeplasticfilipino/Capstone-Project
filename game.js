// =============================================================
// MACARIO — game.js
//
// Blocks applied:
//   Block 1   role routing (teachers redirect to teacher.html)
//   Block 2.1 Act I content extracted to content/act1.js
//   Block 2.2 world building wrapped in loadAct() / unloadAct()
//   Block 2.4 act transition replaces the empty-room ending
//   Block 2.5 resume into the act recorded in game_progress
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

const questListEl = document.getElementById("quest-list");
const giftBtn = document.getElementById("gift-btn");

const PLAYER_WIDTH = 40;
const SPEED = 5;
const INTERACT_DISTANCE = 90;
const PLATFORM_HEIGHT = 40; // must match #stage-platform's CSS height
const GROUND_LEVEL = 60; // must match --ground-level in style.css
const DISPLAY_HEIGHT = 134; // shared sprite height (player + animated NPCs)

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
let NPCS = []; // the current act's NPCs
let STAGE = null; // the current act's stage, or null if it has none
let WORLD_WIDTH = 4400; // overwritten per act

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

function loadAct(actData) {
  unloadAct();

  actLoadToken++;
  const token = actLoadToken;

  currentActData = actData;
  NPCS = actData.npcs || [];
  STAGE = actData.stage || null;
  WORLD_WIDTH = actData.worldWidth || 4400;

  buildNpcs(token);
  buildDecorations(token);
  buildStage();

  posX = typeof actData.startX === "number" ? actData.startX : 0;
  currentRoom = "road";

  (actData.startingQuests || []).forEach((q) => addQuest(q.id, q.text));
}

function unloadAct() {
  actElements.forEach((el) => el.remove());
  actElements = [];
  decorationEls = [];
  npcAnimators = [];

  stageEl = null;
  slopeLeft = null;
  slopeRight = null;

  NPCS = [];
  STAGE = null;
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
  (currentActData.decorations || []).forEach((dec) => {
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

// How high (0 to PLATFORM_HEIGHT) the player is lifted at world-x.
function getPlatformOffset(x) {
  if (!STAGE) return 0; // this act has no stage
  if (currentRoom !== "road") return 0; // the stage is not in other rooms

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
let currentRoom = "road"; // "road" always; "empty" only in legacy saves
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
  keysPressed[key] = true;
  if (key === "e") handleInteractPress();
});

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
  if (currentRoom !== "road") {
    return { type: null, ref: null }; // nothing interactable in other rooms
  }

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

// Tapping the dialogue box advances it, which is easier on mobile.
dialogueBox.addEventListener("click", () => {
  if (inDialogue) advanceDialogue();
});

// --- Game loop ---
function gameLoop(now) {
  let isWalking = false;

  if (!inDialogue && !cutscenePlaying && !authGated && !uiBlocked) {
    if (keysPressed["a"]) {
      posX -= SPEED;
      facing = -1;
      isWalking = true;
    }
    if (keysPressed["d"]) {
      posX += SPEED;
      facing = 1;
      isWalking = true;
    }
    posX = Math.max(0, Math.min(posX, WORLD_WIDTH - PLAYER_WIDTH));
  }

  // During the stage cutscene, leave whatever animation is already set
  // (such as "dead") rather than switching back to idle or walk.
  if (!cutscenePlaying) {
    applyAnim(isWalking ? "walk" : "idle");
  }
  updateAnimFrame(now || 0);
  npcAnimators.forEach((animator) => animator.update(now || 0));

  player.style.left = posX + "px";
  player.style.bottom = GROUND_LEVEL + getPlatformOffset(posX) + "px";

  // Camera: centre the player, clamped to world bounds.
  const viewportWidth = viewport.clientWidth;
  let cameraX = posX - viewportWidth / 2 + PLAYER_WIDTH / 2;
  cameraX = Math.max(0, Math.min(cameraX, WORLD_WIDTH - viewportWidth));
  world.style.transform = `translateX(${-cameraX}px)`;

  // Interact and gift buttons follow whichever NPC or stage is nearby.
  if (!inDialogue && !cutscenePlaying && !authGated && !uiBlocked) {
    mobileControls.classList.remove("hidden");
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
  // count reads the flags the save restores.
  const row = await loadProgress(userId);
  if (!row) return;

  let actNumber = 1;
  if (window.Acts) {
    await Acts.loadProgressMap();
    actNumber = Acts.resolveAct(row.current_act);

    // Set before saves are unblocked, so nothing can write a stale
    // current_act in the window before syncStart runs.
    Acts.current = actNumber;

    if (actNumber !== 1) loadAct(Acts.getAct(actNumber));
  }

  applyLoadedState(row);

  saveReady = true;

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
  }

  currentRoom = row.current_room || "road";

  if (row.is_night) {
    skylineNight.classList.add("visible");
  }

  // Any NPC whose reveal flag is already set in the restored save.
  revealNpcsByFlag();

  // LEGACY SAVES.
  //
  // The previous build ended Act I by fading to black and stranding
  // the player in an empty room with nothing in it. That room is
  // gone, so a save still pointing at it is migrated back onto the
  // road. Acts.resume() sees the act as completed and puts up the
  // transition screen, which is where those students should have
  // been all along.
  if (currentRoom !== "road") {
    currentRoom = "road";
    markDirty();
  }
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
