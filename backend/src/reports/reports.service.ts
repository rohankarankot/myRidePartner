import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ReportSource, ReportTargetType } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { CreateReportDto } from './dto/reports.dto';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(reporterId: number, dto: CreateReportDto) {
    if (reporterId === dto.reportedUserId) {
      throw new BadRequestException('You cannot report yourself');
    }

    const reportedUser = await this.prisma.user.findUnique({
      where: { id: dto.reportedUserId },
    });

    if (!reportedUser) {
      throw new NotFoundException('Reported user not found');
    }

    const targetType = dto.targetType ?? ReportTargetType.USER;
    const messageContext =
      targetType === ReportTargetType.MESSAGE
        ? await this.validateReportedMessage(dto)
        : null;

    const report = await this.prisma.userReport.create({
      data: {
        reason: dto.reason,
        details: dto.details,
        source: dto.source,
        targetType,
        tripDocumentId: dto.tripDocumentId,
        messageDocumentId: dto.messageDocumentId,
        messagePreview: messageContext?.messagePreview ?? dto.messagePreview,
        reportedUser: { connect: { id: dto.reportedUserId } },
        reporter: { connect: { id: reporterId } },
      },
      include: {
        reportedUser: { select: { id: true, username: true, email: true } },
        reporter: { select: { id: true, username: true, email: true } },
      },
    });

    return { data: report };
  }

  private async validateReportedMessage(dto: CreateReportDto) {
    if (!dto.messageDocumentId) {
      throw new BadRequestException('Message document ID is required for message reports');
    }

    if (dto.source === ReportSource.community_chat) {
      const message = await this.prisma.publicChatMessage.findUnique({
        where: { documentId: dto.messageDocumentId },
        select: {
          documentId: true,
          message: true,
          senderId: true,
        },
      });

      if (!message) {
        throw new NotFoundException('Reported message not found');
      }

      if (message.senderId !== dto.reportedUserId) {
        throw new BadRequestException('Reported message does not belong to the selected user');
      }

      return {
        messagePreview: dto.messagePreview?.trim() || message.message.slice(0, 500),
      };
    }

    if (dto.source === ReportSource.trip_chat) {
      const message = await this.prisma.tripChatMessage.findUnique({
        where: { documentId: dto.messageDocumentId },
        select: {
          documentId: true,
          message: true,
          senderId: true,
          chat: {
            select: {
              trip: {
                select: {
                  documentId: true,
                },
              },
            },
          },
        },
      });

      if (!message) {
        throw new NotFoundException('Reported message not found');
      }

      if (message.senderId !== dto.reportedUserId) {
        throw new BadRequestException('Reported message does not belong to the selected user');
      }

      if (dto.tripDocumentId && message.chat.trip.documentId !== dto.tripDocumentId) {
        throw new BadRequestException('Reported message does not belong to this trip chat');
      }

      return {
        messagePreview: dto.messagePreview?.trim() || message.message.slice(0, 500),
      };
    }

    throw new BadRequestException('Message reports are only supported for chat sources');
  }
}
