# Maestro tests

These flows cover a small smoke-test layer for the Expo app in this folder.

## What is included

- `smoke/onboarding-to-login.yaml`
  Verifies a fresh install opens onboarding and that `Skip` lands on the login screen.
- `smoke/login-terms-screen.yaml`
  Verifies the terms link from login opens the legal screen.
- `smoke/onboarding-is-persisted.yaml`
  Verifies onboarding is not shown again after it has been skipped once.

## Before you run them

1. Install the Maestro CLI if you do not already have it:

   ```bash
   curl -Ls "https://get.maestro.mobile.dev" | bash
   ```

2. Boot an iOS Simulator or Android Emulator.
3. Build and install the app once on that simulator/device.

For Expo development builds, the usual flow is:

```bash
npm run ios
```

or

```bash
npm run android
```

## Run the suite

```bash
npm run maestro:test
```

Or just the smoke folder:

```bash
npm run maestro:test:smoke
```

You can also run a single flow directly:

```bash
maestro test .maestro/smoke/onboarding-to-login.yaml
```

## Notes

- These tests intentionally stay on unauthenticated screens for now.
- Google Sign-In, location permission prompts, and live backend state make authenticated flows flaky unless we add dedicated test hooks or a test-only login path.
- The app id used by the flows is `com.rohanalwayscodes.myridepartner`, which matches the Expo config in this repo.
