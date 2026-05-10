import { IsString, IsUrl, MinLength, MaxLength, Matches, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAppDto {
  @ApiProperty({ example: 'Ravi Stores' })
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  name: string;

  @ApiProperty({ example: 'https://ravistores.com' })
  @IsUrl({ require_protocol: true })
  url: string;

  @ApiPropertyOptional({ example: 'com.ravistores.app' })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/, {
    message: 'Bundle ID must be in reverse domain format (e.g., com.yourcompany.appname)',
  })
  bundleId?: string;

  @ApiPropertyOptional({ example: 'Order groceries from Ravi Stores' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  shortDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  longDescription?: string;
}
