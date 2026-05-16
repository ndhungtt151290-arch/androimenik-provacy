type AdEventType = "show" | "close";
type AdCallback = () => void;

type ShowEventData = AdCallback;
type EventMap = {
  show: ShowEventData;
  close: void;
};

class AdEventEmitter {
  private listeners: Map<AdEventType, Set<Function>> = new Map();

  on<T extends AdEventType>(event: T, callback: (data: EventMap[T]) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off<T extends AdEventType>(event: T, callback: (data: EventMap[T]) => void): void {
    this.listeners.get(event)?.delete(callback);
  }

  emit<T extends AdEventType>(event: T, data?: EventMap[T]): void {
    this.listeners.get(event)?.forEach((cb) => {
      (cb as (data?: EventMap[T]) => void)(data);
    });
  }
}

export const adEmitter = new AdEventEmitter();
