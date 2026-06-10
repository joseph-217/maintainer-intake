import type { IntakeConfig } from "../config/schema.js";
import type { ContributionContext, RuleResult } from "../types.js";
import { classifyIssue, hasEvidenceField } from "./helpers.js";

export function evaluateIssueRules(
  context: ContributionContext,
  config: IntakeConfig,
): RuleResult[] {
  if (context.kind !== "issue") return [];
  const type = classifyIssue(context);
  return [
    issueClassification(type),
    bugEvidence(context, config, type),
    featureEvidence(context, config, type),
    securityRouting(context, config, type),
    duplicateCandidates(context, config),
  ];
}

function issueClassification(
  type: "bug" | "feature" | "security" | "unknown",
): RuleResult {
  return {
    ruleId: "MI-ISSUE-CLASSIFICATION",
    title: "Issue type classification",
    appliesTo: ["issue"],
    severity: type === "unknown" ? "low" : "info",
    outcome: type === "unknown" ? "warn" : "pass",
    evidence: ["Classified issue as " + type + "."],
    remediation:
      type === "unknown"
        ? "Add a bug, feature, or security label or template signal."
        : undefined,
  };
}

function bugEvidence(
  context: ContributionContext,
  config: IntakeConfig,
  type: string,
): RuleResult {
  if (type !== "bug") {
    return {
      ruleId: "MI-ISSUE-BUG-EVIDENCE",
      title: "Bug report evidence",
      appliesTo: ["issue"],
      severity: "medium",
      outcome: "not_applicable",
      evidence: ["Issue is not classified as a bug."],
    };
  }

  const missing = config.issues.bug.require.filter(
    (field) => !hasEvidenceField(context.body, field),
  );
  return {
    ruleId: "MI-ISSUE-BUG-EVIDENCE",
    title: "Bug report evidence",
    appliesTo: ["issue"],
    severity: "blocking",
    outcome: missing.length === 0 ? "pass" : "fail",
    evidence:
      missing.length === 0
        ? ["Required bug evidence fields were found."]
        : ["Missing bug evidence: " + missing.join(", ") + "."],
    remediation:
      missing.length === 0
        ? undefined
        : "Add bug evidence fields: " + missing.join(", ") + ".",
  };
}

function featureEvidence(
  context: ContributionContext,
  config: IntakeConfig,
  type: string,
): RuleResult {
  if (type !== "feature") {
    return {
      ruleId: "MI-ISSUE-FEATURE-EVIDENCE",
      title: "Feature request evidence",
      appliesTo: ["issue"],
      severity: "medium",
      outcome: "not_applicable",
      evidence: ["Issue is not classified as a feature request."],
    };
  }

  const missing = config.issues.feature.require.filter(
    (field) => !hasEvidenceField(context.body, field),
  );
  return {
    ruleId: "MI-ISSUE-FEATURE-EVIDENCE",
    title: "Feature request evidence",
    appliesTo: ["issue"],
    severity: "medium",
    outcome: missing.length === 0 ? "pass" : "fail",
    evidence:
      missing.length === 0
        ? ["Required feature evidence fields were found."]
        : ["Missing feature evidence: " + missing.join(", ") + "."],
    remediation:
      missing.length === 0
        ? undefined
        : "Add feature evidence fields: " + missing.join(", ") + ".",
  };
}

function securityRouting(
  context: ContributionContext,
  config: IntakeConfig,
  type: string,
): RuleResult {
  if (type !== "security") {
    return {
      ruleId: "MI-ISSUE-SECURITY-ROUTING",
      title: "Security-sensitive report routing",
      appliesTo: ["issue"],
      severity: "high",
      outcome: "not_applicable",
      evidence: ["Issue is not classified as security-sensitive."],
    };
  }

  const missing = config.issues.security.require.filter(
    (field) => !hasEvidenceField(context.body, field),
  );
  return {
    ruleId: "MI-ISSUE-SECURITY-ROUTING",
    title: "Security-sensitive report routing",
    appliesTo: ["issue"],
    severity: "blocking",
    outcome: "fail",
    statusHint: "reject_recommended",
    evidence: [
      "Security-sensitive keywords were detected; issue body content is intentionally not echoed.",
      missing.length === 0
        ? "Required security evidence fields appear to be present."
        : "Missing security evidence fields: " + missing.join(", ") + ".",
    ],
    remediation:
      "Route security-sensitive reports to the private process documented in SECURITY.md.",
  };
}

function duplicateCandidates(
  context: ContributionContext,
  config: IntakeConfig,
): RuleResult {
  if (!config.issues.duplicateSearch) {
    return {
      ruleId: "MI-ISSUE-DUPLICATE-CANDIDATES",
      title: "Duplicate candidate lookup",
      appliesTo: ["issue"],
      severity: "low",
      outcome: "not_applicable",
      evidence: ["Duplicate lookup is disabled by policy."],
    };
  }

  const candidates = Array.isArray(context.metadata["duplicateCandidates"])
    ? (context.metadata["duplicateCandidates"] as unknown[])
    : undefined;

  if (!candidates) {
    return {
      ruleId: "MI-ISSUE-DUPLICATE-CANDIDATES",
      title: "Duplicate candidate lookup",
      appliesTo: ["issue"],
      severity: "low",
      outcome: "warn",
      evidence: ["Duplicate lookup was enabled but unavailable."],
      remediation:
        "Treat duplicate detection as advisory only and continue triage manually.",
    };
  }

  return {
    ruleId: "MI-ISSUE-DUPLICATE-CANDIDATES",
    title: "Duplicate candidate lookup",
    appliesTo: ["issue"],
    severity: "low",
    outcome: candidates.length > 0 ? "warn" : "pass",
    evidence: ["Duplicate candidate count: " + candidates.length + "."],
    remediation:
      candidates.length > 0
        ? "Review duplicate candidates before requesting new evidence."
        : undefined,
  };
}
