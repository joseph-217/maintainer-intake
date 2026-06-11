# Changelog

## Unreleased

- Refuse npm publication unless the clean working tree, package version, versioned tag, floating major Action tag, and remote tag targets all identify the same release commit.
- Add a manually dispatched, tokenless npm trusted-publishing workflow with narrow OIDC permissions and release-tag verification.

## 0.1.2

- Load Action configuration from the repository default branch through the GitHub Contents API without checking out contributor code.
- Require non-placeholder content in configured PR sections and issue evidence fields.
- Scan added diff lines, rather than removed lines, for CI-risk indicators and recognize granular write permissions.
- Write the complete intake packet to the GitHub Actions step summary and log.
- Add read-only Action guidance, permission rationale, and before/after packet examples.
- Add a tracked repository policy and read-only self-dogfood workflow.
- Update canonical GitHub links and Action references for the `joseph-217` account rename.
- Derive CLI, MCP, provider, and package-verification versions from `package.json`.

## 0.1.1

- Fix the installed npm executable so CLI commands run correctly through the package-manager symlink.
- Verify packed installs through the actual `node_modules/.bin/maintainer-intake` executable.

## 0.1.0

- Initial release candidate for CLI, MCP, GitHub Action, shared engine, fixtures, and documentation.
