import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CommunityGroupRole, CommunityGroupStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { EventsGateway } from '../events/events.gateway';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateGroupMessageDto, GetGroupMessagesQueryDto } from './dto/community-groups.dto';

const groupMessageSenderSelect = {
  id: true,
  username: true,
  email: true,
  userProfile: {
    select: {
      avatar: true,
      fullName: true,
    },
  },
} satisfies Prisma.UserSelect;

@Injectable()
export class CommunityGroupsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventsGateway: EventsGateway,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createGroup(creatorId: number, name: string, description?: string) {
    const group = await this.prisma.communityGroup.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        creatorId,
        members: {
          create: {
            userId: creatorId,
            role: CommunityGroupRole.ADMIN,
          },
        },
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            email: true,
            userProfile: {
              select: { fullName: true, avatar: true },
            },
          },
        },
        _count: { select: { members: true } },
      },
    });

    return {
      ...group,
      memberCount: group._count.members,
      _count: undefined,
    };
  }

  async getApprovedGroups(page = 1, pageSize = 20) {
    const take = Math.min(Math.max(pageSize, 1), 50);
    const skip = (Math.max(page, 1) - 1) * take;

    const [groups, total] = await Promise.all([
      this.prisma.communityGroup.findMany({
        where: { status: CommunityGroupStatus.APPROVED },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: {
          creator: {
            select: {
              id: true,
              username: true,
              email: true,
              userProfile: {
                select: { fullName: true, avatar: true },
              },
            },
          },
          _count: { select: { members: true } },
        },
      }),
      this.prisma.communityGroup.count({
        where: { status: CommunityGroupStatus.APPROVED },
      }),
    ]);

    return {
      data: groups.map((group) => ({
        ...group,
        memberCount: group._count.members,
        _count: undefined,
      })),
      meta: {
        pagination: {
          page: Math.max(page, 1),
          pageSize: take,
          pageCount: Math.ceil(total / take),
          total,
        },
      },
    };
  }

  async getMyGroups(userId: number) {
    const groups = await this.prisma.communityGroup.findMany({
      where: {
        OR: [
          { creatorId: userId },
          { members: { some: { userId } } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            email: true,
            userProfile: {
              select: { fullName: true, avatar: true },
            },
          },
        },
        _count: { select: { members: true } },
      },
    });

    return groups.map((group) => ({
      ...group,
      memberCount: group._count.members,
      _count: undefined,
    }));
  }

  async getGroupDetail(documentId: string) {
    const group = await this.prisma.communityGroup.findUnique({
      where: { documentId },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            email: true,
            userProfile: {
              select: { fullName: true, avatar: true },
            },
          },
        },
        members: {
          orderBy: { createdAt: 'asc' },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                userProfile: {
                  select: { fullName: true, avatar: true, city: true },
                },
              },
            },
          },
        },
      },
    });

    if (!group) {
      throw new NotFoundException('Community group not found');
    }

    return group;
  }

  async addMember(documentId: string, adminUserId: number, targetUserId: number) {
    const group = await this.prisma.communityGroup.findUnique({
      where: { documentId },
      select: { id: true, status: true },
    });

    if (!group) {
      throw new NotFoundException('Community group not found');
    }

    await this.assertGroupAdmin(group.id, adminUserId);

    // Verify target user exists and has given community consent
    const targetUser = await this.prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, userProfile: { select: { communityConsent: true } } },
    });

    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    if (!targetUser.userProfile?.communityConsent) {
      throw new BadRequestException('This person had not given consent to join the community. Please ask him for consent and try again.');
    }

    try {
      await this.prisma.communityGroupMember.create({
        data: {
          groupId: group.id,
          userId: targetUserId,
          role: CommunityGroupRole.MEMBER,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('User is already a member of this group');
      }
      throw error;
    }

    return { message: 'Member added successfully' };
  }

  async removeMember(documentId: string, adminUserId: number, targetUserId: number) {
    const group = await this.prisma.communityGroup.findUnique({
      where: { documentId },
      select: { id: true, creatorId: true },
    });

    if (!group) {
      throw new NotFoundException('Community group not found');
    }

    await this.assertGroupAdmin(group.id, adminUserId);

    if (targetUserId === group.creatorId) {
      throw new BadRequestException('Cannot remove the group creator');
    }

    const membership = await this.prisma.communityGroupMember.findUnique({
      where: { groupId_userId: { groupId: group.id, userId: targetUserId } },
    });

    if (!membership) {
      throw new NotFoundException('User is not a member of this group');
    }

    await this.prisma.communityGroupMember.delete({
      where: { id: membership.id },
    });

    return { message: 'Member removed successfully' };
  }

  async searchUsers(query: string, page = 1, pageSize = 20) {
    const take = Math.min(Math.max(pageSize, 1), 50);
    const skip = (Math.max(page, 1) - 1) * take;
    const search = query.trim();

    if (!search) {
      return { data: [], meta: { pagination: { page: 1, pageSize: take, pageCount: 0, total: 0 } } };
    }

    const where: Prisma.UserWhereInput = {
      OR: [
        { email: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
        {
          userProfile: {
            fullName: { contains: search, mode: 'insensitive' },
          },
        },
      ],
    };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          username: true,
          email: true,
          userProfile: {
            select: { fullName: true, avatar: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        pagination: {
          page: Math.max(page, 1),
          pageSize: take,
          pageCount: Math.ceil(total / take),
          total,
        },
      },
    };
  }

  async getGroupMessages(userId: number, documentId: string, query?: GetGroupMessagesQueryDto) {
    const group = await this.prisma.communityGroup.findUnique({
      where: { documentId },
      select: { id: true },
    });

    if (!group) {
      throw new NotFoundException('Community group not found');
    }

    await this.assertIsGroupMember(group.id, userId);

    const limit = Math.min(Math.max(Number(query?.limit ?? 40), 1), 100);
    const cursor = query?.cursor;
    const cursorMessage = cursor
      ? await this.prisma.communityGroupMessage.findFirst({
          where: { documentId: cursor, groupId: group.id },
          select: { id: true, createdAt: true },
        })
      : null;

    const messages = await this.prisma.communityGroupMessage.findMany({
      where: cursorMessage
        ? {
            groupId: group.id,
            OR: [
              { createdAt: { lt: cursorMessage.createdAt } },
              {
                createdAt: cursorMessage.createdAt,
                id: { lt: cursorMessage.id },
              },
            ],
          }
        : { groupId: group.id },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit + 1,
      include: {
        sender: {
          select: groupMessageSenderSelect,
        },
        replyTo: {
          include: {
            sender: {
              select: groupMessageSenderSelect,
            },
          },
        },
      },
    });

    const hasMore = messages.length > limit;
    const selectedMessages = (hasMore ? messages.slice(0, limit) : messages).reverse();

    return {
      messages: selectedMessages.map((message) => ({
        id: message.id,
        documentId: message.documentId,
        message: message.message,
        createdAt: message.createdAt,
        sender: message.sender,
        replyTo: message.replyTo,
      })),
      hasMore,
      nextCursor: selectedMessages[0]?.documentId ?? null,
    };
  }

  async createGroupMessage(userId: number, documentId: string, body: CreateGroupMessageDto) {
    const group = await this.prisma.communityGroup.findUnique({
      where: { documentId },
      select: { 
        id: true,
        name: true,
        members: { select: { userId: true } },
      },
    });

    if (!group) {
      throw new NotFoundException('Community group not found');
    }

    await this.assertIsGroupMember(group.id, userId);

    const trimmedMessage = body.message.trim();

    let replyToId: number | undefined;
    if (body.replyToDocumentId) {
      const referencedMessage = await this.prisma.communityGroupMessage.findFirst({
        where: { documentId: body.replyToDocumentId, groupId: group.id },
        select: { id: true },
      });
      if (referencedMessage) {
        replyToId = referencedMessage.id;
      }
    }

    const message = await this.prisma.communityGroupMessage.create({
      data: {
        senderId: userId,
        groupId: group.id,
        message: trimmedMessage,
        replyToId,
      },
      include: {
        sender: {
          select: groupMessageSenderSelect,
        },
        replyTo: {
          include: {
            sender: {
              select: groupMessageSenderSelect,
            },
          },
        },
      },
    });

    const payload = {
      id: message.id,
      documentId: message.documentId,
      message: message.message,
      createdAt: message.createdAt,
      sender: message.sender,
      replyTo: message.replyTo,
      groupId: documentId,
    };

    this.eventsGateway.emitToGroupChatRoom(documentId, 'group_chat_message_created', payload);

    const senderFullName = message.sender.userProfile?.fullName;
    const notificationSenderName = senderFullName ? senderFullName.split(' ')[0] : (message.sender.username || 'A member');

    const notificationMessage = message.message.length > 50 
        ? message.message.substring(0, 47) + '...'
        : message.message;

    void Promise.all(
      group.members
        .filter((m) => m.userId !== userId)
        .map((member) =>
          this.notificationsService.sendPushOnly({
            userId: member.userId,
            title: `New message in ${group.name}`,
            message: `${notificationSenderName}: ${notificationMessage}`,
            data: {
              url: `/community-group-chat/${documentId}`,
              groupId: documentId,
              screen: 'community-group-chat',
              messageDocumentId: message.documentId,
            },
            threadId: documentId,
            image: message.sender.userProfile?.avatar || undefined,
          }),
        ),
    );

    return payload;
  }

  private async assertGroupAdmin(groupId: number, userId: number) {
    const membership = await this.prisma.communityGroupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });

    if (!membership || membership.role !== CommunityGroupRole.ADMIN) {
      throw new ForbiddenException('Only the group admin can perform this action');
    }
  }

  private async assertIsGroupMember(groupId: number, userId: number) {
    const membership = await this.prisma.communityGroupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });

    if (!membership) {
      throw new ForbiddenException('You must be a member of this group to view or send messages');
    }
  }

  /**
   * Permanently deletes all community-related data for a user.
   * Called by the cleanup cron job after the 30-day grace period.
   */
  async cleanupUserCommunityData(userId: number) {
    // 1. Delete all messages sent by the user in any community group
    await this.prisma.communityGroupMessage.deleteMany({
      where: { senderId: userId },
    });

    // 2. Delete all community groups created by the user
    // Note: This will also delete members and messages within those groups due to Cascade onDelete
    await this.prisma.communityGroup.deleteMany({
      where: { creatorId: userId },
    });

    // 3. Delete all memberships of the user (in groups they didn't create)
    await this.prisma.communityGroupMember.deleteMany({
      where: { userId: userId },
    });
  }
}
