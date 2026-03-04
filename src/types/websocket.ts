export type Symbol = 'BTCUSDT' | 'ETHUSDT' | 'SOLUSDT' | 'XRPUSDT' | 'DOGEUSDT' | 'AVAXUSDT';

export interface TickerData {
  type: 'v2/ticker';
  symbol: string;
  last_price: string;
  mark_price: string;
  volume_24h: number;
  turnover_24h: number;
  open_interest: number;
  funding_rate: string;
  timestamp: number;
  change_24h?: number;
}

export interface OrderbookLevel {
  price: string;
  size: string;
  total?: number;
}

export interface OrderbookData {
  type: 'l2_orderbook';
  symbol: string;
  bids: [string, string][];
  asks: [string, string][];
  timestamp: number;
}

export interface TradeData {
  type: 'all_trades';
  symbol: string;
  price: string;
  size: number;
  buyer_role: 'maker' | 'taker';
  seller_role: 'maker' | 'taker';
  product_id: number;
  timestamp: number;
  side?: 'buy' | 'sell';
}

export interface SubscribeMessage {
  type: 'subscribe';
  payload: {
    channels: {
      name: string;
      symbols: string[];
    }[];
  };
}

export interface UnsubscribeMessage {
  type: 'unsubscribe';
  payload: {
    channels: {
      name: string;
      symbols?: string[];
    }[];
  };
}

export interface SubscriptionResponse {
  type: 'subscriptions';
  payload: {
    channels: {
      name: string;
      symbols: string[];
    }[];
  };
}

export type WebSocketMessage = TickerData | OrderbookData | TradeData | SubscriptionResponse;

export const ConnectionStatus = {
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  ERROR: 'error',
} as const;

export type ConnectionStatus = typeof ConnectionStatus[keyof typeof ConnectionStatus];

export interface Product {
  symbol: string;
  name: string;
  displayName: string;
  isFavorite: boolean;
  lastPrice?: string;
  change24h?: number;
  volume24h?: number;
}
