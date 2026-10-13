---
name: reverse-acceptance-criteria
description: Derives Gherkin acceptance criteria from the current branch's changes and checks them against the linked GitHub issue. Use before opening or reviewing a PR, or when asked to write acceptance criteria for a branch.
disable-model-invocation: true
---

## 1. Gather context
- Base branch: the repo's default branch (`gh repo view --json defaultBranchRef`), falling back to `main`.
- Diff: `git diff $(git merge-base HEAD origin/<base>)...HEAD`. Include uncommitted changes only if the user says so.
- Linked issue, checked in this order: number at the start of the branch name → `gh pr view --json closingIssuesReferences` → `#123` in commit messages. If found, read it with `gh issue view <n>`.

## 2. Derive criteria
- Describe only user-observable behaviour present in the diff. Do not invent behaviour.
- Ignore refactors, formatting, renames and dependency bumps.
- Cover error and edge cases, not just the happy path.
- Above each scenario, add a comment naming the implementing file and the test that covers it, or `untested`.

## 3. Compare with the issue (if one was found)
Add a "Gaps" section listing:
- Requirements in the issue with no matching scenario
- Scenarios with no corresponding requirement

## 4. Write the file
- Directory: `docs/acceptance-criteria/` (create if missing).
- Name: `<issue-number>-<issue-title-slug>.md`, else `<branch-name-slug>.md`. Slugify (lowercase, `/` and spaces → `-`), max 60 chars.
- Format: `# <title>`, then one ```gherkin block per `Feature:` with `Scenario:`s using Given/When/Then/And, then the Gaps section.
- If the file exists, update it rather than appending duplicates.

Finish by reporting the file path and any untested scenarios or gaps.