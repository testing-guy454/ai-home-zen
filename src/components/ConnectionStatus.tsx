import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff } from 'lucide-react';

interface ConnectionStatusProps {
  isConnected: boolean;
  reason?: string | null;
}

export const ConnectionStatus = ({ isConnected, reason = null }: ConnectionStatusProps) => {
  const label = isConnected ? 'Connected' : reason === 'idle-timeout' ? 'Terminated (idle)' : reason === 'broker-disconnected' ? 'Disconnected' : 'Disconnected';

  return (
    <Badge
      variant={isConnected ? 'default' : reason === 'idle-timeout' ? 'secondary' : 'destructive'}
      className="flex items-center gap-2 px-3 py-1"
    >
      {isConnected ? (
        <>
          <Wifi className="h-3 w-3" />
          {label}
        </>
      ) : (
        <>
          <WifiOff className="h-3 w-3" />
          {label}
        </>
      )}
    </Badge>
  );
};
