import { Controller, Get, Post, Put, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AddonsService } from './addons.service';
import { GetUser, JwtPayload, Public } from '../../common/decorators';

@ApiTags('Addons')
@ApiBearerAuth()
@Controller('addons')
export class AddonsController {
  constructor(private addonsService: AddonsService) {}

  @Public()
  @Get('catalog')
  @ApiOperation({ summary: 'List all available addons (public). Pass ?full=true for configSchema.' })
  getCatalog(@Query('full') full?: string) {
    return full === 'true'
      ? this.addonsService.getCatalogFull()
      : this.addonsService.getCatalog();
  }

  @Get('purchased')
  @ApiOperation({ summary: 'List all purchased addons across all apps for current org' })
  getAllPurchased(@GetUser() user: JwtPayload) {
    return this.addonsService.getAllForOrg(user.orgId);
  }

  // ── App-scoped addon routes ────────────────────────

  @Get('apps/:appId')
  @ApiOperation({ summary: 'List addons for a specific app' })
  getForApp(@GetUser() user: JwtPayload, @Param('appId') appId: string) {
    return this.addonsService.getForApp(user.orgId, appId);
  }

  @Post('apps/:appId/bulk')
  @ApiOperation({ summary: 'Add multiple addons to an app at once' })
  purchaseBulk(
    @GetUser() user: JwtPayload,
    @Param('appId') appId: string,
    @Body('slugs') slugs: string[],
  ) {
    return this.addonsService.purchaseBulk(user.orgId, appId, slugs);
  }

  @Post('apps/:appId/:slug')
  @ApiOperation({ summary: 'Add an addon to an app' })
  purchase(
    @GetUser() user: JwtPayload,
    @Param('appId') appId: string,
    @Param('slug') slug: string,
  ) {
    return this.addonsService.purchase(user.orgId, appId, slug);
  }

  @Delete('apps/:appId/:slug')
  @ApiOperation({ summary: 'Remove an addon from an app' })
  remove(
    @GetUser() user: JwtPayload,
    @Param('appId') appId: string,
    @Param('slug') slug: string,
  ) {
    return this.addonsService.remove(user.orgId, appId, slug);
  }

  @Put('apps/:appId/:slug/config')
  @ApiOperation({ summary: 'Save addon config for an app (encrypted)' })
  saveConfig(
    @GetUser() user: JwtPayload,
    @Param('appId') appId: string,
    @Param('slug') slug: string,
    @Body() config: Record<string, unknown>,
  ) {
    return this.addonsService.saveConfig(user.orgId, appId, slug, config);
  }

  @Get('apps/:appId/:slug/config')
  @ApiOperation({ summary: 'Get addon config for an app (decrypted)' })
  getConfig(
    @GetUser() user: JwtPayload,
    @Param('appId') appId: string,
    @Param('slug') slug: string,
  ) {
    return this.addonsService.getConfig(user.orgId, appId, slug);
  }

  @Patch('apps/:appId/:slug/toggle')
  @ApiOperation({ summary: 'Toggle addon active/inactive for an app' })
  toggle(
    @GetUser() user: JwtPayload,
    @Param('appId') appId: string,
    @Param('slug') slug: string,
    @Body('isActive') isActive: boolean,
  ) {
    return this.addonsService.toggleActive(user.orgId, appId, slug, isActive);
  }
}
