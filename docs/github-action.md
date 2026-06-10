# GitHub Action

The Action runs on Node 24 and uses GitHub APIs for metadata, issue, pull request, comment, label, and check behavior. It does not check out or execute contributor code.

The configured policy file is loaded from the repository's default branch through the GitHub Contents API. If the file is absent, deterministic defaults apply; malformed configuration fails the run instead of silently falling back.

## Read-Only Start

This configuration evaluates intake without modifying the pull request or issue:

    name: Maintainer Intake
    on:
      pull_request:
        types: [opened, edited, reopened, synchronize, ready_for_review]
      issues:
        types: [opened, edited, reopened]
    permissions:
      contents: read
      pull-requests: read
      issues: read
    jobs:
      intake:
        runs-on: ubuntu-latest
        steps:
          - uses: joseph-217/maintainer-intake@v0
            with:
              mode: advisory
              comment: false
              labels: false

The packet remains available in the Action log and step summary. Start here while tuning repository policy.

## Opt-In Feedback

Use write permissions only for the feedback channels you enable:

    name: Maintainer Intake
    on:
      pull_request_target:
        types: [opened, edited, reopened, synchronize, ready_for_review]
      issues:
        types: [opened, edited, reopened]
    permissions:
      contents: read
      pull-requests: write
      issues: write
      checks: write
    jobs:
      intake:
        runs-on: ubuntu-latest
        steps:
          - uses: joseph-217/maintainer-intake@v0
            with:
              mode: advisory
              config: .github/maintainer-intake.yml

Start with advisory mode. Move to check, label, or gate only after the packet matches project policy.

### Why Permissions Are Requested

| Permission       | Why it is used                                                                             | When it can stay read-only or be omitted          |
| ---------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------- |
| `contents: read` | Loads `.github/maintainer-intake.yml` and repository policy files from the default branch. | Always read-only.                                 |
| `pull-requests`  | Reads PR metadata and changed files; write access supports configured PR feedback.         | Use `read` when comments and labels are disabled. |
| `issues`         | Reads issue data and supports issue or PR comments and labels through GitHub's issue APIs. | Use `read` when comments and labels are disabled. |
| `checks: write`  | Creates check runs in `check` or `gate` mode.                                              | Omit in advisory or label mode.                   |

For forked pull requests, write-back uses `pull_request_target` so the base repository token can comment or create checks. The Action reads GitHub API data only: it does not check out, import, or execute contributor code. Do not add a contributor-head checkout or execution step to this privileged job.

Inputs:

- `config`: config path; defaults to `.github/maintainer-intake.yml`.
- `mode`: optional `advisory`, `check`, `label`, or `gate` override.
- `token`: GitHub token for API reads and enabled writes.
- `comment`: create or update the marked intake comment; defaults to `true`.
- `labels`: apply configured labels; defaults to `false`.
- `check-name`: check-run name; defaults to `Maintainer Intake`.

Outputs:

- `status`: deterministic intake status.
- `score`: score from 0 to 100.
- `result-json`: serialized intake result.
- `packet-summary`: one-line maintainer summary.

Supported events are `pull_request`, `pull_request_target`, and `issues`. Other events return `unsupported_event` with score `0` and do not perform writes.

Rollback:

1. Remove the workflow.
2. Remove tool-owned labels if desired.
3. Delete the marked Maintainer Intake comment if desired.
4. Remove .github/maintainer-intake.yml.
