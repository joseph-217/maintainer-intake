# Current Build Research

Checked: 2026-06-09

This product artifact records dependency and tooling choices used during the build. It avoids private planning context and should remain safe for public history.

## Primary Source Refresh

- GitHub Actions metadata supports JavaScript Actions with runs.using set to node24; the Action will target Node 24.
- GitHub's Actions changelog records Node 20 deprecation and migration pressure toward Node 24.
- The MCP TypeScript SDK repository currently describes v2 as pre-alpha and recommends v1.x for production use until stable v2 ships.
- npm documentation describes unscoped packages as public packages; maintainer-intake remains the preferred unscoped package name unless a publish gate proves it unavailable.

## Package Metadata Checks

The following versions were selected from live npm view checks on 2026-06-09:

| Package                   | Version | Use                              |
| ------------------------- | ------: | -------------------------------- |
| @modelcontextprotocol/sdk |  1.29.0 | MCP stdio server                 |
| @octokit/rest             |  22.0.1 | Live GitHub REST provider        |
| @actions/core             |   3.0.1 | GitHub Action inputs/outputs     |
| @actions/github           |   9.1.1 | GitHub Action context/client     |
| zod                       |   4.4.3 | Boundary schemas                 |
| commander                 |  15.0.0 | CLI parser                       |
| yaml                      |   2.9.0 | Config read/write                |
| minimatch                 |  10.2.5 | Deterministic path matching      |
| vitest                    |   4.1.8 | Unit, integration, and E2E tests |
| typescript                |   6.0.3 | Type checking                    |
| tsup                      |   8.5.1 | Package build                    |
| @vercel/ncc               |  0.44.0 | Action bundle                    |
| tsx                       |  4.22.4 | TypeScript process harnesses     |
| prettier                  |   3.8.4 | Format check                     |

## Local Action Harness Decision

@github/local-action@7.0.1 was checked but removed before commit because npm audit reported transitive vulnerabilities through older Action dependencies. The Action slice will use a custom local harness around sanitized event payloads and the bundled entrypoint. This is the documented closest substitute for local Action dogfood.

## Current Audit State

After removing @github/local-action, npm audit --json reported zero vulnerabilities.

## Node Runtime Note

The default local shell currently runs Node 25, but required Node lines are available through explicit npm exec --package node@24 -- node -v and npm exec --package node@22 -- node -v checks. Final verification must run explicit Node 22/24 lanes or pin a local runtime before publication.
