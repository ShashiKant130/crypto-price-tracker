import { useEffect, useState, useCallback, useRef } from 'react';
import type { TickerData } from '../types/websocket';
import { websocketService } from '../services/websocket';
import { trackWebSocketUpdate } from './usePerformanceMonitor';

export function useTicker(symbols: string[]) {
  const [tickers, setTickers] = useState<Map<string, TickerData>>(new Map());
  
  const pendingUpdatesRef = useRef<Map<string, TickerData>>(new Map());
  const rafIdRef = useRef<number | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flushUpdates = useCallback(() => {
    const updates = pendingUpdatesRef.current;
    if (updates.size === 0) {
      rafIdRef.current = null;
      if (timeoutRef.current != null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }
    // Copy and clear immediately so we don't drop messages that arrive during setState
    const snapshot = new Map(updates);
    pendingUpdatesRef.current.clear();
    rafIdRef.current = null;
    if (timeoutRef.current != null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setTickers(prev => {
      const next = new Map(prev);
      snapshot.forEach((data, symbol) => {
        const existing = next.get(symbol);
        if (existing) {
          const lastPrice = parseFloat(existing.last_price);
          const currentPrice = parseFloat(data.last_price);
          const change24h = ((currentPrice - lastPrice) / lastPrice) * 100;
          next.set(symbol, {
            ...data,
            change_24h: isFinite(change24h) ? change24h : existing.change_24h || 0
          });
        } else {
          next.set(symbol, { ...data, change_24h: 0 });
        }
      });
      return next;
    });
  }, []);

  const updateTicker = useCallback((data: TickerData) => {
    trackWebSocketUpdate();
    pendingUpdatesRef.current.set(data.symbol, data);

    if (rafIdRef.current !== null) return;

    const flush = () => {
      if (rafIdRef.current != null) cancelAnimationFrame(rafIdRef.current);
      if (timeoutRef.current != null) clearTimeout(timeoutRef.current);
      rafIdRef.current = timeoutRef.current = null;
      flushUpdates();
    };

    rafIdRef.current = requestAnimationFrame(flush);
    timeoutRef.current = setTimeout(flush, 16); // ~1 frame fallback if RAF is throttled
  }, [flushUpdates]);

  useEffect(() => {
    if (symbols.length === 0) return;

    websocketService.subscribe([
      { name: 'v2/ticker', symbols }
    ]);

    const unsubscribe = websocketService.onMessage((message) => {
      if (message.type === 'v2/ticker' && symbols.includes(message.symbol)) {
        updateTicker(message as TickerData);
      }
    });

    return () => {
      unsubscribe();
      websocketService.unsubscribe([
        { name: 'v2/ticker', symbols }
      ]);
      if (rafIdRef.current != null) cancelAnimationFrame(rafIdRef.current);
      if (timeoutRef.current != null) clearTimeout(timeoutRef.current);
      rafIdRef.current = timeoutRef.current = null;
      pendingUpdatesRef.current.clear();
    };
  }, [symbols, updateTicker]);

  return tickers;
}
