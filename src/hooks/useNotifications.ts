import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export interface NotificationSettings {
  enabled: boolean;
  highTemp: number;
  lowTemp: number;
  highHumidity: number;
  lowHumidity: number;
  motionAlerts: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: false,
  highTemp: 30,
  lowTemp: 15,
  highHumidity: 70,
  lowHumidity: 30,
  motionAlerts: true,
};

export const useNotifications = () => {
  const [settings, setSettings] = useState<NotificationSettings>(() => {
    const saved = localStorage.getItem('notification-settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('Notifications not supported in this browser');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        toast.success('Notifications enabled!');
        updateSettings({ ...settings, enabled: true });
        return true;
      } else {
        toast.error('Notification permission denied');
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.error('Failed to request notification permission');
      return false;
    }
  };

  const sendNotification = (title: string, body: string, tag?: string) => {
    if (!settings.enabled || permission !== 'granted') return;

    try {
      const notification = new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: tag || 'smart-home',
        badge: '/favicon.ico',
        requireInteraction: true,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const updateSettings = (newSettings: NotificationSettings) => {
    setSettings(newSettings);
    localStorage.setItem('notification-settings', JSON.stringify(newSettings));
  };

  const checkThresholds = (
    temperature: number,
    humidity: number,
    motionState: string
  ) => {
    if (!settings.enabled) return;

    // Temperature alerts
    if (temperature >= settings.highTemp) {
      sendNotification(
        '🌡️ High Temperature Alert',
        `Temperature is ${temperature.toFixed(1)}°C (threshold: ${settings.highTemp}°C)`,
        'temp-high'
      );
      toast.error(`High temperature: ${temperature.toFixed(1)}°C`);
    } else if (temperature <= settings.lowTemp) {
      sendNotification(
        '❄️ Low Temperature Alert',
        `Temperature is ${temperature.toFixed(1)}°C (threshold: ${settings.lowTemp}°C)`,
        'temp-low'
      );
      toast.warning(`Low temperature: ${temperature.toFixed(1)}°C`);
    }

    // Humidity alerts
    if (humidity >= settings.highHumidity) {
      sendNotification(
        '💧 High Humidity Alert',
        `Humidity is ${humidity.toFixed(1)}% (threshold: ${settings.highHumidity}%)`,
        'hum-high'
      );
      toast.warning(`High humidity: ${humidity.toFixed(1)}%`);
    } else if (humidity <= settings.lowHumidity) {
      sendNotification(
        '🏜️ Low Humidity Alert',
        `Humidity is ${humidity.toFixed(1)}% (threshold: ${settings.lowHumidity}%)`,
        'hum-low'
      );
      toast.warning(`Low humidity: ${humidity.toFixed(1)}%`);
    }

    // Motion alerts
    if (settings.motionAlerts && motionState === 'DETECTED') {
      sendNotification(
        '👁️ Motion Detected',
        'Motion sensor has detected activity',
        'motion'
      );
    }
  };

  return {
    settings,
    updateSettings,
    requestPermission,
    sendNotification,
    checkThresholds,
    permission,
    isSupported: 'Notification' in window,
  };
};
