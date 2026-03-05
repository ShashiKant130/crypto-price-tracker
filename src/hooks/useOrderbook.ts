import { useEffect, useState, useCallback, useRef } from 'react';
import type { OrderbookData, OrderbookLevel } from '../types/websocket';
import { websocketService } from '../services/websocket';
import { trackWebSocketUpdate } from './usePerformanceMonitor';

interface ProcessedOrderbook {
  bids: OrderbookLevel[];
  asks: OrderbookLevel[];
  timestamp: number;
}

export function useOrderbook(symbol: string | null) {
  const [orderbook, setOrderbook] = useState<ProcessedOrderbook | null>(() => symbol ? null : null);
  const pendingDataRef = useRef<OrderbookData | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const mountedRef = useRef(true);

  const processOrderbook = useCallback((data: OrderbookData): ProcessedOrderbook => {
    const processBids = (bids: [string, string][]): OrderbookLevel[] => {
      let total = 0;
      return bids.slice(0, 10).map(([price, size]) => {
        const sizeNum = parseFloat(size);
        total += sizeNum;
        return { price, size, total };
      });
    };

    const processAsks = (asks: [string, string][]): OrderbookLevel[] => {
      let total = 0;
      return asks.slice(0, 10).map(([price, size]) => {
        const sizeNum = parseFloat(size);
        total += sizeNum;
        return { price, size, total };
      });
    };

    return {
      bids: processBids(data.bids),
      asks: processAsks(data.asks),
      timestamp: data.timestamp
    };
  }, []);

  const flushOrderbook = useCallback(() => {
    if (!pendingDataRef.current || !mountedRef.current) {
      rafIdRef.current = null;
      return;
    }
    setOrderbook(processOrderbook(pendingDataRef.current));
    pendingDataRef.current = null;
    rafIdRef.current = null;
  }, [processOrderbook]);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleUpdate = useCallback((data: OrderbookData) => {
    trackWebSocketUpdate();
    pendingDataRef.current = data;

    if (rafIdRef.current !== null) return;

    const flush = () => {
      if (rafIdRef.current != null) cancelAnimationFrame(rafIdRef.current);
      if (timeoutRef.current != null) clearTimeout(timeoutRef.current);
      rafIdRef.current = timeoutRef.current = null;
      flushOrderbook();
    };

    rafIdRef.current = requestAnimationFrame(flush);
    timeoutRef.current = setTimeout(flush, 50);
  }, [flushOrderbook]);

  useEffect(() => {
    if (!symbol) {
      return;
    }
    mountedRef.current = true;

    websocketService.subscribe([
      { name: 'l2_orderbook', symbols: [symbol] }
    ]);

    const unsubscribe = websocketService.onMessage((message) => {
      if (message.type === 'l2_orderbook' && message.symbol === symbol) {
        scheduleUpdate(message as OrderbookData);
      }
    });

    return () => {
      mountedRef.current = false;
      setOrderbook(null);
      unsubscribe();
      websocketService.unsubscribe([
        { name: 'l2_orderbook', symbols: [symbol] }
      ]);
      if (rafIdRef.current != null) cancelAnimationFrame(rafIdRef.current);
      if (timeoutRef.current != null) clearTimeout(timeoutRef.current);
      rafIdRef.current = timeoutRef.current = null;
      pendingDataRef.current = null;
    };
  }, [symbol, scheduleUpdate]);

  return orderbook;
}
