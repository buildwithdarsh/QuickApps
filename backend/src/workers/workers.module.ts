import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import {
  BuildWorkerFree,
  BuildWorkerStandard,
  BuildWorkerPriority,
  BuildWorkerImmediate,
} from './build.worker';
import { BuildPipelineModule } from './build-pipeline/build-pipeline.module';
import { QUEUE_NAMES } from '../common/constants';

@Module({
  imports: [
    BuildPipelineModule,
    BullModule.registerQueue(
      { name: QUEUE_NAMES.BUILD_FREE },
      { name: QUEUE_NAMES.BUILD_STANDARD },
      { name: QUEUE_NAMES.BUILD_PRIORITY },
      { name: QUEUE_NAMES.BUILD_IMMEDIATE },
      { name: QUEUE_NAMES.EMAIL },
      { name: QUEUE_NAMES.INVOICE },
    ),
  ],
  providers: [
    BuildWorkerFree,
    BuildWorkerStandard,
    BuildWorkerPriority,
    BuildWorkerImmediate,
  ],
})
export class WorkersModule {}
