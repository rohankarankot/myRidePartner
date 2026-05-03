# Codebase ARCHITECTURE.md

**Date**: 2026-05-03

## System Architecture

The system is designed as a centralized monorepo with three primary tiers:

### 1. Backend API (NestJS)
- **Pattern**: Modular Controller-Service-Repository architecture via NestJS dependency injection.
- **Data Flow**: HTTP Requests -> Auth Guard (Passport JWT) -> Controller -> Service (Business Logic) -> Prisma ORM -> PostgreSQL.
- **Real-time Layer**: Socket.io gateways handle real-time events (chat messages, online presence) running alongside the REST API.
- **Shared Auth Model**: The backend acts as the single source of truth for authentication, managing identities across multiple app sources (e.g., `myridepartner`, `interport`).

### 2. Mobile App (Expo)
- **Pattern**: Screen-based routing with global state management.
- **Routing**: Handled natively via `expo-router` mapping file structures directly to navigational stacks and tabs.
- **Data Flow**: UI Components -> React Query Hooks (for remote data caching/mutation) -> Axios (API requests) -> Backend. Global UI and auth states are managed by `Zustand`.
- **Styling Layer**: `NativeWind` translates Tailwind utility classes to native React Native styles, supplemented by `Gluestack-UI` for complex components.

### 3. Web Dashboard (Next.js)
- **Pattern**: Server-side rendered App Router architecture with feature-sliced modularity in the `src` directory.
- **Data Flow**: Server Components fetch initial data directly where possible, passing to Client Components. Forms and mutations are handled via Server Actions or direct API calls using `next-auth` sessions for authorization.
- **Feature Modules**: The `backoffice` is cleanly separated into feature folders (e.g., `users`, `trips`, `reports`), enclosing their own components, actions, and schemas.
