import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { describe, expect, test } from "vitest";
import packageJson from "../../package.json" with { type: "json" };

const REPO_ROOT = process.cwd();
const CLI = [
  join(REPO_ROOT, "node_modules", "tsx", "dist", "cli.mjs"),
  join(REPO_ROOT, "src", "cli", "index.ts"),
];

describe("CLI process behavior", () => {
  test("prints help and version", () => {
    expect(run(["--help"]).stdout).toContain("maintainer-intake");
    expect(run(["--version"]).stdout.trim()).toBe(packageJson.version);
  });

  test("previews init output and writes idempotently", async () => {
    const temp = await mkdtemp(join(tmpdir(), "maintainer-intake-init-"));
    const preview = run(["init"], temp);
    expect(preview.status).toBe(0);
    expect(preview.stdout).toContain("version: 1");

    const write = run(["init", "--write"], temp);
    expect(write.status).toBe(0);
    expect(JSON.parse(write.stdout).written).toContain(
      ".github/maintainer-intake.yml",
    );

    const second = run(["init", "--write"], temp);
    expect(second.status).toBe(0);
    expect(JSON.parse(second.stdout).unchanged).toContain(
      ".github/maintainer-intake.yml",
    );
  });

  test("refuses to overwrite a conflicting generated file", async () => {
    const temp = await mkdtemp(join(tmpdir(), "maintainer-intake-conflict-"));
    await mkdir(join(temp, ".github"), { recursive: true });
    await writeFile(
      join(temp, ".github", "maintainer-intake.yml"),
      "version: 1\nmode: gate\n",
      {
        flag: "wx",
      },
    );
    const result = run(["init", "--write"], temp);
    expect(result.status).toBe(2);
    expect(result.stderr).toContain("Refusing to overwrite differing file");
  });

  test("diagnoses valid and invalid policy", () => {
    const valid = run([
      "policy",
      "doctor",
      "--config",
      "fixtures/config/valid.yml",
      "--format",
      "json",
    ]);
    expect(valid.status).toBe(0);
    expect(JSON.parse(valid.stdout).valid).toBe(true);

    const invalid = run([
      "policy",
      "doctor",
      "--config",
      "fixtures/config/invalid.yml",
    ]);
    expect(invalid.status).toBe(2);
    expect(invalid.stderr).toContain("unknownTopLevel");
  });

  test("analyzes pull request and issue fixtures", () => {
    const ready = run([
      "analyze-pr",
      "--fixture",
      "fixtures/github/pr-ready.json",
      "--format",
      "json",
    ]);
    expect(ready.status).toBe(0);
    expect(JSON.parse(ready.stdout).status).toBe("ready_for_review");

    const unready = run([
      "analyze-pr",
      "--fixture",
      "fixtures/github/pr-unready.json",
      "--format",
      "comment",
    ]);
    expect(unready.status).toBe(1);
    expect(unready.stdout).toContain("maintainer-intake:comment:v1");

    const issue = run([
      "analyze-issue",
      "--fixture",
      "fixtures/github/issue-feature-unready.json",
    ]);
    expect(issue.status).toBe(0);
    expect(issue.stdout).toContain("needs_author_evidence");
  });

  test("returns provider exit code for live analysis without a token", () => {
    const result = run(["analyze-pr", "octo/example#1"], process.cwd(), {
      GITHUB_TOKEN: "",
      GH_TOKEN: "",
    });
    expect(result.status).toBe(3);
    expect(result.stderr).toContain("requires GITHUB_TOKEN or GH_TOKEN");
  });

  test("returns internal invariant exit code for malformed fixture JSON", async () => {
    const temp = await mkdtemp(
      join(tmpdir(), "maintainer-intake-bad-fixture-"),
    );
    const fixture = join(temp, "fixture.json");
    await writeFile(fixture, "{not json");
    const result = run(["analyze-pr", "--fixture", fixture]);
    expect(result.status).toBe(4);
    expect(result.stderr).toContain("JSON");
  });
});

function run(
  args: string[],
  cwd = process.cwd(),
  env: Record<string, string> = {},
) {
  return spawnSync(process.execPath, CLI.concat(args), {
    cwd,
    encoding: "utf8",
    env: { ...process.env, ...env },
  });
}
