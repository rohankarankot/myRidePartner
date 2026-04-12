import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CommunityGroupsService } from './community-groups.service';
import {
  CreateGroupDto,
  AddMemberDto,
  SearchUsersQueryDto,
  CreateGroupMessageDto,
  GetGroupMessagesQueryDto,
} from './dto/community-groups.dto';

@ApiTags('Community Groups')
@Controller('community-groups')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CommunityGroupsController {
  constructor(private readonly service: CommunityGroupsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new community group (status: PENDING)' })
  async create(
    @Req() req: { user: { id: number } },
    @Body() body: CreateGroupDto,
  ) {
    return this.service.createGroup(req.user.id, body.name, body.description);
  }

  @Get()
  @ApiOperation({ summary: 'List approved community groups (paginated)' })
  async listApproved(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.service.getApprovedGroups(
      Number(page) || 1,
      Number(pageSize) || 20,
    );
  }

  @Get('mine')
  @ApiOperation({ summary: 'List groups the current user belongs to' })
  async listMine(@Req() req: { user: { id: number } }) {
    return this.service.getMyGroups(req.user.id);
  }

  @Get('search-users')
  @ApiOperation({ summary: 'Search users by name or email' })
  async searchUsers(@Query() query: SearchUsersQueryDto) {
    return this.service.searchUsers(
      query.q,
      Number(query.page) || 1,
      Number(query.pageSize) || 20,
    );
  }

  @Get(':documentId')
  @ApiOperation({ summary: 'Get group detail with members' })
  async getDetail(@Param('documentId') documentId: string) {
    return this.service.getGroupDetail(documentId);
  }

  @Post(':documentId/members')
  @ApiOperation({ summary: 'Add a member to the group (admin only)' })
  async addMember(
    @Req() req: { user: { id: number } },
    @Param('documentId') documentId: string,
    @Body() body: AddMemberDto,
  ) {
    return this.service.addMember(documentId, req.user.id, body.userId);
  }

  @Delete(':documentId/members/:userId')
  @ApiOperation({ summary: 'Remove a member from the group (admin only)' })
  async removeMember(
    @Req() req: { user: { id: number } },
    @Param('documentId') documentId: string,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.service.removeMember(documentId, req.user.id, userId);
  }

  @Get(':documentId/messages')
  @ApiOperation({ summary: 'Get community group chat messages' })
  async getMessages(
    @Req() req: { user: { id: number } },
    @Param('documentId') documentId: string,
    @Query() query: GetGroupMessagesQueryDto,
  ) {
    return this.service.getGroupMessages(req.user.id, documentId, query);
  }

  @Post(':documentId/messages')
  @ApiOperation({ summary: 'Send a message in community group chat' })
  async createMessage(
    @Req() req: { user: { id: number } },
    @Param('documentId') documentId: string,
    @Body() body: CreateGroupMessageDto,
  ) {
    return this.service.createGroupMessage(req.user.id, documentId, body);
  }
}
