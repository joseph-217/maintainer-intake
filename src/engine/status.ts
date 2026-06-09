import type { IntakeConfig } from "./config/schema.js";
import type { IntakeStatus, RuleResult, WritePlan } from "./types.js";

const COMMENT_MARKER = "<!-- maintainer-intake:comment:v1 -->";

export function computeStatus(results: RuleResult[]): IntakeStatus {
  if (results.some((result) => result.outcome === "error")) {
    return "needs_maintainer_decision";
  }

  if (results.some((result) => result.statusHint === "reject_recommended")) {
    return "reject_recommended";
  }

  const hasBlockingFailure = results.some(
    (result) =>
      result.outcome === "fail" &&
      ["blocking", "high", "medium"].includes(result.severity),
  );
  if (hasBlockingFailure) {
    return "needs_author_evidence";
  }

  if (results.some((result) => result.outcome === "warn")) {
    return "needs_maintainer_decision";
  }

  return "ready_for_review";
}

export function computeScore(results: RuleResult[]): number {
  const applicable = results.filter(
    (result) => result.outcome !== "not_applicable",
  );
  if (applicable.length === 0) {
    return 100;
  }

  const earned = applicable.reduce((score, result) => {
    if (result.outcome === "pass") return score + 1;
    if (result.outcome === "warn") return score + 0.5;
    return score;
  }, 0);

  return Math.max(
    0,
    Math.min(100, Math.round((earned / applicable.length) * 100)),
  );
}

export function missingEvidence(results: RuleResult[]): string[] {
  return results
    .filter((result) => result.outcome === "fail" || result.outcome === "error")
    .map((result) => result.remediation ?? result.title);
}

export function riskFlags(results: RuleResult[]): string[] {
  return results
    .filter(
      (result) =>
        (result.outcome === "fail" ||
          result.outcome === "warn" ||
          result.outcome === "error") &&
        ["high", "blocking"].includes(result.severity),
    )
    .map((result) => result.title);
}

export function createWritePlan(
  config: IntakeConfig,
  status: IntakeStatus,
): WritePlan {
  const notReady = status !== "ready_for_review";
  const labelToAdd =
    status === "ready_for_review"
      ? config.labels.ready
      : status === "needs_maintainer_decision"
        ? config.labels.maintainerDecision
        : config.labels.needsEvidence;

  const labelsToRemove = [
    config.labels.ready,
    config.labels.needsEvidence,
    config.labels.maintainerDecision,
  ].filter((label) => label !== labelToAdd);

  const checkConclusion =
    config.mode === "advisory"
      ? "neutral"
      : status === "ready_for_review"
        ? "success"
        : config.mode === "gate"
          ? "failure"
          : "neutral";

  return {
    mode: config.mode,
    comment: {
      enabled: true,
      marker: COMMENT_MARKER,
    },
    check: {
      enabled: config.mode === "check" || config.mode === "gate",
      name: "Maintainer Intake",
      conclusion: checkConclusion,
    },
    labels: {
      add:
        config.mode === "label" || config.mode === "gate" ? [labelToAdd] : [],
      remove:
        config.mode === "label" || config.mode === "gate" ? labelsToRemove : [],
    },
    gate: {
      fail: config.mode === "gate" && notReady,
      exitCode: config.mode === "gate" && notReady ? 1 : 0,
    },
  };
}
