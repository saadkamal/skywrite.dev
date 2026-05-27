/**
 * Author: Saad Kamal
 * Mutable per-hand state container used by the drawing runtime.
 */
import {
  DRAW_ARM_FRAMES,
  CURSOR_LERP,
  STABILIZER_DRAW_EXIT_FRAMES,
  STABILIZER_SWITCH_FRAMES,
} from './constants';
import { lerp } from './transform';
import type { GestureMode } from './gestures';

export interface Stroke {
  color: string;
  thickness: number;
  glow: number;
  points: { x: number; y: number }[];
}

/** Tracks one hand's cursor, gesture stabilization, and in-progress stroke. */
export class Hand {
  handedness: string;
  landmarks: { x: number; y: number; z: number }[] = [];
  visible = false;
  cursor = { x: 0, y: 0 };
  cursorInit = false;
  mode: GestureMode = 'idle';
  prevMode: GestureMode = 'idle';
  current: Stroke | null = null;
  armCount = 0;
  moveAnchor: { x: number; y: number } | null = null;
  lastPalm: { x: number; y: number } | null = null;
  wipeSpeed = 0;
  wiping = false;
  candidate: GestureMode = 'idle';
  candidateFrames = 0;
  stableMode: GestureMode = 'idle';

  constructor(handedness: string) {
    this.handedness = handedness;
  }

  /** Stabilizes raw gesture classifications across consecutive frames. */
  stabilize(raw: GestureMode): GestureMode {
    if (raw === this.candidate) {
      this.candidateFrames++;
    } else {
      this.candidate = raw;
      this.candidateFrames = 1;
    }
    const need =
      this.candidate === this.stableMode
        ? 1
        : this.stableMode === 'draw' && this.candidate !== 'draw'
        ? STABILIZER_DRAW_EXIT_FRAMES
        : STABILIZER_SWITCH_FRAMES;
    if (this.candidateFrames >= need) {
      this.stableMode = this.candidate;
    }
    return this.stableMode;
  }

  /** Smooths the cursor toward the latest index-finger landmark. */
  updateCursor(tip: { x: number; y: number }) {
    if (!this.cursorInit) {
      this.cursor = { ...tip };
      this.cursorInit = true;
    } else {
      this.cursor.x = lerp(this.cursor.x, tip.x, CURSOR_LERP);
      this.cursor.y = lerp(this.cursor.y, tip.y, CURSOR_LERP);
    }
  }

  /** Clears transient hand state after tracking is lost or the camera stops. */
  reset() {
    this.visible = false;
    this.cursorInit = false;
    this.armCount = 0;
    this.moveAnchor = null;
    this.lastPalm = null;
    this.wipeSpeed = 0;
    this.wiping = false;
    this.current = null;
  }

  /** Number of frames required before draw mode starts emitting a stroke. */
  get armFrames() {
    return DRAW_ARM_FRAMES;
  }
}
