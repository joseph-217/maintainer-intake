import { minimatch } from "minimatch";
import type { ContributionContext, ContributionFile } from "../types.js";

export function textIncludes(body: string, terms: string[]): boolean {
  const normalized = body.toLowerCase();
  return terms.some((term) => normalized.includes(term.toLowerCase()));
}

export function hasSectionContent(body: string, section: string): boolean {
  const lines = body.split(/\r?\n/);
  const escaped = escapeRegExp(section.trim().replace(/[-_]+/g, " "));
  const heading = new RegExp("^#{1,6}\\s*" + escaped + "\\s*#*\\s*$", "i");
  const label = new RegExp("^\\s*" + escaped + "\\s*:\\s*(.*)$", "i");

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index] ?? "";
    const labelMatch = line.match(label);
    if (labelMatch) {
      const block = [labelMatch[1] ?? ""];
      for (let cursor = index + 1; cursor < lines.length; cursor += 1) {
        const candidate = lines[cursor] ?? "";
        if (
          /^#{1,6}\s+/.test(candidate) ||
          /^\s*[\w][\w -]*:\s*/.test(candidate)
        ) {
          break;
        }
        block.push(candidate);
      }
      if (hasMeaningfulContent(block.join("\n"))) return true;
    }

    if (heading.test(line)) {
      const block: string[] = [];
      for (let cursor = index + 1; cursor < lines.length; cursor += 1) {
        const candidate = lines[cursor] ?? "";
        if (/^#{1,6}\s+/.test(candidate)) break;
        block.push(candidate);
      }
      if (hasMeaningfulContent(block.join("\n"))) return true;
    }
  }

  return false;
}

export function hasEvidenceField(body: string, field: string): boolean {
  const label = field.trim().replace(/[-_]+/g, " ");
  if (hasSectionContent(body, label)) return true;

  const escaped = escapeRegExp(label);
  const inline = new RegExp(
    "(?:^|[\\n.!?]\\s*)" +
      escaped +
      "\\s*:\\s*([\\s\\S]*?)(?=\\s+[A-Za-z][A-Za-z0-9 _-]{1,40}:|$)",
    "i",
  );
  const match = body.match(inline);
  return match ? hasMeaningfulContent(match[1] ?? "") : false;
}

function hasMeaningfulContent(value: string): boolean {
  const normalized = value
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/^\s*[-*]\s*\[[ xX]\]\s*/gm, " ")
    .replace(/[`*_>#]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!/[\p{L}\p{N}]/u.test(normalized)) return false;
  return !/^(?:n\/?a|none|todo|tbd|no response|not provided|placeholder|fill this in)[.!]?$/i.test(
    normalized,
  );
}

export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^$()|[\]\\{}]/g, "\\$&");
}

export function hasAnyLinkedIssue(context: ContributionContext): boolean {
  if (context.linkedIssues.length > 0) return true;
  return /(?:fixe[sd]?|close[sd]?|resolve[sd]?|refs?)\s+#\d+|\b#\d+\b/i.test(
    context.body,
  );
}

export function hasLinkedIssueExemption(body: string): boolean {
  return /(?:no linked issue|no issue|issue not required|exempt(?:ion)?|not applicable|n\/a)\s*[:-]?\s*\S+/i.test(
    body,
  );
}

export function hasTestEvidence(body: string): boolean {
  return /(npm|pnpm|yarn|bun)\s+(run\s+)?(test|verify|lint|typecheck|build)|pytest|go test|cargo test|mvn test|gradle test|swift test|xcodebuild|dotnet test/i.test(
    body,
  );
}

export function hasTestExemption(body: string): boolean {
  return /tests?\s+(?:not applicable|n\/a|not run because|not needed because|manual only)|no tests?\s+(?:because|needed)/i.test(
    body,
  );
}

export function changedLineCount(files: ContributionFile[]): number {
  return files.reduce(
    (total, file) => total + file.additions + file.deletions,
    0,
  );
}

export function matchesAnyPath(
  files: ContributionFile[],
  pattern: string,
): ContributionFile[] {
  return files.filter((file) => minimatch(file.path, pattern, { dot: true }));
}

export function isDocsOnly(files: ContributionFile[]): boolean {
  return (
    files.length > 0 &&
    files.every((file) => /(^docs\/|\.md$|\.mdx$)/i.test(file.path))
  );
}

export function isDependencyOnly(files: ContributionFile[]): boolean {
  return (
    files.length > 0 &&
    files.every((file) =>
      /(package-lock\.json|package\.json|pnpm-lock\.yaml|yarn\.lock|go\.sum|go\.mod|Cargo\.lock)$/i.test(
        file.path,
      ),
    )
  );
}

export function isFormattingOnly(body: string): boolean {
  return /formatting only|formatter only|prettier|gofmt|rustfmt/i.test(body);
}

export function addedPatchContains(
  files: ContributionFile[],
  pattern: RegExp,
): boolean {
  return files.some((file) =>
    file.patch
      ?.split(/\r?\n/)
      .filter((line) => line.startsWith("+") && !line.startsWith("+++"))
      .some((line) => pattern.test(line.slice(1))),
  );
}

export function classifyIssue(
  context: ContributionContext,
): "bug" | "feature" | "security" | "unknown" {
  const haystack = (
    context.title +
    "\n" +
    context.body +
    "\n" +
    context.labels.join(" ")
  ).toLowerCase();
  if (
    /\b(security|vulnerability|cve|exploit|secret|credential|xss|csrf|rce)\b/.test(
      haystack,
    )
  ) {
    return "security";
  }
  if (/\b(feature|enhancement|proposal|request)\b/.test(haystack)) {
    return "feature";
  }
  if (/\b(bug|defect|regression|crash|broken|error)\b/.test(haystack)) {
    return "bug";
  }
  return "unknown";
}
