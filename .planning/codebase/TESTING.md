# Codebase TESTING.md

**Date**: 2026-05-03

## Testing Structure and Frameworks

### 1. Backend Testing
- **Framework**: Jest
- **Unit Tests**: Standard Jest `.spec.ts` files typically colocated with their respective services or controllers. 
  - *Command*: `npm run test` or `npm run test:watch`
- **E2E Tests**: Utilizes Supertest to spin up the application context and execute against the full API lifecycle. Configurations are kept in `backend/test/`.
  - *Command*: `npm run test:e2e`

### 2. Mobile Client Testing
- **Framework**: Maestro (UI/Smoke Testing)
- **Structure**: Maestro YAML flow files are maintained inside the `client/.maestro/` directory.
- **Smoke Tests**: Specific smoke test suites are used to validate critical paths (e.g., login, signup, basic navigation) before release.
- **Execution**: 
  - Run all: `npm run maestro:test`
  - Run smoke suite: `npm run maestro:test:smoke`
- **Prerequisites**: Requires an active iOS Simulator or Android Emulator with a development build installed (`npm run ios` or `npm run android`).

### 3. Web Client Testing
- **Framework**: Not explicitly configured in the `package.json` at this time.
- **Quality Gates**: Currently relies on static analysis via ESLint and Prettier, enforced through Husky pre-commit hooks (`lint-staged`).
