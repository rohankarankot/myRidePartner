import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateReportDto } from './dto/reports.dto';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(reporterId: number, dto: CreateReportDto) {
    const reportedUser = await this.prisma.user.findUnique({
      where: { id: dto.reportedUserId },
    });

    if (!reportedUser) {
      throw new NotFoundException('Reported user not found');
    }

    const report = await this.prisma.userReport.create({
      data: {
        reason: dto.reason,
        details: dto.details,
        source: dto.source,
        tripDocumentId: dto.tripDocumentId,
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

  async getAllReports() {
    const reports = await this.prisma.userReport.findMany({
      include: {
        reportedUser: { select: { id: true, username: true, email: true } },
        reporter: { select: { id: true, username: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return { data: reports };
  }
}
