import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { UserProfilesService } from './user-profiles.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Gender } from '@prisma/client';
import {
  CreateUserProfileDto,
  UpdateUserProfileDto,
  RequestOrgVerificationDto,
  ConfirmOrgVerificationDto,
} from './dto/user-profiles.dto';

@ApiTags('User Profiles')
@ApiBearerAuth()
@Controller('user-profiles')
@UseGuards(JwtAuthGuard)
export class UserProfilesController {
  constructor(private readonly userProfilesService: UserProfilesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a user profile' })
  @ApiBody({ type: CreateUserProfileDto })
  create(
    @Body()
    createData: {
      fullName: string;
      phoneNumber: string;
      gender: Gender;
      userId: number;
    },
  ) {
    return this.userProfilesService.create(createData);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get profile by user ID' })
  @ApiParam({ name: 'userId', example: 1 })
  findByUserId(@Param('userId') userId: string) {
    return this.userProfilesService.findByUserId(+userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user profile' })
  @ApiParam({ name: 'id', description: 'Profile ID' })
  @ApiBody({ type: UpdateUserProfileDto })
  update(@Param('id') id: string, @Body() updateData: any) {
    return this.userProfilesService.update(+id, updateData);
  }

  @Post('me/request-org-verification')
  @ApiOperation({ summary: 'Request organization email verification' })
  @ApiBody({ type: RequestOrgVerificationDto })
  requestOrgVerification(
    @Request() req,
    @Body() body: RequestOrgVerificationDto,
  ) {
    return this.userProfilesService.requestOrgVerification(
      req.user.id,
      body.email,
    );
  }

  @Post('me/confirm-org-verification')
  @ApiOperation({ summary: 'Confirm organization email verification' })
  @ApiBody({ type: ConfirmOrgVerificationDto })
  confirmOrgVerification(
    @Request() req,
    @Body() body: ConfirmOrgVerificationDto,
  ) {
    return this.userProfilesService.confirmOrgVerification(
      req.user.id,
      body.email,
      body.otp,
    );
  }
}
