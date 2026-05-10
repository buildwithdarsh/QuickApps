import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Public } from '../../common/decorators';
import { SiteMetaService } from './site-meta.service';

@ApiTags('Site Meta')
@Controller('site-meta')
export class SiteMetaController {
  constructor(private readonly siteMetaService: SiteMetaService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Fetch metadata from a website URL' })
  @ApiQuery({ name: 'url', required: true, description: 'Website URL to fetch metadata from' })
  async getMetadata(@Query('url') url: string) {
    if (!url || url.trim().length === 0) {
      throw new BadRequestException('URL is required');
    }
    return this.siteMetaService.fetchMetadata(url);
  }
}
