import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUE_NAMES } from '../common/constants';
import { BuildPipelineService } from './build-pipeline/build-pipeline.service';

interface BuildJobData {
  buildId: string;
  appId: string;
  orgId: string;
}

// ── Base worker ─────────────────────────────────────

abstract class BuildWorkerBase extends WorkerHost {
  protected readonly logger = new Logger(this.constructor.name);

  constructor(protected pipeline: BuildPipelineService) {
    super();
  }

  async process(job: Job<BuildJobData>): Promise<void> {
    const { buildId, appId, orgId } = job.data;
    this.logger.log(`Processing build ${buildId} from queue ${job.queueName}`);
    await this.pipeline.execute(buildId, appId, orgId);
  }
}

// ── Queue-specific workers ──────────────────────────

@Processor(QUEUE_NAMES.BUILD_FREE, { concurrency: 1 })
export class BuildWorkerFree extends BuildWorkerBase {
  constructor(pipeline: BuildPipelineService) { super(pipeline); }
}

@Processor(QUEUE_NAMES.BUILD_STANDARD, { concurrency: 3 })
export class BuildWorkerStandard extends BuildWorkerBase {
  constructor(pipeline: BuildPipelineService) { super(pipeline); }
}

@Processor(QUEUE_NAMES.BUILD_PRIORITY, { concurrency: 5 })
export class BuildWorkerPriority extends BuildWorkerBase {
  constructor(pipeline: BuildPipelineService) { super(pipeline); }
}

@Processor(QUEUE_NAMES.BUILD_IMMEDIATE, { concurrency: 2 })
export class BuildWorkerImmediate extends BuildWorkerBase {
  constructor(pipeline: BuildPipelineService) { super(pipeline); }
}
