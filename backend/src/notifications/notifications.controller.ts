import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { parsePagination } from '../common/utils/query.utils';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List notifications', description: 'Get paginated notifications, optionally filtered by user and read status' })
  @ApiQuery({ name: 'userId', required: false, example: 5 })
  @ApiQuery({ name: 'read', required: false, enum: ['true', 'false'] })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, example: 25 })
  findAll(
    @Query('userId') userId?: string,
    @Query('read') read?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const pagination = parsePagination({ page, pageSize });

    const filters: any = {};
    if (userId) filters.userId = parseInt(userId, 10);
    if (read !== undefined && read !== '') filters.read = read === 'true';

    return this.notificationsService.findAll(pagination, filters);
  }

  @Get('unread-count/:userId')
  @ApiOperation({ summary: 'Get unread notification count' })
  @ApiParam({ name: 'userId', example: 5 })
  getUnreadCount(@Param('userId') userId: string) {
    return this.notificationsService.getUnreadCount(parseInt(userId, 10));
  }

  @Put(':documentId/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiParam({ name: 'documentId', description: 'Notification document ID' })
  markAsRead(@Param('documentId') documentId: string) {
    return this.notificationsService.markAsRead(documentId);
  }

  @Put('read-all/:userId')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiParam({ name: 'userId', example: 5 })
  markAllAsRead(@Param('userId') userId: string) {
    return this.notificationsService.markAllAsRead(parseInt(userId, 10));
  }

  @Delete(':documentId')
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiParam({ name: 'documentId' })
  delete(@Param('documentId') documentId: string) {
    return this.notificationsService.delete(documentId);
  }

  @Delete('all/:userId')
  @ApiOperation({ summary: 'Delete all notifications for a user' })
  @ApiParam({ name: 'userId', example: 5 })
  deleteAll(@Param('userId') userId: string) {
    return this.notificationsService.deleteAll(parseInt(userId, 10));
  }
}
