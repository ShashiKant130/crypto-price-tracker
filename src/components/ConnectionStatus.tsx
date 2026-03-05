import { memo } from 'react';
import type { ConnectionStatus as Status } from '../types/websocket';
import { ConnectionStatus as ConnectionStatusEnum } from '../types/websocket';

interface ConnectionStatusProps {
  status: Status;
}

const STATUS_STYLES: Record<Status, { color: string; text: string }> = {
  [ConnectionStatusEnum.CONNECTED]: { color: 'bg-emerald-500', text: 'WebSocket connected · Live updates active' },
  [ConnectionStatusEnum.CONNECTING]: { color: 'bg-amber-500 animate-pulse', text: 'Connecting...' },
  [ConnectionStatusEnum.ERROR]: { color: 'bg-red-500', text: 'Connection error' },
  [ConnectionStatusEnum.DISCONNECTED]: { color: 'bg-zinc-400', text: 'Disconnected' },
};

function ConnectionStatusInner({ status }: ConnectionStatusProps) {
  const { color, text } = STATUS_STYLES[status] ?? STATUS_STYLES[ConnectionStatusEnum.DISCONNECTED];
  return (
    <div className="flex items-center gap-2 text-xs text-zinc-600">
      <div className={`w-2 h-2 rounded-full ${color}`} />
      <span>{text}</span>
    </div>
  );
}

export const ConnectionStatus = memo(ConnectionStatusInner);
