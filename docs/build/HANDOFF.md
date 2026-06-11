# Handoff

## Current State

maintainer-intake is implemented, locally verified, and publicly released on GitHub as v0.1.2. npm still serves v0.1.1 as `latest` until v0.1.2 receives the npm account's physical security-key approval.

Public repository: https://github.com/joseph-217/maintainer-intake

## Last Completed Acceptance Rows

- Full local verification passed after policy-discovery and adapter-gap closure.
- Public CI and CodeQL passed on implementation correction commit a0edd41dc9aa86000b32c6e22950a150eb355ea7.
- Live issue provider smoke passed on public issue #1, which was then closed.
- Live PR provider smoke passed on public PR #2, which was then closed and its temporary branch deleted.
- Public repository settings, topics, security settings, branch protection, workflow activation, CI, and CodeQL have been read back.
- The released `v0` Action ran against controlled issue #3 with read-only permissions, loaded repository policy without checkout, and produced a score-100 packet.

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
| Live analyze-issue on #1        |          0 | Returned issue #1 with status ready_for_review and score 100.                       |
| Live analyze-pr on #2           |          0 | Returned pull_request #2 with status needs_author_evidence and score 71.            |

## Known Blockers

- npm v0.1.2 publication is waiting for the npm account's physical security-key approval. The code, package tarball, GitHub release, and released Action have already passed their gates.

## GitHub Publication State

The repository is public, pushed, and configured. See artifacts/verification/github-settings.md for the settings audit. The supported GitHub release is https://github.com/joseph-217/maintainer-intake/releases/tag/v0.1.2. Tags `v0.1.2` and `v0` dereference to 2126e0e2e5b8d6f91d343d4caa402a477d192ffd.

## npm Publication State

The package is published at https://www.npmjs.com/package/maintainer-intake. Registry ownership remains under the verified npm publisher account. Version 0.1.1 remains `latest`; v0.1.2 passed packed-install verification but is not a registry release until security-key approval succeeds.

## Resume Command

From the product repository root:

    git status --short
    gh run list --repo joseph-217/maintainer-intake --limit 5

Complete npm v0.1.2 approval, verify the registry dist-tag and a clean registry install, then update this handoff and the final report. Future releases should use the packed-install npm binary smoke before publication.
