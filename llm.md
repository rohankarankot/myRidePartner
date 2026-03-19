# My Ride Partner - Context for AI Agents

## Overview
**My Ride Partner** is a premium carpooling/ride-sharing application designed to connect **Captains** (drivers) with passengers looking for shared travel. Unlike generic taxi apps, this focuses on scheduled inter-city or intra-city shared rides with a focus on trust, community, and real-time coordination.

## Core Features
- **Trip Management**: Captains can create trips with specific destinations, starting points, dates, and available seat counts.
- **Join Requests**: Passengers search for trips and send requests to join. Captains can approve or reject these requests. 
- **Real-time Infrastructure**:
    - **In-App (Socket.io)**: Instant UI updates for status changes, new requests, and notifications without polling.
    - **Background (Push Notifications)**: Background alerts via Expo/Firebase for critical updates when the app is closed.
- **Rating System**: Post-trip ratings for Captains and passengers to build community trust.
- **Profile Statistics**: Tracking "Completed Trips" and "Average Rating" for users.

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
1. **Action**: A user performs an action (e.g., requests a seat).
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
