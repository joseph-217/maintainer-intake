# Handoff

## Current State

maintainer-intake is implemented, locally verified, publicly released, and published to npm. Version 0.1.1 is the supported release.

Public repository: https://github.com/joseph-217/maintainer-intake

## Last Completed Acceptance Rows

- Full local verification passed after policy-discovery and adapter-gap closure.
- Public CI and CodeQL passed on implementation correction commit a0edd41dc9aa86000b32c6e22950a150eb355ea7.
- Live issue provider smoke passed on public issue #1, which was then closed.
- Live PR provider smoke passed on public PR #2, which was then closed and its temporary branch deleted.
- Public repository settings, topics, security settings, branch protection, workflow activation, CI, and CodeQL have been read back.

## Current Branch And Commit

- Branch: main
- Latest pushed release commit: efdf6322f2c7e430877b7a53eaa8f0116d1f9d7f

## Commands Last Run

| Command or run                | Exit/state | Observation                                                                         |
| ----------------------------- | ---------: | ----------------------------------------------------------------------------------- |
| npm run verify                |          0 | Full local verification passed after the policy/provider/action/MCP test expansion. |
| Public CI run 27243840809     |    success | Node 22 and Node 24 jobs passed on a0edd41.                                         |
| Public CodeQL run 27243840844 |    success | CodeQL Analyze passed on a0edd41.                                                   |
| Public CI run 27298546865     |    success | Node 22 and Node 24 passed on the 0.1.1 release commit.                             |
| Public CodeQL run 27298546835 |    success | CodeQL passed on the 0.1.1 release commit.                                          |
| npm registry install          |          0 | Fresh install ran version 0.1.1 and fixture analysis through the npm binary.        |
| Live analyze-issue on #1      |          0 | Returned issue #1 with status ready_for_review and score 100.                       |
| Live analyze-pr on #2         |          0 | Returned pull_request #2 with status needs_author_evidence and score 71.            |

## Known Blockers

- None for npm publication. Version 0.1.0 was published but its installed CLI did not execute through npm's symlink; version 0.1.1 corrects the entrypoint and is the supported release.

## GitHub Publication State

The repository is public, pushed, and configured. See artifacts/verification/github-settings.md for the settings audit. The supported release is https://github.com/joseph-217/maintainer-intake/releases/tag/v0.1.1. Tags `v0.1.1` and `v0` dereference to efdf6322f2c7e430877b7a53eaa8f0116d1f9d7f.

## npm Publication State

The package is published at https://www.npmjs.com/package/maintainer-intake. Registry ownership remains under the verified npm publisher account; version 0.1.1 is the supported release after packed-install and registry-install CLI verification.

## Resume Command

From the product repository root:

    git status --short
    gh run list --repo joseph-217/maintainer-intake --limit 5

No release blocker remains. Future releases should use the packed-install npm binary smoke before publication.
