import type { IntakeConfig } from "./config/schema.js";
import { DEFAULT_CONFIG } from "./config/schema.js";
import { evaluateRules } from "./rules/registry.js";
import {
  computeScore,
  computeStatus,
  createWritePlan,
  missingEvidence,
  riskFlags,
} from "./status.js";
import {
  ContributionContextSchema,
  IntakeResultSchema,
  type ContributionContext,
  type IntakeResult,
  type MaintainerPacket,
  type RuleResult,
} from "./types.js";

export * from "./config/init.js";
export * from "./config/load.js";
export * from "./config/schema.js";
export * from "./render/index.js";
export * from "./rules/registry.js";
export * from "./types.js";
export * from "./policy/discovery.js";

export function evaluateContribution(
  rawContext: unknown,
  config: IntakeConfig = DEFAULT_CONFIG,
): IntakeResult {
  const context = ContributionContextSchema.parse(rawContext);
  const rules = evaluateRules(context, config);
  const status = computeStatus(rules);
  const score = computeScore(rules);
  const missing = missingEvidence(rules);
  const risks = riskFlags(rules);
  const packet = createPacket(rules, missing, risks);
  const writePlan = createWritePlan(config, status);

  return IntakeResultSchema.parse({
    schemaVersion: "maintainer-intake.result.v1",
    status,
    score,
    mode: config.mode,
    context: {
      kind: context.kind,
      repository: context.repository,
      number: context.number,
      title: context.title,
    },
    rules,
    missingEvidence: missing,
    riskFlags: risks,
    packet,
    writePlan,
    diagnostics: [],
  });
}

function createPacket(
  rules: RuleResult[],
  missing: string[],
  risks: string[],
): MaintainerPacket {
  const failed = rules.filter(
    (result) => result.outcome === "fail" || result.outcome === "error",
  );
  const warned = rules.filter((result) => result.outcome === "warn");
  const summary =
    failed.length === 0 && warned.length === 0
      ? "Contribution has the required intake evidence for maintainer review."
      : "Contribution needs attention: " +
        failed.length +
        " failing rule(s), " +
        warned.length +
        " warning(s).";

  const suggestedResponse =
    missing.length === 0
      ? "Thanks for the clear submission. The intake checks found the expected evidence, so this looks ready for maintainer review."
      : [
          "Thanks for the contribution. Before a maintainer spends review time, please add the missing evidence below.",
        ]
          .concat(missing.map((item) => "- " + item))
          .join("\n");

  return {
    summary,
    checklist: missing.length > 0 ? missing : ["No missing evidence detected."],
    riskFlags: risks,
    suggestedResponse,
    labels: failed.length === 0 ? ["intake:ready"] : ["intake:needs-evidence"],
  };
}
