# Codebase CONVENTIONS.md

**Date**: 2026-05-03

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
