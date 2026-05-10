import type { BridgeEvent, BridgeEventHandler, BridgeEventMap } from './types';

type Listener = (data: unknown) => void;

export class EventBus {
  private listeners: Map<string, Set<Listener>> = new Map();

  on<E extends BridgeEvent>(event: E, handler: BridgeEventHandler<E>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler as Listener);
    return () => this.off(event, handler);
  }

  off<E extends BridgeEvent>(event: E, handler: BridgeEventHandler<E>): void {
    this.listeners.get(event)?.delete(handler as Listener);
  }

  emit<E extends BridgeEvent>(event: E, data: BridgeEventMap[E]): void {
    this.listeners.get(event)?.forEach((handler) => {
      try {
        handler(data);
      } catch (e) {
        console.error(`[QuickApps] Event handler error (${event}):`, e);
      }
    });
  }

  clear(): void {
    this.listeners.clear();
  }
}
