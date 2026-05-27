/**
 * Author: Saad Kamal
 * Coordinate transforms shared by the camera, gesture, and canvas layers.
 */
export interface Transform {
  dw: number;
  dh: number;
  ox: number;
  oy: number;
}

/** Calculates a CSS-pixel cover transform for fitting video into the viewport. */
export function coverTransform(
  videoWidth: number,
  videoHeight: number,
  canvasWidth: number,
  canvasHeight: number
): Transform {
  const scale = Math.max(canvasWidth / videoWidth, canvasHeight / videoHeight);
  const dw = videoWidth * scale;
  const dh = videoHeight * scale;
  return { dw, dh, ox: (canvasWidth - dw) / 2, oy: (canvasHeight - dh) / 2 };
}

/** Converts a normalized MediaPipe landmark into mirrored canvas coordinates. */
export function mapLandmark(
  lm: { x: number; y: number; z: number },
  tf: Transform
): { x: number; y: number; z: number } {
  return {
    x: tf.ox + (1 - lm.x) * tf.dw,
    y: tf.oy + lm.y * tf.dh,
    z: lm.z,
  };
}

/** Returns Euclidean distance between two 2D points. */
export function dist(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

/** Linearly interpolates between two scalar values. */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Restricts a value to the inclusive min/max range. */
export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}
