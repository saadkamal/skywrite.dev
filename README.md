# Skywrite

Author: Saad Kamal

Skywrite is a browser-based gesture drawing app. It uses webcam hand tracking, MediaPipe Hands, and layered Canvas rendering so you can draw in the air with hand poses, then export the result as a PNG.

The project is designed to be a clean, privacy-minded open-source example: camera frames are processed locally in the browser, camera access still depends on the browser's explicit permission prompt, and the camera toggle stops real media tracks instead of only changing the UI.

## What It Does

- Draw with one or two hands using real-time hand landmarks.
- Use four gesture states: idle, draw, move, and erase.
- Fall back to mouse or touch drawing when camera access is unavailable.
- Run calibration checks for browser support, camera permission, resolution, FPS, and tracking.
- Learn gestures through an interactive tutorial.
- Export a composited PNG with background, optional webcam frame, and strokes.

## Privacy Model

Skywrite has no backend. Webcam frames, landmarks, and drawings are not uploaded to an application server.

Like any web app, the browser downloads static JavaScript, WebAssembly, model, CSS, and image assets. MediaPipe runtime files are installed from npm and copied into `public/vendor/mediapipe/hands` during local development and production builds, so the running app does not execute MediaPipe scripts from a CDN.

The drawing page starts the camera permission flow when `/draw` opens. If permission is granted, Skywrite then initializes the local MediaPipe runtime. That order keeps browser permission behavior separate from hand-tracking runtime errors.

See [docs/PRIVACY.md](docs/PRIVACY.md) for the full privacy and data-flow notes.

## Gesture Controls

| Gesture | Pose | Action |
| --- | --- | --- |
| Idle | Closed fist | Pause drawing and reposition safely. |
| Draw | Index finger extended | Hold briefly to arm, then draw. |
| Move | Index and middle fingers extended | Pan all committed strokes. |
| Erase | Three or more fingers extended | Swipe to erase strokes near the hand. |

## Tech Stack

- React 18
- TypeScript
- Vite
- MediaPipe Hands
- Canvas 2D
- WebRTC `getUserMedia`
- Vitest and Testing Library

## Requirements

- Node.js 20 or newer
- npm 10 or newer
- A modern browser with WebRTC, WebAssembly, and camera permission support

## Quick Start

```bash
npm install
npm run dev
```

Then open `http://localhost:5173`.

## Scripts

```bash
npm run dev            # Start the Vite dev server
npm run build          # Build production assets
npm run preview        # Preview the production build
npm run start          # Alias for vite preview
npm run lint           # Run ESLint
npm run typecheck      # Run TypeScript project checks
npm run test           # Run unit tests
npm run test:coverage  # Run tests with the 80%+ coverage gate
npm run check          # Run lint, typecheck, coverage, and build
npm run audit:prod     # Audit production dependencies only
npm run generate:og    # Generate public/og-image.png
```

## Project Structure

```text
src/
  components/       Landing-page sections
  i18n/             Translation setup and English source strings
  lib/              Gesture, hand-state, transform, and canvas helpers
  pages/            Drawing app, calibration, and tutorial flows
  test/             Shared Vitest setup
docs/               Architecture, privacy, development, and testing docs
public/             Static assets served by Vite
scripts/            Utility scripts such as OG image generation
```

## Quality Bar

The repository is expected to pass:

```bash
npm run check
npm run audit:prod
```

Coverage is enforced above 80% for deterministic unit-testable code. Camera-heavy pages are covered by smoke tests and should also be validated manually in real browsers because jsdom cannot provide a real webcam or MediaPipe runtime.

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Development](docs/DEVELOPMENT.md)
- [Privacy](docs/PRIVACY.md)
- [Testing](docs/TESTING.md)
- [Release](docs/RELEASE.md)
- [Contributing](CONTRIBUTING.md)
- [Security](SECURITY.md)

## Authorship

Skywrite is authored by Saad Kamal. Source files and documentation include author attribution for clarity before the project is published as open source.

## License

MIT License. See [LICENSE](LICENSE).
