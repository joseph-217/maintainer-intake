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
const LOCAL_ACTION_ENV = {
  GITHUB_OUTPUT: "",
  GITHUB_STATE: "",
  GITHUB_ENV: "",
  GITHUB_PATH: "",
  GITHUB_STEP_SUMMARY: "",
};

describe("GitHub Action harness", () => {
  test.each([
    ["advisory", 0, '"mode":"advisory"'],
    ["check", 0, '"enabled":true'],
    ["label", 0, '"add":["intake:needs-evidence"]'],
    ["gate", 1, '"exitCode":1'],
  ])(
    "runs fixture pull request in %s mode",
    async (mode, expectedStatus, expectedOutput) => {
      const eventPath = await writeEvent("pull_request_target");
      const result = runAction({
        GITHUB_EVENT_NAME: "pull_request_target",
        GITHUB_EVENT_PATH: eventPath,
        INPUT_MODE: mode,
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
      expect(result.status).toBe(expectedStatus);
      expect(result.stdout).toContain(expectedOutput);
      expect(result.stdout).toContain("Dry-run write plan");
    },
  );

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

  test("runs supported issues event from the GitHub payload", async () => {
    const eventPath = await writeEvent("issues");
    const result = runAction({
      GITHUB_EVENT_NAME: "issues",
      GITHUB_EVENT_PATH: eventPath,
      INPUT_MODE: "advisory",
      INPUT_TOKEN: "",
      MAINTAINER_INTAKE_DRY_RUN: "true",
    });
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("ready_for_review");
    expect(result.stdout).toContain("Bug report evidence");
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
    issue:
      eventName === "issues"
        ? {
            number: 44,
            title: "Bug: crash on launch",
            body: [
              "## Reproduction",
              "Open the app.",
              "## Expected behavior",
              "The app starts.",
              "## Actual behavior",
              "It crashes.",
            ].join("\n"),
            user: { login: "new-contributor" },
            labels: [{ name: "bug" }],
          }
        : undefined,
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
    env: { ...process.env, ...LOCAL_ACTION_ENV, ...env },
  });
}
