# ADR 0001: Shared Deterministic Engine

Status: accepted

## Context

The package exposes three adapters: CLI, MCP, and GitHub Action. If each adapter implements its own contribution checks, the product will drift and maintainers will receive inconsistent results for the same issue or pull request.

## Decision

All rule evaluation, status computation, write-plan generation, and renderable packet data will live in one deterministic engine under `src/engine/`. Adapters may only translate provider input into normalized engine models, invoke the engine, render requested formats, and execute explicit write plans.

## Consequences

- Rule IDs and status precedence are public compatibility contracts.
- Adapter parity must be tested against shared fixtures.
- Duplicated rule logic outside `src/engine/` is a release blocker.

## Verification

- Search for stable rule IDs outside `src/engine/`.
- Run CLI, MCP, and Action parity tests on the same fixtures.
- Keep adapter tests focused on translation, protocol, and write execution rather than rule decisions.
