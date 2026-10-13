/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment:
        'Dependency cycles make load order and ownership ambiguous. Break the cycle, e.g. by lifting the shared piece into a lower layer (see "Layers and boundaries" in docs/frontend-architecture.md).',
      from: {},
      to: { circular: true }
    },
    {
      name: 'no-cross-package-internal',
      severity: 'error',
      comment:
        "src/internal/ is private to its package. Other packages must go through the package's public entry point (see 'Dependency rules' in docs/frontend-architecture.md).",
      from: { path: '^(packages|apps)/([^/]+)/' },
      to: {
        path: '^packages/[^/]+/src/internal/',
        pathNot: '^packages/$2/'
      }
    }
  ],
  options: {
    doNotFollow: { path: ['node_modules', '/dist/', '/.turbo/'] },
    exclude: { path: ['/dist/', '/.turbo/', '/coverage/'] },
    parser: 'swc',
    tsPreCompilationDeps: true,
    tsConfig: { fileName: 'tsconfig.json' },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default', 'types'],
      mainFields: ['module', 'main', 'types']
    },
    reporterOptions: {
      text: { highlightFocused: true }
    }
  }
};
