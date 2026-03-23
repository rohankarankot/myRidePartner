import { Controller, Post, Body, UseGuards, Get, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateReportDto } from './dto/reports.dto';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a user report', description: 'Submit a report for another user' })
  @ApiBody({ type: CreateReportDto })
  create(@Request() req: any, @Body() dto: CreateReportDto) {
    return this.reportsService.create(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all reports', description: 'Returns all submitted reports (Admin view simulation)' })
  findAll() {
    return this.reportsService.getAllReports();
  }
}
