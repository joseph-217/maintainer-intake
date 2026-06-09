# Final Verification Report

Status: release-ready.

This report records the completed local, package, public repository, and release-preparation gates for `maintainer-intake` v0.1.0.

## Final Product Commit

The release commit is the commit targeted by the annotated `v0.1.0` tag. The floating `v0` tag must point to the same commit after release.

The last public commit before this report was `cb7d98b4b74c5e430cccc1e9d4162b4883b5d30c`. This report commit is documentation/evidence only and must pass public CI before tagging.

## Public Repository

- URL: https://github.com/asdgjshjdfkjsurehjg/maintainer-intake
- Owner: `asdgjshjdfkjsurehjg`
- Visibility: public
- Default branch: `main`
- Description: `Deterministic contribution-intake checks for open-source maintainers.`
- License: MIT

## GitHub Release And Tags

Planned release:

- Tag: `v0.1.0`
- Floating Action tag: `v0`
- Release URL: https://github.com/asdgjshjdfkjsurehjg/maintainer-intake/releases/tag/v0.1.0

Release creation is authorized only after public CI and CodeQL pass for this report commit.

## CI State

Public CI and CodeQL passed on commit `860632dca3e0dcb3a29200e66539b6b57de091b6`:

- CI run: https://github.com/asdgjshjdfkjsurehjg/maintainer-intake/actions/runs/27242961108
- CodeQL run: https://github.com/asdgjshjdfkjsurehjg/maintainer-intake/actions/runs/27242961094

The public verification artifact commit `cb7d98b4b74c5e430cccc1e9d4162b4883b5d30c` also passed:

- CI run: https://github.com/asdgjshjdfkjsurehjg/maintainer-intake/actions/runs/27243147472
- CodeQL run: https://github.com/asdgjshjdfkjsurehjg/maintainer-intake/actions/runs/27243147473

The final report commit must pass the same CI and CodeQL workflows before the release tags are created.

## Verification Commands

Local and fixture gates passed:

- `npm run verify`
- `env -u GITHUB_TOKEN -u GH_TOKEN -u OPENAI_API_KEY -u NPM_TOKEN -u NODE_AUTH_TOKEN npm run verify`
- `npm exec --package node@22 -- node --run verify`
- `npm exec --package node@24 -- node --run verify`
- fresh clone to `/tmp`, `npm ci`, Node 24 `node --run verify`, and clean clone status
- documented CLI/config dogfood commands
- security-sensitive output absence check
- authored-file hardcoded secret-value scan
- product file and history privacy scans

## Acceptance Matrix Summary

Verified locally:

- Shared deterministic engine, CLI, MCP, and GitHub Action adapters.
- Package tarball allowlist, packed install, and CLI smoke.
- Public docs, examples, community files, and security docs.
- No-token fixture verification.
- Node 22 and Node 24 runtime verification.
- Fresh-clone verification.

Remote activation verified:

- Public repository creation under the approved owner.
- Metadata, topics, merge settings, branch protection, security settings, workflow activation, CI, and CodeQL read-backs.

Still intentionally pending:

- npm publication, because npm authentication is not active on this machine.

## GitHub Settings Audit

Sanitized read-back is saved in `artifacts/verification/github-settings.md`.

## Unsupported Settings Or External Blockers

- Private vulnerability reporting mutation returned success, but the REST repository read-back field was `null`. The project therefore records the mutation result without overstating a read-back status.
- Secret scanning non-provider patterns and validity checks read back disabled.
- No npm publication was attempted because `npm whoami` returned `ENEEDAUTH`.

## npm Publication State

- `npm view maintainer-intake version --json` returned `E404` on 2026-06-09.
- `npm whoami` returned `ENEEDAUTH` on 2026-06-09.
- The package is release-ready for local tarball and future npm activation, but unpublished.

## Privacy And History Scan

Current-file and product git-history scans found no private planning markers, parent paths, or local-only application file names before public push.

## Intentionally Ignored Or Untracked Files

None in the product repository at the last clean-state check.
