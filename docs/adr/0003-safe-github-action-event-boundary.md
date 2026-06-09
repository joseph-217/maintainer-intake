# ADR 0003: Safe GitHub Action Event Boundary

Status: accepted

## Context

GitHub Actions can run with elevated permissions on events such as `pull_request_target`. That is useful for comments, checks, and labels, but unsafe if the workflow checks out or executes contributor-controlled code.

## Decision

The Action will inspect issues, pull requests, repository files, comments, labels, and diffs through GitHub APIs. Under privileged events it must not check out contributor head branches, install contributor dependencies, run contributor scripts, or build shell commands from issue or pull request text.

## Consequences

- Supported Action events must be handled through metadata and API data.
- Workflow examples must use explicit minimal permissions.
- Any write-back is constrained to engine-produced write plans.

## Verification

- Static security tests scan workflows and source for unsafe checkout or contributor-code execution.
- Local Action harness exercises supported events without repository checkout.
- Security-model docs state the boundary and rollback path.
