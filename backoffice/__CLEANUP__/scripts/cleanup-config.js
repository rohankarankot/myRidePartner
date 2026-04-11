/**
 * Feature-based cleanup configuration.
 * Each feature key defines what to remove when running: node scripts/cleanup.js <feature>
 */
module.exports = {
  features: {
    kanban: {
      name: 'Kanban (Drag n Drop board)',
      folders: ['src/app/dashboard/kanban', 'src/features/kanban'],
      files: [],
      dependencies: [
        '@dnd-kit/core',
        '@dnd-kit/modifiers',
        '@dnd-kit/sortable',
        '@dnd-kit/utilities',
        'zustand'
      ],
      navItemsToRemove: ['/dashboard/kanban'],
      templateDir: '__CLEANUP__/kanban',
      templateFiles: {
        'src/config/nav-config.ts': 'nav-config.ts'
      }
    },
    sentry: {
      name: 'Sentry (Error tracking)',
      folders: [],
      files: ['src/instrumentation.ts', 'src/instrumentation-client.ts'],
      dependencies: ['@sentry/nextjs'],
      envVars: [
        'NEXT_PUBLIC_SENTRY_DSN',
        'NEXT_PUBLIC_SENTRY_ORG',
        'NEXT_PUBLIC_SENTRY_PROJECT',
        'SENTRY_AUTH_TOKEN',
        'NEXT_PUBLIC_SENTRY_DISABLED'
      ],
      templateDir: '__CLEANUP__/sentry',
      templateFiles: {
        'next.config.ts': 'next.config.ts',
        'src/app/global-error.tsx': 'global-error.tsx',
        'src/app/dashboard/overview/@bar_stats/error.tsx': 'bar_stats-error.tsx'
      }
    }
  }
};
