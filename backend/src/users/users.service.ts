import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async createWithGoogle(email: string, name: string, picture: string): Promise<User> {
    return this.prisma.user.create({
      data: {
        email,
        provider: "google",
        confirmed: true,
        userProfile: {
          create: {
            fullName: name,
            avatar: picture,
          },
        },
      },
    });
  }
}
