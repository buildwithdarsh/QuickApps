import { Module } from '@nestjs/common';
import { BuildPipelineService } from './build-pipeline.service';

@Module({
  providers: [BuildPipelineService],
  exports: [BuildPipelineService],
})
export class BuildPipelineModule {}
