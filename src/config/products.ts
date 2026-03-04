export interface ProductConfig {
  symbol: string;
  name: string;
  displayName: string;
}

export const PRODUCTS: ProductConfig[] = [
  { symbol: 'BTCUSD', name: 'Bitcoin', displayName: 'Bitcoin Perpetual' },
  { symbol: 'ETHUSD', name: 'Ethereum', displayName: 'Ethereum Perpetual' },
  { symbol: 'SOLUSD', name: 'Solana', displayName: 'Solana Perpetual' },
  { symbol: 'XRPUSD', name: 'XRP', displayName: 'XRP Perpetual' },
  { symbol: 'DOGEUSD', name: 'Dogecoin', displayName: 'Dogecoin Perpetual' },
  { symbol: 'PAXGUSD', name: 'PAX Gold', displayName: 'PAX Gold Perpetual' },
];

export const PRODUCT_MAP = new Map(
  PRODUCTS.map(p => [p.symbol, p])
);
