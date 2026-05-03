# Codebase CONCERNS.md

**Date**: 2026-05-03

## Technical Debt and Known Issues

### 1. Database Schema Management
- **Merge Workflow**: The Prisma schema relies on a custom merge script (`npm run prisma:merge`). Developers editing `backend/prisma/schema.prisma` directly instead of the files in `backend/prisma/schema/` will have their changes overwritten. This requires strong developer discipline.

### 2. Multi-App Authentication Complexity
- **Shared User Pool**: The backend manages users for multiple apps (e.g., `myridepartner`, `interport`). Ensuring the correct `authSource` is passed and validated across all endpoints is critical to avoid authorization vulnerabilities or data leaking between app environments.

### 3. Testing Coverage
- **Web Client Gap**: The `web-client` project lacks an explicit automated testing framework (like Vitest, Jest, or Playwright/Cypress). Current assurance relies only on TypeScript, ESLint, and manual testing.

### 4. Push Notification Architecture
- **FCM Token Management**: Direct Firebase Cloud Messaging (FCM) integration requires careful handling of native APNs/FCM tokens versus Expo push tokens. Ensuring correct service account credentials (`google-services.json`, `GoogleService-Info.plist`) are isolated between environments is a known operational risk.

### 5. Third-Party Ad Networks
- **AdMob Unit IDs**: Moving between development and production builds requires accurate toggling of AdMob Unit IDs. Failure to use test IDs during development can result in AdSense account bans.
