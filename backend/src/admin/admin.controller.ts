import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiBody,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminListQueryDto } from './dto/admin-list-query.dto';
import { AdminReportsQueryDto } from './dto/admin-reports-query.dto';
import { UpdateReportReviewDto } from './dto/update-report-review.dto';
import { AdminTripStatusDto } from './dto/admin-trip-status.dto';
import { AdminUserBlockDto } from './dto/admin-user-block.dto';
import { AdminUserAccountDto } from './dto/admin-user-account.dto';
import { AdminNotificationsQueryDto } from './dto/admin-notifications-query.dto';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Get dashboard stats',
    description: 'Returns system-wide stats for the admin dashboard',
  })
  async getStats() {
    return this.adminService.getStats();
  }

  @Get('users')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'List users (paginated)' })
  async getUsers(@Query() query: AdminListQueryDto) {
    return this.adminService.getUsers(query);
  }

  @Get('users/:id/support')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'User support snapshot (360 view)' })
  async getUserSupport(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getUserSupportSnapshot(id);
  }

  @Patch('users/:id/block')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBody({ type: AdminUserBlockDto })
  @ApiOperation({ summary: 'Block or unblock a user' })
  async setUserBlock(
    @Req() req: { user: { id: number } },
    @Param('id', ParseIntPipe) id: number,
    @Body() body: AdminUserBlockDto,
  ) {
    return this.adminService.setUserBlocked(req.user.id, id, body.blocked);
  }

  @Patch('users/:id/account-status')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBody({ type: AdminUserAccountDto })
  @ApiOperation({ summary: 'Set account status (ACTIVE / PAUSED)' })
  async setUserAccountStatus(
    @Req() req: { user: { id: number } },
    @Param('id', ParseIntPipe) id: number,
    @Body() body: AdminUserAccountDto,
  ) {
    return this.adminService.setUserAccountStatus(
      req.user.id,
      id,
      body.accountStatus,
    );
  }

  @Get('trips')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'List trips (paginated)' })
  async getTrips(@Query() query: AdminListQueryDto) {
    return this.adminService.getTrips(query);
  }

  @Patch('trips/:documentId/status')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBody({ type: AdminTripStatusDto })
  @ApiOperation({ summary: 'Update trip status (e.g. cancel)' })
  async setTripStatus(
    @Req() req: { user: { id: number } },
    @Param('documentId') documentId: string,
    @Body() body: AdminTripStatusDto,
  ) {
    return this.adminService.setTripStatus(req.user.id, documentId, body);
  }

  @Get('requests')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'List join requests (paginated)' })
  async getJoinRequests(@Query() query: AdminListQueryDto) {
    return this.adminService.getJoinRequests(query);
  }

  @Get('reports')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'List user reports (paginated)' })
  async getReports(@Query() query: AdminReportsQueryDto) {
    return this.adminService.getReports(query);
  }

  @Patch('reports/:documentId')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBody({ type: UpdateReportReviewDto })
  @ApiOperation({ summary: 'Update report review status' })
  async patchReport(
    @Req() req: { user: { id: number } },
    @Param('documentId') documentId: string,
    @Body() body: UpdateReportReviewDto,
  ) {
    return this.adminService.updateReportReview(req.user.id, documentId, body);
  }

  @Get('notifications')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Notification log (paginated)' })
  async getNotifications(@Query() query: AdminNotificationsQueryDto) {
    return this.adminService.getNotificationsLog(query);
  }
}
