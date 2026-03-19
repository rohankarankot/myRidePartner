import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get dashboard stats', description: 'Returns system-wide stats for the admin dashboard' })
  async getStats() {
    return this.adminService.getStats();
  }

  @Get('users')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all users', description: 'Returns all users for management' })
  async getUsers() {
    return this.adminService.getUsers();
  }

  @Get('trips')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all trips', description: 'Returns all trips for management' })
  async getTrips() {
    return this.adminService.getTrips();
  }

  @Get('requests')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all join requests', description: 'Returns all join requests for management' })
  async getJoinRequests() {
    return this.adminService.getJoinRequests();
  }
}
