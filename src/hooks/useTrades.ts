import { useEffect, useState, useCallback, useRef } from 'react';
import type { TradeData } from '../types/websocket';
import { websocketService } from '../services/websocket';
import { trackWebSocketUpdate } from './usePerformanceMonitor';

interface EnhancedTrade extends TradeData {
  id: string;
  side: 'buy' | 'sell';
  isNew?: boolean;
}

const MAX_TRADES = 30;

export function useTrades(symbol: string | null) {
  const [trades, setTrades] = useState<EnhancedTrade[]>([]);
  const pendingTradesRef = useRef<EnhancedTrade[]>([]);
  const rafIdRef = useRef<number | null>(null);
  const mountedRef = useRef(true);

  const flushTrades = useCallback(() => {
    const newTrades = pendingTradesRef.current;
    if (newTrades.length === 0) {
      rafIdRef.current = null;
      return;
    }
    if (!mountedRef.current) return;

    setTrades(prev => {
      const withNewFlag = newTrades.map(t => ({ ...t, isNew: true }));
      const existingNoNew = prev.map(t => ({ ...t, isNew: false }));
      return [...withNewFlag, ...existingNoNew].slice(0, MAX_TRADES);
    });

    pendingTradesRef.current = [];
    rafIdRef.current = null;
  }, []);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const addTrade = useCallback((data: TradeData) => {
    trackWebSocketUpdate();
    const side: 'buy' | 'sell' = data.buyer_role === 'taker' ? 'buy' : 'sell';
    const id = `${data.timestamp}-${Math.random()}`;
    const enhancedTrade: EnhancedTrade = { ...data, id, side, isNew: true };
    pendingTradesRef.current.push(enhancedTrade);

    if (rafIdRef.current !== null) return;

    const flush = () => {
      if (rafIdRef.current != null) cancelAnimationFrame(rafIdRef.current);
      if (timeoutRef.current != null) clearTimeout(timeoutRef.current);
      rafIdRef.current = timeoutRef.current = null;
      flushTrades();
    };

    rafIdRef.current = requestAnimationFrame(flush);
    timeoutRef.current = setTimeout(flush, 100);
  }, [flushTrades]);

  useEffect(() => {
    if (!symbol) {
      return;
    }
    mountedRef.current = true;

    websocketService.subscribe([
      { name: 'all_trades', symbols: [symbol] }
    ]);

    const unsubscribe = websocketService.onMessage((message) => {
      if (message.type === 'all_trades' && message.symbol === symbol) {
        addTrade(message as TradeData);
      }
    });

    return () => {
      mountedRef.current = false;
      setTrades([]);
      unsubscribe();
      websocketService.unsubscribe([
        { name: 'all_trades', symbols: [symbol] }
      ]);
      if (rafIdRef.current != null) cancelAnimationFrame(rafIdRef.current);
      if (timeoutRef.current != null) clearTimeout(timeoutRef.current);
      rafIdRef.current = timeoutRef.current = null;
      pendingTradesRef.current = [];
    };
  }, [symbol, addTrade]);

  return trades;
}
