import { useEffect, useRef, useState } from 'react';

interface PerformanceMetrics {
  fps: number;
  avgFrameTime: number;
  droppedFrames: number;
  memoryUsage?: number;
  wsUpdatesPerSec?: number;
  batchEfficiency?: number;
}

// Global counters for WebSocket updates (shared across all components)
let globalWsUpdateCount = 0;
let globalLastResetTime = Date.now();

export function trackWebSocketUpdate() {
  globalWsUpdateCount++;
}

export function usePerformanceMonitor(enabled: boolean = false) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    avgFrameTime: 16.67,
    droppedFrames: 0,
  });

  const frameTimesRef = useRef<number[]>([]);
  const lastFrameTimeRef = useRef<number>(performance.now());
  const rafIdRef = useRef<number | null>(null);
  const droppedFramesRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    const measureFrame = () => {
      const now = performance.now();
      const frameTime = now - lastFrameTimeRef.current;
      lastFrameTimeRef.current = now;

      frameTimesRef.current.push(frameTime);
      
      if (frameTime > 32) {
        droppedFramesRef.current++;
      }

      if (frameTimesRef.current.length >= 60) {
        const times = frameTimesRef.current;
        const avgFrameTime = times.reduce((a, b) => a + b, 0) / times.length;
        const fps = Math.round(1000 / avgFrameTime);

        // Calculate WebSocket updates per second
        const elapsed = (Date.now() - globalLastResetTime) / 1000;
        const wsUpdatesPerSec = Math.round(globalWsUpdateCount / elapsed);
        const batchEfficiency = wsUpdatesPerSec > 0 ? Math.round((wsUpdatesPerSec / fps) * 10) / 10 : 1;

        const newMetrics: PerformanceMetrics = {
          fps,
          avgFrameTime: Math.round(avgFrameTime * 100) / 100,
          droppedFrames: droppedFramesRef.current,
          wsUpdatesPerSec,
          batchEfficiency,
        };

        if ('memory' in performance && (performance as any).memory) {
          const memory = (performance as any).memory;
          newMetrics.memoryUsage = Math.round(
            memory.usedJSHeapSize / 1024 / 1024
          );
        }

        setMetrics(newMetrics);
        
        frameTimesRef.current = [];
        droppedFramesRef.current = 0;
        globalWsUpdateCount = 0;
        globalLastResetTime = Date.now();
      }

      rafIdRef.current = requestAnimationFrame(measureFrame);
    };

    rafIdRef.current = requestAnimationFrame(measureFrame);

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [enabled]);

  return metrics;
}

export function PerformanceMonitor({ enabled = true }: { enabled?: boolean }) {
  const metrics = usePerformanceMonitor(enabled);

  if (!enabled) return null;

  const fpsColor = 
    metrics.fps >= 55 ? 'text-emerald-600' : 
    metrics.fps >= 30 ? 'text-orange-600' : 
    'text-red-600';

  const wsColor = 
    (metrics.wsUpdatesPerSec || 0) > 500 ? 'text-red-400' :
    (metrics.wsUpdatesPerSec || 0) > 200 ? 'text-orange-400' :
    'text-emerald-400';

  return (
    <div className="fixed bottom-2 right-2 sm:bottom-4 sm:right-4 left-2 sm:left-auto bg-black/90 backdrop-blur-sm text-white px-3 py-2 sm:px-4 sm:py-3 rounded-lg text-[10px] sm:text-xs font-mono shadow-lg z-50 w-[calc(100vw-1rem)] sm:w-auto sm:min-w-[320px] max-w-[480px]">
      <div className="mb-1 sm:mb-2 text-zinc-400 font-bold border-b border-zinc-700 pb-1 text-[10px] sm:text-xs">
        PERFORMANCE
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 sm:gap-x-4 gap-y-0.5 sm:gap-y-1">
        <div>
          <span className="text-zinc-400">Render FPS:</span>{' '}
          <span className={fpsColor + ' font-bold'}>{metrics.fps}</span>
        </div>
        <div>
          <span className="text-zinc-400">Frame Time:</span>{' '}
          <span className="text-white">{metrics.avgFrameTime.toFixed(2)}ms</span>
        </div>
        <div>
          <span className="text-zinc-400">Dropped:</span>{' '}
          <span className={metrics.droppedFrames > 5 ? 'text-red-400' : 'text-emerald-400'}>
            {metrics.droppedFrames}
          </span>
        </div>
        <div>
          <span className="text-zinc-400">WS Updates:</span>{' '}
          <span className={wsColor + ' font-bold'}>{metrics.wsUpdatesPerSec || 0}/s</span>
        </div>
        <div>
          <span className="text-zinc-400">Batch Rate:</span>{' '}
          <span className="text-cyan-400">{metrics.batchEfficiency || 1}x</span>
        </div>
        {metrics.memoryUsage !== undefined && (
          <div>
            <span className="text-zinc-400">Memory:</span>{' '}
            <span className="text-white">{metrics.memoryUsage}MB</span>
          </div>
        )}
      </div>
      <div className="mt-2 text-[10px] text-zinc-500 border-t border-zinc-700 pt-1">
        💡 WS Updates = raw data from server, Render FPS = capped at 60 by RAF
      </div>
    </div>
  );
}
