import { minimatch } from "minimatch";
import type { ContributionContext, ContributionFile } from "../types.js";

export function textIncludes(body: string, terms: string[]): boolean {
  const normalized = body.toLowerCase();
  return terms.some((term) => normalized.includes(term.toLowerCase()));
}

export function hasSection(body: string, section: string): boolean {
  const escaped = escapeRegExp(section);
  const heading = new RegExp("(^|\\n)#{1,6}\\s*" + escaped + "\\b", "i");
  const label = new RegExp("(^|\\n)" + escaped + "\\s*:", "i");
  return heading.test(body) || label.test(body);
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

export function patchContains(
  files: ContributionFile[],
  pattern: RegExp,
): boolean {
  return files.some(
    (file) => file.patch !== undefined && pattern.test(file.patch),
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
