# Contributing

Author: Saad Kamal

Thanks for helping improve Skywrite.

## Before You Start

- Read `README.md`.
- Read `docs/ARCHITECTURE.md` for the runtime model.
- Read `docs/PRIVACY.md` before changing camera, storage, or network behavior.

## Development Flow

1. Create a branch.
2. Make a focused change.
3. Add or update tests.
4. Run `npm run check`.
5. Run `npm run audit:prod`.
6. Open a pull request with a clear summary and test notes.

## Code Style

- Keep functions small and named around behavior.
- Prefer typed helpers over `any`.
- Preserve author attribution comments.
- Add comments for intent, lifecycle, privacy decisions, and non-obvious math.
- Do not introduce backend calls, analytics, or remote scripts without a privacy review.

## Pull Request Checklist

- [ ] The change is scoped and documented.
- [ ] Tests were added or updated.
- [ ] `npm run check` passes.
- [ ] `npm run audit:prod` passes.
- [ ] Camera and privacy behavior were considered.
- [ ] Documentation was updated when behavior changed.
