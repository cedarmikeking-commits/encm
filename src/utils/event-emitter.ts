const eventNames = ['API:UN_AUTH', 'API:SERVER_ERROR'];

type EventName = (typeof eventNames)[number];
type EventListener = (...args: any[]) => void;

class EventEmitter {
  private listeners: Record<EventName, Set<EventListener>> = {
    'API:UN_AUTH': new Set(),
    'API:SERVER_ERROR': new Set(),
  };

  on(eventName: EventName, listener: EventListener) {
    this.listeners[eventName].add(listener);
  }

  emit(eventName: EventName, ...args: any[]) {
    this.listeners[eventName].forEach(listener => listener(...args));
  }
  off(eventName: EventName, listener: EventListener) {
    this.listeners[eventName].delete(listener);
  }
}

export default new EventEmitter();
