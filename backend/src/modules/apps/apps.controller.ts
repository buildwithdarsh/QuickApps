import { Controller, Get, Post, Patch, Put, Delete, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AppsService } from './apps.service';
import { GetUser, JwtPayload } from '../../common/decorators';
import { CreateAppDto } from './dto/create-app.dto';
import { UpdateAppConfigDto } from './dto/update-app-config.dto';

@ApiTags('Apps')
@ApiBearerAuth()
@Controller('apps')
export class AppsController {
  constructor(private appsService: AppsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new app' })
  create(@GetUser() user: JwtPayload, @Body() dto: CreateAppDto) {
    return this.appsService.create(user.orgId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all apps for current org' })
  findAll(@GetUser() user: JwtPayload) {
    return this.appsService.findAll(user.orgId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get app details with config' })
  findOne(@GetUser() user: JwtPayload, @Param('id', ParseUUIDPipe) id: string) {
    return this.appsService.findOne(user.orgId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update app basic info' })
  updateBasicInfo(
    @GetUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<CreateAppDto>,
  ) {
    return this.appsService.updateBasicInfo(user.orgId, id, dto);
  }

  @Put(':id/config')
  @ApiOperation({ summary: 'Save full app config (all 7 sections)' })
  updateConfig(
    @GetUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAppConfigDto,
  ) {
    return this.appsService.updateConfig(user.orgId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete app (soft)' })
  remove(@GetUser() user: JwtPayload, @Param('id', ParseUUIDPipe) id: string) {
    return this.appsService.softDelete(user.orgId, id);
  }
}
