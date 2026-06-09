import { z } from "zod";

export const ModeSchema = z.enum(["advisory", "check", "label", "gate"]);
export type IntakeMode = z.infer<typeof ModeSchema>;

export const RiskyPathSchema = z
  .object({
    pattern: z.string().min(1),
    require: z.array(z.string().min(1)).default([]),
  })
  .strict();

export const PullRequestConfigSchema = z
  .object({
    requireLinkedIssue: z.boolean().default(true),
    requireTestEvidence: z.boolean().default(true),
    requireGeneratedAcknowledgement: z.boolean().default(false),
    largeChangeThreshold: z.number().int().positive().default(500),
    requiredSections: z
      .array(z.string().min(1))
      .default(["Summary", "Linked issue", "Tests", "Scope"]),
    riskyPaths: z
      .array(RiskyPathSchema)
      .default([
        { pattern: ".github/workflows/**", require: ["security-impact"] },
      ]),
  })
  .strict();

export const IssueTypeConfigSchema = z
  .object({
    require: z.array(z.string().min(1)).default([]),
  })
  .strict();

export const IssueConfigSchema = z
  .object({
    bug: IssueTypeConfigSchema.default({
      require: ["reproduction", "expected-behavior", "actual-behavior"],
    }),
    feature: IssueTypeConfigSchema.default({
      require: ["use-case", "non-goals"],
    }),
    security: IssueTypeConfigSchema.default({
      require: ["affected-version", "component", "impact", "reproduction"],
    }),
    duplicateSearch: z.boolean().default(false),
  })
  .strict();

export const LabelConfigSchema = z
  .object({
    ready: z.string().default("intake:ready"),
    needsEvidence: z.string().default("intake:needs-evidence"),
    maintainerDecision: z.string().default("intake:maintainer-decision"),
  })
  .strict();

const DEFAULT_PULL_REQUEST_CONFIG = {
  requireLinkedIssue: true,
  requireTestEvidence: true,
  requireGeneratedAcknowledgement: false,
  largeChangeThreshold: 500,
  requiredSections: ["Summary", "Linked issue", "Tests", "Scope"],
  riskyPaths: [
    { pattern: ".github/workflows/**", require: ["security-impact"] },
  ],
};

const DEFAULT_ISSUE_CONFIG = {
  bug: { require: ["reproduction", "expected-behavior", "actual-behavior"] },
  feature: { require: ["use-case", "non-goals"] },
  security: {
    require: ["affected-version", "component", "impact", "reproduction"],
  },
  duplicateSearch: false,
};

const DEFAULT_LABEL_CONFIG = {
  ready: "intake:ready",
  needsEvidence: "intake:needs-evidence",
  maintainerDecision: "intake:maintainer-decision",
};

export const IntakeConfigSchema = z
  .object({
    version: z.literal(1),
    mode: ModeSchema.default("advisory"),
    pullRequests: PullRequestConfigSchema.default(DEFAULT_PULL_REQUEST_CONFIG),
    issues: IssueConfigSchema.default(DEFAULT_ISSUE_CONFIG),
    labels: LabelConfigSchema.default(DEFAULT_LABEL_CONFIG),
  })
  .strict();

export type IntakeConfig = z.infer<typeof IntakeConfigSchema>;

export const DEFAULT_CONFIG: IntakeConfig = IntakeConfigSchema.parse({
  version: 1,
});

export class ConfigError extends Error {
  readonly exitCode = 2;

  constructor(message: string) {
    super(message);
    this.name = "ConfigError";
  }
}

export function formatConfigError(error: z.ZodError): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.length > 0 ? issue.path.join(".") : "<root>";
      return path + ": " + issue.message;
    })
    .join("\n");
}

export function parseConfig(input: unknown): IntakeConfig {
  const parsed = IntakeConfigSchema.safeParse(input);
  if (!parsed.success) {
    throw new ConfigError(formatConfigError(parsed.error));
  }
  return parsed.data;
}
