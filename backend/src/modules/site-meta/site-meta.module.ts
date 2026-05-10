import { Module } from '@nestjs/common';
import { SiteMetaController } from './site-meta.controller';
import { SiteMetaService } from './site-meta.service';

@Module({
  controllers: [SiteMetaController],
  providers: [SiteMetaService],
  exports: [SiteMetaService],
})
export class SiteMetaModule {}
