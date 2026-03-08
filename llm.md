# My Ride Partner - Context for AI Agents

## Overview
**My Ride Partner** is a premium carpooling/ride-sharing application designed to connect drivers ("Captains") with passengers looking for shared travel. Unlike generic taxi apps, this focuses on scheduled inter-city or intra-city shared rides with a focus on trust, community, and real-time coordination.

## Core Features
- **Trip Management**: Captains can create trips with specific destinations, starting points, dates, and available seat counts.
- **Join Requests**: Passengers search for trips and send requests to join. Captains can approve or reject these requests. 
- **Real-time Infrastructure**:
    - **In-App (Socket.io)**: Instant UI updates for status changes, new requests, and notifications without polling.
    - **Background (Push Notifications)**: Background alerts via Expo/Firebase for critical updates when the app is closed.
- **Rating System**: Post-trip ratings for Captains to build community trust.
- **Profile Statistics**: Tracking "Completed Trips" and "Average Rating" for users.

## Technical Architecture
### Frontend (Client)
- **Framework**: React Native with Expo (Managed Workflow) and Expo Router.
- **Data Fetching**: TanStack Query (React Query) for server state and cache management.
- **Styling**: Premium UI design using vanilla React Native `StyleSheet`, featuring glassmorphism and modern aesthetics.
- **Communication**: `socket.io-client` for persistent real-time event listeners.

### Backend (Strapi)
- **Framework**: Strapi v5 (Headless CMS).
- **Database**: PostgreSQL (Production-ready).
- **Real-time Service**: Custom Socket.io integration attached to the Strapi bootstrap flow.
- **Lifecycle Hooks**: Heavy use of Strapi lifecycles (`afterCreate`, `afterUpdate`) to automate notifications, seat count management, and socket emissions.
- **Publishing Logic**: Uses Strapi v5's Draft/Publish system; lifecycles handle automatic publishing for critical updates (like seat counts).

## Communication Flow
1. **Action**: A user performs an action (e.g., requests a seat).
2. **Backend**: Strapi lifecycle hook detects the change.
3. **Trigger**: Lifecycle creates a `Notification` record.
4. **Broadcast**:
    - `afterCreate` hook on `Notification` triggers a **Push Notification** via `ExpoPushService`.
    - Simultaneously emits a **Socket.io event** to the relevant user's room.
5. **Client**: 
    - `useSocketEvents` hook invalidates relevant TanStack Query keys.
    - UI refreshes instantly without page reload.

## Development Constraints
- Always use the computer's Local IP (e.g., `192.168.1.XX`) for `STRAPI_URL` when testing on physical devices.
- Socket.io should use both `polling` and `websocket` transports for robust mobile connectivity.
- Any manual trip management update in Strapi must be followed by a `.publish()` call to be visible to the `find` APIs.
