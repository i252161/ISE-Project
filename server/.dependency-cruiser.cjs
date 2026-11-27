/** @type {import('dependency-cruiser').IConfiguration} */
const MODULES = [
  'api-layer',
  'planning-core',
  'sync-engine',
  'classroom-adapter',
  'calendar-adapter',
  'ai-adapter',
  'notification-scheduler',
  'credential-handling',
  'data-access',
  'push-gateway',
  'oauth-client'
];

const intraModuleRules = MODULES.map((mod) => ({
  comment: `Intra-module imports allowed within ${mod}`,
  from: { path: `^src/${mod}/` },
  to: { path: `^src/${mod}/` }
}));

module.exports = {
  allowedSeverity: 'error',
  allowed: [
    // Node.js built-ins
    {
      from: { path: '^src/' },
      to: { dependencyTypes: ['core'] }
    },
    // External npm packages (pg & embedded-postgres restricted to data-access)
    {
      from: { path: '^src/data-access/' },
      to: { pathNot: '^src/' }
    },
    {
      from: { path: '^src/', pathNot: '^src/data-access/' },
      to: { pathNot: '^src/', dependencyTypesNot: ['unknown'] }
    },
    // Intra-module imports
    ...intraModuleRules,
    // Entry point: main.ts -> api-layer only
    {
      from: { path: '^src/main\\.ts$' },
      to: { path: '^src/api-layer/index\\.ts$' }
    },
    // agent.md §4.1 Allowed-dependency table (public index.ts only)
    {
      from: { path: '^src/api-layer/' },
      to: {
        path: '^src/(planning-core|notification-scheduler|sync-engine|credential-handling|data-access)/index\\.ts$'
      }
    },
    {
      from: { path: '^src/planning-core/' },
      to: { path: '^src/data-access/index\\.ts$' }
    },
    {
      from: { path: '^src/sync-engine/' },
      to: {
        path: '^src/(classroom-adapter|calendar-adapter|ai-adapter|planning-core|data-access)/index\\.ts$'
      }
    },
    {
      from: { path: '^src/(classroom-adapter|calendar-adapter|ai-adapter)/' },
      to: { path: '^src/credential-handling/index\\.ts$' }
    },
    {
      from: { path: '^src/notification-scheduler/' },
      to: { path: '^src/(planning-core|data-access|push-gateway)/index\\.ts$' }
    },
    {
      from: { path: '^src/credential-handling/' },
      to: { path: '^src/(data-access|oauth-client)/index\\.ts$' }
    }
    // data-access, push-gateway, oauth-client may not import any other backend module
  ],
  forbidden: [
    {
      name: 'no-pg-outside-data-access',
      severity: 'error',
      comment: 'Only data-access may import pg or embedded-postgres (agent.md §6 rule 11).',
      from: { path: '^src/', pathNot: '^src/data-access/' },
      to: { path: 'node_modules/(pg|embedded-postgres)/' }
    }
  ],
  options: {
    doNotFollow: {
      path: 'node_modules'
    },
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: 'tsconfig.json'
    }
  }
};
