# MyRidePartner Backoffice

Admin dashboard for MyRidePartner built with Next.js, shadcn/ui, and `next-auth` credentials login.

## Authentication

- Backoffice login uses the backend `/api/auth/login` endpoint with email, password, and the `myridepartner` source.
- Only users with the `SUPER_ADMIN` role can access the dashboard.

## Local Setup

1. Install dependencies with `bun install` or `npm install`.
2. Copy `env.example.txt` to `.env.local`.
3. Set `NEXT_PUBLIC_API_URL` to the Nest backend URL.
4. Set `AUTH_SECRET` for the NextAuth session secret.
5. Optionally set `BACKOFFICE_ADMIN_EMAIL` and `BACKOFFICE_ADMIN_PASSWORD` in the backend env.
6. Start the backend, then start the backoffice with `bun run dev` or `npm run dev`.

## Admin Bootstrap

Create or update the local super admin from the backend folder:

```bash
npm run create:super-admin
```

List current super admins:

```bash
npm run list:super-admins
```

Default bootstrap credentials are:

- Email: `admin@myridepartner.com`
- Password: `AdminPassword123!`

Override them by setting `BACKOFFICE_ADMIN_EMAIL` and `BACKOFFICE_ADMIN_PASSWORD` in `backend/.env`.

## Notes

- The backoffice expects the backend to expose admin APIs under `/api/admin/*`.
- `NEXT_PUBLIC_LOGIN_SOURCE` defaults to `myridepartner`.
- Non-admin accounts can authenticate against the backend, but they are blocked from the backoffice UI and middleware.
