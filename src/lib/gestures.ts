/**
 * Author: Saad Kamal
 * Rule-based gesture classifier for mapping hand landmarks to drawing modes.
 */
type Landmark = { x: number; y: number; z: number };
export type GestureMode = 'draw' | 'move' | 'erase' | 'idle';

import { dist } from './transform';

/** Returns true when a fingertip is farther from the wrist than its PIP joint. */
export function fingerExtended(landmarks: Landmark[], tipIdx: number, pipIdx: number): boolean {
  return dist(landmarks[tipIdx], landmarks[0]) > dist(landmarks[pipIdx], landmarks[0]);
}

/** Classifies hand landmarks into idle, draw, move, or erase mode. */
export function classify(landmarks: Landmark[]): GestureMode {
  const idx  = fingerExtended(landmarks, 8,  6);
  const mid  = fingerExtended(landmarks, 12, 10);
  const ring = fingerExtended(landmarks, 16, 14);
  const pinky= fingerExtended(landmarks, 20, 18);
  const count = [idx, mid, ring, pinky].filter(Boolean).length;
  if (idx && mid && !ring && !pinky) return 'move';
  if (idx && !mid && !ring && !pinky) return 'draw';
  if (count >= 3) return 'erase';
  return 'idle';
}
