import { copyFile, mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { describe, expect, test } from "vitest";

const REPO_ROOT = process.cwd();

describe("release provenance verifier", () => {
  test("accepts the tagged commit and rejects a later commit", async () => {
    const temp = await mkdtemp(join(tmpdir(), "maintainer-intake-release-"));
    const repo = join(temp, "repo");
    const remote = join(temp, "origin.git");
    await mkdir(join(repo, "scripts"), { recursive: true });
    await copyFile(
      join(REPO_ROOT, "scripts", "verify-release-provenance.mjs"),
      join(repo, "scripts", "verify-release-provenance.mjs"),
    );
    await writeFile(join(repo, "package.json"), '{"version":"0.1.2"}\n');

    git(["init", "--initial-branch=main"], repo);
    git(["config", "user.name", "Release Test"], repo);
    git(["config", "user.email", "release@example.invalid"], repo);
    git(["add", "."], repo);
    git(["commit", "-m", "release"], repo);
    git(["tag", "-a", "v0.1.2", "-m", "v0.1.2"], repo);
    git(["tag", "-a", "v0", "-m", "v0"], repo);
    git(["init", "--bare", remote], temp);
    git(["remote", "add", "origin", remote], repo);
    git(["push", "origin", "main", "v0.1.2", "v0"], repo);

    const valid = verify(repo);
    expect(valid.status).toBe(0);
    expect(valid.stdout).toContain("Release provenance verified");

    await writeFile(join(repo, "README.md"), "later documentation\n");
    git(["add", "README.md"], repo);
    git(["commit", "-m", "later docs"], repo);

    const invalid = verify(repo);
    expect(invalid.status).toBe(1);
    expect(invalid.stderr).toContain("does not match v0.1.2");
  });
});

function git(args: string[], cwd: string) {
  const result = spawnSync("git", args, { cwd, encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout);
  }
}

function verify(repo: string) {
  return spawnSync(
    process.execPath,
    [join(repo, "scripts", "verify-release-provenance.mjs")],
    { cwd: repo, encoding: "utf8" },
  );
}
