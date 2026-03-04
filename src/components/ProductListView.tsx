import { useState, useMemo } from 'react';
import { ProductRow } from './ProductRow';
import { PRODUCTS } from '../config/products';
import { useTicker } from '../hooks/useTicker';
import { useFavorites } from '../hooks/useFavorites';

interface ProductListViewProps {
  onSelectProduct: (symbol: string) => void;
}

const ALL_SYMBOLS = PRODUCTS.map(p => p.symbol);

export function ProductListView({ onSelectProduct }: ProductListViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const { favorites, toggleFavorite, isFavorite } = useFavorites();

  const tickers = useTicker(ALL_SYMBOLS);

  const filteredProducts = useMemo(() => {
    let filtered = PRODUCTS;

    if (showFavoritesOnly) {
      filtered = filtered.filter(p => favorites.has(p.symbol));
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        p => 
          p.symbol.toLowerCase().includes(query) ||
          p.name.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [searchQuery, showFavoritesOnly, favorites]);

  return (
    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-zinc-200">
        <h2 className="text-lg sm:text-xl font-semibold text-zinc-900 mb-3 sm:mb-4">Markets</h2>
        
        <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
          <button
            onClick={() => setShowFavoritesOnly(false)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              !showFavoritesOnly
                ? 'bg-zinc-900 text-white'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setShowFavoritesOnly(true)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
              showFavoritesOnly
                ? 'bg-zinc-900 text-white'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            <span className="text-base">⭐</span>
            Favorites
          </button>
        </div>

        <input
          type="text"
          placeholder="Search by name or symbol..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base bg-white border border-zinc-300 rounded-lg text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
        />
      </div>

      {/* Mobile: card layout */}
      <div className="md:hidden divide-y divide-zinc-100">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductRow
              key={product.symbol}
              product={product}
              ticker={tickers.get(product.symbol)}
              isFavorite={isFavorite(product.symbol)}
              onToggleFavorite={() => toggleFavorite(product.symbol)}
              onClick={() => onSelectProduct(product.symbol)}
              variant="card"
            />
          ))
        ) : (
          <div className="px-4 py-16 text-center text-zinc-500 text-sm">
            {showFavoritesOnly
              ? 'No favorites yet. Star some products to see them here.'
              : 'No products found matching your search.'}
          </div>
        )}
      </div>

      {/* Desktop: table layout */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              <th className="w-[60px] px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-center"></th>
              <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-left border-l border-zinc-300">Symbol</th>
              <th className="w-[140px] lg:w-[180px] px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right border-l border-zinc-300">Last Price</th>
              <th className="w-[140px] lg:w-[180px] px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right border-l border-zinc-300">24h Change</th>
              <th className="w-[140px] lg:w-[180px] px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right border-l border-zinc-300">Volume</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <ProductRow
                  key={product.symbol}
                  product={product}
                  ticker={tickers.get(product.symbol)}
                  isFavorite={isFavorite(product.symbol)}
                  onToggleFavorite={() => toggleFavorite(product.symbol)}
                  onClick={() => onSelectProduct(product.symbol)}
                />
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-32 text-center text-zinc-500">
                  {showFavoritesOnly
                    ? 'No favorites yet. Star some products to see them here.'
                    : 'No products found matching your search.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
