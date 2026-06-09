import { spawnSync } from "node:child_process";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

const REPO_ROOT = process.cwd();
const ACTION = [
  join(REPO_ROOT, "node_modules", "tsx", "dist", "cli.mjs"),
  join(REPO_ROOT, "src", "action", "index.ts"),
];

describe("GitHub Action harness", () => {
  test("runs fixture pull request in dry-run gate mode", async () => {
    const eventPath = await writeEvent("pull_request_target");
    const result = runAction({
      GITHUB_EVENT_NAME: "pull_request_target",
      GITHUB_EVENT_PATH: eventPath,
      INPUT_MODE: "gate",
      INPUT_COMMENT: "true",
      INPUT_LABELS: "true",
      INPUT_CHECK_NAME: "Maintainer Intake",
      INPUT_TOKEN: "",
      MAINTAINER_INTAKE_DRY_RUN: "true",
      MAINTAINER_INTAKE_FIXTURE: join(
        REPO_ROOT,
        "fixtures/github/pr-unready.json",
      ),
    });
    expect(result.status).toBe(1);
    expect(result.stdout).toContain("status");
    expect(result.stdout).toContain("needs_author_evidence");
    expect(result.stdout).toContain("Dry-run write plan");
  });

  test("returns neutral output for unsupported events", async () => {
    const eventPath = await writeEvent("push");
    const result = runAction({
      GITHUB_EVENT_NAME: "push",
      GITHUB_EVENT_PATH: eventPath,
      INPUT_MODE: "advisory",
      INPUT_TOKEN: "",
      MAINTAINER_INTAKE_DRY_RUN: "true",
    });
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("unsupported_event");
  });
});

async function writeEvent(eventName: string): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "maintainer-intake-action-"));
  const path = join(dir, "event.json");
  const payload = {
    action: "opened",
    repository: {
      name: "example",
      default_branch: "main",
      owner: { login: "octo" },
    },
    pull_request:
      eventName === "pull_request_target"
        ? {
            number: 43,
            title: "Change build workflow",
            body: "This changes CI behavior.",
            user: { login: "new-contributor" },
            head: { sha: "abc123", repo: { fork: true } },
          }
        : undefined,
  };
  await writeFile(path, JSON.stringify(payload), "utf8");
  return path;
}

function runAction(env: Record<string, string>) {
  return spawnSync(process.execPath, ACTION, {
    cwd: REPO_ROOT,
    encoding: "utf8",
    env: { ...process.env, ...env },
  });
}
