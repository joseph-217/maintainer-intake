# ADR 0002: Evidence Over AI Authorship Detection

Status: accepted

## Context

Maintainers need to know whether an issue or pull request is review-ready. Authorship detection is unreliable, hard to prove, and invites evasion. The product should not score whether work was written by a model or by a human.

## Decision

The engine evaluates contribution evidence and repository-policy compliance. It may require an accountability acknowledgement when configured, but it will not claim to detect AI authorship, generate probability scores, or label contributors as automated.

## Consequences

- Public copy must use evidence, accountability, and policy language.
- Rule output must avoid accusatory phrasing.
- Security or quality certainty must not exceed the deterministic evidence available.

## Verification

- Snapshot maintainer responses for non-accusatory language.
- Scan public files for authorship-detection claims.
- Test that generated-work acknowledgements are framed as accountability, not detection.
