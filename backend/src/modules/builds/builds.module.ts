import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { BuildsController } from './builds.controller';
import { BuildsService } from './builds.service';
import { RevisionsModule } from '../revisions/revisions.module';
import { QUEUE_NAMES } from '../../common/constants';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: QUEUE_NAMES.BUILD_FREE },
      { name: QUEUE_NAMES.BUILD_STANDARD },
      { name: QUEUE_NAMES.BUILD_PRIORITY },
      { name: QUEUE_NAMES.BUILD_IMMEDIATE },
    ),
    RevisionsModule,
  ],
  controllers: [BuildsController],
  providers: [BuildsService],
  exports: [BuildsService],
})
export class BuildsModule {}
