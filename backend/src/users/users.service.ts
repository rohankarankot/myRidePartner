import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ 
      where: { email },
      include: { userProfile: true }
    });
  }

  async findById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({ 
      where: { id },
      include: { userProfile: true }
    });
  }

  async update(id: number, data: any): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
      include: { userProfile: true }
    });
  }

  async createWithGoogle(email: string, name: string, picture: string): Promise<User> {
    const username = email.split('@')[0];
    return this.prisma.user.create({
      data: {
        email,
        username,
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
