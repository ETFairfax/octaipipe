// type -> required gitmoji (https://gitmoji.dev), enforced by the
// 'gitmoji-type-match' rule below. One canonical emoji per
// @commitlint/config-conventional type, so `git log --oneline` stays
// scannable and matches what gitmoji-aware tooling (changelog generators,
// GitHub's emoji rendering) expects.
const GITMOJI_BY_TYPE = {
  feat: '✨',
  fix: '🐛',
  docs: '📝',
  style: '🎨',
  refactor: '♻️',
  perf: '⚡️',
  test: '✅',
  build: '📦️',
  ci: '👷',
  chore: '🔧',
  revert: '⏪️'
};

module.exports = {
  extends: ['@commitlint/config-conventional'],
  // Overrides only headerPattern/headerCorrespondence; everything else
  // (revertPattern, noteKeywords, issuePrefixes, ...) is deep-merged in
  // from the extended conventional-changelog-conventionalcommits preset.
  parserPreset: {
    parserOpts: {
      headerPattern: /^([^\w\s]+)\s(\w*)(?:\((.*)\))?!?: (.*)$/,
      headerCorrespondence: ['gitmoji', 'type', 'scope', 'subject']
    }
  },
  rules: {
    'scope-empty': [2, 'never'],
    'scope-issue-ref': [2, 'always'],
    'gitmoji-type-match': [2, 'always']
  },
  plugins: [
    {
      rules: {
        'scope-issue-ref': parsed => {
          const ok = /^#\d+$/.test(parsed.scope ?? '');
          return [
            ok,
            'scope must be the GitHub issue number being implemented/fixed, e.g. "fix(#42): ..."'
          ];
        },
        'gitmoji-type-match': parsed => {
          const expected = GITMOJI_BY_TYPE[parsed.type];
          // Unknown type is already rejected by type-enum; don't double-report.
          if (!expected) {
            return [true];
          }
          if (!parsed.gitmoji) {
            return [
              false,
              `header must start with the gitmoji for type "${parsed.type}" (${expected}), e.g. "${expected} ${parsed.type}(#42): ..."`
            ];
          }
          if (parsed.gitmoji !== expected) {
            return [
              false,
              `gitmoji "${parsed.gitmoji}" does not match type "${parsed.type}" — expected ${expected}`
            ];
          }
          return [true];
        }
      }
    }
  ]
};
