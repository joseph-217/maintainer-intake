# ADR 0004: Fixture-First Verification

Status: accepted

## Context

The core product should be provable without live GitHub writes, npm publication, or private credentials. Live integration matters, but local and CI gates must not depend on network credentials.

## Decision

Synthetic GitHub fixtures are first-class provider inputs. Unit, integration, CLI, MCP, and Action harness tests will use fixtures for deterministic proof. Live GitHub reads and repository writes are separate activation gates after local verification passes.

## Consequences

- Fixture schemas must stay contract-compatible with production provider normalization.
- Every major rule family needs ready and unready fixture coverage.
- Public docs examples must be executable from fixtures where practical.

## Verification

- Full local verification runs without `GITHUB_TOKEN`, `GH_TOKEN`, npm auth, or model credentials.
- CLI, MCP, and Action fixture runs are recorded in `docs/verification-evidence.md`.
- Fresh-clone and packed-install lanes execute fixture commands.
