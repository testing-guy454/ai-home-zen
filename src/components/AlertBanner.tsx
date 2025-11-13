import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertData } from '@/hooks/useMQTT';

interface AlertBannerProps {
  alerts: AlertData[];
}

export const AlertBanner = ({ alerts }: AlertBannerProps) => {
  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2">
      {alerts.slice(0, 3).map((alert, index) => (
        <Alert key={index} variant="destructive" className="animate-in slide-in-from-top duration-300 border border-destructive/40 bg-destructive/10 backdrop-blur-sm">
          <AlertCircle className="h-5 w-5 text-destructive/90 flex-shrink-0" />
          <AlertDescription className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 ml-2">
            <span className="text-sm font-medium text-destructive/95">{alert.message}</span>
            <span className="text-xs text-destructive/70 font-mono whitespace-nowrap">{alert.timestamp.toLocaleTimeString()}</span>
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
};
