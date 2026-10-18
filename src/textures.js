/* ============================================================================
   TEXTURES - everything is drawn to a canvas at runtime.

   No image files, no CDN fetches (the artifact sandbox blocks those anyway),
   and no binary assets to keep in sync with the measurements. Each function
   is cached, so calling it from several materials costs one draw.
   ========================================================================== */

import { KEY_LAYOUT } from './keyboard-layout.js';

const cache = new Map();

export function controllerLegends(THREE) {
  return cached('controllerLegends', () => {
    const c = canvas(1024); c.height = 128;
    const x = c.getContext('2d');
    x.textAlign = 'center'; x.textBaseline = 'middle';
    x.font = 'bold 100px Arial'; x.fillStyle = '#366dc4';
    ['A','B','X','Y'].forEach((s,i) => x.fillText(s,i*128+64,70));
    x.strokeStyle = '#0a1934'; x.lineWidth = 9;
    x.strokeRect(4*128+26,27,55,48); x.strokeRect(4*128+47,49,55,48);
    for(const y of [33,64,95]) { x.beginPath(); x.moveTo(5*128+24,y); x.lineTo(5*128+104,y); x.stroke(); }
    x.beginPath(); x.moveTo(6*128+20,66); x.lineTo(6*128+20,102); x.lineTo(6*128+108,102); x.lineTo(6*128+108,66); x.stroke();
    x.beginPath(); x.moveTo(6*128+64,83); x.lineTo(6*128+64,22); x.moveTo(6*128+40,45); x.lineTo(6*128+64,22); x.lineTo(6*128+88,45); x.stroke();
    x.fillStyle = '#f2f4f7'; x.font = 'bold 100px Arial'; x.fillText('X',7*128+64,70);
    return toTexture(THREE,c);
  });
}

export function gripDots(THREE) {
  return cached('gripDots', () => {
    const c = canvas(256), x = c.getContext('2d');
    x.fillStyle = '#929292'; x.fillRect(0,0,256,256);
    x.fillStyle = '#525252';
    for(let y=4;y<256;y+=12) for(let u=(y%24?4:10);u<256;u+=12) {
      x.beginPath(); x.arc(u,y,1.8,0,Math.PI*2); x.fill();
    }
    return toTexture(THREE,c,8,1);
  });
}
function cached(key, make) {
  if (!cache.has(key)) cache.set(key, make());
  return cache.get(key);
}

function canvas(size) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  return c;
}

function toTexture(THREE, c, repeatX, repeatY) {
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeatX || 1, repeatY || 1);
  t.anisotropy = 8;
  if ('colorSpace' in t && THREE.SRGBColorSpace) t.colorSpace = THREE.SRGBColorSpace;
  else if ('encoding' in t && THREE.sRGBEncoding) t.encoding = THREE.sRGBEncoding;
  return t;
}

function noise(ctx, size, amount, alpha) {
  const img = ctx.getImageData(0, 0, size, size);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * amount;
    d[i] += n; d[i + 1] += n; d[i + 2] += n;
    if (alpha !== undefined) d[i + 3] = alpha;
  }
  ctx.putImageData(img, 0, 0);
}

/* --- ply face: warm birch with a soft longitudinal grain ------------------ */
export function plyFace(THREE) {
  return cached('plyFace', () => {
    const S = 512, c = canvas(S), x = c.getContext('2d');
    x.fillStyle = '#c9a877';
    x.fillRect(0, 0, S, S);
    for (let i = 0; i < 240; i++) {
      const y = Math.random() * S;
      const w = 0.6 + Math.random() * 2.6;
      const dark = Math.random() < 0.35;
      x.strokeStyle = dark
        ? 'rgba(120, 88, 50, ' + (0.05 + Math.random() * 0.12) + ')'
        : 'rgba(226, 198, 154, ' + (0.05 + Math.random() * 0.14) + ')';
      x.lineWidth = w;
      x.beginPath();
      x.moveTo(0, y);
      // a lazy sine so the grain is not dead straight
      for (let px = 0; px <= S; px += 16) {
        x.lineTo(px, y + Math.sin((px / S) * Math.PI * 2 + i) * (2 + Math.random() * 5));
      }
      x.stroke();
    }
    // a couple of knots
    for (let k = 0; k < 3; k++) {
      const kx = Math.random() * S, ky = Math.random() * S;
      const g = x.createRadialGradient(kx, ky, 1, kx, ky, 16 + Math.random() * 14);
      g.addColorStop(0, 'rgba(105, 74, 40, 0.5)');
      g.addColorStop(1, 'rgba(105, 74, 40, 0)');
      x.fillStyle = g;
      x.beginPath(); x.arc(kx, ky, 30, 0, Math.PI * 2); x.fill();
    }
    noise(x, S, 10);
    return toTexture(THREE, c, 2, 1);
  });
}

/* --- ply edge: the stacked veneer layers, the signature of this desk ------ */
export function plyEdge(THREE, layers) {
  const n = layers || 9;
  return cached('plyEdge' + n, () => {
    const S = 256, c = canvas(S), x = c.getContext('2d');
    x.fillStyle = '#d8bb8c';
    x.fillRect(0, 0, S, S);
    const band = S / n;
    for (let i = 0; i < n; i++) {
      // alternating core / face veneer, each with its own slight tone
      const light = i % 2 === 0;
      x.fillStyle = light ? '#dcc194' : '#c19a67';
      x.fillRect(0, i * band, S, band);
      x.strokeStyle = 'rgba(96, 68, 38, 0.45)';
      x.lineWidth = 1.5;
      x.beginPath();
      x.moveTo(0, i * band);
      x.lineTo(S, i * band);
      x.stroke();
    }
    noise(x, S, 14);
    return toTexture(THREE, c, 6, 1);
  });
}

/* --- floor: 600mm gloss porcelain with grout ------------------------------ */
export function floorTile(THREE) {
  return cached('floorTile', () => {
    const S = 512, c = canvas(S), x = c.getContext('2d');
    x.fillStyle = '#ece8df';
    x.fillRect(0, 0, S, S);
    // faint mottling so the tile is not flat
    for (let i = 0; i < 90; i++) {
      const g = x.createRadialGradient(
        Math.random() * S, Math.random() * S, 2,
        Math.random() * S, Math.random() * S, 30 + Math.random() * 90);
      g.addColorStop(0, 'rgba(255, 253, 248, 0.5)');
      g.addColorStop(1, 'rgba(255, 253, 248, 0)');
      x.fillStyle = g;
      x.fillRect(0, 0, S, S);
    }
    const grout = 6;
    x.fillStyle = '#cfc9bc';
    x.fillRect(0, 0, S, grout);
    x.fillRect(0, 0, grout, S);
    x.fillStyle = '#bdb6a7';
    x.fillRect(0, 0, S, 2);
    x.fillRect(0, 0, 2, S);
    noise(x, S, 6);
    return toTexture(THREE, c, 1, 1);
  });
}

/* --- wall: rough skimmed plaster ----------------------------------------- */
export function plaster(THREE) {
  return cached('plaster', () => {
    const S = 256, c = canvas(S), x = c.getContext('2d');
    x.fillStyle = '#d9cfc6';
    x.fillRect(0, 0, S, S);
    for (let i = 0; i < 1400; i++) {
      x.fillStyle = 'rgba(255,255,255,' + (Math.random() * 0.16) + ')';
      x.beginPath();
      x.arc(Math.random() * S, Math.random() * S, Math.random() * 2.4, 0, Math.PI * 2);
      x.fill();
    }
    noise(x, S, 12);
    return toTexture(THREE, c, 4, 4);
  });
}

/* --- desk mat: black, with the faint hex/map graphic ---------------------- */
export function deskMat(THREE) {
  return cached('deskMat', () => {
    const S = 512, c = canvas(S), x = c.getContext('2d');
    x.fillStyle = '#16161a';
    x.fillRect(0, 0, S, S);
    // hex grid, very low contrast - the mat reads as black until you lean in
    const r = 26, h = r * Math.sqrt(3);
    x.strokeStyle = 'rgba(150, 165, 185, 0.10)';
    x.lineWidth = 1;
    for (let row = -1; row * h * 0.5 < S + h; row++) {
      for (let col = -1; col * r * 1.5 < S + r; col++) {
        const cx = col * r * 1.5;
        const cy = row * h + (col % 2 ? h / 2 : 0);
        x.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = (Math.PI / 3) * i;
          const px = cx + r * Math.cos(a), py = cy + r * Math.sin(a);
          i ? x.lineTo(px, py) : x.moveTo(px, py);
        }
        x.closePath();
        x.stroke();
      }
    }
    // suggestion of landmasses, softer still
    x.fillStyle = 'rgba(120, 140, 165, 0.07)';
    for (let i = 0; i < 26; i++) {
      x.beginPath();
      const bx = Math.random() * S, by = Math.random() * S;
      x.moveTo(bx, by);
      for (let p = 0; p < 7; p++) {
        x.lineTo(bx + (Math.random() - 0.5) * 120, by + (Math.random() - 0.5) * 80);
      }
      x.closePath();
      x.fill();
    }
    noise(x, S, 5);
    return toTexture(THREE, c, 1, 1);
  });
}

/** Transparent print layer. Bay seams and latch relief are actual geometry. */
export function nasMarkings(THREE) {
  return cached('nasMarkings', () => {
    const c = canvas(512), x = c.getContext('2d');
    x.clearRect(0, 0, 512, 512);
    x.fillStyle = '#08090b';
    x.font = '600 43px Arial, sans-serif';
    x.textAlign = 'center';
    x.fillText('01', 139, 195);
    x.fillText('02', 366, 195);
    x.fillStyle = '#91969e';
    x.textAlign = 'left';
    x.font = 'bold 12px Arial, sans-serif';
    x.fillText('UGREEN', 36, 483);
    return toTexture(THREE, c);
  });
}

/* --- NAS front: legacy flat texture retained for compatibility ------------ */
export function nasFront(THREE, labels) {
  return cached('nasFront' + labels.join(''), () => {
    const W = 256, H = 384;
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const x = c.getContext('2d');
    x.fillStyle = '#26262a';
    x.fillRect(0, 0, W, H);
    const bw = 96, bh = 280, top = 26;
    labels.forEach((label, i) => {
      const bx = 22 + i * 112;
      const g = x.createLinearGradient(bx, 0, bx + bw, 0);
      g.addColorStop(0, '#1b1b1e');
      g.addColorStop(0.5, '#303036');
      g.addColorStop(1, '#1b1b1e');
      x.fillStyle = g;
      x.fillRect(bx, top, bw, bh);
      x.strokeStyle = '#0d0d0f';
      x.lineWidth = 3;
      x.strokeRect(bx, top, bw, bh);
      x.fillStyle = 'rgba(215, 219, 226, 0.82)';
      x.font = '600 34px "JetBrains Mono", Consolas, monospace';
      x.textAlign = 'center';
      x.fillText(label, bx + bw / 2, top + 150);
      // the finger recess at the foot of each door
      x.fillStyle = '#0e0e10';
      x.beginPath();
      x.arc(bx + bw / 2, top + bh - 34, 13, 0, Math.PI * 2);
      x.fill();
    });
    // status LED
    x.fillStyle = '#8fd6ff';
    x.fillRect(30, H - 26, 30, 5);
    noise(x, W, 6);
    const t = new THREE.CanvasTexture(c);
    if ('colorSpace' in t && THREE.SRGBColorSpace) t.colorSpace = THREE.SRGBColorSpace;
    else if ('encoding' in t && THREE.sRGBEncoding) t.encoding = THREE.sRGBEncoding;
    t.anisotropy = 8;
    return t;
  });
}

/** Shared transparent atlas: one tile per key, no per-key textures/materials. */
export function keyLegends(THREE) {
  return cached('keyLegends', () => {
    const c = canvas(1024), x = c.getContext('2d');
    x.fillStyle = '#d4d6d8';
    x.textAlign = 'center'; x.textBaseline = 'middle';
    KEY_LAYOUT.forEach((key, i) => {
      x.font = (key.label.length > 3 ? '13' : '19') + 'px Arial, sans-serif';
      x.fillText(key.label, (i % 16) * 64 + 32, Math.floor(i / 16) * 64 + 32, 58);
    });
    return toTexture(THREE, c);
  });
}

/* --- keyboard: the legacy flat key field --------------------------------- */
export function keyField(THREE) {
  return cached('keyField', () => {
    const W = 512, H = 176;
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const x = c.getContext('2d');
    x.fillStyle = '#1a1a1d';
    x.fillRect(0, 0, W, H);
    const cols = 23, rows = 6;
    const kw = W / cols, kh = H / rows;
    for (let r = 0; r < rows; r++) {
      for (let col = 0; col < cols; col++) {
        if (r === 1 && col > 17 && col < 19) continue;
        x.fillStyle = '#2b2b30';
        x.fillRect(col * kw + 1.5, r * kh + 1.5, kw - 3, kh - 3);
        x.fillStyle = 'rgba(255,255,255,0.07)';
        x.fillRect(col * kw + 1.5, r * kh + 1.5, kw - 3, 2);
      }
    }
    return toTexture(THREE, c, 1, 1);
  });
}

/* --- screen: the design sheet, roughly as it is in the photographs -------- */
export function screen(THREE) {
  return cached('screen', () => {
    const W = 1024, H = 640;
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const x = c.getContext('2d');
    x.fillStyle = '#1b1b1f';
    x.fillRect(0, 0, W, H);
    // left rail
    x.fillStyle = '#141417';
    x.fillRect(0, 0, 44, H);
    // chat column
    x.fillStyle = '#232329';
    x.fillRect(44, 0, 250, H);
    x.fillStyle = 'rgba(200,205,215,0.30)';
    for (let i = 0; i < 30; i++) {
      x.fillRect(60, 34 + i * 19, 60 + Math.random() * 200, 6);
    }
    // the sheet itself, on paper
    x.fillStyle = '#F7F5F0';
    x.fillRect(294, 40, W - 330, H - 80);
    x.strokeStyle = '#C9C4B8';
    x.lineWidth = 2;
    x.strokeRect(294, 40, W - 330, H - 80);
    x.fillStyle = '#1C1C1A';
    x.font = '600 20px Archivo, Arial, sans-serif';
    x.fillText('04  WORKSPACE ELEVATION', 322, 82);
    // a suggestion of orthographic linework
    x.strokeStyle = '#6B6862';
    x.lineWidth = 1;
    x.strokeRect(340, 120, 300, 130);
    x.strokeRect(360, 150, 70, 100);
    x.strokeRect(470, 138, 120, 80);
    x.strokeRect(340, 300, 420, 16);
    for (let i = 0; i < 5; i++) {
      x.beginPath();
      x.moveTo(340, 350 + i * 22);
      x.lineTo(340 + 120 + Math.random() * 260, 350 + i * 22);
      x.stroke();
    }
    x.strokeStyle = '#B0453A';
    x.strokeRect(700, 120, 200, 130);
    return toTexture(THREE, c, 1, 1);
  });
}

/* --- curtain: sage, with vertical folds baked in -------------------------- */
export function curtain(THREE) {
  return cached('curtain', () => {
    const S = 256, c = canvas(S), x = c.getContext('2d');
    const g = x.createLinearGradient(0, 0, S, 0);
    for (let i = 0; i <= 16; i++) {
      const t = i / 16;
      g.addColorStop(t, i % 2 ? '#8d9c7f' : '#a8b69a');
    }
    x.fillStyle = g;
    x.fillRect(0, 0, S, S);
    noise(x, S, 10);
    return toTexture(THREE, c, 1, 1);
  });
}
