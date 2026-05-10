import { Controller, Get, Post, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RevisionsService } from './revisions.service';
import { GetUser, JwtPayload } from '../../common/decorators';

@ApiTags('Revisions')
@ApiBearerAuth()
@Controller('apps/:appId/revisions')
export class RevisionsController {
  constructor(private revisionsService: RevisionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get revision status for an app' })
  getStatus(
    @GetUser() user: JwtPayload,
    @Param('appId', ParseUUIDPipe) appId: string,
  ) {
    return this.revisionsService.getStatus(appId, user.orgId);
  }

  @Post('purchase')
  @ApiOperation({ summary: 'Purchase extra revision credit' })
  purchase(
    @GetUser() user: JwtPayload,
    @Param('appId', ParseUUIDPipe) appId: string,
  ) {
    // In production, this triggers a payment flow first
    // For now, just add the credit
    return this.revisionsService.addExtraCredits(appId, 1);
  }
}
