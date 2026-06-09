import { describe, expect, test } from "vitest";
import {
  DEFAULT_CONFIG,
  evaluateContribution,
  parseConfig,
  renderResult,
} from "../../src/engine/index.js";
import ready from "../../fixtures/github/pr-ready.json" with { type: "json" };
import unready from "../../fixtures/github/pr-unready.json" with { type: "json" };
import bug from "../../fixtures/github/issue-bug-ready.json" with { type: "json" };
import feature from "../../fixtures/github/issue-feature-unready.json" with { type: "json" };
import security from "../../fixtures/github/issue-security-sensitive.json" with { type: "json" };

describe("shared engine", () => {
  test("marks a ready PR as ready for review", () => {
    const result = evaluateContribution(ready.context, DEFAULT_CONFIG);
    expect(result.status).toBe("ready_for_review");
    expect(
      result.rules.find((rule) => rule.ruleId === "MI-PR-TEST-EVIDENCE")
        ?.outcome,
    ).toBe("pass");
  });

  test("marks an unready gated PR as failing with write-plan effects", () => {
    const config = parseConfig(unready.config);
    const result = evaluateContribution(unready.context, config);
    expect(result.status).toBe("needs_author_evidence");
    expect(result.writePlan.gate).toEqual({ fail: true, exitCode: 1 });
    expect(result.writePlan.labels.add).toContain("intake:needs-evidence");
  });

  test("evaluates bug and feature issue evidence", () => {
    expect(evaluateContribution(bug.context, DEFAULT_CONFIG).status).toBe(
      "ready_for_review",
    );
    expect(evaluateContribution(feature.context, DEFAULT_CONFIG).status).toBe(
      "needs_author_evidence",
    );
  });

  test("routes security-sensitive issues without echoing the body", () => {
    const result = evaluateContribution(security.context, DEFAULT_CONFIG);
    expect(result.status).toBe("reject_recommended");
    const markdown = renderResult(result, "markdown");
    expect(markdown).not.toContain("crafted header");
    expect(markdown).toContain("Security-sensitive report routing");
  });

  test("renders a stable comment marker", () => {
    const result = evaluateContribution(ready.context, DEFAULT_CONFIG);
    expect(renderResult(result, "comment")).toContain(
      "<!-- maintainer-intake:comment:v1 -->",
    );
  });
});
