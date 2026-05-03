<!-- GSD:project-start source:PROJECT.md -->
## Project

**Project: myRidePartner**

myRidePartner is a comprehensive ride-sharing and community platform built on a unified multi-app backend. It provides a mobile experience for users to discover and join trips, chat with ride partners, and engage in community groups. A centralized backoffice dashboard allows administrators to manage users, reports, and trips. The backend supports a multi-app architecture allowing multiple distinct app sources to share the same user pool and authentication system.

**Core Value:** Providing a safe, real-time, and scalable platform for users to find ride partners, manage trips, and communicate, while offering robust administrative controls and cross-app identity management.
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Overview
## Backend (`/backend`)
- **Language**: TypeScript
- **Runtime**: Node.js
- **Framework**: NestJS (v11)
- **Database**: PostgreSQL
- **ORM**: Prisma (v7)
- **Authentication**: Passport.js with JWT Strategy
- **Real-time**: Socket.io (websockets)
- **File Storage**: Cloudinary integration
- **Push Notifications**: Expo Server SDK, Firebase Admin SDK
- **OAuth**: Google Auth Library
- **Tools**: Prettier, ESLint, Jest for testing
## Mobile Client (`/client`)
- **Language**: TypeScript
- **Framework**: React Native (0.81) via Expo (v54)
- **Routing**: Expo Router (file-based routing)
- **State Management**: Zustand, TanStack React Query (v5)
- **Styling**: NativeWind (v4), Gluestack-UI (v3)
- **Icons**: @expo/vector-icons
- **Maps/Location**: expo-location
- **Ads**: react-native-google-mobile-ads
- **Chat**: react-native-gifted-chat
- **Authentication**: @react-native-google-signin/google-signin
- **Analytics/Firebase**: @react-native-firebase/app, @react-native-firebase/analytics
- **Websockets**: socket.io-client
- **Animations**: Lottie, react-native-reanimated, @legendapp/motion
- **Testing**: Maestro (smoke tests via `.maestro/`)
## Web Client (`/web-client`)
- **Language**: TypeScript
- **Framework**: Next.js (v16.2.2) using App Router
- **Authentication**: Next-Auth (v5 beta)
- **Styling**: Tailwind CSS (v4), PostCSS
- **Components**: Radix UI primitives, Lucide React (icons)
- **State Management**: Zustand, Nuqs (URL state management)
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts
- **Drag and Drop**: @dnd-kit
- **Tables**: @tanstack/react-table
- **Command Palette**: Kbar
- **Tools**: ESLint, Prettier, Husky, lint-staged
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Coding Standards and Patterns
### 1. General
- **Language**: TypeScript is strictly enforced across the entire monorepo.
- **Formatting**: Managed globally via Prettier.
- **Linting**: ESLint configured for each project; `web-client` enforces pre-commit hooks via Husky and lint-staged.
### 2. Backend (NestJS)
- **Dependency Injection**: Utilize standard NestJS class-based providers, decorators (`@Injectable()`, `@Controller()`), and modular encapsulation.
- **Data Validation**: Strict validation via `class-validator` and `class-transformer` on DTOs.
- **Error Handling**: Use built-in NestJS `HttpException` subclasses (e.g., `NotFoundException`, `UnauthorizedException`) instead of custom error wrappers where possible.
- **Schema Management**: Prisma schemas are modularized inside `backend/prisma/schema/`. Run `npm run prisma:merge` after any edits; do not edit `schema.prisma` directly.
- **Authentication Source**: Extract the active app source from `req.user.authSource` for multi-app contextual logic.
### 3. Mobile Client (Expo)
- **Routing**: Utilize `expo-router` for file-based routing. Wrap route segments requiring authentication with layout guards.
- **Styling**: Prefer `NativeWind` utility classes in `className` props. Use `Gluestack-UI` for complex accessible UI components.
- **State**: Use `Zustand` for global user and session state. Use `@tanstack/react-query` for asynchronous server state caching and optimistic UI updates.
- **Environment**: Sensitive environment variables must not be hardcoded. Use Expo config and `.env` files appropriately.
### 4. Web Client (Next.js)
- **Component Pattern**: Default to Server Components. Use `"use client"` directives only at the leaves of the component tree when interactivity or hooks are required.
- **Feature Modules**: Group related logic into feature folders under `src/backoffice/features/`. Keep UI components, actions, and schemas localized to their respective features.
- **Styling**: Tailwind CSS v4 for utility-first styling. Radix UI primitives are styled using Tailwind for accessible components.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## System Architecture
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
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.agent/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
