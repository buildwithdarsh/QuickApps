import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { GetUser, JwtPayload } from '../../common/decorators';

@ApiTags('Wallet')
@ApiBearerAuth()
@Controller('wallet')
export class WalletController {
  constructor(private walletService: WalletService) {}

  @Get('balance')
  @ApiOperation({ summary: 'Get MintWallet balance' })
  getBalance(@GetUser() user: JwtPayload) {
    return this.walletService.getBalance(user.orgId);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get wallet transaction history' })
  getTransactions(
    @GetUser() user: JwtPayload,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.walletService.getTransactions(user.orgId, +page, +limit);
  }
}
