import { useMemo, memo } from 'react';
import { useTicker } from '../hooks/useTicker';
import { useOrderbook } from '../hooks/useOrderbook';
import { useTrades } from '../hooks/useTrades';
import { useFavorites } from '../hooks/useFavorites';
import { Orderbook } from './Orderbook';
import { RecentTrades } from './RecentTrades';
import { formatPrice, formatPercentage, formatVolume, getPriceDecimals } from '../utils/formatters';
import { PRODUCT_MAP } from '../config/products';

interface ProductDetailViewProps {
  symbol: string;
  onBack: () => void;
}

function ProductDetailViewInner({ symbol, onBack }: ProductDetailViewProps) {
  const product = PRODUCT_MAP.get(symbol);
  const symbolList = useMemo(() => [symbol], [symbol]);
  const tickers = useTicker(symbolList);
  const ticker = tickers.get(symbol);
  const orderbook = useOrderbook(symbol);
  const trades = useTrades(symbol);
  const { isFavorite, toggleFavorite } = useFavorites();

  if (!product) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-zinc-600">Product not found</p>
          <button
            onClick={onBack}
            className="mt-4 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const decimals = getPriceDecimals(symbol);
  const lastPrice = ticker?.last_price ? parseFloat(ticker.last_price) : null;
  const change24h = ticker?.change_24h ?? 0;

  return (
    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-zinc-200">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3 sm:mb-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={onBack}
              className="text-zinc-500 hover:text-zinc-700 transition-colors flex items-center gap-1 text-sm"
              aria-label="Go back"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <div>
              <div className="flex items-center gap-2 sm:gap-3">
                <h2 className="text-lg sm:text-xl font-bold text-zinc-900">{symbol}</h2>
                <button
                  onClick={() => toggleFavorite(symbol)}
                  className="text-2xl hover:scale-110 transition-transform"
                  aria-label={isFavorite(symbol) ? 'Remove from favorites' : 'Add to favorites'}
                >
                  {isFavorite(symbol) ? '⭐' : '☆'}
                </button>
              </div>
              <p className="text-sm text-zinc-500">{product.displayName}</p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            {lastPrice !== null ? (
              <>
                <div className="text-2xl sm:text-3xl font-bold font-mono text-zinc-900">
                  ${formatPrice(lastPrice, decimals)}
                </div>
                <div
                  className={`text-base font-medium ${
                    change24h >= 0 ? 'text-emerald-600' : 'text-red-600'
                  }`}
                >
                  {formatPercentage(change24h)}
                </div>
              </>
            ) : (
              <div className="text-zinc-500">Loading...</div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 px-4 sm:px-6 py-3 sm:py-4 border-b border-zinc-200 bg-zinc-50">
        <div>
          <div className="text-xs text-zinc-500 uppercase mb-1 font-medium tracking-wide">Mark Price</div>
          <div className="font-mono text-sm text-zinc-900">
            {ticker?.mark_price ? `$${formatPrice(ticker.mark_price, decimals)}` : '—'}
          </div>
        </div>
        <div>
          <div className="text-xs text-zinc-500 uppercase mb-1 font-medium tracking-wide">24h High</div>
          <div className="font-mono text-sm text-zinc-900">—</div>
        </div>
        <div>
          <div className="text-xs text-zinc-500 uppercase mb-1 font-medium tracking-wide">24h Low</div>
          <div className="font-mono text-sm text-zinc-900">—</div>
        </div>
        <div>
          <div className="text-xs text-zinc-500 uppercase mb-1 font-medium tracking-wide">24h Volume</div>
          <div className="font-mono text-sm text-zinc-900">
            {ticker?.volume_24h ? formatVolume(ticker.volume_24h) : '—'}
          </div>
        </div>
        <div>
          <div className="text-xs text-zinc-500 uppercase mb-1 font-medium tracking-wide">Funding Rate</div>
          <div className="font-mono text-sm text-zinc-900">
            {ticker?.funding_rate ? `${parseFloat(ticker.funding_rate).toFixed(4)}%` : '—'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 p-4 sm:p-6">
        <div className="min-h-[320px] sm:min-h-[400px] lg:h-[500px] xl:h-[600px]">
          {orderbook ? (
            <Orderbook
              bids={orderbook.bids}
              asks={orderbook.asks}
              symbol={symbol}
            />
          ) : (
            <div className="bg-white rounded-lg border border-zinc-200 h-full flex items-center justify-center">
              <div className="text-zinc-500">Loading orderbook...</div>
            </div>
          )}
        </div>

        <div className="min-h-[320px] sm:min-h-[400px] lg:h-[500px] xl:h-[600px]">
          <RecentTrades trades={trades} symbol={symbol} />
        </div>
      </div>
    </div>
  );
}

export const ProductDetailView = memo(ProductDetailViewInner);
