# Project: myRidePartner

## What This Is
myRidePartner is a comprehensive ride-sharing and community platform built on a unified multi-app backend. It provides a mobile experience for users to discover and join trips, chat with ride partners, and engage in community groups. A centralized backoffice dashboard allows administrators to manage users, reports, and trips. The backend supports a multi-app architecture allowing multiple distinct app sources to share the same user pool and authentication system.

## Core Value
Providing a safe, real-time, and scalable platform for users to find ride partners, manage trips, and communicate, while offering robust administrative controls and cross-app identity management.

## Requirements

### Validated

- ✓ [Multi-app Authentication] — The backend manages users for multiple apps (myridepartner, interport) via a shared user table and `AppSource` tracking.
- ✓ [Trip Management] — Users can create, discover, and join trips.
- ✓ [Community Groups] — Users can form and join community groups.
- ✓ [Real-time Chat] — Socket.io integrated for live messaging within trips and community groups.
- ✓ [Push Notifications] — Expo and FCM integrations for timely alerts.
- ✓ [Backoffice Admin] — Next.js dashboard for managing users, trips, reports, and overall system health.
- ✓ [Monetization] — AdMob integrated into the mobile client.

### Active

- [ ] Support future feature expansions and maintenance cycles

### Out of Scope

- [None yet]

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Shared User Pool | Allows seamless expansion to future related apps without duplicating auth systems | — Pending |
| NativeWind & Gluestack | Provides utility-first styling with accessible, robust component foundations | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-03 after initialization*
