# Development

Author: Saad Kamal

This document describes the local workflow for contributors.

## Setup

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

## Daily Checks

Before opening a pull request, run:

```bash
npm run check
npm run audit:prod
```

`npm run check` runs linting, TypeScript, test coverage, and the production build.

## Commenting Standard

Every source file should start with a short file-level comment that attributes the work to Saad Kamal and explains the file's purpose.

Every exported function and meaningful local function should have a concise comment. Comments should explain intent, lifecycle, or tradeoffs. Avoid comments that merely repeat the code.

## Adding a Gesture

1. Add or update constants in `src/lib/constants.ts`.
2. Update classifier logic in `src/lib/gestures.ts`.
3. Update hand state handling in `src/pages/DrawingApp.tsx`.
4. Update tutorial copy and visuals in `src/pages/GestureTutorial.tsx`.
5. Add or update unit tests in `src/lib/gestures.test.ts`.
6. Document the behavior in `README.md` and `docs/ARCHITECTURE.md`.

## Updating MediaPipe

1. Update `@mediapipe/hands` and `@mediapipe/camera_utils`.
2. Check whether new runtime/model filenames are needed.
3. Update `MEDIAPIPE_HANDS_FILES` in `vite.config.ts`.
4. Run `npm run check`.
5. Test camera start, stop, calibration, and drawing in a real browser.

## Open Source Release Checklist

- Confirm repository URLs in `package.json` and footer links point to `saadkamal/skywrite.dev`.
- Enable branch protection.
- Add CI using `npm ci`, `npm run check`, and `npm run audit:prod`.
- Keep the workflow in `.github/workflows/ci.yml` required for pull requests.
- Create an initial release tag.
- Confirm `LICENSE`, `SECURITY.md`, `CONTRIBUTING.md`, and `CODE_OF_CONDUCT.md` are visible.
- Follow `docs/RELEASE.md` before publishing a release.
