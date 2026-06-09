import type { IntakeConfig } from "../config/schema.js";
import type { ContributionContext, RuleResult } from "../types.js";
import { evaluateIssueRules } from "./issue.js";
import { evaluatePullRequestRules } from "./pr.js";

export function evaluateRules(
  context: ContributionContext,
  config: IntakeConfig,
): RuleResult[] {
  if (context.kind === "pull_request") {
    return evaluatePullRequestRules(context, config);
  }
  return evaluateIssueRules(context, config);
}

export function ruleIdsFor(
  context: ContributionContext,
  config: IntakeConfig,
): string[] {
  return evaluateRules(context, config).map((result) => result.ruleId);
}
