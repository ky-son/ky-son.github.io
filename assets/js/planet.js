const W = 60, H = 28;
const CX = Math.floor(W / 2);
const CY = Math.floor(H / 2);
const el = document.getElementById('planet-canvas');

const PLANET_RX = 10;
const PLANET_RY = 6;

const gradient = " .:-=+*#%@";

function planetChar(x, y) {
  const dx = (x - CX) / PLANET_RX;
  const dy = (y - CY) / PLANET_RY;
  const brightness = 1.0 - ((-dx * 0.6 + dy * 0.8) * 0.5 + 0.5);
  const idx = Math.floor(Math.max(0, Math.min(0.99, brightness)) * gradient.length);
  return gradient[idx];
}

function isInsidePlanet(x, y) {
  const dx = (x - CX) / PLANET_RX;
  const dy = (y - CY) / PLANET_RY;
  return dx * dx + dy * dy <= 1.0;
}

const stars = [];
for (let i = 0; i < 20; i++) {
  stars.push({
    x: Math.floor(Math.random() * W),
    y: Math.floor(Math.random() * H),
    c: '.·*'[Math.floor(Math.random() * 3)],
    phase: Math.random() * Math.PI * 2
  });
}

const NUM_DEBRIS = 30;
const debris = [];
for (let i = 0; i < NUM_DEBRIS; i++) {
  const angle = (i / NUM_DEBRIS) * Math.PI * 2;
  debris.push({
    angle,
    radius: 0.92 + Math.random() * 0.16,
    speed: 0.007 + Math.random() * 0.003,
    ch: '·.°·.·°.'[Math.floor(Math.random() * 8)]
  });
}

const RING_A = 15;
const RING_B = 4;
let frame = 0;

function drawFrame() {
  const buf = [];
  for (let y = 0; y < H; y++) buf.push(new Array(W).fill(' '));

  for (const s of stars) {
    const show = Math.sin(frame * 0.025 + s.phase) > -0.2;
    if (show && !isInsidePlanet(s.x, s.y)) buf[s.y][s.x] = s.c;
  }

  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++)
      if (isInsidePlanet(x, y)) buf[y][x] = planetChar(x, y);

  for (const d of debris) {
    const a = d.angle + frame * d.speed;
    const TILT = 0.35;
    const rx = Math.cos(a) * RING_A * d.radius;
    const ry = Math.sin(a) * RING_B * d.radius;
    const sx = Math.round(CX + rx * Math.cos(TILT) - ry * Math.sin(TILT));
    const sy = Math.round(CY + rx * Math.sin(TILT) + ry * Math.cos(TILT));
    const z3d = Math.sin(a);
    if (sx < 0 || sx >= W || sy < 0 || sy >= H) continue;
    if (z3d > 0 && isInsidePlanet(sx, sy)) continue;
    buf[sy][sx] = d.ch;
  }

  el.textContent = buf.map(r => r.join('')).join('\n');
}

function animate() {
  frame++;
  drawFrame();
  requestAnimationFrame(animate);
}
animate();
