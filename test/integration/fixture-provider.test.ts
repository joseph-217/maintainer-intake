import { describe, expect, test } from "vitest";
import { evaluateContribution, loadFixtureBundle } from "../../src/index.js";

describe("fixture provider", () => {
  test("loads a fixture bundle and evaluates it", async () => {
    const bundle = await loadFixtureBundle("fixtures/github/pr-ready.json");
    const result = evaluateContribution(bundle.context, bundle.config);
    expect(result.schemaVersion).toBe("maintainer-intake.result.v1");
    expect(result.status).toBe("ready_for_review");
  });
});
