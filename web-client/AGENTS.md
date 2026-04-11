<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Repo-Specific Notes

- Package manager: use `npm` in this app. The checked-in lockfile is `package-lock.json`.
- Common commands:
  - `npm install`
  - `npm run dev`
  - `npm run build`
  - `npm run start`
  - `npm run lint`

## Current Workflows

- Public trip sharing is implemented at `app/trip/[id]/page.tsx`.
- The page is both a web fallback and a deep-link handoff surface:
  - It fetches trip data from `${NEXT_PUBLIC_API_URL}/public/trips/:id`.
  - It renders a usable fallback page when the backend request fails.
  - It currently opens the mobile app with the custom scheme `myridepartner://trip/:id`.
- Verified link association files are served from:
  - `app/.well-known/apple-app-site-association/route.ts`
  - `app/.well-known/assetlinks.json/route.ts`

## Environment Notes

- `NEXT_PUBLIC_API_URL` defaults to `http://localhost:3000/api` for the trip fallback page.
- `APPLE_TEAM_ID` is required for the iOS `apple-app-site-association` route to return a valid payload.
- `IOS_BUNDLE_ID` defaults to `com.rohankarankot.myridepartner`.
- `ANDROID_PACKAGE_NAME` defaults to `com.rohankarankot.myridepartner`.
- `ANDROID_SHA256_FINGERPRINT` currently has a fallback value in code; replace it with the production signing fingerprint before relying on Android App Links.
- TODO: add a checked-in env example for these deep-link variables before expanding this workflow further.
