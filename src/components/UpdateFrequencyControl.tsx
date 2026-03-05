import { useState, memo } from 'react';
import { intervalConfigService, type UpdateFrequency } from '../services/intervalConfig';

const FREQUENCIES: Array<{ value: UpdateFrequency; label: string; description: string; color: string }> = [
  { value: 'normal', label: 'Normal', description: '200-500ms', color: 'bg-blue-500 hover:bg-blue-600' },
  { value: 'fast', label: 'Fast', description: '100-200ms', color: 'bg-orange-500 hover:bg-orange-600' },
  { value: 'extreme', label: 'Extreme', description: '50-100ms', color: 'bg-red-500 hover:bg-red-600' },
];

function UpdateFrequencyControlInner() {
  const [frequency, setFrequency] = useState<UpdateFrequency>('normal');
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFrequencyChange = async (newFrequency: UpdateFrequency) => {
    setIsUpdating(true);
    setError(null);

    try {
      await intervalConfigService.setFrequency(newFrequency);
      setFrequency(newFrequency);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update frequency');
      console.error('Failed to update frequency:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const getUpdateIndicator = () => {
    const pulseSpeed = 
      frequency === 'extreme' ? 'animate-pulse' : 
      frequency === 'fast' ? 'animate-pulse slow' : '';
    
    return (
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${
          frequency === 'extreme' ? 'bg-red-500' :
          frequency === 'fast' ? 'bg-orange-500' :
          'bg-blue-500'
        } ${pulseSpeed}`} />
        <span className="text-xs text-zinc-600">
          {frequency === 'extreme' && 'Very High Frequency'}
          {frequency === 'fast' && 'High Frequency'}
          {frequency === 'normal' && 'Standard Frequency'}
        </span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-4 sm:p-6">
      <div className="mb-3 sm:mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
          <h3 className="text-base sm:text-lg font-semibold text-zinc-900">Update Frequency</h3>
          {getUpdateIndicator()}
        </div>
        <p className="text-xs sm:text-sm text-zinc-500">
          Control how often market data updates.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-3 sm:mb-4">
        {FREQUENCIES.map((freq) => (
          <button
            key={freq.value}
            onClick={() => handleFrequencyChange(freq.value)}
            disabled={isUpdating}
            className={`
              flex-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-white font-medium transition-all text-sm sm:text-base
              ${frequency === freq.value ? freq.color : 'bg-zinc-300 hover:bg-zinc-400'}
              ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              ${frequency === freq.value ? 'ring-2 ring-offset-2 ring-zinc-900' : ''}
            `}
          >
            <div className="text-base font-semibold">{freq.label}</div>
            <div className="text-xs opacity-90 mt-0.5">{freq.description}</div>
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      {isUpdating && (
        <div className="text-center text-sm text-zinc-500">
          Updating server configuration...
        </div>
      )}

      <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-zinc-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs">
          <div>
            <strong className="text-zinc-700">Current mode:</strong>{' '}
            <span className="capitalize font-medium text-zinc-900">{frequency}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export const UpdateFrequencyControl = memo(UpdateFrequencyControlInner);
