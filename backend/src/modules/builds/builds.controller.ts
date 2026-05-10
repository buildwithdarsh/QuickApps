import { Controller, Post, Get, Param, Query, ParseUUIDPipe, Res } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { BuildsService } from './builds.service';
import { GetUser, JwtPayload } from '../../common/decorators';

@ApiTags('Builds')
@ApiBearerAuth()
@Controller('apps/:appId/builds')
export class BuildsController {
  constructor(private buildsService: BuildsService) {}

  @Post()
  @ApiOperation({ summary: 'Trigger a new build' })
  trigger(
    @GetUser() user: JwtPayload,
    @Param('appId', ParseUUIDPipe) appId: string,
  ) {
    return this.buildsService.triggerBuild(user.orgId, appId);
  }

  @Get()
  @ApiOperation({ summary: 'Get build history' })
  history(
    @GetUser() user: JwtPayload,
    @Param('appId', ParseUUIDPipe) appId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.buildsService.getBuildHistory(user.orgId, appId, +page, +limit);
  }

  @Get(':buildId')
  @ApiOperation({ summary: 'Get build details' })
  details(
    @GetUser() user: JwtPayload,
    @Param('buildId', ParseUUIDPipe) buildId: string,
  ) {
    return this.buildsService.getBuildDetails(user.orgId, buildId);
  }

  @Post(':buildId/retry')
  @ApiOperation({ summary: 'Retry a failed build' })
  retry(
    @GetUser() user: JwtPayload,
    @Param('buildId', ParseUUIDPipe) buildId: string,
  ) {
    return this.buildsService.retryBuild(user.orgId, buildId);
  }

  @Get(':buildId/download/:artifact')
  @ApiOperation({ summary: 'Get signed download URL for build artifact' })
  download(
    @GetUser() user: JwtPayload,
    @Param('buildId', ParseUUIDPipe) buildId: string,
    @Param('artifact') artifact: 'apk' | 'aab' | 'ipa',
  ) {
    return this.buildsService.getDownloadUrl(user.orgId, buildId, artifact);
  }

  @Get(':buildId/download-source')
  @ApiOperation({ summary: 'Download generated Capacitor project source as zip (dev)' })
  async downloadSource(
    @GetUser() user: JwtPayload,
    @Param('appId', ParseUUIDPipe) appId: string,
    @Param('buildId', ParseUUIDPipe) buildId: string,
    @Res() res: Response,
  ) {
    await this.buildsService.streamSourceZip(user.orgId, appId, buildId, res);
  }
}
