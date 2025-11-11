import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Bell, BellOff } from 'lucide-react';
import { NotificationSettings as NotificationSettingsType } from '@/hooks/useNotifications';

interface NotificationSettingsProps {
  settings: NotificationSettingsType;
  onUpdateSettings: (settings: NotificationSettingsType) => void;
  onRequestPermission: () => Promise<boolean>;
  permission: NotificationPermission;
  isSupported: boolean;
}

export const NotificationSettings = ({
  settings,
  onUpdateSettings,
  onRequestPermission,
  permission,
  isSupported,
}: NotificationSettingsProps) => {
  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Notifications Not Supported
          </CardTitle>
          <CardDescription>
            Your browser doesn't support push notifications
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Push Notifications
        </CardTitle>
        <CardDescription>
          Get alerts for critical temperature, humidity, and motion events
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable/Disable */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="enable-notifications">Enable Notifications</Label>
            <p className="text-sm text-muted-foreground">
              {permission === 'granted' 
                ? 'Notifications are allowed' 
                : permission === 'denied'
                ? 'Notifications are blocked. Enable in browser settings.'
                : 'Request permission to send notifications'}
            </p>
          </div>
          {permission !== 'granted' ? (
            <Button onClick={onRequestPermission} size="sm">
              Request Permission
            </Button>
          ) : (
            <Switch
              id="enable-notifications"
              checked={settings.enabled}
              onCheckedChange={(enabled) => onUpdateSettings({ ...settings, enabled })}
            />
          )}
        </div>

        {settings.enabled && permission === 'granted' && (
          <>
            {/* Temperature Thresholds */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Temperature Alerts</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="high-temp">High Temp (°C)</Label>
                  <Input
                    id="high-temp"
                    type="number"
                    value={settings.highTemp}
                    onChange={(e) => onUpdateSettings({ ...settings, highTemp: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="low-temp">Low Temp (°C)</Label>
                  <Input
                    id="low-temp"
                    type="number"
                    value={settings.lowTemp}
                    onChange={(e) => onUpdateSettings({ ...settings, lowTemp: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>

            {/* Humidity Thresholds */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Humidity Alerts</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="high-humidity">High Humidity (%)</Label>
                  <Input
                    id="high-humidity"
                    type="number"
                    value={settings.highHumidity}
                    onChange={(e) => onUpdateSettings({ ...settings, highHumidity: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="low-humidity">Low Humidity (%)</Label>
                  <Input
                    id="low-humidity"
                    type="number"
                    value={settings.lowHumidity}
                    onChange={(e) => onUpdateSettings({ ...settings, lowHumidity: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>

            {/* Motion Alerts */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="motion-alerts">Motion Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when motion is detected
                </p>
              </div>
              <Switch
                id="motion-alerts"
                checked={settings.motionAlerts}
                onCheckedChange={(motionAlerts) => onUpdateSettings({ ...settings, motionAlerts })}
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
