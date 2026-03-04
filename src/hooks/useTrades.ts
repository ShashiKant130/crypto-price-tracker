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
  const newTradeTimeouts = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  
  const pendingTradesRef = useRef<EnhancedTrade[]>([]);
  const rafIdRef = useRef<number | null>(null);

  const flushTrades = useCallback(() => {
    const newTrades = pendingTradesRef.current;
    if (newTrades.length === 0) {
      rafIdRef.current = null;
      return;
    }

    setTrades(prev => {
      const updated = [...newTrades, ...prev].slice(0, MAX_TRADES);
      return updated;
    });

    newTrades.forEach(trade => {
      const timeout = setTimeout(() => {
        setTrades(prev => 
          prev.map(t => 
            t.id === trade.id ? { ...t, isNew: false } : t
          )
        );
        newTradeTimeouts.current.delete(trade.id);
      }, 1000);

      newTradeTimeouts.current.set(trade.id, timeout);
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
    timeoutRef.current = setTimeout(flush, 50);
  }, [flushTrades]);

  useEffect(() => {
    if (!symbol) {
      return;
    }

    websocketService.subscribe([
      { name: 'all_trades', symbols: [symbol] }
    ]);

    const unsubscribe = websocketService.onMessage((message) => {
      if (message.type === 'all_trades' && message.symbol === symbol) {
        addTrade(message as TradeData);
      }
    });

    return () => {
      setTrades([]);
      unsubscribe();
      websocketService.unsubscribe([
        { name: 'all_trades', symbols: [symbol] }
      ]);
      if (rafIdRef.current != null) cancelAnimationFrame(rafIdRef.current);
      if (timeoutRef.current != null) clearTimeout(timeoutRef.current);
      rafIdRef.current = timeoutRef.current = null;
      pendingTradesRef.current = [];
      const timeouts = newTradeTimeouts.current;
      timeouts.forEach(timeout => clearTimeout(timeout));
      timeouts.clear();
    };
  }, [symbol, addTrade]);

  return trades;
}
