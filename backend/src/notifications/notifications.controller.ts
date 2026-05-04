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
  Inject,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { NotificationType } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { parsePagination } from '@app/common';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'List notifications', description: 'Get paginated notifications, optionally filtered by user and read status' })
  @ApiQuery({ name: 'userId', required: false, example: 5 })
  @ApiQuery({ name: 'read', required: false, enum: ['true', 'false'] })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, example: 25 })
  async findAll(
    @Query('userId') userId?: string,
    @Query('read') read?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const pagination = parsePagination({ page, pageSize });

    const filters: any = {};
    if (userId) filters.userId = parseInt(userId, 10);
    if (read !== undefined && read !== '') filters.read = read === 'true';

    return { pagination, filters };
  }

  @Post('test')
  @ApiOperation({ summary: 'Send a test notification', description: 'Triggers a persistent test notification for a specific user' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'number', example: 1 },
        title: { type: 'string', example: 'Test Notification' },
        message: { type: 'string', example: 'This is a test notification from the API!' },
      },
      required: ['userId'],
    },
  })
  async sendTestNotification(@Body() body: { userId: number; title?: string; message?: string }) {
    return {
      title: body.title || 'Test Notification',
      message: body.message || 'This is a test notification from the API!',
      type: NotificationType.SYSTEM,
      userId: body.userId,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('unread-count/:userId')
  @ApiOperation({ summary: 'Get unread notification count' })
  @ApiParam({ name: 'userId', example: 5 })
  async getUnreadCount(@Param('userId') userId: string) {
    return { userId: parseInt(userId, 10), unreadCount: 0 };
  }

  @UseGuards(JwtAuthGuard)
  @Put(':documentId/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiParam({ name: 'documentId', description: 'Notification document ID' })
  async markAsRead(@Param('documentId') documentId: string) {
    return { documentId };
  }

  @UseGuards(JwtAuthGuard)
  @Put('read-all/:userId')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiParam({ name: 'userId', example: 5 })
  async markAllAsRead(@Param('userId') userId: string) {
    return { userId: parseInt(userId, 10) };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':documentId')
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiParam({ name: 'documentId' })
  async delete(@Param('documentId') documentId: string) {
    return { documentId };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('all/:userId')
  @ApiOperation({ summary: 'Delete all notifications for a user' })
  @ApiParam({ name: 'userId', example: 5 })
  async deleteAll(@Param('userId') userId: string) {
    return { userId: parseInt(userId, 10) };
  }
}
