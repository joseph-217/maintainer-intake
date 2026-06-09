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
