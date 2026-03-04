import type { ConnectionStatus, WebSocketMessage, SubscribeMessage, UnsubscribeMessage } from '../types/websocket';
import { ConnectionStatus as ConnectionStatusEnum } from '../types/websocket';

type MessageCallback = (message: WebSocketMessage) => void;
type StatusCallback = (status: ConnectionStatus) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private url: string;
  private messageCallbacks: Set<MessageCallback> = new Set();
  private statusCallbacks: Set<StatusCallback> = new Set();
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000;
  private shouldReconnect = true;
  private pendingSubscriptions: Map<string, Set<string>> = new Map();
  private currentStatus: ConnectionStatus = ConnectionStatusEnum.DISCONNECTED;

  constructor(url: string = 'ws://localhost:8080') {
    this.url = url;
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN || this.ws?.readyState === WebSocket.CONNECTING) {
      return;
    }

    this.updateStatus(ConnectionStatusEnum.CONNECTING);

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.updateStatus(ConnectionStatusEnum.CONNECTED);
        this.resubscribeAll();
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.messageCallbacks.forEach(callback => callback(message));
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.updateStatus(ConnectionStatusEnum.ERROR);
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.updateStatus(ConnectionStatusEnum.DISCONNECTED);
        this.ws = null;

        if (this.shouldReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 30000);
          console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
          
          this.reconnectTimeout = setTimeout(() => {
            this.connect();
          }, delay);
        }
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.updateStatus(ConnectionStatusEnum.ERROR);
    }
  }

  disconnect(): void {
    this.shouldReconnect = false;
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.pendingSubscriptions.clear();
    this.updateStatus(ConnectionStatusEnum.DISCONNECTED);
  }

  subscribe(channels: { name: string; symbols: string[] }[]): void {
    channels.forEach(channel => {
      if (!this.pendingSubscriptions.has(channel.name)) {
        this.pendingSubscriptions.set(channel.name, new Set());
      }
      channel.symbols.forEach(symbol => {
        this.pendingSubscriptions.get(channel.name)!.add(symbol);
      });
    });

    if (this.isConnected()) {
      const message: SubscribeMessage = {
        type: 'subscribe',
        payload: { channels }
      };
      this.send(message);
    }
  }

  unsubscribe(channels: { name: string; symbols?: string[] }[]): void {
    channels.forEach(channel => {
      if (channel.symbols) {
        const subscribedSymbols = this.pendingSubscriptions.get(channel.name);
        if (subscribedSymbols) {
          channel.symbols.forEach(symbol => subscribedSymbols.delete(symbol));
          if (subscribedSymbols.size === 0) {
            this.pendingSubscriptions.delete(channel.name);
          }
        }
      } else {
        this.pendingSubscriptions.delete(channel.name);
      }
    });

    if (this.isConnected()) {
      const message: UnsubscribeMessage = {
        type: 'unsubscribe',
        payload: { channels }
      };
      this.send(message);
    }
  }

  private resubscribeAll(): void {
    if (this.pendingSubscriptions.size === 0) return;

    const channels = Array.from(this.pendingSubscriptions.entries()).map(([name, symbols]) => ({
      name,
      symbols: Array.from(symbols)
    }));

    const message: SubscribeMessage = {
      type: 'subscribe',
      payload: { channels }
    };

    this.send(message);
  }

  private send(message: SubscribeMessage | UnsubscribeMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  onMessage(callback: MessageCallback): () => void {
    this.messageCallbacks.add(callback);
    return () => this.messageCallbacks.delete(callback);
  }

  onStatusChange(callback: StatusCallback): () => void {
    this.statusCallbacks.add(callback);
    callback(this.currentStatus);
    return () => this.statusCallbacks.delete(callback);
  }

  private updateStatus(status: ConnectionStatus): void {
    this.currentStatus = status;
    this.statusCallbacks.forEach(callback => callback(status));
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  getStatus(): ConnectionStatus {
    return this.currentStatus;
  }
}

export const websocketService = new WebSocketService();
