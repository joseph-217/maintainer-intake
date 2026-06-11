# GitHub Settings Audit

Initial audit date: 2026-06-09

Canonical owner and URL rechecked after the account rename on 2026-06-10.

Repository: https://github.com/joseph-217/maintainer-intake

Audited commit: `860632dca3e0dcb3a29200e66539b6b57de091b6`

## Repository Settings

| Field                  | Read-back value                                                         |
| ---------------------- | ----------------------------------------------------------------------- |
| Owner/name             | `joseph-217/maintainer-intake`                                          |
| Visibility             | `PUBLIC`                                                                |
| Default branch         | `main`                                                                  |
| Description            | `Deterministic contribution-intake checks for open-source maintainers.` |
| URL                    | https://github.com/joseph-217/maintainer-intake                         |
| License                | MIT License                                                             |
| Issues                 | enabled                                                                 |
| Discussions            | enabled                                                                 |
| Wiki                   | disabled                                                                |
| Projects               | disabled                                                                |
| Squash merge           | enabled                                                                 |
| Merge commit           | disabled                                                                |
| Rebase merge           | enabled                                                                 |
| Delete branch on merge | enabled                                                                 |

## Topics

- developer-tools
- github-actions
- issue-triage
- maintainer-tools
- mcp
- open-source
- pull-requests
- typescript

## Security Settings

| Field                                 | Read-back value                                          |
| ------------------------------------- | -------------------------------------------------------- |
| Security policy                       | enabled                                                  |
| Vulnerability alerts                  | enabled, HTTP 204 read-back                              |
| Dependabot security updates           | enabled                                                  |
| Secret scanning                       | enabled                                                  |
| Secret scanning push protection       | enabled                                                  |
| Secret scanning non-provider patterns | disabled                                                 |
| Secret scanning validity checks       | disabled                                                 |
| Private vulnerability reporting       | mutation returned success; REST read-back field was null |

## Branch Protection

Branch: `main`

| Field                         | Read-back value |
| ----------------------------- | --------------- |
| Enforce admins                | false           |
| Allow force pushes            | false           |
| Allow deletions               | false           |
| Required status checks        | null            |
| Required pull request reviews | null            |
| Restrictions                  | null            |
| Required linear history       | false           |
| Lock branch                   | false           |

This protects against force pushes and branch deletion without adding required review or required-status deadlock for a solo maintainer.

## Workflows

| Workflow           | State  |        ID |
| ------------------ | ------ | --------: |
| CI                 | active | 292475252 |
| CodeQL             | active | 292475254 |
| Dependency Review  | active | 292475255 |
| Maintainer Intake  | active | 293408221 |
| Dependabot Updates | active | 292475305 |

## Initial Public Runs

| Workflow |      Run ID | Conclusion | URL                                                                      |
| -------- | ----------: | ---------- | ------------------------------------------------------------------------ |
| CI       | 27242961108 | success    | https://github.com/joseph-217/maintainer-intake/actions/runs/27242961108 |
| CodeQL   | 27242961094 | success    | https://github.com/joseph-217/maintainer-intake/actions/runs/27242961094 |

CI job read-back:

- Verify on Node 22: success.
- Verify on Node 24: success.

CodeQL job read-back:

- Analyze: success.

## Remote Refs

Before release tagging, remote refs read back:

- `refs/heads/main` -> `860632dca3e0dcb3a29200e66539b6b57de091b6`
