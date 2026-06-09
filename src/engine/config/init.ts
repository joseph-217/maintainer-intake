import YAML from "yaml";
import { DEFAULT_CONFIG, type IntakeConfig } from "./schema.js";

export function generateConfig(
  format: "yaml" | "json" = "yaml",
  config: IntakeConfig = DEFAULT_CONFIG,
): string {
  if (format === "json") {
    return JSON.stringify(config, null, 2) + "\n";
  }
  return YAML.stringify(config);
}

export function generatedPolicyFiles(
  format: "yaml" | "json" = "yaml",
): Record<string, string> {
  const extension = format === "json" ? "json" : "yml";
  const files: Record<string, string> = {};
  files[".github/maintainer-intake." + extension] = generateConfig(format);
  files[".github/PULL_REQUEST_TEMPLATE.md"] = [
    "## Summary",
    "",
    "Describe what changed and why.",
    "",
    "## Linked issue",
    "",
    "Fixes #",
    "",
    "## Tests",
    "",
    "List exact commands run, or explain why tests do not apply.",
    "",
    "## Scope",
    "",
    "State non-goals and review plan for large or risky changes.",
    "",
  ].join("\n");
  files[".github/ISSUE_TEMPLATE/bug_report.yml"] = [
    "name: Bug report",
    "description: Report a reproducible defect",
    "body:",
    "  - type: textarea",
    "    id: reproduction",
    "    attributes:",
    "      label: Reproduction",
    "      description: Steps to reproduce the issue",
    "  - type: textarea",
    "    id: expected-behavior",
    "    attributes:",
    "      label: Expected behavior",
    "  - type: textarea",
    "    id: actual-behavior",
    "    attributes:",
    "      label: Actual behavior",
    "",
  ].join("\n");
  return files;
}
