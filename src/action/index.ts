import * as core from "@actions/core";
import * as github from "@actions/github";
import {
  evaluateContribution,
  loadConfigFromFile,
  parseConfig,
  renderResult,
  type IntakeConfig,
} from "../engine/index.js";
import type { ContributionContext } from "../engine/types.js";
import { loadFixtureBundle } from "../github/fixture-provider.js";
import {
  applyGitHubWritePlan,
  loadConfigFromGitHub,
  loadIssueFromGitHub,
  loadPullRequestFromGitHub,
} from "../github/octokit-provider.js";
import type { GitHubContributionReference } from "../github/reference.js";

export async function runAction(): Promise<void> {
  const eventName = process.env.GITHUB_EVENT_NAME ?? "";
  const token =
    core.getInput("token") ||
    process.env.GITHUB_TOKEN ||
    process.env.GH_TOKEN ||
    "";
  const modeInput = core.getInput("mode");
  const mode = modeInput === "" ? undefined : modeInput;
  const configPath = core.getInput("config") || ".github/maintainer-intake.yml";
  const comment = readBooleanInput("comment", true);
  const labels = readBooleanInput("labels", false);
  const checkName = core.getInput("check-name") || "Maintainer Intake";
  const dryRun =
    process.env.MAINTAINER_INTAKE_DRY_RUN === "true" || token === "";

  const fixturePath = process.env.MAINTAINER_INTAKE_FIXTURE;
  const loaded = fixturePath
    ? await loadActionFixture(fixturePath)
    : await contextFromGitHubEvent(eventName, token);

  if (!loaded) {
    core.info("Unsupported event for maintainer-intake: " + eventName);
    core.setOutput("status", "unsupported_event");
    core.setOutput("score", "0");
    core.setOutput("packet-summary", "Unsupported event.");
    return;
  }

  let config: IntakeConfig;
  if (loaded.config) {
    config = loaded.config;
  } else if (loaded.reference && token) {
    config = await loadConfigFromGitHub(
      loaded.reference,
      token,
      configPath,
      loaded.context.repository.defaultBranch,
    );
  } else {
    config = await loadConfigFromFile(configPath);
  }
  if (mode) {
    config = parseConfig({ ...config, mode });
  }

  const result = evaluateContribution(loaded.context, config);
  const renderedPacket = renderResult(result, "markdown");
  const renderedComment = renderResult(result, "comment");
  core.setOutput("status", result.status);
  core.setOutput("score", String(result.score));
  core.setOutput("packet-summary", result.packet.summary);
  core.setOutput("result-json", JSON.stringify(result));
  core.info(renderedPacket);
  if (process.env.GITHUB_STEP_SUMMARY) {
    await core.summary.addRaw(renderedPacket).write();
  }

  if (dryRun) {
    core.info("Dry-run write plan: " + JSON.stringify(result.writePlan));
  } else if (loaded.reference) {
    const actions = await applyGitHubWritePlan(
      loaded.reference,
      token,
      result,
      renderedComment,
      {
        comment,
        labels,
        check: result.writePlan.check.enabled,
        checkName,
        headSha: loaded.headSha,
      },
    );
    core.info("Applied write actions: " + actions.join(", "));
  }

  if (result.writePlan.gate.fail) {
    core.setFailed("Maintainer intake gate failed: " + result.status);
  }
}

type LoadedActionContext = {
  context: ContributionContext;
  config?: IntakeConfig | undefined;
  reference?: GitHubContributionReference | undefined;
  headSha?: string | undefined;
};

async function loadActionFixture(path: string): Promise<LoadedActionContext> {
  const bundle = await loadFixtureBundle(path);
  return {
    context: bundle.context,
    config: bundle.config,
  };
}

async function contextFromGitHubEvent(
  eventName: string,
  token: string,
): Promise<LoadedActionContext | undefined> {
  const payload = github.context.payload;
  const repository = payload.repository;
  if (!repository?.owner?.login || !repository.name) {
    return undefined;
  }

  const reference = {
    owner: repository.owner.login,
    repo: repository.name,
    number: Number(payload.pull_request?.number ?? payload.issue?.number),
  };

  if (!Number.isFinite(reference.number) || reference.number <= 0) {
    return undefined;
  }

  if (
    (eventName === "pull_request" || eventName === "pull_request_target") &&
    payload.pull_request
  ) {
    if (token) {
      const context = await loadPullRequestFromGitHub(reference, token);
      return {
        context,
        reference,
        headSha: String(
          payload.pull_request.head?.sha ?? context.metadata["headSha"] ?? "",
        ),
      };
    }
    return {
      context: contextFromPullRequestPayload(payload),
      reference,
      headSha: String(payload.pull_request.head?.sha ?? ""),
    };
  }

  if (eventName === "issues" && payload.issue) {
    if (token) {
      return {
        context: await loadIssueFromGitHub(reference, token),
        reference,
      };
    }
    return {
      context: contextFromIssuePayload(payload),
      reference,
    };
  }

  return undefined;
}

function contextFromPullRequestPayload(
  payload: typeof github.context.payload,
): ContributionContext {
  const pull = payload.pull_request;
  const repo = payload.repository;
  return {
    kind: "pull_request",
    repository: {
      owner: repo?.owner?.login ?? "unknown",
      name: repo?.name ?? "unknown",
      defaultBranch: repo?.default_branch ?? "main",
      isFork: Boolean(pull?.head?.repo?.fork),
    },
    number: Number(pull?.number ?? 0),
    title: pull?.title ?? "",
    body: pull?.body ?? "",
    author: {
      login: pull?.user?.login ?? "unknown",
      association: "NONE",
    },
    labels: [],
    comments: [],
    files: [],
    linkedIssues: [],
    metadata: {
      headSha: pull?.head?.sha,
      fork: Boolean(pull?.head?.repo?.fork),
    },
  };
}

function contextFromIssuePayload(
  payload: typeof github.context.payload,
): ContributionContext {
  const issue = payload.issue;
  const repo = payload.repository;
  return {
    kind: "issue",
    repository: {
      owner: repo?.owner?.login ?? "unknown",
      name: repo?.name ?? "unknown",
      defaultBranch: repo?.default_branch ?? "main",
      isFork: false,
    },
    number: Number(issue?.number ?? 0),
    title: issue?.title ?? "",
    body: issue?.body ?? "",
    author: {
      login: issue?.user?.login ?? "unknown",
      association: "NONE",
    },
    labels: Array.isArray(issue?.labels)
      ? issue.labels
          .map((label) =>
            typeof label === "string" ? label : String(label.name ?? ""),
          )
          .filter(Boolean)
      : [],
    comments: [],
    files: [],
    linkedIssues: [],
    metadata: {},
  };
}

function readBooleanInput(name: string, fallback: boolean): boolean {
  const raw = core.getInput(name);
  if (raw === "") return fallback;
  return core.getBooleanInput(name, { required: false });
}

if (import.meta.url === new URL(process.argv[1] ?? "", "file://").href) {
  runAction().catch((error) => {
    core.setFailed(error instanceof Error ? error.message : String(error));
  });
}
