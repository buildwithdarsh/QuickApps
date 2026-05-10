import { Module } from '@nestjs/common';
import { AddonsController } from './addons.controller';
import { AddonsService } from './addons.service';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [WalletModule],
  controllers: [AddonsController],
  providers: [AddonsService],
  exports: [AddonsService],
})
export class AddonsModule {}
