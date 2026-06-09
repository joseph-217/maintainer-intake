import { z } from "zod";
import { ModeSchema } from "./config/schema.js";

export const ContributionKindSchema = z.enum(["pull_request", "issue"]);
export type ContributionKind = z.infer<typeof ContributionKindSchema>;

export const ContributionFileSchema = z
  .object({
    path: z.string().min(1),
    previousPath: z.string().optional(),
    status: z
      .enum([
        "added",
        "modified",
        "removed",
        "renamed",
        "copied",
        "changed",
        "unchanged",
      ])
      .default("modified"),
    additions: z.number().int().nonnegative().default(0),
    deletions: z.number().int().nonnegative().default(0),
    patch: z.string().optional(),
    isBinary: z.boolean().default(false),
    truncated: z.boolean().default(false),
  })
  .strict();

export type ContributionFile = z.infer<typeof ContributionFileSchema>;

export const ContributionContextSchema = z
  .object({
    kind: ContributionKindSchema,
    repository: z
      .object({
        owner: z.string().min(1),
        name: z.string().min(1),
        defaultBranch: z.string().default("main"),
        isFork: z.boolean().default(false),
      })
      .strict(),
    number: z.number().int().positive(),
    title: z.string().default(""),
    body: z.string().default(""),
    author: z
      .object({
        login: z.string().default("unknown"),
        association: z.string().default("NONE"),
      })
      .strict()
      .default({ login: "unknown", association: "NONE" }),
    labels: z.array(z.string()).default([]),
    comments: z
      .array(
        z
          .object({
            id: z.union([z.string(), z.number()]).optional(),
            author: z.string().optional(),
            body: z.string().default(""),
          })
          .strict(),
      )
      .default([]),
    files: z.array(ContributionFileSchema).default([]),
    linkedIssues: z.array(z.number().int().positive()).default([]),
    metadata: z.record(z.string(), z.unknown()).default({}),
  })
  .strict();

export type ContributionContext = z.infer<typeof ContributionContextSchema>;
export type ContributionContextInput = z.input<
  typeof ContributionContextSchema
>;

export const RuleOutcomeSchema = z.enum([
  "pass",
  "fail",
  "warn",
  "not_applicable",
  "error",
]);
export type RuleOutcome = z.infer<typeof RuleOutcomeSchema>;

export const RuleSeveritySchema = z.enum([
  "info",
  "low",
  "medium",
  "high",
  "blocking",
]);
export type RuleSeverity = z.infer<typeof RuleSeveritySchema>;

export const IntakeStatusSchema = z.enum([
  "ready_for_review",
  "needs_author_evidence",
  "needs_maintainer_decision",
  "reject_recommended",
]);
export type IntakeStatus = z.infer<typeof IntakeStatusSchema>;

export const RuleResultSchema = z
  .object({
    ruleId: z.string().min(1),
    title: z.string().min(1),
    appliesTo: z.array(ContributionKindSchema),
    severity: RuleSeveritySchema,
    outcome: RuleOutcomeSchema,
    evidence: z.array(z.string()).default([]),
    remediation: z.string().optional(),
    statusHint: IntakeStatusSchema.optional(),
  })
  .strict();

export type RuleResult = z.infer<typeof RuleResultSchema>;

export const WritePlanSchema = z
  .object({
    mode: ModeSchema,
    comment: z
      .object({
        enabled: z.boolean(),
        marker: z.string(),
      })
      .strict(),
    check: z
      .object({
        enabled: z.boolean(),
        name: z.string(),
        conclusion: z.enum(["success", "failure", "neutral", "skipped"]),
      })
      .strict(),
    labels: z
      .object({
        add: z.array(z.string()),
        remove: z.array(z.string()),
      })
      .strict(),
    gate: z
      .object({
        fail: z.boolean(),
        exitCode: z.number().int().min(0).max(4),
      })
      .strict(),
  })
  .strict();

export type WritePlan = z.infer<typeof WritePlanSchema>;

export const MaintainerPacketSchema = z
  .object({
    summary: z.string(),
    checklist: z.array(z.string()),
    riskFlags: z.array(z.string()),
    suggestedResponse: z.string(),
    labels: z.array(z.string()),
  })
  .strict();

export type MaintainerPacket = z.infer<typeof MaintainerPacketSchema>;

export const IntakeResultSchema = z
  .object({
    schemaVersion: z.literal("maintainer-intake.result.v1"),
    status: IntakeStatusSchema,
    score: z.number().int().min(0).max(100),
    mode: ModeSchema,
    context: ContributionContextSchema.pick({
      kind: true,
      repository: true,
      number: true,
      title: true,
    }),
    rules: z.array(RuleResultSchema),
    missingEvidence: z.array(z.string()),
    riskFlags: z.array(z.string()),
    packet: MaintainerPacketSchema,
    writePlan: WritePlanSchema,
    diagnostics: z.array(z.string()).default([]),
  })
  .strict();

export type IntakeResult = z.infer<typeof IntakeResultSchema>;
