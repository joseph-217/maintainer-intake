import type { IntakeConfig } from "../config/schema.js";
import type { ContributionContext, RuleResult } from "../types.js";
import {
  changedLineCount,
  hasAnyLinkedIssue,
  hasLinkedIssueExemption,
  hasSection,
  hasTestEvidence,
  hasTestExemption,
  isDependencyOnly,
  isDocsOnly,
  isFormattingOnly,
  matchesAnyPath,
  patchContains,
  textIncludes,
} from "./helpers.js";

export function evaluatePullRequestRules(
  context: ContributionContext,
  config: IntakeConfig,
): RuleResult[] {
  if (context.kind !== "pull_request") return [];
  return [
    requiredTemplateSections(context, config),
    linkedIssue(context, config),
    scopeStatement(context),
    testEvidence(context, config),
    behaviorChangeTests(context, config),
    largeChangeReviewPlan(context, config),
    riskyPathEvidence(context, config),
    ciWeakening(context),
    generatedAcknowledgement(context, config),
    changeClassification(context),
  ];
}

function requiredTemplateSections(
  context: ContributionContext,
  config: IntakeConfig,
): RuleResult {
  const missing = config.pullRequests.requiredSections.filter(
    (section) => !hasSection(context.body, section),
  );
  return {
    ruleId: "MI-PR-TEMPLATE",
    title: "Required pull request template sections",
    appliesTo: ["pull_request"],
    severity: "medium",
    outcome: missing.length === 0 ? "pass" : "fail",
    evidence:
      missing.length === 0
        ? ["All configured sections are present."]
        : ["Missing sections: " + missing.join(", ") + "."],
    remediation:
      missing.length === 0
        ? undefined
        : "Add the missing PR template sections: " + missing.join(", ") + ".",
  };
}

function linkedIssue(
  context: ContributionContext,
  config: IntakeConfig,
): RuleResult {
  if (!config.pullRequests.requireLinkedIssue) {
    return {
      ruleId: "MI-PR-LINKED-ISSUE",
      title: "Linked issue",
      appliesTo: ["pull_request"],
      severity: "medium",
      outcome: "not_applicable",
      evidence: ["Linked issue is not required by policy."],
    };
  }

  const hasLink = hasAnyLinkedIssue(context);
  const hasExemption = hasLinkedIssueExemption(context.body);
  return {
    ruleId: "MI-PR-LINKED-ISSUE",
    title: "Linked issue or documented exemption",
    appliesTo: ["pull_request"],
    severity: "medium",
    outcome: hasLink || hasExemption ? "pass" : "fail",
    evidence: hasLink
      ? ["A linked issue reference was found."]
      : hasExemption
        ? ["A linked-issue exemption was documented."]
        : ["No linked issue or exemption was found."],
    remediation:
      hasLink || hasExemption
        ? undefined
        : "Link the issue this PR resolves, or document why no linked issue is needed.",
  };
}

function scopeStatement(context: ContributionContext): RuleResult {
  const hasScope = textIncludes(context.body, [
    "what changed",
    "why",
    "out of scope",
    "non-goal",
    "non-goals",
  ]);
  return {
    ruleId: "MI-PR-SCOPE",
    title: "Change scope and intent",
    appliesTo: ["pull_request"],
    severity: "medium",
    outcome: hasScope ? "pass" : "fail",
    evidence: hasScope
      ? ["Scope or intent language was found."]
      : ["Scope, why, or non-goal language was not found."],
    remediation: hasScope
      ? undefined
      : "State what changed, why it changed, and what is out of scope.",
  };
}

function testEvidence(
  context: ContributionContext,
  config: IntakeConfig,
): RuleResult {
  if (!config.pullRequests.requireTestEvidence) {
    return {
      ruleId: "MI-PR-TEST-EVIDENCE",
      title: "Test evidence",
      appliesTo: ["pull_request"],
      severity: "medium",
      outcome: "not_applicable",
      evidence: ["Test evidence is not required by policy."],
    };
  }

  const hasEvidence = hasTestEvidence(context.body);
  const hasExemption = hasTestExemption(context.body);
  return {
    ruleId: "MI-PR-TEST-EVIDENCE",
    title: "Exact tests run or justified exemption",
    appliesTo: ["pull_request"],
    severity: "blocking",
    outcome: hasEvidence || hasExemption ? "pass" : "fail",
    evidence: hasEvidence
      ? ["A test command was found in the PR body."]
      : hasExemption
        ? ["A test exemption was documented."]
        : ["No exact test command or exemption was found."],
    remediation:
      hasEvidence || hasExemption
        ? undefined
        : "List the exact test commands run, or explain why tests do not apply.",
  };
}

function behaviorChangeTests(
  context: ContributionContext,
  config: IntakeConfig,
): RuleResult {
  const codeFiles = context.files.filter(
    (file) => !/(^docs\/|\.md$|\.mdx$|\.lock$)/i.test(file.path),
  );
  if (codeFiles.length === 0) {
    return {
      ruleId: "MI-PR-BEHAVIOR-TESTS",
      title: "Behavior change test evidence",
      appliesTo: ["pull_request"],
      severity: "medium",
      outcome: "not_applicable",
      evidence: ["No code-like files changed."],
    };
  }

  const mentionsBehavior = textIncludes(context.body, [
    "behavior",
    "fix",
    "feature",
    "change",
  ]);
  const hasEvidence =
    hasTestEvidence(context.body) || hasTestExemption(context.body);
  return {
    ruleId: "MI-PR-BEHAVIOR-TESTS",
    title: "Behavior change is backed by tests",
    appliesTo: ["pull_request"],
    severity: "medium",
    outcome:
      !mentionsBehavior ||
      hasEvidence ||
      !config.pullRequests.requireTestEvidence
        ? "pass"
        : "fail",
    evidence: hasEvidence
      ? ["Behavior-related change includes test evidence or exemption."]
      : mentionsBehavior
        ? ["Behavior-related language was found without test evidence."]
        : ["No explicit behavior-change claim was found."],
    remediation:
      !mentionsBehavior ||
      hasEvidence ||
      !config.pullRequests.requireTestEvidence
        ? undefined
        : "Add test evidence for the behavior change, or explain why no test applies.",
  };
}

function largeChangeReviewPlan(
  context: ContributionContext,
  config: IntakeConfig,
): RuleResult {
  const changed = changedLineCount(context.files);
  const overThreshold = changed > config.pullRequests.largeChangeThreshold;
  if (!overThreshold) {
    return {
      ruleId: "MI-PR-LARGE-CHANGE",
      title: "Large change review plan",
      appliesTo: ["pull_request"],
      severity: "low",
      outcome: "pass",
      evidence: [
        "Changed line count " +
          changed +
          " is within threshold " +
          config.pullRequests.largeChangeThreshold +
          ".",
      ],
    };
  }

  const hasPlan = textIncludes(context.body, [
    "review plan",
    "split",
    "phased",
    "large change",
  ]);
  return {
    ruleId: "MI-PR-LARGE-CHANGE",
    title: "Large change review plan",
    appliesTo: ["pull_request"],
    severity: "high",
    outcome: hasPlan ? "warn" : "fail",
    evidence: hasPlan
      ? [
          "Changed line count " +
            changed +
            " exceeds threshold, and review-plan language was found.",
        ]
      : [
          "Changed line count " +
            changed +
            " exceeds threshold " +
            config.pullRequests.largeChangeThreshold +
            ".",
        ],
    remediation: hasPlan
      ? "Maintainer should inspect the proposed review plan."
      : "Provide a review plan or split recommendation for this large change.",
  };
}

function riskyPathEvidence(
  context: ContributionContext,
  config: IntakeConfig,
): RuleResult {
  const missing: string[] = [];
  const matched: string[] = [];

  for (const risky of config.pullRequests.riskyPaths) {
    const files = matchesAnyPath(context.files, risky.pattern);
    if (files.length === 0) continue;
    matched.push(
      risky.pattern +
        " (" +
        files.length +
        " file" +
        (files.length === 1 ? "" : "s") +
        ")",
    );
    for (const requirement of risky.require) {
      if (!textIncludes(context.body, [requirement])) {
        missing.push(requirement + " for " + risky.pattern);
      }
    }
  }

  if (matched.length === 0) {
    return {
      ruleId: "MI-PR-RISKY-PATH",
      title: "Risky path evidence",
      appliesTo: ["pull_request"],
      severity: "high",
      outcome: "not_applicable",
      evidence: ["No configured risky paths changed."],
    };
  }

  return {
    ruleId: "MI-PR-RISKY-PATH",
    title: "Risky path evidence",
    appliesTo: ["pull_request"],
    severity: "high",
    outcome: missing.length === 0 ? "pass" : "fail",
    evidence:
      missing.length === 0
        ? ["Matched risky paths: " + matched.join(", ") + "."]
        : ["Missing risky-path evidence: " + missing.join(", ") + "."],
    remediation:
      missing.length === 0
        ? undefined
        : "Add risky-path evidence: " + missing.join(", ") + ".",
  };
}

function ciWeakening(context: ContributionContext): RuleResult {
  const workflowFiles = matchesAnyPath(context.files, ".github/workflows/**");
  const suspiciousPatch = patchContains(
    context.files,
    /skip|continue-on-error:\s*true|pull_request_target|permissions:\s*write/i,
  );
  const removedTests = context.files.some(
    (file) =>
      file.status === "removed" && /test|spec|__tests__/i.test(file.path),
  );

  if (workflowFiles.length === 0 && !suspiciousPatch && !removedTests) {
    return {
      ruleId: "MI-PR-CI-WEAKENING",
      title: "CI or test weakening indicators",
      appliesTo: ["pull_request"],
      severity: "high",
      outcome: "pass",
      evidence: [
        "No CI or test weakening indicator was found in metadata or patches.",
      ],
    };
  }

  return {
    ruleId: "MI-PR-CI-WEAKENING",
    title: "CI or test weakening indicators",
    appliesTo: ["pull_request"],
    severity: "high",
    outcome: "warn",
    evidence: [
      workflowFiles.length > 0
        ? String(workflowFiles.length) + " workflow file(s) changed."
        : "No workflow file path changed.",
      suspiciousPatch
        ? "Patch contains CI-risk keywords."
        : "No CI-risk keyword found.",
      removedTests
        ? "A test-like file was removed."
        : "No removed test-like file found.",
    ],
    remediation:
      "Maintainer should inspect CI and test changes before relying on the packet.",
  };
}

function generatedAcknowledgement(
  context: ContributionContext,
  config: IntakeConfig,
): RuleResult {
  if (!config.pullRequests.requireGeneratedAcknowledgement) {
    return {
      ruleId: "MI-PR-GENERATED-ACK",
      title: "Generated-work accountability acknowledgement",
      appliesTo: ["pull_request"],
      severity: "low",
      outcome: "not_applicable",
      evidence: ["Generated-work acknowledgement is not required by policy."],
    };
  }

  const hasAck = textIncludes(context.body, [
    "i am accountable",
    "i reviewed",
    "generated",
    "ai-assisted",
  ]);
  return {
    ruleId: "MI-PR-GENERATED-ACK",
    title: "Generated-work accountability acknowledgement",
    appliesTo: ["pull_request"],
    severity: "medium",
    outcome: hasAck ? "pass" : "fail",
    evidence: hasAck
      ? ["Accountability acknowledgement was found."]
      : ["No configured generated-work acknowledgement was found."],
    remediation: hasAck
      ? undefined
      : "Acknowledge responsibility for generated or assisted work according to repository policy.",
  };
}

function changeClassification(context: ContributionContext): RuleResult {
  let classification = "mixed";
  if (isDocsOnly(context.files)) classification = "docs-only";
  else if (isDependencyOnly(context.files)) classification = "dependency-only";
  else if (isFormattingOnly(context.body)) classification = "formatting-only";

  return {
    ruleId: "MI-PR-CLASSIFICATION",
    title: "Change classification",
    appliesTo: ["pull_request"],
    severity: "info",
    outcome: "pass",
    evidence: ["Classified change as " + classification + "."],
  };
}
