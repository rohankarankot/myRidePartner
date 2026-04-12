import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGroupDto {
  @ApiProperty({ description: 'Name of the community group' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ description: 'Short description of the group' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
}

export class AddMemberDto {
  @ApiProperty({ description: 'User ID of the member to add' })
  @IsNotEmpty()
  userId: number;
}

export class SearchUsersQueryDto {
  @ApiProperty({ description: 'Search query (name or email)' })
  @IsString()
  @IsNotEmpty()
  q: string;

  @ApiPropertyOptional()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  pageSize?: number;
}
