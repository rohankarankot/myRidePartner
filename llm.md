# My Ride Partner - Context for AI Agents

## Overview
**My Ride Partner** is a **ride coordination and matchmaking app** — NOT a ride-hailing platform. It connects people who are **heading in the same direction at the same time**, so they can find each other, coordinate a common pickup point, and then **book a shared ride together on platforms like Ola, Uber, or Rapido** to split the cost.

Think of it as a **social layer on top of Ola/Uber** — the app handles the "finding your ride buddy" problem; the actual booking happens on third-party platforms.

## The Core Flow
1. **Post a Trip**: A user posts where they're going, when, from which area, and how many people they're looking to ride with.
2. **Discover & Match**: Other users heading the same way discover and request to join.
3. **Coordinate**: Matched users communicate via in-app chat to agree on a **common pickup point**.
4. **Book Together**: The group meets at the decided spot and books a single Ola/Uber/Rapido ride together, splitting the fare.

## Core Features
- **Trip Posting**: Users can post trips with starting area, destination, date, time, and available slots.
- **Trip Discovery**: Browse and search for trips by route, city, and time.
- **Join Requests**: Users request to join a trip. The trip creator can approve or reject.
- **Real-time Infrastructure**:
    - **In-App (Socket.io)**: Instant UI updates for status changes, new requests, and notifications without polling.
    - **Background (Push Notifications)**: Background alerts via Expo/Firebase for critical updates when the app is closed.
- **Trip Group Chat**: Approved members of a trip can chat to coordinate the pickup point and timing.
- **Community / Public Chat**: A global chat space for all users to interact.
- **Rating System**: Post-trip ratings to build community trust between ride partners.
- **Profile Statistics**: Tracking "Completed Trips" and "Average Rating" for users.
- **Safety Features**: User reporting, blocking, and gender preference filtering.

## Key Distinction
- The app **does NOT process payments** or provide drivers.
- The app is **not competing with Ola/Uber** — it complements them by solving the cost-splitting coordination problem.
- The concept is closer to **finding a ride buddy / travel companion** for the same route, then using existing ride platforms together.

## Technical Architecture
### Frontend (Client)
- **Framework**: React Native with Expo (Managed Workflow) and Expo Router.
- **Data Fetching**: TanStack Query (React Query) for server state and cache management.
- **Store**: Zustand for local state management (e.g., user profiles).
- **Styling**: Premium UI design using vanilla React Native `StyleSheet`, featuring glassmorphism and modern aesthetics.
- **Communication**: `socket.io-client` for persistent real-time event listeners.

### Backend (NestJS)
- **Framework**: NestJS (Node.js framework).
- **Database**: PostgreSQL with Prisma ORM.
- **Authentication**: JWT-based authentication, including Google Auth integration.
- **Real-time Service**: Socket.io integration via NestJS Gateways (`EventsModule`).
- **File Uploads**: Cloudinary integration for handling user avatars and other media.
- **Architecture**: Modular structure (Users, Trips, JoinRequests, Notifications, Ratings, etc.).

## Communication Flow
1. **Action**: A user performs an action (e.g., requests to join a trip).
2. **Backend**: NestJS Controller receives the request and calls the appropriate Service.
3. **Database**: Service updates the state via Prisma.
4. **Broadcast**:
    - `NotificationsService` creates a database record and triggers a **Push Notification**.
    - `EventsGateway` emits a **Socket.io event** to the relevant user room or trip room.
5. **Client**: 
    - TanStack Query hooks invalidate relevant keys upon receiving socket events.
    - UI refreshes instantly without page reload.

## Development Constraints
- Socket.io should use both `polling` and `websocket` transports for robust mobile connectivity.
- Use `documentId` (UUID) for public-facing route identification and lookups where possible.
- Ensure proper error handling and toast notifications for a premium user experience.
- The terms "Captain" historically exist in the codebase as the trip creator role — this refers to the **person who initiates/organizes the group**, not an actual driver.
