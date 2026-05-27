/**
 * Author: Saad Kamal
 * Vite configuration for React and self-hosted MediaPipe runtime assets.
 */
import { defineConfig } from 'vitest/config'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

const MEDIAPIPE_HANDS_FILES = [
  'hands.js',
  'hand_landmark_full.tflite',
  'hand_landmark_lite.tflite',
  'hands.binarypb',
  'hands_solution_packed_assets.data',
  'hands_solution_packed_assets_loader.js',
  'hands_solution_simd_wasm_bin.data',
  'hands_solution_simd_wasm_bin.js',
  'hands_solution_simd_wasm_bin.wasm',
  'hands_solution_wasm_bin.js',
  'hands_solution_wasm_bin.wasm',
]

const MEDIAPIPE_CAMERA_FILES = [
  'camera_utils.js',
]

/** Copies MediaPipe WASM/model files into public assets for dev and production. */
function copyMediaPipeAssets(): Plugin {
  /** Performs the actual file copy from the installed package. */
  function copyFiles() {
    const handsPackageRoot = path.dirname(require.resolve('@mediapipe/hands/package.json'))
    const handsDestinationRoot = path.resolve('public/vendor/mediapipe/hands')
    const cameraPackageRoot = path.dirname(require.resolve('@mediapipe/camera_utils/package.json'))
    const cameraDestinationRoot = path.resolve('public/vendor/mediapipe/camera_utils')

    fs.mkdirSync(handsDestinationRoot, { recursive: true })
    fs.mkdirSync(cameraDestinationRoot, { recursive: true })

    for (const file of MEDIAPIPE_HANDS_FILES) {
      fs.copyFileSync(
        path.join(handsPackageRoot, file),
        path.join(handsDestinationRoot, file),
      )
    }

    for (const file of MEDIAPIPE_CAMERA_FILES) {
      fs.copyFileSync(
        path.join(cameraPackageRoot, file),
        path.join(cameraDestinationRoot, file),
      )
    }
  }

  return {
    name: 'copy-mediapipe-assets',
    buildStart: copyFiles,
    configureServer() {
      copyFiles()
    },
  }
}

export default defineConfig({
  plugins: [react(), copyMediaPipeAssets()],
  test: {
    environment: 'jsdom',
    fileParallelism: false,
    setupFiles: ['src/test/setup.ts'],
    testTimeout: 20000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/main.tsx',
        'src/vite-env.d.ts',
        'src/pages/DrawingApp.tsx',
        'src/pages/CameraCalibration.tsx',
        'src/**/*.test.{ts,tsx}',
        'src/test/**',
      ],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
  },
})
