# Configuration

Primary path: .github/maintainer-intake.yml

Generate defaults with:

    maintainer-intake init
    maintainer-intake init --write

Validate policy with:

    maintainer-intake policy doctor --config .github/maintainer-intake.yml

Default shape:

    version: 1
    mode: advisory
    pullRequests:
      requireLinkedIssue: true
      requireTestEvidence: true
      requireGeneratedAcknowledgement: false
      largeChangeThreshold: 500
      requiredSections:
        - Summary
        - Linked issue
        - Tests
        - Scope
      riskyPaths:
        - pattern: ".github/workflows/**"
          require:
            - security-impact
    issues:
      bug:
        require:
          - reproduction
          - expected-behavior
          - actual-behavior
      feature:
        require:
          - use-case
          - non-goals
      security:
        require:
          - affected-version
          - component
          - impact
          - reproduction
      duplicateSearch: false
    labels:
      ready: intake:ready
      needsEvidence: intake:needs-evidence
      maintainerDecision: intake:maintainer-decision
    policy:
      requiredFiles: []
      optionalFiles:
        - CONTRIBUTING.md
        - SECURITY.md
        - AGENTS.md
        - .github/PULL_REQUEST_TEMPLATE.md
      issueTemplateDirectory: .github/ISSUE_TEMPLATE

Unknown keys fail validation. The error includes the path so the policy can be repaired.

Configured PR sections and issue evidence fields are structural evidence checks. A field is recognized as a Markdown heading or label with a non-placeholder value, for example `## Expected behavior` followed by content or `Expected behavior: the command exits 0`. Empty headings, template comments, `TBD`, and an unlabeled bare keyword do not count.

policy doctor also performs repository policy discovery. Files listed under
policy.requiredFiles must exist or the command exits 2. Files listed under
policy.optionalFiles and issue forms under policy.issueTemplateDirectory are
reported as read-only diagnostics so maintainers can see which contribution
guidance the tool found.
