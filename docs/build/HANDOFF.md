# Handoff

## Current State

maintainer-intake is implemented, locally verified, and publicly released on GitHub and npm as v0.1.2. npm trusted publishing is configured for the repository's `publish.yml` workflow.

Public repository: https://github.com/joseph-217/maintainer-intake

## Last Completed Acceptance Rows

- Full local verification passed after policy-discovery and adapter-gap closure.
- Public CI and CodeQL passed on implementation correction commit a0edd41dc9aa86000b32c6e22950a150eb355ea7.
- Live issue provider smoke passed on public issue #1, which was then closed.
- Live PR provider smoke passed on public PR #2, which was then closed and its temporary branch deleted.
- Public repository settings, topics, security settings, branch protection, workflow activation, CI, and CodeQL have been read back.
- The released `v0` Action ran against controlled issue #3 with read-only permissions, loaded repository policy without checkout, and produced a score-100 packet.
- GitHub Actions publish run 27358247279 published v0.1.2 through npm trusted publishing and produced signed provenance.
- A clean registry consumer installed v0.1.2, ran the CLI, analyzed the ready fixture, and verified npm signatures and attestations.

## Current Branch And Commit

- Branch: main
- Latest pushed release commit: 2126e0e2e5b8d6f91d343d4caa402a477d192ffd

## Commands Last Run

| Command or run                  | Exit/state | Observation                                                                         |
| ------------------------------- | ---------: | ----------------------------------------------------------------------------------- |
| npm run verify                  |          0 | Full local verification passed after the policy/provider/action/MCP test expansion. |
| Public CI run 27243840809       |    success | Node 22 and Node 24 jobs passed on a0edd41.                                         |
| Public CodeQL run 27243840844   |    success | CodeQL Analyze passed on a0edd41.                                                   |
| Public CI run 27298546865       |    success | Node 22 and Node 24 passed on the 0.1.1 release commit.                             |
| Public CodeQL run 27298546835   |    success | CodeQL passed on the 0.1.1 release commit.                                          |
| Public CI run 27313604092       |    success | Node 22 and Node 24 passed on the 0.1.2 release commit.                             |
| Public CodeQL run 27313604085   |    success | CodeQL passed on the 0.1.2 release commit.                                          |
| Released Action run 27314861143 |    success | `v0` resolved to 2126e0e and produced the expected read-only issue packet.          |
| Packed 0.1.2 install            |          0 | Packed CLI printed version 0.1.2 and analyzed the ready fixture.                    |
| npm publish run 27358247279     |    success | OIDC trusted publishing released v0.1.2 with signed provenance.                     |
| Registry 0.1.2 install          |          0 | CLI printed 0.1.2; ready fixture returned score 100; attestations verified.         |
| Live analyze-issue on #1        |          0 | Returned issue #1 with status ready_for_review and score 100.                       |
| Live analyze-pr on #2           |          0 | Returned pull_request #2 with status needs_author_evidence and score 71.            |

## Known Blockers

No product release blockers remain.

## GitHub Publication State

The repository is public, pushed, and configured. See artifacts/verification/github-settings.md for the settings audit. The supported GitHub release is https://github.com/joseph-217/maintainer-intake/releases/tag/v0.1.2. Tags `v0.1.2` and `v0` dereference to 2126e0e2e5b8d6f91d343d4caa402a477d192ffd.

## npm Publication State

The package is published at https://www.npmjs.com/package/maintainer-intake. Registry ownership remains under the verified npm publisher account. Version 0.1.2 is `latest`, was published by GitHub Actions using npm trusted publishing, and passed a clean registry-install CLI and fixture smoke. The registry checksum matches the package generated in publish run 27358247279.

## Resume Command

From the product repository root:

    git status --short
    gh run list --repo joseph-217/maintainer-intake --limit 5

For a future release, follow `docs/releasing.md`, keep the version tag and floating major Action tag aligned, and dispatch `publish.yml` with the exact version tag. Retain the packed-install and clean registry-install smokes.
