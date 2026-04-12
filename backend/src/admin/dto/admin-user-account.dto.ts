import { ApiProperty } from '@nestjs/swagger';
import { UserAccountStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class AdminUserAccountDto {
  @ApiProperty({ enum: UserAccountStatus })
  @IsEnum(UserAccountStatus)
  accountStatus: UserAccountStatus;
}
