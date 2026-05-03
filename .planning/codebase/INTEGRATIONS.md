# Codebase INTEGRATIONS.md

**Date**: 2026-05-03

## External APIs and Services

### Authentication & Identity
- **Google OAuth**: Integrated on the backend via `google-auth-library` to verify Google Identity tokens. On the mobile client, `@react-native-google-signin/google-signin` handles the native sign-in flow.
- **Next-Auth**: Used on the `web-client` for handling web authentication sessions for the backoffice dashboard.
- **Passport JWT**: The backend issues JWTs for internal API authentication across both web and mobile clients.

### Database
- **PostgreSQL**: Primary relational database, managed via Prisma ORM on the backend.

### Push Notifications
- **Expo Push Notifications**: The backend uses `expo-server-sdk` to send push notifications to mobile devices. The mobile client registers device tokens via `expo-notifications`.
- **Firebase Admin**: The backend has `firebase-admin` service accounts configured (as seen by `.json` keys in the project) for potentially direct FCM capabilities.

### Analytics and Monetization
- **Firebase Analytics**: Integrated into the mobile app via `@react-native-firebase/analytics` to track user behavior and events.
- **Google AdMob**: Used in the mobile client for advertising via `react-native-google-mobile-ads`.

### Media & Storage
- **Cloudinary**: The backend integrates with the `cloudinary` Node.js SDK to securely upload and host user profile images and chat media.

### Real-time Communication
- **Socket.io**: Used for real-time messaging, community chats, and trip chat synchronization. The backend implements `@nestjs/websockets`, and the clients use `socket.io-client`.
