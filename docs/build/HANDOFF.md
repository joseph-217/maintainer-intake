# Handoff

## Current State

`maintainer-intake` is implemented, locally verified, publicly pushed, and release-ready.

Public repository: https://github.com/asdgjshjdfkjsurehjg/maintainer-intake

## Last Completed Acceptance Rows

- Local verification, no-token verification, explicit Node 22/24 verification, packed-install verification, and fresh-clone verification have passed.
- Public repository settings, topics, security settings, branch protection, workflow activation, CI, and CodeQL have been read back.
- The first public CI failure was fixed by sanitizing runner file-command environment variables in the Action E2E harness.

## Current Branch And Commit

- Branch: `main`
- Latest pushed commit before this handoff update: `cb7d98b4b74c5e430cccc1e9d4162b4883b5d30c`

## Commands Last Run

| Command                                           | Exit/state | Observation                                                                    |
| ------------------------------------------------- | ---------: | ------------------------------------------------------------------------------ |
| `npm run verify`                                  |          0 | Full local verification passed after the Action harness fix and audit updates. |
| `npm exec --package node@22 -- node --run verify` |          0 | Full verification passed under Node 22.22.3.                                   |
| `npm exec --package node@24 -- node --run verify` |          0 | Full verification passed under Node 24.16.0.                                   |
| Fresh clone, `npm ci`, Node 24 verify             |          0 | Fresh clone installed cleanly and passed full verification.                    |
| Public CI run 27243147472                         |    success | CI passed on the public repository.                                            |
| Public CodeQL run 27243147473                     |    success | CodeQL passed on the public repository.                                        |

## Known Blockers

- npm publication is pending npm authentication. `npm whoami` returned `ENEEDAUTH`.

## GitHub Publication State

The repository is public, pushed, and configured. See `artifacts/verification/github-settings.md` for the settings audit.

## npm Publication State

The package name returned `E404` from npm registry lookup, but no publication was attempted because npm auth is absent.

## Resume Command

From the product repository root:

```bash
git status --short
gh run list --repo asdgjshjdfkjsurehjg/maintainer-intake --limit 5
```

Before release, wait for public CI and CodeQL to pass on the final report commit, then tag `v0.1.0`, create/update `v0`, and create the GitHub release.
