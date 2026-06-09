import { Octokit } from "@octokit/rest";
import type { IntakeResult } from "../engine/types.js";
import type { ContributionContext, ContributionFile } from "../engine/types.js";
import type { GitHubContributionReference } from "./reference.js";

export type GitHubWriteOptions = {
  comment?: boolean | undefined;
  labels?: boolean | undefined;
  check?: boolean | undefined;
  checkName?: string | undefined;
  headSha?: string | undefined;
};

export function createOctokit(token: string): Octokit {
  return new Octokit({
    auth: token,
    userAgent: "maintainer-intake/0.1.0",
  });
}

export async function loadPullRequestFromGitHub(
  reference: GitHubContributionReference,
  token: string,
): Promise<ContributionContext> {
  const octokit = createOctokit(token);
  const [repoResponse, pullResponse, issueResponse, comments, files] =
    await Promise.all([
      octokit.repos.get({ owner: reference.owner, repo: reference.repo }),
      octokit.pulls.get({
        owner: reference.owner,
        repo: reference.repo,
        pull_number: reference.number,
      }),
      octokit.issues.get({
        owner: reference.owner,
        repo: reference.repo,
        issue_number: reference.number,
      }),
      octokit.paginate(octokit.issues.listComments, {
        owner: reference.owner,
        repo: reference.repo,
        issue_number: reference.number,
        per_page: 100,
      }),
      octokit.paginate(octokit.pulls.listFiles, {
        owner: reference.owner,
        repo: reference.repo,
        pull_number: reference.number,
        per_page: 100,
      }),
    ]);

  return {
    kind: "pull_request",
    repository: {
      owner: reference.owner,
      name: reference.repo,
      defaultBranch: repoResponse.data.default_branch,
      isFork: Boolean(pullResponse.data.head.repo?.fork),
    },
    number: reference.number,
    title: pullResponse.data.title ?? "",
    body: pullResponse.data.body ?? "",
    author: {
      login: pullResponse.data.user?.login ?? "unknown",
      association: issueResponse.data.author_association ?? "NONE",
    },
    labels: normalizeLabels(issueResponse.data.labels),
    comments: comments.map((comment) => ({
      id: comment.id,
      author: comment.user?.login,
      body: comment.body ?? "",
    })),
    files: files.map(normalizeFile),
    linkedIssues: [],
    metadata: {
      headSha: pullResponse.data.head.sha,
      baseSha: pullResponse.data.base.sha,
      fork: Boolean(pullResponse.data.head.repo?.fork),
    },
  };
}

export async function loadIssueFromGitHub(
  reference: GitHubContributionReference,
  token: string,
): Promise<ContributionContext> {
  const octokit = createOctokit(token);
  const [repoResponse, issueResponse, comments] = await Promise.all([
    octokit.repos.get({ owner: reference.owner, repo: reference.repo }),
    octokit.issues.get({
      owner: reference.owner,
      repo: reference.repo,
      issue_number: reference.number,
    }),
    octokit.paginate(octokit.issues.listComments, {
      owner: reference.owner,
      repo: reference.repo,
      issue_number: reference.number,
      per_page: 100,
    }),
  ]);

  if (issueResponse.data.pull_request) {
    throw new Error(
      "Reference points to a pull request. Use analyze-pr instead.",
    );
  }

  return {
    kind: "issue",
    repository: {
      owner: reference.owner,
      name: reference.repo,
      defaultBranch: repoResponse.data.default_branch,
      isFork: false,
    },
    number: reference.number,
    title: issueResponse.data.title ?? "",
    body: issueResponse.data.body ?? "",
    author: {
      login: issueResponse.data.user?.login ?? "unknown",
      association: issueResponse.data.author_association ?? "NONE",
    },
    labels: normalizeLabels(issueResponse.data.labels),
    comments: comments.map((comment) => ({
      id: comment.id,
      author: comment.user?.login,
      body: comment.body ?? "",
    })),
    files: [],
    linkedIssues: [],
    metadata: {},
  };
}

export async function applyGitHubWritePlan(
  reference: GitHubContributionReference,
  token: string,
  result: IntakeResult,
  renderedComment: string,
  options: GitHubWriteOptions,
): Promise<string[]> {
  const octokit = createOctokit(token);
  const actions: string[] = [];

  if (options.comment && result.writePlan.comment.enabled) {
    const comments = await octokit.paginate(octokit.issues.listComments, {
      owner: reference.owner,
      repo: reference.repo,
      issue_number: reference.number,
      per_page: 100,
    });
    const existing = comments.find((comment) =>
      (comment.body ?? "").includes(result.writePlan.comment.marker),
    );
    if (existing) {
      await octokit.issues.updateComment({
        owner: reference.owner,
        repo: reference.repo,
        comment_id: existing.id,
        body: renderedComment,
      });
      actions.push("updated-comment");
    } else {
      await octokit.issues.createComment({
        owner: reference.owner,
        repo: reference.repo,
        issue_number: reference.number,
        body: renderedComment,
      });
      actions.push("created-comment");
    }
  }

  if (options.labels && result.writePlan.labels.add.length > 0) {
    await octokit.issues.addLabels({
      owner: reference.owner,
      repo: reference.repo,
      issue_number: reference.number,
      labels: result.writePlan.labels.add,
    });
    actions.push("added-labels");
  }

  if (options.labels && result.writePlan.labels.remove.length > 0) {
    for (const label of result.writePlan.labels.remove) {
      try {
        await octokit.issues.removeLabel({
          owner: reference.owner,
          repo: reference.repo,
          issue_number: reference.number,
          name: label,
        });
        actions.push("removed-label:" + label);
      } catch (error) {
        if ((error as { status?: number }).status !== 404) throw error;
      }
    }
  }

  if (options.check && result.writePlan.check.enabled && options.headSha) {
    await octokit.checks.create({
      owner: reference.owner,
      repo: reference.repo,
      name: options.checkName ?? result.writePlan.check.name,
      head_sha: options.headSha,
      status: "completed",
      conclusion:
        result.writePlan.check.conclusion === "failure"
          ? "failure"
          : result.writePlan.check.conclusion,
      output: {
        title: "Maintainer Intake",
        summary: result.packet.summary,
      },
    });
    actions.push("created-check");
  }

  return actions;
}

function normalizeLabels(labels: unknown[]): string[] {
  return labels
    .map((label) => {
      if (typeof label === "string") return label;
      if (label && typeof label === "object" && "name" in label) {
        return String((label as { name?: string }).name ?? "");
      }
      return "";
    })
    .filter(Boolean);
}

function normalizeFile(file: {
  filename: string;
  previous_filename?: string;
  status: string;
  additions: number;
  deletions: number;
  patch?: string;
}): ContributionFile {
  return {
    path: file.filename,
    previousPath: file.previous_filename,
    status: normalizeFileStatus(file.status),
    additions: file.additions,
    deletions: file.deletions,
    patch: file.patch,
    isBinary: file.patch === undefined,
    truncated: false,
  };
}

function normalizeFileStatus(status: string): ContributionFile["status"] {
  if (
    status === "added" ||
    status === "modified" ||
    status === "removed" ||
    status === "renamed" ||
    status === "copied" ||
    status === "changed" ||
    status === "unchanged"
  ) {
    return status;
  }
  return "changed";
}
