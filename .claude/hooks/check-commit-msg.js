#!/usr/bin/env node

// Claude Code `PreToolUse` hook (registered in .claude/settings.json against
// the Bash tool). Gives fast local feedback on `git commit` messages before
// Claude Code even shells out to git, using the same rules as the real
// enforcement point (.husky/commit-msg -> commitlint.config.js). This is a
// pre-check only: it fails open on anything it can't confidently parse, and
// the git commit-msg hook remains the authoritative backstop either way.
//
// Contract: reads one JSON object off stdin shaped like
// { tool_input: { command: "<the bash command>" } }. Exit 0 lets the tool
// call through; exit 2 blocks it and shows stderr to Claude as the reason.

const path = require('node:path');

// Resolve relative to this file rather than process.cwd(), since the cwd
// Claude Code invokes hooks from isn't guaranteed to be the repo root.
const repoRoot = path.resolve(__dirname, '..', '..');

function readStdin() {
  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', chunk => {
      data += chunk;
    });
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', reject);
  });
}

// Matches `git commit` as its own command, including when chained after
// `;`, `&&`, or `|` (e.g. `git add -A && git commit -m "..."`), so we don't
// mistake e.g. `git commit-graph` or an unrelated command for a commit.
function isGitCommit(command) {
  return /(^|[;&|]\s*)git\s+commit\b/.test(command);
}

// Two shapes are worth handling: Claude Code's own convention of piping a
// heredoc through `-m "$(cat <<'EOF' ... EOF)"` (see this repo's system
// prompt for committing), and a plain quoted `-m`/`--message` flag. Anything
// else (e.g. `-F -` fed from a separate pipeline stage, multiple `-m`
// flags) returns null and is left to the real git hook — we'd rather stay
// silent than misparse and block a legitimate commit.
function extractCommitMessage(command) {
  const heredocMatch = command.match(/<<[-~]?\s*['"]?(\w+)['"]?\s*\n([\s\S]*?)\n\1\b/);
  if (heredocMatch) {
    return heredocMatch[2];
  }

  const flagMatch = command.match(/-{1,2}(?:m|message)(?:\s+|=)(["'])([\s\S]*?)\1/);
  if (flagMatch) {
    return flagMatch[2];
  }

  return null;
}

// @commitlint/load and @commitlint/lint are ESM-only (no CJS entry point),
// hence dynamic import() from this CJS script. This mirrors what
// `commitlint --edit` does internally: load() resolves commitlint.config.js
// (its `extends` and the local `scope-issue-ref` plugin rule included),
// then lint() runs the full message against those resolved rules. Reusing
// the real config instead of a hand-rolled regex means this pre-check and
// the .husky/commit-msg backstop can't drift apart.
async function lintCommitMessage(message) {
  const { default: load } = await import('@commitlint/load');
  const { default: lint } = await import('@commitlint/lint');

  const config = await load({}, { cwd: repoRoot });
  const parserOpts = config.parserPreset?.parserOpts ?? {};

  return lint(message, config.rules, {
    parserOpts,
    plugins: config.plugins,
    ignores: config.ignores,
    defaultIgnores: config.defaultIgnores
  });
}

async function main() {
  const raw = await readStdin();

  let input;
  try {
    input = JSON.parse(raw);
  } catch {
    process.exit(0);
  }

  const command = input?.tool_input?.command;
  if (typeof command !== 'string' || !isGitCommit(command)) {
    process.exit(0);
  }

  const message = extractCommitMessage(command);
  if (message === null) {
    process.exit(0);
  }

  let report;
  try {
    report = await lintCommitMessage(message);
  } catch (err) {
    // Fail open: an unexpected error here (e.g. config resolution breaks)
    // shouldn't block every commit in the repo. The real git hook still runs.
    process.stderr.write(
      `WARNING: check-commit-msg.js could not run commitlint (${err.message}); deferring to the git commit-msg hook.\n`
    );
    process.exit(0);
  }

  // Warnings (severity 1 rules, e.g. missing blank line before the body)
  // are surfaced but non-blocking, matching default commitlint CLI behavior.
  if (report.warnings.length > 0) {
    const warnings = report.warnings.map(w => `  - ${w.message}`).join('\n');
    process.stderr.write(`commitlint warnings:\n${warnings}\n`);
  }

  if (!report.valid) {
    const problems = report.errors.map(e => `  - ${e.message}`).join('\n');
    process.stderr.write(`BLOCKED: commit message fails commitlint:\n${problems}\n`);
    process.exit(2);
  }

  process.exit(0);
}

main();
