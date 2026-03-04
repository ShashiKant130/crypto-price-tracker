export function formatPrice(price: string | number, decimals: number = 2): string {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

export function formatVolume(volume: number): string {
  if (volume >= 1_000_000_000) {
    return `${(volume / 1_000_000_000).toFixed(2)}B`;
  }
  if (volume >= 1_000_000) {
    return `${(volume / 1_000_000).toFixed(2)}M`;
  }
  if (volume >= 1_000) {
    return `${(volume / 1_000).toFixed(2)}K`;
  }
  return volume.toFixed(2);
}

export function formatPercentage(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp / 1000);
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

export function getPriceDecimals(symbol: string): number {
  if (symbol.includes('BTC')) return 1;
  if (symbol.includes('ETH')) return 2;
  if (symbol.includes('DOGE')) return 6;
  if (symbol.includes('XRP') || symbol.includes('SOL')) return 4;
  return 2;
}
