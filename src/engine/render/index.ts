import type { IntakeResult, RuleResult } from "../types.js";

export type RenderFormat = "json" | "markdown" | "comment";

export function renderResult(
  result: IntakeResult,
  format: RenderFormat,
): string {
  if (format === "json") return JSON.stringify(result, null, 2) + "\n";
  if (format === "comment") return renderComment(result);
  return renderMarkdown(result);
}

export function renderMarkdown(result: IntakeResult): string {
  const lines = [
    "# Maintainer Intake Packet",
    "",
    "- Repository: " +
      escapeMarkdown(
        result.context.repository.owner + "/" + result.context.repository.name,
      ),
    "- " +
      (result.context.kind === "pull_request" ? "Pull request" : "Issue") +
      ": #" +
      result.context.number,
    "- Status: " + result.status,
    "- Score: " + result.score,
    "",
    "## Summary",
    "",
    escapeMarkdown(result.packet.summary),
    "",
    "## Missing Evidence",
    "",
  ];

  if (result.missingEvidence.length === 0) {
    lines.push("- None.");
  } else {
    for (const item of result.missingEvidence) {
      lines.push("- " + escapeMarkdown(item));
    }
  }

  lines.push(
    "",
    "## Rule Results",
    "",
    "| Rule | Outcome | Evidence |",
    "|---|---|---|",
  );
  for (const rule of result.rules) {
    lines.push(
      "| " +
        escapeMarkdown(rule.ruleId + " - " + rule.title) +
        " | " +
        rule.outcome +
        " | " +
        escapeMarkdown(ruleEvidence(rule)) +
        " |",
    );
  }

  lines.push(
    "",
    "## Suggested Response",
    "",
    escapeMarkdown(result.packet.suggestedResponse),
    "",
  );
  return lines.join("\n") + "\n";
}

export function renderComment(result: IntakeResult): string {
  return result.writePlan.comment.marker + "\n" + renderMarkdown(result);
}

export function escapeMarkdown(value: string): string {
  return sanitizeText(value).replace(/\|/g, "\\|");
}

export function sanitizeText(value: string): string {
  return value
    .replace(/<!--/g, "<! --")
    .replace(/-->/g, "-- >")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .slice(0, 2000);
}

function ruleEvidence(rule: RuleResult): string {
  if (rule.evidence.length === 0) return "";
  return rule.evidence.join(" ");
}
