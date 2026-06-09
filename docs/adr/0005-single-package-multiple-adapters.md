# ADR 0005: Single Package, Multiple Adapters

Status: accepted

## Context

The release target is a developer tool with a CLI, MCP server, GitHub Action, schemas, fixtures, and docs. Splitting packages early would add release and versioning overhead without reducing v0.1 complexity.

## Decision

The v0.1 product will ship as one npm package named `maintainer-intake`, subject to final registry and auth gates. It will expose one binary, shared types and schemas where useful, a bundled JavaScript Action, and a stdio MCP server.

## Consequences

- `package-lock.json` is committed.
- Production dependencies must remain minimal and justified.
- The package tarball allowlist is a release gate.
- npm publication is separate from the GitHub release and may remain pending if credentials or ownership are not verified.

## Verification

- `npm pack --dry-run` output is audited.
- A packed tarball is installed into a clean consumer fixture and the binary is executed.
- Package metadata and files are checked for planning, token, and private-data leakage.
