import { SlotLockService } from '../services/slot-lock.service';

let sweeperInterval: NodeJS.Timeout | null = null;

export function startHoldSweeper(intervalMs: number = 10000): void {
  if (sweeperInterval) return;

  console.log(`[Hold Sweeper] Started background sweeper (interval: ${intervalMs / 1000}s)`);
  sweeperInterval = setInterval(() => {
    try {
      SlotLockService.sweepExpiredHolds();
    } catch (err) {
      console.error('[Hold Sweeper] Error during hold sweep cycle:', err);
    }
  }, intervalMs);
}

export function stopHoldSweeper(): void {
  if (sweeperInterval) {
    clearInterval(sweeperInterval);
    sweeperInterval = null;
    console.log('[Hold Sweeper] Stopped background sweeper');
  }
}

