import { DomainEvent } from '../../domain/events/DomainEvent';

type EventHandler = (event: DomainEvent) => void;

/**
 * Simple singleton event emitter for domain events
 */
export class EventEmitter {
  private static instance: EventEmitter;
  private listeners: Map<string, EventHandler[]>;
  
  private constructor() {
    this.listeners = new Map();
  }
  
  public static getInstance(): EventEmitter {
    if (!EventEmitter.instance) {
      EventEmitter.instance = new EventEmitter();
    }
    return EventEmitter.instance;
  }
  
  public on(eventName: string, handler: EventHandler): void {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }
    this.listeners.get(eventName)!.push(handler);
  }
  
  public emit(event: DomainEvent): void {
    const eventName = event.name;
    if (this.listeners.has(eventName)) {
      this.listeners.get(eventName)!.forEach(handler => {
        // Execute handlers asynchronously to avoid blocking
        setTimeout(() => handler(event), 0);
      });
    }
  }
  
  public removeListener(eventName: string, handler: EventHandler): void {
    if (this.listeners.has(eventName)) {
      const handlers = this.listeners.get(eventName)!;
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }
  
  public removeAllListeners(eventName?: string): void {
    if (eventName) {
      this.listeners.delete(eventName);
    } else {
      this.listeners.clear();
    }
  }
} 