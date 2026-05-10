import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, MaxLength } from 'class-validator';
import { StorageService } from '../../services/storage/storage.service';
import { GetUser, JwtPayload } from '../../common/decorators';
import { S3_PATHS } from '../../common/constants';
import { v4 as uuid } from 'uuid';

enum AssetType {
  ICON = 'icon',
  SPLASH_BG = 'splash_bg',
  SPLASH_LOGO = 'splash_logo',
  NO_INTERNET_BG = 'no_internet_bg',
  NO_INTERNET_LOGO = 'no_internet_logo',
  PAGE_LOADER = 'page_loader',
  NAV_ICON = 'nav_icon',
}

class PresignedUrlDto {
  @IsEnum(AssetType)
  assetType: AssetType;

  @IsString()
  @MaxLength(200)
  fileName: string;

  @IsString()
  contentType: string;

  @IsOptional()
  @IsString()
  appId?: string;
}

@ApiTags('Upload')
@ApiBearerAuth()
@Controller('upload')
export class UploadController {
  constructor(private storage: StorageService) {}

  @Post('presigned-url')
  @ApiOperation({ summary: 'Get S3 presigned URL for asset upload' })
  async getPresignedUrl(@GetUser() user: JwtPayload, @Body() dto: PresignedUrlDto) {
    const allowedTypes: Record<string, string[]> = {
      icon: ['image/png', 'image/jpeg'],
      splash_bg: ['image/png', 'image/jpeg'],
      splash_logo: ['image/png'],
      no_internet_bg: ['image/png', 'image/jpeg'],
      no_internet_logo: ['image/png'],
      page_loader: ['image/gif', 'application/json'],
      nav_icon: ['image/png', 'image/svg+xml'],
    };

    const allowed = allowedTypes[dto.assetType] || [];
    if (!allowed.includes(dto.contentType)) {
      return { error: `Invalid content type. Allowed: ${allowed.join(', ')}` };
    }

    const ext = dto.fileName.split('.').pop() || 'png';
    const key = `${S3_PATHS.ICONS}/${user.orgId}/${dto.assetType}/${uuid()}.${ext}`;

    const uploadUrl = await this.storage.getSignedUploadUrl(key, dto.contentType);

    return {
      uploadUrl,
      key,
      expiresIn: 3600,
    };
  }
}
