# Codebase STRUCTURE.md

**Date**: 2026-05-03

## Directory Layout

The project is organized into three main application directories:

### Backend (`/backend`)
```
backend/
├── prisma/             # Prisma schema and migrations
│   └── schema/         # Modularized Prisma schemas (00-base, 10-auth, etc.)
├── scripts/            # Admin tasks, DB seeding, and schema merge scripts
└── src/
    ├── auth/           # Authentication strategies, controllers, and services
    ├── common/         # Global guards, interceptors, decorators, and DTOs
    ├── users/          # User management and app-source linking
    ├── trips/          # Trip creation and management
    ├── join-requests/  # Trip request workflows
    ├── notifications/  # Expo push notification handling
    └── [features]/     # Other domain modules (ratings, reports, chats)
```

### Mobile Client (`/client`)
```
client/
├── .maestro/           # Smoke tests and E2E flows
├── app/                # Expo Router entry points and screens
│   ├── (tabs)/         # Main bottom tab navigation (index, create, activity, profile)
│   ├── trip/           # Trip detail screens
│   └── [features]/     # Other routed screens (login, onboarding, settings)
├── components/         # Reusable UI components (buttons, inputs, cards)
├── hooks/              # Custom React hooks
├── services/           # API interaction and Socket.io clients
├── store/              # Zustand global state stores
└── utils/              # Helper functions and formatters
```

### Web Client (`/web-client`)
```
web-client/
├── app/                # Next.js App Router (pages, layouts, API routes)
│   ├── backoffice/     # Dashboard routes
│   └── trip/           # Public trip sharing pages
├── public/             # Static assets
└── src/
    └── backoffice/     # Backoffice business logic and UI
        └── features/   # Feature-sliced modules (users, trips, reports, etc.)
            └── [feature]/
                └── components/ # Feature-specific components (e.g., tables)
```

## Key Conventions
- **Schema Management**: The Prisma schema is split into multiple files under `backend/prisma/schema/` and merged using the `npm run prisma:merge` script. Do not edit `schema.prisma` directly.
- **Shared App Model**: The backend supports multiple apps (`AppSource`). New apps must be registered via the seed scripts rather than hardcoded enums.
