import { Controller, Get, Patch, Param, Query, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { SuperAdminGuard } from '../../common/guards';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(SuperAdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get platform stats' })
  getStats() {
    return this.adminService.getStats();
  }

  @Get('organisations')
  @ApiOperation({ summary: 'List all organisations' })
  listOrgs(@Query() pagination: PaginationDto) {
    return this.adminService.listOrganisations(pagination);
  }

  @Get('organisations/:id')
  @ApiOperation({ summary: 'Get organisation details' })
  getOrgDetails(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.getOrgDetails(id);
  }

  @Patch('organisations/:id/suspend')
  @ApiOperation({ summary: 'Suspend an organisation' })
  suspendOrg(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.suspendOrg(id);
  }

  @Patch('organisations/:id/reactivate')
  @ApiOperation({ summary: 'Reactivate an organisation' })
  reactivateOrg(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.reactivateOrg(id);
  }

  @Get('builds')
  @ApiOperation({ summary: 'List all builds' })
  listBuilds(@Query() pagination: PaginationDto, @Query('status') status?: string) {
    return this.adminService.listBuilds(pagination, status);
  }
}
