# Separate Deployment Map

This repo contains three separate deployable apps:

- `backend`: NestJS API
- `web-client`: Next.js web app, including the admin area under `/backoffice`
- `client`: Expo mobile app

They can all live on separate domains/projects. The main dependency between them is the backend API.

## Recommended deployment layout

- Backend API
  - App root: `backend/`
  - Example domain: `https://api.myridepartner.com`
- Web client
  - App root: `web-client/`
  - Example domain: `https://web.myridepartner.com`
- Mobile app share-link site
  - Either reuse `web-client` trip pages for public links
  - Or run `client` as Expo web on its own domain if you intentionally want that
  - Example domain: `https://share.myridepartner.com`

## What is already wired in code

- The mobile app uses `EXPO_PUBLIC_API_URL` for backend requests in `client/constants/config.ts`.
- The mobile app builds trip share links from `EXPO_PUBLIC_SHARE_BASE_URL` in `client/features/trips/utils/trip-share.ts`.
- The web app uses `NEXT_PUBLIC_API_URL` for admin and public trip requests in `web-client/src/backoffice/auth.ts` and `web-client/app/trip/[id]/page.tsx`.
- The backend currently has open HTTP CORS in `backend/src/main.ts` and open socket CORS in `backend/src/events/events.gateway.ts`.

## Vercel project mapping

### 1. `web-client` project

Create a Vercel project with:

- Root Directory: `web-client`
- Framework Preset: Next.js
- Build command: default
- Output directory: default

Set these environment variables:

```bash
NEXT_PUBLIC_API_URL=https://api.myridepartner.com
NEXT_PUBLIC_LOGIN_SOURCE=myridepartner
AUTH_SECRET=replace-with-a-real-secret
```

Notes:

- `NEXT_PUBLIC_API_URL` should be the backend base URL without `/api` at the end.
- The code already appends `/api` when calling auth/admin routes.
- `AUTH_SECRET` is required for NextAuth.

### 2. `client` mobile app

Do not deploy the mobile app as a normal Vercel website unless you explicitly want Expo web.

For Android/iOS, keep `client/` deployed through Expo/EAS and set:

```bash
EXPO_PUBLIC_API_URL=https://api.myridepartner.com
EXPO_PUBLIC_SHARE_BASE_URL=https://share.myridepartner.com
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-google-web-client-id
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_OLA_MAPS_API_KEY=...
EXPO_PUBLIC_OLA_MAPS_PROJECT_ID=...
EXPO_PUBLIC_OLA_MAPS_CLIENT_ID=...
EXPO_PUBLIC_ADMOB_APP_ID_ANDROID=...
EXPO_PUBLIC_ADMOB_APP_ID_IOS=...
EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID=...
EXPO_PUBLIC_ADMOB_INTERSTITIAL_IOS=...
EXPO_PUBLIC_ADMOB_ACTIVITY_BANNER_ANDROID=...
EXPO_PUBLIC_ADMOB_ACTIVITY_BANNER_IOS=...
EXPO_PUBLIC_ADMOB_DISCOVERY_BANNER_ANDROID=...
EXPO_PUBLIC_ADMOB_DISCOVERY_BANNER_IOS=...
EXPO_PUBLIC_ADMOB_INTERSTITIAL_CREATION_ANDROID=...
```

Important:

- `EXPO_PUBLIC_API_URL` must point to the backend domain.
- `EXPO_PUBLIC_SHARE_BASE_URL` controls the links the app shares with other people.
- If you want shared trip links to open a separate web site, set `EXPO_PUBLIC_SHARE_BASE_URL` to that site.

### 3. Optional separate share-link Vercel project

If you want the public trip links to live on their own Vercel domain, the easiest option is:

- Deploy `web-client/` to that domain
- Use the existing `/trip/[id]` route as the share-link landing page

Then set:

```bash
EXPO_PUBLIC_SHARE_BASE_URL=https://share.myridepartner.com
```

This works because the mobile app already generates links like:

```text
https://share.myridepartner.com/trip/<documentId>
```

and `web-client/app/trip/[id]/page.tsx` already supports that route.

## Backend deployment

Deploy `backend/` separately on your API host and set at minimum:

```bash
DATABASE_URL=...
PORT=3000
GOOGLE_CLIENT_IDS=comma,separated,google,client,ids
JWT_SECRET=replace-with-real-secret
```

After deploy:

- run `npm run seed:app-sources` if needed
- run `npm run create:super-admin` from `backend/` if you need admin access in `web-client`

## Domain wiring example

Example fully separated setup:

- Backend: `https://api.myridepartner.com`
- Web client with embedded admin routes: `https://admin-web.myridepartner.com`
- Share links: `https://share.myridepartner.com`
- Mobile app API target: `https://api.myridepartner.com`

In that setup:

- `web-client` on `admin-web.myridepartner.com` uses `NEXT_PUBLIC_API_URL=https://api.myridepartner.com`
- `client` uses `EXPO_PUBLIC_API_URL=https://api.myridepartner.com`
- `client` uses `EXPO_PUBLIC_SHARE_BASE_URL=https://share.myridepartner.com`

## CORS note

Right now the backend uses:

- `app.enableCors()` in `backend/src/main.ts`
- `origin: '*'` for sockets in `backend/src/events/events.gateway.ts`

That means separate frontend domains will work without extra CORS changes, but it is permissive.

If you want production hardening later, restrict CORS to your actual frontend domains, for example:

- `https://admin-web.myridepartner.com`
- `https://share.myridepartner.com`
- any Expo web domain you intentionally use

## Simplest path

If your goal is "everything separate" with the least amount of work:

1. Deploy `backend/` to your API host.
2. Deploy `web-client/` to a Vercel project.
3. Point `NEXT_PUBLIC_API_URL` to the backend domain.
4. Keep `client/` as Expo mobile.
5. Set `EXPO_PUBLIC_API_URL` to the backend domain.
6. Set `EXPO_PUBLIC_SHARE_BASE_URL` to whichever public web domain should receive `/trip/:id` links.
