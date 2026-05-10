import * as fs from 'fs-extra';
import { BuildContext, StepResult } from '../types';

export async function cleanupStep(ctx: BuildContext): Promise<StepResult> {
  const start = Date.now();
  try {
    if (ctx.workDir && await fs.pathExists(ctx.workDir)) {
      await fs.remove(ctx.workDir);
    }
    return { success: true, duration: Date.now() - start, step: 'cleanup' };
  } catch (error) {
    // Cleanup failures are non-fatal
    return {
      success: true, duration: Date.now() - start, step: 'cleanup',
      error: (error as Error).message,
    };
  }
}
