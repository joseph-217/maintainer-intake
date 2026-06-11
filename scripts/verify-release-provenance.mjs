import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packageJson = JSON.parse(
  readFileSync(resolve(root, "package.json"), "utf8"),
);
const versionTag = `v${packageJson.version}`;
const majorTag = `v${packageJson.version.split(".")[0]}`;

function git(...args) {
  return execFileSync("git", args, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function fail(message) {
  console.error(`Release provenance check failed: ${message}`);
  process.exit(1);
}

function resolveCommit(ref) {
  try {
    return git("rev-parse", `${ref}^{commit}`);
  } catch {
    fail(`required ref ${ref} does not exist locally.`);
  }
}

function remoteCommit(ref) {
  let output;
  try {
    output = git("ls-remote", "origin", ref, `${ref}^{}`);
  } catch {
    fail(`could not read ${ref} from origin.`);
  }

  const lines = output.split("\n").filter(Boolean);
  const peeled = lines.find((line) => line.endsWith(`${ref}^{}`));
  const direct = lines.find((line) => line.endsWith(ref));
  const selected = peeled ?? direct;
  if (!selected) fail(`required ref ${ref} does not exist on origin.`);
  return selected.split(/\s+/)[0];
}

const status = git("status", "--porcelain");
if (status) fail("the working tree is not clean.");

const head = resolveCommit("HEAD");
const versionCommit = resolveCommit(versionTag);
const majorCommit = resolveCommit(majorTag);

if (head !== versionCommit) {
  fail(
    `HEAD ${head} does not match ${versionTag} at ${versionCommit}. Publish from the tagged commit.`,
  );
}
if (majorCommit !== versionCommit) {
  fail(
    `${majorTag} resolves to ${majorCommit}, not ${versionTag} at ${versionCommit}.`,
  );
}

const taggedPackage = JSON.parse(git("show", `${versionTag}:package.json`));
if (taggedPackage.version !== packageJson.version) {
  fail(
    `${versionTag} contains package version ${taggedPackage.version}, not ${packageJson.version}.`,
  );
}

const remoteVersionCommit = remoteCommit(`refs/tags/${versionTag}`);
const remoteMajorCommit = remoteCommit(`refs/tags/${majorTag}`);
if (remoteVersionCommit !== versionCommit) {
  fail(
    `origin/${versionTag} resolves to ${remoteVersionCommit}, not ${versionCommit}.`,
  );
}
if (remoteMajorCommit !== versionCommit) {
  fail(
    `origin/${majorTag} resolves to ${remoteMajorCommit}, not ${versionCommit}.`,
  );
}

console.log(
  `Release provenance verified: package ${packageJson.version}, ${versionTag}, ${majorTag}, HEAD, and origin all resolve to ${versionCommit}.`,
);
