import { describe, expect, test } from "vitest";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  ConfigError,
  DEFAULT_CONFIG,
  discoverPolicyFiles,
  generateConfig,
  loadConfigFromFile,
  parseConfig,
} from "../../src/engine/index.js";

describe("config schema", () => {
  test("applies deterministic defaults", () => {
    expect(DEFAULT_CONFIG.mode).toBe("advisory");
    expect(DEFAULT_CONFIG.pullRequests.requireLinkedIssue).toBe(true);
    expect(DEFAULT_CONFIG.labels.needsEvidence).toBe("intake:needs-evidence");
  });

  test("rejects unknown keys with a path-aware error", () => {
    expect(() => parseConfig({ version: 1, extra: true })).toThrow(ConfigError);
    try {
      parseConfig({ version: 1, extra: true });
    } catch (error) {
      expect(String((error as Error).message)).toContain("<root>");
    }
  });

  test("rejects empty tool-owned labels", () => {
    expect(() =>
      parseConfig({ version: 1, labels: { needsEvidence: "" } }),
    ).toThrow(ConfigError);
  });

  test("discovers required, optional, and issue-template policy files", async () => {
    const temp = await mkdtemp(join(tmpdir(), "maintainer-intake-policy-"));
    await mkdir(join(temp, ".github", "ISSUE_TEMPLATE"), { recursive: true });
    await writeFile(join(temp, "CONTRIBUTING.md"), "# Contributing\n");
    await writeFile(
      join(temp, ".github", "ISSUE_TEMPLATE", "bug.yml"),
      "name: Bug\n",
    );
    const config = parseConfig({
      version: 1,
      policy: {
        requiredFiles: ["CONTRIBUTING.md", "SECURITY.md"],
        optionalFiles: ["AGENTS.md"],
      },
    });

    const report = await discoverPolicyFiles(temp, config);
    expect(report.files).toContainEqual({
      path: "CONTRIBUTING.md",
      required: true,
      present: true,
      bytes: 15,
    });
    expect(report.missingRequired).toEqual(["SECURITY.md"]);
    expect(report.missingOptional).toEqual(["AGENTS.md"]);
    expect(report.issueForms).toEqual([".github/ISSUE_TEMPLATE/bug.yml"]);
  });

  test("loads config with policy discovery defaults", async () => {
    const temp = await mkdtemp(join(tmpdir(), "maintainer-intake-config-"));
    const path = join(temp, "maintainer-intake.yml");
    await writeFile(path, "version: 1\npolicy:\n  requiredFiles: []\n");
    const config = await loadConfigFromFile(path);
    expect(config.policy.issueTemplateDirectory).toBe(".github/ISSUE_TEMPLATE");
  });

  test("generates YAML and JSON policy files", () => {
    expect(generateConfig("yaml")).toContain("version: 1");
    expect(JSON.parse(generateConfig("json"))).toMatchObject({
      version: 1,
      mode: "advisory",
    });
  });
});
