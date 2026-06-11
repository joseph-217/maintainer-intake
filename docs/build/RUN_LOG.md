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
| `git -C maintainer-intake config user.email`  |    0 | Returned the verified ID-based GitHub noreply address.             |
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

## 2026-06-09: Documentation, CI, And Package Verification Slice

Expected files:

- Public README, configuration, rules, Action, MCP, security-model, troubleshooting, and release docs.
- Example policy, example Action workflow, and sample maintainer packet.
- Community files: license, contributing guide, security policy, support guide, code of conduct, changelog, issue forms, and pull request template.
- Pinned CI, CodeQL, dependency-review, and Dependabot configuration.
- Package verification that rejects private/build-only artifacts and installs the packed tarball from a temporary directory.

Decisions:

- CI uses pinned third-party Action SHAs and runs the same `npm run verify` lane on Node 22 and Node 24.
- The public Action example avoids checkout because the Action only needs GitHub event/API metadata.
- The packed-install verifier now packs into a temporary directory so verification does not leave generated tarballs in the source tree.
- The final verification script now includes `git diff --exit-code -- dist/action` after rebuilding the Action bundle.

Commands run:

| Command                                                                                                                                             | Exit | Observation                                                                                   |
| --------------------------------------------------------------------------------------------------------------------------------------------------- | ---: | --------------------------------------------------------------------------------------------- |
| npm run format:check                                                                                                                                |    0 | Initial run found one Markdown formatting issue; Prettier fixed it.                           |
| npx prettier --write .                                                                                                                              |    0 | Formatted the new docs and YAML files.                                                        |
| npm run verify                                                                                                                                      |    0 | Full local lane passed: format, lint, typecheck, unit, integration, E2E, builds, pack, audit. |
| npm run verify:pack                                                                                                                                 |    0 | Packed-install smoke passed after moving `npm pack` output into a temporary directory.        |
| Private-marker scan against local-only planning phrases                                                                                             |    0 | No private planning or local path markers found in public files.                              |
| rg -n "\\b(TODO\|FIXME\|TBD\|PLACEHOLDER\|your-org\|your-repo\|example\\.com)\\b" . --glob "!node_modules/**" --glob "!.git/**" --glob "!dist/\*\*" |    0 | No authored placeholder markers found outside the generated Action bundle.                    |

## 2026-06-09: Documentation Dogfood Pass

Purpose:

- Exercise the public README, configuration, rule/example, Action-workflow, and MCP documentation commands separately from the full test suite.
- Keep the docs evidence explicit because these commands are what a new maintainer would run first.

Commands run:

| Command                                                                                                                                                                                                               | Exit | Observation                                                                 |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---: | --------------------------------------------------------------------------- |
| node dist/cli/index.js analyze-pr --fixture fixtures/github/pr-ready.json --format markdown                                                                                                                           |    0 | README quickstart ready PR produced a Markdown maintainer packet.           |
| node dist/cli/index.js analyze-pr --fixture fixtures/github/pr-unready.json --format json                                                                                                                             |    1 | README quickstart unready PR produced JSON and the expected gate exit.      |
| node dist/cli/index.js analyze-issue --fixture fixtures/github/issue-bug-ready.json --format markdown                                                                                                                 |    0 | CLI issue example produced a Markdown maintainer packet.                    |
| node dist/cli/index.js init                                                                                                                                                                                           |    0 | Configuration docs init preview produced default YAML.                      |
| node dist/cli/index.js policy doctor --config fixtures/config/valid.yml                                                                                                                                               |    0 | Configuration docs policy doctor passed on the valid fixture.               |
| node dist/cli/index.js policy doctor --config examples/maintainer-intake.yml                                                                                                                                          |    0 | Public example policy validated successfully.                               |
| YAML.parse over examples/maintainer-intake.yml, examples/workflows/maintainer-intake.yml, .github/workflows/ci.yml, .github/workflows/codeql.yml, .github/workflows/dependency-review.yml, and .github/dependabot.yml |    0 | Example, CI, CodeQL, dependency-review, and Dependabot YAML parsed cleanly. |
| Authorship-positioning scan over authored source and docs outside dist/node_modules                                                                                                                                   |    0 | Only the explicit non-detection ADR language matched.                       |

## 2026-06-09: No-Credential And Sensitive-Output Verification

Purpose:

- Prove that the complete local/CI fixture lane does not require provider credentials.
- Prove that security-sensitive issue handling routes privately without echoing sensitive report details into the public maintainer packet.

Commands run:

| Command                                                                                                                                                        | Exit | Observation                                                                               |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---: | ----------------------------------------------------------------------------------------- |
| env -u GITHUB_TOKEN -u GH_TOKEN -u OPENAI_API_KEY -u NPM_TOKEN -u NODE_AUTH_TOKEN npm run verify                                                               |    0 | Full verify passed with common provider/package/model token variables removed.            |
| node dist/cli/index.js analyze-issue --fixture fixtures/github/issue-security-sensitive.json --format markdown, then scan output for sensitive fixture phrases |    0 | Packet routed to private security process and did not echo sensitive report body phrases. |
| Hardcoded secret-value scan over authored files outside dist/node_modules                                                                                      |    0 | No bearer token, authorization header, password assignment, or secret assignment matched. |

## 2026-06-09: Node Runtime And Fresh-Clone Verification

Purpose:

- Verify the supported Node 22 and Node 24 runtime lines explicitly because the local default Node is newer than the declared support floor.
- Verify a clean clone can install from the lockfile and run the complete release gate.

Commands run:

| Command                                                                                                                              | Exit | Observation                                                                                                      |
| ------------------------------------------------------------------------------------------------------------------------------------ | ---: | ---------------------------------------------------------------------------------------------------------------- |
| npm exec --package node@22 -- node --run verify                                                                                      |    0 | Full verify passed under Node 22.22.3.                                                                           |
| npm exec --package node@24 -- node --run verify                                                                                      |    0 | Full verify passed under Node 24.16.0.                                                                           |
| git clone local product repo to /tmp; npm ci; npm exec --package node@24 -- node --run verify; git status --short in the fresh clone |    0 | Fresh clone at commit 332c0350ebc36902beb2c40c4c19382b770fd30e installed cleanly and passed full Node 24 verify. |

## 2026-06-09: Public Repository, Settings, And CI

Purpose:

- Publish the product repository only after local release gates passed.
- Verify repository settings and public CI by read-back, not by mutation success alone.
- Fix the first public CI failure before release.

Commands and events:

| Command or event                                                                                 | Exit/state | Observation                                                                                                                                       |
| ------------------------------------------------------------------------------------------------ | ---------: | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| gh repo create OWNER/maintainer-intake --public --disable-wiki --source=. --remote=origin --push |          0 | Created the public repository and pushed `deaa818` to `main`; its canonical URL is now https://github.com/joseph-217/maintainer-intake.           |
| gh repo edit settings/topics command                                                             |          0 | Discussions enabled, projects disabled, wiki disabled, merge settings and topics applied.                                                         |
| Security feature API mutations                                                                   |          0 | Vulnerability alerts, automated security fixes, secret scanning, push protection, and private vulnerability reporting mutations returned success. |
| Branch protection API mutation                                                                   |          0 | `main` read back with force pushes and deletions disabled, with no required status checks or required reviews.                                    |
| Initial CI run 27242867100                                                                       |    failure | Action harness tests inherited GitHub runner file-command env vars, so `@actions/core.setOutput` wrote to `GITHUB_OUTPUT` instead of stdout.      |
| Local regression fix verification                                                                |          0 | `npm run test:e2e`, `npm run verify`, and a local E2E run with `GITHUB_OUTPUT`/`GITHUB_STEP_SUMMARY` set all passed.                              |
| git push origin main                                                                             |          0 | Pushed fix commit `860632dca3e0dcb3a29200e66539b6b57de091b6`.                                                                                     |
| Public CI run 27242961108                                                                        |    success | Node 22 and Node 24 jobs passed.                                                                                                                  |
| Public CodeQL run 27242961094                                                                    |    success | CodeQL Analyze job passed.                                                                                                                        |
| Remote settings and workflow read-backs                                                          |          0 | Saved sanitized field-by-field audit in `artifacts/verification/github-settings.md`.                                                              |

## 2026-06-09: Verification Gap Closure And Live Provider Smoke

Purpose:

- Close stale acceptance rows with behavior and tests rather than paper evidence.
- Add policy discovery diagnostics to policy doctor.
- Expand provider, CLI, MCP, renderer, and Action tests for required edge cases.
- Prove live GitHub issue and pull request reads against the public repository.

Commands and events:

| Command or event                                                                                              | Exit/state | Observation                                                                                                                                                          |
| ------------------------------------------------------------------------------------------------------------- | ---------: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| npm run verify                                                                                                |          0 | Full verification passed after policy discovery, provider normalization, Action mode/event, MCP error-boundary, CLI exit-code, and renderer safety tests were added. |
| git push origin main                                                                                          |          0 | Pushed implementation correction commit a0edd41dc9aa86000b32c6e22950a150eb355ea7.                                                                                    |
| Public CI run 27243840809                                                                                     |    success | Node 22 and Node 24 jobs passed on a0edd41.                                                                                                                          |
| Public CodeQL run 27243840844                                                                                 |    success | CodeQL Analyze passed on a0edd41.                                                                                                                                    |
| gh api repos/OWNER/maintainer-intake/issues                                                                   |          0 | Created public issue #1 for controlled live issue smoke.                                                                                                             |
| GITHUB_TOKEN from gh auth token; node dist/cli/index.js analyze-issue OWNER/maintainer-intake#1 --format json |          0 | Live issue analysis returned kind issue, number 1, status ready_for_review, score 100.                                                                               |
| gh issue close 1                                                                                              |          0 | Closed the live smoke issue with a verification comment.                                                                                                             |
| Temporary branch codex/live-smoke-pr and PR #2                                                                |          0 | Created a controlled docs-only public PR for live pull-request smoke.                                                                                                |
| GITHUB_TOKEN from gh auth token; node dist/cli/index.js analyze-pr OWNER/maintainer-intake#2 --format json    |          0 | Live PR analysis returned kind pull_request, number 2, status needs_author_evidence, score 71.                                                                       |
| gh pr close 2 --delete-branch                                                                                 |          0 | Closed the live smoke PR and deleted the remote branch.                                                                                                              |

## 2026-06-10: npm Publication And v0.1.1 Correction

Purpose:

- Publish the package under the verified npm owner.
- Detect and correct installed-package behavior through the actual package-manager executable.
- Publish and verify the supported patch release.

Commands and events:

| Command or event                                 | Exit/state | Observation                                                                                                |
| ------------------------------------------------ | ---------: | ---------------------------------------------------------------------------------------------------------- |
| npm profile get; npm whoami                      |          0 | npm 2FA and the separate npm publisher account were verified.                                              |
| npm publish --access public                      |          0 | Published `maintainer-intake@0.1.0`; registry smoke then exposed a symlink entrypoint defect.              |
| npm run verify:pack after entrypoint/test repair |          0 | The real `node_modules/.bin/maintainer-intake` executable printed 0.1.1 and analyzed the ready PR fixture. |
| npm run verify                                   |          0 | Full local lane passed on commit `efdf6322f2c7e430877b7a53eaa8f0116d1f9d7f`.                               |
| Public CI 27298546865; CodeQL 27298546835        |    success | Node 22/24 and CodeQL passed on the v0.1.1 release commit.                                                 |
| GitHub release v0.1.1; update v0                 |          0 | Both tags dereference to `efdf6322f2c7e430877b7a53eaa8f0116d1f9d7f`.                                       |
| npm publish --access public                      |          0 | Published `maintainer-intake@0.1.1` as `latest`.                                                           |
| Clean registry install and fixture analysis      |          0 | Installed CLI printed 0.1.1 and returned `ready_for_review` with score 100.                                |
| npm deprecate maintainer-intake@0.1.0            |          0 | Added an upgrade warning directing users to 0.1.1 or later.                                                |
| Evidence docs CI 27298889978; CodeQL 27298889984 |    success | Final evidence-only commit passed public CI and CodeQL.                                                    |

## 2026-06-10: GitHub Account Rename

Purpose:

- Adopt `joseph-217` as the canonical GitHub login after the account rename.
- Normalize all public project references to the canonical GitHub identity.
- Recheck repository access, release continuity, Action references, package metadata, and local commit identity.

Commands and events:

| Command or event                               | Exit/state | Observation                                                                                                      |
| ---------------------------------------------- | ---------: | ---------------------------------------------------------------------------------------------------------------- |
| `gh api user --jq .login`                      |          0 | Returned `joseph-217` for unchanged GitHub user ID `128547272`; no CLI reconnection was required.                |
| Repository API read-back                       |          0 | Canonical repository owner and URL are `joseph-217/maintainer-intake`; admin and push permissions remain active. |
| Product `origin` and repository-local identity |          0 | Remote uses the canonical repository URL; commit email uses `128547272+joseph-217@users.noreply.github.com`.     |
| Release and `v0` ref read-back                 |          0 | Release `v0.1.1` and floating Action tag remain available after the rename.                                      |

## 2026-06-10: v0.1.2 Identity And Evidence Hardening

Purpose:

- Address the source/docs review without adding speculative product scope.
- Make `joseph-217` the single canonical GitHub identity in source and metadata.
- Fix repository policy loading in checkout-free Action runs.
- Reduce false confidence from empty evidence fields and removed CI-risk lines.
- Provide a read-only Action start, permission rationale, and visible packet output.

Commands and events:

| Command or event                                               | Exit/state | Observation                                                                                                                                                                                     |
| -------------------------------------------------------------- | ---------: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GitHub identity, repository, release, and permission read-back |          0 | API identity is `joseph-217`, user ID `128547272`; repository admin/push access and v0.1.1 release continuity remain active.                                                                    |
| npm audit --json                                               |          0 | Zero known vulnerabilities.                                                                                                                                                                     |
| Focused unit, integration, and Action E2E                      |          0 | Empty/placeholder evidence, inline evidence, added-line CI risk, remote config, and step-summary cases passed.                                                                                  |
| npm run verify                                                 |          0 | Format, lint, typecheck, 19 unit tests, 8 integration tests, 16 E2E tests, builds, bundle, packed install, and security checks passed.                                                          |
| Node 22.22.3 and Node 24.16.0 full verification                |          0 | The complete `npm run verify` lane passed under both supported runtime lines.                                                                                                                   |
| npm run verify:pack                                            |          0 | Packed `maintainer-intake@0.1.2` installed cleanly; CLI printed 0.1.2 and analyzed the ready fixture.                                                                                           |
| Canonical identity scan                                        |          0 | Current parent and product files contain the canonical GitHub login and no former login.                                                                                                        |
| Fresh clone at `2126e0e`                                       |          0 | `npm ci`, full Node 24 verification, packed CLI smoke, and clean worktree check passed.                                                                                                         |
| Public CI 27313604092; CodeQL 27313604085                      |    success | Node 22/24 and CodeQL passed on the exact v0.1.2 release commit.                                                                                                                                |
| GitHub release v0.1.2; update v0                               |          0 | Both tags dereference to `2126e0e2e5b8d6f91d343d4caa402a477d192ffd`.                                                                                                                            |
| Controlled issue #3 and Action run 27314861143                 |    success | The released `v0` Action used read-only permissions, loaded default-branch policy without checkout, and emitted a score-100 packet.                                                             |
| npm publish v0.1.2                                             |    pending | Package upload reached npm's web authorization gate; physical security-key approval is still required.                                                                                          |
| Release provenance audit                                       |          0 | A publish attempt from a later evidence commit was canceled before approval; the tagged worktree reproduced the original 55-file tarball with SHA-1 `8a225aeaf8a56622bf04276d26258a9a7ff15ed7`. |

## 2026-06-11: npm Trusted Publishing And v0.1.2 Registry Release

Purpose:

- Replace interactive package publication with repository-bound OIDC trusted publishing.
- Publish the exact v0.1.2 tagged source only after identity and verification gates pass.
- Verify the registry dist-tag, package checksum, installed CLI behavior, and provenance attestation.

Commands and events:

| Command or event                                      | Exit/state | Observation                                                                                                                                                                                               |
| ----------------------------------------------------- | ---------: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm login --auth-type=web`; `npm whoami`             |          0 | Authenticated the separate npm publisher account.                                                                                                                                                         |
| Upgrade npm 11.12.1 to 11.16.0                        |          0 | Added the `--allow-publish` option required for trusted-publisher configurations created after May 20, 2026.                                                                                              |
| `npm trust github ... --allow-publish`                |          0 | Linked package `maintainer-intake` to GitHub repository `joseph-217/maintainer-intake` and workflow `publish.yml` with publish permission.                                                                |
| GitHub Actions publish run 27358247279                |    success | Checked out v0.1.2, verified release identity, installed dependencies, passed the full verification lane, and published through npm OIDC with signed provenance.                                          |
| `npm view maintainer-intake version dist-tags --json` |          0 | Registry returned version 0.1.2 and `latest` 0.1.2.                                                                                                                                                       |
| Registry checksum read-back                           |          0 | SHA-1 `c04f1d17ab6d7963fd1e82f960fe4808ad7a4ccc` and integrity `sha512-N99pldS7gO69Iqs2Wm+6fnqNN+FnNiIJwH7TqcLSaInh785+NXdNR7RBuZOyHxvpt0xR0nqaRZ6H9RJdmyURKA==` matched the workflow's verified package. |
| Clean registry install and fixture analysis           |          0 | Installed CLI printed 0.1.2 and analyzed the ready PR fixture with status `ready_for_review` and score 100.                                                                                               |
| `npm audit signatures`                                |          0 | Clean consumer installation verified registry signatures and package attestations.                                                                                                                        |
