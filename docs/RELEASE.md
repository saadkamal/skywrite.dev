# Release

Author: Saad Kamal

This checklist keeps Skywrite releases predictable once the GitHub repository is created.

## Before Tagging

1. Run `npm ci` from a clean checkout.
2. Run `npm run check`.
3. Run `npm run audit:prod`.
4. Test `/`, `/draw`, `/calibrate`, and `/tutorial` in Chrome or Edge.
5. Confirm `/draw` requests camera permission on entry, starts tracking after permission is granted, and stops the browser camera indicator when `Stop Camera` is clicked.
6. Confirm no CDN runtime scripts are loaded from the production build.
7. Review `docs/PRIVACY.md` if any storage, permission, or network behavior changed.

## GitHub Settings

- Enable the CI workflow in `.github/workflows/ci.yml`.
- Protect `main` and require the CI quality gate before merge.
- Enable private vulnerability reporting when the repository is public.
- Confirm the final repository URL in `package.json` before tagging.

## Release Notes

Each release should include:

- User-facing changes
- Privacy or security changes
- Test coverage summary
- Known limitations
