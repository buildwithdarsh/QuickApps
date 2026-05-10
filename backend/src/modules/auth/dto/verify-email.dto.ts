import { IsEmail, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailDto {
  @ApiProperty({ example: 'ravi@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '482901' })
  @IsString()
  @Length(6, 6)
  code: string;
}

export class ResendVerificationDto {
  @ApiProperty({ example: 'ravi@example.com' })
  @IsEmail()
  email: string;
}
