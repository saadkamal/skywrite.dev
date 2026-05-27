# Security Policy

Author: Saad Kamal

## Supported Versions

Skywrite is pre-1.0. Security fixes will target the latest main branch until stable releases are created.

## Reporting a Vulnerability

Please report vulnerabilities privately to Saad Kamal once the public repository is created. Until then, do not publish exploit details in issues.

Include:

- Affected version or commit
- Steps to reproduce
- Browser and operating system
- Impact
- Suggested fix, if known

## Security Priorities

- Camera frames must not be uploaded by default.
- Camera controls must stop real media tracks.
- Runtime scripts should be self-hosted or pinned.
- Dependency updates should pass `npm audit --omit=dev`.
- Any new network request must be documented in `docs/PRIVACY.md`.
