/**
 * Author: Saad Kamal
 * Canvas helpers for crisp DPR setup, stroke rendering, and hand overlays.
 */
import { GLOW_SHADOW_SCALE, HAND_CONNECTIONS } from './constants';
import type { Stroke } from './Hand';

/** Prepares a canvas for CSS-pixel drawing on high-DPI displays. */
export function setupCanvas(
  canvas: HTMLCanvasElement,
  width: number,
  height: number
): CanvasRenderingContext2D {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  const ctx = canvas.getContext('2d')!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

/** Draws a smoothed neon stroke path, including single-point dots. */
export function drawStroke(ctx: CanvasRenderingContext2D, stroke: Stroke) {
  if (stroke.points.length === 0) return;
  ctx.strokeStyle = stroke.color;
  ctx.fillStyle = stroke.color;
  ctx.lineWidth = stroke.thickness;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  if (stroke.glow > 0) {
    ctx.shadowBlur = (stroke.glow / 100) * GLOW_SHADOW_SCALE;
    ctx.shadowColor = stroke.color;
  }
  ctx.beginPath();
  if (stroke.points.length === 1) {
    const p = stroke.points[0];
    ctx.arc(p.x, p.y, stroke.thickness / 2, 0, Math.PI * 2);
    ctx.fill();
  } else if (stroke.points.length === 2) {
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
    ctx.lineTo(stroke.points[1].x, stroke.points[1].y);
    ctx.stroke();
  } else {
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
    for (let i = 1; i < stroke.points.length - 1; i++) {
      const p = stroke.points[i];
      const next = stroke.points[i + 1];
      const mid = { x: (p.x + next.x) / 2, y: (p.y + next.y) / 2 };
      ctx.quadraticCurveTo(p.x, p.y, mid.x, mid.y);
    }
    const last = stroke.points[stroke.points.length - 1];
    ctx.lineTo(last.x, last.y);
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
}

/** Draws a MediaPipe hand skeleton and fingertip markers. */
export function drawHandSkeleton(
  ctx: CanvasRenderingContext2D,
  landmarks: { x: number; y: number }[],
  color: string
) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  HAND_CONNECTIONS.forEach(([a, b]) => {
    ctx.beginPath();
    ctx.moveTo(landmarks[a].x, landmarks[a].y);
    ctx.lineTo(landmarks[b].x, landmarks[b].y);
    ctx.stroke();
  });
  landmarks.forEach((lm, i) => {
    ctx.fillStyle = color;
    const radius = [4, 8, 12, 16, 20].includes(i) ? 5 : 3;
    ctx.beginPath();
    ctx.arc(lm.x, lm.y, radius, 0, Math.PI * 2);
    ctx.fill();
  });
}
