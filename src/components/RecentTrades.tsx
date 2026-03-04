import { formatPrice, formatTimestamp, getPriceDecimals } from '../utils/formatters';

interface Trade {
  id: string;
  price: string;
  size: number;
  side: 'buy' | 'sell';
  timestamp: number;
  isNew?: boolean;
}

interface RecentTradesProps {
  trades: Trade[];
  symbol: string;
}

export function RecentTrades({ trades, symbol }: RecentTradesProps) {
  const decimals = getPriceDecimals(symbol);

  return (
    <div className="bg-white rounded-lg border border-zinc-200 h-full flex flex-col overflow-hidden">
      <div className="px-4 py-3 border-b border-zinc-200">
        <h3 className="font-semibold text-zinc-900">Recent Trades</h3>
      </div>

      <div className="grid grid-cols-[auto,1fr,1fr,1fr] gap-2 sm:gap-4 px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-medium text-zinc-500 uppercase border-b border-zinc-200 bg-zinc-50">
        <div></div>
        <div>Price</div>
        <div className="text-right">Size</div>
        <div className="text-right">Time</div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {trades.length > 0 ? (
          trades.map((trade) => (
            <div
              key={trade.id}
              className={`grid grid-cols-[auto,1fr,1fr,1fr] gap-2 sm:gap-4 px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-mono transition-all ${
                trade.isNew ? 'animate-highlight bg-blue-50' : ''
              }`}
            >
              <div
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  trade.side === 'buy' ? 'text-emerald-700 bg-emerald-100' : 'text-red-700 bg-red-100'
                }`}
              >
                {trade.side === 'buy' ? 'BUY' : 'SELL'}
              </div>
              <div
                className={`font-medium ${
                  trade.side === 'buy' ? 'text-emerald-600' : 'text-red-600'
                }`}
              >
                ${formatPrice(trade.price, decimals)}
              </div>
              <div className="text-right text-zinc-700">
                {trade.size.toFixed(0)}
              </div>
              <div className="text-right text-zinc-500 text-[11px]">
                {formatTimestamp(trade.timestamp)}
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-full text-zinc-500">
            Waiting for trades...
          </div>
        )}
      </div>
    </div>
  );
}
