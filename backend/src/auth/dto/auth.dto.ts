import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class GoogleLoginDto {
  @ApiProperty({ description: 'Google ID token from the client' })
  @IsString()
  token: string;

  @ApiProperty({
    description: 'Client app source identifier',
    required: false,
    example: 'myridepartner',
  })
  @IsOptional()
  @IsString()
  source?: string;
}

export class LoginDto {
  @ApiProperty({ description: 'User email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'User password' })
  @IsString()
  @MinLength(1)
  password: string;

  @ApiProperty({
    description: 'Client app source identifier',
    required: false,
    example: 'interport',
  })
  @IsOptional()
  @IsString()
  source?: string;
}
