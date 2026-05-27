/**
 * Author: Saad Kamal
 * Generates the 1200x630 Open Graph preview image used by social cards.
 *
 * Run with: npm run generate:og
 * Output:   public/og-image.png
 */

import { createCanvas } from 'canvas';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'public', 'og-image.png');

const W = 1200, H = 630;
const canvas = createCanvas(W, H);
const ctx = canvas.getContext('2d');

// ── Background ────────────────────────────────────────────────────────────────
const bg = ctx.createLinearGradient(0, 0, W, H);
bg.addColorStop(0, '#05060a');
bg.addColorStop(1, '#0d1020');
ctx.fillStyle = bg;
ctx.fillRect(0, 0, W, H);

// ── Grid ──────────────────────────────────────────────────────────────────────
ctx.strokeStyle = 'rgba(0,212,255,0.04)';
ctx.lineWidth = 1;
for (let x = 48; x < W; x += 48) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
for (let y = 48; y < H; y += 48) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

// ── Orbs ──────────────────────────────────────────────────────────────────────
/** Draws a soft radial glow used in the generated preview artwork. */
function radialOrb(cx, cy, r, color) {
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  g.addColorStop(0, color);
  g.addColorStop(1, 'transparent');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.fill();
}
radialOrb(180, 180, 320, 'rgba(0,212,255,0.10)');
radialOrb(1050, 450, 260, 'rgba(192,38,211,0.08)');

// ── Border frame ──────────────────────────────────────────────────────────────
ctx.strokeStyle = 'rgba(0,212,255,0.15)';
ctx.lineWidth = 1;
ctx.strokeRect(40, 40, W-80, H-80);

// ── Corner brackets ───────────────────────────────────────────────────────────
ctx.strokeStyle = '#00d4ff'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
[[40,40,80,40,40,80],[W-40,40,W-80,40,W-40,80],
 [40,H-40,80,H-40,40,H-80],[W-40,H-40,W-80,H-40,W-40,H-80]
].forEach(([x1,y1,x2,y2,x3,y3]) => {
  ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x3,y3); ctx.stroke();
});

// ── Logo ──────────────────────────────────────────────────────────────────────
ctx.font = '600 20px monospace';
ctx.fillStyle = '#00d4ff'; ctx.fillText('◆', 80, 118);
ctx.fillStyle = '#ffffff';  ctx.fillText('skywrite', 106, 118);
ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1;
ctx.strokeRect(196, 100, 30, 20);
ctx.font = '10px monospace'; ctx.fillStyle = 'rgba(255,255,255,0.4)';
ctx.fillText('v0.1', 200, 114);

// ── Tag row ───────────────────────────────────────────────────────────────────
ctx.fillStyle = 'rgba(0,212,255,0.08)';
ctx.strokeStyle = 'rgba(0,212,255,0.2)'; ctx.lineWidth = 1;
roundRect(ctx, 80, 136, 134, 22, 3); ctx.fill(); ctx.stroke();
ctx.font = '11px monospace'; ctx.fillStyle = '#00d4ff';
ctx.fillText('Computer Vision', 90, 151);
ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillText('/', 226, 151);
ctx.fillStyle = 'rgba(255,255,255,0.4)';
ctx.fillText('MediaPipe Hands', 238, 151);
ctx.fillText('/', 374, 151);
ctx.fillText('WebRTC · Canvas API', 386, 151);
ctx.fillText('/', 552, 151);
ctx.fillText('30 FPS · Zero Install', 564, 151);

// ── Headline ──────────────────────────────────────────────────────────────────
ctx.font = '800 72px system-ui, -apple-system, sans-serif';
ctx.fillStyle = '#ffffff';
ctx.fillText('Real-time hand tracking', 80, 272);
ctx.fillStyle = 'rgba(255,255,255,0.35)';
ctx.fillText('for in-air gesture drawing.', 80, 354);

// ── Subtext ───────────────────────────────────────────────────────────────────
ctx.font = '400 20px system-ui, -apple-system, sans-serif';
ctx.fillStyle = 'rgba(255,255,255,0.55)';
ctx.fillText('Draw with your hands. No stylus, no touch — just your webcam and MediaPipe.', 80, 418);

// ── Metrics ───────────────────────────────────────────────────────────────────
const metrics = [
  { x:80,  val:'21',     label:'LANDMARKS / HAND', color:'#00d4ff' },
  { x:256, val:'30 fps', label:'INFERENCE TARGET',  color:'#ffffff' },
  { x:432, val:'4',      label:'GESTURE STATES',    color:'#ffffff' },
  { x:608, val:'0',      label:'SERVER CALLS',      color:'#22c55e' },
];
metrics.forEach(m => {
  ctx.fillStyle = 'rgba(255,255,255,0.03)';
  ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1;
  roundRect(ctx, m.x, 458, 160, 68, 6); ctx.fill(); ctx.stroke();
  ctx.font = '700 28px monospace'; ctx.fillStyle = m.color;
  ctx.fillText(m.val, m.x+20, 492);
  ctx.font = '11px monospace'; ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fillText(m.label, m.x+20, 514);
});

// ── Hand skeleton ─────────────────────────────────────────────────────────────
ctx.strokeStyle = '#00d4ff'; ctx.lineWidth = 10; ctx.lineCap = 'round';
// Index finger extended
ctx.beginPath(); ctx.moveTo(960,300); ctx.lineTo(960,220); ctx.stroke();
ctx.fillStyle = '#00d4ff';
ctx.beginPath(); ctx.arc(960,215,8,0,Math.PI*2); ctx.fill();
// Cursor ring
ctx.strokeStyle = '#00d4ff'; ctx.lineWidth = 1.5;
ctx.beginPath(); ctx.arc(960,215,14,0,Math.PI*2); ctx.stroke();
// Curled fingers
ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 9;
[[985,295,985,278],[1008,298,1008,282],[1028,308,1028,295]].forEach(([x1,y1,x2,y2]) => {
  ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
});
// Thumb
ctx.beginPath(); ctx.moveTo(938,325); ctx.lineTo(918,298); ctx.stroke();
// Palm
ctx.strokeStyle = '#00d4ff'; ctx.lineWidth = 1.5;
ctx.fillStyle = 'rgba(16,18,28,0.9)';
ctx.beginPath(); ctx.ellipse(980,340,70,58,0,0,Math.PI*2); ctx.fill(); ctx.stroke();
// Wrist
ctx.fillStyle = 'rgba(16,18,28,0.9)';
roundRect(ctx,950,388,60,28,8); ctx.fill();
ctx.strokeStyle = '#00d4ff'; ctx.lineWidth = 1; ctx.stroke();

// Cursor trail
ctx.strokeStyle = 'rgba(0,212,255,0.5)'; ctx.lineWidth = 3; ctx.lineCap = 'round';
ctx.beginPath(); ctx.moveTo(860,180); ctx.quadraticCurveTo(900,160,920,200);
ctx.quadraticCurveTo(940,240,900,260); ctx.lineTo(840,320); ctx.stroke();

// ── HUD chip ──────────────────────────────────────────────────────────────────
ctx.fillStyle = 'rgba(13,16,23,0.9)';
ctx.strokeStyle = 'rgba(0,212,255,0.2)'; ctx.lineWidth = 1;
roundRect(ctx,840,430,180,72,8); ctx.fill(); ctx.stroke();
const hudRows = [['gesture','draw','#00d4ff'],['hand','Right','#ffffff'],['fps','30','#22c55e']];
hudRows.forEach(([k,v,vc],i) => {
  ctx.font = '11px monospace';
  ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fillText(k, 856, 452+i*18);
  ctx.fillStyle = vc; ctx.fillText(v, 940, 452+i*18);
});

// ── Write file ────────────────────────────────────────────────────────────────
const buf = canvas.toBuffer('image/png', { compressionLevel: 9, filters: canvas.PNG_FILTER_NONE });
writeFileSync(OUT, buf);
console.log(`✓ og-image.png written (${(buf.length/1024).toFixed(1)} KB)`);

/** Adds a rounded rectangle path to the canvas context. */
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x+r, y);
  ctx.lineTo(x+w-r, y); ctx.arcTo(x+w,y,x+w,y+r,r);
  ctx.lineTo(x+w, y+h-r); ctx.arcTo(x+w,y+h,x+w-r,y+h,r);
  ctx.lineTo(x+r, y+h); ctx.arcTo(x,y+h,x,y+h-r,r);
  ctx.lineTo(x, y+r); ctx.arcTo(x,y,x+r,y,r);
  ctx.closePath();
}
