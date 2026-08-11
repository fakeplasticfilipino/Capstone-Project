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

const WORLD_WIDTH = 4400;
const PLAYER_WIDTH = 40;
const SPEED = 5;
const INTERACT_DISTANCE = 90;
const PLATFORM_HEIGHT = 40; // must match #stage-platform's CSS height
const GROUND_LEVEL = 60; // must match --ground-level in style.css
const DISPLAY_HEIGHT = 134; // shared on-screen sprite height (player + animated NPCs)

// --- Game state ----------------------------------------------------------
const state = {
  flags: {}, // arbitrary story flags, e.g. hasBuko, bukoGiven
};

// --- Quest system ----------------------------------------------------------
const quests = []; // { id, text, done }

function addQuest(id, text) {
  if (quests.some((q) => q.id === id)) return;
  quests.push({ id, text, done: false });
  renderQuests();
}

function completeQuest(id) {
  const q = quests.find((q) => q.id === id);
  if (q) q.done = true;
  renderQuests();
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

// Starting quest
addQuest("go-to-work", "Pumunta sa trabaho");

// --- NPC configuration -------------------------------------------------
// Images are expected to live in the same folder as index.html.
// Positions (x) are left to right along the road.
// Each NPC has one or more "dialogueSets" — the first time you talk you get
// set 0, the next time set 1, and so on; it stays on the last set after that.
// A set can define onComplete(), run once, right when that conversation ends.
const NPCS = [
  {
    id: "nanay",
    x: 700,
    animation: { src: "Assets/Nanay.png", frames: 7, fps: 6 },
    label: "Nanay Sakay",
    stage: 0,
    dialogueSets: [
      {
        lines: [
          { speaker: "Nanay Sakay", text: "Kamusta trabaho nak?" },
          { speaker: "Ikaw", text: "Late na ko 'ma" },
          {
            speaker: "Nanay Sakay",
            text: "Paki-bigay itong buko sa barbero, nanghihingi siya kahapon",
          },
          { speaker: "Ikaw", text: "Sige Inay, ingat ka" },
        ],
        onComplete: () => {
          state.flags.hasBuko = true;
          addQuest("give-buko", "Ibigay ang buko sa barbero");
        },
      },
    ],
  },
  {
    id: "stablehand",
    x: 1100,
    animation: { src: "Assets/Stablehand.png", frames: 14, fps: 6 },
    label: "Stablehand",
    stage: 0,
    dialogueSets: [
      {
        lines: [
          { speaker: "Stablehand", text: "Magandang umaga Macario" },
          { speaker: "Ikaw", text: "Magandang umaga kaibigan, kamusta ang mga kabayo?" },
          { speaker: "Stablehand", text: "Ayos lang, hinahanap ka na" },
          { speaker: "Kabayo", text: "*neigh*" },
          { speaker: "Ikaw", text: "*Hinaplos ni Macario*" },
          { speaker: "Stablehand", text: "Sige na una na ko, mag ingat kayo!" },
        ],
      },
    ],
  },
  {
    id: "tailor",
    x: 1900,
    img: "Assets/Tailor.png",
    label: "Tailor",
    stage: 0,
    dialogueSets: [
      {
        lines: [
          { speaker: "Tailor", text: "Macario toy, Macario!" },
          {
            speaker: "Tailor",
            text: "Hinahanap ka na ng mga suki ko, magta-trabaho ka ulit?",
          },
          { speaker: "Ikaw", text: "Di na muna kuya, masaya na ko sa trabaho ko" },
        ],
      },
    ],
  },
  {
    id: "barber",
    x: 2700,
    img: "Assets/Barber.jpg",
    label: "Barber",
    stage: 0,
    dialogueSets: [
      {
        lines: [
          { speaker: "Barber", text: "Papagupit ka ba Sakay? Haba na ng buhok mo!" },
          { speaker: "Ikaw", text: "Hahaha, sa susunod" },
          { speaker: "Barber", text: "Balak mo ba mag-trabaho ulit dito?" },
          { speaker: "Ikaw", text: "Hindi eh, maya na lang late na ko sa trabaho!" },
          { speaker: "Barber", text: "Ingat ka Bingkul" },
        ],
      },
    ],
    // A giveable-item interaction, separate from normal E-to-talk dialogue.
    gift: {
      buttonLabel: "Ibigay ang buko",
      // shown only when this flag is true and it hasn't been given yet
      requiresFlag: "hasBuko",
      givenFlag: "bukoGiven",
      responseLines: [
        {
          speaker: "Barber",
          text: "Maraming salamat Sakay, ingat ka paakyat ng entablado",
        },
      ],
      completesQuest: "give-buko",
    },
  },
  {
    // Waits at the far edge of the map — stays hidden until the stage
    // performance (execution scene) finishes, then appears.
    // NOTE: placeholder dialogue — swap in your own lines.
    id: "katipunan",
    x: WORLD_WIDTH - 300,
    animation: { src: "Assets/Katipunan.png", frames: 11, fps: 6 },
    label: "Katipunero",
    stage: 0,
    startsHidden: true,
    dialogueSets: [
      {
        lines: [
          { speaker: "Katipunero", text: "Kasama, dumating ka rin." },
          { speaker: "Ikaw", text: "Handa na ako." },
          { speaker: "Katipunero", text: "Sumama ka, may naghihintay pang laban." },
        ],
        onComplete: () => {
          teleportToNewRoom();
        },
      },
    ],
  },
];

// --- Build NPC elements dynamically -------------------------------------
const npcAnimators = []; // animated NPC sprites get an .update(now) pushed here

NPCS.forEach((npc) => {
  const el = document.createElement("div");
  el.className = "entity";
  el.id = "npc-" + npc.id;
  el.style.left = npc.x + "px";
  if (npc.startsHidden) {
    npc.hidden = true;
    el.style.display = "none";
  }

  if (npc.animation) {
    // Animated sprite sheet, same system as the player, same display size.
    const spriteEl = document.createElement("div");
    spriteEl.className = "sprite npc-sprite npc-anim-sprite";
    el.appendChild(spriteEl);
    world.appendChild(el);
    setupNpcAnimation(npc.animation, spriteEl);
  } else {
    // Static image — falls back to a placeholder box (showing the
    // expected filename) if the file doesn't exist yet. <img> elements
    // can't display text content, so on error we swap in a real div.
    const img = document.createElement("img");
    img.className = "sprite npc-sprite";
    img.src = npc.img;
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
});

// --- Fallback checks for CSS-only background images -----------------------
// These (skyline, night skyline, ground tiles) are set purely in CSS, so
// we separately preload each here just to detect a missing file and swap
// in a simple placeholder fill + label if it 404s.
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
  img.src = src;
}

checkBackgroundImage(document.getElementById("skyline"), "Assets/Tondo.png", "Assets/Tondo.png");
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

function setupNpcAnimation(sheet, el, displayHeight) {
  displayHeight = displayHeight || DISPLAY_HEIGHT;
  let currentFrame = 0;
  let lastFrameTime = 0;

  loadSpriteSheet(sheet).then(() => {
    if (sheet.failed) {
      showPlaceholder(el, sheet.src, Math.round(displayHeight * 0.7), displayHeight);
      return;
    }

    const scale = displayHeight / sheet.naturalHeight;
    const displayFrameWidth = sheet.frameWidth * scale;

    el.style.width = displayFrameWidth + "px";
    el.style.height = displayHeight + "px";
    el.style.backgroundImage = `url(${sheet.src})`;
    el.style.backgroundSize =
      sheet.naturalWidth * scale + "px " + displayHeight + "px";
    el.style.backgroundPositionY = "0px";
    el.style.backgroundPositionX = "0px";

    npcAnimators.push({
      update(now) {
        const frameDuration = 1000 / sheet.fps;
        if (now - lastFrameTime >= frameDuration) {
          lastFrameTime = now;
          currentFrame = (currentFrame + 1) % sheet.frames;
          el.style.backgroundPositionX = -(currentFrame * displayFrameWidth) + "px";
        }
      },
    });
  });
}

// --- Decorations (animated, but not interactable) -------------------------
// The Assets/Horse.png sheet (22 frames) stands beside the Stablehand. Slightly
// taller than the player/NPCs since horses are bigger than people.
const horseEl = document.createElement("div");
horseEl.className = "entity";
horseEl.id = "horse";
horseEl.style.left = "1220px"; // just to the right of the Stablehand (x: 1100)
const horseSpriteEl = document.createElement("div");
horseSpriteEl.className = "sprite npc-sprite npc-anim-sprite";
horseEl.appendChild(horseSpriteEl);
world.appendChild(horseEl);
setupNpcAnimation({ src: "Assets/Horse.png", frames: 22, fps: 10 }, horseSpriteEl, 70);

// --- The stage (entablado) -----------------------------------------------
// Walk to the middle of the platform and press E to perform: Macario
// recites 2 lines, the scene fades to night, he recites 2 more lines,
// then Assets/Dead.png plays, then a blackout, then control returns — with
// the scene staying night from then on.
// NOTE: the lines below are placeholder poetry — swap in your own
// text (or a verified historical quote) whenever you're ready.
const STAGE = {
  x: 3900,
  width: 260,
  rampWidth: 50,
  label: "Entablado",
  poemPart1: [
    { speaker: "Macario", text: "Hindi ako magnanakaw, hindi ako tulisan." },
    { speaker: "Macario", text: "Ipinaglaban ko lamang ang bayan kong sinilangan." },
  ],
  poemPart2: [
    { speaker: "Macario", text: "Kung ito ang wakas, tanggap ko nang buong puso." },
    { speaker: "Macario", text: "Mabuhay ang Pilipinas, mabuhay ang bayan ko." },
  ],
};

const stageEl = document.createElement("div");
stageEl.id = "stage-platform";
stageEl.style.left = STAGE.x - STAGE.width / 2 + "px";
stageEl.style.width = STAGE.width + "px";
world.appendChild(stageEl);

// Sloped ramps on both sides so Macario can visually walk up onto the stage
const slopeLeft = document.createElement("div");
slopeLeft.className = "stage-slope stage-slope-left";
slopeLeft.style.left = STAGE.x - STAGE.width / 2 - STAGE.rampWidth + "px";
slopeLeft.style.width = STAGE.rampWidth + "px";
world.appendChild(slopeLeft);

const slopeRight = document.createElement("div");
slopeRight.className = "stage-slope stage-slope-right";
slopeRight.style.left = STAGE.x + STAGE.width / 2 + "px";
slopeRight.style.width = STAGE.rampWidth + "px";
world.appendChild(slopeRight);

// How high (0 to PLATFORM_HEIGHT) the player should be lifted at world-x
function getPlatformOffset(x) {
  if (currentRoom !== "road") return 0; // the stage doesn't exist in other rooms

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
// Assets/Idle.png: 6 frames, Assets/Walk.png: 10 frames — both spritesheets laid out
// horizontally, expected to live in the same folder as index.html.
const playerSpriteEl = player.querySelector(".player-sprite");

const SPRITE_SHEETS = {
  idle: { src: "Assets/Idle.png", frames: 6, fps: 6 },
  walk: { src: "Assets/Walk.png", frames: 10, fps: 12 },
  dead: { src: "Assets/Dead.png", frames: 5, fps: 6, loop: false },
};

function loadSpriteSheet(def) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      def.naturalWidth = img.naturalWidth;
      def.naturalHeight = img.naturalHeight;
      def.frameWidth = img.naturalWidth / def.frames;
      def.failed = false;
      resolve(def);
    };
    img.onerror = () => {
      def.failed = true;
      resolve(def); // resolve (not reject) so Promise.all doesn't hang forever
    };
    img.src = def.src;
  });
}

// Turns any element into a dashed placeholder box showing the missing
// filename — used whenever an expected image/sprite sheet fails to load.
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

// Undo showPlaceholder's inline styles so a real sprite can render cleanly.
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
  const scale = DISPLAY_HEIGHT / sheet.naturalHeight;
  const displayFrameWidth = sheet.frameWidth * scale;

  playerSpriteEl.style.width = displayFrameWidth + "px";
  playerSpriteEl.style.height = DISPLAY_HEIGHT + "px";
  playerSpriteEl.style.backgroundImage = `url(${sheet.src})`;
  playerSpriteEl.style.backgroundSize =
    sheet.naturalWidth * scale + "px " + DISPLAY_HEIGHT + "px";
  playerSpriteEl.style.backgroundPositionY = "0px";
  playerSpriteEl.style.backgroundPositionX = "0px";
}

function updateAnimFrame(now) {
  if (!spritesReady) return;
  const sheet = SPRITE_SHEETS[currentAnim];
  if (sheet.failed) return; // nothing to step — placeholder box is static

  const frameDuration = 1000 / sheet.fps;

  if (now - lastFrameTime >= frameDuration) {
    lastFrameTime = now;
    if (sheet.loop === false) {
      if (currentFrame < sheet.frames - 1) currentFrame++;
      // else: hold on the last frame
    } else {
      currentFrame = (currentFrame + 1) % sheet.frames;
    }
    const scale = DISPLAY_HEIGHT / sheet.naturalHeight;
    const displayFrameWidth = sheet.frameWidth * scale;
    playerSpriteEl.style.backgroundPositionX =
      -(currentFrame * displayFrameWidth) + "px";
  }

  // Flip to face the direction of travel
  playerSpriteEl.style.transform = `scaleX(${facing})`;
}


let posX = 0;
let currentRoom = "road"; // "road" (the main street) | "empty" (post-teleport room)
let inDialogue = false;
let cutscenePlaying = false; // locks movement through the whole stage performance
let dialogueStep = 0;
let activeNpc = null; // the NPC currently in conversation
let activeSet = null; // the dialogue set currently playing
let activeMode = null; // "npc" | "gift" | "cutscene"
let nearby = { type: null, ref: null }; // whichever NPC or the stage is in range

const blackout = document.getElementById("blackout");
const skylineNight = document.getElementById("skyline-night");

const keysPressed = {};

document.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();
  keysPressed[key] = true;
  if (key === "e") handleInteractPress();
});

document.addEventListener("keyup", (e) => {
  keysPressed[e.key.toLowerCase()] = false;
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
    return { type: null, ref: null }; // nothing to interact with in other rooms
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

  const stageDist = Math.abs(posX - STAGE.x);
  if (stageDist < INTERACT_DISTANCE && stageDist < closestDist) {
    closest = STAGE;
    closestType = "stage";
    closestDist = stageDist;
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
  if (inDialogue) {
    advanceDialogue();
  } else if (cutscenePlaying) {
    // ignore E while the performance/blackout sequence is running
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
    if (gift.completesQuest) completeQuest(gift.completesQuest);
  } else if (finishedMode === "npc") {
    if (finishedSet.onComplete) {
      finishedSet.onComplete();
      if (finishedNpc.stage < finishedNpc.dialogueSets.length - 1) {
        finishedNpc.stage++;
      }
    }
  } else if (finishedMode === "cutscene-part1") {
    // First half of the poem is done — fade the scene to night,
    // then continue with the second half.
    runNightTransition();
  } else if (finishedMode === "cutscene-part2") {
    // Second half is done — now the death animation + blackout
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

  skylineNight.classList.add("visible"); // swap happens while hidden behind black

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

  await wait(animMs + 400); // let the animation finish and hold briefly
  blackout.classList.add("visible");

  await wait(900); // fade to black + hold
  blackout.classList.remove("visible");

  await wait(900); // fade back in — scene is now permanently night
  applyAnim("idle", true);
  cutscenePlaying = false;

  // The Katipunero was waiting at the edge of the map — reveal him now.
  const katipunan = NPCS.find((npc) => npc.id === "katipunan");
  if (katipunan) {
    katipunan.hidden = false;
    const katipunanEl = document.getElementById("npc-katipunan");
    if (katipunanEl) katipunanEl.style.display = "";
  }
}

async function teleportToNewRoom() {
  cutscenePlaying = true;
  blackout.classList.add("visible");
  await wait(900); // fade to black

  // Same background/road, just an empty scene — hide every character
  // and object from the previous room.
  NPCS.forEach((npc) => {
    const el = document.getElementById("npc-" + npc.id);
    if (el) el.style.display = "none";
  });
  horseEl.style.display = "none";
  stageEl.style.display = "none";
  slopeLeft.style.display = "none";
  slopeRight.style.display = "none";

  posX = 0;
  facing = 1;
  currentRoom = "empty"; // this room has no interactables at all — not just hidden ones

  await wait(300); // hold black briefly
  blackout.classList.remove("visible");

  await wait(900); // fade back in to the empty room
  cutscenePlaying = false;
}

// Allow tapping the dialogue box itself to advance (nice for mobile)
dialogueBox.addEventListener("click", () => {
  if (inDialogue) advanceDialogue();
});

// --- Game loop ---
function gameLoop(now) {
  let isWalking = false;

  if (!inDialogue && !cutscenePlaying) {
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

  // While the stage cutscene is running, leave whatever animation is
  // already set (e.g. "dead") alone instead of switching to idle/walk.
  if (!cutscenePlaying) {
    applyAnim(isWalking ? "walk" : "idle");
  }
  updateAnimFrame(now || 0);
  npcAnimators.forEach((animator) => animator.update(now || 0));

  player.style.left = posX + "px";
  player.style.bottom = GROUND_LEVEL + getPlatformOffset(posX) + "px";

  // Camera: keep player centered in the viewport, clamped to world bounds
  const viewportWidth = viewport.clientWidth;
  let cameraX = posX - viewportWidth / 2 + PLAYER_WIDTH / 2;
  cameraX = Math.max(0, Math.min(cameraX, WORLD_WIDTH - viewportWidth));
  world.style.transform = `translateX(${-cameraX}px)`;

  // Interact button + gift button follow whichever NPC/stage is nearby
  if (!inDialogue && !cutscenePlaying) {
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
    // Dialogue is showing (or the cutscene is running) — tapping the
    // dialogue box itself advances it, so tuck the controls away.
    mobileControls.classList.add("hidden");
    giftBtn.classList.add("hidden");
    btnInteract.textContent = "E";
    btnInteract.classList.remove("active");
  }

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
