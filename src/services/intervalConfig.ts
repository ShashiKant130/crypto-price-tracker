const API_BASE_URL = 'http://localhost:3000';

export interface IntervalConfig {
  min: number;
  max: number;
}

export interface StreamIntervals {
  all_trades?: IntervalConfig;
  l2_orderbook?: IntervalConfig;
  'v2/ticker'?: IntervalConfig;
  [key: string]: IntervalConfig | undefined;
}

export type UpdateFrequency = 'normal' | 'fast' | 'extreme';

// All channels use the same interval per frequency so list view (ticker) and
// detail view (orderbook, trades, spread) update at the same rate
const FREQUENCY_PRESETS: Record<UpdateFrequency, StreamIntervals> = {
  normal: {
    all_trades: { min: 200, max: 500 },
    l2_orderbook: { min: 200, max: 500 },
    'v2/ticker': { min: 200, max: 500 },
  },
  fast: {
    all_trades: { min: 100, max: 200 },
    l2_orderbook: { min: 100, max: 200 },
    'v2/ticker': { min: 100, max: 200 },
  },
  extreme: {
    all_trades: { min: 50, max: 100 },
    l2_orderbook: { min: 50, max: 100 },
    'v2/ticker': { min: 50, max: 100 },
  },
};

export class IntervalConfigService {
  async getCurrentIntervals(): Promise<StreamIntervals> {
    try {
      const response = await fetch(`${API_BASE_URL}/intervals`);
      if (!response.ok) {
        throw new Error('Failed to fetch intervals');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching intervals:', error);
      throw error;
    }
  }

  async updateIntervals(intervals: StreamIntervals): Promise<StreamIntervals> {
    try {
      const response = await fetch(`${API_BASE_URL}/intervals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(intervals),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update intervals');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating intervals:', error);
      throw error;
    }
  }

  async setFrequency(frequency: UpdateFrequency): Promise<void> {
    const intervals = FREQUENCY_PRESETS[frequency];
    await this.updateIntervals(intervals);
  }

  getPresetConfig(frequency: UpdateFrequency): StreamIntervals {
    return FREQUENCY_PRESETS[frequency];
  }
}

export const intervalConfigService = new IntervalConfigService();
