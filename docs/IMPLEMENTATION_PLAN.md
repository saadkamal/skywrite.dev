# Implementation Plan

Author: Saad Kamal

This plan describes the step-by-step path used to raise Skywrite to an open-source-ready baseline.

## 1. Project Foundation

- Replace the template README with project-specific documentation.
- Add package metadata, author attribution, license, and useful scripts.
- Add `.gitignore`, MIT license, contribution guide, security policy, and code of conduct.
- Add focused documentation for architecture, privacy, development, and testing.

## 2. Privacy and Runtime Hardening

- Remove CDN-executed MediaPipe scripts from `index.html`.
- Install MediaPipe through npm.
- Copy MediaPipe WASM/model assets into local static assets during Vite dev/build.
- Preserve the browser permission prompt and initialize MediaPipe only after camera access is granted.
- Make the camera toggle stop real `MediaStreamTrack` objects.
- Document what stays local and what still loads as static web assets.

## 3. Correctness Fixes

- Guard MediaPipe handedness metadata.
- Commit in-progress strokes before resetting lost hands.
- Align gesture docs and hero pseudo-code with the actual wrist-distance classifier.
- Remove broken `server.js` start script.
- Replace missing Vite favicon with a Skywrite favicon.
- Fix Open Graph image generation and metadata.

## 4. Type and Lint Quality

- Replace `any` with package-provided MediaPipe types.
- Add `typecheck` and `check` scripts.
- Clean unused imports, state, and parameters.
- Ignore generated coverage/build artifacts in linting.

## 5. Tests and Coverage

- Add Vitest, Testing Library, jsdom, and coverage tooling.
- Add unit tests for gesture classification, transforms, hand state, canvas helpers, components, routing, tutorial interactions, and camera-page smoke behavior.
- Enforce an above-80% coverage gate for deterministic unit-testable code.
- Keep real camera and MediaPipe flows in the manual QA checklist because jsdom cannot emulate hardware permission and live video.

## 6. Final Verification

- Run `npm run lint`.
- Run `npm run typecheck`.
- Run `npm run test:coverage`.
- Run `npm run build`.
- Run `npm run audit:prod`.
- Smoke test the local app in a browser.

## 7. GitHub Launch

- Create the GitHub repository.
- Update the repository URL in `package.json` and the footer.
- Push the main branch.
- Enable CI with `npm ci`, `npm run check`, and `npm run audit:prod`.
- Protect `main`.
- Publish the first release notes.
