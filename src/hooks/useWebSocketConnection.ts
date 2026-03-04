import { useEffect, useState } from 'react';
import type { ConnectionStatus } from '../types/websocket';
import { ConnectionStatus as ConnectionStatusEnum } from '../types/websocket';
import { websocketService } from '../services/websocket';

export function useWebSocketConnection() {
  const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatusEnum.DISCONNECTED);

  useEffect(() => {
    websocketService.connect();

    const unsubscribe = websocketService.onStatusChange((newStatus) => {
      setStatus(newStatus);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return { status, isConnected: status === ConnectionStatusEnum.CONNECTED };
}
