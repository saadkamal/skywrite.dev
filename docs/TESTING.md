# Testing

Author: Saad Kamal

Skywrite uses Vitest for unit tests and Testing Library for React component tests.

## Run Tests

```bash
npm run test
npm run test:coverage
```

## Coverage Gate

Coverage thresholds are set above 80% in `vite.config.ts`.

The gate includes deterministic unit-testable code such as:

- Core gesture logic
- Hand state
- Coordinate transforms
- Canvas helpers
- Landing-page components
- Gesture tutorial interaction

The camera-heavy drawing and calibration pages also have smoke tests, but their full camera and MediaPipe behavior must be verified in a real browser. jsdom cannot provide true camera hardware, browser permission prompts, video frames, or the full MediaPipe runtime.

## Manual Browser QA

Before release, test these flows in Chrome or Edge:

1. Open `/draw`.
2. Confirm the browser asks for camera permission when the site is not already allowed or blocked.
3. Grant permission and confirm the browser camera indicator turns on.
4. Confirm hand skeleton tracking appears after permission is granted.
5. Stop the camera and confirm the browser camera indicator turns off.
6. Draw with pointer fallback.
7. Draw with hand gestures.
8. Save a PNG.
9. Run `/calibrate` and confirm tracking detects a visible hand.
10. Open `/tutorial` and complete each gesture step.
