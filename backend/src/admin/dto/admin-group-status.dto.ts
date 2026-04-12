import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

enum GroupStatusAction {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export class AdminGroupStatusDto {
  @ApiProperty({ enum: GroupStatusAction, description: 'New status for the group' })
  @IsNotEmpty()
  @IsEnum(GroupStatusAction)
  status: 'APPROVED' | 'REJECTED';
}
