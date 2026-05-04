import { Injectable } from '@nestjs/common';

@Injectable()
export class ExpoPushService {
  async sendNotification(
    _pushToken: string,
    _title: string,
    _message: string,
    _data?: Record<string, unknown>,
    _opts?: { threadId?: string; image?: string },
  ) {
    return;
  }
}
