import { formatPrice, formatPercentage, formatVolume, getPriceDecimals } from '../utils/formatters';
import type { TickerData } from '../types/websocket';
import type { ProductConfig } from '../config/products';

interface ProductRowProps {
  product: ProductConfig;
  ticker?: TickerData;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onClick: () => void;
  variant?: 'table' | 'card';
}

export function ProductRow({ product, ticker, isFavorite, onToggleFavorite, onClick, variant = 'table' }: ProductRowProps) {
  const decimals = getPriceDecimals(product.symbol);
  const lastPrice = ticker?.last_price ? parseFloat(ticker.last_price) : null;
  const change24h = ticker?.change_24h ?? 0;
  const volume24h = ticker?.volume_24h ?? 0;

  if (variant === 'card') {
    return (
      <div
        className="p-4 active:bg-zinc-50 transition-colors cursor-pointer flex items-center justify-between gap-3"
        onClick={onClick}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            className="text-lg shrink-0"
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            {isFavorite ? '⭐' : '☆'}
          </button>
          <div className="min-w-0">
            <div className="font-semibold text-zinc-900 truncate">{product.symbol}</div>
            <div className="text-xs text-zinc-500 truncate">{product.name}</div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-0.5 shrink-0">
          {lastPrice !== null ? (
            <div className="font-mono font-medium text-zinc-900 text-sm">${formatPrice(lastPrice, decimals)}</div>
          ) : (
            <div className="text-zinc-400 text-sm">—</div>
          )}
          {ticker ? (
            <span className={`text-xs font-medium ${change24h >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {formatPercentage(change24h)}
            </span>
          ) : null}
          {ticker && <span className="text-[10px] text-zinc-500">{formatVolume(volume24h)} vol</span>}
        </div>
      </div>
    );
  }

  return (
    <tr 
      className="hover:bg-zinc-50 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <td className="px-4 py-4 text-center">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className="text-xl hover:scale-110 transition-transform"
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          {isFavorite ? '⭐' : '☆'}
        </button>
      </td>

      <td className="px-4 py-4 border-l border-zinc-200">
        <div className="font-semibold text-zinc-900">{product.symbol}</div>
        <div className="text-sm text-zinc-500">{product.name}</div>
      </td>

      <td className="px-4 py-4 text-right border-l border-zinc-200">
        {lastPrice !== null ? (
          <div className="font-mono font-medium text-zinc-900">
            ${formatPrice(lastPrice, decimals)}
          </div>
        ) : (
          <div className="text-zinc-400">—</div>
        )}
      </td>

      <td className="px-4 py-4 text-right border-l border-zinc-200">
        {ticker ? (
          <span
            className={`font-medium ${
              change24h >= 0 ? 'text-emerald-600' : 'text-red-600'
            }`}
          >
            {formatPercentage(change24h)}
          </span>
        ) : (
          <div className="text-zinc-400">—</div>
        )}
      </td>

      <td className="px-4 py-4 text-right text-zinc-600 font-mono text-sm border-l border-zinc-200">
        {ticker ? formatVolume(volume24h) : '—'}
      </td>
    </tr>
  );
}
