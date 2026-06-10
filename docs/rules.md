# Rule Reference

Rules are deterministic and versioned by stable IDs.

## Evidence-Linting Boundary

Rules inspect repository metadata, configured headings or labels, non-placeholder field content, recognizable command patterns, paths, and diff indicators. They do not understand whether prose is truthful, whether a test adequately covers behavior, or whether a patch is correct or secure. A passing packet means the configured intake evidence is present, not that maintainer review can be skipped.

## Pull Requests

| ID                   | Behavior                                                                  | Typical remediation                                                 |
| -------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| MI-PR-TEMPLATE       | Requires configured PR template sections.                                 | Restore the missing section headings and answer them.               |
| MI-PR-LINKED-ISSUE   | Requires linked issue or documented exemption when configured.            | Link the issue or explain why no issue applies.                     |
| MI-PR-SCOPE          | Requires scope, intent, or non-goal language.                             | State what changed, why, and what is intentionally out of scope.    |
| MI-PR-TEST-EVIDENCE  | Requires exact test commands or justified exemption.                      | List exact commands and results, or explain why tests do not apply. |
| MI-PR-BEHAVIOR-TESTS | Requires behavior-change test evidence when applicable.                   | Add behavior coverage or a specific exemption.                      |
| MI-PR-LARGE-CHANGE   | Flags large changes and requires a review plan.                           | Add a review plan or split the change.                              |
| MI-PR-RISKY-PATH     | Requires configured evidence for risky paths.                             | Add the evidence required by the matching risky-path rule.          |
| MI-PR-CI-WEAKENING   | Warns on workflow, CI, or test weakening indicators.                      | Restore the guard or document the intentional maintainer decision.  |
| MI-PR-GENERATED-ACK  | Requires accountability acknowledgement when configured.                  | Add the configured contributor accountability statement.            |
| MI-PR-CLASSIFICATION | Classifies docs-only, dependency-only, formatting-only, or mixed changes. | Informational; correct misleading scope language if misclassified.  |

## Issues

| ID                            | Behavior                                                                                                      | Typical remediation                                              |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| MI-ISSUE-CLASSIFICATION       | Classifies bug, feature, security-sensitive, or unknown issues.                                               | Clarify whether the report is a bug, feature, or security issue. |
| MI-ISSUE-BUG-EVIDENCE         | Requires reproduction, expected behavior, and actual behavior for bugs.                                       | Add reproducible steps plus expected and actual behavior.        |
| MI-ISSUE-FEATURE-EVIDENCE     | Requires use case and non-goals for features.                                                                 | Add the user need and explicitly excluded behavior.              |
| MI-ISSUE-SECURITY-ROUTING     | Redirects security-sensitive reports to private reporting guidance and avoids echoing sensitive body content. | Move details to the private security-reporting channel.          |
| MI-ISSUE-DUPLICATE-CANDIDATES | Treats duplicate lookup as advisory when enabled.                                                             | Review candidates; do not close solely from this signal.         |

## False Positives And Tuning

- Template and evidence requirements come from `.github/maintainer-intake.yml`; tune required sections and issue fields to match the repository's real policy.
- Required PR sections and issue evidence fields need a non-placeholder value. Empty headings, HTML-only template comments, `TBD`, and bare field-name mentions do not satisfy the check.
- Risky-path matches are glob-based. Narrow an overly broad pattern or adjust its required evidence.
- Classification is heuristic and informational. Clear scope language generally resolves ambiguous classifications.
- Binary files and omitted or truncated patches limit diff evidence; use maintainer review rather than treating missing patch text as proof of safety.
- Duplicate candidates are advisory only and require human confirmation.

## Status Precedence

Errors require maintainer decision. Security-sensitive routing may produce reject_recommended. Blocking or high evidence failures produce needs_author_evidence. Warnings produce needs_maintainer_decision. Otherwise the contribution is ready_for_review.
