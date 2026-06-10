# Maintainer Intake

Deterministic contribution-intake checks for open-source maintainers.

[![CI](https://github.com/joseph-217/maintainer-intake/actions/workflows/ci.yml/badge.svg)](https://github.com/joseph-217/maintainer-intake/actions/workflows/ci.yml)
[![CodeQL](https://github.com/joseph-217/maintainer-intake/actions/workflows/codeql.yml/badge.svg)](https://github.com/joseph-217/maintainer-intake/actions/workflows/codeql.yml)
[![npm](https://img.shields.io/npm/v/maintainer-intake)](https://www.npmjs.com/package/maintainer-intake)

Maintainer Intake validates whether an issue or pull request contains the evidence a maintainer needs before review time is spent. It checks repository policy, templates, scope, tests, risky paths, and security-sensitive reports, then produces a concise packet for comments, checks, labels, gates, CLI use, or MCP clients.

It does not detect authorship. It evaluates evidence and accountability.

Maintainer Intake is an evidence linter, not semantic review. It verifies that configured sections contain non-placeholder content and that recognizable evidence such as test commands is present. It does not prove that a claim is true, a test is sufficient, or a change is safe; maintainers remain the decision-makers.

## What Maintainers See

A low-context PR such as `This changes CI behavior.` becomes a specific repair list:

```text
Status: needs_author_evidence
Score: 17

Missing evidence:
- Add meaningful content to Summary, Linked issue, Tests, and Scope.
- List the exact test commands run, or explain why tests do not apply.
- Provide a review plan for this large change.
- Add security-impact evidence for the changed workflow.

Risk flag:
- CI or test weakening indicators
```

After the contributor supplies the configured evidence, the same engine reports `ready_for_review`. See [the unready packet](examples/packet-needs-evidence.md) and [the ready packet](examples/packet-ready.md) for complete output.

## Install

Run without installing globally:

    npx --yes maintainer-intake@0.1.2 --version
    npx --yes maintainer-intake@0.1.2 init

Or install the CLI globally:

    npm install --global maintainer-intake@0.1.2

## 60-second fixture demo

    npm ci
    npm run build
    node dist/cli/index.js analyze-pr --fixture fixtures/github/pr-ready.json --format markdown
    node dist/cli/index.js analyze-pr --fixture fixtures/github/pr-unready.json --format json

## CLI

    maintainer-intake init
    maintainer-intake init --write
    maintainer-intake policy doctor --config .github/maintainer-intake.yml
    maintainer-intake analyze-pr --fixture fixtures/github/pr-ready.json --format json
    maintainer-intake analyze-issue --fixture fixtures/github/issue-bug-ready.json --format markdown

Live GitHub reads use OWNER/REPO#NUMBER and require GITHUB_TOKEN or GH_TOKEN.

## GitHub Action

Start with read-only advisory evaluation:

```yaml
permissions:
  contents: read
  pull-requests: read
  issues: read

steps:
  - uses: joseph-217/maintainer-intake@v0
    with:
      mode: advisory
      comment: false
      labels: false
```

This evaluates and writes the packet to the Action log and step summary without modifying the pull request or issue. See [the Action guide](docs/github-action.md) for opt-in comments, labels, checks, permission rationale, rollback, and safe event guidance.

This repository dogfoods the same read-only workflow in [`.github/workflows/maintainer-intake.yml`](.github/workflows/maintainer-intake.yml).

## MCP

Run the stdio MCP server with:

    maintainer-intake mcp

The MCP server exposes analyze_pr_intake, analyze_issue_intake, render_maintainer_packet, generate_policy_files, and explain_intake_config.

See docs/mcp.md for an `npx`-based MCP client configuration.

## Statuses And Modes

Statuses:

- ready_for_review
- needs_author_evidence
- needs_maintainer_decision
- reject_recommended

Modes:

- advisory: never fails because evidence is missing.
- check: emits check-run intent.
- label: emits configured label intent.
- gate: fails only when required evidence is missing.

## Verification

The full local lane is:

    npm run verify

The package and Action release gates include bundle rebuild, tarball audit, packed install, security scan, and fixture E2E.

## License

MIT
