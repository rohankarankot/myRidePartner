# Codebase STACK.md

**Date**: 2026-05-03

## Overview
This is a monorepo consisting of a NestJS backend, an Expo React Native mobile application, and a Next.js web application for the backoffice dashboard and landing pages.

## Backend (`/backend`)
- **Language**: TypeScript
- **Runtime**: Node.js
- **Framework**: NestJS (v11)
- **Database**: PostgreSQL
- **ORM**: Prisma (v7)
- **Authentication**: Passport.js with JWT Strategy
- **Real-time**: Socket.io (websockets)
- **File Storage**: Cloudinary integration
- **Push Notifications**: Expo Server SDK, Firebase Admin SDK
- **OAuth**: Google Auth Library
- **Tools**: Prettier, ESLint, Jest for testing

## Mobile Client (`/client`)
- **Language**: TypeScript
- **Framework**: React Native (0.81) via Expo (v54)
- **Routing**: Expo Router (file-based routing)
- **State Management**: Zustand, TanStack React Query (v5)
- **Styling**: NativeWind (v4), Gluestack-UI (v3)
- **Icons**: @expo/vector-icons
- **Maps/Location**: expo-location
- **Ads**: react-native-google-mobile-ads
- **Chat**: react-native-gifted-chat
- **Authentication**: @react-native-google-signin/google-signin
- **Analytics/Firebase**: @react-native-firebase/app, @react-native-firebase/analytics
- **Websockets**: socket.io-client
- **Animations**: Lottie, react-native-reanimated, @legendapp/motion
- **Testing**: Maestro (smoke tests via `.maestro/`)

## Web Client (`/web-client`)
- **Language**: TypeScript
- **Framework**: Next.js (v16.2.2) using App Router
- **Authentication**: Next-Auth (v5 beta)
- **Styling**: Tailwind CSS (v4), PostCSS
- **Components**: Radix UI primitives, Lucide React (icons)
- **State Management**: Zustand, Nuqs (URL state management)
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts
- **Drag and Drop**: @dnd-kit
- **Tables**: @tanstack/react-table
- **Command Palette**: Kbar
- **Tools**: ESLint, Prettier, Husky, lint-staged
