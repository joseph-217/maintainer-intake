# Premortem

Status: rechecked for GitHub v0.1.2; npm v0.1.2 activation remains open.

This premortem records risks that must be controlled before implementation and rechecked before release.

## Tiger Risks

| Risk                                                                | Mitigation                                                                                                                                                   | Falsifiable verification                                                                                                                            |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| The product becomes a generic GitHub API wrapper.                   | Keep the engine centered on contribution evidence, repository policy, and maintainer packets. Provider adapters only normalize data and execute write plans. | Rule registry contains evidence and policy checks; docs describe intake readiness rather than generic GitHub administration.                        |
| A privileged Action executes untrusted contributor code.            | Use GitHub API metadata and diffs only under privileged events. Do not check out contributor heads or run contributor scripts.                               | Static security test scans workflows and source for unsafe checkout or execution under `pull_request_target`; Action harness runs without checkout. |
| CLI, MCP, and Action grow separate rule implementations.            | Place rules, statuses, render data, and write plans in `src/engine/`; adapters stay thin.                                                                    | Search for rule IDs outside `src/engine/`; parity tests compare adapters on shared fixtures.                                                        |
| Outputs imply AI detection or unsupported security certainty.       | Evaluate evidence and accountability only. Avoid probability, authorship, and exploitability claims.                                                         | Snapshot tests and source/docs scans reject authorship-detection and unsupported certainty language.                                                |
| Documentation works only on paper.                                  | Derive examples from verified CLI help, config generation, MCP tool schemas, Action metadata, and fixture outputs.                                           | Public docs commands are run from the built package and packed install.                                                                             |
| Private planning or local-only material leaks into the public repo. | Keep product repo history fresh; do not copy parent planning files; scan files and full history before push and release.                                     | File and git-history scans for private markers, parent paths, and local-only filenames pass before remote write and before release.                 |

## Paper Tiger Risks

| Risk                                                            | Why it is manageable                                                | Verification                                                                                     |
| --------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| MCP complexity slows the release.                               | MCP is a thin stdio adapter over the shared engine.                 | MCP tests assert protocol behavior and CLI parity without duplicating rules.                     |
| Optional LLM support distracts from deterministic requirements. | No model integration is required for v0.1.                          | Dependency and source scans show no model credential requirement; tests pass without model keys. |
| Marketplace listing is unavailable at release.                  | GitHub release and Action tag are sufficient for v0.1 distribution. | Release docs list marketplace listing as optional activation, not a completed requirement.       |

## Elephant Risks

| Risk                                                             | Mitigation                                                                                                   | Verification                                                                                                                                        |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| A new public repository does not prove adoption.                 | Do not fabricate adoption. Ship useful docs, examples, and honest release evidence.                          | Public docs and final report avoid usage, star, download, or adoption claims unless verified.                                                       |
| npm package ownership or installed CLI behavior is not verified. | Treat npm publish as a separate activation gate and execute the package-manager binary from a clean install. | Version 0.1.2 passed packed-install verification; registry publication and clean registry installation remain required after security-key approval. |
