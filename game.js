const world = document.getElementById("world");
const viewport = document.getElementById("viewport");
const player = document.getElementById("player");
const interactHint = document.getElementById("interact-hint");

const dialogueBox = document.getElementById("dialogue-box");
const dialogueSpeaker = document.getElementById("dialogue-speaker");
const dialogueText = document.getElementById("dialogue-text");

const btnLeft = document.getElementById("btn-left");
const btnRight = document.getElementById("btn-right");
const btnInteract = document.getElementById("btn-interact");

const WORLD_WIDTH = 3200;
const PLAYER_WIDTH = 40;
const SPEED = 5;
const INTERACT_DISTANCE = 90;

// --- NPC configuration -------------------------------------------------
// Images are expected to live in the same folder as index.html.
// Positions (x) are left to right along the road.
const NPCS = [
  {
    id: "nanay",
    x: 700,
    img: "Nanay Sakay.jpg",
    label: "Nanay Sakay",
    lines: [
      { speaker: "Nanay Sakay", text: "Kamusta trabaho nak?" },
      { speaker: "Ikaw", text: "Late na ko 'ma" },
    ],
  },
  {
    id: "tailor",
    x: 1500,
    img: "Tailor.png",
    label: "Tailor",
    lines: [
      { speaker: "Tailor", text: "Macario toy, Macario!" },
      {
        speaker: "Tailor",
        text: "Hinahanap ka na ng mga suki ko, magta-trabaho ka ulit?",
      },
      { speaker: "Ikaw", text: "Di na muna kuya, masaya na ko sa trabaho ko" },
    ],
  },
  {
    id: "barber",
    x: 2300,
    img: "Barber.jpg",
    label: "Barber",
    lines: [
      { speaker: "Barber", text: "Papagupit ka ba Sakay? Haba na ng buhok mo!" },
      { speaker: "Ikaw", text: "Hahaha, sa susunod" },
      { speaker: "Barber", text: "Balak mo ba mag-trabaho ulit dito?" },
      { speaker: "Ikaw", text: "Hindi eh, maya na lang late na ko sa trabaho!" },
      { speaker: "Barber", text: "Ingat ka Bingkul" },
    ],
  },
];

// --- Build NPC elements dynamically -------------------------------------
NPCS.forEach((npc) => {
  const el = document.createElement("div");
  el.className = "entity";
  el.id = "npc-" + npc.id;
  el.style.left = npc.x + "px";
  el.innerHTML = `
    <div class="label">${npc.label}</div>
    <img class="sprite npc-sprite" src="${npc.img}" alt="${npc.label}" />
  `;
  world.appendChild(el);
});

let posX = 0;
let inDialogue = false;
let dialogueStep = 0;
let activeNpc = null; // the NPC currently in conversation
let nearbyNpc = null; // the NPC currently in interact range

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
function findNearbyNpc() {
  let closest = null;
  let closestDist = Infinity;
  for (const npc of NPCS) {
    const dist = Math.abs(posX - npc.x);
    if (dist < INTERACT_DISTANCE && dist < closestDist) {
      closest = npc;
      closestDist = dist;
    }
  }
  return closest;
}

function handleInteractPress() {
  if (inDialogue) {
    advanceDialogue();
  } else if (nearbyNpc) {
    startDialogue(nearbyNpc);
  }
}

function startDialogue(npc) {
  activeNpc = npc;
  inDialogue = true;
  dialogueStep = 0;
  dialogueBox.classList.remove("hidden");
  showDialogueStep();
}

function showDialogueStep() {
  const line = activeNpc.lines[dialogueStep];
  dialogueSpeaker.textContent = line.speaker;
  dialogueText.textContent = line.text;
}

function advanceDialogue() {
  dialogueStep++;
  if (dialogueStep >= activeNpc.lines.length) {
    endDialogue();
  } else {
    showDialogueStep();
  }
}

function endDialogue() {
  inDialogue = false;
  activeNpc = null;
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

  // Interact hint follows whichever NPC is nearby
  if (!inDialogue) {
    nearbyNpc = findNearbyNpc();
    if (nearbyNpc) {
      interactHint.textContent = `Press E to talk to ${nearbyNpc.label}`;
      interactHint.style.left = nearbyNpc.x + PLAYER_WIDTH / 2 + "px";
      interactHint.classList.remove("hidden");
    } else {
      interactHint.classList.add("hidden");
    }
  } else {
    interactHint.classList.add("hidden");
  }

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
