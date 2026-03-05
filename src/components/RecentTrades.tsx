import { memo } from 'react';
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

function RecentTradesInner({ trades, symbol }: RecentTradesProps) {
  const decimals = getPriceDecimals(symbol);

  return (
    <div className="bg-white rounded-lg border border-zinc-200 h-full flex flex-col overflow-hidden">
      <div className="px-4 py-3 border-b border-zinc-200">
        <h3 className="font-semibold text-zinc-900">Recent Trades</h3>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin min-h-0">
        {trades.length > 0 ? (
          <table className="w-full text-[10px] sm:text-xs font-mono border-collapse">
            <thead className="sticky top-0 bg-zinc-50 border-b border-zinc-200 z-10">
              <tr>
                <th className="text-left font-medium text-zinc-500 uppercase py-2 px-2 sm:px-3 w-12"></th>
                <th className="text-left font-medium text-zinc-500 uppercase py-2 px-2 sm:px-3">Price</th>
                <th className="text-right font-medium text-zinc-500 uppercase py-2 px-2 sm:px-3">Size</th>
                <th className="text-right font-medium text-zinc-500 uppercase py-2 px-2 sm:px-3">Time</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((trade) => (
                <tr
                  key={trade.id}
                  className={`border-b border-zinc-100 transition-colors ${
                    trade.isNew ? 'animate-highlight bg-blue-50' : ''
                  }`}
                >
                  <td className="py-1.5 px-2 sm:px-3 align-middle">
                    <span
                      className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        trade.side === 'buy' ? 'text-emerald-700 bg-emerald-100' : 'text-red-700 bg-red-100'
                      }`}
                    >
                      {trade.side === 'buy' ? 'BUY' : 'SELL'}
                    </span>
                  </td>
                  <td className={`py-1.5 px-2 sm:px-3 font-medium align-middle ${
                    trade.side === 'buy' ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    ${formatPrice(trade.price, decimals)}
                  </td>
                  <td className="py-1.5 px-2 sm:px-3 text-right text-zinc-700 align-middle">
                    {trade.size.toFixed(0)}
                  </td>
                  <td className="py-1.5 px-2 sm:px-3 text-right text-zinc-500 text-[11px] align-middle">
                    {formatTimestamp(trade.timestamp)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
            Waiting for trades...
          </div>
        )}
      </div>
    </div>
  );
}

export const RecentTrades = memo(RecentTradesInner);
