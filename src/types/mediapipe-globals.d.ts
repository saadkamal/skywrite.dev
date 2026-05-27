/**
 * Author: Saad Kamal
 * Browser global declarations for self-hosted MediaPipe scripts.
 */
import type { Camera } from '@mediapipe/camera_utils'
import type { Hands } from '@mediapipe/hands'

declare global {
  interface Window {
    Camera: typeof Camera
    Hands: typeof Hands
  }
}

export {}
