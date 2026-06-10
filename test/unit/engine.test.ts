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

  test("does not accept empty or placeholder PR template sections", () => {
    const context = {
      ...ready.context,
      body: [
        "## Summary",
        "<!-- describe the change -->",
        "## Linked issue",
        "Fixes #41",
        "## Tests",
        "TBD",
        "## Scope",
        "Out of scope: performance tuning.",
      ].join("\n\n"),
    };
    const result = evaluateContribution(context, DEFAULT_CONFIG);
    const template = result.rules.find(
      (rule) => rule.ruleId === "MI-PR-TEMPLATE",
    );
    expect(template?.outcome).toBe("fail");
    expect(template?.evidence.join(" ")).toContain("Summary");
    expect(template?.evidence.join(" ")).toContain("Tests");
  });

  test("does not flag a removed CI-risk setting as newly introduced", () => {
    const context = {
      ...ready.context,
      files: [
        {
          path: "src/config.ts",
          status: "modified" as const,
          additions: 1,
          deletions: 1,
          patch: "-continue-on-error: true\n+continue-on-error: false",
        },
      ],
    };
    const result = evaluateContribution(context, DEFAULT_CONFIG);
    expect(
      result.rules.find((rule) => rule.ruleId === "MI-PR-CI-WEAKENING")
        ?.outcome,
    ).toBe("pass");
  });

  test("flags newly added write permissions outside workflow files", () => {
    const context = {
      ...ready.context,
      files: [
        {
          path: "config/action-policy.yml",
          status: "modified" as const,
          additions: 1,
          deletions: 0,
          patch: "+contents: write",
        },
      ],
    };
    const result = evaluateContribution(context, DEFAULT_CONFIG);
    const weakening = result.rules.find(
      (rule) => rule.ruleId === "MI-PR-CI-WEAKENING",
    );
    expect(weakening?.outcome).toBe("warn");
    expect(weakening?.evidence).toContain(
      "Added patch lines contain CI-risk indicators.",
    );
  });

  test("computes advisory, check, label, and gate write plans deterministically", () => {
    const expectations = {
      advisory: { exitCode: 0, check: false, labels: [] },
      check: { exitCode: 0, check: true, labels: [] },
      label: { exitCode: 0, check: false, labels: ["intake:needs-evidence"] },
      gate: { exitCode: 1, check: true, labels: ["intake:needs-evidence"] },
    } as const;

    for (const [mode, expected] of Object.entries(expectations)) {
      const config = parseConfig({ ...unready.config, mode });
      const result = evaluateContribution(unready.context, config);
      expect(result.writePlan.gate.exitCode).toBe(expected.exitCode);
      expect(result.writePlan.check.enabled).toBe(expected.check);
      expect(result.writePlan.labels.add).toEqual(expected.labels);
    }
  });

  test("evaluates bug and feature issue evidence", () => {
    expect(evaluateContribution(bug.context, DEFAULT_CONFIG).status).toBe(
      "ready_for_review",
    );
    expect(evaluateContribution(feature.context, DEFAULT_CONFIG).status).toBe(
      "needs_author_evidence",
    );
  });

  test("requires values instead of bare issue evidence field names", () => {
    const context = {
      ...bug.context,
      body: "Bug report mentioning reproduction, expected behavior, and actual behavior.",
    };
    const result = evaluateContribution(context, DEFAULT_CONFIG);
    expect(result.status).toBe("needs_author_evidence");
    expect(
      result.rules.find((rule) => rule.ruleId === "MI-ISSUE-BUG-EVIDENCE")
        ?.outcome,
    ).toBe("fail");
  });

  test("accepts labeled inline issue evidence values", () => {
    const result = evaluateContribution(security.context, DEFAULT_CONFIG);
    const routing = result.rules.find(
      (rule) => rule.ruleId === "MI-ISSUE-SECURITY-ROUTING",
    );
    expect(routing?.evidence).toContain(
      "Required security evidence fields appear to be present.",
    );
  });

  test("routes security-sensitive issues without echoing the body", () => {
    const result = evaluateContribution(security.context, DEFAULT_CONFIG);
    expect(result.status).toBe("reject_recommended");
    const markdown = renderResult(result, "markdown");
    expect(markdown).not.toContain("crafted header");
    expect(markdown).toContain("Security-sensitive report routing");
  });

  test("keeps duplicate lookup advisory when provider evidence is unavailable", () => {
    const config = parseConfig({
      version: 1,
      issues: { duplicateSearch: true },
    });
    const result = evaluateContribution(feature.context, config);
    expect(
      result.rules.find(
        (rule) => rule.ruleId === "MI-ISSUE-DUPLICATE-CANDIDATES",
      )?.outcome,
    ).toBe("warn");
  });

  test("renders a stable comment marker", () => {
    const result = evaluateContribution(ready.context, DEFAULT_CONFIG);
    expect(renderResult(result, "comment")).toContain(
      "<!-- maintainer-intake:comment:v1 -->",
    );
  });

  test("sanitizes hidden comments and table separators in rendered content", () => {
    const result = evaluateContribution(ready.context, DEFAULT_CONFIG);
    const unsafe = {
      ...result,
      packet: {
        ...result.packet,
        summary: "<!-- injected --> maintainer | packet",
        suggestedResponse: "Do not break <!-- marker --> comments | tables",
      },
    };
    const markdown = renderResult(unsafe, "markdown");
    expect(markdown).not.toContain("<!-- injected -->");
    expect(markdown).not.toContain("<!-- marker -->");
    expect(markdown).toContain("<! -- injected -- >");
    expect(markdown).toContain("\\|");
  });
});
