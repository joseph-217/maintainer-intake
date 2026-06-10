# Final Verification Report

Status: verified for v0.1.0 release correction.

This report records the completed local, package, public repository, live-provider, and release gates for maintainer-intake v0.1.0.

## Final Product Commit

- Current verified implementation commit: a0edd41dc9aa86000b32c6e22950a150eb355ea7
- Public repository: https://github.com/asdgjshjdfkjsurehjg/maintainer-intake
- Release URL: https://github.com/asdgjshjdfkjsurehjg/maintainer-intake/releases/tag/v0.1.0
- Floating Action tag: v0

The v0.1.0 and v0 tags must point to the final verified commit after this evidence update is pushed and public CI passes.

## Public Repository

- Owner: asdgjshjdfkjsurehjg
- Visibility: public
- Default branch: main
- Description: Deterministic contribution-intake checks for open-source maintainers.
- License: MIT
- Issues: enabled
- Discussions: enabled
- Wiki: disabled
- Projects: disabled

## Public CI State

Implementation correction commit a0edd41dc9aa86000b32c6e22950a150eb355ea7 passed public CI and CodeQL:

- CI run: https://github.com/asdgjshjdfkjsurehjg/maintainer-intake/actions/runs/27243840809
- CodeQL run: https://github.com/asdgjshjdfkjsurehjg/maintainer-intake/actions/runs/27243840844

The previous release-report commit 960ace49f38ca0f834de865f13999c127eb222bc also passed:

- CI run: https://github.com/asdgjshjdfkjsurehjg/maintainer-intake/actions/runs/27243318116
- CodeQL run: https://github.com/asdgjshjdfkjsurehjg/maintainer-intake/actions/runs/27243318108

## Verification Commands

Local and package gates passed:

- npm run verify
- env -u GITHUB_TOKEN -u GH_TOKEN -u OPENAI_API_KEY -u NPM_TOKEN -u NODE_AUTH_TOKEN npm run verify
- npm exec --package node@22 -- node --run verify
- npm exec --package node@24 -- node --run verify
- fresh clone to /tmp, npm ci, Node 24 node --run verify, and clean clone status
- documented CLI/config dogfood commands
- security-sensitive output absence check
- authored-file hardcoded secret-value scan
- product file and history privacy scans

## Live Provider Smoke

- Public issue smoke: issue #1 was created, analyzed live with analyze-issue, returned kind issue, number 1, status ready_for_review, score 100, then was closed.
- Public PR smoke: PR #2 was created from a temporary branch, analyzed live with analyze-pr, returned kind pull_request, number 2, status needs_author_evidence, score 71, then was closed and the branch was deleted.

## Acceptance Matrix Summary

Verified:

- Shared deterministic engine, CLI, MCP, and GitHub Action adapters.
- Policy discovery through policy doctor, including required files, optional files, and issue forms.
- Provider normalization for linked issues, renamed files, binary files, and omitted patches.
- Action harness coverage for supported issue events and advisory, check, label, and gate modes.
- MCP protocol-safe error behavior and CLI/MCP parity for shared fixtures.
- Package tarball allowlist, packed install, and CLI smoke.
- Public docs, examples, community files, and security docs.
- No-token fixture verification.
- Node 22 and Node 24 runtime verification.
- Fresh-clone verification.
- Public repository creation under the approved owner.
- Metadata, topics, merge settings, branch protection, security settings, workflow activation, CI, CodeQL, and settings-audit read-backs.

External blocker:

- npm publication remains pending because npm authentication is not active on this machine. npm whoami returned ENEEDAUTH, and no npm publish was attempted.

## GitHub Settings Audit

Sanitized read-back is saved in artifacts/verification/github-settings.md.

Unsupported or account-dependent settings:

- Private vulnerability reporting mutation returned success, but the REST repository read-back field was null. The project records the mutation result without overstating read-back status.
- Secret scanning non-provider patterns and validity checks read back disabled.

## npm Publication State

- npm view maintainer-intake version --json returned E404 on 2026-06-09.
- npm whoami returned ENEEDAUTH on 2026-06-09.
- The package is release-ready for local tarball and future npm activation, but unpublished.

## Privacy And History Scan

Current-file and product git-history scans found no private planning markers, parent paths, or local-only application file names before public push and before release correction.

## Intentionally Ignored Or Untracked Files

None in the product repository at the last clean-state check.
