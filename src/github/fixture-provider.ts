import { readFile } from "node:fs/promises";
import { z } from "zod";
import { parseConfig } from "../engine/config/schema.js";
import {
  ContributionContextSchema,
  type ContributionContext,
} from "../engine/types.js";

export const FixtureBundleSchema = z
  .object({
    config: z.unknown().optional(),
    context: ContributionContextSchema,
  })
  .strict();

export type FixtureBundle = {
  config?: ReturnType<typeof parseConfig>;
  context: ContributionContext;
};

export async function loadFixtureBundle(path: string): Promise<FixtureBundle> {
  const raw = await readFile(path, "utf8");
  const parsedJson = JSON.parse(raw) as unknown;
  const parsed = FixtureBundleSchema.parse(parsedJson);
  const bundle: FixtureBundle = { context: parsed.context };
  if (parsed.config !== undefined) {
    bundle.config = parseConfig(parsed.config);
  }
  return bundle;
}
