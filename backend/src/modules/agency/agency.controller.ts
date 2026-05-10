import { Controller, Get, Post, Patch, Delete, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AgencyService } from './agency.service';
import { GetUser, JwtPayload } from '../../common/decorators';
import { IsString, IsEmail, IsOptional, MaxLength, Matches } from 'class-validator';

class CreateAgencyDto {
  @IsString() @MaxLength(100)
  brandName: string;

  @IsOptional() @IsString()
  brandColor?: string;

  @IsOptional() @IsString() @MaxLength(60)
  @Matches(/^[a-z0-9-]+$/, { message: 'Subdomain must be lowercase alphanumeric with hyphens' })
  subdomain?: string;
}

class UpdateAgencyDto {
  @IsOptional() @IsString() @MaxLength(100) brandName?: string;
  @IsOptional() @IsString() brandColor?: string;
  @IsOptional() @IsString() customDomain?: string;
  @IsOptional() @IsString() subdomain?: string;
  @IsOptional() @IsString() logoUrl?: string;
}

class InviteClientDto {
  @IsEmail() email: string;
}

@ApiTags('Agency')
@ApiBearerAuth()
@Controller('agency')
export class AgencyController {
  constructor(private agencyService: AgencyService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get agency profile' })
  getProfile(@GetUser() user: JwtPayload) {
    return this.agencyService.getProfile(user.orgId);
  }

  @Post('profile')
  @ApiOperation({ summary: 'Create agency profile' })
  createProfile(@GetUser() user: JwtPayload, @Body() dto: CreateAgencyDto) {
    return this.agencyService.createProfile(user.orgId, dto);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update agency profile' })
  updateProfile(@GetUser() user: JwtPayload, @Body() dto: UpdateAgencyDto) {
    return this.agencyService.updateProfile(user.orgId, dto);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get agency stats' })
  getStats(@GetUser() user: JwtPayload) {
    return this.agencyService.getStats(user.orgId);
  }

  @Get('clients')
  @ApiOperation({ summary: 'List all agency clients' })
  getClients(@GetUser() user: JwtPayload) {
    return this.agencyService.getClients(user.orgId);
  }

  @Post('clients/invite')
  @ApiOperation({ summary: 'Invite a client by email' })
  inviteClient(@GetUser() user: JwtPayload, @Body() dto: InviteClientDto) {
    return this.agencyService.inviteClient(user.orgId, dto.email);
  }

  @Delete('clients/:id')
  @ApiOperation({ summary: 'Remove a client' })
  removeClient(@GetUser() user: JwtPayload, @Param('id', ParseUUIDPipe) id: string) {
    return this.agencyService.removeClient(user.orgId, id);
  }
}
