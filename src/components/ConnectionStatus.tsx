import type { ConnectionStatus as Status } from '../types/websocket';
import { ConnectionStatus as ConnectionStatusEnum } from '../types/websocket';

interface ConnectionStatusProps {
  status: Status;
}

export function ConnectionStatus({ status }: ConnectionStatusProps) {
  const getStatusColor = () => {
    switch (status) {
      case ConnectionStatusEnum.CONNECTED:
        return 'bg-emerald-500';
      case ConnectionStatusEnum.CONNECTING:
        return 'bg-amber-500 animate-pulse';
      case ConnectionStatusEnum.ERROR:
        return 'bg-red-500';
      default:
        return 'bg-zinc-400';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case ConnectionStatusEnum.CONNECTED:
        return 'WebSocket connected · Live updates active';
      case ConnectionStatusEnum.CONNECTING:
        return 'Connecting...';
      case ConnectionStatusEnum.ERROR:
        return 'Connection error';
      default:
        return 'Disconnected';
    }
  };

  return (
    <div className="flex items-center gap-2 text-xs text-zinc-600">
      <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
      <span>{getStatusText()}</span>
    </div>
  );
}
