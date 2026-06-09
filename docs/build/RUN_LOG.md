# Build Run Log

This log records decisions, commands, failures, fixes, and reusable conventions. It must be updated before and after each implementation slice.

## 2026-06-09: Product Baseline Slice

Expected files:

- `.gitignore`
- `docs/adr/0001-shared-deterministic-engine.md`
- `docs/adr/0002-evidence-over-ai-authorship-detection.md`
- `docs/adr/0003-safe-github-action-event-boundary.md`
- `docs/adr/0004-fixture-first-verification.md`
- `docs/adr/0005-single-package-multiple-adapters.md`
- `docs/adr/0006-no-active-auto-close-v0.1.md`
- `docs/PREMORTEM.md`
- `docs/build/HANDOFF.md`
- `docs/verification-evidence.md`
- `artifacts/verification/FINAL_REPORT.md`

Decisions:

- Keep all rule logic in `src/engine/`.
- Use fixture-first verification for local and CI proof.
- Use one package with CLI, MCP, and Action adapters.
- Do not implement active auto-close in v0.1.
- Treat npm publication as activation-gated until auth and ownership are verified.

Commands planned:

- `git status --short`
- `git config user.name`
- `git config user.email`
- `git diff --check`
- Private-marker scan from the parent workspace.

Expected outcome:

- Clean nested repository with governance and verification fixtures committed on `main`.
- No product implementation code yet.

Commands run:

| Command                                       | Exit | Observation                                                        |
| --------------------------------------------- | ---: | ------------------------------------------------------------------ |
| `git -C maintainer-intake status --short`     |    0 | Only baseline files were untracked before first commit.            |
| `git -C maintainer-intake diff --check`       |    0 | No whitespace errors reported.                                     |
| `git -C maintainer-intake config user.name`   |    0 | Returned `Joseph`.                                                 |
| `git -C maintainer-intake config user.email`  |    0 | Returned `128547272+asdgjshjdfkjsurehjg@users.noreply.github.com`. |
| Private-marker scan from the parent workspace |    0 | No private planning or local-only markers found in baseline files. |

## 2026-06-09: Package And Shared Engine Slice

Expected files:

- Package metadata and lockfile.
- TypeScript and Vitest configuration.
- Shared config schemas, contribution schemas, PR and issue rules, status computation, write plans, and renderers.
- Synthetic GitHub fixture bundles.
- Unit and fixture-provider integration tests.
- Build research note recording selected versions and audit decisions.

Decisions:

- Removed @github/local-action before commit because npm audit found vulnerable transitive Action dependencies. The Action slice will use a custom local harness.
- Kept the package build entry limited to the implemented shared-engine export until CLI and MCP entrypoints are added.
- Kept npm publication pending despite the package name availability check; auth and ownership are separate gates.

Commands run:

| Command                                                | Exit | Observation                                                                                  |
| ------------------------------------------------------ | ---: | -------------------------------------------------------------------------------------------- |
| npm install                                            |    0 | Created package-lock.json; initial audit found vulnerabilities through @github/local-action. |
| npm uninstall @github/local-action && npm audit --json |    0 | Removed vulnerable local-action dependency; audit then reported zero vulnerabilities.        |
| npm run lint                                           |    0 | Adapter rule-ID lint passed.                                                                 |
| npm run typecheck                                      |    0 | TypeScript strict check passed.                                                              |
| npm test                                               |    0 | Unit tests passed: 8 tests across config and engine behavior.                                |
| npm run test:integration                               |    0 | Fixture-provider integration test passed.                                                    |

## 2026-06-09: CLI Slice

Expected files:

- CLI entrypoint with init, policy doctor, analyze-pr, analyze-issue, help, and version.
- CLI process E2E tests for preview, write, idempotency, conflict behavior, formats, exit codes, and fixture analysis.
- Package build entry updated to include the CLI.

Decisions:

- Live GitHub analysis returns provider/auth exit code 3 until the GitHub provider slice. Fixture mode remains network-independent and fully exercised.
- The mcp command will be added in the MCP slice rather than shipping a placeholder command.

Commands run:

| Command                  | Exit | Observation                                     |
| ------------------------ | ---: | ----------------------------------------------- |
| npm run format:check     |    0 | Prettier check passed.                          |
| npm run lint             |    0 | Adapter rule-ID lint passed.                    |
| npm run typecheck        |    0 | TypeScript strict check passed.                 |
| npm test                 |    0 | Unit tests passed.                              |
| npm run test:integration |    0 | Fixture-provider integration passed.            |
| npm run test:e2e         |    0 | CLI E2E passed: 6 tests.                        |
| npm run build            |    0 | Package and CLI entrypoints built successfully. |

## 2026-06-09: MCP Slice

Expected files:

- MCP stdio server exposing analyze_pr_intake, analyze_issue_intake, render_maintainer_packet, generate_policy_files, and explain_intake_config.
- CLI mcp entrypoint that starts the MCP server on stdio.
- Real MCP client E2E that lists and calls all tools.
- Package build entry updated to include the MCP module.

Decisions:

- MCP remains a thin adapter over the shared deterministic engine.
- Live GitHub MCP analysis remains pending until the GitHub provider slice; fixturePath is the current credential-free proof path.

Commands run:

| Command                  | Exit | Observation                                           |
| ------------------------ | ---: | ----------------------------------------------------- |
| npm run format:check     |    0 | Prettier check passed.                                |
| npm run lint             |    0 | Adapter rule-ID lint passed.                          |
| npm run typecheck        |    0 | TypeScript strict check passed.                       |
| npm test                 |    0 | Unit tests passed.                                    |
| npm run test:integration |    0 | Fixture-provider integration passed.                  |
| npm run test:e2e         |    0 | CLI plus MCP E2E passed: 7 tests total.               |
| npm run build            |    0 | Package, CLI, and MCP entrypoints built successfully. |

## 2026-06-09: GitHub Provider And Action Slice

Expected files:

- REST provider for live issue and pull request reads plus constrained comment, label, and check write execution.
- GitHub Action entrypoint and action metadata using Node 24.
- Action dry-run fixture harness for supported and unsupported events.
- ncc Action bundle under dist/action.
- Provider contract tests.

Decisions:

- The Action harness uses MAINTAINER_INTAKE_FIXTURE for credential-free local proof; public workflows will use GitHub event payloads and REST reads.
- build:action uses ncc and removes declaration/package metadata artifacts, leaving only runtime bundle files in dist/action.
- pull_request_target support remains metadata/API-only; no checkout or contributor-code execution is introduced.

Commands run:

| Command                                                     | Exit | Observation                                               |
| ----------------------------------------------------------- | ---: | --------------------------------------------------------- |
| npm run format:check                                        |    0 | Prettier check passed.                                    |
| npm run lint                                                |    0 | Adapter rule-ID lint passed.                              |
| npm run typecheck                                           |    0 | TypeScript strict check passed.                           |
| npm test                                                    |    0 | Unit tests passed.                                        |
| npm run test:integration                                    |    0 | Fixture and GitHub reference-provider integration passed. |
| npm run test:e2e                                            |    0 | CLI, MCP, and Action harness E2E passed: 9 tests total.   |
| npm run build                                               |    0 | Package, CLI, and MCP entrypoints built successfully.     |
| npm run build:action                                        |    0 | ncc produced dist/action runtime bundle files.            |
| npm run verify:bundle                                       |    0 | Action bundle presence check passed.                      |
| npm run verify:security                                     |    0 | Privileged-event static security scan passed.             |
| npm run build:action && git diff --exit-code -- dist/action |    0 | Rebuilt committed Action bundle with zero diff.           |
