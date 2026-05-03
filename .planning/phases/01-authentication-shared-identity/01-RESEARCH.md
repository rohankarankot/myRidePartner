# Phase 1 Research: Authentication & Shared Identity

## 1. Domain Investigation
The authentication domain in this brownfield project is already implemented using NestJS Passport strategies and Google OAuth Library.
The system relies on `req.user.authSource` to isolate users by app.

## 2. Codebase Analogies
- `backend/src/auth/auth.service.ts` contains `verifyGoogleToken` which already supports multi-app audiences via `GOOGLE_CLIENT_IDS`.
- The `AppSource` model in Prisma already tracks sources.

## 3. Risks & Anti-patterns
- Breaking the shared user model by hardcoding `myridepartner`.
- Not supporting both `myridepartner` and `interport` in Google Auth.

## 4. Implementation Strategy
Since this phase is already implemented in the brownfield codebase, the execution plan should only verify that the existing implementation fulfills AUTH-01 and AUTH-02 requirements. No new code needs to be written for this phase.
