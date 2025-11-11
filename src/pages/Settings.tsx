import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { NotificationSettings } from '@/components/NotificationSettings';
import { AnomalyDetection } from '@/components/AnomalyDetection';
import { useNotifications } from '@/hooks/useNotifications';
// import { ThemeToggle } from '@/components/ThemeToggle';

const Settings = () => {
  const {
    settings,
    updateSettings,
    requestPermission,
    permission,
    isSupported,
  } = useNotifications();

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Settings & AI
              </h1>
              <p className="text-muted-foreground mt-1">Notifications, theme, and AI analysis</p>
            </div>
          </div>
        </div>

        {/* AI Anomaly Detection */}
        <AnomalyDetection />

        {/* Notification Settings */}
        <NotificationSettings
          settings={settings}
          onUpdateSettings={updateSettings}
          onRequestPermission={requestPermission}
          permission={permission}
          isSupported={isSupported}
        />
      </div>
    </div>
  );
};

export default Settings;
