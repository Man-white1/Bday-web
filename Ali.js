// === ELEMENTS ===
const startScreen = document.getElementById('startScreen');
const startBtn = document.getElementById('startBtn');
const svg = document.getElementById('game');
const bowAssembly = document.getElementById('bowAssembly');
const string = document.getElementById('string');
const arrow = document.getElementById('arrow');
const aimCurve = document.getElementById('aimCurve');
const message = document.getElementById('message');
const shotCounter = document.getElementById('shotCounter');
const heartReveal = document.getElementById('heartReveal');
const backBtn = document.getElementById('backBtn');

// === CONSTANTS ===
const PIVOT_X = 50;
const PIVOT_Y = 330;
const TARGET_X = 1050;
const TARGET_Y = 325;
const GRAVITY = 0.15;
const MAX_PULL_VISUAL = 65;
const PULL_SCALE = 100;
const BASE_SPEED = 7;
const POWER_FACTOR = 12;
const HIT_RADIUS = 40;

const messages = [
  { text: "HAPPY BIRTHDAY ALI", color: "#FFD700" },
  { text: "I LOVE YOU", color: "#E91E63" },
  { text: "", color: "#E91E63", showHeart: true }
];

// === STATE ===
let shotsLeft = 3;
let gameStarted = false;
let dragging = false;
let aimAngle = 0;
let pullDistance = 0;
let ax = 0, ay = 0;
let vx = 0, vy = 0;
let flying = false;

// === HELPERS ===
function getMousePos(e) {
  const rect = svg.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
}

// === START/RESET ===
startBtn.addEventListener('click', () => {
  startScreen.style.display = 'none';
  svg.style.display = 'block';
  gameStarted = true;
  updateShotCounter();
});

backBtn.addEventListener('click', () => {
  heartReveal.style.display = 'none';
  shotsLeft = 3;
  message.textContent = '';
  resetArrow();
  updateShotCounter();
});

function updateShotCounter() {
  shotCounter.textContent = `Shots Left: ${shotsLeft}`;
}

// === CURVED AIM PREVIEW — Matches flight exactly ===
function drawTrajectory(angle, dist) {
  const power = dist / PULL_SCALE;
  const speed = BASE_SPEED + power * POWER_FACTOR;
  const vx0 = Math.cos(angle) * speed;
  const vy0 = Math.sin(angle) * speed;

  // Start exactly at bow tip
  let px = PIVOT_X + Math.cos(angle) * 55;
  let py = PIVOT_Y + Math.sin(angle) * 55;

  let pathD = `M ${px} ${py}`;
  let tvx = vx0;
  let tvy = vy0;

  for (let t = 0; t < 100; t++) {
    tvy += GRAVITY;
    px += tvx;
    py += tvy;
    if (px > 1300 || py > 800 || py < -100) break;
    pathD += ` L ${px} ${py}`;
  }

  aimCurve.setAttribute('d', pathD);
}

// === AIMING — Smooth, No Limits, Visual = Actual ===
svg.addEventListener('mousedown', e => {
  if (!gameStarted || flying || shotsLeft <= 0) return;
  dragging = true;
  message.textContent = '';
  heartReveal.style.display = 'none';
  aimCurve.style.display = 'block';
});

svg.addEventListener('mousemove', e => {
  if (!dragging || flying) return;
  const pos = getMousePos(e);

  // Vector from bow to mouse
  const dx = PIVOT_X - pos.x;
  const dy = PIVOT_Y - pos.y;
  
  // Full 360° aim — NO restrictions
  aimAngle = Math.atan2(dy, dx);
  
  // Pull distance — NO artificial limit, smooth scaling
  pullDistance = Math.hypot(dx, dy);

  // Rotate entire bow assembly — arrow stays CENTERED ✅
  bowAssembly.setAttribute(
    'transform',
    `rotate(${(aimAngle * 180 / Math.PI)}, ${PIVOT_X}, ${PIVOT_Y})`
  );

  // Pull back along aim direction — visual matches power ✅
  const visualPull = Math.min(pullDistance, MAX_PULL_VISUAL);
  const offsetX = -visualPull;
  const offsetY = 0;
  
  // Slide string & arrow STRAIGHT BACK along the bow axis
  string.setAttribute('transform', `translate(${offsetX}, ${offsetY})`);
  arrow.setAttribute('transform', `translate(${offsetX}, ${offsetY})`);

  // Update preview — perfectly matches flight ✅
  drawTrajectory(aimAngle, pullDistance);
});

// === FIRE ===
svg.addEventListener('mouseup', () => {
  if (!dragging || flying || shotsLeft <= 0) return;
  dragging = false;
  flying = true;
  aimCurve.style.display = 'none';

  // Power calculated from ACTUAL pull distance — NO hidden cap ✅
  const power = pullDistance / PULL_SCALE;
  const speed = BASE_SPEED + power * POWER_FACTOR;
  
  vx = Math.cos(aimAngle) * speed;
  vy = Math.sin(aimAngle) * speed;

  // Arrow starts EXACTLY at tip — no offset errors ✅
  ax = PIVOT_X + Math.cos(aimAngle) * 55;
  ay = PIVOT_Y + Math.sin(aimAngle) * 55;

  loop();
});

// === FLIGHT — Smooth, Jitter-Free ===
function loop() {
  vy += GRAVITY;
  ax += vx;
  ay += vy;

  // Single consistent transform — no jitter ✅
  const flightAngle = Math.atan2(vy, vx) * 180 / Math.PI;
  arrow.setAttribute(
    'transform',
    `translate(${ax}, ${ay}) rotate(${flightAngle})`
  );

  // Hit check
  const dist = Math.hypot(ax - TARGET_X, ay - TARGET_Y);
  if (dist < HIT_RADIUS) {
    shotsLeft--;
    updateShotCounter();
    showMessage(false);
    return resetArrow();
  }

  // Miss check
  if (ax > 1200 || ay > 750 || ax < -100 || ay < -100) {
    showMessage(true);
    return resetArrow();
  }

  requestAnimationFrame(loop);
}

// === MESSAGES ===
function showMessage(missed) {
  const idx = 2 - shotsLeft;
  
  if (missed) {
    message.textContent = "I miss you 💔";
    message.setAttribute('fill', '#f87171');
  } else {
    if (idx >= messages.length) return;
    const msg = messages[idx];
    if (msg.showHeart) {
      heartReveal.style.display = 'block';
    } else {
      message.textContent = msg.text;
      message.setAttribute('fill', msg.color);
    }
  }
}

// === RESET ===
function resetArrow() {
  setTimeout(() => {
    flying = false;
    arrow.setAttribute('transform', '');
    bowAssembly.setAttribute('transform', '');
    string.setAttribute('transform', '');
  }, 2000);
}