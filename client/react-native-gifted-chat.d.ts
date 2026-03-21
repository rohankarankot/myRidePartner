declare module 'react-native-gifted-chat' {
  import * as React from 'react';

  export interface IUser {
    _id: string | number;
    name?: string;
    avatar?: string;
  }

  export interface IMessage {
    _id: string | number;
    text: string;
    createdAt: Date | number;
    user: IUser;
    sent?: boolean;
    received?: boolean;
    pending?: boolean;
  }

  export const GiftedChat: React.ComponentType<any>;
  export const Bubble: React.ComponentType<any>;
  export const InputToolbar: React.ComponentType<any>;
  export const Send: React.ComponentType<any>;
}
