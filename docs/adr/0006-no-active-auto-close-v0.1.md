# ADR 0006: No Active Auto-Close In v0.1

Status: accepted

## Context

Automatically closing issues or pull requests is high-impact behavior. The v0.1 product can reduce review load without taking that action.

## Decision

v0.1 supports advisory, check, label, and gate modes only. It will not close issues or pull requests. If close behavior is discussed in docs, it must be framed as absent from v0.1.

## Consequences

- `reject_recommended` is advisory language, not an automatic close operation.
- Write plans cannot contain close effects.
- Action permissions and docs do not request permissions solely for closing.

## Verification

- Mode tests assert no close effects are produced.
- Source and docs scans check for active close behavior.
- Action write tests cover comments, checks, and configured labels only.
