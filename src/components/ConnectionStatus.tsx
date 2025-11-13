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
      className="flex items-center gap-2 px-4 py-2 font-semibold text-xs tracking-wide"
    >
      {isConnected ? (
        <>
          <Wifi className={`h-3.5 w-3.5 animate-pulse`} />
          <span className="relative">
            {label}
            {isConnected && <span className="absolute inset-0 animate-pulse opacity-50">{label}</span>}
          </span>
        </>
      ) : (
        <>
          <WifiOff className="h-3.5 w-3.5" />
          {label}
        </>
      )}
    </Badge>
  );
};
