import { useMemo } from 'react';
import type { OrderbookLevel } from '../types/websocket';
import { formatPrice, getPriceDecimals } from '../utils/formatters';

interface OrderbookProps {
  bids: OrderbookLevel[];
  asks: OrderbookLevel[];
  symbol: string;
}

export function Orderbook({ bids, asks, symbol }: OrderbookProps) {
  const decimals = getPriceDecimals(symbol);

  const maxBidTotal = useMemo(() => 
    Math.max(...bids.map(b => b.total || 0), 0.001),
    [bids]
  );

  const maxAskTotal = useMemo(() => 
    Math.max(...asks.map(a => a.total || 0), 0.001),
    [asks]
  );

  const renderLevel = (
    level: OrderbookLevel,
    maxTotal: number,
    side: 'bid' | 'ask'
  ) => {
    const percentage = ((level.total || 0) / maxTotal) * 100;
    const bgColor = side === 'bid' ? 'bg-emerald-50' : 'bg-red-50';

    return (
      <div
        key={`${side}-${level.price}`}
        className="relative grid grid-cols-3 gap-2 sm:gap-4 px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-mono hover:bg-zinc-50 transition-colors"
      >
        <div
          className={`absolute inset-y-0 ${side === 'bid' ? 'right-0' : 'left-0'} ${bgColor} transition-all`}
          style={{ width: `${percentage}%` }}
        />
        <div className={`relative z-10 ${side === 'bid' ? 'text-emerald-600' : 'text-red-600'} font-medium`}>
          {formatPrice(level.price, decimals)}
        </div>
        <div className="relative z-10 text-right text-zinc-700">
          {parseFloat(level.size).toFixed(3)}
        </div>
        <div className="relative z-10 text-right text-zinc-500">
          {level.total?.toFixed(3)}
        </div>
      </div>
    );
  };

  const spread = bids[0] && asks[0] ? parseFloat(asks[0].price) - parseFloat(bids[0].price) : 0;
  const spreadPercent = bids[0] ? (spread / parseFloat(bids[0].price)) * 100 : 0;

  return (
    <div className="bg-white rounded-lg border border-zinc-200 h-full flex flex-col overflow-hidden">
      <div className="px-4 py-3 border-b border-zinc-200">
        <h3 className="font-semibold text-zinc-900">Orderbook</h3>
        <div className="text-xs text-zinc-500 mt-1">
          Spread: ${spread.toFixed(decimals)} ({spreadPercent.toFixed(3)}%)
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-4 px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-medium text-zinc-500 uppercase border-b border-zinc-200 bg-zinc-50">
        <div>Price</div>
        <div className="text-right">Size</div>
        <div className="text-right">Total</div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {asks.slice().reverse().map(ask => 
            renderLevel(ask, maxAskTotal, 'ask')
          )}
        </div>

        <div className="px-3 py-2.5 border-y border-zinc-200 bg-zinc-50 backdrop-blur">
          <div className="flex items-center justify-between">
            <div className="text-xs text-zinc-500 font-medium">Spread: ${spread.toFixed(decimals)} ({spreadPercent.toFixed(3)}%)</div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {bids.map(bid => 
            renderLevel(bid, maxBidTotal, 'bid')
          )}
        </div>
      </div>
    </div>
  );
}
