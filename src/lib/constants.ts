/**
 * Author: Saad Kamal
 * Tuning constants for gesture classification, rendering, and MediaPipe setup.
 */
export const DRAW_ARM_FRAMES = 14;
export const CURSOR_LERP = 0.55;
export const STABILIZER_DRAW_EXIT_FRAMES = 4;
export const STABILIZER_SWITCH_FRAMES = 2;
export const ERASE_RADIUS_SCALE = 0.85;
export const ERASE_RADIUS_MIN = 34;
export const ERASE_RADIUS_MAX = 130;
export const WIPE_THRESHOLD_SCALE = 0.16;
export const WIPE_THRESHOLD_MIN = 6;
export const WIPE_THRESHOLD_MAX = 22;
export const WIPE_SPEED_LERP = 0.5;
export const EXTEND_POINT_MIN_DIST = 1.2;
export const GLOW_SHADOW_SCALE = 26;
export const WEBCAM_ALPHA = 0.5;
export const MEDIAPIPE_MAX_HANDS = 2;
export const MEDIAPIPE_MODEL_COMPLEXITY = 1;
export const MEDIAPIPE_MIN_DETECTION_CONFIDENCE = 0.6;
export const MEDIAPIPE_MIN_TRACKING_CONFIDENCE = 0.6;
export const HAND_CONNECTIONS: [number, number][] = [
  [0,1],[1,2],[2,3],[3,4],
  [0,5],[5,6],[6,7],[7,8],
  [5,9],[9,10],[10,11],[11,12],
  [9,13],[13,14],[14,15],[15,16],
  [13,17],[17,18],[18,19],[19,20],
  [0,17]
];
export const PALETTE = [
  '#00f0ff','#ff00e5','#39ff14',
  '#4d6dff','#ff2d6b','#ffd700',
  '#b400ff','#ffffff'
];
