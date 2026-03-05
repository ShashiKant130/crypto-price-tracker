import { useState, useCallback } from 'react';
import { useWebSocketConnection } from './hooks/useWebSocketConnection';
import { ConnectionStatus } from './components/ConnectionStatus';
import { ProductListView } from './components/ProductListView';
import { ProductDetailView } from './components/ProductDetailView';
import { UpdateFrequencyControl } from './components/UpdateFrequencyControl';

function App() {
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [view, setView] = useState<'list' | 'detail'>('list');
  const { status } = useWebSocketConnection();

  const handleSelectProduct = useCallback((symbol: string) => {
    setSelectedProduct(symbol);
    setView('detail');
  }, []);

  const handleBack = useCallback(() => {
    setView('list');
    setSelectedProduct(null);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <header className="px-4 py-4 sm:px-6 sm:py-6 border-b border-zinc-200 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-4 sm:mb-6">
            <h1 className="text-lg sm:text-2xl font-semibold text-zinc-900 mb-1 sm:mb-2">
              Crypto Price Tracker
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500">
              Real-time market data · Wireframe reference
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <button
              onClick={() => handleBack()}
              disabled={view === 'list'}
              className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 border text-sm sm:text-base ${
                view === 'list'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-zinc-600 border-zinc-300 hover:border-zinc-400 hover:bg-zinc-50'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6" />
              </svg>
              Product List View
            </button>
            <button
              disabled={view === 'detail'}
              className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 border text-sm sm:text-base ${
                view === 'detail'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-zinc-600 border-zinc-300 hover:border-zinc-400 hover:bg-zinc-50'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6" />
              </svg>
              Product Detail View
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 justify-between items-center sm:items-center">
            <ConnectionStatus status={status} />
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-x-hidden">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
          <UpdateFrequencyControl />
          
          {view === 'list' ? (
            <ProductListView onSelectProduct={handleSelectProduct} />
          ) : selectedProduct ? (
            <ProductDetailView symbol={selectedProduct} onBack={handleBack} />
          ) : null}
        </div>
      </main>
    </div>
  );
}

export default App;
