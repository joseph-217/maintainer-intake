# Final Verification Report

Status: GitHub and npm v0.1.2 releases verified.

This report records the completed local, package, public repository, live-provider, GitHub release, trusted-publishing, and npm registry gates for maintainer-intake v0.1.2.

## Final Product Commit

- Supported implementation and GitHub release commit: 2126e0e2e5b8d6f91d343d4caa402a477d192ffd
- Trusted-publishing workflow commit: 8964d5ef5bfbb017a10c74aa82e78659254132f0
- Public repository: https://github.com/joseph-217/maintainer-intake
- Release URL: https://github.com/joseph-217/maintainer-intake/releases/tag/v0.1.2
- Floating Action tag: v0

The v0.1.2 and v0 tags dereference to 2126e0e2e5b8d6f91d343d4caa402a477d192ffd.

## Public Repository

- GitHub owner: joseph-217
- Visibility: public
- Default branch: main
- Description: Deterministic contribution-intake checks for open-source maintainers.
- License: MIT
- Issues: enabled
- Discussions: enabled
- Wiki: disabled
- Projects: disabled

## Public CI State

The v0.1.2 release commit passed public CI and CodeQL:

- CI run: https://github.com/joseph-217/maintainer-intake/actions/runs/27313604092
- CodeQL run: https://github.com/joseph-217/maintainer-intake/actions/runs/27313604085

The evidence documentation commit also passed:

- CI run: https://github.com/joseph-217/maintainer-intake/actions/runs/27298889978
- CodeQL run: https://github.com/joseph-217/maintainer-intake/actions/runs/27298889984

The documentation completion audit commit passed:

- CI run: https://github.com/joseph-217/maintainer-intake/actions/runs/27303902232
- CodeQL run: https://github.com/joseph-217/maintainer-intake/actions/runs/27303902220

The trusted-publishing workflow commit passed:

- CI run: https://github.com/joseph-217/maintainer-intake/actions/runs/27315788322
- CodeQL run: https://github.com/joseph-217/maintainer-intake/actions/runs/27315788306

The npm publish workflow completed successfully:

- Publish run: https://github.com/joseph-217/maintainer-intake/actions/runs/27358247279
- Tagged source: v0.1.2 at 2126e0e2e5b8d6f91d343d4caa402a477d192ffd
- Authentication: npm trusted publishing with GitHub Actions OIDC; no long-lived publish token
- Provenance: signed statement published to the Sigstore transparency log at https://search.sigstore.dev/?logIndex=1790852120

## Verification Commands

Local and package gates passed:

- npm run verify
- env -u GITHUB_TOKEN -u GH_TOKEN -u OPENAI_API_KEY -u NPM_TOKEN -u NODE_AUTH_TOKEN npm run verify
- npm exec --package node@22 -- node --run verify
- npm exec --package node@24 -- node --run verify
- fresh clone to /tmp, npm ci, Node 24 node --run verify, and clean clone status
- documented CLI/config dogfood commands
- security-sensitive output absence check
- authored-file hardcoded secret-value scan
- product file and history privacy scans

## Live Provider Smoke

- Public issue smoke: issue #1 was created, analyzed live with analyze-issue, returned kind issue, number 1, status ready_for_review, score 100, then was closed.
- Public PR smoke: PR #2 was created from a temporary branch, analyzed live with analyze-pr, returned kind pull_request, number 2, status needs_author_evidence, score 71, then was closed and the branch was deleted.

## Acceptance Matrix Summary

Verified:

- Shared deterministic engine, CLI, MCP, and GitHub Action adapters.
- Policy discovery through policy doctor, including required files, optional files, and issue forms.
- Provider normalization for linked issues, renamed files, binary files, and omitted patches.
- Action harness coverage for supported issue events and advisory, check, label, and gate modes.
- MCP protocol-safe error behavior and CLI/MCP parity for shared fixtures.
- Package tarball allowlist, packed install, and CLI smoke.
- Public docs, examples, community files, and security docs.
- No-token fixture verification.
- Node 22 and Node 24 runtime verification.
- Fresh-clone verification.
- Public repository creation under the approved owner.
- Metadata, topics, merge settings, branch protection, security settings, workflow activation, CI, CodeQL, and settings-audit read-backs.
- Checkout-free repository policy loading through the GitHub Contents API.
- Non-placeholder evidence validation and added-line-only CI-risk scanning.
- Read-only Action guidance and complete packet output in the Actions step summary.
- Live released-Action dogfood on issue #3.

No product release blockers remain. Marketplace listing remains optional, and adoption must not be fabricated.

## GitHub Settings Audit

Sanitized read-back is saved in artifacts/verification/github-settings.md.

Unsupported or account-dependent settings:

- Private vulnerability reporting mutation returned success, but the REST repository read-back field was null. The project records the mutation result without overstating read-back status.
- Secret scanning non-provider patterns and validity checks read back disabled.

## npm Publication State

- Package: https://www.npmjs.com/package/maintainer-intake
- npm ownership: verified through the separate npm publisher account
- `latest`: `0.1.2`
- Registry SHA-1: `c04f1d17ab6d7963fd1e82f960fe4808ad7a4ccc`
- Registry integrity: `sha512-N99pldS7gO69Iqs2Wm+6fnqNN+FnNiIJwH7TqcLSaInh785+NXdNR7RBuZOyHxvpt0xR0nqaRZ6H9RJdmyURKA==`
- The registry values match the package produced and verified inside publish run 27358247279.
- A clean registry install ran `node_modules/.bin/maintainer-intake --version`, returned `0.1.2`, and analyzed the ready-PR fixture with status `ready_for_review` and score 100.
- `npm audit signatures` verified registry signatures and attestations for the clean consumer installation.
- Version `0.1.0` is deprecated with an upgrade warning because its installed CLI did not launch through npm symlinks.

## Privacy And History Scan

Current-file and product git-history scans found no private planning markers, parent paths, or local-only application file names before public push and before release correction.

## Intentionally Ignored Or Untracked Files

None in the product repository at the last clean-state check.
