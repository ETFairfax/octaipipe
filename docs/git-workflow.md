# Git workflow

Day-to-day steps for contributing a change to this repo.

## Branching model

`main` is the only long-lived branch — trunk-based. There is no `development` or `release`
branch to keep in sync.

1. Pick up or create a GitHub issue for the work (see
   [`docs/agents/issue-tracker.md`](./agents/issue-tracker.md)).
2. Branch off `main`, named `<type>/<issue-number>-<short-slug>`, e.g.
   `feat/123-sidebar-redesign` or `fix/101-form-field-locality`. `<type>` matches the
   commit types below.
3. Commit your work (see message format below).
4. Push the branch and open a PR against `main`.
5. Get it reviewed, then merge.

## Commit messages

Commit-msg is enforced by Husky + commitlint (`.husky/commit-msg`, `commitlint.config.js`) on
every commit — a bad message is rejected locally before it can even land on a
branch. Format is [Conventional Commits](https://www.conventionalcommits.org/) with two
repo-specific rules: **the scope must be the GitHub issue number being implemented/fixed** (not a
package or area name), and **the header must start with the [gitmoji](https://gitmoji.dev) for its
type**.

```
<gitmoji> <type>(#<issue-number>): <description>
```

```bash
✨ feat(#110): sidebar redesign — app switcher, per-app nav, user footer
🐛 fix(#101): keep form field label and input associated by id
📝 docs(#5): document the day-to-day git workflow
```

`type` follows `@commitlint/config-conventional` (`feat`, `fix`, `docs`, `refactor`, `test`,
`chore`, `ci`, etc). If a change doesn't correspond to an issue, open one first — the scope isn't
optional.

`gitmoji` must be the one canonical emoji mapped to that `type` in `commitlint.config.js`'s
`GITMOJI_BY_TYPE` table — not any gitmoji, and not a shortcode like `:sparkles:`:

| type | gitmoji | type | gitmoji |
|---|---|---|---|
| `feat` | ✨ | `perf` | ⚡️ |
| `fix` | 🐛 | `test` | ✅ |
| `docs` | 📝 | `build` | 📦️ |
| `style` | 🎨 | `ci` | 👷 |
| `refactor` | ♻️ | `chore` | 🔧 |
| `revert` | ⏪️ | | |

## Opening a pull request

Merging to `main` does more than land the commit: it builds and pushes a container image per app.

Merge once the PR has been reviewed. **Use "Squash and merge"** so each PR lands on `main` as 
exactly one commit, keeping history linear and matching the one-commit-per-issue shape the 
`type(#issue): ...` format assumes. Edit the squash commit's message to follow that format 
before confirming (GitHub defaults to the PR title, which won't already match unless the PR
was titled that way).