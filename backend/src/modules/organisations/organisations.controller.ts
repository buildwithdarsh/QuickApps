import { Controller, Get, Patch, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { OrganisationsService } from './organisations.service';
import { GetUser, JwtPayload } from '../../common/decorators';
import { UpdateOrgDto } from './dto/update-org.dto';

@ApiTags('Organisations')
@ApiBearerAuth()
@Controller('organisations')
export class OrganisationsController {
  constructor(private orgService: OrganisationsService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current organisation' })
  getMyOrg(@GetUser() user: JwtPayload) {
    return this.orgService.findById(user.orgId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update organisation details' })
  updateOrg(@GetUser() user: JwtPayload, @Body() dto: UpdateOrgDto) {
    return this.orgService.update(user.orgId, dto);
  }

  @Get('me/members')
  @ApiOperation({ summary: 'List organisation members' })
  getMembers(@GetUser() user: JwtPayload) {
    return this.orgService.getMembers(user.orgId);
  }
}
