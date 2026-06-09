import { describe, expect, test } from "vitest";
import {
  ConfigError,
  DEFAULT_CONFIG,
  generateConfig,
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

  test("generates YAML and JSON policy files", () => {
    expect(generateConfig("yaml")).toContain("version: 1");
    expect(JSON.parse(generateConfig("json"))).toMatchObject({
      version: 1,
      mode: "advisory",
    });
  });
});
