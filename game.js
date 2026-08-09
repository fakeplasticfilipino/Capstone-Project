const world = document.getElementById("world");
const viewport = document.getElementById("viewport");
const player = document.getElementById("player");
const npc = document.getElementById("npc");
const interactHint = document.getElementById("interact-hint");

const dialogueBox = document.getElementById("dialogue-box");
const dialogueSpeaker = document.getElementById("dialogue-speaker");
const dialogueText = document.getElementById("dialogue-text");

const btnLeft = document.getElementById("btn-left");
const btnRight = document.getElementById("btn-right");
const btnInteract = document.getElementById("btn-interact");

const WORLD_WIDTH = 4000;
const PLAYER_WIDTH = 40;
const SPEED = 5;
const NPC_X = 1400;
const INTERACT_DISTANCE = 90;

let posX = 0;
let inDialogue = false;
let dialogueStep = 0;

const dialogueLines = [
  { speaker: "Nanay Sakay", text: "Kamusta trabaho nak?" },
  { speaker: "Ikaw", text: "Late na ko 'ma" },
];

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

// --- Interaction / dialogue ---
function isNearNpc() {
  return Math.abs(posX - NPC_X) < INTERACT_DISTANCE;
}

function handleInteractPress() {
  if (inDialogue) {
    advanceDialogue();
  } else if (isNearNpc()) {
    startDialogue();
  }
}

function startDialogue() {
  inDialogue = true;
  dialogueStep = 0;
  dialogueBox.classList.remove("hidden");
  showDialogueStep();
}

function showDialogueStep() {
  const line = dialogueLines[dialogueStep];
  dialogueSpeaker.textContent = line.speaker;
  dialogueText.textContent = line.text;
}

function advanceDialogue() {
  dialogueStep++;
  if (dialogueStep >= dialogueLines.length) {
    endDialogue();
  } else {
    showDialogueStep();
  }
}

function endDialogue() {
  inDialogue = false;
  dialogueBox.classList.add("hidden");
}

// Allow tapping the dialogue box itself to advance (nice for mobile)
dialogueBox.addEventListener("click", () => {
  if (inDialogue) advanceDialogue();
});

// --- Game loop ---
function gameLoop() {
  if (!inDialogue) {
    if (keysPressed["a"]) posX -= SPEED;
    if (keysPressed["d"]) posX += SPEED;
    posX = Math.max(0, Math.min(posX, WORLD_WIDTH - PLAYER_WIDTH));
  }

  player.style.left = posX + "px";

  // Camera: keep player centered in the viewport, clamped to world bounds
  const viewportWidth = viewport.clientWidth;
  let cameraX = posX - viewportWidth / 2 + PLAYER_WIDTH / 2;
  cameraX = Math.max(0, Math.min(cameraX, WORLD_WIDTH - viewportWidth));
  world.style.transform = `translateX(${-cameraX}px)`;

  // Interact hint
  if (!inDialogue && isNearNpc()) {
    interactHint.classList.remove("hidden");
  } else {
    interactHint.classList.add("hidden");
  }

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
