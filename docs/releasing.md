# Releasing

Release checklist:

    npm ci
    npm run verify
    npm run build
    npm run build:action
    npm run verify:bundle
    npm run verify:pack
    npm run verify:security

Before a GitHub release:

1. Confirm the working tree is clean.
2. Confirm the Action bundle rebuild has zero diff.
3. Confirm package tarball contents and packed-install smoke pass.
4. Confirm public documentation commands pass.
5. Confirm public history contains no private files, tokens, or local-only material.
6. Confirm public CI is green.

GitHub release:

    VERSION=0.1.2
    git tag -a "v${VERSION}" -m "v${VERSION}"
    git tag -fa v0 -m "v0" "v${VERSION}^{}"
    git push origin "v${VERSION}"
    git push origin v0 --force

npm publication is a separate gate. Do not publish unless npm auth, name ownership, and registry install verification have passed:

    npm whoami
    npm run verify:release-provenance
    npm publish --access public
    npm view maintainer-intake dist-tags --json

`npm publish` runs the provenance verifier automatically through `prepublishOnly`. It refuses publication unless the working tree is clean and `HEAD`, `vX.Y.Z`, the floating `vX` Action tag, and both remote tags resolve to the same commit. Build and publish from a clean checkout of the versioned tag; do not publish from a later documentation commit.

For tokenless CI publication, configure npm trusted publishing for GitHub repository `joseph-217/maintainer-intake` and workflow filename `publish.yml`, with `npm publish` allowed. npm has required an explicit allowed action for new trusted-publisher configurations since May 20, 2026, so use an npm CLI whose `npm trust github --help` includes `--allow-publish` (verified with npm 11.16.0):

    npm trust github maintainer-intake \
      --file publish.yml \
      --repo joseph-217/maintainer-intake \
      --allow-publish \
      --yes

Then dispatch **Publish npm** with the exact annotated version tag. The workflow uses a GitHub-hosted runner, grants only `contents: read` and `id-token: write`, checks tag/package/major-tag identity, runs the full verification lane, and publishes using npm's short-lived OIDC credential.

After publication, install the exact version in a clean temporary directory and run both `maintainer-intake --version` and a fixture analysis through `node_modules/.bin/maintainer-intake`.
