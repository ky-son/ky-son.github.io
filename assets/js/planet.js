const W = 55, H = 22;
const CX = W / 2, CY = H / 2;
const ASPECT = 2.1;
const SHADE = ' .:;+=xX$&#@';
const PLANET_R = 3.8;
const tiltDeg = 38;

function deg(d) { return d * Math.PI / 180; }
function rotX(p, a) { return [p[0], p[1]*Math.cos(a)-p[2]*Math.sin(a), p[1]*Math.sin(a)+p[2]*Math.cos(a)]; }
function rotY(p, a) { return [p[0]*Math.cos(a)+p[2]*Math.sin(a), p[1], -p[0]*Math.sin(a)+p[2]*Math.cos(a)]; }
function rotZ(p, a) { return [p[0]*Math.cos(a)-p[1]*Math.sin(a), p[0]*Math.sin(a)+p[1]*Math.cos(a), p[2]]; }

function project(p) {
  const fov = 35, z = p[2] + fov;
  return [CX + (p[0]/z)*fov*ASPECT, CY + (p[1]/z)*fov, p[2]];
}

function sphereChar(nx, ny, nz) {
  const light = [0.6, -0.4, 0.7];
  const len = Math.sqrt(light[0]**2+light[1]**2+light[2]**2);
  const dot = (nx*light[0]+ny*light[1]+nz*light[2]) / len;
  const v = Math.max(0, Math.min(1, (dot + 0.3) / 1.3));
  return SHADE[Math.floor(v * (SHADE.length - 1))];
}

const planetGrid = Array.from({length: H}, () => Array(W).fill(' '));
const planetMask = Array.from({length: H}, () => Array(W).fill(false));

(function buildPlanet() {
  const zBuf = Array.from({length: H}, () => Array(W).fill(-9999));
  for (let ui = 0; ui <= 64; ui++) {
    for (let vi = 0; vi <= 128; vi++) {
      const u = (ui/64)*Math.PI, v2 = (vi/128)*2*Math.PI;
      const nx = Math.sin(u)*Math.cos(v2), ny = Math.sin(u)*Math.sin(v2), nz = Math.cos(u);
      let p = [nx*PLANET_R, ny*PLANET_R, nz*PLANET_R];
      p = rotX(p, deg(tiltDeg));
      const [col, row, z] = project(p);
      const c = Math.round(col), r = Math.round(row);
      if (c < 0 || c >= W || r < 0 || r >= H) continue;
      if (z > zBuf[r][c]) {
        zBuf[r][c] = z;
        planetGrid[r][c] = sphereChar(nx, ny, nz);
        planetMask[r][c] = true;
      }
    }
  }
})();

const STAR_DEFS = [
  { inc: -50, az: 110, r: 14, speed: 0.72, phase: 2.1, ch: 'o' },
];

function starPos3D(star, t) {
  const angle = t * star.speed + star.phase;
  let p = [star.r * Math.cos(angle), 0, star.r * Math.sin(angle)];
  p = rotZ(p, deg(star.inc));
  p = rotY(p, deg(star.az));
  p = rotX(p, deg(tiltDeg));
  return p;
}

let T = 0, last = null;
const el = document.getElementById('planet-canvas');

function render(t) {
  const grid = planetGrid.map(r => r.slice());
  function set(col, row, ch) {
    const c = Math.round(col), r = Math.round(row);
    if (c < 0 || c >= W || r < 0 || r >= H) return;
    if (ch === '.' && planetMask[r][c]) return;
    grid[r][c] = ch;
  }

  STAR_DEFS.forEach(star => {
    for (let a = 0; a < 2*Math.PI; a += 0.05) {
      let p = [star.r*Math.cos(a), 0, star.r*Math.sin(a)];
      p = rotZ(p, deg(star.inc)); p = rotY(p, deg(star.az)); p = rotX(p, deg(tiltDeg));
      const [col, row, z] = project(p);
      if (z < 0) set(col, row, '.');
    }
  });

  STAR_DEFS.forEach(star => {
    for (let a = 0; a < 2*Math.PI; a += 0.05) {
      let p = [star.r*Math.cos(a), 0, star.r*Math.sin(a)];
      p = rotZ(p, deg(star.inc)); p = rotY(p, deg(star.az)); p = rotX(p, deg(tiltDeg));
      const [col, row, z] = project(p);
      if (z >= 0) set(col, row, '.');
    }
  });

  STAR_DEFS.forEach(star => {
    for (let i = 7; i >= 1; i--) {
      const p3 = starPos3D(star, t - i * 0.09);
      const [col, row] = project(p3);
      const alpha = 1 - i / 9;
      set(col, row, alpha > 0.6 ? star.ch : (alpha > 0.35 ? '.' : ' '));
    }
    const [col, row] = project(starPos3D(star, t));
    set(col, row, star.ch);
  });

  return grid.map(r => r.join('')).join('\n');
}

function loop(ts) {
  if (!last) last = ts;
  T += Math.min((ts - last) / 1000, 0.05) * 0.7;
  last = ts;
  el.textContent = render(T);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
