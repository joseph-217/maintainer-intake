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

After publication, install the exact version in a clean temporary directory and run both `maintainer-intake --version` and a fixture analysis through `node_modules/.bin/maintainer-intake`.
