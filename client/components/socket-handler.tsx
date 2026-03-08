import React from 'react';
import { useSocketEvents } from '@/hooks/use-socket-events';

/**
 * SocketHandler is a headless component that initializes socket event listeners
 * and manages global real-time state updates.
 * 
 * It must be rendered inside AuthProvider and QueryClientProvider.
 */
export function SocketHandler() {
    useSocketEvents();
    return null;
}
